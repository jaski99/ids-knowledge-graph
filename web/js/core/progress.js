// Calcolo del progresso per area e totale (funzioni pure).
export function computeProgress(nodes, aree, doneSet) {
  const blank = () => ({ fatti: 0, totale: 0, minFatti: 0, minTotali: 0 });
  const perArea = new Map(aree.map((a) => [a.id, { ...blank(), area: a }]));
  const tot = blank();
  for (const n of nodes) {
    const acc = perArea.get(n.area);
    const done = doneSet.has(n.id);
    for (const r of [acc, tot]) {
      if (!r) continue;
      r.totale += 1; r.minTotali += n.tempo_studio_min;
      if (done) { r.fatti += 1; r.minFatti += n.tempo_studio_min; }
    }
  }
  const fin = (r) => ({ ...r, minResidui: r.minTotali - r.minFatti, perc: r.totale ? Math.round((100 * r.fatti) / r.totale) : 0 });
  return { totale: fin(tot), aree: [...perArea.values()].map(fin) };
}

export function formatMinuti(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}
