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

function renderProducts() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;
  grid.innerHTML = equipmentList
    .map(
      (e) => `
    <article class="shop-card card" data-id="${e.id}">
      <div class="shop-card-photo">
        <img src="${e.photo_url}" alt="${e.name}" onerror="this.src='images/rent/placeholder.svg'" />
      </div>
      <div class="shop-card-body">
        <h3>${e.name}</h3>
        <p class="shop-card-desc">${e.description}</p>
        <p class="shop-card-price">${e.price_per_day} ${cfg.currency} / день</p>
        <button type="button" class="booking-button booking-button--compact shop-add-btn" data-id="${e.id}">
          ${cart.has(e.id) ? "✓ В корзине" : "В корзину"}
        </button>
      </div>
    </article>`
    )
    .join("");

  grid.querySelectorAll(".shop-add-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleCartItem(Number(btn.dataset.id)));
  });
}

function toggleCartItem(id) {
  if (cart.has(id)) {
    cart.delete(id);
  } else {
    cart.set(id, 1);
  }
  renderProducts();
  renderCart();
  updatePreview();
}

function renderCart() {
  const list = document.getElementById("cart-items");
  const empty = document.getElementById("cart-empty");
  if (!list) return;

  if (cart.size === 0) {
    list.innerHTML = "";
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.innerHTML = [...cart.entries()]
    .map(([id, qty]) => {
      const e = equipmentList.find((x) => x.id === id);
      if (!e) return "";
      return `<li class="cart-item">
        <span>${e.name}</span>
        <button type="button" class="cart-remove" data-id="${id}" aria-label="Удалить">×</button>
      </li>`;
    })
    .join("");

  list.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart.delete(Number(btn.dataset.id));
      renderProducts();
      renderCart();
      updatePreview();
    });
  });

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
    const avail = availabilityCache[id]?.[dayStr] ?? 0;
    min = Math.min(min, avail);
  }
  return min === Infinity ? 0 : min;
}

async function renderCalendar() {
  const el = document.getElementById("shop-calendar");
  if (!el) return;

  await loadAvailabilityForCart();

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
    if (calMonth < 1) { calMonth = 12; calYear--; }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", () => {
    calMonth++;
    if (calMonth > 12) { calMonth = 1; calYear++; }
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

  if (!cart.size || !startDate || !endDate) return;

  const payload = {
    start_date: startDate,
    end_date: endDate,
    items: [...cart.entries()].map(([id, qty]) => ({ equipment_id: id, quantity: qty })),
  };

  try {
    const preview = await api("/orders/preview", { method: "POST", body: JSON.stringify(payload) });
    totalEl.textContent = `${preview.total_price} ${cfg.currency}`;
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
    renderProducts();
    renderCart();
    await renderCalendar();
  } catch (e) {
    statusEl.textContent = `Не удалось загрузить магазин. Проверьте, что API запущен (${cfg.apiUrl}).`;
  }

  document.getElementById("checkout-form")?.addEventListener("submit", submitOrder);
}

init();
