import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const files = ['modules/chrome.css', 'modules/simulatore/style.css', 'modules/ripasso/style.css'];

test('i CSS dei moduli non introducono colori fissi: usano i token del tema', async () => {
  for (const file of files) {
    const css = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(css, /#[\da-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/i, `${file}: trovato un colore codificato`);
    const declarations = [...css.matchAll(/(?:^|[;{])\s*(color|background(?:-color)?|border(?:-color)?):\s*([^;}]+)/g)];
    for (const [, property, value] of declarations) {
      assert.match(value, /var\(--/, `${file}: ${property}: ${value.trim()} non usa token CSS`);
    }
  }
});
