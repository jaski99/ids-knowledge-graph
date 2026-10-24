// Vista Ripasso: flashcard con ripetizione spaziata (SM-2).
// Dipendenze (grafo, storage, documento, orologio, confirm) iniettate da avvia.js via ctx:
// questa vista non legge mai globali. Il CSS è caricato qui, così l'aggancio in
// avvia.js resta una sola riga di register come per gli altri moduli.
import { clear, h } from '../dom.js';
import { formatGiornoIt, toIsoDay } from './giorni.js';
import { costruisciMazzo, codaStudio, filtraCarte, PRIORITA, prossimaScadenza } from './mazzo.js';
import { applicaVoto, formatIntervallo, intervalloPrevisto, VOTI } from './sm2.js';
import { padronanzaPerArea, riepilogoCarte, serieDiStudio, statoCarta } from './statistiche.js';
import { cancellaStato, conRevisione, leggiStato, salvaStato, statoVuoto } from './store.js';

const CSS_HREF = 'modules/ripasso/style.css';
const ETICHETTE_VOTO = { ancora: 'Ancora', difficile: 'Difficile', bene: 'Bene', facile: 'Facile' };
const ETICHETTE_STATO = { nuova: 'Nuova', apprendimento: 'In apprendimento', padroneggiata: 'Padroneggiata' };
const hashLezione = (id) => `#/lezione/${encodeURIComponent(id)}`;
const maiuscola = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function ensureCss(doc) {
  if (!doc || doc.querySelector(`link[data-moduli="${CSS_HREF}"]`)) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  link.dataset.moduli = CSS_HREF;
  doc.head.append(link);
}

