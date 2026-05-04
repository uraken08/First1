"""Single source of truth: список production-страниц + их метаданные.

Используется генераторами sitemap, canonical/og, schema.org, smoke-тестами.
"""

# Каждая запись: (relative_path, public_url_path, page_type, title_for_og, description_for_og)
PAGES = [
    (
        "index.html", "/",
        "homepage",
        "Перманентный макияж в Москве — Студия Agent Permanent",
        "Студия и академия перманентного макияжа Арины Шараповой. Москва, м. Сокол. 6000+ процедур, 5.0 на Яндекс.Картах, 187 отзывов.",
    ),
    (
        "studio/index.html", "/studio/",
        "studio",
        "Студия перманентного макияжа в Москве — Agent Permanent",
        "Брови, губы, межресничка. Студия Agent Permanent у м. Сокол. Запись онлайн через Яндекс.Карты или сайт.",
    ),
    (
        "school/index.html", "/school/",
        "academy_hub",
        "Академия перманентного макияжа Agent Permanent",
        "Обучение мастеров перманентного макияжа от Арины Шараповой. Гибридный формат: теория онлайн + практика очно в Москве.",
    ),
    (
        "school/pm/index.html", "/school/pm/",
        "course_pm",
        "Обучение перманентному макияжу в Москве — Академия Agent Permanent",
        "Полный курс мастера ПМ: брови, губы, межресничка. Государственный диплом, 200+ выпускниц. Гибрид — теория онлайн + практика 5 дней в Москве.",
    ),
    (
        "school/brows/index.html", "/school/brows/",
        "course_brows",
        "Курс по перманентному макияжу бровей — Академия Agent Permanent",
        "Авторская методика Арины Шараповой: пудровое напыление, акварель, волосковая техника. Гибридный формат, диплом.",
    ),
    (
        "portfolio/index.html", "/portfolio/",
        "portfolio",
        "Портфолио работ — Студия Agent Permanent",
        "Реальные работы мастеров Agent Permanent: брови, губы, межресничка. Москва, 6000+ процедур, рейтинг 5.0 на Яндекс.Картах.",
    ),
    (
        "about/index.html", "/about/",
        "about",
        "О бренде Agent Permanent — Арина Шарапова",
        "История бренда: 10 лет работы, 200+ выпускниц-мастеров, 6000+ выполненных процедур. Студия в Москве и международная академия.",
    ),
    (
        "contacts/index.html", "/contacts/",
        "contacts",
        "Контакты студии Agent Permanent — Москва, м. Сокол",
        "Адрес: Москва, ул. Новопесчанная 6к2. Телефон, Telegram, WhatsApp, ВКонтакте, онлайн-запись через YClients.",
    ),
    (
        "privacy/index.html", "/privacy/",
        "legal",
        "Политика конфиденциальности — Agent Permanent",
        "Положения об обработке персональных данных в соответствии с 152-ФЗ.",
    ),
    (
        "blog/index.html", "/blog/",
        "blog_index",
        "Блог Agent Permanent — статьи о перманентном макияже",
        "Экспертные статьи о перманентном макияже от мастера Арины Шараповой: заживление, уход, выбор техники, ответы на частые вопросы клиентов.",
    ),
    (
        "blog/zazhivlenie-permanentnogo-makiyazha/index.html", "/blog/zazhivlenie-permanentnogo-makiyazha/",
        "blog_post",
        "Как проходит заживление перманентного макияжа по дням",
        "Заживление перманентного макияжа — быстро и спокойно: корочки сходят за 7 дней, финальный цвет — за месяц. Что вы реально увидите по дням, от мастера.",
    ),
]

SITE_URL = "https://agentpermanent.ru"
SITE_BRAND = "Agent Permanent"
SITE_OWNER = "Арина Шарапова"
ADDRESS = {
    "streetAddress": "ул. Новопесчанная, 6к2",
    "addressLocality": "Москва",
    "addressRegion": "Москва",
    "postalCode": "125252",
    "addressCountry": "RU",
}
GEO = {"latitude": 55.801122, "longitude": 37.516653}
PHONE = "+7 (999) 820-04-21"
EMAIL = "ixar.sell@gmail.com"  # для контакт-данных Schema.org
OPENING_HOURS = "Mo-Su 10:00-22:00"
RATING = {"value": "5.0", "count": 187}
SAME_AS = [
    "https://t.me/+79998200421",
    "https://wa.me/79998200421",
    "https://vk.ru/agent_permanent",
    "https://www.instagram.com/sharapova.permanent",
    "https://yandex.com.tr/maps/org/agent_permanent/123024463523/",
]
LOGO_URL = SITE_URL + "/logo_2000x2000.png"
