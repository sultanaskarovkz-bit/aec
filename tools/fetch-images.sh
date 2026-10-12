#!/usr/bin/env bash
# Скачивает все изображения из assets/images.json в assets/img/. Запускать на машине с доступом к aecups.kz:
#   bash tools/fetch-images.sh   (из папки aec)
set -e
cd "$(dirname "$0")/../site"
mkdir -p assets/img
python3 - <<'PY'
import json, subprocess, os
m = json.load(open('assets/images.json', encoding='utf-8'))
ok = fail = 0
for local, url in m.items():
    if local.startswith('_'): continue
    dst = os.path.join('assets/img', local)
    if os.path.exists(dst) and os.path.getsize(dst) > 0: ok += 1; continue
    r = subprocess.run(['curl', '-sSL', '--retry', '2', '-A', 'Mozilla/5.0', '-o', dst, url])
    if r.returncode == 0 and os.path.getsize(dst) > 0: ok += 1; print('ok ', local)
    else: fail += 1; print('FAIL', local, url); 
    if os.path.exists(dst) and os.path.getsize(dst) == 0: os.remove(dst)
print(f'done: {ok} ok, {fail} failed')
PY
