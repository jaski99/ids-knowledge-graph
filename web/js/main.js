// Composition root: collega dati, stato e viste. Unico modulo che conosce tutti gli altri.
import { graphUrls, STORAGE_KEYS } from './config.js';
import { loadGraph } from './data.js';
import { createState } from './core/state.js';
import { createSetStore } from './core/store.js';
import { calcolaPadronanza } from './core/mastery.js';
import { caricaEsiti } from './core/outcomes.js';
import { createAttemptStore } from './core/attempts.js';
import { nodiDaRivedere } from './core/review-plan.js';
import { leggiStato } from '../modules/ripasso/store.js';
import { toIsoDay } from '../modules/ripasso/giorni.js';
import { registraPwa } from './core/pwa.js';
import { emptyFilters, applyFilters } from './core/filters.js';
import { eventShouldFocusSearch } from './core/search.js';
import { createGraphView } from './ui/graph-view.js';
import { createMinimap } from './ui/minimap.js';
import { createGraphMobileList } from './ui/graph-mobile-list.js';
import { createDetailsView } from './ui/details.js';
import { createPathView } from './ui/path.js';
import { createExamPathsView } from './ui/exam-paths.js';
import { createBackupView } from './ui/backup-view.js';
import { createProgressView } from './ui/progress-view.js';
import { createFiltersView } from './ui/filters-view.js';
import { createReviewView } from './ui/review.js';
import { initTabs } from './ui/tabs.js';
import { createLessonView } from './ui/lesson-view.js';
import { parseRoute, lessonHash, nextToStudy } from './core/lesson.js';
import { h, clear } from './ui/dom.js';
import { avviaModuli } from '../modules/avvia.js';
import { createThemeController, syncThemeButtons } from './core/theme.js';

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
  const attemptStore = createAttemptStore(localStorage);
  let esiti = [];
  const masteryFor = (done) => calcolaPadronanza(graph.nodi, done, leggiStato(localStorage).carte, esiti, toIsoDay(new Date()));
  const state = createState({ filters: emptyFilters(), done: doneStore.values(), selected: null,
    mastery: masteryFor(doneStore.values()), erroriTentativi: nodiDaRivedere(attemptStore.read()) });

  const select = (id) => state.set({ selected: id });
  const toggleDone = (id, on) => {
    doneStore.toggle(id, on);
    const done = doneStore.values();
    state.set({ done, mastery: masteryFor(done) });
  };

  let lastLessonOpener = null;
  let lastLessonId = null;
  const openLesson = (id) => { lastLessonOpener = document.activeElement; lastLessonId = id; location.hash = lessonHash(id); };
  const details = createDetailsView($('#details'), graph, { onSelect: select, onToggleDone: toggleDone,
    onClose: () => { state.set({ selected: null }); $('#cy').focus(); }, onOpenLesson: openLesson, attemptStore });
  const lesson = createLessonView($('#lesson'), graph, {
    onOpen: openLesson,
    onClose: () => { location.hash = '#/percorso'; },
    onToggleDone: toggleDone,
    onToggleTheme: () => theme.toggle(),
    attemptStore,
  });
  const views = [
    createGraphView($('#cy'), graph, { onSelect: select, onOpen: openLesson }),
    createPathView($('#path'), graph, { onSelect: select, onToggleDone: toggleDone, onOpenLesson: openLesson }),
    createExamPathsView($('#exam-paths'), graph, { onSelect: select, onOpenLesson: openLesson }),
    createProgressView($('#progress'), graph),
    createReviewView($('#review'), graph, reviewStore, { onSelect: select }),
  ];
  createFiltersView($('#filters'), graph, { initial: emptyFilters(), onChange: (filters) => state.set({ filters, erroriTentativi: nodiDaRivedere(attemptStore.read()) }) });
  createBackupView($('#backup'), graph, { storage: localStorage, confirm: (msg) => window.confirm(msg), reload: () => location.reload() });
  const [graphView] = views;
  const mobileGraphList = createGraphMobileList($('#graph-mobile-list'), graph, { onSelect: select, onOpen: openLesson });
  const themeBtn = h('button', { type: 'button', class: 'btn', 'data-theme-toggle': '1' });
  $('#theme').append(themeBtn);
  const theme = createThemeController({
    storage: localStorage,
    prefersDark: matchMedia('(prefers-color-scheme: dark)').matches,
    media: matchMedia('(prefers-color-scheme: dark)'),
    apply(name) {
      document.documentElement.dataset.theme = name;
      syncThemeButtons(document, name);
      graphView.setTheme(name);
      if ($('#lesson').hidden) lesson.setTheme(name);
      else lesson.refreshDiagrams(name);
    },
  });
  themeBtn.addEventListener('click', () => theme.toggle());
  const minimap = createMinimap(document.getElementById('minimap'), graphView.cytoscape);
  theme.subscribe(() => minimap.redraw());
  $('#zoom-in').addEventListener('click', () => graphView.zoomBy(1.25));
  $('#zoom-out').addEventListener('click', () => graphView.zoomBy(1 / 1.25));
  $('#zoom-fit').addEventListener('click', () => graphView.fit());
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
  initTabs(document, (name) => { if (name === 'grafo') graphView.resize(); });
  // Le viste aggiuntive usano il registry condiviso e le route #/<id>.
  const moduli = avviaModuli({ document, graph, storage: localStorage, toggleTheme: () => theme.toggle(), getEsiti: () => esiti });
  syncThemeButtons(document, theme.get());

  let lastSel;
  const render = (s) => {
    const visible = new Set(applyFilters(graph.nodi, s.filters, s.done, s.mastery, s.erroriTentativi).map((n) => n.id));
    const vm = { visible, done: s.done, selected: s.selected, mastery: s.mastery };
    views.forEach((v) => (v.update || v.render).call(v, vm));
    mobileGraphList.update(vm);
    details.render(s.selected, s.done, s.mastery);
    renderResume(s.done);
    $('#count').textContent = `${visible.size}/${graph.nodi.length} nodi visibili`;
    if (s.selected !== lastSel && s.selected) details.focus();
    lastSel = s.selected;
  };
  state.subscribe(render);
  render(state.get());

  // Routing: rilegge le evidenze dopo il ripasso e dopo il simulatore, senza conoscere i suoi interni.
  let routeToken = 0;
  const route = async () => {
    const token = ++routeToken;
    const result = await caricaEsiti(localStorage);
    if (token !== routeToken) return;
    esiti = result.esiti;
    $('#outcome-status').textContent = result.disponibile ? '' : 'Esiti del simulatore non disponibili [da verificare].';
    state.set({ mastery: masteryFor(state.get().done), erroriTentativi: nodiDaRivedere(attemptStore.read()) });
    const wasLesson = document.body.classList.contains('lesson-mode');
    const moduloAttivo = moduli.mostra(location.hash);
    document.body.classList.toggle('module-mode', moduloAttivo);
    const r = parseRoute(location.hash);
    document.body.classList.toggle('lesson-mode', Boolean(r));
    $('#lesson').hidden = !r;
    if (r) {
      saveLast(r.id);
      state.set({ selected: r.id });
      const drawn = lesson.render(r.id, state.get().done, state.get().mastery); // DOM pronto subito, i diagrammi arrivano dopo
      scrollTo(0, 0);
      lesson.focus();
      await drawn;
    } else if (location.hash === '#/percorso') {
      $('#tab-percorso').click();
      const last = readLast();
      const item = last && document.getElementById(`chk-${last}`);
      if (item) item.closest('li').scrollIntoView({ block: 'center' });
      if (wasLesson) {
        const fallback = lastLessonId && document.getElementById(`chk-${lastLessonId}`);
        const target = lastLessonOpener?.isConnected && lastLessonOpener.getClientRects().length ? lastLessonOpener : (fallback || $('#tab-percorso'));
        target.focus();
      }
    } else {
      graphView.resize();
    }
  };
  addEventListener('hashchange', route);
  route();
  addEventListener('keydown', (e) => {
    if (eventShouldFocusSearch(e) && !document.body.classList.contains('lesson-mode') && !document.body.classList.contains('module-mode')) {
      const input = document.getElementById('search');
      if (input) { e.preventDefault(); const panel = input.closest('details'); if (panel) panel.open = true; input.focus(); input.select(); }
      return;
    }
    if (e.key !== 'Escape') return;
    if (e.target && e.target.closest && e.target.closest('textarea, input, select')) {
      if (e.target.id === 'search') e.target.blur();
      return;
    }
    if (parseRoute(location.hash)) location.hash = '#/percorso';
    else if (document.body.classList.contains('module-mode')) location.hash = '#/';
    else if (state.get().selected) { state.set({ selected: null }); $('#cy').focus(); }
  });
}

registraPwa(navigator, location);
main();
