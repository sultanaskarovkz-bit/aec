import sys, asyncio
from playwright.async_api import async_playwright
async def main(url, w):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': w, 'height': 900})
        await pg.goto(url, wait_until='networkidle'); await pg.wait_for_timeout(500)
        res = await pg.evaluate('''(w) => { const out=[]; document.querySelectorAll('*').forEach(el=>{ const r=el.getBoundingClientRect(); if (r.right > w+1 && r.width>0 && getComputedStyle(el).position!=='fixed') out.push(el.tagName+'.'+(el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className)+' right='+Math.round(r.right)+' w='+Math.round(r.width)); }); return out.slice(0,15); }''', w)
        print('\n'.join(res)); await b.close()
asyncio.run(main(sys.argv[1], int(sys.argv[2])))
