// Percorsi costruiti dal contenuto e dalla mappatura facoltativa, mai da liste di id.
// L'ordine dei temi viene dalla sintesi dell'utente (docs/DATI_PROVE_GUERRA.md §6).
const norm = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const PERCORSI_ESAME = Object.freeze([
  { id: 'testing', titolo: 'Testing meccanico', re: /testing|black.box|white.box|equivalenz|boundary|bva|cfg|flusso di controllo|copertura|coverage|path analysis|m.c.dc/ },
  { id: 'classi', titolo: 'Class Diagram', re: /class diagram|diagramm[ao] (?:uml )?(?:delle |dei )?classi|associazion|molteplicita/ },
  { id: 'pattern', titolo: 'Pattern', re: /pattern|decorator|template method|observer|factory|strategy|builder/ },
  { id: 'dinamici', titolo: 'Diagrammi dinamici', re: /sequenz[ae]|sequence|attivita|activity|stati|state (?:machine|diagram)|cas[oi] d['’]uso|use.case/ },
  { id: 'teoria', titolo: 'Teoria', re: /teori[ac]|parte 3|domanda (?:breve|d.esame|di esame)|debugging|refactoring|requisiti|clean architecture|coesione|ottimizzazione/ },
]);

// L'output di X1 è facoltativo. Accettiamo sia una lista di voci sia un oggetto
// di voci, e associamo la parte d'esame ai soli id effettivamente presenti nelle voci.
export function indicizzaProgramma(programma) {
  const byId = new Map();
  const walk = (entry, inherited = '') => {
    if (!entry || typeof entry !== 'object') return;
    if (Array.isArray(entry)) { entry.forEach((item) => walk(item, inherited)); return; }
    const campi = [entry.titolo, entry.voce, entry.nome, entry.parte_esame, entry.parti_esame, entry.parte]
      .flat().filter((v) => typeof v === 'string').join(' ');
    const descrizione = `${inherited} ${campi}`.trim();
    for (const key of ['nodi', 'nodi_id', 'nodi_ids', 'id_nodi']) {
      if (!Array.isArray(entry[key])) continue;
      for (const item of entry[key]) {
        const id = typeof item === 'string' ? item : item?.id;
        if (typeof id === 'string') byId.set(id, `${byId.get(id) || ''} ${descrizione}`.trim());
      }
    }
    for (const [key, value] of Object.entries(entry)) {
      if (!['nodi', 'nodi_id', 'nodi_ids', 'id_nodi'].includes(key) && typeof value === 'object') walk(value, descrizione);
    }
  };
  walk(programma);
  return byId;
}

function testoTemi(n) {
  // Non indicizziamo l'intera lezione qui: citare un tema non significa essere quel tema.
  return norm([n.title, ...(n.esercizi || []).map((e) => e.tipo_esame)].join(' '));
}

/** Mantiene l'ordine topologico già ordinato per priorità; categorie sovrapponibili. */
export function costruisciPercorsi(graph) {
  const byId = graph.byId || new Map((graph.nodi || []).map((n) => [n.id, n]));
  const order = graph.order || [...byId.keys()];
  const programma = indicizzaProgramma(graph.programma);
  return PERCORSI_ESAME.map(({ id, titolo, re }) => ({
    id, titolo,
    nodi: order.map((nodeId) => byId.get(nodeId)).filter((n) => {
      if (!n) return false;
      const tema = testoTemi(n);
      const meta = norm(programma.get(n.id));
      // La mappatura può specificare Testing o Teoria senza nominarli nel titolo.
      const daMappa = n.priorita?.livello === 'alta' && (
        (id === 'testing' && /\btesting\b/.test(meta)) ||
        (id === 'teoria' && /\bteoria\b/.test(meta))
      );
      return re.test(tema) || daMappa;
    }),
  }));
}
