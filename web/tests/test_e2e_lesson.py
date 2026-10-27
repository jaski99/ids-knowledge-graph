"""E2E Playwright della vista Lezione (mobile + desktop). Saltato se playwright non è installato.
Esecuzione: <venv con playwright>/bin/python -m pytest web/tests/test_e2e_lesson.py -q
Richiede rete per le librerie CDN (marked, DOMPurify, highlight.js, mermaid)."""
import json, os, subprocess, threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import pytest

sync_api = pytest.importorskip("playwright.sync_api")
WEB = Path(__file__).resolve().parent.parent
GRAPH = json.loads((WEB.parent / "graph" / "graph.json").read_text(encoding="utf-8"))
PILOTS = [n["id"] for n in GRAPH["nodi"] if "lezione" in n][:4]
SHOTS = Path(os.environ.get("KG_SHOTS", "/tmp/ids-kg-shots"))
VIEWPORTS = {"mobile": {"width": 390, "height": 844}, "desktop": {"width": 1280, "height": 800}}


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@pytest.fixture(scope="module")
def base_url():
    subprocess.run(["sh", str(WEB / "build.sh")], check=True, capture_output=True)
    srv = ThreadingHTTPServer(("127.0.0.1", 0), partial(Quiet, directory=str(WEB)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_address[1]}/"
    srv.shutdown()


@pytest.fixture(scope="module")
def browser():
    with sync_api.sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


def mermaid_count(node):
    return node["lezione"]["spiegazione"].count("```mermaid")


@pytest.mark.parametrize("vp", list(VIEWPORTS))
@pytest.mark.parametrize("nid", PILOTS)
def test_lezione_render_completo(browser, base_url, vp, nid):
    node = next(n for n in GRAPH["nodi"] if n["id"] == nid)
    ctx = browser.new_context(viewport=VIEWPORTS[vp], device_scale_factor=1, is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: m.type == "error" and errors.append(m.text))
    page.goto(f"{base_url}#/lezione/{nid}")
    page.wait_for_selector("#lesson-title")
    assert page.inner_text("#lesson-title") == node["title"]
    assert page.locator("header h1").first.is_hidden() or not page.locator("body > header").is_visible()
    # markdown: sottotitoli e codice evidenziato
    assert page.locator(".spiegazione .md h2").count() >= 2
    # «perché ti serve»: mostrato in cima alla lezione quando il dato esiste
    why = (node["lezione"].get("perche_ti_serve") or "").strip()
    if why:
        assert page.locator("#sec-perche").is_visible()
        assert why in page.inner_text("#sec-perche")
    else:
        assert page.locator("#sec-perche").count() == 0
    if "```java" in node["lezione"]["spiegazione"]:
        page.wait_for_selector(".md pre.code code.language-java .hljs-keyword")
    # mermaid: tutti i diagrammi diventano SVG, nessun errore di sintassi
    n = mermaid_count(node)
    if n:
        page.wait_for_function(f"document.querySelectorAll('pre.mermaid svg').length >= {n}", timeout=20000)
        assert page.locator("pre.mermaid-off").count() == 0
        txt = page.inner_text(".spiegazione")
        assert "Syntax error" not in txt and "Unsupported markdown" not in txt
    # esempio svolto: passi uno alla volta, poi soluzione
    ex = page.locator("article.worked").first
    steps = len(node["lezione"]["esempi_svolti"][0]["passi"])
    btn = ex.locator(".ex-actions .btn.primary")
    assert ex.locator(".passi li").count() == 0 and ex.locator(".ex-sol").is_hidden()
    btn.click()
    assert ex.locator(".passi li").count() == 1
    for _ in range(steps):
        btn.click()
    assert ex.locator(".ex-sol").is_visible() and btn.is_disabled()
    # autoverifica: risposta nascosta finché non si apre
    q = page.locator(".quiz details").first
    assert not q.evaluate("d => d.open")
    q.locator("summary").click()
    assert q.evaluate("d => d.open")
    # niente scroll orizzontale della pagina
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / f"{nid}-{vp}.png"), full_page=False)
    assert not [e for e in errors if "favicon" not in e], errors
    ctx.close()


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_navigazione_e_ritorno(browser, base_url, vp):
    nid = PILOTS[0]
    order_next = None
    ctx = browser.new_context(viewport=VIEWPORTS[vp])
    page = ctx.new_page()
    page.goto(base_url)
    page.wait_for_selector("#tab-percorso")
    page.click("#tab-percorso")
    page.locator(f"button.lesson-chip[aria-label$=\"{next(n['title'] for n in GRAPH['nodi'] if n['id'] == nid)}\"]").click()
    page.wait_for_selector("#lesson-title")
    assert f"#/lezione/{nid}" in page.url
    first = page.inner_text("#lesson-title")
    page.locator(".ls-nav.bottom .btn.primary").click()
    page.wait_for_function(f"document.querySelector('#lesson-title') && document.querySelector('#lesson-title').innerText !== {json.dumps(first)}")
    page.locator(".ls-nav.bottom .btn").first.click()
    page.wait_for_function(f"document.querySelector('#lesson-title').innerText === {json.dumps(first)}")
    page.locator(".ls-top > .btn").click()
    page.wait_for_selector("#lesson", state="hidden")
    assert page.locator("body > .layout").is_visible()
    ctx.close()


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_flusso_studio_segna_e_prossima_e_riprendi(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector("#resume:not([hidden]) .btn.primary")
    page.click("#resume .btn.primary")
    page.wait_for_selector("#lesson-title")
    t1 = page.inner_text("#lesson-title")
    page.click("[data-action=done-next]")
    page.wait_for_function("t => document.querySelector('#lesson-title')?.innerText !== t", arg=t1)
    t2 = page.inner_text("#lesson-title")
    assert page.evaluate("scrollY") == 0
    page.click(".ls-top > .btn")
    page.wait_for_selector("#view-percorso:not([hidden])")
    assert page.locator(".path li").first.locator("input").is_checked()
    page.reload()
    page.wait_for_selector("#resume:not([hidden]) .btn.primary")
    assert t2 in page.inner_text("#resume .btn.primary")
    assert page.evaluate("document.documentElement.scrollWidth - innerWidth") <= 1
    assert not errors
    ctx.close()


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_perche_ti_serve_in_cima_e_assente_nelle_banche(browser, base_url, vp):
    """I-1: il «perché ti serve» è la prima sezione delle lezioni che lo hanno; le banche non lo mostrano."""
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    for nid in ("boundary-value-analysis", "uml-diagramma-package", "banca-esercizi-bva-guerra"):
        node = next(n for n in GRAPH["nodi"] if n["id"] == nid)
        why = (node["lezione"].get("perche_ti_serve") or "").strip()
        page.goto(f"{base_url}#/lezione/{nid}")
        page.wait_for_function(f"document.querySelector('#lesson-title')?.innerText === {json.dumps(node['title'])}")
        if nid.startswith("banca-"):
            assert not why and page.locator("#sec-perche").count() == 0
            continue
        assert why, f"{nid}: manca perche_ti_serve nel grafo"
        sec = page.locator("#sec-perche")
        assert sec.is_visible() and why in sec.inner_text()
        assert page.locator("article.lesson section.ls").first.get_attribute("id") == "sec-perche"
        assert "Perché ti serve" in page.inner_text("nav.toc")
    ctx.close()
