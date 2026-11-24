import { useRef, useState } from 'react'
import ViewportVideo from './ViewportVideo.jsx'
import { pennyPrivateMedia } from './privateMediaUrl.js'
import './SeatAnimationPair.css'

export const SEAT_COMPANION = pennyPrivateMedia('PennySeatAtTheTableCompanion.webm')

export default function SeatAnimationPair({ title, copy, label, original, onOpen }) {
  const [paused, setPaused] = useState(false)
  const panel = useRef(null)
  const clip = (src, side, width, height) => (
    <button type="button" className={'seat-pair__clip seat-pair__clip--' + side}
      aria-label={'Enlarge ' + title + ' ' + side + ' animation'}
      onClick={() => { setPaused(true); onOpen(src) }}>
      <ViewportVideo src={src} width={width} height={height} active={!paused}
        viewportRef={panel} respectReducedMotion loop aria-hidden="true" />
    </button>
  )
  return <section className="seat-pair" ref={panel} aria-label={title}>
    {clip(original, 'left', 400, 880)}
    <div className="seat-pair__copy">
      <div className="seat-pair__meta">
        <span>{label}</span>
        <button type="button" className="seat-pair__pause" aria-pressed={paused}
          aria-label={paused ? 'Resume both animations' : 'Pause both animations'}
          onClick={() => setPaused(value => !value)}><span aria-hidden="true">👀</span></button>
      </div>
      <h2>{title}</h2><p>{copy}</p>
    </div>
    {clip(SEAT_COMPANION, 'right', 480, 480)}
  </section>
}
