from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from config import settings
from database import get_db
from models import Equipment, Order, OrderItem, OrderStatus
from schemas import (
    EquipmentOut,
    EquipmentUpdateIn,
    OrderCreateIn,
    OrderOut,
    OrderPreviewIn,
    OrderPreviewOut,
    OrderStatusUpdateIn,
    PaymentConfigOut,
)
from services.availability import get_month_availability
from services.notify import notify_admins_new_order
from services.orders import create_order, order_to_out, preview_order

router = APIRouter(tags=["orders"])


def verify_admin(x_admin_key: str = Header(default="")):
    if x_admin_key != settings.admin_api_key:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.get("/availability")
def availability(
    equipment_id: int = Query(...),
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    days = get_month_availability(db, equipment_id, year, month)
    if not days:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {
        "equipment_id": equipment_id,
        "month": f"{year:04d}-{month:02d}",
        "days": days,
    }


@router.post("/orders/preview", response_model=OrderPreviewOut)
def orders_preview(payload: OrderPreviewIn, db: Session = Depends(get_db)):
    try:
        return preview_order(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/orders", response_model=OrderOut)
async def orders_create(payload: OrderCreateIn, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        order = create_order(db, payload)
        out = order_to_out(order)
        background_tasks.add_task(notify_admins_new_order, out.model_dump(mode="json"))
        return out
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.get("/orders/{token}", response_model=OrderOut)
def orders_get(token: str, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.equipment))
        .filter(Order.token == token)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_out(order)


@router.get("/orders/by-telegram/{telegram_user_id}", response_model=list[OrderOut])
def orders_by_telegram(telegram_user_id: int, db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.equipment))
        .filter(Order.telegram_user_id == telegram_user_id)
        .order_by(Order.created_at.desc())
        .limit(20)
        .all()
    )
    return [order_to_out(o) for o in orders]


@router.patch("/orders/id/{order_id}/status", response_model=OrderOut, dependencies=[Depends(verify_admin)])
def orders_update_status(order_id: int, payload: OrderStatusUpdateIn, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = OrderStatus(payload.status)
    db.commit()
    db.refresh(order)
    return order_to_out(order)


@router.get("/orders/admin/list", response_model=list[OrderOut], dependencies=[Depends(verify_admin)])
def orders_admin_list(
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(Order).options(joinedload(Order.items).joinedload(OrderItem.equipment))
    if status:
        q = q.filter(Order.status == OrderStatus(status))
    orders = q.order_by(Order.created_at.desc()).limit(50).all()
    return [order_to_out(o) for o in orders]


@router.get("/config/payment", response_model=PaymentConfigOut)
def payment_config():
    return PaymentConfigOut(instructions=settings.payment_instructions)


@router.get("/admin/equipment", response_model=list[EquipmentOut], dependencies=[Depends(verify_admin)])
def admin_list_equipment(db: Session = Depends(get_db)):
    return db.query(Equipment).order_by(Equipment.id).all()


@router.patch("/admin/equipment/{equipment_id}", response_model=EquipmentOut, dependencies=[Depends(verify_admin)])
def admin_update_equipment(equipment_id: int, payload: EquipmentUpdateIn, db: Session = Depends(get_db)):
    item = db.get(Equipment, equipment_id)
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    if payload.price_per_day is not None and payload.price_5_plus_days is None:
        item.price_5_plus_days = payload.price_per_day
    db.commit()
    db.refresh(item)
    return item
