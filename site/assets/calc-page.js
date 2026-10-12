(function () {
  const D = AEC, U = AECUI, I = U.icon, L = U.L, C = D.CONTACT;
  U.init({ active: 'calc' });
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (v, d) => (+v).toLocaleString('ru-RU', { maximumFractionDigits: d == null ? 0 : d });
  const num = v => String(Math.round(v * 100) / 100).replace('.', '-');
  const plural = (n, a, b, c) => { const m = n % 100, d = n % 10; return m > 10 && m < 20 ? c : d === 1 ? a : d > 1 && d < 5 ? b : c; };

  /* ---------- Справочники ---------- */
  const UPS_ROW = [1, 2, 3, 6, 10, 15, 20, 30, 40, 60, 80, 100, 120, 160, 200, 250, 300, 400, 500, 600, 800, 1000, 1200];
  const DGU_ROW = [10, 20, 30, 40, 50, 66, 88, 110, 125, 138, 150, 165, 200, 220, 250, 275, 300, 350, 400, 500, 550, 660, 770, 825, 1000, 1100, 1250, 1650, 2000, 2500, 3000, 3750];
  const STAB_ROW = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000, 3200];
  const CAPS = [7, 9, 18, 26, 40, 65, 100, 150, 200];
  const ETA = 0.94;
  const peukert = t => t < 30 ? 0.75 : t <= 60 ? 0.85 : 0.95;
  const ceilRow = (row, v) => { const r = row.find(x => x >= v - 1e-9); return r != null ? r : Math.ceil(v / 100) * 100; };
  const busFor = (kva, ph) => ph === 3 ? 480 : kva <= 2 ? 48 : kva <= 3 ? 96 : 192;
  const OBJ = { server: 'Серверная / ЦОД', med: 'Медицина', prom: 'Производство', office: 'Офис / ТРЦ', oil: 'Нефтегаз' };
  const OBJ_IND = { server: 'czod', med: 'med', prom: 'prom', office: 'office', oil: 'oil' };
  const RED = { none: 'Без резервирования', n1: 'N+1, модульный ИБП', par: 'Параллель 1+1' };
  const DGU_FORM = { open: 'Открытое', kozhuh: 'В шумозащитном кожухе', cont: 'В контейнере' };
  const DGU_FORM_RE = { open: /откр/i, kozhuh: /кожух/i, cont: /контейнер/i };
  const DGU_FORM_CAT = { open: 'open', kozhuh: 'kozhuh', cont: 'container' };
  const NOISE = { open: 95, kozhuh: 72, cont: 65 };
  const VIN = { '10': ['±10 % (198–242 В)', 1.0], '15': ['±15 % (187–253 В)', 1.1], '20': ['±20 % (176–264 В)', 1.2], '30': ['±30 % (154–286 В)', 1.4], '150': ['Просадки до 150 В (150–250 В)', 1.4] };
  const LT = { motor: 'Станки, насосы, компрессоры (пусковые токи)', el: 'Электроника, ИТ, медицинская техника', light: 'Освещение, отопление, нагрев' };
  const DC_OPTS = [24, 36, 48, 72, 96, 192, 240, 384, 480];
  const cityName = slug => slug === 'other' ? 'другой город' : (D.CITIES.find(c => c.slug === slug) || {}).name || slug;

  /* ---------- Состояние и hash ---------- */
  const MODES = ['ibp', 'dgu', 'akb', 'stab'];
  const DEF = {
    ibp: { u: 'kw', load: 10, pf: 0.9, res: 25, ph: null, min: 30, red: 'none', obj: 'server', city: 'almaty' },
    dgu: { kw: 100, mot: 20, mode: 'esp', alt: 0, temp: 25, form: 'kozhuh', avr: 1, hrs: 8 },
    akb: { kva: 20, pf: 0.9, dc: null, min: 30, cur: '' },
    stab: { u: 'kva', load: 10, pf: 0.9, ph: null, vin: '20', lt: 'motor' }
  };
  const inSet = (v, arr) => arr.map(String).includes(String(v));
  const clampN = (v, lo, hi) => isFinite(v) && v >= lo && v <= hi ? v : null;
  const snap = (v, arr) => arr.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a);
  /* ключ hash → применение к состоянию; возвращает true, если принято */
  const KEYS = {
    ibp: {
      kw: (s, v) => { const n = clampN(parseFloat(v), 0.1, 5000); if (n == null) return; s.u = 'kw'; s.load = n; },
      kva: (s, v) => { const n = clampN(parseFloat(v), 0.1, 5000); if (n == null) return; s.u = 'kva'; s.load = n; },
      pf: (s, v) => { if (inSet(v, [0.8, 0.9, 1])) s.pf = +v; },
      res: (s, v) => { if (inSet(v, [10, 20, 25, 30])) s.res = +v; },
      ph: (s, v) => { if (inSet(v, [1, 3])) s.ph = +v; },
      min: (s, v) => { const n = clampN(parseFloat(v), 5, 240); if (n != null) s.min = Math.round(n); },
      red: (s, v) => { if (RED[v]) s.red = v; },
      obj: (s, v) => { if (OBJ[v]) s.obj = v; },
      city: (s, v) => { if (v === 'other' || D.CITIES.some(c => c.slug === v)) s.city = v; }
    },
    dgu: {
      kw: (s, v) => { const n = clampN(parseFloat(v), 1, 5000); if (n != null) s.kw = n; },
      mot: (s, v) => { const n = clampN(parseFloat(v), 0, 100); if (n != null) s.mot = snap(n, [0, 20, 40, 60, 80, 100]); },
      mode: (s, v) => { if (inSet(v, ['esp', 'prp'])) s.mode = v; },
      alt: (s, v) => { if (inSet(v, [0, 1000, 2000])) s.alt = +v; },
      temp: (s, v) => { if (inSet(v, [25, 40])) s.temp = +v; },
      form: (s, v) => { if (DGU_FORM[v]) s.form = v; },
      avr: (s, v) => { if (inSet(v, [0, 1])) s.avr = +v; },
      hrs: (s, v) => { if (inSet(v, [8, 12, 24, 72])) s.hrs = +v; },
      min: () => { }
    },
    akb: {
      kva: (s, v) => { const n = clampN(parseFloat(v), 0.5, 1200); if (n != null) s.kva = n; },
      kw: (s, v) => { const n = clampN(parseFloat(v), 0.5, 1200); if (n != null) s.kva = Math.round(n / s.pf * 10) / 10; },
      pf: (s, v) => { if (inSet(v, [0.8, 0.9, 1])) s.pf = +v; },
      dc: (s, v) => { if (inSet(v, DC_OPTS)) s.dc = +v; },
      min: (s, v) => { const n = clampN(parseFloat(v), 5, 240); if (n != null) s.min = Math.round(n); },
      cur: (s, v) => { if (/^\d{1,2}x\d{1,3}$/.test(v)) s.cur = v; }
    },
    stab: {
      kw: (s, v) => { const n = clampN(parseFloat(v), 0.1, 5000); if (n == null) return; s.u = 'kw'; s.load = n; },
      kva: (s, v) => { const n = clampN(parseFloat(v), 0.1, 5000); if (n == null) return; s.u = 'kva'; s.load = n; },
      pf: (s, v) => { if (inSet(v, [0.8, 0.9, 1])) s.pf = +v; },
      ph: (s, v) => { if (inSet(v, [1, 3])) s.ph = +v; },
      vin: (s, v) => { if (VIN[v]) s.vin = v; },
      lt: (s, v) => { if (LT[v]) s.lt = v; },
      min: () => { }
    }
  };
  const S = {}; MODES.forEach(m => S[m] = Object.assign({}, DEF[m]));
  let mode = 'ibp', eff = {}, R = null, ctaDirty = false;

  function parse() {
    const parts = U.hashParts();
    const m = MODES.includes(parts[0]) ? parts[0] : 'ibp';
    const s = Object.assign({}, DEF[m]);
    const keys = Object.keys(KEYS[m]).sort((a, b) => b.length - a.length);
    const pending = [];
    parts.slice(MODES.includes(parts[0]) ? 1 : 0).forEach(part => {
      const k = keys.find(key => part.startsWith(key)); if (!k) return;
      const raw = part.slice(k.length); if (!raw) return;
      const v = /^[\d-]+$/.test(raw) ? raw.replace('-', '.') : raw;
      if (k === 'kw' && m === 'akb') pending.push([k, v]); else KEYS[m][k](s, v);
    });
    pending.forEach(([k, v]) => KEYS[m][k](s, v));
    return { mode: m, state: s };
  }
  function hashOf() {
    const s = S[mode], d = DEF[mode], a = [mode];
    const put = (k, v, always) => { if (v == null || v === '') return; if (!always && String(v) === String(d[k])) return; a.push(k + num(v)); };
    if (mode === 'ibp' || mode === 'stab') { a.push(s.u + num(s.load)); }
    if (mode === 'ibp') { put('pf', s.pf); put('res', s.res); if (s.ph) a.push('ph' + s.ph); put('min', s.min, true); if (s.red !== d.red) a.push('red' + s.red); if (s.obj !== d.obj) a.push('obj' + s.obj); if (s.city !== d.city) a.push('city' + s.city); }
    if (mode === 'dgu') { put('kw', s.kw, true); put('mot', s.mot); if (s.mode !== d.mode) a.push('mode' + s.mode); put('alt', s.alt); put('temp', s.temp); if (s.form !== d.form) a.push('form' + s.form); put('avr', s.avr); put('hrs', s.hrs); }
    if (mode === 'akb') { put('kva', s.kva, true); put('pf', s.pf); if (s.dc) a.push('dc' + s.dc); put('min', s.min, true); if (/^\d{1,2}x\d{1,3}$/.test(s.cur)) a.push('cur' + s.cur); }
    if (mode === 'stab') { put('pf', s.pf); if (s.ph) a.push('ph' + s.ph); if (s.vin !== d.vin) a.push('vin' + s.vin); if (s.lt !== d.lt) a.push('lt' + s.lt); }
    return a.join('.');
  }

  /* ---------- Каталог ---------- */
  const phaseOf = p => (p.phases || '').startsWith('1') ? 1 : 3;
  const akb12 = () => D.PRODUCTS.filter(p => p.cat === 'akb' && p.form === '12 В');
  const stockFirst = (a, b) => ((b.stock === 'in') - (a.stock === 'in')) || a.kva - b.kva;
  function akbFor(cap) {
    const exact = akb12().filter(p => Math.abs(p.kva - cap) < 0.5).sort(stockFirst);
    if (exact.length) return exact[0];
    const up = akb12().filter(p => p.kva >= cap).sort((a, b) => a.kva - b.kva || stockFirst(a, b));
    return up[0] || null;
  }
  const weightOf = p => { const m = p && p.weight ? String(p.weight).replace(',', '.').match(/[\d.]+/) : null; return m ? parseFloat(m[0]) : null; };
  function nearest(list, target, n) { return list.slice().sort((a, b) => Math.abs(a.kva - target) - Math.abs(b.kva - target) || a.kva - b.kva).slice(0, n); }

  /* ---------- Батареи ---------- */
  function batteries(P_kw, t_min, bus) {
    const wh = P_kw * 1000 * t_min / 60 / ETA / peukert(t_min);
    const M = Math.round(bus / 12);
    const ahReq = wh / bus;
    let N = 1; while (ahReq / N > 200) N++;
    const perStr = ahReq / N, cap = CAPS.find(c => c >= perStr) || 200;
    const blocks = N * M;
    const prod = akbFor(cap);
    const wBlock = (prod && Math.abs(prod.kva - cap) < 0.5 && weightOf(prod)) || 0.3 * cap;
    const mass = blocks * wBlock, cabinets = Math.ceil(blocks * Math.max(1, cap / 100) / 40);
    const I = P_kw * 1000 / ETA / bus;
    const tAct = t_min * (N * cap) / ahReq;
    return { wh, M, N, cap, ahReq, perStr, blocks, mass, cabinets, I, prod, wBlock, tAct, bus };
  }

  /* ---------- Расчёт: ИБП ---------- */
  function calcIbp(s) {
    const res = s.res / 100;
    const S_load = s.u === 'kw' ? s.load / s.pf : s.load, P_load = s.u === 'kw' ? s.load : s.load * s.pf;
    const S_calc = S_load * (1 + res), P_calc = P_load * (1 + res);
    const ph = s.ph || (S_calc > 10 ? 3 : 1);
    const nominal = ceilRow(UPS_ROW, S_calc), overRow = S_calc > UPS_ROW[UPS_ROW.length - 1];
    const modular = s.red === 'n1', units = s.red === 'par' ? 2 : 1;
    const module = modular ? (nominal <= 100 ? 25 : 50) : 0;
    const frame = modular ? nominal + module : nominal;
    const bus = modular ? 480 : busFor(nominal, ph);
    const bat = batteries(P_calc, s.min, bus);
    const kMin = frame, kMax = frame * 1.6;
    const base = D.PRODUCTS.filter(p => p.cat === 'ibp' && (!modular || p.arch === 'Модульная'));
    let models = base.filter(p => phaseOf(p) === ph && p.kva >= kMin && p.kva <= kMax && p.kw >= P_calc - 1e-9).sort((a, b) => a.kva - b.kva || stockFirst(a, b));
    let near = false;
    if (!models.length) { near = true; const samePh = base.filter(p => phaseOf(p) === ph && p.kw >= P_calc - 1e-9); models = nearest(samePh.length ? samePh : base, kMin, 4); }
    const ind = OBJ_IND[s.obj];
    const catHash = 'catalog.html#ibp' + (modular ? '.modulnye' : '') + '.kvamin-' + num(kMin) + '.kvamax-' + num(kMax) + '.phase-' + ph + '-' + ph;
    return { S_load, P_load, S_calc, P_calc, ph, nominal, overRow, modular, units, module, frame, bus, bat, kMin, kMax, models, near, ind, catHash, eff: { ph } };
  }

  /* ---------- Расчёт: ДГУ ---------- */
  function calcDgu(s) {
    const kStart = 1 + s.mot / 100 * 2.5;
    const P_start = s.kw * kStart;
    let S1 = P_start / 0.8; const S_mode = s.mode === 'prp' ? S1 * 1.1 : S1;
    const dAlt = { 0: 0, 1000: .03, 2000: .07 }[s.alt], dT = { 25: 0, 40: .04 }[s.temp];
    const S_req = S_mode / (1 - dAlt) / (1 - dT);
    const nominal = ceilRow(DGU_ROW, S_req), overRow = S_req > DGU_ROW[DGU_ROW.length - 1];
    const kwNom = nominal * 0.8, loadFactor = s.kw / kwNom;
    const fuel = 0.21 * s.kw, tank = fuel * s.hrs;
    const kMin = nominal, kMax = nominal * 1.6;
    const base = D.PRODUCTS.filter(p => p.cat === 'dgu');
    const byForm = base.filter(p => DGU_FORM_RE[s.form].test(p.form || ''));
    let models = byForm.filter(p => p.kva >= kMin && p.kva <= kMax).sort((a, b) => a.kva - b.kva || stockFirst(a, b));
    let near = false;
    if (!models.length) { near = true; models = nearest(byForm.length ? byForm : base, kMin, 4); }
    const catHash = 'catalog.html#dgu.kvamin-' + num(kMin) + '.kvamax-' + num(kMax) + '.form-' + DGU_FORM_CAT[s.form];
    return { kStart, P_start, S1, S_mode, S_req, dAlt, dT, nominal, overRow, kwNom, loadFactor, fuel, tank, noise: NOISE[s.form], kMin, kMax, models, near, catHash, eff: {} };
  }

  /* ---------- Расчёт: батареи для ИБП ---------- */
  function calcAkb(s) {
    const P = s.kva * s.pf;
    const bus = s.dc || busFor(s.kva, s.kva > 10 ? 3 : 1);
    const bat = batteries(P, s.min, bus);
    const m = /^(\d{1,2})x(\d{1,3})$/.exec(s.cur || '');
    const cur = m ? { N: +m[1], M: +m[2], blocks: +m[1] * +m[2] } : null;
    const kMin = bat.cap, kMax = bat.cap * 1.6;
    let models = akb12().filter(p => p.kva >= kMin - 0.5 && p.kva <= kMax).sort(stockFirst);
    let near = false;
    if (!models.length) { near = true; models = nearest(akb12(), kMin, 4); }
    const catHash = 'catalog.html#akb.12v.kvamin-' + num(kMin) + '.kvamax-' + num(kMax);
    return { P, bus, bat, cur, kMin, kMax, models, near, catHash, eff: { dc: bus } };
  }

  /* ---------- Расчёт: стабилизатор ---------- */
  function calcStab(s) {
    const S_load = s.u === 'kw' ? s.load / s.pf : s.load;
    const ph = s.ph || (S_load > 10 ? 3 : 1);
    const kV = VIN[s.vin][1];
    const S1 = S_load * 1.3, S_req = S1 * kV;
    const nominal = ceilRow(STAB_ROW, S_req), overRow = S_req > STAB_ROW[STAB_ROW.length - 1];
    const type = s.lt === 'el' ? 'Электронный' : 'Электромеханический';
    const typeWhy = s.lt === 'motor' ? 'держит кратные перегрузки при пуске двигателей' : s.lt === 'el' ? 'без подвижных частей, быстрая реакция на скачки' : 'нагрузка без пусковых токов: подойдёт более доступный электромеханический';
    const kMin = nominal, kMax = nominal * 1.6;
    const base = D.PRODUCTS.filter(p => p.cat === 'stab' && String(p.phases) === String(ph));
    const inRange = base.filter(p => p.kva >= kMin && p.kva <= kMax);
    let models = inRange.filter(p => (p.topology || '').startsWith(type)).sort((a, b) => a.kva - b.kva || stockFirst(a, b));
    let typeMiss = false, near = false;
    if (!models.length && inRange.length) { typeMiss = true; models = inRange.slice().sort((a, b) => a.kva - b.kva); }
    if (!models.length) { near = true; models = nearest(base.length ? base : D.PRODUCTS.filter(p => p.cat === 'stab'), kMin, 4); }
    const catHash = 'catalog.html#stab.kvamin-' + num(kMin) + '.kvamax-' + num(kMax) + '.phase-' + ph;
    return { S_load, ph, kV, S1, S_req, nominal, overRow, type, typeWhy, kMin, kMax, models, near, typeMiss, catHash, eff: { ph } };
  }
  window.__calc = { S, DEF, parse, hashOf, calcIbp, calcDgu, calcAkb, calcStab, batteries };
  window.__calcCtx = { D, U, I, L, C, esc, fmt, num, plural, OBJ, OBJ_IND, RED, DGU_FORM, VIN, LT, DC_OPTS, cityName, MODES, KEYS, S, get mode() { return mode; }, set mode(v) { mode = v; }, get eff() { return eff; }, set eff(v) { eff = v; }, get R() { return R; }, set R(v) { R = v; }, get ctaDirty() { return ctaDirty; }, set ctaDirty(v) { ctaDirty = v; }, parse, hashOf, calcIbp, calcDgu, calcAkb, calcStab, UPS_ROW, DGU_ROW, STAB_ROW, CAPS, ETA, peukert };


  /* ---------- Форма ---------- */
  const fld = (label, inner, k, forId) => `<div class="field"><label${forId ? ` for="${forId}"` : ''}>${label}</label>${inner}${k ? `<span class="hint" data-hint="${k}"></span>` : ''}</div>`;
  const sel = (k, opts, v) => `<select class="select" id="f-${k}" data-k="${k}">${opts.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(v) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
  const seg = (k, opts, v, aria) => `<div class="seg" role="group" aria-label="${esc(aria || k)}">${opts.map(o => `<button type="button" data-k="${k}" data-v="${esc(o[0])}" class="${String(o[0]) === String(v) ? 'on' : ''}">${esc(o[1])}</button>`).join('')}</div>`;
  const numIn = (k, v, a) => `<input class="input num" type="number" id="f-${k}" data-k="${k}" value="${v}" min="${a.min}" max="${a.max}" step="${a.step || 'any'}" inputmode="decimal"${a.ph ? ` placeholder="${a.ph}"` : ''}>`;
  const slider = (k, v, lo, hi, step) => `<div class="sl"><input type="range" data-k="${k}" min="${lo}" max="${hi}" step="${step}" value="${v}" aria-label="Автономия, минут"><input class="input num" type="number" id="f-${k}" data-k="${k}" min="${lo}" max="${hi}" step="${step}" value="${v}" inputmode="numeric"></div><div class="ticks"><span>5 мин</span><span>30</span><span>60</span><span>120</span><span>240 мин</span></div>`;
  const PF_OPTS = [[0.8, '0,8'], [0.9, '0,9'], [1, '1,0']];
  const PH_OPTS = [[1, '1ф 220 В'], [3, '3ф 380 В']];

  function formHTML() {
    const s = S[mode];
    if (mode === 'ibp') return `<div><h2>Расчёт ИБП</h2><p class="sub">Нагрузка, запас, автономия и резервирование. Результат обновляется сразу.</p></div>
      ${fld('Мощность нагрузки', `<div class="fx">${numIn('load', s.load, { min: 0.1, max: 5000, step: 0.1 })}${seg('u', [['kw', 'кВт'], ['kva', 'кВА']], s.u, 'Единицы')}</div>`, 'load', 'f-load')}
      <div class="row2">${fld('Коэффициент мощности нагрузки', sel('pf', PF_OPTS, s.pf), null, 'f-pf')}${fld('Запас на рост нагрузки', sel('res', [[10, '10 %'], [20, '20 %'], [25, '25 %'], [30, '30 %']], s.res), null, 'f-res')}</div>
      ${fld('Фазность', seg('ph', PH_OPTS, eff.ph, 'Фазность'), 'ph')}
      ${fld('Требуемая автономия, мин', slider('min', s.min, 5, 240, 5), 'min', 'f-min')}
      ${fld('Резервирование', sel('red', Object.entries(RED), s.red), 'red', 'f-red')}
      <div class="row2">${fld('Тип объекта', sel('obj', Object.entries(OBJ), s.obj), null, 'f-obj')}${fld('Город объекта', sel('city', D.CITIES.map(c => [c.slug, c.name]).concat([['other', 'Другой город']]), s.city), null, 'f-city')}</div>
      <p class="ff">Ссылка на расчёт содержит все параметры: её можно сохранить, отправить коллеге или приложить к запросу КП.</p>`;
    if (mode === 'dgu') return `<div><h2>Расчёт дизельного генератора</h2><p class="sub">Нагрузка с пусковыми токами, режим работы, условия площадки и запас топлива.</p></div>
      ${fld('Суммарная мощность нагрузки, кВт', numIn('kw', s.kw, { min: 1, max: 5000, step: 1 }), 'kw', 'f-kw')}
      ${fld('Доля двигательной нагрузки', sel('mot', [[0, '0 % (ИБП, освещение, ИТ)'], [20, '20 %'], [40, '40 %'], [60, '60 %'], [80, '80 %'], [100, '100 % (насосы, компрессоры)']], s.mot), 'mot', 'f-mot')}
      <div class="row2">${fld('Режим работы', sel('mode', [['esp', 'Резервный (ESP)'], ['prp', 'Основной (PRP)']], s.mode), null, 'f-mode')}${fld('Исполнение', sel('form', Object.entries(DGU_FORM), s.form), null, 'f-form')}</div>
      <div class="row2">${fld('Высота над уровнем моря', sel('alt', [[0, 'до 1000 м'], [1000, '1000–2000 м'], [2000, 'свыше 2000 м']], s.alt), null, 'f-alt')}${fld('Температура на площадке', sel('temp', [[25, 'до 25 °C'], [40, 'до 40 °C']], s.temp), null, 'f-temp')}</div>
      <div class="row2">${fld('АВР (автоматический ввод резерва)', seg('avr', [[1, 'Нужен'], [0, 'Не нужен']], s.avr, 'АВР'))}${fld('Автономия по топливу', sel('hrs', [[8, '8 часов'], [12, '12 часов'], [24, '24 часа'], [72, '72 часа']], s.hrs), null, 'f-hrs')}</div>
      <p class="ff">Мощность ДГУ указывается в кВА при cos φ 0,8. Для объектов с ИБП выбирайте ДГУ не менее 1,5 × мощности ИБП.</p>`;
    if (mode === 'akb') return `<div><h2>Батареи для ИБП: замена и подбор</h2><p class="sub">Считаем линейку АКБ 12 В под установленный ИБП и нужную автономию.</p></div>
      <div class="row2">${fld('Мощность ИБП, кВА', numIn('kva', s.kva, { min: 0.5, max: 1200, step: 0.5 }), null, 'f-kva')}${fld('Коэффициент мощности ИБП', sel('pf', PF_OPTS, s.pf), null, 'f-pf')}</div>
      ${fld('Напряжение батарейной шины', sel('dc', [['', 'Авто по мощности']].concat(DC_OPTS.map(v => [v, v + ' В DC'])), s.dc || ''), 'dc', 'f-dc')}
      ${fld('Требуемая автономия, мин', slider('min', s.min, 5, 240, 5), 'min', 'f-min')}
      ${fld('Текущая конфигурация, строк × блоков', `<input class="input" type="text" id="f-cur" data-k="cur" value="${esc(s.cur)}" placeholder="например, 2x40 (необязательно)">`, 'cur', 'f-cur')}
      <p class="ff">Число блоков в строке задаёт шина постоянного тока ИБП: уточните её в паспорте или на шильдике батарейного шкафа.</p>`;
    return `<div><h2>Расчёт стабилизатора напряжения</h2><p class="sub">Мощность, фазность, реальный диапазон напряжения на объекте и характер нагрузки.</p></div>
      ${fld('Мощность нагрузки', `<div class="fx">${numIn('load', s.load, { min: 0.1, max: 5000, step: 0.1 })}${seg('u', [['kva', 'кВА'], ['kw', 'кВт']], s.u, 'Единицы')}</div>`, 'load', 'f-load')}
      ${fld('Коэффициент мощности (при вводе в кВт)', sel('pf', PF_OPTS, s.pf), null, 'f-pf')}
      ${fld('Фазность', seg('ph', PH_OPTS, eff.ph, 'Фазность'), 'ph')}
      ${fld('Диапазон входного напряжения на объекте', sel('vin', Object.entries(VIN).map(([k, v]) => [k, v[0]]), s.vin), 'vin', 'f-vin')}
      ${fld('Тип нагрузки', sel('lt', Object.entries(LT), s.lt), 'lt', 'f-lt')}
      <p class="ff">Измерьте напряжение на вводе в течение суток: чем глубже просадки, тем больше запас по мощности нужен стабилизатору.</p>`;
  }
  function buildForm() { document.getElementById('cform').innerHTML = formHTML(); }
  function syncForm() {
    const s = S[mode], f = document.getElementById('cform');
    const val = k => k === 'ph' ? eff.ph : k === 'dc' ? (s.dc || '') : s[k];
    f.querySelectorAll('[data-k]').forEach(el => {
      const k = el.dataset.k;
      if (el.tagName === 'BUTTON') { el.classList.toggle('on', String(el.dataset.v) === String(val(k))); return; }
      if (el === document.activeElement && el.type !== 'range') return;
      const v = val(k); if (String(el.value) !== String(v)) el.value = v;
    });
    const hint = (k, html) => { const h = f.querySelector(`[data-hint="${k}"]`); if (h) h.innerHTML = html; };
    if (mode === 'ibp') {
      hint('load', s.u === 'kw' ? `${fmt(s.load, 1)} кВт при PF ${fmt(s.pf, 1)} = ${fmt(R.S_load, 1)} кВА` : `${fmt(s.load, 1)} кВА при PF ${fmt(s.pf, 1)} = ${fmt(R.P_load, 1)} кВт`);
      hint('ph', s.ph ? `Выбрано вручную. <a href="calc.html#${hashOf()}" data-auto="ph">Вернуть авто</a>` : `Авто: ${eff.ph === 3 ? '3 фазы, расчётная мощность больше 10 кВА' : '1 фаза, расчётная мощность до 10 кВА'}`);
      hint('min', s.min > 120 ? 'Больше 2 часов: выгоднее ДГУ плюс ИБП на 15–30 минут' : s.min <= 15 ? 'Типовая автономия для объектов с ДГУ' : 'Типовая автономия без ДГУ: 30–60 минут');
      hint('red', s.red === 'n1' ? 'Один дополнительный силовой модуль, горячая замена' : s.red === 'par' ? 'Два ИБП полной мощности, каждый со своими батареями' : 'Один ИБП, сервисный байпас для ТО');
    }
    if (mode === 'dgu') { hint('kw', `Расчётная мощность с пусковыми токами: ${fmt(R.P_start, 1)} кВт`); hint('mot', `Коэффициент пусковых токов ${fmt(R.kStart, 2)}`); }
    if (mode === 'akb') { hint('dc', s.dc ? `Выбрано вручную: ${R.bat.M} блоков 12 В в строке` : `Авто: ${R.bus} В DC, ${R.bat.M} блоков 12 В в строке`); hint('min', `Энергия на ${s.min} мин: ${fmt(R.bat.wh / 1000, 1)} кВт·ч`); hint('cur', R.cur ? `Сейчас ${R.cur.blocks} блоков` : 'Для сравнения с расчётной конфигурацией'); }
    if (mode === 'stab') {
      hint('load', s.u === 'kw' ? `${fmt(s.load, 1)} кВт при PF ${fmt(s.pf, 1)} = ${fmt(R.S_load, 1)} кВА` : `${fmt(s.load, 1)} кВА`);
      hint('ph', s.ph ? `Выбрано вручную. <a href="calc.html#${hashOf()}" data-auto="ph">Вернуть авто</a>` : `Авто: ${eff.ph === 3 ? '3 фазы, нагрузка больше 10 кВА' : '1 фаза, нагрузка до 10 кВА'}`);
      hint('vin', `Поправка на нижнюю границу напряжения × ${fmt(R.kV, 1)}`);
      hint('lt', `Рекомендуемый тип: ${R.type.toLowerCase()}`);
    }
  }

  /* ---------- Визуализации ---------- */
  function bars(rows) {
    const max = Math.max(...rows.map(r => r.v));
    return `<div class="bars">${rows.map((r, i) => { const w = Math.max(3, r.v / max * 100); return `<div class="bar b${i + 1}${w < 24 ? ' lo' : ''}"><span class="lbl">${esc(r.l)}</span><div class="trk"><div class="fill" style="width:${w.toFixed(1)}%"></div><span class="val num" style="${w < 24 ? 'left:calc(' + w.toFixed(1) + '% + 8px)' : ''}">${esc(r.t)}</span></div></div>`; }).join('')}</div>`;
  }
  function batSvg(b) {
    const rowsShown = Math.min(b.N, 5), M = b.M, W = 1000, left = 86, gap = M > 20 ? 3 : 6;
    const bw = (W - left - 30 - gap * (M - 1)) / M, bh = Math.min(42, Math.max(16, bw * 1.3)), rh = bh + 20;
    const H = rowsShown * rh + 14 + (b.N > rowsShown ? 22 : 0);
    let out = '';
    for (let r = 0; r < rowsShown; r++) {
      const y = 8 + r * rh;
      out += `<text class="lb" x="0" y="${(y + bh / 2 + 4).toFixed(1)}">Строка ${r + 1}</text><path class="wire" d="M${left - 8} ${(y + bh / 2).toFixed(1)} H${(W - 24).toFixed(1)}"/>`;
      for (let c = 0; c < M; c++) { const x = left + c * (bw + gap); out += `<rect class="bk" x="${x.toFixed(1)}" y="${y}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2"/><rect class="tm" x="${(x + 2).toFixed(1)}" y="${y + 2}" width="${Math.min(5, bw / 4).toFixed(1)}" height="3"/>`; }
      out += `<text class="lbn" x="${W}" y="${(y + bh / 2 + 4).toFixed(1)}" text-anchor="end">${b.bus} В</text>`;
    }
    if (b.N > rowsShown) out += `<text class="lb" x="${left}" y="${H - 6}">… ещё ${b.N - rowsShown} ${plural(b.N - rowsShown, 'строка', 'строки', 'строк')} параллельно</text>`;
    return `<div class="batsvg"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Схема батарейных строк: ${b.N} × ${b.M} × ${b.cap} А·ч">${out}</svg><div class="batcap"><b class="num">${b.N} × ${b.M} × ${b.cap} А·ч</b><span>${b.blocks} ${plural(b.blocks, 'блок', 'блока', 'блоков')} 12 В${b.M > 20 ? ' · блоки показаны схематично' : ''}</span></div></div>`;
  }
  const kpi = (label, val, small, hi) => `<div class="kpi${hi ? ' hi' : ''}"><span>${label}</span><b class="num">${val}</b>${small ? `<small>${small}</small>` : ''}</div>`;
  const specT = rows => `<div class="tbl-wrap"><table class="spec sm">${rows.map(r => r.length === 1 ? `<tr class="grp"><td colspan="2">${r[0]}</td></tr>` : `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('')}</table></div>`;
  function actions(labelKp) {
    return `<div class="cact"><button class="btn btn-primary" type="button" data-act="send">${I('mail')} Отправить расчёт инженеру</button><button class="btn btn-kp" type="button" data-act="kp">${I('kp')} ${esc(labelKp || 'Добавить подобранное в запрос КП')}</button><button class="btn btn-ghost wide" type="button" data-act="copy">${I('file')} Скопировать ссылку на расчёт</button><a class="lnk" href="${R.catHash}">${I('search')} Открыть в каталоге с фильтром</a></div>`;
  }


  /* ---------- Результаты ---------- */
  const OBJ_HINT = {
    server: `Для серверной: модульная архитектура даёт резервирование N+1 и наращивание без замены ИБП, SNMP-карта нужна для мониторинга. <a href="${L.solution('czod')}">Решения для ЦОД</a>`,
    med: `Рентген, КТ и МРТ дают пиковые токи в 3–5 раз выше номинала: рассмотрите трансформаторные серии (Tescom TEOS) и запас 30 %. <a href="${L.solution('med')}">Решения для медицины</a>`,
    prom: `Двигатели и компрессоры: учтите пусковые токи и перегрузочную способность ИБП (150 % в течение 1 минуты), при частых пусках часть нагрузки выносят на ДГУ. <a href="${L.solution('prom')}">Решения для производства</a>`,
    office: `Лифты, вентиляцию и аварийное освещение обычно питают от ДГУ, а ИБП оставляют для ИТ, СКУД и кассовых узлов. <a href="${L.solution('office')}">Решения для БЦ и ТРЦ</a>`,
    oil: `Удалённые объекты: контейнерный ДГУ с АВР плюс ИБП, обогрев батарейного помещения, запас батарей на зимний период. <a href="${L.solution('oil')}">Решения для нефтегаза</a>`
  };
  const dguLink = (kw, min) => 'calc.html#dgu.kw' + num(kw);

  function resIbp(s) {
    const b = R.bat, u = R.units;
    const nomTxt = R.modular ? `${fmt(R.nominal)} + ${R.module} кВА` : u === 2 ? `2 × ${fmt(R.nominal)} кВА` : `${fmt(R.nominal)} кВА`;
    const tiles = kpi('Рекомендуемый ИБП', nomTxt, `${R.ph === 3 ? '3ф 380 В' : '1ф 220 В'} · on-line · ${R.modular ? 'модульный, N+1' : u === 2 ? 'параллель 1+1' : 'двойное преобразование'}`, true)
      + kpi('Расчётная мощность', `${fmt(R.S_calc, 1)} кВА`, `${fmt(R.P_calc, 1)} кВт · нагрузка ${fmt(R.S_load, 1)} кВА + ${s.res} %`)
      + kpi('Батареи на ' + s.min + ' мин', `${b.N} × ${b.M} × ${b.cap} А·ч`, `${fmt(b.blocks * u)} ${plural(b.blocks * u, 'блок', 'блока', 'блоков')} 12 В${u === 2 ? ' на два ИБП' : ''} · шина ${b.bus} В`)
      + kpi('Масса батарей', `≈ ${fmt(b.mass * u)} кг`, `${b.cabinets * u} ${plural(b.cabinets * u, 'батарейный шкаф', 'батарейных шкафа', 'батарейных шкафов')}`)
      + kpi('Ток разряда', `${fmt(b.I)} А`, `${b.N > 1 ? fmt(b.I / b.N) + ' А на строку · ' : ''}при ${b.bus} В DC`)
      + kpi('Энергия батарей', `${fmt(b.wh / 1000, 1)} кВт·ч`, `фактическая автономия ≈ ${fmt(b.tAct)} мин`);
    const barRows = [{ l: 'Нагрузка', v: R.S_load, t: fmt(R.S_load, 1) + ' кВА' }, { l: 'С запасом ' + s.res + ' %', v: R.S_calc, t: fmt(R.S_calc, 1) + ' кВА' }, { l: R.modular ? 'N модулей' : 'Номинал ИБП', v: R.nominal, t: fmt(R.nominal) + ' кВА' }];
    if (R.modular) barRows.push({ l: 'N+1: шкаф', v: R.frame, t: fmt(R.frame) + ' кВА' });
    const notes = [];
    if (s.min > 120) notes.push(`<div class="note">Автономия ${s.min} мин: батареи на такое время тяжёлые и дорогие. Рассмотрите ДГУ плюс ИБП на 15–30 минут: <a href="${dguLink(R.P_calc)}">рассчитать ДГУ на ${fmt(R.P_calc)} кВт</a>.</div>`);
    if (R.ph === 1 && R.nominal > 10) notes.push(`<div class="note">Однофазные ИБП в каталоге до 10 кВА. Для ${fmt(R.nominal)} кВА распределите нагрузку по трём фазам или используйте несколько однофазных ИБП.</div>`);
    if (R.overRow) notes.push(`<div class="note">Мощность свыше 1200 кВА: параллельная система из нескольких ИБП, считается под проект.</div>`);
    if (R.modular) notes.push(`<div class="note info">N+1: ${Math.ceil(R.nominal / R.module)} рабочих модулей по ${R.module} кВА плюс один резервный, шкаф не менее ${fmt(R.frame)} кВА. <a href="${L.cat('ibp', 'modulnye')}">Модульные ИБП</a></div>`);
    if (u === 2) notes.push(`<div class="note info">Параллель 1+1: два ИБП по ${fmt(R.nominal)} кВА, каждый несёт всю нагрузку, батареи у каждого свои. Количество в запросе КП: 2.</div>`);
    notes.push(`<div class="note info">${OBJ_HINT[s.obj]}</div>`);
    if (s.city !== 'other') notes.push(`<div class="note ok">Поставка, монтаж и сервис в городе ${esc(cityName(s.city))}: <a href="${L.region(s.city)}">условия доставки и выезда инженера</a>.</div>`);
    const table = specT([['Нагрузка'], ['Нагрузка', `${fmt(s.load, 1)} ${s.u === 'kw' ? 'кВт' : 'кВА'} (PF ${fmt(s.pf, 1)})`], ['Полная / активная мощность', `${fmt(R.S_load, 1)} кВА / ${fmt(R.P_load, 1)} кВт`], ['С запасом ' + s.res + ' %', `${fmt(R.S_calc, 1)} кВА / ${fmt(R.P_calc, 1)} кВт`], ['Фазность', R.ph === 3 ? '3ф 380 В' : '1ф 220 В'], ['Резервирование', RED[s.red]],
      ['Батареи'], ['Автономия', `${s.min} мин`], ['Энергия (КПД 0,94, коэффициент ' + fmt(peukert(s.min), 2) + ')', `${fmt(b.wh)} Вт·ч`], ['Напряжение шины', `${b.bus} В DC`], ['Блоков 12 В в строке', fmt(b.M)], ['Требуемая ёмкость строки', `${fmt(b.ahReq, 1)} А·ч`], ['Выбранная ёмкость блока', `${b.cap} А·ч${b.N > 1 ? ', ' + b.N + ' строки параллельно' : ''}`], ['Всего блоков', `${fmt(b.blocks)}${u === 2 ? ' × 2 ИБП = ' + fmt(b.blocks * 2) : ''}`], ['Масса (' + fmt(b.wBlock, 1) + ' кг / блок)', `≈ ${fmt(b.mass * u)} кг`], ['Батарейных шкафов', fmt(b.cabinets * u)], ['Ток разряда', `${fmt(b.I)} А`],
      ['Объект'], ['Тип объекта', OBJ[s.obj]], ['Город', esc(cityName(s.city))]]);
    return `<div class="kpis">${tiles}</div>
      <div class="box"><h3>Мощность <small>нагрузка → с запасом → номинал</small></h3>${bars(barRows)}</div>
      <div class="box"><h3>Батарейные строки <small>${b.N} ${plural(b.N, 'строка', 'строки', 'строк')} × ${b.M} блоков${u === 2 ? ', на каждый ИБП' : ''}</small></h3>${batSvg(b)}</div>
      <div class="notes">${notes.join('')}</div>
      <div class="box" style="padding:0;overflow:hidden">${table}</div>
      ${actions()}`;
  }

  function resDgu(s) {
    const tiles = kpi('Рекомендуемый ДГУ', `${fmt(R.nominal)} кВА`, `${fmt(R.kwNom)} кВт · ${s.mode === 'prp' ? 'основной PRP' : 'резервный ESP'} · ${DGU_FORM[s.form].toLowerCase()}${s.avr ? ' · с АВР' : ''}`, true)
      + kpi('Расчётная мощность', `${fmt(R.S_req, 1)} кВА`, `${fmt(s.kw)} кВт × ${fmt(R.kStart, 2)} / 0,8${s.mode === 'prp' ? ' × 1,1' : ''}${R.dAlt || R.dT ? ' + дерейтинг ' + fmt((1 / (1 - R.dAlt) / (1 - R.dT) - 1) * 100, 1) + ' %' : ''}`)
      + kpi('Загрузка в работе', `${fmt(R.loadFactor * 100)} %`, 'оптимум 50–80 % от номинала')
      + kpi('Расход топлива', `≈ ${fmt(R.fuel, 1)} л/ч`, 'при 75 % нагрузке, 0,21 л на кВт·ч')
      + kpi('Бак на ' + s.hrs + ' ч', `≈ ${fmt(R.tank)} л`, s.hrs > 12 ? 'внешний резервуар с подкачкой' : 'бак в раме установки')
      + kpi('Уровень шума', `≈ ${R.noise} дБ(А)`, s.form === 'open' ? 'в машзале, без кожуха' : 'на расстоянии 7 м');
    const barRows = [{ l: 'Нагрузка', v: s.kw / 0.8, t: fmt(s.kw / 0.8, 1) + ' кВА' }, { l: 'С пусковыми токами', v: R.S1, t: fmt(R.S1, 1) + ' кВА' }, { l: 'Режим и дерейтинг', v: R.S_req, t: fmt(R.S_req, 1) + ' кВА' }, { l: 'Номинал ДГУ', v: R.nominal, t: fmt(R.nominal) + ' кВА' }];
    const notes = [];
    if (R.loadFactor < 0.3) notes.push(`<div class="note">Установившаяся нагрузка ${fmt(R.loadFactor * 100)} % от номинала: дизель на малой нагрузке закоксовывается. Уточните долю двигательной нагрузки или рассмотрите две установки меньшей мощности.</div>`);
    if (R.overRow) notes.push(`<div class="note">Свыше 3750 кВА: электростанция из нескольких синхронизированных ДГУ, считается под проект.</div>`);
    if (s.hrs > 12) notes.push(`<div class="note info">Запас топлива на ${s.hrs} ч: нужен отдельный резервуар на ${fmt(R.tank)} л с системой подкачки и учёт требований пожарной безопасности.</div>`);
    notes.push(`<div class="note info">Если за ДГУ стоит ИБП, выбирайте ДГУ не менее 1,5 × мощности ИБП: выпрямитель ИБП нелинейный и раскачивает частоту генератора. <a href="calc.html#ibp.kw${num(s.kw)}.min15">Рассчитать ИБП на ${fmt(s.kw)} кВт</a></div>`);
    notes.push(`<div class="note ok">Пусконаладка под нагрузкой нашим нагрузочным модулем 150 кВт, акт готовности. <a href="${L.service('montazh')}">Монтаж и пусконаладка ДГУ</a></div>`);
    const table = specT([['Нагрузка'], ['Суммарная мощность', `${fmt(s.kw)} кВт`], ['Доля двигательной нагрузки', `${s.mot} % (коэффициент ${fmt(R.kStart, 2)})`], ['С пусковыми токами', `${fmt(R.P_start, 1)} кВт / ${fmt(R.S1, 1)} кВА`], ['Режим', s.mode === 'prp' ? 'основной PRP, × 1,1' : 'резервный ESP'],
      ['Условия площадки'], ['Высота', `${s.alt === 0 ? 'до 1000 м' : s.alt === 1000 ? '1000–2000 м' : 'свыше 2000 м'} (${fmt(R.dAlt * 100)} %)`], ['Температура', `до ${s.temp} °C (${fmt(R.dT * 100)} %)`], ['Исполнение', DGU_FORM[s.form]], ['АВР', s.avr ? 'да' : 'нет'],
      ['Результат'], ['Требуемая мощность', `${fmt(R.S_req, 1)} кВА`], ['Номинал ДГУ', `${fmt(R.nominal)} кВА / ${fmt(R.kwNom)} кВт`], ['Расход топлива', `≈ ${fmt(R.fuel, 1)} л/ч`], ['Объём бака на ' + s.hrs + ' ч', `≈ ${fmt(R.tank)} л`], ['Уровень шума', `≈ ${R.noise} дБ(А)`]]);
    return `<div class="kpis">${tiles}</div>
      <div class="box"><h3>Мощность <small>нагрузка → пусковые токи → условия → номинал</small></h3>${bars(barRows)}</div>
      <div class="notes">${notes.join('')}</div>
      <div class="box" style="padding:0;overflow:hidden">${table}</div>
      ${actions()}`;
  }

  function resAkb(s) {
    const b = R.bat;
    const tiles = kpi('Конфигурация батарей', `${b.N} × ${b.M} × ${b.cap} А·ч`, `${fmt(b.blocks)} ${plural(b.blocks, 'блок', 'блока', 'блоков')} 12 В AGM · шина ${b.bus} В`, true)
      + kpi('Энергия на ' + s.min + ' мин', `${fmt(b.wh / 1000, 1)} кВт·ч`, `нагрузка ${fmt(R.P, 1)} кВт при PF ${fmt(s.pf, 1)}`)
      + kpi('Ёмкость строки', `${fmt(b.ahReq, 1)} А·ч`, `округлено до ${b.cap} А·ч${b.N > 1 ? ', ' + b.N + ' строки' : ''}`)
      + kpi('Масса', `≈ ${fmt(b.mass)} кг`, `${b.cabinets} ${plural(b.cabinets, 'шкаф', 'шкафа', 'шкафов')} · ${fmt(b.wBlock, 1)} кг / блок`)
      + kpi('Ток разряда', `${fmt(b.I)} А`, `${b.N > 1 ? fmt(b.I / b.N) + ' А на строку' : 'одна строка'}`)
      + kpi('Ресурс AGM', '3–5 лет', 'long-life серии: 10–12 лет при 20–25 °C');
    const notes = [];
    if (R.cur) {
      const same = R.cur.M === b.M;
      notes.push(`<div class="cmp"><div><span>Сейчас установлено</span><b class="num">${R.cur.N} × ${R.cur.M}</b><span>${R.cur.blocks} ${plural(R.cur.blocks, 'блок', 'блока', 'блоков')}</span></div><div class="rec"><span>Расчёт на ${s.min} мин</span><b class="num">${b.N} × ${b.M} × ${b.cap} А·ч</b><span>${b.blocks} ${plural(b.blocks, 'блок', 'блока', 'блоков')}</span></div></div>`);
      if (!same) notes.push(`<div class="note">В текущей конфигурации ${R.cur.M} блоков в строке, а шина ${b.bus} В требует ${b.M}. Проверьте напряжение шины ИБП в паспорте или выберите его вручную выше.</div>`);
      else notes.push(`<div class="note info">Число блоков в строке совпадает. ${R.cur.N === b.N ? 'Замена один в один: ' + b.blocks + ' блоков по ' + b.cap + ' А·ч.' : R.cur.N > b.N ? 'Строк установлено больше расчётного: можно оставить количество и взять меньшую ёмкость или сохранить запас автономии.' : 'Для нужной автономии потребуется ' + (b.N - R.cur.N) + ' дополнительная строка и место в шкафу.'}</div>`);
    }
    if (s.min > 120) notes.push(`<div class="note">Автономия ${s.min} мин: рассмотрите ДГУ плюс ИБП на 15–30 минут. <a href="${dguLink(R.P)}">Рассчитать ДГУ на ${fmt(R.P)} кВт</a></div>`);
    notes.push(`<div class="note info">Меняется вся линейка целиком: новые блоки в паре со старыми работают на уровне старых. Старые батареи забираем на утилизацию с актом.</div>`);
    const svc = `<div class="box"><h3>Сервис AEC</h3><div class="svcl"><a href="${L.service('zamena')}"><span class="ic">${I('battery')}</span><div><b>Замена батарей ИБП</b><small>Без остановки нагрузки, утилизация старых АКБ, работы от 35 000 ₸</small></div></a><a href="${L.service('diagnostika')}"><span class="ic">${I('gauge')}</span><div><b>Диагностика Fluke VT521</b><small>Проверка каждой банки до замены: возможно, менять нужно не всё</small></div></a></div></div>`;
    const table = specT([['ИБП'], ['Мощность ИБП', `${fmt(s.kva, 1)} кВА (PF ${fmt(s.pf, 1)})`], ['Активная мощность', `${fmt(R.P, 1)} кВт`], ['Напряжение шины', `${b.bus} В DC${s.dc ? '' : ' (авто)'}`],
      ['Батареи'], ['Автономия', `${s.min} мин`], ['Энергия (КПД 0,94, коэффициент ' + fmt(peukert(s.min), 2) + ')', `${fmt(b.wh)} Вт·ч`], ['Блоков 12 В в строке', fmt(b.M)], ['Требуемая ёмкость строки', `${fmt(b.ahReq, 1)} А·ч`], ['Выбранная ёмкость', `${b.cap} А·ч, ${b.N} ${plural(b.N, 'строка', 'строки', 'строк')}`], ['Всего блоков', fmt(b.blocks)], ['Масса', `≈ ${fmt(b.mass)} кг`], ['Ток разряда', `${fmt(b.I)} А`], ['Фактическая автономия', `≈ ${fmt(b.tAct)} мин`]]);
    return `<div class="kpis">${tiles}</div>
      <div class="box"><h3>Батарейные строки <small>${b.N} ${plural(b.N, 'строка', 'строки', 'строк')} × ${b.M} блоков</small></h3>${batSvg(b)}</div>
      <div class="notes">${notes.join('')}</div>
      ${svc}
      <div class="box" style="padding:0;overflow:hidden">${table}</div>
      ${actions('Добавить батареи в запрос КП')}`;
  }

  function resStab(s) {
    const tiles = kpi('Рекомендуемый стабилизатор', `${fmt(R.nominal)} кВА`, `${R.ph === 3 ? '3ф 380 В' : '1ф 220 В'} · ${R.type.toLowerCase()}`, true)
      + kpi('Расчётная мощность', `${fmt(R.S_req, 1)} кВА`, `${fmt(R.S_load, 1)} кВА × 1,3 × ${fmt(R.kV, 1)}`)
      + kpi('Тип регулирования', R.type, R.typeWhy)
      + kpi('Вход', VIN[s.vin][0].split(' (')[0], `поправка × ${fmt(R.kV, 1)} на нижнюю границу`)
      + kpi('Точность на выходе', R.type === 'Электронный' ? '±2–3 %' : '±1 %', R.type === 'Электронный' ? 'тиристорный, без износа' : 'сервоприводный, плавная регулировка')
      + kpi('Запас по мощности', '30 %', 'плюс пусковые токи для двигателей');
    const barRows = [{ l: 'Нагрузка', v: R.S_load, t: fmt(R.S_load, 1) + ' кВА' }, { l: 'С запасом 30 %', v: R.S1, t: fmt(R.S1, 1) + ' кВА' }, { l: 'Поправка на напряжение', v: R.S_req, t: fmt(R.S_req, 1) + ' кВА' }, { l: 'Номинал', v: R.nominal, t: fmt(R.nominal) + ' кВА' }];
    const notes = [];
    if (R.ph === 1 && R.nominal > 10) notes.push(`<div class="note">Однофазные стабилизаторы в каталоге до 10 кВА. Для ${fmt(R.nominal)} кВА распределите нагрузку по фазам и используйте трёхфазную модель.</div>`);
    if (R.overRow) notes.push(`<div class="note">Свыше 3200 кВА: стабилизатор на всё здание считается под проект.</div>`);
    if (s.lt === 'motor') notes.push(`<div class="note info">Пусковые токи двигателей в 3–7 раз выше номинала: электромеханический стабилизатор выдерживает такие перегрузки, электронный уйдёт в защиту. <a href="${L.cat('stab', 'elektromehanicheskie')}">Электромеханические</a></div>`);
    if (s.lt === 'el') notes.push(`<div class="note info">Для электроники важна скорость реакции: тиристорный стабилизатор переключает отводы за полпериода. Если оборудование не должно останавливаться вовсе, нужен ИБП. <a href="calc.html#ibp.kva${num(R.S_load)}.min30">Рассчитать ИБП</a></div>`);
    if (s.lt === 'light') notes.push(`<div class="note info">Освещение и нагрев не требуют высокой точности: подойдёт электромеханическая модель с точностью ±3 %.</div>`);
    const table = specT([['Нагрузка'], ['Мощность', `${fmt(s.load, 1)} ${s.u === 'kw' ? 'кВт (PF ' + fmt(s.pf, 1) + ')' : 'кВА'}`], ['Полная мощность', `${fmt(R.S_load, 1)} кВА`], ['Фазность', R.ph === 3 ? '3ф 380 В' : '1ф 220 В'], ['Тип нагрузки', LT[s.lt]],
      ['Сеть'], ['Диапазон входного напряжения', VIN[s.vin][0]], ['Поправка на нижнюю границу', `× ${fmt(R.kV, 1)}`],
      ['Результат'], ['С запасом 30 %', `${fmt(R.S1, 1)} кВА`], ['Требуемая мощность', `${fmt(R.S_req, 1)} кВА`], ['Номинал стабилизатора', `${fmt(R.nominal)} кВА`], ['Рекомендуемый тип', R.type]]);
    return `<div class="kpis">${tiles}</div>
      <div class="box"><h3>Мощность <small>нагрузка → запас → напряжение → номинал</small></h3>${bars(barRows)}</div>
      <div class="notes">${notes.join('')}</div>
      <div class="box" style="padding:0;overflow:hidden">${table}</div>
      ${actions()}`;
  }

  /* ---------- Сводка для инженера ---------- */
  function summary() {
    const s = S[mode], url = location.origin + location.pathname + '#' + hashOf();
    const models = R.models.slice(0, 3).map(p => p.name).join(', ');
    if (mode === 'ibp') { const b = R.bat; return `Расчёт ИБП (калькулятор aecups.kz)\nНагрузка: ${fmt(s.load, 1)} ${s.u === 'kw' ? 'кВт' : 'кВА'}, PF ${fmt(s.pf, 1)} → ${fmt(R.S_load, 1)} кВА / ${fmt(R.P_load, 1)} кВт; запас ${s.res} % → ${fmt(R.S_calc, 1)} кВА / ${fmt(R.P_calc, 1)} кВт\nФазность: ${R.ph === 3 ? '3ф 380 В' : '1ф 220 В'}; резервирование: ${RED[s.red]}\nРекомендуемый номинал: ${R.modular ? fmt(R.nominal) + ' + ' + R.module + ' кВА (N+1)' : R.units === 2 ? '2 × ' + fmt(R.nominal) + ' кВА' : fmt(R.nominal) + ' кВА'}\nАвтономия ${s.min} мин: батареи ${b.N} × ${b.M} × ${b.cap} А·ч (${b.blocks * R.units} блоков 12 В), шина ${b.bus} В, масса ≈ ${fmt(b.mass * R.units)} кг, шкафов: ${b.cabinets * R.units}\nОбъект: ${OBJ[s.obj]}, ${cityName(s.city)}\nПодходящие модели: ${models}\nСсылка: ${url}`; }
    if (mode === 'dgu') return `Расчёт ДГУ (калькулятор aecups.kz)\nНагрузка: ${fmt(s.kw)} кВт, двигательная ${s.mot} % (коэффициент ${fmt(R.kStart, 2)}) → ${fmt(R.S1, 1)} кВА\nРежим: ${s.mode === 'prp' ? 'основной PRP' : 'резервный ESP'}; высота ${s.alt === 0 ? 'до 1000 м' : s.alt + ' м'}; температура до ${s.temp} °C → ${fmt(R.S_req, 1)} кВА\nРекомендуемый номинал: ${fmt(R.nominal)} кВА / ${fmt(R.kwNom)} кВт, ${DGU_FORM[s.form].toLowerCase()}, АВР: ${s.avr ? 'да' : 'нет'}\nТопливо: ≈ ${fmt(R.fuel, 1)} л/ч, бак на ${s.hrs} ч ≈ ${fmt(R.tank)} л\nПодходящие модели: ${models}\nСсылка: ${url}`;
    if (mode === 'akb') { const b = R.bat; return `Расчёт батарей для ИБП (калькулятор aecups.kz)\nИБП ${fmt(s.kva, 1)} кВА, PF ${fmt(s.pf, 1)} → ${fmt(R.P, 1)} кВт; шина ${b.bus} В DC; автономия ${s.min} мин\nКонфигурация: ${b.N} × ${b.M} × ${b.cap} А·ч (${b.blocks} блоков 12 В), масса ≈ ${fmt(b.mass)} кг, ток разряда ${fmt(b.I)} А${R.cur ? '\nСейчас установлено: ' + R.cur.N + ' × ' + R.cur.M : ''}\nМодели: ${models}\nСсылка: ${url}`; }
    return `Расчёт стабилизатора (калькулятор aecups.kz)\nНагрузка: ${fmt(R.S_load, 1)} кВА, ${R.ph === 3 ? '3ф 380 В' : '1ф 220 В'}, ${LT[s.lt].toLowerCase()}\nВход: ${VIN[s.vin][0]} → запас 30 % и поправка × ${fmt(R.kV, 1)} → ${fmt(R.S_req, 1)} кВА\nРекомендуемый номинал: ${fmt(R.nominal)} кВА, тип: ${R.type.toLowerCase()}\nПодходящие модели: ${models}\nСсылка: ${url}`;
  }
  function headline() {
    if (mode === 'ibp') return `ИБП ${R.modular ? fmt(R.nominal) + '+' + R.module : R.units === 2 ? '2 × ' + fmt(R.nominal) : fmt(R.nominal)} кВА, ${R.ph}ф, батареи ${R.bat.N} × ${R.bat.M} × ${R.bat.cap} А·ч`;
    if (mode === 'dgu') return `ДГУ ${fmt(R.nominal)} кВА, ${DGU_FORM[S.dgu.form].toLowerCase()}`;
    if (mode === 'akb') return `АКБ ${R.bat.N} × ${R.bat.M} × ${R.bat.cap} А·ч для ИБП ${fmt(S.akb.kva, 1)} кВА`;
    return `Стабилизатор ${fmt(R.nominal)} кВА, ${R.ph}ф, ${R.type.toLowerCase()}`;
  }
  function addToKp() {
    const s = S[mode], first = R.models[0];
    if (mode === 'ibp') { if (first) U.KP.add(first.id, R.units); const bp = R.bat.prod; if (bp) U.KP.add(bp.id, R.bat.blocks * R.units); if (first || bp) U.toast('В запрос КП: ' + (first ? first.model : '') + (bp ? (first ? ' + ' : '') + 'АКБ ' + bp.model + ' × ' + R.bat.blocks * R.units : ''), L.kp, 'Открыть'); return; }
    if (mode === 'akb') { const bp = R.bat.prod || first; if (bp) { U.KP.add(bp.id, R.bat.blocks); U.toast('В запрос КП: АКБ ' + bp.model + ' × ' + R.bat.blocks, L.kp, 'Открыть'); } return; }
    if (first) { U.KP.add(first.id, 1); U.toast('В запрос КП: ' + first.model, L.kp, 'Открыть'); }
  }
  function copyLink() {
    const url = location.href;
    const ok = () => U.toast('Ссылка на расчёт скопирована');
    const fallback = () => { try { const ta = document.createElement('textarea'); ta.value = url; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(ta); ta.select(); const r = document.execCommand('copy'); ta.remove(); r ? ok() : U.toast('Скопируйте адрес из строки браузера'); } catch (e) { U.toast('Скопируйте адрес из строки браузера'); } };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok).catch(fallback); else fallback(); } catch (e) { fallback(); }
  }


  /* ---------- Рендер ---------- */
  const TITLES = {
    ibp: ['Калькулятор подбора ИБП: мощность, автономия, батареи | AEC Kazakhstan', 'Расчёт мощности ИБП с запасом, количества и ёмкости батарей на нужную автономию, подходящие модели Salicru, Kehua и Tescom из каталога AEC. Проверка расчёта инженером бесплатно.'],
    dgu: ['Калькулятор подбора дизельного генератора (ДГУ) | AEC Kazakhstan', 'Расчёт номинала ДГУ с учётом пусковых токов, режима работы, высоты и температуры, расход топлива и объём бака. Подходящие модели Tescom, AGG Power и BAIFA.'],
    akb: ['Калькулятор батарей для ИБП: замена АКБ | AEC Kazakhstan', 'Расчёт количества и ёмкости батарей 12 В для замены в ИБП: блоков в строке, ёмкость, масса. Складские модели Ritar и EnerGrid, замена без остановки нагрузки.'],
    stab: ['Калькулятор подбора стабилизатора напряжения | AEC Kazakhstan', 'Расчёт мощности стабилизатора с запасом и поправкой на просадки напряжения, выбор типа регулирования. Подходящие модели Tescom, Salicru, EverExceed.']
  };
  const MOD_TITLE = { ibp: 'Подходящие ИБП из каталога', dgu: 'Подходящие дизельные генераторы', akb: 'Батареи 12 В под расчёт', stab: 'Подходящие стабилизаторы' };
  function render() {
    const s = S[mode];
    R = mode === 'ibp' ? calcIbp(s) : mode === 'dgu' ? calcDgu(s) : mode === 'akb' ? calcAkb(s) : calcStab(s);
    eff = R.eff || {};
    document.getElementById('cres').innerHTML = mode === 'ibp' ? resIbp(s) : mode === 'dgu' ? resDgu(s) : mode === 'akb' ? resAkb(s) : resStab(s);
    // модели
    const unit = mode === 'akb' ? 'А·ч' : 'кВА';
    const n = R.models.length;
    document.getElementById('modTitle').textContent = MOD_TITLE[mode];
    document.getElementById('modSub').textContent = R.near ? `Точных совпадений в диапазоне ${fmt(R.kMin)}–${fmt(R.kMax)} ${unit} нет: показаны ближайшие модели.` : `Диапазон ${fmt(R.kMin)}–${fmt(R.kMax)} ${unit}${mode === 'ibp' ? ', ' + (R.ph === 3 ? 'трёхфазные' : 'однофазные') + (R.modular ? ', модульные' : '') : mode === 'stab' ? ', ' + (R.ph === 3 ? 'трёхфазные' : 'однофазные') : mode === 'dgu' ? ', ' + DGU_FORM[s.form].toLowerCase() : ''}: ${n} ${plural(n, 'модель', 'модели', 'моделей')}. Сортировка по мощности, складские позиции отмечены.`;
    document.getElementById('modCat').href = R.catHash;
    document.getElementById('modNote').innerHTML = R.near ? `<div class="note">В каталоге нет модели точно под расчёт. Ближайшие варианты ниже, нестандартную мощность подберём под проект: <a href="${L.service('konsultaciya')}">предпроектная консультация</a>.</div>` : R.typeMiss ? `<div class="note">Моделей рекомендуемого типа (${R.type.toLowerCase()}) в этом диапазоне нет: показаны все стабилизаторы подходящей мощности.</div>` : '';
    document.getElementById('modGrid').innerHTML = n ? R.models.slice(0, 6).map(p => U.productCard(p)).join('') : `<div class="empty" style="grid-column:1/-1"><h3>Подберём под проект</h3><p>Отправьте расчёт инженеру: предложим модели и аналоги.</p></div>`;
    // сводка на мобильных
    document.getElementById('msum').innerHTML = `<div><span>Результат расчёта</span><b class="num">${esc(headline())}</b></div><button type="button" data-goto="cres">Показать</button>`;
    document.title = TITLES[mode][0]; document.querySelector('meta[name=description]').content = TITLES[mode][1];
    if (!ctaDirty) document.getElementById('cMsg').value = summary();
    U.render();
  }
  function commit() { history.replaceState(null, '', '#' + hashOf()); render(); syncForm(); }
  function setMode(m) { if (!MODES.includes(m)) m = 'ibp'; mode = m; document.querySelectorAll('#tabs button').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); }); }
  function load() { const p = parse(); setMode(p.mode); S[mode] = p.state; render(); buildForm(); syncForm(); }

  /* ---------- События ---------- */
  const form = document.getElementById('cform');
  const parseNum = el => { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : null; };
  function setVal(k, v) {
    const s = S[mode];
    if (k === 'u') { if (s.u === v) return; const pf = s.pf; s.load = Math.round((v === 'kva' ? s.load / pf : s.load * pf) * 10) / 10; s.u = v; return; }
    if (k === 'ph') { s.ph = +v; return; }
    if (k === 'dc') { s.dc = v ? +v : null; return; }
    if (k === 'cur') { s.cur = String(v).toLowerCase().replace(/[х×\*]/g, 'x').replace(/\s+/g, ''); return; }
    if (['red', 'obj', 'city', 'mode', 'form', 'vin', 'lt'].includes(k)) { s[k] = v; return; }
    const n = typeof v === 'number' ? v : parseFloat(v); if (!isFinite(n)) return;
    const lim = { load: [0.1, 5000], kw: [1, 5000], kva: [0.5, 1200], min: [5, 240] }[k];
    if (lim && (n < lim[0] || n > lim[1])) return;
    s[k] = k === 'min' ? Math.round(n) : n;
  }
  form.addEventListener('input', e => { const el = e.target; if (!el.dataset.k || el.tagName === 'SELECT') return; const v = el.type === 'text' ? el.value : parseNum(el); if (v == null) return; setVal(el.dataset.k, v); commit(); });
  form.addEventListener('change', e => { const el = e.target; if (!el.dataset.k) return; if (el.tagName === 'SELECT') { setVal(el.dataset.k, el.value); commit(); } else if (el.type === 'number') { const lim = { load: [0.1, 5000], kw: [1, 5000], kva: [0.5, 1200], min: [5, 240] }[el.dataset.k]; const v = parseNum(el); if (lim && (v == null || v < lim[0] || v > lim[1])) { el.value = S[mode][el.dataset.k]; } } });
  form.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) { setVal(b.dataset.k, b.dataset.v); commit(); return; } const a = e.target.closest('[data-auto]'); if (a) { e.preventDefault(); S[mode][a.dataset.auto] = null; commit(); } });
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); e.target.blur(); } });
  document.getElementById('tabs').addEventListener('click', e => { const b = e.target.closest('button[data-mode]'); if (!b || b.dataset.mode === mode) return; setMode(b.dataset.mode); commit(); buildForm(); syncForm(); });
  document.getElementById('cres').addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    if (b.dataset.act === 'send') U.openModal({ title: 'Проверка расчёта инженером', sub: 'Инженер AEC сверит расчёт с разрядными таблицами и перегрузочной способностью оборудования, пришлёт спецификацию в течение рабочего дня.', type: 'Проверка расчёта (калькулятор)', product: headline(), comment: summary() });
    else if (b.dataset.act === 'kp') addToKp();
    else if (b.dataset.act === 'copy') copyLink();
  });
  document.getElementById('msum').addEventListener('click', e => { if (e.target.closest('[data-goto]')) document.getElementById('cres').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  document.getElementById('cMsg').addEventListener('input', () => { ctaDirty = true; });
  window.addEventListener('hashchange', load);

  /* ---------- Статичные блоки ---------- */
  const crumbs = [{ name: 'Главная', href: L.home }, { name: 'Калькулятор подбора', href: L.calc }];
  document.getElementById('hero').innerHTML = U.crumbs(crumbs) + `<h1>Калькулятор подбора ИБП, ДГУ и батарей</h1><p class="lead">Инженерный расчёт за минуту: мощность с запасом, количество и ёмкость батарей на нужную автономию, номинал генератора или стабилизатора и подходящие модели из каталога. Расчёт бесплатно проверяет инженер AEC и присылает спецификацию с ценами.</p><div class="pts"><span>${I('check')} Методика как у наших инженеров</span><span>${I('check')} Модели и цены из каталога AEC</span><span>${I('check')} Ссылка на расчёт для коллег и тендера</span></div>`;
  document.getElementById('meth').innerHTML = [
    ['Мощность ИБП с запасом', 'Активную мощность в кВт делим на коэффициент мощности нагрузки и прибавляем запас на рост. Номинал: ближайший стандартный вверх из ряда 1, 2, 3, 6, 10, 15, 20, 30, 40, 60, 80, 100 … 1200 кВА. Для модульных систем N+1 добавляем один модуль 25 или 50 кВА.', 'S = P / PF × (1 + запас)'],
    ['Энергия батарей', 'Энергию считаем от расчётной активной мощности с запасом, делим на КПД инвертора 0,94 и на коэффициент отдачи ёмкости k: при коротком разряде батарея отдаёт меньше номинала (0,75 до 30 мин, 0,85 до 60 мин, 0,95 свыше часа).', 'E = P × t / 60 / 0,94 / k'],
    ['Батарейная строка', 'Шина постоянного тока: 48, 96 или 192 В для однофазных ИБП до 10 кВА, 480 В (±240 В) для трёхфазных и модульных. Блоков в строке: шина / 12. Ёмкость округляем вверх к ряду 7, 9, 18, 26, 40, 65, 100, 150, 200 А·ч, свыше 200 А·ч добавляем параллельные строки.', 'Блоков = U / 12; Ач = E / U'],
    ['Дизельный генератор', 'К нагрузке применяем коэффициент пусковых токов (1 + доля двигателей × 2,5), переводим в кВА при cos φ 0,8, для основного режима PRP добавляем 10 %, учитываем дерейтинг по высоте (3 % на 1000 м, 7 % на 2000 м) и температуре (4 % при 40 °C). Расход топлива около 0,21 л на кВт·ч нагрузки.', 'S = P × (1 + d × 2,5) / 0,8 / (1 − h) / (1 − t)'],
    ['Стабилизатор', 'Полную мощность нагрузки умножаем на 1,3 (запас 30 %) и на поправку по нижней границе входного напряжения: 1,2 при ±20 %, 1,4 при просадках до 150 В. Электромеханический тип для пусковых токов, электронный для чувствительной электроники.', 'S = S_нагрузки × 1,3 × k_U'],
    ['Допущения', 'Расчёт не учитывает разрядные характеристики конкретной батареи, конечное напряжение разряда и температуру помещения. Масса батарей по каталогу, иначе 0,3 кг на А·ч. Батарейный шкаф вмещает 40 блоков по 100 А·ч. Итоговую спецификацию инженер проверяет по таблицам производителя.', 'Проверка инженером: бесплатно']
  ].map(m => `<div><b>${m[0]}</b><code>${m[2]}</code><p>${m[1]}</p></div>`).join('');
  const FAQS = [
    ['Как перевести кВА в кВт?', 'Активная мощность в кВт равна полной мощности в кВА, умноженной на коэффициент мощности. Для современных ИБП с выходным PF 1,0 эти цифры совпадают: 20 кВА равны 20 кВт. Для нагрузки с PF 0,9: 20 кВА равны 18 кВт. У дизельных генераторов принят cos φ 0,8: 100 кВА равны 80 кВт. При подборе сверяйте обе величины: ИБП должен проходить и по кВА, и по кВт.'],
    ['Почему запас 25 %?', 'Нагрузка со временем растёт: добавляются серверы, станки, кондиционеры. ИБП не должен постоянно работать на 100 % номинала: это ресурс конденсаторов и вентиляторов, перегрузочная способность под пусковые токи и работа при пониженном напряжении сети. 20–30 % считается типовым инженерным запасом, для объектов с точно известной и неизменной нагрузкой достаточно 10–20 %.'],
    ['Сколько служат батареи ИБП?', 'Батареи 12 В AGM общего назначения в реальной эксплуатации работают 3–5 лет, серии long-life (Ritar RA, EnerGrid FT, BAE Secura 12V) рассчитаны на 10–12 лет при 20–25 °C. Элементы 2 В OPzV и OPzS служат 15–20 лет. Каждые 10 °C выше 25 °C сокращают ресурс примерно вдвое, поэтому батарейное помещение должно быть с кондиционированием, а диагностика проводиться раз в полгода.'],
    ['Что делать, если нагрузка вырастет?', 'Модульные ИБП Salicru SLC ADAPT2, Kehua MR33 и Tescom MTW наращиваются добавлением силовых модулей по 25–50 кВА без замены системы. Моноблочные серии допускают параллельную работу до 4–6 единиц, батарейные шкафы добавляются по мере роста автономии. Если рост нагрузки прогнозируется в ближайшие 2–3 года, закладывайте его в запас сразу: это дешевле, чем менять ИБП.']
  ];
  document.getElementById('faq').innerHTML = FAQS.map(q => `<details><summary>${q[0]}<span class="pm">${I('plus')}</span></summary><div class="acc-body">${q[1]}</div></details>`).join('');
  document.getElementById('seo').innerHTML = `<h2>Расчёт мощности ИБП и генератора: что учесть</h2>
