// Decorative autoplay only; constrained profiles release the source and decoder
// whenever a video is no longer visible. Cinematic preserves its playback position.
export function bindViewportPlayback(
  video, src, {
    target = video, page = globalThis.document,
    Observer = globalThis.IntersectionObserver, motion, releaseOffscreen = false, fallbackSrc, budget,
  } = {},
) {
  let visible = !Observer;
  let ratio = visible ? 1 : 0;
  let engaged = false;
  let granted = !budget;
  let lease;
  const interactive = target?.closest?.('button, a') || target;
  let requested = false;
  let disposed = false;
  let currentSource = src;
  const fallbacks = (Array.isArray(fallbackSrc) ? fallbackSrc : [fallbackSrc]).filter(Boolean).filter(value => value !== src);
  let nextFallback = 0;

  function release() {
    if (video.getAttribute('src') !== currentSource) return;
    video.removeAttribute('src');
    video.load();
  }

  function play() {
    try {
      video.play()?.catch(() => {});
    } catch {
      // An autoplay restriction must not break the surrounding interface.
    }
  }

  function sync() {
    if (disposed) return;
    const shouldPlay = visible && !page.hidden && !motion?.matches && granted;
    if (!shouldPlay) {
      if (requested) video.pause();
      requested = false;
      if (releaseOffscreen) release();
      return;
    }
    if (requested) return;
    requested = true;
    video.muted = true;
    if (video.getAttribute('src') !== currentSource) video.setAttribute('src', currentSource);
    play();
  }

  function onError() {
    if (disposed || !requested || nextFallback >= fallbacks.length
        || video.getAttribute('src') !== currentSource) return;
    currentSource = fallbacks[nextFallback++];
    video.setAttribute('src', currentSource);
    play();
  }

  function update() {
    if (disposed) return;
    if (lease) lease.update(visible && !page.hidden && !motion?.matches ? (engaged ? 10 : 0) + Math.max(.15, Math.round(ratio*4)/4) : 0);
    sync();
  }
  if (budget) lease = budget.register(value => { granted=value; sync(); });
  const enter = () => { engaged=true; update(); };
  const leave = () => { engaged=false; update(); };
  if (budget) { interactive?.addEventListener?.('pointerenter',enter); interactive?.addEventListener?.('pointerleave',leave); interactive?.addEventListener?.('focusin',enter); interactive?.addEventListener?.('focusout',leave); }
  const observer = Observer ? new Observer(entries => {
    for (const entry of entries) {
      if (entry.target === target) { ratio = entry.intersectionRatio ?? (entry.isIntersecting ? 1 : 0); visible = entry.isIntersecting && (!releaseOffscreen || ratio >= 0.15); }
    }
    update();
  }, { threshold: budget ? [0, 0.15, 0.25, 0.5, 0.75, 1] : releaseOffscreen ? [0, 0.15] : 0 }) : null;

  page.addEventListener('visibilitychange', update);
  if (fallbacks.length) video.addEventListener('error', onError);
  if (motion?.addEventListener) motion.addEventListener('change', update);
  else motion?.addListener?.(update);
  observer?.observe(target);
  update();

  return () => {
    disposed = true;
    video.pause();
    if (releaseOffscreen) release();
    lease?.dispose();
    if (budget) { interactive?.removeEventListener?.('pointerenter',enter); interactive?.removeEventListener?.('pointerleave',leave); interactive?.removeEventListener?.('focusin',enter); interactive?.removeEventListener?.('focusout',leave); }
    observer?.disconnect();
    page.removeEventListener('visibilitychange', update);
    if (fallbacks.length) video.removeEventListener('error', onError);
    if (motion?.removeEventListener) motion.removeEventListener('change', update);
    else motion?.removeListener?.(update);
  };
}

// Native player: keep the source and controls usable, defer the metadata
// hint until the first intersection, and never interrupt deliberate playback.
export function bindViewportMetadata(video, Observer = globalThis.IntersectionObserver) {
  if (!Observer) {
    video.preload = 'metadata';
    return () => {};
  }

  let disposed = false;
  const observer = new Observer(entries => {
    if (disposed || !entries.some(entry => entry.target === video && entry.isIntersecting)) return;
    video.preload = 'metadata';
    observer.disconnect();
    disposed = true;
  }, { threshold: 0 });
  observer.observe(video);

  return () => {
    disposed = true;
    observer.disconnect();
  };
}
