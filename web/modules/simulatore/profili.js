// Profili d'esame del simulatore. Solo i punti, le durate e le soglie della
// tabella 1.2 di docs/IMPROVEMENT_PLAN.md (fonti: docs/EXAM_FORMAT.md,
// docs/DATI_PROVE_GUERRA.md citato come «sintesi dell'utente», R3 [S1] e [S6]).
// Dove la fonte non riporta i punti di uno slot, lo slot ha punti: null e il
// simulatore non calcola un voto per quel profilo. Nessun altro numero.

export const DURATE_CONSENTITE_MINUTI = Object.freeze([75, 80, 120, 135]);

export const PROFILO_PREDEFINITO_ID = 'prova-2025-11-05';

function congela(valore) {
  if (valore && typeof valore === 'object') {
    for (const v of Object.values(valore)) congela(v);
    Object.freeze(valore);
  }
  return valore;
}

const SLOT_DESIGN_BASE = [
  { id: 'classi', titolo: 'Diagramma delle classi', punti: null, matcher: 'classi' },
  { id: 'sequence', titolo: 'Diagramma di sequenza', punti: null, matcher: 'sequence' },
  { id: 'activity', titolo: 'Diagramma di attività', punti: null, matcher: 'activity' },
  { id: 'state', titolo: 'Diagramma di stato', punti: null, matcher: 'state' },
  { id: 'usecase', titolo: "Casi d'uso", punti: null, matcher: 'usecase' },
  { id: 'pattern', titolo: 'Design pattern', punti: null, matcher: 'pattern' },
];

