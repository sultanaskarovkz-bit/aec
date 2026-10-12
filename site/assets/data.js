/* AEC Kazakhstan — данные прототипа. Модели и серии взяты с текущего сайта aecups.kz;
   часть характеристик демонстрационная и уточняется по datasheet производителя. */
window.AEC = (function () {
  const CONTACT = {
    phone: '+7 706 651 16 01',
    phoneRaw: '77066511601',
    email: 'info@aecups.kz',
    address: 'г. Алматы, ул. Чаплина 71/66, БЦ «Станица», 4 этаж, офис А01',
    hours: 'Пн–Пт 9:00–18:00',
    whatsapp: 'https://api.whatsapp.com/send/?phone=77066511601&text=' + encodeURIComponent('Здравствуйте! Пишу с сайта aecups.kz.'),
    instagram: 'https://www.instagram.com/aec_kazakhstan/',
    youtube: 'https://www.youtube.com/@AEC_Kazakhstan',
    twogis: 'https://2gis.kz/almaty/firm/70000001060760363',
    bin: '211240034245',
    legal: 'ТОО «AEC Kazakhstan» (Almaty Electro Consult)'
  };

  const CATEGORIES = [
    { id: 'ibp', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/', name: 'ИБП', full: 'Источники бесперебойного питания', range: '1–3600 кВА', min: 1, max: 3600, unit: 'кВА', img: 'ups', count: 217,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные', hint: '1–10 кВА, серверные и кабинеты' },
        { id: 'tryohfaznye', name: 'Трёхфазные', hint: '10–1200 кВА' },
        { id: 'modulnye', name: 'Модульные', hint: 'горячая замена, N+1' },
        { id: 'stoechnye', name: 'Стоечные (Rack)', hint: '19" 2U–6U' },
        { id: 'batarejnye-shkafy', name: 'Батарейные шкафы и модули', hint: '' },
        { id: 'aksessuary', name: 'Аксессуары', hint: 'SNMP-карты, байпасы, датчики' }
      ] },
    { id: 'dgu', slug: 'product-category/generatory-2/', name: 'Дизельные генераторы', full: 'Дизельные генераторные установки (ДГУ)', range: '10–4000 кВА', min: 10, max: 4000, unit: 'кВА', img: 'genset', count: 22,
      subs: [
        { id: 'otkrytye', name: 'Открытого исполнения', hint: 'для машзалов' },
        { id: 'v-kozhuhe', name: 'В шумозащитном кожухе', hint: '≤ 72 дБ(А)' },
        { id: 'v-kontejnere', name: 'В контейнере', hint: 'всепогодные, с АВР' },
        { id: 'avr', name: 'АВР и панели управления', hint: '' }
      ] },
    { id: 'akb', slug: 'product-category/akb/', name: 'Аккумуляторные батареи', full: 'Стационарные аккумуляторные батареи', range: '5–3250 А·ч', min: 5, max: 3250, unit: 'А·ч', img: 'battery', count: 176,
      subs: [
        { id: '12v', name: '12 В AGM / GEL', hint: 'для ИБП до 200 кВА' },
        { id: '2v', name: '2 В OPzV / OPzS', hint: 'срок службы 15–20 лет' },
        { id: 'li-ion', name: 'Литий-ионные', hint: 'LiFePO4' },
        { id: 'stellazhi', name: 'Стеллажи и шкафы', hint: '' }
      ] },
    { id: 'stab', slug: 'product-category/stabilizatory/', name: 'Стабилизаторы напряжения', full: 'Стабилизаторы напряжения', range: '1–8000 кВА', min: 1, max: 8000, unit: 'кВА', img: 'stab', count: 124,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные', hint: '220 В' },
        { id: 'tryohfaznye', name: 'Трёхфазные', hint: '380 В' },
        { id: 'elektromehanicheskie', name: 'Электромеханические', hint: 'высокая перегрузочная способность' },
        { id: 'elektronnye', name: 'Электронные (тиристорные)', hint: 'без износа' }
      ] },
    { id: 'sts', slug: 'product-category/staticheskie-pereklyuchateli-sts/', name: 'Статические переключатели (STS)', full: 'Статические переключатели нагрузки', range: '100–1250 А', min: 100, max: 1250, unit: 'А', img: 'sts', count: 30,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные (STS2000)', hint: '' },
        { id: 'tryohfaznye', name: 'Трёхфазные (STS3000 / STS4000)', hint: '3- и 4-полюсные' }
      ] },
    { id: 'zvu', slug: 'product-category/zvu-sopt/', name: 'Выпрямители и ЗВУ (СОПТ)', full: 'Выпрямители и зарядно-выпрямительные устройства', range: '12–220 В DC', img: 'rect', count: 0, soon: true, subs: [] },
    { id: 'inv', slug: 'product-category/invertory/', name: 'Инверторы', full: 'Инверторы DC/AC', range: '6–3500 кВт', img: 'inv', count: 0, soon: true, subs: [] },
    { id: 'freq', slug: 'product-category/preobrazovateli-chastoty/', name: 'Преобразователи частоты', full: 'Статические преобразователи 50/60/400 Гц', range: '50 / 60 / 400 Гц', img: 'freq', count: 0, soon: true, subs: [] },
    { id: 'trafo', slug: 'product-category/razdelitelnye-transformatory/', name: 'Разделительные трансформаторы', full: 'Разделительные трансформаторы', range: '1–100 кВА', img: 'trafo', count: 0, soon: true, subs: [] },
    { id: 'ips', slug: 'product-category/medicinskie-ips/', name: 'Медицинские IPS', full: 'Медицинские изолированные системы питания', range: '3,15–10 кВА', img: 'ips', count: 0, soon: true, subs: [] }
  ];

  const INDUSTRIES = [
    { id: 'czod', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-czod-servera/', name: 'ЦОД и серверные', h1: 'ИБП для серверной и ЦОД', icon: 'server', text: 'Двойное преобразование, модульное резервирование N+1, мониторинг по SNMP', kva: '10–600 кВА', queries: ['ибп для серверной', 'ибп для цод'] },
    { id: 'med', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-bolnicz/', name: 'Медицина', h1: 'ИБП для медицинского оборудования', icon: 'med', text: 'Рентген, КТ, МРТ, операционные и реанимация: пиковые токи и IPS-системы', kva: '10–300 кВА', queries: ['ибп для медицинского оборудования', 'ибп для мрт'] },
    { id: 'prom', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-linii-proizvodstv/', name: 'Промышленность', h1: 'ИБП для производственных линий', icon: 'factory', text: 'Индуктивная нагрузка, провалы напряжения, пыль и температура цеха', kva: '20–1200 кВА', queries: ['промышленный ибп'] },
    { id: 'oil', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-neftegaza/', name: 'Нефть и газ', h1: 'ИБП и ДГУ для нефтегазовых объектов', icon: 'oil', text: 'Удалённые объекты, контейнерные ДГУ, СОПТ 220 В, взрывозащита по ТЗ', kva: '10–3750 кВА', queries: ['ибп для нефтегаза'] },
    { id: 'office', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-biznes-centrov-trc/', name: 'Бизнес-центры и ТРЦ', h1: 'ИБП для бизнес-центров и ТРЦ', icon: 'building', text: 'Лифты, аварийное освещение, инженерные системы, кассовые узлы', kva: '20–500 кВА', queries: ['ибп для бизнес центра'] },
    { id: 'machines', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-stankov/', name: 'Станочное оборудование', h1: 'ИБП для станков с ЧПУ', icon: 'cnc', text: 'Защита от потери программы и брака при провалах сети', kva: '10–200 кВА', queries: ['ибп для станков'] },
    { id: 'emergency', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/ibp-dlya-avarijnyh-sistem/', name: 'Аварийные системы и освещение', h1: 'ИБП для аварийных систем', icon: 'alarm', text: 'Эвакуационное освещение, пожарная автоматика, СКУД', kva: '1–60 кВА', queries: ['ибп для аварийного освещения'] },
    { id: 'telecom', slug: 'resheniya/telekom/', name: 'Телеком', h1: 'Электропитание для телеком-узлов', icon: 'antenna', text: 'Узлы связи, базовые станции, 48 В DC, выпрямители и инверторы', kva: '1–100 кВА', queries: ['ибп для телеком'] }
  ];

  const SERVICES = [
    { id: 'montazh', slug: 'uslugi/montazh-i-obsluzhivanie-ibp-i-generatorov/', name: 'Монтаж и пусконаладка ИБП и ДГУ', short: 'Монтаж и пусконаладка', text: 'Установка, подключение, пробный запуск под нагрузкой, акт готовности', icon: 'wrench', price: 'по запросу', query: 'монтаж и пусконаладка ибп' },
    { id: 'service', slug: 'uslugi/obsluzhivanie-ibp/', name: 'Сервисное обслуживание ИБП', short: 'Сервисное обслуживание', text: 'Плановое ТО по регламенту, сервисный договор, SLA по выезду', icon: 'shield', price: 'от 45 000 ₸ / выезд', query: 'обслуживание источников бесперебойного питания' },
    { id: 'remont', slug: 'uslugi/remont-ibp/', name: 'Ремонт ИБП', short: 'Ремонт ИБП', text: 'Диагностика, замена силовых модулей, плат, вентиляторов. Любые бренды', icon: 'repair', price: 'диагностика от 25 000 ₸', query: 'ремонт ибп' },
    { id: 'zamena', slug: 'uslugi/zamena-batarej-ibp/', name: 'Замена батарей ИБП', short: 'Замена батарей', text: 'Подбор АКБ, замена без остановки нагрузки, утилизация старых батарей', icon: 'battery', price: 'работы от 35 000 ₸', query: 'замена батарей ибп' },
    { id: 'diagnostika', slug: 'uslugi/diagnostika-batarej/', name: 'Диагностика батарей', short: 'Диагностика батарей', text: 'Контрольный разряд без отключения ИБП, Fluke VT521, отчёт по каждой банке', icon: 'gauge', price: 'от 60 000 ₸', query: 'диагностика аккумуляторов ибп' },
    { id: 'obsledovanie', slug: 'uslugi/obsledovanie-sistemy/', name: 'Обследование системы электропитания', short: 'Обследование системы', text: 'Аудит нагрузок, тепловизионный контроль, отчёт с рекомендациями', icon: 'search', price: 'по запросу', query: 'аудит системы электроснабжения' },
    { id: 'konsultaciya', slug: 'uslugi/predproektnaya-konsultacziya/', name: 'Предпроектная консультация и подбор', short: 'Предпроектная консультация', text: 'Расчёт нагрузки и автономии, схема резервирования, спецификация для тендера', icon: 'ruler', price: 'бесплатно', query: 'подбор ибп' }
  ];

  const BRANDS = [
    { id: 'salicru', name: 'Salicru', country: 'Испания', type: 'ИБП, стабилизаторы', status: 'Официальный дистрибьютор', count: 191 },
    { id: 'kehua-tech', name: 'Kehua Tech', country: 'Китай', type: 'ИБП, модульные системы', status: 'Официальный партнёр', count: 67 },
    { id: 'tescom', name: 'Tescom', country: 'Турция', type: 'ИБП, ДГУ, стабилизаторы, STS', status: 'Официальный дистрибьютор', count: 81 },
    { id: 'hoppecke', name: 'Hoppecke', country: 'Германия', type: 'Аккумуляторы OPzS / OPzV', status: 'Партнёр', count: 85 },
    { id: 'bae-batterien', name: 'BAE Batterien', country: 'Германия', type: 'Аккумуляторы Secura', status: 'Партнёр', count: 59 },
    { id: 'energrid', name: 'EnerGrid', country: 'Китай', type: 'Аккумуляторы AGM', status: 'Партнёр', count: 38 },
    { id: 'everexceed', name: 'EverExceed', country: 'Китай', type: 'АКБ, стабилизаторы', status: 'Партнёр', count: 37 },
    { id: 'ritar', name: 'Ritar', country: 'Китай', type: 'Аккумуляторы AGM', status: 'Партнёр', count: 10 },
    { id: 'exide', name: 'Exide Sprinter', country: 'Германия', type: 'Аккумуляторы', status: 'Партнёр', count: 7 },
    { id: 'agg', name: 'AGG Power', country: 'Великобритания / Китай', type: 'ДГУ', status: 'Партнёр', count: 7 },
    { id: 'baifa', name: 'BAIFA Power', country: 'Китай', type: 'ДГУ', status: 'Партнёр', count: 7 },
    { id: 'cummins', name: 'Cummins', country: 'США', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'perkins', name: 'Perkins', country: 'Великобритания', type: 'Двигатели ДГУ', status: 'Двигатели', count: 3 },
    { id: 'volvo-penta', name: 'Volvo Penta', country: 'Швеция', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'mtu', name: 'MTU', country: 'Германия', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'scania', name: 'Scania', country: 'Швеция', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'deutz', name: 'Deutz', country: 'Германия', type: 'Двигатели ДГУ', status: 'Двигатели', count: 1 },
    { id: 'doosan', name: 'Doosan', country: 'Корея', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'baudouin', name: 'Baudouin', country: 'Франция', type: 'Двигатели ДГУ', status: 'Двигатели', count: 2 },
    { id: 'stamford-avk', name: 'Stamford AVK', country: 'Великобритания', type: 'Генераторы переменного тока', status: 'Альтернаторы', count: 0 },
    { id: 'mecc-alte', name: 'Mecc Alte', country: 'Италия', type: 'Генераторы переменного тока', status: 'Альтернаторы', count: 0 },
    { id: 'leroy-somer', name: 'Nidec Leroy-Somer', country: 'Франция', type: 'Генераторы переменного тока', status: 'Альтернаторы', count: 0 }
  ];

  // ---------- Каталог: серии → модели ----------
  const P = [];
  let n = 0;
  function add(base, models) {
    models.forEach(m => {
      n++;
      const kva = m.kva, kw = m.kw != null ? m.kw : (base.pf ? Math.round(kva * base.pf * 10) / 10 : kva);
      P.push(Object.assign({
        id: 'p' + n,
        slug: (base.brand + '-' + m.m).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        name: (base.prefix || '') + base.brand + ' ' + m.m,
        model: m.m,
        sku: m.sku || '',
        brand: base.brand,
        brandId: base.brandId,
        cat: base.cat,
        series: base.series,
        sub: base.sub,
        kva: kva, kw: kw,
        price: m.price || null,
        stock: m.stock || base.stock || 'order',
        lead: m.lead || base.lead || '4–6 недель',
        img: base.img,
        photo: base.photo || null,
        industries: base.industries || [],
        docs: base.docs || [{ name: 'Datasheet ' + base.series + ' (PDF)', size: '1,2 МБ' }],
        spec: Object.assign({}, base.spec, m.spec || {})
      }, {
        phases: base.phases, topology: base.topology, form: base.form, arch: base.arch, pf: base.pf,
        eff: base.eff, battery: base.battery, interfaces: base.interfaces, ip: base.ip, warranty: base.warranty,
        dims: m.dims || base.dims, weight: m.weight || base.weight, parallel: base.parallel
      }));
    });
  }

  // ИБП Salicru
  add({ prefix: 'ИБП ', brand: 'Salicru', brandId: 'salicru', cat: 'ibp', series: 'SLC TWIN RT2', sub: ['odnofaznye', 'stoechnye'], phases: '1/1', topology: 'On-line (двойное преобразование)', form: 'Rack/Tower', arch: 'Моноблочная', pf: 0.9, eff: '94 / 98', battery: 'встроенные', interfaces: ['USB', 'RS-232', 'SNMP (слот)', 'EPO', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'до 3 шт. (от 6 кВА)', img: 'rack', industries: ['czod', 'office', 'emergency'], stock: 'in', lead: 'со склада в Алматы' },
    [{ m: 'SLC-4000-TWIN RT2', kva: 4, kw: 3.6, dims: '438×608×88 мм (2U)', weight: '27 кг', price: 985000 }, { m: 'SLC-5000-TWIN RT2', kva: 5, kw: 4.5, dims: '438×608×88 мм (2U)', weight: '28 кг' }, { m: 'SLC-6000-TWIN RT2', kva: 6, kw: 5.4, dims: '438×608×88 мм (2U)', weight: '29 кг', price: 1290000 }, { m: 'SLC-8000-TWIN RT2', kva: 8, kw: 7.2, dims: '438×608×130 мм (3U)', weight: '41 кг' }, { m: 'SLC-10000-TWIN RT2', kva: 10, kw: 9, dims: '438×608×130 мм (3U)', weight: '42 кг', price: 1980000 }]);
  add({ prefix: 'ИБП ', brand: 'Salicru', brandId: 'salicru', cat: 'ibp', series: 'SLC TWIN RT3', sub: ['odnofaznye', 'stoechnye'], phases: '1/1', topology: 'On-line (двойное преобразование)', form: 'Rack/Tower', arch: 'Моноблочная', pf: 1, eff: '95 / 98', battery: 'встроенные', interfaces: ['USB', 'RS-232', 'SNMP (слот)', 'EPO', 'Сухие контакты', 'Ethernet'], ip: 'IP20', warranty: 24, parallel: 'до 4 шт.', img: 'rack', industries: ['czod', 'office', 'emergency', 'telecom'], stock: 'in', lead: 'со склада в Алматы' },
    [{ m: 'SLC-4000-TWIN RT3', kva: 4, kw: 4, dims: '438×608×88 мм (2U)', weight: '28 кг' }, { m: 'SLC-5000-TWIN RT3', kva: 5, kw: 5, dims: '438×608×88 мм (2U)', weight: '29 кг' }, { m: 'SLC-6000-TWIN RT3', kva: 6, kw: 6, dims: '438×608×88 мм (2U)', weight: '30 кг' }, { m: 'SLC-8000-TWIN RT3', kva: 8, kw: 8, dims: '438×608×130 мм (3U)', weight: '43 кг' }, { m: 'SLC-10000-TWIN RT3', kva: 10, kw: 10, dims: '438×608×130 мм (3U)', weight: '44 кг' }]);
  add({ prefix: 'ИБП ', brand: 'Salicru', brandId: 'salicru', cat: 'ibp', series: 'SLC TWIN PRO3', sub: ['tryohfaznye'], phases: '3/3', topology: 'On-line (двойное преобразование)', form: 'Напольный', arch: 'Моноблочная', pf: 1, eff: '96 / 99', battery: 'внешние', interfaces: ['USB', 'RS-232', 'RS-485', 'SNMP', 'Modbus', 'EPO', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'до 4 шт.', img: 'tower', industries: ['czod', 'med', 'office', 'machines'], stock: 'in', lead: 'со склада в Алматы' },
    [{ m: 'SLC-10000-TWIN PRO3', kva: 10, kw: 10, dims: '250×700×560 мм', weight: '48 кг' }, { m: 'SLC-15000-TWIN PRO3', kva: 15, kw: 15, dims: '250×700×560 мм', weight: '52 кг' }, { m: 'SLC-20000-TWIN PRO3', kva: 20, kw: 20, dims: '250×700×560 мм', weight: '55 кг', price: 4850000 }, { m: 'SLC-30000-TWIN PRO3', kva: 30, kw: 30, dims: '350×800×780 мм', weight: '90 кг' }, { m: 'SLC-40000-TWIN PRO3', kva: 40, kw: 40, dims: '350×800×780 мм', weight: '95 кг' }]);
  add({ prefix: 'ИБП ', brand: 'Salicru', brandId: 'salicru', cat: 'ibp', series: 'SLC ADAPT2', sub: ['tryohfaznye', 'modulnye'], phases: '3/3', topology: 'On-line, модульный, трёхуровневая PWM', form: 'Напольный', arch: 'Модульная', pf: 1, eff: '96 / 99', battery: 'внешние', interfaces: ['USB', 'RS-232', 'RS-485', 'SNMP', 'NIMBUS', 'Modbus', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'до 1500 кВА, hot-swap модули 25/50 кВА', img: 'modular', industries: ['czod', 'med', 'prom', 'oil', 'office'], docs: [{ name: 'Datasheet SLC ADAPT2 25–50 kVA (PDF)', size: '2,4 МБ' }, { name: 'Руководство по эксплуатации (PDF)', size: '6,1 МБ' }, { name: 'Сертификат соответствия ЕАЭС (PDF)', size: '0,8 МБ' }] },
    [{ m: 'SLC ADAPT2 25', kva: 25, kw: 25, sku: '694AB000015', dims: '700×510×178 мм (модуль)', weight: '43 кг' }, { m: 'SLC ADAPT2 50', kva: 50, kw: 50, sku: '694AB000016', dims: '700×510×178 мм (модуль)', weight: '45 кг', stock: 'in', lead: 'со склада в Алматы' }, { m: 'SLC-N/2 ADAPT2 30', kva: 30, kw: 30 }, { m: 'SLC-N/4 ADAPT2 45', kva: 45, kw: 45 }, { m: 'SLC-N/6 ADAPT2 90', kva: 90, kw: 90 }, { m: 'SLC-N/8 ADAPT2 200', kva: 200, kw: 200, dims: '600×1000×2000 мм (шкаф)', weight: '420 кг' }, { m: 'SLC-N/12 ADAPT2 300', kva: 300, kw: 300, dims: '600×1000×2000 мм (шкаф)', weight: '560 кг' }, { m: 'SLC-N/10 ADAPT2 500', kva: 500, kw: 500, dims: '1200×1000×2000 мм (шкаф)', weight: '980 кг' }]);
  // ИБП Kehua
  add({ prefix: 'ИБП ', brand: 'Kehua', brandId: 'kehua-tech', cat: 'ibp', series: 'KR11', sub: ['odnofaznye'], phases: '1/1', topology: 'On-line (двойное преобразование)', form: 'Напольный (tower)', arch: 'Моноблочная', pf: 0.9, eff: '93 / 97', battery: 'встроенные', interfaces: ['USB', 'RS-232', 'SNMP (слот)', 'EPO'], ip: 'IP20', warranty: 24, parallel: 'до 3 шт.', img: 'tower', industries: ['office', 'emergency', 'machines'], stock: 'in', lead: 'со склада в Алматы' },
    [{ m: 'KR1110', kva: 1, kw: 0.9 }, { m: 'KR1120', kva: 2, kw: 1.8 }, { m: 'KR1130', kva: 3, kw: 2.7 }, { m: 'KR1160', kva: 6, kw: 5.4 }, { m: 'KR11100', kva: 10, kw: 9 }]);
  add({ prefix: 'ИБП ', brand: 'Kehua', brandId: 'kehua-tech', cat: 'ibp', series: 'KR33', sub: ['tryohfaznye'], phases: '3/3', topology: 'On-line (двойное преобразование)', form: 'Напольный', arch: 'Моноблочная', pf: 1, eff: '96 / 99', battery: 'внешние', interfaces: ['RS-232', 'RS-485', 'SNMP', 'Modbus', 'EPO', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'до 4 шт.', img: 'tower', industries: ['czod', 'med', 'prom', 'office', 'machines'] },
    [{ m: 'KR3310', kva: 10, kw: 10 }, { m: 'KR3315', kva: 15, kw: 15 }, { m: 'KR3320', kva: 20, kw: 20, stock: 'in', lead: 'со склада в Алматы' }, { m: 'KR3330', kva: 30, kw: 30 }, { m: 'KR3340', kva: 40, kw: 40 }, { m: 'KR3360', kva: 60, kw: 60 }, { m: 'KR3380', kva: 80, kw: 80 }, { m: 'KR33100', kva: 100, kw: 100 }, { m: 'KR33120', kva: 120, kw: 120 }]);
  add({ prefix: 'ИБП ', brand: 'Kehua', brandId: 'kehua-tech', cat: 'ibp', series: 'MR33', sub: ['tryohfaznye', 'modulnye'], phases: '3/3', topology: 'On-line, модульный', form: 'Напольный', arch: 'Модульная', pf: 1, eff: '96,5 / 99', battery: 'внешние', interfaces: ['RS-232', 'RS-485', 'SNMP', 'Modbus', 'EPO', 'Сухие контакты', 'Ethernet'], ip: 'IP20', warranty: 36, parallel: 'модули 25/50 кВА, до 4 шкафов', img: 'modular', industries: ['czod', 'med', 'prom', 'oil'] },
    [{ m: 'MR33 150', kva: 150, kw: 150, dims: '600×1000×2000 мм', weight: '380 кг' }, { m: 'MR33 300', kva: 300, kw: 300, dims: '600×1000×2000 мм', weight: '520 кг' }, { m: 'MR33 600', kva: 600, kw: 600, dims: '1200×1000×2000 мм', weight: '1100 кг' }]);
  // ИБП Tescom
  add({ prefix: 'ИБП ', brand: 'Tescom', brandId: 'tescom', cat: 'ibp', series: 'NEOLINE', sub: ['tryohfaznye'], phases: '3/3', topology: 'On-line (двойное преобразование)', form: 'Напольный', arch: 'Моноблочная', pf: 1, eff: '95 / 98', battery: 'внешние', interfaces: ['RS-232', 'RS-485', 'SNMP', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'до 4 шт.', img: 'tower', industries: ['med', 'prom', 'office'] },
    [{ m: 'NEOLINE 310', kva: 10, kw: 10 }, { m: 'NEOLINE 320', kva: 20, kw: 20 }, { m: 'NEOLINE 330', kva: 30, kw: 30 }, { m: 'NEOLINE 340', kva: 40, kw: 40 }]);
  add({ prefix: 'ИБП ', brand: 'Tescom', brandId: 'tescom', cat: 'ibp', series: 'TEOS', sub: ['tryohfaznye'], phases: '3/3', topology: 'On-line, трансформаторный', form: 'Напольный', arch: 'Моноблочная', pf: 0.9, eff: '94 / 97', battery: 'внешние', interfaces: ['RS-232', 'RS-485', 'SNMP', 'Modbus', 'Сухие контакты'], ip: 'IP21', warranty: 24, parallel: 'до 6 шт.', img: 'tower', industries: ['med', 'prom', 'oil', 'machines'] },
    [{ m: 'TEOS 40', kva: 40, kw: 36 }, { m: 'TEOS 60', kva: 60, kw: 54 }, { m: 'TEOS 80', kva: 80, kw: 72 }, { m: 'TEOS 100', kva: 100, kw: 90 }, { m: 'TEOS 160', kva: 160, kw: 144 }, { m: 'TEOS 200', kva: 200, kw: 180 }]);
  add({ prefix: 'ИБП ', brand: 'Tescom', brandId: 'tescom', cat: 'ibp', series: 'MTW', sub: ['tryohfaznye', 'modulnye'], phases: '3/3', topology: 'On-line, модульный', form: 'Напольный', arch: 'Модульная', pf: 1, eff: '96 / 99', battery: 'внешние', interfaces: ['RS-232', 'RS-485', 'SNMP', 'Modbus', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: 'модули 10–50 кВА, hot-swap', img: 'modular', industries: ['czod', 'med', 'prom'] },
    [{ m: 'MTW150 30', kva: 30, kw: 30 }, { m: 'MTW150 60', kva: 60, kw: 60 }, { m: 'MTW150 90', kva: 90, kw: 90 }, { m: 'MTW150 120', kva: 120, kw: 120 }, { m: 'MTW180 180', kva: 180, kw: 180 }, { m: 'MTW300 300', kva: 300, kw: 300 }, { m: 'MTW500 400', kva: 400, kw: 400 }, { m: 'MTW600 600', kva: 600, kw: 600 }]);

  // ДГУ
  const gen = (brand, brandId, series, engine, enclosure, sub, models) => add({ prefix: 'ДГУ ', brand, brandId, cat: 'dgu', series, sub, phases: '3ф 400 В', topology: '', form: enclosure, arch: '', pf: 0.8, eff: '', battery: '', interfaces: ['Deep Sea 7320', 'Modbus', 'АВР (опция)'], ip: enclosure === 'В контейнере' ? 'IP54' : 'IP23', warranty: 12, parallel: 'синхронизация до 8 шт.', img: enclosure === 'В контейнере' ? 'container' : 'genset', industries: ['oil', 'prom', 'office', 'med', 'czod'], spec: { 'Двигатель': engine, 'Частота вращения': '1500 об/мин', 'Альтернатор': 'Stamford / Mecc Alte' }, lead: '8–12 недель' }, models);
  gen('Tescom', 'tescom', 'TDJ (Perkins)', 'Perkins', 'Открытое / кожух', ['otkrytye', 'v-kozhuhe'], [{ m: 'TDJ 50P', kva: 50, kw: 40 }, { m: 'TDJ 125P', kva: 125, kw: 100, price: 14900000 }, { m: 'TDJ 150P', kva: 150, kw: 120 }, { m: 'TDJ 250P', kva: 250, kw: 200 }, { m: 'TDJ 500P', kva: 500, kw: 400 }]);
  gen('Tescom', 'tescom', 'TDJ (Volvo Penta)', 'Volvo Penta', 'Открытое / кожух', ['otkrytye', 'v-kozhuhe'], [{ m: 'TDJ 110V', kva: 110, kw: 88 }, { m: 'TDJ 275V', kva: 275, kw: 220 }, { m: 'TDJ 550V', kva: 550, kw: 440 }, { m: 'TDJ 770V', kva: 770, kw: 616 }]);
  gen('AGG Power', 'agg', 'C-серия (Cummins)', 'Cummins', 'В контейнере', ['v-kontejnere'], [{ m: 'C138D5', kva: 138, kw: 110 }, { m: 'C275D5', kva: 275, kw: 220 }, { m: 'C550D5', kva: 550, kw: 440 }, { m: 'C1100D5', kva: 1100, kw: 880 }, { m: 'C2500D5', kva: 2500, kw: 2000 }]);
  gen('AGG Power', 'agg', 'P-серия (Perkins)', 'Perkins', 'В контейнере', ['v-kontejnere'], [{ m: 'P66D5', kva: 66, kw: 53 }, { m: 'P125D5', kva: 125, kw: 100, price: 16800000 }, { m: 'P220D5', kva: 220, kw: 176 }, { m: 'P500D5', kva: 500, kw: 400 }]);
  gen('BAIFA Power', 'baifa', 'BF-C (Cummins)', 'Cummins', 'Открытое / кожух / контейнер', ['otkrytye', 'v-kozhuhe', 'v-kontejnere'], [{ m: 'BF-C55', kva: 55, kw: 44 }, { m: 'BF-C138', kva: 138, kw: 110 }, { m: 'BF-C275', kva: 275, kw: 220 }, { m: 'BF-C825', kva: 825, kw: 660 }]);
  gen('BAIFA Power', 'baifa', 'BF-M (MTU)', 'MTU', 'В контейнере', ['v-kontejnere'], [{ m: 'BF-M750', kva: 750, kw: 600 }, { m: 'BF-M1650', kva: 1650, kw: 1320 }, { m: 'BF-M3750', kva: 3750, kw: 3000 }]);

  // АКБ
  const bat = (brand, brandId, series, tech, volt, life, sub, models, extra) => add(Object.assign({ prefix: 'АКБ ', brand, brandId, cat: 'akb', series, sub, phases: '', topology: tech, form: volt + ' В', arch: '', pf: 1, eff: '', battery: '', interfaces: [], ip: '', warranty: 24, parallel: '', img: volt === 2 ? 'cell' : 'battery', industries: ['czod', 'med', 'prom', 'oil', 'telecom'], spec: { 'Технология': tech, 'Напряжение': volt + ' В', 'Срок службы (проектный)': life }, lead: '2–4 недели' }, extra || {}), models.map(m => ({ m: m.m, kva: m.ah, kw: m.ah, spec: { 'Ёмкость C10': m.ah + ' А·ч' }, dims: m.dims, weight: m.weight, price: m.price, stock: m.stock, lead: m.lead })));
  bat('Hoppecke', 'hoppecke', 'grid power VR M', 'OPzV (гель, VRLA)', 2, '18 лет', ['2v'], [{ m: 'VR M 2-230', ah: 232 }, { m: 'VR M 2-330', ah: 343 }, { m: 'VR M 2-400', ah: 411 }, { m: 'VR M 2-600', ah: 604 }, { m: 'VR M 2-800', ah: 834 }, { m: 'VR M 2-1000', ah: 1070 }]);
  bat('Hoppecke', 'hoppecke', 'OPzS', 'OPzS (жидкий электролит)', 2, '20 лет', ['2v'], [{ m: '4 OPzS 200', ah: 200 }, { m: '6 OPzS 420', ah: 420 }, { m: '10 OPzS 1000', ah: 1000 }, { m: '16 OPzS 2000', ah: 2000 }, { m: '26 OPzS 3250', ah: 3250 }]);
  bat('BAE', 'bae-batterien', 'Secura OPzV', 'OPzV (гель, VRLA)', 2, '18 лет', ['2v'], [{ m: '2 OPzV 100', ah: 100 }, { m: '6 OPzV 420', ah: 420, stock: 'in', lead: 'со склада в Алматы' }, { m: '12 OPzV 1500', ah: 1500 }, { m: '24 OPzV 3000', ah: 3000 }]);
  bat('BAE', 'bae-batterien', 'Secura 12V OPzV', 'OPzV (гель, VRLA)', 12, '15 лет', ['12v'], [{ m: '12V 1 OPzV 50', ah: 50 }, { m: '12V 2 OPzV 100', ah: 100, price: 285000 }, { m: '12V 3 OPzV 150', ah: 150 }]);
  bat('Ritar', 'ritar', 'RA / RT (AGM)', 'AGM', 12, '10–12 лет', ['12v'], [{ m: 'RT1270', ah: 7, price: 12500, stock: 'in', lead: 'со склада в Алматы' }, { m: 'RT12180', ah: 18, stock: 'in', lead: 'со склада в Алматы' }, { m: 'RA12-40', ah: 40 }, { m: 'RA12-65', ah: 65, stock: 'in', lead: 'со склада в Алматы' }, { m: 'RA12-100', ah: 100, price: 118000, stock: 'in', lead: 'со склада в Алматы', dims: '330×173×212 мм', weight: '29,5 кг' }, { m: 'HR12-380SW', ah: 100, dims: '330×173×212 мм', weight: '31 кг' }]);
  bat('EnerGrid', 'energrid', 'GP / FT (AGM)', 'AGM', 12, '10 лет', ['12v'], [{ m: 'GP1272', ah: 7.2, stock: 'in', lead: 'со склада в Алматы' }, { m: 'GP12180', ah: 18 }, { m: 'FT12-55', ah: 55 }, { m: 'FT12-100', ah: 100, price: 112000, stock: 'in', lead: 'со склада в Алматы', dims: '395×110×287 мм (front terminal)', weight: '31 кг' }, { m: 'FT12-150', ah: 150 }, { m: 'FT12-200', ah: 200 }]);
  bat('Exide', 'exide', 'Sprinter Pure Power', 'AGM', 12, '12 лет', ['12v'], [{ m: 'S12V2800PP', ah: 69.5 }, { m: 'S12V3800PP', ah: 105 }, { m: 'S12V4500PP', ah: 120 }]);

  // Стабилизаторы
  add({ prefix: 'Стабилизатор ', brand: 'Tescom', brandId: 'tescom', cat: 'stab', series: 'TSVR', sub: ['tryohfaznye', 'elektromehanicheskie'], phases: '3', topology: 'Электромеханический (сервоприводный)', form: 'Напольный', arch: '', pf: 1, eff: '98', battery: '', interfaces: ['RS-485', 'Сухие контакты'], ip: 'IP21', warranty: 24, parallel: '', img: 'stab', industries: ['prom', 'machines', 'oil', 'office'], spec: { 'Диапазон входного напряжения': '±20 %', 'Точность стабилизации': '±1 %', 'Выходное напряжение': '380 / 400 В' } },
    [{ m: 'TSVR 33010', kva: 10 }, { m: 'TSVR 33030', kva: 30 }, { m: 'TSVR 33060', kva: 60 }, { m: 'TSVR 33100', kva: 100 }, { m: 'TSVR 33250', kva: 250 }, { m: 'TSVR 33500', kva: 500 }, { m: 'TSVR 331000', kva: 1000 }, { m: 'TSVR 333200', kva: 3200 }]);
  add({ prefix: 'Стабилизатор ', brand: 'Salicru', brandId: 'salicru', cat: 'stab', series: 'RE3 T', sub: ['tryohfaznye', 'elektronnye'], phases: '3', topology: 'Электронный (тиристорный)', form: 'Напольный', arch: '', pf: 1, eff: '98', battery: '', interfaces: ['RS-485', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: '', img: 'stab', industries: ['med', 'czod', 'office'], spec: { 'Диапазон входного напряжения': '±15 %', 'Точность стабилизации': '±2 %', 'Выходное напряжение': '400 В' } },
    [{ m: 'RE3 T 15', kva: 15 }, { m: 'RE3 T 30', kva: 30 }, { m: 'RE3 T 60', kva: 60 }, { m: 'RE3 T 100', kva: 100 }]);
  add({ prefix: 'Стабилизатор ', brand: 'EverExceed', brandId: 'everexceed', cat: 'stab', series: 'SVC', sub: ['odnofaznye', 'elektromehanicheskie'], phases: '1', topology: 'Электромеханический', form: 'Настенный / напольный', arch: '', pf: 1, eff: '97', battery: '', interfaces: [], ip: 'IP20', warranty: 12, parallel: '', img: 'stab', industries: ['office', 'emergency'], spec: { 'Диапазон входного напряжения': '150–250 В', 'Точность стабилизации': '±3 %', 'Выходное напряжение': '220 В' }, stock: 'in', lead: 'со склада в Алматы' },
    [{ m: 'SVC-1000', kva: 1 }, { m: 'SVC-3000', kva: 3 }, { m: 'SVC-5000', kva: 5 }, { m: 'SVC-10000', kva: 10 }]);

  // STS
  add({ prefix: 'STS ', brand: 'Tescom', brandId: 'tescom', cat: 'sts', series: 'STS4000', sub: ['tryohfaznye'], phases: '3 (4-полюсный)', topology: 'Статический переключатель', form: 'Стоечный / напольный', arch: '', pf: 1, eff: '99', battery: '', interfaces: ['SNMP', 'RS-485', 'Сухие контакты'], ip: 'IP20', warranty: 24, parallel: '', img: 'sts', industries: ['czod', 'med', 'telecom'], spec: { 'Время переключения': '< 4 мс' } },
    [{ m: 'STS4100', kva: 100 }, { m: 'STS4250', kva: 250 }, { m: 'STS4400', kva: 400 }, { m: 'STS4800', kva: 800 }, { m: 'STS41250', kva: 1250 }]);
  add({ prefix: 'STS ', brand: 'Tescom', brandId: 'tescom', cat: 'sts', series: 'STS2000', sub: ['odnofaznye'], phases: '1', topology: 'Статический переключатель', form: 'Стоечный', arch: '', pf: 1, eff: '99', battery: '', interfaces: ['SNMP', 'RS-485'], ip: 'IP20', warranty: 24, parallel: '', img: 'sts', industries: ['czod', 'telecom'], spec: { 'Время переключения': '< 4 мс' } },
    [{ m: 'STS2016', kva: 16 }, { m: 'STS2032', kva: 32 }, { m: 'STS2063', kva: 63 }]);

  const PROJECTS = [
    { id: 'ktz', slug: 'proekty/akb-i-zvu-dlya-ktzh/', title: 'Аккумуляторные батареи и ЗВУ для АО «КТЖ»', client: 'АО «Қазақстан темір жолы»', object: 'Тяговые подстанции', city: 'Астана', year: 2025, industry: 'prom', kva: '600 элементов × 420 А·ч', equipment: ['АКБ OPzV 2 В 420 А·ч, 600 шт.', 'Зарядно-выпрямительные устройства, 10 комплектов'], task: 'Заменить выработавшие ресурс батареи оперативного тока и ЗВУ на объектах железной дороги без остановки движения.', solution: 'Поставка 600 элементов OPzV 2 В ёмкостью 420 А·ч и 10 комплектов ЗВУ, пусконаладка и ввод в эксплуатацию по графику окон.', img: 'cell', photos: ['proj-ktz-1.jpg', 'proj-ktz-2.jpg', 'proj-ktz-3.jpg', 'proj-ktz-4.jpg', 'proj-ktz-5.jpg'] },
    { id: 'airastana', slug: 'proekty/ibp-kehua-120-kva-air-astana/', title: 'ИБП Kehua 120 кВА для офиса Air Astana', client: 'Air Astana', object: 'Серверная головного офиса', city: 'Алматы', year: 2024, industry: 'czod', kva: '120 кВА', equipment: ['ИБП Kehua MY120, 120 кВА', 'Батарейный шкаф и АКБ', 'SNMP-мониторинг'], task: 'Обеспечить серверную авиакомпании автономией и защитой от провалов сети.', solution: 'Поставка и монтаж ИБП 120 кВА с внешним батарейным шкафом, интеграция в систему мониторинга заказчика.', img: 'modular', photos: ['proj-airastana-1.jpg', 'proj-airastana-2.jpg', 'proj-airastana-3.jpg', 'proj-airastana-4.jpg', 'proj-airastana-5.jpg'] },
    { id: 'lab', slug: 'proekty/modulnyj-ibp-300-kva-laboratoriya-karaganda/', title: 'Модульный ИБП 300 кВА для лаборатории в Караганде', client: 'Клинико-диагностическая лаборатория', object: 'Лабораторный комплекс', city: 'Караганда', year: 2026, industry: 'med', kva: '300 кВА', equipment: ['ИБП Tescom MTW 300 кВА, модульный', 'Батарейные шкафы и АКБ BERELI HR12-100', 'Монтаж и пусконаладка'], task: 'Защитить анализаторы и холодильное оборудование крупнейшей лаборатории региона.', solution: 'Модульная система с резервированием N+1 и возможностью наращивания мощности.', img: 'modular', photos: ['proj-lab-1.jpg', 'proj-lab-2.jpg'] },
    { id: 'uralsk', slug: 'proekty/ibp-80-kva-dlya-rentgena-uralsk/', title: 'Два комплекта ИБП по 80 кВА для рентген-аппаратов', client: 'Клиника «Талап»', object: 'Отделение лучевой диагностики', city: 'Уральск', year: 2025, industry: 'med', kva: '2 × 80 кВА', equipment: ['ИБП Tescom TEOS 80 кВА, 2 шт.', 'АКБ Bereli, 80 шт.', 'Аккумуляторные шкафы'], task: 'Исключить срывы исследований при провалах напряжения и обеспечить пиковые токи рентген-аппаратов.', solution: 'Трансформаторные ИБП TEOS с перегрузочной способностью под импульсную нагрузку рентгена.', img: 'tower', photos: ['proj-uralsk-1.jpg', 'proj-uralsk-2.jpg', 'proj-uralsk-3.jpg', 'proj-uralsk-4.jpg'] },
    { id: 'tv', slug: 'proekty/ibp-salicru-telekanal-kazakhstan/', title: 'Поставка для теле-радио комплекса телеканала «Казахстан»', client: 'Телеканал «Казахстан»', object: 'Аппаратно-студийный комплекс', city: 'Астана', year: 2025, industry: 'telecom', kva: '2 × 10 кВА', equipment: ['ИБП Salicru 10 кВА, 2 шт.', 'Аккумуляторные кабинеты'], task: 'Бесперебойная работа эфирного оборудования.', solution: 'Два ИБП Salicru 10 кВА с батарейными кабинетами на расчётную автономию.', img: 'rack', photos: ['proj-tv-1.jpg', 'proj-tv-2.jpg', 'proj-tv-3.jpg', 'proj-tv-4.jpg'] }
  ];

  const EXHIBITIONS = [
    { id: 'kihe-2026', name: 'KIHE 2026', city: 'Алматы', year: 2026, theme: 'здравоохранение', photos: ['exh-kihe2026-1.jpg', 'exh-kihe2026-2.jpg', 'exh-kihe2026-3.jpg'] },
    { id: 'power-expo-2025', name: 'POWER EXPO 2025', city: 'Алматы', year: 2025, theme: 'энергетика', photos: ['exh-powerexpo2025-1.jpg', 'exh-powerexpo2025-2.jpg', 'exh-powerexpo2025-3.jpg', 'exh-powerexpo2025-4.jpg'] },
    { id: 'electronica-2025', name: 'ELECTRONICA EXPO ASTANA 2025', city: 'Астана', year: 2025, theme: 'электроника', photos: ['exh-electronica2025-1.jpg', 'exh-electronica2025-2.jpg', 'exh-electronica2025-3.jpg'] },
    { id: 'kihe-2025', name: 'KIHE ALMATY 2025', city: 'Алматы', year: 2025, theme: 'здравоохранение', photos: ['exh-kihe2025-1.jpg', 'exh-kihe2025-2.jpg', 'exh-kihe2025-3.jpg', 'exh-kihe2025-4.jpg', 'exh-kihe2025-5.jpg', 'exh-kihe2025-6.jpg'] },
    { id: 'power-expo-2024', name: 'POWER EXPO 2024', city: 'Алматы', year: 2024, theme: 'энергетика', photos: ['exh-powerexpo2024-1.png', 'exh-powerexpo2024-2.png', 'exh-powerexpo2024-3.png', 'exh-powerexpo2024-4.png', 'exh-powerexpo2024-5.png', 'exh-powerexpo2024-6.png'] }
  ];
  const REVIEWS = [
    { name: 'Argun KN', date: '12 сентября 2025', text: 'Ребята устанавливали в моей клинике УПС и протягивали силовой кабель 120 м. Всё сделали быстро, аккуратно и профессионально. Помогают и с промышленным электрооборудованием: бывало, что за час выехали и помогли с тем, что их совсем не касалось.' },
    { name: 'Concrete Foundation', date: '12 сентября 2025', text: 'Заказывали ИБП. Поставка выполнена в установленные сроки, оборудование доставлено в полной комплектности и надлежащем состоянии. Благодарим коллектив ТОО «AEC Kazakhstan» за профессиональный подход.' },
    { name: 'Нургалым Жундибаев', date: '12 сентября 2025', text: 'Заказали оборудование и монтаж, всё классно: быстро перевезли, установили. Сотрудники вежливые, спасибо.' },
    { name: 'Сакен Сакен', date: '12 сентября 2025', text: 'Заказывал оборудование и монтаж. Всё очень понравилось, быстро и качественно.' },
    { name: 'Frank Lampard', date: '12 сентября 2025', text: 'Доставили оборудование вовремя, качественно провели монтаж.' },
    { name: 'Alena Azimova', date: '12 сентября 2025', text: 'Спасибо за профессионализм и скорость в обслуживании. Очень довольны сотрудничеством, всем рекомендую.' }
  ];
  const TESTIMONIALS = [
    { text: 'Команда AEC Kazakhstan установила ИБП для МРТ GE, обеспечила монтаж, обслуживание и безупречную работу оборудования.', name: 'Елена Смирнова', role: 'Главный врач' },
    { text: 'Используем модульные ИБП AEC. Система легко масштабируется, а сервисная команда быстро реагирует на запросы.', name: 'Айжан Мухамеджанова', role: 'Директор дата-центра' },
    { text: 'Наш аэродром получил дизель-генераторы AEC, которые обеспечивают стабильное питание. Сервис и поддержка на высоте.', name: 'Канат Тулебеков', role: 'Инженер аэропорта' }
  ];
  const VIDEOS = [
    { title: 'ИБП CESCOM для IT-нагрузки', text: 'Трёхфазные ИБП до 80 кВт с двухлетней гарантией, доставкой, монтажом и обучением персонала', slot: 'video-cescom.jpg' },
    { title: 'Модульные ИБП Kehua Tech', text: 'До 120 кВт: компактное исполнение, модульная архитектура, гарантия до 5 лет под проекты', slot: 'video-kehua.jpg' },
    { title: 'Диагностика АКБ', text: 'Контрольный разряд без отключения ИБП и подробный отчёт по каждой батарее', slot: 'video-akb.jpg' },
    { title: 'Анализатор Fluke VT521', text: 'Проверка батарей, фиксация дефектов, замена при необходимости', slot: 'video-fluke.jpg' }
  ];
  const CERTS = [
    { slot: 'cert-kazaeronavigacia.jpg', title: 'Благодарственное письмо', from: 'КазАэроНавигация' }, { slot: 'cert-emirmed.png', title: 'Благодарственное письмо', from: 'Эмирмед' }, { slot: 'cert-stepnogorsk.jpg', title: 'Благодарственное письмо', from: 'Степногорская ТЭЦ' }, { slot: 'cert-ziylan.jpg', title: 'Благодарственное письмо', from: 'Зийлан КЗ' }, { slot: 'cert-hitech.jpg', title: 'Благодарственное письмо', from: 'Клиника Хай-Тек' }, { slot: 'cert-tusas.jpg', title: 'Благодарственное письмо', from: 'TUSAŞ' }
  ];
  const CLIENT_LOGOS = [['client-airastana.png', 'Air Astana'], ['client-ktz.png', 'АО «КТЖ»'], ['client-nbk.png', 'Национальный банк РК'], ['client-worldbank.png', 'World Bank'], ['client-mabetex.png', 'Mabetex Group'], ['client-almatymetrology.png', 'Almaty Metrology'], ['client-kao.png', 'КАО'], ['client-getbybin.png', 'GetByBin'], ['client-gluster.png', 'Gluster'], ['client-10.png', 'Клиент'], ['client-12.png', 'Клиент'], ['client-13.png', 'Клиент'], ['client-14.png', 'Клиент'], ['client-15.png', 'Клиент'], ['client-17.png', 'Клиент'], ['client-18.png', 'Клиент'], ['client-19.png', 'Клиент'], ['client-11.webp', 'Клиент']];
  const CAT_PHOTOS = { ibp: 'prod-salicru-adapt2.jpg', dgu: 'prod-tescom-genset-1.jpg', akb: 'prod-hoppecke-opzs.jpg', stab: 'proj-ktz-2.jpg', sts: 'proj-tv-1.jpg' };
  const SERIES_PHOTOS = { 'SLC ADAPT2': 'prod-salicru-adapt2.jpg', 'SLC TWIN RT3': 'prod-salicru-twin-rt3.jpg', 'SLC TWIN RT2': 'prod-salicru-twin-rt3.jpg', 'SLC TWIN PRO3': 'prod-salicru-twin-pro3.jpg', 'MTW': 'prod-tescom-mtw300.png', 'TDJ (Perkins)': 'prod-tescom-genset-1.jpg', 'TDJ (Volvo Penta)': 'prod-tescom-genset-2.jpg', 'RA / RT (AGM)': 'prod-ritar-ra12-100.webp', 'OPzS': 'prod-hoppecke-opzs.jpg', 'grid power VR M': 'prod-hoppecke-opzs.jpg' };
  const CLIENTS = ['Air Astana', 'АО «КТЖ»', 'Национальный банк РК', 'КазАэроНавигация', 'Степногорская ТЭЦ', 'Эмирмед', 'Клиника Хай-Тек', 'TUSAŞ', 'Зийлан КЗ', 'Mabetex Group', 'Телеканал «Казахстан»', 'Almaty Metrology'];

  const ARTICLES = [
    { slug: 'blog/istochnik-besperebojnogo-pitaniya-dlya-servernogo-oborudovaniya-polnoe-rukovodstvo-po-vyboru/', title: 'ИБП для серверного оборудования: полное руководство по выбору', cat: 'Подбор', date: '2026-09-18', read: 9 },
    { slug: 'blog/tehnicheskoe-obsluzhivanie-promyshlennyh-ibp-pravila-i-reglamenty/', title: 'Техническое обслуживание промышленных ИБП: правила и регламенты', cat: 'Сервис', date: '2026-08-30', read: 7 },
    { slug: 'blog/dizel-generatornaya-ustanovka-podrobnyj-razbor/', title: 'Дизель-генераторная установка: устройство, работа и сферы применения', cat: 'ДГУ', date: '2026-08-12', read: 11 },
    { slug: 'blog/aec-kazakhstan-na-vystavke-kioge-2026/', title: 'AEC Kazakhstan на выставке KIOGE 2026: бесперебойное питание для нефтегазовой отрасли', cat: 'Новости', date: '2026-10-02', read: 4 },
    { slug: 'blog/chto-takoe-ibp-i-dlya-chego-nuzhen-besperebojnik/', title: 'Что такое ИБП и для чего нужен бесперебойник', cat: 'Основы', date: '2026-05-20', read: 6 },
    { slug: 'blog/vybiraem-stabilizator-napryazheniya-dlya-chastnogo-doma/', title: 'Выбираем стабилизатор напряжения для частного дома', cat: 'Подбор', date: '2026-04-11', read: 6 }
  ];

  const FAQ = [
    { q: 'Каков срок службы аккумуляторных батарей ИБП?', a: 'В стандартных условиях АКБ служат от 3 до 5 лет (AGM) и 15–20 лет (OPzV/OPzS). Реальный ресурс зависит от температуры, глубины разрядов и регулярности ТО. Рекомендуем диагностику каждые полгода.' },
    { q: 'Как правильно рассчитать мощность ИБП для объекта?', a: 'Сложите максимальную потребляемую мощность всего оборудования, прибавьте запас 20–30 % и учтите коэффициент мощности. На основе этой цифры подбирается ИБП с нужным временем автономии. Калькулятор на сайте делает это за минуту, инженеры AEC проверяют расчёт бесплатно.' },
    { q: 'Для чего нужно регулярное обслуживание ИБП?', a: 'ТО поддерживает стабильную работу системы, продлевает ресурс батарей и выявляет скрытые неисправности: перегрев, окисление контактов, деградацию конденсаторов и вентиляторов.' },
    { q: 'Какие неисправности чаще выявляются при обслуживании?', a: 'Износ или вздутие батарей, перегрев, пыль и окисление контактов, сбои вентиляторов, ошибки контроллера.' },
    { q: 'Что включает в себя пусконаладка ИБП?', a: 'Проверку подключения, тест батарейных кабинетов, настройку параметров, пробный запуск под нагрузкой (у нас есть собственный нагрузочный модуль 150 кВт) и акт о готовности оборудования.' },
    { q: 'Какие документы подтверждают качество оборудования?', a: 'Сертификаты соответствия ЕАЭС, паспорта, заводские гарантийные талоны и дистрибьюторские письма производителей.' },
    { q: 'Выводите ли вы цены на сайте?', a: 'Для складских позиций указана цена «от» в тенге. Проектное оборудование рассчитывается индивидуально: отправьте запрос КП, ответим в течение рабочего дня.' },
    { q: 'Работаете ли вы за пределами Алматы?', a: 'Да. Поставка, монтаж и сервис по всему Казахстану: Астана, Шымкент, Атырау, Актобе, Караганда, Павлодар, Усть-Каменогорск и другие города.' }
  ];

  const CITIES = [
    { name: 'Алматы', slug: 'almaty', x: 76.95, y: 43.24, hq: true, projects: 2 },
    { name: 'Астана', slug: 'astana', x: 71.43, y: 51.17, projects: 2 },
    { name: 'Шымкент', slug: 'shymkent', x: 69.59, y: 42.32, projects: 0 },
    { name: 'Караганда', slug: 'karaganda', x: 73.09, y: 49.80, projects: 1 },
    { name: 'Атырау', slug: 'atyrau', x: 51.92, y: 47.11, projects: 0 },
    { name: 'Актобе', slug: 'aktobe', x: 57.17, y: 50.28, projects: 0 },
    { name: 'Уральск', slug: 'uralsk', x: 51.37, y: 51.23, projects: 1 },
    { name: 'Павлодар', slug: 'pavlodar', x: 76.96, y: 52.29, projects: 0 },
    { name: 'Усть-Каменогорск', slug: 'ust-kamenogorsk', x: 82.61, y: 49.95, projects: 0 },
    { name: 'Степногорск', slug: 'stepnogorsk', x: 71.88, y: 52.35, projects: 1 },
    { name: 'Актау', slug: 'aktau', x: 51.20, y: 43.65, projects: 0 },
    { name: 'Кызылорда', slug: 'kyzylorda', x: 65.51, y: 44.85, projects: 0 }
  ];

  const TEAM = [
    { name: 'Денис Цой', role: 'Директор' }, { name: 'Жанибек', role: 'Руководитель сервисного отдела' },
    { name: 'Айгуль', role: 'Менеджер проектов' }, { name: 'Айдар', role: 'Менеджер проектов' }, { name: 'Нуркелды', role: 'Менеджер проектов' },
    { name: 'Алишер', role: 'Инженер' }, { name: 'Диас', role: 'Инженер' }, { name: 'Дмитрий', role: 'Инженер' }
  ];

  function fmtPrice(p) { return p ? 'от ' + p.toLocaleString('ru-RU') + ' ₸' : 'Цена по запросу'; }
  function unit(cat) { return cat === 'akb' ? 'А·ч' : cat === 'sts' ? 'А' : 'кВА'; }
  function byId(id) { return P.find(p => p.id === id); }
  function bySlug(slug) { return P.find(p => p.slug === slug); }
  function cat(id) { return CATEGORIES.find(c => c.id === id); }

  return { CONTACT, CATEGORIES, INDUSTRIES, SERVICES, BRANDS, PRODUCTS: P, PROJECTS, CLIENTS, ARTICLES, FAQ, CITIES, TEAM, EXHIBITIONS, REVIEWS, TESTIMONIALS, VIDEOS, CERTS, CLIENT_LOGOS, CAT_PHOTOS, SERIES_PHOTOS, fmtPrice, unit, byId, bySlug, cat };
})();
