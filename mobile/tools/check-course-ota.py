"""Apply two local R2-shaped releases to the actual app with the native services mocked."""
import hashlib
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

root = Path(__file__).resolve().parents[1]
bundle = json.loads((root / 'src/generated/lessons.json').read_text(encoding='utf-8'))
base = json.loads((root / 'src/generated/page-hashes.json').read_text(encoding='utf-8'))
course = bundle['course']
nav = course['navigation']
spring = next(row for row in nav['elements'] if row['hash'] == '#scalar')
item = dict(spring, title='OTA card')
course['home']['sections'] = [
    dict(key='quick', title='OTA shortcuts', style='cards', items=[item]),
    dict(key='reading', title='OTA reading list', style='list', items=[dict(item, title='OTA list item')])]
for theme in course['home']['layouts']:
    course['home']['layouts'][theme] = ['reading', 'hero', 'quick']
course['home']['hero']['blueprintTitle'] = 'OTA cover'
pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+y6C8AAAAASUVORK5CYII='
course['home']['hero']['image'] = 'fixture.png'
nav['newTheory'] = [dict(spring, title='OTA lesson')]
course['materialChapters'] = [dict(key='added', title='OTA chapter', description='New', sources=['newTheory'])]
nav['analyses'] = [dict(nav['analyses'][0], title='OTA analysis')]
course['analysisHeadings'][nav['analyses'][0]['group']]['title'] = 'OTA analysis group'
input_index = bundle['inputIndex']
card = dict(input_index['entries'][0], key='QATEST', id='QATEST', family='ota', category='OTA category')
input_index.update(entries=[card], families=[['ota', 'OTA input']], chapters=[dict(key='ota', title='OTA input', description='New')], comparisons=[])

def replace_json(html, pattern, payload):
    html, count = re.subn(pattern, lambda m: m[1] + json.dumps(payload, ensure_ascii=False) + m[2], html, count=1, flags=re.S)
    assert count == 1
    return html

index = replace_json(bundle['pages']['index.html'], r'(<script>\s*window\.NASTRAN_LEARNING\s*=\s*).*?(;\s*</script>)', course)
index = replace_json(index, r'(<script type="application/json" id="nastran-home-art">).*?(</script>)', pixel)
bulk = replace_json(bundle['pages']['bulk.html'], r'(<script type="application/json" id="nastran-input-index">).*?(</script>)', input_index)
marker = 'const {entries,families}=window.InputCatalog'
assert marker in bulk
bulk = bulk.replace(marker, """window.InputCatalog.families.push(['ota','OTA input']);
 window.InputCatalog.entries.push({...window.InputCatalog.entries[0],key:'QATEST',id:'QATEST',family:'ota',category:'OTA category'});
 """ + marker, 1)
pages = dict(base)
objects = {}
for name, html in [('index.html', index), ('bulk.html', bulk)]:
    digest = hashlib.sha256(html.encode()).hexdigest()
    pages[name] = digest
    objects[digest + '.html'] = html

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    errors = []
    page.on('pageerror', lambda err: errors.append(str(err)))
    def respond(route):
        filename = route.request.url.split('?')[0].split('/')[-1]
        body = json.dumps({'schema': 1, 'pages': pages}) if filename=='_manifest.json' else objects[filename]
        route.fulfill(status=200, headers={'Access-Control-Allow-Origin':'*'}, body=body)
    page.route('https://content.safa-lang.com/nastran/**', respond)
    page.goto((root / '.qa/app/index.html').as_uri() + '?testOta&plan=free')
    btn = lambda name: page.get_by_role('button', name=name, exact=True)
    tab = lambda name: page.get_by_role('tablist', name='メインナビゲーション').get_by_role('tab', name=name, exact=True).click()
    expect(page.get_by_text('OTA cover', exact=True)).to_be_visible()
    assert page.locator('img').evaluate_all('(images,uri)=>images.some(img=>img.src===uri)', pixel)
    expect(btn('OTA list item')).to_be_visible()
    expect(btn('初めての解析')).to_have_count(0)
    assert btn('OTA list item').bounding_box()['y'] < btn('OTA card').bounding_box()['y']
    btn('OTA card').click()
    expect(page.frame_locator('iframe').locator('#scalar')).to_be_visible()
    btn('‹ 戻る').click()
    tab('教材')
    expect(btn('各要素理論')).to_have_count(0)
    btn('OTA chapter').click()
    btn('OTA lesson').click()
    expect(page.frame_locator('iframe').locator('#scalar')).to_be_visible()
    tab('解析')
    btn('OTA analysis group').click()
    btn('OTA analysis').click()
    expect(page.frame_locator('iframe').locator('#analysis-detail h1')).to_be_visible()
    tab('Inputデータ')
    expect(btn('Bulk Data')).to_have_count(0)
    btn('OTA input').click()
    expect(btn('OTA category')).to_be_visible()
    search = page.get_by_role('textbox', name='語句・カード名で探す')
    search.fill('QATEST')
    page.get_by_role('button',name='QATEST',exact=False).click()
    expect(page.frame_locator('iframe').locator('#card-detail h2')).to_have_text('QATEST')
    btn('‹ 戻る').click()
    search.fill('CELAS2')
    expect(page.get_by_text('該当するカードがありません。',exact=False)).to_be_visible()
    pages = base
    page.reload()
    expect(btn('初めての解析')).to_be_visible()
    expect(btn('OTA card')).to_have_count(0)
    tab('教材')
    expect(btn('各要素理論')).to_be_visible()
    tab('Inputデータ')
    expect(btn('Bulk Data')).to_be_visible()
    assert not errors, errors
    browser.close()
print('PASS: four native tabs, hero image, home cards and lists, reading/back, search, removal, and rollback with simulated OTA releases.')
