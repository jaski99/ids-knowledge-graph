// Genera una prova dalla struttura della prova del 5/11/2025 (docs/EXAM_FORMAT.md).
// I testi arrivano solo da nodi[].esercizi. Se uno slot non ha esercizi, resta vuoto.

export const FONTE_PUNTEGGI = 'Prova del 5/11/2025';
export const DURATA_MS = 2 * 60 * 60 * 1000;
export const PUNTI_TOTALI = 30;
export const SOGLIA_SUFFICIENZA = 17;

const t = (e) => (e.tipoEsame || '').toLowerCase();

function matchClassi(e) { return /class diagram/.test(t(e)) && !/molteplicit|verifica di coerenza/.test(t(e)); }
function matchSequence(e) { return /\bsequence\b/.test(t(e)); }
function matchActivity(e) { return /\bactivity\b/.test(t(e)); }
function matchState(e) { return /state diagram/.test(t(e)); }
function matchUseCase(e) {
  return /use case/.test(t(e)) && !/errori/.test(t(e));
}
function matchPattern(e) { return /pattern\s*1\.4|1\.4 completo/.test(t(e)); }
function matchBlackBox(e) {
  // Sul nodo d'esame la consegna è EC+BVA anche quando il testo dice solo «tabella finale».
  if (e.nodoId === 'esercizio-black-box-scaglioni') return true;
  const testo = (e.testo || '').toLowerCase();
  if (!/parte 2/.test(t(e))) return false;
  const chiedeEc = /classi di equivalenza/.test(testo) || /classi,/.test(testo);
  const chiedeBva = /\bbva\b|boundary|valori limite/.test(testo);
  return chiedeEc && chiedeBva;
}
function matchDebug(e) { return /debugging/.test(t(e)); }
function matchFactory(e) {
  if (e.nodoId === 'design-pattern-simple-factory') return true;
  const blob = `${e.tipoEsame}\n${e.testo}`.toLowerCase();
  return /parte 3/.test(t(e)) && /static/.test(blob) && /factory|pagamento/.test(blob);
}
function matchWhiteBox(e) {
  if (/mc\/dc|mcdc/.test(t(e))) return false;
  if (e.nodoId === 'esercizio-white-box-copertura' || e.nodoId === 'grafo-flusso-controllo') return false;
  return /statement e decision/.test(t(e));
}
function matchCfg(e) { return e.nodoId === 'esercizio-white-box-copertura'; }

const PARTI = [
  {
    id: 'design',
    titolo: 'Parte 1 — Design',
    punti: 16,
    minuti: 60,
    slot: [
      { id: 'classi', titolo: '1.1 Diagramma delle classi', punti: 5, match: matchClassi },
      {
        id: 'comportamento',
        titolo: '1.2 Sequenza, attività e stati',
        punti: 5,
        bundle: [
          { id: 'sequence', etichetta: 'Diagramma di sequenza', match: matchSequence },
          { id: 'activity', etichetta: 'Diagramma di attività', match: matchActivity },
          { id: 'state', etichetta: 'Diagramma di stato', match: matchState },
        ],
      },
      { id: 'usecase', titolo: "1.3 Casi d'uso", punti: 2, match: matchUseCase },
      { id: 'pattern', titolo: '1.4 Design pattern', punti: 4, match: matchPattern },
    ],
  },
  {
    id: 'blackbox',
    titolo: 'Parte 2 — Testing black box',
    punti: 3,
    minuti: 10,
    slot: [
      { id: 'bva', titolo: 'Classi di equivalenza e valori limite', punti: 3, match: matchBlackBox },
    ],
  },
  {
    id: 'teoria',
    titolo: 'Parte 3 — Domande',
    punti: 11,
    minuti: 30,
    slot: [
      { id: 'debug', titolo: 'Debugging', punti: 3, match: matchDebug },
      { id: 'factory', titolo: 'Simple Factory', punti: 2, match: matchFactory },
      { id: 'whitebox', titolo: 'White box e decision coverage', punti: 2, match: matchWhiteBox },
      { id: 'cfg', titolo: 'Diagramma di flusso e coperture', punti: 4, match: matchCfg },
    ],
  },
];

export function messaggioSlotVuoto(titolo) {
  return `Dati insufficienti per «${titolo}»: nel grafo non c'è un esercizio svolto che corrisponda a questa voce. Non è stato inventato un testo.`;
}

export function messaggioBundleIncompleto(titolo, mancanti) {
  const elenco = mancanti.join(', ');
  return `Dati insufficienti per «${titolo}»: nel grafo manca ${elenco}. Senza tutte le consegne non assegno i punti ufficiali di questa voce. Gli esercizi presenti restano per esercitarti.`;
}

export function catalogoEsercizi(nodi) {
  const out = [];
  if (!Array.isArray(nodi)) return out;
  for (const n of nodi) {
    if (!n || typeof n.id !== 'string') continue;
    const esercizi = Array.isArray(n.esercizi) ? n.esercizi : [];
    esercizi.forEach((e, indice) => {
      if (!e || typeof e.testo !== 'string' || typeof e.soluzione !== 'string') return;
      if (!e.testo.trim() || !e.soluzione.trim()) return;
      out.push({
        nodoId: n.id,
        nodoTitolo: typeof n.title === 'string' ? n.title : n.id,
        area: n.area,
        tipo: n.tipo,
        indice,
        tipoEsame: typeof e.tipo_esame === 'string' ? e.tipo_esame : '',
        testo: e.testo,
        soluzione: e.soluzione,
      });
    });
  }
  return out;
}

