// Decorative autoplay only: retain an attached source and playback position
// when a video leaves the viewport, but never attach it before first visibility.
export function bindViewportPlayback(
  video, src, { target = video, page = globalThis.document, Observer = globalThis.IntersectionObserver } = {},
) {
  let visible = !Observer;
  let requested = false;
  let disposed = false;

  function sync() {
    if (disposed) return;
    const shouldPlay = visible && !page.hidden;
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
  observer?.observe(target);
  sync();

  return () => {
    disposed = true;
    observer?.disconnect();
    page.removeEventListener('visibilitychange', sync);
    video.pause();
  };
}
