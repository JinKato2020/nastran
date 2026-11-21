"""Exercise the shared lesson reader, element figures and Input search in real Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright

DIST = Path(__file__).resolve().parents[2] / "sites/nastran-learning/dist"

def check_quad_strip(figure, right_count):
    """Each interior edge must appear twice with opposite winding, with no hanging nodes."""
    sides = {}
    for raw in figure.locator("polygon").evaluate_all("(els) => els.map(el => el.getAttribute('points'))"):
        corners = [tuple(map(float, p.split(","))) for p in raw.split()]
        assert len(set(corners)) == len(corners) == 4
        for i, a in enumerate(corners):
            b, c = corners[(i+1)%4], corners[(i+2)%4]
            assert (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) > 0
            sides.setdefault(tuple(sorted((a,b))), []).append((a,b))
    boundary=[]
    for (a,b), uses in sides.items():
        if len(uses)==1:
            assert a[0]==b[0] and a[0] in (29,293) or a[1]==b[1] and a[1] in (24,124)
            boundary.append((a,b))
        else:
            assert len(uses)==2 and uses[1]==uses[0][::-1]
    for x, expected in [(29,4),(293,right_count)]:
        assert sum(a[0]==b[0]==x for a,b in boundary)==expected

with sync_playwright() as pw:
    browser = pw.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for width in (320, 390, 768):
        page.set_viewport_size({"width": width, "height": 844})
        page.goto((DIST / "theory.html").as_uri() + "#mesh")
        assert "4分割から2分割" in page.locator("#theory-detail h1").inner_text()
        bridge=page.locator("#theory-detail > [data-mesh-strip=bridge]")
        check_quad_strip(bridge,2)
        check_quad_strip(page.locator("[data-mesh-strip=spacing]"),4)
        test=page.locator("[data-mesh-wave-lab=hanging]")
        drawings=[]
        for option, phrase in (("start","右の要素"),("move","すきま")):
            test.locator("select").select_option(option)
            assert phrase in test.locator(".theory-lab-readout").inner_text()
            drawings.append(test.locator("svg polygon").evaluate_all("(els)=>els.map(e=>e.getAttribute('points'))"))
        assert sum(a!=b for a,b in zip(*drawings))==2
        page.locator("[data-topic-picker]").select_option("sizing")
        page.wait_for_function("document.querySelector('#theory-detail').dataset.article==='sizing'")
        assert "応用" in page.locator("#theory-detail h1").inner_text()
        intro = page.locator("#theory-detail .analysis-head p")
        assert "薄板" in intro.inner_text()
        assert page.locator("#theory-detail > figure[data-mesh-wave-lab=hole]").count() == 1
        assert page.locator("[data-lab-input=n]").input_value() == "16"
        for feature, expected_lines in (("shoulder", (7,13)), ("holes", (11,14))):
            figure = page.locator("#mesh-features [data-mesh-feature="+feature+"]")
            assert figure.locator("svg[role=img]").count()==3
            views = figure.locator(".mesh-feature-pair svg")
            for index, count in enumerate(expected_lines):
                assert views.nth(index).locator("polyline").count()==count
                assert views.nth(index).bounding_box()["width"] >= 95
            assert views.first.get_attribute("viewBox")==views.last.get_attribute("viewBox")
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
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
