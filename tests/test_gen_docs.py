import json, shutil, subprocess
from pathlib import Path
import pytest
import gen_docs
from kg import load_graph, topo_order, ROOT


def test_docs_aggiornati():
    for p, txt in gen_docs.outputs().items():
        assert p.exists() and p.read_text(encoding="utf-8") == txt, f"{p.name} non aggiornato: python scripts/gen_docs.py"


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
