// Registro delle viste di navigazione. Nessuno stato globale: createViewRegistry()
// restituisce un'istanza, e `navigation` è quella usata dall'app.
// I moduli extra (per esempio il simulatore) la importano e chiamano register().

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function createViewRegistry() {
  const views = [];
  const listeners = new Set();

  function register(view) {
    if (!view || typeof view !== 'object') throw new TypeError('vista: oggetto richiesto');
    if (typeof view.id !== 'string' || !ID_RE.test(view.id)) {
      throw new TypeError('vista: id kebab-case obbligatorio');
    }
    if (typeof view.title !== 'string' || !view.title.trim()) {
      throw new TypeError('vista: title obbligatorio');
    }
    if (view.mount != null && typeof view.mount !== 'function') {
      throw new TypeError('vista: mount deve essere una funzione');
    }
    if (views.some((v) => v.id === view.id)) throw new Error(`vista già registrata: ${view.id}`);
    const entry = { id: view.id, title: view.title.trim(), mount: view.mount || null };
    views.push(entry);
    for (const fn of listeners) fn(entry);
    return entry;
  }

  return {
    register,
    list() { return views.map((v) => ({ ...v })); },
    get(id) { return views.find((v) => v.id === id) || null; },
    /** Chiama fn per le viste già presenti e per ogni registrazione successiva. */
    subscribe(fn) {
      for (const v of views) fn(v);
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** Istanza condivisa: i moduli si registrano qui, main.js la monta. */
export const navigation = createViewRegistry();
