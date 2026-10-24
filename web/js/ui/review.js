// Checklist di ripasso dai campi checklist_ripasso, in ordine di studio.
import { h, clear } from './dom.js';
import { areaBadge } from './badges.js';

export const reviewKey = (nodeId, i) => `${nodeId}#${i}`;

export function createReviewView(root, graph, reviewStore, { onSelect }) {
  return {
    render({ visible }) {
      clear(root);
      const ids = graph.order.filter((id) => visible.has(id) && (graph.byId.get(id).checklist_ripasso || []).length);
      if (!ids.length) { root.append(h('p', { class: 'muted' }, 'Nessun punto di ripasso per i filtri attuali.')); return; }
      const traps = graph.trappole || [];
      root.append(
        traps.length ? h('section', { class: 'review traps' }, h('h3', {}, '⚠ Trappole note dalle prove d\u2019esame'),
          h('ul', {}, traps.map((t, i) => h('li', {}, h('label', { class: 'check' },
            h('input', { type: 'checkbox', checked: reviewStore.has(`trappola#${i}`), onchange: (e) => reviewStore.toggle(`trappola#${i}`, e.target.checked) }), ' ',
            h('span', {}, h('strong', {}, t.tema), h('span', { class: 'muted' }, ` (${t.fonte})`), h('br'), 'Trappola: ', t.trappola, h('br'), '→ ', t.risposta)))))) : null,
        h('p', {}, h('button', { type: 'button', onclick: () => { reviewStore.clear(); this.render({ visible }); } }, 'Azzera checklist di ripasso')),
        ...ids.map((id) => {
          const n = graph.byId.get(id);
          return h('section', { class: 'review' },
            h('h3', {}, areaBadge(n, graph.aree), ' ', h('button', { type: 'button', class: 'link', onclick: () => onSelect(id) }, n.title)),
            h('ul', {}, n.checklist_ripasso.map((item, i) => h('li', {}, h('label', { class: 'check' },
              h('input', { type: 'checkbox', checked: reviewStore.has(reviewKey(id, i)), onchange: (e) => reviewStore.toggle(reviewKey(id, i), e.target.checked) }), ' ', item)))));
        }));
    },
  };
}
