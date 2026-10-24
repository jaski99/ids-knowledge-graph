// Percorso di studio in ordine topologico con caselle da spuntare.
import { h, clear } from './dom.js';
import { areaBadge, tipoBadge, prioBadge } from './badges.js';
import { formatMinuti } from '../core/progress.js';
import { hasLesson } from '../core/lesson.js';

export function createPathView(root, graph, { onSelect, onToggleDone, onOpenLesson }) {
  return {
    render({ visible, done, selected }) {
      const ids = graph.order.filter((id) => visible.has(id));
      clear(root);
      if (!ids.length) { root.append(h('p', { class: 'muted' }, 'Nessun nodo corrisponde ai filtri.')); return; }
      root.append(h('ol', { class: 'path' }, ids.map((id) => {
        const n = graph.byId.get(id);
        const blocked = n.prerequisiti.some((p) => p.forza === 'hard' && !done.has(p.id));
        return h('li', { class: ['step', done.has(id) && 'done', id === selected && 'sel'].filter(Boolean).join(' ') },
          h('input', { type: 'checkbox', id: `chk-${id}`, checked: done.has(id), 'aria-label': `Segna come completato: ${n.title}`, onchange: (e) => onToggleDone(id, e.target.checked) }),
          h('div', {},
            h('button', { type: 'button', class: 'link title', onclick: () => onSelect(id) }, n.title),
            onOpenLesson ? h('button', { type: 'button', class: 'lesson-chip' + (hasLesson(n) ? ' ready' : ''), 'aria-label': `Apri lezione: ${n.title}`, onclick: () => onOpenLesson(id) }, hasLesson(n) ? '📖 Lezione' : '📖 Scheda') : null,
            h('div', { class: 'badges' }, areaBadge(n, graph.aree), tipoBadge(n), prioBadge(n), h('span', { class: 'badge' }, '⏱ ' + formatMinuti(n.tempo_studio_min)),
              blocked && !done.has(id) ? h('span', { class: 'badge warn', title: 'Prerequisiti indispensabili non completati' }, 'prerequisiti mancanti') : null)));
      })));
    },
  };
}
