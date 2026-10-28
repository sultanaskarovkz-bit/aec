/* AEC Kazakhstan — общий слой прототипа: иконки, иллюстрации, шапка/подвал, запрос КП, сравнение, избранное, формы, поиск */
window.AECUI = (function () {
  const D = window.AEC;
  const C = D.CONTACT;

  // ---------- Иконки (stroke) ----------
  const I = {
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    wa: '<path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 7.9 19.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.5-1.5-2-1-1 1a4 4 0 0 1-2.5-2.5l1-1-1-2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    kp: '<path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 13h8M8 17h5"/>',
    compare: '<path d="M9 3v18M15 3v18"/><path d="M3 8h6M15 8h6M3 16h6M15 16h6"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 8a4.5 4.5 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/>',
    mail: '<path d="M3 5h18v14H3z"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    youtube: '<path d="M3 8.5c0-1.4 1-2.4 2.4-2.5C7.6 5.8 10 5.8 12 5.8s4.4 0 6.6.2C20 6.1 21 7.1 21 8.5v7c0 1.4-1 2.4-2.4 2.5-2.2.2-4.6.2-6.6.2s-4.4 0-6.6-.2C4 17.9 3 16.9 3 15.5z"/><path d="m10 9 5 3-5 3z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    // категории
    ups: '<rect x="5" y="2" width="14" height="20" rx="1.5"/><path d="M8 6h8M8 9h8"/><path d="m13 12-3 4h4l-3 4"/>',
    genset: '<rect x="2" y="8" width="20" height="10" rx="1.5"/><path d="M6 8V5h5v3M2 13h20M6 18v2M18 18v2"/><circle cx="16" cy="13" r="2"/>',
    battery: '<rect x="3" y="7" width="16" height="10" rx="1.5"/><path d="M19 10h2v4h-2M7 12h4M9 10v4M14 12h2"/>',
    stab: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M6 14c2-5 4 5 6 0s4 5 6 0"/>',
    sts: '<path d="M3 12h5M16 12h5"/><path d="m8 12 6-4M8 12l6 4"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/>',
    rect: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M6 10c1.5-3 3 3 4.5 0M13 10h5M13 14h5M6 15h4"/>',
    inv: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M6 10h4M6 13h4M13 13c1.5-3 3 3 4.5 0"/>',
    freq: '<path d="M2 12c2-6 4 6 6 0s4 6 6 0 4 6 6 0"/><path d="M4 20h16"/>',
    trafo: '<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
    ips: '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="M12 8v8M8 12h8"/>',
    // отрасли
    server: '<rect x="3" y="3" width="18" height="7" rx="1.5"/><rect x="3" y="14" width="18" height="7" rx="1.5"/><path d="M7 6.5h.01M7 17.5h.01"/>',
    med: '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="M12 9v6M9 12h6"/>',
    factory: '<path d="M3 21V10l5 3V10l5 3V10l5 3v8"/><path d="M3 21h18M16 6V3h3v7"/>',
    oil: '<path d="M6 21 10 5h4l4 16"/><path d="M7.5 15h9M9 10h6M3 21h18"/>',
    building: '<rect x="4" y="3" width="16" height="18"/><path d="M8 7h3M13 7h3M8 11h3M13 11h3M8 15h3M13 15h3M10 21v-3h4v3"/>',
    cnc: '<rect x="3" y="12" width="18" height="8"/><path d="M12 4v8M8 4h8M9 12V9h6v3"/>',
    alarm: '<path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
    antenna: '<path d="M12 22V9"/><circle cx="12" cy="7" r="2"/><path d="M7 4a7 7 0 0 1 10 0M5 2a10 10 0 0 1 14 0M8.5 10.5a5 5 0 0 1 7 0"/>',
    // услуги
    wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L9.3 21.7a2 2 0 0 1-2.8-2.8L16.9 8.5"/><path d="M14.7 6.3 18 3l3 3-3.3 3.3"/>',
    shield: '<path d="M12 3 4 7v5c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7z"/><path d="m9 12 2 2 4-4"/>',
    repair: '<path d="M4 20 20 4"/><path d="M14 4h6v6M4 14v6h6"/>',
    gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16 16 9"/><path d="M3 20h18"/>',
    ruler: '<path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    warehouse: '<path d="M3 21V9l9-5 9 5v12"/><path d="M3 21h18M7 21v-6h10v6M10 15v6"/>',
    team: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0M15 20a5 5 0 0 1 6-4.5"/>',
    doc: '<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8 14-2 7 6-3 6 3-2-7"/>'
  };
  function icon(name, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[name] || I.bolt) + '</svg>'; }

  // ---------- Иллюстрации оборудования (схематичные, единый стиль) ----------
  const N = '#0a2540', B = '#0066cc', A = '#d97706', L = '#cbd5e1', M = '#e2e8f0';
  const ART = {
    rack: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="14" y="62" width="172" height="34" rx="3" fill="#fff" stroke="${N}" stroke-width="2"/><rect x="14" y="104" width="172" height="34" rx="3" fill="#fff" stroke="${N}" stroke-width="2"/><g fill="${L}"><rect x="40" y="70" width="60" height="18" rx="2"/><rect x="40" y="112" width="60" height="18" rx="2"/></g><g fill="${N}"><rect x="42" y="73" width="18" height="12" rx="1"/><rect x="42" y="115" width="18" height="12" rx="1"/></g><g fill="${B}"><rect x="110" y="72" width="54" height="14" rx="1"/><rect x="110" y="114" width="54" height="14" rx="1"/></g><g fill="${A}"><circle cx="172" cy="79" r="3"/><circle cx="172" cy="121" r="3"/></g><g stroke="${N}" stroke-width="2"><circle cx="24" cy="79" r="3"/><circle cx="24" cy="121" r="3"/><circle cx="176" cy="121" r="0"/></g><text x="100" y="156" text-anchor="middle" font-family="Golos Text, Arial" font-size="10" fill="${N}">19" Rack / Tower · 2U</text></svg>`,
    tower: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="52" y="18" width="96" height="164" rx="5" fill="#fff" stroke="${N}" stroke-width="2.2"/><rect x="64" y="30" width="72" height="44" rx="3" fill="${N}"/><rect x="70" y="36" width="40" height="8" rx="1" fill="${B}"/><rect x="70" y="50" width="60" height="4" rx="1" fill="${L}"/><rect x="70" y="60" width="44" height="4" rx="1" fill="${L}"/><circle cx="126" cy="40" r="3" fill="${A}"/><g stroke="${M}" stroke-width="2"><path d="M64 90h72M64 100h72M64 110h72M64 120h72M64 130h72M64 140h72M64 150h72M64 160h72"/></g><rect x="60" y="182" width="12" height="6" fill="${N}"/><rect x="128" y="182" width="12" height="6" fill="${N}"/></svg>`,
    modular: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="40" y="10" width="120" height="180" rx="4" fill="#fff" stroke="${N}" stroke-width="2.2"/><rect x="50" y="18" width="100" height="26" rx="2" fill="${N}"/><rect x="56" y="24" width="52" height="6" rx="1" fill="${B}"/><rect x="56" y="33" width="36" height="4" rx="1" fill="${L}"/><circle cx="140" cy="31" r="3.5" fill="${A}"/>${[52, 78, 104, 130].map((y, i) => `<g><rect x="50" y="${y}" width="100" height="22" rx="2" fill="${i === 3 ? M : '#fff'}" stroke="${N}" stroke-width="1.6"/><rect x="56" y="${y + 6}" width="8" height="10" rx="1" fill="${N}"/><rect x="68" y="${y + 8}" width="30" height="6" rx="1" fill="${L}"/><circle cx="138" cy="${y + 11}" r="2.6" fill="${i === 3 ? L : '#15803d'}"/><text x="104" y="${y + 15}" font-family="Golos Text, Arial" font-size="7" fill="${N}">${i === 3 ? 'слот' : '50 кВА'}</text></g>`).join('')}<rect x="50" y="156" width="100" height="26" rx="2" fill="${M}"/><text x="100" y="172" text-anchor="middle" font-family="Golos Text, Arial" font-size="8" fill="${N}">байпас / распред. блок</text></svg>`,
    genset: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="12" y="60" width="176" height="90" rx="6" fill="#fff" stroke="${N}" stroke-width="2.2"/><rect x="30" y="40" width="60" height="20" rx="3" fill="#fff" stroke="${N}" stroke-width="2"/><rect x="38" y="24" width="10" height="16" rx="2" fill="${N}"/><g stroke="${M}" stroke-width="3"><path d="M20 76h50M20 86h50M20 96h50M20 106h50M20 116h50M20 126h50M20 136h50"/></g><rect x="88" y="72" width="60" height="66" rx="3" fill="${N}"/><rect x="96" y="80" width="44" height="22" rx="2" fill="${B}"/><rect x="96" y="108" width="30" height="5" rx="1" fill="${L}"/><rect x="96" y="118" width="22" height="5" rx="1" fill="${L}"/><circle cx="166" cy="104" r="14" fill="#fff" stroke="${N}" stroke-width="2"/><path d="M160 104h12M166 98v12" stroke="${A}" stroke-width="2.4"/><rect x="24" y="150" width="20" height="10" fill="${N}"/><rect x="156" y="150" width="20" height="10" fill="${N}"/></svg>`,
    container: () => `<svg viewBox="0 0 200 200" fill="none"><path d="M12 150V66l24-14h152v84z" fill="#fff" stroke="${N}" stroke-width="2.2"/><path d="M12 66h152v84M164 66l24-14" stroke="${N}" stroke-width="2.2"/><g stroke="${M}" stroke-width="2.4"><path d="M24 74v68M36 74v68M48 74v68M60 74v68M72 74v68M84 74v68"/></g><rect x="96" y="80" width="52" height="56" rx="2" fill="${N}"/><rect x="102" y="86" width="40" height="20" rx="2" fill="${B}"/><rect x="102" y="112" width="28" height="4" rx="1" fill="${L}"/><circle cx="138" cy="124" r="3" fill="${A}"/><rect x="152" y="96" width="8" height="24" rx="1" fill="${L}"/><rect x="16" y="150" width="16" height="8" fill="${N}"/><rect x="146" y="150" width="16" height="8" fill="${N}"/><text x="88" y="164" text-anchor="middle" font-family="Golos Text, Arial" font-size="9" fill="${N}">20' контейнер · АВР · IP54</text></svg>`,
    battery: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="30" y="64" width="140" height="94" rx="6" fill="#fff" stroke="${N}" stroke-width="2.2"/><rect x="30" y="64" width="140" height="22" rx="6" fill="${N}"/><rect x="54" y="48" width="18" height="16" rx="2" fill="${A}"/><rect x="128" y="48" width="18" height="16" rx="2" fill="${N}"/><text x="63" y="60" text-anchor="middle" font-family="Golos Text, Arial" font-size="10" font-weight="700" fill="#fff">+</text><text x="137" y="60" text-anchor="middle" font-family="Golos Text, Arial" font-size="10" font-weight="700" fill="#fff">−</text><rect x="44" y="98" width="112" height="44" rx="3" fill="${M}"/><text x="100" y="116" text-anchor="middle" font-family="Geologica, Golos Text, Arial" font-size="14" font-weight="600" fill="${N}">12 V · AGM</text><text x="100" y="132" text-anchor="middle" font-family="Golos Text, Arial" font-size="9" fill="${N}">VRLA · 10–12 лет</text></svg>`,
    cell: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="60" y="34" width="80" height="150" rx="5" fill="#fff" stroke="${N}" stroke-width="2.2"/><rect x="60" y="34" width="80" height="16" rx="5" fill="${N}"/><rect x="76" y="18" width="14" height="16" rx="2" fill="${A}"/><rect x="110" y="18" width="14" height="16" rx="2" fill="${N}"/><g fill="${L}">${[0, 1, 2, 3, 4, 5].map(i => `<rect x="${68 + i * 11}" y="60" width="6" height="110" rx="1"/>`).join('')}</g><rect x="60" y="150" width="80" height="34" rx="3" fill="${M}" fill-opacity=".6"/><text x="100" y="196" text-anchor="middle" font-family="Golos Text, Arial" font-size="9" fill="${N}">2 V · OPzV / OPzS</text></svg>`,
    stab: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="48" y="20" width="104" height="160" rx="5" fill="#fff" stroke="${N}" stroke-width="2.2"/><circle cx="100" cy="66" r="28" fill="#fff" stroke="${N}" stroke-width="2"/><path d="M78 74a24 24 0 0 1 44 0" stroke="${M}" stroke-width="5"/><path d="M84 72a18 18 0 0 1 20-14" stroke="${B}" stroke-width="5"/><path d="M100 66l10-12" stroke="${A}" stroke-width="2.4"/><circle cx="100" cy="66" r="3" fill="${N}"/><text x="100" y="104" text-anchor="middle" font-family="Geologica, Golos Text, Arial" font-size="11" font-weight="600" fill="${N}">400 V ±1 %</text><g stroke="${M}" stroke-width="2"><path d="M60 118h80M60 128h80M60 138h80M60 148h80M60 158h80"/></g><circle cx="136" cy="32" r="3" fill="#15803d"/></svg>`,
    sts: () => `<svg viewBox="0 0 200 200" fill="none"><rect x="14" y="70" width="172" height="60" rx="4" fill="#fff" stroke="${N}" stroke-width="2.2"/><circle cx="30" cy="100" r="4" stroke="${N}" stroke-width="2"/><circle cx="170" cy="100" r="4" stroke="${N}" stroke-width="2"/><rect x="48" y="82" width="104" height="36" rx="2" fill="${N}"/><text x="62" y="98" font-family="Golos Text, Arial" font-size="8" fill="#fff">Источник 1</text><text x="62" y="110" font-family="Golos Text, Arial" font-size="8" fill="#fff">Источник 2</text><circle cx="130" cy="94" r="3" fill="#15803d"/><circle cx="130" cy="106" r="3" fill="${L}"/><path d="M140 100h8" stroke="${A}" stroke-width="2.4"/><text x="100" y="152" text-anchor="middle" font-family="Golos Text, Arial" font-size="10" fill="${N}">переключение &lt; 4 мс</text></svg>`
  };
  function art(key) { return (ART[key] || ART.tower)(); }
  // Фото с сайта клиента: assets/img/<slot>. Пока файл не скачан, показывается аккуратный плейсхолдер с подписью.
  const PH_SVG = (label, mode) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3edf8"/><stop offset="1" stop-color="#cfdcea"/></linearGradient><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="rgba(10,37,64,.08)"/></pattern></defs><rect width="800" height="600" fill="url(#g)"/><rect width="800" height="600" fill="url(#p)"/>${mode === 'bg' ? '' : `<g transform="translate(400 270)"><rect x="-26" y="-34" width="52" height="68" rx="4" fill="none" stroke="#0066cc" stroke-width="3"/><path d="M4-20l-14 22h12l-6 18 16-24h-12z" fill="#0066cc"/></g><text x="400" y="360" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#0a2540">${label.replace(/[<>&]/g, '')}</text><text x="400" y="388" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#64748b">фото с aecups.kz · подставится автоматически</text>`}</svg>`);
  // Точка фокуса для фото, которые показываются с обрезкой (object-fit: cover): лица и оборудование остаются в кадре
  const FOCUS = { 'hero-service.jpg': '50% 22%', 'svc-dmitry.jpg': '50% 42%', 'service-montazh.jpg': '50% 50%', 'proj-airastana-1.jpg': '50% 30%', 'proj-airastana-4.jpg': '50% 45%', 'proj-airastana-5.jpg': '50% 50%', 'proj-uralsk-1.jpg': '50% 50%', 'proj-uralsk-2.jpg': '50% 50%', 'proj-uralsk-3.jpg': '50% 40%', 'proj-uralsk-4.jpg': '50% 55%', 'proj-tv-1.jpg': '50% 55%', 'proj-tv-4.jpg': '50% 60%', 'post-tv.jpg': '50% 60%', 'post-airastana.jpg': '50% 45%', 'post-electronica2025.jpg': '50% 45%', 'exh-electronica2025-1.jpg': '50% 40%', 'exh-electronica2025-3.jpg': '50% 45%', 'exh-kihe2025-6.jpg': '50% 30%', 'exh-powerexpo2024-6.jpg': '50% 45%', 'ind-telecom.jpg': '50% 45%', 'ind-gov.jpg': '50% 50%', 'blog-stab-dom.jpg': '50% 50%' };
  // Вертикальные фото: рамки, которые подстраиваются под ориентацию, показывают их целиком
  const PORTRAIT = new Set(['blog-chto-takoe-ibp.jpg', 'blog-kioge-1.jpg', 'blog-kioge-2.jpg', 'blog-kioge-3.jpg', 'blog-kioge-cover.jpg', 'blog-stab-dom.jpg', 'exh-electronica2025-1.jpg', 'exh-electronica2025-2.jpg', 'exh-electronica2025-3.jpg', 'exh-kihe2025-6.jpg', 'exh-powerexpo2024-6.jpg', 'hero-service.jpg', 'ind-gov.jpg', 'ind-telecom.jpg', 'post-airastana.jpg', 'post-electronica2025.jpg', 'post-ktz.jpg', 'post-tv.jpg', 'post-uralsk.jpg', 'proj-airastana-1.jpg', 'proj-airastana-4.jpg', 'proj-airastana-5.jpg', 'proj-ktz-5.jpg', 'proj-lab-2.jpg', 'proj-tv-1.jpg', 'proj-tv-2.jpg', 'proj-tv-3.jpg', 'proj-tv-4.jpg', 'proj-uralsk-1.jpg', 'proj-uralsk-2.jpg', 'proj-uralsk-3.jpg', 'proj-uralsk-4.jpg', 'service-montazh.jpg', 'svc-dmitry.jpg']);
  function img(slot, alt, cls, extra) {
    alt = alt || slot; extra = extra || '';
    if (FOCUS[slot]) extra = extra.indexOf('style="') >= 0 ? extra.replace('style="', 'style="object-position:' + FOCUS[slot] + ';') : extra + ' style="object-position:' + FOCUS[slot] + '"';
    return `<img class="${cls || ''}" src="assets/img/${slot}" alt="${alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async" ${extra} onerror="this.onerror=null;this.classList.add('ph');this.src=AECUI.ph(this.alt,this.dataset.ph)">`;
  }
  // Иллюстрация в шапке страницы: горизонтальная рамка 4:3, для вертикальных фото 3:4
  function heroArt(slot, alt) { return `<div class="hero-art${PORTRAIT.has(slot) ? ' portrait' : ''}">${img(slot, alt, '', 'data-ph="bg"')}</div>`; }
  function bg(slot) { return `style="background-image:url('assets/img/${slot}')"`; }

  // ---------- Ссылки прототипа ----------
  const L_ = {
    home: 'index.html',
    cat: (id, sub) => 'catalog.html#' + id + (sub ? '.' + sub : ''),
    product: slug => 'product.html#' + slug,
    solution: id => 'solution.html#' + id,
    service: id => 'service.html#' + id,
    projects: 'projects.html', project: id => 'project.html#' + id,
    brands: 'brands.html', brand: id => 'brand.html#' + id,
    about: 'about.html', contacts: 'contacts.html', blog: 'blog.html', article: i => 'article.html#' + i,
    faq: 'faq.html', docs: 'docs.html', calc: 'calc.html', kp: 'kp.html', compare: 'compare.html', fav: 'favorites.html',
    search: 'search.html', thanks: 'thanks.html', region: slug => 'region.html#' + slug, certs: 'about.html#certs', exhibitions: 'about.html#exhibitions',
    policy: 'legal.html#policy', terms: 'legal.html#terms', offer: 'legal.html#offer', warranty: 'legal.html#warranty'
  };

  // ---------- Хранилище (per-viewer, best-effort) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem('aec.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('aec.' + k, JSON.stringify(v)); } catch (e) { } }
  };
  const KP = {
    items() { return store.get('kp', []); },
    add(id, qty) { const it = this.items(); const f = it.find(x => x.id === id); if (f) f.q += (qty || 1); else it.push({ id, q: qty || 1 }); store.set('kp', it); render(); toast('Добавлено в запрос КП', L_.kp, 'Открыть список'); },
    setQty(id, q) { let it = this.items(); it = it.map(x => x.id === id ? { id, q: Math.max(1, q) } : x); store.set('kp', it); render(); },
    remove(id) { store.set('kp', this.items().filter(x => x.id !== id)); render(); },
    clear() { store.set('kp', []); render(); },
    count() { return this.items().reduce((s, x) => s + x.q, 0); }
  };
  const CMP = {
    items() { return store.get('cmp', []); },
    toggle(id) { let it = this.items(); if (it.includes(id)) { it = it.filter(x => x !== id); toast('Убрано из сравнения'); } else { const p = D.byId(id); const other = it.map(D.byId).find(x => x && x.cat !== p.cat); if (other) { toast('Сравнивать можно товары одной категории'); return; } if (it.length >= 4) { toast('В сравнении максимум 4 товара'); return; } it.push(id); toast('Добавлено в сравнение', L_.compare, 'Сравнить'); } store.set('cmp', it); render(); },
    has(id) { return this.items().includes(id); }
  };
  const FAV = {
    items() { return store.get('fav', []); },
    toggle(id) { let it = this.items(); if (it.includes(id)) it = it.filter(x => x !== id); else { it.push(id); toast('Сохранено в избранное', L_.fav, 'Открыть'); } store.set('fav', it); render(); },
    has(id) { return this.items().includes(id); }
  };

  // ---------- Тост ----------
  let toastT;
  function toast(msg, href, label) {
    let t = document.querySelector('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.innerHTML = icon('check') + '<span>' + msg + '</span>' + (href ? '<a href="' + href + '">' + label + '</a>' : '');
    t.querySelector('svg').style.cssText = 'width:18px;height:18px;flex:none;color:#7ddc9a';
    t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }

  // ---------- Шапка ----------
  function header(active) {
    const cats = D.CATEGORIES.map(c => `<a href="${L_.cat(c.id)}"><span class="ic">${icon(c.img)}</span><span><b>${c.name}</b><small>${c.range}${c.soon ? ', по запросу' : ''}</small></span></a>`).join('');
    const inds = D.INDUSTRIES.map(i => `<a href="${L_.solution(i.id)}">${i.name}</a>`).join('');
    const svcs = D.SERVICES.map(s => `<a href="${L_.service(s.id)}">${s.short}</a>`).join('');
    const top = `<div class="topline"><div class="wrap"><div><span><a href="mailto:${C.email}">${C.email}</a></span><span>${C.hours}</span></div><div>${window.AEC_I18N_UI ? window.AEC_I18N_UI.switcher() : ''}<span><a href="${L_.docs}">Проектировщикам</a></span><span><a href="${L_.docs}">Документация</a></span><span><a href="${L_.certs}">Сертификаты</a></span><span><a href="${L_.contacts}">Контакты</a></span></div></div></div>`;
    const h = `<header class="header" id="hdr"><div class="wrap">
      <a class="logo" href="${L_.home}" aria-label="AEC Kazakhstan, на главную"><img class="logo-img" src="assets/img/logo.png" alt="AEC Kazakhstan" onerror="this.onerror=null;this.parentNode.classList.add('nologo');this.remove()"><span class="logo-txt">AEC<small>Almaty Electro Consult</small></span></a>
      <nav class="nav" aria-label="Главное меню">
        <div class="has-mega"><a href="${L_.cat('ibp')}" class="${active === 'catalog' ? 'active' : ''}">Продукция ${icon('chev')}</a>
          <div class="mega"><div><h5>Оборудование</h5><div class="mega-cats">${cats}</div></div>
          <div><h5>Бренды</h5><div class="mega-list">${D.BRANDS.slice(0, 8).map(b => `<a href="${L_.brand(b.id)}">${b.name}</a>`).join('')}<a href="${L_.brands}">Все бренды</a></div></div>
          <div><div class="mega-promo"><b>Подбор оборудования</b><p>Мощность, время автономии, количество батарей и подходящие серии.</p><a class="btn btn-sm btn-light" href="${L_.calc}">Открыть калькулятор</a></div></div></div></div>
        <div class="has-mega"><a href="${L_.solution('czod')}" class="${active === 'solutions' ? 'active' : ''}">Решения ${icon('chev')}</a>
          <div class="mega narrow"><div><h5>По отраслям</h5><div class="mega-list">${inds}</div></div><div><h5>По задаче</h5><div class="mega-list"><a href="${L_.cat('ibp', 'modulnye')}">Модульные ИБП для ЦОД</a><a href="${L_.cat('dgu')}">Резервная генерация</a><a href="${L_.cat('akb')}">Замена аккумуляторов</a><a href="${L_.cat('stab')}">Стабилизация напряжения</a><a href="${L_.cat('sts')}">Переключение вводов (STS)</a><a href="${L_.calc}">Расчёт автономии</a></div></div><div><div class="mega-promo"><b>Типовые схемы</b><p>Схемы резервирования N+1, 2N, параллельная работа ДГУ и ИБП, однолинейные схемы.</p><a class="btn btn-sm btn-light" href="${L_.docs}">Документация</a></div></div></div></div>
        <div class="has-mega"><a href="${L_.service('montazh')}" class="${active === 'services' ? 'active' : ''}">Сервис ${icon('chev')}</a><div class="mega narrow"><div><h5>Услуги</h5><div class="mega-list">${svcs}</div></div><div><h5>Поддержка</h5><div class="mega-list"><a href="${L_.docs}">Инструкции и паспорта</a><a href="${L_.faq}">Вопросы и ответы</a><a href="${L_.warranty}">Гарантия и возврат</a></div></div><div><div class="mega-promo"><b>Сервисная служба</b><p>Выезд инженера по Алматы в день обращения, по Казахстану по графику. Нагрузочный модуль 150 кВт.</p><a class="btn btn-sm btn-light" href="${C.whatsapp}" target="_blank" rel="noopener">Написать в WhatsApp</a></div></div></div></div>
        <a href="${L_.projects}" class="${active === 'projects' ? 'active' : ''}">Проекты</a>
        <div class="has-mega"><a href="${L_.about}" class="${active === 'company' ? 'active' : ''}">Компания ${icon('chev')}</a><div class="mega list"><div><h5>AEC Kazakhstan</h5><div class="mega-list"><a href="${L_.about}">О компании</a><a href="${L_.certs}">Сертификаты и письма</a><a href="${L_.brands}">Партнёры и бренды</a><a href="${L_.exhibitions}">Выставки</a></div></div><div><h5>Материалы</h5><div class="mega-list"><a href="${L_.blog}">Статьи</a><a href="${L_.docs}">Документация</a><a href="${L_.faq}">Вопросы и ответы</a><a href="${L_.contacts}">Контакты</a></div></div><div><div class="mega-promo"><b>Офис и склад в Алматы</b><p>${C.address}</p><a class="btn btn-sm btn-light" href="${L_.contacts}">Как добраться</a></div></div></div></div>
      </nav>
      <div class="hdr-actions">
        <a class="search-btn" href="${L_.search}" aria-label="Поиск по каталогу">${icon('search')}<span>Поиск по модели или артикулу</span></a>
        <div class="hdr-phone"><a href="tel:+${C.phoneRaw}">${C.phone}</a><small>Отдел продаж</small></div>
        <a class="btn btn-kp" href="${L_.kp}">${icon('kp')}<span>Запрос КП</span><i class="kp-count" data-n="0"></i></a>
        <button class="btn-icon burger" aria-label="Меню" data-open-menu>${icon('menu')}</button>
      </div></div></header>`;
    const mm = `<div class="mmenu" id="mmenu" aria-hidden="true"><div class="mmenu-head"><a class="logo" href="${L_.home}"><img class="logo-img" src="assets/img/logo.png" alt="AEC Kazakhstan" onerror="this.onerror=null;this.parentNode.classList.add('nologo');this.remove()"><span class="logo-txt">AEC</span></a>${window.AEC_I18N_UI ? window.AEC_I18N_UI.switcher('lang-m') : ''}<button class="btn-icon" data-close-menu aria-label="Закрыть">${icon('close')}</button></div>
      <details open><summary>Продукция ${icon('chev')}</summary>${D.CATEGORIES.map(c => `<a href="${L_.cat(c.id)}">${c.name} <small class="muted">${c.range}</small></a>`).join('')}</details>
      <details><summary>Решения по отраслям ${icon('chev')}</summary>${inds}</details>
      <details><summary>Сервис ${icon('chev')}</summary>${svcs}</details>
      <a href="${L_.calc}">Подбор оборудования</a><a href="${L_.projects}">Проекты</a><a href="${L_.brands}">Бренды</a><a href="${L_.about}">О компании</a><a href="${L_.docs}">Документация</a><a href="${L_.blog}">Статьи</a><a href="${L_.contacts}">Контакты</a>
      <div class="mmenu-contacts"><a class="btn btn-primary" href="tel:+${C.phoneRaw}">${icon('phone')} ${C.phone}</a><a class="btn btn-wa" href="${C.whatsapp}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a><p class="small muted">${C.address}<br>${C.hours}</p></div></div>`;
    const bar = `<div class="mbar"><a class="btn btn-ghost" href="tel:+${C.phoneRaw}">${icon('phone')} Позвонить</a><a class="btn btn-wa" href="${C.whatsapp}" target="_blank" rel="noopener">${icon('wa')} WhatsApp</a><a class="btn btn-kp" href="${L_.kp}">${icon('kp')} Запрос КП <i class="kp-count" data-n="0"></i></a></div>`;
    return top + h + mm + bar;
  }

  function footer() {
    const y = new Date().getFullYear();
    return `<footer class="footer"><div class="wrap"><div class="footer-grid">
      <div><a class="logo" href="${L_.home}"><img class="logo-img" src="assets/img/logo.png" alt="AEC Kazakhstan" onerror="this.onerror=null;this.parentNode.classList.add('nologo');this.remove()"><span class="logo-txt">AEC<small>Almaty Electro Consult</small></span></a>
        <p style="margin-top:16px;max-width:36ch">Поставка, монтаж и сервис систем гарантированного электропитания в Казахстане с 2021 года. Офис и склад в Алматы.</p>
        <div class="regions">${D.CITIES.map(c => `<a href="${L_.region(c.slug)}">${c.name}</a>`).join('')}</div></div>
      <div><h5>Продукция</h5><ul>${D.CATEGORIES.slice(0, 6).map(c => `<li><a href="${L_.cat(c.id)}">${c.name}</a></li>`).join('')}<li><a href="${L_.calc}">Калькулятор подбора</a></li></ul></div>
      <div><h5>Услуги</h5><ul>${D.SERVICES.map(s => `<li><a href="${L_.service(s.id)}">${s.short}</a></li>`).join('')}</ul></div>
      <div><h5>Компания</h5><ul><li><a href="${L_.about}">О компании</a></li><li><a href="${L_.projects}">Проекты</a></li><li><a href="${L_.brands}">Бренды</a></li><li><a href="${L_.certs}">Сертификаты</a></li><li><a href="${L_.docs}">Документация</a></li><li><a href="${L_.blog}">Блог</a></li><li><a href="${L_.faq}">Вопросы и ответы</a></li><li><a href="${L_.contacts}">Контакты</a></li></ul></div>
      <div><h5>Контакты</h5><ul><li><a href="tel:+${C.phoneRaw}" style="font-family:var(--font-display);font-size:18px;font-weight:600;color:var(--navy)">${C.phone}</a></li><li><a href="mailto:${C.email}">${C.email}</a></li><li>${C.address}</li><li>${C.hours}</li><li style="display:flex;gap:8px;margin-top:6px"><a class="btn-icon" style="background:#fff;border-color:var(--line);color:var(--navy)" href="${C.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('wa')}</a><a class="btn-icon" style="background:#fff;border-color:var(--line);color:var(--navy)" href="${C.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${icon('youtube')}</a><a class="btn-icon" style="background:#fff;border-color:var(--line);color:var(--navy)" href="${C.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a><a class="btn-icon" style="background:#fff;border-color:var(--line);color:var(--navy)" href="${C.twogis}" target="_blank" rel="noopener" aria-label="2GIS">${icon('pin')}</a></li></ul></div>
    </div><div class="footer-bottom"><div>© ${y} ${C.legal}, БИН ${C.bin}</div><div style="display:flex;gap:16px;flex-wrap:wrap"><a href="${L_.policy}">Политика конфиденциальности</a><a href="${L_.terms}">Пользовательское соглашение</a><a href="${L_.offer}">Публичная оферта</a><a href="${L_.warranty}">Гарантии и возврат</a></div></div></div></footer>
    <div class="proto-note">Прототип нового сайта aecups.kz. Фотографии подставятся из медиатеки текущего сайта; данные каталога демонстрационные.</div>
    <div class="overlay" data-overlay></div>`;
  }

  // ---------- Модалка заявки ----------
  function modalHTML() {
    return `<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><div class="modal-box"><button class="btn-icon x" data-close-modal aria-label="Закрыть">${icon('close')}</button>
      <h3 id="mTitle">Запросить коммерческое предложение</h3><p class="muted small" id="mSub">Ответим в течение рабочего дня. Для складских позиций сразу укажем цену и срок.</p>
      <form class="form-grid" id="mForm" novalidate style="margin-top:18px">
        <input type="hidden" name="product" id="mProduct"><input type="hidden" name="formType" id="mType" value="Запрос КП">
        <div class="field"><label for="mName">Имя <i>*</i></label><input class="input" id="mName" name="name" required autocomplete="name"><span class="hint"></span></div>
        <div class="field"><label for="mPhone">Телефон <i>*</i></label><input class="input" id="mPhone" name="phone" required inputmode="tel" placeholder="+7 (___) ___-__-__" data-mask><span class="hint"></span></div>
        <div class="field"><label for="mCompany">Компания</label><input class="input" id="mCompany" name="company" autocomplete="organization"></div>
        <div class="field"><label for="mEmail">E-mail</label><input class="input" id="mEmail" name="email" type="email" autocomplete="email"><span class="hint"></span></div>
        <div class="field full"><label for="mQty">Количество и комментарий</label><textarea class="textarea" id="mQty" name="comment" style="min-height:72px" placeholder="Например: 2 шт., автономия 30 минут, нужен монтаж в Атырау"></textarea></div>
        <div class="field full"><label>Файл (ТЗ, спецификация, схема)</label><div class="file-drop">Перетащите файл или <label for="mFile" style="color:var(--blue);cursor:pointer;font-weight:500">выберите</label> · PDF, DOCX, XLSX, DWG, JPG до 20 МБ<input type="file" id="mFile" class="sr"></div></div>
        <label class="check full"><input type="checkbox" id="mConsent" required><span>Согласен на обработку персональных данных согласно <a href="${L_.policy}">политике конфиденциальности</a></span></label>
        <div class="full"><button class="btn btn-kp btn-lg btn-block" type="submit">Отправить запрос</button></div>
        <p class="small muted full">Заявка уйдёт на e-mail отдела продаж и в WhatsApp/Telegram менеджера. Дубликат попадёт в журнал заявок в админ-панели.</p>
      </form></div></div>`;
  }
  function openModal(opts) {
    opts = opts || {};
    const m = document.getElementById('modal'); if (!m) return;
    document.getElementById('mTitle').textContent = opts.title || 'Запросить коммерческое предложение';
    document.getElementById('mSub').textContent = opts.sub || 'Ответим в течение рабочего дня. Для складских позиций сразу укажем цену и срок.';
    document.getElementById('mProduct').value = opts.product || '';
    document.getElementById('mType').value = opts.type || 'Запрос КП';
    const q = document.getElementById('mQty'); if (opts.comment) q.value = opts.comment;
    m.classList.add('open'); setTimeout(() => document.getElementById('mName').focus(), 50);
  }
  function closeModal() { const m = document.getElementById('modal'); if (m) m.classList.remove('open'); }

  // ---------- Маска телефона и валидация ----------
  function mask(el) {
    el.addEventListener('input', () => {
      let d = el.value.replace(/\D/g, ''); if (d.startsWith('8')) d = '7' + d.slice(1); if (!d.startsWith('7')) d = '7' + d; d = d.slice(0, 11);
      let out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4); if (d.length >= 4) out += ') ' + d.slice(4, 7); if (d.length >= 7) out += '-' + d.slice(7, 9); if (d.length >= 9) out += '-' + d.slice(9, 11);
      el.value = out;
    });
    el.addEventListener('focus', () => { if (!el.value) el.value = '+7 ('; });
    el.addEventListener('blur', () => { if (el.value === '+7 (') el.value = ''; });
  }
  function validate(form) {
    let ok = true;
    form.querySelectorAll('.field').forEach(f => f.classList.remove('err'));
    form.querySelectorAll('[required]').forEach(inp => {
      const f = inp.closest('.field'); const hint = f ? f.querySelector('.hint') : null;
      let bad = false, msg = '';
      if (inp.type === 'checkbox') { bad = !inp.checked; }
      else if (inp.hasAttribute('data-mask')) { bad = inp.value.replace(/\D/g, '').length !== 11; msg = 'Введите номер полностью: +7 (XXX) XXX-XX-XX'; }
      else { bad = !inp.value.trim(); msg = 'Заполните поле'; }
      if (inp.type === 'email' && inp.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value)) { bad = true; msg = 'Проверьте адрес e-mail'; }
      if (bad) { ok = false; if (f) { f.classList.add('err'); if (hint) hint.textContent = msg; } else { inp.focus(); } }
    });
    const em = form.querySelector('input[type=email]'); if (em && em.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value)) { ok = false; const f = em.closest('.field'); if (f) { f.classList.add('err'); f.querySelector('.hint').textContent = 'Проверьте адрес e-mail'; } }
    return ok;
  }
  function bindForm(form, onOk) {
    form.querySelectorAll('[data-mask]').forEach(mask);
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate(form)) return;
      const data = Object.fromEntries(new FormData(form).entries());
      data.page = location.pathname.split('/').pop() + location.hash; data.utm = 'utm_source=google&utm_medium=cpc (пример)'; data.time = new Date().toLocaleString('ru-RU');
      store.set('lastLead', data);
      if (onOk) onOk(data); else location.href = L_.thanks;
    });
  }

  // ---------- Поиск с исправлением раскладки и транслитом ----------
  const LAYOUT = { q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з', '[': 'х', ']': 'ъ', a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э', z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю' };
  const LAYOUT_R = Object.fromEntries(Object.entries(LAYOUT).map(([k, v]) => [v, k]));
  const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  const SYN = { ибп: 'ибп ups ибп', бесперебойник: 'ибп', упс: 'ибп', дгу: 'дгу генератор', дэс: 'дгу генератор', акб: 'акб аккумулятор батарея', кехуа: 'kehua', саликру: 'salicru', тескома: 'tescom', теском: 'tescom', хоппеке: 'hoppecke', ритар: 'ritar', бае: 'bae' };
  function variants(q) {
    q = q.toLowerCase().trim(); const v = new Set([q]);
    v.add(q.split('').map(ch => LAYOUT[ch] || ch).join('')); v.add(q.split('').map(ch => LAYOUT_R[ch] || ch).join(''));
    v.add(q.split('').map(ch => TR[ch] != null ? TR[ch] : ch).join(''));
    q.split(/\s+/).forEach(w => { if (SYN[w]) SYN[w].split(' ').forEach(s => v.add(s)); });
    return [...v].filter(Boolean);
  }
  function search(q) {
    const vs = variants(q); if (!q.trim()) return { products: [], pages: [], fixed: null };
    const hay = p => (p.name + ' ' + p.series + ' ' + p.brand + ' ' + p.sku + ' ' + p.cat + ' ' + (p.kva || '')).toLowerCase();
    const terms = vs.flatMap(v => v.split(/\s+/)).filter(t => t.length > 1);
    const score = p => { const h = hay(p); let s = 0; terms.forEach(t => { if (h.includes(t)) s += t.length; }); return s; };
    const products = D.PRODUCTS.map(p => ({ p, s: score(p) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 24).map(x => x.p);
    const pages = [];
    const pageIdx = [...D.CATEGORIES.map(c => ({ t: c.name + ' ' + c.full, href: L_.cat(c.id), type: 'Категория' })), ...D.INDUSTRIES.map(i => ({ t: i.name + ' ' + i.h1, href: L_.solution(i.id), type: 'Решение' })), ...D.SERVICES.map(s => ({ t: s.name, href: L_.service(s.id), type: 'Услуга' })), ...D.ARTICLES.map((a, i) => ({ t: a.title, href: L_.article(i), type: 'Статья' })), ...D.BRANDS.map(b => ({ t: b.name + ' ' + b.type, href: L_.brand(b.id), type: 'Бренд' }))];
    pageIdx.forEach(pg => { const h = pg.t.toLowerCase(); if (terms.some(t => h.includes(t))) pages.push(pg); });
    const fixed = vs.find(v => v !== q.toLowerCase() && D.PRODUCTS.some(p => hay(p).includes(v.split(/\s+/)[0])) && !D.PRODUCTS.some(p => hay(p).includes(q.toLowerCase().split(/\s+/)[0])));
    return { products, pages: pages.slice(0, 8), fixed: fixed || null };
  }

  // Фото серии с сайта клиента, иначе схематичная иллюстрация
  function pphoto(p, cls) { const ph = p.photo ? 'products/' + p.photo : (D.SERIES_PHOTOS && D.SERIES_PHOTOS[p.series]); return ph ? `<img class="pphoto ${cls || ''}" src="assets/img/${ph}" alt="${p.name.replace(/"/g, '&quot;')}" loading="lazy" onerror="this.onerror=null;this.outerHTML=AECUI.art('${p.img}')">` : art(p.img); }
  // Мощность: у серий ДГУ диапазон kva–kvaMax
  function powerTxt(p) { return p.kvaMax ? `${p.kva}–${p.kvaMax} кВА` : `${p.kva} кВА / ${p.kw} кВт`; }
  // ---------- Карточка товара (общая) ----------
  function productCard(p, list) {
    const u = D.unit(p.cat);
    const st = p.stock === 'in' ? '<span class="stock stock-in">В наличии в Алматы</span>' : p.stock === 'eol' ? '<span class="stock stock-eol">Снят с производства</span>' : '<span class="stock stock-order">Под заказ, ' + p.lead + '</span>';
    const specs = p.cat === 'akb' ? [['Ёмкость', p.kva + ' А·ч'], ['Напряжение', p.form], ['Технология', (p.topology || '').split(' ')[0]], ['Срок службы', p.spec['Срок службы (проектный)'] || '']]
      : p.cat === 'dgu' ? [['Мощность', powerTxt(p)], ['Двигатель', p.spec['Двигатель'] || ''], ['Исполнение', p.form], ['АВР', 'опция']]
        : p.cat === 'sts' ? [['Ток', p.kva + ' А'], ['Фазы', p.phases], ['Переключение', '< 4 мс'], ['Исполнение', p.form]]
          : p.cat === 'stab' ? [['Мощность', p.kva + ' кВА'], ['Фазы', p.phases], ['Тип', (p.topology || '').split(' ')[0]], ['Точность', p.spec['Точность стабилизации'] || '']]
            : [['Мощность', p.kva + ' кВА / ' + p.kw + ' кВт'], ['Фазы', p.phases], ['Исполнение', p.form], ['Топология', (p.topology || '').replace(/\s*\(.*\)/, '') || p.battery]];
    return `<article class="pcard${list ? ' list' : ''}" data-id="${p.id}">
      <button class="fav${FAV.has(p.id) ? ' on' : ''}" data-fav="${p.id}" aria-label="В избранное">${icon('heart')}</button>
      <a class="pimg" href="${L_.product(p.slug)}" aria-hidden="true" tabindex="-1">${pphoto(p)}</a>
      <div class="pbody"><div class="brand">${p.brand} · ${p.series}</div><h3><a href="${L_.product(p.slug)}">${p.name}</a></h3>
        <div class="specs">${specs.map(s => `<div><span>${s[0]}</span><b title="${String(s[1] || '').replace(/"/g, '&quot;')}">${s[1] && String(s[1]).trim() ? s[1] : '—'}</b></div>`).join('')}</div>
        <div class="pfoot"><div class="pmeta">${st}<div class="price">${D.fmtPrice(p.price)}</div></div>
        <div class="pact"><button class="btn btn-sm btn-primary" data-quote="${p.id}">Запросить цену</button><button class="btn-icon" title="В запрос КП" data-kp="${p.id}" aria-label="В запрос КП">${icon('kp')}</button><button class="btn-icon${CMP.has(p.id) ? ' on' : ''}" title="Сравнить" data-cmp="${p.id}" aria-label="Сравнить">${icon('compare')}</button></div></div></div></article>`;
  }

  // ---------- Рендер счётчиков и делегирование ----------
  function render() {
    const n = KP.count(); document.querySelectorAll('.kp-count').forEach(e => { e.dataset.n = n; e.textContent = n || ''; });
    document.querySelectorAll('[data-cmp]').forEach(b => b.classList.toggle('on', CMP.has(b.dataset.cmp)));
    document.querySelectorAll('[data-fav]').forEach(b => b.classList.toggle('on', FAV.has(b.dataset.fav)));
    document.dispatchEvent(new CustomEvent('aec:render'));
  }
  function init(opts) {
    opts = opts || {};
    const root = document.getElementById('app') || document.body;
    root.insertAdjacentHTML('afterbegin', header(opts.active));
    root.insertAdjacentHTML('beforeend', footer() + modalHTML());
    bindForm(document.getElementById('mForm'));
    // sticky
    const hdr = document.getElementById('hdr');
    const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 24); onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    // menu
    const mm = document.getElementById('mmenu');
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-open-menu],[data-close-menu],[data-close-modal],[data-quote],[data-kp],[data-cmp],[data-fav],[data-overlay],[data-open-kp]');
      if (!t) return;
      if (t.hasAttribute('data-open-menu')) { mm.classList.add('open'); document.body.classList.add('menu-open'); }
      if (t.hasAttribute('data-close-menu')) { mm.classList.remove('open'); document.body.classList.remove('menu-open'); }
      if (t.hasAttribute('data-close-modal') || t.hasAttribute('data-overlay')) { closeModal(); document.querySelectorAll('.drawer.open').forEach(d => d.classList.remove('open')); document.querySelector('[data-overlay]').classList.remove('open'); }
      if (t.hasAttribute('data-quote')) { const p = D.byId(t.dataset.quote); openModal({ product: p ? p.name : '', title: 'Запросить цену: ' + (p ? p.model : ''), sub: p ? p.name + ' · ' + (p.stock === 'in' ? 'в наличии в Алматы' : 'срок поставки ' + p.lead) : '' }); }
      if (t.hasAttribute('data-kp')) KP.add(t.dataset.kp, 1);
      if (t.hasAttribute('data-cmp')) CMP.toggle(t.dataset.cmp);
      if (t.hasAttribute('data-fav')) FAV.toggle(t.dataset.fav);
    });
    document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', () => openModal({ title: b.dataset.title, type: b.dataset.type, product: b.dataset.product, sub: b.dataset.sub })));
    document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); mm.classList.remove('open'); document.body.classList.remove('menu-open'); } });
    // reveal + counters
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
      document.querySelectorAll('.reveal').forEach(el => io.observe(el));
      const co = new IntersectionObserver(es => es.forEach(en => { if (!en.isIntersecting) return; co.unobserve(en.target); const el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1100; const step = t => { const k = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - k, 3))); el.textContent = v.toLocaleString('ru-RU') + suf; if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }));
      document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
    } else { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); document.querySelectorAll('[data-count]').forEach(el => el.textContent = (+el.dataset.count).toLocaleString('ru-RU') + (el.dataset.suffix || '')); }
    document.querySelectorAll('form[data-lead]').forEach(f => bindForm(f));
    render();
  }

  function crumbs(items) { return '<nav class="crumbs" aria-label="Хлебные крошки"><ol>' + items.map((it, i) => '<li>' + (it.href && i < items.length - 1 ? `<a href="${it.href}">${it.name}</a>` : `<span>${it.name}</span>`) + '</li>').join('') + '</ol></nav>'; }
  function jsonld(obj) { const s = document.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(obj); document.head.appendChild(s); }
  function hashParts() { return location.hash.replace(/^#/, '').split('.').filter(Boolean); }
  function fmtDate(iso) { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }

  return { icon, art, img, heroArt, bg, pphoto, powerTxt, ph: PH_SVG, L: L_, KP, CMP, FAV, store, toast, openModal, closeModal, bindForm, mask, search, variants, productCard, render, init, crumbs, jsonld, hashParts, fmtDate, header, footer };
})();
