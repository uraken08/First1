// ───── Конфиг Telegram-бота ─────
const TELEGRAM_BOT_TOKEN = '8009961717:AAG8WDDRp1g_Y6zoXYaO0WseU9mf33JCyqA';
const TELEGRAM_CHAT_ID   = '-1003923624579';
// ────────────────────────────────

(function () {
  // ── Источник трафика: UTM-метки, кликовые ID, referrer ──
  function captureSource() {
    const params = new URLSearchParams(location.search);
    const utm = {
      utm_source:   params.get('utm_source'),
      utm_medium:   params.get('utm_medium'),
      utm_campaign: params.get('utm_campaign'),
      utm_content:  params.get('utm_content'),
      utm_term:     params.get('utm_term'),
      yclid:        params.get('yclid'),  // Яндекс.Директ
      gclid:        params.get('gclid'),  // Google Ads
      fbclid:       params.get('fbclid'),
    };
    const hasAny = Object.values(utm).some(v => v);
    if (hasAny) {
      try {
        sessionStorage.setItem('ap_source', JSON.stringify({
          ...utm,
          first_referrer: document.referrer,
          landing: location.href,
          ts: Date.now(),
        }));
      } catch (e) {}
    }
  }

  function getSource() {
    let src = {};
    try {
      const raw = sessionStorage.getItem('ap_source');
      if (raw) src = JSON.parse(raw);
    } catch (e) {}
    if (!src.first_referrer) src.first_referrer = document.referrer;
    return src;
  }

  function sourceLabel(src) {
    if (src.yclid)  return '🎯 Яндекс.Директ';
    if (src.gclid)  return '🎯 Google Ads';
    if (src.fbclid) return '🎯 Facebook Ads';
    const u = (src.utm_source || '').toLowerCase();
    if (u) {
      if (u.includes('vk'))                 return '🔵 ВКонтакте (UTM)';
      if (u.includes('insta'))              return '📷 Instagram (UTM)';
      if (u.includes('yandex'))             return '🟡 Яндекс (UTM)';
      if (u.includes('google'))             return '🔍 Google (UTM)';
      if (u.includes('tg') || u.includes('telegram')) return '💬 Telegram (UTM)';
      return `🏷 ${u} (UTM)`;
    }
    const r = (src.first_referrer || '').toLowerCase();
    if (!r) return '📑 Прямой переход / закладки';
    if (r.includes('vk.com') || r.includes('vk.ru'))     return '🔵 ВКонтакте';
    if (r.includes('instagram.com'))                     return '📷 Instagram';
    if (r.includes('yandex.'))                           return '🟡 Яндекс';
    if (r.includes('google.'))                           return '🔍 Google';
    if (r.includes('t.me') || r.includes('telegram'))    return '💬 Telegram';
    if (r.includes('wa.me') || r.includes('whatsapp'))   return '🟢 WhatsApp';
    if (r.includes('agentpermanent'))                    return '↪️ Внутренний переход';
    try {
      const host = new URL(src.first_referrer).hostname;
      return `🌐 ${host}`;
    } catch (e) { return '🌐 Внешний сайт'; }
  }

  // Хэш-теги по разделу сайта
  function pageTags() {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/school/pm'))    return ['#академия', '#пм'];
    if (path.startsWith('/school/brows')) return ['#академия', '#брови'];
    if (path.startsWith('/school'))       return ['#академия'];
    if (path.startsWith('/studio'))       return ['#студия'];
    if (path.startsWith('/contacts'))     return ['#контакты'];
    if (path.startsWith('/portfolio'))    return ['#портфолио'];
    if (path.startsWith('/about'))        return ['#о_бренде'];
    if (path === '/' || path === '/index.html' || path.startsWith('/index')) return ['#главная'];
    return ['#сайт'];
  }

  // Человекочитаемое имя страницы для строки "Страница: ..." в TG
  function pageName() {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/school/pm'))    return 'Академия — Обучение ПМ';
    if (path.startsWith('/school/brows')) return 'Академия — Брови';
    if (path.startsWith('/school'))       return 'Академия';
    if (path.startsWith('/studio'))       return 'Студия';
    if (path.startsWith('/contacts'))     return 'Контакты';
    if (path.startsWith('/portfolio'))    return 'Портфолио';
    if (path.startsWith('/about'))        return 'О бренде';
    if (path === '/' || path === '/index.html' || path.startsWith('/index')) return 'Главная';
    return document.title;
  }

  // ── Телефон: +7 как префикс с возможностью стереть ──
  function initPhoneFields() {
    document.querySelectorAll('input[type="tel"]').forEach(inp => {
      inp.removeAttribute('placeholder');
      if (!inp.value) inp.value = '+7 ';

      inp.addEventListener('focus', () => {
        // Подставляем +7 только если поле НИ РАЗУ не редактировалось.
        // Если пользователь стёр всё (включая +7) — оставляем пустым,
        // чтобы он мог ввести другой код страны.
        if (!inp.value && !inp.dataset.touched) inp.value = '+7 ';
        setTimeout(() => {
          const len = inp.value.length;
          try { inp.setSelectionRange(len, len); } catch (e) {}
        }, 0);
      });

      inp.addEventListener('input', () => { inp.dataset.touched = '1'; });

      inp.addEventListener('blur', () => {
        // Если поле осталось только с префиксом — очищаем, чтобы required ругался
        if (inp.value === '+7 ' || inp.value === '+7' || inp.value.trim() === '+7') {
          inp.value = '';
        }
      });
    });
  }

  // ── Чтение полей формы ──
  function extractFormData(form) {
    const out = {};
    const nameEl  = form.querySelector('input[type="text"], input[name="name"]');
    const phoneEl = form.querySelector('input[type="tel"],  input[name="phone"]');
    const emailEl = form.querySelector('input[type="email"], input[name="email"]');
    if (nameEl)  out.name  = nameEl.value.trim();
    if (phoneEl) out.phone = phoneEl.value.trim();
    if (emailEl) out.email = emailEl.value.trim();
    const activeTags = form.querySelectorAll('.ct-tag.active, [data-tag-active]');
    if (activeTags.length) {
      out.tags = Array.from(activeTags).map(t => t.textContent.trim()).join(', ');
    }
    const consent = form.querySelector('.form-consent input[type="checkbox"]');
    out.consent = !!(consent && consent.checked);
    const sec = form.closest('section, [id]');
    if (sec) {
      const h = sec.querySelector('h1, h2, h3');
      if (h && h.textContent.trim()) out.block = h.textContent.trim();
      else if (sec.id) out.block = sec.id;
    }
    return out;
  }

  // ── Шаблон сообщения в Telegram ──
  function buildTelegramMessage(data) {
    const baseTags = pageTags();
    const serviceTags = data.tags
      ? data.tags.split(',').map(t => '#' + t.trim().toLowerCase().replace(/\s+/g, '_'))
      : [];
    const tagLine = [...baseTags, ...serviceTags].join(' ');

    const ts = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const src = getSource();

    const lines = [];
    lines.push(`📩 Новая заявка ${tagLine}`);
    lines.push('');
    lines.push(`Имя: ${data.name || '—'}`);
    lines.push(`Телефон: ${data.phone || '—'}`);
    if (data.email)   lines.push(`Email: ${data.email}`);
    if (data.tags)    lines.push(`Услуга: ${data.tags}`);
    lines.push('──────────────────');
    lines.push(`Страница: ${pageName()}`);
    if (data.block)   lines.push(`Блок: ${data.block}`);
    lines.push(`Время: ${ts} МСК`);
    lines.push(`Согласие 152-ФЗ: ${data.consent ? '✓ дано' : '— не дано'}`);
    lines.push(`Откуда: ${location.href}`);
    lines.push(`Источник: ${sourceLabel(src)}`);
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

  window.handleSubmit = async function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn ? btn.textContent : '';

    const consent = form.querySelector('.form-consent input[type="checkbox"]');
    if (consent && !consent.checked) {
      alert('Пожалуйста, подтвердите согласие на обработку персональных данных.');
      return;
    }

    // Минимальная валидация телефона: должно быть >= 10 цифр
    const phoneEl = form.querySelector('input[type="tel"]');
    if (phoneEl) {
      const digits = (phoneEl.value || '').replace(/\D/g, '');
      if (digits.length < 10) {
        alert('Пожалуйста, введите корректный номер телефона.');
        phoneEl.focus();
        return;
      }
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
      // После reset вернуть префикс +7
      form.querySelectorAll('input[type="tel"]').forEach(i => { i.value = '+7 '; });
    } else {
      console.warn('[forms] Заявка не отправлена. Данные:', data);
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
      alert('Спасибо за заявку! Сейчас системы записи временно недоступны — пожалуйста, напишите нам в Telegram или WhatsApp по номеру +7 (999) 820-04-21.');
    }
  };

  // Инициализация
  function init() {
    captureSource();
    initPhoneFields();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
