import { useEffect, useRef, useState } from 'react'
import './PennyPrivateCollections.css'

const PARTY = 'https://party.wildcarddev.com'
const FRAME_SRC = PARTY + '/afterhours-members.html?area=penny&embed=1'

// The Party iframe is the only surface that requests and streams private media.
// The parent receives only layout measurements, never sessions, account data, or media URLs.
export default function PennyPrivateCollections({ view = 'galleries', area = 'penny' }) {
  const selectedArea = ['penny', 'kandy', 'ashley'].includes(area) ? area : null
  const name = selectedArea ? selectedArea[0].toUpperCase() + selectedArea.slice(1) : ''
  const frameSrc = selectedArea === 'penny' ? FRAME_SRC : PARTY + '/afterhours-members.html?area=' + encodeURIComponent(selectedArea) + '&embed=1'
  const frameRef = useRef(null)
  const [frameHeight, setFrameHeight] = useState(850)

  useEffect(() => {
    const receive = (event) => {
      if (event.origin !== PARTY || event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (data?.type !== 'wildcard:afterhours:height:v1' || data.area !== selectedArea) return
      const next = data.height
      if (typeof next !== 'number' || !Number.isFinite(next) || next < 240 || next > 8000) return
      setFrameHeight(previous => Math.abs(previous - next) > 12 ? Math.ceil(next) : previous)
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [selectedArea, view])

  if (!selectedArea) return null
  return <section className="penny-private-collections" aria-label={name + "'s private galleries and reels"}>
    <header className="penny-private-collections__heading" hidden>
      <p>♠ ONLY FOR THE INNER CIRCLE</p>
      <h2>Inside {name}'s Vault</h2>
      <span>Private galleries, reels, and all the little midnight extras.</span>
    </header>
    <iframe
      ref={frameRef}
      className="penny-private-collections__frame"
      title={name + "'s private galleries, reels, and music"}
      key={selectedArea + ":" + view}
      src={frameSrc + '&view=' + (['reels', 'music'].includes(view) ? view : 'galleries')}
      loading="lazy"
      referrerPolicy="origin"
      allow="fullscreen"
      allowFullScreen
      style={{ height: frameHeight }}
    />
    <p className="penny-private-collections__fallback">
      Need a little more room? <a href={PARTY + '/afterhours-members.html?area=' + encodeURIComponent(selectedArea)} target="_blank" rel="noopener noreferrer">Open full-screen view</a>
    </p>
  </section>
}
