"""Interactive response lessons, model-specific questions and card navigation."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/response-analysis';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 expect.set_options(timeout=15000)
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((DIST/'analysis.html').as_uri()+'#direct-frequency',wait_until='domcontentloaded')
 expect(page.locator('#analysis-example-picker')).to_be_visible()
 routes=page.evaluate("()=>['direct-frequency','modal-frequency','transient'].flatMap(k=>AnalysisScenarios[k].models.map(m=>[k,m.id]))")
 answers=0;labs=0;seen=set()
 for key,model in routes:
  print('Checking '+model,flush=True)
  page.goto((DIST/'analysis.html').as_uri()+'#'+key+'/'+model,wait_until='domcontentloaded')
  page.evaluate('dispatchEvent(new Event("hashchange"))')
  assert page.locator('[data-analysis-tab="quiz"]').count()==0
  assert page.locator('.element-key > ol > li').count()==3
  main=page.locator('[data-analysis-panel="model"]').inner_text()
  assert 'undefined' not in main and main not in seen;seen.add(main)
  texts=page.locator('.analysis-scenario-figure svg text,[data-response-lab] svg text').all_text_contents()
  assert not any(re.search('[\u3040-\u30ff\u3400-\u9fff]',t) for t in texts),(model,texts)
  for tab in ['model','input','results']:
   page.locator('[data-analysis-tab="'+tab+'"]').click()
   for width in [320,390,768]:
    page.set_viewport_size({'width':width,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(model,tab,width)
   page.set_viewport_size({'width':390,'height':844})
  if key=='modal-frequency':
   target=page.locator('#analysis-model-results')
   assert target.is_visible() and target.locator('svg[role="img"]').count()==1
   assert page.locator('[data-analysis-panel="results"] [data-result-check]').count()==int(model in ('mfreq-six','mfreq-antisymmetric'))
   assert page.locator('[data-analysis-panel="input"] .aq-q').count()==2
   assert page.locator('[data-analysis-panel="results"] .aq-q').count()==2
   target.screenshot(path=str(OUT/(model+'-result.png')))
   page.locator('[data-analysis-tab="input"]').click()
   assert page.locator('#analysis-model-input').is_visible()
   page.locator('[data-analysis-tab="model"]').click()
   lab=page.locator('[data-response-lab]')
   if model=='mfreq-antiresonance':
    sensor=lab.locator('select[data-lab-input="sensor"]')
    assert lab.locator('select[data-lab-input="modes"]').input_value()=='2'
    before=lab.locator('.theory-lab-svg polyline').first.get_attribute('points')
    sensor.select_option('1')
    assert before!=lab.locator('.theory-lab-svg polyline').first.get_attribute('points')
    assert '|u₂|' in lab.locator('.theory-lab-readout').inner_text()
    sensor.select_option('0')
   if model=='mfreq-six':
    assert lab.locator('svg[aria-label="根元表面の曲げ応力振幅"]').count()==1
  qdata=page.evaluate('([k,m])=>AnalysisQuiz.resolve(k,m).questions.map(q=>({answer:q.answer,value:q.verify.check.expect}))',[key,model])
  assert page.locator('.aq-q').count()==4
  seen_n=[]
  for part in ['input','results']:  # input questions close the Input tab, result questions close the Results tab
   page.locator('[data-analysis-tab="'+part+'"]').click()
   cards=page.locator('[data-analysis-panel="'+part+'"] .aq-q')
   for j in range(cards.count()):
    row=cards.nth(j);i=int(row.get_attribute('data-n'));q=qdata[i];seen_n.append(i)
    row.locator('.aq-opt').nth((q['answer']+1)%4).click();row.locator('.aq-opt').nth(q['answer']).click()
    assert '正解です' in row.locator('.aq-result').inner_text()
    row.locator('.aq-check input').fill(str(q['value']));row.locator('.aq-run').click()
    assert 'ok' in row.locator('.aq-diag').get_attribute('class'),(model,i,row.inner_text())
    answers+=1
   if cards.count():assert '初回の正解数：0問' in page.locator('[data-analysis-panel="'+part+'"] .aq-score').inner_text()
  assert sorted(seen_n)==list(range(len(qdata))),(model,seen_n)
  page.locator('[data-analysis-tab="model"]').click()
  for lab in page.locator('[data-response-lab]').all():
   labs+=1;assert lab.locator('svg').count()>0
   lab.screenshot(path=str(OUT/(model+'-default.png')))
   initial=lab.locator('.theory-lab-readout').inner_text()
   for control in lab.locator('input[type="range"]').all():
    for edge in ['min','max']:
     control.evaluate('(e,edge)=>{e.value=e[edge];e.dispatchEvent(new Event("input",{bubbles:true}));}',edge)
     assert '図を描けませんでした' not in lab.inner_text()
     assert not re.search(r'\b(?:NaN|Infinity|undefined)\b',lab.inner_text())
   for control in lab.locator('select').all():
    for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):
     control.select_option(value)
     assert '図を描けませんでした' not in lab.inner_text()
     assert not re.search(r'\b(?:NaN|Infinity|undefined)\b',lab.inner_text())
   assert initial!=lab.locator('.theory-lab-readout').inner_text()
   for width in [320,768]:
    page.set_viewport_size({'width':width,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   page.set_viewport_size({'width':390,'height':844});lab.screenshot(path=str(OUT/(model+'-controls.png')))
  page.locator('[data-analysis-tab="input"]').click()
  if model in ['dfreq-phase','dfreq-low-damping','mfreq-antisymmetric','mfreq-antiresonance','trans-coarse','trans-ramp']:assert page.locator('#analysis-original-input').count()==0
  links=page.locator('[data-analysis-panel="input"] a[href^="bulk.html#"]');assert links.count()>20
  links.first.click();expect(page.locator('#card-picker')).to_be_visible()
  page.go_back();expect(page.locator('[data-analysis-tab="input"]')).to_have_attribute('aria-selected','true');assert model in page.url
 # Same-page selection must change the question set and preserve per-model controls.
 page.goto((DIST/'analysis.html').as_uri()+'#direct-frequency/dfreq-coarse',wait_until='domcontentloaded')
 page.evaluate('dispatchEvent(new Event("hashchange"))')
 page.locator('[data-response-lab] select').select_option('.1')
 page.locator('#analysis-example-picker').select_option('dfreq-low-damping')
 assert {e.get_attribute('data-model') for e in page.locator('.aq').all()}=={'dfreq-low-damping'}  # both the Input and Results parts follow the selection
 page.locator('#analysis-example-picker').select_option('dfreq-coarse')
 assert page.locator('[data-response-lab] select').input_value()=='.1'
 assert answers==52 and labs==13,(answers,labs)
 assert not errors,errors;b.close()
 print('PASS: 13 model-specific comparisons, 52 answers, 13 labs, all controls, card/back links, state and 320/390/768px.')
