"""Shared analysis guidance and navigation using the real App.tsx browser harness.

Native clipboard/sharing are mocked; this does not claim an iOS device test.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.qa';OUT.mkdir(exist_ok=True)
APP=json.loads((ROOT/'app.json').read_text(encoding='utf-8'))['expo']
VERSION=f"バージョン {APP['version']}（{APP['ios']['buildNumber']}）"
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8765/analysis.html',wait_until='networkidle')
    assert page.locator('h1').inner_text()=='共通'
    assert page.locator('#analysis-picker option').first.inner_text()=='共通'
    assert page.locator('#analysis-picker option').count()==15
    for width in [320,390,768,1280]:
        page.set_viewport_size({'width':width,'height':844})
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.set_viewport_size({'width':390,'height':844})
    page.goto('http://127.0.0.1:8766',wait_until='networkidle')
    page.get_by_role('tab',name='ホーム',exact=True).wait_for()
    icon=page.get_by_role('img',name='FEM Guide for nas',exact=True)
    icon.wait_for();assert icon.get_attribute('src').startswith('data:image/png;base64,')
    page.screenshot(path=str(OUT/'common-home-icon.png'))
    page.get_by_role('tab',name='解析',exact=True).click()
    assert page.get_by_role('button',name='共通',exact=True).count()==1
    page.screenshot(path=str(OUT/'common-analysis-list.png'))
    page.get_by_role('button',name='共通',exact=True).click()
    frame=page.frame_locator('iframe');assert frame.locator('h1').inner_text()=='共通'
    assert frame.locator('.analysis-section h2').all_text_contents()==['相関図の読み方','1 · 入力ファイルとカード解説','2 · 実行・終了確認','3 · 結果の照合','4 · 教材の検証範囲と参照資料']
    assert frame.locator('#analysis-common-verification').inner_text().count('MSC Nastran本体では未実行')==1
    for width in [320,390]:
        page.set_viewport_size({'width':width,'height':844})
        assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path=str(OUT/'common-reader.png'))
    frame.get_by_role('link',name='実行・終了確認',exact=True).click()
    assert frame.locator('body').evaluate("()=>location.hash==='#common/run'")
    # Shared input rule link opens the existing canonical explanation, then restores common.
    frame.locator('a[href="input.html#rules"]').click()
    page.frame_locator('iframe').locator('#rules').wait_for()
    page.get_by_role('button',name='‹ 戻る',exact=True).click()
    frame=page.frame_locator('iframe');assert frame.locator('h1').inner_text()=='共通'
    page.get_by_role('tab',name='解析',exact=True).click()
    page.get_by_role('button',name='静解析',exact=True).click()
    frame=page.frame_locator('iframe')
    assert frame.locator('h1').inner_text()=='静解析'
    assert frame.locator('#analysis-relations svg').count()==3
    frame.locator('#analysis-relations a[data-relation-card="PROD"]').click()
    assert page.frame_locator('iframe').locator('#card-picker').input_value()=='PROD'
    page.get_by_role('button',name='‹ 戻る',exact=True).click()
    frame=page.frame_locator('iframe')
    assert frame.locator('#analysis-code-status').inner_text().startswith('先頭6行')
    frame.locator('#analysis-toggle-raw').click()
    original=frame.locator('#analysis-example-raw').text_content()
    frame.locator('.analysis-context-links a[href="analysis.html#common"]').click()
    assert frame.locator('h1').inner_text()=='共通'
    page.get_by_role('button',name='‹ 戻る',exact=True).click()
    frame=page.frame_locator('iframe')
    assert frame.locator('h1').inner_text()=='静解析'
    assert frame.locator('#analysis-toggle-raw').get_attribute('aria-expanded')=='true'
    assert frame.locator('#analysis-example-raw').text_content()==original
    frame.locator('.analysis-links a[href="bulk.html#CASE_STRESS"]').click()
    assert page.frame_locator('iframe').locator('#card-picker').input_value()=='CASE_STRESS'
    page.get_by_role('button',name='‹ 戻る',exact=True).click()
    assert page.frame_locator('iframe').locator('#analysis-toggle-raw').get_attribute('aria-expanded')=='true'
    page.get_by_role('tab',name='設定',exact=True).click()
    assert page.get_by_text(VERSION,exact=True).count()==1
    page.get_by_text(VERSION,exact=True).scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'settings-version.png'))
    assert not errors,errors
    browser.close()
(OUT/'common-verification.json').write_text(json.dumps({'common_first':True,'desktop_mobile_widths':[320,390,768,1280],'actual_app_icon_image':True,'shared_links_and_back':True,'full_dat_restored':True,'runtime_errors':errors,'native_os_apis':'mocked'},indent=2)+'\n',encoding='utf-8')
print('PASS: common first, shared links and Back, expanded DAT restoration, actual icon image, 4 widths.')
