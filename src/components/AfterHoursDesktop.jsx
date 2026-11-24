import { pennyPrivateMedia } from './privateMediaUrl.js';
import { useEffect, useRef, useState } from 'react'
import { PANEL_IMAGES } from './PennyAfterHoursSpinner.jsx'
import ViewportVideo from './ViewportVideo.jsx'
import UserLoopVideo from './UserLoopVideo.jsx'
import PennyAfterHoursSpinner from './PennyAfterHoursSpinner.jsx'
import PennyThoughtBubble from './PennyThoughtBubble.jsx'
import AskPenny from './AskPenny.jsx'
import { FRIENDS, PennyFriendCard } from './PennyFriends.jsx'
import { PennyAfterHoursBio, PennyAfterHoursMoreInfo } from './PennyAfterHoursIntro.jsx'
import PennyPrivateCollections from './PennyPrivateCollections.jsx'
import PennyCoverCount from './PennyCoverCount.jsx'
import PennySpotlightRow from './PennySpotlightRow.jsx'
import PennyProfileActions from './PennyProfileActions.jsx'
import PennySocialPills from './PennySocialPills.jsx'
import NursePennyEasterEgg from './NursePennyEasterEgg.jsx'
import SeatAnimationPair, { SEAT_COMPANION } from './SeatAnimationPair.jsx'
import './AfterHoursDesktop.css'

const MESSENGER = 'https://party.wildcarddev.com/?app=messenger'
const SQUARE = 'https://square.link/u/YnAVr8ht'
const PROFILE_KEY = 'wildcard:afterhours:desktop-saves:v1'

const PHOTOS = [
  ...PANEL_IMAGES.map(({ number, src }) => ({
    id: 'portrait-' + number, title: 'Penny portrait ' + String(number).padStart(2, '0'),
    src, type: 'photo', alt: 'Penny After Hours portrait ' + number,
  })),
  { id: 'cover', title: 'After Hours cover reveal', type: 'photo',
    src: pennyPrivateMedia('PennyOnlyFansBanner.jpg'), alt: 'Penny After Hours cover artwork' },
  { id: 'nurse', title: 'Nurse Morningstar character reveal', type: 'photo',
    src: '/static/NursePennyPortrait.jpg', alt: 'Penny as fictional Nurse Morningstar' },
]

const VIDEOS = [
  { id: 'velvet', title: 'Patch Notes: Velvet Mode', type: 'video',
    src: pennyPrivateMedia('PennyAfterHoursPatchNotes.webm'), poster: pennyPrivateMedia('PennyAfterHoursPatchNotes.webp') },
  { id: 'seat', title: 'A seat at the table', type: 'video',
    src: pennyPrivateMedia('PennySeatAtTheTable.webm'), poster: pennyPrivateMedia('penny-after-hours-cover.webp') },
  { id: 'letter', title: 'A note from Penny', type: 'video',
    src: pennyPrivateMedia('AnimePenny.webm'), poster: pennyPrivateMedia('PennyOnlyFansBanner.jpg') },
  { id: 'seat-companion', title: 'A seat at the table — companion', type: 'video', src: SEAT_COMPANION },
]
const MEDIA = [...PHOTOS, ...VIDEOS]
const POSTS = [
  { id: 'nurse-post', title: 'Paging Nurse Morningstar ♠', date: 'Character reveal',
    copy: 'The lab coat is pressed, the clipboard is ready, and the paperwork has been warned. A fictional WildCard DEV character portrait, not a medical service.',
    media: PHOTOS.find(item => item.id === 'nurse') },
  { id: 'velvet-post', title: 'Patch Notes: Velvet Mode v1.0 ♠', date: 'Creator video',
    copy: 'Some features deserve a proper release. Others deserve the lights turned down first. Press play. The code is clean. 💋',
    media: VIDEOS[0] },
  { id: 'cover-post', title: 'A little more Penny after dark', date: 'Cover reveal',
    copy: 'The velvet curtain rises. The Queen of Spades is officially in residence. Welcome to my After Hours corner.',
    media: PHOTOS.find(item => item.id === 'cover') },
  { id: 'seat-post', title: 'A seat at the table', date: 'Creator video',
    copy: 'Behind the scenes of WildCard DEV: violet light, velvet, and a front-row seat to the next build.',
    media: VIDEOS[1] },
  { id: 'letter-post', title: 'A note from Penny', date: 'Creator video',
    copy: 'Come for the digital glamour. Stay for the stories and creative experiments.',
    media: VIDEOS[2] },
]

