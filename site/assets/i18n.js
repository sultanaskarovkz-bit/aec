/* AEC Kazakhstan — переключение языков RU / KZ / EN.
   Словари в assets/i18n-kz.js и assets/i18n-en.js (window.AEC_I18N.kz / .en): русская строка -> перевод.
   Перевод применяется к текстовым узлам и атрибутам после рендера страницы и при каждом изменении DOM.
   Строки с числами сопоставляются по шаблону (числа заменяются на #), поэтому «233 моделей» переводится при любом числе.
   Язык хранится в localStorage (aecLang); переключение перезагружает страницу. */
(function () {
  const LANGS = { ru: { code: 'ru', label: 'RU', name: 'Русский' }, kz: { code: 'kk', label: 'KZ', name: 'Қазақша' }, en: { code: 'en', label: 'EN', name: 'English' } };
  let lang = 'ru';
  try { lang = localStorage.getItem('aecLang') || 'ru'; } catch (e) {}
  if (!LANGS[lang]) lang = 'ru';
  const url = new URL(location.href);
  if (url.searchParams.get('lang') && LANGS[url.searchParams.get('lang')]) { lang = url.searchParams.get('lang'); try { localStorage.setItem('aecLang', lang); } catch (e) {} }
  document.documentElement.lang = LANGS[lang].code;
  window.AEC_LANG = lang;

  // Словарь нужного языка подключается здесь же (document.write), движок стартует после его загрузки
  if (lang !== 'ru' && !(window.AEC_I18N && window.AEC_I18N[lang])) {
    // словарь берёт ту же метку версии, что и i18n.js, чтобы после обновления сайта браузер не показывал старые переводы из кэша
    const ver = ((document.currentScript && document.currentScript.src || '').match(/\?v=\w+/) || [''])[0];
    document.write('<script src="assets/i18n-' + lang + '.js' + ver + '"><\/script><script>window.AEC_I18N_START && window.AEC_I18N_START()<\/script>');
  }
  window.AEC_I18N_START = function () {
  const dict = (window.AEC_I18N && window.AEC_I18N[lang]) || null;
  const NUM = /\d+(?:[.,]\d+)?/g;
  const tpl = {};   // шаблонный индекс: «# моделей» -> перевод с #
  if (dict) {
    for (const k in dict) {
      const nums = k.match(NUM); if (!nums) continue;
      let t = dict[k], ok = true;
      // в английском переводе дробная часть пишется через точку: «37,5 кВА» -> «37.5 kVA», шаблон это учитывает
      for (const n of nums) { if (t.indexOf(n) >= 0) t = t.replace(n, '\u0000'); else if (n.indexOf(',') > 0 && t.indexOf(n.replace(',', '.')) >= 0) t = t.replace(n.replace(',', '.'), '\u0001'); else { ok = false; break; } }
      if (ok) tpl[k.replace(NUM, '#')] = t;
    }
  }
  // Названия товаров из каталога (602 позиции, в построчном словаре их нет): тип товара переводится, модель и параметры сохраняются.
  // Перевод применяется, только если после замены в названии не осталось незнакомых русских слов; иначе название остаётся как есть.
  const UNITS_EN = [[/ в комплекте с АКБ/g, ' with batteries'], [/, со встроенными АКБ/g, ', built-in batteries'], [/, для внешних АКБ/g, ', for external batteries'], [/, вертикальное исполнение/g, ', tower'],
    [/ серии ([^\s,]+)/g, ' $1 series'], [/ с двигателем ([^\s,]+)/g, ' with $1 engine'], [/ \(вертикальное исполнение\)/g, ' (tower)'], [/от ([\d.,]+) до ([\d.,]+)/g, '$1–$2'],
    [/кВА/g, 'kVA'], [/кВт/g, 'kW'], [/ВА/g, 'VA'], [/А·ч/g, 'Ah'], [/(\d) В(?![А-Яа-яЁё])/g, '$1 V'], [/(\d) А(?![А-Яа-яЁё])/g, '$1 A'], [/(\d)ф(?![А-Яа-яЁё])/g, '$1-ph']];
  const UNITS_KZ = [[/А·ч/g, 'А·сағ'],[/ в комплекте с АКБ/g, ' АКБ жинағымен'], [/, со встроенными АКБ/g, ', кірістірілген АКБ'], [/, для внешних АКБ/g, ', сыртқы АКБ үшін'], [/, вертикальное исполнение/g, ', тік нұсқа'],
    [/ серии ([^\s,]+)/g, ' $1 сериялы'], [/ с двигателем ([^\s,]+)/g, ' $1 қозғалтқышымен'], [/ \(вертикальное исполнение\)/g, ' (тік нұсқа)'], [/от ([\d.,]+) до ([\d.,]+)/g, '$1–$2']];
  const PN = {
    en: { first: true, rest: UNITS_EN, ok: /(?!)/g, heads: [['Трехфазный стабилизатор напряжения', 'Three-phase voltage stabiliser'], ['Однофазный стабилизатор напряжения', 'Single-phase voltage stabiliser'],
      ['Стабилизатор напряжения', 'Voltage stabiliser'], ['Статический переключатель нагрузки', 'Static transfer switch'], ['Аккумуляторная батарея', 'Battery'], ['Дизельный генератор', 'Diesel generator'], ['ИБП', 'UPS']] },
    kz: { first: false, rest: UNITS_KZ, ok: /кВА|кВт|ВА|А·сағ|АКБ|жинағымен|кірістірілген|сыртқы|үшін|тік нұсқа|сериялы|қозғалтқышымен|(\d) [ВА](?![А-Яа-яЁё·])/g, heads: [['Трехфазный стабилизатор напряжения', 'үш фазалы кернеу тұрақтандырғышы'],
      ['Однофазный стабилизатор напряжения', 'бір фазалы кернеу тұрақтандырғышы'], ['Стабилизатор напряжения', 'кернеу тұрақтандырғышы'], ['Статический переключатель нагрузки', 'жүктеменің статикалық ауыстырып-қосқышы'],
      ['Аккумуляторная батарея', 'аккумуляторлық батареясы'], ['Дизельный генератор', 'дизельді генераторы'], ['ИБП', 'ҮҚК']] }
  }[lang];
  function trName(key) {
    if (!PN) return null;
    const h = PN.heads.find(x => key.indexOf(x[0] + ' ') === 0); if (!h) return null;
    let rest = key.slice(h[0].length + 1);
    for (const r of PN.rest) rest = rest.replace(r[0], r[1]);
    if (/[А-Яа-яЁё]/.test(rest.replace(PN.ok, ''))) return null;
    if (PN.first) return h[1] + ' ' + rest;
    const i = rest.indexOf(', '); return i < 0 ? rest + ' ' + h[1] : rest.slice(0, i) + ' ' + h[1] + rest.slice(i);
  }
  // Строки, собранные из шаблона и переменной части (модель, название документа, номер фото): шаблон переводится, переменная часть
  // переводится тем же tr() или остаётся как есть, если в ней нет русских слов.
  const PFX = {
    en: [[/^Скачать (.+)$/, 'Download $1'], [/^Запросить КП на (.+)$/, 'Request a quotation for $1'], [/^Другие модели серии (.+)$/, 'Other $1 series models'],
      [/^КП на оборудование (.+)$/, 'Quotation for $1 equipment'], [/^Запрос КП \(бренд (.+)\)$/, 'Quotation request ($1)'], [/^(.+), фото (\d+)$/, '$1, photo $2'], [/^(.+) \| (AEC(?: Kazakhstan)?)$/, '$1 | $2']],
    kz: [[/^Скачать (.+)$/, '$1 жүктеу'], [/^Запросить КП на (.+)$/, '$1 үшін КҰ сұрау'], [/^Другие модели серии (.+)$/, '$1 сериясының басқа модельдері'],
      [/^КП на оборудование (.+)$/, '$1 жабдығына КҰ'], [/^Запрос КП \(бренд (.+)\)$/, 'КҰ сұрау ($1)'], [/^(.+), фото (\d+)$/, '$1, $2-фото'], [/^(.+) \| (AEC(?: Kazakhstan)?)$/, '$1 | $2']]
  }[lang];
  function trPfx(key, depth) {
    if (!PFX || depth > 2) return null;
    for (const r of PFX) {
      const m = key.match(r[0]); if (!m) continue;
      const parts = m.slice(1).map(g => /[А-Яа-яЁё]/.test(g) ? tr(g, depth + 1) : g);
      if (parts.some(x => x == null)) return null;
      return r[1].replace(/\$(\d)/g, (_, i) => parts[i - 1]);
    }
    return null;
  }
  function tr(s, depth) {
    if (!dict) return null;
    const key = s.replace(/\s+/g, ' ').trim();
    if (!key || !/[А-Яа-яЁё]/.test(key)) return null;
    if (dict[key]) return dict[key];
    const nums = key.match(NUM);
    if (nums) { const t = tpl[key.replace(NUM, '#')]; if (t) { let i = 0; return t.replace(/[\u0000\u0001]/g, c => { const n = nums[i++]; return c === '\u0001' ? n.replace(',', '.') : n; }); } }
    return trName(key) || trPfx(key, depth || 0);
  }
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt', 'data-title', 'data-sub', 'data-type', 'content'];
  function translateNode(node) {
    if (node.nodeType === 3) {
      const v = node.nodeValue; const t = tr(v);
      if (t && t !== v) { const m = v.match(/^(\s*)[\s\S]*?(\s*)$/); node.nodeValue = m[1] + t + m[2]; }
      return;
    }
    if (node.nodeType !== 1) return;
    if (node.matches('script, style, noscript, .no-i18n')) return;
    for (const a of ATTRS) { if (node.hasAttribute(a)) { const v = node.getAttribute(a); const t = tr(v); if (t && t !== v) node.setAttribute(a, t); } }
    if ((node.tagName === 'INPUT' && /^(submit|button)$/i.test(node.type)) || node.tagName === 'OPTION') { const t = tr(node.value); if (t) node.value = t; }
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: n => n.nodeType === 1 && n.matches('script, style, noscript, .no-i18n') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let n; while ((n = w.nextNode())) {
      if (n.nodeType === 3) { const v = n.nodeValue; const t = tr(v); if (t && t !== v) { const m = v.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue = m[1] + t + m[2]; } }
      else { for (const a of ATTRS) { if (n.hasAttribute(a)) { const v = n.getAttribute(a); const t = tr(v); if (t && t !== v) n.setAttribute(a, t); } } if ((n.tagName === 'INPUT' && /^(submit|button)$/i.test(n.type)) || n.tagName === 'OPTION') { const t = tr(n.value); if (t) n.value = t; } }
    }
  }
  function translateTitle() { const t = tr(document.title); if (t && t !== document.title) document.title = t; }

  // Переключатель языка
  function switcher(cls) {
    return `<div class="lang${cls ? ' ' + cls : ''}" role="group" aria-label="Язык">${Object.keys(LANGS).map(k => `<a href="?lang=${k}" rel="nofollow" data-lang="${k}" class="${k === lang ? 'on' : ''}" lang="${LANGS[k].code}" title="${LANGS[k].name}">${LANGS[k].label}</a>`).join('')}</div>`;
  }
  window.AEC_I18N_UI = { lang, switcher, tr };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-lang]'); if (!a) return;
    e.preventDefault(); try { localStorage.setItem('aecLang', a.dataset.lang); } catch (err) {}
    const u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.pathname + u.search + u.hash; location.reload();
  });

  if (lang === 'ru') return;
  const apply = () => { translateNode(document.body); translateTitle(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  let pending = false;
  const mo = new MutationObserver(muts => {
    if (pending) return; pending = true;
    requestAnimationFrame(() => { pending = false; for (const m of muts) { if (m.type === 'childList') m.addedNodes.forEach(translateNode); else if (m.type === 'characterData') translateNode(m.target); else if (m.type === 'attributes') translateNode(m.target); } translateTitle(); });
  });
  mo.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };
  if (lang === 'ru') window.AEC_I18N_START();
})();
