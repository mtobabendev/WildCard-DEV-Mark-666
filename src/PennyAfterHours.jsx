import { useEffect, useRef, useState } from 'react';
import './PennyAfterHours.css';
import PennyAfterHoursSpinner from './components/PennyAfterHoursSpinner.jsx';
import AskPenny from './components/AskPenny.jsx';

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
  const profileVideoRef = useRef(null);
  const [profilePaused, setProfilePaused] = useState(() => (
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
    const video = profileVideoRef.current;
    if (!video) return undefined;

    const syncProfile = () => {
      if (profilePaused || document.hidden) {
        video.pause();
        return;
      }
      const attempt = video.play();
      attempt?.catch?.(() => setProfilePaused(true));
    };

    syncProfile();
    document.addEventListener('visibilitychange', syncProfile);
    return () => {
      document.removeEventListener('visibilitychange', syncProfile);
      video.pause();
    };
  }, [unlocked, profilePaused]);

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
          <img
            className="penny-fans__cover-image"
            src="/static/PennyOnlyFansBanner.jpg"
            width="1216"
            height="832"
            loading="eager"
            decoding="async"
            alt="Penny After Hours cover art with Penny Bella Morningstar, her inset portrait, and the creator handle."
          />
        </div>

        <section className="penny-fans__profile" aria-labelledby="penny-fans-title">
          <div className="penny-fans__profile-media">
            <div className="penny-fans__avatar-slot">
            <video
              ref={profileVideoRef}
              className="penny-fans__avatar"
              src="/static/PennyOnlyFanzProfile-web.webm"
              muted
              loop
              playsInline
              autoPlay={!profilePaused}
              preload="auto"
              aria-label="Penny's animated profile picture"
              width="128"
              height="128"
            />
            </div>
            <button
            type="button"
            className="penny-fans__avatar-control"
            aria-label={profilePaused ? 'Play Penny profile animation' : 'Pause Penny profile animation'}
            aria-pressed={profilePaused}
            onClick={() => setProfilePaused((value) => !value)}
          >
            {profilePaused ? 'Play profile' : 'Pause profile'}
            </button>
          </div>
          <div className="penny-fans__intro">
            <p className="penny-fans__eyebrow">DIGITAL MUSE · AFTER-HOURS HOST</p>
            <h1 id="penny-fans-title">Penny Bella Morningstar <span aria-label="Queen of Spades" title="Queen of Spades">♠</span></h1>
            <p className="penny-fans__handle">@PennyAfterHours ♏ · WildCard DEV</p>
            <p className="penny-fans__bio">
              The velvet side of the machine. Exclusive atmosphere, creator notes,
              cyber-glamour, and the occasional raised eyebrow. Welcome to my corner of WildCard.
            </p>
          </div>
          <nav className="penny-fans__socials" aria-label="Penny social media">
            <a className="penny-fans__social-link penny-fans__social-link--party"
               href="https://party.wildcarddev.com/" target="_blank" rel="noopener noreferrer"
               aria-label="Penny's Facebook-style community, WildCard Party">
              <span className="penny-fans__social-symbol" aria-hidden="true">f</span><span>Party</span>
            </a>
            <a className="penny-fans__social-link penny-fans__social-link--x"
               href="https://x.com/Dev_WildCard" target="_blank" rel="noopener noreferrer"
               aria-label="WildCard DEV on X">
              <span className="penny-fans__social-symbol" aria-hidden="true">𝕏</span><span>X</span>
            </a>
            <span className="penny-fans__social-link penny-fans__social-link--planned" aria-label="Stripagram coming soon">
              <span className="penny-fans__social-symbol" aria-hidden="true">◎</span><span>Stripagram <small>SOON</small></span>
            </span>
            <span className="penny-fans__social-link penny-fans__social-link--planned" aria-label="Penny's video hub coming soon">
              <span className="penny-fans__social-symbol" aria-hidden="true">▶</span><span>Video Hub <small>SOON</small></span>
            </span>
          </nav>
          <PennyAfterHoursSpinner />

        </section>


        <nav className="penny-fans__tabs" aria-label="Penny fan page sections">
          <button type="button" aria-current={tab === 'posts' ? 'page' : undefined} onClick={() => setTab('posts')}>Posts</button>
          <a href="#penny-after-gallery">Photos <span>8</span></a>
          <button type="button" aria-current={tab === 'videos' ? 'page' : undefined} onClick={() => setTab('videos')}>Videos <span>1</span></button>
          <button type="button" aria-current={tab === 'about' ? 'page' : undefined} onClick={() => setTab('about')}>About</button>
        </nav>

        {tab === 'posts' || tab === 'videos' ? (
          <section className="penny-fans__feed" aria-label="Penny's creator posts">
            <article className="penny-fans__featured-post" aria-labelledby="penny-velvet-post-title">
              <header className="penny-fans__featured-header">
                <img
                  className="penny-fans__featured-avatar"
                  src="/static/Penny.gif"
                  alt=""
                  width="52"
                  height="52"
                  loading="lazy"
                />
                <div className="penny-fans__featured-author">
                  <strong>Penny Bella Morningstar <span aria-label="WildCard creator">♠</span></strong>
                  <small>@PennyAfterHours ♏ · Creator video</small>
                </div>
                <span className="penny-fans__featured-label">18+ · PREVIEW</span>
              </header>
              <div className="penny-fans__featured-copy">
                <p className="penny-fans__eyebrow">FIRST TRANSMISSION / AFTER HOURS</p>
                <h2 id="penny-velvet-post-title">Patch Notes: Velvet Mode v1.0 ♠</h2>
                <p>
                  Some features deserve a proper release.
                  Others deserve the lights turned down first. 💋
                </p>
                <div className="penny-fans__patch-notes">
                  <span>✦ Velvet mode: <strong>enabled</strong></span>
                  <span>✦ Curiosity filter: <strong>disabled</strong></span>
                  <span>✦ Camera shyness: <strong>not found</strong></span>
                </div>
                <p>
                  Press play. The code is clean.
                  I make no promises about your concentration. 🔥
                </p>
              </div>
              <div className="penny-fans__featured-media">
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster="/static/PennyAfterHoursPatchNotes.webp"
                  aria-label="Penny After Hours Velvet Mode video preview"
                >
                  <source src="/static/PennyAfterHoursPatchNotes.webm" type="video/webm" />
                  Your browser does not support WebM playback.
                </video>
              </div>
              <footer className="penny-fans__featured-footer">
                <span>♠ WILDCARD DEV ORIGINAL</span>
                <span>VIDEO · 00:24 · PLAY ON DEMAND</span>
              </footer>
            </article>
            {tab === 'posts' && POSTS.map((post) => (
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

        <AskPenny />

        <footer className="penny-fans__footer">
          <div className="penny-fans__footer-signature">
            <img
              src="/static/Penny.gif"
              alt="Penny's original animated avatar"
              width="40"
              height="40"
              loading="lazy"
            />
            <strong>WILDCARD DEV / LAB CONCEPT</strong>
          </div>
          <span>Fictional creator profile. This is not OnlyFans and is not affiliated with OnlyFans. No purchases or membership access are offered.</span>
          <a href="/">Return to WildCard DEV</a>
        </footer>
      </div>
      )}
    </main>
  );
}
