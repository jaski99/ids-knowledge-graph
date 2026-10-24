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
import { createLessonView } from './ui/lesson-view.js';
import { parseRoute, lessonHash } from './core/lesson.js';

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

  const openLesson = (id) => { location.hash = lessonHash(id); };
  const details = createDetailsView($('#details'), graph, { onSelect: select, onToggleDone: toggleDone, onClose: () => state.set({ selected: null }), onOpenLesson: openLesson });
  const lesson = createLessonView($('#lesson'), graph, {
    onOpen: openLesson,
    onClose: () => { location.hash = '#/'; },
    onToggleDone: toggleDone,
  });
  const views = [
    createGraphView($('#cy'), graph, { onSelect: select }),
    createPathView($('#path'), graph, { onSelect: select, onToggleDone: toggleDone, onOpenLesson: openLesson }),
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

  // Routing: #/lezione/<id> mostra la lezione a tutta pagina, qualsiasi altro hash mostra l'app.
  const route = async () => {
    const r = parseRoute(location.hash);
    document.body.classList.toggle('lesson-mode', Boolean(r));
    $('#lesson').hidden = !r;
    if (r) {
      state.set({ selected: r.id });
      await lesson.render(r.id, state.get().done);
      scrollTo(0, 0);
      lesson.focus();
    } else {
      graphView.resize();
    }
  };
  addEventListener('hashchange', route);
  route();
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (parseRoute(location.hash)) location.hash = '#/';
    else if (state.get().selected) state.set({ selected: null });
  });
}

main();
