# Профиль JavaScript во время прокрутки сюжета на телефоне: самые дорогие функции.
import sys, collections
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=3)
    ctx.add_init_script("sessionStorage.setItem('aecIntro','1')")
    pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    pg.goto(URL); pg.wait_for_timeout(3000)
    cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
    st = pg.evaluate('({s: __aec.heroST.start, e: __aec.heroST.end})')
    cdp.send('Profiler.enable'); cdp.send('Profiler.setSamplingInterval', {'interval': 200}); cdp.send('Profiler.start')
    pg.evaluate('''async (z) => { const t0 = performance.now(); await new Promise(res => { const step = () => { const k = Math.min(1, (performance.now() - t0) / 4000); scrollTo(0, z * k); if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); }); }''', st['e'])
    prof = cdp.send('Profiler.stop')['profile']
    b.close()
nodes = {n['id']: n for n in prof['nodes']}
dt = collections.Counter()
for sid, delta in zip(prof['samples'], prof['timeDeltas']): dt[sid] += delta
selfms = collections.Counter()
for nid, us in dt.items():
    cf = nodes[nid]['callFrame']; key = f"{cf['functionName'] or '(anon)'} {cf['url'].split('/')[-1]}:{cf['lineNumber'] + 1}"
    selfms[key] += us / 1000
for k, v in selfms.most_common(25): print(f'{v:8.0f} ms  {k}')
