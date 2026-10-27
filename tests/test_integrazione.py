"""Integrazione round 2 (IMPROVEMENT_PLAN §6, I-2 e I-3): archi tra nodi vecchi e nuovi,
nessun nodo orfano, nessun titolo duplicato, ogni nodo mappato nel programma."""
import json

G = json.load(open('graph/graph.json', encoding='utf-8'))
N = {n['id']: n for n in G['nodi']}
NUOVI = ['uml-diagramma-package', 'esercizio-tesina-individuale', 'clean-architecture-accoppiamento-componenti',
         'design-pattern-builder', 'commenti-codice', 'analisi-statica', 'banca-esercizi-bva-guerra',
         'banca-esercizi-pattern-guerra', 'banca-domande-teoria-guerra']
ARCHI_I2 = [('esercizio-diagrammi-coerenti', 'uml-diagramma-package'),
            ('banca-domande-teoria-guerra', 'commenti-codice'),
            ('banca-domande-teoria-guerra', 'analisi-statica'),
            ('banca-domande-teoria-guerra', 'clean-architecture-accoppiamento-componenti'),
            ('banca-esercizi-pattern-guerra', 'design-pattern-builder')]


def _dipendenti(id_):
    return [n['id'] for n in G['nodi'] if any(p['id'] == id_ for p in n['prerequisiti'])]


def test_archi_i2_presenti_e_soft():
    for da, a in ARCHI_I2:
        pre = {p['id']: p for p in N[da]['prerequisiti']}
        assert a in pre, f'{da} deve avere {a} come prerequisito'
        assert pre[a]['forza'] == 'soft' and len(pre[a]['motivo']) >= 10


def test_nessun_nodo_orfano():
    for id_ in N:
        assert N[id_]['prerequisiti'] or _dipendenti(id_), f'{id_} è isolato nel grafo'


def test_nuovi_nodi_collegati_e_nel_programma():
    mappati = {x['id'] for v in G['programma']['voci'] for x in v['nodi']}
    for id_ in NUOVI:
        assert id_ in N and N[id_]['prerequisiti'], id_
        assert id_ in mappati, f'{id_} non è nel programma (meta.json)'
    # i nodi di teoria/concetto nuovi devono essere raggiungibili da almeno un esercizio o banca
    for id_ in ['uml-diagramma-package', 'clean-architecture-accoppiamento-componenti', 'design-pattern-builder',
                'commenti-codice', 'analisi-statica']:
        assert _dipendenti(id_), f'{id_} non è usato da nessun nodo'
    assert set(N) <= mappati, f'nodi non mappati: {sorted(set(N) - mappati)}'


def test_titoli_unici():
    titoli = [n['title'].strip().lower() for n in G['nodi']]
    assert len(titoli) == len(set(titoli))
