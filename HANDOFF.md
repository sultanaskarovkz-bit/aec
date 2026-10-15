# AEC Kazakhstan (aecups.kz): прототип нового сайта. Передача в Claude Code

## Что это
Статический HTML-прототип нового сайта ТОО «AEC Kazakhstan» (ИБП, ДГУ, АКБ, стабилизаторы; Алматы).
24 страницы, общая дизайн-система, реальный каталог WooCommerce (602 позиции с фото и PDF), калькулятор подбора, корзина КП,
сравнение, избранное, поиск, SEO-разметка (title/description/H1 на каждое состояние, JSON-LD, хлебные крошки).
Дальше прототип переносится в WordPress + WooCommerce (кастомная тема), текущий сайт на Bricks Builder.

## Структура
- site/                 сам сайт, открывать через локальный сервер (hash-роутинг, fetch не нужен)
  - index.html          главная (слайдер, линейки, отрасли, сервис, проекты, компания, новости, контакты)
  - catalog.html        каталог с фильтрами по атрибутам, состояние в hash: #ibp.tryohfaznye.kva-20
  - product.html        карточка товара: #slug
  - solution.html       8 отраслевых решений: #czod | med | prom | oil | office | machines | emergency | telecom
  - service.html        7 услуг: #montazh | service | remont | zamena | diagnostika | obsledovanie | konsultaciya
  - projects.html, project.html#id, brands.html, brand.html#id, about.html (#certs, #exhibitions),
    contacts.html, blog.html, article.html#i, faq.html, docs.html, region.html#slug (12 городов),
    calc.html (#ibp.kw18.min30), kp.html, compare.html, favorites.html, search.html, legal.html, thanks.html, 404.html
  - assets/aec.css      дизайн-система: токены (navy #0a2540, blue #0066cc, amber #d97706), шрифт IBM Plex Sans,
                        шапка с мега-меню во всю ширину, кнопки, карточки, формы, подвал
  - assets/pages.css    стили внутренних страниц
  - assets/aec.js       window.AECUI: header/footer, img() с заглушкой, корзина КП/сравнение/избранное (localStorage),
                        модалка заявки, маска телефона, поиск с исправлением раскладки, JSON-LD, хлебные крошки
  - assets/data.js      window.AEC: контакты, категории, отрасли, услуги, бренды (с логотипами), проекты, выставки,
                        отзывы, сертификаты, логотипы клиентов, статьи (с обложками), FAQ, города, команда (с фото).
                        PRODUCTS собирается из assets/catalog.js (window.AEC_CATALOG), не генерируется.
  - assets/catalog.json полный каталог: 602 товара aecups.kz с атрибутами, таблицами характеристик, фото, PDF, исходными
                        данными WooCommerce (id, slug, permalink, категории). Источник правды для переноса в WP.
  - assets/catalog.js   компактная версия каталога для всех страниц (547 КБ); catalog-details.js: таблицы характеристик,
                        описания и wc-данные по id, подключается только на product.html
  - assets/img/products/ 132 фото товаров (уникальные файлы, имя файла как в медиатеке; связь товар -> файл в catalog.json)
  - assets/docs/        100 PDF-спецификаций (161 МБ), ссылки в catalog.json docs[].file. В Vercel-превью не выкладываются.
  - assets/calc-page.js калькулятор (4 режима, Пекерт, батарейные стринги, подбор серий)
  - assets/i18n.js      переключатель языков RU/KZ/EN (topline шапки и мобильное меню). Язык из localStorage aecLang
                        или ?lang=; подключает только нужный словарь i18n-kz.js / i18n-en.js (window.AEC_I18N), переводит
                        текстовые узлы и атрибуты (placeholder, title, alt, data-title/sub, content, value) по точному
                        совпадению и по шаблонам с числами, MutationObserver на DOM, document.title, html lang = ru/kk/en.
                        НЕ переводятся (первый этап): статьи (#body.article), описания и таблицы 602 товаров,
                        названия моделей, отзывы. Для WP-этапа: Polylang/WPML, словари как основа.
  - assets/images.json  манифест: имя файла в assets/img/ -> URL оригинала на aecups.kz (87 слотов)
  - assets/img/         фото сайта; cat-<id>-photo.jpg — фото категорий (gpes/zvu/inv/freq/trafo/ips взяты с сайтов AGG Power и Tescom,
                        источники в crawl/client-request.md; нужно подтверждение клиента). img() рисует заглушку через onerror
  - BUILD-GUIDE.md      соглашения по страницам и SEO-правила
- tools/
  - fetch-images.sh     скачивает все файлы из images.json в site/assets/img (curl)
  - crawl-products.py   обходит страницы товаров aecups.kz и собирает ссылки на PDF -> crawl/woo/pages.json
  - build-catalog.py    собирает catalog.json / catalog.js / catalog-details.js из crawl/woo/*, скачивает PDF в assets/docs
  - optimize-images.py  приводит к веб-размеру (PIL): max 1600px, JPEG q82, логотипы до 600px
  - shot.py             скриншот страницы (Playwright): python3 tools/shot.py URL out.png 1440 900 no [scrollY]
  - links.py            обход всех страниц: битые внутренние ссылки + ошибки JS
  - overflow.py         поиск горизонтального переполнения на мобильной ширине
  - i18n-extract.py     сбор русских строк со всех страниц (Playwright) -> crawl/i18n-strings-2.json
  - i18n-check.py N     проверка выравнивания crawl/i18n/ru-N.json с en-N.json / kz-N.json (одинаковая длина, числа)
  - i18n-build.py       сборка site/assets/i18n-kz.js и i18n-en.js из crawl/i18n/ru-*.json + en-*/kz-*.json
- crawl/i18n/              словари: ru-N.json (исходные строки) + en-N.json, kz-N.json (массивы в том же порядке), 12 блоков, ~3000 строк
- crawl/site-inventory.md  инвентаризация текущего aecups.kz: URL, объёмы каталога, контакты, ошибки
- crawl/client-request.md  что запросить у клиента (нет на сайте): вектор логотипа, фото офиса, TEOS, 89 товаров без фото и т.д.
- crawl/woo/               выгрузка Store API (products-N.json, categories.json), pages.json (PDF по товарам), posts.json, pdf-media.json
- dist/index.html       копия главной без doctype/head для публикации артефактом (не нужна в проекте)

## Как запустить
cd site && python3 -m http.server 8765   # затем http://localhost:8765/index.html
Публичное превью: https://aecups-prototype.vercel.app (проект aecups-prototype, деплой: cd site && vercel deploy --prod; PDF исключены .vercelignore)
Репозиторий: https://github.com/sultanaskarovkz-bit/aec
Шрифт грузится с Google Fonts; офлайн в tools/shot.py есть локальный @font-face (site/_dev/fonts не входит в сборку).

## Фото: состояние
Все 159 слотов images.json скачаны и оптимизированы (tools/optimize-images.py, max 1600 px, товары 1200 px).
Фото команды, логотипы брендов и фото POWER EXPO 2024 на сайте были, HANDOFF ранее ошибался. Чего нет: см. crawl/client-request.md.

## Каталог
Реальные данные: 607 товаров Store API -> 602 после удаления дублей (ИБП 233, АКБ 198, стабилизаторы 124, STS 25, ДГУ 22 серии).
Пересборка: python tools/build-catalog.py (--no-download, если PDF уже на месте). Обновить выгрузку:
  curl "https://aecups.kz/wp-json/wc/store/v1/products?per_page=100&page=N" -o crawl/woo/products-N.json; python tools/crawl-products.py
Поля товара: id (w+wcId), slug, name, model, sku, brand/brandId (= /brand/<slug>/ текущего сайта), cat, series, sub[],
kva/kw (у ДГУ kva…kvaMax диапазон серии), phases, topology, form, arch, pf, eff, battery, interfaces, ip, dims, weight,
photo/photos (assets/img/products/), docs[{name,file,size}], spec{} (нормализованные ключи для UI), industries[].
В catalog-details.js: table (полная таблица характеристик), desc, short, wc {id, slug, permalink, categories, tags}.
Нет в данных: цены, остатки (везде stock 'order'), гарантия, габариты у Kehua/EverExceed/TSVR (185 позиций).

## SEO
План SEO (15 разделов, 15 запросов из договора, структура URL, фильтровые посадочные, регионы) лежит в Claude Docs:
https://claude.ai/artifact/T8PFxTuMUWEhsmj3vm29n3
URL категорий текущего сайта сохранить (product-category/..., uslugi/..., brand/...), остальное редиректить 301.
