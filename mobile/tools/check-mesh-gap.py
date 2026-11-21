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
        intro = page.locator("#theory-detail .analysis-head p")
        assert "薄板" in intro.inner_text()
        assert page.locator("#theory-detail > figure[data-mesh-wave-lab=hole]").count() == 1
        assert page.locator("[data-lab-input=n]").input_value() == "16"
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
            if key=="quality":
                shape=page.locator("#theory-detail > figure[data-mesh-wave-lab=shape]")
                for preset,values in (("square","100、100"),("small","25、25"),("pinch","100、10"),("fold","100、-20")):
                    shape.locator("[data-lab-input=corner]").select_option(preset)
                    assert values in shape.locator(".theory-lab-readout").inner_text()
            assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1"), (width,key)
        page.goto((DIST / "theory.html").as_uri() + "#modes")
        assert "定規" in page.locator("#theory-detail .analysis-head p").first.inner_text()
        assert page.locator("#theory-detail .theory-section").first.locator(".theory-formula").count()==1
        page.goto((DIST / "theory.html").as_uri() + "#boundary/soil-dynamics")
        assert page.locator("#theory-detail h1").inner_text() == "地盤の動的境界"
        assert page.locator("[data-soil-lab] svg").count() == 3
        extent = page.locator("[data-soil-lab=soilExtent]")
        for reach, time in (("20","0.20 秒"),("40","0.40 秒")):
            extent.locator("[data-lab-input=reach]").select_option(reach)
            for floor, phrase in (("top","底面条件"),("inside","要素に含まれ")):
                extent.locator("[data-lab-input=floor]").select_option(floor)
                readout = extent.locator(".theory-lab-readout").inner_text()
                assert time in readout and phrase in readout
        for name,control,choices in [
            ("soilSide","side",[("ff","補助列"),("transmit","成層地盤"),("fixed","反射")]),
            ("soilBase","baseType",[("compliant","下降波"),("rigid","反射")])]:
            fig = page.locator("[data-soil-lab="+name+"]")
            drawings = set()
            for key,expected in choices:
                fig.locator("[data-lab-input="+control+"]").select_option(key)
                assert expected in fig.locator(".theory-lab-readout").inner_text()
                drawings.add(fig.locator("svg").inner_html())
            assert len(drawings) == len(choices)
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
        assert page.locator("#theory-detail .theory-quiz details").count()==3
        page.locator("[data-topic-picker]").select_option("viscous")
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
