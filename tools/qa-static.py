# -*- coding: utf-8 -*-
"""
Проверка сборки для хостинга (build/aecups.kz):
  1. Битые внутренние ссылки во всех HTML (с учётом правил .htaccess).
  2. Все адреса старого aecups.kz (категории, товары, записи, страницы, бренды) открываются: напрямую или через 301.
  3. Браузер: выборка страниц на 1440 и 390 px через php -S с правилами .htaccess (tools/hosting/dev-router.php):
     ошибки JS, одна шапка, один H1, нет ссылок прототипа (*.html#), JSON-LD без localhost, фильтр каталога, форма заявки.
Запуск: python -X utf8 tools/qa-static.py [--no-browser] [--shots]
"""
import glob, html, io, json, os, re, subprocess, sys, time
from urllib.parse import unquote, urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build', 'aecups.kz')
PORT = 8793
BASE = f'http://127.0.0.1:{PORT}'

def load_rules():
    rules, prev = [], False
    for line in io.open(os.path.join(OUT, '.htaccess'), encoding='utf-8'):
        line = line.strip()
        if not line or line.startswith('#'): continue
        if line.startswith('RewriteCond'): prev = True; continue
        m = re.match(r'^RewriteRule\s+(\S+)\s+(\S+)(?:\s+\[([^\]]+)\])?$', line)
        if m and not prev: rules.append((re.compile(m.group(1)), m.group(2), m.group(3) or ''))
        prev = False
    return rules
RULES = None
def resolve(path, hops=0):
    """Возвращает (статус, итоговый путь). path без домена, может быть в %-кодировке."""
    global RULES
    RULES = RULES or load_rules()
    p = unquote(path.split('#')[0].split('?')[0])
    rel = p.lstrip('/')
    for rx, to, fl in RULES:
        m = rx.search(rel)
        if not m: continue
        if 'G' in fl: return 410, p
        for i, g in enumerate(m.groups(), 1): to = to.replace(f'${i}', g or '')
        if 'R=301' in fl:
            if hops > 4: return 508, p
            st, fin = resolve(to, hops + 1)
            return (301 if st == 200 else st), fin
        if to != '-': p = to
        break
    f = os.path.join(OUT, p.lstrip('/'))
    if os.path.isdir(f):
        f = os.path.join(f, 'index.html')
    return (200 if os.path.isfile(f) else 404), p

def link_check():
    bad, n_links, pages = {}, 0, 0
    href_re = re.compile(r'(?:href|src)="(/[^"#?]*)')
    for f in glob.glob(os.path.join(OUT, '**', '*.html'), recursive=True):
        s = io.open(f, encoding='utf-8').read()
        s = s.split('<template id="aec-tpl">')[0]       # проверяем то, что видит поисковик
        pages += 1
        for u in set(href_re.findall(s)):
            if u.startswith('//'): continue
            n_links += 1
            st, fin = resolve(html.unescape(u))
            if st not in (200, 301):
                bad.setdefault(u, []).append(os.path.relpath(f, OUT))
    print(f'Ссылки: {pages} страниц, {n_links} уникальных ссылок на страницу в сумме, битых адресов: {len(bad)}')
    for u, fs in list(bad.items())[:30]: print('   ', u, '←', fs[:3])
    return bad

def ld_check():
    bad = []
    for f in glob.glob(os.path.join(OUT, '**', 'index.html'), recursive=True):
        s = io.open(f, encoding='utf-8').read().split('<template id="aec-tpl">')[0]
        for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S):
            t = m.group(1)
            try: json.loads(t)
            except Exception as e: bad.append((f, 'JSON: ' + str(e)[:80])); continue
            if '127.0.0.1' in t or re.search(r'\.html(#|")', t): bad.append((f, 'адреса прототипа или локальные'))
    print(f'JSON-LD: замечаний {len(bad)}')
    for f, e in bad[:10]: print('   ', os.path.relpath(f, OUT), e)
    return bad