export function createRipassoView() {
  return {
    id: 'ripasso',
    titolo: 'Ripasso',
    render(root, ctx) {
      const doc = ctx.document || root.ownerDocument;
      ensureCss(doc);
      const graph = ctx.graph || { nodi: [], aree: [] };
      const storage = ctx.storage;
      const now = ctx.now || (() => Date.now());
      const ask = ctx.confirm || ((msg) => root.ownerDocument.defaultView?.confirm(msg));
      const oggi = () => toIsoDay(new Date(now()));

      const mazzo = costruisciMazzo(graph.nodi);
      const titoloArea = new Map((graph.aree || []).map((a) => [a.id, a.titolo]));

      let dati = leggiStato(storage);
      let saveOk = true;
      let coda = [];
      let pos = 0;
      let rivelata = false;
      let visteSessione = 0;

      const persist = () => { saveOk = salvaStato(storage, dati); };
      const carteFiltrate = () => filtraCarte(mazzo, dati.filtri);
      const ricostruisciCoda = () => {
        coda = codaStudio(carteFiltrate(), dati.carte, oggi());
        pos = 0;
        rivelata = false;
      };
      ricostruisciCoda();

      const draw = (focusSelector = '#ripasso-titolo') => {
        clear(root);
        root.className = 'module-page rip';
        root.append(pagina());
        root.querySelector(focusSelector)?.focus();
      };

      const votiPossibili = (carta) => {
        const stato = dati.carte[carta.id] || null;
        return h('div', { class: 'rip-voti', role: 'group', 'aria-label': 'Come è andata?' },
          VOTI.map((voto) => h('button', {
            type: 'button',
            class: `rip-voto rip-voto-${voto}`,
            'data-voto': voto,
            onclick: () => registraVoto(voto),
          },
          h('span', { class: 'rip-voto-nome' }, ETICHETTE_VOTO[voto]),
          h('span', { class: 'rip-voto-tra' }, `tra ${formatIntervallo(intervalloPrevisto(stato, voto))}`))));
      };

      function registraVoto(voto) {
        const carta = coda[pos];
        if (!carta || !rivelata) return;
        const giorno = oggi();
        dati = conRevisione(dati, carta.id, applicaVoto(dati.carte[carta.id] || null, voto, giorno), giorno);
        persist();
        visteSessione += 1;
        // "Ancora" scade oggi: la carta torna in fondo a questa sessione, non subito in faccia.
        if (voto === 'ancora') coda.push(carta);
        pos += 1;
        rivelata = false;
        draw(coda[pos] ? '#ripasso-domanda' : '#ripasso-titolo');
      }

      function cambiaFiltri(filtri) {
        dati = { ...dati, filtri };
        persist();
        visteSessione = 0;
        ricostruisciCoda();
        draw('#ripasso-titolo');
      }

      function azzera() {
        if (!ask('Azzerare i progressi del ripasso salvati in questo browser? Le carte torneranno tutte nuove.')) return;
        cancellaStato(storage);
        dati = statoVuoto();
        visteSessione = 0;
        ricostruisciCoda();
        draw('#ripasso-titolo');
      }

      function intestazione(riepilogo, serie) {
        const stat = (id, valore, etichetta) => h('div', { class: 'rip-stat' },
          h('p', { class: 'rip-stat-valore', id }, valore),
          h('p', { class: 'rip-stat-etichetta' }, etichetta));
        return [
          h('header', { class: 'mod-top' },
            h('a', { class: 'btn', href: '#/' }, '← Grafo'),
            h('h1', { id: 'ripasso-titolo', tabindex: '-1' }, 'Ripasso a flashcard')),
          h('p', { class: 'rip-lead' },
            'Domande di autoverifica e punti di checklist di ogni nodo, ripresentati con ripetizione spaziata (SM-2). '
            + 'I progressi restano in questo browser.'),
          saveOk ? null : h('p', { class: 'rip-err', role: 'status' },
            'Il browser non ha salvato i progressi: se ricarichi la pagina il ripasso ricomincia da capo.'),
          h('section', { class: 'rip-stats', 'aria-label': 'Riepilogo del mazzo' },
            stat('ripasso-dovute', String(riepilogo.dovute), 'carte dovute oggi'),
            stat('ripasso-nuove', String(riepilogo.nuove), 'carte nuove'),
            stat('ripasso-serie', String(serie), serie === 1 ? 'giorno di serie' : 'giorni di serie'),
            stat('ripasso-padronanza', `${riepilogo.percentualePadronanza}%`, 'padronanza del mazzo')),
        ];
      }

      function sezioneFiltri() {
        const opzioniArea = [
          h('option', { value: '', selected: dati.filtri.area === null }, 'Tutte le aree'),
          ...(graph.aree || []).map((a) => h('option', {
            value: String(a.id),
            selected: dati.filtri.area === a.id,
          }, `${a.id}. ${a.titolo}`)),
        ];
        const opzioniPriorita = [
          h('option', { value: '', selected: dati.filtri.priorita === null }, 'Tutte le priorità'),
          ...PRIORITA.map((p) => h('option', { value: p, selected: dati.filtri.priorita === p }, maiuscola(p))),
        ];
        return h('section', { class: 'rip-filtri', 'aria-label': 'Filtri del mazzo' },
          h('label', {}, 'Area',
            h('select', {
              id: 'ripasso-filtro-area',
              onchange: (e) => cambiaFiltri({ ...dati.filtri, area: e.target.value === '' ? null : Number(e.target.value) }),
            }, opzioniArea)),
          h('label', {}, 'Priorità',
            h('select', {
              id: 'ripasso-filtro-priorita',
              onchange: (e) => cambiaFiltri({ ...dati.filtri, priorita: e.target.value === '' ? null : e.target.value }),
            }, opzioniPriorita)),
          h('p', { class: 'muted rip-filtri-nota' }, `${carteFiltrate().length} carte nel filtro · ${mazzo.length} in tutto il mazzo`));
      }

      function sezioneCarta() {
        if (!mazzo.length) {
          return h('p', { class: 'rip-vuoto', id: 'ripasso-vuoto', role: 'status' },
            'Il grafo non contiene domande di autoverifica né punti di checklist: non ci sono carte da ripassare.');
        }
        if (!carteFiltrate().length) {
          return h('p', { class: 'rip-vuoto', id: 'ripasso-vuoto', role: 'status' },
            'Nessuna carta corrisponde ai filtri scelti: allarga il filtro per continuare.');
        }
        const carta = coda[pos];
        if (!carta) return sezioneCompletata();

        const stato = dati.carte[carta.id] || null;
        const tipo = ETICHETTE_STATO[statoCarta(stato)];
        const meta = [
          carta.area !== null ? `Area ${carta.area} · ${titoloArea.get(carta.area) || ''}`.trim() : null,
          carta.priorita ? `Priorità ${carta.priorita}` : null,
          tipo,
          stato?.revisioni ? `Ultimo intervallo: ${formatIntervallo(stato.intervallo)}` : null,
        ].filter(Boolean);
        const eDomanda = carta.tipo === 'domanda';

        return h('section', { class: 'rip-carta', id: 'ripasso-carta', 'aria-label': 'Flashcard corrente' },
          h('p', { class: 'rip-sessione muted', id: 'ripasso-sessione', role: 'status' },
            `Carta ${pos + 1} di ${coda.length} in questa sessione · ${visteSessione} già ripassate`),
          h('p', { class: 'rip-meta' }, meta.map((m) => h('span', { class: 'rip-chip' }, m))),
          h('h2', { class: 'rip-nodo' }, carta.nodoTitolo),
          h('p', { class: 'rip-tipo muted' }, eDomanda
            ? 'Domanda di autoverifica — rispondi a voce o per iscritto, poi mostra la risposta.'
            : 'Punto di checklist — prova a spiegarlo, poi mostra il riferimento del nodo.'),
          h('div', { class: 'rip-domanda', id: 'ripasso-domanda', tabindex: '-1' }, carta.domanda),
          rivelata
            ? [
              h('div', { class: 'rip-risposta', id: 'ripasso-risposta', tabindex: '-1' },
                h('h3', {}, eDomanda ? 'Risposta' : 'Riferimento dal nodo (campo «sapere»)'),
                h('div', { class: 'rip-risposta-testo' }, carta.risposta)),
              h('p', { class: 'muted' }, 'Come è andata? Il voto decide tra quanto rivedrai questa carta.'),
              votiPossibili(carta),
            ]
            : h('p', { class: 'rip-azioni' },
              h('button', {
                type: 'button', class: 'btn primary', id: 'ripasso-mostra',
                onclick: () => { rivelata = true; draw('#ripasso-risposta'); },
              }, 'Mostra risposta')),
          h('p', { class: 'rip-apri' },
            h('a', { href: hashLezione(carta.nodoId), id: 'ripasso-lezione' }, 'Apri la lezione'),
            ' · ', carta.nodoTitolo));
      }

      function sezioneCompletata() {
        const prossima = prossimaScadenza(carteFiltrate(), dati.carte, oggi());
        return h('section', { class: 'rip-carta rip-fatto', id: 'ripasso-fatto', role: 'status' },
          h('h2', {}, visteSessione > 0 ? 'Sessione completata 🎉' : 'Niente da ripassare oggi'),
          h('p', {}, visteSessione > 0
            ? `Hai ripassato ${visteSessione} ${visteSessione === 1 ? 'carta' : 'carte'} in questa sessione.`
            : 'Per i filtri scelti non ci sono carte scadute o nuove.'),
          prossima ? h('p', { class: 'muted' }, `Prossima scadenza nel filtro: ${formatGiornoIt(prossima)}.`) : null,
          h('p', { class: 'rip-azioni' },
            h('button', {
              type: 'button', class: 'btn', id: 'ripasso-ricontrolla',
              onclick: () => { ricostruisciCoda(); draw('#ripasso-titolo'); },
            }, 'Ricontrolla le carte dovute')));
      }

      function sezioneAree() {
        const righe = padronanzaPerArea(mazzo, dati.carte, graph.aree);
        if (!righe.length) return null;
        return h('section', { class: 'rip-aree', 'aria-label': 'Padronanza per area' },
          h('h2', {}, 'Padronanza per area'),
          h('p', { class: 'muted' }, 'Padroneggiata = almeno due ripetizioni riuscite di fila (intervallo di 6 giorni).'),
          h('ul', { class: 'rip-aree-lista' },
            righe.map((r) => h('li', { class: 'rip-area', 'data-area': String(r.area) },
              h('span', { class: 'rip-area-nome' }, `${r.area}. ${r.titolo}`),
              h('span', { class: 'rip-barra', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(r.percentuale), 'aria-label': `Padronanza ${r.titolo}: ${r.percentuale}%` },
                h('span', { class: 'rip-barra-piena', style: `width:${r.percentuale}%` })),
              h('span', { class: 'rip-area-valore' }, `${r.percentuale}% (${r.padroneggiate}/${r.totale})`)))));
      }

      function pagina() {
        const giorno = oggi();
        const riepilogo = riepilogoCarte(mazzo, dati.carte, giorno);
        const serie = serieDiStudio(dati.giorni, giorno);
        return h('div', {},
          ...intestazione(riepilogo, serie),
          sezioneFiltri(),
          sezioneCarta(),
          sezioneAree(),
          h('p', { class: 'rip-reset' },
            h('button', { type: 'button', class: 'btn', id: 'ripasso-azzera', onclick: azzera },
              'Azzera i progressi del ripasso')));
      }

      draw();
    },
  };
}
