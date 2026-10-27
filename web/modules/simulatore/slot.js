// Riconoscimento degli slot: id del nodo + prefisso di tipo_esame.
// Contratto 4.1 (docs/IMPROVEMENT_PLAN.md): le banche di X3 si riconoscono
// SOLO se coincidono sia l'id del nodo sia il prefisso di tipo_esame, che
// deve terminare con « (<fonte>)». Gli esercizi esistenti usano i matcher
// storici della prova 2025. Nessun testo viene inventato qui.

export const BANCA_PATTERN_ID = 'banca-esercizi-pattern-guerra';
export const BANCA_TESTING_ID = 'banca-esercizi-bva-guerra';
export const BANCA_TEORIA_ID = 'banca-domande-teoria-guerra';

export const PREFISSO_BANCA_PATTERN = 'Parte 1 Design 1.4:';
export const PREFISSO_BANCA_TESTING = 'Parte 2 Testing: classi di equivalenza e boundary';
export const PREFISSO_BANCA_TEORIA = 'Parte 3 Teoria:';

const RE_FONTE_FINALE = /\([^()]+\)\s*$/;

const BANCHE = [
  { slot: 'pattern', nodoId: BANCA_PATTERN_ID, prefisso: PREFISSO_BANCA_PATTERN },
  { slot: 'testing', nodoId: BANCA_TESTING_ID, prefisso: PREFISSO_BANCA_TESTING },
  { slot: 'teoria', nodoId: BANCA_TEORIA_ID, prefisso: PREFISSO_BANCA_TEORIA },
];

export function riconosciBanca(esercizio) {
  if (!esercizio || typeof esercizio.nodoId !== 'string' || typeof esercizio.tipoEsame !== 'string') return null;
  if (!RE_FONTE_FINALE.test(esercizio.tipoEsame.trim())) return null;
  const banca = BANCHE.find((b) => b.nodoId === esercizio.nodoId && esercizio.tipoEsame.startsWith(b.prefisso));
  return banca ? banca.slot : null;
}

const t = (e) => (e.tipoEsame || '').toLowerCase();

function matchClassi(e) { return /class diagram/.test(t(e)) && !/molteplicit|verifica di coerenza/.test(t(e)); }
function matchSequence(e) { return /\bsequence\b/.test(t(e)); }
function matchActivity(e) { return /\bactivity\b/.test(t(e)); }
function matchState(e) { return /state diagram/.test(t(e)); }
function matchUseCase(e) { return /use case/.test(t(e)) && !/errori/.test(t(e)); }
function matchPackage(e) {
  return e.nodoId === 'uml-diagramma-package' || /package diagram|diagramma (dei|di) package/.test(t(e));
}
function matchPatternLegacy(e) { return /pattern\s*1\.4|1\.4 completo/.test(t(e)); }
function matchBlackBoxLegacy(e) {
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

function matchPattern(e) { return riconosciBanca(e) === 'pattern' || matchPatternLegacy(e); }
function matchTesting(e) { return riconosciBanca(e) === 'testing' || matchBlackBoxLegacy(e); }
function matchTeoria(e) {
  if (riconosciBanca(e) === 'teoria') return true;
  if (matchPatternLegacy(e)) return false;
  return /domanda|parte 3/.test(t(e));
}

const MATCHERS = {
  classi: matchClassi,
  sequence: matchSequence,
  activity: matchActivity,
  state: matchState,
  usecase: matchUseCase,
  package: matchPackage,
  pattern: matchPattern,
  testing: matchTesting,
  teoria: matchTeoria,
  debug: matchDebug,
  factory: matchFactory,
  whitebox: matchWhiteBox,
  cfg: matchCfg,
};

export function corrisponde(nome, esercizio) {
  const fn = MATCHERS[nome];
  if (!fn) throw new RangeError(`matcher sconosciuto: ${nome}`);
  return fn(esercizio);
}
