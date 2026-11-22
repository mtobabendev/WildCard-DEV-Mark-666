import { useEffect, useRef } from 'react'
import { bindUserLoopPlayback } from './user-loop-playback.js'

// No autoplay: the visitor's first native Play activates repeating playback.
// Leaving the viewport suspends it; returning resumes unless they pressed Pause.
export default function UserLoopVideo({ preload = 'none', ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return undefined
    return bindUserLoopPlayback(ref.current)
  }, [])
  return <video {...props} ref={ref} loop playsInline autoPlay={false} preload={preload} />
}
