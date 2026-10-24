// Render markdown sicuro: marked (GFM) + DOMPurify + highlight.js; blocchi ```mermaid -> <pre class="mermaid">.
// Le librerie arrivano da CDN come globali; se mancano si degrada a testo semplice.
const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs';

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

let mermaidPromise;
export async function renderMermaid(root) {
  // solo i blocchi visibili: mermaid in un contenitore nascosto produce SVG rotti (translate(NaN))
  const nodes = [...root.querySelectorAll('pre.mermaid:not([data-processed])')].filter((n) => n.getClientRects().length > 0);
  if (!nodes.length) return 0;
  try {
    mermaidPromise ||= import(MERMAID_URL).then((m) => {
      m.default.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default', fontFamily: 'inherit' });
      return m.default;
    });
    const mermaid = await mermaidPromise;
    await mermaid.run({ nodes, suppressErrors: true });
    // diagrammi molto larghi (es. retta numerica): su schermi stretti si scorrono invece di rimpicciolirsi
    nodes.forEach((n) => {
      const vb = n.querySelector('svg')?.viewBox?.baseVal;
      if (vb && vb.height && vb.width / vb.height > 2.5) n.classList.add('wide');
    });
  } catch (e) {
    nodes.forEach((n) => n.classList.add('mermaid-off'));
    console.warn('mermaid non disponibile:', e.message);
  }
  return nodes.length;
}
