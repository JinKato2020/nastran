"""Rasterize the editable SVG wordmark for Expo's iOS app icon."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':1024,'height':1024},device_scale_factor=1)
 page.goto((ROOT/'assets/icon.svg').as_uri())
 page.evaluate('document.fonts.ready')
 assert page.locator('text').all_text_contents()==['MSC','Nastran']
 page.locator('svg').screenshot(path=str(ROOT/'assets/icon.png'),omit_background=False)
 browser.close()
print('Rendered 1024 x 1024 MSC / Nastran app icon.')
