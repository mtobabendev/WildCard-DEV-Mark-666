import { decorativeVideoBudget } from './decorative-video-budget.js';
export const PERFORMANCE_MODES = Object.freeze(['auto', 'cinematic', 'balanced', 'lightweight']);
const KEY = 'wildcard-performance';
export const PROFILES = Object.freeze({
  cinematic: Object.freeze({ name: 'cinematic', skipIntro: false, releaseOffscreen: false, selectedSpinnerOnly: false, reduceEffects: false, decorativeLimit: Infinity }),
  balanced: Object.freeze({ name: 'balanced', skipIntro: true, releaseOffscreen: true, selectedSpinnerOnly: true, reduceEffects: true, decorativeLimit: 2 }),
  lightweight: Object.freeze({ name: 'lightweight', skipIntro: true, releaseOffscreen: true, selectedSpinnerOnly: true, reduceEffects: true, decorativeLimit: 1 }),
});

export function detectPerformance({ userAgent = '', platform = '', deviceMemory, hardwareConcurrency, saveData = false } = {}) {
  if (/\bAFT[A-Z0-9]+\b|\bFire\s?TV\b/i.test(userAgent)) return 'lightweight';
  if (saveData || (Number.isFinite(deviceMemory) && deviceMemory <= 2)) return 'lightweight';
  if (/linux/i.test(userAgent + ' ' + platform) && /arm|aarch64/i.test(userAgent + ' ' + platform) && !/android/i.test(userAgent)) return 'lightweight';
  // Chromium may mask ARM as x86_64. Four-core Linux desktops are a conservative low-end default.
  if (/linux/i.test(userAgent + ' ' + platform) && !/android/i.test(userAgent) && Number.isFinite(hardwareConcurrency) && hardwareConcurrency <= 4) return 'lightweight';
  if ((Number.isFinite(deviceMemory) && deviceMemory <= 4) || (Number.isFinite(hardwareConcurrency) && hardwareConcurrency <= 4)) return 'balanced';
  return 'cinematic';
}

export function resolvePerformance(signals, preference = 'auto') {
  return PROFILES[PERFORMANCE_MODES.includes(preference) && preference !== 'auto'
    ? preference : detectPerformance(signals)];
}

let cached;
let preference = 'auto';
const listeners = new Set();
export function subscribePerformance(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function lowerPerformanceProfile(profile) { return profile.name === 'cinematic' ? PROFILES.balanced : PROFILES.lightweight; }
function applyPerformance(profile, doc) {
  cached = profile;
  doc.documentElement.dataset.performance = profile.name;
  decorativeVideoBudget.setLimit(profile.decorativeLimit);
  listeners.forEach(listener => listener());
}
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
  const profile = resolvePerformance({
    userAgent: nav.userAgent, platform: nav.platform, deviceMemory: nav.deviceMemory, hardwareConcurrency: nav.hardwareConcurrency,
    saveData: Boolean(nav.connection?.saveData),
  }, preference);
  applyPerformance(profile, doc);
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

// Bounded sampling: downgrade only after two consecutive slow windows. No telemetry or reload.
export function startAdaptivePerformance(win=globalThis.window, doc=globalThis.document) {
  if (!win || !doc || preference !== 'auto' || getPerformance().name === 'lightweight' || !win.requestAnimationFrame) return () => {};
  let frame=0, timer=0, previous=0, elapsed=0, samples=0, slow=0, windows=0, stopped=false;
  const reset=()=>{previous=0;elapsed=0;samples=0;};
  const schedule=()=>{timer=win.setTimeout(()=>{if(!stopped && !doc.hidden){reset();frame=win.requestAnimationFrame(tick);}},2500);};
  const tick=time=>{
    if(stopped || doc.hidden) return;
    if(previous){elapsed+=time-previous;samples++;} previous=time;
    if(elapsed<1600){frame=win.requestAnimationFrame(tick);return;}
    slow = samples*1000/elapsed < 28 ? slow+1 : 0; windows++;
    if(slow>=2){applyPerformance(lowerPerformanceProfile(getPerformance()),doc);slow=0;}
    if(windows<6 && getPerformance().name!=='lightweight')schedule();
  };
  const visibility=()=>{win.cancelAnimationFrame(frame);win.clearTimeout(timer);reset();slow=0;if(!doc.hidden && windows<6 && getPerformance().name!=='lightweight')schedule();};
  doc.addEventListener('visibilitychange',visibility); if(!doc.hidden)schedule();
  return ()=>{stopped=true;win.cancelAnimationFrame(frame);win.clearTimeout(timer);doc.removeEventListener('visibilitychange',visibility);};
}
