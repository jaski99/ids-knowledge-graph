// Composition root: collega dati, stato e viste. Unico modulo che conosce tutti gli altri.
import { graphUrls, STORAGE_KEYS } from './config.js';
import { loadGraph } from './data.js';
import { createState } from './core/state.js';
import { createSetStore } from './core/store.js';
import { emptyFilters, applyFilters } from './core/filters.js';
import { eventShouldFocusSearch } from './core/search.js';
import { createGraphView } from './ui/graph-view.js';
import { createDetailsView } from './ui/details.js';
import { createPathView } from './ui/path.js';
import { createProgressView } from './ui/progress-view.js';
import { createFiltersView } from './ui/filters-view.js';
import { createReviewView } from './ui/review.js';
import { initTabs } from './ui/tabs.js';
import { createLessonView } from './ui/lesson-view.js';
import { parseRoute, lessonHash, nextToStudy } from './core/lesson.js';
import { h, clear } from './ui/dom.js';
import { navigation } from '../modules/registry.js';

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
    onClose: () => { location.hash = '#/percorso'; },
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
  const readLast = () => { try { return localStorage.getItem(STORAGE_KEYS.last); } catch { return null; } };
  const saveLast = (id) => { try { localStorage.setItem(STORAGE_KEYS.last, id); } catch { /* privacy mode */ } };
  // Barra "riprendi": ultima lezione aperta + prossima da studiare, sempre a un tocco dalla home.
  const renderResume = (done) => {
    const box = $('#resume');
    clear(box);
    const last = graph.byId.has(readLast()) ? readLast() : null;
    const next = nextToStudy(graph.order, done, null);
    const btn = (id, label, cls) => h('button', { type: 'button', class: `btn ${cls}`, onclick: () => openLesson(id) }, label, h('strong', {}, graph.byId.get(id).title));
    if (last && !done.has(last)) box.append(btn(last, '▶ Riprendi: ', 'primary'));
    if (next && next !== last) box.append(btn(next, last && !done.has(last) ? 'Prossima da studiare: ' : '▶ Inizia: ', last && !done.has(last) ? '' : 'primary'));
    if (!next) box.append(h('p', { class: 'muted' }, 'Percorso completato 🎉 Usa la scheda Ripasso.'));
    box.hidden = !box.children.length;
  };
  const tabs = initTabs(document, (name) => { if (name === 'grafo') graphView.resize(); });
  // Viste extra: importano `navigation` e chiamano register({ id, title, mount }).
  // Gli id grafo, percorso e ripasso sono già nel markup: un id nuovo diventa una scheda.
  const extraViews = [];
  const navCtx = { graph, getState: () => state.get(), subscribe: (fn) => state.subscribe(fn), openLesson, select, toggleDone, h, clear };
  let lastVm = null;
  navigation.subscribe((view) => {
    if (document.getElementById(`tab-${view.id}`)) return;
    const btn = h('button', {
      type: 'button', role: 'tab', id: `tab-${view.id}`, 'data-tab': view.id,
      'aria-controls': `view-${view.id}`, 'aria-selected': 'false', tabindex: '-1',
    }, view.title);
    const panel = h('section', { role: 'tabpanel', id: `view-${view.id}`, 'aria-labelledby': `tab-${view.id}`, hidden: true });
    document.querySelector('[role="tablist"]').append(btn);
    $('#main').append(panel);
    tabs.bind(btn);
    const api = view.mount ? view.mount(panel, navCtx) || {} : {};
    extraViews.push(api);
    if (lastVm && api.update) api.update(lastVm);
  });

  let lastSel;
  const render = (s) => {
    const visible = new Set(applyFilters(graph.nodi, s.filters, s.done).map((n) => n.id));
    const vm = { visible, done: s.done, selected: s.selected };
    lastVm = vm;
    views.forEach((v) => (v.update || v.render).call(v, vm));
    extraViews.forEach((v) => v.update?.(vm));
    details.render(s.selected, s.done);
    renderResume(s.done);
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
      saveLast(r.id);
      state.set({ selected: r.id });
      const drawn = lesson.render(r.id, state.get().done); // DOM pronto subito, i diagrammi arrivano dopo
      scrollTo(0, 0);
      lesson.focus();
      await drawn;
    } else if (location.hash === '#/percorso') {
      $('#tab-percorso').click();
      const last = readLast();
      const item = last && document.getElementById(`chk-${last}`);
      if (item) item.closest('li').scrollIntoView({ block: 'center' });
    } else {
      graphView.resize();
    }
  };
  addEventListener('hashchange', route);
  route();
  addEventListener('keydown', (e) => {
    if (eventShouldFocusSearch(e)) {
      const input = document.getElementById('search');
      if (input) { e.preventDefault(); input.focus(); input.select(); }
      return;
    }
    if (e.key !== 'Escape') return;
    if (e.target && e.target.id === 'search') { e.target.blur(); return; }
    if (parseRoute(location.hash)) location.hash = '#/percorso';
    else if (state.get().selected) state.set({ selected: null });
  });
}

main();
