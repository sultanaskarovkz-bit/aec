# Скачивает оригиналы фото товаров из медиатеки aecups.kz по crawl/woo/img-map.json в site/assets/img/products
# python tools/fetch-product-images.py
import json, os, re, concurrent.futures, urllib.request, urllib.parse, sys
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'crawl', 'woo')
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site', 'assets', 'img', 'products')
os.makedirs(DST, exist_ok=True)
P = []
for n in range(1, 8): P += json.load(open(f'{SP}/products-{n}.json', encoding='utf-8'))
urls = {}
for p in P:
    for im in p['images']: urls[im['src']] = 1
def name(u):
    b = u.split('/')[-1]
    b = re.sub(r'-optimized', '', b)
    b = re.sub(r'\.jpeg$', '.jpg', b, flags=re.I)
    return b.lower()
MAP = json.load(open(f'{SP}/img-map.json', encoding='utf-8')) if os.path.exists(f'{SP}/img-map.json') else {}
def fname(u): return MAP.get(u) or name(u)
def get(u):
    dst = os.path.join(DST, fname(u))
    if os.path.exists(dst) and os.path.getsize(dst) > 0: return 'skip'
    try:
        req = urllib.request.Request(urllib.parse.quote(u, safe=':/'), headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=60).read()
        open(dst, 'wb').write(data); return 'ok'
    except Exception as e: return 'FAIL ' + u + ' ' + str(e)
with concurrent.futures.ThreadPoolExecutor(8) as ex:
    res = list(ex.map(get, urls))
print(len(urls), 'urls;', res.count('ok'), 'ok;', res.count('skip'), 'skip;', [r for r in res if r.startswith('FAIL')])
json.dump({u: fname(u) for u in urls}, open(f'{SP}/img-map.json', 'w', encoding='utf-8'), indent=0)
