"""Check the analysis tab's nine visual comparisons in the offline app reader."""
from pathlib import Path
import json
from threading import Thread
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
APP = json.loads((ROOT/'app.json').read_text(encoding='utf-8'))['expo']
VERSION_LABEL = f"バージョン {APP['version']}（{APP['ios']['buildNumber']}）"
CASES = {
    '静解析': [('beam', 'CBEAM'), ('shell', 'CQUAD4'), ('solid', 'CHEXA')],
    '実固有値解析': [('baseline', 'EIGRL'), ('tip-mass', 'CONM2'), ('both-fixed', 'SPC1')],
    '複素固有値解析': [('undamped', 'EIGC'), ('direct-damped', 'PDAMP'), ('modal-damped', 'CASE_METHOD')],
}
HISTORICAL_DECK_CONTROLS = '#analysis-example-raw,#save-analysis,#copy-analysis'

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT/'.qa/app'))) as host, sync_playwright() as pw:
    Thread(target=host.serve_forever, daemon=True).start()
    browser = pw.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page = browser.new_page(viewport={'width':390, 'height':844})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(f'http://127.0.0.1:{host.server_port}/', wait_until='networkidle')
    analysis = page.get_by_role('tab', name='解析', exact=True)
    analysis.click()
    frame = page.frame_locator('iframe')
    for title, variants in CASES.items():
        page.get_by_role('button', name=title, exact=True).click()
        expect(frame.locator('h1')).to_have_text(title)
        for width in [320,390,768]:
            page.set_viewport_size({'width':width, 'height':844})
            for variant, key in variants:
                frame.locator('#analysis-example-picker').select_option(variant)
                expect(frame.locator('.analysis-scenario-figure svg')).to_be_visible()
                bounds = frame.locator('.analysis-scenario-figure svg').bounding_box()
                assert bounds and bounds['y']+bounds['height'] < 700, (title,width,variant,bounds)
                assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
                assert frame.locator(HISTORICAL_DECK_CONTROLS).count()==0
                assert frame.locator(f'[data-relation-card="{key}"]').count()>=1
                assert frame.locator('.analysis-scenario-comparison tr[aria-current=true]').count()==1
        page.set_viewport_size({'width':390, 'height':844})
        page.screenshot(path=str(ROOT/'.qa'/f"analysis-{variants[-1][0]}.png"))
        model_key,card_key=variants[-1]
        card=frame.locator(f'[data-relation-card="{card_key}"]').first
        card.scroll_into_view_if_needed()
        scroll=frame.locator('body').evaluate('()=>scrollY')
        card.click()
        expect(frame.locator('#card-picker')).to_have_value(card_key)
        page.get_by_role('button', name='‹ 戻る', exact=True).click()
        expect(frame.locator('#analysis-example-picker')).to_have_value(model_key)
        page.wait_for_timeout(350)
        assert abs(frame.locator('body').evaluate('()=>scrollY')-scroll)<3
        assert page.get_by_role('tab').count()==5
        analysis.click()
    bundle = json.loads((ROOT/'src/generated/lessons.json').read_text(encoding='utf-8'))
    fallback_titles = [item['title'] for item in bundle['course']['navigation']['analyses']
                       if item['title'] not in CASES and item['hash'] != '#common']
    for title in fallback_titles:
        page.get_by_role('button',name=title,exact=True).click()
        expect(frame.locator('h1')).to_have_text(title)
        assert frame.locator(HISTORICAL_DECK_CONTROLS).count()==0
        expect(frame.locator('#analysis-relations')).to_be_visible()
        analysis.click()
    page.get_by_role('tab',name='設定',exact=True).click()
    expect(page.get_by_text(VERSION_LABEL,exact=True)).to_be_visible()
    assert not errors,errors
    browser.close()
    host.shutdown()
print('PASS: 9 variants at 320/390/768, schematic first, card navigation, Back position, analysis deck removal and release version.')
