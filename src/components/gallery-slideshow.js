export const GALLERY_INTERVALS = [3000, 5000, 8000, 12000]
export function galleryStep(index, count, delta = 1) {
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(index)) return null
  return ((index + delta) % count + count) % count
}
export function bindSlideshow({advance, interval=5000, doc=document, motion=window.matchMedia('(prefers-reduced-motion: reduce)'), schedule=setInterval, cancel=clearInterval}) {
  let timer=null
  const stop=()=>{if(timer!==null){cancel(timer);timer=null}}
  const sync=()=>{stop();if(!doc.hidden&&!motion.matches)timer=schedule(advance,GALLERY_INTERVALS.includes(interval)?interval:5000)}
  doc.addEventListener('visibilitychange',sync)
  if(motion.addEventListener)motion.addEventListener('change',sync)
  else motion.addListener?.(sync)
  sync()
  return ()=>{stop();doc.removeEventListener('visibilitychange',sync);if(motion.removeEventListener)motion.removeEventListener('change',sync);else motion.removeListener?.(sync)}
}
