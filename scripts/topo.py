#!/usr/bin/env python3
"""Stampa l'ordine topologico di studio dei nodi di graph/graph.json."""
import sys
from kg import load_graph, topo_order

def main():
    g = load_graph(sys.argv[1]) if len(sys.argv) > 1 else load_graph()
    by_id = {n["id"]: n for n in g["nodi"]}
    tot = 0
    for k, i in enumerate(topo_order(g["nodi"]), 1):
        n = by_id[i]; tot += n["tempo_studio_min"]
        print(f"{k:3d}. [A{n['area']}] {i} - {n['title']} ({n['tempo_studio_min']} min, {n['priorita']['livello']})")
    print(f"Totale: {tot} min")

if __name__ == "__main__":
    main()
