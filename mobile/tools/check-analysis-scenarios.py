"""Check the analysis tab's visual comparisons in the offline app reader."""
from pathlib import Path
import base64
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
    '複素固有値解析': [('undamped', 'EIGC'), ('modal-undamped', 'CASE_METHOD'), ('modal-damped', 'PDAMP'), ('direct-damped', 'EIGC')],
}
COMPLEX = {'undamped':('off','107'),'modal-undamped':('off','110'),'modal-damped':('on','110'),'direct-damped':('on','107')}


def select_variant(frame, title, variant):
    if title != '複素固有値解析':
        frame.locator('#analysis-example-picker').select_option(variant)
        return
    damping, method = COMPLEX[variant]
    for control, value in [('analysis-damping-picker',damping),('analysis-method-picker',method)]:
        picker = frame.locator('#'+control)
        if picker.input_value() != value:
            picker.select_option(value)
    expect(frame.locator('#analysis-damping-picker')).to_have_value(damping)
    expect(frame.locator('#analysis-method-picker')).to_have_value(method)
    expect(frame.locator('.analysis-original-tools span')).to_have_text(
        f'lesson_sol{method}_{variant.replace("-", "_")}.dat')
    assert frame.locator('[data-analysis-card="PDAMP"]').count()==(damping=='on')
    assert frame.locator('[data-analysis-card="CASE_METHOD"]').count()==(method=='110')


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
                select_variant(frame,title,variant)
                expect(frame.locator('.analysis-scenario-figure svg')).to_be_visible()
                bounds = frame.locator('.analysis-scenario-figure svg').bounding_box()
                assert bounds and bounds['y']+bounds['height'] < 700, (title,width,variant,bounds)
                assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
                assert frame.locator(HISTORICAL_DECK_CONTROLS).count()==0
                assert frame.locator(f'[data-analysis-card="{key}"]').count()>=1
                assert frame.locator('.analysis-scenario-comparison tr[aria-current=true]').count()==1
        page.set_viewport_size({'width':390, 'height':844})
        expect(frame.locator('#analysis-original-input summary')).to_be_visible()
        frame.locator('#analysis-original-input summary').click()
        original=frame.locator('#analysis-original-input pre').text_content()
        assert original.startswith('SOL ')
        assert original.rstrip().endswith('ENDDATA')
        previous_shares=page.evaluate('window.__shares.length')
        frame.locator('#save-original-dat').click()
        page.wait_for_function('(count)=>window.__shares.length > count',arg=previous_shares)
        assert base64.b64decode(page.evaluate('window.__shares.at(-1).data')).decode('ascii').replace('\r\n','\n') == original
        if title == '複素固有値解析':
            frame.locator('a[href="analysis.html#complex-modes/official"]').click()
        else:
            frame.locator('#analysis-example-picker').select_option('official')
        expect(frame.locator('#analysis-original-input')).to_have_count(0)
        assert frame.locator('.analysis-sources a[href$=".pdf#page=17"],.analysis-sources a[href$=".pdf#page=77"],.analysis-sources a[href$=".pdf#page=681"]').count()>=1
        expect(frame.get_by_role('heading',name='公式例題の主要カード')).to_be_visible()
        if title == '複素固有値解析':
            frame.get_by_role('link',name='自作例を見る →').click()
        select_variant(frame,title,variants[-1][0])
        page.screenshot(path=str(ROOT/'.qa'/f"analysis-{variants[-1][0]}.png"))
        model_key,card_key=variants[-1]
        card=frame.locator(f'[data-analysis-card="{card_key}"]').first
        card.scroll_into_view_if_needed()
        scroll=frame.locator('body').evaluate('()=>scrollY')
        card.click()
        expect(frame.locator('#card-picker')).to_have_value(card_key)
        page.get_by_role('button', name='‹ 戻る', exact=True).click()
        if title == '複素固有値解析':
            damping, method = COMPLEX[model_key]
            expect(frame.locator('#analysis-damping-picker')).to_have_value(damping)
            expect(frame.locator('#analysis-method-picker')).to_have_value(method)
        else:
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
print('PASS: 10 variants at 320/390/768, schematic first, card navigation, Back position, original DAT saving, official PDF links, and release version.')
