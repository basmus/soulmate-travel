from datetime import date

from aiogram import F, Router
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message, User

from api_client import api
from config import settings
from keyboards.calendar import build_calendar
from states import AdvisorStates, BookingStates

router = Router()

DESTINATIONS = {
    "kazbegi": "Kazbegi",
    "juta": "Juta",
    "svaneti": "Svaneti",
    "borjomi": "Borjomi",
    "other": "Other",
}

MOUNTAIN = {"kazbegi", "juta", "svaneti"}

# Fallback if API is unavailable
FALLBACK_PRICES = {
    "kit-2p": (75, 65, 55),
    "kit-4p": (115, 100, 90),
    "tent-2p": (35, 30, 25),
    "tent-3p": (45, 40, 35),
    "sleeping-bag": (15, 13, 10),
    "mat": (15, 13, 10),
    "chair": (10, 8, 6),
}


def days_between(start: date, end: date) -> int:
    return (end - start).days + 1


def tier_price(p1: float, p24: float, p5: float, days: int) -> float:
    if days <= 1:
        return p1
    if days <= 4:
        return p24
    return p5


def fmt_date(iso: str) -> str:
    y, m, d = iso.split("-")
    return f"{d}.{m}.{y}"


def yes_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="Yes, let's go ✅", callback_data="adv:yes")],
            [
                InlineKeyboardButton(text="🎒 Catalog", callback_data="book:start"),
                InlineKeyboardButton(text="📋 My bookings", callback_data="book:my"),
            ],
        ]
    )


def people_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(text=str(n), callback_data=f"adv:people:{n}")
            for n in (1, 2, 3, 4)
        ]]
    )


def destination_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="Kazbegi", callback_data="adv:dest:kazbegi"),
                InlineKeyboardButton(text="Juta", callback_data="adv:dest:juta"),
            ],
            [
                InlineKeyboardButton(text="Svaneti", callback_data="adv:dest:svaneti"),
                InlineKeyboardButton(text="Borjomi", callback_data="adv:dest:borjomi"),
            ],
            [InlineKeyboardButton(text="Other", callback_data="adv:dest:other")],
        ]
    )


def travel_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(text="🥾 Hiking", callback_data="adv:travel:hiking"),
            InlineKeyboardButton(text="🚗 Car", callback_data="adv:travel:car"),
        ]]
    )


def result_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✅ Book this kit", callback_data="adv:book")],
            [InlineKeyboardButton(text="🔄 Start over", callback_data="adv:restart")],
        ]
    )


async def equipment_by_slug() -> dict[str, dict]:
    equipment = await api.get_equipment()
    return {e["slug"]: e for e in equipment}


def local_line_total(slug: str, qty: int, days: int) -> float:
    p1, p24, p5 = FALLBACK_PRICES[slug]
    return tier_price(p1, p24, p5, days) * days * qty


async def build_kit(people: int, travel: str, start: str, end: str) -> dict:
    days = days_between(date.fromisoformat(start), date.fromisoformat(end))
    by_slug: dict[str, dict] = {}
    try:
        by_slug = await equipment_by_slug()
    except Exception:
        by_slug = {}

    items: list[dict] = []
    title: str
    compose: str

    if people == 1:
        title = "Solo overnight kit"
        compose = "2-person tent, 1 sleeping bag, 1 mat"
        slugs = [("tent-2p", 1), ("sleeping-bag", 1), ("mat", 1)]
    elif people == 2:
        title = "Kit for 2 people"
        compose = "Tent, 2 sleeping bags, 2 mats"
        slugs = [("kit-2p", 1)]
    elif people == 3:
        title = "Kit for 3 (family tent)"
        compose = "4-person tent kit — room to spare"
        slugs = [("kit-4p", 1)]
    else:
        title = "Family kit (4 people)"
        compose = "Tent, 4 sleeping bags, 4 mats"
        slugs = [("kit-4p", 1)]

    chair_qty = 0
    if travel == "car":
        chair_qty = min(people, 4)
        slugs.append(("chair", chair_qty))

    total = 0.0
    for slug, qty in slugs:
        item = by_slug.get(slug)
        if item:
            items.append({"equipment_id": item["id"], "quantity": qty})
        total += local_line_total(slug, qty, days)

    preview = None
    if items:
        try:
            preview = await api.preview_order(
                {"start_date": start, "end_date": end, "items": items}
            )
            total = float(preview["total_price"])
        except Exception:
            preview = None

    addons = f"{chair_qty} folding chair(s)" if chair_qty else ""

    return {
        "title": title,
        "compose": compose,
        "addons": addons,
        "items": items,
        "days": days,
        "total": int(total) if total == int(total) else total,
        "preview": preview,
        "slugs": slugs,
    }


