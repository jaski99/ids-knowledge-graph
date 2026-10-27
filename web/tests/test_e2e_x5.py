"""Flussi X5 reali e contratto X3/X6 con doppi: mobile 390×844 e desktop 1440×900."""
import copy
import datetime as dt
import json
import re
import subprocess
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

WEB = Path(__file__).resolve().parent.parent
GRAPH = json.loads((WEB.parent / 'graph' / 'graph.json').read_text(encoding='utf-8'))
VIEWPORTS = {'mobile': {'width': 390, 'height': 844}, 'desktop': {'width': 1440, 'height': 900}}
BANK_ID = 'fixture-banca-test'
SECRET = 'SOLUZIONE_FITTIZIA_VERIFICATA'


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


@pytest.fixture(scope='module')
def base_url():
    subprocess.run(['sh', str(WEB / 'build.sh')], check=True, capture_output=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(WEB)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    yield f'http://127.0.0.1:{server.server_address[1]}/'
    server.shutdown()


@pytest.fixture(scope='module')
def browser():
    with sync_playwright() as p:
        instance = p.chromium.launch()
        yield instance
        instance.close()


def bank_fixture():
    graph = copy.deepcopy(GRAPH)
    node = copy.deepcopy(graph['nodi'][0])
    node.update(id=BANK_ID, title='Banca esercizi di testing', prerequisiti=[],
                priorita={'livello': 'alta', 'motivazione': 'Fixture di test.'},
                esercizi=[{'tipo_esame': "Parte 2 Testing: classi di equivalenza e boundary (prova 2025-11, sintesi dell'utente)",
                           'testo': 'Individua le classi per sentinellabancax5. [da verificare]',
                           'soluzione': SECRET}])
    graph['nodi'].append(node)
    return graph


@pytest.mark.parametrize('vp', list(VIEWPORTS))
def test_percorsi_tentativi_ricerca_ripasso_backup_e_tastiera(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == 'mobile', has_touch=vp == 'mobile', service_workers='block')
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    fixture = bank_fixture()
    page.route('**/graph.json', lambda route: route.fulfill(content_type='application/json', body=json.dumps(fixture)))
    # Il doppio serve solo finché X6 non è su main: dopo il merge si prova il modulo reale.
    if not (WEB / 'modules' / 'simulatore' / 'esiti.js').is_file():
        page.route('**/modules/simulatore/esiti.js', lambda route: route.fulfill(content_type='application/javascript', body="""
          export function leggiEsiti(storage) {
            try { return JSON.parse(storage.getItem('ids-kg:esiti-simulatore:v1')) || []; } catch { return []; }
          }
          export function registraEsito(storage, esito) {
            const esiti = [...leggiEsiti(storage), esito].slice(-500);
            storage.setItem('ids-kg:esiti-simulatore:v1', JSON.stringify(esiti));
            return esiti;
          }
        """))
    outcome = [{'slot_id': 'slot', 'nodo_id': BANK_ID, 'profilo': 'fixture', 'modalita': 'allenamento',
                'punti': 0, 'punti_max': 1, 'ts': '2026-10-27T10:00:00Z'}]
    page.add_init_script(f"localStorage.setItem('ids-kg:esiti-simulatore:v1', {json.dumps(json.dumps(outcome))});")
    page.goto(base_url)
    page.wait_for_selector('#cy canvas')
    assert page.locator('#cy canvas').first.bounding_box()['width'] > 0
    assert page.locator('.edge-legend').is_visible()
    page.locator('#minimap').focus()
    assert page.evaluate("document.activeElement.id") == 'minimap'
    page.keyboard.press('ArrowRight')

    # Schede con tastiera e ricerca / anche se i filtri mobile erano chiusi.
    page.locator('#tab-grafo').focus()
    page.keyboard.press('ArrowRight')
    assert page.locator('#tab-percorso').get_attribute('aria-selected') == 'true'
    page.keyboard.press('End')
    assert page.locator('#tab-ripasso').get_attribute('aria-selected') == 'true'
    page.keyboard.press('Home')
    assert page.locator('#tab-grafo').get_attribute('aria-selected') == 'true'
    page.keyboard.press('/')
    assert page.evaluate("document.activeElement.id") == 'search'
    page.fill('#search', 'sentinellabancax5')
    page.wait_for_function("document.querySelector('#count')?.textContent.startsWith('1/')")
    page.click('#tab-percorso')
    page.wait_for_selector('#path .step')
    summaries = page.locator('.exam-path summary').all_inner_texts()
    assert [s.split(' · ')[0] for s in summaries] == ['Testing meccanico', 'Class Diagram', 'Pattern', 'Diagrammi dinamici', 'Teoria']
    assert 'Studiato' in page.locator('#path .step').inner_text()
    page.locator('#path .lesson-chip').click()
    page.wait_for_selector(f'article.lesson[data-node="{BANK_ID}"]')

    exercise = page.locator('#sec-esercizi .exercise').first
    assert exercise.locator('.exercise-solution').inner_text().strip() == ''
    assert not exercise.locator('button.primary').is_enabled()
    assert SECRET not in exercise.inner_text()
    exercise.locator('textarea').fill('Provo a distinguere le fasce.')
    exercise.locator('button.primary').click()
    assert SECRET in exercise.locator('.exercise-solution').inner_text()
    exercise.locator('[data-assessment="da-rivedere"]').click()
    assert page.evaluate("JSON.parse(localStorage.getItem('ids-kg:tentativi:v1'))[0].valutazione") == 'da-rivedere'

    # Il tentativo guida il filtro e diventa una carta di ripasso, senza generare una soluzione nuova.
    page.click('.ls-top > .btn')
    page.wait_for_selector('#view-percorso:not([hidden])')
    assert not re.search(r'\b(null|undefined|NaN)\b', page.locator('#view-percorso').inner_text())
    page.wait_for_function("id => document.activeElement?.id === 'chk-' + id", arg=BANK_ID)
    page.fill('#search', '')
    page.get_by_label('Sbagliati o parziali').check()
    page.wait_for_function("document.querySelector('#count')?.textContent.startsWith('1/')")
    assert 'Banca esercizi' in page.locator('#path').inner_text()
    page.evaluate("location.hash = '#/ripasso'")
    page.wait_for_selector('#ripasso-carta')
    assert 'Banca esercizi' in page.locator('.rip-nodo').inner_text()
    data_esame = (dt.date.today() + dt.timedelta(days=30)).isoformat()
    page.fill('#ripasso-data-esame', data_esame)
    assert page.evaluate("localStorage.getItem('ids-kg:data-esame:v1')") == data_esame
    for _ in range(15):
        if 'Esercizio già tentato' in page.locator('.rip-tipo').inner_text():
            break
        page.click('#ripasso-mostra')
        page.click("[data-voto='bene']")
    else:
        pytest.fail('La carta dell’esercizio tentato non compare nel ripasso.')
    page.click('#ripasso-mostra')
    assert SECRET in page.inner_text('#ripasso-risposta')

    # Backup e TSV reali, poi ripristino e controllo del tentativo salvato.
    page.evaluate("location.hash = '#/'")
    page.wait_for_selector('#backup summary')
    page.click('#backup summary')
    with page.expect_download() as exported:
        page.click('#backup-export')
    backup_path = exported.value.path()
    assert json.loads(Path(backup_path).read_text(encoding='utf-8'))['formato'] == 'ids-kg-backup'
    with page.expect_download() as exported_tsv:
        page.click('#anki-export')
    assert SECRET in Path(exported_tsv.value.path()).read_text(encoding='utf-8')
    page.evaluate("localStorage.removeItem('ids-kg:tentativi:v1')")
    page.set_input_files('#backup-file', str(backup_path))
    page.once('dialog', lambda d: d.accept())
    with page.expect_navigation(wait_until='domcontentloaded'):
        page.click('#backup-import')
    page.wait_for_selector('#resume:not([hidden])')
    page.wait_for_function("JSON.parse(localStorage.getItem('ids-kg:tentativi:v1') || '[]').length > 0")
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    assert not errors, errors
    ctx.close()


@pytest.mark.parametrize('vp', list(VIEWPORTS))
def test_pwa_offline_dopo_prima_visita(browser, base_url, vp):
    ctx = browser.new_context(viewport=VIEWPORTS[vp], is_mobile=vp == 'mobile', has_touch=vp == 'mobile')
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(base_url)
    page.wait_for_selector('#resume .btn.primary')
    page.wait_for_function("navigator.serviceWorker.ready.then(() => true)", timeout=30000)
    page.reload()
    page.wait_for_function('Boolean(navigator.serviceWorker.controller)')
    ctx.set_offline(True)
    page.reload()
    page.wait_for_selector('#cy canvas')
    assert page.locator('#cy canvas').first.bounding_box()['width'] > 0
    page.click('#resume .btn.primary')
    page.wait_for_selector('#lesson-title')
    assert page.locator('#lesson-title').inner_text().strip()
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
    assert not errors, errors
    ctx.close()


def test_tutti_i_diagrammi_mermaid_del_grafo(browser, base_url):
    """La versione locale deve interpretare i diagrammi presenti nelle lezioni."""
    import re

    diagrams = []

    def raccogli(node_id, value):
        if isinstance(value, str):
            diagrams.extend({'id': node_id, 'body': body} for body in
                            re.findall(r'^```mermaid\s*\n(.*?)^```', value, re.S | re.M))
        elif isinstance(value, list):
            for item in value:
                raccogli(node_id, item)
        elif isinstance(value, dict):
            for item in value.values():
                raccogli(node_id, item)

    for node in GRAPH['nodi']:
        raccogli(node['id'], node.get('lezione', {}))
    assert diagrams
    page = browser.new_page()
    page.goto(base_url)
    page.wait_for_function('Boolean(window.mermaid)')
    invalid = page.evaluate('''async diagrams => {
      const bad = [];
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' });
      for (const d of diagrams) {
        try { await mermaid.parse(d.body); } catch (e) { bad.push({ id: d.id, error: String(e) }); }
      }
      return bad;
    }''', diagrams)
    assert not invalid, invalid
    page.close()
