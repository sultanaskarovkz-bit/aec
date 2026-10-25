# Контактные листы кадров из tools/qa-home.py: python tools/qa-sheet.py shots/qa/390 prefix cols width
import sys, glob, os
from PIL import Image, ImageDraw
d, prefix = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
cw = int(sys.argv[4]) if len(sys.argv) > 4 else 480
fs = sorted(glob.glob(os.path.join(d, prefix + '*.png')))
ims = []
for f in fs:
    im = Image.open(f).convert('RGB'); k = cw / im.width; ims.append((os.path.basename(f), im.resize((cw, int(im.height * k)))))
ch = max(i.height for _, i in ims) + 16
s = Image.new('RGB', (cw * cols + (cols - 1) * 8, ch * ((len(ims) + cols - 1) // cols)), (200, 200, 200))
dr = ImageDraw.Draw(s)
for n, (name, im) in enumerate(ims):
    x, y = (n % cols) * (cw + 8), (n // cols) * ch
    s.paste(im, (x, y)); dr.text((x + 4, y + im.height + 2), name, fill=(0, 0, 0))
out = os.path.join(d, '_sheet-' + prefix.strip('-') + '.png'); s.save(out); print(out, len(ims))
