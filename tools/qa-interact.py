# Живые сценарии главной: колесо мыши, клик по подсказке, наведение, мобильное меню, модальное окно, reduced motion.
import os, json
from playwright.sync_api import sync_playwright
URL = 'http://localhost:8765/index.html'
OUT = 'shots/qa-int'; os.makedirs(OUT, exist_ok=True)
res = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    # 1. Десктоп: колесо мыши через сценарий
    pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'Failed to load' not in m.text else None)
    pg.add_init_script("sessionStorage.setItem('aecIntro','1')")
    pg.goto(URL); pg.wait_for_timeout(2500)
    pg.mouse.move(700, 450)
    steps = []
    for i in range(16):
        pg.mouse.wheel(0, 260); pg.wait_for_timeout(260)
        if i % 3 == 2:
            pg.wait_for_timeout(600)
            st = pg.evaluate('''() => ({ y: Math.round(scrollY), p: +__aec.heroST.progress.toFixed(2), cap: [...document.querySelectorAll('#caps .cap')].findIndex(c => getComputedStyle(c).visibility !== 'hidden' && +getComputedStyle(c).opacity > .5), dark: document.body.classList.contains('hdr-dark') })''')
            steps.append(st); pg.screenshot(path=f'{OUT}/wheel-{i:02d}.png')
    res['wheel'] = steps
    # 2. Подсказка: клик прокручивает к началу сценария
    pg.evaluate('__aec.lenis.scrollTo(0, {immediate: true})'); pg.wait_for_timeout(800)
    pg.click('#cue'); pg.wait_for_timeout(2400)
    res['cue_progress'] = pg.evaluate('+__aec.heroST.progress.toFixed(2)')
    # 3. Наведение на карточку оборудования
    pg.evaluate("document.querySelector('#eqGrid').scrollIntoView({block:'center'})"); pg.evaluate("__aec.lenis.scrollTo(document.querySelector('#eqGrid'), {immediate:true, offset:-200})"); pg.wait_for_timeout(1500)
    card = pg.locator('.eq').nth(1); card.hover(); pg.wait_for_timeout(800)
    res['eq_hover_color'] = pg.evaluate("getComputedStyle(document.querySelectorAll('.eq')[1]).color")
    pg.screenshot(path=f'{OUT}/eq-hover.png')
    # 4. Магнитная кнопка
    pg.evaluate('__aec.lenis.scrollTo(0, {immediate: true})'); pg.wait_for_timeout(900)
    bx = pg.locator('#intro .btn').first.bounding_box(); pg.mouse.move(bx['x'] + bx['width'] - 4, bx['y'] + 4); pg.wait_for_timeout(700)
    res['magnetic_transform'] = pg.evaluate("getComputedStyle(document.querySelector('#intro .btn')).transform")
    # 5. Модальное окно и блокировка прокрутки
    pg.evaluate("__aec.lenis.scrollTo(document.querySelector('[data-open-modal]'), {immediate:true, offset:-300})"); pg.wait_for_timeout(1200)
    pg.click('[data-open-modal]'); pg.wait_for_timeout(600)
    y0 = pg.evaluate('scrollY'); pg.mouse.wheel(0, 600); pg.wait_for_timeout(700); y1 = pg.evaluate('scrollY')
    res['modal_open'] = pg.evaluate("document.querySelector('#modal').classList.contains('open')"); res['modal_scroll_locked'] = abs(y1 - y0) < 5
    pg.screenshot(path=f'{OUT}/modal.png')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
    res['errors_desktop'] = errs
    pg.close()
    # 6. Телефон: меню и касания
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    pm = ctx.new_page(); errs2 = []
    pm.on('pageerror', lambda e: errs2.append(str(e)))
    pm.add_init_script("sessionStorage.setItem('aecIntro','1')")
    pm.goto(URL); pm.wait_for_timeout(2500)
    pm.click('[data-open-menu]'); pm.wait_for_timeout(700)
    res['m_menu_open'] = pm.evaluate("document.querySelector('#mmenu').classList.contains('open')")
    pm.screenshot(path=f'{OUT}/m-menu.png')
    pm.click('[data-close-menu]'); pm.wait_for_timeout(500)
    for y in (300, 900, 1600, 2400):
        pm.evaluate(f'window.scrollTo(0, {y})'); pm.wait_for_timeout(900)
    res['m_story_progress_at_2400'] = pm.evaluate('+__aec.heroST.progress.toFixed(2)')
    pm.evaluate("document.querySelector('#pjTrack').scrollIntoView()"); pm.wait_for_timeout(900)
    pm.evaluate("document.querySelector('#pjTrack').scrollBy({left: 300})"); pm.wait_for_timeout(700)
    res['m_projects_scrollLeft'] = pm.evaluate("document.querySelector('#pjTrack').scrollLeft")
    pm.screenshot(path=f'{OUT}/m-projects.png')
    res['errors_mobile'] = errs2
    ctx.close()
    # 7. Reduced motion
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    pr = ctx.new_page(); errs3 = []
    pr.on('pageerror', lambda e: errs3.append(str(e)))
    pr.goto(URL); pr.wait_for_timeout(1500)
    res['rm_loader_hidden'] = pr.evaluate("getComputedStyle(document.querySelector('#loader')).display === 'none'")
    res['rm_h1_visible'] = pr.evaluate("getComputedStyle(document.querySelector('#heroTitle')).visibility")
    res['rm_pins'] = pr.evaluate('ScrollTrigger.getAll().filter(s => s.pin).length')
    pr.screenshot(path=f'{OUT}/rm-hero.png')
    pr.evaluate('window.scrollTo(0, 3000)'); pr.wait_for_timeout(600); pr.screenshot(path=f'{OUT}/rm-3000.png')
    res['rm_hidden'] = pr.evaluate('''() => [...document.querySelectorAll('.js-up, .eq, .js-lines, .manifest p')].filter(e => parseFloat(getComputedStyle(e).opacity) < .9).length''')
    res['errors_rm'] = errs3
    ctx.close(); b.close()
print(json.dumps(res, ensure_ascii=False, indent=1))
