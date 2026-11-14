"""Actual App.tsx on React Native Web. Native OS services are mocked."""
import base64,json
from playwright.sync_api import sync_playwright
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':390,'height':844})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 labels=['ホーム','教材','解析','Inputデータ','設定']
 page.get_by_role('tab',name='ホーム',exact=True).wait_for()
 assert page.get_by_role('tab').count()==5
 def nav(label):page.get_by_role('tab',name=label,exact=True).click()
 def root(label):
  nav(label)
  if page.locator('iframe').count():nav(label)
 def bottom():
  assert page.get_by_role('tab').count()==5
  for label in labels:
   box=page.get_by_role('tab',name=label,exact=True).bounding_box()
   assert box and 0<=box['x'] and box['x']+box['width']<=page.viewport_size['width']+1
   assert box['y']+box['height']<=844 and box['height']>=44
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844})
  for label in labels:
   root(label) if label!='Inputデータ' else nav(label)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,label)
   bottom()
 page.set_viewport_size({'width':390,'height':844})
 root('ホーム')
 assert page.get_by_role('button',name='エラーメッセージ',exact=True).count()==1
 for title in ['初めての解析','入力規則','応力方向','座標']:
  assert page.get_by_role('button',name=title,exact=True).count()==0,title
 page.screenshot(path='.qa/five-tabs-home.png')
 root('教材')
 for title in ['イントロダクション','共通の解析技術論','各解析技術理論']:
  assert page.get_by_role('button',name=title,exact=True).count()==1
 for title in ['初めての解析','入力規則','応力方向','座標']:
  assert page.get_by_role('button',name=title,exact=True).count()==1,title
 page.get_by_role('button',name='初めての解析',exact=True).click()
 assert '解析経験者は読み飛ばして構いません' in page.frame_locator('iframe').locator('#first-analysis').inner_text()
 bottom();root('教材')
 page.get_by_role('button',name='座標',exact=True).click()
 frame=page.frame_locator('iframe');frame.locator('#systems').wait_for(state='visible');bottom()
 page.get_by_role('button',name='しおりを付ける').click()
 page.wait_for_function('JSON.parse(localStorage.getItem("nastran-learning-state-v1")).bookmarks.some(p=>p.path==="coordinates.html"&&p.hash==="#systems")')
 root('教材')
 page.get_by_role('button',name='共通の解析技術論',exact=True).click()
 for title in ['境界条件の理論','減衰の理論','並列計算・バッチ実行']:
  assert page.get_by_role('button',name=title,exact=True).count()==1
 page.screenshot(path='.qa/five-tabs-materials.png')
 page.get_by_role('button',name='境界条件の理論',exact=True).click()
 page.frame_locator('iframe').locator('#theory-detail').wait_for(state='visible');bottom()
 # Each requested analysis opens its distinct content, while retaining the bottom bar.
 root('解析')
 titles=['静解析','実固有値解析','複素固有値解析','熱伝導解析','モーダル周波数応答解析','直接周波数応答解析','過渡応答解析','亀裂先端解析','座屈解析']
 page.screenshot(path='.qa/five-tabs-analysis.png')
 for title in titles:
  page.get_by_role('button',name=title,exact=True).click()
  assert page.frame_locator('iframe').locator('h1').inner_text()==title
  bottom();nav('解析')
 page.get_by_role('button',name='実固有値解析',exact=True).click()
 frame=page.frame_locator('iframe')
 assert frame.locator('#analysis-example-raw,#save-analysis').count()==0
 frame.locator('#analysis-example-picker').select_option('tip-mass')
 card=frame.locator('[data-analysis-card="CONM2"]')
 card.scroll_into_view_if_needed()
 before=frame.locator('body').evaluate('()=>window.scrollY')
 card.click()
 assert page.frame_locator('iframe').locator('#card-picker').input_value()=='CONM2'
 page.get_by_role('button',name='‹ 戻る',exact=True).click()
 frame=page.frame_locator('iframe')
 assert frame.locator('#analysis-example-picker').input_value()=='tip-mass'
 page.wait_for_timeout(300)
 assert abs(frame.locator('body').evaluate('()=>window.scrollY')-before)<3
 page.screenshot(path='.qa/analysis-linked-card.png')
 page.get_by_role('button',name='しおりを付ける').click()
 page.wait_for_function('JSON.parse(localStorage.getItem("nastran-learning-state-v1")).bookmarks.some(p=>p.path==="analysis.html"&&p.hash==="#modes/tip-mass")')
 # Per-tab reading locations and 3-level input selector survive switching.
 nav('Inputデータ');frame=page.frame_locator('iframe')
 # Compact selector, real native reader wrapper; card heading is visible immediately.
 for width in [320,390]:
  page.set_viewport_size({'width':width,'height':844})
  assert frame.locator('.library-selectors select').count()==3
  assert frame.locator('.library-selectors').evaluate('e=>e.getBoundingClientRect().height')<=150
  assert frame.locator('.card-title h2').evaluate('e=>e.getBoundingClientRect().y')<230
  assert not frame.locator('.library-search').evaluate('e=>e.dataset.expanded==="true"')
 page.set_viewport_size({'width':390,'height':844})
 frame.locator('#input-family').select_option('executive');frame.locator('#category').select_option('SOL · 非線形');frame.locator('#card-picker').select_option('EXEC_SOL_400')
 assert frame.locator('.reference-section').filter(has_text='関連入力・参照関係').count()==1
 page.screenshot(path='.qa/qrg-app-sol400.png')
 nav('教材');nav('Inputデータ');frame=page.frame_locator('iframe')
 assert frame.locator('#card-picker').input_value()=='EXEC_SOL_400'
 frame.locator('#input-family').select_option('bulk');frame.locator('#category').select_option('棒・梁');frame.locator('#card-picker').select_option('CBAR')
 nav('解析');assert page.frame_locator('iframe').locator('h1').inner_text()=='実固有値解析'
 nav('Inputデータ');frame=page.frame_locator('iframe')
 assert frame.locator('#card-picker').input_value()=='CBAR'
 assert frame.locator('#category').input_value()=='棒・梁'
 # Settings are real persisted preferences; reader reload applies the new size.
 nav('設定');page.get_by_role('radio',name='文字サイズ 特大',exact=True).click()
 page.wait_for_function('JSON.parse(localStorage.getItem("nastran-learning-state-v1")).textScale===1.3')
 page.screenshot(path='.qa/five-tabs-settings.png')
 nav('解析');frame=page.frame_locator('iframe')
 assert frame.locator('.analysis-scenario-summary').first.evaluate('e=>getComputedStyle(e).fontSize')=='19.5px'
 page.screenshot(path='.qa/five-tabs-heat.png')
 page.reload(wait_until='networkidle')
 page.get_by_role('button',name='続きから読む →').click()
 assert page.frame_locator('iframe').locator('h1').inner_text()=='実固有値解析'
 assert page.frame_locator('iframe').locator('.analysis-scenario-summary').first.evaluate('e=>getComputedStyle(e).fontSize')=='19.5px'
 # Home bookmark list and error search remain reachable without another bottom tab.
 root('ホーム');page.get_by_role('button',name='しおり一覧').click()
 assert page.get_by_text('実固有値解析',exact=True).count()>=1
 page.get_by_role('button',name='エラーメッセージ',exact=True).click()
 frame=page.frame_locator('iframe');frame.locator('#error-query').fill('2025.0');frame.locator('#error-search-form button[type=submit]').click();frame.locator('[data-key="2025.0"]').click()
 assert frame.locator('#error-detail .error-id').inner_text()=='2025.0'
 bottom()
 # Native menu routes into the appropriate root tab.
 page.get_by_role('button',name='目次',exact=True).click()
 page.get_by_role('button',name='並列計算・バッチ実行',exact=True).click()
 page.frame_locator('iframe').locator('#save-batch').wait_for()
 assert page.get_by_role('tab',name='教材',exact=True).get_attribute('aria-selected')=='true'
 # A fresh Input root can go back to Home; it never shows an empty root page.
 page.reload(wait_until='networkidle');nav('Inputデータ')
 page.frame_locator('iframe').locator('#input-family').wait_for()
 page.get_by_role('button',name='‹ 戻る',exact=True).click()
 assert page.get_by_role('tab',name='ホーム',exact=True).get_attribute('aria-selected')=='true'
 assert page.get_by_role('button',name='エラーメッセージ',exact=True).is_visible()
 assert not errors,errors
 browser.close()
print('PASS: 5 persistent bottom tabs / 3 widths; all 9 tested analysis routes; home/materials grouping; per-tab input selection; model selection and linked-card return; bookmarks/restart; persisted font size; error search; menu/back. Native APIs mocked.')
