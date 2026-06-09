const cfg = window.SHOP_CONFIG;

const STATUS_LABELS = {
  pending: "Ожидает оплаты",
  confirmed: "Подтверждён",
  cancelled: "Отменён",
  completed: "Завершён",
};

async function api(path) {
  const res = await fetch(`${cfg.apiUrl}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Ошибка загрузки");
  return data;
}

function formatDate(d) {
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
}

async function init() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const errEl = document.getElementById("order-error");
  const content = document.getElementById("order-content");

  if (!token) {
    errEl.textContent = "Не указан номер заказа.";
    return;
  }

  try {
    const [order, payment] = await Promise.all([
      api(`/orders/${token}`),
      api("/config/payment"),
    ]);

    document.getElementById("order-id").textContent = order.id;
    document.getElementById("order-status").textContent = STATUS_LABELS[order.status] || order.status;
    document.getElementById("order-dates").textContent =
      `${formatDate(order.start_date)} — ${formatDate(order.end_date)} (${order.days} дн.)`;
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

    document.getElementById("payment-instructions").textContent = payment.instructions;
    document.getElementById("payment-telegram").href = payment.telegram_url;

    content.hidden = false;
  } catch (e) {
    errEl.textContent = e.message;
  }
}

init();
