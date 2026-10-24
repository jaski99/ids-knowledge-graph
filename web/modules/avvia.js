// Composition root dei moduli. Registra le viste e le mostra sugli hash #/<id>.
import { register, getAll } from './registry.js';
import { h } from './dom.js';
import { createSimulatoreView } from './simulatore/view.js';

export function idDaHash(hash) {
  if (typeof hash !== 'string') return null;
  const m = /^#\/([a-z0-9-]+)$/.exec(hash);
  return m ? m[1] : null;
}

function ensureCss(doc, href) {
  const sel = `link[data-moduli="${href}"]`;
  if (doc.querySelector(sel)) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.moduli = href;
  doc.head.append(link);
}

export function avviaModuli(ctx) {
  const doc = ctx.document;
  register(createSimulatoreView());
  ensureCss(doc, 'modules/chrome.css');
  ensureCss(doc, 'modules/simulatore/style.css');
  const nav = doc.getElementById('module-nav');
  const root = doc.getElementById('module-root');
  const paintNav = () => {
    if (!nav) return;
    nav.replaceChildren(...getAll().map((v) => h('a', { class: 'module-link', href: `#/${v.id}` }, v.titolo)));
  };
  paintNav();
  let current = null;
  let destroy = () => {};
  return {
    mostra(hash) {
      if (!root) return false;
      const id = idDaHash(hash);
      const view = id ? getAll().find((v) => v.id === id) : null;
      if (!view) {
        if (current) { destroy(); destroy = () => {}; current = null; root.hidden = true; root.replaceChildren(); }
        return false;
      }
      if (current === id) return true;
      destroy();
      current = id;
      root.hidden = false;
      const off = view.render(root, {
        graph: ctx.graph,
        storage: ctx.storage,
        document: doc,
        now: ctx.now,
        confirm: ctx.confirm,
      });
      destroy = typeof off === 'function' ? off : () => {};
      return true;
    },
  };
}
