// Autovalutazione: punti interi assegnati dall'utente, mai ricalcolati al posto suo.

export function leggiPunti(raw, max) {
  if (raw == null) return { ok: false, motivo: 'vuoto' };
  const s = String(raw).trim();
  if (s === '') return { ok: false, motivo: 'vuoto' };
  const n = typeof raw === 'number' ? raw : Number(s.replace(',', '.'));
  if (!Number.isFinite(n)) return { ok: false, motivo: 'non numerico' };
  if (!Number.isInteger(n)) return { ok: false, motivo: 'non intero' };
  if (n < 0 || n > max) return { ok: false, motivo: 'fuori scala' };
  return { ok: true, punti: n };
}

export function messaggioPunti(motivo, max) {
  if (motivo === 'vuoto') return '';
  if (motivo === 'non intero') return 'Solo punti interi.';
  if (motivo === 'fuori scala') return `Il punteggio deve stare tra 0 e ${max}.`;
  return 'Inserisci un numero intero.';
}

function giudizioValido(g, max) {
  return typeof g === 'number' && Number.isInteger(g) && g >= 0 && g <= max;
}

export function calcolaPunteggio(prova, giudizi = {}) {
  const parti = (prova.parti || []).map((parte) => {
    let ottenuti = 0;
    let maxValutabile = 0;
    let senzaGiudizio = 0;
    const daRipassare = [];
    for (const q of parte.quesiti || []) {
      if (typeof q.puntiMax !== 'number') continue;
      maxValutabile += q.puntiMax;
      const g = giudizi ? giudizi[q.id] : undefined;
      if (!giudizioValido(g, q.puntiMax)) { senzaGiudizio += 1; continue; }
      ottenuti += g;
      if (g < q.puntiMax) {
        for (const c of q.consegne || []) {
          daRipassare.push({
            nodoId: c.nodoId,
            nodoTitolo: c.nodoTitolo,
            area: c.area,
            quesitoId: q.id,
            titolo: q.titolo,
            etichetta: c.etichetta || q.titolo,
            ottenuti: g,
            puntiMax: q.puntiMax,
          });
        }
      }
    }
    return {
      id: parte.id,
      titolo: parte.titolo,
      ottenuti,
      maxValutabile,
      puntiUfficiali: parte.punti,
      senzaGiudizio,
      daRipassare,
      mancanti: parte.mancanti || [],
    };
  });
  const totale = {
    ottenuti: parti.reduce((s, p) => s + p.ottenuti, 0),
    maxValutabile: parti.reduce((s, p) => s + p.maxValutabile, 0),
    puntiUfficiali: prova.puntiTotali ?? 30,
    senzaGiudizio: parti.reduce((s, p) => s + p.senzaGiudizio, 0),
  };
  return { parti, totale };
}

export function nodiDaRipassare(risultato) {
  const map = new Map();
  for (const p of risultato.parti) {
    for (const d of p.daRipassare) {
      const cur = map.get(d.nodoId);
      if (!cur) map.set(d.nodoId, { nodoId: d.nodoId, nodoTitolo: d.nodoTitolo, area: d.area, voci: [d.etichetta] });
      else if (!cur.voci.includes(d.etichetta)) cur.voci.push(d.etichetta);
    }
  }
  return [...map.values()];
}

export function testoEsito(risultato, prova) {
  const t = risultato.totale;
  const righe = [t.maxValutabile > 0
    ? `Totale: ${t.ottenuti}/${t.maxValutabile} punti autovalutati.`
    : 'Totale non calcolabile: nessuno slot ha punti documentati, autovalutazione solo con rubrica.'];
  if (prova.calcolaVoto === false) {
    righe.push(prova.motivoVotoAssente || 'Per questo profilo non calcolo un voto: mancano punti documentati per tutti gli slot.');
    if (!prova.coperta) righe.push('Inoltre la prova non copre tutte le voci: nel grafo mancano degli esercizi per alcuni slot, dichiarati come vuoti.');
  } else if (!prova.coperta) righe.push('La prova non copre tutte le voci ufficiali: nel grafo mancano degli esercizi, quindi il totale non è su 30.');
  if (t.senzaGiudizio > 0) {
    const voce = t.senzaGiudizio === 1 ? 'voce senza punteggio' : 'voci senza punteggio';
    righe.push(`Autovalutazione incompleta: ${t.senzaGiudizio} ${voce}.`);
  } else if (prova.coperta && prova.calcolaVoto !== false) {
    righe.push(t.ottenuti > prova.sogliaSufficienza
      ? 'Sopra la soglia di sufficienza della prova 2025 (più di 17 su 30).'
      : 'Sotto la soglia di sufficienza della prova 2025 (serve più di 17 su 30).');
  }
  return righe;
}
