import { useEffect } from 'react'
import PennyProfileActions from './PennyProfileActions.jsx'
import ViewportVideo from './ViewportVideo.jsx'
import kandyCover from '../../assets/KandyKandle-balanced.webp'
import './AfterHoursPublicProfile.css'

const PARTY = 'https://party.wildcarddev.com'
export const LABEL = {
  penny: {
    name: 'Penny Bella Morningstar', short: 'Penny',
    headline: 'Digital muse · After-Hours host',
    description: 'Pink-lit glamour, original videos, mischievous conversation and friends who know how to make an entrance.',
    image: '/static/penny-wallpaper-poster.webp',
    links: [
      { name: 'PennyTV', href: 'https://pennytv.wildcarddev.com/' },
      { name: 'WildCard Party', href: PARTY },
    ],
  },
  kandy: {
    name: 'Kandy', short: 'Kandy',
    headline: 'Artist · Music · Tarot',
    description: 'Meet Kandy through her WildCard creator showcase, music, original art and creative projects.',
    image: kandyCover,
    links: [
      { name: 'Kandy Art & Tarot', href: '/kandy/showcase' },
      { name: 'Stripagram', href: PARTY + '/stripagram/?profile=kandy' },
    ],
  },
  ashley: {
    name: 'Ashley', short: 'Ashley',
    headline: 'A story remembered · WildCard DEV',
    description: 'Visit Ashley’s Time Capsule and memorial collection. Her story remains an important part of WildCard DEV.',
    image: '/static/AshleyPenthouseMemory.webp',
    links: [
      { name: 'Ashley Time Capsule', href: '/ashley/what-if' },
      { name: 'Ashley Memorial', href: '/ashley/memorial' },
    ],
  },
}

const PUBLIC_ROLEPLAY = '/static/penny-roleplay-tile.mp4'
const PUBLIC_REEL = '/static/penny-kandy-reel-hero.webp'

function accessMessage(status, name) {
  if (status === 'checking') return 'Checking your WildCard member access… Public previews remain available.'
  if (status === 'denied') return name + "'s private collection needs Owner-approved access. The public profile is open."
  if (status === 'unavailable') return 'Member verification is unavailable right now. This public profile is still open.'
  return 'Sign in to WildCard Messenger to request access to the member-only collections.'
}

export default function AfterHoursPublicProfile({ area, accessStatus, onRetry }) {
  const profile = LABEL[area] || LABEL.penny

  useEffect(() => {
    document.title = profile.short + ' After Hours · WildCard DEV'
  }, [profile.short])

  return <main className={'afterhours-public afterhours-public--' + area}>
    <header className="afterhours-public__top">
      <a href="/">♠ WildCard DEV</a>
      <span>{profile.short.toUpperCase()} / AFTER HOURS · 18+</span>
      <a href="/creators">Creators</a>
    </header>
    <div className="afterhours-public__shell">
      <section className="afterhours-public__cover penny-fans__cover" aria-label={profile.short + ' public profile cover'}>
        {area === 'penny' ? <ViewportVideo
          src="/static/penny-wallpaper-teaser.mp4"
          poster={profile.image}
          respectReducedMotion loop
          width={736} height={400}
          aria-label="Penny After Hours public-safe wallpaper preview"
        /> : <img src={profile.image} alt={profile.short + ' public profile artwork'} />}
        <div className="afterhours-public__cover-overlay" aria-hidden="true">♠ WILDCARD DEV / AFTER HOURS</div>
      </section>

      <section className="afterhours-public__identity">
        <span className="afterhours-public__avatar" aria-hidden="true">
          <img src={area === 'penny' ? '/static/NursePennyPortrait.jpg' : profile.image} alt="" />
        </span>
        <div className="afterhours-public__identity-text">
          <p className="afterhours-public__eyebrow">PUBLIC CREATOR PROFILE</p>
          <h1>{profile.name}</h1>
          <h2>{profile.headline}</h2>
          <p>{profile.description}</p>
        </div>
        {area === 'penny' ? <PennyProfileActions /> : <PennyProfileActions area={area} name={profile.short} />}
      </section>

      {area === 'penny' && <section className="afterhours-public__feature" aria-label="Penny public highlights">
        <div className="afterhours-public__section-heading">
          <p className="afterhours-public__eyebrow">FROM THE PUBLIC FEED</p>
          <h2>A little preview of the velvet side ♠</h2>
        </div>
        <div className="afterhours-public__cards">
          <article>
            <img src={PUBLIC_REEL} alt="Penny and Kandy public promotional artwork" loading="lazy" />
            <h3>Penny & Kandy</h3>
            <p>Friends, features and a little midnight mischief.</p>
          </article>
          <article>
            <video src={PUBLIC_ROLEPLAY} muted loop playsInline controls preload="none"
              poster="/static/penny-roleplay-poster.webp" aria-label="Penny roleplay public promo" />
            <h3>Penny Roleplay</h3>
            <p>A short public preview from Penny’s creative collection.</p>
          </article>
        </div>
      </section>}

      <section className="afterhours-public__access" aria-label={profile.short + ' member-only collections'}>
        <p className="afterhours-public__eyebrow">PRIVATE COLLECTIONS · OWNER-APPROVED ACCESS</p>
        <h2>Inside {profile.short}'s private vault 🔐</h2>
        <p role="status">{accessMessage(accessStatus, profile.short)}</p>
        <div className="afterhours-public__buttons">
          <a href={PARTY + '/?app=messenger'} target="_blank" rel="noopener noreferrer">Sign in to WildCard Messenger</a>
          <button type="button" onClick={onRetry}>Check membership</button>
        </div>
        <p className="afterhours-public__fine">Private galleries and reels are not part of this shareable preview. Access remains protected by Party.</p>
      </section>

      <nav className="afterhours-public__links" aria-label={profile.short + ' public links'}>
        {profile.links.map(link => <a key={link.href} href={link.href}
          target={link.href.startsWith('/') ? undefined : '_blank'}
          rel={link.href.startsWith('/') ? undefined : 'noopener noreferrer'}>{link.name} ↗</a>)}
      </nav>
    </div>
    <footer className="afterhours-public__footer">♠ WildCard DEV · Public preview · Member collections remain private</footer>
  </main>
}