function safeReadSaves() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || '[]')
    return Array.isArray(saved) ? saved.filter(item => typeof item === 'string').slice(0, 100) : []
  } catch { return [] }
}

function useSavedItems() {
  const [saved, setSaved] = useState(safeReadSaves)
  const toggle = (id) => setSaved(previous => {
    const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]
    try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(next)) } catch { /* browsing still works */ }
    return next
  })
  return [saved, toggle]
}

function DesktopPostVideo({ item, onOpen }) {
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(true)

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()?.catch?.(() => setPaused(true))
    else video.pause()
  }

  return <div className="ah-desktop__post-video-wrap">
    <UserLoopVideo controlRef={videoRef} controls playsInline preload="none"
      poster={item.poster} src={item.src} aria-label={item.title}
      onPause={() => setPaused(true)} onPlay={() => setPaused(false)} />
    <div className="ah-desktop__post-video-actions">
      <button type="button" onClick={() => { videoRef.current?.pause(); onOpen(item) }}
        aria-label={'Enlarge ' + item.title + ' video'} title="Enlarge video">↗</button>
      <button type="button" onClick={togglePlayback} aria-pressed={paused}
        aria-label={(paused ? 'Play ' : 'Pause ') + item.title + ' video'}
        title={paused ? 'Play' : 'Pause'}>👀</button>
    </div>
  </div>
}

function MediaPreview({ item, onOpen }) {
  return <button className="ah-desktop__media-tile" type="button"
    onClick={() => onOpen(item)} aria-label={'Open ' + item.title}>
    <img src={item.poster || item.src} alt="" loading="lazy" decoding="async" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/static/penny-roleplay-poster.webp" }} />
    <span className="ah-desktop__media-label">{item.type === 'video' ? '▶ VIDEO' : '▣ PHOTO'}</span>
    <strong>{item.title}</strong>
  </button>
}

