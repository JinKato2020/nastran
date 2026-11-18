"""Actual shared article/lab/quiz controls; no solver run is implied."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/eigen-analysis';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 expect.set_options(timeout=15000)
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((DIST/'analysis.html').as_uri()+'#prestressed-modes',wait_until='domcontentloaded')
 expect(page.locator('#analysis-example-picker')).to_be_visible()
 assert page.locator('#analysis-example-picker option').count()==5
 routes=page.evaluate("()=>['prestressed-modes','complex-modes'].flatMap(k=>AnalysisScenarios[k].models.map(m=>[k,m.id]))")
 answers=0;labs=0
 for key,model in routes:
  print('Checking '+model,flush=True)
  page.goto((DIST/'analysis.html').as_uri()+'#'+key+'/'+model,wait_until='domcontentloaded')
  page.evaluate('dispatchEvent(new Event("hashchange"))')
  expect(page.locator('[data-analysis-tab="quiz"]')).to_be_visible()
  assert page.locator('.element-key > ol > li').count()==3
  assert 'undefined' not in page.locator('[data-analysis-panel="model"]').inner_text()
  texts=page.locator('.analysis-scenario-figure svg text,[data-eigen-lab] svg text').all_text_contents()
  assert not any(re.search('[\u3040-\u30ff\u3400-\u9fff]',t) for t in texts),(model,texts)
  for tab in ['model','input','results','quiz']:
   page.locator('[data-analysis-tab="'+tab+'"]').click()
   for width in [320,390,768]:
    page.set_viewport_size({'width':width,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(model,tab,width)
   page.set_viewport_size({'width':390,'height':844})
  qdata=page.evaluate('([k,m])=>AnalysisQuiz.resolve(k,m).questions.map(q=>({answer:q.answer,value:q.verify.check.expect}))',[key,model])
  cards=page.locator('.aq-q');assert cards.count()==4
  for i,q in enumerate(qdata):
   row=cards.nth(i);row.locator('.aq-opt').nth((q['answer']+1)%4).click();row.locator('.aq-opt').nth(q['answer']).click()
   assert '正解です' in row.locator('.aq-result').inner_text()
   row.locator('.aq-check input').fill(str(q['value']));row.locator('.aq-run').click()
   assert 'ok' in row.locator('.aq-diag').get_attribute('class'),(model,i,row.inner_text())
   answers+=1
  assert '初回の正解数：0問' in page.locator('.aq-score').inner_text()
  page.locator('[data-analysis-tab="model"]').click()
  for lab in page.locator('[data-eigen-lab]').all():
   labs+=1;assert lab.locator('svg').count()>0,(model,lab.inner_text())
   original=lab.locator('.theory-lab-readout').inner_text()
   for control in lab.locator('input[type="range"]').all():
    for edge in ['min','max']:
     control.evaluate('(e,edge)=>{e.value=e[edge];e.dispatchEvent(new Event("input",{bubbles:true}));}',edge)
     assert '図を描けませんでした' not in lab.inner_text()
     assert not re.search(r'\b(?:NaN|Infinity|undefined)\b',lab.inner_text())
   for control in lab.locator('select').all():
    for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):control.select_option(value)
   assert lab.locator('.theory-lab-readout').inner_text()!=original
   for width in [320,768]:
    page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   page.set_viewport_size({'width':390,'height':844})
   lab.screenshot(path=str(OUT/(model+'-'+lab.get_attribute('data-kind')+'.png')))
  page.locator('[data-analysis-tab="input"]').click()
  if model in ['pre-critical','pre-blocked']:assert page.locator('#analysis-original-input').count()==0
  links=page.locator('[data-analysis-panel="input"] a[href^="bulk.html#"]');assert links.count()>15
  links.first.click();expect(page.locator('#card-picker')).to_be_visible()
  page.go_back();expect(page.locator('[data-analysis-tab="input"]')).to_have_attribute('aria-selected','true')
  assert model in page.url
  page.locator('[data-analysis-tab="model"]').click()
  page.screenshot(path=str(OUT/(model+'-article.png')))
 # Two independent choices must follow model, cards, questions and results.
 page.goto((DIST/'analysis.html').as_uri()+'#complex-modes/undamped',wait_until='domcontentloaded')
 page.evaluate('dispatchEvent(new Event("hashchange"))')
 for method,damping,model in [('110','off','modal-undamped'),('110','on','modal-damped'),('107','on','direct-damped'),('107','off','undamped')]:
  page.locator('#analysis-method-picker').select_option(method);page.locator('#analysis-damping-picker').select_option(damping)
  assert model in page.url
  page.locator('[data-analysis-tab="quiz"]').click()
  assert page.locator('.aq').get_attribute('data-model')==model
  page.locator('[data-analysis-tab="input"]').click()
  count=page.locator('[data-analysis-panel="input"] a[data-analysis-card="CASE_METHOD"]').count()
  assert (count>0)==(method=='110')
 assert answers==36 and labs==11,(answers,labs)
 assert not errors,errors;b.close()
 print('PASS: 9 comparisons, 36 questions, 11 interactive labs, all controls, independent complex choices, card/back links and 320/390/768px.')
