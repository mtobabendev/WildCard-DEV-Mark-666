import { useEffect, useState } from 'react'
import { advancePostCount, LAST_POST_COUNT, FIRST_POST_COUNT, POST_COUNT_TICK_MS } from './PennyCoverCountCycle.js'
import { INITIAL_LIKES_TENTHS, formatLikes, nextLikesTenths, randomLikesDelay } from './PennyLikesCycle.js'
import './PennyCoverCount.css'

export default function PennyCoverCount() {
  const [count, setCount] = useState(LAST_POST_COUNT)
  const [likes, setLikes] = useState(INITIAL_LIKES_TENTHS)
  const [reduceMotion, setReduceMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(preference.matches)
    preference.addEventListener('change', sync)
    return () => preference.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduceMotion) {
      setCount(LAST_POST_COUNT)
      return undefined
    }
    const interval = window.setInterval(() => {
      if (!document.hidden) setCount(advancePostCount)
    }, POST_COUNT_TICK_MS)
    return () => window.clearInterval(interval)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) return undefined
    let timer
    let cancelled = false
    const schedule = () => {
      if (cancelled || document.hidden) return
      timer = window.setTimeout(() => {
        if (cancelled || document.hidden) return
        setLikes(nextLikesTenths)
        schedule()
      }, randomLikesDelay())
    }
    const syncVisibility = () => {
      window.clearTimeout(timer)
      if (!document.hidden) schedule()
    }
    document.addEventListener('visibilitychange', syncVisibility)
    schedule()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [reduceMotion])

  return (
    <div className="penny-cover-count" aria-label="Decorative Penny After Hours post and likes counters" aria-live="off">
      <span className="penny-cover-count__post-stat">
        <span
          className={'penny-cover-count__digits' + (count === FIRST_POST_COUNT && !reduceMotion ? ' penny-cover-count__digits--glitch' : '')}
          data-count={count}
        >{count}</span>
        <span className="penny-cover-count__unit">Posts</span>
      </span>
      <span className="penny-cover-count__separator" aria-hidden="true">·</span>
      <span className="penny-cover-count__like-stat">
        <span key={likes} className={'penny-cover-count__likes' + (reduceMotion ? ' is-still' : '')}>{formatLikes(likes)}</span>
        <span className="penny-cover-count__unit">Likes</span>
      </span>
    </div>
  )
}
