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
    available_map: dict[date, int] | None = None,
    *,
    mode: str,
    start_date: date | None = None,
    open_all: bool = False,
    prefix: str = "cal",
) -> InlineKeyboardMarkup:
    _, days_in_month = monthrange(year, month)
    today = date.today()
    available_map = available_map or {}

    rows: list[list[InlineKeyboardButton]] = []
    rows.append([
        InlineKeyboardButton(text="◀", callback_data=f"{prefix}:nav:{year}:{month}:prev:{mode}"),
        InlineKeyboardButton(text=f"{MONTH_NAMES[month - 1]} {year}", callback_data=f"{prefix}:noop"),
        InlineKeyboardButton(text="▶", callback_data=f"{prefix}:nav:{year}:{month}:next:{mode}"),
    ])
    rows.append([InlineKeyboardButton(text=d, callback_data=f"{prefix}:noop") for d in WEEKDAYS])

    first_weekday = date(year, month, 1).weekday()
    week: list[InlineKeyboardButton] = []
    for _ in range(first_weekday):
        week.append(InlineKeyboardButton(text=" ", callback_data=f"{prefix}:noop"))

    for day_num in range(1, days_in_month + 1):
        day = date(year, month, day_num)
        label = str(day_num)

        if open_all:
            selectable = day >= today
        else:
            avail = available_map.get(day, 0)
            selectable = day >= today and avail > 0

        if mode == "end" and start_date:
            selectable = selectable and day >= start_date

        if selectable:
            cb = f"{prefix}:pick:{day.isoformat()}:{mode}"
            week.append(InlineKeyboardButton(text=label, callback_data=cb))
        else:
            week.append(InlineKeyboardButton(text=f"·{day_num}", callback_data=f"{prefix}:noop"))

        if len(week) == 7:
            rows.append(week)
            week = []

    if week:
        while len(week) < 7:
            week.append(InlineKeyboardButton(text=" ", callback_data=f"{prefix}:noop"))
        rows.append(week)

    return InlineKeyboardMarkup(inline_keyboard=rows)
