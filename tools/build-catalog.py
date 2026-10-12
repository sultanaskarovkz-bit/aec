# -*- coding: utf-8 -*-
"""Собирает site/assets/catalog.json и site/assets/catalog.js из выгрузки WooCommerce (crawl/woo/).

Источники:
  crawl/woo/products-N.json   /wp-json/wc/store/v1/products?per_page=100&page=N (без авторизации)
  crawl/woo/categories.json   /wp-json/wc/store/v1/products/categories
  crawl/woo/pages.json        результат tools/crawl-products.py: ссылки на PDF со страниц товаров
  crawl/woo/img-map.json      URL картинки -> имя файла в site/assets/img/products/
  crawl/woo/pdf-media.json    список PDF из медиатеки (название, URL)

Запуск: python tools/build-catalog.py [--no-download]
PDF скачиваются в site/assets/docs/ (только те, на которые ссылаются страницы товаров).
"""
import json, re, os, sys, html, urllib.request, urllib.parse, collections

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
WOO = os.path.join(ROOT, 'crawl', 'woo')
SITE = os.path.join(ROOT, 'site')
DOCS = os.path.join(SITE, 'assets', 'docs')
IMGP = os.path.join(SITE, 'assets', 'img', 'products')
NO_DL = '--no-download' in sys.argv

def load(name, default=None):
    p = os.path.join(WOO, name)
    if not os.path.exists(p): return default
    return json.load(open(p, encoding='utf-8'))

P = []
for n in range(1, 20):
    chunk = load(f'products-{n}.json')
    if chunk is None: break
    P += chunk
CATS = {c['id']: c for c in load('categories.json', [])}
PAGES = {r['id']: r for r in load('pages.json', [])}
IMGMAP = load('img-map.json', {})
PDFMEDIA = {m['file']: m for m in load('pdf-media.json', [])}
PDFSIZES = load('pdf-sizes.json', {})

TOP = {'ibp-istochniki-besperebojnogo-pitaniya': 'ibp', 'generatory-2': 'dgu', 'akb': 'akb', 'stabilizatory': 'stab', 'staticheskie-pereklyuchateli-sts': 'sts'}
LEAD = {'ibp': '4–6 недель', 'dgu': '8–12 недель', 'akb': '2–4 недели', 'stab': '3–5 недель', 'sts': '6–8 недель'}
BRAND_NAME = {'KEHUA TECH': 'Kehua Tech', 'KEHUA': 'Kehua Tech', 'HOPPECKE': 'Hoppecke', 'RITAR': 'Ritar', 'BaiFa': 'BAIFA Power', 'BAIFA Power': 'BAIFA Power', 'AGG': 'AGG Power', 'AGG Power': 'AGG Power', 'Sprinter': 'Exide Sprinter', 'DEUTZ': 'Deutz', 'BAE Batterien': 'BAE Batterien'}
BRAND_ID = {'Kehua Tech': 'kehua-tech', 'Hoppecke': 'hoppecke', 'Ritar': 'ritar', 'BAIFA Power': 'baifa', 'AGG Power': 'agg', 'Exide Sprinter': 'sprinter', 'Salicru': 'salicru', 'Tescom': 'tescom', 'BAE Batterien': 'bae-batterien', 'EnerGrid': 'energrid', 'EverExceed': 'everexceed', 'Deutz': 'deutz'}
IND_BY_CAT = {'ibp-dlya-czod-servera': 'czod', 'ibp-dlya-bolnicz': 'med', 'ibp-dlya-kt-mrt': 'med', 'ibp-dlya-operacionnyh-i-reanimacionnyh-blokov': 'med', 'ibp-dlya-linii-proizvodstv': 'prom', 'promyshlennye-ibp': 'prom', 'ibp-dlya-neftegaza': 'oil', 'ibp-dlya-biznes-centrov-trc': 'office', 'ibp-dlya-kompyuternih-clubov': 'office', 'ibp-dlya-stankov': 'machines', 'ibp-dlya-avarijnyh-sistem': 'emergency'}
IND_DEFAULT = {'dgu': ['oil', 'prom', 'office', 'med', 'czod'], 'akb': ['czod', 'med', 'prom', 'oil', 'telecom'], 'stab': ['prom', 'machines', 'oil', 'office'], 'sts': ['czod', 'med', 'telecom']}

