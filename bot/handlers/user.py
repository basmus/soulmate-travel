from datetime import date, datetime

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from api_client import api
from config import settings
from keyboards.calendar import build_calendar
from states import BookingStates

router = Router()


def format_order_summary(data: dict, preview: dict) -> str:
    eq_name = data.get("equipment_name", "")
    start = data["start_date"]
    end = data["end_date"]
    return (
        f"📦 {eq_name}\n"
        f"📅 {start} — {end} ({preview['days']} дн.)\n"
        f"💰 Итого: {preview['total_price']} ₾"
    )


async def availability_map(equipment_id: int, year: int, month: int) -> dict[date, int]:
    data = await api.get_availability(equipment_id, year, month)
    result: dict[date, int] = {}
    for day_info in data["days"]:
        d = day_info["date"]
        if isinstance(d, str):
            d = date.fromisoformat(d)
        result[d] = day_info["available"]
    return result


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    args = message.text.split(maxsplit=1)
    deep = args[1] if len(args) > 1 else ""

    if deep.startswith("rent_"):
        slug = deep.replace("rent_", "", 1)
        equipment_list = await api.get_equipment()
        item = next((e for e in equipment_list if e["slug"] == slug), None)
        if item:
            await state.update_data(equipment_id=item["id"], equipment_name=item["name"])
            await state.set_state(BookingStates.choosing_start)
            today = date.today()
            avail = await availability_map(item["id"], today.year, today.month)
            kb = build_calendar(today.year, today.month, avail, mode="start")
            await message.answer(
                f"«{item['name']}» — от {item.get('price_5_plus_days', item['price_per_day'])} ₾/день\n\nВыберите дату начала аренды:",
                reply_markup=kb,
            )
            return

    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🎒 Забронировать оборудование", callback_data="book:start")],
            [InlineKeyboardButton(text="📋 Мои брони", callback_data="book:my")],
        ]
    )
    await message.answer(
        "Привет! Я помогу забронировать туристическое оборудование в аренду.\n\n"
        f"Или оформите заказ на сайте: {settings.site_url}/shop.html",
        reply_markup=kb,
    )


