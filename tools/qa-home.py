# Проверка главной: загрузчик, сценарий первого экрана, секции, наложения текста, переполнение, ошибки, FPS.
# python -X utf8 tools/qa-home.py [url] [out_dir] [viewports: 390,768,1440,1920] [lang]
import sys, os, json
from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'shots/qa'
VPS = [int(v) for v in (sys.argv[3] if len(sys.argv) > 3 else '390,768,1440,1920').split(',')]
LANG = sys.argv[4] if len(sys.argv) > 4 else ''
SIZES = {390: (390, 844, True), 768: (768, 1024, True), 1024: (1024, 768, False), 1280: (1280, 720, False), 1440: (1440, 900, False), 1920: (1920, 1080, False)}

OVERLAP_JS = r'''() => {
  const vis = el => { if (!el) return false; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') return false; let o = 1, e = el; while (e && e !== document.body) { o *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; } return o > .35; };
  const box = (el, g) => { const r = el.getBoundingClientRect(); return { g, t: (el.textContent || '').trim().slice(0, 28), x: r.left, y: r.top, w: r.width, h: r.height }; };
  const items = [];
  document.querySelectorAll('#intro h1, #intro p, #intro .btn').forEach(e => vis(e) && items.push(box(e, 'intro')));
  document.querySelectorAll('#caps .cap').forEach(c => { if (!vis(c)) return; c.querySelectorAll('b, p, .btn').forEach(e => items.push(box(e, 'cap'))); });
  document.querySelectorAll('#stepsUi').forEach(e => vis(e) && items.push(box(e, 'steps')));
  document.querySelectorAll('#cue').forEach(e => vis(e) && items.push(box(e, 'cue')));
  const tg = document.querySelector('#stage .tags'); const lbl = tg ? parseFloat(getComputedStyle(tg).opacity) : 0;
  if (lbl > .35) document.querySelectorAll('#stage .tag').forEach(e => items.push(box(e, 'tag')));
  const vw = innerWidth, vh = innerHeight, bad = [];
  document.querySelectorAll('#intro h1, #caps .cap b, .h-xl, .cap p, #intro p').forEach(e => { if (vis(e) && e.scrollWidth > e.clientWidth + 2) bad.push('TEXT-OVERFLOW "' + (e.textContent||'').trim().slice(0, 30) + '" ' + e.scrollWidth + '>' + e.clientWidth); });
  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (a.w > 0 && (a.x < -1 || a.x + a.w > vw + 1)) bad.push('OUT-X ' + a.g + ' "' + a.t + '" ' + Math.round(a.x) + '..' + Math.round(a.x + a.w));
    if (a.h > 0 && (a.y + a.h > vh - (innerWidth <= 1024 ? 72 : 0) + 1)) bad.push('OUT-Y ' + a.g + ' "' + a.t + '" bottom=' + Math.round(a.y + a.h) + ' vh=' + vh);
    for (let j = i + 1; j < items.length; j++) {
      const b = items[j]; if (a.g === b.g && a.g !== 'tag') continue;
      const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ix > 2 && iy > 2) bad.push('OVERLAP ' + a.g + ' "' + a.t + '" x ' + b.g + ' "' + b.t + '"');
    }
  }
  return bad;
}'''

def run(vw):
    w, h, mobile = SIZES[vw]
    out = os.path.join(OUT, str(vw)); os.makedirs(out, exist_ok=True)
    report = {'viewport': f'{w}x{h}', 'errors': [], 'issues': []}
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('console', lambda m: report['errors'].append(m.type + ': ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        pg.on('pageerror', lambda e: report['errors'].append('PAGEERROR ' + str(e)))
        pg.goto(URL + (('?lang=' + LANG) if LANG else ''), wait_until='domcontentloaded')
        for t in (350, 1300, 2200, 2700):
            pg.wait_for_timeout(t - (0 if t == 350 else [350, 1300, 2200, 2700][[350, 1300, 2200, 2700].index(t) - 1]))
            pg.screenshot(path=f'{out}/a-loader-{t}.png')
        pg.wait_for_timeout(1600)
        pg.screenshot(path=f'{out}/b-hero.png')
        report['issues'] += ['hero: ' + x for x in pg.evaluate(OVERLAP_JS)]
        has = pg.evaluate('!!(window.__aec && window.__aec.heroST)')
        if has:
            st = pg.evaluate('({s: __aec.heroST.start, e: __aec.heroST.end})')
            for k, pr in enumerate([.08, .2, .36, .52, .68, .84, .98]):
                y = st['s'] + (st['e'] - st['s']) * pr
                pg.evaluate(f'window.__aec.lenis ? __aec.lenis.scrollTo({y}, {{immediate: true}}) : window.scrollTo(0, {y})')
                pg.wait_for_timeout(1700)
                pg.screenshot(path=f'{out}/c-story-{k}-{int(pr*100)}.png')
                report['issues'] += [f'story {int(pr*100)}%: ' + x for x in pg.evaluate(OVERLAP_JS)]
            # FPS во время прокрутки сценария
            fps = pg.evaluate('''async (st) => { let f = 0, run = true; const loop = () => { f++; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
              const t0 = performance.now(); for (let i = 0; i <= 60; i++) { const y = st.s + (st.e - st.s) * (i / 60); if (window.__aec.lenis) __aec.lenis.scrollTo(y, {immediate: true}); else scrollTo(0, y); await new Promise(r => setTimeout(r, 33)); }
              run = false; return Math.round(f / ((performance.now() - t0) / 1000)); }''', st)
            report['fps_story'] = fps
        else:
            report['issues'].append('no hero ScrollTrigger')
        # секции
        secs = pg.evaluate('''() => [...document.querySelectorAll('main > section, main > .pin-spacer > section')].map((s, i) => ({ i, cls: s.className, top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight }))''')
        for s in secs[1:]:
            for frac, tag in ((0.0, 'a'), (0.5, 'b')):
                if tag == 'b' and s['h'] < h * 1.3: continue
                y = s['top'] + s['h'] * frac - (80 if frac == 0 else 0)
                pg.evaluate(f'window.__aec && __aec.lenis ? __aec.lenis.scrollTo({y}, {{immediate: true}}) : window.scrollTo(0, {y})')
                pg.wait_for_timeout(1500)
                name = s['cls'].split()[0] if s['cls'] else 'sec'
                pg.screenshot(path=f"{out}/d-{s['i']:02d}-{name}-{tag}.png")
        report['overflow_x'] = pg.evaluate('document.documentElement.scrollWidth - innerWidth')
        report['card_text_overflow'] = pg.evaluate('''() => [...document.querySelectorAll('.hp-pj-card h3, .hp-pj-card .meta, .eq h3, .ind-list a, .news-list b, .nums b, .brands a')].filter(e => { const c = e.closest('.hp-pj-card, .eq, li, .nums > div, .brands a') || e.parentElement; const r = e.getBoundingClientRect(), rc = c.getBoundingClientRect(); return e.scrollWidth > e.clientWidth + 2 || r.right > rc.right + 2; }).map(e => (e.textContent || '').trim().slice(0, 40))''')
        report['hidden_after_reveal'] = pg.evaluate('''() => [...document.querySelectorAll('.js-up, .eq, .js-lines')].filter(e => { const cs = getComputedStyle(e); return e.offsetParent && (parseFloat(cs.opacity) < .5 || cs.visibility === 'hidden'); }).map(e => (e.className + ' ' + (e.textContent||'').trim().slice(0, 30)))''')
        b.close()
    return report

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    allr = [run(v) for v in VPS]
    print(json.dumps(allr, ensure_ascii=False, indent=1))
