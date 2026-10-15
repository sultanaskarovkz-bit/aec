# Собирает словари переводов: crawl/i18n/ru-N.json (список русских строк) + kz-N.json / en-N.json (списки переводов
# в том же порядке) -> site/assets/i18n-kz.js и site/assets/i18n-en.js.
# python tools/i18n-build.py            сборка
# python tools/i18n-build.py --split    нарезать crawl/i18n-strings.json на блоки ru-N.json (по 250 строк)
import json, os, sys, glob
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(ROOT, 'crawl', 'i18n')
os.makedirs(D, exist_ok=True)
if '--split' in sys.argv:
    strings = list(json.load(open(os.path.join(ROOT, 'crawl', 'i18n-strings.json'), encoding='utf-8')).keys())
    n = 250
    for i in range(0, len(strings), n):
        json.dump(strings[i:i + n], open(os.path.join(D, f'ru-{i // n + 1}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('chunks', (len(strings) + n - 1) // n, 'strings', len(strings)); sys.exit()
for lang in ('kz', 'en'):
    out, missing, total = {}, 0, 0
    for f in sorted(glob.glob(os.path.join(D, 'ru-*.json')), key=lambda x: int(x.rsplit('-', 1)[1].split('.')[0])):
        ru = json.load(open(f, encoding='utf-8')); total += len(ru)
        tf = f.replace('ru-', lang + '-')
        if not os.path.exists(tf): missing += len(ru); continue
        tr = json.load(open(tf, encoding='utf-8'))
        if len(tr) != len(ru): print(f'WARNING {os.path.basename(tf)}: {len(tr)} translations for {len(ru)} strings')
        for r, t in zip(ru, tr):
            if t and t != r: out[r] = t
            else: missing += 1
    with open(os.path.join(ROOT, 'site', 'assets', f'i18n-{lang}.js'), 'w', encoding='utf-8') as fh:
        fh.write('/* Сгенерировано tools/i18n-build.py из crawl/i18n/. Не править руками. */\nwindow.AEC_I18N = window.AEC_I18N || {};\nwindow.AEC_I18N.' + lang + ' = ')
        fh.write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
        fh.write(';\n')
    print(lang, 'translated', len(out), 'of', total, 'missing', missing, 'size KB', os.path.getsize(os.path.join(ROOT, 'site', 'assets', f'i18n-{lang}.js')) // 1024)
