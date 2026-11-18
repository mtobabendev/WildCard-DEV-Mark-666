export const PERFORMANCE_MODES = Object.freeze(['auto', 'cinematic', 'balanced', 'lightweight']);
const KEY = 'wildcard-performance';
export const PROFILES = Object.freeze({
  cinematic: Object.freeze({ name: 'cinematic', skipIntro: false, releaseOffscreen: false, selectedSpinnerOnly: false, reduceEffects: false }),
  balanced: Object.freeze({ name: 'balanced', skipIntro: true, releaseOffscreen: true, selectedSpinnerOnly: true, reduceEffects: true }),
  lightweight: Object.freeze({ name: 'lightweight', skipIntro: true, releaseOffscreen: true, selectedSpinnerOnly: true, reduceEffects: true }),
});

export function detectPerformance({ userAgent = '', platform = '', deviceMemory, saveData = false } = {}) {
  if (/\bAFT[A-Z0-9]+\b|\bFire\s?TV\b/i.test(userAgent)) return 'lightweight';
  if (saveData || (Number.isFinite(deviceMemory) && deviceMemory <= 2)) return 'lightweight';
  if ((Number.isFinite(deviceMemory) && deviceMemory <= 4)
    || (/linux/i.test(userAgent + ' ' + platform) && /arm|aarch64/i.test(platform) && !/android/i.test(userAgent))) return 'balanced';
  return 'cinematic';
}

export function resolvePerformance(signals, preference = 'auto') {
  return PROFILES[PERFORMANCE_MODES.includes(preference) && preference !== 'auto'
    ? preference : detectPerformance(signals)];
}

let cached;
let preference = 'auto';
export function initializePerformance(win = globalThis.window, doc = globalThis.document) {
  if (cached) return cached;
  if (!win || !doc) return PROFILES.cinematic;
  try { preference = win.localStorage.getItem(KEY) || 'auto'; } catch {}
  try {
    const query = new URL(win.location.href).searchParams.get('performance');
    if (PERFORMANCE_MODES.includes(query)) preference = query;
  } catch {}
  if (!PERFORMANCE_MODES.includes(preference)) preference = 'auto';
  const nav = win.navigator;
  cached = resolvePerformance({
    userAgent: nav.userAgent, platform: nav.platform, deviceMemory: nav.deviceMemory,
    saveData: Boolean(nav.connection?.saveData),
  }, preference);
  doc.documentElement.dataset.performance = cached.name;
  return cached;
}
export const getPerformance = () => initializePerformance();
export function getPerformancePreference() { initializePerformance(); return preference; }
export function selectPerformance(value, win = globalThis.window) {
  if (!PERFORMANCE_MODES.includes(value) || !win) return;
  const url = new URL(win.location.href);
  try {
    win.localStorage.setItem(KEY, value);
    url.searchParams.delete('performance');
  } catch {
    url.searchParams.set('performance', value);
  }
  // A reload applies the new decoder and layout policy consistently.
  win.location.assign(url.href);
}
