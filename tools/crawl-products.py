# Обходит страницы товаров aecups.kz и собирает ссылки на PDF-спецификации -> crawl/woo/pages.json
# python tools/crawl-products.py   (нужны crawl/woo/products-N.json из Store API)
import json, re, sys, os, concurrent.futures, urllib.request, html
SP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "crawl", "woo")
P = []
for n in range(1, 8): P += json.load(open(f'{SP}/products-{n}.json', encoding='utf-8'))
def fetch(p):
    try:
        req = urllib.request.Request(p['permalink'], headers={'User-Agent': 'Mozilla/5.0'})
        s = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')
    except Exception as e:
        return {'id': p['id'], 'slug': p['slug'], 'error': str(e)}
    pdfs = sorted(set(html.unescape(u) for u in re.findall(r'href="([^"]+\.pdf)"', s, re.I)))
    # gallery images in woocommerce gallery / bricks product gallery
    gal = re.findall(r'(https://aecups\.kz/wp-content/uploads/[^"\s]+?\.(?:jpe?g|png|webp))', s, re.I)
    gal = [g for g in gal if not re.search(r'-\d+x\d+\.(jpe?g|png|webp)$', g, re.I)]
    gal = [g for g in dict.fromkeys(gal) if not re.search(r'logo|favikon|group-534814152|flag|icon', g, re.I)]
    return {'id': p['id'], 'slug': p['slug'], 'pdfs': pdfs, 'imgs': gal[:12]}
out = []
with concurrent.futures.ThreadPoolExecutor(8) as ex:
    for i, r in enumerate(ex.map(fetch, P)):
        out.append(r)
        if i % 50 == 0: print(i, flush=True)
json.dump(out, open(f'{SP}/pages.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print('done', len(out), 'errors', sum(1 for r in out if 'error' in r), 'with pdf', sum(1 for r in out if r.get('pdfs')))
