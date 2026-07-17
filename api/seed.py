from sqlalchemy import text
from sqlalchemy.orm import Session

from models import Equipment


SEED_EQUIPMENT = [
    {
        "slug": "kit-2p",
        "name": "Комплект для 2 человек",
        "description": "Готовый набор: палатка, 2 спальника, 2 коврика. Удобнее и выгоднее, чем брать по отдельности.",
        "photo_url": "images/rent/tent-2p.svg",
        "price_1_day": 75.0,
        "price_2_4_days": 65.0,
        "price_5_plus_days": 55.0,
        "price_per_day": 55.0,
        "quantity": 1,
    },
    {
        "slug": "kit-4p",
        "name": "Семейный комплект (4 человека)",
        "description": "Готовый набор: палатка, 4 спальника, 4 коврика. Для семьи или компании.",
        "photo_url": "images/rent/tent-4p.svg",
        "price_1_day": 115.0,
        "price_2_4_days": 100.0,
        "price_5_plus_days": 90.0,
        "price_per_day": 90.0,
        "quantity": 1,
    },
    {
        "slug": "tent-2p",
        "name": "Палатка 2-местная",
        "description": "Палатка Quechua Fresh & Black на 2 человека. Современная, проверенная, готова к установке.",
        "photo_url": "images/rent/tent-2p.svg",
        "price_1_day": 35.0,
        "price_2_4_days": 30.0,
        "price_5_plus_days": 25.0,
        "price_per_day": 25.0,
        "quantity": 1,
    },
    {
        "slug": "tent-4p",
        "name": "Палатка 4-местная",
        "description": "Палатка Quechua Fresh & Black на 4 человека с большим тамбуром.",
        "photo_url": "images/rent/tent-4p.svg",
        "price_1_day": 55.0,
        "price_2_4_days": 50.0,
        "price_5_plus_days": 45.0,
        "price_per_day": 45.0,
        "quantity": 1,
    },
    {
        "slug": "sleeping-bag",
        "name": "Спальник",
        "description": "Комфортный спальник Quechua Comfort 10°C. По запросу — индивидуальный чистый вкладыш.",
        "photo_url": "images/rent/sleeping-bag.svg",
        "price_1_day": 15.0,
        "price_2_4_days": 13.0,
        "price_5_plus_days": 10.0,
        "price_per_day": 10.0,
        "quantity": 4,
    },
    {
        "slug": "mat",
        "name": "Самонадувающийся коврик 8 см",
        "description": "Самонадувающийся коврик толщиной 8 см — тепло и комфортный сон на любой поверхности.",
        "photo_url": "images/rent/mat.svg",
        "price_1_day": 15.0,
        "price_2_4_days": 13.0,
        "price_5_plus_days": 10.0,
        "price_per_day": 10.0,
        "quantity": 4,
    },
    {
        "slug": "chair",
        "name": "Кресло",
        "description": "Складное туристическое кресло для лагеря, пикника и отдыха у палатки.",
        "photo_url": "images/rent/placeholder.svg",
        "price_1_day": 10.0,
        "price_2_4_days": 8.0,
        "price_5_plus_days": 6.0,
        "price_per_day": 6.0,
        "quantity": 4,
    },
]


def migrate_equipment_columns(engine) -> None:
    """Add tier price columns on existing SQLite DBs."""
    with engine.begin() as conn:
        dialect = engine.dialect.name
        if dialect == "sqlite":
            rows = conn.execute(text("PRAGMA table_info(equipment)")).fetchall()
            names = {row[1] for row in rows}
            for col in ("price_1_day", "price_2_4_days", "price_5_plus_days"):
                if col not in names:
                    conn.execute(text(f"ALTER TABLE equipment ADD COLUMN {col} NUMERIC(10, 2) DEFAULT 0"))
        elif dialect == "postgresql":
            for col in ("price_1_day", "price_2_4_days", "price_5_plus_days"):
                conn.execute(
                    text(f"ALTER TABLE equipment ADD COLUMN IF NOT EXISTS {col} NUMERIC(10, 2) DEFAULT 0")
                )


def seed_equipment(db: Session) -> None:
    """Insert missing equipment and sync tier prices by slug."""
    for item in SEED_EQUIPMENT:
        existing = db.query(Equipment).filter(Equipment.slug == item["slug"]).first()
        if existing:
            existing.name = item["name"]
            existing.description = item["description"]
            existing.photo_url = item["photo_url"]
            existing.price_1_day = item["price_1_day"]
            existing.price_2_4_days = item["price_2_4_days"]
            existing.price_5_plus_days = item["price_5_plus_days"]
            existing.price_per_day = item["price_per_day"]
            existing.quantity = item["quantity"]
            existing.is_active = True
        else:
            db.add(Equipment(**item))

    keep = {i["slug"] for i in SEED_EQUIPMENT}
    for row in db.query(Equipment).all():
        if row.slug not in keep:
            row.is_active = False

    db.commit()
