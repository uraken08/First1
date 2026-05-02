// ───── Конфиг Telegram-бота ─────
// Чтобы заявки начали приходить, заполните 2 строки ниже:
//   1. TELEGRAM_BOT_TOKEN — токен от @BotFather (вида '8123456789:AAEx...')
//   2. TELEGRAM_CHAT_ID   — id чата (личного или группового), где будут приходить заявки
// Подробная инструкция — в README или у разработчика.
const TELEGRAM_BOT_TOKEN = '8009961717:AAG8WDDRp1g_Y6zoXYaO0WseU9mf33JCyqA';
const TELEGRAM_CHAT_ID   = '-1003923624579';
// ────────────────────────────────

(function () {
  // Получает значения полей формы по эвристике (имя, телефон, пр.)
  function extractFormData(form) {
    const out = {};
    const nameEl  = form.querySelector('input[type="text"], input[name="name"]');
    const phoneEl = form.querySelector('input[type="tel"],  input[name="phone"]');
    const emailEl = form.querySelector('input[type="email"], input[name="email"]');
    if (nameEl)  out.name  = nameEl.value.trim();
    if (phoneEl) out.phone = phoneEl.value.trim();
    if (emailEl) out.email = emailEl.value.trim();
    // Тэги (например, на странице контактов: «Брови / Губы / Обучение»)
    const activeTags = form.querySelectorAll('.ct-tag.active, [data-tag-active]');
    if (activeTags.length) {
      out.tags = Array.from(activeTags).map(t => t.textContent.trim()).join(', ');
    }
    const consent = form.querySelector('.form-consent input[type="checkbox"]');
    out.consent = !!(consent && consent.checked);
    return out;
  }

  function buildTelegramMessage(data) {
    const lines = ['🔔 Новая заявка с сайта', ''];
    if (data.name)  lines.push(`👤 Имя: ${data.name}`);
    if (data.phone) lines.push(`📞 Телефон: ${data.phone}`);
    if (data.email) lines.push(`✉️ Email: ${data.email}`);
    if (data.tags)  lines.push(`🏷  Услуга: ${data.tags}`);
    lines.push('');
    if (data.consent) {
      const ts = new Date().toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      lines.push(`✓ Согласие 152-ФЗ: дано ${ts} МСК`);
    }
    lines.push(`📄 Страница: ${document.title}`);
    lines.push(`🔗 ${window.location.href}`);
    return lines.join('\n');
  }

  async function sendToTelegram(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;
    try {
      const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
      });
      return res.ok;
    } catch (e) {
      console.error('[forms] Telegram send error:', e);
      return false;
    }
  }

  // Универсальный обработчик. Подключается через onsubmit="handleSubmit(event)"
  window.handleSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn ? btn.textContent : '';

    // Проверка чекбокса согласия (если есть)
    const consent = form.querySelector('.form-consent input[type="checkbox"]');
    if (consent && !consent.checked) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Отправка...';
    }

    const data = extractFormData(form);
    const text = buildTelegramMessage(data);

    const ok = await sendToTelegram(text);

    if (ok) {
      if (btn) {
        btn.textContent = 'Заявка отправлена ✓';
        btn.style.background = 'rgba(196,162,101,0.3)';
        btn.style.color = 'var(--gold)';
      }
      form.reset();
    } else {
      // Бот ещё не настроен или не отвечает — даём fallback
      console.warn('[forms] Заявка не отправлена (бот не настроен или сеть). Данные:', data);
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
      alert('Спасибо за заявку! Сейчас системы записи временно недоступны — пожалуйста, напишите нам в Telegram или WhatsApp по номеру +7 (999) 820-04-21.');
    }
  };
})();
