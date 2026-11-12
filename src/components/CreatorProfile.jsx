import { useEffect, useState } from 'react';
import './CreatorProfile.css';

const SECTIONS = [
  { id: 'posts', label: 'Posts', icon: '⌂' },
  { id: 'music', label: 'Music', icon: '♫' },
  { id: 'photos', label: 'Photos', icon: '▧' },
  { id: 'videos', label: 'Videos', icon: '▷' },
  { id: 'about', label: 'About', icon: '◇' },
];

export default function CreatorProfile({ creator }) {
  const [tab, setTab] = useState('posts');

  useEffect(() => {
    document.title = creator.brand + ' | WildCard DEV';
  }, [creator.brand]);

  const navigate = (id) => {
    setTab(id);
    document.getElementById('creator-content')?.scrollIntoView({ block: 'start' });
  };

  return (
    <main className={'wc-creator wc-creator--' + creator.theme}>
      <div className="wc-creator__shell">
        <header className="wc-creator__top">
          <a href="/">♠ WildCard DEV</a>
          <span>CREATOR SPOTLIGHT</span>
          <a href="/">Back to WildCard</a>
        </header>

        <section className="wc-creator__hero" aria-labelledby="creator-name">
          <div className="wc-creator__cover" aria-hidden="true">
            <div className="wc-creator__orb"><span>{creator.symbol}</span></div>
            <span className="wc-creator__cover-label">WILDCARD DEV / ORIGINALS</span>
            <div className="wc-creator__cover-brand">{creator.brand}</div>
          </div>
          <div className="wc-creator__identity">
            <div className="wc-creator__avatar" aria-hidden="true">{creator.initials}<small>{creator.symbol}</small></div>
            <p className="wc-creator__eyebrow">ARTIST / CREATOR</p>
            <h1 id="creator-name">{creator.name} <span>{creator.symbol}</span></h1>
            <p className="wc-creator__alias">{creator.alias} · WildCard DEV</p>
            <h2>{creator.headline}</h2>
            <p>{creator.bio}</p>
            <div className="wc-creator__actions">
              <button type="button" onClick={() => navigate('music')}>♫ Explore music</button>
              <a href={'mailto:' + creator.contact}>Contact {creator.name}</a>
            </div>
          </div>
        </section>

        <section className="wc-creator__content" id="creator-content" aria-label="Creator content">
          <nav className="wc-creator__tabs" aria-label="Creator sections">
            {SECTIONS.map((section) => (
              <button key={section.id} type="button" onClick={() => setTab(section.id)} aria-current={tab === section.id ? 'page' : undefined}>
                {section.label}{section.id === 'photos' || section.id === 'videos' ? <small>{creator[section.id].length}</small> : null}
              </button>
            ))}
          </nav>
          {tab === 'posts' && (
            <section className="wc-creator__grid" aria-label="Creator posts">
              {creator.posts.map((post) => (
                <article key={post.id} className="wc-creator__card">
                  <div className="wc-creator__art" aria-hidden="true">{post.symbol}</div>
                  <div className="wc-creator__card-body">
                    <p className="wc-creator__eyebrow">{post.label}</p>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                  </div>
                </article>
              ))}
            </section>
          )}
          {tab === 'music' && (
            <section className="wc-creator__card wc-creator__card-body" aria-label="Music releases">
              <p className="wc-creator__eyebrow">KOPACETIC KANDLE / MUSIC</p>
              <h2>Listen to Kandy</h2>
              {creator.music.map((track) => (
                <a className="wc-creator__track" key={track.url} href={track.url} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true" className="wc-creator__track-icon">♫</span>
                  <span><strong>{track.title}</strong><small>{track.label}</small></span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </section>
          )}
          {(tab === 'photos' || tab === 'videos') && (
            <section className="wc-creator__card wc-creator__empty" aria-label={tab === 'photos' ? 'Photo gallery' : 'Video gallery'}>
              <span aria-hidden="true">{tab === 'photos' ? '▧' : '▷'}</span>
              <h2>{tab === 'photos' ? 'Photo gallery' : 'Video gallery'}</h2>
              <p>No showcase {tab === 'photos' ? 'photos' : 'videos'} have been added yet.</p>
              <button type="button" onClick={() => setTab('posts')}>Return to posts</button>
            </section>
          )}
          {tab === 'about' && (
            <section className="wc-creator__card wc-creator__card-body" aria-label={'About ' + creator.name}>
              <p className="wc-creator__eyebrow">THE CREATOR FILE</p>
              <h2>About {creator.name}</h2>
              <p>{creator.bio}</p>
              <a href={'mailto:' + creator.contact}>{creator.contact}</a>
              <p>Creator updates and public showcases. No paid subscription, account, or messaging service is offered here.</p>
            </section>
          )}
        </section>

        <footer className="wc-creator__footer">
          <strong>WILDCARD DEV {creator.symbol}</strong>
          <span>Independent creator spotlight.</span>
          <a href="/">Return to WildCard DEV</a>
        </footer>
      </div>
      <nav className="wc-creator__dock" aria-label="Quick navigation">
        {SECTIONS.map((section) => (
          <button key={section.id} type="button" onClick={() => navigate(section.id)} aria-current={tab === section.id ? 'page' : undefined}>
            <span aria-hidden="true">{section.icon}</span>{section.label}
          </button>
        ))}
      </nav>
    </main>
  );
}
