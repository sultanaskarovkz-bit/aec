# Приводит фото товаров к единому формату для сетки каталога: определяет цвет фона по углам,
# обрезает поля, вписывает товар в квадрат 1000×1000 на белом фоне с одинаковыми отступами (10 %).
# Запускать на оригиналах из медиатеки (tools/fetch-product-images.py), затем tools/optimize-images.py не нужен.
# python tools/normalize-product-images.py
import os
from PIL import Image, ImageOps, ImageChops, ImageStat

d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site', 'assets', 'img', 'products')
SIZE, MARGIN = 1000, 0.10

def corner_color(rgb):
    w, h = rgb.size; k = max(4, min(w, h) // 25)
    boxes = [(0, 0, k, k), (w - k, 0, w, k), (0, h - k, k, h), (w - k, h - k, w, h)]
    cols = [tuple(int(v) for v in ImageStat.Stat(rgb.crop(b)).median) for b in boxes]
    cols.sort(key=lambda c: sum(c))
    return cols[len(cols) // 2]

def trim(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        box = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        if box: im = im.crop(box)
        bg = Image.new('RGBA', im.size, (255, 255, 255, 255)); im = Image.alpha_composite(bg, im)
    rgb = im.convert('RGB')
    bgc = corner_color(rgb)
    if all(c > 195 for c in bgc) and any(c < 250 for c in bgc):
        # светло-серая подложка (EnerGrid и т.п.): пиксели, близкие к цвету фона, делаем белыми
        near = ImageChops.difference(rgb, Image.new('RGB', rgb.size, bgc)).convert('L').point(lambda v: 255 if v <= 14 else 0)
        rgb = Image.composite(Image.new('RGB', rgb.size, (255, 255, 255)), rgb, near)
        bgc = (255, 255, 255)
    diff = ImageChops.difference(rgb, Image.new('RGB', rgb.size, bgc)).convert('L').point(lambda v: 255 if v > 28 else 0)
    box = diff.getbbox()
    if box and (box[2] - box[0]) > 20 and (box[3] - box[1]) > 20:
        pad = 4
        box = (max(0, box[0] - pad), max(0, box[1] - pad), min(rgb.width, box[2] + pad), min(rgb.height, box[3] + pad))
        rgb = rgb.crop(box)
    light = all(c > 225 for c in bgc)
    return rgb, light

n = 0
for f in sorted(os.listdir(d)):
    p = os.path.join(d, f); ext = f.lower().rsplit('.', 1)[-1]
    if ext not in ('jpg', 'jpeg', 'png', 'webp'): continue
    im = ImageOps.exif_transpose(Image.open(p))
    im, light = trim(im)
    inner = int(SIZE * (1 - 2 * MARGIN))
    k = inner / max(im.width, im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    canvas = Image.new('RGB', (SIZE, SIZE), (255, 255, 255))
    canvas.paste(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    if ext in ('jpg', 'jpeg'): canvas.save(p, 'JPEG', quality=85, optimize=True, progressive=True)
    elif ext == 'webp': canvas.save(p, 'WEBP', quality=85)
    else: canvas.save(p, 'PNG', optimize=True)
    n += 1
    if not light: print('non-white background kept:', f)
print('normalized', n, 'files')
