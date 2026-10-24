// Testo ricercabile di una lezione e regola della scorciatoia "/".
// La normalizzazione (minuscole, accenti) resta in filters.js.

function pieces(value) {
  if (value == null) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(pieces);
  if (typeof value === 'object') return Object.values(value).flatMap(pieces);
  return [];
}

/** Tutto il testo della lezione, campi annidati inclusi. Stringa vuota se manca. */
export function lessonPlainText(node) {
  const lesson = node && node.lezione;
  if (!lesson || typeof lesson !== 'object') return '';
  return pieces(lesson).join(' ');
}

const TYPING = new Set(['input', 'textarea', 'select']);

/**
 * True se "/" deve spostare il focus sulla ricerca.
 * Shift è ammesso: sulle tastiere italiane "/" è Maiusc+7.
 */
export function eventShouldFocusSearch(event) {
  if (!event || event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return false;
  const target = event.target;
  if (!target || !target.tagName) return true;
  if (TYPING.has(String(target.tagName).toLowerCase())) return false;
  if (target.isContentEditable) return false;
  return true;
}