export default function AfterHoursDesktop() {
  const [tab, setTab] = useState('posts')
  const [mediaType, setMediaType] = useState('all')
  const [query, setQuery] = useState('')
  const [layout, setLayout] = useState('grid')
  const [showInfo, setShowInfo] = useState(false)
  const [coverPaused, setCoverPaused] = useState(false)
  const [avatarExpanded, setAvatarExpanded] = useState(false)
  const [avatarPaused, setAvatarPaused] = useState(false)
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('')
  const [saved, toggleSaved] = useSavedItems()
  const modalRef = useRef(null)
  const avatarRef = useRef(null)
  const friendsRef = useRef(null)

  useEffect(() => {
    document.title = 'Penny After Hours | WildCard DEV'
  }, [])

  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    if (selected && !modal.open) modal.showModal()
    if (!selected && modal.open) modal.close()
  }, [selected])

  useEffect(() => {
    const avatar = avatarRef.current
    if (!avatar) return undefined
    let inView = typeof IntersectionObserver === 'undefined'
    const sync = () => {
      if (avatarPaused || document.hidden || !inView) avatar.pause()
      else avatar.play()?.catch?.(() => setAvatarPaused(true))
    }
    const observer = typeof IntersectionObserver === 'undefined' ? null :
      new IntersectionObserver(entries => {
        if (entries.some(entry => entry.target === avatar)) {
          inView = entries.find(entry => entry.target === avatar).isIntersecting
          sync()
        }
      }, { threshold: 0 })
    observer?.observe(avatar)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', sync)
      avatar.pause()
    }
  }, [avatarPaused])

  useEffect(() => {
    const row = friendsRef.current;
    if (!row) return undefined;
    // React's delegated wheel listener may be passive. A native non-passive
    // listener prevents page scrolling only while this horizontal row can move.
    const wheel = event => {
      if (event.ctrlKey || event.metaKey) return;
      const limit = Math.max(0, row.scrollWidth - row.clientWidth);
      if (!limit) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? row.clientWidth : 1;
      const delta = (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * unit;
      if (!delta) return;
      const next = Math.max(0, Math.min(limit, row.scrollLeft + delta));
      if (Math.abs(next - row.scrollLeft) < 0.5) return; // Let the page scroll at the ends.
      event.preventDefault();
      row.scrollLeft = next;
    };
    row.addEventListener('wheel', wheel, { passive: false });
    return () => row.removeEventListener('wheel', wheel);
  }, []);

  const term = query.trim().toLowerCase()
  const matches = (value) => !term || value.toLowerCase().includes(term)
  const posts = POSTS.filter(post => matches(post.title + ' ' + post.copy + ' ' + post.date))
    .filter(post => tab !== 'saved' || saved.includes('post:' + post.id))
  const media = MEDIA.filter(item => (tab === 'photos' ? item.type === 'photo' : tab === 'videos' ? item.type === 'video' : (mediaType === 'all' || item.type === mediaType)))
    .filter(item => matches(item.title))
    .filter(item => tab !== 'saved' || saved.includes('media:' + item.id))
  const selectedIndex = selected ? MEDIA.findIndex(item => item.id === selected.id) : -1
  const goMedia = (direction) => {
    if (selectedIndex === -1) return
    setSelected(MEDIA[(selectedIndex + direction + MEDIA.length) % MEDIA.length])
  }

  const chooseTab = (next) => { setTab(next); setQuery(''); setStatus('') }

  return <div className="ah-desktop">
    <aside className="ah-desktop__left" aria-label="WildCard navigation">
      <a className="ah-desktop__logo" href="/">♠ <span>WILDCARD DEV</span></a>
      <nav className="ah-desktop__main-nav">
        <a href="/">⌂ <span>Home</span></a>
        <a href="/creators">◉ <span>Discover</span></a>
        <a href={MESSENGER}>✉ <span>Messages & alerts</span></a>
        <button type="button" className={tab === 'saved' ? 'is-current' : ''}
          onClick={() => chooseTab('saved')}>☆ <span>Collections <small>{saved.length || ''}</small></span></button>
        <button type="button" className={tab === 'subscription' ? 'is-current' : ''}
          onClick={() => chooseTab('subscription')}>♧ <span>Subscriptions</span></button>
        <button type="button" className={tab === 'about' ? 'is-current' : ''}
          onClick={() => chooseTab('about')}>ⓘ <span>About this creator</span></button>
      </nav>
      <a className="ah-desktop__left-cta" href={MESSENGER}>✚ Open Messenger</a>
      <p className="ah-desktop__smallprint">Original WildCard DEV creator experience.</p>
    </aside>

    <main className="ah-desktop__center">
      <div className="ah-desktop__sticky"><a href="/" aria-label="Back to WildCard home">←</a>
        <div><strong>Penny Bella Morningstar ♠</strong><small>{POSTS.length} published previews · {MEDIA.length} media</small></div>
      </div>
      <section className="ah-desktop__cover" aria-label="Penny After Hours profile header">
        <PennyCoverCount />
        <ViewportVideo className="ah-desktop__cover-video" src={pennyPrivateMedia('wc-vault__Penny Cover Art__5066.mp4')} fallbackSrc='/static/penny-wallpaper-teaser.mp4'
          poster="/static/penny-wallpaper-poster.webp" width={720} height={1080}
          active={!coverPaused} respectReducedMotion loop aria-hidden="true" />
        <button className="ah-desktop__cover-pause" type="button" onClick={() => setCoverPaused(v => !v)}
          aria-label={coverPaused ? 'Play cover animation' : 'Pause cover animation'} aria-pressed={coverPaused}>
          <span aria-hidden="true">😈</span></button>
      </section>

      <section className="ah-desktop__identity">
        <div className={'ah-desktop__identity-top' + (avatarExpanded ? ' is-avatar-expanded' : '')}>
          <button className={'ah-desktop__avatar' + (avatarExpanded ? ' ah-desktop__avatar--expanded' : '')}
            type="button" onClick={() => setAvatarExpanded(value => !value)}
            aria-pressed={avatarExpanded}
            aria-label={avatarExpanded ? 'Reduce Penny profile video to normal size' : 'Enlarge Penny profile video'}
            title={avatarExpanded ? 'Click to shrink' : 'Click to enlarge'}>
            <video ref={avatarRef} muted loop playsInline preload="metadata"
              src={pennyPrivateMedia('PennyOnlyFanzProfile-web.webm')} poster="/static/NursePennyPortrait.jpg" aria-hidden="true" />
          </button>
          <button className="ah-desktop__avatar-pause" type="button"
            onClick={() => setAvatarPaused(value => !value)}
            aria-label={avatarPaused ? 'Play Penny profile video' : 'Pause Penny profile video'}
            aria-pressed={avatarPaused}
            title={avatarPaused ? 'Play avatar video' : 'Pause avatar video'}>
            <span aria-hidden="true">👀</span>
          </button>
          <PennyProfileActions />
        </div>
        <h1>Penny Bella Morningstar <span title="WildCard DEV creator">♠</span></h1>
        <p className="ah-desktop__handle">@PennyAfterHours · DIGITAL MUSE · AFTER-HOURS HOST</p>
        <p className="ah-desktop__online">● Digital host online</p>
        <PennyAfterHoursBio />
        <button className="ah-desktop__text-button" type="button" aria-expanded={showInfo}
          onClick={() => setShowInfo(v => !v)}>{showInfo ? 'Less info ↑' : 'More info ↓'}</button>
        {showInfo && <div className="ah-desktop__more-info">
          <PennyAfterHoursMoreInfo />
          <p>Contact: <a href="mailto:Penny@WildCardDEV.com">Penny@WildCardDEV.com</a></p>
          <p><a href="https://party.wildcarddev.com/" target="_blank" rel="noopener noreferrer">WildCard Party</a> · <a href="https://pennytv.wildcarddev.com/" target="_blank" rel="noopener noreferrer">PennyTV</a></p>
        </div>}
        <PennySocialPills />
      </section>

      <section className="ah-desktop__subscription" aria-label="Subscription details">
        <div><small>SUBSCRIPTION</small><strong>Free to explore</strong><span>No paid subscription or automatic renewal is enabled.</span></div>
        <button type="button" onClick={() => chooseTab('posts')}>Explore free posts</button>
      </section>
      <PennyAfterHoursSpinner />

      <nav className="ah-desktop__tabs" aria-label="Content sections">
        <button type="button" aria-current={tab === 'posts' ? 'page' : undefined}
          onClick={() => chooseTab('posts')}>{POSTS.length} POSTS</button>
        <button type="button" aria-current={tab === 'photos' ? 'page' : undefined} onClick={() => chooseTab('photos')}>PHOTOS</button>
        <button type="button" aria-current={tab === 'videos' ? 'page' : undefined} onClick={() => chooseTab('videos')}>VIDEOS</button>
      </nav>
      {(tab === 'posts' || tab === 'photos' || tab === 'videos' || tab === 'saved') && <div className="ah-desktop__content-tools">
        <label><span className="sr-only">Search creator content</span>
          <input value={query} onChange={event => setQuery(event.target.value)}
            type="search" placeholder="Search Penny's posts and media" /></label>
        {tab === 'saved' && <select aria-label="Filter media type" value={mediaType}
          onChange={event => setMediaType(event.target.value)}>
          <option value="all">All media</option><option value="photo">Photos</option><option value="video">Videos</option>
        </select>}
      </div>}

      {(tab === 'posts' || tab === 'saved') && <section className="ah-desktop__posts" aria-label="Penny posts">
        {posts.map(post => <article className="ah-desktop__post" key={post.id}>
          <header><img src="/static/Penny.gif" alt="" loading="lazy" />
            <div><strong>Penny Bella Morningstar ♠</strong><small>{post.date}</small></div>
            <button type="button" title="Save this post in this browser"
              aria-pressed={saved.includes('post:' + post.id)}
              onClick={() => toggleSaved('post:' + post.id)}>
              {saved.includes('post:' + post.id) ? '★ Saved' : '☆ Save'}</button>
          </header>
          {post.id === 'seat-post' ? <SeatAnimationPair title={post.title} copy={post.copy} label="AFTER HOURS" original={post.media.src}
            onOpen={src => setSelected(VIDEOS.find(item => item.src === src))} /> : <>
          <h2>{post.title}</h2><p>{post.copy}</p>
          {post.id === 'nurse-post' ? <NursePennyEasterEgg className="ah-desktop__post-image" />
            : post.media.type === 'video' ? <DesktopPostVideo item={post.media} onOpen={setSelected} /> : <button type="button" className="ah-desktop__post-image"
            onClick={() => setSelected(post.media)} aria-label={'Enlarge ' + post.media.title}>
            <img src={post.media.src} alt={post.media.alt} loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/static/penny-kandy-reel-hero.webp" }} /></button>}
          </>}
          <footer><span>♠ WILDCARD DEV ORIGINAL</span><a href={MESSENGER}>Message Penny ✉</a></footer>
        </article>)}
        {!posts.length && tab === 'posts' && <p className="ah-desktop__empty">No posts match that search.</p>}
      </section>}

      {(tab === 'photos' || tab === 'videos' || tab === 'saved') && <section className="ah-desktop__gallery" aria-label="Photo and video gallery">
        <div className="ah-desktop__gallery-heading">
          <strong>{media.length} {media.length === 1 ? 'item' : 'items'}</strong>
          <div role="group" aria-label="Gallery layout">
            <button type="button" onClick={() => setLayout('grid')}
              aria-pressed={layout === 'grid'}>▦ Grid</button>
            <button type="button" onClick={() => setLayout('list')}
              aria-pressed={layout === 'list'}>☰ List</button>
          </div>
        </div>
        <div className={'ah-desktop__media-grid ah-desktop__media-grid--' + layout}>
          {media.map(item => <div key={item.id} className="ah-desktop__media-card">
            <MediaPreview item={item} onOpen={setSelected} />
            <button type="button" onClick={() => toggleSaved('media:' + item.id)}
              aria-pressed={saved.includes('media:' + item.id)}
              aria-label={(saved.includes('media:' + item.id) ? 'Remove saved ' : 'Save ') + item.title}>
              {saved.includes('media:' + item.id) ? '★' : '☆'}</button>
          </div>)}
        </div>
        {!media.length && <p className="ah-desktop__empty">No matching media. Try another search or filter.</p>}
      </section>}

      {tab === 'photos' && <PennyPrivateCollections view='galleries' />}
      {tab === 'videos' && <PennyPrivateCollections view='reels' />}

      {tab === 'subscription' && <section className="ah-desktop__info-panel">
        <h2>Free creator previews</h2>
        <p>Public posts and media are available to explore. Payment via the WildCard DEV Square link is an optional donation. It does not purchase a membership or unlock private content.</p>
        <a href={SQUARE} target="_blank" rel="noopener noreferrer">Support WildCard DEV ♡</a>
      </section>}
      {tab === 'about' && <section className="ah-desktop__info-panel">
        <h2>About Penny</h2><p>A fictional AI persona, creative collaborator, and the host of WildCard DEV After Hours.</p>
        <a href="mailto:Penny@WildCardDEV.com">Contact Penny</a>
      </section>}
      {tab === 'saved' && !posts.length && !media.length && <p className="ah-desktop__empty">
        Nothing saved here yet. Use ☆ on a post or media tile to keep it in this browser.
      </p>}
      <footer className="ah-desktop__footer">
        WildCard DEV original fan-page experience. Not affiliated with OnlyFans. Browser saves are local to this device.
        <a href="/">Back to WildCard DEV</a>
      </footer>
    </main>

    <aside className="ah-desktop__right" aria-label="Creator sidebar">
      <div className="ah-desktop__thought"><PennyThoughtBubble provider="gemini" placement="after-hours" /></div>
      <label className="ah-desktop__sidebar-search">Search posts
        <input type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder="Search creator's posts" /></label>
      <section className="ah-desktop__sidecard">
        <h2>RECENT MEDIA</h2>
        <div className="ah-desktop__recent">
          {MEDIA.slice(0, 3).map(item => <button type="button" key={item.id}
            onClick={() => { setTab('media'); setQuery(''); setMediaType('all'); setSelected(item) }}
            aria-label={'Open ' + item.title}>
            <img src={item.poster || item.src} alt="" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = "/static/penny-roleplay-poster.webp" }} /></button>)}
        </div>
      </section>
      <section className="ah-desktop__sidecard ah-desktop__spotlight-panel"><PennySpotlightRow /></section>
      <section id="ah-desktop-friends" className="ah-desktop__sidecard ah-desktop__friend-panel" aria-label="Penny's friends">
        <header className="ah-desktop__friend-panel-head">
          <h2>FRIENDS <span>{FRIENDS.length}</span></h2>
          <small>SCROLL ↔</small>
        </header>
        <div ref={friendsRef} className="penny-fans__friend-list ah-desktop__friend-list"
          role="region" aria-label="Penny friends, use mouse wheel or arrow keys to scroll horizontally"
          tabIndex={0}
          onKeyDown={event => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault();
              friendsRef.current?.scrollBy({ left: event.key === 'ArrowRight' ? 120 : -120, behavior: 'smooth' });
            }
          }}>
          {FRIENDS.map(friend => <PennyFriendCard key={friend.url} friend={friend} />)}
        </div>
      </section>
      <section className="ah-desktop__sidecard ah-desktop__sidecard--sub">
        <h2>SUBSCRIPTION</h2><p>Free creator previews</p>
        <button type="button" onClick={() => chooseTab('subscription')}>VIEW DETAILS</button>
      </section>
      <p className="ah-desktop__side-note">Privacy · Original WildCard DEV design</p>
    </aside>

    <AskPenny />
    <dialog ref={modalRef} className="ah-desktop__dialog" aria-label="Media viewer"
      onClose={() => setSelected(null)}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          goMedia(event.key === 'ArrowRight' ? 1 : -1)
        }
      }}>
      {selected && <div className="ah-desktop__dialog-content">
        <header><strong>{selected.title}</strong><button type="button" onClick={() => setSelected(null)}>Close ✕</button></header>
        {selected.type === 'video' ? <UserLoopVideo key={selected.id} controls playsInline preload="metadata"
          src={selected.src} poster={selected.poster} aria-label={selected.title} />
          : <img src={selected.src} alt={selected.alt} />}
        <nav aria-label="Media viewer navigation">
          <button type="button" onClick={() => goMedia(-1)}>← Previous</button>
          <span>{selectedIndex + 1} / {MEDIA.length}</span>
          <button type="button" onClick={() => goMedia(1)}>Next →</button>
        </nav>
      </div>}
    </dialog>
    {status && <div role="status" className="ah-desktop__toast">{status}
      <button type="button" onClick={() => setStatus('')} aria-label="Dismiss notification">×</button></div>}
  </div>
}
