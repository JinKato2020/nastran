"""Rasterize the pinned, licensed Lucide sources for native Image/tintColor (no runtime dependency)."""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':72,'height':72})
    for file in (ROOT/'assets/ui-icons').glob('*.svg'):
        svg=file.read_text(encoding='utf-8')
        svg=re.sub(r'width="24"','width="72"',svg)
        svg=re.sub(r'height="24"','height="72"',svg)
        svg=svg.replace('stroke-width="2"','stroke-width="1.6"')
        page.set_content('<style>html,body{margin:0;background:transparent;color:#000}svg{display:block}</style>'+svg)
        page.locator('svg').screenshot(path=str(file.with_suffix('.png')),omit_background=True)
    browser.close()
print('Rendered native icons from pinned SVG sources.')
