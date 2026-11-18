"""Exercise the actual inlined mobile reader bridge in Edge. No iOS simulation claim."""
from pathlib import Path
import base64
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
bundle=json.loads((ROOT/'src/generated/lessons.json').read_text(encoding='utf-8'))
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    def reader(name,width=390):
        # Playwright polling uses eval; this harness-only option leaves shipped CSP unchanged.
        page=browser.new_page(viewport={'width':width,'height':844},bypass_csp=True)
        page.on('pageerror',lambda e:errors.append(str(e)))
        # Acknowledgements mimic the native transport, while testing real DOM/Blob code.
        page.evaluate('''() => {window.messages=[];window.ReactNativeWebView={postMessage(raw){const m=JSON.parse(raw);messages.push(m);if(m.id)setTimeout(()=>window.__nastranReply(m.id,true),0);}};}''')
        page.set_content((ROOT/'.qa/reader'/name).read_text(encoding='utf-8'),wait_until='load')
        page.wait_for_function('messages.some(m=>m.type==="ready")')
        return page
    for l in bundle['catalog']:
        page=reader(l['id'],320)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),l['id']
        page.close()
    page=reader('index.html')
    assert page.locator('#progress-text').inner_text()=='2 / 11'
    page.locator('#chapter-1 .learning-legacy summary').click()
    page.locator('[data-complete="1"]').uncheck()
    assert page.evaluate('messages.filter(m=>m.type==="progress").at(-1).value')=='[3]'
    page.locator('#chapter-1 .learning-next').click()
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#chapter-2")')
    page.locator('#chapter-2 .learning-next').click()
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#chapter-3")')
    page.locator('#chapter-3 #course-complete').check()
    assert page.evaluate('messages.filter(m=>m.type==="courseProgress").at(-1).value')=='["purpose"]'
    page.locator('#chapter-3 .learning-next').click()
    assert page.evaluate('messages.filter(m=>m.type==="navigate").at(-1).path')=='basics.html'
    page.evaluate("location.hash='lab'")
    page.locator('.live-code>summary').click()
    page.locator('#download-deck').click()
    page.wait_for_function('messages.some(m=>m.type==="share")')
    m=page.evaluate('messages.filter(m=>m.type==="share").at(-1)')
    deck=base64.b64decode(m['base64']).decode('ascii')
    assert m['name']=='axial_rod.bdf' and 'BEGIN BULK' in deck
    assert all(len(l)==80 for l in deck.split('BEGIN BULK\n')[1].split('ENDDATA')[0].splitlines())
    page.close()
    page=reader('include.html')
    page.select_option('#include-load','2000')
    page.locator('#save-include').click()
    page.wait_for_function('messages.some(m=>m.type==="share")')
    m=page.evaluate('messages.filter(m=>m.type==="share").at(-1)')
    data=base64.b64decode(m['base64'])
    assert m['name']=='main.bdf' and b"INCLUDE 'load_2000.inc'\r\n" in data
    assert b'\n' not in data.replace(b'\r\n',b'')
    page.locator('#copy-include').click()
    page.wait_for_function('messages.some(m=>m.type==="copy")')
    assert page.evaluate('messages.filter(m=>m.type==="copy").at(-1).text').encode('ascii')==data
    page.locator('a[download]').click()
    assert page.evaluate('messages.filter(m=>m.type==="asset").at(-1).path')=='downloads/nastran_include_example.zip'
    page.locator('#include-parent [data-open-file="mesh.inc"]').click()
    page.locator('#include-fields a[href="bulk.html#GRID"]').first.click()
    assert page.evaluate('messages.filter(m=>m.type==="navigate").at(-1).hash')=='#GRID'
    page.locator('.guide-sources a').first.click()
    assert page.evaluate('messages.filter(m=>m.type==="external").at(-1).url').startswith('https://documentation-be.hexagon.com/')
    page.locator('.include-view').screenshot(path=str(ROOT/'.qa/include-reader.png'))
    page.close()
    page=reader('batch.html')
    page.select_option('#script-choice','run_two_parallel.bat')
    page.locator('#save-batch').click()
    page.wait_for_function('messages.some(m=>m.type==="share")')
    m=page.evaluate('messages.filter(m=>m.type==="share").at(-1)')
    assert m['name']=='run_two_parallel.bat'
    assert base64.b64decode(m['base64'])==(ROOT.parent/'sites/nastran-learning/dist/downloads/run_two_parallel.bat').read_bytes()
    page.close()
    page=reader('bulk.html')
    page.select_option('#input-family','bulk')
    page.select_option('#category','拘束・結合')
    page.select_option('#card-picker','SPC1')
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#SPC1")')
    assert page.locator('.card-title h2').inner_text()=='SPC1'
    page.select_option('#input-family','parameter')
    page.select_option('#category','質量・単位')
    page.select_option('#card-picker','PARAM_WTMASS')
    page.locator('[data-entry-field="0:2"]').click()
    page.wait_for_function('messages.some(m=>m.type==="position"&&decodeURIComponent(m.hash)==="#PARAM_WTMASS/0:2")')
    page.locator('.code-box>summary').click()
    page.locator('#save-card').click()
    page.wait_for_function('messages.some(m=>m.type==="share")')
    m=page.evaluate('messages.filter(m=>m.type==="share").at(-1)')
    assert base64.b64decode(m['base64']).decode('ascii')==page.locator('#card-raw').text_content()
    page.select_option('#input-family','case')
    page.select_option('#category','荷重・拘束')
    page.select_option('#card-picker','CASE_LOAD')
    page.locator('#copy-card').click()
    page.wait_for_function('messages.some(m=>m.type==="copy"&&m.text==="LOAD = 20\\n")')
    page.close()
    for name,target in [('dynamics.html','theory.html#modes'),('fracture.html','theory.html#fracture'),('relations.html','analysis.html#static/beam/input')]:
        page=reader(name)
        assert page.locator('script').count()==1,name  # only the native bridge; retired pages carry no code
        page.locator(f'a[href="{target}"]').click()
        path,hash=target.split('#')
        page.wait_for_function('(t)=>messages.some(m=>m.type==="navigate"&&m.path===t[0]&&m.hash==="#"+t[1])',arg=[path,hash])
        page.close()
    page=reader('theory.html')
    page.evaluate("location.hash='#direct-frequency'")
    page.locator('[data-lab="lab-frf"] svg').wait_for()
    page.locator('[data-lab="lab-frf"] [data-lab-action="fn"]').click()
    assert 'U = 25 mm' in page.locator('[data-lab="lab-frf"] .theory-lab-readout').inner_text()
    page.select_option('[data-lab="lab-frf"] select','0.05')
    assert 'U = 10 mm' in page.locator('[data-lab="lab-frf"] .theory-lab-readout').inner_text()
    page.evaluate("location.hash='#damping'")
    conversion=page.locator('[data-damping-lab="conversion"]')
    conversion.locator('input').evaluate('e=>{e.value=5;e.dispatchEvent(new Event("input",{bubbles:true}));}')
    assert '5% = 0.05' in conversion.inner_text()
    assert conversion.locator('tr').filter(has_text='TABDMP1: Q').inner_text().find('10')>=0
    assert page.locator('[data-damping-lab="rayleigh"] svg').count()==1
    page.locator('.theory-quiz summary').first.click()
    assert page.locator('.theory-quiz details[open]').count()==1
    page.evaluate("location.hash='#transient'")
    page.locator('[data-lab="lab-pulse"] svg').first.wait_for()
    assert page.locator('[data-lab="lab-pulse"] svg').count()==2
    page.evaluate("location.hash='#fracture'")
    assert '398.9 MPa' in page.locator('[data-lab="lab-crack"] .theory-lab-readout').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    # Numbered TOC links stay inside the selected article in the real reader.
    page.evaluate("location.hash='#damping'")
    page.locator('#damping-units').wait_for()
    control=page.locator('[data-damping-lab] input[type=range]').first
    control.evaluate('e=>{e.value=e.min;e.dispatchEvent(new Event("input",{bubbles:true}));}')
    before=page.locator('[data-damping-lab] input').evaluate_all('es=>es.map(e=>e.value)')
    page.locator('.element-toc a[data-jump="damping-units"]').click()
    assert page.evaluate('location.hash')=='#damping'
    assert page.evaluate('document.activeElement.closest("section").id')=='damping-units'
    assert page.locator('[data-damping-lab] input').evaluate_all('es=>es.map(e=>e.value)')==before
    page.evaluate("location.hash='#materials/composites'")
    page.locator('#materials-shell-property').wait_for()
    assert page.locator('.theory-section').count()==23
    page.locator('[data-material-lab="laminate"] select').select_option('unsym')
    page.locator('.element-toc a[data-jump="materials-questions"]').click()
    assert page.evaluate('location.hash')=='#materials/composites'
    assert page.locator('[data-material-lab="laminate"] select').input_value()=='unsym'
    assert page.evaluate('document.activeElement.closest("section").id')=='materials-questions'
    page.close()
    page=reader('damping.html')
    assert page.locator('#damping-chapter .theory-section').count()==19
    page.locator('[data-jump="damping-units"]').click()
    page.locator('a[href="bulk.html#TABDMP1"]').first.click()
    page.wait_for_function('messages.some(m=>m.type==="navigate"&&m.path==="bulk.html"&&m.hash==="#TABDMP1")')
    page.close()
    # Beam article: every interactive figure draws, and the headline numbers match the hand calculations.
    page=reader('elements.html')
    page.evaluate("location.hash='#scalar'")
    page.locator('#scalar .element-toc a[data-jump="scalar-celas"]').click()
    assert page.evaluate('location.hash')=='#scalar'
    assert page.evaluate('document.activeElement.closest("section").id')=='scalar-celas'
    page.evaluate("location.hash='#beam'")
    page.locator('[data-beam-lab="mesh"] svg').wait_for()
    assert page.locator('#beam figure.beam-lab svg').count()>=8
    assert page.locator('#beam [data-beam-lab] .theory-lab-readout').evaluate_all('els=>els.every(e=>e.textContent&&!e.textContent.includes("描けません"))')
    assert '−30.33%' in page.locator('[data-beam-lab="mesh"] table').inner_text()
    page.locator('[data-beam-lab="mesh"] select').first.select_option('coupled')
    assert '+0.48%' in page.locator('[data-beam-lab="mesh"] table').inner_text()
    assert '4.10 倍' in page.locator('[data-beam-lab="orient"] .theory-lab-readout').inner_text()
    page.locator('[data-beam-lab="orient"] [data-lab-action="deg:0"]').click()
    assert '横たわみ 0.00 mm' in page.locator('[data-beam-lab="orient"] .theory-lab-readout').inner_text()
    assert '2.96 倍' in page.locator('[data-beam-lab="offset"] .theory-lab-readout').inner_text()
    assert '0.895 mm' in page.locator('[data-beam-lab="shear"] .theory-lab-readout').inner_text()
    page.locator('[data-beam-lab="release"] [data-lab-input="pb"]').check()
    page.locator('[data-beam-lab="release"] [data-lab-input="pa"]').check()
    assert '特異' in page.locator('[data-beam-lab="release"] .theory-lab-readout').inner_text()
    page.locator('[data-beam-lab="shearcenter"] button').nth(1).click()
    assert 'ねじりモーメントは 0' in page.locator('[data-beam-lab="shearcenter"] .theory-lab-readout').inner_text()
    assert '0.30 倍' in page.locator('[data-beam-lab="warp"] .theory-lab-readout').inner_text()
    assert '87.5%' in page.locator('[data-beam-lab="taper"] .theory-lab-readout').inner_text()
    assert page.locator('#beam-stress-points svg').count()==1 and page.locator('#beam .beam-fig').count()==2
    assert page.locator('#beam .ev-diagram').count()==0  # the old generic sketches are gone from the beam article
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.close()
    # Static analysis quiz: three 4-choice input questions, then the hand-calculation check diagnoses F06 values.
    page=reader('analysis.html')
    page.evaluate("location.hash='#static/beam/quiz'")
    page.locator('.aq-q').first.wait_for()
    assert page.locator('.aq-q').count()==3 and page.locator('.aq-q .aq-opt').count()==12
    assert page.locator('[data-analysis-tab="quiz"]').get_attribute('aria-selected')=='true'
    for n,right in enumerate([1,2,3]):
        page.locator(f'.aq-q[data-n="{n}"] .aq-opt[data-i="{right}"]').click()
        assert page.locator(f'.aq-q[data-n="{n}"] .aq-result').inner_text()=='正解です。'
    assert '3問中 3問に回答、初回の正解数：3問' in page.locator('.aq-score').inner_text()
    card=page.locator('.aq-q[data-n="1"]')
    card.locator('.aq-check input').fill('-0.1714')
    card.locator('.aq-run').click()
    assert 'I1 と I2 が入れ替わって' in card.locator('.aq-diag').inner_text()
    card.locator('.aq-check input').fill('−6.1725E+00')
    card.locator('.aq-run').click()
    assert '一致しています' in card.locator('.aq-diag').inner_text()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.evaluate("location.hash='#modes/baseline'")
    page.locator('[data-analysis-tab="model"]').wait_for()
    assert page.locator('[data-analysis-tab="quiz"]').count()==1
    page.locator('[data-analysis-tab="quiz"]').click()
    assert page.locator('.aq-q').count()==5
    assert page.locator('.aq-mode-lab svg').is_visible()
    for i, answer in enumerate(page.evaluate('AnalysisQuiz.data.modes.questions.map(q=>q.answer)')):
        card=page.locator('.aq-q').nth(i)
        card.locator('.aq-opt').nth(answer).click()
        assert card.locator('.aq-result').inner_text()=='正解です。'
    count=page.locator('.aq-q').nth(2)
    count.locator('.aq-check input').fill('12.5')
    count.locator('.aq-run').click()
    assert '整数' in count.locator('.aq-diag').inner_text()
    page.evaluate("location.hash='#complex-modes/undamped'")
    page.locator('[data-analysis-tab="model"]').wait_for()
    assert page.locator('[data-analysis-tab="quiz"]').count()==0  # no unwritten quizzes
    page.close()
    page=reader('modeling.html')
    page.locator('[data-model="detailed"]').click()
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#model-detailed")')
    assert page.locator('#model-count').inner_text()=='621節点 / 80要素'
    page.locator('#save-model').click()
    page.wait_for_function('messages.some(m=>m.type==="share")')
    m=page.evaluate('messages.filter(m=>m.type==="share").at(-1)')
    assert m['name']=='cantilever_detailed.bdf'
    assert base64.b64decode(m['base64']).decode('ascii')==page.evaluate('NastranModeling.models.detailed.deck')
    page.locator('#copy-model').click()
    page.wait_for_function('messages.some(m=>m.type==="copy")')
    assert page.evaluate('messages.filter(m=>m.type==="copy").at(-1).text')==page.evaluate('NastranModeling.models.detailed.deck')
    page.select_option('#model-input-picker','standard')
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#model-input-standard")')
    page.select_option('#model-row-filter','key')
    page.locator('a[href="bulk.html#PBAR/I1"]').click()
    page.wait_for_function('messages.some(m=>m.type==="navigate"&&m.path==="bulk.html"&&m.hash==="#PBAR/I1")')
    page.locator('a[download]').click()
    page.wait_for_function('messages.some(m=>m.type==="asset"&&m.path==="downloads/nastran_cantilever_three_models.zip")')
    page.close()
    page=reader('errors.html')
    page.locator('#error-query').fill('2025.0')
    page.locator('#error-search-form button[type=submit]').click()
    page.locator('[data-key="2025.0"]').click()
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#error-2025.0")')
    page.locator('#error-copy').click()
    page.wait_for_function('messages.some(m=>m.type==="copy"&&m.text.includes("原典項目 2025.0"))')
    page.locator('#error-detail a[target=_blank]').click()
    assert page.evaluate('messages.filter(m=>m.type==="external").at(-1).url').endswith('#page=215')
    page.locator('#error-detail .error-related a').first.click()
    assert page.evaluate('messages.filter(m=>m.type==="navigate").at(-1).path')=='coordinates.html'
    page.locator('#error-clear').click()
    assert page.locator('.error-result').count()==30
    assert not page.locator('#error-detail').inner_text().strip()
    page.close()
    page=reader('analysis.html')
    page.select_option('#analysis-picker','modes')
    page.locator('#analysis-example-picker').select_option('tip-mass')
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#modes/tip-mass")')
    assert page.locator('#save-analysis,#analysis-example-raw').count()==0
    page.locator('[data-analysis-tab="input"]').click()
    page.locator('[data-analysis-card="CONM2"]').click()
    assert page.evaluate('messages.filter(m=>m.type==="navigate").at(-1).hash')=='#CONM2'
    page.select_option('#analysis-picker','transient')
    page.select_option('#analysis-example-picker','trans-modal')
    page.wait_for_function('messages.some(m=>m.type==="position"&&m.hash==="#transient/trans-modal")')
    page.close()
    assert not errors,errors
    browser.close()
print('PASS: all offline mobile pages; chapter/progress bridge; routes and card diagrams; clipboard acknowledgement; Blob/BDF/INCLUDE/BAT bytes; image ZIP transport. Native iOS share sheet not tested.')
