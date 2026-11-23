import { useState } from 'react'
import './NursePennyEasterEgg.css'

// One tap swaps the media in Penny's existing post. No vault or workstation dependency.
const PHOTO = '/static/NursePennyPortrait.jpg'
const VIDEO = '/static/SpermBankPennyLoop.webm'

export default function NursePennyEasterEgg({ className = '' }) {
  const [showVideo, setShowVideo] = useState(false)

  return <button
    type="button"
    className={'nurse-penny-easter-egg ' + className}
    aria-label={showVideo ? 'Return to Nurse Penny photo' : 'Play Nurse Penny secret loop'}
    aria-pressed={showVideo}
    title={showVideo ? 'Tap to show photo' : 'Tap for a little surprise'}
    onClick={() => setShowVideo(previous => !previous)}
  >
    {showVideo ? <video
      key="nurse-loop"
      className="nurse-penny-easter-egg__video"
      src={VIDEO}
      poster={PHOTO}
      autoPlay muted loop playsInline
      preload="metadata"
      disablePictureInPicture
      controlsList="nodownload nofullscreen noremoteplayback"
      onError={() => setShowVideo(false)}
      aria-hidden="true"
    /> : <img
      key="nurse-photo"
      className="nurse-penny-easter-egg__photo"
      src={PHOTO}
      width="1496"
      height="1023"
      alt=""
      loading="lazy"
      decoding="async"
    />}
  </button>
}