def why_text(destination: str, travel: str) -> str:
    dest = DESTINATIONS.get(destination, "Georgia")
    mountain = destination in MOUNTAIN
    if travel == "hiking":
        if mountain:
            return (
                f"For {dest} on foot — a compact Quechua kit for mountain nights, "
                "without chairs or heavy extras."
            )
        return f"For {dest} on foot — a light Quechua base: tent, bags and mats. No extra bulk."
    if mountain:
        return (
            f"For {dest} by car — sleep kit for cool mountain nights, "
            "plus chairs you can leave in the trunk."
        )
    return f"For {dest} by car — the full sleep kit plus folding chairs for camp comfort."


async def start_advisor(message: Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "Hi 👋 Planning a camping trip in Georgia?",
        reply_markup=yes_kb(),
    )


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    args = message.text.split(maxsplit=1)
    deep = args[1] if len(args) > 1 else ""

    if deep.startswith("rent_"):
        slug = deep.replace("rent_", "", 1)
        try:
            equipment_list = await api.get_equipment()
        except Exception:
            equipment_list = []
        item = next((e for e in equipment_list if e["slug"] == slug), None)
        if item:
            await state.update_data(equipment_id=item["id"], equipment_name=item["name"])
            await state.set_state(BookingStates.choosing_start)
            today = date.today()
            avail = await availability_map(item["id"], today.year, today.month)
            kb = build_calendar(today.year, today.month, avail, mode="start")
            await message.answer(
                f"«{item['name']}» — от {item.get('price_5_plus_days', item['price_per_day'])} ₾/день\n\n"
                "Выберите дату начала аренды:",
                reply_markup=kb,
            )
            return

    await start_advisor(message, state)


