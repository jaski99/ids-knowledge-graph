// Vista Lezione a tutta pagina: spiegazione completa, esempi svolti a passi, autoverifica, navigazione nel percorso.
import { h, clear } from './dom.js';
import { areaBadge, tipoBadge, prioBadge } from './badges.js';
import { formatMinuti } from '../core/progress.js';
import { lessonNav, hasLesson, createStepper, nextToStudy } from '../core/lesson.js';
import { mdElement, renderMermaid } from './markdown.js';

export function createLessonView(root, graph, { onOpen, onClose, onToggleDone, closeLabel = '← Percorso' }) {
  const title = (id) => (graph.byId.get(id) || { title: id }).title;
  const lessonLink = (id, text) => h('button', { type: 'button', class: 'link', onclick: () => onOpen(id) }, text || title(id));
  const block = (cls, heading, ...body) => h('section', { class: `ls ${cls}` }, h('h2', {}, heading), ...body);

  function navBar(nav, where) {
    return h('nav', { class: `ls-nav ${where}`, 'aria-label': where === 'top' ? 'Navigazione lezione' : 'Navigazione percorso' },
      h('button', { type: 'button', class: 'btn', disabled: !nav.prev, onclick: () => nav.prev && onOpen(nav.prev), 'aria-label': nav.prev ? `Precedente: ${title(nav.prev)}` : 'Nessuna lezione precedente' }, '← ', h('span', { class: 'hide-sm' }, 'Precedente')),
      h('span', { class: 'muted' }, `${nav.pos}/${nav.total}`),
      h('button', { type: 'button', class: 'btn primary', disabled: !nav.next, onclick: () => nav.next && onOpen(nav.next), 'aria-label': nav.next ? `Successivo: ${title(nav.next)}` : 'Nessuna lezione successiva' }, h('span', { class: 'hide-sm' }, 'Successivo'), ' →'));
  }

  function workedExample(ex, i) {
    const st = createStepper(ex.passi.length);
    const list = h('ol', { class: 'passi' });
    const sol = h('div', { class: 'ex-sol', hidden: true },
      h('h4', {}, 'Soluzione'), mdElement(ex.soluzione),
      h('h4', {}, 'Perché funziona'), mdElement(ex.perche_funziona));
    const btn = h('button', { type: 'button', class: 'btn primary' });
    const allBtn = h('button', { type: 'button', class: 'btn' }, 'Mostra tutto');
    const sync = () => {
      while (list.children.length < st.shown) {
        const k = list.children.length;
        const li = h('li', { tabindex: '-1' }, mdElement(ex.passi[k], { inline: true, tag: 'span', className: 'md-inline' }));
        list.append(li);
      }
      sol.hidden = !st.solutionShown;
      if (!sol.hidden) renderMermaid(sol); // i diagrammi nascosti si disegnano solo quando visibili
      btn.textContent = st.label();
      btn.disabled = st.finished;
      allBtn.hidden = st.finished;
    };
    btn.addEventListener('click', () => {
      const before = st.shown;
      st.next(); sync();
      (st.shown > before ? list.lastElementChild : sol).focus?.();
    });
    allBtn.addEventListener('click', () => { st.all(); sync(); });
    sol.tabIndex = -1;
    sync();
    return h('article', { class: 'worked', 'data-example': i },
      h('h3', {}, `Esempio ${i + 1}: ${ex.titolo}`),
      h('div', { class: 'problema' }, h('strong', {}, 'Problema. '), mdElement(ex.problema, { inline: true, tag: 'span', className: 'md-inline' })),
      list, h('div', { class: 'ex-actions' }, btn, allBtn), sol);
  }

  function lessonBody(n) {
    const L = n.lezione;
    return [
      block('intuizione', '💡 Perché esiste', h('p', {}, L.intuizione)),
      block('analogia', '🔁 Analogia', h('p', {}, L.analogia)),
      block('prior', '🧩 Cosa sai già e come si collega', h('ul', {}, L.collegamenti_prior.map((c) => h('li', {},
        h('strong', {}, c.conoscenza), ' — ', c.collegamento, c.nodo ? h('span', {}, ' ', lessonLink(c.nodo, '→ ' + title(c.nodo))) : null)))),
      block('spiegazione', '📘 Spiegazione', mdElement(L.spiegazione)),
      block('esempi', '✍️ Esempi svolti', h('p', { class: 'muted' }, 'Prova a fare ogni passo da solo prima di rivelarlo.'), L.esempi_svolti.map(workedExample)),
      block('errori', '⚠️ Errori comuni', h('ul', {}, L.errori_comuni.map((e) => h('li', {}, mdElement(e, { inline: true, tag: 'span', className: 'md-inline' }))))),
      block('autoverifica', '✅ Autoverifica', h('ol', { class: 'quiz' }, L.domande_autoverifica.map((q) => h('li', {},
        h('p', { class: 'q' }, q.domanda),
        h('details', {}, h('summary', {}, 'Mostra risposta'), mdElement(q.risposta)))))),
      block('riepilogo', '📌 Riepilogo', h('ul', {}, L.riepilogo.split('\n').filter((r) => r.trim()).map((r) => h('li', {}, r)))),
    ];
  }

  function fallbackBody(n) {
    return [
      h('p', { class: 'todo' }, 'Lezione completa in preparazione. Intanto ecco la scheda sintetica.'),
      block('intuizione', 'Sapere', h('p', {}, n.sapere)),
      block('prior', 'Saper fare', h('ul', {}, n.saper_fare.map((s) => h('li', {}, s)))),
    ];
  }

  function commonTail(n) {
    return [
      (n.esercizi || []).length ? block('esercizi', '📝 Esercizi tipo d\u2019esame', n.esercizi.map((e) => h('article', { class: 'ex' },
        h('p', { class: 'muted' }, e.tipo_esame), h('p', {}, e.testo),
        h('details', {}, h('summary', {}, 'Mostra soluzione'), h('p', { class: 'sol' }, e.soluzione))))) : null,
      n.prerequisiti.length ? block('prereq', 'Prerequisiti', h('ul', {}, n.prerequisiti.map((p) => h('li', {}, lessonLink(p.id), ' ',
        h('span', { class: `badge forza-${p.forza}` }, p.forza === 'hard' ? 'indispensabile' : 'utile'))))) : null,
      block('approfondimento', 'Per approfondire (facoltativo)',
        h('ul', {}, n.risorse.map((r) => h('li', {}, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer' }, r.titolo))),
          (n.riferimenti_testo || []).map((r) => h('li', {}, graph.testi[r.libro] || r.libro, r.capitolo_o_sezione ? ' — ' + r.capitolo_o_sezione : '')))),
    ];
  }

  // Fine lezione: un solo tocco per segnarla e passare alla prossima non ancora studiata del percorso.
  function finishBar(n, nav, done) {
    const target = nextToStudy(graph.order, new Set([...done, n.id]), n.id);
    const go = () => { onToggleDone(n.id, true); if (target) onOpen(target); };
    return h('div', { class: 'ls-finish' },
      h('button', { type: 'button', class: 'btn primary big', 'data-action': 'done-next', onclick: go },
        target ? '✓ Segna come studiato e vai alla prossima' : '✓ Segna come studiato'),
      target ? h('p', { class: 'muted' }, 'Prossima: ', h('strong', {}, title(target)), target !== nav.next ? ' (salta quelle già studiate)' : '') : h('p', { class: 'muted' }, 'Hai completato tutto il percorso 🎉'));
  }

  return {
    async render(id, done) {
      clear(root);
      const n = graph.byId.get(id);
      if (!n) {
        root.append(h('p', { class: 'error' }, `Nodo "${id}" non trovato.`), h('button', { type: 'button', class: 'btn', onclick: onClose }, '← Torna al grafo'));
        return;
      }
      const nav = lessonNav(graph.order, id);
      root.append(
        h('div', { class: 'ls-top' },
          h('button', { type: 'button', class: 'btn', onclick: onClose }, closeLabel),
          navBar(nav, 'top')),
        h('article', { class: 'lesson', 'data-node': n.id },
          h('header', {},
            h('h1', { id: 'lesson-title', tabindex: '-1' }, n.title),
            h('p', { class: 'badges' }, areaBadge(n, graph.aree), tipoBadge(n), prioBadge(n), h('span', { class: 'badge' }, '⏱ ' + formatMinuti(n.tempo_studio_min)),
              hasLesson(n) ? null : h('span', { class: 'badge warn' }, 'lezione TODO')),
            h('label', { class: 'check big' }, h('input', { type: 'checkbox', checked: done.has(n.id), onchange: (e) => onToggleDone(n.id, e.target.checked) }), ' Ho capito: segna come completato')),
          ...(hasLesson(n) ? lessonBody(n) : fallbackBody(n)),
          ...commonTail(n)),
        finishBar(n, nav, done),
        navBar(nav, 'bottom'),
      );
      await renderMermaid(root);
    },
    focus() { root.querySelector('#lesson-title')?.focus({ preventScroll: true }); },
  };
}
