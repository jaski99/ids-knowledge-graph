// Registro condiviso delle viste. La API pubblica usa { id, titolo, render(container, ctx) }.
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createViewRegistry({ replace = false } = {}) {
  const views = [];
  const listeners = new Set();

  function register(input) {
    if (!input || typeof input !== 'object') throw new TypeError('vista: oggetto richiesto');
    const id = input.id;
    const titolo = input.titolo ?? input.title;
    const render = input.render ?? (input.mount
      ? (container, ctx) => input.mount(container, ctx)
      : null);
    if (typeof id !== 'string' || !ID_RE.test(id)) throw new TypeError('vista: id kebab-case obbligatorio');
    if (typeof titolo !== 'string' || !titolo.trim()) throw new TypeError('vista: titolo obbligatorio');
    if (typeof render !== 'function') throw new TypeError('vista: render deve essere una funzione');
    const prior = views.findIndex((view) => view.id === id);
    if (prior >= 0 && !replace) throw new Error(`vista già registrata: ${id}`);
    const view = Object.freeze({ id, titolo: titolo.trim(), render, title: titolo.trim(), mount: render });
    if (prior >= 0) views[prior] = view;
    else views.push(view);
    for (const listener of listeners) listener(view);
    return view;
  }
  return {
    register,
    getAll: () => views.slice(),
    list: () => views.slice(),
    get: (id) => views.find((view) => view.id === id) || null,
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('listener deve essere una funzione');
      views.forEach(listener);
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

// L'istanza applicativa permette ai moduli di registrare viste in modo idempotente.
export const navigation = createViewRegistry({ replace: true });
export const register = (view) => navigation.register(view);
export const getAll = () => navigation.getAll();
