// Percorsi di graph.json: <meta name="kg-graph-url" content="a b ..."> o ?graph=URL. Si prova in ordine.
export function graphUrls(doc = document, loc = location) {
  const q = new URLSearchParams(loc.search).get('graph');
  if (q) return [q];
  const meta = doc.querySelector('meta[name="kg-graph-url"]');
  return (meta ? meta.content : 'graph.json').split(/\s+/).filter(Boolean);
}
export const STORAGE_KEYS = { done: 'ids-kg:completati:v1', review: 'ids-kg:ripasso:v1', last: 'ids-kg:ultima-lezione:v1' };
// Scuri abbastanza perché il testo bianco del badge resti sopra AA (4.5:1).
export const AREA_COLORS = ['#1e40af', '#b45309', '#047857', '#6b21a8', '#b91c1c', '#0e7490'];
export const TIPO_LABEL = { concetto: 'Concetto', abilita: 'Abilità', tipo_esercizio: "Tipo d'esercizio" };
export const TIPO_SHAPE = { concetto: 'ellipse', abilita: 'round-rectangle', tipo_esercizio: 'diamond' };
export const TIPO_ICON = { concetto: '●', abilita: '▬', tipo_esercizio: '◆' };
export const PRIO_LABEL = { alta: 'Alta', media: 'Media', bassa: 'Bassa' };
export const areaColor = (id) => AREA_COLORS[(id - 1) % AREA_COLORS.length];
export const PRIO_SIZE = { alta: 40, media: 28, bassa: 18 };
