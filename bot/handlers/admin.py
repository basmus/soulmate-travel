from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from api_client import api
from config import settings
from states import AdminEditStates

router = Router()


def is_admin(user_id: int) -> bool:
    return user_id in settings.admin_ids


@router.message(Command("admin"))
async def cmd_admin(message: Message):
    if not is_admin(message.from_user.id):
        return
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="📋 Заказы (pending)", callback_data="adm:orders:pending")],
            [InlineKeyboardButton(text="📦 Ассортимент", callback_data="adm:items")],
        ]
    )
    await message.answer("Панель администратора:", reply_markup=kb)


@router.callback_query(F.data.startswith("adm:orders:"))
async def admin_orders(callback: CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Нет доступа", show_alert=True)
        return
    status = callback.data.split(":")[2]
    status_filter = None if status == "all" else status
    try:
        orders = await api.admin_list_orders(status_filter)
    except Exception as e:
        await callback.message.edit_text(f"Ошибка API: {e}")
        await callback.answer()
        return

    if not orders:
        await callback.message.edit_text(f"Заказов ({status}) нет.")
        await callback.answer()
        return

    lines = []
    for o in orders[:15]:
        items = ", ".join(i["equipment_name"] for i in o["items"])
        contact = o.get("contact_name") or o.get("telegram_username") or "—"
        phone = o.get("contact_phone") or "—"
        lines.append(
            f"#{o['id']} [{o['source']}] {o['status']}\n"
            f"{items}\n"
            f"{o['start_date']} — {o['end_date']} | {o['total_price']} ₾\n"
            f"{contact}, {phone}\n"
            f"/confirm_{o['id']}  /cancel_{o['id']}"
        )
    await callback.message.edit_text("📋 Заказы:\n\n" + "\n\n".join(lines))
    await callback.answer()


@router.message(Command("orders"))
async def cmd_orders(message: Message):
    if not is_admin(message.from_user.id):
        return
    try:
        orders = await api.admin_list_orders("pending")
    except Exception as e:
        await message.answer(f"Ошибка API: {e}")
        return
    if not orders:
        await message.answer("Нет pending-заказов.")
        return
    lines = []
    for o in orders[:15]:
        items = ", ".join(i["equipment_name"] for i in o["items"])
        lines.append(f"#{o['id']} — {items} | {o['total_price']} ₾ | /confirm_{o['id']}")
    await message.answer("Pending заказы:\n\n" + "\n".join(lines))


@router.message(F.text.regexp(r"^/confirm_(\d+)$"))
async def confirm_order(message: Message):
    if not is_admin(message.from_user.id):
        return
    order_id = int(message.text.split("_")[1])
    try:
        order = await api.admin_update_status(order_id, "confirmed")
    except Exception as e:
        await message.answer(f"Ошибка: {e}")
        return
    await message.answer(f"✅ Заказ #{order_id} подтверждён.")

    if order.get("telegram_user_id"):
        from main import bot

        try:
            await bot.send_message(
                order["telegram_user_id"],
                f"✅ Ваш заказ #{order_id} подтверждён!\n"
                f"{order['start_date']} — {order['end_date']}",
            )
        except Exception:
            pass


@router.message(F.text.regexp(r"^/cancel_(\d+)$"))
async def cancel_order(message: Message):
    if not is_admin(message.from_user.id):
        return
    order_id = int(message.text.split("_")[1])
    try:
        order = await api.admin_update_status(order_id, "cancelled")
    except Exception as e:
        await message.answer(f"Ошибка: {e}")
        return
    await message.answer(f"❌ Заказ #{order_id} отменён.")

    if order.get("telegram_user_id"):
        from main import bot

        try:
            await bot.send_message(order["telegram_user_id"], f"Заказ #{order_id} отменён.")
        except Exception:
            pass


@router.callback_query(F.data == "adm:items")
async def admin_items(callback: CallbackQuery):
    if not is_admin(callback.from_user.id):
        await callback.answer("Нет доступа", show_alert=True)
        return
    items = await api.admin_list_equipment()
    lines = []
    for e in items:
        lines.append(
            f"#{e['id']} {e['name']}\n"
            f"  {e['price_per_day']} ₾/д, qty={e['quantity']}, active={e['is_active']}\n"
            f"  /edit_{e['id']}_price  /edit_{e['id']}_qty"
        )
    await callback.message.edit_text("📦 Ассортимент:\n\n" + "\n\n".join(lines))
    await callback.answer()


@router.message(Command("list_items"))
async def cmd_list_items(message: Message):
    if not is_admin(message.from_user.id):
        return
    items = await api.admin_list_equipment()
    lines = [f"#{e['id']} {e['name']} — {e['price_per_day']} ₾, qty={e['quantity']}" for e in items]
    await message.answer("Ассортимент:\n" + "\n".join(lines))


@router.message(F.text.regexp(r"^/edit_(\d+)_(price|qty)$"))
async def edit_item_start(message: Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return
    parts = message.text.strip().split("_")
    eq_id = int(parts[1])
    field = parts[2]
    await state.update_data(edit_id=eq_id, edit_field=field)
    await state.set_state(AdminEditStates.waiting_value)
    prompt = "Новая цена «от» (₾/день, 5+ суток):" if field == "price" else "Новое количество на складе:"
    await message.answer(prompt)


@router.message(AdminEditStates.waiting_value)
async def edit_item_value(message: Message, state: FSMContext):
    if not is_admin(message.from_user.id):
        return
    data = await state.get_data()
    eq_id = data["edit_id"]
    field = data["edit_field"]
    try:
        value = float(message.text.replace(",", ".")) if field == "price" else int(message.text)
    except ValueError:
        await message.answer("Введите число.")
        return

    payload = {"price_per_day": value} if field == "price" else {"quantity": int(value)}
    try:
        item = await api.admin_update_equipment(eq_id, payload)
    except Exception as e:
        await message.answer(f"Ошибка: {e}")
        return

    await state.clear()
    await message.answer(f"✅ Обновлено: {item['name']} — {item['price_per_day']} ₾, qty={item['quantity']}")
