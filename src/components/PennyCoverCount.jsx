import { useEffect, useState } from 'react'
import { advancePostCount, LAST_POST_COUNT, FIRST_POST_COUNT, POST_COUNT_TICK_MS } from './PennyCoverCountCycle.js'
import './PennyCoverCount.css'

export default function PennyCoverCount() {
  const [count, setCount] = useState(LAST_POST_COUNT)
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

  return (
    <div className="penny-cover-count" aria-label="Decorative Penny After Hours post count" aria-live="off">
      <span
        className={'penny-cover-count__digits' + (count === FIRST_POST_COUNT && !reduceMotion ? ' penny-cover-count__digits--glitch' : '')}
        data-count={count}
      >{count}</span>
      <span className="penny-cover-count__unit">Posts</span>
    </div>
  )
}
