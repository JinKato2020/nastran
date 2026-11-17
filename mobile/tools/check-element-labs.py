"""Exercise all new element figures and SOL 103 questions in the local HTML reader."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'sites/nastran-learning/dist'
OUT = ROOT / 'mobile/.qa/element-labs-review'
OUT.mkdir(exist_ok=True, parents=True)
errors, report = [], []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.on('pageerror', lambda e: errors.append(str(e)))
    for key, expected in [('scalar', 5), ('shell', 6), ('solid', 7)]:
        page.goto((DIST/'elements.html').as_uri()+'#'+key, wait_until='domcontentloaded')
        page.reload(wait_until='domcontentloaded')
        page.set_viewport_size({'width': 390, 'height': 844})
        article = page.locator('article[data-element='+key+']')
        article.wait_for(state='visible')
        figures = article.locator('[data-element-lab]')
        assert figures.count() == expected
        names = []
        for fig in figures.all():
            name = fig.get_attribute('data-element-lab')
            names.append(name)
            assert fig.locator('svg').count() > 0, (name, errors)
            assert not fig.locator('svg text').evaluate_all(r'es=>es.some(e=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(e.textContent))'), name
            fig.locator('.el-plot').screenshot(path=str(OUT/(name+'.png')))
            for control in fig.locator('input[type=range]').all():
                for value in [control.get_attribute('min'), control.get_attribute('max')]:
                    control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}', value)
            for control in fig.locator('select').all():
                for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
                    control.select_option(value)
            assert 'NaN' not in fig.inner_text() and 'Infinity' not in fig.inner_text(), name
        for width in [320, 390, 768]:
            page.set_viewport_size({'width': width, 'height': 844})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (key, width)
        report.append({key: names})
    page.set_viewport_size({'width': 390, 'height': 844})
    page.goto((DIST/'analysis.html').as_uri()+'#modes/baseline/quiz', wait_until='domcontentloaded')
    page.locator('.aq-q').first.wait_for(state='visible')
    assert page.locator('.aq-q').count() == 5
    page.locator('.aq-mode-lab').screenshot(path=str(OUT/'modal.png'))
    questions = page.evaluate('window.AnalysisQuiz.data.modes.questions.map(q=>({answer:q.answer,expected:q.verify.check.expect}))')
    for i, q in enumerate(questions):
        card = page.locator('.aq-q').nth(i)
        card.locator('.aq-opt').nth((q['answer']+1)%4).click()
        assert '不正解' in card.locator('.aq-result').inner_text()
        card.locator('.aq-opt').nth(q['answer']).click()
        assert '正解です' in card.locator('.aq-result').inner_text()
        card.locator('input').fill(str(q['expected']))
        card.locator('.aq-run').click()
        assert '1 倍' in card.locator('.aq-diag').inner_text()
    for control in page.locator('[data-mode-control]').all():
        for value in [control.get_attribute('min'), control.get_attribute('max')]:
            control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}', value)
    for width in [320, 390, 768]:
        page.set_viewport_size({'width': width, 'height': 844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), ('quiz', width)
    assert not errors, errors
    browser.close()
print(json.dumps({'PASS': report, 'modal_questions': 5, 'page_errors': errors}, ensure_ascii=False))
