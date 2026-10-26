# Замер плавности прокрутки: время кадров, подвисания, перерисовки. Телефон с замедленным процессором и десктоп.
# python -X utf8 tools/qa-smooth.py [url] [cpu_throttle]
import sys, json
from playwright.sync_api import sync_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8765/index.html'
THR = float(sys.argv[2]) if len(sys.argv) > 2 else 4
RUN = r'''async ({from, to, secs}) => {
  const d = []; let last = performance.now(), run = true;
  const loop = t => { d.push(t - last); last = t; if (run) requestAnimationFrame(loop); }; requestAnimationFrame(loop);
  const t0 = performance.now();
  await new Promise(res => { const step = () => { const k = Math.min(1, (performance.now() - t0) / (secs * 1000)); const y = from + (to - from) * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2); window.scrollTo(0, y); if (k < 1) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  run = false; d.shift();
  const s = [...d].sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(s.length * p))];
  return { frames: d.length, avg_fps: Math.round(1000 / (d.reduce((a, b) => a + b, 0) / d.length)), p50: +q(.5).toFixed(1), p95: +q(.95).toFixed(1), max: +s[s.length - 1].toFixed(1), jank_pct: +(100 * d.filter(x => x > 25).length / d.length).toFixed(1) };
}'''
def metrics(cdp):
    m = {x['name']: x['value'] for x in cdp.send('Performance.getMetrics')['metrics']}
    return {k: m.get(k, 0) for k in ('LayoutCount', 'RecalcStyleCount', 'TaskDuration', 'ScriptDuration', 'RecalcStyleDuration', 'LayoutDuration')}
out = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11'])
    for name, vp, mobile, thr in (('mobile', (390, 844), True, THR), ('desktop', (1440, 900), False, 1)):
        ctx = b.new_context(viewport={'width': vp[0], 'height': vp[1]}, is_mobile=mobile, has_touch=mobile, device_scale_factor=3 if mobile else 1)
        ctx.add_init_script("sessionStorage.setItem('aecIntro','1')")
        pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
        cdp.send('Performance.enable')
        pg.goto(URL); pg.wait_for_timeout(3000)
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': thr})
        st = pg.evaluate('(() => { const t = window.__aec && __aec.heroST; return t ? {s: t.start, e: t.end} : {s: 0, e: innerHeight * 3}; })()')
        m0 = metrics(cdp)
        story = pg.evaluate(RUN, {'from': 0, 'to': st['e'], 'secs': 6})
        m1 = metrics(cdp)
        page = pg.evaluate(RUN, {'from': st['e'], 'to': pg.evaluate('document.body.scrollHeight - innerHeight'), 'secs': 8})
        out[name] = {'story': story, 'page': page, 'story_style_recalc_ms': round((m1['RecalcStyleDuration'] - m0['RecalcStyleDuration']) * 1000), 'story_task_ms': round((m1['TaskDuration'] - m0['TaskDuration']) * 1000)}
        ctx.close()
    b.close()
print(json.dumps(out, ensure_ascii=False, indent=1))
