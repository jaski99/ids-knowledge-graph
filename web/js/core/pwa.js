/** Registra solo su origini sicure; l'assenza di PWA non blocca lo studio. */
export async function registraPwa(navigator, location) {
  if (!navigator?.serviceWorker || !location || !['https:', 'http:'].includes(location.protocol)) return false;
  if (location.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) return false;
  try { await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' }); return true; }
  catch { return false; }
}
