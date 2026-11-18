"""Verify the actual shared native header and card components across tab roots."""
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('.qa/tab-headers');OUT.mkdir(parents=True,exist_ok=True)
STYLE='''e=>{const s=getComputedStyle(e);return Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','padding','borderRadius','borderColor','display','flexDirection','gap'].map(k=>[k,s[k]]));}'''
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844});reference=None;card_style=None
  for tab in ['ホーム','教材','解析','Inputデータ','設定']:
   page.get_by_role('tab',name=tab,exact=True).click()
   assert page.locator('iframe').count()==0,tab
   header=page.get_by_test_id('tab-header');title=page.get_by_test_id('tab-title')
   assert header.count()==1 and title.inner_text()==tab
   current=[header.evaluate(STYLE),title.evaluate(STYLE)]
   if reference is None:reference=current
   assert current==reference,(width,tab)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,tab)
   if tab=='解析':card_style=page.get_by_role('button',name='静解析',exact=True).evaluate(STYLE)
   if tab=='Inputデータ':
    assert page.get_by_role('button',name='Executive Control',exact=True).evaluate(STYLE)==card_style
   page.screenshot(path=str(OUT/f'{width}-{tab}.png'))
 # OTA index changes update native search too, without a JS build.
 page.get_by_role('tab',name='Inputデータ',exact=True).click()
 page.get_by_role('textbox',name='語句・カード名で探す').fill('ＣＥＬＡＳ')
 assert page.get_by_role('button',name='CELAS',exact=False).count()==4
 page.get_by_role('button',name='CELAS3',exact=False).click()
 assert page.frame_locator('iframe').locator('#card-picker').input_value()=='CELAS3'
 page.get_by_role('tab',name='Inputデータ',exact=True).click()
 assert page.locator('iframe').count()==0
 assert page.get_by_test_id('tab-title').inner_text()=='Inputデータ'
 assert not errors,errors;b.close();print('PASS: five identical native headers, shared cards, 3 widths and Input root/detail navigation.')
