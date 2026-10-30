# -*- coding: utf-8 -*-
"""
Полная копия медиафайлов старого сайта aecups.kz (WordPress) перед его удалением.

Что собирает:
  1. Все вложения медиатеки через REST API (/wp-json/wp/v2/media): оригиналы и все нарезанные размеры.
  2. Все адреса страниц из карт сайта Yoast (sitemap_index.xml) и все ссылки на /wp-content/uploads/ в HTML этих страниц
     (src, srcset, href, style url(), data-атрибуты), включая WebP-копии и картинки, загруженные мимо медиатеки.
Куда: crawl/wp-uploads/<путь после /wp-content/uploads/> (папка не в git), список: crawl/wp-media.json, crawl/wp-urls.json.
Повторный запуск докачивает только недостающее.
Запуск: python -X utf8 tools/fetch-wp-uploads.py [--no-pages | --rescan]
"""
import concurrent.futures as cf, io, json, os, re, sys, time
from urllib.parse import urljoin, urlparse, unquote
import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DST = os.path.join(ROOT, 'crawl', 'wp-uploads')
SITE = 'https://aecups.kz'
EXT = ('.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg', '.ico', '.bmp', '.tif', '.tiff', '.pdf', '.mp4', '.webm', '.mov', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.dwg')
S = requests.Session()
S.headers['User-Agent'] = 'Mozilla/5.0 (AEC site migration backup)'

def get(url, **kw):
    for i in range(4):
        try:
            r = S.get(url, timeout=60, **kw)
            if r.status_code in (429, 500, 502, 503, 504): time.sleep(2 + i * 3); continue
            return r
        except requests.RequestException:
            time.sleep(2 + i * 3)
    return None

def media_api():
    items, page = [], 1
    while True:
        r = get(f'{SITE}/wp-json/wp/v2/media?per_page=100&page={page}&_fields=id,source_url,mime_type,media_details,title,date')
        if not r or r.status_code != 200: break
        d = r.json()
        if not d: break
        items += d; page += 1
        if page > int(r.headers.get('X-WP-TotalPages', page)): break
    json.dump(items, io.open(os.path.join(ROOT, 'crawl', 'wp-media.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    urls = set()
    for x in items:
        if x.get('source_url'): urls.add(x['source_url'])
        md = x.get('media_details') or {}
        for sz in (md.get('sizes') or {}).values():
            if sz.get('source_url'): urls.add(sz['source_url'])
        if md.get('original_image') and x.get('source_url'):  # оригинал до масштабирования WordPress (-scaled)
            urls.add(x['source_url'].rsplit('/', 1)[0] + '/' + md['original_image'])
    print(f'Медиатека: {len(items)} вложений, {len(urls)} файлов с размерами')
    return urls

UP_RE = re.compile(r'''(?:https?:)?(?://aecups\.kz)?(/wp-content/uploads/[^\s"'()<>,]+)''', re.I)
def sitemap_pages():
    pages, imgs = set(), set()
    r = get(SITE + '/sitemap_index.xml')
    subs = re.findall(r'<loc>([^<]+)</loc>', r.text) if r else []
    for sm in subs:
        rr = get(sm)
        if not rr: continue
        for block in re.findall(r'<url>(.*?)</url>', rr.text, re.S):
            loc = re.search(r'<loc>([^<]+)</loc>', block)
            if loc: pages.add(loc.group(1).strip())
            for im in re.findall(r'<image:loc>([^<]+)</image:loc>', block): imgs.add(im.strip())
    print(f'Карты сайта: {len(subs)} файлов, {len(pages)} страниц, {len(imgs)} картинок')
    return sorted(pages), imgs

def scan_page(url):
    r = get(url)
    if not r or r.status_code != 200 or 'html' not in r.headers.get('Content-Type', ''): return url, set(), getattr(r, 'status_code', 0)
    found = set()
    for m in UP_RE.finditer(r.text.replace('\\/', '/')):
        p = m.group(1).split('?')[0].split('#')[0].rstrip('.;')
        if p.lower().endswith(EXT): found.add(SITE + p)
    return url, found, r.status_code

def local_path(url):
    p = unquote(urlparse(url).path)
    rel = p.split('/wp-content/uploads/', 1)[1]
    return os.path.join(DST, *rel.split('/'))

def download(url):
    dst = local_path(url)
    if os.path.exists(dst) and os.path.getsize(dst) > 0: return url, 'есть', os.path.getsize(dst)
    r = get(url, stream=True)
    if not r or r.status_code != 200: return url, f'ошибка {getattr(r, "status_code", "сеть")}', 0
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    tmp = dst + '.part'
    with open(tmp, 'wb') as f:
        for chunk in r.iter_content(1 << 16): f.write(chunk)
    os.replace(tmp, dst)
    return url, 'скачан', os.path.getsize(dst)

def rescan():
    """Повторно просмотреть страницы, которые сервер не отдал (статус 0), в 2 потока, и докачать найденное."""
    wu = os.path.join(ROOT, 'crawl', 'wp-urls.json')
    data = json.load(io.open(wu, encoding='utf-8'))
    todo = [u for u, st in data['pages'].items() if st != 200]
    lst = os.path.join(ROOT, 'crawl', 'wp-uploads-list.txt')
    urls = set(io.open(lst, encoding='utf-8').read().split()) if os.path.exists(lst) else set()
    n0 = len(urls)
    print(f'Повторно: {len(todo)} страниц')
    with cf.ThreadPoolExecutor(2) as ex:
        for u, found, st in ex.map(scan_page, todo):
            data['pages'][u] = st
            urls |= {x for x in found if urlparse(x).path.lower().endswith(EXT)}
    json.dump(data, io.open(wu, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Статусы страниц:', {s: list(data['pages'].values()).count(s) for s in set(data['pages'].values())}, '| новых файлов:', len(urls) - n0)
    urls = sorted(urls)
    res = list(cf.ThreadPoolExecutor(3).map(download, urls))
    io.open(lst, 'w', encoding='utf-8').write('\n'.join(urls) + '\n')
    bad = [(u, st) for u, st, sz in res if st.startswith('ошибка')]
    print('Скачано заново:', sum(1 for r in res if r[1] == 'скачан'), '| ошибок:', len(bad))
    for u, st in bad[:30]: print('   ', st, u)

def main():
    os.makedirs(DST, exist_ok=True)
    if '--rescan' in sys.argv: return rescan()
    urls = media_api()
    pages = []
    if '--no-pages' not in sys.argv:
        pages, sm_imgs = sitemap_pages()
        urls |= {u for u in sm_imgs if '/wp-content/uploads/' in u}
        statuses = {}
        with cf.ThreadPoolExecutor(6) as ex:
            for i, (u, found, st) in enumerate(ex.map(scan_page, pages), 1):
                urls |= found; statuses[u] = st
                if i % 100 == 0: print(f'  страниц просмотрено: {i}/{len(pages)}', flush=True)
        json.dump({'pages': statuses}, io.open(os.path.join(ROOT, 'crawl', 'wp-urls.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    urls = sorted(u for u in urls if '/wp-content/uploads/' in u and urlparse(u).path.lower().endswith(EXT))
    print(f'К скачиванию: {len(urls)} файлов')
    stat, size, bad = {}, 0, []
    with cf.ThreadPoolExecutor(6) as ex:
        for i, (u, st, sz) in enumerate(ex.map(download, urls), 1):
            k = st if not st.startswith('ошибка') else 'ошибка'
            stat[k] = stat.get(k, 0) + 1; size += sz
            if st.startswith('ошибка'): bad.append((u, st))
            if i % 200 == 0: print(f'  {i}/{len(urls)}  {size / 1048576:.0f} МБ', flush=True)
    io.open(os.path.join(ROOT, 'crawl', 'wp-uploads-list.txt'), 'w', encoding='utf-8').write('\n'.join(urls) + '\n')
    print('Итог:', stat, f'{size / 1048576:.0f} МБ', 'в', DST)
    for u, st in bad[:30]: print('   ', st, u)

if __name__ == '__main__':
    main()
