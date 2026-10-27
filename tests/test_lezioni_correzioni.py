"""Un test per ogni correzione X4 applicata ai file graph/lezioni/*.json.

I test leggono direttamente il contenuto testuale completo di ogni lezione
(tutti i campi del JSON) e verificano una singola correzione ciascuno.
"""
import glob
import json
import re

import pytest

LEZIONI = 'graph/lezioni'


def lezione(id_):
    with open(f'{LEZIONI}/{id_}.json', encoding='utf-8') as fh:
        return json.load(fh)


def _contenuto(id_):
    return json.dumps(lezione(id_), ensure_ascii=False)


def _perche(id_):
    return lezione(id_).get('perche_ti_serve', '')


def _tutti_perche():
    out = []
    for path in sorted(glob.glob(f'{LEZIONI}/*.json')):
        obj = json.load(open(path, encoding='utf-8'))
        out.append((path, obj.get('perche_ti_serve', '')))
    return out


# ---------------- Perché ti serve (ogni lezione, formato e frequenze) ----------------

def test_ogni_lezione_ha_perche_ti_serve_corretto():
    file = sorted(glob.glob(f'{LEZIONI}/*.json'))
    assert len(file) == 75, f'attesi 75 file lezione, trovati {len(file)}'
    for path, p in _tutti_perche():
        assert p, f'{path}: manca perche_ti_serve'
        assert len(p) <= 200, f'{path}: perche_ti_serve troppo lungo ({len(p)}): {p[:90]!r}'
        assert p.count('sintesi') == 1, f'{path}: "sintesi" non unica: {p[:90]!r}'
        assert "’" not in p, f'{path}: apostrofo typografico: {p[:90]!r}'
        assert 'utente prove' not in p, f'{path}: contiene "utente prove": {p[:90]!r}'
        if 'su 13' in p:
            idx = p.index('su 13')
            assert re.search(r'\d', p[:idx]), f'{path}: "su 13" senza numero prima: {p[:90]!r}'
        assert 'su 13' in p or 'prove 2017-2025' in p, f'{path}: perche_ti_serve senza frequenza sulle 13 prove: {p[:90]!r}'


# ---------------- Testing ----------------

def test_classi_equivalenza_passo_zero():
    c = _contenuto('classi-equivalenza')
    assert 'Passo 0' in c
    assert 'prove su 13' in _perche('classi-equivalenza')


def test_boundary_value_analysis_due_e_tre_valori_epsilon_dedup():
    c = _contenuto('boundary-value-analysis')
    assert 'Due schemi a confronto' in c
    assert '2 valori' in c and '3 valori' in c
    assert 'ε' in c or 'epsilon' in c.lower()
    assert 'deduplic' in c.lower()


def test_grafo_flusso_controllo_granularita_stesso_vg():
    c = _contenuto('grafo-flusso-controllo')
    assert 'granularità' in c.lower()
    assert 'V(G)' in c


def test_criteri_copertura_mcdc_tre_condizioni_short_circuit():
    c = _contenuto('criteri-copertura')
    assert 'MC/DC' in c
    assert 'tre condizioni' in c.lower() or '3 condizioni' in c
    assert 'short-circuit' in c.lower() or 'cortocircuito' in c.lower()


def test_esercizio_white_box_method_ab_cfg_tabella_e_minimi():
    c = _contenuto('esercizio-white-box-copertura')
    assert 'method(int a, int b)' in c or 'method(a, b)' in c
    assert 'CFG' in c
    assert 'tabella da completare' in c.lower()
    assert 'statement coverage' in c.lower() and 'decision coverage' in c.lower()
    # i test minimi dichiarati nella lezione, verificati eseguendo la logica del metodo
    assert _method_provato(-1, -2) == 2
    assert _method_provato(1, 1) == 2


def _method_provato(a, b):
    """Trascrizione eseguibile del method(int a, int b) della prova 5/11/2025."""
    if a < 0:
        a = b
    a = a + b
    while a < 0:
        if b % 2 == 0:
            b = b // 2
        a += 3
    return a


