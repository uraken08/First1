# Booking Block Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить блок записи на сайт Agent Permanent — попап для академии, три карточки для студии, Telegram-оповещения с хэштегами.

**Architecture:** Единый JS-модуль `js/booking.js` управляет попапами и отправкой в Telegram. CSS-стили попапа добавляются в `css/style.css`. Каждая страница подключает `booking.js` и вызывает нужный тип попапа через `data-`-атрибуты.

**Tech Stack:** Vanilla JS, Telegram Bot API (fetch), HTML/CSS

---

## Файловая структура

- **Создать:** `js/booking.js` — попап, форма, отправка в Telegram
- **Изменить:** `css/style.css` — стили попапа и карточек записи
- **Изменить:** `studio/index.html` — блок трёх карточек + подключение booking.js
- **Изменить:** `school/pm/index.html` — две кнопки попапа академии + подключение booking.js

---

## Предварительный шаг: настройка Telegram Bot

Перед кодом нужно получить токен бота и chat_id.

- [ ] Открой Telegram, найди @BotFather, напиши `/newbot`, дай имя `AgentPermanentBot`
- [ ] Скопируй токен вида `7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] Напиши боту первое сообщение (любое слово)
- [ ] Открой в браузере: `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
- [ ] Найди в ответе `"chat":{"id":XXXXXXXXX}` — это твой chat_id
- [ ] Запиши оба значения — они понадобятся в Task 1

---

## Task 1: Создать js/booking.js

**Файлы:**
- Создать: `js/booking.js`

- [ ] **Шаг 1: Создать файл с конфигом**

```js
// js/booking.js
const TG_TOKEN = 'ВСТАВЬ_ТОКЕН_СЮДА';
const TG_CHAT_ID = 'ВСТАВЬ_CHAT_ID_СЮДА';
```

- [ ] **Шаг 2: Добавить функцию отправки в Telegram**

```js
async function sendToTelegram(name, phone, source) {
  const tag = {
    'студия':        '#студия',
    'академия-пм':   '#академия #пм',
    'академия-брови':'#академия #брови',
  }[source] || '#заявка';

  const text = `📩 Новая заявка ${tag}\n\nИмя: ${name}\nТелефон: ${phone}\n──────────────────\nИсточник: ${source}`;

  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' })
  });
}
```

- [ ] **Шаг 3: Добавить HTML попапа в DOM при загрузке страницы**

```js
function injectPopup() {
  if (document.getElementById('ap-popup')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div id="ap-popup" style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.8);backdrop-filter:blur(6px);align-items:center;justify-content:center">
      <div id="ap-popup-box" style="background:#12100d;border:1px solid rgba(196,162,101,0.25);padding:32px;width:340px;max-width:90vw;position:relative">
        <button onclick="closeBookingPopup()" style="position:absolute;top:12px;right:16px;background:none;border:none;color:rgba(255,255,255,0.3);font-size:1.1rem;cursor:pointer">✕</button>
        <div id="ap-popup-eyebrow" style="color:#c4a265;font-size:0.6rem;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:6px"></div>
        <div id="ap-popup-title" style="font-family:'Italiana',serif;font-size:1.2rem;color:white;margin-bottom:20px"></div>
        <form id="ap-popup-form" style="display:flex;flex-direction:column;gap:10px">
          <input name="name" placeholder="Ваше имя" required style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:11px 14px;color:white;font-family:'Raleway',sans-serif;font-size:0.8rem;outline:none;width:100%">
          <input name="phone" type="tel" placeholder="+7 (___) ___-__-__" required style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);padding:11px 14px;color:white;font-family:'Raleway',sans-serif;font-size:0.8rem;outline:none;width:100%">
          <button type="submit" id="ap-popup-btn" style="background:linear-gradient(90deg,#c4a265,#e8c88c);border:none;padding:13px;font-family:'Raleway',sans-serif;font-size:0.75rem;color:#0a0805;font-weight:700;letter-spacing:0.2em;cursor:pointer;width:100%"></button>
        </form>
        <div style="border-top:1px solid rgba(255,255,255,0.07);margin-top:16px;padding-top:14px">
          <div style="color:rgba(255,255,255,0.25);font-size:0.6rem;text-align:center;margin-bottom:10px">или напишите сами</div>
          <div style="display:flex;gap:8px">
            <a id="ap-tg-link" href="#" target="_blank" style="flex:1;background:#229ED9;padding:9px;text-align:center;font-size:0.65rem;color:white;font-weight:600;text-decoration:none">Telegram</div>
            <a id="ap-max-link" href="#" target="_blank" style="flex:1;background:#005FF9;padding:9px;text-align:center;font-size:0.65rem;color:white;font-weight:600;text-decoration:none">Макс</div>
            <a id="ap-vk-link" href="#" target="_blank" style="flex:1;background:#0077FF;padding:9px;text-align:center;font-size:0.65rem;color:white;font-weight:600;text-decoration:none">VK</div>
          </div>
        </div>
      </div>
    </div>
  `);

  document.getElementById('ap-popup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = e.target.name.value.trim();
    const phone = e.target.phone.value.trim();
    const source = document.getElementById('ap-popup').dataset.source;
    const btn = document.getElementById('ap-popup-btn');
    btn.textContent = 'Отправляем...';
    btn.disabled = true;
    await sendToTelegram(name, phone, source);
    btn.textContent = 'Заявка отправлена ✓';
    setTimeout(closeBookingPopup, 2000);
  });
}
```

- [ ] **Шаг 4: Добавить функции открытия/закрытия**

```js
const POPUP_CONFIG = {
  'студия': {
    eyebrow: 'Студия Agent Permanent',
    title:   'Запись на процедуру',
    btn:     'ПЕРЕЗВОНИТЕ МНЕ →',
    tg:      'https://t.me/ВСТАВЬ_USERNAME',
    max:     'https://max.ru/ВСТАВЬ_USERNAME',
    vk:      'https://vk.com/ВСТАВЬ_USERNAME',
  },
  'академия-пм': {
    eyebrow: 'Академия Agent Permanent',
    title:   'Курс мастера ПМ',
    btn:     'УЗНАТЬ ДАТУ И СТОИМОСТЬ →',
    tg:      'https://t.me/ВСТАВЬ_USERNAME',
    max:     'https://max.ru/ВСТАВЬ_USERNAME',
    vk:      'https://vk.com/ВСТАВЬ_USERNAME',
  },
};

