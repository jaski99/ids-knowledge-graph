import { h } from './dom.js';
import { areaColor, TIPO_LABEL, TIPO_ICON, PRIO_LABEL } from '../config.js';

export const areaBadge = (n, aree) => h('span', { class: 'badge area', style: `--c:${areaColor(n.area)}`, title: aree.find((a) => a.id === n.area)?.titolo }, `A${n.area}`);
export const tipoBadge = (n) => h('span', { class: 'badge tipo' }, h('span', { 'aria-hidden': 'true' }, TIPO_ICON[n.tipo] + ' '), TIPO_LABEL[n.tipo]);
export const prioBadge = (n) => h('span', { class: `badge prio prio-${n.priorita.livello}` }, 'Priorità ' + PRIO_LABEL[n.priorita.livello]);
