# Собирает все русские строки интерфейса и страниц прототипа (текстовые узлы, placeholder, title, aria-label, alt,
# document.title, meta description) со всех страниц и состояний -> crawl/i18n-strings.json.
# Исключаются тексты статей (#body), таблицы характеристик товаров и значения из каталога.
# python tools/i18n-extract.py   (нужен запущенный сервер на 8765)
import asyncio, json, os, re
from playwright.async_api import async_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PAGES = ['index.html', 'catalog.html#ibp', 'catalog.html#ibp.view-list', 'catalog.html#ibp.sort-kva-asc', 'catalog.html#ibp.tryohfaznye.brand-salicru.kva-20', 'catalog.html#dgu', 'catalog.html#akb.12v', 'catalog.html#stab', 'catalog.html#sts', 'catalog.html#gpes', 'catalog.html#zvu', 'catalog.html#inv', 'catalog.html#freq', 'catalog.html#trafo', 'catalog.html#ips',
         'product.html#ibp-salicru-slc-adapt2-50-50-kva', 'product.html#dizelnyj-generator-tescom-s-dvigatelem-perkins-ot-22-do-1250-kva', 'product.html#akkumulyatornaya-batareya-hoppecke-6-opzs-420-2-v-420-a-ch', 'product.html#staticheskij-pereklyuchatel-nagruzki-tescom-sts2032-32-a', 'product.html#stabilizator-napryazheniya-salicru-re-20',
         'solution.html#czod', 'solution.html#med', 'solution.html#prom', 'solution.html#oil', 'solution.html#office', 'solution.html#machines', 'solution.html#emergency', 'solution.html#telecom',
         'service.html#montazh', 'service.html#service', 'service.html#remont', 'service.html#zamena', 'service.html#diagnostika', 'service.html#obsledovanie', 'service.html#konsultaciya',
         'projects.html', 'project.html#ktz', 'project.html#airastana', 'project.html#lab', 'project.html#uralsk', 'project.html#tv', 'brands.html', 'brand.html#salicru', 'brand.html#tescom', 'brand.html#kehua-tech', 'brand.html#hoppecke', 'brand.html#agg',
         'about.html', 'contacts.html', 'blog.html', 'article.html#0', 'article.html#7', 'faq.html', 'docs.html', 'region.html#astana', 'region.html#shymkent',
         'calc.html', 'calc.html#dgu', 'calc.html#akb', 'calc.html#stab', 'kp.html', 'compare.html', 'favorites.html', 'search.html#ibп', 'search.html', 'legal.html#policy', 'legal.html#terms', 'legal.html#offer', 'legal.html#warranty', 'thanks.html', '404.html']
JS = """() => {
  const out = new Set();
  const skip = el => el.closest('.article#body, .spec, #tab-specs, #tab-desc, script, style, noscript, .pname, .psku, .kp-item h4, .cmp-name');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n; while ((n = w.nextNode())) { const t = n.nodeValue.replace(/\\s+/g, ' ').trim(); if (t.length > 1 && /[А-Яа-яЁё]/.test(t) && !skip(n.parentElement)) out.add(t); }
  document.querySelectorAll('[placeholder],[title],[aria-label],[alt],[data-title],[data-sub],[data-type]').forEach(el => { for (const a of ['placeholder','title','aria-label','alt','data-title','data-sub','data-type']) { const v = el.getAttribute(a); if (v && /[А-Яа-яЁё]/.test(v) && !skip(el)) out.add(v.replace(/\\s+/g, ' ').trim()); } });
  const md = document.querySelector('meta[name=description]'); if (md && md.content) out.add(md.content.trim());
  out.add(document.title.trim());
  return [...out];
}"""
async def main():
    found = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        for u in PAGES:
            try:
                await pg.goto('http://localhost:8765/' + u, wait_until='networkidle'); await pg.wait_for_timeout(1500)
                # раскрыть фильтры/мобильное меню/модалку для текстов в DOM
                await pg.evaluate("() => { document.querySelectorAll('details').forEach(d => d.open = true); }")
                for t in await pg.evaluate(JS):
                    found.setdefault(t, u.split('#')[0])
            except Exception as e: print('ERR', u, str(e)[:80])
        await b.close()
    # исключить значения каталога (названия товаров, характеристики)
    cat = json.load(open(os.path.join(ROOT, 'site', 'assets', 'catalog.json'), encoding='utf-8'))['products']
    catvals = set()
    for pr in cat:
        catvals.add(pr['name']); catvals.add(pr['model']); catvals.add(pr['short'])
        for k, v in pr['spec'].items(): catvals.add(k); catvals.add(v)
        for r in pr['table']: catvals.add(r[0]); catvals.add(r[1])
        for d in pr['desc']: catvals.add(d)
        for dd in pr['docs']: catvals.add(dd['name'])
    strings = sorted((t for t in found if t not in catvals and len(t) < 700), key=lambda t: (found[t], t))
    json.dump({t: found[t] for t in strings}, open(os.path.join(ROOT, 'crawl', 'i18n-strings-2.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('strings', len(strings), 'chars', sum(len(t) for t in strings), 'dropped(catalog)', len(found) - len(strings))
asyncio.run(main())
