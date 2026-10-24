#!/usr/bin/env python3
"""Genera docs/PIANO_STUDIO.md e docs/CHECKLIST_RIPASSO.md da graph/graph.json.
Uso: python scripts/gen_docs.py [check]"""
import sys
from kg import ROOT, load_graph, topo_order

DOCS = ROOT / "docs"
SESSIONE_MIN = 120
TOLLERANZA = 1.15  # una sessione può sforare di ~15%
ORIGINE = "<!-- generato da scripts/gen_docs.py: non modificare a mano -->\n"


def fmt(m):
    h, r = divmod(m, 60)
    return f"{h} h {r:02d} min" if h else f"{r} min"


def sessioni(order, by_id, limite=SESSIONE_MIN):
    """Raggruppa l'ordine topologico in sessioni consecutive di al massimo ~limite minuti."""
    out, cur, tot = [], [], 0
    for i in order:
        t = by_id[i]["tempo_studio_min"]
        if cur and tot + t > limite * TOLLERANZA:
            out.append(cur); cur, tot = [], 0
        cur.append(i); tot += t
    if cur:
        out.append(cur)
    return out


def piano(g):
    by_id = {n["id"]: n for n in g["nodi"]}
    order = topo_order(g["nodi"])
    aree = {a["id"]: a["titolo"] for a in g["aree"]}
    L = [ORIGINE, "# Piano di studio — Ingegneria del Software\n",
         "Ordine topologico dei nodi (ogni prerequisito prima del nodo che lo usa); a parità di vincoli prima la priorità **ALTA**, poi area e id. "
         f"Sessioni da circa {SESSIONE_MIN // 60} ore (un nodo non viene mai spezzato).\n", "## Tempo totale per area\n",
         "| area | nodi | alta | tempo |", "|---|---|---|---|"]
    for a, t in aree.items():
        ns = [n for n in g["nodi"] if n["area"] == a]
        L.append(f"| {a}. {t} | {len(ns)} | {sum(n['priorita']['livello'] == 'alta' for n in ns)} | {fmt(sum(n['tempo_studio_min'] for n in ns))} |")
    L.append(f"| **Totale** | {len(by_id)} | {sum(n['priorita']['livello'] == 'alta' for n in g['nodi'])} | **{fmt(sum(n['tempo_studio_min'] for n in g['nodi']))}** |\n")
    k = 0
    for s, ids in enumerate(sessioni(order, by_id), 1):
        L.append(f"## Sessione {s} ({fmt(sum(by_id[i]['tempo_studio_min'] for i in ids))})\n")
        for i in ids:
            k += 1; n = by_id[i]
            pre = ", ".join(p["id"] for p in n["prerequisiti"]) or "—"
            L.append(f"{k}. [ ] **{n['title']}** (`{i}`) — area {n['area']}, {n['tipo']}, priorità {n['priorita']['livello'].upper()}, {n['tempo_studio_min']} min. Prerequisiti: {pre}")
        L.append("")
    return "\n".join(L).rstrip() + "\n"


def checklist(g):
    by_id = {n["id"]: n for n in g["nodi"]}
    aree = {a["id"]: a["titolo"] for a in g["aree"]}
    order = topo_order(g["nodi"])
    L = [ORIGINE, "# Checklist di ripasso — Ingegneria del Software\n", "## Trappole note dalle prove d'esame\n"]
    for t in g.get("trappole", []):
        L.append(f"- [ ] **{t['tema']}** ({t['fonte']}). Trappola: {t['trappola']} → {t['risposta']}")
    for a, titolo in aree.items():
        ids = [i for i in order if by_id[i]["area"] == a and by_id[i].get("checklist_ripasso")]
        if not ids:
            continue
        L.append(f"\n## Area {a}. {titolo}\n")
        for i in ids:
            n = by_id[i]
            L.append(f"### {n['title']} (priorità {n['priorita']['livello'].upper()})\n")
            L += [f"- [ ] {x}" for x in n["checklist_ripasso"]]
            L.append("")
    return "\n".join(L).rstrip() + "\n"


def outputs(g=None):
    g = g or load_graph()
    return {DOCS / "PIANO_STUDIO.md": piano(g), DOCS / "CHECKLIST_RIPASSO.md": checklist(g)}


def main():
    check = len(sys.argv) > 1 and sys.argv[1] == "check"
    stale = []
    for p, txt in outputs().items():
        if check:
            if not p.exists() or p.read_text(encoding="utf-8") != txt:
                stale.append(p.name)
        else:
            p.write_text(txt, encoding="utf-8"); print(f"scritto {p}")
    if stale:
        sys.exit("non aggiornati: " + ", ".join(stale) + " (esegui python scripts/gen_docs.py)")


if __name__ == "__main__":
    main()
