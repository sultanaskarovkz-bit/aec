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
    document.write('<script src="assets/i18n-' + lang + '.js"><\/script><script>window.AEC_I18N_START && window.AEC_I18N_START()<\/script>');
  }
  window.AEC_I18N_START = function () {
  const dict = (window.AEC_I18N && window.AEC_I18N[lang]) || null;
  const NUM = /\d+(?:[.,]\d+)?/g;
  const tpl = {};   // шаблонный индекс: «# моделей» -> перевод с #
  if (dict) {
    for (const k in dict) {
      const nums = k.match(NUM); if (!nums) continue;
      let t = dict[k], ok = true;
      for (const n of nums) { if (t.indexOf(n) < 0) { ok = false; break; } t = t.replace(n, '\u0000'); }
      if (ok) tpl[k.replace(NUM, '#')] = t;
    }
  }
  function tr(s) {
    if (!dict) return null;
    const key = s.replace(/\s+/g, ' ').trim();
    if (!key || !/[А-Яа-яЁё]/.test(key)) return null;
    if (dict[key]) return dict[key];
    const nums = key.match(NUM);
    if (nums) { const t = tpl[key.replace(NUM, '#')]; if (t) { let i = 0; return t.replace(/\u0000/g, () => nums[i++]); } }
    return null;
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
    return `<div class="lang${cls ? ' ' + cls : ''}" role="group" aria-label="Язык">${Object.keys(LANGS).map(k => `<a href="?lang=${k}" data-lang="${k}" class="${k === lang ? 'on' : ''}" lang="${LANGS[k].code}" title="${LANGS[k].name}">${LANGS[k].label}</a>`).join('')}</div>`;
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
