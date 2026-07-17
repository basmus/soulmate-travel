const TELEGRAM_URL = "https://t.me/soulmate_travel_georgia";

const KIT_PRICES = {
  "kit-2": { name: "Комплект для 2 человек", p1: 75, p24: 65, p5: 55 },
  "kit-4": { name: "Семейный комплект (4 человека)", p1: 115, p24: 100, p5: 90 },
};

function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  return Math.round((e - s) / 86400000) + 1;
}

function tierPrice(p1, p24, p5, days) {
  if (days <= 1) return p1;
  if (days <= 4) return p24;
  return p5;
}

function formatDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

function selectedChoice() {
  return document.querySelector('input[name="choice"]:checked')?.value || "kit-2";
}

function linesFrom(selector, qtyPrefix, days) {
  const lines = [];
  let total = 0;
  document.querySelectorAll(selector).forEach((cb) => {
    if (!cb.checked) return;
    const qtyName = `${qtyPrefix}${cb.value}`;
    const qtyInput = document.querySelector(`input[name="${CSS.escape(qtyName)}"]`);
    const qty = qtyInput ? Math.max(1, Math.min(10, Number(qtyInput.value) || 1)) : 1;
    const p1 = Number(cb.dataset.p1) || 0;
    const p24 = Number(cb.dataset.p24) || 0;
    const p5 = Number(cb.dataset.p5) || 0;
    const perDay = tierPrice(p1, p24, p5, days);
    const lineTotal = perDay * days * qty;
    total += lineTotal;
    lines.push({
      label: qty > 1 ? `${cb.value} ×${qty}` : cb.value,
      perDay,
      lineTotal,
      priced: p1 > 0 || p24 > 0 || p5 > 0,
    });
  });
  return { lines, total };
}

function updateEstimate() {
  const el = document.getElementById("rent-estimate");
  const start = document.getElementById("rent-start").value;
  const end = document.getElementById("rent-end").value;
  if (!start || !end) {
    el.textContent = "Выберите даты — покажем ориентир по цене";
    return;
  }
  const days = daysBetween(start, end);
  if (days < 1) {
    el.textContent = "Дата окончания должна быть не раньше даты начала";
    return;
  }

  const choice = selectedChoice();
  if (choice === "custom") {
    const main = linesFrom('input[name="item"]', "qty-", days);
    const addons = linesFrom('input[name="addon"]', "qty-addon-", days);
    if (!main.lines.length) {
      el.textContent = "Отметьте палатку, спальники или коврики";
      return;
    }
    const total = main.total + addons.total;
    let text = `Ориентир: ${total} ₾ за ${days} дн. (${main.lines.map((l) => l.label).join(", ")})`;
    if (addons.lines.length) text += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
    el.textContent = text;
    return;
  }

  const kit = KIT_PRICES[choice];
  const perDay = tierPrice(kit.p1, kit.p24, kit.p5, days);
  let total = perDay * days;
  const addons = linesFrom('input[name="addon"]', "qty-addon-", days);
  total += addons.total;
  let text = `Ориентир: ${total} ₾ за ${days} дн. — ${kit.name}`;
  if (addons.lines.length) {
    text += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
  }
  el.textContent = text;
}

function syncPanels() {
  const isCustom = selectedChoice() === "custom";
  document.getElementById("custom-items").hidden = !isCustom;
  updateEstimate();
}

function buildMessage() {
  const start = document.getElementById("rent-start").value;
  const end = document.getElementById("rent-end").value;
  const days = daysBetween(start, end);
  const choice = selectedChoice();
  const name = document.getElementById("rent-name").value.trim();
  const phone = document.getElementById("rent-phone").value.trim();
  const people = document.getElementById("rent-people").value;
  const destination = document.getElementById("rent-destination").value.trim() || "—";
  const comment = document.getElementById("rent-comment").value.trim();
  const addons = linesFrom('input[name="addon"]', "qty-addon-", days);

  let what;
  let estimate;
  if (choice === "custom") {
    const main = linesFrom('input[name="item"]', "qty-", days);
    what = main.lines.map((l) => l.label).join(", ");
    if (addons.lines.length) what += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
    estimate = main.total + addons.total > 0 ? `${main.total + addons.total} ₾` : "уточним";
  } else {
    const kit = KIT_PRICES[choice];
    const perDay = tierPrice(kit.p1, kit.p24, kit.p5, days);
    what = kit.name;
    if (addons.lines.length) what += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
    estimate = `${perDay * days + addons.total} ₾`;
  }

  let text =
    `Здравствуйте! Заявка на прокат.\n\n` +
    `Что: ${what}\n` +
    `Даты: ${formatDate(start)} — ${formatDate(end)} (${days} дн.)\n` +
    `Людей: ${people}\n` +
    `Куда: ${destination}\n` +
    `Ориентир: ${estimate}\n` +
    `Имя: ${name}\n` +
    `Телефон: ${phone}`;
  if (comment) text += `\nКомментарий: ${comment}`;
  return text;
}

function init() {
  const start = document.getElementById("rent-start");
  const end = document.getElementById("rent-end");
  const today = new Date().toISOString().slice(0, 10);
  start.min = today;
  end.min = today;

  start.addEventListener("change", () => {
    end.min = start.value || today;
    if (end.value && end.value < start.value) end.value = start.value;
    updateEstimate();
  });
  end.addEventListener("change", updateEstimate);

  document.querySelectorAll('input[name="choice"]').forEach((el) => {
    el.addEventListener("change", () => {
      const people = document.getElementById("rent-people");
      if (el.value === "kit-2") people.value = "2";
      if (el.value === "kit-4") people.value = "4";
      syncPanels();
    });
  });

  document.querySelectorAll('#custom-items input, #kit-addons input').forEach((el) => {
    el.addEventListener("change", updateEstimate);
    el.addEventListener("input", updateEstimate);
  });

  document.querySelectorAll("[data-book]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.getAttribute("data-book");
      const radio = document.querySelector(`input[name="choice"][value="${value}"]`);
      if (radio) {
        radio.checked = true;
        syncPanels();
      }
      document.getElementById("book").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.getElementById("rental-request-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = document.getElementById("rent-form-error");
    err.hidden = true;

    const startVal = start.value;
    const endVal = end.value;
    if (!startVal || !endVal || daysBetween(startVal, endVal) < 1) {
      err.textContent = "Проверьте даты аренды.";
      err.hidden = false;
      return;
    }
    if (selectedChoice() === "custom" && !document.querySelector('input[name="item"]:checked')) {
      err.textContent = "Выберите хотя бы одну позицию.";
      err.hidden = false;
      return;
    }

    const url = `${TELEGRAM_URL}?text=${encodeURIComponent(buildMessage())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  });

  syncPanels();
}

init();
