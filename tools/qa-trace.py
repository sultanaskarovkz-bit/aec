# Трассировка прокрутки на телефоне: на что уходит время главного потока и растеризации.
# python -X utf8 tools/qa-trace.py [url] [phase: story|page] [throttle]
import sys, json, collections
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
PHASE = sys.argv[2] if len(sys.argv) > 2 else 'story'
THR = float(sys.argv[3]) if len(sys.argv) > 3 else 4
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=3)
    ctx.add_init_script("sessionStorage.setItem('aecIntro','1')")
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.goto(URL); pg.wait_for_timeout(3000)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': THR})
    st = pg.evaluate('(() => { const t = window.__aec && __aec.heroST; return t ? {s: t.start, e: t.end} : {s: 0, e: innerHeight * 3}; })()')
    a, z = (0, st['e']) if PHASE == 'story' else (st['e'], pg.evaluate('document.body.scrollHeight - innerHeight'))
    pg.evaluate(f'scrollTo(0, {a})'); pg.wait_for_timeout(800)
    b.start_tracing(page=pg, categories=['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'])
    pg.evaluate('''async ({a, z}) => { const t0 = performance.now(); await new Promise(res => { const step = () => { const k = Math.min(1, (performance.now() - t0) / 4000); scrollTo(0, a + (z - a) * k); if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); }); }''', {'a': a, 'z': z})
    raw = b.stop_tracing()
    b.close()
ev = json.loads(raw)['traceEvents']
names = {}
for e in ev:
    if e.get('ph') == 'M' and e.get('name') == 'thread_name': names[(e['pid'], e['tid'])] = e['args']['name']
agg = collections.defaultdict(float)
for e in ev:
    if e.get('ph') != 'X' or 'dur' not in e: continue
    th = names.get((e['pid'], e['tid']), '?')
    if not (th.startswith('CrRendererMain') or 'Compositor' in th or 'Raster' in th or th.startswith('VizCompositor')): continue
    agg[(th.split('/')[0][:22], e['name'])] += e['dur'] / 1000
top = sorted(agg.items(), key=lambda x: -x[1])[:22]
for (th, n), ms in top: print(f'{ms:9.0f} ms  {th:22}  {n}')
