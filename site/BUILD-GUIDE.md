# AEC Kazakhstan — гайд по сборке страниц прототипа

Прототип нового сайта aecups.kz (ИБП, ДГУ, АКБ, стабилизаторы; B2B, Казахстан). Многостраничный статический прототип, который потом переносится в тему WordPress + WooCommerce. Язык контента: русский. Стиль: деловой, инженерный, без перегруза. Всё строится на общей дизайн-системе, ничего не изобретать заново.

## Файлы
- `assets/aec.css` — дизайн-система (токены, кнопки, карточки, таблицы, формы, табы, аккордеон, drawer, модалка, шапка/подвал, hero страниц). Не править без необходимости; страничные стили писать в `<style>` самой страницы, используя токены `var(--navy)`, `var(--blue)`, `var(--amber)`, `var(--ink)`, `var(--text)`, `var(--muted)`, `var(--line)`, `var(--mist)`, `var(--paper)`, `var(--r)`, `var(--font-display)`, `var(--font-body)`.
- `assets/data.js` → `window.AEC`: `CONTACT, CATEGORIES, INDUSTRIES, SERVICES, BRANDS, PRODUCTS, PROJECTS, CLIENTS, ARTICLES, FAQ, CITIES, TEAM, fmtPrice(p), unit(cat), byId(id), bySlug(slug), cat(id)`.
- `assets/aec.js` → `window.AECUI`: `init({active})` (рендерит шапку, мобильное меню, нижнюю панель, подвал, модалку заявки, reveal, счётчики), `icon(name)`, `art(key)` (иллюстрации: rack, tower, modular, genset, container, battery, cell, stab, sts), `L` (ссылки), `KP` (запрос КП: items/add/setQty/remove/clear/count), `CMP` (сравнение: items/toggle/has), `FAV`, `toast(msg, href, label)`, `openModal({title, sub, product, type, comment})`, `bindForm(form, onOk)`, `search(q)` → {products, pages, fixed}, `productCard(p, list)`, `render()`, `crumbs([{name, href}])`, `jsonld(obj)`, `hashParts()`, `fmtDate(iso)`.
- `index.html` — главная, эталон структуры и тона. Посмотреть перед работой.

## Скелет страницы (обязательно)
```html
<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Название страницы | AEC Kazakhstan</title>
<meta name="description" content="...">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geologica:wght@500;600;700&family=Golos+Text:wght@400;500;600&display=swap">
<link rel="stylesheet" href="assets/aec.css">
<style>/* стили страницы */</style>
</head>
<body>
<div id="app">
<main> ... </main>
</div>
<script src="assets/data.js"></script>
<script src="assets/aec.js"></script>
<script>
(function(){ const D = AEC, U = AECUI, I = U.icon, L = U.L; U.init({ active: 'catalog' /* catalog|services|projects|calc|company */ }); /* рендер */ })();
</script>
</body>
</html>
```
`U.init` вставляет шапку в начало `#app` и подвал в конец. Всё содержимое страницы кладётся в `<main>` внутри `#app`.

## Ссылки между страницами (только через `U.L`)
`L.home`, `L.cat(catId, sub?)` → `catalog.html#ibp.tryohfaznye`, `L.product(slug)` → `product.html#slug`, `L.solution(id)`, `L.service(id)`, `L.projects`, `L.project(id)`, `L.brands`, `L.brand(id)`, `L.about`, `L.contacts`, `L.blog`, `L.article(index)`, `L.faq`, `L.docs`, `L.calc`, `L.kp`, `L.compare`, `L.fav`, `L.search`, `L.thanks`, `L.region(slug)`, `L.certs`, `L.exhibitions`, `L.policy`, `L.terms`, `L.offer`, `L.warranty`.
Состояние страницы передаётся через hash: части через точку, только латиница, цифры, дефис. Пример фильтров каталога: `#ibp.tryohfaznye.kva-20.brand-salicru`. Страница должна слушать `hashchange` и перерисовываться, а при пустом hash показывать разумное значение по умолчанию (первый элемент). `document.title` и meta description обновлять по состоянию.

