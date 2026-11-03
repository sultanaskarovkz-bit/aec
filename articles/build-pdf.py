# -*- coding: utf-8 -*-
"""
Статьи для блога aecups.kz → PDF на согласование заказчику.
Каждый файл articles/<имя>.html: в начале комментарий <!--meta {...} --> (SEO-карточка), дальше текст статьи.
Запуск: python -X utf8 articles/build-pdf.py   → articles/pdf/<N>-<slug>.pdf
"""
import base64, html, io, json, os, re, datetime
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(os.path.dirname(ROOT), 'site', 'assets', 'img')
OUT = os.path.join(ROOT, 'pdf')
ORDER = [('ibp-20-kva.html', 'cat-ibp-photo.jpg'), ('dgu-100-kvt.html', 'dgu-photo-8.jpg'), ('akb-12v-100ah.html', 'cat-akb-photo.jpg')]
DOMAIN = 'https://aecups.kz'
TODAY = datetime.date.today().strftime('%d.%m.%Y')

def b64(path):
    ext = path.rsplit('.', 1)[1].replace('jpg', 'jpeg')
    return f'data:image/{ext};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

CSS = """
@page { size: A4; margin: 18mm 17mm 20mm; }
* { box-sizing: border-box; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font: 400 10.5pt/1.62 'IBM Plex Sans', Arial, sans-serif; color: #2b3a4a; }
a { color: #0a2540; text-decoration: underline; text-decoration-color: #9fb3c8; text-underline-offset: 2px; }
.top { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #0a2540; }
.top img { height: 34px; }
.top .t { text-align: right; font-size: 9pt; color: #5b6b7c; line-height: 1.45; }
.top .t b { display: block; color: #0a2540; font-size: 10.5pt; font-weight: 600; }
.k { margin: 12px 0 4px; font-size: 8.5pt; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: #5b6b7c; }
.card { width: 100%; border-collapse: collapse; font-size: 8.8pt; line-height: 1.45; }
.card th { width: 27%; text-align: left; vertical-align: top; font-weight: 500; color: #5b6b7c; padding: 4px 10px 4px 0; border-bottom: 1px solid #e3e8ee; }
.card td { padding: 4px 0; border-bottom: 1px solid #e3e8ee; color: #0e1b29; }
.card td small { color: #7a8897; }
.chips span { display: inline-block; margin: 0 4px 3px 0; padding: 0 7px; border: 1px solid #c9d4df; border-radius: 3px; font-size: 8.5pt; }
.check { margin: 0; padding-left: 18px; font-size: 8.8pt; line-height: 1.45; }
.check li { margin: 0 0 4px; }
.note { margin-top: 10px; padding: 8px 12px; background: #f3f6f9; border-left: 3px solid #0a2540; font-size: 9pt; color: #44556a; }
.art { break-before: page; }
.cover { display: flex; gap: 18px; align-items: center; margin-bottom: 8px; }
.cover img { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #e3e8ee; flex: none; }
.crumbs { font-size: 8.5pt; color: #7a8897; margin-bottom: 6px; }
h1 { font-size: 21pt; line-height: 1.2; color: #0a2540; font-weight: 600; margin: 0 0 8px; letter-spacing: -.01em; }
.meta { font-size: 9pt; color: #5b6b7c; }
.meta b { color: #0a2540; font-weight: 600; }
.lead { font-size: 11.5pt; line-height: 1.6; color: #0e1b29; margin: 16px 0 6px; }
h2 { font-size: 14pt; line-height: 1.3; color: #0a2540; font-weight: 600; margin: 22px 0 6px; break-after: avoid; }
h3 { font-size: 11pt; color: #0a2540; font-weight: 600; margin: 14px 0 3px; break-after: avoid; }
p { margin: 0 0 8px; }
ul, ol { margin: 0 0 10px; padding-left: 20px; }
li { margin: 0 0 4px; }
table:not(.card) { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 8px 0 12px; break-inside: auto; }
table:not(.card) th { background: #0a2540; color: #fff; text-align: left; font-weight: 500; padding: 6px 8px; }
table:not(.card) td { padding: 5px 8px; border-bottom: 1px solid #e3e8ee; vertical-align: top; }
table:not(.card) tr:nth-child(even) td { background: #f6f8fa; }
tr { break-inside: avoid; }
.cta { margin-top: 18px; padding: 14px 16px; background: #0a2540; color: #d7e3f0; border-radius: 4px; break-inside: avoid; }
.cta b { display: block; color: #fff; font-size: 11.5pt; margin-bottom: 4px; }
.cta a { color: #fff; text-decoration-color: #4da3ff; }
"""