export function strutturaPunteggi() {
  return PARTI.map((p) => ({
    id: p.id,
    titolo: p.titolo,
    punti: p.punti,
    minuti: p.minuti,
    slot: p.slot.map((s) => ({
      id: s.id,
      titolo: s.titolo,
      punti: s.punti,
      bundle: s.bundle ? s.bundle.map((b) => ({ id: b.id, etichetta: b.etichetta })) : null,
    })),
  }));
}

export function copertura(nodi) {
  const cat = catalogoEsercizi(nodi);
  const righe = [];
  for (const parte of PARTI) {
    for (const slot of parte.slot) {
      if (slot.bundle) {
        for (const b of slot.bundle) {
          righe.push({ parteId: parte.id, slotId: slot.id, sottoId: b.id, titolo: b.etichetta, quanti: cat.filter(b.match).length });
        }
      } else {
        righe.push({ parteId: parte.id, slotId: slot.id, sottoId: null, titolo: slot.titolo, quanti: cat.filter(slot.match).length });
      }
    }
  }
  return righe;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6D2B79F5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pesca(rng, pool) {
  if (!pool.length) return null;
  const ordinati = pool.slice().sort((a, b) => (a.nodoId < b.nodoId ? -1 : a.nodoId > b.nodoId ? 1 : a.indice - b.indice));
  return ordinati[Math.floor(rng() * ordinati.length)];
}

function etichettaPunti(punti) {
  const re = new RegExp(`\\b${punti}\\s*pt\\b`, 'i');
  return (e) => re.test(e.tipoEsame);
}

function scegli(rng, pool, match, punti) {
  let cands = pool.filter(match);
  if (punti != null) {
    const labeled = cands.filter(etichettaPunti(punti));
    if (labeled.length) cands = labeled;
  }
  return pesca(rng, cands);
}

function senza(pool, e) {
  return pool.filter((x) => !(x.nodoId === e.nodoId && x.indice === e.indice));
}

function consegnaDa(e, etichetta) {
  return {
    etichetta,
    nodoId: e.nodoId,
    nodoTitolo: e.nodoTitolo,
    area: e.area,
    tipoEsame: e.tipoEsame,
    testo: e.testo,
    soluzione: e.soluzione,
    indice: e.indice,
  };
}

function quesitoSingolo(parte, slot, esercizio) {
  return {
    id: `${parte.id}:${slot.id}`,
    slotId: slot.id,
    titolo: slot.titolo,
    puntiMax: slot.punti,
    puntiUfficiali: slot.punti,
    motivo: null,
    consegne: [consegnaDa(esercizio, slot.titolo)],
    mancantiConsegne: [],
  };
}

function quesitoBundle(parte, slot, trovati, mancanti) {
  const completo = mancanti.length === 0;
  return {
    id: `${parte.id}:${slot.id}`,
    slotId: slot.id,
    titolo: slot.titolo,
    puntiMax: completo ? slot.punti : null,
    puntiUfficiali: slot.punti,
    motivo: completo ? null : messaggioBundleIncompleto(slot.titolo, mancanti),
    consegne: trovati,
    mancantiConsegne: mancanti.slice(),
  };
}

export function generaProva(nodi, { seed, now = 0 } = {}) {
  if (!Number.isInteger(seed)) throw new TypeError('seed intero obbligatorio');
  const rng = mulberry32(seed);
  let pool = catalogoEsercizi(nodi);
  const parti = PARTI.map((parte) => {
    const quesiti = [];
    const mancanti = [];
    for (const slot of parte.slot) {
      if (slot.bundle) {
        const trovati = [];
        const assenti = [];
        for (const b of slot.bundle) {
          const scelto = scegli(rng, pool, b.match, null);
          if (!scelto) { assenti.push(b.etichetta); continue; }
          pool = senza(pool, scelto);
          trovati.push(consegnaDa(scelto, b.etichetta));
        }
        if (!trovati.length) mancanti.push({ id: slot.id, titolo: slot.titolo, messaggio: messaggioSlotVuoto(slot.titolo) });
        else quesiti.push(quesitoBundle(parte, slot, trovati, assenti));
        continue;
      }
      const scelto = scegli(rng, pool, slot.match, slot.punti);
      if (!scelto) {
        mancanti.push({ id: slot.id, titolo: slot.titolo, messaggio: messaggioSlotVuoto(slot.titolo) });
        continue;
      }
      pool = senza(pool, scelto);
      quesiti.push(quesitoSingolo(parte, slot, scelto));
    }
    return { id: parte.id, titolo: parte.titolo, punti: parte.punti, minuti: parte.minuti, quesiti, mancanti };
  });
  const coperta = parti.every((p) => p.mancanti.length === 0 && p.quesiti.every((q) => q.puntiMax != null && q.mancantiConsegne.length === 0));
  return {
    fontePunteggi: FONTE_PUNTEGGI,
    durataMs: DURATA_MS,
    puntiTotali: PUNTI_TOTALI,
    sogliaSufficienza: SOGLIA_SUFFICIENZA,
    seed,
    generataIl: now,
    coperta,
    parti,
  };
}
