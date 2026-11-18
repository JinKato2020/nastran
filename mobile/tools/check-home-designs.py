"""Exercise the real native home/settings components; only OS services are mocked."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('.qa/home-designs');OUT.mkdir(parents=True,exist_ok=True)
STORAGE='nastran-learning-state-v1'
DESIGNS=[('blueprint','ブループリント'),('graphite','グラファイト'),('minimal','ミニマル')]
BASE={'version':1,'progress':'[1,3]','courseProgress':'["model"]','textScale':1,'last':{'path':'elements.html','hash':'#solid','y':120},'bookmarks':[{'path':'coordinates.html','hash':'#systems','y':0},{'path':'elements.html','hash':'#beam','y':0},{'path':'theory.html','hash':'#damping','y':0},{'path':'analysis.html','hash':'#static','y':0}]}
STYLE='e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor,s.padding,s.fontSize,s.borderColor,s.gap]}'
with sync_playwright() as pw:
 expect.set_options(timeout=15000)
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((Path(__file__).resolve().parents[1]/'.qa/app/index.html').as_uri(),wait_until='domcontentloaded')
 nav=page.get_by_role('tablist',name='メインナビゲーション')
 def root(name):
  nav.get_by_role('tab',name=name,exact=True).click()
  if page.locator('iframe').count():nav.get_by_role('tab',name=name,exact=True).click()
 def home_tab(design,section):
  if design=='blueprint':page.get_by_role('tab',name={'basics':'基礎を学ぶ','work':'実務で調べる','saved':'しおり一覧'}[section],exact=True).click()
  elif section=='basics' and design=='graphite':
   toggle=page.get_by_role('button',name='基礎項目をすべて見る',exact=True)
   if toggle.get_attribute('aria-expanded')!='true':toggle.click()
  elif section=='work' and design=='minimal':
   toggle=page.get_by_role('button',name='モデル作成・実行・結果',exact=True)
   if toggle.get_attribute('aria-expanded')!='true':toggle.click()
  elif section=='saved':
   toggle=page.get_by_role('button',name='しおり一覧',exact=True)
   if toggle.get_attribute('aria-expanded')!='true':toggle.click()
 # Fresh install has a real introduction CTA, never fake reading progress or a fabricated last lesson.
 expect(page.get_by_test_id('home-design-blueprint')).to_be_visible()
 expect(page.get_by_role('button',name='初めての解析を開く',exact=True)).to_be_visible()
 assert page.get_by_role('button',name='続きから読む →',exact=True).count()==0
 page.get_by_role('button',name='初めての解析を開く',exact=True).click()
 page.frame_locator('iframe').locator('#first-analysis').wait_for(state='visible')
 # Old records without the new field migrate without erasing progress, position or bookmarks.
 page.close()
 page=b.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script('if(!localStorage.getItem('+json.dumps(STORAGE)+'))localStorage.setItem('+json.dumps(STORAGE)+','+json.dumps(json.dumps(BASE))+');')
 page.goto((Path(__file__).resolve().parents[1]/'.qa/app/index.html').as_uri(),wait_until='domcontentloaded');nav=page.get_by_role('tablist',name='メインナビゲーション')
 for design,label in DESIGNS:
  print('Checking '+design,flush=True)
  root('設定');before=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',STORAGE)
  page.get_by_role('radio',name='ホームデザイン '+label,exact=True).click()
  expect(page.get_by_role('radio',name='ホームデザイン '+label,exact=True)).to_have_attribute('aria-checked','true')
  page.wait_for_function('([key,value])=>JSON.parse(localStorage.getItem(key)).homeDesign===value',arg=[STORAGE,design])
  record=page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',STORAGE)
  assert record['progress']==before['progress'] and record['courseProgress']==before['courseProgress']
  assert record['last']==before['last'] and record['textScale']==before['textScale']
  if design=='blueprint':
   assert record['progress']==BASE['progress'] and record['courseProgress']==BASE['courseProgress']
  assert record['bookmarks']==BASE['bookmarks']
  for width in [320,390,768]:
   page.set_viewport_size({'width':width,'height':844});reference=None
   for label2 in ['ホーム','教材','解析','Inputデータ','設定']:
    root(label2);header=page.get_by_test_id('tab-header');current=[header.evaluate(STYLE),page.get_by_test_id('tab-title').evaluate(STYLE)]
    if reference is None:reference=current
    assert current==reference,(design,width,label2)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(design,width,label2)
    for tab in nav.get_by_role('tab').all():
     box=tab.bounding_box();assert box and box['height']>=44 and box['y']+box['height']<=845
   root('ホーム');page.screenshot(path=str(OUT/f'{design}-{width}.png'))
  page.set_viewport_size({'width':390,'height':844});page.reload(wait_until='domcontentloaded')
  expect(page.get_by_test_id('home-design-'+design)).to_be_visible()
  page.get_by_role('button',name='続きから読む →',exact=True).click();page.frame_locator('iframe').locator(record['last']['hash']).wait_for(state='visible')
  page.get_by_role('button',name='‹ 戻る',exact=True).click();expect(page.get_by_test_id('home-design-'+design)).to_be_visible()
  home_tab(design,'basics')
  for title in ['初めての解析','入力規則','節点・スカラー点','座標','要素の向き','応力方向','MSC Nastranファイルの構成']:
   page.get_by_role('button',name=title,exact=True).click();page.frame_locator('iframe').locator('body').wait_for(state='visible')
   page.get_by_role('button',name='‹ 戻る',exact=True).click();expect(page.get_by_test_id('home-design-'+design)).to_be_visible()
  home_tab(design,'work')
  for title in ['モデル化の考え方','INCLUDEとファイル分割','並列計算・バッチ実行','関連ファイル・結果の読み込み','エラーメッセージ','資料・サポート']:
   page.get_by_role('button',name=title,exact=True).click();page.frame_locator('iframe').locator('body').wait_for(state='visible')
   page.get_by_role('button',name='‹ 戻る',exact=True).click()
   expect(page.get_by_test_id('home-design-'+design)).to_be_visible()
  home_tab(design,'saved');assert page.get_by_test_id('home-bookmarks').get_by_role('button',name='しおり：',exact=False).count()==3
  page.get_by_role('button',name='すべてのしおりを見る',exact=True).click();assert page.get_by_test_id('home-bookmarks').get_by_role('button',name='しおり：',exact=False).count()==4
  page.get_by_role('button',name='しおり：座標',exact=True).click();page.frame_locator('iframe').locator('#systems').wait_for(state='visible');page.get_by_role('button',name='‹ 戻る',exact=True).click()
  page.get_by_role('button',name='3件に戻す',exact=True).click()
 # Deleting one bookmark preserves the rest, across a design change and reload.
 page.get_by_role('button',name='しおりを削除：座標',exact=True).click()
 root('設定');page.get_by_role('radio',name='ホームデザイン ブループリント',exact=True).click()
 page.wait_for_function('(key)=>JSON.parse(localStorage.getItem(key)).bookmarks.length===3',arg=STORAGE)
 page.get_by_role('button',name='アイコンライセンス',exact=True).click();assert 'ISC License' in page.locator('body').inner_text();page.get_by_role('button',name='ライセンスを閉じる',exact=True).click()
 page.reload(wait_until='domcontentloaded');home_tab('blueprint','saved')
 assert page.get_by_test_id('home-bookmarks').get_by_role('button',name='しおり：',exact=False).count()==3
 assert not errors,errors;b.close()
 print('PASS: all three native designs, persistence/migration, 13 real routes per design, resume/back, bookmarks/delete, licenses, shared headers, 5 bottom tabs and 320/390/768px.')
