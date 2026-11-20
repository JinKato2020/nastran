"""Compare analysis articles against the actual beam article components."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'sites/nastran-learning/dist'
OUT = ROOT / 'mobile/.qa/article-format'
OUT.mkdir(parents=True, exist_ok=True)

STYLE = '''e=>{const s=getComputedStyle(e);return Object.fromEntries(
 ['fontSize','lineHeight','color','backgroundColor','padding','margin','borderTop','borderLeft','borderRadius']
 .map(k=>[k,s[k]]));}'''
errors, checked = [], []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page = browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto((DIST/'elements.html').as_uri()+'#beam')
    page.locator('#beam').wait_for(state='visible')
    reference = {name: page.locator('#beam').locator(selector).first.evaluate(STYLE) for name,selector in {
        'intro':':scope > .element-key','heading':'.theory-section h2',
        'paragraph':'.theory-section p','table':'.element-table.narrow',
        'controls':'.theory-lab-controls','readout':'.theory-lab-readout'}.items()}
    frame = page.locator('#beam [data-beam-lab]').first.evaluate('e=>Array.from(e.children,c=>[c.tagName,c.className])')
    page.goto((DIST/'analysis.html').as_uri()+'#static')
    routes = page.evaluate('''()=>NastranAnalysis.entries.flatMap(e=>
      (AnalysisScenarios[e.key]?.models||e.variants||[{id:'msc'}]).map(m=>[e.key,m.id]))''')
    routes += [[k,'simcenter'] for k in ['large-deformation','plasticity','contact']]
    # Result questions are named by title; a renamed title would silently fall back to the Input tab.
    missing = page.evaluate('''()=>Object.entries(AnalysisQuiz.resultTitles).flatMap(([k,ts])=>ts.filter(t=>
      !Object.values(AnalysisModelQuizzes[k]||{}).some(d=>d.questions.some(q=>q.title===t))).map(t=>k+':'+t))''')
    assert not missing, missing
    assert page.locator('[data-analysis-tab="quiz"]').count() == 0
    for key,model in routes:
        route=key+'/'+model
        page.goto((DIST/'analysis.html').as_uri()+'#'+route)
        page.evaluate('dispatchEvent(new Event("hashchange"))')
        intro=page.locator('#analysis-detail .element-key')
        intro.wait_for(state='visible')
        assert intro.count()==1,route
        assert intro.evaluate(STYLE)==reference['intro'],route
        assert intro.locator(':scope > ul > li').count()>0,route
        assert intro.locator(':scope > ol > li').count()==3,route
        assert intro.locator('a[href]').count()>0,route
        if key=='static':
            assert intro.locator('a[href="elements.html#'+model+'"]').count()==1,route
        assert 'undefined' not in page.locator('#analysis-detail').inner_text(),route
        for width in [320,390,768]:
            page.set_viewport_size({'width':width,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,width)
        page.set_viewport_size({'width':390,'height':844})
        for tab in ['input','results','model']:
            page.locator('[data-analysis-tab='+tab+']').click()
            panel=page.locator('[data-analysis-panel='+tab+']')
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,tab,width)
            page.set_viewport_size({'width':390,'height':844})
            for name,selector in [('heading','.theory-section h2'),('paragraph','.theory-section > p:not([class])'),('table','.element-table')]:
                found=panel.locator(selector)
                if found.count():
                    assert found.first.evaluate(STYLE)==reference[name],(route,tab,name)
            assert panel.locator('.analysis-section').count()==0,(route,tab)
        if key in ['static','modes'] and model in ['beam','both-fixed']:
            intro.screenshot(path=str(OUT/(key+'-intro.png')))
        checked.append(route)
    for model in ['baseline','tip-mass','both-fixed']:
        page.goto((DIST/'analysis.html').as_uri()+'#modes/'+model+'/input')
        page.evaluate('dispatchEvent(new Event("hashchange"))')
        lab=page.locator('.aq-mode-lab')
        assert lab.evaluate('e=>Array.from(e.children,c=>[c.tagName,c.className])')==frame,model
        for name,selector in [('controls','.theory-lab-controls'),('readout','.theory-lab-readout')]:
            assert lab.locator(selector).evaluate(STYLE)==reference[name],(model,name)
        assert lab.locator('svg').count()==1,model
        assert '図を描けませんでした' not in lab.inner_text(),model
        lab.screenshot(path=str(OUT/(model+'-lab.png')))
    for key in ['model-verification','restart','database']:
        page.goto((DIST/'analysis.html').as_uri()+'#'+key)
        page.evaluate('dispatchEvent(new Event("hashchange"))')
        assert page.locator('#analysis-detail > .theory-section').count()==1,key
    assert not errors,errors
    browser.close()
print(json.dumps({'analysis_routes':len(checked),'shared_components':'PASS','page_errors':errors},ensure_ascii=False))
