"""Shared article components, interactive boundary calculations, and chapter navigation."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
DIST=ROOT/'sites/nastran-learning/dist'
OUT=ROOT/'mobile/.qa/boundary-review'
OUT.mkdir(parents=True,exist_ok=True)
errors=[]
def style(root):
    return root.evaluate('''a=>Object.fromEntries(Object.entries({head:'.analysis-head',intro:':scope > .element-key',toc:'.element-toc',link:'.element-toc a',section:'.theory-section',formula:'.element-formula',table:'.element-table',quiz:'.theory-quiz',controls:'.theory-lab-controls',readout:'.theory-lab-readout',caption:'.theory-lab figcaption'}).map(([k,q])=>{const e=a.querySelector(q);if(!e)throw Error(k+' missing');const s=getComputedStyle(e);return[k,{tag:e.tagName,...Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','padding','margin'].map(p=>[p,s[p]]))}];}))''')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((DIST/'elements.html').as_uri()+'#beam',wait_until='domcontentloaded')
    reference=style(page.locator('#beam'))
    page.goto((DIST/'theory.html').as_uri()+'#boundary',wait_until='domcontentloaded')
    root=page.locator('#theory-detail')
    assert style(root)==reference,{k:v for k,v in style(root).items() if v!=reference[k]}
    assert root.locator('.theory-section').count()==24
    assert root.locator('.theory-quiz details').count()==12
    assert root.locator('[data-boundary-lab]').count()==9
    assert root.locator('[data-boundary-legacy]').count()==5
    assert not page.locator('#theory-picker').is_visible()
    assert root.locator('[data-boundary-static]').count()==2
    for fig in root.locator('[data-boundary-lab],[data-boundary-legacy],[data-boundary-static]').all():
        name=fig.get_attribute('data-boundary-lab') or fig.get_attribute('data-boundary-legacy') or fig.get_attribute('data-boundary-static')
        def check():
            assert not any(s in fig.inner_text() for s in ['NaN','Infinity','図を描けませんでした']),name
            assert not fig.locator('svg text').evaluate_all(r'es=>es.some(e=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(e.textContent))'),name
            clipped=fig.locator('svg text').evaluate_all('''es=>es.flatMap(t=>{const b=t.getBoundingClientRect(),s=t.closest('svg').getBoundingClientRect();return b.width&&(b.left<s.left-1||b.right>s.right+1||b.top<s.top-1||b.bottom>s.bottom+1)?[t.textContent]:[]})''')
            assert not clipped,(name,clipped)
        check()
        fig.screenshot(path=str(OUT/(name+'.png')))
        for control in fig.locator('input[type=range]').all():
            for value in [control.get_attribute('min'),control.get_attribute('max')]:
                control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',value);check()
        for control in fig.locator('select').all():
            for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
                control.select_option(value);check()
        for width in [320,390,768]:
            page.set_viewport_size({'width':width,'height':844});check()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(name,width)
        page.set_viewport_size({'width':390,'height':844})
    # Reused diagrams differ only in their text; no geometry/color/position edits.
    assert page.evaluate('''()=>{const norm=s=>{const c=s.cloneNode(true);c.querySelectorAll('text').forEach(t=>t.remove());return c.outerHTML;};return [...document.querySelectorAll('[data-boundary-legacy]')].every(el=>{const d=document.createElement('div');d.innerHTML=TheoryTopicVisuals.boundary[+el.dataset.boundaryLegacy];return !d.querySelector('svg')||norm(d.querySelector('svg'))===norm(el.querySelector('svg'));});}''')
    for q in root.locator('.theory-quiz details').all():q.locator('summary').click();assert q.locator('p').is_visible()
    root.locator(':scope > .element-key').screenshot(path=str(OUT/'intro.png'))
    root.locator('.element-contents').screenshot(path=str(OUT/'toc.png'))
    for key,target in [('supports','supports'),('spc','sets'),('mpc','mpc'),('connections','rbe'),('verification','autospc'),('questions','questions')]:
        page.evaluate('(key)=>location.hash="boundary/"+key',key)
        page.wait_for_function('(id)=>Math.abs(document.getElementById(id).getBoundingClientRect().top)<120',arg='boundary-'+target)
        assert root.locator('.theory-section').count()==24
    page.evaluate('location.hash="boundary/verification"')
    page.locator('[data-jump="boundary-meaning"]').click()
    assert page.evaluate('location.hash')=='#boundary/verification'
    page.locator('a[href="bulk.html#SPC"]').first.click()
    assert page.url.endswith('bulk.html#SPC')
    page.go_back();assert root.locator('#boundary-autospc').is_visible()
    for alias,target in [('common-constraint-errors','autospc'),('common-symmetry','symmetry'),('common-rigid','rbe')]:
        page.evaluate('(h)=>location.hash=h',alias)
        page.wait_for_function('(id)=>Math.abs(document.getElementById(id).getBoundingClientRect().top)<120',arg='boundary-'+target)
        assert root.locator('.theory-section').count()==24
    page.evaluate('location.hash="modes"')
    page.locator('#theory-picker').wait_for(state='visible')
    assert root.locator('[data-boundary-lab]').count()==0
    page.goto((DIST/'index.html').as_uri()+'#home',wait_until='domcontentloaded')
    group=page.locator('.curriculum-group').filter(has=page.locator('summary',has_text='境界条件と拘束'))
    group.locator('summary').click()
    assert group.locator('.learning-card').count()==6
    group.locator('a[href="theory.html#boundary/mpc"]').click()
    assert page.locator('#boundary-mpc').evaluate('e=>Math.abs(e.getBoundingClientRect().top)<120')
    assert not errors,errors
    browser.close()
print('PASS: boundary — 24 sections, 9 labs, 5 preserved figures, 12 questions, shared beam styles, chapter routes, controls and 320/390/768px.')