window.openBookingPopup = function(source) {
  injectPopup();
  const cfg = POPUP_CONFIG[source] || POPUP_CONFIG['студия'];
  const popup = document.getElementById('ap-popup');
  popup.dataset.source = source;
  document.getElementById('ap-popup-eyebrow').textContent = cfg.eyebrow;
  document.getElementById('ap-popup-title').textContent   = cfg.title;
  document.getElementById('ap-popup-btn').textContent     = cfg.btn;
  document.getElementById('ap-tg-link').href  = cfg.tg;
  document.getElementById('ap-max-link').href = cfg.max;
  document.getElementById('ap-vk-link').href  = cfg.vk;
  document.getElementById('ap-popup-form').reset();
  document.getElementById('ap-popup-btn').disabled = false;
  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
};

window.closeBookingPopup = function() {
  document.getElementById('ap-popup').style.display = 'none';
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeBookingPopup();
});
```

- [ ] **Шаг 5: Вставь реальные ссылки на мессенджеры**

В `POPUP_CONFIG` замени:
- `https://t.me/ВСТАВЬ_USERNAME` → реальный Telegram канал/аккаунт
- `https://max.ru/ВСТАВЬ_USERNAME` → реальный Макс аккаунт
- `https://vk.com/ВСТАВЬ_USERNAME` → реальная группа VK

- [ ] **Шаг 6: Проверить файл открыв в браузере консоль**

```bash
cd ~/Documents/AI && python3 -m http.server 8080
```
Открой `http://localhost:8080` — ошибок в консоли быть не должно.

- [ ] **Шаг 7: Коммит**

```bash
cd ~/Documents/AI && git init 2>/dev/null; git add js/booking.js
git commit -m "feat: add booking.js with popup and Telegram notifications"
```

---

## Task 2: Обновить страницу Студии

**Файлы:**
- Изменить: `studio/index.html`

- [ ] **Шаг 1: Подключить booking.js перед `</body>`**

Найди строку `</body>` в `studio/index.html` и добавь перед ней:

```html
<script src="../js/booking.js"></script>
```

- [ ] **Шаг 2: Заменить секцию `cta-section`**

Найди в `studio/index.html` блок `<section class="cta-section" id="cta">` и замени его полностью на:

