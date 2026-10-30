# -*- coding: utf-8 -*-
"""
Сборка сайта aecups.kz для загрузки на хостинг (Plesk: nginx + Apache, PHP).

Что делает:
  1. Копирует site/ в build/aecups.kz/ и переводит пути к файлам на абсолютные (/assets/...).
  2. Создаёт по странице на каждый адрес старого сайта (/product-category/.../, /product/.../, /uslugi/.../, /brand/.../ ...)
     и рендерит её в Chromium (Playwright): в HTML попадают заголовки, тексты, ссылки и JSON-LD,
     поэтому поисковик видит содержимое без выполнения скриптов. В браузере страница дорисовывается теми же скриптами.
  3. Пишет canonical, robots, Open Graph, иконки, счётчики (GTM, GA4, Google Ads, ClickCease с задержкой),
     sitemap.xml, robots.txt, .htaccess (301 со старых адресов WordPress), send.php (заявки на e-mail и в Telegram).
  4. Упаковывает build/aecups-kz-<дата>.zip

Запуск:  python -X utf8 tools/build-static.py            полная сборка
         python -X utf8 tools/build-static.py --only catalog,solution --no-zip   только часть страниц (быстрая проверка)
         --no-docs  без PDF (161 МБ)       --jobs 4  число параллельных вкладок браузера
"""
import argparse, asyncio, datetime, functools, html, http.server, io, json, os, re, shutil, socketserver, subprocess, sys, threading, time, zipfile
from urllib.parse import quote, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'site')
BUILD = os.path.join(ROOT, 'build')
OUT = os.path.join(BUILD, 'aecups.kz')
DOMAIN = 'https://aecups.kz'
NOW = datetime.datetime.now()
VER = NOW.strftime('%y%m%d%H')
TODAY = NOW.date().isoformat()
PORT = 8791
LOCAL = f'http://127.0.0.1:{PORT}'

# Счётчики текущего сайта (сняты с aecups.kz 30.10.2026): переносятся без изменений, чтобы не потерять статистику и конверсии
GSC_VERIFY = 'ygWcje3dqhAdwNTiBTGKMmwNGiPahnl7BOPi6RwWNx0'
GTM_ID = 'GTM-PWB6S7LR'
GA_IDS = ['G-2JLDHHTYCG', 'G-KHCNKKR87M']
ADS_ID = 'AW-17973459473'

