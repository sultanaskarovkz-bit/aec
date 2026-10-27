# Аудит всех страниц: скриншоты (десктоп и телефон), ошибки консоли, переполнение, растянутые или обрезанные
# картинки, текст за границами карточек, пустые изображения-заглушки, одинаковая высота карточек в рядах.
# python -X utf8 tools/qa-site.py [base] [out] [widths]
import sys, os, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'shots/site'
WS = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else '1440,390').split(',')]
PAGES = ['index.html', 'catalog.html#ibp', 'catalog.html#akb', 'catalog.html#dgu', 'product.html#__IBP__', 'product.html#__AKB__', 'product.html#__DGU__',
         'solution.html#czod', 'solution.html#med', 'service.html#montazh', 'service.html#zamena', 'projects.html', 'project.html#ktz', 'project.html#lab',
         'brands.html', 'brand.html#salicru', 'brand.html#tescom', 'about.html', 'blog.html', 'article.html#0', 'article.html#3', 'article.html#8',
         'faq.html', 'docs.html', 'region.html#almaty', 'region.html#astana', 'calc.html', 'kp.html', 'compare.html', 'favorites.html', 'search.html#ups',
         'contacts.html', 'legal.html', 'thanks.html', '404.html']
CHECK = r'''() => {
  const bad = [], vw = innerWidth;
  const inScroller = e => { let p = e.parentElement; while (p && p !== document.body) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; p = p.parentElement; } return false; };
  const vis = e => { if (e.closest('.mmenu:not(.open), .drawer:not(.open), .modal:not(.open), .mega, .loader')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && e.checkVisibility({ visibilityProperty: true, opacityProperty: true }); };
  // картинки
  document.querySelectorAll('img').forEach(im => {
    if (!vis(im)) return;
    const r = im.getBoundingClientRect(), cs = getComputedStyle(im), src = (im.getAttribute('src') || '').split('/').pop();
    if (!im.complete || !im.naturalWidth) { if (!im.classList.contains('ph')) bad.push('IMG-BROKEN ' + src); return; }
    if (cs.objectFit === 'fill' || cs.objectFit === 'normal') { const ar = r.width / r.height, nr = im.naturalWidth / im.naturalHeight; if (Math.abs(ar / nr - 1) > .06) bad.push('IMG-STRETCH ' + src + ' box ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' nat ' + im.naturalWidth + 'x' + im.naturalHeight); }
    if (im.naturalWidth < r.width * .5 && r.width > 120) bad.push('IMG-UPSCALED ' + src + ' nat ' + im.naturalWidth + ' shown ' + Math.round(r.width));
    if ((r.right > vw + 1 || r.left < -1) && !inScroller(im)) bad.push('IMG-OUT ' + src);
  });
  // текст за границами и переполнение
  document.querySelectorAll('h1,h2,h3,h4,p,li,td,th,a,span,b,small,dd,dt,label').forEach(e => {
    if (!vis(e) || !e.textContent.trim()) return;
    const r = e.getBoundingClientRect();
    if (r.right > vw + 1 && getComputedStyle(e).position !== 'fixed' && !inScroller(e)) bad.push('TEXT-OUT "' + e.textContent.trim().slice(0, 30) + '"');
    if (e.scrollWidth > e.clientWidth + 3 && getComputedStyle(e).overflowX === 'visible' && e.children.length === 0 && /\s/.test(e.textContent.trim())) bad.push('TEXT-OVERFLOW "' + e.textContent.trim().slice(0, 30) + '" ' + e.scrollWidth + '>' + e.clientWidth);
  });
  // ряды карточек разной высоты
  const rows = {};
  document.querySelectorAll('.pcard:not(.list), .tile, .pj, .svc, .post, .eq, .ser').forEach(c => { if (!vis(c)) return; const t = Math.round(c.getBoundingClientRect().top + scrollY); const k = c.className.split(' ')[0] + '@' + t; (rows[k] = rows[k] || []).push(Math.round(c.getBoundingClientRect().height)); });
  Object.entries(rows).forEach(([k, hs]) => { if (hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 2) bad.push('ROW-HEIGHT ' + k + ' ' + hs.join('/')); });
  return { ovx: document.documentElement.scrollWidth - vw, bad: [...new Set(bad)].slice(0, 20) };
}'''
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w in WS:
        mobile = w < 700
        ctx = b.new_context(viewport={'width': w, 'height': 900 if not mobile else 844}, is_mobile=mobile, has_touch=mobile)
        ctx.add_init_script("sessionStorage.setItem('aecIntro','1')")
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:120]))
        pg.on('console', lambda m: errs.append(m.text[:120]) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        pg.goto(BASE + 'catalog.html#ibp'); pg.wait_for_timeout(900)
        pg.evaluate("() => { document.querySelectorAll('[data-cmp]').forEach((b, i) => { if (i < 3) b.click(); }); document.querySelectorAll('[data-fav]').forEach((b, i) => { if (i < 3) b.click(); }); document.querySelectorAll('[data-kp]').forEach((b, i) => { if (i < 2) b.click(); }); }")
        slugs = pg.evaluate("() => ['ibp','akb','dgu'].map(c => (AEC.PRODUCTS.find(p => p.cat === c && p.photo) || {}).slug)")
        for path in PAGES:
            path = path.replace('__IBP__', slugs[0]).replace('__AKB__', slugs[1]).replace('__DGU__', slugs[2])
            errs.clear()
            pg.goto(BASE + path); pg.wait_for_timeout(1000)
            pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i => { i.loading = 'eager'; })")
            pg.evaluate('async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); }')
            pg.evaluate('() => Promise.race([new Promise(r => setTimeout(r, 6000)), Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; })))])')
            pg.wait_for_timeout(400)
            r = pg.evaluate(CHECK); r['errors'] = list(errs)
            res[f'{w} {path}'] = r
            d = os.path.join(OUT, str(w)); os.makedirs(d, exist_ok=True)
            name = path.replace('.html', '').replace('#', '-').replace('/', '_')
            # склейка экранов: полностраничный снимок не прорисовывает ленивые картинки
            vh = pg.viewport_size['height']; H = pg.evaluate('document.body.scrollHeight'); parts = []
            for y in range(0, H, vh):
                pg.evaluate(f'scrollTo(0, {y})'); pg.wait_for_timeout(350 if y else 150)
                parts.append(pg.screenshot(clip={'x': 0, 'y': 0, 'width': w, 'height': min(vh, H - y)} if False else None))
            from PIL import Image; import io
            ims = [Image.open(io.BytesIO(x)) for x in parts]; full = Image.new('RGB', (ims[0].width, sum(i.height for i in ims)), 'white'); yy = 0
            for i in ims: full.paste(i, (0, yy)); yy += i.height
            full.save(os.path.join(d, name + '.png'))
            pg.evaluate('scrollTo(0, 0)')
        ctx.close()
    b.close()
for k, v in res.items():
    if v['bad'] or v['errors'] or v['ovx']: print(k, 'ovx', v['ovx'], v['errors'], *['\n    ' + x for x in v['bad']])
print('checked', len(res))
