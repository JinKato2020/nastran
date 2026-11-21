"""Exercise the shared lesson reader, element figures and Input search in real Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST = Path(__file__).resolve().parents[2] / "sites/nastran-learning/dist"
with sync_playwright() as pw:
    browser = pw.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for width in (320, 390, 768):
        page.set_viewport_size({"width": width, "height": 844})
        page.goto((DIST / "theory.html").as_uri() + "#mesh")
        for n in (16, 32, 48):
            page.locator("[data-lab-input=n]").select_option(str(n))
            for bias in ("1", "1.3"):
                page.locator("[data-lab-input=bias]").select_option(bias)
                text = page.locator("#theory-detail .theory-lab-readout").inner_text()
                assert "第1層の幅" in text and "NaN" not in text, text
                # Each concentric band and each radial node column is a separate shared line.
                assert page.locator("[data-mesh-wave-lab=hole] svg polyline").count() >= n + 7
                rings = page.evaluate("([n,b])=>MeshWaveLabs.holeRings(n,b)", [n, float(bias)])
                for inner, outer in zip(rings, rings[1:]):
                    for i in range(n):
                        j = (i + 1) % n
                        quad = [inner[i], outer[i], outer[j], inner[j]]
                        for k, (x,y) in enumerate(quad):
                            a,b = quad[(k+1)%4]
                            c,d = quad[(k+2)%4]
                            assert (a-x)*(d-b) - (b-y)*(c-a) > 0
        for key in ("transitions","quality","convergence","waves","sources"):
            page.locator("[data-topic-picker]").select_option(key)
            page.wait_for_function("k=>document.querySelector('#theory-detail').dataset.article===k", arg=key)
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"), (width,key)
        page.goto((DIST / "theory.html").as_uri() + "#boundary/viscous")
        for key, expected in (("free","100 %"),("half","11.111 %"),("match","0 %"),("fixed","100 %")):
            page.locator("[data-lab-input=end]").select_option(key)
            assert expected in page.locator("#theory-detail .theory-lab-readout").inner_text()
        page.goto((DIST / "elements.html").as_uri() + "#gap")
        for load, expected in ((0,"0.0 N"),(50,"接触開始"),(105,"50.0 N"),(160,"100.0 N")):
            page.locator("#gap input").evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",load)
            assert expected in page.locator("#gap .theory-lab-readout").inner_text()
        assert page.locator("#gap svg").count()==1
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
        page.goto((DIST / "bulk.html").as_uri())
        page.locator("#input-search").fill("ストッパー")
        for key in ("CGAP","PGAP"):
            assert page.locator('#input-search-results a[href="bulk.html#'+key+'"]').count()==1
        page.locator('#input-search-results a[href="bulk.html#CGAP"]').click()
        assert page.locator('a.library-reference-link[href="elements.html#gap"]').is_visible()
    assert not errors, errors
    browser.close()
    print("PASS: conforming quad rings, article routes, reflected waves, gap closure and card search at 320/390/768 px.")
