# Typography System — Agent Permanent School Page

## Задача

Убрать визуальный разнобой шрифтов на странице `/school/pm/index.html`. Сейчас: 4 семейства, 61 уникальный font-size, 26 значений letter-spacing — страница читается как дешёвая. Цель: единая система с ощущением дорогого бренда.

## Финальная система (утверждена)

### Шрифтовые семьи

| Семья | Роль | Где |
|---|---|---|
| **Plus Jakarta Sans** | Заголовки | Все h1–h3, section headings |
| **Raleway** | Body + лейблы | Абзацы, eyebrow, кнопки, плашки |
| **Marcellus** | Дисплейные числа + имя | 120 000₽, цены в карточках, "Арина Шарапова", AGENT PERMANENT |

**Jost, Cormorant Garamond и Italiana — убираются.**

### Параметры

**Plus Jakarta Sans — заголовки:**
- `font-weight: 400`
- `letter-spacing: 0.03em`
- `line-height: 1.05–1.1`

**Raleway — body-текст:**
- `font-weight: 300`
- `letter-spacing: 0.06em`
- `line-height: 1.75–1.8`

**Raleway — лейблы/eyebrow/кнопки:**
- `font-weight: 500–600`
- `letter-spacing: 0.22–0.30em`
- `text-transform: uppercase`

**Marcellus — числа и имя:**
- `font-weight: 400` (единственный доступный)
- Только для: больших чисел, цен, "Арина Шарапова", "AGENT PERMANENT"
- Никакого body-текста в Marcellus

### Убрать курсив везде

Все `font-style: italic` удаляются. Никаких исключений.

## Размерная шкала

Вместо 61 уникального значения — 6 уровней:

| Уровень | Размер | Использование |
|---|---|---|
| Display | `clamp(5rem, 11vw, 11rem)` | Большие числа (120 000₽) |
| H1 | `clamp(2.4rem, 5vw, 5rem)` | Hero-заголовок |
| H2 | `clamp(2rem, 3.5vw, 3.5rem)` | Секционные заголовки |
| H3 | `clamp(1.5rem, 2.2vw, 2rem)` | Карточки, под-заголовки |
| Body | `0.92–1rem` | Основной текст |
| Label | `0.58–0.65rem` | Eyebrow, кнопки, теги |

## Google Fonts строка

```
https://fonts.googleapis.com/css2?family=Marcellus&family=Plus+Jakarta+Sans:wght@400&family=Raleway:wght@300;500;600;700&display=swap
```

## Файлы для изменения

- `/school/pm/index.html` — основная страница
- `/css/style.css` — глобальные стили (переменные шрифтов)
