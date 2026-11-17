/* WildCard Messenger: one inbox, a scoped Party-origin bridge, no credentials in the host. */
(() => {
  'use strict'
  if (window.top !== window || document.querySelector('wildcard-messenger')) return
  const PARTY = 'https://party.wildcarddev.com'
  const FULL = PARTY + '/?app=messenger'
  const BRIDGE = 'wildcard:messenger:v1:'
  const hosts = new Set([
    'https://wildcarddev.com', 'https://www.wildcarddev.com',
    'https://party.wildcarddev.com', 'https://labs.wildcarddev.com',
    'https://pennysoffice.wildcarddev.com', 'https://pennytv.wildcarddev.com',
  ])
  const aliases = new Set([
    'https://wildcard-office.vercel.app', 'https://wildcard-showroom-enhanced-1500.vercel.app',
    'https://pennytube.vercel.app', 'https://wild-card-dev-mark-666.vercel.app',
    'https://wildcard-party.vercel.app',
  ])
  const inline = hosts.has(location.origin)
  if (!inline && !aliases.has(location.origin)) return
  if (location.origin === PARTY || location.origin === 'https://wildcard-party.vercel.app') return
  const host = document.createElement('wildcard-messenger')
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = `
    :host { position:fixed; z-index:2147482999; left:max(6px,env(safe-area-inset-left)); top:65%; transform:translateY(-50%); font:14px/1.4 system-ui,sans-serif; color:#f9effc; }
    *,*::before,*::after { box-sizing:border-box; }
    button,a { font:inherit; color:inherit; cursor:pointer; }
    button:focus-visible,a:focus-visible { outline:2px solid #e6d6ef; outline-offset:3px; }
    .launcher { position:relative; width:46px; height:46px; display:grid; place-items:center; border:1px solid #c9d2df; border-radius:14px; background:#100b20; color:#ff9fe5; box-shadow:0 0 18px #ff5bd638; text-decoration:none; }
    .launcher.unread { color:#baff00; border-color:#baff00; box-shadow:0 0 18px #baff0070; animation:pulse 2.4s ease-in-out infinite; }
    @keyframes pulse { 50% { box-shadow:0 0 26px 4px #baff0090; } }
    .count { position:absolute; top:-7px; right:-8px; min-width:20px; height:20px; padding:0 4px; border-radius:20px; background:#baff00; color:#152000; font-size:11px; font-weight:800; display:grid; place-items:center; }
    .count[hidden],.toast[hidden],.status[hidden] { display:none; }
    .toast { position:absolute; left:54px; top:0; width:min(270px,calc(100vw - 70px)); padding:12px; background:#21132f; border:1px solid #baff00; border-radius:12px; box-shadow:0 8px 24px #0008; }
    .toast p { margin:0 0 8px; } .toast button,.bar button { background:#251733; border:1px solid #87668f; border-radius:8px; padding:7px 10px; min-height:40px; }
    .toast-actions { display:flex; gap:8px; align-items:center; }
    dialog { position:fixed; inset:auto 16px 16px auto; margin:0; padding:0; width:min(850px,calc(100vw - 32px)); height:min(760px,calc(100dvh - 32px)); max-width:none; max-height:none; color:#f9effc; background:#100b20; border:1px solid #e89ad5; border-radius:18px; overflow:hidden; }
    dialog[open] { display:flex; flex-direction:column; }
    dialog::backdrop { background:#05030b80; }
    .bar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; padding:10px 14px; border-bottom:1px solid #694469; }
    .bar strong { color:#ffb5e8; letter-spacing:.07em; font-size:13px; }
    .bar a { color:#ffb5e8; font-size:12px; } .bar button { min-width:44px; font-size:22px; line-height:1; }
    .status { margin:0; padding:12px; color:#e0c5e7; } .frame { flex:1; min-height:0; width:100%; border:0; background:#100b20; }
    @media(max-width:600px) { dialog { inset:0; width:100%; height:100dvh; border-radius:0; } .bar { padding-top:max(10px,env(safe-area-inset-top)); } }
    @media(prefers-reduced-motion:reduce) { .launcher.unread { animation:none; } }
  `
  const launcher = document.createElement(inline ? 'button' : 'a')
  launcher.className = 'launcher'
  launcher.title = 'WildCard Messenger'
  launcher.setAttribute('aria-label', inline ? 'Open WildCard Messenger' : 'Open full WildCard Messenger')
  if (inline) { launcher.type = 'button'; launcher.setAttribute('aria-haspopup', 'dialog'); launcher.setAttribute('aria-expanded', 'false') }
  else { launcher.href = FULL; launcher.target = '_blank'; launcher.rel = 'noopener noreferrer' }
  launcher.innerHTML = '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>'
  const badge = document.createElement('span')
  badge.className = 'count'; badge.hidden = true; badge.setAttribute('aria-hidden', 'true')
  launcher.append(badge)
  shadow.append(style, launcher)
  document.body.append(host)
  window.dispatchEvent(new Event('wildcard:messenger:ready'))
  if (!inline) return

  const toast = document.createElement('div')
  toast.className = 'toast'; toast.hidden = true
  const notice = document.createElement('p')
  notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite')
  const actions = document.createElement('div'); actions.className = 'toast-actions'
  const openToast = document.createElement('button'); openToast.type = 'button'; openToast.textContent = 'Open'
  const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.textContent = 'Dismiss'
  actions.append(openToast, dismiss); toast.append(notice, actions); shadow.append(toast)

  const dialog = document.createElement('dialog')
  dialog.setAttribute('aria-label', 'WildCard Messenger')
  const bar = document.createElement('header'); bar.className = 'bar'
  const title = document.createElement('strong'); title.textContent = '♠ WILDCARD MESSENGER'
  const full = document.createElement('a'); full.href = FULL; full.target = '_blank'; full.rel = 'noopener noreferrer'; full.textContent = 'Open full Messenger'; full.dataset.messengerFull = 'true'
  const close = document.createElement('button'); close.type = 'button'; close.textContent = '×'; close.setAttribute('aria-label', 'Close Messenger')
  bar.append(title, full, close)
  const status = document.createElement('p'); status.className = 'status'; status.setAttribute('role', 'status'); status.textContent = 'Connecting to Messenger…'
  const frame = document.createElement('iframe')
  frame.className = 'frame'; frame.title = 'WildCard Messenger inbox'; frame.referrerPolicy = 'origin'
  frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox')
  frame.src = PARTY + '/messenger-embed.html?parent=' + encodeURIComponent(location.origin)
  dialog.append(bar, status, frame); shadow.append(dialog)

  let ready = false, count = null, signedIn = false, priorFocus = null, timeout = null
  const tell = () => { if (ready) frame.contentWindow?.postMessage({ type: BRIDGE + 'state', open: dialog.open, visible: !document.hidden }, PARTY) }
  const setStatus = text => { status.textContent = text; status.hidden = !text }
  function open(source) {
    if (dialog.open) return
    priorFocus = source || document.activeElement
    toast.hidden = true
    setStatus(ready ? 'Opening inbox…' : 'Connecting to Messenger…')
    dialog.showModal(); launcher.setAttribute('aria-expanded', 'true'); close.focus(); tell()
    clearTimeout(timeout)
    timeout = setTimeout(() => { if (dialog.open && !status.hidden) setStatus('Messenger could not connect. Use Open full Messenger above.') }, 10000)
  }
  function closed() {
    clearTimeout(timeout); timeout = null
    launcher.setAttribute('aria-expanded', 'false'); tell()
    if (priorFocus?.isConnected) priorFocus.focus()
    else launcher.focus()
    priorFocus = null
  }
  launcher.addEventListener('click', () => open(launcher))
  openToast.addEventListener('click', () => open(launcher))
  dismiss.addEventListener('click', () => { toast.hidden = true })
  close.addEventListener('click', () => dialog.close())
  dialog.addEventListener('close', closed)

  function updateUnread(next, authenticated) {
    const previous = count
    const wasSignedIn = signedIn
    count = authenticated ? next : 0; signedIn = authenticated
    badge.hidden = count === 0; badge.textContent = count > 99 ? '99+' : String(count)
    launcher.classList.toggle('unread', count > 0)
    launcher.setAttribute('aria-label', count > 0 ? 'Open WildCard Messenger, ' + count + ' unread messages' : 'Open WildCard Messenger')
    if (count === 0) { toast.hidden = true; return }
    if (!dialog.open && !document.hidden && (!wasSignedIn || previous === null || count > previous)) {
      notice.textContent = 'You have ' + count + ' unread message' + (count === 1 ? '.' : 's.')
      toast.hidden = false
    } else if (!toast.hidden) notice.textContent = 'You have ' + count + ' unread message' + (count === 1 ? '.' : 's.')
  }
  window.addEventListener('message', event => {
    if (event.origin !== PARTY || event.source !== frame.contentWindow) return
    const data = event.data
    if (!data || typeof data.type !== 'string') return
    if (data.type === BRIDGE + 'ready') { ready = true; tell() }
    else if (data.type === BRIDGE + 'opened' && dialog.open) { clearTimeout(timeout); setStatus('') }
    else if (data.type === BRIDGE + 'error' && dialog.open) setStatus('Messenger could not load. Use Open full Messenger above.')
    else if (data.type === BRIDGE + 'close' && dialog.open) dialog.close()
    else if (data.type === BRIDGE + 'unread' && typeof data.signedIn === 'boolean' && Number.isSafeInteger(data.count) && data.count >= 0) updateUnread(data.count, data.signedIn)
  })
  document.addEventListener('visibilitychange', tell)
  window.addEventListener('focus', tell)
  window.addEventListener('online', tell)
  window.addEventListener('pageshow', tell)
  function isMessenger(href) {
    try { const url = new URL(href, location.href); return url.origin === PARTY && url.pathname === '/' && url.searchParams.get('app') === 'messenger' }
    catch { return false }
  }
  // Only ordinary Messenger navigation is intercepted; explicit full-app links still work.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
    if (!anchor || anchor.dataset.messengerFull || anchor.hasAttribute('download') || !isMessenger(anchor.href)) return
    event.preventDefault(); event.stopImmediatePropagation(); open(anchor)
  }, true)
  window.addEventListener('wildcard:contact-route', event => {
    if (!isMessenger(event.detail?.href)) return
    event.preventDefault(); event.stopImmediatePropagation(); open(document.activeElement)
  }, true)
})()
