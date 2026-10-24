// Caricamento e validazione di graph.json.
import { validateGraph } from './core/validate.js';
import { topoOrder } from './core/topo.js';

export async function loadGraph(urls, fetchFn = fetch) {
  const tried = [];
  for (const url of urls) {
    try {
      const r = await fetchFn(url, { cache: 'no-cache' });
      if (!r.ok) { tried.push(`${url}: HTTP ${r.status}`); continue; }
      return prepare(await r.json());
    } catch (e) {
      if (e.validation) throw e;
      tried.push(`${url}: ${e.message}`);
    }
  }
  throw new Error('Impossibile caricare graph.json (' + tried.join('; ') + ')');
}

export function prepare(g) {
  const errors = validateGraph(g);
  if (errors.length) { const e = new Error('graph.json non valido: ' + errors.slice(0, 5).join('; ')); e.validation = true; throw e; }
  const byId = new Map(g.nodi.map((n) => [n.id, n]));
  const order = topoOrder(g.nodi);
  return { ...g, byId, order };
}
