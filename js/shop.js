const cfg = window.SHOP_CONFIG;
const cart = new Map();
let equipmentList = [];
let startDate = null;
let endDate = null;
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth() + 1;
let calMode = "start";
let availabilityCache = {};

const MONTH_NAMES = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

async function api(path, options = {}) {
  const res = await fetch(`${cfg.apiUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = Array.isArray(detail)
      ? detail.map((d) => d.msg || JSON.stringify(d)).join(", ")
      : detail || "Ошибка запроса";
    throw new Error(msg);
  }
  return data;
}

function formatDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e - s) / 86400000) + 1;
}

function currency() {
  return cfg.currency || "₾";
}

function priceForDays(item, days) {
  if (days <= 1) return Number(item.price_1_day);
  if (days <= 4) return Number(item.price_2_4_days);
  return Number(item.price_5_plus_days);
}

function minPrice(item) {
  return Math.min(
    Number(item.price_1_day),
    Number(item.price_2_4_days),
    Number(item.price_5_plus_days)
  );
}

function catalogQty(id) {
  const input = document.querySelector(`.rental-qty-input[data-id="${id}"]`);
  const n = input ? parseInt(input.value, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 10) : 1;
}

function renderCatalog() {
  const list = document.getElementById("rental-catalog");
  if (!list) return;

  const sorted = [...equipmentList].sort((a, b) => {
    const rank = (e) => (String(e.slug).startsWith("kit") ? 0 : 1);
    return rank(a) - rank(b) || a.id - b.id;
  });

  list.innerHTML = sorted
    .map((e) => {
      const inCart = cart.has(e.id);
      const qty = inCart ? cart.get(e.id) : 1;
      const photo = e.photo_url || "images/rent/placeholder.svg";
      const isKit = String(e.slug).startsWith("kit");
      return `
      <li data-id="${e.id}" class="${isKit ? "rental-catalog-item--kit" : ""}">
        <details ${inCart || isKit ? "open" : ""}>
          <summary>
            <img src="${photo}" alt="${e.name}" width="72" height="72"
              onerror="this.src='images/rent/placeholder.svg'" />
            <span class="rental-item-main">
              ${isKit ? '<span class="rental-item-badge">Комплект</span>' : ""}
              <span class="rental-item-name">${e.name}</span>
              <span class="rental-item-price">от ${minPrice(e)}&nbsp;${currency()} / сутки</span>
            </span>
          </summary>
          <p>${e.description || ""}</p>
          <div class="rental-price-tiers">
            <span>1 день — ${e.price_1_day}&nbsp;${currency()}</span>
            <span>2–4 дня — ${e.price_2_4_days}&nbsp;${currency()}/сутки</span>
            <span>5+ дней — ${e.price_5_plus_days}&nbsp;${currency()}/сутки</span>
          </div>
          <div class="rental-add-row">
            <label class="rental-qty">
              Кол-во
              <input type="number" class="rental-qty-input" data-id="${e.id}"
                min="1" max="10" value="${qty}" />
            </label>
            <button type="button" class="booking-button booking-button--compact shop-add-btn" data-id="${e.id}">
              ${inCart ? "Обновить в корзине" : "В корзину"}
            </button>
          </div>
        </details>
      </li>`;
    })
    .join("");

  list.querySelectorAll(".shop-add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      cart.set(id, catalogQty(id));
      renderCatalog();
      renderCart();
      renderCalendar();
      updatePreview();
    });
  });
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  if (!list) return;

  if (cart.size === 0) {
    list.innerHTML = "";
    empty.hidden = false;
  } else {
    empty.hidden = true;
    list.innerHTML = [...cart.entries()]
      .map(([id, qty]) => {
        const e = equipmentList.find((x) => x.id === id);
        if (!e) return "";
        const days = startDate && endDate ? daysBetween(startDate, endDate) : null;
        const dayPrice = days ? priceForDays(e, days) : null;
        const lineHint = dayPrice
          ? `${dayPrice} ${currency()}/день × ${days} × ${qty}`
          : `× ${qty}`;
        return `<li class="cart-item">
          <div class="cart-item-info">
            <span class="cart-item-name">${e.name}</span>
            <span class="cart-item-meta">${lineHint}</span>
          </div>
          <div class="cart-item-controls">
            <button type="button" class="cart-qty-btn" data-id="${id}" data-delta="-1" aria-label="Меньше">−</button>
            <span class="cart-qty-value">${qty}</span>
            <button type="button" class="cart-qty-btn" data-id="${id}" data-delta="1" aria-label="Больше">+</button>
            <button type="button" class="cart-remove" data-id="${id}" aria-label="Удалить">×</button>
          </div>
        </li>`;
      })
      .join("");

    list.querySelectorAll(".cart-qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const delta = Number(btn.dataset.delta);
        const next = (cart.get(id) || 1) + delta;
        if (next < 1) cart.delete(id);
        else cart.set(id, Math.min(next, 10));
        renderCatalog();
        renderCart();
        renderCalendar();
        updatePreview();
      });
    });

    list.querySelectorAll(".cart-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        cart.delete(Number(btn.dataset.id));
        renderCatalog();
        renderCart();
        renderCalendar();
        updatePreview();
      });
    });
  }

  document.getElementById("cart-dates").textContent =
    startDate && endDate
      ? `${formatDate(startDate)} — ${formatDate(endDate)} (${daysBetween(startDate, endDate)} дн.)`
      : "Выберите даты в календаре";
}

async function loadAvailabilityForCart() {
  availabilityCache = {};
  const ids = cart.size ? [...cart.keys()] : equipmentList.map((e) => e.id);
  await Promise.all(
    ids.map(async (id) => {
      const data = await api(`/availability?equipment_id=${id}&year=${calYear}&month=${calMonth}`);
      availabilityCache[id] = {};
      data.days.forEach((d) => {
        availabilityCache[id][d.date] = d.available;
      });
    })
  );
}

function minAvailable(dayStr) {
  const ids = cart.size ? [...cart.keys()] : equipmentList.map((e) => e.id);
  if (!ids.length) return 0;
  let min = Infinity;
  for (const id of ids) {
    const need = cart.has(id) ? cart.get(id) : 1;
    const avail = availabilityCache[id]?.[dayStr] ?? 0;
    min = Math.min(min, Math.floor(avail / need) > 0 ? avail : 0);
    if (avail < need) min = 0;
  }
  return min === Infinity ? 0 : min;
}

async function renderCalendar() {
  const el = document.getElementById("shop-calendar");
  if (!el) return;

  try {
    await loadAvailabilityForCart();
  } catch {
    el.innerHTML = `<p class="shop-error">Не удалось загрузить календарь</p>`;
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstDay = new Date(calYear, calMonth - 1, 1);
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  let startPad = (firstDay.getDay() + 6) % 7;

  let html = `<div class="cal-header">
    <button type="button" id="cal-prev" aria-label="Предыдущий месяц">‹</button>
    <span>${MONTH_NAMES[calMonth - 1]} ${calYear}</span>
    <button type="button" id="cal-next" aria-label="Следующий месяц">›</button>
  </div>`;
  html += `<p class="cal-hint">${calMode === "start" ? "Выберите дату начала" : "Выберите дату окончания"}</p>`;
  html += '<div class="cal-weekdays"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div>';
  html += '<div class="cal-days">';

  for (let i = 0; i < startPad; i++) html += '<span class="cal-day cal-day--empty"></span>';

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayDate = new Date(calYear, calMonth - 1, d);
    const avail = minAvailable(dayStr);
    let cls = "cal-day";
    let selectable = dayDate >= today && avail > 0;
    if (calMode === "end" && startDate) {
      selectable = selectable && dayStr >= startDate;
    }
    if (dayStr === startDate || dayStr === endDate) cls += " cal-day--selected";
    else if (startDate && endDate && dayStr > startDate && dayStr < endDate) cls += " cal-day--in-range";
    if (!selectable) cls += " cal-day--disabled";
    else cls += " cal-day--active";
    html += selectable
      ? `<button type="button" class="${cls}" data-day="${dayStr}">${d}</button>`
      : `<span class="${cls}">${d}</span>`;
  }
  html += "</div>";
  el.innerHTML = html;

  document.getElementById("cal-prev").addEventListener("click", () => {
    calMonth--;
    if (calMonth < 1) {
      calMonth = 12;
      calYear--;
    }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    calMonth++;
    if (calMonth > 12) {
      calMonth = 1;
      calYear++;
    }
    renderCalendar();
  });

  el.querySelectorAll(".cal-day--active").forEach((btn) => {
    btn.addEventListener("click", () => pickDate(btn.dataset.day));
  });
}

function pickDate(dayStr) {
  if (calMode === "start") {
    startDate = dayStr;
    endDate = null;
    calMode = "end";
  } else {
    endDate = dayStr;
    calMode = "start";
  }
  renderCart();
  renderCalendar();
  updatePreview();
}

async function updatePreview() {
  const totalEl = document.getElementById("cart-total");
  const errEl = document.getElementById("cart-error");
  errEl.textContent = "";
  totalEl.textContent = "—";

  if (!cart.size || !startDate || !endDate) {
    renderCart();
    return;
  }

  const payload = {
    start_date: startDate,
    end_date: endDate,
    items: [...cart.entries()].map(([id, qty]) => ({ equipment_id: id, quantity: qty })),
  };

  try {
    const preview = await api("/orders/preview", { method: "POST", body: JSON.stringify(payload) });
    const cur = preview.currency || currency();
    totalEl.textContent = `${preview.total_price} ${cur} (${preview.days} дн.)`;
    renderCart();
  } catch (e) {
    errEl.textContent = e.message;
  }
}

async function submitOrder(e) {
  e.preventDefault();
  const errEl = document.getElementById("checkout-error");
  errEl.textContent = "";

  if (!cart.size || !startDate || !endDate) {
    errEl.textContent = "Добавьте оборудование и выберите даты.";
    return;
  }

  const payload = {
    source: "website",
    start_date: startDate,
    end_date: endDate,
    items: [...cart.entries()].map(([id, qty]) => ({ equipment_id: id, quantity: qty })),
    contact_name: document.getElementById("contact-name").value.trim(),
    contact_phone: document.getElementById("contact-phone").value.trim(),
    contact_email: document.getElementById("contact-email").value.trim() || null,
    comment: document.getElementById("contact-comment").value.trim() || null,
  };

  if (!payload.contact_name || !payload.contact_phone) {
    errEl.textContent = "Укажите имя и телефон.";
    return;
  }

  const btn = document.getElementById("checkout-submit");
  btn.disabled = true;
  try {
    const order = await api("/orders", { method: "POST", body: JSON.stringify(payload) });
    window.location.href = `shop-order.html?token=${order.token}`;
  } catch (err) {
    errEl.textContent = err.message;
    btn.disabled = false;
  }
}

async function init() {
  const statusEl = document.getElementById("shop-status");
  try {
    equipmentList = await api("/equipment");
    statusEl.hidden = true;
    renderCatalog();
    renderCart();
    await renderCalendar();
  } catch (e) {
    statusEl.textContent = `Не удалось загрузить прокат. Проверьте, что API запущен (${cfg.apiUrl}), или напишите в Telegram.`;
    statusEl.hidden = false;
  }

  document.getElementById("checkout-form")?.addEventListener("submit", submitOrder);
}

init();
