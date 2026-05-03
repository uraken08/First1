#!/usr/bin/env python3
"""Заполняет пустые alt="" в portfolio/index.html осмысленным текстом
на основе пути файла.

Шаблон:  "<Услуга в им.падеже> — работа <Мастер>, Agent Permanent, Москва"

Пример пути: ../Фото/Работы/Арина/Брови/img_1474.png
  → услуга: брови → "Перманент бровей"
  → мастер: Арина → "Арина Шарапова"
  → alt:    "Перманент бровей — работа Арины Шараповой, Agent Permanent, Москва"
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

# словарь "путь→название услуги в человеческом виде"
SERVICE_BY_FOLDER = {
    "Брови": "Перманент бровей",
    "Губы": "Перманент губ",
    "Все лицо": "Перманентный макияж",
    "Межресничка": "Перманентный макияж — межресничка",
    "Удаления": "Удаление перманентного макияжа",
    "Удаление": "Удаление перманентного макияжа",
    "Стрелки": "Перманентный макияж — межресничка",
}

# словарь "имя в пути → ФИО мастера"
MASTER_BY_FOLDER = {
    "Арина": "Арины Шараповой",
    "Вика": "мастера Виктории",
    "Ученики": "мастеров Академии Agent Permanent",
}


def alt_for(src: str) -> str:
    # src вида "../Фото/Работы/Арина/Брови/img_1474.png"
    # делим по / и ищем известные сегменты
    parts = src.split("/")

    master = None
    service = None
    for i, p in enumerate(parts):
        if p in MASTER_BY_FOLDER:
            master = MASTER_BY_FOLDER[p]
        if p in SERVICE_BY_FOLDER:
            service = SERVICE_BY_FOLDER[p]

    if not service:
        service = "Перманентный макияж"
    if not master:
        master = "Арины Шараповой"

    return f"{service} — работа {master}, Agent Permanent, Москва"


def main() -> int:
    target = ROOT / "portfolio" / "index.html"
    if not target.exists():
        print(f"  ⚠  {target} not found")
        return 1

    content = target.read_text(encoding="utf-8")

    # Находим все <img ... src="..." ... alt="" ...> с пустыми alt
    # и заполняем их.
    # Тег <img>: src и alt могут идти в любом порядке. Используем
    # двухпроходный подход: ищем все <img>, парсим атрибуты.

    pattern = re.compile(r'<img\s+([^>]*?)>', re.DOTALL)
    fixed = 0

    def replace_img(match: re.Match) -> str:
        nonlocal fixed
        attrs = match.group(1)
        src_match = re.search(r'src="([^"]+)"', attrs)
        alt_match = re.search(r'alt="([^"]*)"', attrs)
        if not src_match or not alt_match:
            return match.group(0)
        # обновляем только пустые alt
        if alt_match.group(1).strip() != "":
            return match.group(0)
        src_val = src_match.group(1)
        # пропускаем внешние URL (трекинговые пиксели и т.п.)
        if src_val.startswith("http://") or src_val.startswith("https://"):
            return match.group(0)
        new_alt = alt_for(src_val)
        new_attrs = re.sub(r'alt="[^"]*"', f'alt="{new_alt}"', attrs, count=1)
        fixed += 1
        return f'<img {new_attrs}>'

    new_content = pattern.sub(replace_img, content)

    if new_content != content:
        target.write_text(new_content, encoding="utf-8")
    print(f"  ✓ portfolio/index.html: {fixed} alt-tags filled")
    return 0


if __name__ == "__main__":
    sys.exit(main())
