import { h } from './dom.js';
import { ankiTsv, creaBackup, importaBackup } from '../core/backup.js';

export function downloadFile(doc, name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url; a.download = name; a.hidden = true;
  doc.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function createBackupView(root, graph, { storage, confirm, reload, download = downloadFile }) {
  const doc = root.ownerDocument;
  const status = h('p', { class: 'muted', role: 'status' });
  const input = h('input', { type: 'file', accept: '.json,application/json', id: 'backup-file' });
  const data = h('details', { class: 'panel backup-panel' },
    h('summary', {}, h('h2', {}, 'Backup ed export')),
    h('p', { class: 'muted' }, 'I dati sono locali. Il backup include risposte e progressi: conservalo in un luogo privato.'),
    h('div', { class: 'backup-actions' },
      h('button', { type: 'button', class: 'btn', id: 'backup-export', onclick: () => {
        try { download(doc, 'ids-knowledge-graph-backup.json', 'application/json;charset=utf-8', JSON.stringify(creaBackup(storage), null, 2)); status.textContent = 'Backup pronto.'; }
        catch { status.textContent = 'Impossibile leggere i dati del browser.'; }
      } }, 'Scarica backup JSON'),
      h('button', { type: 'button', class: 'btn', id: 'anki-export', onclick: () => {
        download(doc, 'ids-knowledge-graph-anki.tsv', 'text/tab-separated-values;charset=utf-8', ankiTsv(graph.nodi));
        status.textContent = 'TSV pronto: contiene domande e soluzioni. Importa due campi in Anki.';
      } }, 'Esporta Anki TSV')),
    h('label', { class: 'backup-import' }, 'Ripristina backup JSON', input),
    h('button', { type: 'button', class: 'btn', id: 'backup-import', onclick: async () => {
      const file = input.files?.[0];
      if (!file) { status.textContent = 'Scegli prima un file JSON.'; return; }
      if (!confirm('Ripristinare i dati presenti nel backup, sovrascrivendo le stesse chiavi locali?')) return;
      try {
        const count = importaBackup(storage, await file.text());
        status.textContent = `Ripristinate ${count} chiavi. Ricarico l’applicazione.`;
        reload();
      } catch (error) { status.textContent = error.message; }
    } }, 'Ripristina'), status);
  root.replaceChildren(data);
  return { element: data };
}
