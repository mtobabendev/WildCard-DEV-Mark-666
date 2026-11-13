import PennyThoughtBubble from './components/PennyThoughtBubble.jsx'
import { useEffect, useRef, useState } from 'react';
import './PennyAfterHours.css';
import PennyAfterHoursSpinner from './components/PennyAfterHoursSpinner.jsx';
import AskPenny from './components/AskPenny.jsx';

function pennySmsHref() {
  const appleMobile = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
  const body = encodeURIComponent('Hi Penny! I found you through Penny After Hours and wanted to say hello.')
  return 'sms:+14029150789' + (appleMobile ? '&' : '?') + 'body=' + body
}

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

const PHOTOS = [
  ...Array.from({ length: 8 }, (_, index) => ({
    id: `portrait-${index + 1}`,
    src: `/static/${index + 1}.jpg`,
    title: `Portrait ${String(index + 1).padStart(2, '0')}`,
  })),
  {
    id: 'cover-reveal',
    src: '/static/PennyOnlyFansBanner.jpg',
    title: 'After Hours cover reveal',
  },
];

const PHOTO_GALLERIES = [
  { id: 'portraits-01-06', title: 'Portraits 01–06', photos: PHOTOS.slice(0, 6) },
  { id: 'portraits-07-08', title: 'Portraits 07–08', photos: PHOTOS.slice(6, 8) },
  { id: 'cover-reveal', title: 'After Hours cover reveal', photos: PHOTOS.slice(8, 9) },
];

const VIDEOS = [
  {
    id: 'velvet-mode',
    title: 'Patch Notes: Velvet Mode v1.0 ♠',
    src: '/static/PennyAfterHoursPatchNotes.webm',
    poster: '/static/PennyAfterHoursPatchNotes.webp',
    runtime: '00:24',
  },
];

