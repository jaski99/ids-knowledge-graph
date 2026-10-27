// Percorso di studio in ordine topologico con caselle da spuntare.
import { h, clear } from './dom.js';
import { areaBadge, tipoBadge, prioBadge } from './badges.js';
import { formatMinuti } from '../core/progress.js';
import { hasLesson } from '../core/lesson.js';
import { MASTERY_LABELS, prerequisitiMancanti } from '../core/mastery.js';

export function createPathView(root, graph, { onSelect, onToggleDone, onOpenLesson }) {
  return {
    render({ visible, done, selected, mastery }) {
      const ids = graph.order.filter((id) => visible.has(id));
      clear(root);
      if (!ids.length) { root.append(h('p', { class: 'muted' }, 'Nessun nodo corrisponde ai filtri.')); return; }
      root.append(h('ol', { class: 'path' }, ids.map((id) => {
        const n = graph.byId.get(id);
        const blocked = prerequisitiMancanti(n, mastery).length > 0;
        return h('li', { class: ['step', done.has(id) && 'done', id === selected && 'sel'].filter(Boolean).join(' ') },
          h('input', { type: 'checkbox', id: `chk-${id}`, checked: done.has(id), 'aria-label': `Segna come completato: ${n.title}`, onchange: (e) => onToggleDone(id, e.target.checked) }),
          h('div', {},
            h('button', { type: 'button', class: 'link title', onclick: () => onSelect(id) }, n.title),
            onOpenLesson ? h('button', { type: 'button', class: 'lesson-chip' + (hasLesson(n) ? ' ready' : ''), 'aria-label': `Apri lezione: ${n.title}`, onclick: () => onOpenLesson(id) }, hasLesson(n) ? '📖 Lezione' : '📖 Scheda') : null,
            h('div', { class: 'badges' }, areaBadge(n, graph.aree), tipoBadge(n), prioBadge(n), h('span', { class: 'badge' }, '⏱ ' + formatMinuti(n.tempo_studio_min)),
              h('span', { class: 'badge mastery' }, MASTERY_LABELS[mastery?.get(id)?.livello || 'non_iniziato']),
              blocked && !done.has(id) ? h('span', { class: 'badge warn', title: 'Prerequisiti indispensabili senza richiamo corretto' }, 'prerequisiti mancanti') : null)));
      })));
    },
  };
}
