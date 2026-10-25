# Проверка симметрии каталога: фото целиком, равная высота карточек в ряду, цена и кнопки на одном уровне.
# python -X utf8 tools/qa-catalog.py [base_url] [out]
import sys, os, json
from playwright.sync_api import sync_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'shots/cat'
os.makedirs(OUT, exist_ok=True)
CHECK = r'''() => {
  const cards = [...document.querySelectorAll('.pcard:not(.list)')].filter(c => c.offsetParent);
  const rows = {}; cards.forEach(c => { const t = Math.round(c.getBoundingClientRect().top + scrollY); (rows[t] = rows[t] || []).push(c); });
  const bad = [];
  Object.values(rows).forEach(r => {
    if (r.length < 2) return;
    const h = r.map(c => Math.round(c.getBoundingClientRect().height)), pa = r.map(c => Math.round(c.querySelector('.pact').getBoundingClientRect().top)), pr = r.map(c => Math.round(c.querySelector('.price').getBoundingClientRect().top)), sp = r.map(c => Math.round(c.querySelector('.specs').getBoundingClientRect().top));
    const spread = a => Math.max(...a) - Math.min(...a);
    if (spread(h) > 1) bad.push('height ' + h.join('/')); if (spread(pa) > 1) bad.push('actions ' + pa.join('/')); if (spread(pr) > 1) bad.push('price ' + pr.join('/')); if (spread(sp) > 1) bad.push('specs ' + sp.join('/'));
  });
  cards.forEach(c => { const im = c.querySelector('.pimg img'), box = c.querySelector('.pimg'); if (!im || !im.complete || !im.naturalWidth) return; const b = box.getBoundingClientRect(), r = im.getBoundingClientRect(); if (r.top < b.top - 1 || r.bottom > b.bottom + 1 || r.left < b.left - 1 || r.right > b.right + 1) bad.push('img overflow ' + im.alt.slice(0, 30)); const cs = getComputedStyle(im); if (cs.objectFit !== 'contain') bad.push('fit ' + cs.objectFit); });
  cards.forEach(c => c.querySelectorAll('.specs b, h3, .brand').forEach(e => { if (e.getBoundingClientRect().right > c.getBoundingClientRect().right + 1) bad.push('text out ' + e.textContent.slice(0, 20)); }));
  return { cards: cards.length, rows: Object.keys(rows).length, bad: [...new Set(bad)].slice(0, 12) };
}'''
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((1440, 900), (1280, 800), (768, 1024), (390, 844)):
        pg = b.new_page(viewport={'width': w, 'height': h}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for cat in ('ibp', 'dgu', 'akb', 'stab', 'sts'):
            pg.goto(BASE + 'catalog.html#' + cat); pg.wait_for_timeout(900)
            pg.evaluate('async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); }')
            pg.evaluate('() => Promise.race([new Promise(r => setTimeout(r, 3000)), Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; })))])')
            res[f'{w}-{cat}'] = pg.evaluate(CHECK)
            top = pg.evaluate("document.querySelector('.pcard').getBoundingClientRect().top + scrollY - 20")
            pg.evaluate(f'scrollTo(0, {top})'); pg.wait_for_timeout(300)
            pg.screenshot(path=f'{OUT}/{w}-{cat}.png')
        # список
        pg.goto(BASE + 'catalog.html#ibp'); pg.wait_for_timeout(900)
        btn = pg.locator('[data-view="list"], .view-list, button[aria-label*="писк"]').first
        if btn.count():
            btn.click(); pg.wait_for_timeout(700)
            top = pg.evaluate("document.querySelector('.pcard').getBoundingClientRect().top + scrollY - 20"); pg.evaluate(f'scrollTo(0, {top})'); pg.wait_for_timeout(500)
            pg.screenshot(path=f'{OUT}/{w}-list.png')
        res[f'{w}-errors'] = errs
        pg.close()
    b.close()
print(json.dumps(res, ensure_ascii=False, indent=0))
