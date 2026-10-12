import asyncio, os, re
from playwright.async_api import async_playwright
SITE=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
pages=['index.html','catalog.html','catalog.html#dgu','catalog.html#akb.12v','catalog.html#ibp.kva-20','product.html','product.html#tescom-tdj-125p','calc.html','calc.html#dgu','solution.html#med','solution.html#oil','service.html#remont','service.html#zamena','projects.html','project.html#lab','region.html#atyrau','brands.html','brand.html#tescom','about.html','contacts.html','blog.html','article.html#1','faq.html','docs.html','legal.html#warranty','thanks.html','404.html','kp.html','compare.html','favorites.html','search.html']
async def main():
    bad=set(); errs=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':900})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        for u in pages:
            await pg.goto('http://localhost:8765/'+u, wait_until='networkidle'); await pg.wait_for_timeout(300)
            hrefs=await pg.evaluate("[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'))")
            for h in hrefs:
                if h.startswith(('http','mailto:','tel:','#','javascript')): continue
                f=h.split('#')[0].split('?')[0]
                if f and not os.path.exists(os.path.join(SITE,f)): bad.add((u,h))
    print('page errors:', errs); print('broken:', sorted(bad)[:30], len(bad))
asyncio.run(main())
