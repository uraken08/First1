# SEO tools

Набор Python-скриптов для технического SEO. Все скрипты:
- идемпотентны (повторный запуск не дублирует тегов)
- читают единый список страниц из `PAGES.py`
- запускаются вручную перед деплоем

## Скрипты

| Скрипт | Что делает |
|---|---|
| `generate_sitemap.py` | пишет `sitemap.xml` в корень |
| `inject_canonical_og.py` | добавляет canonical + OpenGraph + Twitter Card в `<head>` |
| `inject_schema.py` | добавляет JSON-LD blocks (Organization, BeautySalon, Course, BreadcrumbList) |
| `update_titles.py` | переписывает `<title>` и `<meta name="description">` |
| `fix_alt_tags.py` | заполняет пустые `alt=""` в `portfolio/index.html` |
| `smoke_test.sh` | проверка что всё на месте (запуск перед деплоем) |
| `run_all.sh` | запускает все генераторы по порядку |

## Запуск

```bash
python3 tools/seo/run_all.sh   # обновить все теги
bash tools/seo/smoke_test.sh   # проверить
```
