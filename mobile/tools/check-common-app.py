"""Check independent analysis references, migrated links and the next-build menu.
Uses local Web pages and generated navigation; does not claim an iOS device test.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'mobile/.qa/analysis-navigation'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'sites/nastran-learning/dist')))
Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
errors=[]
try:
    bundle=json.loads((ROOT/'mobile/src/generated/lessons.json').read_text(encoding='utf-8'))
    items=bundle['course']['navigation']['analyses']
    assert all(item['hash']!='#common' for item in items)
    assert items[0]['hash']=='#static'
    assert [item['hash'] for item in items[-3:]]==['#model-verification','#restart','#database']
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
        page=browser.new_page(viewport={'width':390,'height':844})
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(base+'analysis.html#common')
        assert page.locator('h1').inner_text()=='解析'
        assert page.locator('.analysis-index-item').count()==len(items)
        assert page.locator('#analysis-picker option[value="common"]').count()==0
        page.screenshot(path=str(OUT/'analysis-index.png'))
        topics=page.evaluate('Object.keys(window.AnalysisReferenceTopics)')
        for key in topics:
            page.goto(base+'analysis.html#'+key)
            assert page.locator('#analysis-detail > .analysis-section').count()==1,key
            assert page.locator('#analysis-common-'+key).count()==1,key
            for width in [320,390,768]:
                page.set_viewport_size({'width':width,'height':844})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(key,width)
            page.goto(base+'analysis.html#common/'+key)
            assert page.evaluate('location.hash')=='#'+key,key
            assert page.locator('#analysis-common-'+key).count()==1,key
        for old,target in {'input':'input.html#rules','relations':'input.html#executive','run':'workflow.html#run','results':'workflow.html#results','verification':'analysis.html#index'}.items():
            page.goto(base+'analysis.html#common/'+old)
            page.wait_for_url(base+target)
        # Individual pages stay separate when navigating there and back.
        page.goto(base+'analysis.html#model-verification')
        page.locator('#analysis-common-model-verification a[href="analysis.html#load-check"]').first.click()
        assert page.locator('#analysis-common-load-check').count()==1
        assert page.locator('#analysis-common-model-verification').count()==0
        page.go_back()
        assert page.locator('#analysis-common-model-verification').count()==1
        page.goto(base+'theory.html#damping')
        page.locator('a[href="analysis.html#damping-check"]').click()
        assert page.locator('#analysis-common-damping-check').count()==1
        page.goto(base+'theory.html#contact')
        page.locator('a[href="analysis.html#contact-check"]').click()
        assert page.locator('#analysis-common-contact-check').count()==1
        # Every item in the new list resolves to the intended page, not static fallback.
        for item in items:
            page.goto(base+item['path']+item['hash'])
            assert page.locator('h1').count()==1,item['hash']
            assert page.locator('#analysis-picker').input_value()==item['hash'][1:],item['hash']
        page.set_viewport_size({'width':390,'height':844})
        page.goto(base+'analysis.html#restart')
        page.screenshot(path=str(OUT/'restart.png'))
        assert not errors,errors
        browser.close()
    (OUT/'report.json').write_text(json.dumps({'independent_topics':len(topics),'next_build_menu_items':len(items),'legacy_links':True,'back_navigation':True,'widths':[320,390,768],'runtime_errors':errors},indent=2),encoding='utf-8')
    print('PASS: independent references, legacy redirects, Back, menu routes and mobile widths.')
finally:
    server.shutdown()
