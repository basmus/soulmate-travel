from calendar import monthrange
from datetime import date, timedelta

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from models import Equipment, Order, OrderItem, OrderStatus


def rental_days(start: date, end: date) -> int:
    return (end - start).days + 1


def iter_dates(start: date, end: date):
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def overlapping_orders_query(equipment_id: int, start: date, end: date, exclude_order_id: int | None = None):
    q = (
        select(Order)
        .join(OrderItem)
        .where(
            OrderItem.equipment_id == equipment_id,
            Order.status.in_([OrderStatus.pending, OrderStatus.confirmed]),
            Order.start_date <= end,
            Order.end_date >= start,
        )
    )
    if exclude_order_id:
        q = q.where(Order.id != exclude_order_id)
    return q


def booked_count_on_date(db: Session, equipment_id: int, day: date, exclude_order_id: int | None = None) -> int:
    orders = db.scalars(overlapping_orders_query(equipment_id, day, day, exclude_order_id)).all()
    total = 0
    for order in orders:
        for item in order.items:
            if item.equipment_id == equipment_id:
                total += item.quantity
    return total


def check_availability(
    db: Session,
    equipment_id: int,
    quantity: int,
    start: date,
    end: date,
    exclude_order_id: int | None = None,
) -> str | None:
    equipment = db.get(Equipment, equipment_id)
    if not equipment or not equipment.is_active:
        return "Позиция не найдена или недоступна"

    for day in iter_dates(start, end):
        booked = booked_count_on_date(db, equipment_id, day, exclude_order_id)
        if booked + quantity > equipment.quantity:
            return f"{equipment.name} недоступен на {day.strftime('%d.%m.%Y')}"

    return None


def get_month_availability(db: Session, equipment_id: int, year: int, month: int) -> list[dict]:
    equipment = db.get(Equipment, equipment_id)
    if not equipment:
        return []

    _, days_in_month = monthrange(year, month)
    result = []
    for day_num in range(1, days_in_month + 1):
        day = date(year, month, day_num)
        booked = booked_count_on_date(db, equipment_id, day)
        result.append(
            {
                "date": day,
                "available": max(0, equipment.quantity - booked),
                "total": equipment.quantity,
            }
        )
    return result


def is_range_available_for_cart(
    db: Session,
    items: list[tuple[int, int]],
    start: date,
    end: date,
    exclude_order_id: int | None = None,
) -> str | None:
    for equipment_id, quantity in items:
        error = check_availability(db, equipment_id, quantity, start, end, exclude_order_id)
        if error:
            return error
    return None
