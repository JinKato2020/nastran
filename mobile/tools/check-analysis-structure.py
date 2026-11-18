"""Exercise all new analysis comparisons with actual shared article/lab/quiz code."""
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/structure-analysis';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((DIST/'analysis.html').as_uri()+'#thick-cylinder')
 assert page.locator('#analysis-example-picker').input_value()=='cyl-open'
 assert page.locator('#analysis-study-picker').input_value()=='ends'
 assert page.locator('#analysis-example-picker option').count()==4
 page.locator('#analysis-study-picker').select_option('mesh')
 assert page.locator('#analysis-example-picker option').count()==3
 page.locator('#analysis-example-picker').select_option('cyl-fine')
 page.locator('[data-analysis-tab="results"]').click()
 assert '利用者の実行値を記録' in page.locator('[data-analysis-panel="results"]').inner_text()
 page.locator('#analysis-study-picker').select_option('ends')
 assert page.locator('[data-analysis-tab="results"]').get_attribute('aria-selected')=='true'
 routes=page.evaluate("()=>['thick-cylinder','buckling'].flatMap(k=>AnalysisScenarios[k].models.map(m=>[k,m.id]))")
 answers=0
 for key,model in routes:
  page.goto((DIST/'analysis.html').as_uri()+'#'+key+'/'+model)
  page.evaluate('dispatchEvent(new Event("hashchange"))')
  assert page.locator('#analysis-example-picker').input_value()==model
  assert page.locator('.element-key > ol > li').count()==3
  model_text=page.locator('[data-analysis-panel="model"]').inner_text()
  assert 'undefined' not in model_text
  assert page.locator('[data-analysis-tab="quiz"]').count()==1
  # Physical diagrams and plots contain symbols only; explanatory text is outside SVG.
  texts=page.locator('.analysis-scenario-figure svg text,[data-structure-lab] svg text').all_text_contents()
  import re
  assert not any(re.search('[\u3040-\u30ff\u3400-\u9fff]',t) for t in texts),(model,texts)
  for tab in ['model','input','results','quiz']:
   page.locator('[data-analysis-tab="'+tab+'"]').click()
   for width in [320,390,768]:
    page.set_viewport_size({'width':width,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(model,tab,width)
   page.set_viewport_size({'width':390,'height':844})
  cards=page.locator('.aq-q');assert cards.count()==3
  qdata=page.evaluate('([k,m])=>AnalysisQuiz.resolve(k,m).questions.map(q=>({answer:q.answer,value:q.verify.check.expect}))',[key,model])
  for i,q in enumerate(qdata):
   row=cards.nth(i);row.locator('.aq-opt').nth((q['answer']+1)%4).click();row.locator('.aq-opt').nth(q['answer']).click()
   assert '正解です' in row.locator('.aq-result').inner_text()
   row.locator('.aq-check input').fill(str(q['value']));row.locator('.aq-run').click()
   assert 'ok' in row.locator('.aq-diag').get_attribute('class'),(model,i,row.inner_text())
   answers+=1
  assert '初回の正解数：0問' in page.locator('.aq-score').inner_text()
  page.locator('[data-analysis-tab="model"]').click()
  lab=page.locator('[data-structure-lab]')
  if lab.count():
   for control in lab.locator('input[type="range"]').all():
    for edge in ['min','max']:
     control.evaluate('(e,edge)=>{e.value=e[edge];e.dispatchEvent(new Event("input",{bubbles:true}));}',edge)
     assert '図を描けませんでした' not in lab.inner_text()
   for control in lab.locator('select').all():
    for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
     control.select_option(value)
     assert '図を描けませんでした' not in lab.inner_text()
   for width in [320,390,768]:
    page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   page.set_viewport_size({'width':390,'height':844});lab.screenshot(path=str(OUT/(model+'-lab.png')))
  page.locator('[data-analysis-tab="input"]').click()
  if model in ['cyl-open','cyl-closed','cyl-locked','cyl-external','buck-fixed-pinned','buck-blocked']:
   assert page.locator('#analysis-original-input').count()==0
  links=page.locator('[data-analysis-panel="input"] a[href^="bulk.html#"]')
  assert links.count()>5
  links.first.click();assert page.locator('#card-picker').count()==1
  page.go_back();assert page.locator('#analysis-example-picker').input_value()==model
  assert page.locator('[data-analysis-tab="input"]').get_attribute('aria-selected')=='true'
  page.locator('[data-analysis-tab="model"]').click()
  page.screenshot(path=str(OUT/(model+'-article.png')))
 assert answers==36
 assert not errors,errors;b.close()
 print('PASS: 12 comparisons, 36 questions, first-attempt scores, all controls, card/back links, legacy mesh routes, language-neutral figures and 320/390/768px.')
