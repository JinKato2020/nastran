"""All chapter articles: shared style, no lost content, responsive figures, live controls."""
from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/topic-review';OUT.mkdir(parents=True,exist_ok=True)
errors=[]
STYLE='''e=>{const s=getComputedStyle(e);return Object.fromEntries(['fontSize','fontWeight','lineHeight','color','backgroundColor','padding','margin'].map(k=>[k,s[k]]));}'''
selectors=['.analysis-head','.element-key','.element-toc','.element-toc a','.theory-section','.element-formula','.element-table','.theory-quiz','.theory-lab-controls','.theory-lab-readout','.theory-lab figcaption']
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');page=b.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((DIST/'elements.html').as_uri()+'#beam');reference={s:page.locator('#beam '+s).first.evaluate(STYLE) for s in selectors}
 page.goto((DIST/'theory.html').as_uri()+'#contact');configs=page.evaluate('TopicArticleData')
 if len(sys.argv)>1:configs={k:v for k,v in configs.items() if k==sys.argv[1]}
 total=0
 for key,cfg in configs.items():
  for article in cfg['articles']:
   route=key+'/'+article['key'];page.evaluate('(v)=>location.hash=v',route);root=page.locator('#theory-detail');page.wait_for_function('(v)=>document.querySelector("#theory-detail").dataset.article===v',arg=article['key'])
   assert root.locator(':scope > .element-key').count()==1,route
   assert root.locator(':scope > .theory-section').count()==len(article['sections'])+1,route
   assert root.locator('.element-toc a').count()==len(article['sections'])+1,route
   assert root.locator('.theory-quiz details').count()==len(article['questions']),route
   page.mouse.move(0,0)
   for s in selectors:
    loc=root.locator(s)
    if loc.count():assert loc.first.evaluate(STYLE)==reference[s],(route,s,loc.first.evaluate(STYLE),reference[s])
   for link in root.locator('.element-toc a').all():
    href=link.get_attribute('data-jump');link.click();assert page.locator('#'+href).count()==1
   for quiz in root.locator('.theory-quiz details').all():quiz.locator('summary').click();assert quiz.locator('p').is_visible()
   for fig in root.locator('[data-contact-lab],[data-load-lab],[data-material-lab],[data-boundary-lab],[data-damping-lab],[data-contact-legacy],[data-load-legacy],[data-material-legacy],[data-boundary-legacy],#boundary-diagnosis .element-figure,#load-diagnosis .element-figure').all():
    name=fig.evaluate('e=>JSON.stringify(e.dataset)')
    def check():
     assert not any(s in fig.inner_text() for s in ['NaN','Infinity','図を描けませんでした']),(route,name)
     words=fig.locator('svg text').evaluate_all(r'es=>es.map(e=>e.textContent).filter(s=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(s))')
     assert not words,(route,name,words)
     clipped=fig.locator('svg text').evaluate_all('''es=>es.flatMap(t=>{const b=t.getBoundingClientRect(),s=t.closest('svg').getBoundingClientRect();return b.width&&(b.left<s.left-1||b.right>s.right+1||b.top<s.top-1||b.bottom>s.bottom+1)?[t.textContent]:[]})''')
     assert not clipped,(route,name,clipped)
    check()
    for control in fig.locator('input[type=range]').all():
     for value in [control.get_attribute('min'),control.get_attribute('max')]:control.evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}));}',value);check()
    for control in fig.locator('select').all():
     for value in control.locator('option').evaluate_all('es=>es.map(e=>e.value)'):control.select_option(value);check()
    for width in [320,390,768]:
     page.set_viewport_size({'width':width,'height':844});check();assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(route,name,width,page.evaluate("[innerWidth,document.documentElement.scrollWidth,scrollX,[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest('table,svg')).map(e=>[e.tagName,e.className,e.textContent.slice(0,70)])]"))
    page.set_viewport_size({'width':390,'height':844})
    if key=='contact':fig.screenshot(path=str(OUT/((fig.get_attribute('data-contact-lab') or 'legacy-'+str(total))+'.png')))
    total+=1
   # Existing illustrations keep their exact geometry; text changes only.
   assert root.evaluate('''root=>{const norm=s=>{const c=s.cloneNode(true);c.querySelectorAll('text').forEach(t=>t.remove());return c.outerHTML;};return [...root.querySelectorAll('[data-contact-legacy],[data-load-legacy],[data-material-legacy],[data-boundary-legacy]')].every(el=>{const d=document.createElement('div');d.innerHTML=el.dataset.materialLegacy!==undefined?MaterialVisuals[el.dataset.materialLegacy]:el.dataset.loadLegacy!==undefined?TheoryTopicVisuals['common-loads'][+el.dataset.loadLegacy]:el.dataset.boundaryLegacy!==undefined?TheoryTopicVisuals.boundary[+el.dataset.boundaryLegacy]:TheoryTopicVisuals.contact[+el.dataset.contactLegacy];return !d.querySelector('svg')||norm(d.querySelector('svg'))===norm(el.querySelector('svg'));});}''')
   root.locator('.element-contents').screenshot(path=str(OUT/(key+'-'+article['key']+'-toc.png')))
  page.evaluate('(v)=>location.hash=v+"/sources"',key);page.wait_for_function('document.querySelector("#theory-detail").dataset.article==="sources"');assert page.locator('#'+cfg['prefix']+'-sources a').count()>0
 # Same-article TOC and article switching preserve live controls.
 page.goto((DIST/'theory.html').as_uri()+'#contact/bolts');slider=page.locator('[data-contact-lab="bolt"] input').first;slider.evaluate("e=>{e.value=16;e.dispatchEvent(new Event('input',{bubbles:true}));}")
 page.locator('[data-topic-picker]').select_option('friction');page.wait_for_function('document.querySelector("#theory-detail").dataset.article==="friction"');page.locator('[data-topic-picker]').select_option('bolts');page.wait_for_function('document.querySelector("#theory-detail").dataset.article==="bolts"');assert page.locator('[data-contact-lab="bolt"] input').first.input_value()=='16'
 # Deep links find their owning article, including the old standalone damping route.
 for route,target in [('materials/abd','materials-abd'),('boundary/imposed','boundary-imposed'),('common-loads/rotation','load-rotation'),('contact/stages','contact-stages'),('damping/rayleigh','damping-rayleigh')]:
  page.goto((DIST/'theory.html').as_uri()+'#'+route);assert page.locator('#'+target).is_visible()
 page.goto((DIST/'damping.html').as_uri()+'#damping-units');assert page.locator('#damping-units').is_visible()
 assert not errors,errors;b.close();print('PASS: article partition, shared styles, controls, multilingual figures, old geometry and deep links; figures:',total)
