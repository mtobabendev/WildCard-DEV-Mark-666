import { useRef, useState } from 'react'
import PennyKandyReel from './PennyKandyReel.jsx'
import ViewportVideo from './ViewportVideo.jsx'
import './PennySpotlightRow.css'

const ROLEPLAY = '/static/penny-roleplay-tile.mp4'
const POSTER = '/static/penny-roleplay-poster.webp'

function PennyRoleplayTile() {
  const dialogRef = useRef(null)
  const [open, setOpen] = useState(false)

  const show = () => {
    dialogRef.current?.showModal()
    setOpen(true)
  }
  const close = () => {
    dialogRef.current?.close()
    setOpen(false)
  }

  return (
    <div className="penny-spotlight__item penny-spotlight__roleplay">
      <ViewportVideo className="penny-spotlight__video"
        src={ROLEPLAY} poster={POSTER} width={480} height={480}
        loop respectReducedMotion aria-hidden="true" />
      <button type="button" className="penny-spotlight__open" onClick={show}
        aria-label="Open Penny Roleplay video">
        <span className="penny-spotlight__badge">▶ VIDEO</span>
        <span className="penny-spotlight__title">Penny Roleplay</span>
      </button>
      <dialog ref={dialogRef} className="penny-spotlight__dialog"
        aria-label="Penny Roleplay video viewer" onClose={() => setOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) close() }}>
        <div className="penny-spotlight__dialog-header">
          <strong>Penny Roleplay · After Hours</strong>
          <button type="button" onClick={close} aria-label="Close Roleplay video">✕</button>
        </div>
        {open && <video src={ROLEPLAY} poster={POSTER} controls autoPlay muted loop playsInline
          className="penny-spotlight__dialog-video" aria-label="Penny Roleplay video" />}
      </dialog>
    </div>
  )
}

export default function PennySpotlightRow() {
  return (
    <section className="penny-spotlight" aria-label="Penny After Hours featured reels">
      <div className="penny-spotlight__heading">
        <h2>FEATURED</h2><small>SWIPE ↔</small>
      </div>
      <div className="penny-fans__friend-list penny-spotlight__list" role="region"
        aria-label="Featured Penny reels, scroll horizontally" tabIndex={0}>
        <PennyKandyReel />
        <PennyRoleplayTile />
      </div>
    </section>
  )
}
