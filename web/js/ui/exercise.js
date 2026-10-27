// La soluzione non viene nemmeno inserita nel DOM prima di un tentativo scritto.
import { h } from './dom.js';
import { mdElement } from './markdown.js';

export function createExercise(nodo, esercizio, indice, attemptStore) {
  const precedente = attemptStore?.latest(nodo.id, indice);
  const risposta = h('textarea', {
    rows: 3, maxlength: 10000, 'aria-label': `Il tuo tentativo: ${esercizio.tipo_esame || 'esercizio'}`,
    placeholder: 'Scrivi qui il tuo tentativo…',
  }, precedente?.risposta || '');
  const note = h('p', { class: 'muted', role: 'status' });
  const confronto = h('button', { type: 'button', class: 'btn primary', disabled: !risposta.value.trim() }, 'Confronta con la soluzione');
  const zona = h('div', { class: 'exercise-solution' });
  const articolo = h('article', { class: 'ex exercise', 'data-exercise': String(indice) },
    h('p', { class: 'muted' }, esercizio.tipo_esame),
    mdElement(esercizio.testo),
    h('label', {}, h('span', {}, 'Il tuo tentativo'), risposta),
    h('p', {}, confronto), note, zona);
  risposta.addEventListener('input', () => { confronto.disabled = !risposta.value.trim(); });
  confronto.addEventListener('click', () => {
    if (!risposta.value.trim()) return;
    const salvato = attemptStore?.record(nodo.id, indice, risposta.value);
    note.textContent = salvato ? 'Tentativo salvato in questo browser.' : 'Tentativo non salvato: il browser potrebbe bloccare la memoria locale.';
    zona.replaceChildren(
      h('h4', {}, 'Soluzione'), mdElement(esercizio.soluzione, { className: 'md sol' }),
      h('p', {}, 'Autovaluta il tentativo: nessuna correzione automatica.'),
      h('div', { class: 'exercise-assessment', role: 'group', 'aria-label': 'Autovalutazione del tentativo' },
        ...[['da-rivedere', 'Da rivedere'], ['corretto', 'Risolto']].map(([value, label]) => h('button', {
          type: 'button', class: 'btn', 'data-assessment': value,
          onclick: () => {
            const ok = attemptStore?.assess(nodo.id, indice, value);
            note.textContent = ok ? `Autovalutazione salvata: ${label.toLowerCase()}.` : 'Autovalutazione non salvata.';
            zona.querySelectorAll('[data-assessment]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.assessment === value)));
          }, 'aria-pressed': 'false',
        }, label))));
    zona.querySelector('h4')?.setAttribute('tabindex', '-1');
    zona.querySelector('h4')?.focus();
    confronto.disabled = true;
  });
  return articolo;
}