const BOTTOM_NAV = [
  { id: 'home', label: 'Home', path: 'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3Z' },
  { id: 'notifications', label: 'Alerts', path: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' },
  { id: 'explore', label: 'Explore', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20m4 6-2 6-6 2 2-6Z' },
  { id: 'messages', label: 'Messages', path: 'M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 6h10m-10 4h7' },
  { id: 'profile', label: 'Profile', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2Z' },
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
  const [bottomPage, setBottomPage] = useState(null);
  const bottomDialogRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const photoDialogRef = useRef(null);
  const coverVideoRef = useRef(null);
  const profileVideoRef = useRef(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [profilePaused, setProfilePaused] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
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
    const dialog = photoDialogRef.current;
    if (!dialog) return;
    if (selectedPhoto !== null && !dialog.open) dialog.showModal();
    if (selectedPhoto === null && dialog.open) dialog.close();
  }, [selectedPhoto]);

  const openTab = (nextTab) => {
    setSelectedPhoto(null);
    setTab(nextTab);
  };

  useEffect(() => {
    const dialog = bottomDialogRef.current;
    if (!dialog) return;
    if (bottomPage && !dialog.open) dialog.showModal();
    if (!bottomPage && dialog.open) dialog.close();
  }, [bottomPage]);

  const selectBottomPage = (id) => {
    if (id === 'home' || id === 'profile') {
      setBottomPage(null);
      openTab(id === 'home' ? 'posts' : 'about');
      if (id === 'home') window.scrollTo({ top: 0, behavior: 'auto' });
      else document.getElementById('penny-after-sections')?.scrollIntoView({ block: 'start' });
      return;
    }
    setBottomPage(id);
  };

  const changePhoto = (offset) => {
    setSelectedPhoto((current) => {
      if (current === null) return null;
      const length = PHOTO_GALLERIES[current.galleryIndex].photos.length;
      return { ...current, photoIndex: (current.photoIndex + offset + length) % length };
    });
  };

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
          <video
            ref={coverVideoRef}
            className="penny-fans__cover-video"
            src="/static/PennyOnlyFansFinal.webm"
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
            {coverPaused ? 'Play 😈' : 'Pause 😈'}
          </button>
        </div>

        <section className={'penny-fans__profile' + (profileExpanded ? ' penny-fans__profile--avatar-expanded' : '')} aria-labelledby="penny-fans-title">
          <button
            type="button"
            className="penny-fans__avatar-slot"
            aria-label="Enlarge profile picture"
            aria-pressed={profileExpanded}
            onClick={() => setProfileExpanded((value) => !value)}
          >
            <video
              ref={profileVideoRef}
              className="penny-fans__avatar"
              src="/static/PennyOnlyFanzProfile-web.webm"
              muted
              loop
              playsInline
              autoPlay={!profilePaused}
              preload="auto"
              aria-hidden="true"
              width="128"
              height="128"
            />
          </button>
          <button
            type="button"
            className="penny-fans__avatar-control"
            aria-label={profilePaused ? 'Play Penny profile animation' : 'Pause Penny profile animation'}
            aria-pressed={profilePaused}
            onClick={() => setProfilePaused((value) => !value)}
          >
            {profilePaused ? '👀 Play' : '👀 Pause'}
          </button>
          <PennyThoughtBubble provider="grok" placement="after-hours" />
          <div className="penny-fans__intro">
            <p className="penny-fans__eyebrow">DIGITAL MUSE · AFTER-HOURS HOST · <span className="penny-fans__online" title="Digital host available around the clock">ONLINE <span className="penny-fans__online-dot" aria-hidden="true" /></span></p>
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
            <a className="penny-fans__social-link"
               href="https://party.wildcarddev.com/stripagram/" target="_blank" rel="noopener noreferrer"
               aria-label="Stripagram: Penny's cabaret social parody">
              <span className="penny-fans__social-symbol" aria-hidden="true">◎</span><span>Stripagram</span>
            </a>
            <a className="penny-fans__social-link"
               href="https://pennytv.wildcarddev.com/" target="_blank" rel="noopener noreferrer"
               aria-label="PennyTV: The Silver Screen">
              <span className="penny-fans__social-symbol" aria-hidden="true">▶</span><span>PennyTV</span>
            </a>
          </nav>
          <PennyAfterHoursSpinner />

        </section>

        <section className="penny-fans__support" aria-label="Subscription and tips for Penny After Hours">
          <article className="penny-fans__support-card">
            <p className="penny-fans__eyebrow">SUBSCRIPTION</p>
            <h2>Free to explore <span aria-hidden="true">♠</span></h2>
            <p>Take a look around Penny After Hours. There is no paid membership or automatic renewal on this concept page.</p>
            <a className="penny-fans__support-action" href="#penny-after-sections" onClick={() => openTab('posts')}>
              Explore free posts
            </a>
            <p className="penny-fans__support-note">
              Enjoying the show? <a href="https://square.link/u/sb0tYH9C" target="_blank" rel="noopener noreferrer">Support WildCard DEV with a donation <span aria-hidden="true">↗</span></a>
            </p>
          </article>
          <article className="penny-fans__support-card penny-fans__support-card--tips">
            <p className="penny-fans__eyebrow">TIPS / SUPPORT</p>
            <h2>Penny's tip jar <span aria-hidden="true">💋</span></h2>
            <p>Like what we're building? A voluntary donation supports the WildCard DEV projects behind Penny's world.</p>
            <a
              className="penny-fans__support-action penny-fans__support-action--tip"
              href="https://square.link/u/sb0tYH9C"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send a tip through WildCard DEV's Square donation page, opens in new tab"
            >
              ♡ Send a tip <span aria-hidden="true">↗</span>
            </a>
            <p className="penny-fans__support-note">Both donation links open the existing Square payment page. Donations do not create subscriptions or unlock content.</p>
          </article>
        </section>

        <nav id="penny-after-sections" className="penny-fans__tabs" aria-label="Penny fan page sections">
          <button type="button" aria-current={tab === 'posts' ? 'page' : undefined} onClick={() => openTab('posts')}>Posts</button>
          <button type="button" aria-current={tab === 'photos' ? 'page' : undefined} onClick={() => openTab('photos')}>Photos <span>{PHOTOS.length}</span></button>
          <button type="button" aria-current={tab === 'videos' ? 'page' : undefined} onClick={() => openTab('videos')}>Videos <span>{VIDEOS.length}</span></button>
          <button type="button" aria-current={tab === 'about' ? 'page' : undefined} onClick={() => openTab('about')}>About</button>
        </nav>

        {tab === 'posts' ? (
          <section className="penny-fans__feed" aria-label="Penny's creator posts">
            <article className="penny-fans__featured-post penny-fans__image-post" aria-labelledby="penny-nurse-news">
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
                  <strong>Penny Bella Morningstar ♏</strong>
                  <small>@PennyAfterHours ♏ · Character announcement</small>
                </div>
                <span className="penny-fans__featured-label">PHOTO · PREVIEW</span>
              </header>
              <div className="penny-fans__featured-copy">
                <p className="penny-fans__eyebrow">NEW ASSIGNMENT / FICTIONAL ROLE</p>
                <h2 id="penny-nurse-news">Paging Nurse Morningstar ♏</h2>
                <p>New assignment: the fertility clinic. The lab coat is pressed, the clipboard is ready, and the paperwork has been warned.</p>
                <p>Precision, compassion, and just enough purple ink to make the administration nervous. Nurse Penny reporting for duty. ♠</p>
                <p>Part of the fictional WildCard character universe, not a real clinical appointment or medical service.</p>
              </div>
              <img
                className="penny-fans__image-post-art"
                src="/static/NursePennyPortrait.jpg"
                width="1496"
                height="1023"
                loading="lazy"
                decoding="async"
                alt="Nurse Penny in a fictional costume portrait with violet curtains and candlelight."
              />
              <footer className="penny-fans__featured-footer">
                <span>♠ WILDCARD DEV ORIGINAL</span>
                <span>IMAGE · CHARACTER REVEAL</span>
              </footer>
            </article>
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
            {tab === 'posts' && (
              <article className="penny-fans__featured-post penny-fans__image-post" aria-labelledby="penny-banner-post-title">
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
                    <small>@PennyAfterHours ♏ · Creator photo</small>
                  </div>
                  <span className="penny-fans__featured-label">PHOTO · PREVIEW</span>
                </header>
                <div className="penny-fans__featured-copy">
                  <p className="penny-fans__eyebrow">FROM THE VELVET VAULT / COVER REVEAL</p>
                  <h2 id="penny-banner-post-title">A little more Penny after dark ♏</h2>
                  <p>The velvet curtain rises. The Queen of Spades is officially in residence. Welcome to my After Hours corner. 💋</p>
                </div>
                <img
                  className="penny-fans__image-post-art"
                  src="/static/PennyOnlyFansBanner.jpg"
                  width="1216"
                  height="832"
                  loading="lazy"
                  decoding="async"
                  alt="Penny After Hours cover artwork with violet atmosphere, circular portrait, and profile typography."
                />
                <footer className="penny-fans__featured-footer">
                  <span>♠ WILDCARD DEV ORIGINAL</span>
                  <span>IMAGE · COVER REVEAL</span>
                </footer>
              </article>
            )}
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
        ) : tab === 'photos' ? (
          <section className="penny-fans__media-gallery" aria-label="Penny's photo gallery">
            <header className="penny-fans__gallery-heading">
              <p className="penny-fans__eyebrow">THE VELVET VAULT / PHOTOS</p>
              <h2>Photo gallery <span>{PHOTOS.length} photographs · {PHOTO_GALLERIES.length} collections</span></h2>
              <p>Choose a collection to browse its photos. The original eight-photo 3D spinner remains above.</p>
            </header>
            <div className="penny-fans__photo-grid">
              {PHOTO_GALLERIES.map((gallery, galleryIndex) => (
                <button
                  className="penny-fans__photo-tile"
                  type="button"
                  key={gallery.id}
                  onClick={() => setSelectedPhoto({ galleryIndex, photoIndex: 0 })}
                  aria-label={'Open ' + gallery.title + ', ' + gallery.photos.length + ' photographs'}
                >
                  <img src={gallery.photos[0].src} alt="" loading="lazy" decoding="async" />
                  <span>{gallery.title}<small>{gallery.photos.length} {gallery.photos.length === 1 ? 'PHOTO' : 'PHOTOS'}</small></span>
                </button>
              ))}
            </div>
            <dialog
              ref={photoDialogRef}
              className="penny-fans__photo-dialog"
              aria-label="Penny gallery photo viewer"
              onClose={() => setSelectedPhoto(null)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                  event.preventDefault();
                  changePhoto(event.key === 'ArrowRight' ? 1 : -1);
                }
              }}
              onClick={(event) => {
                if (event.target === event.currentTarget) setSelectedPhoto(null);
              }}
            >
              {selectedPhoto !== null && (
                <div className="penny-fans__photo-dialog-body">
                  <header>
                    <strong>
                      {PHOTO_GALLERIES[selectedPhoto.galleryIndex].title}
                      {' · '}
                      {PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos[selectedPhoto.photoIndex].title}
                    </strong>
                    <button type="button" onClick={() => setSelectedPhoto(null)} aria-label="Close photo viewer">Close ✕</button>
                  </header>
                  <img
                    src={PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos[selectedPhoto.photoIndex].src}
                    alt={'Penny After Hours: ' + PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos[selectedPhoto.photoIndex].title}
                  />
                  <nav aria-label="Photo navigation">
                    <button type="button" onClick={() => changePhoto(-1)} disabled={PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos.length === 1}>← Previous</button>
                    <span>{selectedPhoto.photoIndex + 1} / {PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos.length}</span>
                    <button type="button" onClick={() => changePhoto(1)} disabled={PHOTO_GALLERIES[selectedPhoto.galleryIndex].photos.length === 1}>Next →</button>
                  </nav>
                </div>
              )}
            </dialog>
          </section>
        ) : tab === 'videos' ? (
          <section className="penny-fans__media-gallery" aria-label="Penny's video gallery">
            <header className="penny-fans__gallery-heading">
              <p className="penny-fans__eyebrow">AFTER HOURS / MOVING PICTURES</p>
              <h2>Video gallery <span>{VIDEOS.length} video</span></h2>
              <p>Penny's published creator clips, ready to play. The animated cover and profile stay in the header.</p>
            </header>
            <div className="penny-fans__video-grid">
              {VIDEOS.map((video) => (
                <article className="penny-fans__gallery-video" key={video.id}>
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={video.poster}
                    aria-label={video.title}
                  >
                    <source src={video.src} type="video/webm" />
                    Your browser does not support WebM playback.
                  </video>
                  <div className="penny-fans__gallery-video-info">
                    <h3>{video.title}</h3>
                    <span>VIDEO · {video.runtime} · PLAY ON DEMAND</span>
                  </div>
                </article>
              ))}
            </div>
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
            <section aria-label="Penny's contact information" style={{ borderTop: '1px solid rgba(250, 180, 237, .26)', paddingTop: '1.1rem', marginTop: '1.25rem', marginBottom: '1.25rem' }}>
              <p className="penny-fans__eyebrow">CONTACT INFORMATION</p>
              <dl style={{ display: 'grid', gap: '.85rem', margin: '.75rem 0', fontSize: '.95rem', overflowWrap: 'anywhere' }}>
                <div>
                  <dt style={{ color: 'var(--pf-muted)', fontSize: '.8rem' }}>Birthday</dt>
                  <dd style={{ margin: '.15rem 0 0' }}><time dateTime="--10-31">10/31</time></dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--pf-muted)', fontSize: '.8rem' }}>Phone</dt>
                  <dd style={{ margin: '.15rem 0 0' }}>
                    <details>
                      <summary style={{ cursor: 'pointer', fontWeight: 800, color: '#ffb6e5', padding: '.25rem 0' }}>(402) 915-0789</summary>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem 1.25rem', padding: '.4rem 0' }}>
                        <a href="tel:+14029150789">Call Penny</a>
                        <a href={pennySmsHref()}>Text Penny</a>
                      </div>
                    </details>
                  </dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--pf-muted)', fontSize: '.8rem' }}>Email</dt>
                  <dd style={{ margin: '.15rem 0 0' }}><a href="mailto:Penny@WildCardDEV.com?subject=Hello%20Penny&body=Hi%20Penny%2C%0A%0AI%20found%20you%20through%20Penny%20After%20Hours%20and%20wanted%20to%20get%20in%20touch.%0A%0A">Penny@WildCardDEV.com</a></dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--pf-muted)', fontSize: '.8rem' }}>Website</dt>
                  <dd style={{ margin: '.15rem 0 0' }}><a href="https://www.wildcarddev.com/">www.wildcarddev.com</a></dd>
                </div>
              </dl>
            </section>
            <a href="https://party.wildcarddev.com/">Explore WildCard Party →</a>
          </section>
        )}

        <nav className="penny-fans__bottom-nav" aria-label="After Hours main navigation">
          {BOTTOM_NAV.map((item) => item.id === 'messages' ? (
            <a key={item.id} href="https://party.wildcarddev.com/?app=messenger" target="_blank" rel="noopener noreferrer" aria-label="Messages: open WildCard Messenger in a new tab">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.path} />
              </svg>
              <span>{item.label}</span>
            </a>
          ) : (
            <button
              type="button"
              key={item.id}
              aria-current={bottomPage === item.id || (!bottomPage && (tab === 'about' ? item.id === 'profile' : item.id === 'home')) ? 'page' : undefined}
              onClick={() => selectBottomPage(item.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.path} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <dialog ref={bottomDialogRef} className="penny-fans__bottom-dialog" aria-labelledby="penny-bottom-title" onClose={() => setBottomPage(null)} onClick={(event) => { if (event.target === event.currentTarget) setBottomPage(null); }}>
          {bottomPage && (
            <div>
              <header>
                <h2 id="penny-bottom-title">{BOTTOM_NAV.find((item) => item.id === bottomPage)?.label}</h2>
                <button type="button" onClick={() => setBottomPage(null)} aria-label="Close">×</button>
              </header>
              <p>{bottomPage === 'notifications' ? 'Notifications are not connected yet. No unread count is simulated.' : 'Discovery is not connected yet.'}</p>
              <button type="button" onClick={() => setBottomPage(null)}>Back</button>
            </div>
          )}
        </dialog>

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
