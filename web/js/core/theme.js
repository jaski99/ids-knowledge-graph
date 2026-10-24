// Tema chiaro/scuro. Lo storage e l'applicazione sul documento sono iniettati.
export const THEME_STORAGE_KEY = 'ids-kg:tema:v1';

export function resolveTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function toggleTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

export function themeLabel(theme) {
  return theme === 'dark' ? 'Tema chiaro' : 'Tema scuro';
}

export function themeAriaLabel(theme) {
  return theme === 'dark' ? 'Attiva il tema chiaro' : 'Attiva il tema scuro';
}

/** Aggiorna tutti i pulsanti [data-theme-toggle] presenti nel documento. */
export function syncThemeButtons(doc, theme) {
  for (const btn of doc.querySelectorAll('[data-theme-toggle]')) {
    btn.textContent = themeLabel(theme);
    btn.setAttribute('aria-label', themeAriaLabel(theme));
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
}

function read(storage, key) {
  try { return storage.getItem(key); } catch { return null; }
}

/**
 * @param {{ storage: Storage, key?: string, prefersDark?: boolean, media?: { addEventListener?: Function }, apply: (theme: string) => void }} deps
 */
export function createThemeController({ storage, key = THEME_STORAGE_KEY, prefersDark = false, media, apply }) {
  let theme = resolveTheme(read(storage, key), prefersDark);
  const listeners = new Set();
  const emit = () => {
    apply(theme);
    for (const fn of listeners) fn(theme);
  };
  const storedChoice = () => {
    const v = read(storage, key);
    return v === 'light' || v === 'dark';
  };
  media?.addEventListener?.('change', (e) => {
    if (storedChoice()) return;
    theme = e.matches ? 'dark' : 'light';
    emit();
  });
  emit();
  return {
    get: () => theme,
    set(next) {
      if (next !== 'light' && next !== 'dark') return;
      theme = next;
      try { storage.setItem(key, theme); } catch { /* quota o privacy mode */ }
      emit();
    },
    toggle() { this.set(toggleTheme(theme)); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}

/** Rapporto di contrasto WCAG fra due colori #rrggbb. */
export function contrastRatio(hexA, hexB) {
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const lum = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    const r = lin(((n >> 16) & 255) / 255);
    const g = lin(((n >> 8) & 255) / 255);
    const b = lin((n & 255) / 255);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const L1 = lum(hexA);
  const L2 = lum(hexB);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
