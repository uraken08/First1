#!/usr/bin/env python3
"""Добавляет canonical + OpenGraph + Twitter Card в <head> каждой production-страницы.

Идемпотентно: при повторном запуске обновляет существующий блок (помеченный
HTML-комментарием SEO:canonical_og), а не дублирует его.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "seo"))
from PAGES import PAGES, SITE_URL  # noqa: E402

START = "<!-- SEO:canonical_og:start -->"
END = "<!-- SEO:canonical_og:end -->"


def og_image_for(page_type: str) -> str:
    """Выбор og:image по типу страницы."""
    if page_type in ("course_pm", "course_brows", "academy_hub"):
        return SITE_URL + "/og-image-academy.jpg"
    return SITE_URL + "/og-image-studio.jpg"


def og_type_for(page_type: str) -> str:
    """Возвращает 'website' (Course schema обработана отдельно)."""
    return "website"


def build_block(rel_path: str, url_path: str, page_type: str, title: str, description: str) -> str:
    canonical_url = SITE_URL + url_path
    og_image = og_image_for(page_type)
    og_type = og_type_for(page_type)
    return f"""{START}
  <link rel="canonical" href="{canonical_url}">
  <meta property="og:type" content="{og_type}">
  <meta property="og:site_name" content="Agent Permanent">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:url" content="{canonical_url}">
  <meta property="og:title" content="{title}">
  <meta property="og:description" content="{description}">
  <meta property="og:image" content="{og_image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{title}">
  <meta name="twitter:description" content="{description}">
  <meta name="twitter:image" content="{og_image}">
  {END}"""


def inject(rel_path: str, block: str) -> bool:
    """Вставляет блок перед </head>. Если уже был — заменяет.
    Возвращает True если файл изменился."""
    path = ROOT / rel_path
    if not path.exists():
        print(f"  ⚠  {rel_path} not found — skip")
        return False
    content = path.read_text(encoding="utf-8")
    original_content = content

    # Если уже есть наш блок — удаляем (чтобы заменить)
    if START in content and END in content:
        pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.DOTALL)
        content = pattern.sub("__SEO_PLACEHOLDER__", content)
        new_content = content.replace("__SEO_PLACEHOLDER__", block)
    else:
        # Вставляем перед </head>
        if "</head>" not in content:
            print(f"  ⚠  {rel_path} no </head> — skip")
            return False
        new_content = content.replace("</head>", f"  {block}\n</head>", 1)

    if new_content != original_content:
        path.write_text(new_content, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for rel_path, url_path, page_type, title, description in PAGES:
        # blog_post страницы имеют свой богатый блок canonical+og с article:*
        # meta (published_time, author, section, tag) — наш стандартный
        # шаблон беднее, поэтому статьи мы не трогаем. Управляются вручную.
        if page_type == "blog_post":
            print(f"    {rel_path} (skip: blog_post has manual canonical+og block)")
            continue
        block = build_block(rel_path, url_path, page_type, title, description)
        if inject(rel_path, block):
            print(f"  ✓ {rel_path}")
            changed += 1
        else:
            print(f"    {rel_path} (no change)")
    print(f"\n{changed}/{len(PAGES)} pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
