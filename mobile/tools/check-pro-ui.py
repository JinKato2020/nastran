"""Exercise the real app screens with a test double for Apple/RevenueCat."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = (Path(__file__).resolve().parents[1] / '.qa/app/index.html').as_uri()
EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'

def tab(page, name):
    page.get_by_role('tablist', name='メインナビゲーション').get_by_role('tab', name=name, exact=True).click()

def button(page, text):
    return page.get_by_role('button', name=text, exact=True)

def close_pro(page):
    button(page, '閉じる').click()
    expect(page.get_by_test_id('pro-panel')).to_have_count(0)

def open_pro_settings(page):
    tab(page, '設定')
    button(page, '購入・復元を開く').click()
    expect(page.get_by_test_id('pro-panel')).to_be_visible()

with sync_playwright() as pw:
    expect.set_options(timeout=15000)
    browser = pw.chromium.launch(headless=True, executable_path=EDGE)
    def page_for(query):
        page = browser.new_page(viewport={'width': 390, 'height': 844})
        page.goto(URL + '?' + query, wait_until='domcontentloaded')
        expect(page.get_by_text('Proの詳細・購入の復元', exact=True)).to_be_visible()
        return page

    page = page_for('plan=free')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    # Locked Home, non-element Materials, and non-structural Analysis all use the same purchase panel.
    button(page, '初めての解析').click()
    expect(page.get_by_test_id('pro-panel')).to_be_visible()
    expect(page.locator('iframe')).to_have_count(0)
    close_pro(page)
    tab(page, '教材')
    button(page, '材料理論').click()
    expect(page.get_by_test_id('pro-panel')).to_contain_text('材料理論')
    close_pro(page)
    page.get_by_role('button', name='ばね要素', exact=False).first.click()
    expect(page.frame_locator('iframe').locator('#scalar')).to_be_visible()
    tab(page, '解析')
    button(page, '振動・動解析').click()
    expect(page.get_by_test_id('pro-panel')).to_contain_text('振動・動解析')
    close_pro(page)
    button(page, '構造・静解析').click()
    button(page, '静解析').click()
    frame = page.frame_locator('iframe')
    expect(frame.locator('#analysis-detail h1')).to_have_text('静解析')
    options = frame.locator('#analysis-picker option').evaluate_all('(items) => items.map(i => i.value)')
    assert set(options) == {'index', 'static', 'thick-cylinder', 'buckling'}, options
    # A link to another hash on this same HTML page must not render its article.
    frame.locator('body').evaluate("""() => {
      const a=document.createElement('a');a.href='analysis.html#modes';document.body.append(a);a.click();
    }""")
    expect(page.get_by_test_id('pro-panel')).to_be_visible()
    close_pro(page)
    expect(frame.locator('#analysis-detail h1')).to_have_text('静解析')
    frame.locator('body').evaluate("() => { location.hash = '#modes'; }")
    expect(page.get_by_test_id('pro-panel')).to_be_visible()
    close_pro(page)
    expect(frame.locator('#analysis-detail h1')).to_have_text('静解析')
    frame.locator('body').evaluate("() => history.replaceState(null,'','#heat')")
    expect(page.get_by_test_id('pro-panel')).to_be_visible()
    close_pro(page)
    expect(frame.locator('#analysis-detail h1')).to_have_text('静解析')
    tab(page, 'Inputデータ')
    page.get_by_role('textbox', name='語句・カード名で探す').fill('CELAS')
    page.get_by_role('button', name='CELAS2', exact=False).first.click()
    expect(page.frame_locator('iframe').get_by_text('CELAS2', exact=True).first).to_be_visible()

    open_pro_settings(page)
    expect(page.get_by_test_id('pro-buy')).to_contain_text('¥1,000')
    page.get_by_test_id('pro-restore').click()
    expect(page.get_by_test_id('pro-notice')).to_contain_text('見つかりませんでした')
    page.get_by_test_id('pro-buy').click()
    expect(page.get_by_test_id('pro-panel')).to_contain_text('Pro利用中')
    close_pro(page)
    tab(page, '解析')
    if page.locator('iframe').count():
        tab(page, '解析')
    button(page, '振動・動解析').click()
    page.get_by_role('button', name='実固有値解析', exact=False).first.click()
    expect(page.frame_locator('iframe').locator('#analysis-detail h1')).to_contain_text('固有値')
    page.evaluate('window.__mockPro.setActive(false)')
    expect(page.locator('iframe')).to_have_count(0)
    open_pro_settings(page)
    page.get_by_test_id('pro-restore').click()
    expect(page.get_by_test_id('pro-panel')).to_contain_text('Pro利用中')
    assert not errors, errors
    page.close()

    for mode, message in [('cancel',None), ('pending','承認待ち'), ('error','確認できませんでした')]:
        page = page_for(f'plan=free&purchase={mode}')
        open_pro_settings(page)
        page.get_by_test_id('pro-buy').click()
        expect(page.get_by_test_id('pro-buy')).to_be_enabled()
        if message:
            expect(page.get_by_test_id('pro-notice')).to_contain_text(message)
        else:
            expect(page.get_by_test_id('pro-notice')).to_have_count(0)
        expect(page.get_by_test_id('pro-panel')).to_contain_text('すべての教材を解放')
        page.close()

    page = page_for('plan=free&offer=unavailable')
    open_pro_settings(page)
    expect(page.get_by_test_id('pro-buy')).to_have_count(0)
    expect(page.get_by_test_id('pro-restore')).to_be_enabled()
    expect(button(page, '価格を再取得')).to_be_visible()
    browser.close()
print('PASS: Free vs Pro navigation, same-page access guards, localized price, purchase, restore, revocation, cancellation and unavailable products.')
