// Composition root: collega dati, stato e viste. Unico modulo che conosce tutti gli altri.
import { graphUrls, STORAGE_KEYS } from './config.js';
import { loadGraph } from './data.js';
import { createState } from './core/state.js';
import { createSetStore } from './core/store.js';
import { emptyFilters, applyFilters } from './core/filters.js';
import { createGraphView } from './ui/graph-view.js';
import { createDetailsView } from './ui/details.js';
import { createPathView } from './ui/path.js';
import { createProgressView } from './ui/progress-view.js';
import { createFiltersView } from './ui/filters-view.js';
import { createReviewView } from './ui/review.js';
import { initTabs } from './ui/tabs.js';

const $ = (s) => document.querySelector(s);

async function main() {
  let graph;
  try { graph = await loadGraph(graphUrls()); }
  catch (e) { $('#status').textContent = e.message; $('#status').classList.add('error'); return; }
  $('#status').textContent = '';
  $('#exam-note').textContent = graph.nota_esame || '';
  $('#course').textContent = `${graph.corso.nome} — prof. ${graph.corso.docente}`;

  if (matchMedia('(max-width: 720px)').matches) document.querySelectorAll('.side details').forEach((d) => { d.open = false; });
  const doneStore = createSetStore(localStorage, STORAGE_KEYS.done);
  const reviewStore = createSetStore(localStorage, STORAGE_KEYS.review);
  const state = createState({ filters: emptyFilters(), done: doneStore.values(), selected: null });

  const select = (id) => state.set({ selected: id });
  const toggleDone = (id, on) => { doneStore.toggle(id, on); state.set({ done: doneStore.values() }); };

  const details = createDetailsView($('#details'), graph, { onSelect: select, onToggleDone: toggleDone, onClose: () => state.set({ selected: null }) });
  const views = [
    createGraphView($('#cy'), graph, { onSelect: select }),
    createPathView($('#path'), graph, { onSelect: select, onToggleDone: toggleDone }),
    createProgressView($('#progress'), graph),
    createReviewView($('#review'), graph, reviewStore, { onSelect: select }),
  ];
  createFiltersView($('#filters'), graph, { initial: emptyFilters(), onChange: (filters) => state.set({ filters }) });
  const [graphView] = views;
  initTabs(document, (name) => { if (name === 'grafo') graphView.resize(); });

  let lastSel;
  const render = (s) => {
    const visible = new Set(applyFilters(graph.nodi, s.filters, s.done).map((n) => n.id));
    const vm = { visible, done: s.done, selected: s.selected };
    views.forEach((v) => (v.update || v.render).call(v, vm));
    details.render(s.selected, s.done);
    $('#count').textContent = `${visible.size}/${graph.nodi.length} nodi visibili`;
    if (s.selected !== lastSel && s.selected) details.focus();
    lastSel = s.selected;
  };
  state.subscribe(render);
  render(state.get());
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.get().selected) state.set({ selected: null }); });
}

main();
