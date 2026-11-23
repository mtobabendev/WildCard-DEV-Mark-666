import { useEffect, useRef } from 'react'
import { bindUserLoopPlayback } from './user-loop-playback.js'

// No autoplay: the visitor's first native Play activates repeating playback.
// Leaving the viewport suspends it; returning resumes unless they pressed Pause.
export default function UserLoopVideo({ preload = 'none', controlRef, ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return undefined
    if (controlRef) controlRef.current = video
    const cleanup = bindUserLoopPlayback(video)
    return () => {
      if (controlRef?.current === video) controlRef.current = null
      cleanup?.()
    }
  }, [controlRef])
  return <video {...props} ref={ref} loop playsInline autoPlay={false} preload={preload} />
}
