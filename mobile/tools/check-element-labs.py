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
            def check_labels():
                clipped=fig.locator('svg text').evaluate_all('''es=>es.flatMap(t=>{const b=t.getBoundingClientRect(),s=t.closest('svg').getBoundingClientRect();return b.width&&(b.left<s.left-1||b.right>s.right+1||b.top<s.top-1||b.bottom>s.bottom+1)?[t.textContent]:[]})''')
                assert not clipped,(name,clipped)
            assert fig.locator('svg').count() > 0, (name, errors)
            assert not fig.locator('svg text').evaluate_all(r'es=>es.some(e=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(e.textContent))'), name
            fig.locator('.el-plot').screenshot(path=str(OUT/(name+'.png')))
            check_labels()
            for control in fig.locator('input[type=range]').all():
                for value in [control.get_attribute('min'), control.get_attribute('max')]:
                    control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}', value)
                    check_labels()
            for control in fig.locator('select').all():
                for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
                    control.select_option(value)
                    check_labels()
            for button in fig.locator('[data-el-preset]').all():
                button.click()
                assert 'NaN' not in fig.inner_text() and 'Infinity' not in fig.inner_text(), name
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
    # Select models through the actual dropdown, keeping the active tab.
    for kind, ids in [('static',['beam','shell','solid']),('modes',['baseline','tip-mass','both-fixed'])]:
        page.goto((DIST/'analysis.html').as_uri()+'#'+kind+'/'+ids[0]+'/quiz',wait_until='domcontentloaded')
        texts=[]
        for model in ids:
            page.set_viewport_size({'width':390,'height':844})
            page.locator('#analysis-example-picker').select_option(model)
            assert page.locator('.aq').get_attribute('data-model')==model
            assert not page.locator('.analysis-scenario-figure svg text').evaluate_all(r'es=>es.some(e=>/[\u3040-\u30fa\u3400-\u9fff]/u.test(e.textContent))'),model
            assert page.locator('[data-analysis-tab=quiz]').get_attribute('aria-selected')=='true'
            texts.append(page.locator('.aq').inner_text())
            qs=page.evaluate('([k,m])=>AnalysisQuiz.resolve(k,m).questions.map(q=>({answer:q.answer,expected:q.verify.check.expect}))',[kind,model])
            for i,q in enumerate(qs):
                card=page.locator('.aq-q').nth(i)
                card.locator('.aq-opt').nth((q['answer']+1)%4).click()
                card.locator('.aq-opt').nth(q['answer']).click()
                assert card.locator('.aq-result').inner_text()=='正解です。'
                card.locator('.aq-check input').fill(str(q['expected']))
                card.locator('.aq-run').click()
                assert '1 倍' in card.locator('.aq-diag').inner_text()
            assert '初回の正解数：0問' in page.locator('.aq-score').inner_text()
            if kind=='modes':
                assert page.locator('.aq-mode-lab').get_attribute('data-mode-model')==model
                assert page.locator('[data-mode-control=mass]').count()==(1 if model=='tip-mass' else 0)
                page.locator('.aq-mode-lab').screenshot(path=str(OUT/('modal-'+model+'.png')))
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(kind,model,width)
            page.locator('[data-analysis-tab=results]').click()
            results=page.locator('[data-analysis-panel=results]').inner_text()
            if model=='both-fixed':
                assert '242.31' in results and '約38.1' not in results
            if model=='tip-mass':
                assert '0.000289952' in results
            page.locator('[data-analysis-tab=quiz]').click()
        assert len(set(texts))==3
        page.locator('#analysis-example-picker').select_option(ids[0])
        assert '初回の正解数：0問' in page.locator('.aq-score').inner_text() # independent model state survives return
    # Latest G0 correction is present, and the misleading assertion is absent.
    page.goto((DIST/'elements.html').as_uri()+'#beam')
    assert 'GA を動かせば GA→G0 は変わります' in page.locator('#beam').inner_text()
    assert not errors, errors
    browser.close()
print(json.dumps({'PASS': report, 'modal_questions': 5, 'page_errors': errors}, ensure_ascii=False))
