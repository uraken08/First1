/* ============================================================
   booking.js — Agent Permanent
   Popup записи / заявки на курс
   ============================================================ */

const TG_TOKEN   = '8009961717:AAG8WDDRp1g_Y6zoXYaO0WseU9mf33JCyqA';
const TG_CHAT_ID = '542272277';

/* ── Telegram ─────────────────────────────────────────────── */
async function sendToTelegram(name, phone, source) {
  const tag = {
    'студия':         '#студия',
    'академия-пм':    '#академия #пм',
    'академия-брови': '#академия #брови',
  }[source] || '#заявка';

  const text =
    `📩 Новая заявка ${tag}\n\nИмя: ${name}\nТелефон: ${phone}\n──────────────────\nИсточник: ${source}`;

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
    btn:     'УЗНАТЬ ДАТУ И СТОИМОСТЬ →',
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
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
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
      max-width: 480px;
      background: #12100d;
      border: 1px solid rgba(196,162,101,0.25);
      border-radius: 4px;
      padding: 48px 40px 40px;
      box-sizing: border-box;
      font-family: 'Raleway', sans-serif;
      color: #f0ece4;
      box-shadow: 0 24px 64px rgba(0,0,0,0.7);
    }
    #ap-booking-close {
      position: absolute;
      top: 16px;
      right: 18px;
      background: none;
      border: none;
      color: rgba(196,162,101,0.7);
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 4px 8px;
      transition: color 0.2s;
    }
    #ap-booking-close:hover { color: #c4a265; }
    #ap-popup-eyebrow {
      font-family: 'Raleway', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #c4a265;
      margin: 0 0 10px;
    }
    #ap-popup-title {
      font-family: 'Italiana', serif;
      font-size: 28px;
      font-weight: 400;
      line-height: 1.2;
      color: #f0ece4;
      margin: 0 0 28px;
    }
    #ap-popup-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .ap-field {
      width: 100%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(196,162,101,0.2);
      border-radius: 2px;
      padding: 13px 16px;
      font-family: 'Raleway', sans-serif;
      font-size: 14px;
      color: #f0ece4;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .ap-field::placeholder { color: rgba(240,236,228,0.35); }
    .ap-field:focus { border-color: rgba(196,162,101,0.55); }
    #ap-popup-btn {
      width: 100%;
      margin-top: 4px;
      padding: 15px 20px;
      background: linear-gradient(135deg, #c4a265 0%, #e8c88c 100%);
      border: none;
      border-radius: 2px;
      font-family: 'Raleway', sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      color: #12100d;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    #ap-popup-btn:hover  { opacity: 0.88; }
    #ap-popup-btn:active { transform: scale(0.98); }
    #ap-popup-btn:disabled { opacity: 0.55; cursor: not-allowed; }
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
      letter-spacing: 0.1em;
      color: rgba(240,236,228,0.35);
      text-transform: uppercase;
    }
    .ap-divider::before,
    .ap-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(196,162,101,0.18);
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
      padding: 11px 8px;
      border-radius: 2px;
      font-family: 'Raleway', sans-serif;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: #fff;
      text-decoration: none;
      transition: opacity 0.2s, transform 0.15s;
    }
    .ap-messenger-links a:hover  { opacity: 0.85; }
    .ap-messenger-links a:active { transform: scale(0.97); }
    #ap-tg-link  { background: #229ED9; }
    #ap-max-link { background: #005FF9; }
    #ap-vk-link  { background: #0077FF; }
    @media (max-width: 480px) {
      #ap-booking-box { padding: 40px 24px 32px; }
      #ap-popup-title { font-size: 24px; }
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

    const nameEl   = document.getElementById('ap-popup-name');
    const phoneEl  = document.getElementById('ap-popup-phone');
    const btn      = document.getElementById('ap-popup-btn');
    const status   = document.getElementById('ap-popup-status');
    const source   = overlay.dataset.source || 'сайт';

    const name  = nameEl.value.trim();
    const phone = phoneEl.value.trim();

    if (!name || !phone) {
      status.textContent = 'Пожалуйста, заполните все поля.';
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