<p>Подбор источника бесперебойного питания начинается с нагрузки. Сложите активную мощность всего оборудования, которое должно работать при пропадании сети, в кВт, переведите в кВА через коэффициент мощности и добавьте запас 20–30 % на рост и пусковые токи. По этой цифре выбирается номинал ИБП из стандартного ряда, а фазность определяется мощностью: до 10 кВА, как правило, однофазные стоечные и напольные модели, от 10 кВА трёхфазные с внешними батарейными шкафами. Калькулятор выше делает этот расчёт автоматически и сразу показывает модели Salicru, Kehua и Tescom из каталога AEC.</p>
<h3>Автономия и батареи</h3>
<p>Второй параметр: время работы от батарей. Для объектов с дизельным генератором достаточно 10–15 минут, чтобы ДГУ запустился и принял нагрузку. Без генератора закладывают 30–60 минут на корректное завершение работы или переключение на резервный канал. Количество блоков в батарейной строке задаёт напряжение шины ИБП, а ёмкость считается из энергии, которую нужно отдать за это время с учётом КПД инвертора и того, что при коротком разряде батарея отдаёт меньше номинальной ёмкости. Автономия свыше двух часов на батареях редко оправдана: дешевле и надёжнее связка ДГУ плюс ИБП на 15–30 минут.</p>
<h3>Дизельный генератор и стабилизатор</h3>
<p>Мощность ДГУ выбирается с учётом пусковых токов электродвигателей, режима работы (резервный или основной), высоты площадки над уровнем моря и температуры воздуха, при которых дизель теряет мощность. Если генератор питает ИБП, его номинал берут не менее чем в полтора раза выше мощности ИБП. Стабилизатор напряжения подбирают по полной мощности с запасом 30 % и поправкой на глубину просадок на вводе: при 150 В вместо 220 В выходная мощность стабилизатора падает, и номинал нужно увеличить. Для станков и компрессоров выбирают электромеханические модели, для электроники и медицины электронные. Любой расчёт из калькулятора инженер AEC проверяет бесплатно и присылает спецификацию с ценами и сроками поставки.</p>`;
  document.getElementById('ctaContacts').innerHTML = `<span style="display:flex;gap:10px;align-items:center"><span style="color:var(--amber);display:flex">${I('phone')}</span><a href="tel:+${C.phoneRaw}" style="color:#fff;font-family:var(--font-display);font-size:20px;font-weight:600">${C.phone}</a></span><span style="display:flex;gap:10px;align-items:center"><span style="color:var(--amber);display:flex">${I('mail')}</span><a href="mailto:${C.email}" style="color:#d7e3f0">${C.email}</a></span><span style="display:flex;gap:10px;align-items:center"><span style="color:var(--amber);display:flex">${I('ruler')}</span><a href="${L.service('konsultaciya')}" style="color:#d7e3f0">Предпроектная консультация и подбор: бесплатно</a></span>`;
  U.jsonld({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: new URL(it.href, location.href).href })) },
    { '@type': 'WebApplication', name: 'Калькулятор подбора ИБП, ДГУ и батарей', applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', url: new URL(L.calc, location.href).href, offers: { '@type': 'Offer', price: '0', priceCurrency: 'KZT' }, provider: { '@id': 'https://aecups.kz/#org' } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(q => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) }
  ] });
  load();
})();
