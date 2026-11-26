const INTRO_KEY = 'wildcard-intro-seen-v1';
export function shouldSkipIntro(profile, win) {
  if (profile.skipIntro || win.location.pathname.replace(/\/+$/, '') === '/grimoire'
    || win.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  try { return win.sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; }
}
export function rememberIntro(win) {
  try { win.sessionStorage.setItem(INTRO_KEY, '1'); } catch {}
}
export function deferAnalytics(win, load) {
  let pending = true;
  let timer;
  const stop = () => {
    pending = false;
    win.clearTimeout(timer);
    win.removeEventListener('pointerdown', start);
    win.removeEventListener('keydown', start);
  };
  const start = () => { if (!pending) return; stop(); load(); };
  timer = win.setTimeout(start, 12000);
  win.addEventListener('pointerdown', start, { once: true, passive: true });
  win.addEventListener('keydown', start, { once: true });
  return stop;
}
