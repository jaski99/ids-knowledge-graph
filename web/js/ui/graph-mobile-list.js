import { h, clear } from './dom.js';

export function graphMobileEntries(nodes, visible, done) {
  return nodes
    .filter((node) => visible.has(node.id))
    .map((node) => ({ id: node.id, title: node.title, area: node.area, done: done.has(node.id) }));
}

export function createGraphMobileList(container, graph, { onSelect, onOpen }) {
  return {
    update({ visible, done, selected }) {
      clear(container);
      const entries = graphMobileEntries(graph.nodi, visible, done);
      container.append(
        h('h3', {}, `Elenco dei concetti (${entries.length})`),
        h('p', { class: 'muted' }, 'Alternativa touch al grafo: seleziona un elemento per i dettagli o apri direttamente la lezione.'),
        h('ul', { class: 'graph-mobile-items' }, entries.map((entry) =>
          h('li', { class: entry.done ? 'graph-mobile-row done' : 'graph-mobile-row' },
            h('button', {
              type: 'button', class: 'graph-mobile-item',
              'aria-pressed': entry.id === selected ? 'true' : 'false',
              onclick: () => onSelect(entry.id),
            }, entry.title),
            h('button', {
              type: 'button', class: 'graph-mobile-open btn',
              'aria-label': `Apri la lezione: ${entry.title}`,
              onclick: () => onOpen(entry.id),
            }, 'Lezione')))));
    },
  };
}
