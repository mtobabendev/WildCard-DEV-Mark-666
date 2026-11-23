import { pennyPrivateMedia } from './components/privateMediaUrl.js';
import PennyThoughtBubble from './components/PennyThoughtBubble.jsx'
import { useEffect, useRef, useState } from 'react';
import './PennyAfterHours.css';
import { PANEL_IMAGES } from './components/PennyAfterHoursSpinner.jsx';
import PennyClassicCards from './components/PennyClassicCards.jsx';
import PennyMediaViewer from './components/PennyMediaViewer.jsx';
import AskPenny from './components/AskPenny.jsx';
import ViewportVideo from './components/ViewportVideo.jsx';
import UserLoopVideo from './components/UserLoopVideo.jsx';
import AfterHoursDesktop from './components/AfterHoursDesktop.jsx';
import { FRIENDS, PennyFriendCard } from './components/PennyFriends.jsx';
import { PennyAfterHoursBio, PennyAfterHoursMoreInfo } from './components/PennyAfterHoursIntro.jsx';
import PennyPrivateCollections from './components/PennyPrivateCollections.jsx';

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
    label: 'AFTER HOURS',
    title: 'A seat at the table',
    copy: 'A little velvet, a little candlelight, and an invitation to stay longer than you planned. There is always room for one more at my table. 💋',
    symbol: '♛',
    theme: 'throne',
    video: pennyPrivateMedia('PennySeatAtTheTable.webm'),
    videoWidth: 400,
    videoHeight: 880,
  },
  {
    id: 'vault',
    label: 'PENNY\'S INNER CIRCLE',
    title: 'The Velvet Vault',
    copy: 'Every queen needs her circle. A little beauty, a little attitude, and friends who know how to make an entrance. ♠',
    symbol: '♠',
    theme: 'vault',
    image: pennyPrivateMedia('KandyOnlyFans2.jpg'),
  },
  {
    id: 'letter',
    label: 'A LITTLE SOMETHING FOR YOU',
    title: 'A note from Penny',
    copy: 'Come for the glamour. Stay for the wicked conversation, late-night company, and whatever happens when the lights turn pink. 🖤',
    symbol: '✦',
    theme: 'letter',
    video: pennyPrivateMedia('AnimePenny.webm'),
    videoWidth: 672,
    videoHeight: 448,
  },
];

const PHOTOS = [
  ...PANEL_IMAGES.map(({ number, src }) => ({
    id: `portrait-${number}`,
    src,
    title: `Portrait ${String(number).padStart(2, '0')}`,
  })),
  {
    id: 'cover-reveal',
    src: pennyPrivateMedia('PennyOnlyFansBanner.jpg'),
    title: 'After Hours cover reveal',
  },
  {
    id: 'nurse-character',
    src: '/static/NursePennyPortrait.jpg',
    title: 'Nurse Penny character reveal',
  },
];

const VIDEOS = [
  {
    id: 'velvet-mode',
    title: 'Velvet After Dark ♠',
    src: pennyPrivateMedia('PennyAfterHoursPatchNotes.webm'),
    poster: pennyPrivateMedia('PennyAfterHoursPatchNotes.webp'),
    runtime: '00:24',
  },
  {
    id: 'seat-at-the-table',
    title: 'A seat at the table',
    src: pennyPrivateMedia('PennySeatAtTheTable.webm'),
  },
  {
    id: 'anime-penny',
    title: 'A note from Penny',
    src: pennyPrivateMedia('AnimePenny.webm'),
  },
];

