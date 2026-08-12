const TELEGRAM_URL = "https://t.me/soulmate_travel_georgia";

function whatsappUrl() {
  return (window.SHOP_CONFIG && window.SHOP_CONFIG.whatsappUrl) || "https://wa.me/79089252980";
}

const KIT_PRICES = {
  "kit-2": { key: "js.kit2", p1: 75, p24: 65, p5: 55 },
  "kit-4": { key: "js.kit4", p1: 115, p24: 100, p5: 90 },
};

function tt(key, vars) {
  return window.I18N ? window.I18N.t(key, vars) : key;
}

function itemLabel(name) {
  return window.I18N ? window.I18N.itemLabel(name) : name;
}

function kitName(choice) {
  const kit = KIT_PRICES[choice];
  return kit ? tt(kit.key) : choice;
}

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

/** ~1 € ≈ 3 ₾ — rounded for display next to lari */
const GEL_PER_EUR = 3;

function toEur(gel) {
  return Math.round(Number(gel) / GEL_PER_EUR) || 0;
}

function formatMoney(gel) {
  const n = Number(gel);
  if (!n) return "";
  const isEn = window.I18N && window.I18N.locale === "en";
  return isEn ? `€${toEur(n)} (${n} ₾)` : `${n} ₾`;
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
    const label = itemLabel(cb.value);
    lines.push({
      label: qty > 1 ? `${label} ×${qty}` : label,
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
    el.textContent = tt("js.estimateDates");
    return;
  }
  const days = daysBetween(start, end);
  if (days < 1) {
    el.textContent = tt("js.estimateEndBefore");
    return;
  }

  const choice = selectedChoice();
  if (choice === "custom") {
    const main = linesFrom('input[name="item"]', "qty-", days);
    const addons = linesFrom('input[name="addon"]', "qty-addon-", days);
    if (!main.lines.length) {
      el.textContent = tt("js.estimatePickItems");
      return;
    }
    const total = main.total + addons.total;
    let text = tt("js.estimateCustom", {
      total,
      eur: toEur(total),
      days,
      items: main.lines.map((l) => l.label).join(", "),
    });
    if (addons.lines.length) text += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
    el.textContent = text;
    return;
  }

  const kit = KIT_PRICES[choice];
  const perDay = tierPrice(kit.p1, kit.p24, kit.p5, days);
  let total = perDay * days;
  const addons = linesFrom('input[name="addon"]', "qty-addon-", days);
  total += addons.total;
  let text = tt("js.estimateKit", {
    total,
    eur: toEur(total),
    days,
    kit: kitName(choice),
  });
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
    estimate = main.total + addons.total > 0 ? formatMoney(main.total + addons.total) : tt("js.msgClarify");
  } else {
    const kit = KIT_PRICES[choice];
    const perDay = tierPrice(kit.p1, kit.p24, kit.p5, days);
    what = kitName(choice);
    if (addons.lines.length) what += ` + ${addons.lines.map((l) => l.label).join(", ")}`;
    estimate = formatMoney(perDay * days + addons.total);
  }

  let text =
    tt("js.msgHello") +
    tt("js.msgWhat") +
    what +
    "\n" +
    tt("js.msgDates") +
    `${formatDate(start)} — ${formatDate(end)} (${days}` +
    tt("js.msgDays") +
    "\n" +
    tt("js.msgPeople") +
    people +
    "\n" +
    tt("js.msgWhere") +
    destination +
    "\n" +
    tt("js.msgEstimate") +
    estimate +
    "\n" +
    tt("js.msgName") +
    name +
    "\n" +
    tt("js.msgPhone") +
    phone;
  if (comment) text += "\n" + tt("js.msgComment") + comment;
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

  document.querySelectorAll("#custom-items input, #kit-addons input").forEach((el) => {
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

  function openRequest(channel) {
    const err = document.getElementById("rent-form-error");
    err.hidden = true;

    const startVal = start.value;
    const endVal = end.value;
    if (!startVal || !endVal || daysBetween(startVal, endVal) < 1) {
      err.textContent = tt("js.errDates");
      err.hidden = false;
      return;
    }
    if (selectedChoice() === "custom" && !document.querySelector('input[name="item"]:checked')) {
      err.textContent = tt("js.errItems");
      err.hidden = false;
      return;
    }

    const text = buildMessage();
    const url =
      channel === "whatsapp"
        ? `${whatsappUrl()}?text=${encodeURIComponent(text)}`
        : `${TELEGRAM_URL}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  document.getElementById("rental-request-form").addEventListener("submit", (e) => {
    e.preventDefault();
    openRequest("telegram");
  });

  const waBtn = document.getElementById("rent-whatsapp");
  if (waBtn) {
    waBtn.addEventListener("click", () => openRequest("whatsapp"));
  }

  document.addEventListener("localechange", updateEstimate);

  syncPanels();
}

init();