```html
<section class="cta-section" id="cta">
  <div class="section-inner">
    <div class="section-eyebrow fade-up">Записаться</div>
    <h2 class="section-title fade-up">Выберите удобный способ</h2>
    <div class="booking-cards fade-up">

      <div class="booking-card">
        <div class="booking-card-icon">📋</div>
        <h3 class="booking-card-title">Заявка на перезвон</h3>
        <p class="booking-card-text">Заполните форму — свяжемся в течение часа и подберём удобное время</p>
        <button class="btn btn-gold" onclick="openBookingPopup('студия')">Оставить заявку</button>
      </div>

      <div class="booking-card booking-card--accent">
        <div class="booking-card-icon">📅</div>
        <h3 class="booking-card-title">Онлайн-запись</h3>
        <p class="booking-card-text">Выберите дату и время прямо сейчас — моментальное подтверждение</p>
        <a class="btn btn-gold" href="ВСТАВЬ_ССЫЛКУ_YCLIENTS" target="_blank">Выбрать время</a>
      </div>

      <div class="booking-card">
        <div class="booking-card-icon">💬</div>
        <h3 class="booking-card-title">Написать нам</h3>
        <p class="booking-card-text">Ответим на все вопросы в удобном мессенджере</p>
        <div style="display:flex;gap:8px;margin-top:auto">
          <a class="btn-messenger" href="https://t.me/ВСТАВЬ" target="_blank">TG</a>
          <a class="btn-messenger btn-messenger--max" href="https://max.ru/ВСТАВЬ" target="_blank">Макс</a>
          <a class="btn-messenger btn-messenger--vk" href="https://vk.com/ВСТАВЬ" target="_blank">VK</a>
        </div>
      </div>

    </div>
  </div>
</section>
```

- [ ] **Шаг 3: Заменить все ссылки "Записаться →" в карточках услуг**

Найди в `studio/index.html` все строки вида:
```html
<a href="../contacts/" class="service-card-link">Записаться →</a>
```
Замени каждую на:
```html
<a href="#" class="service-card-link" onclick="openBookingPopup('студия');return false;">Записаться →</a>
```

- [ ] **Шаг 4: Заменить кнопку "Записаться" в навигации**

Найди:
```html
<a href="../contacts/" class="nav-links-a nav-cta">Записаться</a>
```
Замени на:
```html
<a href="#" class="nav-links-a nav-cta" onclick="openBookingPopup('студия');return false;">Записаться</a>
```
То же для мобильного меню (вторая такая же строка в `nav-mobile`).

- [ ] **Шаг 5: Добавить стили booking-card в css/style.css**

Добавь в конец `css/style.css`:

```css
/* ── Booking Cards ── */
.booking-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 48px;
}
.booking-card {
  border: 1px solid rgba(196,162,101,0.18);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(196,162,101,0.03);
  transition: border-color 0.3s;
}
.booking-card:hover { border-color: rgba(196,162,101,0.35); }
.booking-card--accent { background: rgba(196,162,101,0.06); border-color: rgba(196,162,101,0.28); }
.booking-card-icon { font-size: 1.5rem; }
.booking-card-title { font-size: 1rem; font-weight: 500; color: var(--text-primary); letter-spacing: 0.03em; }
.booking-card-text { font-size: 0.83rem; color: var(--text-muted); line-height: 1.6; flex: 1; }
.btn-messenger {
  flex: 1;
  padding: 9px 6px;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  letter-spacing: 0.1em;
  background: #229ED9;
}
.btn-messenger--max { background: #005FF9; }
.btn-messenger--vk  { background: #0077FF; }
@media (max-width: 768px) {
  .booking-cards { grid-template-columns: 1fr; }
}
```

- [ ] **Шаг 6: Вставь реальную ссылку YClients**

В `studio/index.html` замени `ВСТАВЬ_ССЫЛКУ_YCLIENTS` на реальную ссылку из личного кабинета YClients.

- [ ] **Шаг 7: Проверить в браузере**

Открой `http://localhost:8080/studio/`
- Три карточки видны
- Клик "Оставить заявку" → открывается попап
- Клик "Записаться →" в услуге → открывается попап
- Попап закрывается по ✕ и по Escape

- [ ] **Шаг 8: Коммит**

```bash
cd ~/Documents/AI
git add studio/index.html css/style.css
git commit -m "feat: add 3-card booking block to studio page"
```

---

## Task 3: Обновить страницу курса ПМ (Академия)

**Файлы:**
- Изменить: `school/pm/index.html`

- [ ] **Шаг 1: Подключить booking.js перед `</body>`**