export const PROFILI = congela([
  {
    id: 'prova-2025-11-05',
    titolo: 'Prova del 5/11/2025',
    fonte: 'Prova del 5/11/2025 (docs/EXAM_FORMAT.md)',
    durataPredefinitaMinuti: 120,
    puntiTotali: 30,
    sogliaSufficienza: 17,
    calcolaVoto: true,
    motivoVotoAssente: null,
    nota: 'Sufficienza oltre 17/30, nessun materiale. È il profilo predefinito.',
    parti: [
      {
        id: 'design', titolo: 'Parte 1 — Design', punti: 16, puntiIntervallo: null, minuti: 60, minutiIntervallo: null,
        slot: [
          { id: 'classi', titolo: '1.1 Diagramma delle classi', punti: 5, matcher: 'classi' },
          {
            id: 'comportamento', titolo: '1.2 Sequenza, attività e stati', punti: 5,
            bundle: [
              { id: 'sequence', etichetta: 'Diagramma di sequenza', matcher: 'sequence' },
              { id: 'activity', etichetta: 'Diagramma di attività', matcher: 'activity' },
              { id: 'state', etichetta: 'Diagramma di stato', matcher: 'state' },
            ],
          },
          { id: 'usecase', titolo: "1.3 Casi d'uso", punti: 2, matcher: 'usecase' },
          { id: 'pattern', titolo: '1.4 Design pattern', punti: 4, matcher: 'pattern' },
        ],
      },
      {
        id: 'testing', titolo: 'Parte 2 — Testing', punti: 3, puntiIntervallo: null, minuti: 10, minutiIntervallo: null,
        slot: [
          { id: 'bva', titolo: 'Classi di equivalenza e valori limite', punti: 3, matcher: 'testing' },
        ],
      },
      {
        id: 'teoria', titolo: 'Parte 3 — Teoria', punti: 11, puntiIntervallo: null, minuti: 30, minutiIntervallo: null,
        slot: [
          { id: 'debug', titolo: 'Debugging', punti: 3, matcher: 'debug' },
          { id: 'factory', titolo: 'Simple Factory', punti: 2, matcher: 'factory' },
          { id: 'whitebox', titolo: 'White box e decision coverage', punti: 2, matcher: 'whitebox' },
          { id: 'cfg', titolo: 'Diagramma di flusso e coperture', punti: 4, matcher: 'cfg' },
        ],
      },
    ],
  },
  {
    id: 'fac-simile-2016-17',
    titolo: 'Fac-simile 2016/17',
    fonte: 'Fac-simile 2016/17 (docs/EXAM_FORMAT.md); soluzione ufficiale 1.4: Composite',
    durataPredefinitaMinuti: 120,
    puntiTotali: 30,
    sogliaSufficienza: null,
    calcolaVoto: false,
    motivoVotoAssente: 'I punti delle singole domande di teoria del fac-simile non sono documentati: il simulatore non calcola un voto su 30 per questo profilo.',
    nota: 'La 1.4 pesca preferibilmente l\u2019esercizio Composite del fac-simile, se presente nel grafo.',
    parti: [
      {
        id: 'design', titolo: 'Parte 1 — Design', punti: 13, puntiIntervallo: null, minuti: 60, minutiIntervallo: null,
        slot: [
          {
            id: 'classi-usecase', titolo: "1.1 Casi d'uso e diagramma delle classi", punti: 3,
            bundle: [
              { id: 'usecase', etichetta: "Casi d'uso", matcher: 'usecase' },
              { id: 'classi', etichetta: 'Diagramma delle classi', matcher: 'classi' },
            ],
          },
          { id: 'sequence', titolo: '1.2 Diagramma di sequenza', punti: 3, matcher: 'sequence' },
          { id: 'activity', titolo: '1.3 Diagramma di attività', punti: 2, matcher: 'activity' },
          { id: 'pattern', titolo: '1.4 Design pattern', punti: 5, matcher: 'pattern', preferisciNodoId: 'design-pattern-composite' },
        ],
      },
      {
        id: 'testing', titolo: 'Parte 2 — Testing', punti: 7, puntiIntervallo: null, minuti: 20, minutiIntervallo: null,
        slot: [
          { id: 'bva', titolo: 'Classi di equivalenza e valori limite', punti: 7, matcher: 'testing' },
        ],
      },
      {
        id: 'teoria', titolo: 'Parte 3 — Teoria', punti: 10, puntiIntervallo: null, minuti: 40, minutiIntervallo: null,
        slot: [
          { id: 'teoria', titolo: 'Domanda di teoria', punti: null, matcher: 'teoria' },
        ],
      },
    ],
  },
  {
    id: 'prova-2017-01-13',
    titolo: 'Prova del 13/01/2017',
    fonte: 'Prova 13/01/2017 [S6, Studocu, fonte terza] (docs/research/R3-programma-unimore.md)',
    durataPredefinitaMinuti: 135,
    puntiTotali: 30,
    sogliaSufficienza: null,
    calcolaVoto: false,
    motivoVotoAssente: 'I punti per singola consegna della prova 13/01/2017 non sono riportati nella fonte [S6]: gli slot non hanno punti e il simulatore non calcola un voto.',
    nota: 'Fonte terza (Studocu), non deposito ufficiale: punti noti solo per parte (14, 6, 10).',
    parti: [
      {
        id: 'design', titolo: 'Parte 1 — Design', punti: 14, puntiIntervallo: null, minuti: 70, minutiIntervallo: null,
        slot: SLOT_DESIGN_BASE,
      },
      {
        id: 'testing', titolo: 'Parte 2 — Testing', punti: 6, puntiIntervallo: null, minuti: 20, minutiIntervallo: null,
        slot: [
          { id: 'bva', titolo: 'Classi di equivalenza e valori limite', punti: null, matcher: 'testing' },
        ],
      },
      {
        id: 'teoria', titolo: 'Parte 3 — Teoria', punti: 10, puntiIntervallo: null, minuti: 30, minutiIntervallo: null,
        slot: [
          { id: 'teoria', titolo: 'Domanda di teoria', punti: null, matcher: 'teoria' },
        ],
      },
    ],
  },
  {
    id: 'sintesi-utente-2017-2025',
    titolo: 'Sintesi utente 2017–2025',
    fonte: 'Sintesi dell\u2019utente 2017–2025 [D1 §1] (docs/DATI_PROVE_GUERRA.md), citata come sintesi dell\u2019utente',
    durataPredefinitaMinuti: 120,
    puntiTotali: null,
    sogliaSufficienza: null,
    calcolaVoto: false,
    motivoVotoAssente: 'La sintesi dell\u2019utente riporta intervalli di punti per parte, senza un totale unico: il simulatore mostra gli intervalli e non calcola un totale né un voto.',
    nota: 'Soglia riportata dalla sintesi dell\u2019utente: >17/30 oppure >18/20 a seconda dell\u2019appello; nessuna soglia unica è applicata. Durate storiche: 1h15, 1h20, 2h o 2h15.',
    parti: [
      {
        id: 'design', titolo: 'Parte 1 — Design', punti: null, puntiIntervallo: [14, 16], minuti: null, minutiIntervallo: [60, 85],
        slot: SLOT_DESIGN_BASE,
      },
      {
        id: 'testing', titolo: 'Parte 2 — Testing', punti: null, puntiIntervallo: [3, 5], minuti: null, minutiIntervallo: [10, 20],
        slot: [
          { id: 'bva', titolo: 'Classi di equivalenza e valori limite', punti: null, matcher: 'testing' },
        ],
      },
      {
        id: 'teoria', titolo: 'Parte 3 — Teoria', punti: null, puntiIntervallo: [10, 11], minuti: 30, minutiIntervallo: null,
        slot: [
          { id: 'teoria', titolo: 'Domanda di teoria', punti: null, matcher: 'teoria' },
        ],
      },
    ],
  },
  {
    id: 'scheda-2026-27',
    titolo: 'Scheda 2026/27',
    fonte: 'Scheda 2026/27 [S1] (docs/research/R3-programma-unimore.md)',
    durataPredefinitaMinuti: 120,
    puntiTotali: null,
    sogliaSufficienza: null,
    calcolaVoto: false,
    motivoVotoAssente: 'La scheda 2026/27 dichiara pesi 30%/55%/55% (somma 140%): il simulatore non calcola un voto per questo profilo e lo segnala.',
    nota: 'Scritto di 2 ore con 3–4 domande aperte, esercizi di design con UML e pattern ed esercizi su una funzione; tesina individuale separata, non simulata qui. Il simulatore propone 3 domande aperte (minimo dell\u2019intervallo documentato).',
    parti: [
      {
        id: 'design', titolo: 'Parte 1 — Design', punti: null, puntiIntervallo: null, minuti: null, minutiIntervallo: null,
        slot: [
          ...SLOT_DESIGN_BASE,
          { id: 'package', titolo: 'Diagramma dei package', punti: null, matcher: 'package' },
        ],
      },
      {
        id: 'testing', titolo: 'Parte 2 — Testing', punti: null, puntiIntervallo: null, minuti: null, minutiIntervallo: null,
        slot: [
          { id: 'bva', titolo: 'Esercizio su una funzione (classi di equivalenza e valori limite)', punti: null, matcher: 'testing' },
        ],
      },
      {
        id: 'teoria', titolo: 'Parte 3 — Teoria', punti: null, puntiIntervallo: null, minuti: null, minutiIntervallo: null,
        slot: [
          { id: 'teoria-1', titolo: 'Domanda aperta 1', punti: null, matcher: 'teoria' },
          { id: 'teoria-2', titolo: 'Domanda aperta 2', punti: null, matcher: 'teoria' },
          { id: 'teoria-3', titolo: 'Domanda aperta 3', punti: null, matcher: 'teoria' },
        ],
      },
    ],
  },
]);

