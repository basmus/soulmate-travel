from calendar import monthrange
from datetime import date

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup


MONTH_NAMES = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]
WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]


def build_calendar(
    year: int,
    month: int,
    available_map: dict[date, int],
    *,
    mode: str,
    start_date: date | None = None,
) -> InlineKeyboardMarkup:
    _, days_in_month = monthrange(year, month)
    today = date.today()

    rows: list[list[InlineKeyboardButton]] = []
    rows.append([
        InlineKeyboardButton(text="◀", callback_data=f"cal:nav:{year}:{month}:prev:{mode}"),
        InlineKeyboardButton(text=f"{MONTH_NAMES[month - 1]} {year}", callback_data="cal:noop"),
        InlineKeyboardButton(text="▶", callback_data=f"cal:nav:{year}:{month}:next:{mode}"),
    ])
    rows.append([InlineKeyboardButton(text=d, callback_data="cal:noop") for d in WEEKDAYS])

    first_weekday = date(year, month, 1).weekday()
    week: list[InlineKeyboardButton] = []
    for _ in range(first_weekday):
        week.append(InlineKeyboardButton(text=" ", callback_data="cal:noop"))

    for day_num in range(1, days_in_month + 1):
        day = date(year, month, day_num)
        avail = available_map.get(day, 0)
        label = str(day_num)

        selectable = day >= today and avail > 0
        if mode == "end" and start_date:
            selectable = selectable and day >= start_date

        if selectable:
            cb = f"cal:pick:{day.isoformat()}:{mode}"
            week.append(InlineKeyboardButton(text=label, callback_data=cb))
        else:
            week.append(InlineKeyboardButton(text=f"·{day_num}", callback_data="cal:noop"))

        if len(week) == 7:
            rows.append(week)
            week = []

    if week:
        while len(week) < 7:
            week.append(InlineKeyboardButton(text=" ", callback_data="cal:noop"))
        rows.append(week)

    return InlineKeyboardMarkup(inline_keyboard=rows)