def rd(p): return io.open(p, encoding='utf-8').read()
def wr(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
def esc(s): return html.escape(str(s or ''), quote=True)
def num(x):
    x = float(x)
    return str(int(x)) if x == int(x) else str(x).replace('.', '-')

# ---------------------------------------------------------------- данные
def load_data():
    js = r"""
global.window = global; require('./assets/catalog.js'); require('./assets/data.js'); const D = window.AEC;
const pick = (a, ks) => a.map(x => Object.fromEntries(ks.map(k => [k, x[k]])));
process.stdout.write(JSON.stringify({
  CATEGORIES: D.CATEGORIES.map(c => ({ id: c.id, name: c.name, full: c.full, soon: !!c.soon, subs: (c.subs || []).map(s => ({ id: s.id, name: s.name })) })),
  INDUSTRIES: pick(D.INDUSTRIES, ['id', 'name', 'slug']), SERVICES: pick(D.SERVICES, ['id', 'name', 'slug']),
  PROJECTS: pick(D.PROJECTS, ['id', 'title', 'slug', 'cover']), BRANDS: pick(D.BRANDS, ['id', 'name']),
  CITIES: pick(D.CITIES, ['slug', 'name']), ARTICLES: pick(D.ARTICLES, ['slug', 'title', 'cover', 'date']),
  PRODUCTS: pick(D.PRODUCTS, ['id', 'slug', 'name', 'cat', 'sub', 'photo', 'brandId']),
  CAT_PHOTOS: D.CAT_PHOTOS, INDUSTRY_PHOTOS: D.INDUSTRY_PHOTOS, CONTACT: D.CONTACT
}));
"""
    r = subprocess.run(['node', '-e', js], cwd=SITE, capture_output=True)
    if r.returncode: raise SystemExit(r.stderr.decode('utf-8', 'replace'))
    D = json.loads(r.stdout.decode('utf-8'))
    cat = json.load(io.open(os.path.join(SITE, 'assets', 'catalog.json'), encoding='utf-8'))['products']
    D['WC'] = {p['id']: p['wc'] for p in cat}
    return D

# ---------------------------------------------------------------- адреса
IBP = '/product-category/ibp-istochniki-besperebojnogo-pitaniya/'
GEN = '/product-category/generatory-2/'
DG = GEN + 'dizelnye-generatory/'
AKB = '/product-category/akb/'
STAB = '/product-category/stabilizatory/'
STS = '/product-category/staticheskie-pereklyuchateli-sts/'
CAT = {
    'ibp': IBP, 'ibp.odnofaznye': IBP + 'odnofaznye/', 'ibp.tryohfaznye': IBP + 'tryohfaznye/', 'ibp.modulnye': IBP + 'modulnye/',
    'ibp.stoechnye': IBP + 'stoechnye/', 'ibp.batarejnye-shkafy': IBP + 'batarejnye-shkafy/', 'ibp.aksessuary': IBP + 'aksessuary/',
    'dgu': GEN, 'dgu.otkrytye': DG + 'dizelnye-generatory-bez-kozhuha/', 'dgu.v-kozhuhe': DG + 'dizelnye-generatory-s-kozhuhom/',
    'dgu.v-kontejnere': DG + 'dizelnye-generatory-v-kontejnere/', 'dgu.avr': GEN + 'avr/',
    # «АКБ для ИБП» — посадочная гарантийного запроса № 6 (SEO-план), поэтому основная страница АКБ живёт на этом адресе
    'akb': AKB + 'akb-dlya-ibp-ups/', 'akb.12v': AKB + '12v/', 'akb.2v': AKB + '2v/', 'akb.6v': AKB + '6v/', 'akb.li-ion': AKB + 'litij-ionnye/', 'akb.stellazhi': AKB + 'stellazhi/',
    'stab': STAB, 'stab.odnofaznye': STAB + 'odnofaznye/', 'stab.tryohfaznye': STAB + 'tryohfaznye/',
    'stab.relejnye': STAB + 'relejnye-stabilizatory-napryazheniya/', 'stab.elektromehanicheskie': STAB + 'elektromehanicheskie-stabilizatory-napryazheniya/',
    'stab.elektronnye': STAB + 'elektronnye-stabilizatory-napryazheniya/',
    'sts': STS, 'sts.odnofaznye': STS + 'sts-odnofaznye-sts2000/', 'sts.tryohfaznye': STS + 'sts-tryohfaznye-3-polyusnye-sts3000/',
    # направления без товаров: страницы есть, но закрыты от индекса до загрузки позиций (риск «пустые категории» в SEO-плане)
    'gpes': '/product-category/gazoporshnevye-elektrostancii/', 'zvu': '/product-category/vypryamiteli-i-zvu/', 'inv': '/product-category/invertory/',
    'freq': '/product-category/preobrazovateli-chastoty/', 'trafo': '/product-category/razdelitelnye-transformatory/', 'ips': '/product-category/medicinskie-ips/',
}
FILTER_PAGES = {}  # посадочные по мощности и ёмкости из SEO-плана: 10 + 7 + 6 = 23
for v in [10, 20, 30, 40, 60, 80, 100, 160, 200, 300]: FILTER_PAGES['ibp.kva-' + num(v)] = IBP + f'{v}-kva/'
for v in [30, 50, 100, 150, 200, 300, 500]: FILTER_PAGES['dgu.kva-' + num(v * 1.25)] = GEN + f'{v}-kvt/'
for v in [7, 9, 18, 65, 100, 200]: FILTER_PAGES['akb.12v.kva-' + num(v)] = AKB + f'12v/{v}-ach/'
CAT.update(FILTER_PAGES)

SOLUTION = {
    'czod': IBP + 'ibp-dlya-czod-servera/', 'med': IBP + 'ibp-dlya-bolnicz/', 'prom': IBP + 'promyshlennye-ibp/', 'oil': IBP + 'ibp-dlya-neftegaza/',
    'office': IBP + 'ibp-dlya-biznes-centrov-trc/', 'machines': IBP + 'ibp-dlya-stankov/', 'emergency': IBP + 'ibp-dlya-avarijnyh-sistem/',
    'telecom': '/resheniya/telekom/', 'banks': '/resheniya/banki/', 'gov': '/resheniya/infrastruktura/', 'energy': '/resheniya/energetika/',
}
SERVICE = {
    'montazh': '/uslugi/montazh-i-obsluzhivanie-ibp-i-generatorov/', 'service': '/uslugi/obsluzhivanie-ibp/', 'remont': '/uslugi/remont-ibp/',
    'zamena': '/uslugi/zamena-batarej-ibp/', 'diagnostika': '/uslugi/diagnostika-batarej/', 'obsledovanie': '/uslugi/obsledovanie-sistemy/',
    'konsultaciya': '/uslugi/predproektnaya-konsultacziya/',
}
LEGAL = {'policy': '/privacy-policy/', 'terms': '/polzovatelskoe-soglashenie/', 'offer': '/publichnaya-oferta/', 'warranty': '/guarantees-and-returns/'}
PAGE = {
    'index': '/', 'catalog': '/shop/', 'projects': '/proekty/', 'brands': '/podbor-po-brendam/', 'about': '/about/', 'contacts': '/contacts/',
    'blog': '/blog/', 'faq': '/faq/', 'docs': '/dokumentaciya/', 'calc': '/kalkulyator-ibp/', 'kp': '/zapros-kp/', 'compare': '/sravnenie/',
    'favorites': '/izbrannoe/', 'search': '/poisk/', 'thanks': '/spasibo/', '404': '/404.html',
}
WP_BRANDS = 'agg bae-batterien baifa baudouin cummins deutz doosan energrid everexceed hoppecke hyundai kehua-tech mecc-alte mtu nidec-leroy-somer perkins ritar salicru scania sdec sprinter stamford-avk tescom volvo-penta yto'.split()

class Route:
    def __init__(self, path, tpl, s='', hash=False, index=True, kind='page', img=None, prio='0.6', canon=None, file=None, sm=True):
        self.path, self.tpl, self.s, self.hash, self.index, self.kind, self.img, self.prio, self.sm = path, tpl, s, hash, index, kind, img, prio, sm
        self.canon = canon or path          # адрес в canonical и sitemap (у 144 товаров с ³ и · он в %-кодировке, как на старом сайте)
        self.file = file or path            # где лежит файл
        self.title = self.desc = ''

def build_routes(D):
    R = []
    R.append(Route('/', 'index.html', kind='home', prio='1.0', img='assets/img/' + (D['CAT_PHOTOS'].get('ibp') or 'logo.png')))
    R.append(Route('/shop/', 'catalog.html', '', hash=True, canon=CAT['ibp'], kind='catalog', sm=False))  # «Продукция» в крошках: каталог ИБП, canonical на него
    cnt = {}
    for p in D['PRODUCTS']:
        cnt[p['cat']] = cnt.get(p['cat'], 0) + 1
        for s_ in p.get('sub') or []: cnt[p['cat'] + '.' + s_] = cnt.get(p['cat'] + '.' + s_, 0) + 1
    for k, path in CAT.items():
        c = k.split('.')[0]
        base = '.'.join(k.split('.')[:2]) if '.kva-' not in k else k.split('.kva-')[0]
        # пустые подкатегории и направления без товаров закрыты от индекса до загрузки позиций
        idx = cnt.get(base, 0) > 0
        img = D['CAT_PHOTOS'].get(c)
        R.append(Route(path, 'catalog.html', k, hash=True, index=idx, kind='catalog', prio='0.9' if k in FILTER_PAGES or k.count('.') == 0 else '0.8', img=img and 'assets/img/' + img))
    for p in D['PRODUCTS']:
        wc = D['WC'].get(p['id'], {})
        wslug = wc.get('slug') or p['slug']
        canon = '/product/' + wslug + '/'
        file = '/product/' + p['slug'] + '/'
        R.append(Route(file, 'product.html', p['slug'], kind='product', prio='0.7', canon=canon, img=p.get('photo') and 'assets/img/products/' + p['photo']))
    for i in D['INDUSTRIES']:
        R.append(Route(SOLUTION[i['id']], 'solution.html', i['id'], kind='solution', prio='0.9', img=D['INDUSTRY_PHOTOS'].get(i['id']) and 'assets/img/' + D['INDUSTRY_PHOTOS'][i['id']]))
    for s_ in D['SERVICES']:
        R.append(Route(SERVICE[s_['id']], 'service.html', s_['id'], kind='service', prio='0.9'))
    R.append(Route(PAGE['projects'], 'projects.html', kind='page', prio='0.7'))
    for p in D['PROJECTS']:
        R.append(Route('/' + p['slug'], 'project.html', p['id'], kind='article', prio='0.6', img=p.get('cover') and 'assets/img/' + p['cover']))
    R.append(Route(PAGE['brands'], 'brands.html', prio='0.6'))
    with_products = {p.get('brandId') for p in D['PRODUCTS']}
    for b in D['BRANDS']:
        R.append(Route('/brand/' + b['id'] + '/', 'brand.html', b['id'], kind='brand', prio='0.6', index=b['id'] in with_products or b['id'] in WP_BRANDS))
    for c in D['CITIES']:
        R.append(Route('/regiony/' + c['slug'] + '/', 'region.html', c['slug'], kind='region', prio='0.6'))
    R.append(Route(PAGE['blog'], 'blog.html', prio='0.6'))
    for i, a in enumerate(D['ARTICLES']):
        R.append(Route('/' + a['slug'], 'article.html', str(i), kind='article', prio='0.6', img=a.get('cover') and 'assets/img/' + a['cover']))
    for k, path in LEGAL.items():
        R.append(Route(path, 'legal.html', k, prio='0.2'))
    for pg, tpl, idx, prio in [('about', 'about.html', True, '0.6'), ('contacts', 'contacts.html', True, '0.7'), ('faq', 'faq.html', True, '0.5'),
                               ('docs', 'docs.html', True, '0.5'), ('calc', 'calc.html', True, '0.8'), ('kp', 'kp.html', False, '0'),
                               ('compare', 'compare.html', False, '0'), ('favorites', 'favorites.html', False, '0'), ('search', 'search.html', False, '0'),
                               ('thanks', 'thanks.html', False, '0')]:
        R.append(Route(PAGE[pg], tpl, '', hash=pg in ('calc', 'search'), index=idx, prio=prio))
    R.append(Route('/404.html', '404.html', '', index=False, file='/404.html'))
    return R

def routes_js(D):
    prod = {}
    for p in D['PRODUCTS']:
        wslug = (D['WC'].get(p['id']) or {}).get('slug') or p['slug']
        if wslug != p['slug']: prod[p['slug']] = '/product/' + wslug + '/'
    URLS = {
        'page': PAGE, 'cat': CAT, 'product': prod, 'solution': SOLUTION, 'service': SERVICE,
        'project': {p['id']: '/' + p['slug'] for p in D['PROJECTS']},
        'brand': {b['id']: '/brand/' + b['id'] + '/' for b in D['BRANDS']} | {'kehua': '/brand/kehua-tech/', 'exide': '/brand/sprinter/'},
        'article': {str(i): '/' + a['slug'] for i, a in enumerate(D['ARTICLES'])},
        'region': {c['slug']: '/regiony/' + c['slug'] + '/' for c in D['CITIES']}, 'legal': LEGAL,
    }
    return '/* Адреса страниц сайта (собрано tools/build-static.py). Ссылки прототипа вида catalog.html#ibp переводятся в эти адреса в assets/aec.js */\nwindow.AEC_URLS = ' + json.dumps(URLS, ensure_ascii=False, separators=(',', ':')) + ';\n'

# ---------------------------------------------------------------- 301 со старого сайта
def redirects(D):
    r = [
        ('product-category/akb', CAT['akb']),
        ('product-category/generatory-2/dizelnye-generatory', CAT['dgu']),
        ('product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-linii-proizvodstv', SOLUTION['prom']),
        ('product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-kt-mrt', SOLUTION['med']),
        ('product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-operacionnyh-i-reanimacionnyh-blokov', SOLUTION['med']),
        ('product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-kompyuternih-clubov', CAT['ibp.odnofaznye']),
        ('product-category/stabilizatory/elektronnye-stabilizatory-napryazheniya/simistornye-i-tiristornye', CAT['stab.elektronnye']),
        ('product-category/stabilizatory/elektronnye-stabilizatory-napryazheniya/staticheskie', CAT['stab.elektronnye']),
        ('product-category/staticheskie-pereklyuchateli-sts/sts-tryohfaznye-4-polyusnye-sts4000', CAT['sts.tryohfaznye']),
        ('product-category', PAGE['catalog']), ('product', PAGE['catalog']), ('brand', PAGE['brands']), ('podbor-po-brendam/brand', PAGE['brands']),
        ('uslugi', SERVICE['montazh']), ('resheniya', SOLUTION['czod']), ('regiony', PAGE['contacts']),
        # проекты (старые адреса в корне)
        ('rezervnoe-energosnabzhenie', '/proekty/akb-i-zvu-dlya-ktzh/'),
        ('modulnaya-sistema-ibp', '/proekty/ibp-kehua-120-kva-air-astana/'),
        ('postavka-ibp-ist7-120-kva-2', '/proekty/modulnyj-ibp-300-kva-laboratoriya-karaganda/'),
        ('postavka-ibp-ist7-120-kva', '/proekty/ibp-80-kva-dlya-rentgena-uralsk/'),
        ('postavka-dlya-tele-radio-kompleksa-telekanala-kazahstan', '/proekty/ibp-salicru-telekanal-kazakhstan/'),
        # выставки и сертификаты: разделы страницы «О компании»
        ('vystavki', '/about/#exhibitions'), ('sertifikaty', '/about/#certs'),
        ('sovremennye-podhody-k-energoeffektivnosti', '/about/#exhibitions'), ('stend-sistem-rezervnogo-pitaniya', '/about/#exhibitions'),
        ('stend-sistem-rezervnogo-pitaniya-2', '/about/#exhibitions'), ('vystavka-power-expo-2025', '/about/#exhibitions'), ('vystavka-kihe-2026', '/about/#exhibitions'),
        # статьи: единый префикс /blog/
        ('dizel-generatornaya-ustanovka-podrobnyj-razbor-ustrojstva-princzipov-raboty-i-sfer-primeneniya', '/blog/dizel-generatornaya-ustanovka-podrobnyj-razbor/'),
        ('blog/dizel-generatornaya-ustanovka-podrobnyj-razbor-ustrojstva-princzipov-raboty-i-sfer-primeneniya', '/blog/dizel-generatornaya-ustanovka-podrobnyj-razbor/'),
        ('root-aec-primary-0a2540-aec-secondary-0066cc-aec-accent-d97706-aec-dark-1e293b-aec-light-f8fafc-aec-border-e2e8f0-aec-text-334155-aec-radius-8px-aec-shado', '/blog/inzhenernoe-rukovodstvo-sistemy-hraneniya-energii/'),
        ('blog/root-aec-primary-0a2540-aec-secondary-0066cc-aec-accent-d97706-aec-dark-1e293b-aec-light-f8fafc-aec-border-e2e8f0-aec-text-334155-aec-radius-8px-aec-shado', '/blog/inzhenernoe-rukovodstvo-sistemy-hraneniya-energii/'),
        # служебные страницы WordPress
        ('contract-offer', LEGAL['offer']), ('cart', PAGE['kp']), ('checkout', PAGE['kp']), ('my-account', PAGE['kp']), ('wishlist', PAGE['favorites']),
        ('progress-of-work', PAGE['about']), ('authors-page', PAGE['about']), ('home', '/'), ('glavnaya', '/'),
        ('katalog', PAGE['catalog']), ('catalog', PAGE['catalog']), ('kontakty', PAGE['contacts']), ('o-kompanii', PAGE['about']),
    ]
    for a in D['ARTICLES']:
        slug = a['slug'][len('blog/'):].strip('/')
        r.append((slug, '/' + a['slug']))
    # дубли товаров на старом сайте: «…-kopirovat», «…-2», переименованные модели
    names = {}
    for p in D['PRODUCTS']: names.setdefault(p['name'].lower(), p)
    for old, new in [('akkumulyatornaya-batareya-hoppecke-grid-power-v-h-2-130-2-v-120-a%c2%b7ch-2', 'akkumulyatornaya-batareya-hoppecke-grid-power-v-h-2-130-2-v-120-a%c2%b7ch'),
                     ('akkumulyatornaya-batareya-hoppecke-4-opzv-200-2-v-200-a%c2%b7ch-kopirovat', 'akkumulyatornaya-batareya-hoppecke-4-opzv-200-2-v-200-a%c2%b7ch'),
                     ('akkumulyatornaya-batareya-hoppecke-12-opzv-1500-2-v-1500-a%c2%b7ch-2', 'akkumulyatornaya-batareya-hoppecke-12-opzv-1500-2-v-1500-a%c2%b7ch')]:
        r.append(('product/' + unquote(old), '/product/' + new + '/'))
    return r

def find_product_dupes(D):
    """Товары, удалённые как дубли при сборке каталога: ищем оригинал по названию."""
    import glob
    allp = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'crawl', 'woo', 'products-*.json'))): allp += json.load(io.open(f, encoding='utf-8'))
    have = {(D['WC'].get(p['id']) or {}).get('id') for p in D['PRODUCTS']}
    byname = {}
    for p in D['PRODUCTS']:
        wc = D['WC'].get(p['id']) or {}
        byname.setdefault(re.sub(r'\W+', ' ', p['name'].lower()).strip(), wc.get('slug') or p['slug'])
    out = []
    for p in allp:
        if p['id'] in have: continue
        key = re.sub(r'\W+', ' ', html.unescape(p['name']).lower()).strip()
        tgt = byname.get(key)
        if not tgt:  # MTW150 (MTW80/20X1) → карточка с тем же артикулом
            m = re.search(r'\(([^)]+)\)', p['name'])
            if m:
                k2 = m.group(1).lower()
                for nm, sl in byname.items():
                    if k2.replace('/', ' ') in nm: tgt = sl; break
        out.append(('product/' + unquote(p['slug']), ('/product/' + tgt + '/') if tgt else PAGE['catalog']))
    return out

