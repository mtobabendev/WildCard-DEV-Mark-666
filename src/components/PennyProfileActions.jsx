import { useEffect, useState } from 'react'
import './PennyProfileActions.css'

// Public profile is intentionally shareable; Party's private collections remain login-gated.
export const PENNY_SHARE_URL = 'https://www.wildcarddev.com/penny/after-hours'
export const PENNY_DONATE_URL = 'https://square.link/u/YnAVr8ht'
export const PENNY_MESSAGE_URL = 'https://party.wildcarddev.com/?app=messenger'
const SAVE_KEY = 'wildcard:afterhours:desktop-saves:v1'
const PROFILE_ID = 'profile:penny'

function storedSaves() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter(item => typeof item === 'string').slice(0, 100) : []
  } catch { return [] }
}

export default function PennyProfileActions({ area = 'penny', name = 'Penny' } = {}) {
  const profileId = area === 'penny' ? PROFILE_ID : 'profile:' + area
  const shareUrl = area === 'penny' ? PENNY_SHARE_URL : 'https://www.wildcarddev.com/' + area + '/after-hours'
  const [saved, setSaved] = useState(() => storedSaves().includes(profileId))
  const [stuck, setStuck] = useState(false)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const check = () => {
      const cover = document.querySelector('.penny-fans__cover, .ah-desktop__cover')
      setStuck(Boolean(cover && cover.getBoundingClientRect().bottom <= 66))
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  const toggleSave = () => {
    try {
      const old = storedSaves()
      const nextSaved = !old.includes(profileId)
      const next = nextSaved ? [...old, profileId] : old.filter(id => id !== profileId)
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(next))
      setSaved(nextSaved)
      setFeedback(nextSaved ? name + ' saved in this browser.' : name + ' removed from browser saves.')
    } catch {
      setFeedback('Browser saving is unavailable here.')
    }
  }

  const share = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: (area === 'penny' ? 'Penny Bella Morningstar' : name) + ' · After Hours',
          text: 'Take a peek behind WildCard DEV’s velvet door. ♠',
          url: shareUrl
        })
        setFeedback('Public profile link shared.')
        return
      }
    } catch (error) {
      if (error?.name === 'AbortError') return
      // Fall back to copying when the native share sheet is unavailable.
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(shareUrl)
      setFeedback('Public profile link copied.')
    } catch {
      setFeedback('Public profile link: ' + shareUrl)
    }
  }

  function buttons(compact = false) {
    return <>
      <a href={PENNY_DONATE_URL} target="_blank" rel="noopener noreferrer"
        title="Donate to WildCard DEV" aria-label="Donate to WildCard DEV">
        <span aria-hidden="true">$</span>{!compact && <small>Donate</small>}
      </a>
      <a href={PENNY_MESSAGE_URL} target="_blank" rel="noopener noreferrer"
        title={'Message through WildCard Messenger'} aria-label={'Message ' + name}>
        <span aria-hidden="true">✉</span>{!compact && <small>Message</small>}
      </a>
      <button type="button" onClick={toggleSave} aria-pressed={saved}
        title={saved ? 'Remove ' + name + ' from browser saves' : 'Save ' + name + ' in this browser'}
        aria-label={saved ? 'Remove saved ' + name + ' profile' : 'Save ' + name + ' profile'}>
        <span aria-hidden="true">{saved ? '★' : '☆'}</span>{!compact && <small>{saved ? 'Saved' : 'Save'}</small>}
      </button>
      <button type="button" onClick={share} title={'Share ' + name + "'s public After Hours link"}
        aria-label={'Share ' + name + ' After Hours public profile'}>
        <span aria-hidden="true">↗</span>{!compact && <small>Share</small>}
      </button>
    </>
  }

  return <>
    <div className="penny-profile-actions" role="group" aria-label={name + ' profile actions'}>{buttons()}</div>
    {stuck && <nav className="penny-profile-actions__sticky" aria-label={name + ' sticky profile actions'}>
      <strong>♠ {name.toUpperCase()} AFTER HOURS</strong>
      <div role="group" aria-label="Donate, message, save or share">{buttons(true)}</div>
    </nav>}
    {feedback && <p className="penny-profile-actions__feedback" role="status">{feedback}</p>}
  </>
}
