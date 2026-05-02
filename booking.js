/* ============================================================
   booking.js — Agent Permanent
   Popup записи / заявки на курс
   ============================================================ */

const TG_TOKEN   = '8009961717:AAG8WDDRp1g_Y6zoXYaO0WseU9mf33JCyqA';
const TG_CHAT_ID = '-1003923624579';

/* ── Telegram ─────────────────────────────────────────────── */
async function sendToTelegram(name, phone, source) {
  const tag = {
    'студия':         '#студия',
    'академия-пм':    '#академия #пм',
    'академия-брови': '#академия #брови',
  }[source] || '#заявка';

  const now = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const utmSource = new URLSearchParams(window.location.search).get('utm_source');
  const utmMedium = new URLSearchParams(window.location.search).get('utm_medium');
  const utmCampaign = new URLSearchParams(window.location.search).get('utm_campaign');
  const utmLine = (utmSource || utmMedium || utmCampaign)
    ? `\nUTM: ${[utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ')}`
    : '';

  const referer = document.referrer ? `\nОткуда: ${document.referrer}` : '';

  const text =
    `📩 Новая заявка ${tag}\n\nИмя: ${name}\nТелефон: ${phone}\n──────────────────\nСтраница: ${source}\nВремя: ${now} МСК\nСогласие 152-ФЗ: ✓ дано${utmLine}${referer}`;

  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ chat_id: TG_CHAT_ID, text }),
  });
  if (!res.ok) throw new Error(`Telegram API error: ${res.status}`);
}

/* ── Popup config ─────────────────────────────────────────── */
const POPUP_CONFIG = {
  'студия': {
    eyebrow: 'Студия Agent Permanent',
    title:   'Запись на процедуру',
    btn:     'ПЕРЕЗВОНИТЕ МНЕ →',
    tg:  'https://t.me/agentpermanent',
    max: 'https://max.ru/agentpermanent',
    vk:  'https://vk.com/agentpermanent',
  },
  'академия-пм': {
    eyebrow: 'Академия Agent Permanent',
    title:   'Курс мастера ПМ',
    btn:     'БЕСПЛАТНАЯ КОНСУЛЬТАЦИЯ →',
    tg:  'https://t.me/agentpermanent',
    max: 'https://max.ru/agentpermanent',
    vk:  'https://vk.com/agentpermanent',
  },
};

