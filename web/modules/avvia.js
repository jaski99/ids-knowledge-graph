// Composition root dei moduli. Registra le viste e le mostra sugli hash #/<id>.
import { register, getAll } from './registry.js';
import { h } from './dom.js';
import { createSimulatoreView } from './simulatore/view.js';
import { createRipassoView } from './ripasso/view.js';

export function idDaHash(hash) {
  if (typeof hash !== 'string') return null;
  const match = /^#\/([a-z0-9-]+)$/.exec(hash);
  return match ? match[1] : null;
}

function ensureCss(doc, href) {
  const selector = `link[data-moduli="${href}"]`;
  if (doc.querySelector(selector)) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.moduli = href;
  doc.head.append(link);
}

export function avviaModuli(ctx) {
  const doc = ctx.document;
  register(createSimulatoreView());
  register(createRipassoView());
  ensureCss(doc, 'modules/chrome.css');
  ensureCss(doc, 'modules/simulatore/style.css');
  const root = doc.getElementById('module-root');
  const header = h('header', { class: 'module-common-header' },
    h('a', { class: 'module-home', href: '#/', 'aria-label': 'Torna alla home' }, 'Knowledge graph'),
    h('button', {
      type: 'button', class: 'btn', 'data-theme-toggle': '1',
      onclick: () => ctx.toggleTheme?.(),
    }, 'Tema scuro'));
  const nav = h('nav', { class: 'module-nav', 'aria-label': 'Viste e strumenti' },
    h('a', { class: 'module-link', href: '#/' }, 'Home'),
    ...getAll().map((view) => h('a', { class: 'module-link', href: `#/${view.id}` }, view.titolo)));
  const content = h('div', { class: 'module-content' });
  root.replaceChildren(header, nav, content);
  let current = null;
  let destroy = () => {};
  return {
    mostra(hash) {
      const id = idDaHash(hash);
      const view = id ? getAll().find((entry) => entry.id === id) : null;
      if (!view) {
        if (current) {
          destroy(); destroy = () => {}; current = null;
          content.replaceChildren(); root.hidden = true;
        }
        return false;
      }
      root.hidden = false;
      if (current === id) return true;
      destroy();
      current = id;
      content.replaceChildren();
      const teardown = view.render(content, {
        graph: ctx.graph,
        storage: ctx.storage,
        document: doc,
        now: ctx.now,
        confirm: ctx.confirm,
      });
      destroy = typeof teardown === 'function' ? teardown : () => {};
      return true;
    },
  };
}
