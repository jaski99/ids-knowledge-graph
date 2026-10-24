// Schede accessibili (ARIA tabs, frecce sinistra/destra).
// bind() permette di aggiungere schede dopo l'avvio (viste registrate).
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
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d || i < 0) return;
    e.preventDefault();
    const n = list[(i + d + list.length) % list.length];
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
