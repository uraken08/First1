#!/usr/bin/env python3
"""Генератор sitemap.xml из списка PAGES.

Запуск:  python3 tools/seo/generate_sitemap.py
Output:  sitemap.xml в корне проекта
"""
import os
import sys
import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "seo"))
from PAGES import PAGES, SITE_URL  # noqa: E402


def file_lastmod(rel_path: str) -> str:
    """Возвращает дату последней модификации файла в формате YYYY-MM-DD.

    Raises FileNotFoundError if the file does not exist — this catches
    typos/missing entries in PAGES.py instead of silently using today's date.
    """
    p = ROOT / rel_path
    if not p.exists():
        raise FileNotFoundError(f"PAGES.py references non-existent file: {rel_path}")
    ts = datetime.datetime.fromtimestamp(p.stat().st_mtime)
    return ts.date().isoformat()


def build_sitemap() -> str:
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for rel_path, url_path, _, _, _ in PAGES:
        url = SITE_URL + url_path
        lastmod = file_lastmod(rel_path)
        # Главная — приоритет 1.0, посадочные — 0.9, остальные — 0.7, privacy — 0.3
        if url_path == "/":
            priority = "1.0"
            changefreq = "weekly"
        elif "/school/" in url_path or url_path == "/studio/":
            priority = "0.9"
            changefreq = "weekly"
        elif url_path == "/privacy/":
            priority = "0.3"
            changefreq = "yearly"
        else:
            priority = "0.7"
            changefreq = "monthly"
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def main() -> int:
    out = build_sitemap()
    target = ROOT / "sitemap.xml"
    target.write_text(out, encoding="utf-8")

    # Self-check
    assert "<urlset" in out, "sitemap missing urlset"
    assert out.count("<url>") == len(PAGES), f"sitemap urls != PAGES count"
    print(f"✓ sitemap.xml: {len(PAGES)} URLs → {target}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
