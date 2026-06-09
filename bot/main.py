import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage

from config import settings
from handlers import admin, user

logging.basicConfig(level=logging.INFO)

bot = Bot(token=settings.telegram_bot_token)
dp = Dispatcher(storage=MemoryStorage())
dp.include_router(user.router)
dp.include_router(admin.router)


async def notify_admins_new_order(order: dict):
    items = ", ".join(i["equipment_name"] for i in order["items"])
    text = (
        f"🆕 Новый заказ #{order['id']} [{order['source']}]\n"
        f"{items}\n"
        f"{order['start_date']} — {order['end_date']}\n"
        f"{order['total_price']} EUR\n"
        f"Контакт: {order.get('contact_name') or '—'}, {order.get('contact_phone') or '—'}\n"
        f"/confirm_{order['id']}  /cancel_{order['id']}"
    )
    for admin_id in settings.admin_ids:
        try:
            await bot.send_message(admin_id, text)
        except Exception:
            logging.exception("Failed to notify admin %s", admin_id)


async def main():
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is not set")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
