// Render markdown sicuro: marked (GFM) + DOMPurify + highlight.js; blocchi ```mermaid -> <pre class="mermaid">.
// Le librerie sono distribuite con la build; se mancano si degrada a testo semplice.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let configured = false;
function setup(w) {
  if (configured || !w.marked) return;
  w.marked.use({
    gfm: true,
    renderer: {
      // compatibile con marked v12 (code, lang) e v13+ (token)
      code(a, b) {
        const text = typeof a === 'object' ? a.text : a;
        const lang = ((typeof a === 'object' ? a.lang : b) || '').trim().split(/\s+/)[0];
        if (lang === 'mermaid') return `<pre class="mermaid">${esc(text)}</pre>`;
        let body = esc(text);
        if (w.hljs && lang && w.hljs.getLanguage(lang)) body = w.hljs.highlight(text, { language: lang }).value;
        return `<pre class="code"><code class="hljs language-${esc(lang || 'text')}">${body}</code></pre>`;
      },
    },
  });
  configured = true;
}

export function markdownToHtml(md, w = window) {
  setup(w);
  if (!w.marked || !w.DOMPurify) return `<pre class="plain">${esc(md)}</pre>`;
  return w.DOMPurify.sanitize(w.marked.parse(String(md)));
}

export function inlineToHtml(md, w = window) {
  setup(w);
  if (!w.marked || !w.DOMPurify) return esc(md);
  return w.DOMPurify.sanitize(w.marked.parseInline(String(md)));
}

/** Elemento <div> con il markdown renderizzato; tabelle avvolte per lo scroll orizzontale su mobile. */
export function mdElement(md, { inline = false, tag = 'div', className = 'md' } = {}) {
  const el = document.createElement(tag);
  el.className = className;
  el.innerHTML = inline ? inlineToHtml(md) : markdownToHtml(md); // sanitizzato da DOMPurify
  el.querySelectorAll('table').forEach((t) => {
    const wrap = document.createElement('div');
    wrap.className = 'table-wrap';
    t.replaceWith(wrap); wrap.append(t);
  });
  return el;
}

let mermaidApi;
let mermaidTheme = 'default';

export function setMermaidTheme(uiTheme) {
  mermaidTheme = uiTheme === 'dark' ? 'dark' : 'default';
  mermaidApi?.initialize?.({ startOnLoad: false, securityLevel: 'strict', theme: mermaidTheme, fontFamily: 'inherit' });
}

export function rememberMermaidSource(root) {
  root?.querySelectorAll?.('pre.mermaid').forEach((node) => {
    if (!node.dataset.src && !node.querySelector('svg')) node.dataset.src = node.textContent;
  });
}

/** Ripristina il sorgente così un cambio tema può ridisegnare il diagramma. */
export function resetMermaid(root) {
  root?.querySelectorAll?.('pre.mermaid').forEach((node) => {
    if (node.dataset.src == null) return;
    node.removeAttribute('data-processed');
    node.textContent = node.dataset.src;
    node.classList.remove('mermaid-off', 'wide');
  });
}

export async function renderMermaid(root) {
  rememberMermaidSource(root);
  // solo i blocchi visibili: mermaid in un contenitore nascosto produce SVG rotti (translate(NaN))
  const nodes = [...root.querySelectorAll('pre.mermaid:not([data-processed])')].filter((n) => n.getClientRects().length > 0 && !n.querySelector('svg'));
  if (!nodes.length) return 0;
  try {
    const mermaid = globalThis.mermaid;
    if (!mermaid) throw new Error('libreria locale mancante: esegui web/build.sh');
    mermaidApi = mermaid;
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: mermaidTheme, fontFamily: 'inherit' });
    await mermaid.run({ nodes, suppressErrors: true });
  } catch (e) {
    nodes.forEach((n) => n.classList.add('mermaid-off'));
    console.warn('mermaid non disponibile:', e.message);
  }
  return nodes.length;
}
