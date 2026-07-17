from models import Equipment


def price_for_days(equipment: Equipment, days: int) -> float:
    """Return per-day price for rental length (1 / 2–4 / 5+ days)."""
    if days <= 1:
        return float(equipment.price_1_day)
    if days <= 4:
        return float(equipment.price_2_4_days)
    return float(equipment.price_5_plus_days)


def min_price_per_day(equipment: Equipment) -> float:
    return min(
        float(equipment.price_1_day),
        float(equipment.price_2_4_days),
        float(equipment.price_5_plus_days),
    )
