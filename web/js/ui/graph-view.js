// Grafo interattivo (Cytoscape.js + dagre da CDN). Dipende solo da dati e callback.
import { edges } from '../core/topo.js';
import { prerequisitePath } from '../core/prereq-path.js';
import { areaColor, TIPO_SHAPE, PRIO_SIZE } from '../config.js';

export function createGraphView(container, graph, { onSelect }) {
  const cy = globalThis.cytoscape;
  if (!cy) {
    container.textContent = 'Libreria del grafo non disponibile (CDN non raggiungibile): usa la scheda Percorso.';
    return { update() {}, select() {}, resize() {}, setTheme() {} };
  }
  const els = [
    ...graph.nodi.map((n) => {
      const size = PRIO_SIZE[n.priorita?.livello] || PRIO_SIZE.media;
      return { data: { id: n.id, label: n.title, color: areaColor(n.area), shape: TIPO_SHAPE[n.tipo], w: size, h: size } };
    }),
    ...edges(graph.nodi).map((e) => ({ data: { id: `${e.source}->${e.target}`, source: e.source, target: e.target }, classes: e.forza })),
  ];
  let hasDagre = false;
  try { hasDagre = !!cy('layout', 'dagre'); } catch { /* estensione assente */ }
  const g = cy({
    container, elements: els, wheelSensitivity: 0.3, textureOnViewport: true, hideEdgesOnViewport: true, minZoom: 0.15, maxZoom: 2,
    // Contenitore largo -> ranghi in righe (TB); stretto/alto (mobile) -> ranghi in colonne (LR).
    layout: hasDagre ? { name: 'dagre', rankDir: container.clientWidth > container.clientHeight ? 'TB' : 'LR', nodeSep: 30, rankSep: 70 } : { name: 'breadthfirst', directed: true },
    style: [
      { selector: 'node', style: { 'background-color': 'data(color)', shape: 'data(shape)', label: 'data(label)', 'font-size': 11, 'min-zoomed-font-size': 7, 'text-wrap': 'wrap', 'text-max-width': 110, 'text-valign': 'bottom', 'text-margin-y': 4, width: 'data(w)', height: 'data(h)', color: '#1c1917', 'text-background-color': '#fffcf7', 'text-background-opacity': 0.85 } },
      { selector: 'node.done', style: { 'border-width': 4, 'border-color': '#15803d' } },
      { selector: 'node:selected', style: { 'border-width': 4, 'border-color': '#1c1917', 'overlay-opacity': 0.08 } },
      { selector: 'node.on-path', style: { opacity: 1, 'border-width': 4, 'border-color': '#1e3a8a', 'z-index': 10 } },
      { selector: 'node.dim', style: { opacity: 0.22 } },
      { selector: 'edge', style: { width: 1.6, 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'line-color': '#78716c', 'target-arrow-color': '#78716c' } },
      { selector: 'edge.soft', style: { 'line-style': 'dashed', 'line-dash-pattern': [6, 4] } },
      { selector: 'edge.on-path', style: { width: 3.2, opacity: 1, 'line-color': '#1e3a8a', 'target-arrow-color': '#1e3a8a', 'z-index': 9 } },
      { selector: 'edge.dim', style: { opacity: 0.15 } },
      { selector: '.faded', style: { opacity: 0.12 } },
    ],
  });
  g.on('tap', 'node', (ev) => onSelect(ev.target.id()));
  return {
    update({ visible, done, selected }) {
      const path = selected ? prerequisitePath(graph.nodi, selected) : { nodeIds: new Set(), edgeIds: new Set() };
      g.batch(() => {
        g.nodes().forEach((n) => {
          const on = path.nodeIds.has(n.id());
          n.toggleClass('faded', !visible.has(n.id()) && !on);
          n.toggleClass('done', done.has(n.id()));
          n.toggleClass('on-path', on);
          n.toggleClass('dim', Boolean(selected) && !on);
        });
        g.edges().forEach((e) => {
          const on = path.edgeIds.has(e.id());
          const shown = visible.has(e.source().id()) && visible.has(e.target().id());
          e.toggleClass('faded', !shown && !on);
          e.toggleClass('on-path', on);
          e.toggleClass('dim', Boolean(selected) && !on);
        });
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
    setTheme(theme) {
      const dark = theme === 'dark';
      g.style()
        .selector('node').style({ color: dark ? '#f5f5f4' : '#1c1917', 'text-background-color': dark ? '#1c1f27' : '#fffcf7' })
        .selector('node:selected').style({ 'border-color': dark ? '#f5f5f4' : '#1c1917' })
        .selector('edge').style({ 'line-color': dark ? '#a8a29e' : '#78716c', 'target-arrow-color': dark ? '#a8a29e' : '#78716c' })
        .selector('node.on-path').style({ 'border-color': dark ? '#fbbf24' : '#1e3a8a' })
        .selector('edge.on-path').style({ 'line-color': dark ? '#fbbf24' : '#1e3a8a', 'target-arrow-color': dark ? '#fbbf24' : '#1e3a8a' })
        .update();
    },
  };
}
