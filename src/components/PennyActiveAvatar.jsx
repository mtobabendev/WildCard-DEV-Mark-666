import { useEffect, useRef } from 'react'
import { bindAvatarPlayback } from './penny-avatar-playback.js'
import './PennyActiveAvatar.css'

export const PENNY_AVATAR_POSTER = '/static/NursePennyPortrait.jpg'
const PENNY_AVATAR_VIDEO = '/static/PennyShowsTheWay.webm'

export default function PennyActiveAvatar() {
  const videoRef = useRef(null)
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    return bindAvatarPlayback(video, PENNY_AVATAR_VIDEO, document,
      window.matchMedia('(prefers-reduced-motion: reduce)'))
  }, [])
  return <video ref={videoRef} className="penny-active-avatar" poster={PENNY_AVATAR_POSTER}
    muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true" />
}
