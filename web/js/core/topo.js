// Ordine topologico deterministico (Kahn, chiave area poi id), coerente con scripts/kg.py.
export function edges(nodes) {
  const out = [];
  for (const n of nodes) for (const p of n.prerequisiti || []) out.push({ source: p.id, target: n.id, forza: p.forza });
  return out;
}

const cmp = (byId) => (a, b) => (byId.get(a).area - byId.get(b).area) || (a < b ? -1 : a > b ? 1 : 0);

export function topoOrder(nodes) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  const succ = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges(nodes)) {
    if (!byId.has(e.source)) throw new Error(`prerequisito inesistente: ${e.source} (in ${e.target})`);
    indeg.set(e.target, indeg.get(e.target) + 1);
    succ.get(e.source).push(e.target);
  }
  const key = cmp(byId);
  const ready = [...indeg].filter(([, d]) => d === 0).map(([i]) => i).sort(key);
  const out = [];
  while (ready.length) {
    const i = ready.shift();
    out.push(i);
    for (const c of succ.get(i)) {
      indeg.set(c, indeg.get(c) - 1);
      if (indeg.get(c) === 0) ready.push(c);
    }
    ready.sort(key);
  }
  if (out.length !== byId.size) {
    const rest = [...byId.keys()].filter((i) => !out.includes(i)).sort();
    throw new Error('ciclo tra: ' + rest.join(', '));
  }
  return out;
}

export function successors(nodes, id) {
  return nodes.filter((n) => (n.prerequisiti || []).some((p) => p.id === id)).map((n) => n.id);
}
