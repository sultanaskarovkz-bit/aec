# Поиск обрезанных фото товаров по всем страницам: фото выходит за контейнер с overflow:hidden или вписано через cover.
# python -X utf8 tools/qa-images.py [base] [width]
import sys, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
W = int(sys.argv[2]) if len(sys.argv) > 2 else 1440
PAGES = ['index.html', 'catalog.html#ibp', 'catalog.html#dgu', 'catalog.html#akb', 'catalog.html#stab', 'catalog.html#sts', 'catalog.html#gpes',
         'solution.html#czod', 'solution.html#med', 'solution.html#prom', 'solution.html#oil', 'solution.html#office', 'solution.html#machines', 'solution.html#emergency', 'solution.html#telecom',
         'brand.html#salicru', 'brand.html#tescom', 'brand.html#kehua', 'brand.html#hoppecke', 'brands.html', 'service.html#montazh', 'service.html#zamena', 'region.html#almaty',
         'project.html#lab', 'projects.html', 'about.html', 'search.html#ups', 'compare.html', 'favorites.html', 'kp.html', 'calc.html', 'docs.html', 'blog.html', 'article.html#0', 'contacts.html', 'faq.html'] + ['product.html#' + x for x in ('__IBP__', '__DGU__', '__AKB__', '__STAB__', '__STS__')]
PRODUCT_RE = r'/(products/|prod-|cat-|brand-[a-z-]+-\d|dgu-photo|thumbnailgenerator)'
CHECK = r'''(re) => {
  const rx = new RegExp(re), bad = [];
  document.querySelectorAll('img').forEach(im => {
    if (!im.offsetParent || !rx.test(im.getAttribute('src') || '')) return;
    const cs = getComputedStyle(im), r = im.getBoundingClientRect(); if (r.width < 8) return;
    if (cs.objectFit === 'cover' || cs.objectFit === 'fill' && im.naturalWidth && Math.abs(r.width / r.height - im.naturalWidth / im.naturalHeight) > .05) bad.push('fit:' + cs.objectFit + ' ' + (im.getAttribute('src') || '').split('/').pop() + ' in ' + (im.parentElement.className || im.parentElement.tagName));
    let e = im.parentElement;
    while (e && e !== document.body) { const ce = getComputedStyle(e); if (/auto|scroll/.test(ce.overflowX + ce.overflowY)) break; if (ce.overflow !== 'visible' || ce.overflowX !== 'visible' || ce.overflowY !== 'visible') { const b = e.getBoundingClientRect(); if (r.top < b.top - 1 || r.bottom > b.bottom + 1 || r.left < b.left - 1 || r.right > b.right + 1) bad.push('clip ' + (im.getAttribute('src') || '').split('/').pop() + ' by ' + (e.className || e.tagName) + ' img ' + Math.round(r.height) + ' box ' + Math.round(b.height)); break; } e = e.parentElement; }
  });
  return [...new Set(bad)];
}'''
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': W, 'height': 900})
    ctx.add_init_script("sessionStorage.setItem('aecIntro','1');")
    pg = ctx.new_page()
    pg.goto(BASE + 'catalog.html#ibp'); pg.wait_for_timeout(800)
    # наполнить сравнение, избранное и КП для проверки этих страниц
    pg.evaluate("() => { const ids = AEC.PRODUCTS.filter(p => p.cat === 'ibp' && p.photo).slice(0, 3).map(p => p.id); document.querySelectorAll('[data-cmp]').forEach((b, i) => { if (i < 3) b.click(); }); document.querySelectorAll('[data-fav]').forEach((b, i) => { if (i < 3) b.click(); }); document.querySelectorAll('[data-kp]').forEach((b, i) => { if (i < 2) b.click(); }); }")
    pg.wait_for_timeout(400)
    slugs = pg.evaluate("() => ['ibp','dgu','akb','stab','sts'].map(c => (AEC.PRODUCTS.find(p => p.cat === c && p.photo) || {}).slug)")
    PAGES2 = [x.replace('__IBP__', slugs[0]).replace('__DGU__', slugs[1]).replace('__AKB__', slugs[2]).replace('__STAB__', slugs[3]).replace('__STS__', slugs[4]) for x in PAGES]
    for path in PAGES2:
        pg.goto(BASE + path); pg.wait_for_timeout(1200)
        pg.evaluate('async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 70)); } scrollTo(0, 0); }')
        pg.wait_for_timeout(500)
        r = pg.evaluate(CHECK, PRODUCT_RE)
        if r: out[path] = r
    b.close()
print(json.dumps(out, ensure_ascii=False, indent=1) if out else 'NO CROPPED PRODUCT IMAGES')