def strip(s): return html.unescape(re.sub(r'<[^>]+>', ' ', s or '')).replace('\xa0', ' ').strip()
def ws(s): return re.sub(r'\s+', ' ', s or '').strip()
def attr(p, tax):
    for a in p['attributes']:
        if a['taxonomy'] == tax: return [t['name'] for t in a['terms']]
    return []
def first(p, tax): a = attr(p, tax); return a[0] if a else ''
def table(p):
    out = []
    for m in re.finditer(r'<tr>\s*<th>(.*?)</th>\s*<td>(.*?)</td>', p['description'], re.S):
        k, v = ws(strip(m.group(1))), ws(strip(m.group(2)))
        if k and v and not re.match(r'^(не указан|—|-)', v, re.I): out.append([k, v])
    return out
def tget(t, *keys):
    for k in keys:
        for kk, v in t:
            if kk.lower() == k.lower(): return v
    for k in keys:
        for kk, v in t:
            if k.lower() in kk.lower(): return v
    return ''
def paragraphs(p):
    body = p['description'].split('<table')[0]
    ps = [ws(strip(x)) for x in re.findall(r'<p[^>]*>(.*?)</p>', body, re.S)]
    ps = [x for x in ps if len(x) > 40 and not x.startswith('«')]
    return ps[:4]
def topcat(p):
    for c in p['categories']:
        x = CATS.get(c['id'], c)
        seen = 0
        while x and x.get('parent') and seen < 6: x = CATS.get(x['parent']); seen += 1
        if x and x['slug'] in TOP: return TOP[x['slug']]
    return None
def num(s):
    m = re.search(r'\d+(?:[.,]\d+)?', s or '')
    return float(m.group(0).replace(',', '.')) if m else None
def rng(s):
    ns = [float(x.replace(',', '.')) for x in re.findall(r'\d+(?:[.,]\d+)?', s or '')]
    return (ns[0], ns[-1]) if ns else (None, None)
def fmtnum(v):
    if v is None: return None
    return int(v) if float(v).is_integer() else round(v, 1)

def clean_dims(raw):
    """'1100 × 1300 × 2000 мм' / '999×999×999' / '70 × 51 × 17 8 см' -> 'Ш×Г×В мм' или ''."""
    if not raw: return ''
    s = raw.replace('х', '×').replace('x', '×').replace('X', '×').replace('*', '×')
    unit_cm = 'см' in s.lower()
    parts = [x.strip() for x in s.split('×')]
    if len(parts) != 3: return ''
    vals = []
    for part in parts:
        part = re.sub(r'[^\d.,\s]', '', part).strip()
        if not part: return ''
        m = re.match(r'^(\d+)\s+(\d)$', part)            # «17 8» = 17.8 (потерянная десятичная точка)
        if m: part = m.group(1) + '.' + m.group(2)
        part = part.replace(',', '.').replace(' ', '')
        try: v = float(part)
        except ValueError: return ''
        if unit_cm: v *= 10
        vals.append(v)
    if any(v < 20 or v > 6000 for v in vals): return ''
    return '×'.join(str(int(round(v))) for v in vals) + ' мм'

def clean_weight(raw):
    if not raw: return ''
    m = re.search(r'(\d+(?:[.,]\d+)?)\s*(?:кг|kg)?', raw)
    if not m: return ''
    v = float(m.group(1).replace(',', '.'))
    if v <= 0 or v > 50000: return ''
    extra = ''
    m2 = re.search(r'/\s*(\d+(?:[.,]\d+)?)\s*кг\s*с электролитом', raw)
    if m2: extra = ' (с электролитом ' + m2.group(1).replace('.', ',') + ' кг)'
    return (str(int(v)) if v.is_integer() else str(v).replace('.', ',')) + ' кг' + extra

def eff_of(t):
    s = tget(t, 'Эффективность', 'КПД')
    ns = re.findall(r'(\d{2}(?:[.,]\d)?)\s*%', s)
    if not ns: return ''
    return ns[0].replace('.', ',') + (' / ' + ns[1].replace('.', ',') if len(ns) > 1 else '')

