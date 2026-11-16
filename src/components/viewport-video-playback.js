// Decorative autoplay only: retain an attached source and playback position
// when a video leaves the viewport, but never attach it before first visibility.
export function bindViewportPlayback(
  video, src, {
    target = video, page = globalThis.document,
    Observer = globalThis.IntersectionObserver, motion,
  } = {},
) {
  let visible = !Observer;
  let requested = false;
  let disposed = false;

  function sync() {
    if (disposed) return;
    const shouldPlay = visible && !page.hidden && !motion?.matches;
    if (!shouldPlay) {
      if (requested) video.pause();
      requested = false;
      return;
    }
    if (requested) return;
    requested = true;
    video.muted = true;
    if (video.getAttribute('src') !== src) video.setAttribute('src', src);
    try {
      video.play()?.catch(() => {});
    } catch {
      // An autoplay restriction must not break the surrounding interface.
    }
  }

  const observer = Observer ? new Observer(entries => {
    for (const entry of entries) {
      if (entry.target === target) visible = entry.isIntersecting;
    }
    sync();
  }, { threshold: 0 }) : null;

  page.addEventListener('visibilitychange', sync);
  if (motion?.addEventListener) motion.addEventListener('change', sync);
  else motion?.addListener?.(sync);
  observer?.observe(target);
  sync();

  return () => {
    disposed = true;
    observer?.disconnect();
    page.removeEventListener('visibilitychange', sync);
    if (motion?.removeEventListener) motion.removeEventListener('change', sync);
    else motion?.removeListener?.(sync);
    video.pause();
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
