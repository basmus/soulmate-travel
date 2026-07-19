const cfg = window.SHOP_CONFIG;

function tt(key, vars) {
  return window.I18N ? window.I18N.t(key, vars) : key;
}

function statusLabel(status) {
  const map = {
    pending: "js.status.pending",
    confirmed: "js.status.confirmed",
    cancelled: "js.status.cancelled",
    completed: "js.status.completed",
  };
  return map[status] ? tt(map[status]) : status;
}

async function api(path) {
  const res = await fetch(`${cfg.apiUrl}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || tt("js.loadError"));
  return data;
}

function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

let lastOrder = null;

function renderOrder(order) {
  if (!order) return;
  document.getElementById("order-id").textContent = order.id;
  document.getElementById("order-status").textContent = statusLabel(order.status);
  document.getElementById("order-dates").textContent =
    `${formatDate(order.start_date)} — ${formatDate(order.end_date)} (${order.days}` + tt("js.days");
  document.getElementById("order-total").textContent = `${order.total_price} ${cfg.currency}`;

  document.getElementById("order-items").innerHTML = order.items
    .map(
      (i) =>
        `<li>${i.equipment_name} × ${i.quantity} — ${i.subtotal} ${cfg.currency}</li>`
    )
    .join("");

  if (order.contact_name) {
    document.getElementById("order-contact").textContent =
      `${order.contact_name}${order.contact_phone ? ", " + order.contact_phone : ""}`;
  }
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const errEl = document.getElementById("order-error");
  const content = document.getElementById("order-content");

  if (!token) {
    errEl.textContent = tt("js.noToken");
    document.addEventListener("localechange", () => {
      if (!lastOrder) errEl.textContent = tt("js.noToken");
    });
    return;
  }

  try {
    const [order, payment] = await Promise.all([
      api(`/orders/${token}`),
      api("/config/payment"),
    ]);

    lastOrder = order;
    renderOrder(order);

    document.getElementById("payment-instructions").textContent = payment.instructions;
    document.getElementById("payment-telegram").href = payment.telegram_url;

    content.hidden = false;

    document.addEventListener("localechange", () => renderOrder(lastOrder));
  } catch (e) {
    errEl.textContent = e.message;
  }
}

init();
