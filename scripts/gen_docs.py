#!/usr/bin/env python3
"""Genera piano, checklist e mappa NODES da graph/graph.json.
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


def _cell(value):
    """Mantiene il testo su una sola cella Markdown, anche con barre o a capo."""
    return str(value).replace("|", "\\|").replace("\n", " ")


def _frequenza_md(frequenza):
    tema = _cell(frequenza["tema"])
    if "prove" in frequenza:
        numero = frequenza["prove"]
        prove = "prova" if numero == 1 else "prove"
        valore = f"{numero} {prove} su {frequenza['totale']}"
    else:
        valore = f"{_cell(frequenza['qualitativa'])} (dato qualitativo)"
    return f"{tema}: {valore} secondo la sintesi dell'utente [D1]"


def nodes_md(g):
    """Tabella deterministica programma → nodi; non modifica il grafo in ingresso."""
    programma = g.get("programma") or {}
    frequenze = programma.get("frequenze", {})
    mappa = {}
    for voce in programma.get("voci", []):
        cfu = str(voce["cfu"]).replace(".", ",")
        nome_voce = f"{voce['voce']} ({cfu} CFU)"
        for item in voce["nodi"]:
            node_id = item["id"]
            if node_id in mappa:
                raise ValueError(f"nodo mappato a più voci: {node_id}")
            mappa[node_id] = (nome_voce, item)

    righe = [
        ORIGINE,
        "# Nodi e copertura del programma\n",
        "Voci e CFU provengono dalla scheda 2026/27 [S1]; le parti indicano ambiti "
        "di preparazione, non domande garantite. `—` indica un dato non trovato. "
        "Le frequenze sono tratte dalla **sintesi dell'utente** [D1], non da "
        "statistiche ufficiali: quelle riferite a un tema generale non certificano "
        "la frequenza di ogni sotto-argomento. Fonti: [SYLLABUS.md](SYLLABUS.md).\n",
        "| ID | Titolo | Area | Voce di programma | Parte d'esame | Frequenza | Priorità |",
        "|---|---|---|---|---|---|---|",
    ]
    non_mappati = []
    for nodo in sorted(g["nodi"], key=lambda n: (n["area"], n["id"])):
        assegnazione = mappa.get(nodo["id"])
        if assegnazione is None:
            voce, parti, frequenza = "—", "—", "—"
            non_mappati.append(nodo)
        else:
            voce, item = assegnazione
            parti = ", ".join(_cell(p) for p in item.get("parti_esame", [])) or "—"
            frequenza = "<br>".join(_frequenza_md(frequenze[k]) for k in item.get("frequenze", [])) or "—"
        righe.append(
            f"| `{_cell(nodo['id'])}` | {_cell(nodo['title'])} | {nodo['area']} | "
            f"{_cell(voce)} | {parti} | {frequenza} | {_cell(nodo['priorita']['livello'])} |"
        )
    righe.append("\n## Nodi non mappati\n")
    if non_mappati:
        righe.extend(f"- `{_cell(n['id'])}` — {_cell(n['title'])} (area {n['area']})" for n in non_mappati)
    else:
        righe.append("Nessuno.")
    return "\n".join(righe).rstrip() + "\n"


def outputs(g=None):
    g = load_graph() if g is None else g
    return {
        DOCS / "PIANO_STUDIO.md": piano(g),
        DOCS / "CHECKLIST_RIPASSO.md": checklist(g),
        DOCS / "NODES.md": nodes_md(g),
    }


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
