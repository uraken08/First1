#!/usr/bin/env python3
"""Добавляет JSON-LD блоки в <head> по типам страниц.

Маппинг типа страницы → набор schema-блоков задан в SCHEMA_MAP.
Идемпотентно (повторный запуск обновляет существующий блок).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "tools" / "seo"))
from PAGES import (  # noqa: E402
    PAGES, SITE_URL, SITE_BRAND, SITE_OWNER,
    ADDRESS, GEO, PHONE, OPENING_HOURS, RATING, SAME_AS, LOGO_URL,
)

START = "<!-- SEO:schema:start -->"
END = "<!-- SEO:schema:end -->"


def organization() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_BRAND,
        "alternateName": "Agent Permanent by Arina Sharapova",
        "url": SITE_URL + "/",
        "logo": LOGO_URL,
        "founder": {"@type": "Person", "name": SITE_OWNER},
        "address": {"@type": "PostalAddress", **ADDRESS},
        "telephone": PHONE,
        "sameAs": SAME_AS,
    }


def beauty_salon(with_rating: bool) -> dict:
    out = {
        "@context": "https://schema.org",
        "@type": "BeautySalon",
        "name": SITE_BRAND,
        "image": SITE_URL + "/og-image-studio.jpg",
        "@id": SITE_URL + "/#salon",
        "url": SITE_URL + "/",
        "telephone": PHONE,
        "priceRange": "₽₽",
        "address": {"@type": "PostalAddress", **ADDRESS},
        "geo": {"@type": "GeoCoordinates", **GEO},
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "10:00",
            "closes": "21:00",
        }],
        "sameAs": SAME_AS,
    }
    if with_rating:
        out["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": RATING["value"],
            "reviewCount": RATING["count"],
            "bestRating": "5",
            "worstRating": "1",
        }
    return out


def course(name: str, description: str, course_url: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": name,
        "description": description,
        "url": SITE_URL + course_url,
        "provider": {
            "@type": "EducationalOrganization",
            "name": "Академия Agent Permanent",
            "url": SITE_URL + "/school/",
            "sameAs": SAME_AS,
        },
        "educationalCredentialAwarded": "Государственный диплом мастера ПМ",
        "courseMode": "blended",
        "inLanguage": "ru",
    }


def educational_organization() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Академия Agent Permanent",
        "url": SITE_URL + "/school/",
        "logo": LOGO_URL,
        "address": {"@type": "PostalAddress", **ADDRESS},
        "sameAs": SAME_AS,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": RATING["value"],
            "reviewCount": RATING["count"],
            "bestRating": "5",
            "worstRating": "1",
        },
    }


def breadcrumb(items: list) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": name,
                "item": SITE_URL + url,
            }
            for i, (name, url) in enumerate(items)
        ],
    }


# Маппинг: тип страницы → список schema-объектов
SCHEMA_MAP = {
    "homepage": lambda: [
        beauty_salon(with_rating=True),
        organization(),
    ],
    "studio": lambda: [
        beauty_salon(with_rating=True),
        breadcrumb([("Главная", "/"), ("Студия", "/studio/")]),
    ],
    "academy_hub": lambda: [
        educational_organization(),
        breadcrumb([("Главная", "/"), ("Академия", "/school/")]),
    ],
    "course_pm": lambda: [
        course(
            name="Курс перманентного макияжа",
            description="Полный базовый курс мастера ПМ: брови, губы, межресничка. Государственный диплом, гибридный формат — теория онлайн, практика очно в Москве.",
            course_url="/school/pm/",
        ),
        breadcrumb([("Главная", "/"), ("Академия", "/school/"), ("Курс ПМ", "/school/pm/")]),
    ],
    "course_brows": lambda: [
        course(
            name="Курс по перманентному макияжу бровей",
            description="Авторская методика Арины Шараповой: пудровое напыление, акварель, волосковая техника. Гибридный формат, диплом.",
            course_url="/school/brows/",
        ),
        breadcrumb([("Главная", "/"), ("Академия", "/school/"), ("Курс по бровям", "/school/brows/")]),
    ],
    "portfolio": lambda: [
        beauty_salon(with_rating=True),
        breadcrumb([("Главная", "/"), ("Портфолио", "/portfolio/")]),
    ],
    "about": lambda: [
        organization(),
        breadcrumb([("Главная", "/"), ("О бренде", "/about/")]),
    ],
    "contacts": lambda: [
        beauty_salon(with_rating=True),
        breadcrumb([("Главная", "/"), ("Контакты", "/contacts/")]),
    ],
    "legal": lambda: [
        breadcrumb([("Главная", "/"), ("Конфиденциальность", "/privacy/")]),
    ],
}


def build_block(page_type: str) -> str:
    schemas = SCHEMA_MAP[page_type]()
    blocks = []
    for s in schemas:
        body = json.dumps(s, ensure_ascii=False, indent=2)
        blocks.append(f'<script type="application/ld+json">\n{body}\n</script>')
    inner = "\n".join(blocks)
    return f"{START}\n{inner}\n{END}"


def inject(rel_path: str, block: str) -> bool:
    path = ROOT / rel_path
    if not path.exists():
        print(f"  ⚠  {rel_path} not found")
        return False
    content = path.read_text(encoding="utf-8")
    if START in content and END in content:
        pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.DOTALL)
        content = pattern.sub("__SCHEMA_PH__", content)
        new_content = content.replace("__SCHEMA_PH__", block)
    else:
        if "</head>" not in content:
            return False
        new_content = content.replace("</head>", f"  {block}\n</head>", 1)
    if new_content != path.read_text(encoding="utf-8"):
        path.write_text(new_content, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for rel_path, url_path, page_type, _, _ in PAGES:
        if page_type not in SCHEMA_MAP:
            print(f"  ⚠  unknown page_type {page_type}, skip")
            continue
        block = build_block(page_type)
        if inject(rel_path, block):
            print(f"  ✓ {rel_path}")
            changed += 1
        else:
            print(f"    {rel_path} (no change)")
    print(f"\n{changed}/{len(PAGES)} pages updated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
