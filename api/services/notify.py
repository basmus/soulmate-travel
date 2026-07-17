import logging

import httpx

from config import settings

logger = logging.getLogger(__name__)


async def notify_admins_new_order(order: dict) -> None:
    if not settings.telegram_bot_token or not settings.admin_telegram_id_list:
        return

    currency = settings.default_currency
    items = ", ".join(
        f"{i['equipment_name']} ×{i['quantity']}" for i in order.get("items", [])
    )
    text = (
        f"🆕 Новый заказ #{order['id']} [{order['source']}]\n"
        f"{items}\n"
        f"{order['start_date']} — {order['end_date']} ({order.get('days', '?')} дн.)\n"
        f"{order['total_price']} {currency}\n"
        f"Контакт: {order.get('contact_name') or '—'}, {order.get('contact_phone') or '—'}\n"
    )
    if order.get("comment"):
        text += f"Комментарий: {order['comment']}\n"
    text += f"/confirm_{order['id']}  /cancel_{order['id']}"

    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    async with httpx.AsyncClient() as client:
        for admin_id in settings.admin_telegram_id_list:
            try:
                await client.post(url, json={"chat_id": admin_id, "text": text})
            except Exception:
                logger.exception("Failed to notify admin %s", admin_id)
