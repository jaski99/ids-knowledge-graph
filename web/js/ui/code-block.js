// Barra lingua + copia sui blocchi ``` generati dal markdown. Non altera il <code> evidenziato.

const LABELS = {
  java: 'Java', javascript: 'JavaScript', js: 'JavaScript',
  bash: 'Bash', sh: 'Shell', shell: 'Shell',
  json: 'JSON', text: 'Testo', plaintext: 'Testo',
  xml: 'XML', html: 'HTML', css: 'CSS', sql: 'SQL',
  python: 'Python', py: 'Python',
};

export function languageFromClass(className) {
  const match = String(className || '').match(/language-([a-z0-9_+-]+)/i);
  return match ? match[1].toLowerCase() : '';
}

export function labelFromLanguage(lang) {
  const key = String(lang || '').toLowerCase();
  if (!key) return 'Codice';
  return LABELS[key] || key;
}

export async function copyText(text, clipboard) {
  if (!clipboard || typeof clipboard.writeText !== 'function') return false;
  await clipboard.writeText(String(text));
  return true;
}

function fallbackCopy(doc, text) {
  try {
    const area = doc.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    doc.body.append(area);
    area.select();
    const ok = doc.execCommand('copy');
    area.remove();
    return Boolean(ok);
  } catch {
    return false;
  }
}

/** Avvolge ogni pre.code non ancora trattato. Ritorna quanti blocchi ha aggiornato. */
export function enhanceCodeBlocks(root, { clipboard } = {}) {
  if (!root?.querySelectorAll) return 0;
  const doc = root.ownerDocument;
  const board = clipboard || doc.defaultView?.navigator?.clipboard;
  let count = 0;
  for (const pre of root.querySelectorAll('pre.code')) {
    if (pre.closest('.codeblock')) continue;
    const code = pre.querySelector('code');
    const label = labelFromLanguage(languageFromClass(code?.className || ''));
    const wrap = doc.createElement('div');
    wrap.className = 'codeblock';
    const bar = doc.createElement('div');
    bar.className = 'codeblock-bar';
    const name = doc.createElement('span');
    name.className = 'codeblock-lang';
    name.textContent = label;
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'btn code-copy';
    btn.textContent = 'Copia';
    btn.setAttribute('aria-label', `Copia il codice ${label}`);
    const status = doc.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('aria-live', 'polite');
    let timer = 0;
    btn.addEventListener('click', async () => {
      const text = code ? code.textContent : pre.textContent;
      let ok = false;
      try { ok = await copyText(text, board); } catch { ok = false; }
      if (!ok) ok = fallbackCopy(doc, text);
      btn.textContent = ok ? 'Copiato' : 'Non copiato';
      status.textContent = ok ? 'Codice copiato negli appunti' : 'Copia non riuscita';
      doc.defaultView?.clearTimeout(timer);
      timer = doc.defaultView?.setTimeout(() => { btn.textContent = 'Copia'; }, 1600);
    });
    bar.append(name, btn, status);
    pre.replaceWith(wrap);
    wrap.append(bar, pre);
    count += 1;
  }
  return count;
}
