import { useEffect, useRef, useState } from 'react';
import './PennyAfterHours.css';
import PennyAfterHoursSpinner from './components/PennyAfterHoursSpinner.jsx';

const POSTS = [
  {
    id: 'throne',
    label: 'PUBLIC PREVIEW',
    title: 'A seat at the table',
    copy: 'Behind the scenes of the WildCard DEV universe. A little violet light, a little velvet, and a lot of personality.',
    symbol: '♛',
    theme: 'throne',
  },
  {
    id: 'vault',
    label: 'MEMBERSHIP CONCEPT',
    title: 'The Velvet Vault',
    copy: 'A design-only teaser for a future creator archive. No locked content or subscription system is active.',
    symbol: '♠',
    theme: 'vault',
  },
  {
    id: 'letter',
    label: 'PUBLIC PREVIEW',
    title: 'A note from Penny',
    copy: 'Come for the digital glamour. Stay for the stories, the creative experiments, and a front-row seat to the next WildCard build.',
    symbol: '✦',
    theme: 'letter',
  },
];

function PennyCombinationDial({ digit, position, onChange }) {
  const change = (step) => onChange((digit + step + 10) % 10);

  return (
    <div className="penny-fans__dial">
      <button
        type="button"
        aria-label={`Increase combination digit ${position}`}
        onClick={() => change(1)}
      >
        ▲
      </button>
      <output aria-label={`Combination digit ${position}`}>{digit}</output>
      <button
        type="button"
        aria-label={`Decrease combination digit ${position}`}
        onClick={() => change(-1)}
      >
        ▼
      </button>
    </div>
  );
}

