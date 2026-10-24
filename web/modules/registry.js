// Registro viste. API stabile e minima: register({ id, titolo, render }) e getAll().
const views = [];

function valido(view) {
  return Boolean(view)
    && typeof view.id === 'string' && view.id.trim() !== ''
    && typeof view.titolo === 'string' && view.titolo.trim() !== ''
    && typeof view.render === 'function';
}

export function register(view) {
  if (!valido(view)) throw new TypeError('register richiede { id, titolo, render }');
  const i = views.findIndex((v) => v.id === view.id);
  if (i >= 0) views[i] = view;
  else views.push(view);
  return view;
}

export function getAll() {
  return views.slice();
}
