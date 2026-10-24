// Cornice dei diagrammi mermaid: zoom interno, mai più largo della pagina finché non si ingrandisce.

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 1.25;

export function clampZoom(value, min = ZOOM_MIN, max = ZOOM_MAX) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(max, Math.max(min, n));
}

export function stepZoom(current, direction) {
  const factor = direction === 'in' ? ZOOM_STEP : 1 / ZOOM_STEP;
  return clampZoom((Number(current) || 1) * factor);
}

export function mermaidThemeName(uiTheme) {
  return uiTheme === 'dark' ? 'dark' : 'default';
}

function paint(fig, scale, fit) {
  const next = fit ? 1 : clampZoom(scale);
  fig.dataset.scale = String(next);
  const svg = fig.querySelector('svg');
  if (!svg) return next;
  const natural = svg.viewBox?.baseVal?.width || 0;
  if (next <= 1 || !natural) {
    svg.style.maxWidth = '100%';
    svg.style.width = '100%';
  } else {
    svg.style.maxWidth = 'none';
    svg.style.width = `${Math.round(natural * next)}px`;
  }
  svg.style.height = 'auto';
  return next;
}

/** Avvolge i pre.mermaid visibili nel DOM (anche se il genitore è nascosto). Idempotente. */
export function frameDiagrams(root) {
  if (!root?.querySelectorAll) return 0;
  const doc = root.ownerDocument;
  let count = 0;
  for (const pre of [...root.querySelectorAll('pre.mermaid')]) {
    if (pre.closest('.diagram')) continue;
    const fig = doc.createElement('figure');
    fig.className = 'diagram';
    fig.dataset.scale = '1';
    const bar = doc.createElement('div');
    bar.className = 'diagram-bar';
    const label = doc.createElement('span');
    label.textContent = 'Diagramma';
    const scroll = doc.createElement('div');
    scroll.className = 'diagram-scroll';
    const button = (text, aria, dir) => {
      const el = doc.createElement('button');
      el.type = 'button';
      el.className = 'btn diagram-zoom';
      el.textContent = text;
      el.setAttribute('aria-label', aria);
      el.addEventListener('click', () => {
        const current = Number(fig.dataset.scale) || 1;
        paint(fig, dir === 'fit' ? 1 : stepZoom(current, dir), dir === 'fit');
      });
      return el;
    };
    bar.append(
      label,
      button('−', 'Riduci il diagramma', 'out'),
      button('+', 'Ingrandisci il diagramma', 'in'),
      button('Adatta', 'Adatta il diagramma allo schermo', 'fit'),
    );
    pre.replaceWith(fig);
    fig.append(bar, scroll);
    scroll.append(pre);
    count += 1;
  }
  return count;
}

export function fitDiagrams(root) {
  root?.querySelectorAll?.('figure.diagram').forEach((fig) => paint(fig, 1, true));
}