export function getProfilo(id) {
  const profilo = PROFILI.find((p) => p.id === id);
  if (!profilo) throw new RangeError(`profilo sconosciuto: ${id}`);
  return profilo;
}

export function durataValida(minuti) {
  return DURATE_CONSENTITE_MINUTI.includes(minuti);
}

export function durataMsPerProfilo(profilo, minuti) {
  const scelta = minuti == null ? profilo.durataPredefinitaMinuti : minuti;
  if (!durataValida(scelta)) {
    throw new RangeError(`durata non consentita: ${minuti} minuti (consentite: ${DURATE_CONSENTITE_MINUTI.join(', ')})`);
  }
  return scelta * 60 * 1000;
}

export function testoPuntiParte(parte) {
  if (typeof parte.punti === 'number') return `${parte.punti} punti`;
  if (Array.isArray(parte.puntiIntervallo)) return `${parte.puntiIntervallo[0]}–${parte.puntiIntervallo[1]} punti (intervallo, sintesi dell\u2019utente)`;
  return 'punti non riportati dalla fonte';
}

export function testoMinutiParte(parte) {
  if (typeof parte.minuti === 'number') return `circa ${parte.minuti} minuti`;
  if (Array.isArray(parte.minutiIntervallo)) return `${parte.minutiIntervallo[0]}–${parte.minutiIntervallo[1]} minuti`;
  return 'tempo per parte non riportato dalla fonte';
}
