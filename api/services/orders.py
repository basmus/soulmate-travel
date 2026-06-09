from sqlalchemy.orm import Session

from models import Equipment, Order, OrderItem, OrderSource, OrderStatus
from schemas import OrderCreateIn, OrderItemOut, OrderOut, OrderPreviewIn, OrderPreviewOut
from services.availability import is_range_available_for_cart, rental_days


def build_order_items(db: Session, payload: OrderPreviewIn) -> tuple[list[OrderItemOut], float]:
    days = rental_days(payload.start_date, payload.end_date)
    if days < 1:
        raise ValueError("Некорректный период аренды")

    lines: list[OrderItemOut] = []
    total = 0.0

    for item_in in payload.items:
        equipment = db.get(Equipment, item_in.equipment_id)
        if not equipment or not equipment.is_active:
            raise ValueError(f"Оборудование id={item_in.equipment_id} недоступно")

        price = float(equipment.price_per_day)
        subtotal = round(price * days * item_in.quantity, 2)
        total += subtotal
        lines.append(
            OrderItemOut(
                equipment_id=equipment.id,
                equipment_name=equipment.name,
                equipment_slug=equipment.slug,
                quantity=item_in.quantity,
                price_per_day=price,
                subtotal=subtotal,
            )
        )

    return lines, round(total, 2)


def preview_order(db: Session, payload: OrderPreviewIn) -> OrderPreviewOut:
    cart = [(i.equipment_id, i.quantity) for i in payload.items]
    error = is_range_available_for_cart(db, cart, payload.start_date, payload.end_date)
    if error:
        raise ValueError(error)

    lines, total = build_order_items(db, payload)
    days = rental_days(payload.start_date, payload.end_date)
    return OrderPreviewOut(days=days, total_price=total, items=lines)


def create_order(db: Session, payload: OrderCreateIn) -> Order:
    if payload.source == "website" and not payload.contact_phone:
        raise ValueError("Укажите телефон для связи")

    preview_payload = OrderPreviewIn(
        start_date=payload.start_date,
        end_date=payload.end_date,
        items=payload.items,
    )
    preview = preview_order(db, preview_payload)

    order = Order(
        source=OrderSource.website if payload.source == "website" else OrderSource.telegram,
        contact_name=payload.contact_name,
        contact_phone=payload.contact_phone,
        contact_email=payload.contact_email,
        telegram_user_id=payload.telegram_user_id,
        telegram_username=payload.telegram_username,
        comment=payload.comment,
        start_date=payload.start_date,
        end_date=payload.end_date,
        days=preview.days,
        total_price=preview.total_price,
        status=OrderStatus.pending,
    )
    db.add(order)
    db.flush()

    for line in preview.items:
        db.add(
            OrderItem(
                order_id=order.id,
                equipment_id=line.equipment_id,
                quantity=line.quantity,
                price_per_day=line.price_per_day,
                subtotal=line.subtotal,
            )
        )

    db.commit()
    db.refresh(order)
    return order


def order_to_out(order: Order) -> OrderOut:
    items = []
    for item in order.items:
        eq = item.equipment
        items.append(
            OrderItemOut(
                equipment_id=item.equipment_id,
                equipment_name=eq.name if eq else "?",
                equipment_slug=eq.slug if eq else "",
                quantity=item.quantity,
                price_per_day=float(item.price_per_day),
                subtotal=float(item.subtotal),
            )
        )
    return OrderOut(
        id=order.id,
        token=order.token,
        source=order.source.value,
        contact_name=order.contact_name,
        contact_phone=order.contact_phone,
        contact_email=order.contact_email,
        telegram_user_id=order.telegram_user_id,
        telegram_username=order.telegram_username,
        comment=order.comment,
        start_date=order.start_date,
        end_date=order.end_date,
        days=order.days,
        total_price=float(order.total_price),
        status=order.status.value,
        created_at=order.created_at,
        items=items,
    )
