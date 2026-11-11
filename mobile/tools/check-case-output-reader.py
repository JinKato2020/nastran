"""Exercise output option tables in the actual app's offline reader."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':390,'height':844})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 page.get_by_role('tab',name='Inputデータ',exact=True).click()
 frame=page.frame_locator('iframe')
 frame.locator('#input-family').select_option('case')
 frame.locator('#category').select_option('結果出力')
 frame.locator('#card-picker').select_option('CASE_ACCELERATION')
 assert frame.locator('.output-options tr').count()==19
 frame.locator('.output-syntax summary').click()
 assert frame.locator('.output-syntax pre').is_visible()
 frame.locator('#copy-card').click()
 page.wait_for_function('window.__copied.includes("ACCELERATION(SORT1,PRINT,PHASE) = 81")')
 assert 'options' not in page.evaluate('window.__copied')
 frame.locator('#card-picker').select_option('CASE_DISPLACEMENT')
 assert frame.locator('.output-options tr').count()==33
 page.get_by_role('tab',name='設定',exact=True).click()
 page.get_by_role('radio',name='文字サイズ 特大',exact=True).click()
 page.get_by_role('tab',name='Inputデータ',exact=True).click()
 frame=page.frame_locator('iframe')
 for width in [320,390,430]:
  page.set_viewport_size({'width':width,'height':844})
  assert frame.locator('#card-picker').input_value()=='CASE_DISPLACEMENT'
  assert frame.locator('.output-options tr').count()==33
  assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
  assert page.get_by_role('tab').count()==5
 page.set_viewport_size({'width':390,'height':844})
 frame.locator('.output-options').evaluate('e=>e.scrollIntoView({block:"start"})')
 page.screenshot(path='.qa/case-output-native-large.png')
 assert not errors,errors
 browser.close()
print('PASS: native reader output choices, full syntax, exact copy, tab selection, large text at 3 widths. Native APIs mocked.')
