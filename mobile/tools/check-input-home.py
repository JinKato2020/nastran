from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];DIST=ROOT/'sites/nastran-learning/dist';OUT=ROOT/'mobile/.qa/input-review';OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe');page=b.new_page(viewport={'width':390,'height':844});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto((DIST/'bulk.html').as_uri());assert page.locator('#input-home').is_visible();assert page.locator('.input-home-cards a').count()==5;assert not page.locator('#input-browser').is_visible()
 for query,expected in [('celas',['CELAS1','CELAS2','CELAS3','CELAS4']),('ＣＥＬＡＳ',['CELAS1','CELAS2','CELAS3','CELAS4']),('zz_no_match',[])]:
  page.locator('#input-search').fill(query);links=page.locator('#input-search-results a').evaluate_all('es=>es.map(e=>e.hash.slice(1))');assert links==expected,(query,links)
 page.locator('#input-search').fill('celas');page.screenshot(path=str(OUT/'search.png'));page.locator('#input-search-results a').nth(1).click();assert page.locator('#card-detail h2').inner_text()=='CELAS2'
 page.locator('.library-crumb a').click();page.wait_for_function('document.getElementById("input-search").value==="celas"');page.locator('#input-search-clear').click()
 for family in ['executive','case','parameter','bulk']:
  page.locator('a[href="bulk.html#family/'+family+'"]').click();assert page.locator('#input-browser').is_visible();assert page.locator('.library-selectors select:visible').count()==2
  for width in [320,390,768]:page.set_viewport_size({'width':width,'height':844});assert page.locator('.library-selectors').evaluate('e=>e.getBoundingClientRect().height')<=150;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  cats=page.locator('#category option').evaluate_all('es=>es.map(e=>e.value)')
  for cat in cats:
   page.locator('#category').select_option(cat);assert page.locator('#card-picker option').count()>0
   assert page.locator('#card-picker').evaluate('e=>{const a=[...e.options].map(x=>x.textContent);const c=new Intl.Collator("en",{numeric:true,sensitivity:"base"});return a.every((x,i)=>i===0||c.compare(a[i-1],x)<=0)}')
  page.locator('.library-crumb a').click();assert page.locator('#input-home').is_visible()
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(OUT/'home.png'))
 page.goto((DIST/'bulk.html').as_uri()+'#SPCR');assert page.locator('#card-detail h2').inner_text()=='SPCR';assert page.locator('[data-jump="CASE_LOAD"]').count()>0
 assert not errors,errors;b.close();print('PASS: five cards, cross-category search, natural ordering, two selectors, direct links and responsive layout.')
