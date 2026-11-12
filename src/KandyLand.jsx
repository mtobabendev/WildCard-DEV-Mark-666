import { useEffect, useState } from 'react';
import './CreatorProfile.css';

const KANDY = {
  name: 'Kandy',
  title: 'KandyLand',
  handle: 'Kopacetic Kandle',
  mark: '♦',
  description: 'Music, tarot, cover art, and stories from the creative side of WildCard DEV.',
  music: [
    { title: 'Newest track', href: 'https://suno.com/s/JwxHfnS6IWD0exoW', label: 'Listen on Suno' },
    { title: 'Previous release', href: 'https://suno.com/song/34d73d33-56ab-4beb-adab-cde275ca1ad3?sh=HRAX1Ir73RfDIBmF', label: 'Listen on Suno' },
    { title: 'Music collection', href: 'https://suno.com/s/8wuDm8yj3GZIab9M', label: 'Explore the collection' },
  ],
  posts: [
    { id: 'welcome', category: 'CREATOR JOURNAL', title: 'Welcome to KandyLand', text: 'A new creative space for original music, artwork, tarot, and stories. Explore the collection and discover what Kandy is working on.' },
    { id: 'music', category: 'MUSIC', title: 'The latest release', text: 'Hear the newest track from Kopacetic Kandle.', href: 'https://suno.com/s/JwxHfnS6IWD0exoW', label: 'Listen on Suno' },
    { id: 'tarot', category: 'TAROT', title: 'The reading room', text: 'A space for tarot reflections and creative inspiration. New reading-room entries will appear here as they are approved.' },
  ],
};
const TABS = ['Posts', 'Photos', 'Videos', 'Music', 'Tarot', 'About'];

function ExternalLink({ href, children }) {
  return <a className="creator-profile__action" href={href} target="_blank" rel="noopener noreferrer">{children} <span aria-hidden="true">↗</span></a>;
}

function CreatorProfile({ creator }) {
  const [tab, setTab] = useState('Posts');
  useEffect(() => {
    document.title = creator.title + ' | WildCard DEV';
  }, [creator.title]);
  return (
    <main className="creator-profile">
      <div className="creator-profile__shell">
        <header className="creator-profile__top">
          <a href="/">♠ WildCard DEV</a>
          <span>CREATOR COLLECTION</span>
        </header>
        <section className="creator-profile__hero" aria-labelledby="creator-name">
          <div className="creator-profile__art" aria-hidden="true">
            <div className="creator-profile__orbit" />
            <span>{creator.mark}</span>
            <strong>{creator.title}</strong>
          </div>
          <div className="creator-profile__identity">
            <span className="creator-profile__sigil" aria-hidden="true">{creator.mark}</span>
            <p className="creator-profile__eyebrow">WILDCARD DEV / CREATOR PROFILE</p>
            <h1 id="creator-name">{creator.name} <span>{creator.mark}</span></h1>
            <p className="creator-profile__handle">{creator.handle}</p>
            <p>{creator.description}</p>
            <ExternalLink href={creator.music[2].href}>Explore Kandy's music</ExternalLink>
          </div>
        </section>
        <nav className="creator-profile__tabs" aria-label="Creator sections">
          {TABS.map(item => <button key={item} type="button" aria-current={tab === item ? 'page' : undefined} onClick={() => setTab(item)}>{item}</button>)}
        </nav>
        <section className="creator-profile__content" aria-label={tab}>
          {tab === 'Posts' && creator.posts.map(post => (
            <article className="creator-profile__card" key={post.id}>
              <p className="creator-profile__eyebrow">{post.category}</p>
              <h2>{post.title}</h2>
              <p>{post.text}</p>
              {post.href && <ExternalLink href={post.href}>{post.label}</ExternalLink>}
            </article>
          ))}
          {tab === 'Photos' && <article className="creator-profile__card">
            <p className="creator-profile__eyebrow">♦ CREATIVE PHOTOGRAPHY</p>
            <h2>Photo gallery</h2>
            <p>Kandy's approved cover art, creative portraits, and behind-the-scenes photography will appear here.</p>
          </article>}
          {tab === 'Videos' && <article className="creator-profile__card">
            <p className="creator-profile__eyebrow">♦ CREATIVE VIDEO</p>
            <h2>Video gallery</h2>
            <p>Kandy's approved music videos, tarot demonstrations, and creative project clips will appear here.</p>
          </article>}
          {tab === 'Music' && creator.music.map(track => (
            <article className="creator-profile__card" key={track.href}>
              <p className="creator-profile__eyebrow">♫ KOPACETIC KANDLE</p>
              <h2>{track.title}</h2>
              <ExternalLink href={track.href}>{track.label}</ExternalLink>
            </article>
          ))}
          {tab === 'Tarot' && <article className="creator-profile__card">
            <p className="creator-profile__eyebrow">♦ THE READING ROOM</p>
            <h2>Tarot and creative reflection</h2>
            <p>Discover future entries exploring the cards, symbolism, and storytelling. This collection is awaiting its first approved entry.</p>
          </article>}
          {tab === 'About' && <article className="creator-profile__card">
            <h2>About Kandy</h2>
            <p>Kandy is a tarot reader, aspiring author, and creative contributor to WildCard DEV. Her music and cover art appear under Kopacetic Kandle.</p>
            <p>This is a public creative portfolio. There are no paid memberships, user submissions, or private messages on this page.</p>
          </article>}
        </section>
        <footer className="creator-profile__footer"><span>♦ WILDCARD DEV · KANDYLAND</span><a href="/">Return to WildCard DEV</a></footer>
      </div>
    </main>
  );
}

export default function KandyLand() {
  return <CreatorProfile creator={KANDY} />;
}