@router.callback_query(F.data == "book:start")
async def book_start(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    equipment_list = await api.get_equipment()
    rows = [
        [InlineKeyboardButton(text=f"{e['name']} — от {e['price_5_plus_days']} ₾/д", callback_data=f"eq:{e['id']}")]
        for e in equipment_list
    ]
    await state.set_state(BookingStates.choosing_equipment)
    await callback.message.edit_text("Выберите оборудование:", reply_markup=InlineKeyboardMarkup(inline_keyboard=rows))
    await callback.answer()


@router.callback_query(F.data.startswith("eq:"))
async def equipment_chosen(callback: CallbackQuery, state: FSMContext):
    eq_id = int(callback.data.split(":")[1])
    equipment_list = await api.get_equipment()
    item = next(e for e in equipment_list if e["id"] == eq_id)
    await state.update_data(equipment_id=eq_id, equipment_name=item["name"])
    await state.set_state(BookingStates.choosing_start)
    today = date.today()
    avail = await availability_map(eq_id, today.year, today.month)
    kb = build_calendar(today.year, today.month, avail, mode="start")
    await callback.message.edit_text(
        f"«{item['name']}» — от {item.get('price_5_plus_days', item['price_per_day'])} ₾/день\n\nВыберите дату начала аренды:",
        reply_markup=kb,
    )
    await callback.answer()


@router.callback_query(F.data == "cal:noop")
async def cal_noop(callback: CallbackQuery):
    await callback.answer()


@router.callback_query(F.data.startswith("cal:nav:"))
async def calendar_nav(callback: CallbackQuery, state: FSMContext):
    _, _, year_s, month_s, direction, mode = callback.data.split(":")
    year, month = int(year_s), int(month_s)
    if direction == "prev":
        month -= 1
        if month < 1:
            month, year = 12, year - 1
    else:
        month += 1
        if month > 12:
            month, year = 1, year + 1

    data = await state.get_data()
    eq_id = data["equipment_id"]
    avail = await availability_map(eq_id, year, month)
    start_date = date.fromisoformat(data["start_date"]) if data.get("start_date") and mode == "end" else None
    kb = build_calendar(year, month, avail, mode=mode, start_date=start_date)
    await callback.message.edit_reply_markup(reply_markup=kb)
    await callback.answer()


@router.callback_query(F.data.startswith("cal:pick:"))
async def calendar_pick(callback: CallbackQuery, state: FSMContext):
    _, _, day_iso, mode = callback.data.split(":")
    picked = date.fromisoformat(day_iso)
    data = await state.get_data()
    eq_id = data["equipment_id"]

    if mode == "start":
        await state.update_data(start_date=picked.isoformat())
        await state.set_state(BookingStates.choosing_end)
        avail = await availability_map(eq_id, picked.year, picked.month)
        kb = build_calendar(picked.year, picked.month, avail, mode="end", start_date=picked)
        await callback.message.edit_text(
            f"Начало: {picked.strftime('%d.%m.%Y')}\n\nВыберите дату окончания аренды:",
            reply_markup=kb,
        )
    else:
        start = date.fromisoformat(data["start_date"])
        end = picked
        payload = {
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
            "items": [{"equipment_id": eq_id, "quantity": 1}],
        }
        try:
            preview = await api.preview_order(payload)
        except Exception:
            await callback.answer("Эти даты недоступны. Выберите другой период.", show_alert=True)
            return

        await state.update_data(end_date=end.isoformat(), preview=preview)
        await state.set_state(BookingStates.confirming)
        summary = format_order_summary({**data, "start_date": start.isoformat(), "end_date": end.isoformat()}, preview)
        kb = InlineKeyboardMarkup(
            inline_keyboard=[
                [InlineKeyboardButton(text="✅ Подтвердить бронь", callback_data="book:confirm")],
                [InlineKeyboardButton(text="◀️ Назад", callback_data="book:start")],
            ]
        )
        await callback.message.edit_text(f"Проверьте бронь:\n\n{summary}", reply_markup=kb)

    await callback.answer()


@router.callback_query(F.data == "book:confirm")
async def book_confirm(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    if not data.get("contact_name"):
        await state.set_state(BookingStates.waiting_name)
        await callback.message.edit_text("Как к вам обращаться? Напишите имя:")
        await callback.answer()
        return
    if not data.get("contact_phone"):
        await state.set_state(BookingStates.waiting_phone)
        await callback.message.edit_text("Укажите телефон для связи:")
        await callback.answer()
        return
    await finalize_booking(callback.message, state, callback.from_user)
    await callback.answer()


@router.message(BookingStates.waiting_name)
async def got_name(message: Message, state: FSMContext):
    await state.update_data(contact_name=message.text.strip())
    await state.set_state(BookingStates.waiting_phone)
    await message.answer("Укажите телефон для связи:")


@router.message(BookingStates.waiting_phone)
async def got_phone(message: Message, state: FSMContext):
    await state.update_data(contact_phone=message.text.strip())
    await finalize_booking(message, state, message.from_user)


async def finalize_booking(message: Message, state: FSMContext, user):
    data = await state.get_data()
    payload = {
        "source": "telegram",
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "items": [{"equipment_id": data["equipment_id"], "quantity": 1}],
        "contact_name": data.get("contact_name"),
        "contact_phone": data.get("contact_phone"),
        "telegram_user_id": user.id,
        "telegram_username": user.username,
    }
    try:
        order = await api.create_order(payload)
    except Exception as e:
        await message.answer(f"Не удалось создать бронь: {e}")
        return

    order_url = f"{settings.site_url}/shop-order.html?token={order['token']}"
    await state.clear()
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="💳 Перейти к оплате", url=order_url)]]
    )
    await message.answer(
        f"✅ Бронь #{order['id']} создана!\n\n"
        f"Сумма: {order['total_price']} ₾\n"
        f"Статус: ожидает оплаты\n\n"
        f"Оплатите заказ на сайте или напишите нам в Telegram.",
        reply_markup=kb,
    )


@router.callback_query(F.data == "book:my")
async def my_bookings(callback: CallbackQuery):
    orders = await api.get_orders_by_telegram(callback.from_user.id)
    if not orders:
        await callback.message.edit_text("У вас пока нет броней.")
        await callback.answer()
        return

    lines = []
    for o in orders[:10]:
        items = ", ".join(i["equipment_name"] for i in o["items"])
        lines.append(
            f"#{o['id']} — {items}\n"
            f"{o['start_date']} — {o['end_date']} | {o['total_price']} ₾ | {o['status']}"
        )
    await callback.message.edit_text("📋 Ваши брони:\n\n" + "\n\n".join(lines))
    await callback.answer()


@router.message(Command("my_bookings"))
async def cmd_my_bookings(message: Message):
    orders = await api.get_orders_by_telegram(message.from_user.id)
    if not orders:
        await message.answer("У вас пока нет броней.")
        return
    lines = []
    for o in orders[:10]:
        items = ", ".join(i["equipment_name"] for i in o["items"])
        lines.append(
            f"#{o['id']} — {items}\n"
            f"{o['start_date']} — {o['end_date']} | {o['total_price']} ₾ | {o['status']}"
        )
    await message.answer("📋 Ваши брони:\n\n" + "\n\n".join(lines))
