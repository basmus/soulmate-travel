from sqlalchemy.orm import Session

from models import Equipment


SEED_EQUIPMENT = [
    {
        "slug": "tent-2p",
        "name": "Палатка 2-местная",
        "description": "Лёгкая палатка для походов на 1–2 человека. Водостойкая, с москитной сеткой.",
        "photo_url": "images/rent/tent-2p.svg",
        "price_per_day": 15.0,
        "quantity": 1,
    },
    {
        "slug": "tent-4p",
        "name": "Палатка 4-местная",
        "description": "Просторная палатка для семьи или компании до 4 человек.",
        "photo_url": "images/rent/tent-4p.svg",
        "price_per_day": 22.0,
        "quantity": 1,
    },
    {
        "slug": "sleeping-bag",
        "name": "Спальник",
        "description": "Комфортный спальник для ночёвок в горах и на природе.",
        "photo_url": "images/rent/sleeping-bag.svg",
        "price_per_day": 8.0,
        "quantity": 2,
    },
    {
        "slug": "mat",
        "name": "Коврик",
        "description": "Туристический коврик — тепло и комфорт на любой поверхности.",
        "photo_url": "images/rent/mat.svg",
        "price_per_day": 5.0,
        "quantity": 2,
    },
    {
        "slug": "thermos",
        "name": "Термос",
        "description": "Термос 1 л — горячий чай или кофе в походе.",
        "photo_url": "images/rent/thermos.svg",
        "price_per_day": 4.0,
        "quantity": 2,
    },
]


def seed_equipment(db: Session) -> None:
    existing = db.query(Equipment).count()
    if existing:
        return

    for item in SEED_EQUIPMENT:
        db.add(Equipment(**item))
    db.commit()