def series_of(cat, brand, model, p, t):
    ser = attr(p, 'pa_seriya')
    m = (model or '').upper()
    if cat == 'ibp':
        if brand == 'Salicru':
            for key, name in [('ADAPT2', 'SLC ADAPT2'), ('ADAPT', 'SLC ADAPT'), ('TWIN RT3', 'SLC TWIN RT3'), ('TWIN RT2', 'SLC TWIN RT2'), ('TWIN PRO3', 'SLC TWIN PRO3'), ('PRO3', 'SLC TWIN PRO3'), ('TWIN PRO2', 'SLC TWIN PRO2'), ('PRO2', 'SLC TWIN PRO2'), ('CUBE3', 'SLC CUBE3+'), ('CUBE4', 'SLC CUBE4'), ('XPERT', 'SLC X-PERT'), ('X-PERT', 'SLC X-PERT'), ('XTRA', 'SLC X-TRA'), ('X-TRA', 'SLC X-TRA')]:
                if key in m: return name
            return 'SLC'
        if brand == 'Kehua Tech':
            if 'FR-UK' in m: return 'FR-UK'
            if 'KR-RM' in m or m.endswith('-RM') or '— RM' in m: return 'KR-RM'
            if 'KR33-H' in m: return 'KR33-H'
            if m.startswith('KR33'): return 'KR33'
            if m.startswith('MR33'): return 'MR33'
            if m.startswith('MY'): return 'MY'
            if m.startswith('KR') and '+' in m: return 'KR11 Plus'
            if 'UPS+S' in m: return 'UPS+S³'
            return 'KR'
        if brand == 'Tescom':
            if 'MTW' in m: return 'MTW'
            if 'NEOLINE' in m: return 'NEOLINE'
            if 'TSC' in m: return 'TSC'
            if 'TEOS' in m: return 'TEOS'
        return (ser and ser[0]) or (tget(t, 'Серия') or '').replace(' Series', '') or ''
    if cat == 'akb':
        j = ' '.join(ser)
        if brand == 'Hoppecke':
            if 'VR M' in j: return 'grid power VR M'
            if 'V H' in j: return 'grid power V H'
            if 'OPzS' in j or 'OPZS' in m: return 'OPzS'
            if 'OPzV' in j or 'OPZV' in m: return 'OPzV'
        if brand == 'BAE Batterien':
            for k in ['OPzS', 'OPzV', 'OGiV', 'OGi']:
                if k in j or k.upper() in m: return 'Secura ' + k
        if brand == 'EnerGrid':
            for k in ['HRL', 'HR', 'GPL', 'GP', 'FT']:
                if m.startswith(k): return k
        if brand == 'Ritar':
            for k in ['HR', 'RA', 'RT']:
                if m.startswith(k): return k
        if brand == 'Exide Sprinter': return 'Sprinter Pure Power'
        return (ser and ser[0]) or ''
    if cat == 'stab':
        if brand == 'Tescom': return 'STK' if m.startswith('STK') else 'TSVR'
        if brand == 'Salicru':
            for k in ['EMi3 M', 'EMi3 T', 'RE3 M', 'RE3 T', 'RET', 'RE']:
                if m.startswith(k.upper()): return k
        if brand == 'EverExceed':
            for k in ['SBW', 'SVC', 'TNS']:
                if k in m: return k
        return (ser and ser[0]) or ''
    if cat == 'sts':
        return 'STS2000' if m.startswith('STS2') else 'STS3000' if m.startswith('STS3') else 'STS4000'
    if cat == 'dgu':
        eng = first(p, 'pa_dvigatel') or tget(t, 'Двигатель')
        mm = re.search(r'серии ([^,]+?), от', p['name'])
        if brand == 'Tescom': return 'TDJ (' + eng + ')'
        if brand == 'AGG Power': return 'AGG (' + (eng or (mm.group(1).strip() if mm else '')) + ')'
        if mm: return mm.group(1).strip() if '(' in mm.group(1) else mm.group(1).strip() + ' (' + eng + ')' if eng and eng not in mm.group(1) else mm.group(1).strip()
        return eng
    return ''

