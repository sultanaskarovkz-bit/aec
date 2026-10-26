# Плавность при настоящем сенсорном жесте (Input.synthesizeScrollGesture): телефон, видеокарта, замедленный процессор.
# python -X utf8 tools/qa-touch.py [url] [throttle] [speed px/s]
import sys, json, threading
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
THR = float(sys.argv[2]) if len(sys.argv) > 2 else 4
SPEED = int(sys.argv[3]) if len(sys.argv) > 3 else 1400
REC_START = "window.__fd = []; window.__run = true; (() => { let last = performance.now(); const loop = t => { __fd.push(t - last); last = t; if (__run) requestAnimationFrame(loop); }; requestAnimationFrame(loop); })();"
REC_STOP = r'''() => { __run = false; const d = __fd.slice(2); const s = [...d].sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return { frames: d.length, avg_fps: Math.round(1000 / (d.reduce((a, b) => a + b, 0) / d.length)), p95: +q(.95).toFixed(1), max: +s[s.length - 1].toFixed(1), jank_pct: +(100 * d.filter(x => x > 25).length / d.length).toFixed(1), y: Math.round(scrollY) }; }'''
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=3)
    ctx.add_init_script("sessionStorage.setItem('aecIntro','1')")
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.goto(URL); pg.wait_for_timeout(3500)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': THR})
    st = pg.evaluate('(() => { const t = window.__aec && __aec.heroST; return t ? {s: t.start, e: t.end} : {s: 0, e: 3000}; })()')
    for name, dist in (('story', st['e']), ('page', 6000)):
        pg.evaluate(REC_START)
        y0 = pg.evaluate('scrollY')
        while pg.evaluate('scrollY') < y0 + dist - 80:
            # свайп пальцем: 520 px за ~0.37 с, шаг 16 мс
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': 200, 'y': 680}]})
            for k in range(1, 24):
                cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': 200, 'y': 680 - k * 22}]})
                pg.wait_for_timeout(16)
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
            pg.wait_for_timeout(60)
        out[name] = pg.evaluate(REC_STOP)
    b.close()
print(json.dumps(out, ensure_ascii=False))