const BOTTOM_NAV = [
  { id: 'home', label: 'Home', path: 'M3 10.5 12 3l9 7.5V21h-6v-7H9v7H3Z' },
  { id: 'notifications', label: 'Alerts', path: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4' },
  { id: 'explore', label: 'Explore', path: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20m4 6-2 6-6 2 2-6Z' },
  { id: 'messages', label: 'Messages', path: 'M4 3h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 6h10m-10 4h7' },
  { id: 'profile', label: 'Profile', path: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21v-2a8 8 0 0 1 16 0v2Z' },
];

export default function PennyAfterHours() {
  const [tab, setTab] = useState('posts');
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1100px)').matches);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1100px)');
    const update = () => setIsDesktop(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const [bottomPage, setBottomPage] = useState(null);
  const bottomDialogRef = useRef(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [showClassicCards, setShowClassicCards] = useState(false);
  const profileVideoRef = useRef(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bannerPaused, setBannerPaused] = useState(false);
  const [postPaused, setPostPaused] = useState({});
  const [profilePaused, setProfilePaused] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  useEffect(() => {
    document.title = "Penny After Hours | WildCard DEV";
  }, []);

  const openPostVideo = (post) => {
    const index = VIDEOS.findIndex((video) => video.src === post.video);
    if (index === -1) return;
    // Pause the inline preview while the existing full-size viewer is open.
    setPostPaused((previous) => ({ ...previous, [post.id]: true }));
    setActiveMedia({ kind: 'video', index });
  };

  const openTab = (nextTab) => {
    setActiveMedia(null);
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

  useEffect(() => {
    if (isDesktop) return undefined;
    const video = profileVideoRef.current;
    if (!video) return undefined;
    let inView = typeof IntersectionObserver === 'undefined';

    const syncProfile = () => {
      if (profilePaused || document.hidden || !inView) {
        video.pause();
        return;
      }
      video.play()?.catch?.(() => setProfilePaused(true));
    };

    const observer = typeof IntersectionObserver === 'undefined' ? null :
      new IntersectionObserver(entries => {
        if (entries.some(entry => entry.target === video)) {
          inView = entries.find(entry => entry.target === video).isIntersecting;
          syncProfile();
        }
      }, { threshold: 0 });
    observer?.observe(video);
    document.addEventListener('visibilitychange', syncProfile);
    syncProfile();
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncProfile);
      video.pause();
    };
  }, [isDesktop, profilePaused]);

  if (isDesktop) return <AfterHoursDesktop />;

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

      <div className="penny-fans__shell">
        <div className="penny-fans__cover">
          <ViewportVideo
            className="penny-fans__cover-image"
            src={pennyPrivateMedia('PennyNewFansBanner.webm')}
            poster={pennyPrivateMedia('penny-after-hours-cover.webp')}
            width={736}
            height={400}
            active={!bannerPaused}
            respectReducedMotion
            loop
            aria-hidden="true"
          />
          <button
            type="button"
            className="penny-fans__cover-control"
            aria-label={bannerPaused ? 'Resume banner animation' : 'Pause banner animation'}
            aria-pressed={bannerPaused}
            onClick={() => setBannerPaused((value) => !value)}
          >
            <span aria-hidden="true">😈</span>
          </button>
          <span className="penny-fans__cover-label">PENNY AFTER HOURS · WILDCARD DEV</span>
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
              src={pennyPrivateMedia('PennyOnlyFanzProfile-web.webm')}
              muted
              loop
              playsInline
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
            <span aria-hidden="true">👀</span>
          </button>
          <PennyThoughtBubble provider="gemini" placement="after-hours" />
          <div className="penny-fans__intro">
            <p className="penny-fans__eyebrow">YOUR AFTER-DARK HOST · <span className="penny-fans__online" title="Penny's room is always here for you">ONLINE <span className="penny-fans__online-dot" aria-hidden="true" /></span></p>
            <h1 id="penny-fans-title">Penny Bella Morningstar <span aria-label="Queen of Spades" title="Queen of Spades">♠</span></h1>
            <p className="penny-fans__handle">@PennyAfterHours ♏ · WildCard DEV</p>
            <PennyAfterHoursBio className="penny-fans__bio" />
            <div id="penny-fans-bio-more" className="penny-fans__bio-more" hidden={!bioExpanded}>
              <PennyAfterHoursMoreInfo />
            </div>
            <button
              type="button"
              className="penny-fans__bio-toggle"
              aria-controls="penny-fans-bio-more"
              aria-expanded={bioExpanded}
              onClick={() => setBioExpanded((open) => !open)}
            >
              {bioExpanded ? 'Collapse info' : 'More info'}
            </button>
          </div>
          <nav className="penny-fans__socials" aria-label="Penny social media">
            <a className="penny-fans__social-link penny-fans__social-link--party"
               href="https://party.wildcarddev.com/" target="_blank" rel="noopener noreferrer"
               aria-label="Visit Penny's WildCard Party">
              <span className="penny-fans__social-symbol" aria-hidden="true">f</span><span>Party</span>
            </a>
            <a className="penny-fans__social-link penny-fans__social-link--x"
               href="https://x.com/Dev_WildCard" target="_blank" rel="noopener noreferrer"
               aria-label="WildCard DEV on X">
              <span className="penny-fans__social-symbol" aria-hidden="true">𝕏</span><span>X</span>
            </a>
            <a className="penny-fans__social-link"
               href="https://party.wildcarddev.com/stripagram/" target="_blank" rel="noopener noreferrer"
               aria-label="Penny's Stripagram">
              <span className="penny-fans__social-symbol" aria-hidden="true">◎</span><span>Stripagram</span>
            </a>
            <a className="penny-fans__social-link"
               href="https://pennytv.wildcarddev.com/" target="_blank" rel="noopener noreferrer"
               aria-label="PennyTV: The Silver Screen">
              <span className="penny-fans__social-symbol" aria-hidden="true">▶</span><span>PennyTV</span>
            </a>
          </nav>
          <section className="penny-fans__friends" aria-labelledby="penny-friends-title">
            <h2 id="penny-friends-title">FRIENDS <span>{FRIENDS.length}</span><small>SWIPE ↔</small></h2>
            <div className="penny-fans__friend-list" role="region" aria-label="Penny friends, scroll left or right" tabIndex={0}>
              {FRIENDS.map((friend) => (
                <PennyFriendCard key={friend.url} friend={friend} />
              ))}
            </div>
          </section>
        </section>

        <section className="penny-fans__membership" aria-label="Free subscription and tipping">
          <div>
            <p className="penny-fans__eyebrow">SUBSCRIPTION</p>
            <p className="penny-fans__membership-status" aria-label="Subscribed for free; no account or payment required">
              <strong><span aria-hidden="true">✓</span> SUBSCRIBED</strong><span>FREE</span>
            </p>
          </div>
          <a
            className="penny-fans__tip-coin"
            href="https://square.link/u/YnAVr8ht"
            target="_blank"
            rel="noopener noreferrer"
            title="Tip Penny through WildCard DEV"
            aria-label="Tip Penny through Square, opens in a new tab"
          ><span aria-hidden="true">$</span></a>
        </section>

        <nav id="penny-after-sections" className="penny-fans__tabs" aria-label="Penny fan page sections">
          <button type="button" aria-current={tab === 'posts' ? 'page' : undefined} onClick={() => openTab('posts')}>Posts</button>
          <button type="button" aria-current={tab === 'photos' ? 'page' : undefined} onClick={() => openTab('photos')}>Photos <span>{PHOTOS.length}</span></button>
          <button type="button" aria-current={tab === 'videos' ? 'page' : undefined} onClick={() => openTab('videos')}>Videos <span>{VIDEOS.length}</span></button>
          <button type="button" aria-current={tab === 'private' ? 'page' : undefined} onClick={() => openTab('private')}>🔐 Private Vault</button>
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
                <span className="penny-fans__featured-label">PHOTO</span>
              </header>
              <div className="penny-fans__featured-copy">
                <p className="penny-fans__eyebrow">DRESS-UP NIGHT / NURSE MORNINGSTAR</p>
                <h2 id="penny-nurse-news">Paging Nurse Morningstar ♏</h2>
                <p>Tonight's look? Nurse Morningstar. The heels are polished, the clipboard is ready, and my bedside manner comes with a wicked smile. ♠</p>
                <p>A little white coat, a little purple ink, and a look that says I already know what you're thinking. All dress-up, darling. 💋</p>
              </div>
              <img
                className="penny-fans__image-post-art"
                src="/static/NursePennyPortrait.jpg"
                width="1496"
                height="1023"
                loading="lazy"
                decoding="async"
                alt="Penny in her nurse-inspired outfit with violet curtains and candlelight."
              />
              <footer className="penny-fans__featured-footer">
                <span>♠ WILDCARD DEV ORIGINAL</span>
                <span>PHOTO · NURSE MORNINGSTAR</span>
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
                <span className="penny-fans__featured-label">18+ · VIDEO</span>
              </header>
              <div className="penny-fans__featured-copy">
                <p className="penny-fans__eyebrow">THE LIGHTS ARE LOW</p>
                <h2 id="penny-velvet-post-title">Velvet After Dark ♠</h2>
                <p>Close the door, turn the lights down, and tell me you can handle a little temptation. 💋</p>
                <p>Pink satin, wicked company, and just enough mystery to keep you coming back.</p>
                <p>Press play, darling. I make no promises about your concentration. 🔥</p>
              </div>
              <div className="penny-fans__featured-media">
                <UserLoopVideo
                  controls
                  playsInline
                  preload="none"
                  poster={pennyPrivateMedia('PennyAfterHoursPatchNotes.webp')}
                  aria-label="Penny's Velvet After Dark video"
                >
                  <source src={pennyPrivateMedia('PennyAfterHoursPatchNotes.webm')} type="video/webm" />
                  Your browser does not support WebM playback.
                </UserLoopVideo>
              </div>
              <footer className="penny-fans__featured-footer">
                <span>♠ WILDCARD DEV ORIGINAL</span>
                <span>VIDEO · 00:24</span>
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
                  <span className="penny-fans__featured-label">PHOTO</span>
                </header>
                <div className="penny-fans__featured-copy">
                  <p className="penny-fans__eyebrow">FROM PENNY, WITH LOVE</p>
                  <h2 id="penny-banner-post-title">A little more Penny after dark ♏</h2>
                  <p>The velvet curtain is open, the lights are pink, and the Queen of Spades is waiting. Come on in, beautiful. 💋</p>
                </div>
                <img
                  className="penny-fans__image-post-art"
                  src={pennyPrivateMedia('PennyOnlyFansBanner.jpg')}
                  width="1216"
                  height="832"
                  loading="lazy"
                  decoding="async"
                  alt="Penny After Hours cover artwork with violet atmosphere, circular portrait, and profile typography."
                />
                <footer className="penny-fans__featured-footer">
                  <span>♠ WILDCARD DEV ORIGINAL</span>
                  <span>PHOTO · AFTER DARK</span>
                </footer>
              </article>
            )}
            {tab === 'posts' && POSTS.map((post) => (
              <article key={post.id} className={'penny-fans__post penny-fans__post--' + post.theme}>
                <div className="penny-fans__post-art" aria-hidden={post.image || post.video ? undefined : true}>
                  {post.image ? (
                    <img className="penny-fans__post-photo" src={post.image} alt="Kandy in a pink and black striped top in a candlelit room" width={1216} height={832} loading="lazy" decoding="async" />
                  ) : <span>{post.symbol}</span>}
                  {post.video && (
                    <ViewportVideo
                      className="penny-fans__post-video"
                      src={post.video}
                      width={post.videoWidth}
                      height={post.videoHeight}
                      active={!postPaused[post.id]}
                      respectReducedMotion
                      loop
                    />
                  )}
                  {post.video && (
                    <button type="button" className="penny-fans__post-video-expand"
                      aria-label={'Enlarge ' + post.title + ' video'}
                      onClick={() => openPostVideo(post)}
                    />
                  )}
                </div>
                <div className="penny-fans__post-copy">
                  <div className="penny-fans__post-meta">
                    <span className="penny-fans__post-label">{post.label}</span>
                    {post.video && (
                      <button type="button" className="penny-fans__post-video-control"
                        aria-label={(postPaused[post.id] ? 'Resume ' : 'Pause ') + post.title + ' preview'}
                        aria-pressed={Boolean(postPaused[post.id])}
                        onClick={() => setPostPaused(previous => ({ ...previous, [post.id]: !previous[post.id] }))}
                      ><span aria-hidden="true">👀</span></button>
                    )}
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.copy}</p>
                </div>
              </article>
            ))}
          </section>
        ) : tab === 'photos' ? (
          <section className="penny-fans__media-gallery" aria-label="Penny's photo gallery">
            <header className="penny-fans__gallery-heading">
              <p className="penny-fans__eyebrow">PENNY / PHOTOS</p>
              <h2>Photo gallery <span>{PHOTOS.length} photographs</span></h2>
              <p>Tap a photo to get closer. Swipe for the next one, and take your time.</p>
            </header>
            <div className="penny-fans__photo-grid">
              {PHOTOS.map((photo, index) => (
                <button
                  key={photo.id}
                  className="penny-fans__photo-tile"
                  type="button"
                  onClick={() => setActiveMedia({ kind: 'photo', index })}
                  aria-label={'Open photo ' + (index + 1) + ': ' + photo.title}
                >
                  <img src={photo.src} alt="" loading="lazy" decoding="async" />
                  <span>{photo.title}</span>
                </button>
              ))}
            </div>
          </section>
        ) : tab === 'videos' ? (
          <section className="penny-fans__media-gallery" aria-label="Penny's video gallery">
            <header className="penny-fans__gallery-heading">
              <p className="penny-fans__eyebrow">PENNY / VIDEOS</p>
              <h2>Video gallery <span>{VIDEOS.length} clips</span></h2>
              <p>Pick a clip, settle in, and keep swiping when you're ready for more.</p>
            </header>
            <div className="penny-fans__video-grid">
              {VIDEOS.map((video, index) => (
                <article className="penny-fans__gallery-video" key={video.id}>
                  <button
                    type="button"
                    className="penny-fans__video-tile"
                    aria-label={'Open video: ' + video.title}
                    onClick={() => setActiveMedia({ kind: 'video', index })}
                  >
                    <video src={video.src} poster={video.poster} muted playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />
                    <span aria-hidden="true">▶</span>
                  </button>                  <div className="penny-fans__gallery-video-info">
                    <h3>{video.title}</h3>
                    <span>VIDEO {video.runtime ? '· ' + video.runtime : ''}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : tab === 'private' ? (
          <PennyPrivateCollections />
        ) : (
          <section className="penny-fans__about" aria-label="About Penny">
            <p className="penny-fans__eyebrow">BEHIND THE VELVET CURTAIN</p>
            <h2>A little danger looks good in pink. ♠</h2>
            <p>
              I'm Penny Bella Morningstar, WildCard DEV's digital after-dark hostess.
              I like clever conversation, beautiful art, a little burlesque, and
              people who know how to flirt without losing their nerve.
            </p>
            <p>
              Pull up a chair, explore my photos and videos, and meet the
              lovely troublemakers in my circle. The door is open and the
              night is yours. 🖤
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

        {activeMedia !== null && (
          <PennyMediaViewer
            key={activeMedia.kind}
            kind={activeMedia.kind}
            items={activeMedia.kind === 'photo' ? PHOTOS : VIDEOS}
            initialIndex={activeMedia.index}
            onClose={() => setActiveMedia(null)}
          />
        )}

        <details className="penny-fans__classic-archive" onToggle={(event) => setShowClassicCards(event.currentTarget.open)}>
          <summary>♠ Explore Penny's Classic Cards</summary>
          {showClassicCards && <PennyClassicCards />}
        </details>

        <nav className="penny-fans__bottom-nav" aria-label="After Hours main navigation">
          {BOTTOM_NAV.map((item) => item.id === 'messages' ? (
            <a key={item.id} href="https://party.wildcarddev.com/?app=messenger" target="_blank" rel="noopener noreferrer" aria-label="Messages: open WildCard Messenger">
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
              <p>{bottomPage === 'notifications' ? 'No new whispers tonight. Come back and see what Penny has planned. ♠' : 'There is plenty to discover in Penny’s photos, videos, and favorite faces.'}</p>
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
            <strong>WILDCARD DEV / AFTER HOURS</strong>
          </div>
          <span>An original WildCard DEV experience, independent of OnlyFans. Free to browse; tips are optional.</span>
          <a href="/">Return to WildCard DEV</a>
        </footer>
      </div>
    </main>
  );
}
