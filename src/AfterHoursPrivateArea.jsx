import { useEffect, useState } from 'react'
import { LABEL } from './components/AfterHoursPublicProfile.jsx'
import PennyProfileActions from './components/PennyProfileActions.jsx'
import PennyPrivateCollections from './components/PennyPrivateCollections.jsx'
import './PennyAfterHours.css'
import './components/AfterHoursDesktop.css'
import './CreatorMemberProfile.css'
import PennyAfterHoursSpinner from './components/PennyAfterHoursSpinner.jsx'
import PennyThoughtBubble from './components/PennyThoughtBubble.jsx'
import AskPenny from './components/AskPenny.jsx'
import ViewportVideo from './components/ViewportVideo.jsx'
import {useManagedContent,ManagedCover,ManagedPosts,ManagedProfileVideo,managedAsset} from './components/ManagedCreatorContent.jsx'

const PARTY = 'https://party.wildcarddev.com'
const TABS = ['posts', 'photos', 'videos', 'profile']
const CREATORS = ['penny', 'kandy', 'ashley']

function CreatorFriends({ area }) {
  return <section className="penny-fans__friends" aria-label="WildCard creator profiles">
    <h2>FRIENDS <span>{CREATORS.length - 1}</span></h2>
    <div className="penny-fans__friend-list">
      {CREATORS.filter(id => id !== area).map(id => <a key={id} className="creator-member__friend" href={'/' + id + '/after-hours'}>
        <img src={LABEL[id].image} alt="" loading="lazy" />
        <strong>{LABEL[id].short}</strong><small>WildCard DEV</small>
      </a>)}
    </div>
  </section>
}

