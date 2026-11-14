"""Comparison routes, mobile layouts, reciprocal links and real App.tsx reader.

Run bundle-content.mjs and preview-app.mjs first. Native OS APIs are mocked.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import sys
from threading import Thread
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'mobile/.qa/comparisons'
OUT.mkdir(parents=True, exist_ok=True)
TOPICS = json.loads((ROOT / 'sites/nastran-learning/card-comparisons.json').read_text(encoding='utf-8'))['topics']

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'
errors = []
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base + '/sites/nastran-learning/dist/comparisons.html#beam')
        assert page.locator('#comparison-picker option').count() == len(TOPICS)
        for width in [320, 390, 768]:
            page.set_viewport_size({'width': width, 'height': 844})
            for topic in TOPICS:
                page.locator('#comparison-picker').select_option(topic['key'])
                page.wait_for_function('(title)=>document.querySelector(".comparison-topic-title").textContent===title', arg=topic['title'])
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, topic['key'])
                assert page.locator('.comparison-card-links a').count() == len(topic['cards'])
                for key in topic['cards']:
                    assert page.locator(f'.comparison-card-links a[href="bulk.html#{key}"]').count() == 1
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('#comparison-picker').select_option('beam')
        page.screenshot(path=str(OUT / 'beam-top.png'))
        page.locator('.comparison-jumps a[href="#beam/compare"]').click()
        page.screenshot(path=str(OUT / 'beam-comparison.png'))
        page.locator('.comparison-card-links a[href="bulk.html#CBAR"]').click()
        page.wait_for_function('document.querySelector("#card-picker")?.value==="CBAR"')
        assert page.locator('#card-picker').input_value() == 'CBAR', (page.url, page.locator('#card-picker').input_value())
        page.locator('.comparison-backlinks a[href="comparisons.html#beam"]').click()
        assert page.locator('#comparison-picker').input_value() == 'beam'
        page.locator('#comparison-picker').select_option('rigid-interpolation')
        page.locator('.comparison-flow').scroll_into_view_if_needed()
        page.screenshot(path=str(OUT / 'rigid-relationships.png'))
        # Source links to theory/coordinate sections must resolve, not silently fall back.
        for href in sorted({url for t in TOPICS for url, _ in t.get('links', [])}):
            page.goto(base + '/sites/nastran-learning/dist/' + href)
            assert page.evaluate('location.hash') == '#' + href.split('#')[1], href
        # Actual app shell with the same offline HTML and bridge as iOS.
        page.set_viewport_size({'width': 390, 'height': 844})
        page.goto(base + '/mobile/.qa/app/', wait_until='networkidle')
        page.get_by_role('tab', name='教材', exact=True).click()
        page.get_by_role('button', name='共通の解析技術論', exact=True).click()
        page.get_by_role('button', name='似たカードの使い分け', exact=True).click()
        frame = page.frame_locator('iframe')
        frame.locator('#comparison-picker').wait_for()
        assert frame.locator('#comparison-picker').input_value() == 'beam'
        assert page.get_by_role('tab').count() == 5
        frame.locator('#comparison-picker').select_option('rigid-interpolation')
        frame.locator('.comparison-jumps a[href="#rigid-interpolation/cards"]').click()
        link = frame.locator('.comparison-card-links a[href="bulk.html#RBE3"]')
        link.scroll_into_view_if_needed()
        page.wait_for_timeout(250)
        before = frame.locator('body').evaluate('()=>scrollY')
        link.click()
        assert page.frame_locator('iframe').locator('#card-picker').input_value() == 'RBE3'
        page.get_by_role('button', name='‹ 戻る', exact=True).click()
        frame = page.frame_locator('iframe')
        assert frame.locator('#comparison-picker').input_value() == 'rigid-interpolation'
        page.wait_for_timeout(400)
        assert abs(frame.locator('body').evaluate('()=>scrollY') - before) < 3
        page.get_by_role('button', name='しおりを付ける').click()
        page.wait_for_function('JSON.parse(localStorage.getItem("nastran-learning-state-v1")).bookmarks.some(p=>p.path==="comparisons.html"&&p.hash==="#rigid-interpolation/cards")')
        page.screenshot(path=str(OUT / 'app-return.png'))
        page.get_by_role('tab', name='ホーム', exact=True).click()
        page.get_by_role('button', name='しおり一覧', exact=True).click()
        assert page.get_by_text('RBE2とRBE3', exact=True).count() >= 1
        page.reload(wait_until='networkidle')
        assert page.evaluate('JSON.parse(localStorage.getItem("nastran-learning-state-v1")).bookmarks.some(p=>p.path==="comparisons.html")')
        assert not errors, errors
        browser.close()
finally:
    server.shutdown()
    server.server_close()
print(f'PASS: {len(TOPICS)} themes × 3 widths; card links, reciprocal navigation, offline app entry, back/scroll, bookmark title and persistence. Native APIs mocked.')
