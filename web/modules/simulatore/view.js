// Vista del simulatore. Dipendenze (grafo, storage, orologio, confirm) iniettate dal composition root.
import { h, clear } from '../dom.js';
import { copertura, generaProva } from './genera.js';
import { leggiPunti, messaggioPunti } from './punteggio.js';
import { DURATE_CONSENTITE_MINUTI, PROFILI, getProfilo, testoMinutiParte, testoPuntiParte } from './profili.js';
import { generaReport, vociRubrica } from './report.js';
import { registraEsito } from './esiti.js';
import { formatTempo, leggiTimer, timerInCorso, timerInPausa } from './timer.js';
import {
  CHIAVE_STORAGE, cancellaSessione, chiudiPerTempo, consegna, creaSessione, leggiRisposta, leggiSessione, salvaSessione, sessioneValida, scriviGiudizio, scriviRisposta,
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
      // Ripristino dopo reload: una sessione valida (svolgimento o correzione)
      // torna subito alla sua pagina, col timer in pausa. Prima la vista
      // mostrava l'introduzione e l'e2e dopo reload non ritrovava le risposte.
      let sessione = sessioneValida(sessioneSalvata) ? sessioneSalvata : null;
      let rawSalvata = null;
      try { rawSalvata = storage.getItem(CHIAVE_STORAGE); } catch { /* storage disabilitato */ }
      let provaAvviata = Boolean(sessione);
      let saveOk = true;
      let profiloSceltoId = sessione?.prova?.profiloId || 'prova-2025-11-05';
      let modalitaScelta = sessione?.prova?.modalita || 'simulazione';
      let durataSceltaMin = null;

      const persist = () => { saveOk = salvaSessione(storage, sessione); };
      if (rawSalvata && !sessione) cancellaSessione(storage);
      if (sessione) {
        // La prova salvata si può riprendere, ma il timer resta fermo finché l'utente non lo sceglie.
        sessione = { ...sessione, timer: timerInPausa(sessione.timer, now()) };
        persist();
      }

      const chiudiSeScaduto = () => {
        if (!sessione || sessione.fase !== 'svolgimento') return false;
        if (sessione.prova.modalita === 'allenamento') return false;
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
        const prova = generaProva(graph.nodi, {
          seed, now: now(), profiloId: profiloSceltoId, modalita: modalitaScelta, durataMinuti: durataSceltaMin,
        });
        sessione = creaSessione(prova, now());
        provaAvviata = true;
        persist();
        draw();
      };

      function intro() {
        const profilo = getProfilo(profiloSceltoId);
        const buchi = copertura(graph.nodi, profiloSceltoId).filter((r) => r.quanti === 0);
        const durataEffettiva = durataSceltaMin == null ? profilo.durataPredefinitaMinuti : durataSceltaMin;
        const selectDurata = h('select', {
          id: 'sim-durata', class: 'sim-select',
          onchange: (e) => { durataSceltaMin = Number(e.target.value); draw(); },
        }, DURATE_CONSENTITE_MINUTI.map((m) => h('option', { value: String(m), selected: m === durataEffettiva ? 'selected' : null }, `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, '0') : ''} (${m} minuti)`)));
        return h('div', {},
          h('header', { class: 'mod-top' }, torna(), h('h1', { id: 'sim-titolo', tabindex: '-1' }, "Simulatore d'esame")),
          h('p', { class: 'sim-lead' }, 'Struttura fissa in tre parti: Design, Testing, Teoria. Scegli profilo, modalità e durata: i punti sono solo quelli documentati dalla fonte del profilo.'),
          h('div', { class: 'sim-controlli' },
            h('label', {}, 'Profilo ',
              h('select', {
                id: 'sim-profilo', class: 'sim-select',
                onchange: (e) => { profiloSceltoId = e.target.value; durataSceltaMin = null; draw(); },
              }, PROFILI.map((p) => h('option', { value: p.id, selected: p.id === profiloSceltoId ? 'selected' : null }, p.titolo)))),
            h('label', {}, 'Modalità ',
              h('select', {
                id: 'sim-modalita', class: 'sim-select',
                onchange: (e) => { modalitaScelta = e.target.value; draw(); },
              }, [
                h('option', { value: 'simulazione', selected: modalitaScelta === 'simulazione' ? 'selected' : null }, 'Simulazione (soluzioni alla consegna)'),
                h('option', { value: 'allenamento', selected: modalitaScelta === 'allenamento' ? 'selected' : null }, 'Allenamento (soluzione dopo il tentativo)'),
              ])),
            h('label', {}, 'Durata ', selectDurata)),
          h('p', { class: 'sim-fonte', id: 'sim-fonte-profilo' }, `Fonte del profilo: ${profilo.fonte}.`),
          profilo.nota ? h('p', {}, profilo.nota) : null,
          profilo.motivoVotoAssente ? h('p', { class: 'sim-gap', role: 'status' }, profilo.motivoVotoAssente) : null,
          h('ul', { class: 'sim-parti' },
            profilo.parti.map((p) => h('li', {}, `${p.titolo}: ${testoPuntiParte(p)}, ${testoMinutiParte(p)}.`))),
          h('p', {}, 'Allenamento: puoi vedere la soluzione di una consegna solo dopo aver scritto un tentativo. Simulazione: nessun materiale, timer attivo, soluzioni solo alla consegna. In entrambe le modalità ti autovaluti con la rubrica: i punti li assegni tu, nessuna correzione automatica per parole chiave.'),
          h('p', {}, 'I testi sono esercizi del grafo (banche ed esercizi dei nodi). Se uno slot non ha esercizi, la prova lo dichiara vuoto e non inventa il testo. Salva/riprendi: le risposte restano in questo browser e dopo un reload ritrovi la prova in pausa, dove l\u2019avevi lasciata.'),
          graph.nota_esame ? h('details', { class: 'note' }, h('summary', {}, 'Nota del grafo sulle prove'), h('p', {}, graph.nota_esame)) : null,
          buchi.length ? h('div', { class: 'sim-gap', role: 'status' },
            h('p', {}, 'Con i dati attuali del grafo queste voci resterebbero scoperte:'),
            h('ul', {}, buchi.map((b) => h('li', {}, b.titolo)))) : null,
          notaSalvataggio(),
          h('p', { class: 'sim-actions' },
            h('button', { type: 'button', class: 'btn primary', id: 'sim-inizia', onclick: inizia }, 'Inizia la prova')));
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
        const allenamento = sessione.prova.modalita === 'allenamento';
        const notaTimer = allenamento
          ? (lett.scaduto ? 'Allenamento: tempo consigliato superato, puoi continuare e vedere le soluzioni dopo il tentativo.' : 'Allenamento: soluzione visibile dopo il tentativo, per ogni consegna.')
          : (lett.running ? 'Simulazione: nessun materiale, soluzioni solo alla consegna. Il tempo scorre anche se chiudi la pagina.' : 'In pausa: il tempo è fermo.');
        return h('div', { class: 'sim-timer' },
          h('div', {},
            h('p', { class: 'muted', id: 'sim-timer-note' }, notaTimer),
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

      function soluzioneAllenamento(q, c, i) {
        const area = h('div', { class: 'sim-sol-area' });
        const mostra = () => {
          if (!leggiRisposta(sessione, q.id, i).trim()) {
            area.replaceChildren(h('p', { class: 'sim-gap', role: 'status' }, 'Scrivi prima un tentativo: in allenamento la soluzione si vede solo dopo aver provato a rispondere.'));
            return;
          }
          area.replaceChildren(h('div', { class: 'sim-box sim-soluzione' }, h('h4', {}, 'Soluzione del grafo'), h('div', { class: 'sim-prosa sim-soluzione-testo' }, c.soluzione)));
        };
        return h('div', {}, h('button', { type: 'button', class: 'btn sim-mostra-soluzione', onclick: mostra }, 'Mostra la soluzione'), area);
      }

      function blocchiQuesito(q, correzione, parteId) {
        return q.consegne.map((c, i) => h('div', { class: 'sim-consegna' },
          q.consegne.length > 1 ? h('h4', {}, c.etichetta) : null,
          h('p', { class: 'muted' }, c.tipoEsame || 'Esercizio del grafo'),
          h('div', { class: 'sim-testo' }, c.testo),
          correzione
            ? h('div', { class: 'sim-confronto' },
              h('div', { class: 'sim-box sim-tua' }, h('h4', {}, 'La tua risposta'), h('div', { class: 'sim-prosa' }, leggiRisposta(sessione, q.id, i).trim() ? leggiRisposta(sessione, q.id, i) : 'Nessuna risposta.')),
              h('div', { class: 'sim-box sim-soluzione' }, h('h4', {}, 'Soluzione del grafo'), h('div', { class: 'sim-prosa sim-soluzione-testo' }, c.soluzione)))
            : campoRisposta(q, c, i),
          !correzione && sessione.prova.modalita === 'allenamento' ? soluzioneAllenamento(q, c, i) : null,
          !correzione && sessione.prova.modalita !== 'allenamento' ? h('p', { class: 'muted' }, 'Soluzione visibile solo alla consegna.') : null,
          correzione ? h('details', { class: 'sim-rubrica' }, h('summary', {}, 'Rubrica di autovalutazione'),
            h('p', {}, 'Spunta i criteri che la tua risposta soddisfa, poi assegna tu i punti: nessuna correzione automatica per parole chiave.'),
            h('ul', {}, vociRubrica(q, parteId || q.parteId).map((v) => h('li', {}, h('label', {}, h('input', { type: 'checkbox', class: 'sim-rubrica-check' }), ` ${v}`))))) : null,
          correzione ? h('p', {}, 'Riapri il nodo: ', h('a', { href: hashLezione(c.nodoId) }, c.nodoTitolo)) : null));
      }

      function paginaSvolgimento() {
        const prova = sessione.prova;
        const testoMassimo = typeof prova.puntiTotali === 'number'
          ? `Massimo ${prova.puntiTotali} punti se tutte le voci hanno un esercizio nel grafo.`
          : 'Questo profilo non calcola un voto (vedi la fonte e la nota sul profilo).';
        return h('div', {},
          h('header', { class: 'mod-top' },
            torna(),
            h('h1', { id: 'sim-titolo', tabindex: '-1' }, "Simulatore d'esame"),
            h('button', { type: 'button', class: 'btn', id: 'sim-nuova', onclick: nuovaProva }, 'Nuova prova')),
          h('p', { class: 'muted' }, `${prova.profiloTitolo || prova.fontePunteggi} · ${prova.modalita} · Fonte: ${prova.fonteProfilo || prova.fontePunteggi}. ${testoMassimo}`),
          prova.motivoVotoAssente ? h('p', { class: 'sim-gap', role: 'status' }, prova.motivoVotoAssente) : null,
          notaSalvataggio(),
          barraTempo(),
          ...prova.parti.map((parte) => h('section', { class: 'sim-parte', 'data-parte': parte.id },
            h('h2', {}, parte.titolo),
            h('p', { class: 'muted' }, `${testoPuntiParte(parte)} · ${testoMinutiParte(parte)}`),
            ...parte.mancanti.map((m) => h('p', { class: 'sim-gap', role: 'status' }, m.messaggio)),
            ...parte.quesiti.map((q) => h('article', { class: 'sim-q', 'data-q': q.id },
              h('h3', {}, q.titolo, q.puntiMax != null ? h('span', { class: 'sim-pt' }, ` · ${q.puntiMax} punti`) : h('span', { class: 'sim-pt' }, ' · punti non documentati per questo slot')),
              q.motivo ? h('p', { class: 'sim-gap' }, q.motivo) : null,
              ...blocchiQuesito(q, false, parte.id))))));
      }

      function salvaEsitiDalReport(stato) {
        const prova = sessione.prova;
        let quanti = 0;
        for (const parte of prova.parti) {
          for (const q of parte.quesiti) {
            const punti = sessione.giudizi[q.id];
            if (q.puntiMax == null || typeof punti !== 'number') continue;
            for (const c of q.consegne) {
              const salvati = registraEsito(storage, {
                slot_id: q.id, nodo_id: c.nodoId, profilo: prova.profiloId || 'prova-2025-11-05',
                modalita: prova.modalita || 'simulazione', punti, punti_max: q.puntiMax,
                ts: new Date(now()).toISOString(),
              });
              if (salvati) quanti += 1;
            }
          }
        }
        stato.textContent = quanti
          ? `Esiti salvati: ${quanti} voci (chiave ids-kg:esiti-simulatore:v1).`
          : 'Nessun esito da salvare: assegna almeno un punteggio nelle voci con punti documentati.';
        if (quanti) {
          sessione = { ...sessione, esitiRegistrati: true };
          persist();
        }
      }

      function riepilogo() {
        const report = generaReport(sessione.prova, sessione.giudizi);
        const nodi = report.nodiDaRiaprire;
        const statoEsiti = h('p', { class: 'sim-esiti-msg', id: 'sim-esiti-msg', role: 'status' },
          sessione.esitiRegistrati ? 'Esiti di questa prova già salvati in questo browser.' : '');
        return h('div', { class: 'sim-riepilogo', id: 'sim-riepilogo' },
          h('h2', {}, 'Report per parte'),
          ...report.righeTesto.map((r) => h('p', {}, r)),
          h('ul', { class: 'sim-ripasso' }, report.parti.map((p) => h('li', {},
            p.valutabile ? `${p.titolo}: ${p.ottenuti}/${p.maxValutabile} punti autovalutati` : `${p.titolo}: punti non documentati per gli slot, autovalutazione solo con rubrica`,
            p.mancanti.length ? ` · slot vuoti dichiarati: ${p.mancanti.map((m) => m.titolo).join(', ')}` : '',
            p.nodiDaRiaprire.length ? ` · nodi da riaprire: ${p.nodiDaRiaprire.map((n) => n.nodoTitolo).join(', ')}` : ''))),
          nodi.length
            ? h('div', {}, h('p', {}, 'Da ripassare — riapri questi nodi, dove non hai il massimo:'),
              h('ul', { class: 'sim-ripasso', id: 'sim-da-ripassare' }, nodi.map((n) => h('li', {}, h('a', { href: hashLezione(n.nodoId) }, n.nodoTitolo), ` (${n.voci.join('; ')})`))))
            : h('p', { id: 'sim-da-ripassare' }, report.totale.senzaGiudizio ? 'I nodi da ripassare compaiono quando assegni un punteggio inferiore al massimo.' : 'Nessun nodo da ripassare sulle voci che hai valutato.'),
          h('p', { class: 'sim-actions' },
            h('button', { type: 'button', class: 'btn', id: 'sim-salva-esiti', onclick: () => salvaEsitiDalReport(statoEsiti) }, 'Salva gli esiti')),
          statoEsiti);
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
        sessione = { ...sessione, esitiRegistrati: false };
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
              h('h3', {}, q.titolo, q.puntiMax != null ? h('span', { class: 'sim-pt' }, ` · massimo ${q.puntiMax} punti`) : h('span', { class: 'sim-pt' }, ' · punti non documentati: usa solo la rubrica')),
              q.motivo ? h('p', { class: 'sim-gap' }, q.motivo) : null,
              ...blocchiQuesito(q, true, parte.id),
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
