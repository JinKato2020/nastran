"""Check modal-output explanations in the actual analysis reader."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/modal-output';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 expect.set_options(timeout=15000)
 browser=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':390,'height':844});errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 for model in ['baseline','tip-mass','both-fixed']:
  page.goto((DIST/'analysis.html').as_uri()+'#modes/'+model+'/results',wait_until='domcontentloaded')
  expect(page.locator('#modal-output-guide')).to_be_visible()
  expect(page.locator('[data-analysis-tab="results"]')).to_have_attribute('aria-selected','true')
  assert page.locator('#modal-output-guide .element-toc li').count()==5
  reader=page.locator('[data-f06-reader]')
  selector=reader.locator('[data-f06-page]')
  body=reader.locator('[data-f06-body]')
  expect(selector).to_have_value('1')
  assert body.locator('.f06-columns code').all_text_contents()==['MODE NO.','EXTRACTION ORDER','EIGENVALUE','RADIANS','CYCLES','GENERALIZED MASS','GENERALIZED STIFFNESS']
  assert body.locator('pre').first.inner_text().splitlines()[3].split()==['1','1','9.869604E+02','3.141593E+01','5.000000E+00','1.000000E+00','9.869604E+02']
  assert '仮想の F06' in reader.inner_text() and not reader.locator('a[href*="github.com"]').count()
  assert body.locator('pre').first.evaluate("(e)=>!!(e.compareDocumentPosition(e.closest('[data-f06-body]').querySelector('.f06-columns')) & Node.DOCUMENT_POSITION_FOLLOWING)")
  for width in [320,390,768]:
   page.set_viewport_size({'width':width,'height':844})
   for i in range(8):
    selector.select_option(str(i))
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(model,width,i)
    assert body.locator('pre').count()>0
    assert not body.locator('a[href*="undefined"]').count()
  reader.locator('.f06-index summary').click()
  reader.locator('[data-f06-index="3"]').click()
  expect(selector).to_have_value('3')
  assert body.locator('.f06-columns code').all_text_contents()==['MODE NO.','FREQUENCY','T1 / FRACTION','T1 / SUM','T2 / FRACTION','T2 / SUM','T3 / FRACTION','T3 / SUM']
  reader.locator('[data-f06-next]').click()
  expect(body.locator('h4').first).to_contain_text('PARTICIPATION')
  reader.locator('[data-f06-prev]').click()
  expect(selector).to_have_value('3')
  selector.select_option('0')
  expect(reader.locator('[data-f06-prev]')).to_be_disabled()
  selector.select_option('7')
  expect(reader.locator('[data-f06-next]')).to_be_disabled()
  selector.select_option('1')
  page.set_viewport_size({'width':390,'height':844})
  if model=='baseline':
   body.locator('h3').scroll_into_view_if_needed()
   body.screenshot(path=str(OUT/'f06-virtual-eigenvalues.png'))
  old=page.url
  page.locator('#modal-output-guide summary').click()
  page.locator('#modal-output-guide [data-jump="modal-output-quiz"]').click()
  assert page.url==old
  assert page.locator('#modal-output-guide a[href="theory.html#modes"]').count()==1
  if model=='baseline':
   # First six places to look: the printed (spaced) titles survive as searchable text.
   assert page.locator('#modal-output-map .f06-key').nth(3).evaluate('e=>e.textContent')=='R E A L   E I G E N V A L U E S'
   selector.select_option('6')
   assert len(body.locator('pre').first.inner_text().splitlines())==11  # three heading lines and one row per mode
   expect(body.locator('.f06-columns li').first).to_contain_text('モード番号')
   quiz=page.locator('#modal-output-quiz .aq')
   assert quiz.locator('.aq-q').count()==7
   for n,right in enumerate([2,1,2,2,2,1,2]):
    quiz.locator(f'.aq-q[data-n="{n}"] .aq-opt[data-i="{right}"]').click()
    assert quiz.locator(f'.aq-q[data-n="{n}"] .aq-result').inner_text()=='正解です。'
   assert '7問中 7問に回答、初回の正解数：7問' in quiz.locator('.aq-score').inner_text()
   card=quiz.locator('.aq-q[data-n="2"]')
   card.locator('.aq-check input').fill('0.809')
   card.locator('.aq-run').click()
   assert 'GPWG' in card.locator('.aq-diag').inner_text()
   card=quiz.locator('.aq-q[data-n="0"]')
   card.locator('.aq-check input').fill('986.9604')
   card.locator('.aq-run').click()
   assert 'EIGENVALUE' in card.locator('.aq-diag').inner_text()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('#modal-output-map a[href="bulk.html#CASE_MEFFMASS"]').click()
  expect(page.locator('#card-picker')).to_be_visible()
  assert 'PARTFAC' in page.locator('#card-detail').inner_text()
  page.go_back()
  expect(page.locator('[data-analysis-tab="results"]')).to_have_attribute('aria-selected','true')
  assert model in page.url
  page.locator('[data-analysis-tab="input"]').click()
  assert page.locator('[data-analysis-panel="input"] a[href="bulk.html#CASE_MEFFMASS"]').count()>=2
 # Native search receives the same catalog through the generated bulk page; web search must also find it.
 page.goto((DIST/'bulk.html').as_uri()+'#CASE_MEFFMASS',wait_until='domcontentloaded')
 assert 'SUMMARY' in page.locator('#card-detail').inner_text()
 assert '2025.1' in page.locator('#card-detail').inner_text()
 # Shared guidance remains in the real-modes result route, with links from other analyses.
 for route in ['prestressed-modes/pre-none','complex-modes/undamped','modal-frequency/mfreq-one','transient/trans-modal']:
  page.goto((DIST/'analysis.html').as_uri()+'#'+route+'/results',wait_until='domcontentloaded')
  expect(page.locator('[data-analysis-panel="results"] a[href="analysis.html#modes/baseline/results"]')).to_be_visible()
  assert page.locator('#modal-output-guide').count()==0
 # The concept (mode-shape size vs effective mass) moved to the lesson: switching the normalization keeps the effective mass.
 page.goto((DIST/'theory.html').as_uri()+'#modes',wait_until='domcontentloaded')
 lab=page.locator('[data-lab="lab-modal-mass"]')
 lab.locator('svg').first.wait_for()
 for mode,mass in [('1','2.667 kg'),('2','0.3333 kg')]:
  lab.locator('select[data-lab-input="mode"]').select_option(mode)
  for norm in ['MASS','MAX']:
   lab.locator('select[data-lab-input="norm"]').select_option(norm)
   assert mass in lab.locator('.theory-lab-readout').inner_text(),(mode,norm)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 assert page.locator('a[href="analysis.html#modes/baseline/results"]').count()>=1
 assert not errors,errors
 browser.close()
 print('PASS: three modal result routes, F06 map and virtual-F06 reader (8 tables), seven F06 reading questions, lesson effective-mass lab, Input/back navigation, shared references and 320/390/768px.')