def old_urls():
    urls = set()
    cats = json.load(io.open(os.path.join(ROOT, 'crawl', 'woo', 'categories.json'), encoding='utf-8'))
    urls |= {urlparse(c['permalink']).path for c in cats}
    for f in glob.glob(os.path.join(ROOT, 'crawl', 'woo', 'products-*.json')):
        urls |= {urlparse(p['permalink']).path for p in json.load(io.open(f, encoding='utf-8'))}
    urls |= {urlparse(p['link']).path for p in json.load(io.open(os.path.join(ROOT, 'crawl', 'woo', 'posts.json'), encoding='utf-8'))}
    inv = io.open(os.path.join(ROOT, 'crawl', 'site-inventory.md'), encoding='utf-8').read()
    for line in inv.splitlines():
        if line.startswith('/ ,') or line.startswith('Услуги:'):
            urls |= set(re.findall(r'(/[a-z0-9\-/]+/)', line))
    for b in 'agg bae-batterien baifa baudouin cummins deutz doosan energrid everexceed hoppecke hyundai kehua-tech mecc-alte mtu nidec-leroy-somer perkins ritar salicru scania sdec sprinter stamford-avk tescom volvo-penta yto'.split():
        urls.add(f'/brand/{b}/')
    urls |= {'/product-category/akb/litij-ionnye/', '/voltage/220v/', '/product-tag/ibp/', '/feed/', '/sitemap_index.xml', '/product-sitemap.xml'}
    # все страницы из карт сайта WordPress и все файлы медиатеки (tools/fetch-wp-uploads.py)
    wu = os.path.join(ROOT, 'crawl', 'wp-urls.json')
    if os.path.exists(wu):
        urls |= {urlparse(u).path for u in json.load(io.open(wu, encoding='utf-8'))['pages']}
    wl = os.path.join(ROOT, 'crawl', 'wp-uploads-list.txt')
    if os.path.exists(wl):
        urls |= {urlparse(u).path for u in io.open(wl, encoding='utf-8').read().split()}
    res = {}
    for u in sorted(urls):
        st, fin = resolve(u)
        res.setdefault(st, []).append((u, fin))
    print('Старые адреса:', {k: len(v) for k, v in res.items()})
    for st in res:
        if st not in (200, 301, 410):
            for u, fin in res[st][:40]: print('   ', st, u, '→', fin)
    return res

