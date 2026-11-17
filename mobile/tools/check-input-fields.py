"""Verify visible input help, PBAR continuation and declared-field access."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'mobile/.qa/input-fields';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'sites/nastran-learning/dist')))
Thread(target=server.serve_forever,daemon=True).start()
errors=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
  page=browser.new_page(viewport={'width':390,'height':844})
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/bulk.html#PBAR')
  page.wait_for_function("document.querySelector('#card-picker').value==='PBAR'")
  assert not errors,errors
  assert page.locator('#card-raw').text_content().splitlines()[2][8:24]=='0.8333330.833333'
  raw=page.locator('#card-raw').text_content().splitlines()
  assert len(raw)==3 and all(len(line)==80 for line in raw)
  assert raw[1][72:80].strip()==raw[2][:8].strip()=='+P211'
  page.locator('[data-row="2"][data-col="1"]').click()
  inspector=page.locator('#field-inspector')
  assert 'κ₁' in inspector.inner_text()
  assert '9–16列' in inspector.inner_text() and '0.833333' in inspector.inner_text()
  assert '既定値は無限大' in inspector.inner_text()
  inspector.scroll_into_view_if_needed();page.screenshot(path=str(OUT/'pbar-k1.png'))
  assert '2025.1' in page.locator('.manual-reference').inner_text()
  assert '2025.1' in page.locator('.source-note').get_attribute('href')
  for width in [320,390,768]:
   page.set_viewport_size({'width':width,'height':844})
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  entries=page.evaluate('window.InputCatalog.entries.map(e=>({key:e.key,kind:e.kind,fieldCount:e.lines?.flat().length}))')
  static=0
  for entry in entries:
   page.evaluate('(key)=>location.hash=key',arg=entry['key'])
   page.wait_for_function('(key)=>document.querySelector("#card-picker").value===key',arg=entry['key'])
   if entry['kind']=='static':
    static+=1
    assert page.locator('.field-entry').count()>0,entry['key']
    # All detailed static definitions are present even when the input example omits their row.
    assert page.evaluate("""() => [...document.querySelectorAll('.field-entry')].every(e=>e.querySelector('.field-entry-body')?.textContent.trim().length>0)"""),entry['key']
   elif entry['kind']=='fixed':
    assert page.locator('.library-extra-fields details').count()==entry['fieldCount'],entry['key']
  page.evaluate("location.hash='CBAR'")
  page.wait_for_function("document.querySelector('#card-picker').value==='CBAR'")
  page.locator('.example-extra summary').click()
  page.locator('.example-extra [data-guide-jump="PA"]').click()
  assert page.locator('[data-guide-field="PA"]').get_attribute('open') is not None
  assert page.locator('[data-guide-field="PA"] .field-tip').is_visible()
  page.evaluate("location.hash='PSHELL'")
  page.wait_for_function("document.querySelector('#card-picker').value==='PSHELL'")
  page.locator('[data-row="0"][data-col="7"]').click()
  assert 'κ' in inspector.inner_text() and '57–64列' in inspector.inner_text()
  page.evaluate("location.hash='PBEAM'")
  page.wait_for_function("document.querySelector('#card-picker').value==='PBEAM'")
  page.locator('[data-entry-field="3:1"]').click()
  assert 'κ₁' in inspector.inner_text() and '既定1.0' in inspector.inner_text()
  assert not errors,errors
  browser.close()
 (OUT/'report.json').write_text(json.dumps({'rendered_cards':len(entries),'static_cards':static,'pbar_three_lines':True,'default_and_example_visible':True,'omitted_field_navigation':True,'widths':[320,390,768],'scope':'UI and declared fields, not a complete QRG audit'},indent=2),encoding='utf-8')
 print('PASS: all catalog cards render; PBAR K1/K2, field help and omitted-field navigation verified.')
finally:
 server.shutdown()