def page(meta, body, cover, words, chars):
    q = ''.join(f'<span>{esc(x)}</span>' for x in meta['queries'])
    links = '<br>'.join(f'{esc(n)}: <a href="{DOMAIN}{u}">{esc(u)}</a>' for n, u in meta['links'])
    card = f"""
<table class="card">
<tr><th>Адрес страницы</th><td><a href="{meta['url']}">{esc(meta['url'])}</a></td></tr>
<tr><th>Title</th><td>{esc(meta['title'])} <small>({len(meta['title'])} символов, норма до 60)</small></td></tr>
<tr><th>Description</th><td>{esc(meta['description'])} <small>({len(meta['description'])} символов, норма 140–160)</small></td></tr>
<tr><th>Заголовок H1</th><td>{esc(meta['h1'])}</td></tr>
<tr><th>Целевые запросы</th><td class="chips">{q}</td></tr>
<tr><th>Гарантийные запросы договора</th><td>{'<br>'.join(esc(x) for x in meta['guaranteed'])}</td></tr>
<tr><th>Роль в продвижении</th><td>{esc(meta['role'])}</td></tr>
<tr><th>Внутренние ссылки</th><td>{links}</td></tr>
<tr><th>Объём</th><td>{words} слов, {chars} знаков без пробелов, {meta['read']} мин чтения</td></tr>
<tr><th>Структура и разметка</th><td>подзаголовки H2 и H3, таблицы, блок «Вопросы и ответы»; разметка Article, FAQPage и BreadcrumbList</td></tr>
</table>"""
    checks = ''.join(f'<li>{esc(x)}</li>' for x in meta['check'])
    body = re.sub(r'href="(/[^"]*)"', lambda m: f'href="{DOMAIN}{m.group(1)}"', body)
    body = body.replace(' × ', ' × ')
    # неразрывный пробел между числом и единицей измерения
    body = re.sub(r'(\d) (кВт·ч|кВт|кВА|А·ч|мОм|мм|кг|мс|мин|°C|В|А|л|%|дБ)(?=[\s,.;:)<])', lambda m: m.group(1) + ' ' + m.group(2), body)
    return f"""<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>{esc(meta['h1'])}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&display=block">
<style>{CSS}</style></head><body>
<div class="top"><img src="{b64(os.path.join(IMG, 'logo.png'))}" alt="AEC Kazakhstan"><div class="t"><b>Статья для блога aecups.kz</b>на согласование · {TODAY} · подготовлено ArtSign Studio</div></div>
<div class="k">SEO-карточка</div>{card}
<div class="k">Что проверить заказчику</div><ol class="check">{checks}</ol>
<div class="note">Технические данные взяты из каталога и паспортов оборудования на сайте. Правки удобно оставлять комментариями прямо в PDF или списком по номерам пунктов. После согласования статья публикуется по указанному адресу и попадает в карту сайта.</div>
<div class="art">
<div class="cover"><img src="{b64(os.path.join(IMG, cover))}" alt=""><div><div class="crumbs">Главная / Блог / {esc(meta['category'])}</div><h1>{esc(meta['h1'])}</h1><div class="meta"><b>{esc(meta['category'])}</b> · {meta['read']} мин чтения · Инженеры AEC Kazakhstan</div></div></div>
{body}
</div></body></html>"""

def esc(s): return html.escape(str(s), quote=True)

def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        br = p.chromium.launch()
        for n, (fn, cover) in enumerate(ORDER, 1):
            src = io.open(os.path.join(ROOT, fn), encoding='utf-8').read()
            m = re.match(r'\s*<!--meta\s*(\{.*?\})\s*-->', src, re.S)
            meta = json.loads(m.group(1)); body = src[m.end():]
            text = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', body))).strip()
            words, chars = len(text.split()), len(text.replace(' ', ''))
            doc = page(meta, body, cover, words, chars)
            tmp = os.path.join(OUT, f'_{n}.html'); io.open(tmp, 'w', encoding='utf-8').write(doc)
            pg = br.new_page()
            pg.goto('file:///' + tmp.replace('\\', '/'), wait_until='networkidle')
            pg.evaluate('document.fonts.ready')
            out = os.path.join(OUT, f'{n}-{meta["slug"]}.pdf')
            pg.pdf(path=out, format='A4', print_background=True, display_header_footer=True,
                   header_template='<span></span>',
                   footer_template='<div style="width:100%;font:8px Arial,sans-serif;color:#7a8897;padding:0 17mm;display:flex;justify-content:space-between"><span>AEC Kazakhstan · статья для блога aecups.kz · на согласование</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
                   margin={'top': '16mm', 'bottom': '18mm', 'left': '17mm', 'right': '17mm'})
            pg.close(); os.remove(tmp)
            print(f'{out}  ({words} слов, {chars} знаков)')
        br.close()

if __name__ == '__main__':
    main()