/* ── Inject popup HTML + styles ───────────────────────────── */
function injectPopup() {
  if (document.getElementById('ap-booking-overlay')) return; // already injected

  const style = document.createElement('style');
  style.id = 'ap-booking-style';
  style.textContent = `
    #ap-booking-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(8, 8, 10, 0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    #ap-booking-overlay.ap-open {
      display: flex;
    }
    #ap-booking-box {
      position: relative;
      width: 100%;
      max-width: 460px;
      background: linear-gradient(135deg, #1a1208 0%, #2d1f0a 40%, #1a1208 100%);
      border: 1px solid rgba(196,162,101,0.2);
      border-radius: 28px;
      padding: 48px 40px 40px;
      box-sizing: border-box;
      font-family: 'Raleway', sans-serif;
      color: #F2EDE7;
      box-shadow: 0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,162,101,0.06);
    }
    #ap-booking-close {
      position: absolute;
      top: 20px;
      right: 22px;
      background: rgba(196,162,101,0.08);
      border: 1px solid rgba(196,162,101,0.15);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(196,162,101,0.6);
      font-size: 14px;
      line-height: 1;
      cursor: pointer;
      transition: all 0.2s;
    }
    #ap-booking-close:hover {
      background: rgba(196,162,101,0.15);
      color: #c4a265;
    }
    #ap-popup-eyebrow {
      font-family: 'Raleway', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #c4a265;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    #ap-popup-eyebrow::before {
      content: '';
      width: 24px;
      height: 1px;
      background: #c4a265;
      flex-shrink: 0;
    }
    #ap-popup-title {
      font-family: 'Italiana', serif;
      font-size: 30px;
      font-weight: 400;
      line-height: 1.15;
      color: #F2EDE7;
      margin: 0 0 28px;
    }
    #ap-popup-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ap-field {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(196,162,101,0.18);
      border-radius: 60px;
      padding: 14px 20px;
      font-family: 'Raleway', sans-serif;
      font-size: 14px;
      color: #F2EDE7;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.25s, background 0.25s;
    }
    .ap-field::placeholder { color: rgba(242,237,231,0.3); }
    .ap-field:focus {
      border-color: rgba(196,162,101,0.5);
      background: rgba(196,162,101,0.05);
    }
    #ap-popup-btn {
      width: 100%;
      margin-top: 4px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #C4A265, #D4BA85);
      border: none;
      border-radius: 60px;
      font-family: 'Raleway', sans-serif;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #08080A;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(196,162,101,0.28);
      transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.2s;
    }
    #ap-popup-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 36px rgba(196,162,101,0.38); }
    #ap-popup-btn:active { transform: scale(0.98); }
    #ap-popup-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    #ap-popup-status {
      font-size: 13px;
      color: #c4a265;
      min-height: 20px;
      text-align: center;
    }
    .ap-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 16px;
      font-size: 11px;
      letter-spacing: 0.12em;
      color: rgba(242,237,231,0.3);
      text-transform: uppercase;
    }
    .ap-divider::before,
    .ap-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(196,162,101,0.15);
    }
    .ap-messenger-links {
      display: flex;
      gap: 10px;
    }
    .ap-messenger-links a {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border-radius: 60px;
      font-family: 'Raleway', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: #fff;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.2s;
    }
    .ap-messenger-links a:hover  { opacity: 0.85; transform: translateY(-1px); }
    .ap-messenger-links a:active { transform: scale(0.97); }
    .ap-messenger-links a {
      background: linear-gradient(135deg, #c4a265, #d4ba85) !important;
      color: #08080A !important;
      font-weight: 700;
      letter-spacing: 0.06em;
      box-shadow: 0 4px 16px rgba(196,162,101,0.22);
    }
    .ap-messenger-links a:hover { box-shadow: 0 6px 22px rgba(196,162,101,0.35); }
    .ap-consent {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 6px 0 2px;
      cursor: pointer;
      user-select: none;
      font-family: 'Raleway', sans-serif;
      font-size: 12px;
      font-weight: 300;
      color: rgba(242,237,231,0.55);
      letter-spacing: 0.02em;
      line-height: 1.5;
    }
    .ap-consent input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-top: 1px;
      border: 1px solid rgba(196,162,101,0.45);
      border-radius: 0;
      background: transparent;
      cursor: pointer;
      position: relative;
      transition: border-color 0.2s, background 0.2s;
    }
    .ap-consent input[type="checkbox"]:hover { border-color: #c4a265; }
    .ap-consent input[type="checkbox"]:checked {
      background: #c4a265;
      border-color: #c4a265;
    }
    .ap-consent input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 5px;
      height: 10px;
      border: solid #08080A;
      border-width: 0 2px 2px 0;
      transform: translate(-50%, -60%) rotate(45deg);
    }
    .ap-consent a {
      color: #c4a265;
      text-decoration: none;
      border-bottom: 1px solid rgba(196,162,101,0.35);
      transition: border-color 0.2s;
    }
    .ap-consent a:hover { border-bottom-color: #c4a265; }
    @media (max-width: 480px) {
      #ap-booking-box { padding: 40px 24px 32px; border-radius: 20px; }
      #ap-popup-title { font-size: 26px; }
      .ap-consent { font-size: 11.5px; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ap-booking-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-labelledby', 'ap-popup-title');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div id="ap-booking-box">
      <button id="ap-booking-close" aria-label="Закрыть">&#x2715;</button>

      <p id="ap-popup-eyebrow"></p>
      <h2 id="ap-popup-title"></h2>

      <form id="ap-popup-form" novalidate>
        <input
          id="ap-popup-name"
          class="ap-field"
          type="text"
          name="name"
          placeholder="Ваше имя"
          autocomplete="name"
          required
        />
        <input
          id="ap-popup-phone"
          class="ap-field"
          type="tel"
          name="phone"
          placeholder="+7 (___) ___-__-__"
          autocomplete="tel"
          required
        />
        <label class="ap-consent">
          <input type="checkbox" id="ap-popup-consent" required>
          <span>Согласен на <a href="/privacy/" target="_blank" rel="noopener">обработку персональных данных</a> в соответствии с&nbsp;152-ФЗ</span>
        </label>
        <button id="ap-popup-btn" type="submit"></button>
        <p id="ap-popup-status"></p>
      </form>

      <div class="ap-divider">или напишите сами</div>

      <div class="ap-messenger-links">
        <a id="ap-tg-link"  href="#" target="_blank" rel="noopener">Telegram</a>
        <a id="ap-max-link" href="#" target="_blank" rel="noopener">Макс</a>
        <a id="ap-vk-link"  href="#" target="_blank" rel="noopener">VK</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  /* Close button */
  document.getElementById('ap-booking-close').addEventListener('click', closeBookingPopup);

  /* Click on overlay (outside the box) */
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeBookingPopup();
  });

  /* Form submit */
  document.getElementById('ap-popup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameEl    = document.getElementById('ap-popup-name');
    const phoneEl   = document.getElementById('ap-popup-phone');
    const consentEl = document.getElementById('ap-popup-consent');
    const btn       = document.getElementById('ap-popup-btn');
    const status    = document.getElementById('ap-popup-status');
    const source    = overlay.dataset.source || 'сайт';

    const name  = nameEl.value.trim();
    const phone = phoneEl.value.trim();

    if (!name || !phone) {
      status.textContent = 'Пожалуйста, заполните все поля.';
      return;
    }
    if (consentEl && !consentEl.checked) {
      status.textContent = 'Нужно согласие на обработку персональных данных.';
      return;
    }

    btn.disabled   = true;
    status.textContent = 'Отправляем...';

    try {
      await sendToTelegram(name, phone, source);
      status.textContent = 'Заявка отправлена ✓';
      nameEl.value  = '';
      phoneEl.value = '';
      setTimeout(closeBookingPopup, 2000);
    } catch (err) {
      console.error('[booking.js] sendToTelegram error:', err);
      status.textContent = 'Ошибка отправки. Попробуйте ещё раз.';
      btn.disabled = false;
    }
  });
}

/* ── Phone input helper ───────────────────────────────────── */
function initPhoneInput(input) {
  if (!input.value) input.value = '+7 ';
  function positionAfterCode() {
    if (input.value === '+7 ' || input.value === '+7') {
      const pos = input.value.length;
      setTimeout(function() { input.setSelectionRange(pos, pos); }, 0);
    }
  }
  input.addEventListener('focus', positionAfterCode);
  input.addEventListener('click', positionAfterCode);
}

function initAllPhoneInputs() {
  document.querySelectorAll('[type="tel"]').forEach(initPhoneInput);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllPhoneInputs);
} else {
  initAllPhoneInputs();
}

/* ── Escape handler (stored so we can remove it on close) ─── */
function _apEscHandler(e) {
  if (e.key === 'Escape') closeBookingPopup();
}

/* ── Open ─────────────────────────────────────────────────── */
window.openBookingPopup = function (source) {
  injectPopup();

  const overlay = document.getElementById('ap-booking-overlay');
  const cfg     = POPUP_CONFIG[source] || POPUP_CONFIG['студия'];

  /* Apply config */
  document.getElementById('ap-popup-eyebrow').textContent = cfg.eyebrow;
  document.getElementById('ap-popup-title').textContent   = cfg.title;
  document.getElementById('ap-popup-btn').textContent     = cfg.btn;
  document.getElementById('ap-tg-link').href              = cfg.tg;
  document.getElementById('ap-max-link').href             = cfg.max;
  document.getElementById('ap-vk-link').href              = cfg.vk;

  /* Reset form state */
  document.getElementById('ap-popup-form').reset();
  document.getElementById('ap-popup-status').textContent = '';
  document.getElementById('ap-popup-btn').disabled       = false;

  /* Init phone field */
  const phoneField = document.getElementById('ap-popup-phone');
  if (phoneField) initPhoneInput(phoneField);

  /* Save source for form handler */
  overlay.dataset.source = source || 'сайт';

  /* Escape key — re-register each open to avoid duplicates */
  document.removeEventListener('keydown', _apEscHandler);
  document.addEventListener('keydown', _apEscHandler);

  /* Show */
  overlay.classList.add('ap-open');
  document.body.style.overflow = 'hidden';

  /* Focus first field */
  setTimeout(function () {
    const nameField = document.getElementById('ap-popup-name');
    if (nameField) nameField.focus();
  }, 50);
};

/* ── Close ────────────────────────────────────────────────── */
window.closeBookingPopup = function () {
  const overlay = document.getElementById('ap-booking-overlay');
  if (!overlay) return;

  overlay.classList.remove('ap-open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _apEscHandler);
};