## Компоненты и классы
- Сетка: `.wrap`, `.section`, `.section-tight`, `.bg-mist`, `.bg-navy`, `.grid.g2/.g3/.g4`, `.split`, `.sec-head` (h2 + p + `.more`).
- Hero страницы: `<section class="page-hero"><div class="grid-bg"></div><div class="wrap">crumbs + h1 + p.lead + .cta</div></section>`; вариант с иллюстрацией справа: `.page-hero-grid` + `.art`.
- Кнопки: `.btn .btn-primary` (синяя, основное действие), `.btn-kp` (оранжевая, «Запросить КП/цену»), `.btn-ghost`, `.btn-light`, `.btn-outline-light`, `.btn-wa`, размеры `.btn-sm/.btn-lg/.btn-block`, иконка-кнопка `.btn-icon` (+ `.on`).
- Карточка товара: `U.productCard(p, isList)` — уже содержит кнопки «Запросить цену» (`data-quote`), «В запрос КП» (`data-kp`), «Сравнить» (`data-cmp`), избранное (`data-fav`). Делегирование событий уже в `U.init`, ничего навешивать не нужно.
- Открыть модалку заявки: любая кнопка с `data-open-modal data-title="..." data-type="..." data-product="..." data-sub="..."`.
- Форма на странице: `<form data-lead novalidate>` с полями `.field > label + .input/.select/.textarea + .hint`, телефон `data-mask`, чекбокс `.check`; после сабмита переход на `thanks.html`.
- Чипы `.chip` (с кнопкой-крестиком), бейджи `.badge .badge-amber .badge-navy`, статусы `.stock.stock-in/.stock-order/.stock-eol`.
- Таблица характеристик `.spec` (строки-группы `<tr class="grp"><td colspan=2>`), таблица списка `.tbl` (обёртка `.tbl-wrap`).
- Табы `.tabs > button.on` + `.tab-panel.on`; аккордеон `.acc > details > summary + .pm(иконка plus) + .acc-body`.
- Шаги процесса `.steps > li` (нумерация автоматическая; только для реальных последовательностей).
- Цифры `.stats`, список с иконками `.icon-list`, CTA-блок `.cta-band` (navy, с формой справа), заметка `.note`, пагинация `.pager`, логотипы `.logo-row`.
- Иконки: категорий `ups genset battery stab sts rect inv freq trafo ips`; отраслей `server med factory oil building cnc alarm antenna`; услуг `wrench shield repair battery gauge search ruler`; прочие `phone wa search kp compare heart menu close chev arrow check plus file download mail pin clock youtube instagram bolt truck warehouse team doc award`.

## Правила контента и SEO (закладываем в прототип)
- Один H1 на страницу с ключевой фразой кластера; хлебные крошки `U.crumbs([...])` сразу под шапкой (в hero страницы).
- Короткий вводный текст (2–3 строки) вверху, развёрнутый SEO-текст (3–5 абзацев с подзаголовками h2/h3) внизу страницы, выше финальной формы.
- Блок FAQ (3–6 вопросов, `.acc`) на категориях, фильтр-страницах, услугах, отраслях + `U.jsonld({FAQPage})`.
- Перелинковка: категория → подкатегории и фильтр-страницы → товары; товар → серия, бренд, сопутствующие, услуги; услуга → категории и проекты; отрасль → серии, проекты, услуги; регион → категории, услуги, проекты в городе.
- Микроразметка через `U.jsonld`: BreadcrumbList везде; Product (+Brand, sku, offers c price или «priceSpecification» при цене «от») на товаре; ItemList на категории; Service на услугах; Article на статьях; Organization уже на главной.
- Цены: `D.fmtPrice(p.price)` → «от 1 290 000 ₸» или «Цена по запросу». Склад: `p.stock === 'in'` → «В наличии в Алматы», иначе «Под заказ · срок».
- На каждой странице должна быть точка контакта: кнопка «Запросить КП» и/или форма; WhatsApp и телефон уже в шапке/нижней панели.
- Тексты: по-русски, конкретно, без воды и маркетинговых штампов, без тире-«эм» (используйте запятые и двоеточия), без lorem ipsum. Реальные модели и серии из `AEC.PRODUCTS`. Цифры, которых нет в данных, не выдумывать: писать «уточняется у заказчика» нельзя в UI, лучше просто не показывать.
- Казахские буквы должны отображаться (шрифты это поддерживают), но контент на русском.
- Адаптив: от 360 px; таблицы в `.tbl-wrap`; никаких min-width шире экрана. Нижняя мобильная панель уже есть, её не дублировать.
- Движение: только по действию пользователя (открытие, фильтрация) и один reveal-момент максимум; не вешать hover-анимации на всё подряд.

## Проверка
Локальный сервер: `cd site && python3 -m http.server 8765`. Скриншоты: `python3 ../tools/shot.py http://localhost:8765/page.html ../shots/page.png 1440 900 full` и `... 390 844 full` (в выводе: scrollWidth должен равняться viewport; ошибки консоли, кроме ERR_TUNNEL_CONNECTION_FAILED на шрифты, недопустимы). Проверка переполнения: `python3 ../tools/overflow.py http://localhost:8765/page.html 390` (игнорировать элементы внутри `.mmenu`).