def model_of(p, t, cat):
    mdl = tget(t, 'Модель')
    if mdl and len(mdl) <= 40 and not re.search(r'стабилизатор|ибп|генератор|батарея|переключатель', mdl, re.I): return ws(mdl)
    name = p['name']
    m = re.match(r'^.*?\b(?:Salicru|Tescom|KEHUA TECH|KEHUA|HOPPECKE|BAE Batterien|BAE|EnerGrid|EverExceed|RITAR|Sprinter|Exide|AGG Power|BAIFA Power)\s+([^,]+?)(?:,|\s+\d+\s*(?:кВА|А·ч|А)|$)', name)
    return ws(m.group(1)) if m else ws(name)

def fix_name(name):
    name = ws(html.unescape(name))
    name = re.sub(r'(\d+(?:[.,]\d+)?)\s+\1\s*кВА', r'\1, \1 кВА', name)   # «ADAPT2 50 50 кВА» -> «ADAPT2 50, 50 кВА»
    if not re.search(r',\s*\d+(?:[.,]\d+)?\s*(?:кВА|А·ч|ВА|А)\b', name):      # «TWIN PRO2 0,7 кВА» -> «TWIN PRO2, 0,7 кВА»
        name = re.sub(r'([^,\s])\s+(\d+(?:[.,]\d+)?\s*(?:кВА|А·ч|ВА|А)\b)', r'\1, \2', name, count=1)
    name = name.replace('KEHUA TECH', 'Kehua Tech').replace('KEHUA ', 'Kehua ').replace('HOPPECKE', 'Hoppecke').replace('RITAR', 'Ritar').replace('BaiFa', 'BAIFA Power')
    return name

def slugify(s):
    s = urllib.parse.unquote(s).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def size_str(b):
    if not b or b < 0: return ''
    return (str(round(b / 1e6, 1)).replace('.', ',') + ' МБ') if b >= 1e6 else (str(int(round(b / 1e3))) + ' КБ')

# ---------- PDF ----------
def pdf_key(fname):
    """Ключ дедупликации: имя без суффикса -1/-2 и расширения."""
    return re.sub(r'-\d+(?=\.pdf$)', '', fname.lower())
def doc_name(fname):
    m = PDFMEDIA.get(fname)
    t = ws(html.unescape(m['title'])) if m else fname.rsplit('.', 1)[0]
    t = re.sub(r'^\d+[._]\s*', '', t).replace('_', ' ')
    t = re.sub(r'\s*\(\d\)$', '', t)
    return t

pdf_targets = {}   # ключ -> {file, url, size}
def register_pdf(url):
    fname = urllib.parse.unquote(url.split('/')[-1])
    key = pdf_key(fname)
    size = PDFSIZES.get(fname, 0)
    cur = pdf_targets.get(key)
    if not cur or (size and cur['size'] == size and fname < cur['file']):
        pdf_targets[key] = {'file': key.split('/')[-1] if key.endswith('.pdf') else key + '.pdf', 'src': fname, 'url': url, 'size': size}
    return key