export default function AfterHoursPrivateArea({ area }) {
  const profile = LABEL[area]
  const managed = useManagedContent(area)
  const [tab, setTab] = useState('posts')
  const [expanded, setExpanded] = useState(false)
  const [more, setMore] = useState(false)
  const [avatarPaused,setAvatarPaused]=useState(false)
  const [query,setQuery]=useState('')
  const avatarAsset=managedAsset(managed,'avatarId')
  const avatarAnimated=Boolean(avatarAsset?.type?.startsWith('video/'))
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 1100px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)')
    const sync = () => setDesktop(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    if (profile) document.title = profile.short + ' After Hours · WildCard DEV'
  }, [profile])
  if (!profile || !['kandy', 'ashley'].includes(area)) return null

  const name = profile.short
  const choose = next => { setTab(next); setQuery('') }
  const pause=<button type="button" className={desktop?'ah-desktop__avatar-pause':'penny-fans__avatar-control'} aria-label={avatarPaused?'Resume avatar video':'Pause avatar video'} aria-pressed={avatarPaused} onClick={()=>setAvatarPaused(v=>!v)}>👀</button>
  const avatar = <button type="button"
    className={desktop ? 'ah-desktop__avatar' + (expanded ? ' ah-desktop__avatar--expanded' : '') : 'penny-fans__avatar-slot'}
    onClick={() => setExpanded(value => !value)} aria-pressed={expanded} aria-label={expanded ? 'Reduce profile portrait' : 'Enlarge profile portrait'}>
    {avatarAnimated ? <ViewportVideo className="penny-fans__avatar" src={avatarAsset.src} poster={profile.image} active={!avatarPaused} respectReducedMotion loop aria-hidden="true" /> : <img className="penny-fans__avatar" src={avatarAsset?.src||profile.image} alt={name + ' profile artwork'} onError={e=>{if(e.currentTarget.getAttribute('src')!==profile.image)e.currentTarget.src=profile.image}} />}
  </button>
  const intro = <>
    <h1>{profile.name} <span>♠</span></h1>
    <p className={desktop ? 'ah-desktop__handle' : 'penny-fans__handle'}>WildCard DEV · {profile.headline}</p>
    <p className="penny-fans__bio">{profile.description}</p>
    <button type="button" className={desktop ? 'ah-desktop__text-button' : 'penny-fans__bio-toggle'}
      aria-expanded={more} onClick={() => setMore(v => !v)}>{more ? 'Less info ↑' : 'More info ↓'}</button>
    {more && <p className="creator-member__description">Explore {name}’s original WildCard DEV creator pages and approved member collections.</p>}
    <nav className="creator-member__links" aria-label={name + ' links'}>
      {profile.links.map(link => <a key={link.href} href={link.href}>{link.name} ↗</a>)}
    </nav>
  </>
  const identity = desktop
    ? <section className="ah-desktop__identity">
        <div className={'ah-desktop__identity-top' + (expanded ? ' is-avatar-expanded' : '')}>{avatar}{avatarAnimated&&pause}<PennyProfileActions area={area} name={name} /></div>
        {intro}
      </section>
    : <section className={'penny-fans__profile' + (expanded ? ' penny-fans__profile--avatar-expanded' : '') + (avatarAnimated?'':' creator-member__static-avatar')}>
        {avatar}{avatarAnimated&&pause}<PennyThoughtBubble provider="gemini" placement="after-hours" /><PennyProfileActions area={area} name={name} />
        <div className="penny-fans__intro">{intro}</div><CreatorFriends area={area} />
      </section>

  const content = <>
    <section className={desktop ? 'ah-desktop__subscription' : 'penny-fans__membership'} aria-label="Membership">
      <div><small>MEMBERSHIP</small><p>Approved member · Free access</p></div>
      <a href={PARTY + '/?app=messenger'}>Messenger ↗</a>
    </section>
    <PennyAfterHoursSpinner managed={managed} area={area} name={name} />
    <nav id="creator-member-tabs" className={desktop ? 'ah-desktop__tabs' : 'penny-fans__tabs'} aria-label="Content sections">
      {TABS.map(id => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => choose(id)}>{id.toUpperCase()}</button>)}
    </nav>
    {tab === 'posts' ? <section className={desktop ? 'ah-desktop__posts' : 'penny-fans__feed'} aria-label={name + ' posts'}>
      <label className="creator-member__search">Search posts <input type="search" value={query} onChange={e=>setQuery(e.target.value)} /></label>
      <ManagedPosts data={managed} name={name} desktop={desktop} query={query} />
      {(!query.trim()||('Meet '+name+' '+profile.description).toLowerCase().includes(query.trim().toLowerCase()))&&<article className={desktop ? 'ah-desktop__post' : 'penny-fans__featured-post'}>
        <header className="creator-member__post-header"><img src={profile.image} alt="" /><div><strong>{name} ♠</strong><small>Creator spotlight</small></div></header>
        <div className="penny-fans__featured-copy"><h2>Meet {name}</h2><p>{profile.description}</p></div>
        <a className="creator-member__post-art" href={profile.links[0].href}><img src={profile.image} alt={'Visit ' + name + '’s WildCard creator page'} /></a>
        <footer className="creator-member__post-footer">♠ WILDCARD DEV ORIGINAL <a href={profile.links[0].href}>Explore ↗</a></footer>
      </article>}
      <div className="creator-member__links"><button onClick={() => choose('photos')}>Explore photo collections</button><button onClick={() => choose('videos')}>Explore video collections</button></div>
    </section> : tab==='profile' ? <section className="penny-fans__about" aria-label={'About '+name}>
      <p className="penny-fans__eyebrow">BEHIND THE VELVET CURTAIN</p>
      <h2>{name} ♠</h2>
      <ManagedProfileVideo data={managed} />
      <p>{profile.description}</p>
      <nav className="creator-member__links">{profile.links.map(link=><a key={link.href} href={link.href}>{link.name} ↗</a>)}</nav>
    </section> : <PennyPrivateCollections key={tab} area={area} view={tab === 'videos' ? 'reels' : 'galleries'} />}
  </>

  if (desktop) return <div className="ah-desktop creator-member">
    <aside className="ah-desktop__left" aria-label="WildCard navigation">
      <a className="ah-desktop__logo" href="/">♠ <span>WILDCARD DEV</span></a>
      <nav className="ah-desktop__main-nav">
        <a href="/">⌂ <span>Home</span></a><a href="/creators">◉ <span>Discover</span></a><a href={PARTY + '/?app=messenger'}>✉ <span>Messages</span></a>
        {TABS.map(id => <button type="button" key={id} className={tab === id ? 'is-current' : ''} onClick={() => choose(id)}>♧ <span>{id}</span></button>)}
      </nav>
    </aside>
    <main className="ah-desktop__center">
      <div className="ah-desktop__sticky"><a href="/creators" aria-label="Back to creators">←</a><div><strong>{name} ♠</strong><small>WildCard DEV · After Hours</small></div></div>
      <section className="ah-desktop__cover"><ManagedCover data={managed} className="ah-desktop__cover-video"><img className="ah-desktop__cover-video" src={profile.image} alt={name + ' cover artwork'} /></ManagedCover></section>
      {identity}{content}
      <footer className="ah-desktop__footer">♠ WildCard DEV · Member collections remain protected</footer>
    </main>
    <aside className="ah-desktop__right"><div className="ah-desktop__thought"><PennyThoughtBubble provider="gemini" placement="after-hours" /></div><CreatorFriends area={area} /></aside>
    <AskPenny />
  </div>
  return <main className="penny-fans creator-member">
    <div className="penny-fans__wash" aria-hidden="true" />
    <header className="penny-fans__topbar"><a className="penny-fans__brand" href="/">♠ WildCard DEV</a><span className="penny-fans__edition">{name.toUpperCase()} / AFTER HOURS</span><a href="/creators">← Creators</a></header>
    <div className="penny-fans__shell">
      <section className="penny-fans__cover"><ManagedCover data={managed} className="penny-fans__cover-image"><img className="penny-fans__cover-image" src={profile.image} alt={name + ' cover artwork'} /></ManagedCover><span className="penny-fans__cover-label">{name.toUpperCase()} AFTER HOURS</span></section>
      {identity}{content}
      <nav className="penny-fans__bottom-nav" aria-label="After Hours main navigation">
        <button type="button" aria-current={tab==='posts'?'page':undefined} onClick={()=>{choose('posts');window.scrollTo({top:0})}}><span aria-hidden="true">⌂</span><span>Home</span></button>
        <a href="/creators"><span aria-hidden="true">◉</span><span>Explore</span></a>
        <a href={PARTY+'/?app=messenger'}><span aria-hidden="true">✉</span><span>Messages</span></a>
        <button type="button" aria-current={tab==='profile'?'page':undefined} onClick={()=>{choose('profile');document.getElementById('creator-member-tabs')?.scrollIntoView({block:'start'})}}><span aria-hidden="true">♙</span><span>Profile</span></button>
      </nav>
      <AskPenny />
      <footer className="penny-fans__footer">♠ WildCard DEV · Member collections remain protected</footer>
    </div>
  </main>
}
