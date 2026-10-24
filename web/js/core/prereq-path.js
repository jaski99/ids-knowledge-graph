// Chiusura dei prerequisiti di un nodo: il nodo stesso, gli antenati e gli archi del percorso.
// Gli id arco coincidono con quelli del grafo (`sorgente->destinazione`).

export function prerequisitePath(nodes, id) {
  const byId = new Map((nodes || []).map((n) => [n.id, n]));
  const nodeIds = new Set();
  const edgeIds = new Set();
  const walk = (cur) => {
    if (!cur || nodeIds.has(cur) || !byId.has(cur)) return;
    nodeIds.add(cur);
    for (const p of byId.get(cur).prerequisiti || []) {
      if (p && p.id) edgeIds.add(`${p.id}->${cur}`);
      walk(p && p.id);
    }
  };
  walk(id);
  return { nodeIds, edgeIds };
}