# ---------- Сборка ----------
products, seen_names, seen_slugs = [], set(), set()
stats = collections.Counter()
for p in sorted(P, key=lambda x: x['id']):
    cat = topcat(p)
    if not cat: stats['skip:no-cat'] += 1; continue
    slug = slugify(p['slug'])
    nm = ws(html.unescape(p['name']))
    if slug.endswith('-kopirovat') or (nm in seen_names and re.search(r'-\d$', slug)):
        stats['skip:duplicate'] += 1; continue
    if nm in seen_names: stats['skip:duplicate'] += 1; continue
    seen_names.add(nm)
    if slug in seen_slugs: slug += '-' + str(p['id'])
    seen_slugs.add(slug)
    t = table(p)
    brand_raw = first(p, 'pa_brend') or (p['brands'][0]['name'] if p['brands'] else first(p, 'pa_proizvoditel')) or tget(t, 'Бренд')
    brand = BRAND_NAME.get(brand_raw, brand_raw)
    brand_id = BRAND_ID.get(brand) or (p['brands'][0]['slug'] if p['brands'] else slugify(brand))
    if cat == 'dgu' and p['brands']:
        # для ДГУ таксономия brands содержит бренд двигателя, а бренд установки лежит в pa_brend
        engine_brand = p['brands'][0]['name']
    model = model_of(p, t, cat)
    series = series_of(cat, brand, model, p, t)
    if cat == 'dgu': model = series   # у ДГУ позиция = серия (диапазон моделей)
    # мощность / ёмкость / ток
    kva = kw = kva_max = kw_max = None
    if cat == 'ibp':
        kva = num(first(p, 'pa_power-kva') or tget(t, 'Мощность')); kw = num(first(p, 'pa_aktivnaya-moshhnost-kvt'))
        if kw is None:
            ap = tget(t, 'Активная мощность'); n = num(ap)
            if n is not None: kw = n / 1000 if 'Вт' in ap and 'кВт' not in ap else n
        pf = num(first(p, 'pa_power-factor') or tget(t, 'Коэффициент мощности')) or 1
        if kw is None and kva is not None: kw = kva * pf
        if kva is None and kw is not None: kva = kw / pf
    elif cat == 'stab':
        kva = num(first(p, 'pa_moshhnost') or tget(t, 'Мощность') or p['name'])
        if kva and 'ВА' in (first(p, 'pa_moshhnost') or '') and 'кВА' not in (first(p, 'pa_moshhnost') or ''): kva = kva / 1000
        pf = 1; kw = kva
    elif cat == 'sts':
        kva = num(first(p, 'pa_nominalnyj-tok-a') or tget(t, 'Номинальный ток')); pf = 1; kw = kva
    elif cat == 'akb':
        kva = num(first(p, 'pa_yomkost-ah') or tget(t, 'Номинальная емкость', 'Ёмкость')); pf = 1; kw = kva
    elif cat == 'dgu':
        kva, kva_max = rng(first(p, 'pa_power-kva') or tget(t, 'Резервная мощность ESP') or p['name']); pf = 0.8
        kw, kw_max = rng(first(p, 'pa_moshhnost-kvt'))
        if kw is None and kva is not None: kw, kw_max = kva * 0.8, (kva_max or kva) * 0.8
    if kva is None: stats['skip:no-power'] += 1; continue
    # фазы, исполнение, топология, архитектура, батареи
    phases = topology = form = arch = battery = ''
    sub = []
    if cat == 'ibp':
        fin, fout = first(p, 'pa_fazy-na-vhode'), first(p, 'pa_fazy-na-vyhode')
        if not fin:
            fz = tget(t, 'Фазность', 'Вход / выход').lower(); fin = '3' if 'трехфазный вход' in fz or fz.startswith('3') else '1'; fout = '3' if 'трехфазный выход' in fz or '/ 3' in fz else fin or '1'
        phases = f'{fin}/{fout or fin}'
        arch = first(p, 'pa_arhitektura') or tget(t, 'Архитектура')
        if not arch: arch = 'Модульная' if re.search(r'модульн', tget(t, 'Тип ИБП / топология') + tget(t, 'Исполнение'), re.I) else 'Моноблочная'
        topology = 'On-line (двойное преобразование)' + (', модульный' if arch == 'Модульная' else '')
        ff = attr(p, 'pa_install'); ffs = ' '.join(ff) or tget(t, 'Исполнение', 'Форм-фактор')
        if 'Стоеч' in ffs and 'Наполь' in ffs: form = 'Rack/Tower'
        elif 'Стоеч' in ffs or 'rack' in ffs.lower(): form = 'Стоечный (Rack)'
        else: form = 'Напольный'
        bc = first(p, 'pa_konfiguracziya-akb') or tget(t, 'Батареи / автономия', 'Аккумуляторная батарея', 'Конфигурация АКБ')
        battery = 'встроенные' if re.search(r'встроен', bc, re.I) and not re.search(r'внешн', bc, re.I) else 'внешние' if re.search(r'внешн|дополнительн', bc, re.I) else 'встроенные и внешние' if re.search(r'встроен', bc, re.I) else ''
        sub = ['odnofaznye' if fin == '1' else 'tryohfaznye'] + (['modulnye'] if arch == 'Модульная' else []) + (['stoechnye'] if 'Rack' in form or 'Стоеч' in form else [])
    elif cat == 'stab':
        tf = first(p, 'pa_tip-faznost') or tget(t, 'Фазность', 'Тип')
        phases = '3' if re.search(r'тр[её]х|3', tf) else '1'
        tech = first(p, 'pa_tehnologiya-stabilizaczii') or tget(t, 'Технология стабилизации', 'Тип / топология')
        cs = [c['slug'] for c in p['categories']]
        if 'relejnye-stabilizatory-napryazheniya' in cs: topology = 'Релейный (ступенчатый)'; sub.append('relejnye')
        elif re.search(r'электромех|серво', tech, re.I) or 'elektromehanicheskie-stabilizatory-napryazheniya' in cs: topology = 'Электромеханический (сервоприводный)'; sub.append('elektromehanicheskie')
        else: topology = 'Электронный (тиристорный)'; sub.append('elektronnye')
        form = 'Настенный' if re.search(r'настен', tget(t, 'Исполнение'), re.I) else 'Напольный'
        sub.insert(0, 'odnofaznye' if phases == '1' else 'tryohfaznye')
    elif cat == 'sts':
        poles = first(p, 'pa_kolichestvo-polyusov') or tget(t, 'Количество полюсов')
        f = first(p, 'pa_faznost') or tget(t, 'Количество фаз')
        phases = '1' if f.startswith('1') else f'3 ({poles}-полюсный)' if poles else '3'
        topology = 'Статический переключатель'
        form = 'Стоечный' if 'Стоеч' in ' '.join(attr(p, 'pa_install')) else 'Напольный'
        sub = ['odnofaznye' if phases == '1' else 'tryohfaznye']
    elif cat == 'akb':
        v = first(p, 'pa_voltage') or tget(t, 'Номинальное напряжение')
        vn = num(v) or (2 if re.search(r'\bOPz[SV]\b|OGi', model) and not model.startswith('12') else 12)
        form = f'{int(vn)} В'
        tech = first(p, 'pa_tehnologiya') or tget(t, 'Технология')
        topology = re.sub(r'^([A-Za-z]+),\s*', r' ', tech or '').strip()
        sub = [{2: '2v', 6: '6v', 12: '12v'}.get(int(vn), '12v')]
        if re.search(r'литий|li-ion|lifepo', nm, re.I): sub = ['li-ion']
    elif cat == 'dgu':
        isp = attr(p, 'pa_ispolnenie') or [tget(t, 'Исполнение')]
        parts = []
        for x in isp:
            x = x.lower()
            if 'откр' in x: parts.append('Открытое'); sub.append('otkrytye')
            if 'кожух' in x: parts.append('В шумозащитном кожухе'); sub.append('v-kozhuhe')
            if 'контейнер' in x: parts.append('В контейнере'); sub.append('v-kontejnere')
        form = ' / '.join(dict.fromkeys(parts)) or 'Открытое / в кожухе'
        phases = '3ф 400 В'
        topology = ''
    # интерфейсы
    ifs = attr(p, 'pa_podderzhivaemye-interfejsy')
    if not ifs:
        raw = tget(t, 'Интерфейсы и мониторинг', 'Стандартные интерфейсы', 'Интерфейсы')
        ifs = [re.sub(r'\s*(стандартно|опционально|опция|в стандарте)\s*', '', ws(x), flags=re.I).strip() for x in re.split(r'[;,]| и ', raw)]
        ifs = [x for x in ifs if 1 < len(x) < 30 and not x.lower().startswith(('в зависимости', 'см.'))][:8]
    # габариты, масса, КПД, IP
    dims = clean_dims(tget(t, 'Габариты (Д × Ш × В)', 'Габариты (Д×Ш×В)', 'Габариты (Ш × Г × В)', 'Габариты (Г×Ш×В), мм', 'Габариты стандартного исполнения', 'Габариты ИБП', 'Габариты'))
    weight = clean_weight(tget(t, 'Вес', 'Масса', 'Вес, кг', 'Вес стандартного исполнения'))
    eff = eff_of(t) if cat in ('ibp', 'stab', 'sts') else ''
    ip = (re.search(r'IP\s?\d\d', tget(t, 'Степень защиты') + ' ' + p['description']) or [''])[0].replace(' ', '')
    # нормализованные ключи, которые читает интерфейс
    spec = {}
    if cat == 'dgu':
        spec['Двигатель'] = first(p, 'pa_dvigatel') or tget(t, 'Двигатель')
        spec['Частота вращения'] = tget(t, 'Частота вращения') or '1500 об/мин'
        spec['Альтернатор'] = ' / '.join(attr(p, 'pa_alternator')) or tget(t, 'Альтернатор')
        spec['Диапазон мощности'] = f'{fmtnum(kva)}–{fmtnum(kva_max)} кВА'
    if cat == 'akb':
        spec['Технология'] = topology
        spec['Напряжение'] = form
        spec['Ёмкость C10'] = f'{fmtnum(kva)} А·ч'
        spec['Срок службы (проектный)'] = first(p, 'pa_srok-sluzhby') or tget(t, 'Расчетный срок службы', 'Срок службы')
        spec['Тип электролита'] = first(p, 'pa_tip-elektrolita')
    if cat == 'stab':
        spec['Диапазон входного напряжения'] = tget(t, 'Диапазон входного напряжения')
        spec['Точность стабилизации'] = tget(t, 'Точность стабилизации')
        spec['Выходное напряжение'] = first(p, 'pa_vyhodnoe-napryazhenie') or tget(t, 'Выходное напряжение', 'Номинальное выходное напряжение')
    if cat == 'sts':
        spec['Время переключения'] = tget(t, 'Время переключения')
        spec['Количество полюсов'] = first(p, 'pa_kolichestvo-polyusov')
    if cat == 'ibp':
        spec['Диапазон входного напряжения'] = tget(t, 'Диапазон входного напряжения')
        spec['Диапазон входной частоты'] = first(p, 'pa_diapazon-vhodnoj-chastoty') or tget(t, 'Диапазон входной частоты')
        spec['Перегрузочная способность'] = tget(t, 'Перегрузочная способность')
    spec = {k: v for k, v in spec.items() if v}
    # отрасли
    inds = []
    for c in p['categories']:
        i = IND_BY_CAT.get(c['slug'])
        if i and i not in inds: inds.append(i)
    if not inds: inds = list(IND_DEFAULT.get(cat, []))
    if cat == 'akb' and 'Телекоммуникации' in ' '.join(attr(p, 'pa-sfera-primeneniya') or attr(p, 'pa_sfera-primeneniya')) and 'telecom' not in inds: inds.append('telecom')
    # фото
    photos = [IMGMAP.get(im['src']) for im in p['images'] if IMGMAP.get(im['src'])]
    photos = [ph for ph in photos if os.path.exists(os.path.join(IMGP, ph))]
    # документы
    docs = []
    for u in PAGES.get(p['id'], {}).get('pdfs', []):
        key = register_pdf(u)
        tgt = pdf_targets[key]
        docs.append({'name': doc_name(tgt['src']), 'file': tgt['file'], 'size': size_str(tgt['size'])})
    docs = list({d['file']: d for d in docs}.values())
    # иллюстрация-заглушка (если фото нет)
    img = {'ibp': 'modular' if arch == 'Модульная' else 'rack' if 'Rack' in form or 'Стоеч' in form else 'tower', 'dgu': 'container' if 'v-kontejnere' in sub and len(sub) == 1 else 'genset', 'akb': 'cell' if form == '2 В' else 'battery', 'stab': 'stab', 'sts': 'sts'}[cat]
    products.append({
        'id': 'w' + str(p['id']), 'slug': slug, 'name': fix_name(p['name']), 'model': model, 'sku': ws(p['sku']),
        'brand': brand, 'brandId': brand_id, 'cat': cat, 'series': series, 'sub': sub,
        'kva': fmtnum(kva), 'kw': fmtnum(kw), 'kvaMax': fmtnum(kva_max), 'kwMax': fmtnum(kw_max),
        'price': None, 'stock': 'order', 'lead': LEAD[cat],
        'img': img, 'photo': photos[0] if photos else None, 'photos': photos,
        'industries': inds, 'docs': docs, 'spec': spec, 'table': t,
        'phases': phases, 'topology': topology, 'form': form, 'arch': arch, 'pf': pf, 'eff': eff, 'battery': battery,
        'interfaces': ifs, 'ip': ip, 'warranty': None, 'dims': dims, 'weight': weight, 'parallel': tget(t, 'Параллельная работа'),
        'short': ws(strip(p['short_description'])), 'desc': paragraphs(p),
        'wc': {'id': p['id'], 'slug': p['slug'], 'permalink': p['permalink'], 'categories': [c['slug'] for c in p['categories']], 'tags': [x['name'] for x in p['tags']], 'brands': [b['slug'] for b in p['brands']]}
    })
    stats['ok:' + cat] += 1

