"""Check the actual chapter-eight articles, diagrams and technical destinations."""
import json
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/nastran-learning"
DIST = SITE / "dist"
QA = ROOT / "mobile/.qa/analysis-theory"
QA.mkdir(parents=True, exist_ok=True)
course = json.loads((SITE / "learning-path.json").read_text(encoding="utf-8"))
chapter = next(c for c in course["materialChapters"] if c["key"] == "theory")
articles = [a for group in chapter["sources"] for a in course["navigation"][group]]
seen = set()
errors = []

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True, executable_path="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.on("pageerror", lambda e: errors.append(str(e)))
    for a in articles:
        page.goto((DIST / a["path"]).as_uri() + a["hash"])
        if a["path"] == "comparisons.html":
            expect(page.locator("#comparison-picker")).to_have_value("beam")
            continue
        root = page.locator("#theory-detail")
        expect(root.locator(".element-key")).to_be_visible()
        links = root.locator(".element-toc a")
        assert links.count() == root.locator(":scope > .theory-section").count(), a["hash"]
        for link in links.all():
            assert root.locator("#"+link.get_attribute("data-jump")).count() == 1
        links.last.click()
        assert page.url.endswith(a["hash"])
        quiz = root.locator(".theory-quiz details").first
        quiz.locator("summary").click()
        expect(quiz.locator("p")).to_be_visible()
        for fig in root.locator("[data-analysis-theory-figure]").all():
            name = fig.get_attribute("data-analysis-theory-figure")
            assert name not in seen
            seen.add(name)
            for width in [320, 390, 768]:
                page.set_viewport_size({"width": width,"height": 844})
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+1"), (name,width)
                for slider in fig.locator("input[type=range]").all():
                    for attr in ["min","max"]:
                        slider.evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}",slider.get_attribute(attr))
                for sel in fig.locator("select").all():
                    for v in sel.locator("option").evaluate_all("opts=>opts.map(o=>o.value)"):
                        sel.select_option(v)
                expect(fig.locator("svg").first).to_be_visible()
                assert not any(w in fig.inner_text() for w in ["NaN","undefined","図を描けません"])
                assert fig.evaluate("""f=>[...f.querySelectorAll('svg text')].every(t=>{
                 const b=t.getBBox(),v=t.ownerSVGElement.viewBox.baseVal;
                 if(t.hasAttribute('transform'))return true;
                 return b.x>=-1 && b.x+b.width<=v.width+1 && b.y>=-1 && b.y+b.height<=v.height+1;
                })"""), (name,width)
            page.set_viewport_size({"width":390,"height":844})
            page.reload()
            fig.screenshot(path=str(QA / (name+".png")))
            out = fig.locator(".theory-lab-readout")
            if name == "observation":
                expect(out).to_contain_text("中央のセンサー")
                fig.locator("select").last.select_option(".75")
                expect(out).to_contain_text("符号が反転")
                fig.locator("select").first.select_option(".5")
                expect(out).to_contain_text("入力が0")
            if name == "thermalPair":
                expect(out).to_contain_text("0.12 mm")
                expect(out).to_contain_text("48 MPa")
            if name == "cylinder":
                expect(out).to_contain_text("＋20 MPa")
                fig.locator("input").fill("20")
                expect(out).to_contain_text("＋8 MPa")
            if name == "prestress":
                fig.locator("input").fill("0.75")
                expect(out).to_contain_text("0.5 倍")
            if name == "yielding":
                fig.locator("input").fill("2")
                expect(out).to_contain_text("1.375")
            if name == "arch":
                fig.locator("input").fill("10")
                expect(out).to_contain_text("P = 0 N")
            if name == "heat":
                fig.locator("select").select_option("insulated")
                expect(out).to_contain_text("30 ℃")
    assert seen == {"cylinder","prestress","thermalPair","observation","arch","yielding","heat"}
    page.goto((DIST/"analysis.html").as_uri()+"#fracture/msc/results")
    box = page.get_by_text("MSCの別方式でCRAC2Dを使ったときの出力欄",exact=True)
    box.click()
    expect(page.get_by_text("S6、S7",exact=True)).to_be_visible()
    page.goto((DIST/"analysis.html").as_uri()+"#buckling/baseline/input")
    expect(page.get_by_text("探索方式と局所的な除外",exact=True)).to_be_visible()
    assert not errors, errors
    browser.close()

print(f"PASS: {len(articles)} chapter entries, seven interactive diagrams, numeric cases, three widths and analysis links.")
