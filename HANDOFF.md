# AEC Kazakhstan (aecups.kz): прототип нового сайта. Передача в Claude Code

## Что это
Статический HTML-прототип нового сайта ТОО «AEC Kazakhstan» (ИБП, ДГУ, АКБ, стабилизаторы; Алматы).
24 страницы, общая дизайн-система, реальный каталог WooCommerce (602 позиции с фото и PDF), калькулятор подбора, корзина КП,
сравнение, избранное, поиск, SEO-разметка (title/description/H1 на каждое состояние, JSON-LD, хлебные крошки).
Дальше прототип переносится в WordPress + WooCommerce (кастомная тема), текущий сайт на Bricks Builder.

## Структура
- site/                 сам сайт, открывать через локальный сервер (hash-роутинг, fetch не нужен)
  - index.html          главная (редизайн 27.10.2026), логика в assets/home.js. Библиотеки локально в assets/vendor:
                        GSAP 3.13 + ScrollTrigger + SplitText, Lenis 1.3 (плавная прокрутка только для мыши; на сенсорных
                        экранах родная прокрутка). Загрузочного экрана нет (убран 28.10.2026 по просьбе клиента); вся главная
                        светлая, тёмный только первый экран с анимацией (клиенту не нравится тёмный тон).
                        Первый экран: сцена из готовых слоёв-картинок (SVG -> data:image), в сценарии меняются только
                        opacity и transform. Слои: дымка и дальний хребет с телебашней, ветряки с роторами, город с
                        высотками, подстанция, деревья, фонари, дорога (птицы и ветер убраны 28.10.2026 по просьбе клиента).
                        Сценарий не привязан к прокрутке: запускается кнопкой «Что происходит при аварии» (#cue) и идёт
                        10 секунд сам (gsap.timeline, window.__aec.tl); кнопки «Сначала»/«Закрыть» (#scCtl), закрытие =
                        ускоренная перемотка назад. Страница прокручивается обычно, без закрепления. Сценарий: день -> ночь,
                        грозовой фронт и дождь -> молния в подстанцию (вспышка, тряска камеры, мигание окон) -> город гаснет,
                        защищённые объекты горят (клиника, ЦОД, производство) -> дизель-генератор -> сеть восстановлена.
                        Панель напряжения (#hud) показывает сеть/объект и источник. Состояние сцены в объекте S (home.js),
                        applyScene() переносит его в стили. На телефонах часть слоёв отключена (small/mobile в buildScene).
                        Дальше: лента заказчиков (логотипы цветные), «Как мы работаем» с этапами (синусоида убрана по просьбе клиента), 12 категорий, бегущие слова,
                        горизонтальная лента проектов (десктоп), отрасли, цифры, сервис, новости, отзывы с картой 2ГИС,
                        контакты. prefers-reduced-motion: без сценария и анимаций. Шрифт только IBM Plex Sans (Condensed
                        убран 28.10.2026), акцент тёмно-синий --accent #0a2540 (оранжевый и голубой убраны по просьбе клиента), на тёмной сцене --volt #4da3ff.
  - catalog.html        каталог с фильтрами по атрибутам, состояние в hash: #ibp.tryohfaznye.kva-20
  - product.html        карточка товара: #slug
  - solution.html       8 отраслевых решений: #czod | med | prom | oil | office | machines | emergency | telecom
  - service.html        7 услуг: #montazh | service | remont | zamena | diagnostika | obsledovanie | konsultaciya
  - projects.html, project.html#id, brands.html, brand.html#id, about.html (#certs, #exhibitions),
    contacts.html, blog.html, article.html#i, faq.html, docs.html, region.html#slug (12 городов),
    calc.html (#ibp.kw18.min30), kp.html, compare.html, favorites.html, search.html, legal.html, thanks.html, 404.html
  - assets/aec.css      дизайн-система: токены (navy #0a2540, blue #0066cc, акцент --accent тёмно-синий #0a2540 вместо оранжевого), шрифт IBM Plex Sans,
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
  - qa-home.py          проверка главной: загрузчик, сценарий по кадрам, секции, наложения и обрезка текста, переполнение,
                        ошибки консоли, FPS. python -X utf8 tools/qa-home.py URL out 390,768,1280,1440,1920 [en|kz]
  - qa-interact.py      живые сценарии: колесо мыши, подсказка, наведение, магнитные кнопки, модалка, меню, reduced motion
  - qa-sheet.py         контактные листы кадров для просмотра
  - qa-site.py          аудит всех страниц: склеенные скриншоты (десктоп и телефон), ошибки, растянутые/обрезанные
                        картинки, текст за границами, ряды карточек разной высоты. python -X utf8 tools/qa-site.py URL out 1440,390
  - qa-catalog.py       симметрия каталога: фото целиком, одинаковая высота карточек, цена и кнопки на одном уровне
  - qa-images.py        обрезанные фото товаров на ~40 страницах
  - qa-smooth.py        плавность прокрутки (кадры, подвисания), телефон с замедленным процессором и десктоп, на видеокарте
  - qa-touch.py         плавность при настоящих свайпах пальцем на телефоне (CDP touch events)
  - qa-trace.py, qa-jsprof.py  трассировка и профиль JS во время прокрутки
  - overflow.py         поиск горизонтального переполнения на мобильной ширине
  - i18n-extract.py     сбор русских строк со всех страниц (Playwright) -> crawl/i18n-strings-2.json
  - i18n-check.py N     проверка выравнивания crawl/i18n/ru-N.json с en-N.json / kz-N.json (одинаковая длина, числа)
  - i18n-build.py       сборка site/assets/i18n-kz.js и i18n-en.js из crawl/i18n/ru-*.json + en-*/kz-*.json
- crawl/i18n/              словари: ru-N.json (исходные строки) + en-N.json, kz-N.json (массивы в том же порядке), 19 блоков, ~3130 строк
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

## Сборка для хостинга (30.10.2026)
Клиент заливает сайт статикой на текущий хостинг aecups.kz (Plesk: nginx + Apache, PHP), WordPress не нужен.
- python -X utf8 tools/build-static.py   → build/aecups.kz/ и build/aecups-kz-<дата>.zip (≈225 МБ с PDF), отчёт build/build-report.md
  (--no-docs без PDF, --no-zip, --only catalog,product для быстрой проверки). build/ в .gitignore.
- python -X utf8 tools/qa-static.py      → битые ссылки, JSON-LD, все старые адреса aecups.kz (200/301/410), браузер 1440/390 через
  php -S + tools/hosting/dev-router.php (повторяет .htaccess), тест формы заявки.
- Как устроено: на каждый адрес старого сайта своя страница (756: категории product-category/..., 602 товара /product/<slug WP>/,
  23 посадочные по мощности из SEO-плана, решения, услуги /uslugi/..., бренды, регионы /regiony/..., статьи /blog/...).
  Страница рендерится в Chromium, в HTML кладутся готовое содержимое #app, title, description, JSON-LD; исходный шаблон лежит
  в <template id="aec-tpl">, aec.js init() возвращает его и рисует страницу заново (тот же код, что в прототипе).
  window.AEC_ROUTE задаёт состояние страницы (вместо хеша), assets/routes.js (генерируется) — таблица адресов,
  aec.js cleanUrl() + MutationObserver переводят все ссылки прототипа (catalog.html#ibp...) в чистые адреса.
  Без routes.js (прототип на Vercel) всё работает по-старому.
- 144 товара с ³ и · в адресе WP лежат в латинских папках, старый адрес отдаётся внутренним RewriteRule (canonical = старый адрес).
- .htaccess: 301 со старых адресов (проекты, выставки, статьи из корня, дубли товаров, корзина/аккаунт, akb → akb-dlya-ibp-ups,
  generatory-2/dizelnye-generatory → generatory-2, ibp-dlya-linii-proizvodstv → promyshlennye-ibp, kt-mrt и операционные → bolnicz),
  410 для таксономий атрибутов, тегов, авторов, лент; старые sitemap → /sitemap.xml.
- Заявки: send.php (Telegram + mail() + leads/leads.csv), настройки send-config.php (tg_token/tg_chat пустые: нужен бот клиента).
  Если сервер не отправил, форма показывает кнопку WhatsApp с готовым текстом. Скрытое поле-ловушка website + лимит 8 заявок / 10 мин.
- Счётчики со старого сайта (GTM-PWB6S7LR, GA4 G-2JLDHHTYCG и G-KHCNKKR87M, Ads AW-17973459473, ClickCease, google-site-verification)
  в head каждой страницы, грузятся после первого действия или через 5 с. События dataLayer: generate_lead, click_phone, click_whatsapp,
  click_email, file_download, add_to_kp, catalog_filter, lead_send_error.
- Инструкция для загрузки: tools/hosting/README-HOSTING.md (кладётся в корень архива, закрыта от просмотра).

## SEO
План SEO (15 разделов, 15 запросов из договора, структура URL, фильтровые посадочные, регионы) лежит в Claude Docs:
https://claude.ai/artifact/T8PFxTuMUWEhsmj3vm29n3
URL категорий текущего сайта сохранить (product-category/..., uslugi/..., brand/...), остальное редиректить 301.