# ---------------------------------------------------------------- шаблоны
ASSET_RE = re.compile(r'(?<![\w/.\-])assets/')
def fix_assets(s): return ASSET_RE.sub('/assets/', s)

def analytics_head():
    cfg = ''.join(f"gtag('config','{i}');" for i in GA_IDS + [ADS_ID])
    return ("<script>(function(w,d){w.dataLayer=w.dataLayer||[];function gtag(){w.dataLayer.push(arguments)}w.gtag=gtag;gtag('js',new Date());" + cfg +
            "var on=0;function load(){if(on)return;on=1;w.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
            f"['https://www.googletagmanager.com/gtm.js?id={GTM_ID}','https://www.googletagmanager.com/gtag/js?id={GA_IDS[0]}','https://www.clickcease.com/monitor/stat.js']"
            ".forEach(function(u){var s=d.createElement('script');s.async=true;s.src=u;d.head.appendChild(s)})}"
            "['pointerdown','keydown','scroll','touchstart','mousemove'].forEach(function(e){w.addEventListener(e,load,{once:true,passive:true})});setTimeout(load,5000)"
            "})(window,document);</script>")

def head_block(r):
    canon = DOMAIN + r.canon
    robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' if r.index else 'noindex, follow'
    img = DOMAIN + '/' + (r.img or 'assets/img/og-aec.jpg')
    og_type = {'product': 'product', 'article': 'article'}.get(r.kind, 'website')
    return '\n'.join([
        f'<link rel="canonical" href="{esc(canon)}">' if r.index or r.canon != r.path else '',
        f'<meta name="robots" content="{robots}">',
        f'<meta name="google-site-verification" content="{GSC_VERIFY}">',
        '<meta name="theme-color" content="#0a2540">',
        '<meta property="og:site_name" content="AEC Kazakhstan">', '<meta property="og:locale" content="ru_RU">',
        f'<meta property="og:type" content="{og_type}">', '<meta property="og:title" content="__OGT__">', '<meta property="og:description" content="__OGD__">',
        f'<meta property="og:url" content="{esc(canon)}">', f'<meta property="og:image" content="{esc(quote(img, safe=":/%"))}">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" type="image/png" sizes="192x192" href="/assets/img/favicon-192.png"><link rel="apple-touch-icon" href="/apple-touch-icon.png">',
        '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        analytics_head(),
    ]).replace('\n\n', '\n')

