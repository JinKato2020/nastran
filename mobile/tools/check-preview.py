"""Six-line input previews and output-card navigation in the actual app reader."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':390,'height':844})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 page.get_by_role('tab',name='解析',exact=True).click()
 page.get_by_role('button',name='過渡応答解析',exact=True).click()
 frame=page.frame_locator('iframe')
 frame.locator('#analysis-example-picker').select_option('transient-modal')
 text=frame.locator('body').evaluate('()=>NastranAnalysis.models["transient-modal"].text')
 preview='\r\n'.join(text.splitlines()[:6])
 assert frame.locator('#analysis-example-raw').text_content()==preview
 assert frame.locator('#analysis-toggle-raw').inner_text()=='全て表示'
 assert not frame.locator('#analysis-collapse-raw').is_visible()
 # Copy always contains the whole file, even when only six lines are displayed.
 frame.locator('#copy-analysis').click()
 page.wait_for_function('window.__copied.includes("SOL 112")')
 assert page.evaluate('window.__copied')==text
 for width in [320,390,430]:
  page.set_viewport_size({'width':width,'height':844})
  assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
 page.set_viewport_size({'width':390,'height':844})
 # A link in the preview restores the same preview and model on return.
 frame.locator('#analysis-example-raw a[href="bulk.html#EXEC_SOL_112"]').click()
 assert page.frame_locator('iframe').locator('#card-picker').input_value()=='EXEC_SOL_112'
 assert page.get_by_role('tab',name='Inputデータ',exact=True).get_attribute('aria-selected')=='true'
 page.get_by_role('button',name='‹ 戻る',exact=True).click()
 frame=page.frame_locator('iframe');page.wait_for_timeout(300)
 assert frame.locator('#analysis-example-raw').text_content()==preview
 assert frame.locator('#analysis-example-picker').input_value()=='transient-modal'
 frame.locator('#analysis-toggle-raw').click()
 assert frame.locator('#analysis-example-raw').text_content()==text
 assert frame.locator('#analysis-toggle-raw').get_attribute('aria-expanded')=='true'
 frame.locator('#analysis-example-raw a[href="bulk.html#TLOAD2"]').first.scroll_into_view_if_needed()
 before=frame.locator('body').evaluate('()=>scrollY')
 frame.locator('#analysis-example-raw a[href="bulk.html#TLOAD2"]').first.click()
 assert page.frame_locator('iframe').locator('#card-picker').input_value()=='TLOAD2'
 page.get_by_role('button',name='‹ 戻る',exact=True).click()
 frame=page.frame_locator('iframe');page.wait_for_timeout(250)
 assert frame.locator('#analysis-example-raw').text_content()==text
 assert abs(frame.locator('body').evaluate('()=>scrollY')-before)<3,('TLOAD2',before,frame.locator('body').evaluate('()=>scrollY'))
 frame.locator('#analysis-collapse-raw').click()
 assert frame.locator('#analysis-example-raw').text_content()==preview
 assert frame.locator('#analysis-toggle-raw').get_attribute('aria-expanded')=='false'
 frame.locator('#analysis-raw-details').scroll_into_view_if_needed()
 page.screenshot(path=str(ROOT/'.qa/input-preview.png'))
 # The results checklist opens the specific dictionary card and Back keeps position.
 page.get_by_role('tab',name='教材',exact=True).click()
 if page.locator('iframe').count():page.get_by_role('tab',name='教材',exact=True).click()
 page.get_by_role('button',name='共通の解析技術論',exact=True).click()
 page.get_by_role('button',name='関連ファイル・結果の読み方',exact=True).click()
 frame=page.frame_locator('iframe')
 frame.locator('a[href="#results"]').first.click()
 links=frame.locator('#missing-results a[href^="bulk.html#"]').evaluate_all('(els)=>els.map(a=>a.hash.slice(1))')
 assert {'CASE_DISPLACEMENT','CASE_SPCFORCES','CASE_FORCE','CASE_STRESS','PARAM_POST','MDLPRM'}.issubset(set(links))
 for key in dict.fromkeys(links):
  link=frame.locator('#missing-results a[href="bulk.html#'+key+'"]').first
  link.scroll_into_view_if_needed();before=frame.locator('body').evaluate('()=>scrollY')
  link.click()
  assert page.frame_locator('iframe').locator('#card-picker').input_value()==key,key
  assert page.get_by_role('tab',name='Inputデータ',exact=True).get_attribute('aria-selected')=='true'
  page.get_by_role('button',name='‹ 戻る',exact=True).click()
  frame=page.frame_locator('iframe');page.wait_for_timeout(300)
  assert abs(frame.locator('body').evaluate('()=>scrollY')-before)<3,(key,before,frame.locator('body').evaluate('()=>scrollY'))
 page.get_by_role('tab',name='設定',exact=True).click()
 page.get_by_role('radio',name='文字サイズ 特大',exact=True).click()
 page.get_by_role('tab',name='教材',exact=True).click()
 frame=page.frame_locator('iframe')
 for width in [320,390,430]:
  page.set_viewport_size({'width':width,'height':844})
  assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
  assert frame.locator('#missing-results .table-scroll').evaluate('e=>e.scrollWidth<=e.clientWidth+1')
 page.set_viewport_size({'width':390,'height':844})
 frame.locator('#missing-results').scroll_into_view_if_needed()
 page.screenshot(path=str(ROOT/'.qa/output-card-links.png'))
 assert not errors,errors
 browser.close()
print('PASS: 6-line preview/full/collapse; exact full copy; selected model, tabs and Back position; all result-card links; large text and 3 widths.')
