# -*- coding: utf-8 -*-
# Находит непереведённые строки: открывает все страницы прототипа с ?lang=en и собирает текст, оставшийся на кириллице.
# Значения каталога (названия товаров, характеристики) и тексты статей идут отдельным списком: их переводит словарь терминов.
# python -X utf8 tools/i18n-missing.py  ->  crawl/i18n-missing.json {"ui": {строка: страница}, "catalog": {...}, "kz_only": [...]}
import functools, http.server, importlib.util, json, os, re, socketserver, sys, threading
from playwright.sync_api import sync_playwright
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SITE = os.path.join(ROOT, 'site')
spec = importlib.util.spec_from_file_location('bs', os.path.join(ROOT, 'tools', 'build-static.py'))
bs = importlib.util.module_from_spec(spec); spec.loader.exec_module(bs)

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
socketserver.ThreadingTCPServer.request_queue_size = 256
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 8796), functools.partial(H, directory=SITE)); srv.handle_error = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8796/'

JS = r"""() => {
  const CY = /[А-Яа-яЁё]/, ui = new Set(), cat = new Set();
  const isCat = el => !!(el && el.closest('.pname, .psku, .spec, #tab-specs, #tab-desc, .kp-item h4, .cmp-name, .article#body, #body, .p-title, .pcard h3, .pcard h4'));
  const add = (v, el) => { v = v.replace(/\s+/g, ' ').trim(); if (v.length < 2 || !CY.test(v)) return; (isCat(el) ? cat : ui).add(v); };
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: n => n.nodeType === 1 && n.matches('script,style,noscript,template,.no-i18n') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; while ((n = w.nextNode())) {
    if (n.nodeType === 3) add(n.nodeValue, n.parentElement);
    else for (const a of ['placeholder', 'title', 'aria-label', 'alt', 'data-title', 'data-sub', 'data-type', 'data-lightbox']) { const v = n.getAttribute(a); if (v) add(v, n); }
  }
  if (CY.test(document.title)) ui.add(document.title.trim());
  const md = document.querySelector('meta[name=description]'); if (md && CY.test(md.content)) ui.add(md.content.trim());
  return { ui: [...ui], cat: [...cat] };
}"""

def main():
    found_ui, found_cat = {}, {}
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--disable-gpu'])
        ctx = br.new_context(viewport={'width': 1366, 'height': 900}, reduced_motion='reduce')
        ctx.route(re.compile(r'(googletagmanager|google-analytics|clickcease|doubleclick|2gis|fonts\.g)'), lambda r: r.abort())
        pg = ctx.new_page()
        pg.goto(BASE + 'index.html?lang=en', wait_until='load'); pg.wait_for_timeout(1500)
        ids = pg.evaluate("""() => ({ proj: AEC.PROJECTS.map(p => p.id), brands: AEC.BRANDS.map(b => b.id), cities: (AEC.CITIES || []).map(c => c.slug),
            arts: AEC.ARTICLES.map((a, i) => i), prods: (() => { const seen = new Set(), out = []; AEC.PRODUCTS.forEach(p => { const k = p.cat + '|' + (p.sub || '') + '|' + p.brand; if (!seen.has(k)) { seen.add(k); out.push(p.slug); } }); return out; })() })""")
        pages = ['index.html', 'projects.html', 'brands.html', 'about.html', 'contacts.html', 'blog.html', 'faq.html', 'docs.html', 'calc.html', 'calc.html#dgu', 'calc.html#akb', 'calc.html#stab',
                 'kp.html', 'compare.html', 'favorites.html', 'search.html', 'search.html#ИБП', 'thanks.html', '404.html', 'catalog.html']
        pages += ['catalog.html#' + k for k in bs.CAT] + ['solution.html#' + k for k in bs.SOLUTION] + ['service.html#' + k for k in bs.SERVICE] + ['legal.html#' + k for k in bs.LEGAL]
        pages += ['project.html#' + i for i in ids['proj']] + ['brand.html#' + i for i in ids['brands']] + ['region.html#' + i for i in ids['cities']]
        pages += ['article.html#' + str(i) for i in ids['arts']] + ['product.html#' + s for s in ids['prods']]
        print('pages', len(pages), flush=True)
        for k, u in enumerate(pages):
            path, _, h = u.partition('#')
            url = BASE + path + '?lang=en' + ('#' + h if h else '')
            try:
                pg.goto('about:blank'); pg.goto(url, wait_until='load', timeout=30000); pg.wait_for_timeout(1200)
                # открыть модалку и мобильное меню, чтобы их тексты тоже попали в проверку
                pg.evaluate("() => { document.querySelectorAll('details').forEach(d => d.open = true); }")
                r = pg.evaluate(JS)
                for t in r['ui']: found_ui.setdefault(t, u)
                for t in r['cat']: found_cat.setdefault(t, u)
            except Exception as e:
                print('ERR', u, str(e)[:100], flush=True); pg = ctx.new_page()
            if k % 20 == 0: print(k, len(found_ui), len(found_cat), flush=True)
        br.close()
    # строки, у которых есть английский перевод, но нет казахского
    def rd(lang):
        s = open(os.path.join(SITE, 'assets', f'i18n-{lang}.js'), encoding='utf-8').read()
        return json.loads(s[s.index('{', s.index('AEC_I18N.' + lang + ' =')):s.rindex('}') + 1])
    en, kz = rd('en'), rd('kz')
    out = {'ui': found_ui, 'catalog': found_cat, 'kz_only': [k for k in en if k not in kz]}
    json.dump(out, open(os.path.join(ROOT, 'crawl', 'i18n-missing.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('ui', len(found_ui), 'catalog', len(found_cat), 'kz_only', len(out['kz_only']))

try: main()
finally: srv.shutdown()