def make_shell(tpl_src, r):
    s = tpl_src
    s = re.sub(r'<meta name="robots"[^>]*>\n?', '', s)
    s = re.sub(r'<meta name="theme-color"[^>]*>\n?', '', s)
    s = s.replace('</head>', head_block(r) + '\n</head>', 1)
    body = s.index('<body')
    bclose = s.index('>', body) + 1
    s = s[:bclose] + f'\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>' + s[bclose:]
    app = s.index('<div id="app">')
    first_script = s.index('<script', app)
    route = json.dumps({'s': r.s, 'hash': r.hash}, ensure_ascii=False)
    s = s[:first_script] + f'<script>window.AEC_ROUTE={route};</script>\n<script src="/assets/routes.js?v={VER}"></script>\n' + s[first_script:]
    return s

def app_bounds(s):
    a = s.index('<div id="app">') + len('<div id="app">')
    sc = s.index('<script', a)
    b = s.rfind('</div>', a, sc)
    return a, b

# ---------------------------------------------------------------- локальный сервер для рендера
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def end_headers(self):
        self.send_header('Cache-Control', 'max-age=600')
        super().end_headers()

def serve():
    handler = functools.partial(QuietHandler, directory=OUT)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.request_queue_size = 256
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), handler)
    httpd.daemon_threads = True
    httpd.handle_error = lambda *a: None
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd

