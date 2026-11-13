/* WildCard DEV shared concierge v1. No third-party libraries or background AI calls. */
(() => {
  'use strict'
  if (document.querySelector('wildcard-ask-penny')) return
  const HUB = 'https://www.wildcarddev.com'
  const origin = location.origin
  const aliases = new Set([
    'https://wildcard-office.vercel.app',
    'https://wildcard-showroom-enhanced-1500.vercel.app',
    'https://pennytube.vercel.app',
    'https://wildcard-party.vercel.app',
    'https://wild-card-dev-mark-666.vercel.app'
  ])
  const inline = location.protocol === 'https:' && !location.port &&
    (location.hostname === 'wildcarddev.com' || location.hostname.endsWith('.wildcarddev.com') || aliases.has(origin))
  const host = document.createElement('wildcard-ask-penny')
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = `
    :host { position: fixed; z-index: 2147483000; right: max(12px, env(safe-area-inset-right)); bottom: max(12px, env(safe-area-inset-bottom)); display: block; font: 13px/1.2 system-ui,sans-serif; color: #f9effc; }
    button { display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 6px 12px 6px 6px; border: 1px solid #e19acb; border-radius: 17px; background: #20112e; color: inherit; font: inherit; cursor: pointer; box-shadow: 0 8px 32px #0007; }
    button:focus-visible { outline: 2px solid #ffceef; outline-offset: 3px; }
    .avatar { display: grid; place-items: center; width: 46px; height: 46px; overflow: hidden; border: 1px solid #e19acb; border-radius: 12px; background: #160c21; color: #ffb5e8; }
    img { width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; }
    strong, small { display: block; text-align: left; }
    strong { letter-spacing: .1em; font-size: 12px; }
    small { margin-top: 4px; color: #d3b2da; font-size: 10px; }
    iframe { position: absolute; right: 0; bottom: 72px; width: min(410px, calc(100vw - 24px)); height: min(580px, calc(100dvh - 100px)); border: 0; border-radius: 18px; background: #160c21; box-shadow: 0 16px 44px #0008; }
    a { color: #ffb5e8; }
    .fallback { position: absolute; right: 0; bottom: 72px; width: 230px; padding: 12px; border-radius: 12px; background: #20112e; border: 1px solid #e19acb; }
  `
  const button = document.createElement('button')
  button.type = 'button'
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-label', 'Open Ask Penny')
  const avatar = document.createElement('span')
  avatar.className = 'avatar'
  avatar.setAttribute('aria-hidden', 'true')
  const label = document.createElement('span')
  const title = document.createElement('strong')
  title.textContent = 'ASK PENNY'
  const subtitle = document.createElement('small')
  subtitle.textContent = 'LIVE CONCIERGE'
  label.append(title, subtitle)
  button.append(avatar, label)
  shadow.append(style, button)
  document.body.append(host)
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  function syncAvatar() {
    avatar.replaceChildren()
    if (document.hidden || motion.matches) { avatar.textContent = '♠'; return }
    const image = document.createElement('img')
    image.src = HUB + '/static/Penny.gif'
    image.alt = ''
    image.decoding = 'async'
    image.referrerPolicy = 'no-referrer'
    avatar.append(image)
  }
  syncAvatar()
  document.addEventListener('visibilitychange', syncAvatar)
  if (motion.addEventListener) motion.addEventListener('change', syncAvatar)
  else motion.addListener?.(syncAvatar)
  let frame = null
  let fallback = null
  function close(focus = true) {
    if (frame) { frame.remove(); frame = null }
    if (fallback) { fallback.remove(); fallback = null }
    button.setAttribute('aria-expanded', 'false')
    button.setAttribute('aria-label', 'Open Ask Penny')
    subtitle.textContent = 'LIVE CONCIERGE'
    if (focus) button.focus()
  }
  function open() {
    if (!inline) {
      // Protected previews and unknown hosts never receive an embedded production chat.
      fallback = document.createElement('div')
      fallback.className = 'fallback'
      const link = document.createElement('a')
      link.href = HUB + '/ask-penny/'
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.textContent = 'Open Ask Penny on WildCard DEV'
      fallback.append(link)
      shadow.append(fallback)
    } else {
      frame = document.createElement('iframe')
      frame.title = 'Ask Penny chat'
      frame.sandbox = 'allow-scripts allow-same-origin'
      frame.referrerPolicy = 'origin'
      frame.src = HUB + '/ask-penny/?parent=' + encodeURIComponent(origin)
      shadow.append(frame)
    }
    button.setAttribute('aria-expanded', 'true')
    button.setAttribute('aria-label', 'Close Ask Penny')
    subtitle.textContent = 'CLOSE CHAT'
  }
  button.addEventListener('click', () => frame || fallback ? close() : open())
  window.addEventListener('message', event => {
    if (frame && event.source === frame.contentWindow && event.origin === HUB &&
        event.data?.type === 'wildcard:ask-penny:close') close()
  })
  window.addEventListener('keydown', event => { if (event.key === 'Escape' && (frame || fallback)) close() })
  window.addEventListener('pagehide', () => close(false))
})()
