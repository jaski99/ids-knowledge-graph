"""Libreria comune: build (meta.json + parts/area-*.json -> graph.json), caricamento e ordinamento topologico.
Uso: python scripts/kg.py build   |   python scripts/kg.py check"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH = ROOT / "graph" / "graph.json"
META = ROOT / "graph" / "meta.json"
PARTS = ROOT / "graph" / "parts"
LESSONS = ROOT / "graph" / "lezioni"
SCHEMA = ROOT / "schema" / "node.schema.json"


PRIO_RANK = {"alta": 0, "media": 1, "bassa": 2}


def load_graph(path=GRAPH):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def load_schema(path=SCHEMA):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def edges(nodes):
    """Archi (prerequisito -> nodo)."""
    return [(p["id"], n["id"]) for n in nodes for p in n["prerequisiti"]]


def topo_order(nodes):
    """Kahn deterministico: a parita' di vincoli prima priorita' alta, poi (area, id). ValueError se c'e' un ciclo."""
    by_id = {n["id"]: n for n in nodes}
    indeg = {i: 0 for i in by_id}
    succ = {i: [] for i in by_id}
    for p, c in edges(nodes):
        if p not in by_id:
            raise KeyError(f"prerequisito inesistente: {p} (in {c})")
        indeg[c] += 1
        succ[p].append(c)
    key = lambda i: (PRIO_RANK[by_id[i]["priorita"]["livello"]], by_id[i]["area"], i)
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


def load_parts(parts_dir=PARTS):
    """{nome_file: [nodi]} per ogni graph/parts/*.json."""
    return {p.name: json.loads(p.read_text(encoding="utf-8")) for p in sorted(Path(parts_dir).glob("*.json"))}


def load_lessons(lessons_dir=LESSONS):
    """{id_nodo: lezione} da graph/lezioni/<id>.json (un file per lezione: nessun conflitto tra rami)."""
    return {p.stem: json.loads(p.read_text(encoding="utf-8")) for p in sorted(Path(lessons_dir).glob("*.json"))}


def build(meta_path=META, parts_dir=PARTS, lessons_dir=LESSONS):
    g = json.loads(Path(meta_path).read_text(encoding="utf-8"))
    nodes = [n for part in load_parts(parts_dir).values() for n in part]
    by_id = {n["id"]: n for n in nodes}
    for nid, lezione in load_lessons(lessons_dir).items():
        if nid not in by_id:
            raise KeyError(f"graph/lezioni/{nid}.json: nodo inesistente")
        if "lezione" in by_id[nid]:
            raise ValueError(f"{nid}: lezione sia inline nel part sia in graph/lezioni/ (usare solo graph/lezioni/)")
        by_id[nid] = {**by_id[nid], "lezione": lezione}
    g["nodi"] = sorted(by_id.values(), key=lambda n: (n["area"], n["id"]))
    return g


def dumps(g):
    return json.dumps(g, indent=2, ensure_ascii=False) + "\n"


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "build"
    out = dumps(build())
    if cmd == "build":
        GRAPH.write_text(out, encoding="utf-8")
        print(f"scritto {GRAPH}")
    elif cmd == "check":
        ok = GRAPH.exists() and GRAPH.read_text(encoding="utf-8") == out
        print("graph.json aggiornato" if ok else "graph.json NON aggiornato: esegui python scripts/kg.py build")
        sys.exit(0 if ok else 1)
    else:
        sys.exit("uso: kg.py build|check")
