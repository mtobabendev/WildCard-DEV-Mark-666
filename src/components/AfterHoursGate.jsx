import { useEffect, useRef, useState } from 'react'

// Account cookies stay on party.wildcarddev.com. The frame asks Party's server;
// this page never receives a credential, session token, or account ID.
const PARTY = 'https://party.wildcarddev.com'
const AREA_LABELS = { penny: 'Penny', kandy: 'Kandy', ashley: 'Ashley' }

export default function AfterHoursGate({ area, children }) {
  const frameRef = useRef(null)
  const [status, setStatus] = useState('checking')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!Object.hasOwn(AREA_LABELS, area)) return undefined
    setStatus('checking')
    // Untrusted preview origins receive no bridge response. Fail closed instead
    // of displaying a permanent loading state if verification cannot respond.
    const timeout = window.setTimeout(() => {
      setStatus(current => current === 'checking' ? 'unavailable' : current)
    }, 10000)
    const receive = event => {
      if (event.origin !== PARTY || event.source !== frameRef.current?.contentWindow) return
      const data = event.data
      if (data?.type !== 'wildcard:afterhours:access:v1' || data.area !== area) return
      setStatus(data.allowed === true && data.status === 200
        ? 'allowed'
        : data.status === 401 ? 'login' : data.status === 403 ? 'denied' : 'unavailable')
    }
    window.addEventListener('message', receive)
    const timer = window.setInterval(() => {
      frameRef.current?.contentWindow?.postMessage({ type: 'wildcard:afterhours:verify:v1', area }, PARTY)
    }, 20000)
    return () => {
      window.removeEventListener('message', receive)
      window.clearInterval(timer)
      window.clearTimeout(timeout)
    }
  }, [area, attempt])

  const label = AREA_LABELS[area]
  const retry = () => { setStatus('checking'); setAttempt(n => n + 1) }
  return <>
    <iframe
      key={attempt}
      ref={frameRef}
      title="Secure WildCard membership verification"
      src={PARTY + '/afterhours-bridge.html?parent=' + encodeURIComponent(window.location.origin) + '&area=' + encodeURIComponent(area)}
      style={{ position: 'absolute', width: 0, height: 0, border: 0, opacity: 0 }}
      aria-hidden="true"
      tabIndex={-1}
      referrerPolicy="no-referrer"
    />
    {status === 'allowed' ? <>{children}</> : <main style={{ minHeight: '100dvh', padding: 'clamp(24px, 6vw, 80px)', background: '#11091e', color: '#fff0fb', font: '16px/1.7 system-ui,sans-serif', display: 'grid', placeItems: 'center' }}>
      <section style={{ width: 'min(560px, 100%)', border: '1px solid #d78ebd', borderRadius: 18, padding: 28, background: '#26132f', boxShadow: '0 16px 60px #0008' }}>
        <a href="/" style={{ color: '#f9bde7' }}>♠ WildCard DEV</a>
        <h1>{label}'s After Hours</h1>
        {status === 'checking' && <p role="status">Verifying your WildCard membership…</p>}
        {status === 'login' && <p>You need to sign in to WildCard Messenger before entering this private area.</p>}
        {status === 'denied' && <p>Your Messenger account is signed in, but the Owner has not approved access to this area.</p>}
        {status === 'unavailable' && <p>Private access cannot be verified right now. The door stays locked until the server responds.</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
          <a href={PARTY + '/?app=messenger'} target="_blank" rel="noopener noreferrer" style={{ background: '#f7bce5', color: '#1a0822', padding: '9px 16px', borderRadius: 9 }}>Open WildCard Messenger</a>
          <button type="button" onClick={retry} style={{ background: '#3b2148', border: '1px solid #d6a1c7', borderRadius: 9, padding: '9px 16px', color: '#fff', cursor: 'pointer' }}>Check access again</button>
        </div>
      </section>
    </main>}
  </>
}
