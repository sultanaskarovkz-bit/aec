/* Главная AEC Kazakhstan: данные, сцена первого экрана, сценарий аварии на прокрутке, загрузочный экран, эффекты.
   Библиотеки: GSAP 3.13 (ScrollTrigger, SplitText), Lenis 1.3 — локально в assets/vendor. */
(function () {
  'use strict';
  const D = AEC, U = AECUI, I = U.icon, L = U.L, C = D.CONTACT, img = U.img;
  U.init({ active: 'home' });
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pimg = (slot, alt) => img(slot, alt, '', 'data-ph="bg"');
  ['#mmenu', '.modal-box', '.drawer', '.mega'].forEach(s => $$(s).forEach(el => el.setAttribute('data-lenis-prevent', '')));

  /* ======================= Сцена ======================= */
  const NS = 'http://www.w3.org/2000/svg';
  let seed = 11; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const yAt = (pts, x) => { for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const ridgePath = pts => 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + ' L1600 900 L0 900 Z';
  const caps = (pts, maxY, cls) => {
    let out = '';
    for (let i = 1; i < pts.length - 1; i++) {
      const P = pts[i], Lp = pts[i - 1], R = pts[i + 1];
      if (P[1] >= Lp[1] || P[1] >= R[1] || P[1] > maxY) continue;
      const a = lerp(P, Lp, .34), b = lerp(P, R, .3), m1 = lerp(a, b, .3), m2 = lerp(a, b, .62);
      out += `<path class="${cls}" d="M${P[0]} ${P[1]} L${b[0].toFixed(1)} ${b[1].toFixed(1)} L${m2[0].toFixed(1)} ${(m2[1] + 5).toFixed(1)} L${(m2[0] - 8).toFixed(1)} ${(m2[1] - 6).toFixed(1)} L${m1[0].toFixed(1)} ${(m1[1] + 14).toFixed(1)} L${a[0].toFixed(1)} ${a[1].toFixed(1)} Z"/>`;
    }
    return out;
  };
  const far = [[0, 730], [120, 705], [230, 712], [340, 668], [450, 684], [540, 620], [630, 646], [720, 580], [810, 606], [900, 520], [980, 556], [1070, 470], [1150, 512], [1230, 440], [1310, 478], [1390, 418], [1470, 458], [1540, 432], [1600, 452]];
  const mid = [[0, 812], [160, 790], [300, 806], [440, 760], [560, 778], [680, 726], [800, 752], [920, 700], [1040, 640], [1150, 690], [1250, 650], [1360, 702], [1480, 668], [1600, 708]];
  const blade = (len, w) => `<path d="M${-w} 0 Q${-w * .6} ${-len * .55} 0 ${-len} Q${w * .9} ${-len * .5} ${w} 0 Z"/>`;
  const turbine = (x, y, s, dur, cls) => {
    const h = 170 * s, len = 74 * s, w = 4.2 * s;
    return `<g class="${cls || ''}" transform="translate(${x} ${y.toFixed(1)})"><path class="turb-t" d="M${-3.6 * s} 0 L${-1.6 * s} ${-h} L${1.6 * s} ${-h} L${3.6 * s} 0 Z"/><rect class="turb-t" x="${-5 * s}" y="${-h - 4 * s}" width="${12 * s}" height="${7 * s}"/>`
      + `<g class="turb-b" transform="translate(0 ${-h})">${blade(len, w)}${blade(len, w).replace('<path', `<path transform="rotate(120)"`)}${blade(len, w).replace('<path', `<path transform="rotate(240)"`)}<circle class="turb-t" r="${3.4 * s}"/>`
      + `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="${dur}s" repeatCount="indefinite" additive="sum"/></g></g>`;
  };
  const pylon = (x, base, s) => { const h = 132 * s; return `<g class="pyl" transform="translate(${x} ${base})"><path d="M${-20 * s} 0 L${-6 * s} ${-h} L${6 * s} ${-h} L${20 * s} 0 M${-16 * s} ${-h * .3} L${16 * s} ${-h * .3} M${-12 * s} ${-h * .6} L${12 * s} ${-h * .6} M${-16 * s} ${-h * .3} L${12 * s} ${-h * .6} M${16 * s} ${-h * .3} L${-12 * s} ${-h * .6} M${-34 * s} ${-h * .82} L${34 * s} ${-h * .82} M${-9 * s} ${-h * .6} L${-34 * s} ${-h * .82} M${9 * s} ${-h * .6} L${34 * s} ${-h * .82}"/></g>`; };
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><rect class="cloud" x="0" y="18" width="190" height="34" rx="17"/><circle class="cloud" cx="62" cy="22" r="28"/><circle class="cloud" cx="108" cy="16" r="36"/><circle class="cloud" cx="148" cy="28" r="22"/></g>`;
  function windows(x, y, w, h, cls, dFn) {
    let s = ''; const cols = Math.max(1, Math.floor((w - 8) / 11)), rows = Math.max(1, Math.floor((h - 10) / 15));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (rnd() < .22) continue;
      const wx = x + 6 + c * 11, wy = y + 8 + r * 15;
      s += `<rect class="win" x="${wx}" y="${wy}" width="5" height="7"/>`;
      if (cls === 'win-l') s += `<rect class="win-l" style="--d:${dFn(wx).toFixed(3)}" x="${wx}" y="${wy}" width="5" height="7"/>`;
      else s += `<rect class="win-k" x="${wx}" y="${wy}" width="5" height="7"/>`;
    }
    return s;
  }
  function buildScene() {
    const base = 852;
    const dCity = x => Math.min(1, Math.max(0, (x - 860) / 760)) * .2 + rnd() * .05;
    let stars = '';
    for (let i = 0; i < 90; i++) { const x = rnd() * 1600, y = 20 + rnd() * 400, r = .6 + rnd() * 1.4; stars += `<circle class="star${rnd() < .35 ? ' twinkle' : ''}" style="opacity:${(.4 + rnd() * .6).toFixed(2)};animation-delay:${(-rnd() * 3.4).toFixed(2)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}"/>`; }
    const gusts = [[180, 0], [250, -1.4], [320, -2.8], [380, -4.1], [215, -3.3], [440, -5.2]].map(([y, d], i) => `<path class="gust" style="animation-delay:${d}s;animation-duration:${5 + i * .7}s" d="M760 ${y} C 980 ${y - 30}, 1140 ${y + 26}, 1300 ${y - 6} S 1560 ${y - 30}, 1760 ${y}"/>`).join('');
    let flakes = '';
    [[1040, 640], [1250, 650], [1480, 668], [1070, 470], [1230, 440], [1390, 418]].forEach(([x, y]) => { for (let k = 0; k < 4; k++) flakes += `<circle class="flake" style="animation-delay:${(-rnd() * 3.6).toFixed(2)}s" cx="${x + 4 + k * 3}" cy="${y + 8 + k * 4}" r="${(1.2 + rnd()).toFixed(1)}"/>`; });
    // задний ряд города
    let back = '', x = 860;
    while (x < 1600) { const w = 24 + rnd() * 34, h = 36 + rnd() * 92; back += `<rect class="bld-b" x="${x.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 10).toFixed(0)}"/>` + windows(x, base - h, w, h - 8, 'win-l', dCity); x += w + 2 + rnd() * 6; }
    // передний ряд между защищёнными зданиями
    let front = '';
    [[880, 1080], [1186, 1226], [1344, 1376], [1544, 1600]].forEach(([a, b]) => { let x2 = a; while (x2 < b - 14) { const w = Math.min(b - x2, 22 + rnd() * 30), h = 24 + rnd() * 50; front += `<rect class="bld-f" x="${x2.toFixed(0)}" y="${(base - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 10).toFixed(0)}"/>` + windows(x2, base - h, w, h - 6, 'win-l', dCity); x2 += w + 3; } });
    // защищённые объекты: клиника, ЦОД, производство и дизель-генератор
    const hosp = `<rect class="bld-k" x="1090" y="742" width="90" height="120"/><rect class="bld-k" x="1116" y="728" width="38" height="16"/><rect class="cross" x="1129" y="731" width="12" height="10"/><rect class="cross" x="1131" y="729" width="8" height="14"/>` + windows(1090, 752, 90, 96, 'k');
    let dcRows = ''; for (let r = 0; r < 4; r++) dcRows += `<rect class="win-k" x="1240" y="${786 + r * 15}" width="90" height="4"/><rect class="win" x="1240" y="${792 + r * 15}" width="90" height="2"/>`;
    const dc = `<rect class="bld-k" x="1230" y="772" width="110" height="90"/>` + dcRows;
    const fac = `<path class="bld-k" d="M1380 862 V804 L1405 790 V804 L1430 790 V804 L1455 790 V804 L1480 790 V862 Z"/><rect class="bld-k" x="1456" y="742" width="13" height="56"/>` + windows(1382, 812, 96, 40, 'k');
    const gen = `<rect class="gen-box" x="1488" y="824" width="52" height="30"/><rect class="gen-box" x="1528" y="812" width="5" height="14"/><circle class="gen-led" cx="1498" cy="834" r="3.4"/>` + [0, .6, 1.2].map(d => `<circle class="puff" style="animation-delay:${d}s" cx="1530" cy="810" r="5"/>`).join('');
    const pylX = [140, 380, 620, 860], pylS = [.92, .96, 1, 1.02];
    const tops = pylX.map((px, i) => [px, base - 132 * pylS[i] * .82]);
    const W = [];
    for (let i = 0; i < tops.length; i++) { const a = tops[i], b = i < tops.length - 1 ? tops[i + 1] : [990, 772]; [-32, 32].forEach((dx, k) => { const ax = a[0] + dx * pylS[i], bx = b[0] + (i < tops.length - 1 ? dx * pylS[i + 1] : 0); W.push(`M${ax.toFixed(1)} ${a[1].toFixed(1)} Q${((ax + bx) / 2).toFixed(1)} ${(Math.max(a[1], b[1]) + 30).toFixed(1)} ${bx.toFixed(1)} ${b[1].toFixed(1)}`); }); }
    W.unshift(`M-20 ${tops[0][1] - 6} Q60 ${tops[0][1] + 24} ${(tops[0][0] - 32 * pylS[0]).toFixed(1)} ${tops[0][1].toFixed(1)}`);
    const sparks = W.map((d, i) => i % 2 ? '' : `<circle class="spark" r="3.2"><animateMotion dur="${(2.4 + (i % 4) * .35).toFixed(2)}s" begin="${(-i * .37).toFixed(2)}s" repeatCount="indefinite" path="${d}"/></circle>`).join('');
    const ground = `<path class="ground" d="M0 868 C 300 854, 600 864, 900 852 S 1400 850, 1600 846 L1600 900 L0 900 Z"/>`;
    const tag = (x, y, t1, t2, w) => `<g class="tag"><rect x="${x}" y="${y}" width="${w}" height="52"/><text x="${x + 12}" y="${y + 22}">${t1}</text><text class="t2" x="${x + 12}" y="${y + 42}">${t2}</text></g>`;
    const glow = [[1135, 800], [1285, 815], [1440, 825]].map(([gx, gy]) => `<circle class="glow" cx="${gx}" cy="${gy}" r="90"/>`).join('');
    const rings = '<g class="rings">' + [[1135, 728], [1285, 772], [1462, 742]].map(([rx, ry]) => `<circle class="ring" cx="${rx}" cy="${ry}" r="9"/>`).join('') + '</g>';
    const svg = $('#scene');
    svg.innerHTML = `<defs><radialGradient id="glowG"><stop offset="0" stop-color="#ffb000" stop-opacity=".85"/><stop offset=".45" stop-color="#ffb000" stop-opacity=".28"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
      <g class="cam">
        <g class="sky"><g class="stars">${stars}</g><circle class="moon" cx="1470" cy="140" r="24"/><circle style="fill:color-mix(in srgb, var(--ink0) calc(var(--n) * 100%), #fff);opacity:var(--n)" cx="1481" cy="132" r="21"/>
          <g class="clouds"><g class="drift">${cloud(0, 120, 1)}</g><g class="drift d2">${cloud(0, 230, .7)}</g><g class="drift d3">${cloud(0, 70, .55)}</g></g>${gusts}</g>
        <path class="far" d="${ridgePath(far)}"/>${caps(far, 560, 'cap-far')}
        ${turbine(1310, yAt(far, 1310), .42, 4.6)}${turbine(1450, yAt(far, 1450), .38, 5.2)}${turbine(1150, yAt(far, 1150), .36, 4.1)}
        <path class="mid" d="${ridgePath(mid)}"/>${caps(mid, 700, 'cap-mid')}
        ${turbine(1040, yAt(mid, 1040), .9, 3.6)}${turbine(1250, yAt(mid, 1250), .78, 4.2)}${turbine(1480, yAt(mid, 1480), .72, 3.9)}
        ${flakes}
        ${back}
        ${W.map(d => `<path class="wire" d="${d}"/>`).join('')}${sparks}${pylX.map((px, i) => pylon(px, base + 6, pylS[i])).join('')}
        ${glow}${front}${hosp}${dc}${fac}${gen}
        ${ground}
        <path class="gflow" d="M1488 870 H1090"/>
        ${rings}
        ${tag(1084, 660, 'Клиника', 'ИБП 80 кВА, N+1', 140)}${tag(1228, 708, 'ЦОД', 'ИБП 300 кВА, N+1', 146)}${tag(1384, 660, 'Производство', 'ДГУ 1 МВА + АВР', 140)}
      </g>`;
  }
  buildScene();
  const setAspect = () => { const sv = $('#scene'), w = innerWidth; sv.setAttribute('viewBox', w < 600 ? '1050 0 550 900' : w < 1024 ? '800 0 800 900' : '120 60 1480 840'); sv.setAttribute('preserveAspectRatio', 'xMidYMax slice'); };
  setAspect(); addEventListener('resize', setAspect);

  /* ======================= Данные секций ======================= */
  const logos = D.CLIENT_LOGOS.map(c => `<div title="${c[1]}">${img(c[0], c[1])}</div>`).join('');
  $('#clientLogos').innerHTML = logos + logos;

  $('#eqGrid').innerHTML = D.CATEGORIES.map(c => {
    const ph = D.CAT_PHOTOS[c.id];
    return `<a class="eq" href="${L.cat(c.id)}"><span class="go">${I('chev')}</span><div class="im">${ph ? img(ph, c.full || c.name) : I(c.img)}</div><h3>${c.id === 'sts' ? 'Переключатели STS' : c.name}</h3><div class="rng">${c.range}${c.count ? ', ' + c.count + ' моделей' : ', под проект'}</div></a>`;
  }).join('') + `<a class="eq cta" href="${L.kp}"><span class="go">${I('chev')}</span><div class="big">Не нашли нужное? Подберём оборудование под проект</div><p>Отправьте техническое задание или опишите нагрузку: инженер рассчитает мощность и автономию и подготовит КП в течение рабочего дня.</p></a>`;

  const COVER = { ktz: 'proj-ktz-2.jpg', lab: 'proj-lab-2.jpg' };
  $('#pjTrack').insertAdjacentHTML('beforeend', D.PROJECTS.map(p => `<a class="hp-pj-card" href="${L.project(p.id)}"><div class="im">${pimg(COVER[p.id] || p.photos[0], p.title)}<span class="kva">${p.kva}</span></div><div class="meta">${p.client}, ${p.city}, ${p.year}</div><h3>${p.title}</h3><div class="eq2">${p.equipment[0]}</div></a>`).join('')
    + `<div class="hp-pj-end"><b>Ваш объект может быть следующим</b><a class="btn btn-kp btn-lg" href="kp.html">Обсудить проект</a><a class="ulink" href="projects.html">Все проекты</a></div>`);
  $$('#pjTrack img').forEach(i => i.setAttribute('loading', 'eager'));

  const IPH = { czod: 'proj-airastana-1.jpg', med: 'proj-uralsk-1.jpg', prom: 'proj-ktz-2.jpg', oil: 'prod-tescom-genset-1.jpg', office: 'proj-airastana-3.jpg', machines: 'proj-ktz-4.jpg', emergency: 'proj-lab-2.jpg', telecom: 'proj-tv-1.jpg' };
  const list = $('#indList'), im = $('#indMedia');
  list.innerHTML = D.INDUSTRIES.map((x, i) => `<li class="${i === 0 ? 'on' : ''}" data-i="${i}"><a href="${L.solution(x.id)}">${x.name}<small>${x.kva}</small></a></li>`).join('');
  im.innerHTML = `<div class="frame">${D.INDUSTRIES.map((x, i) => img(IPH[x.id], x.h1, i === 0 ? 'on' : '', 'data-ph="bg"')).join('')}</div><div class="cap2" id="indCap"></div>`;
  let curInd = -1;
  function pick(i) { if (i === curInd) return; curInd = i; list.querySelectorAll('li').forEach((li, k) => li.classList.toggle('on', k === i)); im.querySelectorAll('.frame img').forEach((el, k) => el.classList.toggle('on', k === i)); const x = D.INDUSTRIES[i]; $('#indCap').innerHTML = `<div><b>${x.h1}</b>${x.text}</div><a class="ulink" href="${L.solution(x.id)}">Подробнее</a>`; }
  pick(0);
  list.addEventListener('mouseover', e => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });
  list.addEventListener('focusin', e => { const li = e.target.closest('li'); if (li) pick(+li.dataset.i); });

  const NUM = [['2021', '', 'год основания', 0], [String(D.BRANDS.length), '', 'брендов в портфеле', 1], [String(D.PRODUCTS.length), '', 'позиций в каталоге', 1], ['4,25', 'МВА', 'максимальная мощность электростанции', 0]];
  $('#nums').innerHTML = NUM.map(n => `<div class="js-up"><b><span class="cnt" data-to="${n[3] ? n[0] : ''}">${n[0]}</span>${n[1] ? `<i>${n[1]}</i>` : ''}</b><span>${n[2]}</span></div>`).join('');
  $('#brands').innerHTML = D.BRANDS.slice(0, 16).map(b => `<a href="${L.brand(b.id)}">${b.name}</a>`).join('');

  $('#svcPh').innerHTML = pimg('proj-airastana-4.jpg', 'Монтаж модульного ИБП инженерами AEC, Алматы') + '<div class="badge2"><b>1 день</b><span>выезд инженера по Алматы</span></div>';
  $('#svcList').innerHTML = D.SERVICES.map(s => `<li><a href="${L.service(s.id)}"><span><b>${s.short}</b><small>${s.text}</small></span>${I('chev')}</a></li>`).join('');

  const a3 = D.ARTICLES[3];
  $('#newsMain').innerHTML = `<div class="im">${pimg('blog-kioge-1.jpg', a3.title)}</div><div class="meta">${a3.cat}, ${U.fmtDate(a3.date)}</div><h3>${a3.title}</h3><p>Стенд AEC Kazakhstan на нефтегазовой выставке: модульные ИБП Tescom, ДГУ в контейнерном исполнении и батареи Hoppecke для объектов добычи.</p>`;
  const ev = D.EXHIBITIONS.slice(0, 2).map(e => ({ d: String(e.year), t: e.name + ', ' + e.city, s: 'Выставка, ' + e.theme, href: 'about.html#exhibitions' }));
  const arts = [0, 1, 2].map(k => ({ d: U.fmtDate(D.ARTICLES[k].date), t: D.ARTICLES[k].title, s: D.ARTICLES[k].cat, href: L.article(k) }));
  $('#newsList').innerHTML = [arts[0], ev[0], arts[1], arts[2], ev[1]].map(n => `<li><a href="${n.href}"><span class="dt">${n.d}</span><span><b>${n.t}</b><small>${n.s}</small></span></a></li>`).join('');

  $('#bigPhone').textContent = C.phone; $('#bigPhone').href = 'tel:+' + C.phoneRaw;
  $('#kv').innerHTML = `<div><dt>E-mail</dt><dd><a href="mailto:${C.email}">${C.email}</a></dd></div><div><dt>Офис и склад</dt><dd>${C.address}</dd></div><div><dt>Часы работы</dt><dd>${C.hours}</dd></div>`;
  $('#ctaWa').href = C.whatsapp;

  U.jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'Organization', '@id': 'https://aecups.kz/#org', name: 'AEC Kazakhstan', legalName: C.legal, url: 'https://aecups.kz/', logo: 'https://aecups.kz/wp-content/uploads/2026/01/group-534814152-1-optimized.png', sameAs: [C.instagram, C.youtube, C.twogis], contactPoint: { '@type': 'ContactPoint', telephone: '+' + C.phoneRaw, contactType: 'sales', areaServed: 'KZ', availableLanguage: ['ru', 'kk'] } },
    { '@type': 'LocalBusiness', '@id': 'https://aecups.kz/#local', name: 'AEC Kazakhstan', telephone: '+' + C.phoneRaw, email: C.email, address: { '@type': 'PostalAddress', streetAddress: 'ул. Чаплина 71/66, БЦ «Станица», офис А01', addressLocality: 'Алматы', postalCode: '050000', addressCountry: 'KZ' }, geo: { '@type': 'GeoCoordinates', latitude: 43.2389, longitude: 76.9456 }, openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' } },
    { '@type': 'WebSite', url: 'https://aecups.kz/', name: 'AEC Kazakhstan', potentialAction: { '@type': 'SearchAction', target: 'https://aecups.kz/?s={search_term_string}', 'query-input': 'required name=search_term_string' } }
  ] });

  /* ======================= Анимации ======================= */
  const root = document.documentElement;
  const ready = () => root.classList.add('ready');
  const endIntro = () => { root.classList.remove('intro'); try { sessionStorage.setItem('aecIntro', '1'); } catch (e) { /* приватный режим */ } };
  setTimeout(ready, 3000);
  if (!window.gsap || !window.ScrollTrigger) { ready(); endIntro(); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  // Тёмная шапка: когда идёт ночная часть сценария или под шапкой тёмная секция
  const darkOn = new Set();
  const syncHeader = () => document.body.classList.toggle('hdr-dark', darkOn.size > 0);
  const hdr = () => ($('#hdr') || { offsetHeight: 76 }).offsetHeight;

  function start() {
    // Плавная прокрутка
    let lenis = null;
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: .11, smoothWheel: true });
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

    $$('[data-dark]').forEach((sec, i) => ScrollTrigger.create({ trigger: sec, start: () => 'top ' + hdr(), end: () => 'bottom ' + hdr(), onToggle: self => { self.isActive ? darkOn.add('s' + i) : darkOn.delete('s' + i); syncHeader(); } }));

    /* ---------- Вход первого экрана ---------- */
    const introSplit = new SplitText('#heroTitle', { type: 'lines', mask: 'lines', linesClass: 'split-line' });
    const intro = gsap.timeline({ paused: true, onStart: ready });
    intro.from(introSplit.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .09 })
      .from('#heroText', { y: 24, autoAlpha: 0, duration: .9, ease: 'power3.out' }, .35)
      .from('#intro .links .btn', { y: 20, autoAlpha: 0, duration: .8, ease: 'power3.out', stagger: .08 }, .5)
      .from('#cue', { autoAlpha: 0, duration: .8 }, .9)
      .from('#scene .cam', { scale: 1.08, duration: 2.4, ease: 'expo.out', svgOrigin: '1300 820' }, 0);

    /* ---------- Загрузочный экран ---------- */
    if (root.classList.contains('intro')) {
      if (lenis) lenis.stop();
      const cnt = { v: 0 };
      const lt = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      gsap.set('.loader-mark .m-line, .loader-mark .m-snow', { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set('.loader-mark .m-turb', { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set('.loader-mark .m-fill', { clipPath: 'inset(100% 0 0 0)' });
      // синусоида: сначала помехи, потом ровная волна, как напряжение после ИБП
      const sine = $('#loaderSine'), W = { a: 26, k: 0, ph: 0, noise: 1 };
      const drawSine = () => { let d = ''; for (let x = 0; x <= 560; x += 6) { const n = W.noise * (Math.sin(x * .37 + W.ph * 3.1) * .6 + Math.sin(x * .11 - W.ph * 2.3) * .4) * 14; d += `${d ? ' L' : 'M'}${x} ${(30 + Math.sin(x / 560 * Math.PI * 6 + W.ph) * W.a * W.k + n * W.k).toFixed(2)}`; } sine.setAttribute('d', d); };
      const tick = () => { W.ph += .12; drawSine(); };
      gsap.ticker.add(tick);
      lt.to('.loader-mark .m-line', { strokeDashoffset: 0, duration: 1.1, stagger: .15 }, 0)
        .to('.loader-mark .m-snow', { strokeDashoffset: 0, duration: .6 }, .6)
        .to('.loader-mark .m-fill', { clipPath: 'inset(0% 0 0 0)', duration: .9, ease: 'expo.inOut' }, .8)
        .to('.loader-mark .m-line, .loader-mark .m-snow', { stroke: '#fff', duration: .3 }, 1.25)
        .to(W, { k: 1, duration: .5, ease: 'power2.out' }, .1)
        .to(W, { noise: 0, duration: .9, ease: 'power2.inOut' }, .8)
        .to('.loader-mark .m-turb', { scaleY: 1, duration: .7, stagger: .1, ease: 'back.out(1.6)' }, .55)
        .from('.loader-name span', { yPercent: 110, duration: .8, ease: 'expo.out' }, .7)
        .to(cnt, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => { $('#loaderCount').textContent = Math.round(cnt.v); } }, 0)
        .to('#loaderBar', { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)
        .fromTo('#loaderVeil', { y: 0, yPercent: 100 }, { yPercent: 0, duration: .75, ease: 'expo.inOut' }, 1.7)
        .set('#loader', { autoAlpha: 0 }, 2.45)
        .to('#loaderVeil', { yPercent: -100, duration: .9, ease: 'expo.inOut' }, 2.5)
        .add(() => { gsap.ticker.remove(tick); endIntro(); if (lenis) lenis.start(); ScrollTrigger.refresh(); intro.play(); }, 2.55);
    } else { endIntro(); if (reduce) { intro.progress(1); ready(); } else intro.play(); }

    /* ---------- Сценарий аварии ---------- */
    const mm = gsap.matchMedia();
    mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, ctx => {
      if (ctx.conditions.reduce) { gsap.set('#cue, #caps, #stepsUi', { display: 'none' }); return; }
      const hero = $('#hero'), capsEl = $$('#caps .cap'), steps = $$('#stepsUi li');
      const at = [1.3, 3.0, 4.6, 6.2, 7.9, 10];
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero, start: () => 'top ' + hdr(), end: () => '+=' + Math.round(innerHeight * (innerWidth < 768 ? 3.4 : 3.8)), pin: true, scrub: .9, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => {
            const t = self.progress * 10;
            if (t > .5) darkOn.add('hero'); else darkOn.delete('hero');
            syncHeader();
            steps.forEach((li, i) => { const k = gsap.utils.clamp(0, 1, (t - at[i]) / (at[i + 1] - at[i])); li.firstChild.style.transform = `scaleX(${k})`; li.classList.toggle('on', t >= at[i] && t < at[i + 1] + (i === 4 ? 1 : 0)); });
            hero.classList.toggle('gen-on', t > 6 && t < 8.6);
          }
        }
      });
      tl.to('#intro', { y: -70, autoAlpha: 0, duration: 1, ease: 'power2.in' }, 0)
        .to('#cue', { autoAlpha: 0, duration: .4 }, 0)
        .to(hero, { '--n': 1, duration: 1.4 }, .2)
        .to(hero, { '--city': 1.25, duration: 1.2 }, .7)
        .to(hero, { '--keep': 1, duration: .8 }, .9)
        .fromTo('#stepsUi', { autoAlpha: 0 }, { autoAlpha: 1, duration: .4 }, 1);
      capsEl.forEach((c, i) => {
        tl.fromTo(c, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, at[i]);
        if (i < 4) tl.to(c, { autoAlpha: 0, y: -40, duration: .5, ease: 'power2.in' }, at[i + 1] - .55);
      });
      tl.to(hero, { '--grid': 0, duration: .35 }, 2.9)
        .to(hero, { '--city': 0, duration: 1.1, ease: 'power1.in' }, 3.0)
        .to('#scene .cam', { scale: () => innerWidth < 600 ? 1 : 1.1, duration: 2.4, ease: 'power1.inOut', svgOrigin: '1300 820' }, 4.0)
        .to(hero, { '--glow': 1, duration: .6 }, 4.5)
        .to(hero, { '--lbl': 1, duration: .5 }, 4.8)
        .to(hero, { '--gen': 1, duration: .5 }, 6.0)
        .to(hero, { '--flow': 1, duration: .5 }, 6.3)
        .to(hero, { '--grid': 1, duration: .4 }, 7.8)
        .to(hero, { '--city': 1.25, duration: 1 }, 7.9)
        .to(hero, { '--flow': 0, '--gen': 0, duration: .5 }, 8.3)
        .to(hero, { '--glow': .25, '--lbl': 0, duration: .6 }, 8.6)
        .to('#scene .cam', { scale: 1, duration: 1.4, ease: 'power1.inOut', svgOrigin: '1300 820' }, 8.4)
        .to({}, { duration: .3 }, 9.7);
      window.__aec = Object.assign(window.__aec || {}, { heroST: tl.scrollTrigger, lenis });
      $('#cue').addEventListener('click', () => { const st = tl.scrollTrigger; scrollTo(st.start + (st.end - st.start) * .2); });
      return () => { darkOn.delete('hero'); syncHeader(); };
    });

    /* ---------- Заголовки секций: строки выезжают из-под маски ---------- */
    $$('.js-lines').forEach(h => {
      if (reduce) return;
      SplitText.create(h, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true, onSplit: self => gsap.from(self.lines, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: h, start: 'top 88%', once: true } }) });
    });
    if (!reduce) ScrollTrigger.batch('.js-up', { start: 'top 90%', once: true, onEnter: els => gsap.from(els, { y: 36, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: .1, overwrite: true }) });

    /* ---------- Манифест: слова проявляются по мере прокрутки ---------- */
    const mf = $('#manifest');
    const strongWords = ['Salicru,', 'Tescom', 'Kehua', '2021'];
    if (!reduce) SplitText.create(mf, { type: 'words', wordsClass: 'w', autoSplit: true, onSplit: self => {
      self.words.forEach(w => { if (strongWords.some(s => w.textContent.startsWith(s))) w.innerHTML = `<strong>${w.textContent}</strong>`; });
      return gsap.to(self.words, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: mf, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    } });

    /* ---------- Оборудование ---------- */
    if (!reduce) ScrollTrigger.batch('.eq', { start: 'top 92%', once: true, onEnter: els => gsap.from(els, { y: 50, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .07, overwrite: true }) });

    /* ---------- Бегущие слова ---------- */
    if (!reduce) {
      gsap.fromTo('#row1', { xPercent: 0 }, { xPercent: -28, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: .5 } });
      gsap.fromTo('#row2', { xPercent: -28 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top bottom', end: 'bottom top', scrub: .5 } });
    }

    /* ---------- Проекты: горизонтальная прокрутка на десктопе ---------- */
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const track = $('#pjTrack');
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const move = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#pjPin', start: () => 'top ' + hdr(), end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('#pjTrack .hp-pj-card .im img').forEach(el => gsap.fromTo(el, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: el.closest('.hp-pj-card'), containerAnimation: move, start: 'left right', end: 'right left', scrub: true } }));
    });

    /* ---------- Счётчики ---------- */
    $$('#nums .cnt').forEach(el => {
      const to = parseInt(el.dataset.to, 10); if (!to || reduce) return;
      const o = { v: 0 }; el.textContent = '0';
      gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true }, onUpdate: () => { el.textContent = Math.round(o.v); } });
    });
    if (!reduce) ScrollTrigger.batch('#brands a', { start: 'top 95%', once: true, onEnter: els => gsap.from(els, { autoAlpha: 0, y: 20, duration: .6, stagger: .03, ease: 'power2.out' }) });

    /* ---------- Параллакс фото сервиса ---------- */
    if (!reduce) { const sp = $('#svcPh img'); if (sp) gsap.fromTo(sp, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '#svcPh', start: 'top bottom', end: 'bottom top', scrub: true } }); }

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

  const go = () => (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(start).catch(e => { console.error(e); ready(); endIntro(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
