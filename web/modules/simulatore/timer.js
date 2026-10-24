// Timer d'esame: 2 ore, il tempo in pausa non conta. Funzioni pure.

export const DURATA_ESAME_MS = 2 * 60 * 60 * 1000;

export function timerNuovo(now, durataMs = DURATA_ESAME_MS) {
  return { running: true, startedAt: now, elapsedMs: 0, durataMs };
}

function trascorso(timer, now) {
  if (!timer.running || typeof timer.startedAt !== 'number') return timer.elapsedMs;
  return timer.elapsedMs + Math.max(0, now - timer.startedAt);
}

export function leggiTimer(timer, now) {
  const used = Math.min(timer.durataMs, Math.max(0, trascorso(timer, now)));
  const rimanenti = timer.durataMs - used;
  const scaduto = rimanenti <= 0;
  return { trascorsoMs: used, rimanenti, scaduto, running: Boolean(timer.running) && !scaduto };
}

export function timerInPausa(timer, now) {
  if (!timer.running) return { ...timer };
  const used = Math.min(timer.durataMs, trascorso(timer, now));
  return { ...timer, running: false, startedAt: null, elapsedMs: used };
}

export function timerInCorso(timer, now) {
  const lett = leggiTimer(timer, now);
  if (lett.scaduto) return { ...timer, running: false, startedAt: null, elapsedMs: timer.durataMs };
  if (timer.running) return { ...timer };
  return { ...timer, running: true, startedAt: now };
}

export function formatTempo(ms) {
  const s = ms <= 0 ? 0 : Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}
