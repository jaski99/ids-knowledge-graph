// Adattatore opzionale verso X6. Non interpreta né scrive gli esiti del simulatore.
export const ESITI_KEY = 'ids-kg:esiti-simulatore:v1';

export async function caricaEsiti(storage, load = () => import('../../modules/simulatore/esiti.js')) {
  try {
    // Su main, prima di X6, il modulo non c'è ancora. Non richiederlo se non ci sono esiti.
    if (!storage.getItem(ESITI_KEY)) return { esiti: [], disponibile: true };
    const { leggiEsiti } = await load();
    if (typeof leggiEsiti !== 'function') throw new TypeError('leggiEsiti non disponibile');
    const esiti = leggiEsiti(storage);
    return { esiti: Array.isArray(esiti) ? esiti : [], disponibile: true };
  } catch {
    return { esiti: [], disponibile: false };
  }
}
