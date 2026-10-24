// Grafo interattivo (Cytoscape.js + dagre da CDN). Dipende solo da dati e callback.
import { edges } from '../core/topo.js';
import { areaColor, TIPO_SHAPE } from '../config.js';

export function createGraphView(container, graph, { onSelect }) {
  const cy = globalThis.cytoscape;
  if (!cy) {
    container.textContent = 'Libreria del grafo non disponibile (CDN non raggiungibile): usa la scheda Percorso.';
    return { update() {}, select() {}, resize() {} };
  }
  const els = [
    ...graph.nodi.map((n) => ({ data: { id: n.id, label: n.title, color: areaColor(n.area), shape: TIPO_SHAPE[n.tipo] } })),
    ...edges(graph.nodi).map((e) => ({ data: { id: `${e.source}->${e.target}`, source: e.source, target: e.target }, classes: e.forza })),
  ];
  let hasDagre = false;
  try { hasDagre = !!cy('layout', 'dagre'); } catch { /* estensione assente */ }
  const g = cy({
    container, elements: els, wheelSensitivity: 0.3, textureOnViewport: true, hideEdgesOnViewport: true, minZoom: 0.15, maxZoom: 2,
    // Contenitore largo -> ranghi in righe (TB); stretto/alto (mobile) -> ranghi in colonne (LR).
    layout: hasDagre ? { name: 'dagre', rankDir: container.clientWidth > container.clientHeight ? 'TB' : 'LR', nodeSep: 30, rankSep: 70 } : { name: 'breadthfirst', directed: true },
    style: [
      { selector: 'node', style: { 'background-color': 'data(color)', shape: 'data(shape)', label: 'data(label)', 'font-size': 11, 'min-zoomed-font-size': 7, 'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'bottom', 'text-margin-y': 4, width: 26, height: 26, color: '#1f2937', 'text-background-color': '#fff', 'text-background-opacity': 0.7 } },
      { selector: 'node.done', style: { 'border-width': 4, 'border-color': '#16a34a' } },
      { selector: 'node:selected', style: { 'border-width': 4, 'border-color': '#111827', 'overlay-opacity': 0.08 } },
      { selector: 'edge', style: { width: 1.6, 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8' } },
      { selector: 'edge.soft', style: { 'line-style': 'dashed', 'line-dash-pattern': [6, 4] } },
      { selector: '.faded', style: { opacity: 0.12 } },
    ],
  });
  g.on('tap', 'node', (ev) => onSelect(ev.target.id()));
  return {
    update({ visible, done, selected }) {
      g.batch(() => {
        g.nodes().forEach((n) => { n.toggleClass('faded', !visible.has(n.id())); n.toggleClass('done', done.has(n.id())); });
        g.edges().forEach((e) => e.toggleClass('faded', !(visible.has(e.source().id()) && visible.has(e.target().id()))));
      });
      this.select(selected);
    },
    select(id) {
      g.$(':selected').unselect();
      if (!id) return;
      const n = g.getElementById(id);
      if (n.nonempty()) { n.select(); g.animate({ center: { eles: n } }, { duration: 200 }); }
    },
    resize() { g.resize(); g.fit(undefined, 20); },
  };
}