def browser(shots):
    from playwright.sync_api import sync_playwright
    php = subprocess.Popen(['php', '-S', f'127.0.0.1:{PORT}', '-t', OUT, os.path.join(ROOT, 'tools', 'hosting', 'dev-router.php')], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.2)
    pages = ['/', '/shop/', '/product-category/ibp-istochniki-besperebojnogo-pitaniya/', '/product-category/ibp-istochniki-besperebojnogo-pitaniya/20-kva/',
             '/product-category/ibp-istochniki-besperebojnogo-pitaniya/tryohfaznye/', '/product-category/generatory-2/100-kvt/', '/product-category/akb/12v/100-ach/',
             '/product-category/akb/akb-dlya-ibp-ups/', '/product-category/stabilizatory/tryohfaznye/', '/product-category/gazoporshnevye-elektrostancii/',
             '/product/ibp-kehua-kr1000-1-kva/', '/product/ibp-kehua-ups-s%c2%b3-6-kva/', '/product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-czod-servera/',
             '/resheniya/telekom/', '/uslugi/zamena-batarej-ibp/', '/uslugi/remont-ibp/', '/proekty/', '/proekty/akb-i-zvu-dlya-ktzh/', '/brand/salicru/', '/brand/ritar/',
             '/podbor-po-brendam/', '/regiony/astana/', '/blog/', '/blog/kak-rasschitat-moshchnost-ibp/', '/about/', '/contacts/', '/faq/', '/dokumentaciya/',
             '/kalkulyator-ibp/', '/zapros-kp/', '/sravnenie/', '/izbrannoe/', '/poisk/', '/spasibo/', '/privacy-policy/', '/publichnaya-oferta/', '/nesushchestvuyushchaya/']
    issues = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w in (1440, 390):
            ctx = br.new_context(viewport={'width': w, 'height': 900 if w > 400 else 844})
            ctx.route('**/*', lambda r: r.abort() if any(x in r.request.url for x in ('googletagmanager', 'clickcease', 'fonts.g')) else r.continue_())
            pg = ctx.new_page()
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
            for u in pages:
                errs.clear()
                resp = pg.goto(BASE + u, wait_until='load')
                pg.wait_for_timeout(400)
                info = pg.evaluate("""() => ({
                  headers: document.querySelectorAll('#app header.header').length, h1: document.querySelectorAll('h1').length, tpl: !!document.getElementById('aec-tpl'),
                  legacy: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => /\\.html(#|$)/.test(h) && h !== '/404.html').slice(0, 5),
                  ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent).join(' '),
                  ovx: document.documentElement.scrollWidth - document.documentElement.clientWidth, title: document.title,
                  canon: (document.querySelector('link[rel=canonical]') || {}).href || '', robots: (document.querySelector('meta[name=robots]') || {}).content || '' })""")
                prob = []
                if errs: prob.append('ошибки: ' + '; '.join(errs[:3]))
                if info['headers'] != 1: prob.append(f"шапок {info['headers']}")
                if info['h1'] != 1 and u != '/': prob.append(f"H1: {info['h1']}")
                if info['tpl']: prob.append('шаблон не восстановлен')
                if info['legacy']: prob.append('ссылки прототипа: ' + ', '.join(info['legacy']))
                if re.search(r'\.html(#|")', info['ld']): prob.append('JSON-LD с адресами прототипа .html')
                if info['ovx'] > 1: prob.append(f"горизонтальная прокрутка {info['ovx']}px")
                st = resp.status if resp else 0
                if u == '/nesushchestvuyushchaya/' and st != 404: prob.append(f'статус {st} вместо 404')
                if u != '/nesushchestvuyushchaya/' and st != 200: prob.append(f'статус {st}')
                if prob: issues.append((w, u, prob))
                if shots and w in (1440, 390) and u in ('/', '/product-category/generatory-2/100-kvt/', '/product/ibp-kehua-ups-s%c2%b3-6-kva/', '/uslugi/zamena-batarej-ibp/'):
                    os.makedirs(os.path.join(ROOT, 'shots', 'static'), exist_ok=True)
                    nm = re.sub(r'[^a-z0-9]+', '-', unquote(u).lower()).strip('-') or 'home'
                    pg.screenshot(path=os.path.join(ROOT, 'shots', 'static', f'{nm}-{w}.png'))
            # фильтр каталога: адрес меняется на посадочную страницу
            if w == 1440:
                pg.goto(BASE + '/product-category/ibp-istochniki-besperebojnogo-pitaniya/', wait_until='load'); pg.wait_for_timeout(300)
                a = pg.query_selector('.pop a[href*="20-kva"]')
                href = a.get_attribute('href') if a else None
                if href != '/product-category/ibp-istochniki-besperebojnogo-pitaniya/20-kva/': issues.append((w, 'подборки', [f'ссылка на ИБП 20 кВА: {href}']))
                b = pg.query_selector('[data-brand], input[name=brand], .fgroup input[type=checkbox]')
                if b:
                    b.click(); pg.wait_for_timeout(400)
                    print('   фильтр каталога → адрес:', pg.url.replace(BASE, ''))
                # форма: без настроек Telegram и почты сервер отвечает ok:false, посетителю предлагается WhatsApp
                pg.goto(BASE + '/uslugi/remont-ibp/', wait_until='load'); pg.wait_for_timeout(300)
                f = pg.query_selector('form[data-lead]')
                if f:
                    f.query_selector('[name=name]').fill('Тест сборки')
                    ph = f.query_selector('[name=phone]'); ph.click(); ph.type('7011234567')
                    c = f.query_selector('input[type=checkbox]')
                    if c: c.check()
                    f.query_selector('[type=submit]').click(); pg.wait_for_timeout(2500)
                    fail = pg.query_selector('.send-fail')
                    print('   форма услуги: адрес', pg.url.replace(BASE, ''), '| запасной WhatsApp показан:', bool(fail))
            ctx.close()
        br.close()
    php.terminate()
    print(f'Браузер: {len(pages)} страниц × 2 ширины, замечаний: {len(issues)}')
    for w, u, pr in issues: print('   ', w, u, '|', ' / '.join(pr))
    log = os.path.join(OUT, 'leads', 'leads.csv')
    if os.path.exists(log):
        print('   журнал заявок:', io.open(log, encoding='utf-8-sig').read().strip().splitlines()[-1][:160])
        os.remove(log)  # тестовая заявка не должна попасть на хостинг
    for f in glob.glob(os.path.join(OUT, 'leads', 'rate-*.txt')): os.remove(f)
    return issues

if __name__ == '__main__':
    link_check()
    ld_check()
    old_urls()
    if '--no-browser' not in sys.argv: browser('--shots' in sys.argv)
