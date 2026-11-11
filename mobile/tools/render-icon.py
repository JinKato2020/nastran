"""Rasterize the editable SVG wordmark for Expo's iOS app icon."""
from pathlib import Path
import json
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
 page=browser.new_page(viewport={'width':1024,'height':1024},device_scale_factor=1)
 page.goto((ROOT/'assets/icon.svg').as_uri())
 page.evaluate('document.fonts.ready')
 assert page.locator('text').all_text_contents()==['FEM Guide','for nas']
 # Center the actual glyph bounds, then correct the rasterized ink bounds.
 transform=page.locator('#wordmark').evaluate('e=>{e.removeAttribute("transform");const r=e.getBBox();return `translate(${512-r.x-r.width/2} ${512-r.y-r.height/2})`;}')
 page.locator('#wordmark').evaluate('(e,t)=>e.setAttribute("transform",t)',transform)
 icon=json.loads((ROOT/'app.json').read_text(encoding='utf-8'))['expo']['icon']
 page.locator('svg').screenshot(path=str(ROOT/icon),omit_background=False)
 with Image.open(ROOT/icon) as image:
  rgb=image.convert('RGB');box=ImageChops.difference(rgb,Image.new('RGB',rgb.size,'white')).getbbox()
  offset=[512-(box[0]+box[2])/2,512-(box[1]+box[3])/2]
 page.locator('#wordmark').evaluate('(e,d)=>{const m=e.transform.baseVal.consolidate().matrix;e.setAttribute("transform",`translate(${m.e+d[0]} ${m.f+d[1]})`)}',offset)
 svg=page.locator('svg').evaluate('e=>e.outerHTML')
 (ROOT/'assets/icon.svg').write_text(svg+'\n',encoding='utf-8')
 page.locator('svg').screenshot(path=str(ROOT/icon),omit_background=False)
 page.locator('svg').evaluate('e=>{e.setAttribute("width",320);e.setAttribute("height",320)}')
 (ROOT/'.qa').mkdir(exist_ok=True)
 page.locator('svg').screenshot(path=str(ROOT/'.qa/fem-guide-for-nas-preview.png'),omit_background=False)
 browser.close()
print('Rendered 1024 x 1024 FEM Guide / for nas icon and centered preview.')
