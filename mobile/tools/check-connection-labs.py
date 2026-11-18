"""Shared article format and controls, language-neutral SVGs and narrow viewports."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[2]
DIST=ROOT/'sites/nastran-learning/dist'
OUT=ROOT/'mobile/.qa/remaining-elements'
OUT.mkdir(parents=True,exist_ok=True)
errors=[]
def styles(article):
    return article.evaluate('''a=>Object.fromEntries(Object.entries({head:'.analysis-head',title:'h1',intro:':scope > .element-key',toc:'.element-toc',heading:'.theory-section h2',formula:'p.element-formula',table:'.element-table',quiz:'.theory-quiz',question:'[id$="-quiz"] summary',answer:'[id$="-quiz"] details p',controls:'.theory-lab-controls',readout:'.theory-lab-readout',caption:'.theory-lab figcaption'}).map(([k,q])=>{const e=a.querySelector(q);if(!e)throw Error(k+' absent');const s=getComputedStyle(e);return [k,{tag:e.tagName,...Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','borderLeft','padding','margin'].map(p=>[p,s[p]]))}];}))''')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((DIST/'elements.html').as_uri()+'#beam',wait_until='domcontentloaded')
    beam=page.locator('article[data-element=beam]')
    beam.wait_for(state='visible')
    reference=styles(beam)
    frame=beam.locator('[data-beam-lab]').first.evaluate('e=>Array.from(e.children,x=>[x.tagName,x.className])')
    report=[]
    for key in ['connector','rigid','genel']:
        page.goto((DIST/'elements.html').as_uri()+'#'+key,wait_until='domcontentloaded')
        page.reload(wait_until='domcontentloaded')
        article=page.locator('article[data-element='+key+']')
        article.wait_for(state='visible')
        actual=styles(article)
        assert actual==reference,(key,{k:v for k,v in actual.items() if v!=reference[k]})
        assert article.locator('div.element-formula,.analysis-links,.el-intro,.el-checks').count()==0
        assert article.locator('[id$="-quiz"] details').count()==4
        assert article.locator('[data-connection-lab]').count()==3
        for fig in article.locator('[data-connection-lab]').all():
            name=fig.get_attribute('data-connection-lab')
            assert fig.evaluate('e=>Array.from(e.children,x=>[x.tagName,x.className])')==frame,name
            def check():
                assert not any(t in fig.inner_text() for t in ['NaN','Infinity','図を描けませんでした']),name
                assert not fig.locator('svg text').evaluate_all(r'es=>es.some(t=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(t.textContent))'),name
                clipped=fig.locator('svg text').evaluate_all('''es=>es.flatMap(t=>{const b=t.getBoundingClientRect(),s=t.closest('svg').getBoundingClientRect();return b.width&&(b.left<s.left-1||b.right>s.right+1||b.top<s.top-1||b.bottom>s.bottom+1)?[t.textContent]:[]})''')
                assert not clipped,(name,clipped)
            check()
            fig.screenshot(path=str(OUT/(name+'.png')))
            if name=='rigid-distribution':
                assert '0.3125 mm' in fig.inner_text()
                fig.locator('select[data-lab-input=kind]').select_option('rigid')
                assert '0.2 mm' in fig.inner_text() and '20' in fig.inner_text()
                fig.locator('select[data-lab-input=kind]').select_option('average')
            if name=='genel-order':
                before=fig.locator('.theory-lab-readout strong').inner_text()
                fig.locator('select[data-lab-input=order]').select_option('201')
                assert fig.locator('.theory-lab-readout strong').inner_text()==before
                fig.locator('select[data-lab-input=kind]').select_option('wrong')
                assert fig.locator('.theory-lab-readout strong').inner_text()!=before
                fig.locator('select[data-lab-input=kind]').select_option('correct')
            if name=='genel-reference':
                assert 'fi = 40 N' in fig.inner_text()
                fig.locator('select[data-lab-input=kind]').select_option('absolute')
                assert 'fi = 440 N' in fig.inner_text()
                fig.locator('select[data-lab-input=kind]').select_option('relative')
            for control in fig.locator('input[type=range]').all():
                for value in [control.get_attribute('min'),control.get_attribute('max')]:
                    control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',value)
                    check()
            for control in fig.locator('select').all():
                for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
                    control.select_option(value);check()
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844});check()
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(key,width)
            page.set_viewport_size({'width':390,'height':844})
            report.append(name)
        for q in article.locator('[id$="-quiz"] details').all():
            q.locator('summary').click();assert q.locator('p').is_visible()
        # Existing diagrams are kept; report any remaining language to inspect text-only.
        jp=article.locator('svg text').evaluate_all(r'es=>es.filter(t=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(t.textContent)).map(t=>t.textContent)')
        print(key,'existing SVG prose:',json.dumps(jp,ensure_ascii=False))
        article.locator(':scope > .element-key').screenshot(path=str(OUT/(key+'-intro.png')))
    assert not errors,errors
    browser.close()
print('PASS:',len(report),'experiments, 12 questions, shared beam components, slider ends, selections and 320/390/768px.')