SNAP_JS = r"""() => {
  const app = document.getElementById('app');
  document.querySelectorAll('.cookie-note,.toast').forEach(e => e.remove());
  return {
    title: document.title,
    desc: (document.querySelector('meta[name=description]') || {}).content || '',
    app: app ? app.innerHTML : '',
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent),
    h1: [...document.querySelectorAll('#app h1')].map(h => h.textContent.trim()),
    empty: !!document.querySelector('.results .empty, #body .empty'),
    clean: !!(window.AECUI && window.AECUI.clean && window.AEC_URLS)
  };
}"""

async def prerender(routes, jobs):
    from playwright.async_api import async_playwright
    errors, results = [], {}
    q = asyncio.Queue()
    for r in routes: q.put_nowait(r)
    async with async_playwright() as p:
        br = await p.chromium.launch(args=['--disable-gpu', '--no-sandbox'])
        ctx = await br.new_context(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce', service_workers='block')
        async def block(route):
            u = route.request.url
            if u.startswith(LOCAL) or u.startswith('data:'): await route.continue_()
            elif route.request.resource_type == 'image': await route.continue_()
            else: await route.abort()
        await ctx.route('**/*', block)
        done = [0]
        t0 = time.time()
        async def worker():
            pg = await ctx.new_page()
            pe = []
            pg.on('pageerror', lambda e: pe.append(str(e)))
            pg.on('console', lambda m: pe.append('console: ' + m.text) if m.type == 'error' and 'ERR_FAILED' not in m.text and 'net::' not in m.text else None)
            n = 0
            while not q.empty():
                r = await q.get()
                pe.clear()
                try:
                    await pg.goto(LOCAL + quote(r.file, safe='/%'), wait_until='load', timeout=60000)
                    await pg.wait_for_function("document.querySelector('#app header') && document.querySelector('#app h1')", timeout=30000)
                    await pg.wait_for_timeout(700 if r.kind == 'home' else 120)
                    snap = await pg.evaluate(SNAP_JS)
                    if not snap.get('clean') or '.html#' in ''.join(snap['ld']): raise RuntimeError('routes.js не загрузился')
                    results[r.path] = snap
                    if pe: errors.append((r.path, pe[:3]))
                except Exception as e:
                    if not getattr(r, 'retry', False):   # одна повторная попытка
                        r.retry = True; await q.put(r); done[0] -= 1; n -= 1
                    else:
                        errors.append((r.path, ['render: ' + str(e)[:300]]))
                done[0] += 1; n += 1
                if done[0] % 50 == 0: print(f'  {done[0]}/{len(routes)}  {time.time() - t0:.0f} c', flush=True)
                if n % 120 == 0:  # освобождаем память вкладки
                    await pg.close(); pg = await ctx.new_page(); pg.on('pageerror', lambda e: pe.append(str(e)))
            await pg.close()
        await asyncio.gather(*[worker() for _ in range(jobs)])
        await br.close()
    return results, errors

# ---------------------------------------------------------------- сборка
def copy_site(no_docs):
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    skip_dirs = {'_dev', '.vercel'}
    for dp, dns, fns in os.walk(SITE):
        dns[:] = [d for d in dns if d not in skip_dirs and not (no_docs and os.path.relpath(os.path.join(dp, d), SITE).replace('\\', '/') == 'assets/docs')]
        rel = os.path.relpath(dp, SITE).replace('\\', '/')
        for f in fns:
            if rel == '.': continue                                  # шаблоны *.html и служебные файлы корня не копируются
            if rel == 'assets' and f in ('catalog.json', 'images.json'): continue
            src = os.path.join(dp, f); dst = os.path.join(OUT, rel, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            if f.endswith(('.js', '.css')) and '/vendor' not in '/' + rel:
                s = rd(src)
                s = fix_assets(s)
                wr(dst, s)
            else:
                shutil.copy2(src, dst)

def make_icons():
    from PIL import Image
    im = Image.open(os.path.join(SITE, 'assets', 'img', 'favicon.png')).convert('RGBA')
    im.save(os.path.join(OUT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
    bg = Image.new('RGBA', (180, 180), (255, 255, 255, 255)); ic = im.resize((150, 150), Image.LANCZOS); bg.paste(ic, (15, 15), ic)
    bg.convert('RGB').save(os.path.join(OUT, 'apple-touch-icon.png'))
    im.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, 'assets', 'img', 'favicon-192.png'))
    # картинка для соцсетей по умолчанию: фото категории ИБП с логотипом, 1200×630
    try:
        ph = Image.open(os.path.join(SITE, 'assets', 'img', 'cat-ibp-photo.jpg')).convert('RGB')
        w, h = ph.size; k = max(1200 / w, 630 / h); ph = ph.resize((int(w * k) + 1, int(h * k) + 1), Image.LANCZOS)
        ph = ph.crop(((ph.width - 1200) // 2, (ph.height - 630) // 2, (ph.width - 1200) // 2 + 1200, (ph.height - 630) // 2 + 630))
        logo = Image.open(os.path.join(SITE, 'assets', 'img', 'logo.png')).convert('RGBA'); lw = 360; logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        card = Image.new('RGBA', (lw + 56, logo.height + 40), (255, 255, 255, 235)); ph = ph.convert('RGBA'); ph.alpha_composite(card, (48, 48)); ph.alpha_composite(logo, (76, 68))
        ph.convert('RGB').save(os.path.join(OUT, 'assets', 'img', 'og-aec.jpg'), quality=85)
    except Exception as e:
        print('og image:', e)

def finalize(r, shell, snap):
    s = shell
    title = snap['title'] or 'AEC Kazakhstan'
    desc = snap['desc'] or ''
    r.title, r.desc = title, desc
    s = re.sub(r'<title>.*?</title>', '<title>' + esc(title).replace('&#x27;', "'") + '</title>', s, count=1, flags=re.S)
    s = re.sub(r'(<meta name="description" content=")[^"]*(">)', lambda m: m.group(1) + esc(desc) + m.group(2), s, count=1)
    s = s.replace('__OGT__', esc(title.replace(' | AEC Kazakhstan', '').replace(' | AEC', ''))).replace('__OGD__', esc(desc))
    ld = ''.join('<script type="application/ld+json" data-pre>' + x.replace('</', '<\\/').replace(LOCAL, DOMAIN) + '</script>\n' for x in snap['ld'])
    s = s.replace('</head>', ld + '</head>', 1)
    a, b = app_bounds(s)
    orig = s[a:b]
    app = snap['app'].replace(LOCAL, DOMAIN)
    s = s[:a] + app + '</div>\n<template id="aec-tpl">' + orig + '</template>' + s[b + len('</div>'):]
    return s

def sitemap(routes, D):
    imgs = {}
    for r in routes:
        if r.kind == 'product' and r.img: imgs[r.path] = DOMAIN + '/' + r.img
    out = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
    for r in routes:
        if not r.index or not r.sm: continue
        u = DOMAIN + r.canon
        out.append(f'<url><loc>{esc(u)}</loc><lastmod>{TODAY}</lastmod><priority>{r.prio}</priority>' + (f'<image:image><image:loc>{esc(quote(imgs[r.path], safe=":/%"))}</image:loc></image:image>' if r.path in imgs else '') + '</url>')
    out.append('</urlset>')
    return '\n'.join(out) + '\n'

def htaccess(routes, reds):
    L = ['# AEC Kazakhstan, aecups.kz: статический сайт (собран tools/build-static.py ' + TODAY + ')',
         '# Apache / LiteSpeed. В Plesk работает при включённом Apache (режим «nginx + Apache»).',
         'Options -Indexes -MultiViews', 'DirectoryIndex index.html', 'AddDefaultCharset utf-8', 'ErrorDocument 404 /404.html', '',
         '<IfModule mod_mime.c>', '  AddType image/webp .webp', '  AddType image/svg+xml .svg', '  AddType font/woff2 .woff2', '  AddType application/javascript .js', '  AddType application/xml .xml', '</IfModule>', '',
         '# закрыть служебные файлы', '<FilesMatch "^(send-config\\.php|README.*|.*\\.md|.*\\.csv|.*\\.log)$">', '  Require all denied', '</FilesMatch>', '',
         '<IfModule mod_rewrite.c>', 'RewriteEngine On', 'RewriteBase /', '',
         '# без www (как на текущем сайте)', 'RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]', 'RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L,NE]', '',
         '# http -> https. На Plesk этот редирект обычно включён в настройках хостинга («SEO-безопасный 301 с HTTP на HTTPS»).',
         '# Правило ниже срабатывает только при прямом обращении к Apache на 80 порт и не даёт зацикливания за nginx.',
         'RewriteCond %{HTTPS} !=on', 'RewriteCond %{HTTP:X-Forwarded-Proto} !https', 'RewriteCond %{SERVER_PORT} ^80$', 'RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L,NE]', '',
         '# /index.html -> / (без дублей страниц)', 'RewriteCond %{THE_REQUEST} \\s/+(.*/)?index\\.html[\\s?] [NC]', 'RewriteRule ^ /%1 [R=301,L,NE]', '',
         '# поиск WordPress (?s=) -> поиск по каталогу', 'RewriteCond %{QUERY_STRING} (?:^|&)s=([^&]+) [NC]', 'RewriteRule ^$ /poisk/#q-%1? [R=301,L,NE]', '',
         '# старые карты сайта Rank Math / Yoast -> новая', 'RewriteRule ^(sitemap_index|[a-z_]+-sitemap[0-9]*)\\.xml$ /sitemap.xml [R=301,L]', '',
         '# мусорные адреса WordPress: таксономии атрибутов, теги, авторы, ленты (410 — страница удалена навсегда)',
         'RewriteRule ^(voltage|install|power-factor|product-tag|tag|author|bricks_template|template|feed|comments/feed)(/.*)?$ - [G,L]',
         'RewriteRule ^.+/feed/?$ - [G,L]', 'RewriteRule ^proizvoditel(/.*)?$ /podbor-po-brendam/ [R=301,L]', '',
         '# товары, у которых в адресе на старом сайте есть символы ³ и · : адрес не меняется, файл лежит в латинской папке']
    for r in routes:
        if r.kind == 'product' and r.canon != r.path:
            pat = re.escape(unquote(r.canon.strip('/'))).replace('\\-', '-').replace('\\/', '/')
            L.append(f'RewriteRule ^{pat}/?$ {r.path}index.html [L]')
    L += ['', '# 301 со старых адресов']
    seen = set()
    for old, new in reds:
        old = old.strip('/')
        if old in seen: continue
        seen.add(old)
        pat = re.escape(old).replace('\\-', '-').replace('\\/', '/')
        L.append(f'RewriteRule ^{pat}/?$ {new} [R=301,L,NE]')
    L += ['</IfModule>', '',
          '<IfModule mod_deflate.c>', '  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml', '</IfModule>', '',
          '<IfModule mod_headers.c>', '  Header always set X-Content-Type-Options "nosniff"', '  Header always set Referrer-Policy "strict-origin-when-cross-origin"',
          '  Header always set X-Frame-Options "SAMEORIGIN"',
          '  <FilesMatch "\\.html$">', '    Header set Cache-Control "no-cache"', '  </FilesMatch>',
          '  <FilesMatch "\\.(css|js|jpg|jpeg|png|webp|svg|gif|ico|woff2?)$">', '    Header set Cache-Control "public, max-age=2592000"', '  </FilesMatch>',
          '  <FilesMatch "\\.pdf$">', '    Header set Cache-Control "public, max-age=604800"', '    Header set X-Robots-Tag "noarchive"', '  </FilesMatch>',
          '</IfModule>', '']
    return '\n'.join(L)

ROBOTS = """User-agent: *
Disallow: /send.php
Disallow: /zapros-kp/
Disallow: /sravnenie/
Disallow: /izbrannoe/
Disallow: /spasibo/
Disallow: /*?add-to-cart=
Disallow: /*?*add-to-cart=
Disallow: /wp-admin/

Sitemap: https://aecups.kz/sitemap.xml
"""

def audit(routes):
    """Проверка SEO по шаблонам SEO-плана: длины title/description, дубли, один H1."""
    rows, by_t, by_d = [], {}, {}
    for r in routes:
        if not r.index or not r.sm: continue
        by_t.setdefault(r.title, []).append(r.path); by_d.setdefault(r.desc, []).append(r.path)
    probs = []
    for r in routes:
        if not r.index: continue
        h1 = getattr(r, 'h1', [])
        if len(r.title) > 65: probs.append(('title > 65', r.path, len(r.title), r.title))
        if len(r.desc) < 70 or len(r.desc) > 165: probs.append(('description', r.path, len(r.desc), r.desc))
        if len(h1) != 1: probs.append(('h1', r.path, len(h1), ' | '.join(h1)))
    dup_t = {t: p for t, p in by_t.items() if len(p) > 1}
    dup_d = {t: p for t, p in by_d.items() if len(p) > 1}
    return probs, dup_t, dup_d

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', default='')
    ap.add_argument('--no-docs', action='store_true')
    ap.add_argument('--no-zip', action='store_true')
    ap.add_argument('--jobs', type=int, default=4)
    a = ap.parse_args()
    t0 = time.time()
    D = load_data()
    routes = build_routes(D)
    only = [x for x in a.only.split(',') if x]
    print(f'Страниц: {len(routes)}')

    print('Копирую файлы…')
    copy_site(a.no_docs)
    wr(os.path.join(OUT, 'assets', 'routes.js'), routes_js(D))
    make_icons()

    # шаблоны → оболочки страниц
    tpls = {}
    shells = {}
    for r in routes:
        if r.tpl not in tpls:
            t = rd(os.path.join(SITE, r.tpl))
            t = fix_assets(t).replace('?v=281028', '?v=' + VER)
            tpls[r.tpl] = t
        shells[r.path] = make_shell(tpls[r.tpl], r)
        dst = os.path.join(OUT, r.file.lstrip('/'), 'index.html') if r.file.endswith('/') else os.path.join(OUT, r.file.lstrip('/'))
        wr(dst, shells[r.path])
    todo = [r for r in routes if not only or r.tpl.replace('.html', '') in only]
    print(f'Рендер {len(todo)} страниц в {a.jobs} вкладки…')
    httpd = serve()
    results, errors = asyncio.run(prerender(todo, a.jobs))
    failed = [r for r in todo if r.path not in results]
    if failed:  # тяжёлые страницы, не успевшие под нагрузкой: ещё раз по одной
        print(f'Повторный рендер: {len(failed)}')
        for r in failed: r.retry = False
        res2, err2 = asyncio.run(prerender(failed, 1))
        results.update(res2)
        errors = [e for e in errors if e[0] not in results] + err2
    httpd.shutdown()
    for r in todo:
        snap = results.get(r.path)
        if not snap: continue
        r.h1 = snap['h1']
        if r.kind == 'catalog' and snap.get('empty') and r.s.split('.')[0] not in ('gpes', 'zvu', 'inv', 'freq', 'trafo', 'ips'):
            r.index = False  # подборка без товаров: закрыта от индекса
            shells[r.path] = shells[r.path].replace('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"', 'content="noindex, follow"')
        if r.s.split('.')[0] in ('gpes', 'zvu', 'inv', 'freq', 'trafo', 'ips') and r.kind == 'catalog':
            r.index = False
            shells[r.path] = shells[r.path].replace('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"', 'content="noindex, follow"')
        final = finalize(r, shells[r.path], snap)
        dst = os.path.join(OUT, r.file.lstrip('/'), 'index.html') if r.file.endswith('/') else os.path.join(OUT, r.file.lstrip('/'))
        wr(dst, final)

    reds = redirects(D) + find_product_dupes(D)
    wr(os.path.join(OUT, '.htaccess'), htaccess(routes, reds))
    wr(os.path.join(OUT, 'sitemap.xml'), sitemap(routes, D))
    wr(os.path.join(OUT, 'robots.txt'), ROBOTS)
    for f in ('send.php', 'send-config.php', 'README-HOSTING.md'):
        src = os.path.join(ROOT, 'tools', 'hosting', f)
        if os.path.exists(src): shutil.copy2(src, os.path.join(OUT, f))
    os.makedirs(os.path.join(OUT, 'leads'), exist_ok=True)
    wr(os.path.join(OUT, 'leads', '.htaccess'), 'Require all denied\n')

    # отчёт
    probs, dup_t, dup_d = audit([r for r in routes if r in todo])
    rep = ['# Отчёт сборки ' + NOW.strftime('%d.%m.%Y %H:%M'), '', f'Страниц: {len(routes)}, в индексе: {sum(1 for r in routes if r.index)}, отрендерено: {len(results)}/{len(todo)}', '']
    rep += ['## Ошибки рендера и консоли', ''] + [f'- {p}: {"; ".join(e)}' for p, e in errors] + ['']
    rep += ['## Замечания SEO', ''] + [f'- {k} {p} ({n}): {t}' for k, p, n, t in probs] + ['']
    rep += ['## Одинаковые title', ''] + [f'- {t}: {", ".join(p[:6])}' for t, p in dup_t.items()] + ['']
    rep += ['## Одинаковые description', ''] + [f'- {t[:90]}: {", ".join(p[:6])}' for t, p in dup_d.items()] + ['']
    rep += ['## Страницы', '', '| Адрес | Индекс | Title | Description |', '|---|---|---|---|']
    rep += [f'| {r.canon} | {"да" if r.index else "нет"} | {r.title} | {r.desc} |' for r in routes if r in todo]
    wr(os.path.join(BUILD, 'build-report.md'), '\n'.join(rep) + '\n')
    print(f'Ошибок рендера: {len(errors)}, замечаний SEO: {len(probs)}, дублей title: {len(dup_t)}, дублей description: {len(dup_d)}')
    print('Отчёт: build/build-report.md')

    if not a.no_zip:
        zp = os.path.join(BUILD, f'aecups-kz-{NOW.strftime("%Y%m%d")}.zip')
        if os.path.exists(zp): os.remove(zp)
        with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for dp, dns, fns in os.walk(OUT):
                for f in fns:
                    p = os.path.join(dp, f); arc = os.path.relpath(p, OUT).replace('\\', '/')
                    if arc.endswith('.pdf'): z.write(p, arc, compress_type=zipfile.ZIP_STORED)
                    else: z.write(p, arc)
        print(f'Архив: {zp} ({os.path.getsize(zp) / 1048576:.0f} МБ)')
    print(f'Готово за {time.time() - t0:.0f} с')

if __name__ == '__main__':
    main()
