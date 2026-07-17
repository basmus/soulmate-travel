from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from config import settings


class EquipmentOut(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    photo_url: str
    price_per_day: float
    price_1_day: float
    price_2_4_days: float
    price_5_plus_days: float
    quantity: int
    is_active: bool

    model_config = {"from_attributes": True}


class OrderItemIn(BaseModel):
    equipment_id: int
    quantity: int = Field(default=1, ge=1, le=10)


class OrderPreviewIn(BaseModel):
    start_date: date
    end_date: date
    items: list[OrderItemIn]

    @field_validator("end_date")
    @classmethod
    def end_not_before_start(cls, v: date, info) -> date:
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("end_date must be >= start_date")
        return v


class OrderCreateIn(OrderPreviewIn):
    source: Literal["website", "telegram"] = "website"
    contact_name: str | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    telegram_user_id: int | None = None
    telegram_username: str | None = None
    comment: str | None = None


class OrderItemOut(BaseModel):
    equipment_id: int
    equipment_name: str
    equipment_slug: str
    quantity: int
    price_per_day: float
    subtotal: float


class OrderOut(BaseModel):
    id: int
    token: str
    source: str
    contact_name: str | None
    contact_phone: str | None
    contact_email: str | None
    telegram_user_id: int | None
    telegram_username: str | None
    comment: str | None
    start_date: date
    end_date: date
    days: int
    total_price: float
    status: str
    created_at: datetime
    items: list[OrderItemOut]
    currency: str = Field(default_factory=lambda: settings.default_currency)


class OrderPreviewOut(BaseModel):
    days: int
    total_price: float
    items: list[OrderItemOut]
    currency: str = Field(default_factory=lambda: settings.default_currency)


class AvailabilityDay(BaseModel):
    date: date
    available: int
    total: int


class AvailabilityOut(BaseModel):
    equipment_id: int
    month: str
    days: list[AvailabilityDay]


class PaymentConfigOut(BaseModel):
    instructions: str
    telegram_url: str = "https://t.me/soulmate_travel_georgia"


class OrderStatusUpdateIn(BaseModel):
    status: Literal["confirmed", "cancelled", "completed"]


class EquipmentUpdateIn(BaseModel):
    price_per_day: float | None = None
    price_1_day: float | None = None
    price_2_4_days: float | None = None
    price_5_plus_days: float | None = None
    quantity: int | None = None
    description: str | None = None
    is_active: bool | None = None
