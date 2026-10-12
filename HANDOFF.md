# AEC Kazakhstan (aecups.kz): прототип нового сайта. Передача в Claude Code

## Что это
Статический HTML-прототип нового сайта ТОО «AEC Kazakhstan» (ИБП, ДГУ, АКБ, стабилизаторы; Алматы).
24 страницы, общая дизайн-система, демо-каталог на 140 позиций, калькулятор подбора, корзина КП,
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
  - assets/data.js      window.AEC: контакты, категории, отрасли, услуги, бренды, товары, проекты, выставки,
                        отзывы, сертификаты, логотипы клиентов, статьи, FAQ, города, команда, карты фото
  - assets/calc-page.js калькулятор (4 режима, Пекерт, батарейные стринги, подбор серий)
  - assets/images.json  манифест: имя файла в assets/img/ -> URL оригинала на aecups.kz (87 слотов)
  - assets/img/         ПУСТО. Сюда кладутся фото; пока их нет, img() рисует светлую заглушку через onerror
  - BUILD-GUIDE.md      соглашения по страницам и SEO-правила
- tools/
  - fetch-images.sh     скачивает все файлы из images.json в site/assets/img (curl)
  - optimize-images.py  приводит к веб-размеру (PIL): max 1600px, JPEG q82, логотипы до 600px
  - shot.py             скриншот страницы (Playwright): python3 tools/shot.py URL out.png 1440 900 no [scrollY]
  - links.py            обход всех страниц: битые внутренние ссылки + ошибки JS
  - overflow.py         поиск горизонтального переполнения на мобильной ширине
- crawl/site-inventory.md  инвентаризация текущего aecups.kz: URL, объёмы каталога, контакты, ошибки
- dist/index.html       копия главной без doctype/head для публикации артефактом (не нужна в проекте)

## Как запустить
cd site && python3 -m http.server 8765   # затем http://localhost:8765/index.html
Шрифт грузится с Google Fonts; офлайн в tools/shot.py есть локальный @font-face (site/_dev/fonts не входит в сборку).

## Фото: что сделать
1. bash tools/fetch-images.sh   (нужен доступ к aecups.kz)
2. python3 tools/optimize-images.py
3. Проверить, что заглушки пропали: главная, projects, project#ktz, about, brand#salicru, solution#czod.
Чего нет на текущем сайте (запросить у клиента): фото команды (8 человек), обложки видео (video-*.jpg),
фото ИБП Kehua и Tescom TEOS, логотип в векторе, фото офиса/склада.
Слоты, которые ждут файлы, перечислены в images.json; названия слотов используются в data.js
(PROJECTS[].photos, EXHIBITIONS[].photos, CERTS[].slot, CLIENT_LOGOS, CAT_PHOTOS, SERIES_PHOTOS).

## Каталог
Демо-данные (140 позиций) генерируются в data.js. Реальный каталог: ~570 товаров в WooCommerce
(ИБП 217, АКБ 176, стабилизаторы 124, ДГУ 22, STS 30). Выгрузка: WooCommerce -> Экспорт CSV,
или WP REST /wp-json/wc/store/v1/products?per_page=100&page=N (без авторизации).
Атрибуты для фильтров: мощность кВА, кВт, фазы вход/выход, топология, форм-фактор, архитектура,
напряжение, ёмкость, бренд, серия. Габариты в исходнике битые («70 × 51 × 17 8 см»), чистить.

## SEO
План SEO (15 разделов, 15 запросов из договора, структура URL, фильтровые посадочные, регионы) лежит в Claude Docs:
https://claude.ai/artifact/T8PFxTuMUWEhsmj3vm29n3
URL категорий текущего сайта сохранить (product-category/..., uslugi/..., brand/...), остальное редиректить 301.
