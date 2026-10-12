import sys, asyncio
from playwright.async_api import async_playwright
DEV_FONTS = """
@font-face{font-family:'IBM Plex Sans';font-weight:400;src:url('/_dev/fonts/IBMPlexSans-Regular.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-weight:500;src:url('/_dev/fonts/IBMPlexSans-Medium.woff2') format('woff2')}
@font-face{font-family:'IBM Plex Sans';font-weight:600;src:url('/_dev/fonts/IBMPlexSans-SemiBold.woff2') format('woff2')}
"""
async def main(url, out, w, h, full, scroll_to):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        errs = []
        pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error','warning') and 'Failed to load resource' not in m.text else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERROR: ' + str(e)))
        await pg.goto(url, wait_until='networkidle')
        await pg.add_style_tag(content=DEV_FONTS)
        await pg.evaluate('document.fonts.ready')
        # прокрутка всей страницы, чтобы подгрузились lazy-изображения
        await pg.evaluate('''async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); }''')
        await pg.evaluate('''() => Promise.race([new Promise(r => setTimeout(r, 4000)), Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; })))])''')
        await pg.wait_for_timeout(600)
        if scroll_to:
            await pg.evaluate(f"window.scrollTo({{top: {scroll_to}, behavior: 'instant'}})")
            await pg.wait_for_timeout(400)
        sw = await pg.evaluate('document.documentElement.scrollWidth')
        await pg.screenshot(path=out, full_page=full)
        print('scrollWidth', sw, 'viewport', w, 'errors:', errs[:10])
        await b.close()
if __name__ == '__main__':
  url, out = sys.argv[1], sys.argv[2]
  w = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
  h = int(sys.argv[4]) if len(sys.argv) > 4 else 900
  full = (sys.argv[5] == 'full') if len(sys.argv) > 5 else True
  scroll_to = int(sys.argv[6]) if len(sys.argv) > 6 else 0
  asyncio.run(main(url, out, w, h, full, scroll_to))
