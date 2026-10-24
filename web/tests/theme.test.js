import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AREA_COLORS } from '../js/config.js';
import {
  resolveTheme, toggleTheme, themeLabel, createThemeController, contrastRatio, THEME_STORAGE_KEY,
} from '../js/core/theme.js';

const memory = (initial = {}) => {
  const m = new Map(Object.entries(initial));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), dump: m };
};

test('resolveTheme preferisce la scelta salvata, altrimenti il sistema', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme('auto', false), 'light');
  assert.equal(toggleTheme('dark'), 'light');
  assert.equal(themeLabel('light'), 'Tema scuro');
});

test('il controller applica, persiste solo dopo una scelta e segue il sistema finché non si sceglie', () => {
  const storage = memory();
  const listeners = new Set();
  const media = { addEventListener: (type, fn) => listeners.add(fn) };
  const seen = [];
  const theme = createThemeController({
    storage, prefersDark: true, media, apply: (name) => seen.push(name),
  });
  assert.equal(theme.get(), 'dark');
  assert.equal(storage.dump.has(THEME_STORAGE_KEY), false);
  theme.toggle();
  assert.equal(theme.get(), 'light');
  assert.equal(storage.getItem(THEME_STORAGE_KEY), 'light');
  for (const fn of listeners) fn({ matches: true });
  assert.equal(theme.get(), 'light');
  const fresh = memory();
  const follow = [];
  const media2 = { addEventListener: (_t, fn) => { media2.fn = fn; } };
  createThemeController({ storage: fresh, prefersDark: false, media: media2, apply: (n) => follow.push(n) });
  media2.fn({ matches: true });
  assert.deepEqual(follow, ['light', 'dark']);
  theme.set('nope');
  assert.equal(theme.get(), 'light');
});

function cssVars(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = css.match(new RegExp(escaped + '\\s*\\{([^}]+)\\}'))[1];
  const out = {};
  for (const m of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+)/g)) out[m[1]] = m[2].trim();
  return out;
}

test('token di colore e aree superano il contrasto AA', () => {
  const css = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
  const light = cssVars(css, ':root');
  const dark = cssVars(css, 'html[data-theme="dark"]');
  const pairs = [
    ['--fg', '--bg'], ['--muted', '--bg'], ['--muted', '--card'], ['--fg', '--card'],
    ['--acc', '--bg'], ['--acc', '--card'], ['--note-fg', '--note-bg'],
    ['--ok-fg', '--ok-bg'], ['--warn-fg', '--warn-bg'], ['--danger-fg', '--danger-bg'],
    ['--chip-fg', '--chip-bg'], ['--code-fg', '--code-bg'], ['--btn-fg', '--btn-bg'],
    ['--prio-alta-fg', '--prio-alta-bg'], ['--prio-media-fg', '--prio-media-bg'], ['--prio-bassa-fg', '--prio-bassa-bg'],
  ];
  for (const palette of [light, dark]) {
    for (const [fg, bg] of pairs) {
      const ratio = contrastRatio(palette[fg], palette[bg]);
      assert.ok(ratio >= 4.5, `${fg} su ${bg} = ${ratio.toFixed(2)}`);
    }
  }
  for (const color of AREA_COLORS) assert.ok(contrastRatio('#ffffff', color) >= 4.5, color);
});
