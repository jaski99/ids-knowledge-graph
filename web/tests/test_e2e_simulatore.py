"""E2E Playwright del simulatore d'esame. Saltato se playwright non è installato.
Esecuzione: python -m pytest web/tests/test_e2e_simulatore.py -q
Screenshot: KG_SHOTS=docs/screens (default /tmp/ids-kg-shots)."""
import os
import threading
import re
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
    # Su main questo test falliva dopo reload: la vista tornava all'introduzione
    # (provaAvviata azzerata) e textarea.sim-input non ricompariva. La correzione
    # sta nel codice (ripristino automatico della sessione valida, timer in
    # pausa): qui si verifica quel comportamento, senza saltare nulla.
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector("#module-nav a[href='#/simulatore']")
    page.click("#module-nav a[href='#/simulatore']")
    page.wait_for_selector("#sim-titolo")
    assert "Simulatore" in page.inner_text("#sim-titolo")
    assert page.locator("#sim-profilo option").count() == 5
    assert page.locator("#sim-profilo").input_value() == "prova-2025-11-05"
    assert "5/11/2025" in page.inner_text("#sim-fonte-profilo")
    assert page.locator("#sim-durata option").count() == 4
    assert page.locator(".sim-gap").count() == 0
    page.click("#sim-inizia")
    page.wait_for_selector("#sim-timer")
    assert page.locator("[data-parte='design']").is_visible()
    assert page.locator("[data-parte='testing']").is_visible()
    assert page.locator("[data-parte='teoria']").is_visible()
    assert page.locator(".sim-gap").count() == 0
    clock = page.inner_text("#sim-timer")
    assert len(clock) == 8 and clock[2] == ":"
    assert "solo alla consegna" in page.inner_text("#sim-timer-note")
    page.locator("textarea.sim-input").first.fill("Diagramma di prova: Cliente — Acquisto.")
    page.click("#sim-pause")
    frozen = page.inner_text("#sim-timer")
    page.wait_for_timeout(1200)
    assert page.inner_text("#sim-timer") == frozen
    assert "pausa" in page.inner_text("#sim-timer-note").lower()
    page.click("#sim-pause")
    page.reload()
    # Dopo il reload la prova si ritrova in pausa, con la risposta salvata.
    page.wait_for_selector("textarea.sim-input")
    assert "pausa" in page.inner_text("#sim-timer-note").lower()
    assert "Diagramma di prova" in page.locator("textarea.sim-input").first.input_value()
    page.click("#sim-pause")
    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / f"simulatore-svolgimento-{vp}.png"))
    page.once("dialog", lambda d: d.accept())
    page.click("#sim-consegna")
    page.wait_for_selector(".sim-soluzione-testo")
    assert page.locator(".sim-soluzione-testo").first.inner_text().strip()
    assert page.locator(".sim-rubrica").count() >= 1
    page.locator("input.sim-punti").nth(0).fill("1")
    page.locator("input.sim-punti").nth(1).fill("5")
    assert "Da ripassare" in page.inner_text("#sim-riepilogo")
    assert "Report per parte" in page.inner_text("#sim-riepilogo")
    assert page.locator("#sim-da-ripassare a").count() >= 1
    page.click("#sim-salva-esiti")
    page.wait_for_selector("#sim-esiti-msg")
    assert "Esiti salvati" in page.inner_text("#sim-esiti-msg")
    esiti = page.evaluate("JSON.parse(localStorage.getItem('ids-kg:esiti-simulatore:v1') || '[]')")
    assert len(esiti) >= 1
    assert esiti[0]["profilo"] == "prova-2025-11-05"
    assert esiti[0]["modalita"] == "simulazione"
    page.screenshot(path=str(SHOTS / f"simulatore-correzione-{vp}.png"))
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    assert not errors, errors
    ctx.close()


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_simulatore_profili_e_allenamento(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector("#module-nav a[href='#/simulatore']")
    page.click("#module-nav a[href='#/simulatore']")
    page.wait_for_selector("#sim-profilo")
    page.select_option("#sim-profilo", "scheda-2026-27")
    assert "2026/27" in page.inner_text("#sim-fonte-profilo")
    assert "140%" in page.inner_text("body")
    page.select_option("#sim-modalita", "allenamento")
    page.select_option("#sim-durata", "75")
    page.click("#sim-inizia")
    page.wait_for_selector("textarea.sim-input")
    # La voce package compare come quesito (coperta dal nodo uml-diagramma-package)
    # o come voce mancante dichiarata; in entrambi i casi è visibile, senza punti null.
    corpo = page.inner_text("body")
    assert "Diagramma dei package" in corpo
    assert not re.search(r"\b(null|undefined|NaN)\b", corpo), re.search(r".{0,40}\b(null|undefined|NaN)\b.{0,40}", corpo)
    assert page.locator(".sim-mostra-soluzione").count() >= 1
    page.locator(".sim-mostra-soluzione").first.click()
    assert "Scrivi prima un tentativo" in page.inner_text("body")
    page.locator("textarea.sim-input").first.fill("Tentativo di prova.")
    page.locator(".sim-mostra-soluzione").first.click()
    page.wait_for_selector(".sim-soluzione-testo")
    assert page.locator(".sim-soluzione-testo").first.inner_text().strip()
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    assert not errors, errors
    ctx.close()
