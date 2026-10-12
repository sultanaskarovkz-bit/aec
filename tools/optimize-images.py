# Приводит скачанные изображения к веб-размерам: max 1600px по длинной стороне, JPEG q82 / PNG для логотипов.
# python3 tools/optimize-images.py
import os, sys
from PIL import Image, ImageOps
d = os.path.join(os.path.dirname(__file__), '..', 'site', 'assets', 'img')
for f in sorted(os.listdir(d)):
    p = os.path.join(d, f); ext = f.lower().rsplit('.', 1)[-1]
    if ext not in ('jpg', 'jpeg', 'png', 'webp'): continue
    try:
        im = Image.open(p); im = ImageOps.exif_transpose(im)
    except Exception as e: print('skip', f, e); continue
    w, h = im.size; mx = 1600 if not f.startswith(('client-', 'logo', 'favicon')) else 600
    if max(w, h) > mx: im.thumbnail((mx, mx), Image.LANCZOS)
    if ext in ('jpg', 'jpeg'): im.convert('RGB').save(p, 'JPEG', quality=82, optimize=True, progressive=True)
    elif ext == 'webp': im.save(p, 'WEBP', quality=82)
    else: im.save(p, 'PNG', optimize=True)
    print(f, w, h, '->', im.size, os.path.getsize(p) // 1024, 'KB')