@router.callback_query(F.data == "adv:restart")
@router.callback_query(F.data == "adv:yes")
async def advisor_yes(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    await state.set_state(AdvisorStates.choosing_start)
    today = date.today()
    kb = build_calendar(today.year, today.month, mode="start", open_all=True, prefix="acal")
    await callback.message.edit_text(
        "When are you going?\n\nPick the start date:",
        reply_markup=kb,
    )
    await callback.answer()


@router.callback_query(F.data == "acal:noop")
async def acal_noop(callback: CallbackQuery):
    await callback.answer()


@router.callback_query(F.data.startswith("acal:nav:"))
async def advisor_calendar_nav(callback: CallbackQuery, state: FSMContext):
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
    start_date = date.fromisoformat(data["start_date"]) if data.get("start_date") and mode == "end" else None
    kb = build_calendar(year, month, mode=mode, start_date=start_date, open_all=True, prefix="acal")
    await callback.message.edit_reply_markup(reply_markup=kb)
    await callback.answer()


@router.callback_query(F.data.startswith("acal:pick:"))
async def advisor_calendar_pick(callback: CallbackQuery, state: FSMContext):
    _, _, day_iso, mode = callback.data.split(":")
    picked = date.fromisoformat(day_iso)

    if mode == "start":
        await state.update_data(start_date=picked.isoformat())
        await state.set_state(AdvisorStates.choosing_end)
        kb = build_calendar(
            picked.year, picked.month, mode="end", start_date=picked, open_all=True, prefix="acal"
        )
        await callback.message.edit_text(
            f"Start: {picked.strftime('%d.%m.%Y')}\n\nPick the end date:",
            reply_markup=kb,
        )
    else:
        data = await state.get_data()
        start = date.fromisoformat(data["start_date"])
        if picked < start:
            await callback.answer("End date must be on or after the start date.", show_alert=True)
            return
        await state.update_data(end_date=picked.isoformat())
        await state.set_state(AdvisorStates.choosing_people)
        await callback.message.edit_text(
            f"Dates: {start.strftime('%d.%m.%Y')} — {picked.strftime('%d.%m.%Y')}\n\n"
            "How many people?",
            reply_markup=people_kb(),
        )
    await callback.answer()


@router.callback_query(F.data.startswith("adv:people:"))
async def advisor_people(callback: CallbackQuery, state: FSMContext):
    people = int(callback.data.split(":")[2])
    await state.update_data(people=people)
    await state.set_state(AdvisorStates.choosing_destination)
    await callback.message.edit_text(
        f"People: {people}\n\nWhere are you going?",
        reply_markup=destination_kb(),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("adv:dest:"))
async def advisor_destination(callback: CallbackQuery, state: FSMContext):
    dest = callback.data.split(":")[2]
    await state.update_data(destination=dest)
    await state.set_state(AdvisorStates.choosing_travel)
    await callback.message.edit_text(
        f"Where: {DESTINATIONS[dest]}\n\nHow are you travelling?",
        reply_markup=travel_kb(),
    )
    await callback.answer()


@router.callback_query(F.data.startswith("adv:travel:"))
async def advisor_travel(callback: CallbackQuery, state: FSMContext):
    travel = callback.data.split(":")[2]
    await state.update_data(travel=travel)
    data = await state.get_data()

    kit = await build_kit(data["people"], travel, data["start_date"], data["end_date"])
    await state.update_data(kit=kit)
    await state.set_state(AdvisorStates.confirming)

    addons_line = f"\n+ {kit['addons']}" if kit["addons"] else ""
    text = (
        "Here's the kit I'd recommend.\n\n"
        f"📦 {kit['title']}\n"
        f"{kit['compose']}{addons_line}\n\n"
        f"{why_text(data['destination'], travel)}\n\n"
        f"💰 {kit['total']} ₾ for {kit['days']} days "
        f"({fmt_date(data['start_date'])} — {fmt_date(data['end_date'])})"
    )
    await callback.message.edit_text(text, reply_markup=result_kb())
    await callback.answer()


@router.callback_query(F.data == "adv:book")
async def advisor_book(callback: CallbackQuery, state: FSMContext):
    data = await state.get_data()
    if not data.get("kit", {}).get("items"):
        await callback.answer(
            "Couldn't map the kit to stock. Write to us or try Catalog.",
            show_alert=True,
        )
        return
    await state.set_state(AdvisorStates.waiting_name)
    await callback.message.edit_text("Great — what's your name?")
    await callback.answer()


@router.message(AdvisorStates.waiting_name)
async def advisor_name(message: Message, state: FSMContext):
    await state.update_data(contact_name=message.text.strip())
    await state.set_state(AdvisorStates.waiting_phone)
    await message.answer("Phone number for contact?")


@router.message(AdvisorStates.waiting_phone)
async def advisor_phone(message: Message, state: FSMContext):
    await state.update_data(contact_phone=message.text.strip())
    await finalize_advisor_booking(message, state, message.from_user)


async def finalize_advisor_booking(message: Message, state: FSMContext, user: User):
    data = await state.get_data()
    kit = data["kit"]
    dest = DESTINATIONS.get(data.get("destination", ""), data.get("destination", ""))
    travel = data.get("travel", "")
    comment = f"Advisor: {travel}, {dest}; {kit['title']}"
    if kit.get("addons"):
        comment += f" + {kit['addons']}"

    payload = {
        "source": "telegram",
        "start_date": data["start_date"],
        "end_date": data["end_date"],
        "items": kit["items"],
        "contact_name": data.get("contact_name"),
        "contact_phone": data.get("contact_phone"),
        "telegram_user_id": user.id,
        "telegram_username": user.username,
        "comment": comment,
    }
    try:
        order = await api.create_order(payload)
    except Exception as e:
        await message.answer(
            f"Couldn't create the booking automatically ({e}).\n"
            "Please try again in a moment, or write to us in Telegram — "
            "we've noted your request for the team."
        )
        # Notify admins with the request even if order failed
        for admin_id in settings.admin_ids:
            try:
                from main import bot

                await bot.send_message(
                    admin_id,
                    "🆕 Advisor request (order failed)\n"
                    f"{kit['title']} | {kit['total']} ₾\n"
                    f"{data['start_date']} — {data['end_date']}\n"
                    f"{data.get('people')} ppl · {dest} · {travel}\n"
                    f"{data.get('contact_name')} · {data.get('contact_phone')}\n"
                    f"@{user.username or '—'} / {user.id}",
                )
            except Exception:
                pass
        return

    order_url = f"{settings.site_url}/shop-order.html?token={order['token']}"
    await state.clear()
    kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="💳 Open order", url=order_url)],
            [InlineKeyboardButton(text="🔄 New trip", callback_data="adv:restart")],
        ]
    )
    await message.answer(
        f"✅ Booking #{order['id']} created!\n\n"
        f"{kit['title']}\n"
        f"Total: {order['total_price']} ₾\n"
        f"Status: awaiting payment\n\n"
        "We'll confirm availability shortly.",
        reply_markup=kb,
    )


