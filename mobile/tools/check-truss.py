"""SOL101 through the real App.tsx browser harness; native sharing is mocked."""
import base64
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
source=(ROOT/'sites/nastran-learning/dist/analysis-models.js').read_text(encoding='utf-8')
dat=json.loads(source.split(' = ',1)[1].strip().removesuffix(';'))['static']['text'].encode('ascii')
saved_dat=ROOT/'教材/model/01_静解析_SOL101/truss_sol101.dat'
if saved_dat.exists():assert saved_dat.read_bytes()==dat
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':390,'height':844})
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 page.get_by_role('tab',name='解析',exact=True).click()
 page.get_by_role('button',name='静解析',exact=True).click()
 frame=page.frame_locator('iframe')
 assert frame.locator('h1').inner_text()=='静解析'
 body=frame.locator('body').inner_text()
 assert '公開モデルに基づく条件変更例' not in body
 assert '公開PDFの完全リストを転記した入力' not in body
 assert all(x in body for x in ['7節点','11部材','800','70000','2400','3600','1.179794','1.206095'])
 assert frame.locator('#analysis-example-picker option').inner_text()=='単純支持トラスの静解析'
 assert '→ 1000 N' in frame.locator('.analysis-visual').inner_text()
 for width in [320,390,430]:
  page.set_viewport_size({'width':width,'height':844})
  assert frame.locator('body').evaluate('()=>document.documentElement.scrollWidth<=innerWidth')
  assert page.get_by_role('tab').count()==5
 page.set_viewport_size({'width':390,'height':844})
 frame.locator('#analysis-toggle-raw').click()
 assert frame.locator('#analysis-example-raw').text_content()==dat.decode('ascii')
 for key in ['GRID','CROD','PROD','MAT1','CASE_FORCE','FORCE','LOAD','SPCADD']:
  frame.locator('#analysis-example-raw a[href="bulk.html#'+key+'"]').first.scroll_into_view_if_needed()
  y=frame.locator('body').evaluate('()=>scrollY')
  frame.locator('#analysis-example-raw a[href="bulk.html#'+key+'"]').first.click()
  assert page.frame_locator('iframe').locator('#card-picker').input_value()==key
  page.get_by_role('button',name='‹ 戻る',exact=True).click()
  frame=page.frame_locator('iframe');page.wait_for_timeout(250)
  assert frame.locator('#analysis-raw-details').evaluate('e=>e.dataset.expanded==="true"')
  assert abs(frame.locator('body').evaluate('()=>scrollY')-y)<3
 frame.locator('#save-analysis').click()
 page.wait_for_function('window.__shares.some(s=>s.uri.endsWith("/truss_sol101.dat"))')
 shared=page.evaluate('window.__shares.find(s=>s.uri.endsWith("/truss_sol101.dat"))')
 assert base64.b64decode(shared['data'])==dat
 frame.locator('#copy-analysis').click()
 page.wait_for_function('window.__copied.includes("SIMPLY SUPPORTED TRUSS")')
 assert page.evaluate('window.__copied')==dat.decode('ascii')
 page.get_by_role('tab',name='設定',exact=True).click()
 page.get_by_role('radio',name='文字サイズ 特大',exact=True).click()
 page.get_by_role('tab',name='解析',exact=True).click()
 frame=page.frame_locator('iframe')
 assert frame.locator('.analysis-head>p').evaluate('e=>getComputedStyle(e).fontSize')=='19.5px'
 frame.locator('.analysis-visual').scroll_into_view_if_needed()
 page.screenshot(path=str(ROOT/'mobile/.qa/truss-app.png'))
 assert not errors,errors
 browser.close()
print('PASS: SOL101 intent/data labels; 3 widths; 8 code links and exact Back position; native DAT/copy matches saved file; large text.')