export default function PennyAfterHours() {
  const [tab, setTab] = useState('posts');
  const [membershipOpen, setMembershipOpen] = useState(false);
  const coverVideoRef = useRef(null);
  const [coverPaused, setCoverPaused] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  const [digits, setDigits] = useState([0, 0, 0]);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState('Turn the three dials to enter Penny After Hours.');

  const changeDigit = (position, value) => {
    setDigits((current) => current.map((digit, index) => (
      index === position ? value : digit
    )));
    setMessage('Turn the three dials to enter Penny After Hours.');
  };

  const unlock = (event) => {
    event.preventDefault();
    if (digits.join('') === '216') {
      setUnlocked(true);
      return;
    }
    setMessage('That combination did not open Penny After Hours. Try again.');
  };

  useEffect(() => {
    document.title = "Penny After Hours | WildCard DEV Fan Page Concept";
  }, []);

  useEffect(() => {
    if (!unlocked) return undefined;
    const video = coverVideoRef.current;
    if (!video) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncCover = () => {
      if (coverPaused || document.hidden || reducedMotion.matches) {
        video.pause();
        return;
      }
      const attempt = video.play();
      attempt?.catch?.(() => setCoverPaused(true));
    };
    syncCover();
    document.addEventListener('visibilitychange', syncCover);
    reducedMotion.addEventListener?.('change', syncCover);
    return () => {
      document.removeEventListener('visibilitychange', syncCover);
      reducedMotion.removeEventListener?.('change', syncCover);
      video.pause();
    };
  }, [unlocked, coverPaused]);

  return (
    <main className="penny-fans">
      <div className="penny-fans__wash" aria-hidden="true" />
      <header className="penny-fans__topbar">
        <a className="penny-fans__brand" href="/" aria-label="Return to WildCard DEV">
          <span aria-hidden="true">♠</span> WildCard DEV
        </a>
        <span className="penny-fans__edition">PENNY / AFTER HOURS</span>
        <a className="penny-fans__back" href="/">← Back to Penny</a>
      </header>

      {!unlocked ? (
        <section className="penny-fans__lock" aria-labelledby="penny-fans-lock-title">
          <p className="penny-fans__eyebrow">A VELVET DOOR / THREE DIGITS</p>
          <h1 id="penny-fans-lock-title">Penny After Hours ♠</h1>
          <p className="penny-fans__lock-lead">
            A private entrance to Penny's WildCard DEV fan-page concept.
            Turn the combination to step inside.
          </p>
          <form onSubmit={unlock}>
            <fieldset className="penny-fans__dials">
              <legend>Three-digit combination</legend>
              {digits.map((digit, position) => (
                <PennyCombinationDial
                  key={position}
                  digit={digit}
                  position={position + 1}
                  onChange={(value) => changeDigit(position, value)}
                />
              ))}
            </fieldset>
            <button className="penny-fans__unlock" type="submit">
              Unlock Penny After Hours
            </button>
          </form>
          <p className="penny-fans__lock-message" role="status" aria-live="polite">
            {message}
          </p>
        </section>
      ) : (
      <div className="penny-fans__shell">
        <div className="penny-fans__cover">
          <video
            ref={coverVideoRef}
            className="penny-fans__cover-video"
            src="/static/PennyOnlyFans.webm"
            poster="/static/penny-throne-room.webp"
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Penny After Hours profile cover video"
          />
          <span className="penny-fans__cover-label">WILDCARD DEV ORIGINAL / FAN-PAGE CONCEPT</span>
          <button
            className="penny-fans__cover-control"
            type="button"
            onClick={() => setCoverPaused((value) => !value)}
            aria-label={coverPaused ? 'Play cover video' : 'Pause cover video'}
            aria-pressed={coverPaused}
          >
            {coverPaused ? 'Play cover' : 'Pause cover'}
          </button>
        </div>

        <section className="penny-fans__profile" aria-labelledby="penny-fans-title">
          <div className="penny-fans__avatar-slot">
            <img
              className="penny-fans__avatar"
              src="/static/Penny.gif"
              alt="Penny's profile picture"
              width="128"
              height="128"
            />
          </div>
          <div className="penny-fans__intro">
            <p className="penny-fans__eyebrow">DIGITAL MUSE · AFTER-HOURS HOST</p>
            <h1 id="penny-fans-title">Penny Bella Morningstar <span aria-label="Queen of Spades" title="Queen of Spades">♠</span></h1>
            <p className="penny-fans__handle">@PennyAfterHours · WildCard DEV</p>
            <p className="penny-fans__bio">
              The velvet side of the machine. Exclusive atmosphere, creator notes,
              cyber-glamour, and the occasional raised eyebrow. Welcome to my corner of WildCard.
            </p>
          </div>
          <div className="penny-fans__actions">
            <button
              type="button"
              className="penny-fans__cta"
              aria-expanded={membershipOpen}
              aria-controls="penny-fans-membership"
              onClick={() => setMembershipOpen((value) => !value)}
            >
              {membershipOpen ? 'Close membership preview' : 'Preview membership'}
            </button>
            <a className="penny-fans__secondary" href="https://pennysoffice.wildcarddev.com/">
              Visit Penny's Garage
            </a>
          </div>
        </section>

        <PennyAfterHoursSpinner />

        {membershipOpen && (
          <section id="penny-fans-membership" className="penny-fans__membership" role="status">
            <span aria-hidden="true">✧</span>
            <div>
              <strong>Members' room: visual mockup only</strong>
              <p>A possible future home for creator posts, archives, and exclusive updates. No accounts, billing, private content, or subscriptions are active here.</p>
            </div>
          </section>
        )}

        <nav className="penny-fans__tabs" aria-label="Penny fan page sections">
          <button type="button" aria-current={tab === 'posts' ? 'page' : undefined} onClick={() => setTab('posts')}>
            The Feed
          </button>
          <button type="button" aria-current={tab === 'about' ? 'page' : undefined} onClick={() => setTab('about')}>
            About Penny
          </button>
        </nav>

        {tab === 'posts' ? (
          <section className="penny-fans__feed" aria-label="Sample creator posts">
            {POSTS.map((post) => (
              <article key={post.id} className={'penny-fans__post penny-fans__post--' + post.theme}>
                <div className="penny-fans__post-art" aria-hidden="true">
                  <span>{post.symbol}</span>
                </div>
                <div className="penny-fans__post-copy">
                  <span className="penny-fans__post-label">{post.label}</span>
                  <h2>{post.title}</h2>
                  <p>{post.copy}</p>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="penny-fans__about" aria-label="About Penny">
            <p className="penny-fans__eyebrow">THE CREATOR FILE</p>
            <h2>Intelligence with a taste for theatrics.</h2>
            <p>
              Penny is WildCard DEV's fictional AI persona and digital host:
              part concierge, part creative collaborator, and entirely at home
              in a room lit by neon and ambition.
            </p>
            <p>
              This is an original fan-platform interface study. Think profile,
              posts, and a members' room concept, built to demonstrate what a
              creator-focused WildCard experience could become.
            </p>
            <a href="https://party.wildcarddev.com/">Explore WildCard Party →</a>
          </section>
        )}

        <footer className="penny-fans__footer">
          <strong>WILDCARD DEV / LAB CONCEPT</strong>
          <span>Fictional creator profile. This is not OnlyFans and is not affiliated with OnlyFans. No purchases or membership access are offered.</span>
          <a href="/">Return to WildCard DEV</a>
        </footer>
      </div>
      )}
    </main>
  );
}
