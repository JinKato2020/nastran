"""New solid mechanics routes and large DAT native transport using real App.tsx.

OS clipboard/sharing are mocked in preview-app.mjs; no iOS device is claimed.
"""
import base64,json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
lessons=[]
for name in ['thermal-cylinder','nonlinear','contact-prestress']:
    lessons.extend(json.loads((ROOT/f'tools/new-analysis/{name}.json').read_text(encoding='utf-8'))['lessons'])
out=ROOT/'mobile/.qa';out.mkdir(exist_ok=True)
errors=[];verified=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8766',wait_until='networkidle')
    page.get_by_role('tab',name='ホーム',exact=True).wait_for()
    assert 'FEM Guide' in page.locator('body').inner_text()
    for lesson in lessons:
        page.get_by_role('tab',name='解析',exact=True).click()
        if page.locator('iframe').count():page.get_by_role('tab',name='解析',exact=True).click()
        page.get_by_role('button',name=lesson['title'],exact=True).click()
        frame=page.frame_locator('iframe')
        assert frame.locator('h1').inner_text()==lesson['title']
        for model in lesson['models']:
            frame.locator('#analysis-example-picker').select_option(model['key'])
            expected=(ROOT/model['path']).read_bytes()
            assert frame.locator('#analysis-filename').inner_text()==model['name']
            assert frame.locator('#analysis-code-status').inner_text().startswith('先頭6行')
            assert frame.locator('#analysis-example-raw').text_content()=='\r\n'.join(expected.decode('ascii').splitlines()[:6])
            assert frame.locator('.analysis-visual svg').count()==1
            if model.get('inputs'):
                assert model['inputs'][1][1] in frame.locator('#analysis-conditions').inner_text()
            for width in [320,390]:
                page.set_viewport_size({'width':width,'height':844})
                assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth'),(lesson['key'],model['key'],width)
            page.evaluate('window.__copied=""')
            frame.locator('#copy-analysis').click()
            page.wait_for_function('(n)=>window.__copied.length===n',arg=len(expected),timeout=30000)
            assert page.evaluate('window.__copied').encode('ascii')==expected
            frame.locator('#save-analysis').click()
            page.wait_for_function('(name)=>window.__shares.some(s=>s.uri.endsWith("/"+name))',arg=model['name'])
            shared=page.evaluate('(name)=>window.__shares.find(s=>s.uri.endsWith("/"+name))',model['name'])
            assert base64.b64decode(shared['data'])==expected
            frame.locator('.analysis-visual').screenshot(path=str(out/('new-'+model['key']+'.png')))
            verified.append({'model':model['key'],'bytes':len(expected),'copy':'exact','share':'exact'})
        # Check real native Back restoration for the largest file as well.
        if lesson['key']=='prestressed-modes':
            frame.locator('#analysis-toggle-raw').click()
            assert frame.locator('#analysis-example-raw').text_content().encode('ascii')==expected
            frame.locator('#analysis-example-raw a[href="bulk.html#PCOMP"]').first.click()
            assert page.frame_locator('iframe').locator('#card-picker').input_value()=='PCOMP'
            page.get_by_role('button',name='‹ 戻る',exact=True).click()
            frame=page.frame_locator('iframe')
            assert frame.locator('#analysis-example-picker').input_value()==model['key']
            assert frame.locator('#analysis-toggle-raw').get_attribute('aria-expanded')=='true'
            assert frame.locator('#analysis-example-raw').text_content().encode('ascii')==expected
    assert not errors,errors
    browser.close()
(ROOT/'tools/extended-app-verification.json').write_text(json.dumps({'models':verified,'routes':len(lessons),'widths':[320,390],'nativeOS':'mocked','largestModelBackRestoration':True,'javascriptErrors':errors},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS: six new native routes, ten exact full DAT copies/shares, 320/390px, diagrams and largest-file card/Back restore.')
