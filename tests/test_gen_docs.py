import copy
import json
import shutil
import subprocess

import pytest
import gen_docs
from kg import load_graph, topo_order, ROOT


def test_docs_aggiornati():
    generati = gen_docs.outputs()
    assert gen_docs.DOCS / "NODES.md" in generati
    for p, txt in generati.items():
        assert p.exists() and p.read_text(encoding="utf-8") == txt, f"{p.name} non aggiornato: python scripts/gen_docs.py"


def _grafo_di_prova():
    return {
        "nodi": [
            {"id": "nuovo", "title": "Nodo nuovo", "area": 2, "priorita": {"livello": "media"}},
            {"id": "base", "title": "Titolo | sicuro", "area": 1, "priorita": {"livello": "alta"}},
        ],
        "programma": {
            "frequenze": {
                "singola": {"tema": "Un tema", "prove": 1, "totale": 13},
                "plurale": {"tema": "Altro tema", "prove": 2, "totale": 13},
                "qualitativa": {"tema": "Un diagramma", "qualitativa": "quasi sempre"},
            },
            "voci": [{
                "voce": "Requisiti | base", "area": 1, "cfu": 2.5,
                "nodi": [{"id": "base", "parti_esame": ["Design", "Tesina"],
                          "frequenze": ["singola", "plurale", "qualitativa"]}],
            }],
        },
    }


def test_nodes_md_mappa_frequenze_qualitative_e_non_mappati():
    grafo = _grafo_di_prova()
    originale = copy.deepcopy(grafo)
    risultato = gen_docs.nodes_md(grafo)
    assert grafo == originale  # funzione pura, anche quando riordina i nodi
    assert risultato.startswith(gen_docs.ORIGINE)
    assert "| ID | Titolo | Area | Voce di programma | Parte d'esame | Frequenza | Priorità |" in risultato
    assert "| `base` | Titolo \\| sicuro | 1 | Requisiti \\| base (2,5 CFU) | Design, Tesina |" in risultato
    assert "Un tema: 1 prova su 13 secondo la sintesi dell'utente [D1]" in risultato
    assert "Altro tema: 2 prove su 13 secondo la sintesi dell'utente [D1]" in risultato
    assert "Un diagramma: quasi sempre (dato qualitativo) secondo la sintesi dell'utente [D1]" in risultato
    assert "| `nuovo` | Nodo nuovo | 2 | — | — | — | media |" in risultato
    assert "## Nodi non mappati\n\n- `nuovo` — Nodo nuovo (area 2)" in risultato
    assert risultato.index("| `base`") < risultato.index("| `nuovo`")


def test_nodes_md_senza_programma_e_senza_non_mappati():
    grafo = _grafo_di_prova()
    senza_programma = gen_docs.nodes_md({"nodi": grafo["nodi"]})
    assert "- `base` — Titolo \\| sicuro (area 1)" in senza_programma
    assert "- `nuovo` — Nodo nuovo (area 2)" in senza_programma
    grafo["nodi"] = [grafo["nodi"][1]]
    assert "## Nodi non mappati\n\nNessuno." in gen_docs.nodes_md(grafo)


def test_nodes_md_rifiuta_doppia_mappatura_e_frequenze_inesistenti():
    grafo = _grafo_di_prova()
    grafo["programma"]["voci"].append(copy.deepcopy(grafo["programma"]["voci"][0]))
    with pytest.raises(ValueError, match="nodo mappato a più voci: base"):
        gen_docs.nodes_md(grafo)
    grafo = _grafo_di_prova()
    grafo["programma"]["voci"][0]["nodi"][0]["frequenze"] = ["non-esiste"]
    with pytest.raises(KeyError, match="non-esiste"):
        gen_docs.nodes_md(grafo)


def test_sessioni_rispettano_limite_e_ordine():
    g = load_graph(); by_id = {n["id"]: n for n in g["nodi"]}
    order = topo_order(g["nodi"]); ss = gen_docs.sessioni(order, by_id)
    assert [i for s in ss for i in s] == order
    for s in ss:
        assert len(s) == 1 or sum(by_id[i]["tempo_studio_min"] for i in s) <= gen_docs.SESSIONE_MIN * gen_docs.TOLLERANZA


def test_priorita_alta_prima_a_parita_di_vincoli():
    mk = lambda i, a, liv, pre=(): {"id": i, "area": a, "priorita": {"livello": liv}, "prerequisiti": [{"id": p} for p in pre]}
    nodes = [mk("a", 1, "bassa"), mk("b", 3, "alta"), mk("c", 2, "media", ["b"])]
    assert topo_order(nodes) == ["b", "c", "a"]


@pytest.mark.skipif(shutil.which("node") is None, reason="node non installato")
def test_ordine_webapp_uguale_a_python():
    js = ("import { topoOrder } from './web/js/core/topo.js'; import fs from 'node:fs';"
          "console.log(JSON.stringify(topoOrder(JSON.parse(fs.readFileSync('graph/graph.json','utf8')).nodi)));")
    r = subprocess.run(["node", "--input-type=module", "-e", js], cwd=ROOT, capture_output=True, text=True, check=True)
    assert json.loads(r.stdout) == topo_order(load_graph()["nodi"])
