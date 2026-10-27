// Genera una prova a struttura fissa Design / Testing / Teoria dai profili
// di profili.js (tabella 1.2 di docs/IMPROVEMENT_PLAN.md; profilo predefinito:
// prova del 5/11/2025, docs/EXAM_FORMAT.md). I testi arrivano solo da
// nodi[].esercizi: dalle banche di X3 (slot.js, contratto 4.1) e dagli
// esercizi esistenti. Se uno slot non ha esercizi, resta vuoto e dichiarato.
import { getProfilo, durataMsPerProfilo, PROFILO_PREDEFINITO_ID } from './profili.js';
import { corrisponde } from './slot.js';

export const FONTE_PUNTEGGI = 'Prova del 5/11/2025';
export const DURATA_MS = 2 * 60 * 60 * 1000;
export const PUNTI_TOTALI = 30;
export const SOGLIA_SUFFICIENZA = 17;

export const MODALITA_VALIDE = Object.freeze(['allenamento', 'simulazione']);

function partiDelProfilo(profilo) {
  return profilo.parti.map((parte) => ({
    ...parte,
    slot: parte.slot.map((slot) => (slot.bundle
      ? { ...slot, bundle: slot.bundle.map((b) => ({ ...b, match: (e) => corrisponde(b.matcher, e) })) }
      : { ...slot, match: (e) => corrisponde(slot.matcher, e) })),
  }));
}

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

export function strutturaPunteggi(profiloId = PROFILO_PREDEFINITO_ID) {
  return partiDelProfilo(getProfilo(profiloId)).map((p) => ({
    id: p.id,
    titolo: p.titolo,
    punti: p.punti,
    puntiIntervallo: p.puntiIntervallo,
    minuti: p.minuti,
    minutiIntervallo: p.minutiIntervallo,
    slot: p.slot.map((s) => ({
      id: s.id,
      titolo: s.titolo,
      punti: s.punti,
      bundle: s.bundle ? s.bundle.map((b) => ({ id: b.id, etichetta: b.etichetta })) : null,
    })),
  }));
}

export function copertura(nodi, profiloId = PROFILO_PREDEFINITO_ID) {
  const cat = catalogoEsercizi(nodi);
  const righe = [];
  for (const parte of partiDelProfilo(getProfilo(profiloId))) {
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

function scegli(rng, pool, match, punti, preferisciNodoId = null) {
  let cands = pool.filter(match);
  if (preferisciNodoId && cands.some((c) => c.nodoId === preferisciNodoId)) {
    cands = cands.filter((c) => c.nodoId === preferisciNodoId);
  }
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
    parteId: parte.id,
    slotId: slot.id,
    matcher: slot.matcher || null,
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
    parteId: parte.id,
    slotId: slot.id,
    matcher: null,
    titolo: slot.titolo,
    puntiMax: completo ? slot.punti : null,
    puntiUfficiali: slot.punti,
    motivo: completo ? null : messaggioBundleIncompleto(slot.titolo, mancanti),
    consegne: trovati,
    mancantiConsegne: mancanti.slice(),
  };
}

export function generaProva(nodi, { seed, now = 0, profiloId = PROFILO_PREDEFINITO_ID, durataMinuti = null, modalita = 'simulazione' } = {}) {
  if (!Number.isInteger(seed)) throw new TypeError('seed intero obbligatorio');
  if (!MODALITA_VALIDE.includes(modalita)) throw new RangeError(`modalità non valida: ${modalita} (allenamento|simulazione)`);
  const profilo = getProfilo(profiloId);
  const durataMs = durataMsPerProfilo(profilo, durataMinuti);
  const rng = mulberry32(seed);
  let pool = catalogoEsercizi(nodi);
  const parti = partiDelProfilo(profilo).map((parte) => {
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
      const scelto = scegli(rng, pool, slot.match, slot.punti, slot.preferisciNodoId || null);
      if (!scelto) {
        mancanti.push({ id: slot.id, titolo: slot.titolo, messaggio: messaggioSlotVuoto(slot.titolo) });
        continue;
      }
      pool = senza(pool, scelto);
      quesiti.push(quesitoSingolo(parte, slot, scelto));
    }
    return {
      id: parte.id, titolo: parte.titolo, punti: parte.punti, puntiIntervallo: parte.puntiIntervallo,
      minuti: parte.minuti, minutiIntervallo: parte.minutiIntervallo, quesiti, mancanti,
    };
  });
  const coperta = parti.every((p) => p.mancanti.length === 0 && p.quesiti.every((q) => q.puntiMax != null && q.mancantiConsegne.length === 0));
  return {
    fontePunteggi: profilo.id === PROFILO_PREDEFINITO_ID ? FONTE_PUNTEGGI : profilo.fonte,
    fonteProfilo: profilo.fonte,
    profiloId: profilo.id,
    profiloTitolo: profilo.titolo,
    modalita,
    durataMs,
    durataMinuti: durataMs / 60000,
    puntiTotali: profilo.puntiTotali,
    sogliaSufficienza: profilo.sogliaSufficienza,
    calcolaVoto: profilo.calcolaVoto,
    motivoVotoAssente: profilo.motivoVotoAssente,
    seed,
    generataIl: now,
    coperta,
    parti,
  };
}