# ---------------- UML ----------------

def test_uml_classi_tabella_mermaid_notazione_mano():
    c = _contenuto('uml-diagramma-classi')
    assert 'Mermaid' in c and 'notazione a mano' in c.lower()
    for voce in ['visibilità', 'molteplicità', 'associazione', 'composizione', 'aggregazione', 'generalizzazione']:
        assert voce in c.lower(), f'voce mancante: {voce}'


def test_uml_casi_uso_tabella_mermaid_notazione_mano():
    c = _contenuto('uml-casi-uso')
    assert 'Mermaid' in c and 'notazione a mano' in c.lower()
    assert 'include' in c.lower() and 'extend' in c.lower()


def test_uml_associazioni_molteplicita_leggi_e_disegna():
    c = _contenuto('uml-associazioni-molteplicita')
    assert 'leggi e disegna' in c.lower()
    assert '1' in c and '0..*' in c


def test_uml_sequenza_senza_lifeline_predefinite():
    c = _contenuto('uml-diagramma-sequenza')
    assert 'lifeline' in c.lower()
    assert 'partecipanti' in c.lower()


def test_uml_attivita_fork_solo_se_specificato():
    c = _contenuto('uml-diagramma-attivita')
    assert 'fork' in c.lower()
    assert 'solo se' in c.lower()


def test_uml_stati_testo_vs_ipotesi():
    c = _contenuto('uml-diagramma-stati')
    assert 'ipotetiche' in c.lower() or 'ipotesi' in c.lower()
    assert 'testo' in c.lower()


def test_varianti_piscina_mercato_rider_senza_attributi_inventati():
    c = _contenuto('esercizio-class-diagram-da-testo')
    for nome in ['Piscina', 'Mercato', 'Rider']:
        assert nome in c, f'manca variante {nome}'
    assert 'ipotesi' in c.lower()


# ---------------- Pattern ----------------

def test_decorator_fino_a_16_sottoclassi():
    c = _contenuto('design-pattern-decorator')
    assert '16' in c
    assert 'sottoclass' in c.lower()


def test_template_method_scenario_ricostruito():
    c = _contenuto('design-pattern-template-method')
    assert 'scenario ricostruito' in c.lower()


def test_observer_core_vs_jdk():
    c = _contenuto('design-pattern-observer')
    assert 'Observable' in c
    assert 'listener' in c.lower() or 'PropertyChangeListener' in c


def test_simple_factory_con_enum():
    c = _contenuto('design-pattern-simple-factory')
    assert 'enum' in c.lower()


# ---------------- Teoria ----------------

def test_solid_tabella_e_principi():
    c = _contenuto('principi-solid')
    for lettera in ['S', 'O', 'L', 'I', 'D']:
        assert lettera in c
    assert 'Single Responsibility' in c and 'Open/Closed' in c


def test_rep_ccp_crp():
    c = _contenuto('clean-architecture-coesione-componenti')
    for principio in ['REP', 'CCP', 'CRP']:
        assert principio in c, f'manca {principio}'


def test_debugging_fasi_e_bisezione():
    c = _contenuto('debugging')
    for fase in ['Riproduci', 'Localizza', 'Correggi', 'Verifica']:
        assert fase in c, f'manca fase {fase}'
    assert 'bisezione' in c.lower()


def test_requisiti_fasi_e_schema_non_normativo():
    c = _contenuto('requisiti-processo-specifica')
    for fase in ['Elicitazione', 'Analisi', 'Specifica', 'Validazione']:
        assert fase in c, f'manca fase {fase}'
    assert 'non normativo' in c.lower()


def test_metriche_da_ricordare_vs_appendice():
    c = _contenuto('metriche-software')
    for metrica in ['WMC', 'LCOM', 'CBO']:
        assert metrica in c
    assert 'appendice' in c.lower() or 'da ricordare' in c.lower()


def test_refactoring_non_assoluto():
    c = _contenuto('refactoring')
    assert 'quando no' in c.lower() or 'non sempre' in c.lower()
    assert 'senza cambiare il comportamento' in c.lower()
