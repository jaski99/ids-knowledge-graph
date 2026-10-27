// Schede accessibili (ARIA tabs, frecce sinistra/destra).
// bind() permette di aggiungere schede dopo l'avvio (viste registrate).

export function tabTargetIndex(key, current, count) {
  if (count <= 0 || current < 0 || current >= count) return null;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  if (key === 'ArrowRight') return (current + 1) % count;
  if (key === 'ArrowLeft') return (current - 1 + count) % count;
  return null;
}
export function initTabs(doc, onShow) {
  const tablist = doc.querySelector('[role="tablist"]');
  const tabs = () => [...tablist.querySelectorAll('[role="tab"]')];
  const show = (tab) => {
    for (const t of tabs()) {
      const on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const panel = doc.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    }
    onShow(tab.dataset.tab);
  };
  const onKey = (e) => {
    const list = tabs();
    const i = list.indexOf(e.currentTarget);
    const next = tabTargetIndex(e.key, i, list.length);
    if (next === null) return;
    e.preventDefault();
    const n = list[next];
    n.focus();
    show(n);
  };
  const bound = new WeakSet();
  const bind = (tab) => {
    if (bound.has(tab)) return;
    bound.add(tab);
    tab.addEventListener('click', () => show(tab));
    tab.addEventListener('keydown', onKey);
  };
  tabs().forEach(bind);
  return { show, bind };
}
