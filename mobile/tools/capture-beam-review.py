"""Record Claude's SVG geometry separately from labels; no browser network needed."""
from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'mobile/.qa/element-labs-review'
OUT.mkdir(parents=True, exist_ok=True)
phase = sys.argv[1] if len(sys.argv)>1 else 'before'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page=browser.new_page(viewport={'width':390,'height':844})
    page.goto((ROOT/'sites/nastran-learning/dist/elements.html').as_uri()+'#beam')
    article=page.locator('article[data-element=beam]')
    article.wait_for(state='visible')
    def geometry():
        return article.locator('svg').evaluate_all('es=>es.map(e=>{const c=e.cloneNode(true);c.querySelectorAll("text,title,desc").forEach(t=>t.remove());c.removeAttribute("aria-label");return c.outerHTML})')
    states={'default':geometry()}
    for name in ['orient','offset','warp','release']:
        fig=article.locator('[data-beam-lab='+name+']')
        fig.screenshot(path=str(OUT/(phase+'-beam-'+name+'.png')))
    orient=article.locator('[data-beam-lab=orient]')
    for section in orient.locator('select option').evaluate_all('es=>es.map(e=>e.value)'):
        orient.locator('select').select_option(section)
        for angle in [0,10,45,90]:
            orient.locator('input[type=range]').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input",{bubbles:true}))}',angle)
            states[section+str(angle)]=geometry()
    (OUT/('beam-geometry-'+phase+'.json')).write_text(json.dumps(states),encoding='utf8')
    if phase=='after':
        before=json.loads((OUT/'beam-geometry-before.json').read_text(encoding='utf8'))
        assert states==before, 'Claude figure geometry changed'
        labels=article.locator('svg text').evaluate_all(r'es=>es.map(e=>e.textContent).filter(t=>/[\u3040-\u30ff\u3400-\u9fff]/u.test(t))')
        assert not labels,labels
    browser.close()
print('Beam geometry '+phase+': '+str(len(states))+' states')
