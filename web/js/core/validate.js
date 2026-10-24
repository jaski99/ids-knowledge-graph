// Validazione leggera lato client (la validazione completa è in pytest + JSON Schema).
import { topoOrder } from './topo.js';

const TIPI = ['concetto', 'abilita', 'tipo_esercizio'];
const LIVELLI = ['alta', 'media', 'bassa'];

export function validateGraph(g) {
  const err = [];
  if (!g || typeof g !== 'object') return ['graph.json non è un oggetto'];
  if (g.versione !== 2) err.push(`versione attesa 2, trovata ${g.versione}`);
  if (!Array.isArray(g.aree) || !g.aree.length) err.push('aree mancanti');
  if (!Array.isArray(g.nodi)) return [...err, 'nodi mancanti'];
  const areaIds = new Set((g.aree || []).map((a) => a.id));
  const ids = new Set();
  for (const n of g.nodi) {
    const where = `nodo ${n && n.id}`;
    if (!n || typeof n.id !== 'string') { err.push('nodo senza id'); continue; }
    if (ids.has(n.id)) err.push(`id duplicato: ${n.id}`);
    ids.add(n.id);
    if (!areaIds.has(n.area)) err.push(`${where}: area ${n.area} non dichiarata`);
    if (!TIPI.includes(n.tipo)) err.push(`${where}: tipo non valido`);
    if (!n.priorita || !LIVELLI.includes(n.priorita.livello)) err.push(`${where}: priorità non valida`);
    if (!Number.isInteger(n.tempo_studio_min)) err.push(`${where}: tempo_studio_min non intero`);
    if (!Array.isArray(n.prerequisiti)) err.push(`${where}: prerequisiti non è un array`);
  }
  for (const n of g.nodi) for (const p of n.prerequisiti || []) {
    if (!ids.has(p.id)) err.push(`nodo ${n.id}: prerequisito inesistente ${p.id}`);
    if (p.id === n.id) err.push(`nodo ${n.id}: self-loop`);
  }
  if (!err.length) { try { topoOrder(g.nodi); } catch (e) { err.push(e.message); } }
  return err;
}
