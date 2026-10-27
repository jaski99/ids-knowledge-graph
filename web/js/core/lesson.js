// Logica pura della vista Lezione (testabile in Node): routing, navigazione nel percorso, passi rivelabili.
const PREFIX = '#/lezione/';

export const lessonHash = (id) => PREFIX + encodeURIComponent(id);

export function parseRoute(hash) {
  if (typeof hash !== 'string' || !hash.startsWith(PREFIX)) return null;
  const id = decodeURIComponent(hash.slice(PREFIX.length));
  return id ? { view: 'lezione', id } : null;
}

/** Precedente/successivo secondo l'ordine del percorso (topologico). */
export function lessonNav(order, id) {
  const i = order.indexOf(id);
  if (i < 0) return { prev: null, next: null, pos: 0, total: order.length };
  return { prev: i > 0 ? order[i - 1] : null, next: i < order.length - 1 ? order[i + 1] : null, pos: i + 1, total: order.length };
}

export const hasLesson = (n) => Boolean(n && n.lezione && n.lezione.spiegazione);

/** Testo «perché ti serve» della lezione, ripulito; null se assente o vuoto (la sezione non si mostra). */
export function whyItMatters(n) {
  const text = n && n.lezione ? n.lezione.perche_ti_serve : null;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

/** Stato di un esempio svolto: passi mostrati uno alla volta, poi la soluzione. */
export function createStepper(total) {
  let shown = 0;
  let solution = false;
  return {
    get shown() { return shown; },
    get solutionShown() { return solution; },
    get finished() { return shown >= total && solution; },
    next() {
      if (shown < total) shown += 1;
      else solution = true;
      return this;
    },
    all() { shown = total; solution = true; return this; },
    reset() { shown = 0; solution = false; return this; },
    label() {
      if (shown < total) return `Mostra passo ${shown + 1} di ${total}`;
      return solution ? 'Esempio completato' : 'Mostra soluzione';
    },
  };
}

/** Separa il markdown in blocchi: utile per sapere quanti diagrammi mermaid contiene. */
export function countFences(md, lang) {
  return (String(md).match(new RegExp('^```' + lang + '\\s*$', 'gm')) || []).length;
}

/** Prossima lezione da studiare: la prima non completata dopo `from` nel percorso, altrimenti la prima non completata. */
export function nextToStudy(order, done, from = null) {
  const i = from ? order.indexOf(from) : -1;
  const after = order.slice(i + 1).find((id) => !done.has(id));
  return after || order.find((id) => !done.has(id) && id !== from) || null;
}
