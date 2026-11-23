import { useEffect, useRef, useState } from 'react'
import AfterHoursPublicProfile from './AfterHoursPublicProfile.jsx'

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
    {status === 'allowed' ? <>{children}</> : (
      <AfterHoursPublicProfile area={area} accessStatus={status} onRetry={retry} />
    )}
  </>
}
