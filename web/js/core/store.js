// Persistenza di insiemi di id (storage iniettabile per i test).
export function createSetStore(storage, key) {
  const read = () => {
    try { const v = JSON.parse(storage.getItem(key) || '[]'); return new Set(Array.isArray(v) ? v : []); }
    catch { return new Set(); }
  };
  let set = read();
  const save = () => { try { storage.setItem(key, JSON.stringify([...set])); } catch { /* quota o privacy mode */ } };
  return {
    has: (id) => set.has(id),
    values: () => new Set(set),
    toggle(id, on = !set.has(id)) { on ? set.add(id) : set.delete(id); save(); return on; },
    clear() { set = new Set(); save(); },
  };
}

export const memoryStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
