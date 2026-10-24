// Vista del simulatore. Dipendenze (grafo, storage, orologio, confirm) iniettate dal composition root.
import { h, clear } from '../dom.js';
import { copertura, generaProva, FONTE_PUNTEGGI, PUNTI_TOTALI, SOGLIA_SUFFICIENZA } from './genera.js';
import { calcolaPunteggio, leggiPunti, messaggioPunti, nodiDaRipassare, testoEsito } from './punteggio.js';
import { formatTempo, leggiTimer, timerInCorso, timerInPausa } from './timer.js';
import {
  CHIAVE_STORAGE, cancellaSessione, chiudiPerTempo, consegna, creaSessione, leggiRisposta, leggiSessione, salvaSessione, sessioneInCorsoValida, scriviGiudizio, scriviRisposta,
} from './sessione.js';

const hashLezione = (id) => `#/lezione/${encodeURIComponent(id)}`;

export function createSimulatoreView() {
  return {
    id: 'simulatore',
    titolo: 'Simulatore',
    render(root, ctx) {
      const storage = ctx.storage;
      const graph = ctx.graph;
      const now = ctx.now || (() => Date.now());
      const ask = ctx.confirm || ((msg) => root.ownerDocument.defaultView.confirm(msg));
      const win = () => root.ownerDocument.defaultView;
      let timerHandle = null;
      const stopLoop = () => { if (timerHandle != null) { win().clearInterval(timerHandle); timerHandle = null; } };
      const sessioneSalvata = leggiSessione(storage);
      let sessione = sessioneInCorsoValida(sessioneSalvata, now()) ? sessioneSalvata : null;
      let rawSalvata = null;
      try { rawSalvata = storage.getItem(CHIAVE_STORAGE); } catch { /* storage disabilitato */ }
      let provaAvviata = false;
      let saveOk = true;

      const persist = () => { saveOk = salvaSessione(storage, sessione); };
      if (rawSalvata && !sessione) cancellaSessione(storage);
      if (sessione) {
        // La prova salvata si può riprendere, ma il timer resta fermo finché l'utente non lo sceglie.
        sessione = { ...sessione, timer: timerInPausa(sessione.timer, now()) };
        persist();
      }

      const chiudiSeScaduto = () => {
        if (!sessione || sessione.fase !== 'svolgimento') return false;
        if (!leggiTimer(sessione.timer, now()).scaduto) return false;
        sessione = chiudiPerTempo(sessione);
        persist();
        return true;
      };

      const draw = () => {
        stopLoop();
        chiudiSeScaduto();
        clear(root);
        root.className = 'module-page sim';
        if (!sessione || !provaAvviata) root.append(intro());
        else if (sessione.fase === 'correzione') root.append(paginaCorrezione());
        else root.append(paginaSvolgimento());
        const titolo = root.querySelector('h1');
        if (titolo) titolo.focus();
        armLoop();
      };

      const armLoop = () => {
        stopLoop();
        if (!sessione || !provaAvviata || sessione.fase !== 'svolgimento') return;
        if (!leggiTimer(sessione.timer, now()).running) return;
        timerHandle = win().setInterval(() => {
          const el = root.querySelector('#sim-timer');
          const lett = leggiTimer(sessione.timer, now());
          if (el) el.textContent = formatTempo(lett.rimanenti);
          if (lett.scaduto) draw();
        }, 250);
      };

      const notaSalvataggio = () => (saveOk ? null : h('p', { class: 'sim-err sim-save', role: 'status' }, 'Il browser non ha salvato la prova: se ricarichi la pagina le risposte si perdono.'));

      const torna = () => h('a', { class: 'btn', href: '#/' }, '← Grafo');

      const nuovaProva = () => {
        if (sessione && !ask('Abbandonare la prova in corso? Le risposte salvate in questo browser verranno cancellate.')) return;
        cancellaSessione(storage);
        sessione = null;
        draw();
      };

      const inizia = () => {
        if (sessione && !ask('Abbandonare la prova salvata e iniziarne una nuova?')) return;
        cancellaSessione(storage);
        const seed = Math.floor(Math.random() * 0x7fffffff);
        const prova = generaProva(graph.nodi, { seed, now: now() });
        sessione = creaSessione(prova, now());
        provaAvviata = true;
        persist();
        draw();
      };

      const riprendi = () => {
        if (!sessione || !sessioneInCorsoValida(sessione, now())) {
          sessione = null;
          cancellaSessione(storage);
          draw();
          return;
        }
        sessione = { ...sessione, timer: timerInCorso(sessione.timer, now()) };
        provaAvviata = true;
        persist();
        draw();
      };

      function intro() {
        const buchi = copertura(graph.nodi).filter((r) => r.quanti === 0);
        return h('div', {},
          h('header', { class: 'mod-top' }, torna(), h('h1', { id: 'sim-titolo', tabindex: '-1' }, "Simulatore d'esame")),
          h('p', { class: 'sim-lead' }, `Scritto, 2 ore, ${PUNTI_TOTALI} punti. Sufficienza oltre ${SOGLIA_SUFFICIENZA}/30. Struttura e punteggi: ${FONTE_PUNTEGGI}.`),
          h('ul', { class: 'sim-parti' },
            h('li', {}, 'Parte 1 — Design, 16 punti, circa 60 minuti: diagramma delle classi, sequenza, attività, stati, casi d\'uso e un design pattern.'),
            h('li', {}, 'Parte 2 — Testing black box, 3 punti, circa 10 minuti: classi di equivalenza e valori limite.'),
            h('li', {}, 'Parte 3 — Domande, 11 punti, circa 30 minuti: debugging, Simple Factory, white box e coperture.')),
          h('p', {}, 'I testi sono esercizi del grafo (campo esercizi), con la soluzione già scritta nel nodo. Se una voce non ha esercizi, la prova lo dice e non inventa il testo. I punti sono quelli della prova 2025: in correzione ti autovaluti solo su ciò che l\'esercizio chiede.'),
          h('p', {}, 'Il tempo parte quando inizi. In pausa si ferma; altrimenti scorre anche se chiudi la pagina. Le risposte restano in questo browser.'),
          graph.nota_esame ? h('details', { class: 'note' }, h('summary', {}, 'Nota del grafo sulle prove'), h('p', {}, graph.nota_esame)) : null,
          buchi.length ? h('div', { class: 'sim-gap', role: 'status' },
            h('p', {}, 'Con i dati attuali del grafo queste voci resterebbero scoperte:'),
            h('ul', {}, buchi.map((b) => h('li', {}, b.titolo)))) : null,
          notaSalvataggio(),
          h('p', { class: 'sim-actions' },
            sessione ? h('button', { type: 'button', class: 'btn primary', id: 'sim-riprendi', onclick: riprendi }, 'Riprendi la prova') : null,
            h('button', { type: 'button', class: sessione ? 'btn' : 'btn primary', id: 'sim-inizia', onclick: inizia }, sessione ? 'Inizia una nuova prova' : 'Inizia la prova')));
      }

      function barraTempo() {
        const lett = leggiTimer(sessione.timer, now());
        const toggle = () => {
          if (leggiTimer(sessione.timer, now()).scaduto) return;
          const t = now();
          sessione = { ...sessione, timer: lett.running ? timerInPausa(sessione.timer, t) : timerInCorso(sessione.timer, t) };
          persist();
          draw();
        };
        const invia = () => {
          if (!ask('Consegnare la prova e aprire la correzione? Il tempo si ferma.')) return;
          sessione = consegna(sessione, now());
          persist();
          draw();
        };
        return h('div', { class: 'sim-timer' },
          h('div', {},
            h('p', { class: 'muted', id: 'sim-timer-note' }, lett.running ? 'Tempo rimasto. Scorre anche se chiudi la pagina.' : 'In pausa: il tempo è fermo.'),
            h('p', { class: 'sim-clock', id: 'sim-timer', role: 'timer' }, formatTempo(lett.rimanenti))),
          h('div', { class: 'sim-timer-actions' },
            h('button', { type: 'button', class: 'btn', id: 'sim-pause', onclick: toggle }, lett.running ? 'Pausa' : 'Riprendi'),
            h('button', { type: 'button', class: 'btn primary', id: 'sim-consegna', onclick: invia }, 'Consegna e correggi')));
      }

      function campoRisposta(q, c, i) {
        const label = q.consegne.length > 1 ? `La tua risposta — ${c.etichetta}` : 'La tua risposta';
        return h('label', {}, label,
          h('textarea', {
            class: 'sim-input',
            'data-q': q.id,
            'data-i': String(i),
            spellcheck: 'true',
            oninput: (e) => {
              sessione = scriviRisposta(sessione, q.id, i, e.target.value, q.consegne.length);
              persist();
              const warn = root.querySelector('.sim-save');
              if (!saveOk && !warn) root.querySelector('.sim-timer')?.after(notaSalvataggio());
            },
          }, leggiRisposta(sessione, q.id, i)));
      }

      function blocchiQuesito(q, correzione) {
        return q.consegne.map((c, i) => h('div', { class: 'sim-consegna' },
          q.consegne.length > 1 ? h('h4', {}, c.etichetta) : null,
          h('p', { class: 'muted' }, c.tipoEsame || 'Esercizio del grafo'),
          h('div', { class: 'sim-testo' }, c.testo),
          correzione
            ? h('div', { class: 'sim-confronto' },
              h('div', { class: 'sim-box sim-tua' }, h('h4', {}, 'La tua risposta'), h('div', { class: 'sim-prosa' }, leggiRisposta(sessione, q.id, i).trim() ? leggiRisposta(sessione, q.id, i) : 'Nessuna risposta.')),
              h('div', { class: 'sim-box sim-soluzione' }, h('h4', {}, 'Soluzione del grafo'), h('div', { class: 'sim-prosa sim-soluzione-testo' }, c.soluzione)))
            : campoRisposta(q, c, i),
          correzione ? h('p', {}, 'Ripassa il nodo: ', h('a', { href: hashLezione(c.nodoId) }, c.nodoTitolo)) : null));
      }

      function paginaSvolgimento() {
        const prova = sessione.prova;
        return h('div', {},
          h('header', { class: 'mod-top' },
            torna(),
            h('h1', { id: 'sim-titolo', tabindex: '-1' }, "Simulatore d'esame"),
            h('button', { type: 'button', class: 'btn', id: 'sim-nuova', onclick: nuovaProva }, 'Nuova prova')),
          h('p', { class: 'muted' }, `Punteggi di ${prova.fontePunteggi}. Massimo ${prova.puntiTotali} se tutte le voci hanno un esercizio nel grafo.`),
          notaSalvataggio(),
          barraTempo(),
          ...prova.parti.map((parte) => h('section', { class: 'sim-parte', 'data-parte': parte.id },
            h('h2', {}, parte.titolo),
            h('p', { class: 'muted' }, `${parte.punti} punti nella ${prova.fontePunteggi} · circa ${parte.minuti} minuti`),
            ...parte.mancanti.map((m) => h('p', { class: 'sim-gap', role: 'status' }, m.messaggio)),
            ...parte.quesiti.map((q) => h('article', { class: 'sim-q', 'data-q': q.id },
              h('h3', {}, q.titolo, q.puntiMax != null ? h('span', { class: 'sim-pt' }, ` · ${q.puntiMax} punti`) : h('span', { class: 'sim-pt' }, ' · senza punteggio ufficiale')),
              q.motivo ? h('p', { class: 'sim-gap' }, q.motivo) : null,
              ...blocchiQuesito(q, false))))));
      }

      function riepilogo() {
        const risultato = calcolaPunteggio(sessione.prova, sessione.giudizi);
        const nodi = nodiDaRipassare(risultato);
        return h('div', { class: 'sim-riepilogo', id: 'sim-riepilogo' },
          ...testoEsito(risultato, sessione.prova).map((r) => h('p', {}, r)),
          h('ul', { class: 'sim-ripasso' }, risultato.parti.map((p) => h('li', {},
            `${p.titolo}: ${p.ottenuti}/${p.maxValutabile}`,
            p.mancanti.length ? ` · senza esercizi: ${p.mancanti.map((m) => m.titolo).join(', ')}` : ''))),
          nodi.length
            ? h('div', {}, h('p', {}, 'Da ripassare, dove non hai il massimo:'),
              h('ul', { class: 'sim-ripasso', id: 'sim-da-ripassare' }, nodi.map((n) => h('li', {}, h('a', { href: hashLezione(n.nodoId) }, n.nodoTitolo), ` (${n.voci.join('; ')})`))))
            : h('p', { id: 'sim-da-ripassare' }, risultato.totale.senzaGiudizio ? 'I nodi da ripassare compaiono quando assegni un punteggio inferiore al massimo.' : 'Nessun nodo da ripassare sulle voci che hai valutato.'));
      }

      function onPunti(q, input) {
        const letto = leggiPunti(input.value, q.puntiMax);
        const err = input.closest('.sim-voto').querySelector('.sim-err');
        if (input.value.trim() === '') {
          sessione = scriviGiudizio(sessione, q.id, null);
          err.textContent = '';
        } else if (!letto.ok) {
          sessione = scriviGiudizio(sessione, q.id, null);
          err.textContent = messaggioPunti(letto.motivo, q.puntiMax);
        } else {
          sessione = scriviGiudizio(sessione, q.id, letto.punti);
          err.textContent = '';
        }
        persist();
        const box = root.querySelector('#sim-riepilogo');
        if (box) box.replaceWith(riepilogo());
      }

      function paginaCorrezione() {
        const prova = sessione.prova;
        const lett = leggiTimer(sessione.timer, now());
        return h('div', {},
          h('header', { class: 'mod-top' },
            torna(),
            h('h1', { id: 'sim-titolo', tabindex: '-1' }, 'Correzione guidata'),
            h('button', { type: 'button', class: 'btn', id: 'sim-nuova', onclick: nuovaProva }, 'Nuova prova')),
          h('p', { class: 'muted' }, `Tempo usato: ${formatTempo(lett.trascorsoMs)}. Confronta la tua risposta con la soluzione del grafo e assegna i punti.`),
          notaSalvataggio(),
          riepilogo(),
          ...prova.parti.map((parte) => h('section', { class: 'sim-parte', 'data-parte': parte.id },
            h('h2', {}, parte.titolo),
            ...parte.mancanti.map((m) => h('p', { class: 'sim-gap', role: 'status' }, m.messaggio)),
            ...parte.quesiti.map((q) => h('article', { class: 'sim-q', 'data-q': q.id },
              h('h3', {}, q.titolo, q.puntiMax != null ? h('span', { class: 'sim-pt' }, ` · massimo ${q.puntiMax} punti`) : null),
              q.motivo ? h('p', { class: 'sim-gap' }, q.motivo) : null,
              ...blocchiQuesito(q, true),
              q.puntiMax != null ? h('div', { class: 'sim-voto' },
                h('label', {}, `Punti (0–${q.puntiMax}) `,
                  h('input', {
                    type: 'number', class: 'sim-punti', min: '0', max: String(q.puntiMax), step: '1', inputmode: 'numeric',
                    'data-q': q.id,
                    value: sessione.giudizi[q.id] == null ? '' : String(sessione.giudizi[q.id]),
                    oninput: (e) => onPunti(q, e.target),
                  })),
                h('p', { class: 'sim-err', role: 'status' })) : null)))));
      }

      draw();
      return stopLoop;
    },
  };
}