```html
<script src="../../js/booking.js"></script>
```

- [ ] **Шаг 2: Найти hero-секцию и добавить кнопку вверху**

Найди в `school/pm/index.html` блок `.pm-hero-ctas` (строка ~82 по результатам grep). Найди первую кнопку в этом блоке и добавь рядом:

```html
<button class="btn btn-gold" onclick="openBookingPopup('академия-пм')">Узнать дату и стоимость</button>
```

- [ ] **Шаг 3: Найти финальный CTA-блок и добавить кнопку внизу**

Найди секцию с финальным призывом к действию (внизу страницы, ищи `.pm-lead-form` или `pm-cta`). Добавь после формы кнопку:

```html
<button class="btn btn-gold" style="width:100%;margin-top:12px" onclick="openBookingPopup('академия-пм')">Записаться на курс</button>
```

- [ ] **Шаг 4: Добавить конфиг академии в booking.js**

Открой `js/booking.js`, найди `POPUP_CONFIG` и убедись что там есть запись `'академия-пм'` (добавлена в Task 1). Если нет — добавь:

```js
'академия-пм': {
  eyebrow: 'Академия Agent Permanent',
  title:   'Курс мастера ПМ',
  btn:     'УЗНАТЬ ДАТУ И СТОИМОСТЬ →',
  tg:      'https://t.me/ВСТАВЬ_USERNAME',
  max:     'https://max.ru/ВСТАВЬ_USERNAME',
  vk:      'https://vk.com/ВСТАВЬ_USERNAME',
},
```

- [ ] **Шаг 5: Проверить в браузере**

Открой `http://localhost:8080/school/pm/`
- Кнопка "Узнать дату и стоимость" вверху → попап с заголовком "Курс мастера ПМ"
- Кнопка "Записаться на курс" внизу → тот же попап
- Отправка формы → в Telegram приходит сообщение с тегами `#академия #пм`

- [ ] **Шаг 6: Коммит**

```bash
cd ~/Documents/AI
git add school/pm/index.html js/booking.js
git commit -m "feat: add booking popup to academy PM course page"
```

---

## Task 4: Плавающие кнопки мессенджеров (мобильный)

**Файлы:**
- Изменить: `css/style.css`
- Изменить: `index.html`, `studio/index.html`, `school/pm/index.html`

- [ ] **Шаг 1: Добавить стили плавающих кнопок в css/style.css**

```css
/* ── Floating Messenger Buttons (mobile) ── */
.float-messengers {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 16px;
  flex-direction: column;
  gap: 10px;
  z-index: 8000;
}
@media (max-width: 768px) {
  .float-messengers { display: flex; }
}
.float-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.2s;
}
.float-btn:hover { transform: scale(1.1); }
.float-btn--tg  { background: #229ED9; }
.float-btn--max { background: #005FF9; }
.float-btn--vk  { background: #0077FF; }
```

- [ ] **Шаг 2: Добавить HTML плавающих кнопок в каждую страницу**

В `studio/index.html`, `school/pm/index.html`, `index.html` добавь перед `</body>`:

```html
<div class="float-messengers">
  <a class="float-btn float-btn--tg" href="https://t.me/ВСТАВЬ" target="_blank" title="Telegram">✈</a>
  <a class="float-btn float-btn--max" href="https://max.ru/ВСТАВЬ" target="_blank" title="Макс">М</a>
  <a class="float-btn float-btn--vk" href="https://vk.com/ВСТАВЬ" target="_blank" title="VK">VK</a>
</div>
```

- [ ] **Шаг 3: Проверить на мобильном**

В Chrome DevTools нажми Ctrl+Shift+M (режим мобильного устройства).
Открой `http://localhost:8080/studio/` — три кнопки должны быть видны в правом нижнем углу.

- [ ] **Шаг 4: Финальный коммит**

```bash
cd ~/Documents/AI
git add css/style.css index.html studio/index.html school/pm/index.html
git commit -m "feat: add floating messenger buttons for mobile"
```

---

## Чеклист перед запуском

- [ ] Вставлен токен Telegram бота в `js/booking.js`
- [ ] Вставлен chat_id в `js/booking.js`
- [ ] Вставлены реальные ссылки мессенджеров (TG, Макс, VK)
- [ ] Вставлена ссылка YClients
- [ ] Протестирована отправка формы — сообщение пришло в Telegram
- [ ] Проверен мобильный вид (Chrome DevTools)
