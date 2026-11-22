// Playback contract for creator clips: native Play opts a clip in. Repeat forever,
// pause offscreen / in background, and resume on return unless the user hit Pause.
// Decorative background videos retain their separate muted autoplay policy.
export function bindUserLoopPlayback(
  video, {
    page = globalThis.document,
    Observer = globalThis.IntersectionObserver,
  } = {},
) {
  let inView = true
  let started = false
  let userPaused = false
  let ignoredPauses = 0
  let disposed = false

  video.loop = true

  function eligible() {
    return inView && !page?.hidden
  }

  function automaticPause() {
    if (video.paused) return
    ignoredPauses += 1
    video.pause()
  }

  function sync() {
    if (disposed) return
    if (!eligible()) {
      automaticPause()
    } else if (started && !userPaused && video.paused) {
      try { video.play()?.catch?.(() => {}) } catch { /* Browser can reject playback. */ }
    }
  }

  function onPlay() {
    if (disposed) return
    started = true
    userPaused = false
    if (!eligible()) automaticPause()
  }

  function onPause() {
    if (disposed) return
    if (ignoredPauses > 0) {
      ignoredPauses -= 1
      return
    }
    if (started) userPaused = true
  }

  video.addEventListener('play', onPlay)
  video.addEventListener('pause', onPause)
  const observer = Observer ? new Observer(entries => {
    for (const entry of entries) {
      if (entry.target === video) inView = entry.isIntersecting
    }
    sync()
  }, { threshold: 0 }) : null
  observer?.observe(video)
  page?.addEventListener?.('visibilitychange', sync)

  return () => {
    disposed = true
    observer?.disconnect()
    page?.removeEventListener?.('visibilitychange', sync)
    video.removeEventListener('play', onPlay)
    video.removeEventListener('pause', onPause)
    video.pause()
  }
}