# --- Catalog booking (existing flow) ---

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


@router.callback_query(F.data == "book:start")
async def book_start(callback: CallbackQuery, state: FSMContext):
    await state.clear()
    try:
        equipment_list = await api.get_equipment()
    except Exception:
        await callback.answer("Catalog is temporarily unavailable.", show_alert=True)
        return
    rows = [
        [InlineKeyboardButton(
            text=f"{e['name']} — от {e['price_5_plus_days']} ₾/д",
            callback_data=f"eq:{e['id']}",
        )]
        for e in equipment_list
    ]
    rows.append([InlineKeyboardButton(text="◀️ Back to advisor", callback_data="adv:restart")])
    await state.set_state(BookingStates.choosing_equipment)
    await callback.message.edit_text(
        "Выберите оборудование:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=rows),
    )
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
        f"«{item['name']}» — от {item.get('price_5_plus_days', item['price_per_day'])} ₾/день\n\n"
        "Выберите дату начала аренды:",
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
        summary = format_order_summary(
            {**data, "start_date": start.isoformat(), "end_date": end.isoformat()}, preview
        )
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


async def finalize_booking(message: Message, state: FSMContext, user: User):
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
        "Оплатите заказ на сайте или напишите нам в Telegram.",
        reply_markup=kb,
    )


@router.callback_query(F.data == "book:my")
async def my_bookings(callback: CallbackQuery):
    try:
        orders = await api.get_orders_by_telegram(callback.from_user.id)
    except Exception:
        await callback.answer("Temporarily unavailable.", show_alert=True)
        return
    if not orders:
        await callback.message.edit_text(
            "У вас пока нет броней.",
            reply_markup=InlineKeyboardMarkup(
                inline_keyboard=[[InlineKeyboardButton(text="◀️ Back", callback_data="adv:restart")]]
            ),
        )
        await callback.answer()
        return

    lines = []
    for o in orders[:10]:
        items = ", ".join(i["equipment_name"] for i in o["items"])
        lines.append(
            f"#{o['id']} — {items}\n"
            f"{o['start_date']} — {o['end_date']} | {o['total_price']} ₾ | {o['status']}"
        )
    await callback.message.edit_text(
        "📋 Ваши брони:\n\n" + "\n\n".join(lines),
        reply_markup=InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="◀️ Back", callback_data="adv:restart")]]
        ),
    )
    await callback.answer()


@router.message(Command("my_bookings"))
async def cmd_my_bookings(message: Message):
    try:
        orders = await api.get_orders_by_telegram(message.from_user.id)
    except Exception:
        await message.answer("Temporarily unavailable.")
        return
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
