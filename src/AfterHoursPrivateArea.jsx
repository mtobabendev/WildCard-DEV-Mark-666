import { useEffect, useState } from 'react'
import { LABEL } from './components/AfterHoursPublicProfile.jsx'
import PennyProfileActions from './components/PennyProfileActions.jsx'
import PennyPrivateCollections from './components/PennyPrivateCollections.jsx'
import './PennyAfterHours.css'
import './components/AfterHoursDesktop.css'
import './CreatorMemberProfile.css'
import {useManagedContent,ManagedCover,ManagedPosts} from './components/ManagedCreatorContent.jsx'

const PARTY = 'https://party.wildcarddev.com'
const TABS = ['posts', 'photos', 'videos']
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
  const choose = next => { setTab(next); setExpanded(false) }
  const avatar = <button type="button"
    className={desktop ? 'ah-desktop__avatar' + (expanded ? ' ah-desktop__avatar--expanded' : '') : 'penny-fans__avatar-slot'}
    onClick={() => setExpanded(value => !value)} aria-pressed={expanded} aria-label={expanded ? 'Reduce profile portrait' : 'Enlarge profile portrait'}>
    <img className="penny-fans__avatar" src={profile.image} alt={name + ' profile artwork'} />
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
        <div className={'ah-desktop__identity-top' + (expanded ? ' is-avatar-expanded' : '')}>{avatar}<PennyProfileActions area={area} name={name} /></div>
        {intro}
      </section>
    : <section className={'penny-fans__profile' + (expanded ? ' penny-fans__profile--avatar-expanded' : '')}>
        {avatar}<div className="creator-member__mobile-actions"><PennyProfileActions area={area} name={name} /></div>
        <div className="penny-fans__intro">{intro}</div><CreatorFriends area={area} />
      </section>

  const content = <>
    <section className={desktop ? 'ah-desktop__subscription' : 'penny-fans__membership'} aria-label="Membership">
      <div><small>MEMBERSHIP</small><p>Approved member · Free access</p></div>
      <a href={PARTY + '/?app=messenger'}>Messenger ↗</a>
    </section>
    <nav className={desktop ? 'ah-desktop__tabs' : 'penny-fans__tabs'} aria-label="Content sections">
      {TABS.map(id => <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => choose(id)}>{id.toUpperCase()}</button>)}
    </nav>
    {tab === 'posts' ? <section className={desktop ? 'ah-desktop__posts' : 'penny-fans__feed'} aria-label={name + ' posts'}>
      <ManagedPosts data={managed} name={name} desktop={desktop} />
      <article className={desktop ? 'ah-desktop__post' : 'penny-fans__featured-post'}>
        <header className="creator-member__post-header"><img src={profile.image} alt="" /><div><strong>{name} ♠</strong><small>Creator spotlight</small></div></header>
        <div className="penny-fans__featured-copy"><h2>Meet {name}</h2><p>{profile.description}</p></div>
        <a className="creator-member__post-art" href={profile.links[0].href}><img src={profile.image} alt={'Visit ' + name + '’s WildCard creator page'} /></a>
        <footer className="creator-member__post-footer">♠ WILDCARD DEV ORIGINAL <a href={profile.links[0].href}>Explore ↗</a></footer>
      </article>
      <div className="creator-member__links"><button onClick={() => choose('photos')}>Explore photo collections</button><button onClick={() => choose('videos')}>Explore video collections</button></div>
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
    <aside className="ah-desktop__right"><CreatorFriends area={area} /></aside>
  </div>
  return <main className="penny-fans creator-member">
    <div className="penny-fans__wash" aria-hidden="true" />
    <header className="penny-fans__topbar"><a className="penny-fans__brand" href="/">♠ WildCard DEV</a><span className="penny-fans__edition">{name.toUpperCase()} / AFTER HOURS</span><a href="/creators">← Creators</a></header>
    <div className="penny-fans__shell">
      <section className="penny-fans__cover"><ManagedCover data={managed} className="penny-fans__cover-image"><img className="penny-fans__cover-image" src={profile.image} alt={name + ' cover artwork'} /></ManagedCover><span className="penny-fans__cover-label">{name.toUpperCase()} AFTER HOURS</span></section>
      {identity}{content}
      <footer className="penny-fans__footer">♠ WildCard DEV · Member collections remain protected</footer>
    </div>
  </main>
}
