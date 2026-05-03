#!/usr/bin/env python3
"""Заменяет существующие <title> и <meta name="description"> на оптимизированные
под локальные ключи. Берёт значения из PAGES.

Идемпотентно: при повторном запуске не плодит лишние теги, просто перезаписывает.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "seo"))
from PAGES import PAGES  # noqa: E402


def replace_title(content: str, new_title: str) -> str:
    return re.sub(
        r"<title>.*?</title>",
        f"<title>{new_title}</title>",
        content,
        count=1,
        flags=re.DOTALL,
    )


def replace_description(content: str, new_description: str) -> str:
    pattern = re.compile(
        r'<meta\s+name="description"\s+content="[^"]*"\s*/?>',
        re.IGNORECASE,
    )
    new_meta = f'<meta name="description" content="{new_description}">'
    if pattern.search(content):
        return pattern.sub(new_meta, content, count=1)
    # если description нет — вставим перед </head>
    return content.replace("</head>", f"  {new_meta}\n</head>", 1)


def main() -> int:
    changed = 0
    for rel_path, _, _, title, description in PAGES:
        path = ROOT / rel_path
        if not path.exists():
            continue
        content = path.read_text(encoding="utf-8")
        original = content
        content = replace_title(content, title)
        content = replace_description(content, description)
        if content != original:
            path.write_text(content, encoding="utf-8")
            print(f"  ✓ {rel_path}")
            changed += 1
    print(f"\n{changed}/{len(PAGES)} pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
