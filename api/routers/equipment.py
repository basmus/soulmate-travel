from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from models import Equipment
from schemas import EquipmentOut
from services.availability import get_month_availability

router = APIRouter(prefix="/equipment", tags=["equipment"])


@router.get("", response_model=list[EquipmentOut])
def list_equipment(db: Session = Depends(get_db)):
    items = db.query(Equipment).filter(Equipment.is_active.is_(True)).order_by(Equipment.id).all()
    return items


@router.get("/{slug}", response_model=EquipmentOut)
def get_equipment(slug: str, db: Session = Depends(get_db)):
    item = db.query(Equipment).filter(Equipment.slug == slug, Equipment.is_active.is_(True)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


@router.get("/{equipment_id}/availability")
def equipment_availability(
    equipment_id: int,
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    if not db.get(Equipment, equipment_id):
        raise HTTPException(status_code=404, detail="Equipment not found")

    days = get_month_availability(db, equipment_id, year, month)
    return {
        "equipment_id": equipment_id,
        "month": f"{year:04d}-{month:02d}",
        "days": days,
    }
