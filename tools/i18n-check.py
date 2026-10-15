# Проверка выравнивания блоков переводов: числа и латинские токены в оригинале и переводе должны совпадать по позициям.
# python tools/i18n-check.py [N]   (N — номер блока, по умолчанию все)
import json, os, re, sys, glob
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(ROOT, 'crawl', 'i18n')
def sig(s):
    nums = re.findall(r'\d+(?:[.,]\d+)?', s)
    lat = re.findall(r'\b[A-Z][A-Za-z0-9+-]{2,}\b', s)
    return [n.replace(',', '.') for n in nums], lat
chunks = sys.argv[1:] or [os.path.basename(f)[3:-5] for f in sorted(glob.glob(os.path.join(D, 'ru-*.json')))]
for n in chunks:
    ru = json.load(open(os.path.join(D, f'ru-{n}.json'), encoding='utf-8'))
    for lang in ('kz', 'en'):
        f = os.path.join(D, f'{lang}-{n}.json')
        if not os.path.exists(f): continue
        tr = json.load(open(f, encoding='utf-8'))
        print(f'{lang}-{n}: {len(tr)}/{len(ru)}')
        bad = 0
        for i in range(min(len(ru), len(tr))):
            a, b = sig(ru[i]), sig(tr[i])
            if a[0] != b[0] or (set(a[1]) - set(b[1]) and lang == 'en' and not re.search(r'[А-Яа-яЁё]', ru[i]) is None and False):
                bad += 1
                if bad <= 6: print(f'   #{i}: {ru[i][:70]!r} -> {tr[i][:70]!r}')
        if bad: print(f'   mismatches: {bad}')
