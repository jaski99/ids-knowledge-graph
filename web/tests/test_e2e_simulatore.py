"""E2E Playwright del simulatore d'esame. Saltato se playwright non è installato.
Esecuzione: python -m pytest web/tests/test_e2e_simulatore.py -q
Screenshot: KG_SHOTS=docs/screens (default /tmp/ids-kg-shots)."""
import os
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

sync_api = pytest.importorskip("playwright.sync_api")
WEB = Path(__file__).resolve().parent.parent
SHOTS = Path(os.environ.get("KG_SHOTS", "/tmp/ids-kg-shots"))
VIEWPORTS = {"mobile": {"width": 390, "height": 844}, "desktop": {"width": 1440, "height": 900}}


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


@pytest.fixture(scope="module")
def base_url():
    import subprocess
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


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_simulatore_svolgimento_pausa_correzione(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector("#module-nav a[href='#/simulatore']")
    page.click("#module-nav a[href='#/simulatore']")
    page.wait_for_selector("#sim-titolo")
    assert "Simulatore" in page.inner_text("#sim-titolo")
    assert page.locator(".sim-gap").count() == 0
    page.click("#sim-inizia")
    page.wait_for_selector("#sim-timer")
    assert page.locator("[data-parte='design']").is_visible()
    assert page.locator("[data-parte='blackbox']").is_visible()
    assert page.locator("[data-parte='teoria']").is_visible()
    assert page.locator(".sim-gap").count() == 0
    clock = page.inner_text("#sim-timer")
    assert len(clock) == 8 and clock[2] == ":"
    page.locator("textarea.sim-input").first.fill("Diagramma di prova: Cliente — Acquisto.")
    page.click("#sim-pause")
    frozen = page.inner_text("#sim-timer")
    page.wait_for_timeout(1200)
    assert page.inner_text("#sim-timer") == frozen
    assert "pausa" in page.inner_text("#sim-timer-note").lower()
    page.click("#sim-pause")
    page.reload()
    page.wait_for_selector("textarea.sim-input")
    assert "Diagramma di prova" in page.locator("textarea.sim-input").first.input_value()
    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / f"simulatore-svolgimento-{vp}.png"))
    page.once("dialog", lambda d: d.accept())
    page.click("#sim-consegna")
    page.wait_for_selector(".sim-soluzione-testo")
    assert page.locator(".sim-soluzione-testo").first.inner_text().strip()
    page.locator("input.sim-punti").nth(0).fill("1")
    page.locator("input.sim-punti").nth(1).fill("5")
    assert "Da ripassare" in page.inner_text("#sim-riepilogo")
    assert page.locator("#sim-da-ripassare a").count() >= 1
    page.screenshot(path=str(SHOTS / f"simulatore-correzione-{vp}.png"))
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    assert not errors, errors
    ctx.close()
