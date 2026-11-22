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
        midpoint=page.locator("[data-mesh-wave-lab=midpoint]")
        for profile, shared_x in (("local",159),("linear",149)):
            midpoint.locator("[data-lab-input=profile]").select_option(profile)
            views=midpoint.locator(".mesh-feature-pair svg")
            assert views.count()==2 and views.first.get_attribute("viewBox")==views.last.get_attribute("viewBox")
            for index, expected_x in enumerate((shared_x,149)):
                view=views.nth(index)
                assert view.bounding_box()["width"]>=95
                assert view.locator("polygon").count()==(5 if index==0 else 3)
                points=view.locator("polyline").get_attribute("points").split()
                assert [tuple(map(float, p.split(","))) for p in points]==[(129,24),(expected_x,49),(169,74)]
            assert ("仮定" if profile=="local" else "両方式とも1 mm") in midpoint.locator(".theory-lab-readout").inner_text()
        gap=page.locator("[data-mesh-strip=midpoint-gap]")
        for panel, expected_gap in zip(gap.locator("svg").all(), (20,0), strict=True):
            polygons=panel.locator("polygon").evaluate_all("(els)=>els.map(e=>e.getAttribute('points'))")
            fine,_,coarse=[[tuple(map(float,p.split(","))) for p in row.split()] for row in polygons]
            assert fine[2][1]==49 and (coarse[0][0]+coarse[3][0])/2-fine[2][0]==expected_gap
        test=page.locator("[data-mesh-wave-lab=hanging]")
        test.locator("..").locator("summary").click()
        for motion, ends in (("gradient",(0,2,4)),("together",(2,2,2)),("rest",(0,0,0))):
            test.locator("[data-lab-input=motion]").select_option(motion)
            mids=((ends[0]+ends[1])/2,(ends[1]+ends[2])/2)
            for connection, expected in (("mpc",mids),("none",(0,0)),("one",ends[:2])):
                test.locator("[data-lab-input=connection]").select_option(connection)
                readout=test.locator(".theory-lab-readout").inner_text()
                assert f"節点20は {expected[0]:g} mm、節点40は {expected[1]:g} mm" in readout
                assert f"ずれは {abs(expected[0]-mids[0]):g} mm" in readout
                polygons=test.locator("svg polygon").evaluate_all("(els)=>els.map(e=>e.getAttribute('points'))")
                quads=[[tuple(map(float,v.split(','))) for v in poly.split()] for poly in polygons]
                # Read the fine edge and the matching coarse edge from the drawn geometry.
                for i,y in enumerate((49,99)):
                    coarse=quads[16+i]
                    mid_x=(coarse[0][0]+coarse[3][0])/2
                    fine_x=quads[12+2*i][2][0]
                    assert quads[12+2*i][2][1]==y
                    assert abs(fine_x-mid_x)==6*abs(expected[i]-mids[i])
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
        order=["transitions","quality","convergence","waves","sizing"]
        picker=page.locator("[data-topic-picker]")
        assert picker.locator("option").evaluate_all("opts=>opts.map(o=>o.value)")==order+["sources"]
        assert page.evaluate("NASTRAN_LEARNING.navigation.meshTheory.map(item=>item.hash.split('/')[1])")==order
        for key in order[1:]:
            page.locator(f'nav[aria-label="章の続き"] a[href="theory.html#mesh/{key}"]').click()
            page.wait_for_function("k=>document.querySelector('#theory-detail').dataset.article===k",arg=key)
        assert "付録" in page.locator("#theory-detail h1").inner_text()
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
                section=page.locator("#mesh-shape")
                for heading, opening in zip(section.locator("h3").all_inner_texts(), ("幅だけ","上辺を","一つの角"), strict=True):
                    assert heading.startswith(opening)
                combined=page.locator("#mesh-jacobian details").filter(has=page.locator("[data-mesh-wave-lab=shape]"))
                combined.locator("summary").click()
                shape=combined.locator("figure[data-mesh-wave-lab=shape]")
                def slide(lab,key,value):
                    lab.locator(f'input[type=range][data-lab-input={key}]').fill(str(value))
                def check_det(values):
                    assert "左下 %s ／ 中央 %s ／ 右上 %s" % values in shape.locator(".theory-lab-readout").inner_text()
                check_det((100,100,100))
                original=shape.locator("svg").inner_html()
                slide(shape,"size",10)
                check_det((25,25,25))
                slide(shape,"aspect",2)
                check_det((50,50,50))
                before=shape.locator("svg").inner_html()
                slide(shape,"skew",-10)
                check_det((50,50,50))
                assert shape.locator("svg").inner_html()!=before
                for depth,values in ((45,(50,27.5,5)),(50,(50,25,0)),(65,(50,17.5,-15))):
                    slide(shape,"pinch",depth)
                    check_det(values)
                shape.get_by_role("button",name="正方形に戻す").click()
                check_det((100,100,100))
                assert shape.locator("svg").inner_html()==original
                aspect=section.locator("[data-mesh-wave-lab=aspectMetric]")
                slide(aspect,"ratio",3)
                assert "60 mm ÷ 短い辺 20 mm ＝ 3" in aspect.inner_text()
                skew=section.locator("[data-mesh-wave-lab=skewMetric]")
                slide(skew,"angle",45)
                assert "90° − 45° ＝ 45°" in skew.inner_text() and "20 mm" in skew.inner_text()
                warp=section.locator("[data-mesh-wave-lab=warp]")
                before=warp.locator("svg circle").get_attribute("cy")
                slide(warp,"angle",30)
                assert float(warp.locator("svg circle").get_attribute("cy"))<float(before)
                assert "8.165 mm" in warp.inner_text()
                jac=page.locator("[data-mesh-wave-lab=jacMetric]")
                for det, mid in ((100,100),(50,75),(0,50),(-30,35)):
                    slide(jac,"det",det)
                    assert f"中央（測定点） {mid} ／ ○ 右上（節点） {det}" in jac.inner_text()
                    plate=jac.locator("svg").last
                    assert float(plate.locator("circle").last.get_attribute("cx"))==14+100*(1+det/100)/2
                    outline=plate.locator("polygon").first.get_attribute("points")
                    for progress in (0,50,100):
                        slide(jac,"probe",progress)
                        expected=mid+(det-mid)*progress/100
                        assert jac.locator("[data-probe-value]").all_inner_texts()==["det J = 100 mm²",f"det J = {expected:g} mm²"]
                        u=(1+progress/100)/2
                        x=14+100*(u-(1-det/100)*u*u/2)
                        assert abs(float(plate.locator("[data-probe]").get_attribute("x"))+5-x)<1e-7
                        assert plate.locator("polygon").first.get_attribute("points")==outline
                    rows=jac.locator("tbody tr")
                    if det<0:
                        assert rows.count()==0
                        continue
                    for row,poly in zip(rows.all(),plate.locator("polygon").all(),strict=True):
                        corners=[tuple(map(float,p.split(","))) for p in poly.get_attribute("points").split()]
                        twice_area=sum(x*corners[(i+1)%4][1]-y*corners[(i+1)%4][0] for i,(x,y) in enumerate(corners))
                        # The same scale throughout both panels: 100 drawing units = 20 mm.
                        assert abs(abs(twice_area)/50-float(row.locator("td").last.inner_text()))<1e-7
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
