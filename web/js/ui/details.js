// Pannello dettagli del nodo selezionato.
import { h, clear } from './dom.js';
import { areaBadge, tipoBadge, prioBadge } from './badges.js';
import { successors } from '../core/topo.js';
import { formatMinuti } from '../core/progress.js';

export function createDetailsView(root, graph, { onSelect, onToggleDone, onClose }) {
  const link = (id) => {
    const n = graph.byId.get(id);
    return h('button', { type: 'button', class: 'link', onclick: () => onSelect(id) }, n ? n.title : id);
  };
  const section = (title, ...body) => h('section', {}, h('h3', {}, title), ...body);

  return {
    render(id, done) {
      clear(root);
      const n = id && graph.byId.get(id);
      root.hidden = !n;
      if (!n) return;
      const succ = successors(graph.nodi, n.id);
      root.append(
        h('div', { class: 'det-head' },
          h('h2', { id: 'det-title', tabindex: '-1' }, n.title),
          h('button', { type: 'button', class: 'icon', 'aria-label': 'Chiudi dettagli', onclick: onClose }, '✕')),
        h('p', { class: 'badges' }, areaBadge(n, graph.aree), tipoBadge(n), prioBadge(n), h('span', { class: 'badge' }, '⏱ ' + formatMinuti(n.tempo_studio_min))),
        h('label', { class: 'check big' }, h('input', { type: 'checkbox', checked: done.has(n.id), onchange: (e) => onToggleDone(n.id, e.target.checked) }), ' Completato'),
        section('Sapere', h('p', {}, n.sapere)),
        section('Saper fare', h('ul', {}, n.saper_fare.map((s) => h('li', {}, s)))),
        section('Prerequisiti', n.prerequisiti.length
          ? h('ul', {}, n.prerequisiti.map((p) => h('li', {}, link(p.id), ' ', h('span', { class: `badge forza-${p.forza}` }, p.forza === 'hard' ? 'indispensabile' : 'utile'), p.motivo ? h('div', { class: 'muted' }, p.motivo) : null)))
          : h('p', { class: 'muted' }, 'Nessuno: puoi partire da qui.')),
        succ.length ? section('Sblocca', h('ul', { class: 'inline' }, succ.map((s) => h('li', {}, link(s))))) : null,
        section('Priorità all\u2019esame', h('p', {}, prioBadge(n), ' ', n.priorita.motivazione)),
        section('Esercizi tipo d\u2019esame', (n.esercizi || []).length
          ? (n.esercizi || []).map((e) => h('article', { class: 'ex' },
            h('p', { class: 'muted' }, e.tipo_esame), h('p', {}, e.testo),
            h('details', {}, h('summary', {}, 'Mostra soluzione'), h('p', { class: 'sol' }, e.soluzione))))
          : h('p', { class: 'muted' }, 'Nessun esercizio per questo nodo.')),
        (n.riferimenti_testo || []).length ? section('Testi di riferimento', h('ul', {}, n.riferimenti_testo.map((r) =>
          h('li', {}, graph.testi[r.libro] || r.libro, r.capitolo_o_sezione ? h('span', { class: 'muted' }, ' — ' + r.capitolo_o_sezione) : null)))) : null,
        section('Risorse gratuite', h('ul', {}, n.risorse.map((r) => h('li', {}, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.titolo))))),
      );
    },
    focus() { root.querySelector('#det-title')?.focus(); },
  };
}
