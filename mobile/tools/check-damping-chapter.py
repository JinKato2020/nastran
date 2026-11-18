from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
DIST=ROOT/'sites/nastran-learning/dist'
OUT=ROOT/'mobile/.qa/damping-review'
OUT.mkdir(parents=True,exist_ok=True)
errors=[]
def style(root):
    return root.evaluate('''a=>Object.fromEntries(Object.entries({head:'.analysis-head',h1:'h1',intro:':scope > .element-key',toc:'.element-toc',section:'.theory-section',h2:'.theory-section h2',formula:'.element-formula',table:'.element-table',quiz:'.theory-quiz',question:'.theory-quiz summary',answer:'.theory-quiz details p',controls:'.theory-lab-controls',readout:'.theory-lab-readout',caption:'.theory-lab figcaption'}).map(([k,q])=>{const e=a.querySelector(q);if(!e)throw Error(k+' missing');const s=getComputedStyle(e);return[k,{tag:e.tagName,...Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','borderLeft','padding','margin'].map(p=>[p,s[p]]))}];}))''')
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((DIST/'elements.html').as_uri()+'#beam',wait_until='domcontentloaded')
    beam=page.locator('#beam');beam.wait_for(state='visible')
    reference=style(beam)
    frame=beam.locator('[data-beam-lab]').first.evaluate('e=>Array.from(e.children,x=>[x.tagName,x.className])')
    page.goto((DIST/'damping.html').as_uri(),wait_until='domcontentloaded')
    root=page.locator('#damping-chapter')
    assert style(root)==reference,{k:v for k,v in style(root).items() if v!=reference[k]}
    assert root.locator('.theory-section').count()==19
    assert root.locator('.theory-quiz details').count()==12
    assert root.locator('[data-damping-lab]').count()==8
    assert root.locator('[data-damping-legacy]').count()==3
    for fig in root.locator('[data-damping-lab],[data-damping-legacy]').all():
        name=fig.get_attribute('data-damping-lab') or fig.get_attribute('data-damping-legacy')
        parent=fig.locator('xpath=ancestor::details')
        if parent.count():parent.evaluate('e=>e.open=true')
        assert fig.evaluate('e=>Array.from(e.children,x=>[x.tagName,x.className])')==frame,name
        def check():
            assert not any(x in fig.inner_text() for x in ['NaN','Infinity','図を描けませんでした']),name
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
    # Existing chart geometry is unchanged. Ignore only translated text nodes.
    assert page.evaluate('''()=>{
      const norm=svg=>{const n=svg.cloneNode(true);n.querySelectorAll('text,title,desc').forEach(t=>t.remove());return n.outerHTML;};
      return [...document.querySelectorAll('[data-damping-legacy]')].every(fig=>{
        const plot=document.createElement('div'),readout=document.createElement('p');
        const lab=TheoryLabs.labs[fig.dataset.dampingLegacy],values=Object.fromEntries([...fig.querySelectorAll('[data-lab-input]')].map(e=>[e.dataset.labInput,e.value]));
        lab.draw({plot,readout,inputs:{}},{z:.02,...values});
        return norm(plot.querySelector('svg'))===norm(fig.querySelector('svg'));
      });
    }''')
    # Model selection must change the explanation/value, not just the select label.
    fig=root.locator('[data-damping-lab=local]')
    fig.locator('[data-lab-input=site]').select_option('between');fig.locator('[data-lab-input=mode]').select_option('0')
    assert 'ζ1 = 0%' in fig.inner_text()
    fig.locator('[data-lab-input=mode]').select_option('1');assert '逆向き' in fig.inner_text()
    for q in root.locator('.theory-quiz details').all():q.locator('summary').click();assert q.locator('p').is_visible()
    root.locator(':scope > .element-key').screenshot(path=str(OUT/'intro.png'))
    page.goto((DIST/'theory.html').as_uri()+'#damping',wait_until='domcontentloaded')
    root=page.locator('#theory-detail')
    assert style(root)==reference,{k:v for k,v in style(root).items() if v!=reference[k]}
    assert root.locator('#damping-validation').count()==1
    assert not page.locator('#theory-picker').is_visible()
    root.locator('[data-jump=damping-rayleigh]').click()
    assert root.locator('#damping-rayleigh').evaluate('e=>Math.abs(e.getBoundingClientRect().top)<150')
    page.evaluate('location.hash="modes"')
    page.locator('#theory-picker').wait_for(state='visible')
    assert not page.locator('#damping-units').count()
    assert not errors,errors
    browser.close()
print('PASS: 18 sections, 8 new labs, 3 preserved charts, 12 questions, beam component styles, legacy route, interactions and 320/390/768px.')
