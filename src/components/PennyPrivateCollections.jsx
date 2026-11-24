import { useEffect, useRef, useState } from 'react'
import './PennyPrivateCollections.css'

const PARTY = 'https://party.wildcarddev.com'
const FRAME_SRC = PARTY + '/afterhours-members.html?area=penny&embed=1'

// The Party iframe is the only surface that requests and streams private media.
// The parent receives only layout measurements, never sessions, account data, or media URLs.
export default function PennyPrivateCollections({ view = 'galleries' }) {
  const frameRef = useRef(null)
  const [frameHeight, setFrameHeight] = useState(850)

  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== PARTY || event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (data?.type !== 'wildcard:afterhours:height:v1' || data.area !== 'penny') return
      const next = data.height
      if (typeof next !== 'number' || !Number.isFinite(next) || next < 240 || next > 8000) return
      setFrameHeight(previous => Math.abs(previous - next) > 12 ? Math.ceil(next) : previous)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [])

  return <section className="penny-private-collections" aria-label="Penny's private galleries and reels">
    <header className="penny-private-collections__heading" hidden>
      <p>♠ ONLY FOR THE INNER CIRCLE</p>
      <h2>Inside Penny's Velvet Vault 🖤</h2>
      <span>Private galleries, reels, and all the little midnight extras.</span>
    </header>
    <iframe
      ref={frameRef}
      className="penny-private-collections__frame"
      title="Penny's private galleries and reels"
      key={view}
      src={FRAME_SRC + '&view=' + (view === 'reels' ? 'reels' : 'galleries')}
      loading="lazy"
      referrerPolicy="origin"
      allow="fullscreen"
      allowFullScreen
      style={{ height: frameHeight }}
    />
    <p className="penny-private-collections__fallback">
      Need a little more room? <a href={PARTY + '/afterhours-members.html?area=penny'} target="_blank" rel="noopener noreferrer">Open full-screen view</a>
    </p>
  </section>
}
