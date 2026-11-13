import { useEffect, useState } from 'react'
import { bindSlideshow, GALLERY_INTERVALS } from './gallery-slideshow.js'
import './GallerySlideshow.css'

// Opt in only for non-explicit creative exhibits. No media autoplay.
export default function GallerySlideshow({ enabled, open, count, onAdvance, onPause, blocked = false }) {
  const [playing,setPlaying]=useState(false)
  const [interval,setIntervalMs]=useState(5000)
  const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(()=>{
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync=()=>{setReduced(motion.matches);if(motion.matches)setPlaying(false)}
    motion.addEventListener?.('change',sync)
    return ()=>motion.removeEventListener?.('change',sync)
  },[])
  useEffect(()=>{if(!open||!enabled||blocked)setPlaying(false)},[open,enabled,blocked])
  useEffect(()=>{
    if(!playing||!open||!enabled||blocked||reduced||count<2)return
    return bindSlideshow({advance:onAdvance,interval})
  },[playing,open,enabled,blocked,reduced,count,onAdvance,interval])
  useEffect(()=>{if(playing&&onPause)onPause(()=>setPlaying(false))},[playing,onPause])
  if(!enabled||!open||count<2)return null
  return <div className="wc-gallery-slideshow" aria-label="Slideshow controls">
    <button type="button" disabled={reduced||blocked} aria-pressed={playing} onClick={()=>setPlaying(v=>!v)}>{playing?'Pause slideshow':'Play slideshow'}</button>
    <label>Interval <select value={interval} onChange={e=>setIntervalMs(Number(e.target.value))}>{GALLERY_INTERVALS.map(ms=><option key={ms} value={ms}>{ms/1000} sec</option>)}</select></label>
    {reduced&&<small>Slideshow disabled by reduced-motion preference.</small>}
  </div>
}
