// Stato applicativo minimale con pub/sub: le viste dipendono solo da questo.
export function createState(initial) {
  let s = { ...initial };
  const subs = new Set();
  return {
    get: () => s,
    set(patch) { s = { ...s, ...patch }; subs.forEach((f) => f(s)); },
    subscribe(f) { subs.add(f); return () => subs.delete(f); },
  };
}
