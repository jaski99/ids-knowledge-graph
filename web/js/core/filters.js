// Filtri puri: un insieme vuoto significa "nessun vincolo".
import { lessonPlainText } from './search.js';

export const emptyFilters = () => ({
  aree: new Set(), tipi: new Set(), priorita: new Set(), q: '', soloNonCompletati: false, stato: 'tutti',
});

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function haystack(n) {
  return norm([n.id, n.title, n.sapere, ...(n.saper_fare || []), ...(n.checklist_ripasso || []), lessonPlainText(n)].join(' '));
}

export function matches(n, f, doneSet) {
  if (f.aree.size && !f.aree.has(n.area)) return false;
  if (f.tipi.size && !f.tipi.has(n.tipo)) return false;
  if (f.priorita.size && !f.priorita.has(n.priorita.livello)) return false;
  if (f.soloNonCompletati && doneSet.has(n.id)) return false;
  if (f.stato === 'aperti' && doneSet.has(n.id)) return false;
  if (f.stato === 'fatti' && !doneSet.has(n.id)) return false;
  const q = norm(f.q).trim();
  if (q && !q.split(/\s+/).every((t) => haystack(n).includes(t))) return false;
  return true;
}

export function applyFilters(nodes, f, doneSet) {
  return nodes.filter((n) => matches(n, f, doneSet));
}
