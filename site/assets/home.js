/* Главная AEC Kazakhstan: данные, сцена первого экрана, сценарий аварии (проигрывается по кнопке), эффекты.
   Библиотеки: GSAP 3.13 (ScrollTrigger, SplitText), Lenis 1.3 — локально в assets/vendor. */
(function () {
  'use strict';
  const D = AEC, U = AECUI, I = U.icon, L = U.L, C = D.CONTACT, img = U.img;
  U.init({ active: 'home' });
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pimg = (slot, alt) => img(slot, alt, '', 'data-ph="bg"');
  ['#mmenu', '.modal-box', '.drawer', '.mega'].forEach(s => $$(s).forEach(el => el.setAttribute('data-lenis-prevent', '')));

  /* ======================= Сцена: слои =======================
     Неподвижная геометрия дня и ночи рисуется один раз в SVG-картинки (<img>), поэтому в документе нет сотен узлов.
     Всё, что меняется при прокрутке, меняет только opacity и transform: это делает видеокарта без перерисовки страницы. */
  let seed = 11; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const yAt = (pts, x) => { for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const f1 = v => (+v).toFixed(1);
  const ridgePath = pts => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + ' L1600 900 L0 900 Z';
  const capPaths = (pts, maxY, fill) => {
    let out = '';
    for (let i = 1; i < pts.length - 1; i++) {
      const P = pts[i], Lp = pts[i - 1], R = pts[i + 1];
      if (P[1] >= Lp[1] || P[1] >= R[1] || P[1] > maxY) continue;
      const a = lerp(P, Lp, .34), b = lerp(P, R, .3), m1 = lerp(a, b, .3), m2 = lerp(a, b, .62);
      out += `<path fill="${fill}" d="M${P[0]} ${P[1]} L${f1(b[0])} ${f1(b[1])} L${f1(m2[0])} ${f1(m2[1] + 5)} L${f1(m2[0] - 8)} ${f1(m2[1] - 6)} L${f1(m1[0])} ${f1(m1[1] + 14)} L${f1(a[0])} ${f1(a[1])} Z"/>`;
    }
    return out;
  };
  const facets = (pts, fill) => {
    let s = '';
    for (let i = 1; i < pts.length - 1; i++) {
      const P = pts[i]; if (P[1] >= pts[i - 1][1] || P[1] >= pts[i + 1][1]) continue;
      let j = i + 1; while (j < pts.length - 1 && pts[j + 1][1] > pts[j][1]) j++;
      const V = pts[j], foot = P[0] + (V[0] - P[0]) * .22;
      s += `<path fill="${fill}" d="M${P[0]} ${P[1]} ${pts.slice(i + 1, j + 1).map(q => 'L' + q[0] + ' ' + q[1]).join(' ')} L${V[0]} 900 L${f1(foot)} 900 Z"/>`;
    }
    return s;
  };
  const rimLine = (pts, P) => P.rim ? `<path fill="none" stroke="${P.rim}" stroke-opacity="${P.rimO}" stroke-width="1.4" stroke-linejoin="round" d="M${pts.map(p => p[0] + ' ' + p[1]).join(' L')}"/>` : '';
  const vGrad = (id, y1, y2, stops) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${y1}" x2="0" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const FAR = [[0, 730], [120, 705], [230, 712], [340, 668], [450, 684], [540, 620], [630, 646], [720, 580], [810, 606], [900, 520], [980, 556], [1070, 470], [1150, 512], [1230, 440], [1310, 478], [1390, 418], [1470, 458], [1540, 432], [1600, 452]];
  const HAZE = [[0, 560], [120, 520], [260, 545], [400, 470], [520, 510], [660, 440], [800, 490], [940, 430], [1060, 470], [1180, 400], [1300, 445], [1420, 390], [1540, 430], [1600, 420]];
  const MID = [[0, 812], [160, 790], [300, 806], [440, 760], [560, 778], [680, 726], [800, 752], [920, 700], [1040, 640], [1150, 690], [1250, 650], [1360, 702], [1480, 668], [1600, 708]];
  // t: верх градиента, S/So: цвет и непрозрачность теневых граней, rim: лунный контур хребтов ночью
  const PAL = {
    day: { hazeT: '#f6f8fb', haze: '#e9eff5', tree: '#163355', farT: '#f1f5f9', far: '#dde6ef', farS: '#a9bccf', farSo: .5, mid: '#12345a', midT: '#2d5b8a', midS: '#06182e', midSo: .55, capFar: '#ffffff', capMid: '#ffffff', ground: '#0a2540', bldBt: '#30598a', bldB: '#1c3b60', bldFt: '#26517f', bldF: '#163357', bldKt: '#28547f', bldK: '#163357', win: '#4c6c92', turb: '#0a2540', pyl: '#0a2540', wire: '#0a2540', cross: '#e2e8f0', gen: '#1a3a60', led: '#3a4553', road: '#163a63', rim: '', rimO: 0 },
    night: { hazeT: '#18212c', haze: '#0d1218', tree: '#10161d', farT: '#202c3b', far: '#121a24', farS: '#04070b', farSo: .62, mid: '#141c26', midT: '#2a394b', midS: '#04070b', midSo: .58, capFar: '#4a5b6e', capMid: '#a9bdd0', ground: '#090b0e', bldBt: '#1d2734', bldB: '#0e131a', bldFt: '#232e3b', bldF: '#12181f', bldKt: '#2b3746', bldK: '#19212b', win: '#202b38', turb: '#c3cfdb', pyl: '#566577', wire: '#2a3442', cross: '#e2e8f0', gen: '#2b3644', led: '#3a4553', road: '#1d2632', rim: '#9fb8d2', rimO: .42 }
  };
  const BASE = 852;
  const TURB = [['far', 1150, .36, 2.6], ['far', 1310, .42, 2.9], ['far', 1450, .38, 3.3], ['mid', 1040, .9, 2.3], ['mid', 1250, .78, 2.7], ['mid', 1480, .72, 2.5]].map(([d, x, s, dur]) => ({ d, x, s, dur, y: yAt(d === 'far' ? FAR : MID, x) }));
  const svgDoc = (vb, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}">${inner}</svg>`;
  const layer = (cls, vb, inner) => `<img class="lyr ${cls}" alt="" draggable="false" decoding="async" src="data:image/svg+xml,${encodeURIComponent(svgDoc(vb, inner))}" style="left:${vb[0]}px;top:${vb[1]}px;width:${vb[2]}px;height:${vb[3]}px">`;
  const tower = (t, c) => { const h = 170 * t.s; return `<path fill="${c}" d="M${f1(t.x - 3.6 * t.s)} ${f1(t.y)} L${f1(t.x - 1.6 * t.s)} ${f1(t.y - h)} L${f1(t.x + 1.6 * t.s)} ${f1(t.y - h)} L${f1(t.x + 3.6 * t.s)} ${f1(t.y)} Z"/><rect fill="${c}" x="${f1(t.x - 5 * t.s)}" y="${f1(t.y - h - 4 * t.s)}" width="${f1(12 * t.s)}" height="${f1(7 * t.s)}"/>`; };
  const rotor = (t, c) => { const len = 74 * t.s, w = 4.2 * t.s, R = Math.ceil(len + 4), bl = `<path fill="${c}" d="M${-w} 0 Q${-w * .6} ${-len * .55} 0 ${-len} Q${w * .9} ${-len * .5} ${w} 0 Z"/>`; return { R, svg: svgDoc([-R, -R, 2 * R, 2 * R], `${bl}<g transform="rotate(120)">${bl}</g><g transform="rotate(240)">${bl}</g><circle fill="${c}" r="${f1(3.4 * t.s)}"/>`) }; };
  const pylonPath = (x, s) => { const h = 132 * s, b = BASE + 6; return `M${f1(x - 20 * s)} ${b} L${f1(x - 6 * s)} ${f1(b - h)} L${f1(x + 6 * s)} ${f1(b - h)} L${f1(x + 20 * s)} ${b} M${f1(x - 16 * s)} ${f1(b - h * .3)} L${f1(x + 16 * s)} ${f1(b - h * .3)} M${f1(x - 12 * s)} ${f1(b - h * .6)} L${f1(x + 12 * s)} ${f1(b - h * .6)} M${f1(x - 16 * s)} ${f1(b - h * .3)} L${f1(x + 12 * s)} ${f1(b - h * .6)} M${f1(x + 16 * s)} ${f1(b - h * .3)} L${f1(x - 12 * s)} ${f1(b - h * .6)} M${f1(x - 34 * s)} ${f1(b - h * .82)} L${f1(x + 34 * s)} ${f1(b - h * .82)} M${f1(x - 9 * s)} ${f1(b - h * .6)} L${f1(x - 34 * s)} ${f1(b - h * .82)} M${f1(x + 9 * s)} ${f1(b - h * .6)} L${f1(x + 34 * s)} ${f1(b - h * .82)}`; };

  // Геометрия города: одна на все версии (день, ночь, свет в окнах)
  function cityGeometry() {
    const wins = (x, y, w, h) => { const out = [], cols = Math.max(1, Math.floor((w - 8) / 11)), rows = Math.max(1, Math.floor((h - 10) / 15)); for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { if (rnd() < .22) continue; out.push([x + 6 + c * 11, y + 8 + r * 15]); } return out; };
    const back = [], front = [];
    let x = 860; while (x < 1600) { const w = 24 + rnd() * 34, h = 36 + rnd() * 92; back.push({ x, w, h, wins: wins(x, BASE - h, w, h - 8) }); x += w + 2 + rnd() * 6; }
    [[880, 1030], [1186, 1226], [1344, 1376], [1544, 1600]].forEach(([a, b]) => { let x2 = a; while (x2 < b - 14) { const w = Math.min(b - x2, 22 + rnd() * 30), h = 24 + rnd() * 50; front.push({ x: x2, w, h, wins: wins(x2, BASE - h, w, h - 6) }); x2 += w + 3; } });
    const keepWins = [...wins(1090, 752, 90, 96), ...wins(1382, 812, 96, 40)];
    const pylX = [140, 380, 620, 860, 1010], pylS = [.92, .96, 1, 1.02, .88];
    const tops = pylX.map((px, i) => [px, BASE - 132 * pylS[i] * .82]);
    const wires = [`M-20 ${f1(tops[0][1] - 6)} Q60 ${f1(tops[0][1] + 24)} ${f1(tops[0][0] - 32 * pylS[0])} ${f1(tops[0][1])}`];
    for (let i = 0; i < tops.length; i++) { const a = tops[i], b = i < tops.length - 1 ? tops[i + 1] : [1063, 824]; [-32, 32].forEach(dx => { const ax = a[0] + dx * pylS[i], bx = b[0] + (i < tops.length - 1 ? dx * pylS[i + 1] : 0); wires.push(`M${f1(ax)} ${f1(a[1])} Q${f1((ax + bx) / 2)} ${f1(Math.max(a[1], b[1]) + 30)} ${f1(bx)} ${f1(b[1])}`); }); }
    const lamps = []; for (let lx = 40; lx < 1600; lx += 74) lamps.push(lx);
    // высотки заднего плана с антеннами и детали крыш
    const towers = [[1192, 34, 172], [1356, 30, 150], [1522, 36, 188], [905, 28, 140]].map(([x, w, h]) => ({ x, w, h, wins: wins(x, BASE - h, w, h - 8) }));
    towers.forEach(t => back.push(t));
    const roof = back.map(b => { const r = rnd(); return r < .18 ? { k: 'ant', x: b.x + b.w * .5, y: BASE - b.h } : r < .34 ? { k: 'tank', x: b.x + 4, y: BASE - b.h } : r < .5 ? { k: 'ac', x: b.x + b.w - 12, y: BASE - b.h } : null; }).filter(Boolean);
    // деревья вдоль дороги между зданиями переднего плана
    const trees = []; let tx = 872;
    while (tx < 1600) { const inKeep = [[1086, 1184], [1226, 1344], [1376, 1484], [1484, 1544]].some(([a, b]) => tx > a - 8 && tx < b + 8); if (!inKeep) trees.push({ x: tx, r: 8 + rnd() * 6 }); tx += 60 + rnd() * 70; }
    return { back, front, keepWins, pylX, pylS, wires, lamps, towers, roof, trees };
  }
  const G = cityGeometry();
  const GROUND = 'M0 868 C 300 854, 600 864, 900 852 S 1400 850, 1600 846 L1600 900 L0 900 Z';
  function nearLayer(P) {
    const bb = (id, t, b) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
    let s = `<defs>${bb('gb', P.bldBt, P.bldB)}${bb('gf', P.bldFt, P.bldF)}${bb('gk', P.bldKt, P.bldK)}</defs>`;
    G.back.forEach(b => { s += `<rect fill="url(#gb)" x="${f1(b.x)}" y="${f1(BASE - b.h)}" width="${f1(b.w)}" height="${f1(b.h + 10)}"/>` + b.wins.map(([x, y]) => `<rect fill="${P.win}" x="${x}" y="${f1(y)}" width="5" height="7"/>`).join(''); });
    G.towers.forEach(t => { s += `<rect fill="${P.bldB}" x="${f1(t.x - 1.2 + t.w / 2)}" y="${f1(BASE - t.h - 26)}" width="2.4" height="26"/>`; });
    G.roof.forEach(r => { s += r.k === 'ant' ? `<rect fill="${P.pyl}" x="${f1(r.x - .8)}" y="${f1(r.y - 14)}" width="1.6" height="14"/><rect fill="${P.pyl}" x="${f1(r.x - 4)}" y="${f1(r.y - 10)}" width="8" height="1.2"/>` : r.k === 'tank' ? `<rect fill="${P.bldF}" x="${f1(r.x)}" y="${f1(r.y - 8)}" width="9" height="8" rx="1"/>` : `<rect fill="${P.bldF}" x="${f1(r.x)}" y="${f1(r.y - 5)}" width="10" height="5"/>`; });
    s += `<g fill="none" stroke="${P.wire}" stroke-width="1.6">${G.wires.map(d => `<path d="${d}"/>`).join('')}</g>`;
    s += `<path fill="none" stroke="${P.pyl}" stroke-width="2" stroke-linejoin="round" d="${G.pylX.map((x, i) => pylonPath(x, G.pylS[i])).join(' ')}"/>`;
    G.front.forEach(b => { s += `<rect fill="url(#gf)" x="${f1(b.x)}" y="${f1(BASE - b.h)}" width="${f1(b.w)}" height="${f1(b.h + 10)}"/>` + b.wins.map(([x, y]) => `<rect fill="${P.win}" x="${x}" y="${f1(y)}" width="5" height="7"/>`).join(''); });
    s += `<rect fill="url(#gk)" x="1090" y="742" width="90" height="120"/><rect fill="${P.bldK}" x="1116" y="728" width="38" height="16"/><rect fill="${P.cross}" x="1129" y="731" width="12" height="10"/><rect fill="${P.cross}" x="1131" y="729" width="8" height="14"/>`;
    s += `<rect fill="url(#gk)" x="1230" y="772" width="110" height="90"/>`; for (let r = 0; r < 4; r++) s += `<rect fill="${P.win}" x="1240" y="${786 + r * 15}" width="90" height="4"/>`;
    s += `<path fill="url(#gk)" d="M1380 862 V804 L1405 790 V804 L1430 790 V804 L1455 790 V804 L1480 790 V862 Z"/><rect fill="${P.bldK}" x="1456" y="742" width="13" height="56"/>`;
    s += G.keepWins.map(([x, y]) => `<rect fill="${P.win}" x="${x}" y="${f1(y)}" width="5" height="7"/>`).join('');
    s += `<rect fill="${P.gen}" x="1488" y="824" width="52" height="30"/><rect fill="${P.gen}" x="1528" y="812" width="5" height="14"/><circle fill="${P.led}" cx="1498" cy="834" r="3.4"/>`;
    // подстанция: трансформатор с изоляторами, забор
    s += `<rect fill="${P.gen}" x="1040" y="828" width="46" height="34"/><rect fill="${P.pyl}" x="1046" y="818" width="3" height="10"/><rect fill="${P.pyl}" x="1061" y="818" width="3" height="10"/><rect fill="${P.pyl}" x="1076" y="818" width="3" height="10"/><rect fill="${P.pyl}" x="1037" y="824" width="52" height="2"/>`;
    s += `<path fill="none" stroke="${P.pyl}" stroke-width="1" d="M1032 848 H1094 M1032 856 H1094 M1034 844 V862 M1092 844 V862"/>`;
    // деревья и фонарные столбы
    G.trees.forEach(t => { s += `<rect fill="${P.tree}" x="${f1(t.x - 1.2)}" y="${f1(866 - t.r)}" width="2.4" height="${f1(t.r + 2)}"/><circle fill="${P.tree}" cx="${f1(t.x)}" cy="${f1(858 - t.r)}" r="${f1(t.r)}"/><circle fill="${P.tree}" cx="${f1(t.x - t.r * .5)}" cy="${f1(862 - t.r * .7)}" r="${f1(t.r * .7)}"/><circle fill="${P.tree}" cx="${f1(t.x + t.r * .5)}" cy="${f1(862 - t.r * .7)}" r="${f1(t.r * .7)}"/>`; });
    G.lamps.forEach(lx => { s += `<rect fill="${P.pyl}" x="${lx - 1}" y="852" width="2" height="26"/><rect fill="${P.pyl}" x="${lx - 5}" y="850" width="10" height="3"/>`; });
    s += `<path fill="${P.ground}" d="${GROUND}"/><path fill="none" stroke="${P.road}" stroke-width="1.5" stroke-dasharray="14 12" d="M0 890 H1600"/>`;
    return s;
  }
  function hazeLayer(P) { return `<defs>${vGrad('hz', 390, 760, [[0, P.hazeT], [1, P.haze]])}</defs><path fill="url(#hz)" d="${ridgePath(HAZE)}"/>`; }
  // телебашня Кок-Тобе на дальнем хребте
  function tvTower(P) { const x = 1500, y = yAt(FAR, 1500) + 2, h = 118; return `<g fill="none" stroke="${P.turb}" stroke-width="1.6" stroke-linejoin="round"><path d="M${x - 9} ${y} L${x - 2.2} ${y - h} L${x + 2.2} ${y - h} L${x + 9} ${y} M${x - 7} ${y - h * .22} L${x + 7} ${y - h * .22} M${x - 5.2} ${y - h * .45} L${x + 5.2} ${y - h * .45} M${x - 3.6} ${y - h * .68} L${x + 3.6} ${y - h * .68} M${x - 7} ${y - h * .22} L${x + 5.2} ${y - h * .45} M${x + 7} ${y - h * .22} L${x - 5.2} ${y - h * .45} M${x - 5.2} ${y - h * .45} L${x + 3.6} ${y - h * .68} M${x + 5.2} ${y - h * .45} L${x - 3.6} ${y - h * .68}"/><rect fill="${P.turb}" stroke="none" x="${x - 6}" y="${y - h * .82}" width="12" height="9"/><rect fill="${P.turb}" stroke="none" x="${x - 1.2}" y="${y - h - 18}" width="2.4" height="18"/></g>`; }
  function farLayer(P) { return `<defs>${vGrad('fg', 410, 760, [[0, P.farT], [1, P.far]])}${vGrad('fs', 410, 820, [[0, P.farS, P.farSo], [1, P.farS, 0]])}</defs><path fill="url(#fg)" d="${ridgePath(FAR)}"/>` + facets(FAR, 'url(#fs)') + capPaths(FAR, 560, P.capFar) + rimLine(FAR, P) + tvTower(P) + TURB.filter(t => t.d === 'far').map(t => tower(t, P.turb)).join(''); }
  function midLayer(P) { return `<defs>${vGrad('mg', 630, 860, [[0, P.midT], [1, P.mid]])}${vGrad('ms', 630, 880, [[0, P.midS, P.midSo], [1, P.midS, 0]])}</defs><path fill="url(#mg)" d="${ridgePath(MID)}"/>` + facets(MID, 'url(#ms)') + capPaths(MID, 700, P.capMid) + rimLine(MID, P) + TURB.filter(t => t.d === 'mid').map(t => tower(t, P.turb)).join(''); }
  const LIT_BANDS = [[0, 1110, .02], [1110, 1360, .1], [1360, 1600, .18]];
  const WARM = ['#ffcf6b', '#ffcf6b', '#ffd98c', '#ffe3a8', '#fff0cc', '#cfe4ff'];
  function litBand(x0, x1) {
    let s = `<defs><linearGradient id="lc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient></defs>`;
    [...G.back, ...G.front].forEach(b => b.wins.forEach(([x, y]) => { if (x >= x0 && x < x1) { const c = WARM[(x * 7 + Math.round(y) * 3) % WARM.length]; s += `<rect fill="${c}" opacity=".2" x="${x - 2}" y="${f1(y - 2)}" width="9" height="11"/><rect fill="${c}" x="${x}" y="${f1(y)}" width="5" height="7"/>`; } }));
    G.lamps.forEach(lx => { if (lx >= x0 && lx < x1) s += `<path fill="url(#lc)" d="M${lx - 3} 854 L${lx + 3} 854 L${lx + 17} 880 L${lx - 17} 880 Z"/><circle fill="#ffe6a8" cx="${lx}" cy="855" r="2.6"/><ellipse fill="#ffcf6b" opacity=".2" cx="${lx}" cy="874" rx="18" ry="6"/>`; });
    return s;
  }
  const CROPS = w => w < 600 ? [1020, 0, 560, 900] : w < 1024 ? [800, 0, 800, 900] : [120, 60, 1480, 840];
  function buildScene() {
    const stage = $('#stage');
    const mobile = innerWidth < 1024, cutX = CROPS(innerWidth)[0] - 40, small = innerWidth < 600;
    // небо
    let stA = '', stB = '';
    for (let i = 0; i < 90; i++) { const c = `<circle fill="#fff" opacity="${(.4 + rnd() * .6).toFixed(2)}" cx="${(rnd() * 1600).toFixed(0)}" cy="${(20 + rnd() * 400).toFixed(0)}" r="${(.6 + rnd() * 1.4).toFixed(1)}"/>`; if (i % 3) stA += c; else stB += c; }
    const cloudSvg = svgDoc([0, 0, 190, 64], `<g fill="#e9eef3"><rect x="0" y="18" width="190" height="34" rx="17"/><circle cx="62" cy="22" r="28"/><circle cx="108" cy="16" r="36"/><circle cx="148" cy="28" r="22"/></g>`);
    const cloudSrc = 'data:image/svg+xml,' + encodeURIComponent(cloudSvg);
    const clouds = (small ? [[120, 1, 30, 0], [210, .7, 40, -16]] : [[120, 1, 38, 0], [230, .7, 52, -20], [170, .8, 58, -33]]).map(([y, s, d, dl]) => `<div class="drift" style="top:${y}px;width:${190 * s}px;animation-duration:${d}s;animation-delay:${dl}s"><img alt="" src="${cloudSrc}"></div>`).join('');
    // ветряки: мачты в слоях, роторы отдельно и крутятся видеокартой
    const rotors = d => TURB.filter(t => t.d === d && t.x + 80 > cutX).map(t => { const rd = rotor(t, PAL.day.turb), rn = rotor(t, PAL.night.turb); return `<div class="rotor" style="left:${f1(t.x - rd.R)}px;top:${f1(t.y - 170 * t.s - rd.R)}px;width:${2 * rd.R}px;height:${2 * rd.R}px;animation-duration:${t.dur}s"><img alt="" src="data:image/svg+xml,${encodeURIComponent(rd.svg)}"><img class="nt" alt="" src="data:image/svg+xml,${encodeURIComponent(rn.svg)}"></div>`; }).join('');
    // снег с вершин: одна анимация на вершину, внутри 3 снежинки
    let flakes = '';
    [[1040, 640], [1250, 650], [1480, 668], [1070, 470], [1230, 440], [1390, 418], [900, 520], [1150, 512], [1540, 432]].forEach(([x, y], q) => { if (x < cutX || (small && q % 2)) return; const dots = Array.from({ length: 3 }, () => `<circle fill="#fff" cx="${(4 + rnd() * 22).toFixed(1)}" cy="${(4 + rnd() * 20).toFixed(1)}" r="${(1 + rnd() * 1.2).toFixed(1)}"/>`).join(''); flakes += `<div class="flake" style="left:${x - 8}px;top:${y + 2}px;animation-delay:${(-rnd() * 2.4).toFixed(2)}s"><img alt="" src="data:image/svg+xml,${encodeURIComponent(svgDoc([0, 0, 30, 28], dots))}"></div>`; });
    // трава: 10 полос, волна ветра
    let grass = '';
    for (let g = 0; g < 5; g++) { let d = ''; const x0 = g * 320; if (x0 + 330 < cutX) continue; for (let gx = 0; gx < 320; gx += 8 + rnd() * 7) { const gy = 40 - (x0 + gx > 860 ? 6 : 0) + rnd() * 5, h = 14 + rnd() * 20, w = 2.6 + rnd() * 2; d += `M${f1(gx)} ${f1(gy)} Q${f1(gx + w * .3)} ${f1(gy - h * .6)} ${f1(gx + w * 1.4)} ${f1(gy - h)} Q${f1(gx + w * .9)} ${f1(gy - h * .5)} ${f1(gx + w)} ${f1(gy)} Z `; } grass += `<div class="grass" style="left:${x0}px;animation-delay:${(-g * .3).toFixed(2)}s"><img alt="" src="data:image/svg+xml,${encodeURIComponent(svgDoc([0, 0, 326, 46], `<path fill="#2b5a8c" d="${d}"/>`))}"></div>`; }
    // машины ночью
    let cars = ''; for (let c = 0; c < (small ? 2 : 4); c++) { const dir = c % 2; cars += `<i class="car ${dir ? 'l' : 'r'}" style="top:${dir ? 886 : 890}px;animation-duration:${(7 + rnd() * 6).toFixed(1)}s;animation-delay:${(-rnd() * 10).toFixed(1)}s"></i>`; }
    // ток бежит по проводам (только десктоп)
    const sparks = mobile ? '' : G.wires.filter((_, i) => i % 2 === 1).slice(0, 7).map((d, i) => `<i class="spark" style="offset-path:path('${d}');animation-duration:${(2.2 + (i % 3) * .5).toFixed(1)}s;animation-delay:${(-i * .7).toFixed(1)}s"></i>`).join('');
    // мокрая дорога: отражения фонарей и подсветки защищённых зданий
    const wetSvg = `<defs><linearGradient id="wr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></linearGradient><linearGradient id="ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cde3" stop-opacity=".12"/><stop offset="1" stop-color="#b9cde3" stop-opacity="0"/></linearGradient></defs><rect fill="url(#ws)" x="0" y="874" width="1600" height="26"/>` + G.lamps.map(lx => `<rect fill="url(#wr)" x="${lx - 2.5}" y="877" width="5" height="23"/>`).join('');
    const wetkSvg = `<defs><linearGradient id="wb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4da3ff" stop-opacity=".42"/><stop offset="1" stop-color="#4da3ff" stop-opacity="0"/></linearGradient></defs>` + [[1090, 90], [1230, 110], [1380, 100]].map(([x, w]) => `<rect fill="url(#wb)" x="${x}" y="868" width="${w}" height="30"/>`).join('');
    const arcSvg = `<svg class="arc" viewBox="0 0 80 60" style="left:1023px;top:790px;width:80px;height:60px"><g stroke="#e4f2ff" stroke-width="1.6" stroke-linecap="round" fill="none"><path d="M24 30 L32 22 L30 30 L40 18"/><path d="M50 32 L58 22 L56 30 L64 20"/><path d="M38 34 L46 26"/></g><circle fill="#cfe7ff" cx="38" cy="28" r="4"/></svg>`;
    const glowSvg = `<defs><radialGradient id="g"><stop offset="0" stop-color="#4da3ff" stop-opacity=".8"/><stop offset=".45" stop-color="#4da3ff" stop-opacity=".26"/><stop offset="1" stop-color="#4da3ff" stop-opacity="0"/></radialGradient></defs>` + [[1135, 800], [1285, 815], [1440, 825]].map(([x, y]) => `<circle fill="url(#g)" cx="${x}" cy="${y}" r="90"/>`).join('');
    const keepSvg = G.keepWins.map(([x, y]) => `<rect fill="#ffcf6b" x="${x}" y="${f1(y)}" width="5" height="7"/>`).join('') + Array.from({ length: 4 }, (_, r) => `<rect fill="#ffcf6b" x="1240" y="${786 + r * 15}" width="90" height="4"/>`).join('') + `<rect fill="#ff5a5a" x="1129" y="731" width="12" height="10"/><rect fill="#ff5a5a" x="1131" y="729" width="8" height="14"/>`;
    const tag = (x, y, t1, t2, w) => `<div class="tag" style="left:${x}px;top:${y}px;width:${w}px"><b>${t1}</b><span>${t2}</span></div>`;
    // гроза: два яруса туч, дождь из плитки, молния в подстанцию, вспышка, искры
    const band = (base, amp, c, seedK) => { let d = `<rect fill="${c}" x="-40" y="-40" width="2080" height="${base + 40}"/>`; let x = -40; while (x < 2060) { const r = amp * (.55 + rnd() * .9); d += `<circle fill="${c}" cx="${x.toFixed(0)}" cy="${(base - r * .35 + rnd() * amp * .3).toFixed(0)}" r="${r.toFixed(0)}"/>`; x += r * .9; } return d; };
    const stormBack = svgDoc([0, 0, 2000, 320], band(150, 70, '#232d3a'));
    const stormFront = svgDoc([0, 0, 2000, 320], band(205, 58, '#151b23'));
    const rainTile = (w, h, x1, x2, op, sw) => 'data:image/svg+xml,' + encodeURIComponent(svgDoc([0, 0, w, h], `<path stroke="rgba(230,240,255,${op})" stroke-width="${sw}" stroke-linecap="round" d="M${x1} 2 L${x2} ${h * .48}"/>`));
    const bolt = `<svg class="bolt" viewBox="1000 -60 200 900" style="left:1000px;top:-60px;width:200px;height:900px"><defs><filter id="bg" x="-50%" y="-5%" width="200%" height="110%"><feGaussianBlur stdDeviation="6"/></filter></defs><path filter="url(#bg)" fill="none" stroke="#9fd0ff" stroke-width="9" stroke-linejoin="round" d="M1132 -50 L1096 180 L1120 262 L1068 470 L1094 562 L1056 742 L1063 824"/><path fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" d="M1132 -50 L1096 180 L1120 262 L1068 470 L1094 562 L1056 742 L1063 824"/><path fill="none" stroke="#dbeeff" stroke-width="1.6" stroke-linejoin="round" d="M1120 262 L1142 330 L1126 372 M1094 562 L1118 640"/></svg>`;
    const burst = `<svg class="burst" viewBox="0 0 120 120" style="left:1003px;top:764px;width:120px;height:120px"><g stroke="#fff3c4" stroke-width="2.4" stroke-linecap="round">${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2, r1 = 12 + rnd() * 8, r2 = 34 + rnd() * 22; return `<path d="M${(60 + Math.cos(a) * r1).toFixed(1)} ${(60 + Math.sin(a) * r1).toFixed(1)} L${(60 + Math.cos(a) * r2).toFixed(1)} ${(60 + Math.sin(a) * r2).toFixed(1)}"/>`; }).join('')}</g><circle fill="#fff" cx="60" cy="60" r="9"/></svg>`;
    // мерцающие окна (три группы) и серверные индикаторы ЦОД
    const flickWins = [...G.back, ...G.front].flatMap(b => b.wins).filter(([x]) => x > 870); const flick = (small ? [0, 1] : [0, 1, 2]).map(k => layer('fl op fl' + k, [860, 640, 740, 230], flickWins.filter((_, i) => i % 11 === k * 3 + 1).map(([x, y]) => `<rect fill="#ffe29a" x="${x}" y="${f1(y)}" width="5" height="7"/>`).join(''))).join('');
    const leds = [0, 1, 2].map(k => layer('led op led' + k, [1236, 782, 100, 62], Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => ((r * 5 + c + k) % 3 === 0) ? `<rect fill="${c % 2 ? '#7cf5a1' : '#8fd0ff'}" x="${1244 + c * 16 - 1236}" y="${786 + r * 15 - 782 + 1}" width="3" height="2"/>` : '').join('')).join(''))).join('');
    const beacon = `<i class="beacon" style="left:1497.6px;top:${f1(yAt(FAR, 1500) + 2 - 118 - 20)}px"></i>`;
    stage.innerHTML = `<div class="cam"><div class="cam2"><div class="cam3">
      <div class="g g-sky">
        <div class="sky-d op"></div><div class="sky-n op"></div><div class="dusk op"></div>
        <div class="stars op">${layer('', [0, 0, 1600, 440], stA + stB)}</div>
        <div class="sun op"></div><div class="moon op"></div>
        <div class="clouds op">${clouds}</div>
        <i class="shoot op"></i>
        <i class="plane op"></i>
        <div class="storm op">${small ? '' : `<div class="st-back"><img alt="" src="data:image/svg+xml,${encodeURIComponent(stormBack)}"></div>`}<div class="st-front"><img alt="" src="data:image/svg+xml,${encodeURIComponent(stormFront)}"></div></div>
        <div class="sheet op s1"></div><div class="sheet op s2"></div><div class="cityglow op"></div>
      </div>
      <div class="g g-far">${layer('dy', [0, 360, 1600, 540], hazeLayer(PAL.day))}${layer('nt', [0, 360, 1600, 540], hazeLayer(PAL.night))}<div class="haze op"></div>${layer('dy', [0, 300, 1600, 600], farLayer(PAL.day))}${layer('nt', [0, 300, 1600, 600], farLayer(PAL.night))}${beacon}${rotors('far')}<div class="mist md op" style="top:560px"></div><div class="mist mn op" style="top:560px"></div></div>
      <div class="g g-mid">${layer('dy', [0, 430, 1600, 470], midLayer(PAL.day))}${layer('nt', [0, 430, 1600, 470], midLayer(PAL.night))}${rotors('mid')}${flakes}<div class="mist md op m2" style="top:770px"></div><div class="mist mn op m2" style="top:770px"></div></div>
      <div class="g g-near">
        ${layer('dy', [0, 640, 1600, 260], nearLayer(PAL.day))}${layer('nt', [0, 640, 1600, 260], nearLayer(PAL.night))}
        ${mobile ? '' : layer('live op', [0, 640, 1100, 230], `<g fill="none" stroke="#4da3ff" stroke-width="1.8">${G.wires.map(d => `<path d="${d}"/>`).join('')}</g>`)}
        <div class="sparks op">${sparks}</div>
        ${layer('wet op', [0, 850, 1600, 50], wetSvg)}${layer('wetk op', [1080, 860, 420, 40], wetkSvg)}
        <div class="subsmoke op"><i></i><i style="animation-delay:.7s"></i><i style="animation-delay:1.4s"></i><i style="animation-delay:2.1s"></i></div>
        ${layer('glow op', [1030, 700, 520, 220], glowSvg)}
        ${LIT_BANDS.map(([a, b], i) => layer('lit op lit' + i, [a, 640, b - a, 250], litBand(a, b))).join('')}
        ${layer('keep op', [1080, 720, 410, 145], keepSvg)}
        <div class="flicks op">${flick}</div><div class="leds op">${leds}</div>
        <div class="genon op"><i class="led"></i><i class="puff"></i><i class="puff" style="animation-delay:.6s"></i><i class="puff" style="animation-delay:1.2s"></i></div>
        <div class="gflow op"><i></i></div>
        <div class="cars op">${cars}</div>
        <div class="grasses op">${grass}</div>
        <div class="rings op"><i style="left:1126px;top:719px"></i><i style="left:1276px;top:763px"></i><i style="left:1453px;top:733px"></i></div>
        <div class="tags op">${tag(1084, 660, 'Клиника', 'ИБП 80 кВА, N+1', 140)}${tag(1228, 708, 'ЦОД', 'ИБП 300 кВА, N+1', 146)}${tag(1384, 660, 'Производство', 'ДГУ 1 МВА + АВР', 140)}</div>
        ${bolt}${burst}${arcSvg}
      </div>
      <div class="rain op" style="left:${CROPS(innerWidth)[0] - 80}px;width:${CROPS(innerWidth)[2] + 160}px"><div class="r1" style="background-image:url('${rainTile(44, 120, 28, 17, .26, 1)}')"></div>${small ? '' : `<div class="r2" style="background-image:url('${rainTile(72, 190, 50, 30, .14, .9)}')"></div>`}</div>
      <div class="vig op"></div><div class="flash op"></div>
    </div></div></div>`;
  }
  buildScene();
  // кадр сцены: имитация viewBox + slice через transform сцены
  function layoutStage() {
    const hero = $('#hero'), st = $('#stage'); if (!hero || !st) return;
    const W = hero.clientWidth, H = hero.clientHeight, [cx, cy, cw, ch] = CROPS(innerWidth);
    const s = Math.max(W / cw, H / ch), tx = -(cx + (cw - W / s) / 2) * s, ty = H - (cy + ch) * s;
    st.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
  }
  layoutStage();
  // при закреплённом первом экране ширина обновляется после refresh ScrollTrigger, поэтому раскладка повторяется с задержкой и на refresh
  let lastW = innerWidth, relayoutT = 0;
  addEventListener('resize', () => { layoutStage(); clearTimeout(relayoutT); relayoutT = setTimeout(layoutStage, 400); if ((lastW < 1024) !== (innerWidth < 1024)) { lastW = innerWidth; buildScene(); applyScene(true); } });
  addEventListener('load', layoutStage);

  // Состояние сценария и его применение: только opacity и transform
  const S = { n: 0, city: 0, keep: 0, grid: 1, glow: 0, gen: 0, lbl: 0, flow: 0, sun: 0, moon: 420, storm: 0, rain: 0, bolt: 0, flash: 0, vg: 400, src: 0, bat: 100, hz: 0, gst: 0, smoke: 0, arc: 0, sh1: 0, sh2: 0 };
  const lastOp = new WeakMap();
  const setOp = (el, v) => { if (!el) return; v = Math.round(Math.max(0, Math.min(1, v)) * 1000) / 1000; if (lastOp.get(el) === v) return; lastOp.set(el, v); el.style.opacity = v; const off = v <= .001 && !el.classList.contains('lyr'); if (el._off !== off) { el._off = off; el.style.visibility = off ? 'hidden' : ''; el.classList.toggle('zz', off); } };
  const clamp01 = v => Math.max(0, Math.min(1, v));
  let E = null;
  const cacheEls = () => { const g = s => $('#stage ' + s); E = { nt: $$('#stage .nt'), dy: $$('#stage .dy'), skyN: g('.sky-n'), dusk: g('.dusk'), stars: g('.stars'), moon: g('.moon'), sun: g('.sun'), clouds: g('.clouds'), grass: g('.grasses'), cars: g('.cars'), live: g('.live'), sparks: g('.sparks'), lit: LIT_BANDS.map((_, i) => g('.lit' + i)), keep: g('.keep'), glow: g('.glow'), rings: g('.rings'), tags: g('.tags'), gen: g('.genon'), flow: g('.gflow'), sd: $('#hero .scrim-d'), sn: $('#hero .scrim-n'), sb: $('#hero .scrim-b'), storm: g('.storm'), rain: g('.rain'), bolt: g('.bolt'), burst: g('.burst'), flash: g('.flash'), vig: g('.vig'), haze: g('.haze'), beacon: g('.beacon'), shoot: g('.shoot'), flicks: g('.flicks'), leds: g('.leds'), skyD: g('.sky-d'), cityglow: g('.cityglow'), mistD: $$('#stage .mist.md'), mistN: $$('#stage .mist.mn'), wet: g('.wet'), wetk: g('.wetk'), smoke: g('.subsmoke'), arc: g('.arc'), sh1: g('.sheet.s1'), sh2: g('.sheet.s2'), plane: g('.plane') }; };
  let lastSun = null, lastMoon = null, lastStorm = null;
  function applyScene(force) {
    if (!E || force) { cacheEls(); lastSun = lastMoon = null; }
    const n = S.n;
    E.nt.forEach(e => setOp(e, n)); E.dy.forEach(e => setOp(e, n >= .999 ? 0 : 1));
    setOp(E.skyN, n); setOp(E.dusk, Math.sin(Math.PI * Math.min(1, n)) * .55); setOp(E.stars, n); setOp(E.moon, n); setOp(E.sun, 1 - n);
    setOp(E.clouds, 1 - n); setOp(E.grass, 1 - n); setOp(E.cars, n); setOp(E.sd, 1 - n); setOp(E.sn, n); setOp(E.sb, n);
    setOp(E.live, S.grid * n); setOp(E.sparks, S.grid * n);
    LIT_BANDS.forEach((b, i) => setOp(E.lit[i], clamp01((S.city - b[2]) * 5)));
    setOp(E.keep, S.keep); setOp(E.glow, S.glow * .75); setOp(E.rings, S.glow); setOp(E.tags, S.lbl); setOp(E.gen, S.gen); setOp(E.flow, S.flow);
    const su = Math.round(S.sun), mo = Math.round(S.moon);
    if (su !== lastSun) { lastSun = su; E.sun.style.transform = `translate3d(0, ${su}px, 0)`; }
    if (mo !== lastMoon) { lastMoon = mo; E.moon.style.transform = `translate3d(0, ${mo}px, 0)`; }
    const hudG = E.hudG || (E.hudG = $('#hudGrid')), hudS = E.hudS || (E.hudS = $('#hudSrc'));
    if (hudG) { const vg = Math.round(S.vg); if (hudG._v !== vg) { hudG._v = vg; hudG.textContent = vg + ' В'; hudG.classList.toggle('off', vg < 100); } }
    if (hudS) { const src = S.src | 0; if (hudS._v !== src) { hudS._v = src; hudS.textContent = ['от сети', 'от батарей ИБП', 'от дизель-генератора'][src]; hudS.classList.toggle('amber', src > 0); } }
    setOp(E.storm, S.storm); setOp(E.rain, S.rain * .62); setOp(E.bolt, S.bolt); setOp(E.burst, S.bolt); setOp(E.flash, S.flash);
    setOp(E.vig, n * .6); setOp(E.haze, Math.sin(Math.PI * Math.min(1, n)) * .5); setOp(E.beacon, n); setOp(E.shoot, n > .95 && S.storm < .2 ? 1 : 0);
    setOp(E.flicks, n > .5 ? clamp01((S.city - .15) * 4) : 0); setOp(E.leds, S.glow);
    setOp(E.skyD, 1 - n); setOp(E.cityglow, n * clamp01(S.city / 1.1) * (1 - .3 * S.storm));
    E.mistD.forEach(e => setOp(e, 1 - n)); E.mistN.forEach(e => setOp(e, n));
    setOp(E.wet, S.rain * n * clamp01(S.city)); setOp(E.wetk, S.rain * S.glow);
    setOp(E.smoke, S.smoke); setOp(E.arc, S.arc); setOp(E.sh1, S.sh1); setOp(E.sh2, S.sh2); setOp(E.plane, n * (1 - S.storm));
    const hb = E.hudB || (E.hudB = $('#hudBat')), hbs = E.hudBs || (E.hudBs = $('#hudBatS')), hg = E.hudGn || (E.hudGn = $('#hudGen')), hgs = E.hudGs || (E.hudGs = $('#hudGenS'));
    if (hb) { const b = Math.round(S.bat); if (hb._v !== b) { hb._v = b; hb.textContent = b + ' %'; } const st = (S.src | 0) === 1 ? 1 : (S.bat < 99.5 ? 2 : 0); if (hbs._v !== st) { hbs._v = st; hbs.textContent = ['заряжены', 'разряд', 'заряд'][st]; hbs.classList.toggle('amber', st > 0); } }
    if (hg) { const z = Math.round(S.hz); if (hg._v !== z) { hg._v = z; hg.textContent = z + ' Гц'; } const gs = S.gst | 0; if (hgs._v !== gs) { hgs._v = gs; hgs.textContent = ['в резерве', 'запуск', 'под нагрузкой', 'охлаждение'][gs]; hgs.classList.toggle('amber', gs === 1 || gs === 2); } }
    const sto = Math.round((1 - S.storm) * -760);
    if (sto !== lastStorm) { lastStorm = sto; E.storm.style.transform = `translate3d(${sto}px, 0, 0)`; }
  }
  applyScene();

  /* ======================= Данные секций ======================= */
  const logos = D.CLIENT_LOGOS.map(c => `<div title="${c[1]}">${img(c[0], c[1])}</div>`).join('');
  $('#clientLogos').innerHTML = logos + logos;
  // бесконечные CSS-анимации работают только пока блок на экране
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('offscreen', !e.isIntersecting)), { rootMargin: '100px 0px' });
    ['.clients-band'].forEach(s => { const el = $(s); if (el) io.observe(el); });
  }

  $('#eqGrid').innerHTML = D.CATEGORIES.map(c => {
    const ph = D.CAT_PHOTOS[c.id];
    return `<a class="eq" href="${L.cat(c.id)}"><span class="go">${I('chev')}</span><div class="im">${ph ? img(ph, c.full || c.name) : I(c.img)}</div><h3>${c.id === 'sts' ? 'Статические переключатели STS' : c.name}</h3><div class="rng">${c.range}${c.count ? ', ' + c.count + ' моделей' : ', под проект'}</div></a>`;
  }).join('') + `<a class="eq cta" href="${L.kp}"><span class="go">${I('chev')}</span><div class="big">Не нашли нужное? Подберём оборудование под проект</div><p>Отправьте техническое задание или опишите нагрузку: инженер рассчитает мощность и автономию и подготовит КП в течение рабочего дня.</p></a>`;

  $('#pjTrack').insertAdjacentHTML('beforeend', D.PROJECTS.map(p => `<a class="hp-pj-card" href="${L.project(p.id)}"><div class="im">${pimg(p.cover || p.photos[0], p.title)}<span class="kva">${p.kva}</span></div><div class="meta">${p.client}, ${p.city}, ${p.year}</div><h3>${p.title}</h3><div class="eq2">${p.equipment[0]}</div></a>`).join('')
    + `<div class="hp-pj-end"><b>Ваш объект может быть следующим</b><a class="btn btn-kp btn-lg" href="kp.html">Обсудить проект</a><a class="ulink" href="projects.html">Все проекты</a></div>`);
  $$('#pjTrack img').forEach(i => i.setAttribute('loading', 'eager'));

  const IPH = D.INDUSTRY_PHOTOS, HIND = D.HOME_INDUSTRIES.map(id => D.INDUSTRIES.find(x => x.id === id)).filter(Boolean);
  const list = $('#indList'), im = $('#indMedia');
  list.innerHTML = HIND.map((x, i) => `<li class="${i === 0 ? 'on' : ''}" data-i="${i}"><a href="${L.solution(x.id)}">${x.name}<small>${x.kva}</small></a></li>`).join('');
  im.innerHTML = `<div class="frame">${HIND.map((x, i) => img(IPH[x.id], x.h1, i === 0 ? 'on' : '', 'data-ph="bg"')).join('')}</div><div class="cap2" id="indCap"></div>`;
  let curInd = -1;
  function pick(i) { if (i === curInd) return; curInd = i; list.querySelectorAll('li').forEach((li, k) => li.classList.toggle('on', k === i)); im.querySelectorAll('.frame img').forEach((el, k) => el.classList.toggle('on', k === i)); const x = HIND[i]; $('#indCap').innerHTML = `<div><b>${x.h1}</b>${x.text}</div><a class="ulink" href="${L.solution(x.id)}">Подробнее</a>`; }
  pick(0);
  list.addEventListener('mouseover', e => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
  list.addEventListener('focusin', e => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });

  const NUM = [['2021', '', 'год основания', 0], [String(D.BRANDS.length), '', 'брендов в портфеле', 1], [String(D.PRODUCTS.length), '', 'позиций в каталоге', 1], ['4,8', 'МВА', 'максимальная мощность электростанции', 0]];
  $('#nums').innerHTML = NUM.map(n => `<div class="js-up"><b><span class="cnt" data-to="${n[3] ? n[0] : ''}">${n[0]}</span>${n[1] ? `<i>${n[1]}</i>` : ''}</b><span>${n[2]}</span></div>`).join('');
  const ROW = ['tescom', 'salicru', 'kehua-tech', 'hoppecke', 'bae-batterien', 'energrid', 'sprinter', 'bereli', 'yuasa', 'enersys', 'agg', 'baifa', 'socomec', 'everexceed', 'RSE', 'RID'];
  $('#brands').innerHTML = ROW.map(id => { const br = D.BRANDS.find(x => x.id === id); return br ? `<a href="${L.brand(br.id)}">${br.name}</a>` : `<span>${id}</span>`; }).join('');

  $('#svcPh').innerHTML = pimg('svc-dmitry.jpg', 'Инженер AEC проводит диагностику аккумуляторных батарей') + '<div class="badge2"><b>1 день</b><span>выезд инженера по Алматы</span></div>';
  $('#svcList').innerHTML = D.SERVICES.map(s => `<li><a href="${L.service(s.id)}"><span><b>${s.short}</b><small>${s.text}</small></span>${I('chev')}</a></li>`).join('');

  const a3 = D.ARTICLES[3];
  $('#newsMain').innerHTML = `<div class="im">${pimg('blog-kioge-1.jpg', a3.title)}</div><div class="meta"><span>${a3.cat}</span>, <span>${U.fmtDate(a3.date)}</span></div><h3>${a3.title}</h3><p>Стенд AEC Kazakhstan на нефтегазовой выставке: модульные ИБП Tescom, ДГУ в контейнерном исполнении и батареи Hoppecke для объектов добычи.</p>`;
  const ev = D.EXHIBITIONS.slice(0, 2).map(e => ({ d: String(e.year), t: e.name + ', ' + e.city, s: 'Выставка, ' + e.theme, href: 'about.html#exhibitions' }));
  const arts = [0, 1, 2].map(k => ({ d: U.fmtDate(D.ARTICLES[k].date), t: D.ARTICLES[k].title, s: D.ARTICLES[k].cat, href: L.article(k) }));
  $('#newsList').innerHTML = [arts[0], ev[0], arts[1], arts[2], ev[1]].map(n => `<li><a href="${n.href}"><span class="dt">${n.d}</span><span><b>${n.t}</b><small>${n.s}</small></span></a></li>`).join('');

  // Отзывы и карта 2ГИС
  const geo = C.geo || [43.285354, 76.982936], gisUrl = C.twogis;
  $('#rvScore').href = gisUrl + '/tab/reviews';
  $('#rvScore').innerHTML = `<b>${C.twogisRating || '5,0'}</b><span><span class="stars">★★★★★</span><small>рейтинг в 2ГИС, ${C.twogisReviews || 9} отзывов</small></span>`;
  $('#rvAll').href = gisUrl + '/tab/reviews'; $('#rvWrite').href = gisUrl + '/tab/reviews/addreview';
  const ini = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  $('#rvList').innerHTML = D.REVIEWS.slice(0, 6).map(r => `<li><div class="who"><span class="ava">${ini(r.name)}</span><span><b>${r.name}</b><small>${r.date}</small></span></div><div class="st" aria-label="5 из 5">★★★★★</div><p>${r.text}</p></li>`).join('');
  const mapOpts = { pos: { lat: geo[0], lon: geo[1], zoom: 16 }, opt: { city: 'almaty' }, org: '70000001060760363' };
  const mapEl = $('#rvMap');
  mapEl.innerHTML = `<div class="addr"><b>AEC Kazakhstan</b>${C.address}</div><button class="lock" type="button" aria-label="Включить управление картой"><span>Нажмите, чтобы двигать карту</span></button>`;
  const loadMap = () => { if (mapEl.querySelector('iframe')) return; mapEl.insertAdjacentHTML('afterbegin', `<iframe title="AEC Kazakhstan на карте 2ГИС" loading="lazy" src="https://widgets.2gis.com/widget?type=firmsonmap&options=${encodeURIComponent(JSON.stringify(mapOpts))}"></iframe>`); };
  if ('IntersectionObserver' in window) { const mio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { loadMap(); mio.disconnect(); } }, { rootMargin: '600px 0px' }); mio.observe(mapEl); } else loadMap();
  mapEl.querySelector('.lock').addEventListener('click', () => mapEl.classList.add('on'));

  $('#bigPhone').textContent = C.phone; $('#bigPhone').href = 'tel:+' + C.phoneRaw;
  $('#kv').innerHTML = `<div><dt>E-mail</dt><dd><a href="mailto:${C.email}">${C.email}</a></dd></div><div><dt>Офис и склад</dt><dd>${C.address}</dd></div><div><dt>Часы работы</dt><dd>${C.hours}</dd></div>`;
  $('#ctaWa').href = C.whatsapp;

  U.jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': 'https://aecups.kz/#org', name: 'AEC Kazakhstan', legalName: C.legal, url: 'https://aecups.kz/', logo: 'https://aecups.kz/assets/img/logo.png', image: 'https://aecups.kz/assets/img/og-aec.jpg', email: C.email, sameAs: [C.instagram, C.youtube, C.twogis], contactPoint: { '@type': 'ContactPoint', telephone: '+' + C.phoneRaw, contactType: 'sales', areaServed: 'KZ', availableLanguage: ['ru', 'kk'] } },
    { '@type': ['LocalBusiness', 'Store'], '@id': 'https://aecups.kz/#local', name: 'AEC Kazakhstan', url: 'https://aecups.kz/', image: 'https://aecups.kz/assets/img/og-aec.jpg', logo: 'https://aecups.kz/assets/img/logo.png', parentOrganization: { '@id': 'https://aecups.kz/#org' }, areaServed: { '@type': 'Country', name: 'Казахстан' }, sameAs: [C.twogis, C.instagram, C.youtube].filter(Boolean), hasMap: C.twogis, telephone: '+' + C.phoneRaw, email: C.email, address: { '@type': 'PostalAddress', streetAddress: 'ул. Чаплина 71/66, БЦ «Станица», офис А01', addressLocality: 'Алматы', postalCode: '050000', addressCountry: 'KZ' }, geo: { '@type': 'GeoCoordinates', latitude: 43.285354, longitude: 76.982936 }, openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' } },
    { '@type': 'WebSite', '@id': 'https://aecups.kz/#site', url: 'https://aecups.kz/', name: 'AEC Kazakhstan', inLanguage: 'ru', publisher: { '@id': 'https://aecups.kz/#org' }, potentialAction: { '@type': 'SearchAction', target: 'https://aecups.kz/?s={search_term_string}', 'query-input': 'required name=search_term_string' } }
  ] });

  /* ======================= Анимации ======================= */
  const root = document.documentElement;
  const ready = () => root.classList.add('ready');
  setTimeout(ready, 3000);
  if (!window.gsap || !window.ScrollTrigger) { ready(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const hdr = () => ($('#hdr') || { offsetHeight: 76 }).offsetHeight;

  function start() {
    // Плавная прокрутка
    let lenis = null;
    const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!reduce && window.Lenis && !touch) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      const mm = $('#mmenu');
      if (mm) new MutationObserver(() => mm.classList.contains('open') ? lenis.stop() : lenis.start()).observe(mm, { attributes: true, attributeFilter: ['class'] });
      const md = $('#modal');
      if (md) new MutationObserver(() => { const o = md.classList.contains('open'); o ? lenis.stop() : lenis.start(); document.documentElement.style.overflow = o ? 'hidden' : ''; }).observe(md, { attributes: true, attributeFilter: ['class'] });
    }
    const scrollTo = y => lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo2(y);
    const scrollTo2 = y => window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });

    // Полоса прогресса
    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    /* ---------- Камера сцены: приближение вокруг защищённых объектов ---------- */
    const camIntro = { s: 1 }, camStory = { s: 1 }, camShake = { x: 0, y: 0 };
    const renderCam = () => { const c1 = $('#stage .cam'), c2 = $('#stage .cam2'); if (c1) c1.style.transform = camIntro.s === 1 ? '' : `scale(${camIntro.s.toFixed(4)})`; if (c2) c2.style.transform = (camStory.s === 1 && !camShake.x && !camShake.y) ? '' : `translate3d(${camShake.x.toFixed(1)}px, ${camShake.y.toFixed(1)}px, 0) scale(${camStory.s.toFixed(4)})`; };

    /* ---------- Пауза анимаций сцены, когда первый экран не виден ---------- */
    const heroEl = $('#hero');
    const stageWrap = $('#hero .stage-wrap');
    const pauseScene = on => { heroEl.classList.toggle('paused', on); stageWrap.style.display = on ? 'none' : ''; };
    let tlHeld = false;
    ScrollTrigger.create({ start: 0, endTrigger: '.clients-band', end: 'top top', refreshPriority: -1, onLeave: () => { pauseScene(true); if (tl.isActive()) { tl.pause(); tlHeld = true; } }, onEnterBack: () => { pauseScene(false); if (tlHeld) { tlHeld = false; tl.resume(); } } });

    /* ---------- Вход первого экрана ---------- */
    const introSplit = new SplitText('#heroTitle', { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    const intro = gsap.timeline({ paused: true, onStart: ready });
    intro.from(introSplit.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .09 })
      .from('#heroText', { y: 24, autoAlpha: 0, duration: .9, ease: 'power3.out' }, .35)
      .from('#intro .links .btn', { y: 20, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .08 }, .5)
      .fromTo(camIntro, { s: 1.16 }, { s: 1, duration: 2.6, ease: 'expo.out', onUpdate: renderCam }, 0);

    if (reduce) { intro.progress(1); ready(); } else intro.play();

    /* ---------- Сценарий аварии: проигрывается по кнопке, страница прокручивается обычно ---------- */
    const capsEl = $$('#caps .cap'), steps = $$('#stepsUi li'), cue = $('#cue');
    const at = [1.3, 6.3, 11.3, 16.3, 21.3, 26.3]; // 5 этапов по 5 секунд
    const tl = gsap.timeline({
      paused: true, defaults: { ease: 'none' },
      onUpdate: () => {
        const t = tl.time();
        steps.forEach((li, i) => { const k = Math.round(gsap.utils.clamp(0, 1, (t - at[i]) / (at[i + 1] - at[i])) * 1000) / 1000; if (li._k !== k) { li._k = k; li.firstChild.style.transform = `scaleX(${k})`; } const on = t >= at[i] && t < at[i + 1] + (i === 4 ? 1 : 0); if (li._on !== on) { li._on = on; li.classList.toggle('on', on); } });
      },
      onComplete: () => heroEl.classList.add('played'),
      onReverseComplete: () => { tl.pause(0); tl.timeScale(1); heroEl.classList.remove('playing', 'played'); } // в GSAP 3 обратный ход = отрицательный timeScale, поэтому сначала пауза
    });
    const A = o => Object.assign({ onUpdate: applyScene }, o);
    tl.to('#intro', { y: -70, autoAlpha: 0, duration: 1, ease: 'power2.in' }, 0)
      .to(S, A({ n: 1, duration: 1.6 }), .2)
      .fromTo(S, { sun: 0 }, A({ sun: 360, duration: 1.6, ease: 'power1.in', immediateRender: false }), 0)
      .fromTo(S, { moon: 420 }, A({ moon: 0, duration: 2.2, ease: 'power2.out', immediateRender: false }), .6)
      .to(S, A({ city: 1.25, duration: 1.6 }), .7)
      .to(S, A({ keep: 1, duration: .8 }), .9)
      .fromTo('#stepsUi', { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, 1)
      .fromTo('#scCtl', { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, 1)
      .fromTo('#hud', { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, 1);
    capsEl.forEach((c, i) => {
      tl.fromTo(c, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power3.out' }, at[i] + .1);
      if (i < 4) tl.to(c, { autoAlpha: 0, y: -40, duration: .5, ease: 'power2.in' }, at[i + 1] - .55);
    });
    const flick = (k, t, v, d) => tl.to(S, A({ [k]: v, duration: .05 }), t).to(S, A({ [k]: 0, duration: d || .3 }), t + .06);
    // 1. Норма: ночной город, ток бежит по проводам; к концу этапа с гор приходит гроза, вдали зарницы
    tl.to(S, A({ storm: .55, duration: 2.6, ease: 'power1.inOut' }), 3.0)
      .to(S, A({ storm: 1, duration: 1.6, ease: 'power1.inOut' }), 5.4)
      .to(S, A({ rain: .55, duration: 1.4 }), 5.0);
    flick('sh1', 4.2, .75); flick('sh2', 5.6, 1, .35);
    // 2. Авария: молния в подстанцию, искры и дым, район гаснет квартал за кварталом; ИБП принимает нагрузку за 0 мс
    tl.to(S, A({ rain: 1, duration: .8 }), 6.4)
      .to(S, A({ bolt: 1, duration: .03 }), 6.9).to(S, A({ bolt: 0, duration: .22, ease: 'power2.in' }), 6.96)
      .to(S, A({ flash: 1, duration: .04 }), 6.9).to(S, A({ flash: 0, duration: .16 }), 6.94)
      .to(S, A({ flash: .5, duration: .03 }), 7.1).to(S, A({ flash: 0, duration: .1 }), 7.13)
      .fromTo(camShake, { x: 0, y: 0 }, { x: -7, y: 5, duration: .04, onUpdate: renderCam, immediateRender: false }, 6.91).to(camShake, { x: 6, y: -4, duration: .05, onUpdate: renderCam }, 6.95).to(camShake, { x: -3, y: 2, duration: .05, onUpdate: renderCam }, 7.0).to(camShake, { x: 0, y: 0, duration: .08, onUpdate: renderCam }, 7.05)
      .to(S, A({ city: .3, duration: .05 }), 6.92).to(S, A({ city: 1.1, duration: .06 }), 6.97).to(S, A({ city: .2, duration: .05 }), 7.03).to(S, A({ city: .95, duration: .06 }), 7.08)
      .to(S, A({ vg: 212, duration: .04 }), 6.92).to(S, A({ vg: 388, duration: .05 }), 6.96).to(S, A({ vg: 0, duration: .1 }), 7.08)
      .to(S, A({ grid: 0, duration: .25 }), 7.01)
      .to(S, A({ src: 1, duration: .01 }), 7.06)
      .to(S, A({ glow: .45, duration: .6 }), 7.2)
      .to(S, A({ city: 0, duration: 2.6, ease: 'power1.in' }), 7.3)
      .to(S, A({ smoke: 1, duration: .8 }), 7.1)
      .to(S, A({ bat: 97, duration: 4.2 }), 7.06);
    flick('arc', 7.06, 1, .25); flick('arc', 8.1, 1, .2); flick('arc', 9.3, .8, .15); flick('sh1', 9.9, .6); flick('sh2', 10.7, .45);
    // 3. ИБП: камера к защищённым объектам, подписи, батареи разряжаются
    tl.to(camStory, { s: () => innerWidth < 600 ? 1 : 1.1, duration: 2.6, ease: 'power1.inOut', onUpdate: renderCam }, 11.4)
      .to(S, A({ glow: 1, duration: .6 }), 11.8)
      .to(S, A({ lbl: 1, duration: .5 }), 12.3)
      .to(S, A({ bat: 91, duration: 5 }), 11.3);
    flick('sh2', 13.4, .7); flick('flash', 14.6, .22, .2); flick('sh1', 15.5, .5);
    // 4. Генератор: АВР запускает ДГУ, частота выходит на 50 Гц, нагрузка переходит на генератор, батареи заряжаются
    tl.to(S, A({ gst: 1, duration: .01 }), 16.7)
      .to(S, A({ gen: 1, duration: .5 }), 16.7)
      .to(S, A({ hz: 50, duration: 1.6, ease: 'power2.out' }), 16.8)
      .to(S, A({ gst: 2, duration: .01 }), 18.4)
      .to(S, A({ src: 2, duration: .01 }), 18.4)
      .to(S, A({ flow: 1, duration: .5 }), 18.4)
      .to(S, A({ bat: 100, duration: 2.6, ease: 'power1.out' }), 18.6)
      .to(S, A({ smoke: 0, duration: 2.4 }), 18.0)
      .to(S, A({ rain: .4, duration: 2 }), 19.4)
      .to(S, A({ storm: .65, duration: 2.2, ease: 'power1.inOut' }), 19.6);
    // 5. Сеть: напряжение возвращается, кварталы включаются по очереди, нагрузка уходит с генератора, гроза уходит
    tl.to(S, A({ vg: 400, duration: .4 }), 21.6)
      .to(S, A({ grid: 1, duration: .4 }), 21.6)
      .to(S, A({ city: 1.25, duration: 2.6, ease: 'power1.inOut' }), 21.8)
      .to(S, A({ src: 0, duration: .01 }), 22.2)
      .to(S, A({ flow: 0, duration: .5 }), 22.2)
      .to(S, A({ gst: 3, duration: .01 }), 22.2)
      .to(S, A({ hz: 0, duration: 2.2, ease: 'power1.in' }), 23.2)
      .to(S, A({ gen: 0, duration: .6 }), 24.6)
      .to(S, A({ gst: 0, duration: .01 }), 25.2)
      .to(S, A({ rain: 0, duration: 1.2 }), 21.4)
      .to(S, A({ storm: 0, duration: 3, ease: 'power1.inOut' }), 21.6)
      .to(camStory, { s: 1, duration: 2, ease: 'power1.inOut', onUpdate: renderCam }, 23.4)
      .to(S, A({ glow: .25, lbl: 0, duration: .8 }), 24.0)
      .to({}, { duration: .4 }, 26.3);
    // после refresh GSAP возвращает значения S без onUpdate: переносим их в сцену вручную
    ScrollTrigger.addEventListener('refresh', () => { layoutStage(); applyScene(); renderCam(); });
    applyScene(); renderCam();
    const play = () => { intro.progress(1); heroEl.classList.add('playing'); heroEl.classList.remove('played'); tl.timeScale(1).play(0); };
    const close = () => { tl.timeScale(10).reverse(); };
    cue.addEventListener('click', play);
    $('#scReplay').addEventListener('click', play);
    $('#scClose').addEventListener('click', close);
    if (reduce) { gsap.set('#caps, #stepsUi, #hud, #scCtl', { display: 'none' }); cue.style.display = 'none'; }
    window.__aec = Object.assign(window.__aec || {}, { tl, play, close, S, lenis });

    /* ---------- Заголовки секций: строки выезжают из-под маски ---------- */
    $$('.js-lines').forEach(h => {
      if (reduce) return;
      SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: h, start: 'top 88%', once: true } }) });
    });
    if (!reduce) ScrollTrigger.batch('.js-up', { start: 'top 90%', once: true, onEnter: els => gsap.from(els, { y: 36, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .1, overwrite: true }) });

    /* ---------- Как мы работаем: слова, линия этапов ---------- */
    const mf = $('#manifest');
    if (!reduce) SplitText.create(mf, { type: 'words', wordsClass: 'w', autoSplit: true, onSplit: self => gsap.to(self.words, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: mf, start: 'top 82%', end: 'bottom 50%', scrub: true } }) });
    const stepsLi = $$('#mfSteps li'), rail = $('#mfSteps .mf-rail i');
    const vertical = () => innerWidth <= 860;
    ScrollTrigger.create({ trigger: '#mfSteps', start: 'top 85%', end: 'bottom 55%', scrub: reduce ? false : .4,
      onUpdate: self => { const p = reduce ? 1 : self.progress; rail.style.transform = vertical() ? `scaleY(${p})` : `scaleX(${p})`; stepsLi.forEach((li, i) => li.classList.toggle('on', p >= i / stepsLi.length + .02 || p >= .999)); },
      onRefresh: self => { if (reduce) { rail.style.transform = 'none'; stepsLi.forEach(li => li.classList.add('on')); } } });

    /* ---------- Оборудование ---------- */
    if (!reduce) ScrollTrigger.batch('.eq', { start: 'top 92%', once: true, onEnter: els => gsap.from(els, { y: 50, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .07, overwrite: true }) });

    /* ---------- Бегущие слова ---------- */
    if (!reduce) {
      gsap.fromTo('#row1', { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: .5 } });
      gsap.fromTo('#row2', { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: .5 } });
    }

    /* ---------- Проекты: горизонтальная лента ----------
       Закрепление со сдвигом от вертикальной прокрутки — только на компьютере с мышью или тачпадом (hover + точный указатель)
       и без «уменьшения движения». На сенсорных экранах любой ширины и во всех остальных случаях лента листается сама:
       свайпом, жестом тачпада, Shift+колесом и стрелками. Так блок не «застревает» ни на одном устройстве. */
    const pjSec = $('#projects'), pjTrack = $('#pjTrack');
    let pjMove = null;
    const pjStep = () => { const c = $('#pjTrack .hp-pj-card'); return c ? c.offsetWidth + (parseFloat(getComputedStyle(pjTrack).columnGap) || 24) : 420; };
    const pageY = () => (lenis ? lenis.targetScroll : scrollY);
    const goY = y => { if (lenis) lenis.scrollTo(y, { duration: .9 }); else scrollTo({ top: y, behavior: 'smooth' }); };
    const pjNav = () => {
      const prev = $('[data-pj="-1"]'), next = $('[data-pj="1"]'); if (!prev) return;
      let a, b;
      if (pjMove) { const st = pjMove.scrollTrigger; a = pageY() <= st.start + 4; b = pageY() >= st.end - 4; }
      else { a = pjTrack.scrollLeft <= 4; b = pjTrack.scrollLeft + pjTrack.clientWidth >= pjTrack.scrollWidth - 4; }
      prev.disabled = a; next.disabled = b;
    };
    $$('[data-pj]').forEach(btn => btn.addEventListener('click', () => {
      const dir = +btn.dataset.pj;
      if (pjMove) { const st = pjMove.scrollTrigger, cur = Math.min(st.end, Math.max(st.start, pageY())); goY(Math.min(st.end, Math.max(st.start, cur + dir * pjStep()))); }
      else pjTrack.scrollBy({ left: dir * pjStep(), behavior: 'smooth' });
    }));
    pjTrack.addEventListener('scroll', pjNav, { passive: true });
    gsap.matchMedia().add('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      pjSec.classList.add('pj-on'); pjTrack.scrollLeft = 0;
      const dist = () => Math.max(0, pjTrack.scrollWidth - innerWidth);
      const move = gsap.to(pjTrack, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#pjPin', start: () => 'top ' + hdr(), end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: pjNav, onRefresh: pjNav } });
      pjMove = move;
      $$('#pjTrack .hp-pj-card .im img').forEach(el => gsap.fromTo(el, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: el.closest('.hp-pj-card'), containerAnimation: move, start: 'left right', end: 'right left', scrub: true } }));
      // горизонтальный жест тачпада или Shift+колесо внутри закреплённого блока двигают ленту так же, как вертикальная прокрутка
      const onWheel = e => {
        const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0); if (!dx) return;
        const st = move.scrollTrigger, y = pageY(); if (y < st.start - 2 || y > st.end + 2) return;
        const to = Math.min(st.end, Math.max(st.start, y + dx)); if (to === y) return;
        e.preventDefault(); if (lenis) lenis.scrollTo(to, { immediate: false }); else scrollTo(0, to);
      };
      const pin = $('#pjPin'); pin.addEventListener('wheel', onWheel, { passive: false });
      pjNav();
      return () => { pjSec.classList.remove('pj-on'); pjMove = null; pin.removeEventListener('wheel', onWheel); pjNav(); };
    });
    pjNav();

    /* ---------- Счётчики ---------- */
    $$('#nums .cnt').forEach(el => {
      const to = parseInt(el.dataset.to, 10); if (!to || reduce) return;
      const o = { v: 0 }; el.textContent = '0';
      gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    if (!reduce) ScrollTrigger.batch('#brands a', { start: 'top 95%', once: true, onEnter: els => gsap.from(els, { autoAlpha: 0, y: 20, duration: .6, stagger: .03, ease: 'power2.out' }) });

    /* ---------- Параллакс фото сервиса ---------- */
    if (!reduce) { const sp = $('#svcPh img'); if (sp) gsap.fromTo(sp, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#svcPh', start: 'top bottom', end: 'bottom top', scrub: true } }); }

    /* ---------- Параллакс сцены от мыши ---------- */
    if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const lay = [['#stage .g-far', 8, 4], ['#stage .g-mid', 18, 7], ['#stage .g-near', 30, 10], ['#stage .clouds', 12, 5]].map(([sel, ax, ay]) => ({ x: gsap.quickTo(sel, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(sel, 'y', { duration: 1.2, ease: 'power3.out' }), ax, ay }));
      gsap.set('#stage .cam3', { transformPerspective: 1800, transformOrigin: '60% 70%', scale: 1.035 });
      const ry = gsap.quickTo('#stage .cam3', 'rotationY', { duration: 1.6, ease: 'power3.out' }), rx = gsap.quickTo('#stage .cam3', 'rotationX', { duration: 1.6, ease: 'power3.out' });
      $('#hero').addEventListener('mousemove', e => { const mx = e.clientX / innerWidth - .5, my = e.clientY / innerHeight - .5; lay.forEach(l => { l.x(-mx * l.ax); l.y(-my * l.ay); }); ry(mx * 2.4); rx(-my * 1.6); });
    }

    /* ---------- Магнитные кнопки (только мышь) ---------- */
    if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.magnetic').forEach(b => {
        const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3.out' }), yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3.out' });
        b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .28); yTo((e.clientY - r.top - r.height / 2) * .4); });
        b.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
      });
    }

    addEventListener('load', () => ScrollTrigger.refresh());
  }

  const go = () => (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(start).catch(e => { console.error(e); ready(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
