import { h, clear } from './dom.js';
import { costruisciPercorsi } from '../core/exam-paths.js';
import { MASTERY_LABELS, prerequisitiMancanti } from '../core/mastery.js';
import { prioBadge } from './badges.js';

export function createExamPathsView(root, graph, { onOpenLesson, onSelect }) {
  const paths = costruisciPercorsi(graph);
  return {
    render({ visible, mastery }) {
      // Conserva apertura e focus durante gli aggiornamenti dello stato.
      const open = new Set([...root.querySelectorAll('details[open]')].map((d) => d.dataset.path));
      const firstRender = !root.childElementCount;
      clear(root).append(
        h('h2', {}, 'Percorsi per esame'),
        h('p', { class: 'muted' }, 'Ordine di studio proposto dalla sintesi dell’utente sulle prove, non una graduatoria ufficiale. I prerequisiti indispensabili restano indicati.'),
        !graph.programma ? h('p', { class: 'muted' }, 'Mappatura del programma [da verificare]: selezione basata sui contenuti e sulle priorità disponibili.') : null,
        ...paths.map((p, i) => {
          const nodi = p.nodi.filter((n) => visible.has(n.id));
          return h('details', { class: 'exam-path', 'data-path': p.id, open: firstRender ? i === 0 : open.has(p.id) },
            h('summary', {}, `${p.titolo} · ${nodi.length} ${nodi.length === 1 ? 'nodo' : 'nodi'}`),
            nodi.length ? h('ol', {}, nodi.map((n) => {
              const blocked = prerequisitiMancanti(n, mastery);
              const livello = mastery?.get(n.id)?.livello || 'non_iniziato';
              return h('li', {},
                h('button', { class: 'link', type: 'button', onclick: () => onOpenLesson(n.id) }, n.title),
                h('div', { class: 'badges' }, prioBadge(n), h('span', { class: `badge mastery mastery-${livello}` }, MASTERY_LABELS[livello])),
                blocked.length ? h('p', { class: 'muted' }, 'Prima verifica il richiamo: ', blocked.map((pr, idx) => [idx ? ', ' : '',
                  h('button', { class: 'link compact-link', type: 'button', onclick: () => onSelect(pr.id) }, graph.byId.get(pr.id)?.title || pr.id)]).flat()) : null);
            })) : h('p', { class: 'muted' }, 'Nessun nodo per i filtri attuali [da verificare].'));
        }));
    },
  };
}
