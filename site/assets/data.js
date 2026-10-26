/* AEC Kazakhstan — данные прототипа. Каталог товаров (PRODUCTS) собирается из assets/catalog.js,
   который генерируется tools/build-catalog.py из выгрузки WooCommerce текущего сайта aecups.kz. */
window.AEC = (function () {
  const CONTACT = {
    phone: '+7 708 366 38 89',
    phoneRaw: '77083663889',
    email: 'info@aecups.kz',
    address: 'г. Алматы, ул. Чаплина 71/66, БЦ «Станица», 4 этаж, офис А01',
    hours: 'Пн–Пт 9:00–18:00',
    whatsapp: 'https://api.whatsapp.com/send/?phone=77083663889&text=' + encodeURIComponent('Здравствуйте! Пишу с сайта aecups.kz.'),
    instagram: 'https://www.instagram.com/aec_kazakhstan/',
    youtube: 'https://www.youtube.com/@AEC_Kazakhstan',
    twogis: 'https://2gis.kz/almaty/firm/70000001060760363',
    geo: [43.285354, 76.982936], twogisRating: '5,0', twogisReviews: 9,
    bin: '211240034245',
    legal: 'ТОО «AEC Kazakhstan» (Almaty Electro Consult)'
  };

  const CATEGORIES = [
    { id: 'ibp', slug: 'product-category/ibp-istochniki-besperebojnogo-pitaniya/', name: 'ИБП', full: 'Источники бесперебойного питания', range: '0,7 кВА – 4800 кВт', min: 0.7, max: 1200, unit: 'кВА', img: 'ups', count: 233,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные', hint: '1–10 кВА, серверные и кабинеты' },
        { id: 'tryohfaznye', name: 'Трёхфазные', hint: '10–1200 кВА' },
        { id: 'modulnye', name: 'Модульные', hint: 'горячая замена, N+1' },
        { id: 'stoechnye', name: 'Стоечные (Rack)', hint: '19" 2U–6U' },
        { id: 'batarejnye-shkafy', name: 'Батарейные шкафы и модули', hint: '' },
        { id: 'aksessuary', name: 'Аксессуары', hint: 'SNMP-карты, байпасы, датчики' }
      ] },
    { id: 'dgu', slug: 'product-category/generatory-2/', name: 'Дизельные генераторы', full: 'Дизельные генераторные установки (ДГУ)', range: '10 кВА – 4,25 МВА', min: 10, max: 3750, unit: 'кВА', img: 'genset', count: 22,
      subs: [
        { id: 'otkrytye', name: 'Открытого исполнения', hint: 'для машзалов' },
        { id: 'v-kozhuhe', name: 'В шумозащитном кожухе', hint: '≤ 72 дБ(А)' },
        { id: 'v-kontejnere', name: 'В контейнере', hint: 'всепогодные, с АВР' },
        { id: 'avr', name: 'АВР и панели управления', hint: '' }
      ] },
    { id: 'akb', slug: 'product-category/akb/', name: 'Аккумуляторные батареи', full: 'Стационарные аккумуляторные батареи', range: '7–3250 А·ч', min: 7, max: 3250, unit: 'А·ч', img: 'battery', count: 198,
      subs: [
        { id: '12v', name: '12 В AGM / GEL', hint: 'для ИБП до 200 кВА' },
        { id: '2v', name: '2 В OPzV / OPzS', hint: 'срок службы 15–20 лет' },
        { id: '6v', name: '6 В', hint: 'блоки OPzS / OPzV' },
        { id: 'li-ion', name: 'Литий-ионные', hint: 'LiFePO4' },
        { id: 'stellazhi', name: 'Стеллажи и шкафы', hint: '' }
      ] },
    { id: 'stab', slug: 'product-category/stabilizatory/', name: 'Стабилизаторы напряжения', full: 'Стабилизаторы напряжения', range: '0,3–5000 кВА', min: 0.3, max: 3200, unit: 'кВА', img: 'stab', count: 124,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные', hint: '220 В' },
        { id: 'tryohfaznye', name: 'Трёхфазные', hint: '380 В' },
        { id: 'relejnye', name: 'Релейные', hint: 'ступенчатые, бюджетные' },
        { id: 'elektromehanicheskie', name: 'Электромеханические', hint: 'высокая перегрузочная способность' },
        { id: 'elektronnye', name: 'Электронные (тиристорные)', hint: 'без износа' }
      ] },
    { id: 'sts', slug: 'product-category/staticheskie-pereklyuchateli-sts/', name: 'Статические переключатели (STS)', full: 'Статические переключатели нагрузки', range: '32–1250 А', min: 32, max: 1250, unit: 'А', img: 'sts', count: 25,
      subs: [
        { id: 'odnofaznye', name: 'Однофазные (STS2000)', hint: '' },
        { id: 'tryohfaznye', name: 'Трёхфазные (STS3000 / STS4000)', hint: '3- и 4-полюсные' }
      ] },
    { id: 'gpes', slug: 'product-category/gazoporshnevye-elektrostancii/', name: 'Газопоршневые электростанции', full: 'Газопоршневые электростанции (ГПЭС)', range: '400–4500 кВт', img: 'genset', count: 0, soon: true, subs: [] },
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
    { id: 'service', slug: 'uslugi/obsluzhivanie-ibp/', name: 'Сервисное обслуживание ИБП', short: 'Сервисное обслуживание', text: 'Плановое ТО по регламенту, сервисный договор, SLA по выезду', icon: 'shield', price: 'по запросу', query: 'обслуживание источников бесперебойного питания' },
    { id: 'remont', slug: 'uslugi/remont-ibp/', name: 'Ремонт ИБП', short: 'Ремонт ИБП', text: 'Диагностика, замена силовых модулей, плат, вентиляторов. Любые бренды', icon: 'repair', price: 'по запросу', query: 'ремонт ибп' },
    { id: 'zamena', slug: 'uslugi/zamena-batarej-ibp/', name: 'Замена батарей ИБП', short: 'Замена батарей', text: 'Подбор АКБ, замена без остановки нагрузки, утилизация старых батарей', icon: 'battery', price: 'по запросу', query: 'замена батарей ибп' },
    { id: 'diagnostika', slug: 'uslugi/diagnostika-batarej/', name: 'Диагностика батарей', short: 'Диагностика батарей', text: 'Контрольный разряд без отключения ИБП, Fluke VT521, отчёт по каждой банке', icon: 'gauge', price: 'по запросу', query: 'диагностика аккумуляторов ибп' },
    { id: 'obsledovanie', slug: 'uslugi/obsledovanie-sistemy/', name: 'Обследование системы электропитания', short: 'Обследование системы', text: 'Аудит нагрузок, тепловизионный контроль, отчёт с рекомендациями', icon: 'search', price: 'по запросу', query: 'аудит системы электроснабжения' },
    { id: 'konsultaciya', slug: 'uslugi/predproektnaya-konsultacziya/', name: 'Предпроектная консультация и подбор', short: 'Предпроектная консультация', text: 'Расчёт нагрузки и автономии, схема резервирования, спецификация для тендера', icon: 'ruler', price: 'бесплатно', query: 'подбор ибп' }
  ];

  const BRANDS = [
    { id: 'tescom', name: 'Tescom', country: 'Турция', type: 'ИБП, ДГУ, стабилизаторы, STS', status: 'Официальный дистрибьютор', logo: 'brand-tescom.svg' },
    { id: 'salicru', name: 'Salicru', country: 'Испания', type: 'ИБП, стабилизаторы', status: 'Официальный дистрибьютор', logo: 'brand-salicru.svg' },
    { id: 'kehua-tech', name: 'Kehua Tech', country: 'Китай', type: 'ИБП, модульные системы', status: 'Официальный партнёр', logo: 'brand-kehua-tech.svg' },
    { id: 'hoppecke', name: 'Hoppecke', country: 'Германия', type: 'Аккумуляторы OPzS / OPzV', status: 'Партнёр' },
    { id: 'bae-batterien', name: 'BAE Batterien', country: 'Германия', type: 'Аккумуляторы Secura', status: 'Партнёр', logo: 'brand-bae-batterien.svg' },
    { id: 'energrid', name: 'EnerGrid', country: 'Китай', type: 'Аккумуляторы AGM', status: 'Партнёр' },
            { id: 'sprinter', name: 'Exide', country: 'Германия', type: 'Аккумуляторы', status: 'Партнёр' },
    { id: 'bereli', name: 'Bereli', country: 'Турция', type: 'Аккумуляторы AGM', status: 'Партнёр' },
    { id: 'yuasa', name: 'Yuasa', country: 'Япония', type: 'Аккумуляторы', status: 'Партнёр' },
    { id: 'enersys', name: 'EnerSys', country: 'США', type: 'Аккумуляторы', status: 'Партнёр' },
    { id: 'agg', name: 'AGG Power', country: 'Великобритания / Китай', type: 'ДГУ', status: 'Партнёр' },
    { id: 'baifa', name: 'BAIFA Power', country: 'Китай', type: 'ДГУ', status: 'Партнёр', logo: 'brand-baifa.svg' },
    { id: 'everexceed', name: 'EverExceed', country: 'Китай', type: 'Аккумуляторы, стабилизаторы', status: 'Партнёр' },
    { id: 'socomec', name: 'Socomec', country: 'Франция', type: 'ИБП, STS', status: 'Под заказ', logo: 'brand-socomec.svg' },
    { id: 'leega', name: 'LEEGA', country: 'Китай', type: 'ДГУ', status: 'Под заказ', logo: 'brand-leega.svg' },
    { id: 'cummins', name: 'Cummins', country: 'США', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-cummins.svg' },
    { id: 'perkins', name: 'Perkins', country: 'Великобритания', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-perkins.svg' },
    { id: 'volvo-penta', name: 'Volvo Penta', country: 'Швеция', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-volvo-penta.svg' },
    { id: 'mtu', name: 'MTU', country: 'Германия', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-mtu.svg' },
    { id: 'scania', name: 'Scania', country: 'Швеция', type: 'Двигатели ДГУ', status: 'Двигатели' },
    { id: 'deutz', name: 'Deutz', country: 'Германия', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-deutz.svg' },
    { id: 'doosan', name: 'Doosan', country: 'Корея', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-doosan.svg' },
    { id: 'baudouin', name: 'Baudouin', country: 'Франция', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-baudouin.svg' },
    { id: 'sdec', name: 'SDEC', country: 'Китай', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-sdec.svg' },
    { id: 'yto', name: 'YTO', country: 'Китай', type: 'Двигатели ДГУ', status: 'Двигатели', logo: 'brand-yto.svg' },
    { id: 'hyundai', name: 'Hyundai', country: 'Корея', type: 'Двигатели ДГУ', status: 'Двигатели' },
    { id: 'stamford-avk', name: 'Stamford AVK', country: 'Великобритания', type: 'Генераторы переменного тока', status: 'Альтернаторы', logo: 'brand-stamford-avk.svg' },
    { id: 'mecc-alte', name: 'Mecc Alte', country: 'Италия', type: 'Генераторы переменного тока', status: 'Альтернаторы', logo: 'brand-mecc-alte.svg' },
    { id: 'nidec-leroy-somer', name: 'Nidec Leroy-Somer', country: 'Франция', type: 'Генераторы переменного тока', status: 'Альтернаторы', logo: 'brand-nidec-leroy-somer.svg' }
  ];

  // ---------- Каталог: реальные товары aecups.kz (assets/catalog.js, собирается tools/build-catalog.py) ----------
  const LEAD = { ibp: '4–6 недель', dgu: '8–12 недель', akb: '2–4 недели', stab: '3–5 недель', sts: '6–8 недель' };
  const RAW = (window.AEC_CATALOG && window.AEC_CATALOG.products) || [];
  const P = RAW.map(r => Object.assign({
    price: null, stock: 'order', lead: LEAD[r.cat] || '4–6 недель', sku: '', series: '', sub: [], kw: r.kva, kvaMax: null, kwMax: null,
    photo: null, photos: r.photo ? [r.photo] : [], industries: [], docs: [], spec: {},
    phases: '', topology: '', form: '', arch: '', pf: 1, eff: '', battery: '', interfaces: [], ip: '', warranty: null, dims: '', weight: '', parallel: ''
  }, r));
  // Полные таблицы характеристик и описания (assets/catalog-details.js подключается только на карточке товара)
  function details(id) { const d = window.AEC_CATALOG_DETAILS; return (d && d[id]) || null; }
  // Диапазон мощности: у серий ДГУ задан kva…kvaMax
  function kvaRange(p) { return [p.kva, p.kvaMax || p.kva]; }
  function inRange(p, min, max) { const r = kvaRange(p); return (min == null || r[1] >= min) && (max == null || r[0] <= max); }

  BRANDS.forEach(b => { b.count = P.filter(p => p.brandId === b.id || (p.cat === 'dgu' && (p.spec['Двигатель'] || '').toLowerCase().split(' ')[0] === b.name.toLowerCase().split(' ')[0])).length; });
  CATEGORIES.forEach(c => { const n = P.filter(p => p.cat === c.id).length; if (n) c.count = n; });

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
    { id: 'power-expo-2024', name: 'POWER EXPO 2024', city: 'Алматы', year: 2024, theme: 'энергетика', photos: ['exh-powerexpo2024-1.jpg', 'exh-powerexpo2024-2.jpg', 'exh-powerexpo2024-3.jpg', 'exh-powerexpo2024-4.jpg', 'exh-powerexpo2024-5.jpg', 'exh-powerexpo2024-6.jpg'] }
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
  const STAFF_PHOTOS = ['staff-1.png', 'staff-2.png', 'staff-3.png', 'staff-4.png', 'staff-5.png', 'staff-6.png'];
  const CAT_PHOTOS = { ibp: 'cat-ibp-photo.jpg', dgu: 'dgu-photo-8.jpg', akb: 'cat-akb-photo.jpg', stab: 'cat-stab-photo.jpg', sts: 'products/thumbnailgenerator.jpg', gpes: 'cat-gpes-photo.jpg', zvu: 'cat-zvu-photo.jpg', inv: 'cat-inv-photo.jpg', freq: 'cat-freq-photo.jpg', trafo: 'cat-trafo-photo.jpg', ips: 'cat-ips-photo.jpg' }; // gpes: AGG Power (aggpower.com); zvu/inv/freq/trafo/ips: Tescom (tescom-ups.com, каталог MIP)
  const DGU_PHOTOS = ['dgu-photo-1.jpg', 'dgu-photo-2.jpg', 'dgu-photo-3.jpg', 'dgu-photo-4.jpg', 'dgu-photo-5.jpg', 'dgu-photo-6.jpg', 'dgu-photo-7.jpg', 'dgu-photo-8.jpg', 'dgu-photo-9.jpg', 'dgu-photo-10.jpg', 'dgu-photo-11.jpg'];
  const SERIES_PHOTOS = { 'SLC ADAPT2': 'prod-salicru-adapt2.jpg', 'SLC TWIN RT3': 'prod-salicru-twin-rt3.jpg', 'SLC TWIN RT2': 'prod-salicru-twin-rt3.jpg', 'SLC TWIN PRO3': 'prod-salicru-twin-pro3.jpg', 'MTW': 'prod-tescom-mtw300.png', 'TDJ (Perkins)': 'prod-tescom-genset-1.jpg', 'TDJ (Volvo Penta)': 'prod-tescom-genset-2.jpg', 'RA': 'prod-ritar-ra12-100.webp', 'OPzS': 'prod-hoppecke-opzs.jpg', 'grid power VR M': 'prod-hoppecke-opzs.jpg' };
  P.forEach(p => { if (p.photo && !SERIES_PHOTOS[p.series]) SERIES_PHOTOS[p.series] = 'products/' + p.photo; });
  const CLIENTS = ['Air Astana', 'АО «КТЖ»', 'Национальный банк РК', 'КазАэроНавигация', 'Степногорская ТЭЦ', 'Эмирмед', 'Клиника Хай-Тек', 'TUSAŞ', 'Зийлан КЗ', 'Mabetex Group', 'Телеканал «Казахстан»', 'Almaty Metrology'];

  const ARTICLES = [
    { slug: 'blog/istochnik-besperebojnogo-pitaniya-dlya-servernogo-oborudovaniya-polnoe-rukovodstvo-po-vyboru/', title: 'ИБП для серверного оборудования: полное руководство по выбору', cat: 'Подбор', date: '2026-09-18', read: 9, cover: 'blog-ibp-server.png' },
    { slug: 'blog/tehnicheskoe-obsluzhivanie-promyshlennyh-ibp-pravila-i-reglamenty/', title: 'Техническое обслуживание промышленных ИБП: правила и регламенты', cat: 'Сервис', date: '2026-08-30', read: 7, cover: 'blog-to-ibp.jpg' },
    { slug: 'blog/dizel-generatornaya-ustanovka-podrobnyj-razbor/', title: 'Дизель-генераторная установка: устройство, работа и сферы применения', cat: 'ДГУ', date: '2026-08-12', read: 11, cover: 'blog-dgu.jpg' },
    { slug: 'blog/aec-kazakhstan-na-vystavke-kioge-2026/', title: 'AEC Kazakhstan на выставке KIOGE 2026: бесперебойное питание для нефтегазовой отрасли', cat: 'Новости', date: '2026-10-02', read: 4, cover: 'blog-kioge-cover.jpg' },
    { slug: 'blog/chto-takoe-ibp-i-dlya-chego-nuzhen-besperebojnik/', title: 'Что такое ИБП и для чего нужен бесперебойник', cat: 'Основы', date: '2026-05-20', read: 6, cover: 'blog-chto-takoe-ibp.jpg' },
    { slug: 'blog/vybiraem-stabilizator-napryazheniya-dlya-chastnogo-doma/', title: 'Выбираем стабилизатор напряжения для частного дома', cat: 'Подбор', date: '2026-04-11', read: 6, cover: 'blog-stab-dom.jpg' },
    { slug: 'blog/inzhenernoe-rukovodstvo-sistemy-hraneniya-energii/', title: 'Инженерное руководство по проектированию, мониторингу и сервису промышленных систем хранения энергии', cat: 'Сервис', date: '2026-08-26', read: 8, cover: 'blog-ess.jpg' },
    { slug: 'blog/kak-rasschitat-moshchnost-ibp/', title: 'Как рассчитать мощность ИБП: кВА, кВт и коэффициент мощности', cat: 'Подбор', date: '2026-10-08', read: 6, cover: 'proj-lab-2.jpg' },
    { slug: 'blog/srok-sluzhby-batarej-ibp/', title: 'Сколько служат батареи ИБП и когда их менять', cat: 'Сервис', date: '2026-09-29', read: 6, cover: 'proj-ktz-3.jpg' },
    { slug: 'blog/dizelnyj-generator-dlya-biznes-centra/', title: 'Дизельный генератор для бизнес-центра: мощность, АВР, шум и размещение', cat: 'ДГУ', date: '2026-09-22', read: 7, cover: 'dgu-photo-8.jpg' },
    { slug: 'blog/ibp-dlya-medicinskogo-oborudovaniya/', title: 'ИБП для медицинского оборудования: рентген, КТ, МРТ и операционные', cat: 'Решения', date: '2026-09-10', read: 6, cover: 'proj-uralsk-3.jpg' },
    { slug: 'blog/modulnyj-ili-monoblochnyj-ibp/', title: 'Модульный или моноблочный ИБП: что выбрать для серверной и ЦОД', cat: 'Подбор', date: '2026-08-14', read: 6, cover: 'proj-lab-1.jpg' },
    { slug: 'blog/stabilizator-dlya-stankov-chpu/', title: 'Стабилизатор напряжения для станков с ЧПУ и производственных линий', cat: 'Подбор', date: '2026-07-22', read: 6, cover: 'cat-stab-photo.jpg' }
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
    { name: 'Денис Цой', role: 'Директор', photo: 'team-denis.jpg' }, { name: 'Жанибек', role: 'Руководитель сервисного отдела', photo: 'team-zhanibek.jpg' },
    { name: 'Айгуль', role: 'Менеджер проектов', photo: 'team-aigul.jpg' }, { name: 'Айдар', role: 'Менеджер проектов', photo: 'team-aidar.jpg' }, { name: 'Нуркелды', role: 'Менеджер проектов', photo: 'team-nurkeldy.jpg' },
    { name: 'Алишер', role: 'Инженер', photo: 'team-alisher.jpg' }, { name: 'Диас', role: 'Инженер', photo: 'team-dias.jpg' }, { name: 'Дмитрий', role: 'Инженер', photo: 'team-dmitriy.jpg' }
  ];

  function fmtPrice(p) { return p ? 'от ' + p.toLocaleString('ru-RU') + ' ₸' : 'Цена по запросу'; }
  function unit(cat) { return cat === 'akb' ? 'А·ч' : cat === 'sts' ? 'А' : 'кВА'; }
  function byId(id) { return P.find(p => p.id === id); }
  function bySlug(slug) { return P.find(p => p.slug === slug); }
  function cat(id) { return CATEGORIES.find(c => c.id === id); }

  return { CONTACT, CATEGORIES, INDUSTRIES, SERVICES, BRANDS, PRODUCTS: P, PROJECTS, CLIENTS, ARTICLES, FAQ, CITIES, TEAM, EXHIBITIONS, REVIEWS, TESTIMONIALS, VIDEOS, CERTS, CLIENT_LOGOS, CAT_PHOTOS, SERIES_PHOTOS, STAFF_PHOTOS, DGU_PHOTOS, fmtPrice, unit, byId, bySlug, cat, details, kvaRange, inRange };
})();
