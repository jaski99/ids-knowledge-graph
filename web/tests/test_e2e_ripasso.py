"""E2E Playwright del ripasso a flashcard. Saltato se playwright non è installato.
Esecuzione: python -m pytest web/tests/test_e2e_ripasso.py -q
Screenshot: KG_SHOTS=docs/screens (default /tmp/ids-kg-shots)."""
import json
import os
import re
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest

sync_api = pytest.importorskip("playwright.sync_api")
WEB = Path(__file__).resolve().parent.parent
GRAPH = json.loads((WEB.parent / "graph" / "graph.json").read_text(encoding="utf-8"))
ID_NODI = {n["id"] for n in GRAPH["nodi"]}
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


def coda_da_testo(testo):
    m = re.search(r"Carta (\d+) di (\d+)", testo)
    assert m, testo
    return int(m.group(1)), int(m.group(2))


@pytest.mark.parametrize("vp", list(VIEWPORTS))
def test_ripasso_domanda_risposta_voto_filtri_e_lezione(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == "mobile", has_touch=vp == "mobile")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector("#module-nav a[href='#/ripasso']")
    page.click("#module-nav a[href='#/ripasso']")
    page.wait_for_selector("#ripasso-titolo")
    assert "Ripasso" in page.inner_text("#ripasso-titolo")

    # Profilo nuovo: nessuna carta dovuta, tutte nuove, serie a zero.
    assert page.inner_text("#ripasso-dovute") == "0"
    nuove_iniziali = int(page.inner_text("#ripasso-nuove"))
    assert nuove_iniziali > 0
    assert page.inner_text("#ripasso-serie") == "0"
    assert page.locator(".rip-area").count() == len(GRAPH["aree"])

    # La risposta non esiste finché non si preme "Mostra risposta".
    assert page.locator("#ripasso-domanda").inner_text().strip()
    assert page.locator("#ripasso-risposta").count() == 0
    href = page.get_attribute("#ripasso-lezione", "href")
    assert href.startswith("#/lezione/") and href.split("/")[-1] in ID_NODI
    SHOTS.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(SHOTS / f"ripasso-domanda-{vp}.png"))

    page.click("#ripasso-mostra")
    page.wait_for_selector("#ripasso-risposta")
    assert page.locator("#ripasso-risposta").inner_text().strip()
    for voto, etichetta in [("ancora", "Ancora"), ("difficile", "Difficile"), ("bene", "Bene"), ("facile", "Facile")]:
        assert etichetta in page.locator(f"[data-voto='{voto}']").inner_text()
    page.screenshot(path=str(SHOTS / f"ripasso-risposta-{vp}.png"))

    # "Bene": si passa alla carta 2, lo stato va in ids.ripasso.v1 e resta dopo il reload.
    page.click("[data-voto='bene']")
    page.wait_for_function("document.querySelector('#ripasso-sessione')?.textContent.startsWith('Carta 2 di')")
    salvati = page.evaluate("JSON.parse(localStorage.getItem('ids.ripasso.v1'))")
    assert len(salvati["carte"]) == 1 and len(salvati["giorni"]) == 1
    (stato_carta,) = salvati["carte"].values()
    assert stato_carta["ripetizioni"] == 1 and stato_carta["ultimoVoto"] == "bene"
    page.reload()
    page.wait_for_selector("#ripasso-titolo")
    assert int(page.inner_text("#ripasso-nuove")) == nuove_iniziali - 1
    assert page.inner_text("#ripasso-serie") == "1"

    # Filtri area + priorità: le carte proposte rispettano entrambi.
    page.select_option("#ripasso-filtro-area", "1")
    page.wait_for_selector("#ripasso-domanda")
    page.select_option("#ripasso-filtro-priorita", "alta")
    page.wait_for_selector("#ripasso-domanda")
    chips = page.locator(".rip-chip").all_inner_texts()
    assert any(c.startswith("Area 1") for c in chips) and "Priorità alta" in chips

    # "Ancora": la carta torna in coda nella stessa sessione (il totale cresce di 1).
    _, totale_prima = coda_da_testo(page.inner_text("#ripasso-sessione"))
    page.click("#ripasso-mostra")
    page.wait_for_selector("#ripasso-risposta")
    page.click("[data-voto='ancora']")
    page.wait_for_function("document.querySelector('#ripasso-sessione')?.textContent.includes('1 già ripassate')")
    _, totale_dopo = coda_da_testo(page.inner_text("#ripasso-sessione"))
    assert totale_dopo == totale_prima + 1

    # Niente scroll orizzontale nella vista Ripasso.
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")

    # "Apri la lezione" porta al nodo della carta.
    page.click("#ripasso-lezione")
    page.wait_for_selector("#lesson-title")
    assert "#/lezione/" in page.url
    assert not errors, errors
    ctx.close()
