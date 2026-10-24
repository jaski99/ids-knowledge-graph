// Indice della lezione e avanzamento di sezione. La geometria arriva già misurata, così i test non servono il DOM.

export const SECTION_LABELS = {
  intuizione: 'Perché esiste',
  analogia: 'Analogia',
  prior: 'Collegamenti',
  spiegazione: 'Spiegazione',
  esempi: 'Esempi svolti',
  errori: 'Errori comuni',
  autoverifica: 'Autoverifica',
  riepilogo: 'Riepilogo',
  esercizi: "Esercizi d'esame",
  prereq: 'Prerequisiti',
  approfondimento: 'Approfondimento',
};

export function sectionLabel(id) {
  const key = String(id || '').replace(/^sec-/, '');
  return SECTION_LABELS[key] || key;
}

/** Ultima sezione il cui inizio è sopra la linea di lettura. */
export function pickActive(sections, scrollY, offset = 96) {
  let current = sections[0]?.id ?? null;
  for (const section of sections) {
    if (section.top <= scrollY + offset) current = section.id;
  }
  return current;
}

export function sectionMeter(ids, activeId) {
  const total = ids.length || 1;
  const found = ids.indexOf(activeId);
  const index = found < 0 ? 0 : found;
  return { index, total, ratio: total <= 1 ? 1 : index / (total - 1) };
}

/**
 * @param {HTMLElement} nav
 * @param {{ label: HTMLElement, bar: HTMLElement, fill: HTMLElement }} progress
 * @param {HTMLElement} article
 */
export function bindSectionNav(nav, progress, article, win = article.ownerDocument.defaultView) {
  const sections = [...article.querySelectorAll('section.ls[id]')].map((el) => ({
    id: el.id,
    label: sectionLabel(el.id),
    el,
  }));
  const doc = nav.ownerDocument;
  nav.replaceChildren();
  const buttons = sections.map((section) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'toc-link';
    button.textContent = section.label;
    button.addEventListener('click', () => {
      const reduce = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      section.el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    nav.append(button);
    return button;
  });
  const update = () => {
    if (!article.isConnected) return;
    const markers = sections.map((section) => ({
      id: section.id,
      top: section.el.getBoundingClientRect().top + win.scrollY,
    }));
    const active = pickActive(markers, win.scrollY, 120);
    const meter = sectionMeter(sections.map((section) => section.id), active);
    const current = sections[meter.index];
    buttons.forEach((button, i) => {
      const on = sections[i].id === active;
      button.setAttribute('aria-current', on ? 'true' : 'false');
    });
    progress.label.textContent = current ? `${meter.index + 1} di ${meter.total} · ${current.label}` : '';
    progress.bar.setAttribute('aria-valuemin', '1');
    progress.bar.setAttribute('aria-valuemax', String(Math.max(meter.total, 1)));
    progress.bar.setAttribute('aria-valuenow', String(meter.index + 1));
    progress.bar.setAttribute('aria-valuetext', current ? current.label : '');
    progress.fill.style.width = `${Math.round(meter.ratio * 100)}%`;
  };
  win.addEventListener('scroll', update, { passive: true });
  update();
  return () => win.removeEventListener('scroll', update);
}
