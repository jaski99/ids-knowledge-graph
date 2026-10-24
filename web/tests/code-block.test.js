import { test } from 'node:test';
import assert from 'node:assert/strict';
import { languageFromClass, labelFromLanguage, copyText } from '../js/ui/code-block.js';

test('riconosce il linguaggio dal class del code evidenziato', () => {
  assert.equal(languageFromClass('hljs language-java'), 'java');
  assert.equal(languageFromClass('language-Bash extra'), 'bash');
  assert.equal(languageFromClass('hljs'), '');
  assert.equal(labelFromLanguage('java'), 'Java');
  assert.equal(labelFromLanguage(''), 'Codice');
  assert.equal(labelFromLanguage('kotlin'), 'kotlin');
});

test('copyText scrive sul clipboard iniettato e rifiuta un clipboard assente', async () => {
  let saved = null;
  const ok = await copyText('class A {}', { writeText: async (t) => { saved = t; } });
  assert.equal(ok, true);
  assert.equal(saved, 'class A {}');
  assert.equal(await copyText('x', null), false);
  assert.equal(await copyText('x', {}), false);
  await assert.rejects(copyText('x', { writeText: async () => { throw new Error('negato'); } }), /negato/);
});
