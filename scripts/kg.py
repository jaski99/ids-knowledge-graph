"""Libreria comune: caricamento, validazione e ordinamento topologico di graph/graph.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH = ROOT / "graph" / "graph.json"
SCHEMA = ROOT / "schema" / "node.schema.json"


def load_graph(path=GRAPH):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def load_schema(path=SCHEMA):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def edges(nodes):
    """Archi (prerequisito -> nodo)."""
    return [(p, n["id"]) for n in nodes for p in n["prerequisiti"]]


def topo_order(nodes):
    """Kahn deterministico (area, id). Solleva ValueError se c'e' un ciclo."""
    by_id = {n["id"]: n for n in nodes}
    indeg = {i: 0 for i in by_id}
    succ = {i: [] for i in by_id}
    for p, c in edges(nodes):
        if p not in by_id:
            raise KeyError(f"prerequisito inesistente: {p} (in {c})")
        indeg[c] += 1
        succ[p].append(c)
    key = lambda i: (by_id[i]["area"], i)
    ready = sorted([i for i, d in indeg.items() if d == 0], key=key)
    out = []
    while ready:
        i = ready.pop(0)
        out.append(i)
        for c in succ[i]:
            indeg[c] -= 1
            if indeg[c] == 0:
                ready.append(c)
        ready.sort(key=key)
    if len(out) != len(by_id):
        raise ValueError("ciclo tra: " + ", ".join(sorted(set(by_id) - set(out))))
    return out
