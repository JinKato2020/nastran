"""Check symbol-only SVG, translated captions, mobile sizing and enlarged-reader behaviour."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import json
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'mobile/.qa/element-visuals'
OUT.mkdir(parents=True, exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
errors, overflow, overlaps = [], [], []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(f'http://127.0.0.1:{server.server_port}/sites/nastran-learning/dist/elements.html#beam')
        page.wait_for_selector('article:not([hidden]) .ev-diagram')
        count = page.locator('.ev-diagram').count()
        assert count >= 30, count
        assert not page.evaluate("/[\\u3040-\\u30ff\\u3400-\\u9fff]/.test([...document.querySelectorAll('svg text')].map(e=>e.textContent).join(''))")
        for width in [320, 390, 768]:
            page.set_viewport_size({'width': width, 'height': 844})
            for topic in ['scalar', 'beam', 'shell', 'solid', 'connector', 'rigid', 'genel']:
                page.locator('#element-picker').select_option(topic)
                page.wait_for_function('(key)=>!document.querySelector(`[data-element="${key}"]`).hidden', arg=topic)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, topic)
                overflow += page.evaluate('''() => [...document.querySelectorAll('article:not([hidden]) .ev-svg')].flatMap(svg => {
                    const v=svg.viewBox.baseVal;
                    return [...svg.querySelectorAll('text')].filter(t=>{
                        const b=t.getBBox();return b.x<0||b.y<0||b.x+b.width>v.width+1||b.y+b.height>v.height+1;
                    }).map(t=>({diagram:svg.closest('[data-ev-diagram]').dataset.evDiagram,text:t.textContent}));
                })''')
        page.set_viewport_size({'width': 390, 'height': 844})
        for topic in ['scalar','beam','shell','solid','connector','rigid','genel']:
            page.locator('#element-picker').select_option(topic)
            figures=page.locator('article:not([hidden]) [data-ev-diagram]')
            for i in range(figures.count()):
                figure=figures.nth(i)
                name=figure.get_attribute('data-ev-diagram')
                figure.screenshot(path=str(OUT / f'{name}.png'))
        page.locator('#element-picker').select_option('beam')
        button=page.locator('[data-ev-diagram="beam-axes"] [data-ev-zoom]').first
        button.click()
        assert page.locator('dialog[open]').count()==1
        assert page.evaluate('''() => {
            const all=[...document.querySelectorAll('[id]')].map(e=>e.id);
            return new Set(all).size===all.length;
        }'''), 'duplicate IDs including enlarged SVG markers'
        page.locator('dialog').screenshot(path=str(OUT/'zoom.png'))
        page.locator('[data-ev-close]').click()
        assert page.locator('dialog[open]').count()==0
        assert button.evaluate('(e)=>e===document.activeElement')
        before = page.locator('.ev-svg').first.inner_html()
        page.evaluate("document.documentElement.lang='en'")
        page.wait_for_function("document.querySelector('[data-ev-copy=enlarge]').textContent==='Enlarge diagram'")
        assert page.locator('.ev-svg').first.inner_html()==before
        assert page.locator('.ev-svg').first.get_attribute('lang')=='en'
        page.locator('[data-ev-diagram="beam-axes"]').screenshot(path=str(OUT/'beam-axes-en.png'))
        page.evaluate("document.documentElement.dir='rtl';document.documentElement.lang='ar'")
        assert page.locator('.ev-svg').first.inner_html()==before
        assert page.locator('.ev-svg').first.evaluate("e=>getComputedStyle(e).direction")=='ltr'
        assert not errors, errors
        assert not overflow, overflow
        report={'diagrams':count,'viewports':[320,390,768],'articles':7,'symbol_only':True,'zoom_focus':True,'locale_geometry_invariant':True}
        (OUT/'report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
        print(json.dumps(report))
        browser.close()
finally:
    server.shutdown()
