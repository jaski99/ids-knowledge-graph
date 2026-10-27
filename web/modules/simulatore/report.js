// Report per parte e rubrica di autovalutazione. I punti li assegna sempre
// l'utente: qui non c'è nessuna correzione automatica e nessun confronto
// per parole chiave sulla risposta (keyword matching vietato dal piano).
import { calcolaPunteggio, nodiDaRipassare, testoEsito } from './punteggio.js';

const RUBRICA_DESIGN_BASE = [
  'Le classi, gli attributi e le operazioni rispondono al testo della consegna',
  'Molteplicità e direzione delle associazioni sono indicate su entrambi i lati',
  'Il diagramma è coerente con gli altri diagrammi della stessa prova (nomi, operazioni, stati)',
];
const RUBRICA_PATTERN = [
  'Il pattern scelto è motivato dallo scenario, non solo nominato',
  'È indicata almeno un\u2019alternativa scartata e perché non va bene qui',
  'Sono indicati i limiti del pattern e le classi Java minime sono coerenti col diagramma',
];
const RUBRICA_TESTING = [
  'Classi di equivalenza valide distinte per fascia e parametro principale dichiarato',
  'Classi non valide isolate: una sola condizione non valida per test, quando la consegna la definisce',
  'Valori limite solo sul parametro richiesto dalla consegna, con output atteso per ogni test',
];
const RUBRICA_TEORIA = [
  'Definizione esatta in 1–2 frasi, senza giri di parole',
  'Punti chiave completi e in ordine (fasi, principi o criteri richiesti)',
  'Un esempio concreto o un limite col paletto: la risposta dichiara quando la tecnica non basta',
];

export function vociRubrica(quesito, parteId) {
  const chiave = `${parteId || ''}:${quesito?.slotId || ''}`;
  if (parteId === 'testing' || /bva|testing/.test(chiave)) return [...RUBRICA_TESTING];
  if (parteId === 'teoria') return [...RUBRICA_TEORIA];
  if (/pattern/.test(chiave)) return [...RUBRICA_PATTERN, ...RUBRICA_DESIGN_BASE.slice(2)];
  return [...RUBRICA_DESIGN_BASE];
}

export function generaReport(prova, giudizi = {}) {
  const risultato = calcolaPunteggio(prova, giudizi);
  const parti = risultato.parti.map((parte) => ({
    ...parte,
    nodiDaRiaprire: nodiDaRipassare({ parti: [parte] }),
    valutabile: parte.maxValutabile > 0,
  }));
  return {
    parti,
    totale: risultato.totale,
    calcolaVoto: prova.calcolaVoto !== false,
    nodiDaRiaprire: nodiDaRipassare(risultato),
    righeTesto: testoEsito(risultato, prova),
  };
}
