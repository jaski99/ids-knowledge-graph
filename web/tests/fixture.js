export const aree = [{ id: 1, titolo: 'A' }, { id: 2, titolo: 'B' }];
const n = (id, area, prereq = [], extra = {}) => ({ id, title: id.toUpperCase(), area, tipo: 'concetto', sapere: 's ' + id, saper_fare: ['fare ' + id],
  prerequisiti: prereq.map(([pid, forza = 'hard']) => ({ id: pid, forza, motivo: 'm' })), tempo_studio_min: 30, priorita: { livello: 'media', motivazione: 'x' }, risorse: [], ...extra });
export const nodi = () => [
  n('c', 1, [['a']]),
  n('b', 2, [], { tipo: 'abilita', priorita: { livello: 'alta', motivazione: 'x' }, tempo_studio_min: 60 }),
  n('a', 1),
  n('d', 2, [['b'], ['c', 'soft']], { sapere: 'Perché coesione' }),
];
export const graph = () => ({ versione: 3, aree, testi: {}, corso: {}, nodi: nodi() });
