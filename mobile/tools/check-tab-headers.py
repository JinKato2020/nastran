"""Verify the actual shared native header and card components across tab roots."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
OUT=Path('.qa/tab-headers');OUT.mkdir(parents=True,exist_ok=True)
STYLE='''e=>{const s=getComputedStyle(e);return Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','padding','borderRadius','borderColor','display','flexDirection','gap'].map(k=>[k,s[k]]));}'''
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');page=b.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:8766',wait_until='networkidle')
 for width in [320,390,768]:
  page.set_viewport_size({'width':width,'height':844});reference=None;card_style=None;group_style=None
  for tab in ['ホーム','教材','解析','Inputデータ','設定']:
   page.get_by_role('tab',name=tab,exact=True).click()
   page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')
   assert page.locator('iframe').count()==0,tab
   header=page.get_by_test_id('tab-header');title=page.get_by_test_id('tab-title')
   assert header.count()==1 and title.inner_text()==tab
   current=[header.evaluate(STYLE),title.evaluate(STYLE)]
   if reference is None:reference=current
   assert current==reference,(width,tab)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(width,tab)
   if tab in ['教材','解析','Inputデータ']:
    group=page.get_by_test_id('lesson-group').first
    toggle=group.get_by_test_id('lesson-group-toggle')
    current_group=[group.evaluate(STYLE),toggle.evaluate(STYLE)]
    if group_style is None:group_style=current_group
    assert current_group==group_style,(width,tab,'chapter styles')
    expect(page.get_by_test_id('lesson-group-body')).to_have_count(0)
    expect(toggle).to_have_attribute('aria-expanded','false')
    toggle.click()
    expect(toggle).to_have_attribute('aria-expanded','true')
    expect(page.get_by_test_id('lesson-group-body')).to_have_count(1)
    card=group.get_by_test_id('lesson-group-body').get_by_role('button').first
    if card_style is None:card_style=card.evaluate(STYLE)
    assert card.evaluate(STYLE)==card_style,(width,tab,'section styles')
    toggle.click()
    expect(toggle).to_have_attribute('aria-expanded','false')
    expect(page.get_by_test_id('lesson-group-body')).to_have_count(0)
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
 assert not errors,errors;b.close();print('PASS: five identical native headers; Materials/Analysis/Input share chapter and section styles; 3 widths, collapse/expand and Input navigation.')
