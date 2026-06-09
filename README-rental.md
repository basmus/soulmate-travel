# Прокат оборудования — Soulmate Travel

Магазин аренды на сайте (`shop.html`) + Telegram-бот бронирования. Общий API и база заказов.

## Состав

| Компонент | Описание |
|-----------|----------|
| `api/` | FastAPI — каталог, календарь, заказы |
| `bot/` | aiogram 3 — бронирование и админ |
| `shop.html` | Магазин на сайте |
| `shop-order.html` | Страница заказа и оплаты |

## Быстрый старт (локально)

### 1. API

```bash
cd api
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
copy ..\.env.example ..\.env    # заполните TELEGRAM_BOT_TOKEN, ADMIN_TELEGRAM_IDS
uvicorn main:app --reload --port 8000
```

API: http://localhost:8000/docs

При первом запуске создаётся SQLite-база и 5 позиций оборудования.

### 2. Сайт

Откройте `shop.html` через локальный сервер (Live Server, `python -m http.server 5500` и т.п.).

В `js/config.js` укажите URL API:

```js
apiUrl: "http://localhost:8000",
```

### 3. Telegram-бот

```bash
cd bot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

В `.env` в корне репозитория:

```
TELEGRAM_BOT_TOKEN=...          # от @BotFather
ADMIN_TELEGRAM_IDS=ваш_telegram_id
ADMIN_API_KEY=change-me-in-production
API_URL=http://localhost:8000
SITE_URL=http://localhost:5500
```

## Ассортимент (seed)

- Палатка 2-местная — 15 EUR/день
- Палатка 4-местная — 22 EUR/день
- Спальник — 8 EUR/день
- Коврик — 5 EUR/день
- Термос — 4 EUR/день

## Админ в Telegram

| Команда | Действие |
|---------|----------|
| `/admin` | меню |
| `/orders` | pending-заказы |
| `/confirm_{id}` | подтвердить |
| `/cancel_{id}` | отменить |
| `/list_items` | ассортимент |
| `/edit_{id}_price` | изменить цену |
| `/edit_{id}_qty` | изменить количество |

## Docker (production)

```bash
cp .env.example .env   # заполните переменные
docker compose up -d
```

- API: порт 8000
- PostgreSQL: порт 5432
- Статика (`shop.html`, `index.html`) — GitHub Pages или nginx

Обновите `js/config.js` для production:

```js
apiUrl: "https://api.soulmate-travel.ge",
```

## Деплой

1. **GitHub Pages** — `index.html`, `shop.html`, `shop-order.html`, `js/`, `styles.css`
2. **VPS** — `docker compose up` для API и бота
3. **DNS** — поддомен API (опционально)
4. **CORS** — добавьте домен сайта в `CORS_ORIGINS`

## Сценарии

**Сайт:** магазин → корзина → календарь → форма → `shop-order.html` → оплата в Telegram

**Бот:** `/start` → оборудование → календарь → имя/телефон → ссылка на `shop-order.html`

Оба канала создают заказы в одной базе. Админ получает уведомление в Telegram.
