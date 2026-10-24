// Progresso per area e totale con tempo residuo.
import { h, clear } from './dom.js';
import { computeProgress, formatMinuti } from '../core/progress.js';
import { areaColor } from '../config.js';

const bar = (label, r, color) => h('div', { class: 'prog' },
  h('div', { class: 'prog-label' }, h('span', {}, label), h('span', {}, `${r.fatti}/${r.totale} · ${r.perc}% · restano ${formatMinuti(r.minResidui)}`)),
  h('progress', { max: 100, value: r.perc, style: color ? `--c:${color}` : null, 'aria-label': `${label}: ${r.perc}%` }));

export function createProgressView(root, graph) {
  return {
    render({ done }) {
      const p = computeProgress(graph.nodi, graph.aree, done);
      clear(root).append(
        bar('Totale', p.totale),
        ...p.aree.map((a) => bar(`${a.area.id}. ${a.area.titolo}`, a, areaColor(a.area.id))));
    },
  };
}