# ---------- PDF: скачать ----------
os.makedirs(DOCS, exist_ok=True)
dl = 0
for key, tgt in pdf_targets.items():
    dst = os.path.join(DOCS, tgt['file'])
    if os.path.exists(dst) and os.path.getsize(dst) > 0: continue
    if NO_DL: continue
    try:
        data = urllib.request.urlopen(urllib.request.Request(urllib.parse.quote(tgt['url'], safe=':/'), headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
        open(dst, 'wb').write(data); dl += 1
    except Exception as e: print('PDF FAIL', tgt['url'], e)
for pr in products:
    for d in pr['docs']:
        f = os.path.join(DOCS, d['file'])
        if os.path.exists(f): d['size'] = size_str(os.path.getsize(f))

# ---------- Запись ----------
out = {'generated': __import__('datetime').date.today().isoformat(), 'source': 'aecups.kz WooCommerce Store API', 'count': len(products), 'products': products}
json.dump(out, open(os.path.join(SITE, 'assets', 'catalog.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
DETAIL_KEYS = ('table', 'desc', 'short', 'wc')
compact = []
for pr in products:
    c = {k: v for k, v in pr.items() if k not in DETAIL_KEYS and v not in (None, '', [], {})}
    if c.get('photos') == [c.get('photo')]: c.pop('photos')
    compact.append(c)
details = {pr['id']: {k: pr[k] for k in DETAIL_KEYS} for pr in products}
with open(os.path.join(SITE, 'assets', 'catalog.js'), 'w', encoding='utf-8') as f:
    f.write('/* Сгенерировано tools/build-catalog.py из crawl/woo. Не править руками. Компактные поля; таблицы характеристик и описания в catalog-details.js */\nwindow.AEC_CATALOG = ')
    f.write(json.dumps({'generated': out['generated'], 'count': len(compact), 'products': compact}, ensure_ascii=False, separators=(',', ':')))
    f.write(';\n')
with open(os.path.join(SITE, 'assets', 'catalog-details.js'), 'w', encoding='utf-8') as f:
    f.write('/* Сгенерировано tools/build-catalog.py. Полные таблицы характеристик, описания и исходные данные WooCommerce по id. Подключается только на product.html */\nwindow.AEC_CATALOG_DETAILS = ')
    f.write(json.dumps(details, ensure_ascii=False, separators=(',', ':')))
    f.write(';\n')
print(dict(stats))
print('products', len(products), '| with photo', sum(1 for x in products if x['photo']), '| with docs', sum(1 for x in products if x['docs']), '| pdf files', len(pdf_targets), 'downloaded', dl)
print('by cat', collections.Counter(x['cat'] for x in products))
print('series', collections.Counter((x['cat'], x['brand'], x['series']) for x in products).most_common())
print('no dims', sum(1 for x in products if not x['dims']), '| no weight', sum(1 for x in products if not x['weight']))
print('catalog.js', os.path.getsize(os.path.join(SITE, 'assets', 'catalog.js')) // 1024, 'KB | catalog-details.js', os.path.getsize(os.path.join(SITE, 'assets', 'catalog-details.js')) // 1024, 'KB')
