import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import Spinner from './components/Spinner.jsx';
import mattAvatar from '../assets/matt-avatar-ui.png';
import wildCardDevIcon from '../assets/wildcard-logo-main.png';
import pennySpadeLogo from '../assets/wildcard-logo-penny.png';
import kandyKandleWebm from '../assets/KandyKandle.webm';
import pennyKandyAvaVideo from '../assets/PennyKandyAva.webm';
import pennyClubFinalVideo from '../assets/PennyClubFinal.webm';
import pennyLapDanceVideo from '../assets/ClubPennyLapDance1.webm';
import pennyKnowledgeVideo from '../assets/PennyKnowledge.webm';
import pennyQueenVideo from '../assets/WitchPennyAndKandy4.webm';
import pennyCardVideo from '../assets/PennyShowsOff.webm';
import pennyCardVideo2 from '../assets/WitchPennyAndKandy6.webm';
import pennyCardVideo3 from '../assets/WitchPennyAndKandy1.webm';
import pennyCardVideo4 from '../assets/WitchPennyAndKandy3.webm';
import pennyContactAssistVideo from '../assets/PennyContactAssistVideo.webm';
import ownerPennyKandyVideo from '../assets/WitchPennyAndKandy2-silent.webm';
import witchHalloweenHookUp from '../assets/WitchPennyKandyHookUp.webm';
import witchHalloween20 from '../assets/WitchPennyKandy20.webm';
import witchHalloweenTarot from '../assets/WitchPennyKandyTarot.webm';
import witchHalloweenIntro from '../assets/WitchPennyIntroKandy.webm';
import witchHalloweenReading from '../assets/WitchPennyKandyTarotReading.webm';

const CHANNELS = [
  { id: 'contact', number: '01', title: 'Contact', copy: 'Direct operator access for WildCard DEV, Matt, Penny, and Kandy, an accomplished Tarot reader and up-and-coming author.', video: witchHalloweenHookUp },
  { id: 'systems', number: '02', title: 'Arcane Engineering', copy: 'Web, apps, automation, and AI built with cinematic precision.', video: witchHalloween20 },
  { id: 'portfolio', number: '03', title: 'The Grimoire', copy: 'A living archive of WildCard DEV builds, experiments, strange ideas, and systems summoned into existence.', video: witchHalloweenTarot },
  { id: 'penny', number: '04', title: 'Penny', copy: 'The digital avatar of Lilith — concierge guidance, contact routing, and controlled chaos.', penny: true, video: pennyKandyAvaVideo },
  { id: 'automation', number: '05', title: 'Hell’s Little Helpers', copy: 'Where bold ideas become working systems. Automation, AI, and a little digital sorcery handle the repetitive bullshit, leaving talented women like Kandy free to create, write, read the cards, and build what comes next.', video: witchHalloweenIntro },
  { id: 'interface', number: '06', title: 'The Veil', copy: 'Distinctive digital experiences built to feel responsive, useful, and alive. See that little spade on the right? That’s Penny’s Little Black Book. Give it a tap.', video: witchHalloweenReading },
];

const GRIMOIRE_PROJECTS = [
  {
    name: "Penny's Garage",
    status: 'Production storefront',
    description: 'WildCard DEV’s interactive services and merchandise storefront, with hosted provider listings and rotatable merchandise presentation. Display merchandise may be demonstration-only.',
    capabilities: ['Storefront', 'Hosted services', 'Merchandise viewer'],
    links: [
      { label: 'Explore Penny’s Garage →', href: 'https://pennysoffice.wildcarddev.com/' },
    ],
  },
  {
    name: 'WildCard Party',
    status: 'Live platform · Calling in development',
    description: 'A social and community platform with direct messaging, attachments, presence, and read/unread indicators. Calling functionality remains in development.',
    capabilities: ['Community', 'Messaging', 'Attachments'],
    links: [
      { label: 'Visit WildCard Party →', href: 'https://party.wildcarddev.com/' },
    ],
  },
  {
    name: 'WildCard Labs',
    status: 'Coming soon',
    description: 'The experimental development space for WildCard DEV. Its landing page is a preview of what is planned, not a completed project gallery.',
    capabilities: ['Research', 'Experiments'],
    links: [
      { label: 'Visit the Labs landing page →', href: 'https://labs.wildcarddev.com/' },
    ],
  },
  {
    name: 'Web & App Showroom',
    status: 'Package demonstrations · Not client projects',
    description: 'Explore two example web-and-app build packages: the Enhanced Build and the Launch Build.',
    capabilities: ['Web design', 'App development', 'Package demos'],
    links: [
      { label: 'Open Enhanced Build demo →', href: 'https://wildcard-showroom-enhanced-1500.vercel.app/' },
      { label: 'Open Launch Build demo →', href: 'https://wildcard-showroom-enhanced-1500.vercel.app/launch/' },
    ],
  },
];

const GRIMOIRE_ARCHIVE = [
  {
    name: '3D Video Carousel',
    description: 'An earlier pointer-driven, rotating 3D carousel experiment combining image and video panels.',
  },
  {
    name: 'Dice Prototypes',
    description: 'Historical dice-focused browser experiments, including multiple builds preserved in the Mark III archive.',
  },
  {
    name: 'Flashcards',
    description: 'A browser-based flashcard experiment from the earlier WildCard development era.',
  },
];

const PENNY_SERVICES_URL = '/bunker';
const KANDY_FACEBOOK_URL = 'https://www.facebook.com/share/1EXJvJchHu/';
const KANDY_SUNO_URL = 'https://suno.com/s/8wuDm8yj3GZIab9M';
const KANDY_LATEST_TRACK_URL =
  'https://suno.com/song/34d73d33-56ab-4beb-adab-cde275ca1ad3?sh=HRAX1Ir73RfDIBmF';
const WILDCARD_PARTY_URL = 'https://party.wildcarddev.com/';
const WILDCARD_X_URL = 'https://x.com/Dev_WildCard';
const SUNO_ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.suno.android';
const SUNO_IOS_URL = 'https://apps.apple.com/us/app/suno-ai-songs-music-lyrics/id6480136315';
const CONTACT_ASSIST_TIMEOUT_MS = 8000;

function trackAnalyticsEvent(name, parameters = {}) {
  if (
    typeof window === 'undefined'
    || typeof window.gtag !== 'function'
  ) {
    return;
  }

  window.gtag('event', name, parameters);
}

function shouldBypassContactAssist(event) {
  return (
    event.button !== 0
    || event.metaKey
    || event.ctrlKey
    || event.shiftKey
    || event.altKey
  );
}

function buildProjectInquiryMailto(formData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const projectType = String(formData.get('projectType') || '').trim();
  const message = String(formData.get('message') || '').trim();

  const subject = 'WildCard DEV Project Inquiry';
  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Project type: ${projectType}`,
    '',
    'Message:',
    message,
  ].join('\n');

  return (
    'mailto:matt@wildcarddev.com'
    + `?subject=${encodeURIComponent(subject)}`
    + `&body=${encodeURIComponent(body)}`
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined'
      ? window.matchMedia(query).matches
      : false
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener?.('change', handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
    };
  }, [query]);

  return matches;
}

function usePageVisible() {
  const [visible, setVisible] = useState(() => (
    typeof document !== 'undefined'
      ? !document.hidden
      : true
  ));

  useEffect(() => {
    const handleVisibilityChange = () => {
      setVisible(!document.hidden);
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange,
      );
    };
  }, []);

  return visible;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.49 22H3.37l7.25-8.29L2.98 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.84h1.73L8.44 4.05H6.59L17.8 19.84Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.34 3.5A2.34 2.34 0 1 1 .66 3.5a2.34 2.34 0 0 1 4.68 0ZM1.07 8.07h4.55V22H1.07V8.07Zm7.22 0h4.36v1.9h.06c.61-1.15 2.09-2.36 4.3-2.36 4.6 0 5.45 3.03 5.45 6.97V22h-4.54v-6.57c0-1.57-.03-3.59-2.19-3.59-2.19 0-2.52 1.71-2.52 3.47V22H8.29V8.07Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 .7A11.5 11.5 0 0 0 8.36 23.1c.58.1.79-.25.79-.56v-2.19c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.72 0-1.26.45-2.3 1.19-3.11-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.17 1.19A11 11 0 0 1 12 6.09a11 11 0 0 1 2.89.39c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.11 3.06.74.81 1.19 1.85 1.19 3.11 0 4.44-2.71 5.42-5.29 5.71.42.36.79 1.07.79 2.16v3.21c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.54 5.34A16.3 16.3 0 0 0 15.44 4l-.5 1.02a15.1 15.1 0 0 0-5.87 0L8.55 4a16.5 16.5 0 0 0-4.1 1.35C1.86 9.2 1.16 12.96 1.5 16.67a16.8 16.8 0 0 0 5.03 2.54l1.23-1.68a10.4 10.4 0 0 1-1.94-.94l.48-.37a11.7 11.7 0 0 0 11.4 0l.49.37c-.62.37-1.27.68-1.95.94l1.23 1.68a16.7 16.7 0 0 0 5.03-2.54c.4-4.3-.68-8.03-2.96-11.33ZM8.83 14.4c-1.01 0-1.84-.93-1.84-2.07s.81-2.07 1.84-2.07c1.04 0 1.86.94 1.84 2.07 0 1.14-.81 2.07-1.84 2.07Zm6.34 0c-1.01 0-1.84-.93-1.84-2.07s.81-2.07 1.84-2.07c1.04 0 1.86.94 1.84 2.07 0 1.14-.8 2.07-1.84 2.07Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6 22v-8.8h3l.45-3.43H13.6V7.58c0-.99.28-1.67 1.72-1.67h1.84V2.84c-.32-.04-1.41-.14-2.68-.14-2.65 0-4.47 1.62-4.47 4.6v2.47H7v3.43h3.01V22h3.59Z" />
    </svg>
  );
}

function SunoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15.5 3.3v11.18a3.55 3.55 0 1 1-2-3.2V6.02l7-1.55v7.51a3.55 3.55 0 1 1-2-3.2V2.1l-3 .66v.54Zm-5.55 10.83a1.55 1.55 0 1 0 0 3.1 1.55 1.55 0 0 0 0-3.1Zm7 1.5a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 0 0-3.1 0Z" />
    </svg>
  );
}

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.7 2.46a1.76 1.76 0 0 0-.7 1.43v16.22c0 .58.27 1.1.7 1.43l9.18-9.54L3.7 2.46Zm10.43 10.84-2.3 2.39 6.18 3.5c.75.42 1.62.16 2.01-.45.13-.21.2-.46.2-.74 0-.53-.27-.98-.74-1.25l-5.35-3.45ZM11.83 8.31l2.3 2.39 5.35-3.45c.47-.27.74-.72.74-1.25 0-.28-.07-.53-.2-.74-.39-.61-1.26-.87-2.01-.45l-6.18 3.5ZM4.8 2l5.66 5.88 2.42-1.37L6.02 2.62A2.06 2.06 0 0 0 4.8 2Zm5.66 14.12L4.8 22c.4 0 .82-.11 1.22-.34l6.86-3.89-2.42-1.65Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.69 12.07c.02-2.04 1.67-3.02 1.75-3.07-.95-1.39-2.43-1.58-2.96-1.6-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.04-1.43 2.49-.37 6.17 1.03 8.19.68.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.67 2.67-.67s1.6.67 2.69.65c1.11-.02 1.82-1.01 2.5-2 0 0 1.15-1.68 1.28-2.34-.03-.01-2.36-.91-2.39-3.3Zm-2.04-5.99c.57-.69.96-1.65.85-2.61-.82.03-1.81.55-2.4 1.24-.53.61-.99 1.58-.87 2.51.91.07 1.85-.46 2.42-1.14Z" />
    </svg>
  );
}

function PennyLoopVideo({ active }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);

  const videos = [
    pennyClubFinalVideo,
    pennyLapDanceVideo,
    pennyKnowledgeVideo,
  ];

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (active) {
      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [active, videoIndex]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      key={videoIndex}
      className="penny-loop-video"
      src={videos[videoIndex]}
      autoPlay
      muted
      playsInline
      preload="metadata"
      onEnded={() => {
        setVideoIndex(
          (current) => (
            (current + 1) % videos.length
          ),
        );
      }}
      aria-label="Penny"
    />
  );
}

function KandyVideo({ active }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (active) {
      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [active]);

  if (!active) return null;

  return (
    <video
      ref={videoRef}
      className="kandy-video"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Kandy"
    >
      <source src={kandyKandleWebm} type="video/webm" />
    </video>
  );
}

function PennyContactAssist({
  active,
  message,
  fallbackType,
  videoRef,
  onComplete,
  onClose,
}) {
  return (
    <aside
      className={`penny-contact-assist${active ? ' is-active' : ''}`}
      aria-hidden={!active}
      inert={!active}
    >
      <button
        className="penny-contact-assist-close"
        type="button"
        aria-label="Close Contact Assist"
        onClick={onClose}
      >
        ×
      </button>

      <div className="penny-contact-assist-video-shell">
        <video
          ref={videoRef}
          className="penny-contact-assist-video"
          playsInline
          preload="none"
          aria-hidden="true"
          onEnded={() => {
            if (active) {
              onComplete();
            }
          }}
        />
      </div>

      <div className="penny-contact-assist-content">
        <div
          className="penny-contact-assist-bubble"
          role="status"
          aria-live="polite"
        >
          {active ? message : ''}
        </div>

        {active && fallbackType === 'penny-phone' && (
          <div
            className="penny-contact-assist-actions"
            aria-label="Penny phone fallback actions"
          >
            <a
              href="tel:+14029150789"
              onClick={onClose}
            >
              CALL PENNY
            </a>
            <a
              href="sms:+14029150789"
              onClick={onClose}
            >
              TEXT PENNY
            </a>
          </div>
        )}

        {active && fallbackType === 'penny-email' && (
          <div
            className="penny-contact-assist-actions"
            aria-label="Penny email fallback action"
          >
            <a
              href="mailto:penny@wildcarddev.com"
              onClick={onClose}
            >
              OPEN EMAIL
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

function ContactForm({ onSubmit }) {
  return (
    <form
      className="contact-form"
      onSubmit={onSubmit}
    >
      <label className="contact-field">
        <span>Name</span>
        <input
          type="text"
          name="name"
          autoComplete="name"
          required
        />
      </label>

      <label className="contact-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="contact-field">
        <span>Phone <small>(optional)</small></span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
        />
      </label>

      <label className="contact-field">
        <span>Project type</span>
        <input
          type="text"
          name="projectType"
        />
      </label>

      <label className="contact-field contact-field--message">
        <span>Message</span>
        <textarea
          name="message"
          rows="2"
          required
        />
      </label>

      <button
        className="contact-submit"
        type="submit"
      >
        Send inquiry
      </button>
    </form>
  );
}

const miniSpinnerDrags = new WeakMap();
const miniSpinnerClickBlocks = new WeakMap();
const miniSpinnerMotion = new WeakMap();

function miniSpinnerTrack(root) {
  return root.querySelector('.mini-spinner-track');
}

function stopMiniSpinnerMotion(root) {
  const motion = miniSpinnerMotion.get(root);
  if (!motion) return;
  cancelAnimationFrame(motion.frame);
  clearTimeout(motion.timer);
  miniSpinnerMotion.delete(root);
}

function resumeMiniSpinnerAuto(root, angle) {
  const track = miniSpinnerTrack(root);
  if (!track) return;
  track.style.setProperty('--mini-offset', `${angle}deg`);
  track.style.removeProperty('animation');
  track.style.removeProperty('transition');
  track.style.removeProperty('transform');
}

function coastMiniSpinner(root, startAngle, velocity) {
  const track = miniSpinnerTrack(root);
  if (!track) return;

  const motion = {
    angle: startAngle,
    velocity: Math.max(-0.9, Math.min(0.9, velocity)),
    lastTime: 0,
    frame: 0,
    timer: 0,
  };
  miniSpinnerMotion.set(root, motion);

  const settle = () => {
    motion.timer = setTimeout(() => {
      if (miniSpinnerMotion.get(root) !== motion) return;
      miniSpinnerMotion.delete(root);
      resumeMiniSpinnerAuto(root, motion.angle);
    }, 1200);
  };

  if (Math.abs(motion.velocity) <= 0.002) {
    settle();
    return;
  }

  const tick = (time) => {
    if (miniSpinnerMotion.get(root) !== motion) return;
    motion.frame = 0;

    if (!motion.lastTime) motion.lastTime = time;
    const elapsed = Math.min(time - motion.lastTime, 40);
    motion.lastTime = time;

    motion.angle += motion.velocity * elapsed;
    track.style.transform = `rotateY(${motion.angle}deg)`;
    motion.velocity *= Math.pow(0.94, elapsed / 16.67);

    if (Math.abs(motion.velocity) <= 0.002) {
      settle();
    } else {
      motion.frame = requestAnimationFrame(tick);
    }
  };
  motion.frame = requestAnimationFrame(tick);
}

function startMiniSpinnerDrag(event) {
  if (event.button !== 0 || !event.isPrimary
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = event.currentTarget;
  const track = miniSpinnerTrack(root);
  if (!track || miniSpinnerDrags.has(root)) return;

  stopMiniSpinnerMotion(root);
  // CSS rotateY(angle) has -sin(angle) in DOMMatrix.m13.
  const matrix = new DOMMatrixReadOnly(getComputedStyle(track).transform);
  const angle = Math.atan2(-matrix.m13, matrix.m11) * 180 / Math.PI;
  miniSpinnerDrags.set(root, {
    pointerId: event.pointerId,
    startX: event.clientX,
    lastX: event.clientX,
    lastTime: performance.now(),
    angle,
    velocity: 0,
    moved: false,
  });

  root.classList.remove('is-keyboard-focused');
  track.style.animation = 'none';
  track.style.transition = 'none';
  track.style.transform = `rotateY(${angle}deg)`;
}

function moveMiniSpinnerDrag(event) {
  const root = event.currentTarget;
  const drag = miniSpinnerDrags.get(root);
  if (!drag || drag.pointerId !== event.pointerId) return;

  const now = performance.now();
  const deltaX = event.clientX - drag.lastX;
  const elapsed = Math.max(now - drag.lastTime, 8);

  if (!drag.moved && Math.abs(event.clientX - drag.startX) > 8) {
    drag.moved = true;
    root.classList.add('is-dragging');
    root.setPointerCapture(event.pointerId);
  }

  // Match the main spinner: angle per pixel and smoothed angular velocity.
  drag.angle += deltaX * 0.38;
  miniSpinnerTrack(root).style.transform = `rotateY(${drag.angle}deg)`;
  drag.velocity = drag.velocity * 0.55
    + ((deltaX * 0.38) / elapsed) * 0.45;
  drag.lastX = event.clientX;
  drag.lastTime = now;
}

function endMiniSpinnerDrag(event) {
  const root = event.currentTarget;
  const drag = miniSpinnerDrags.get(root);
  if (!drag || drag.pointerId !== event.pointerId) return;

  miniSpinnerDrags.delete(root);
  root.classList.remove('is-dragging');
  if (drag.moved) miniSpinnerClickBlocks.set(root, performance.now() + 250);

  if (root.hasPointerCapture(event.pointerId)) {
    root.releasePointerCapture(event.pointerId);
  }

  if (drag.moved && event.type !== 'pointercancel') {
    coastMiniSpinner(root, drag.angle, drag.velocity);
  } else {
    // Taps and canceled vertical scrolls should resume normally.
    resumeMiniSpinnerAuto(root, drag.angle);
  }
}

function suppressMiniSpinnerDragClick(event) {
  if (performance.now() < (miniSpinnerClickBlocks.get(event.currentTarget) || 0)) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function focusMiniSpinnerLink(event) {
  if (miniSpinnerDrags.has(event.currentTarget)
    || !event.target.matches(':focus-visible')
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const track = miniSpinnerTrack(event.currentTarget);
  const links = track ? Array.from(track.querySelectorAll('a')) : [];
  const index = links.indexOf(event.target.closest('a'));
  if (index < 0) return;

  // Keyboard-focused destinations face forward.
  event.currentTarget.classList.add('is-keyboard-focused');
  track.style.animation = 'none';
  track.style.transform = `rotateY(${-index * 360 / links.length}deg)`;
}

function releaseMiniSpinnerLink(event) {
  if (miniSpinnerDrags.has(event.currentTarget)
    || event.currentTarget.contains(event.relatedTarget)) return;
  event.currentTarget.classList.remove('is-keyboard-focused');
  if (miniSpinnerMotion.has(event.currentTarget)) return;
  const track = miniSpinnerTrack(event.currentTarget);
  track?.style.removeProperty('animation');
  track?.style.removeProperty('transform');
}

function ContactPanels({
  open,
  showKandy,
  pageVisible,
  onContactAssist,
}) {
  const ownerFeatureVideoRef = useRef(null);
  const ownerFeatureVideoSupported = useMediaQuery(
    '(min-width: 241px) and (max-width: 520px), (min-width: 900px)',
  );

  useEffect(() => {
    const video = ownerFeatureVideoRef.current;

    if (!video) return;

    if (
      !open
      || !pageVisible
      || !ownerFeatureVideoSupported
    ) {
      video.pause();
      return;
    }

    const playAttempt = video.play();

    if (playAttempt?.catch) {
      playAttempt.catch(() => {});
    }
  }, [
    open,
    pageVisible,
    ownerFeatureVideoSupported,
  ]);

  return (
    <section
      className={`card-stage card-stage--contacts${open ? ' is-active' : ''}`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="identity-pair">
        <article className="identity-card identity-card--matt">
          <img
            src={mattAvatar}
            alt="Matt Tobaben"
          />

          <p className="eyebrow">Owner</p>
          <h2>Matt Tobaben</h2>
          <p>WildCard DEV</p>

          <a
            href="mailto:matt@wildcarddev.com"
            onClick={(event) => {
              if (shouldBypassContactAssist(event)) return;
              event.preventDefault();
              onContactAssist(
                'mailto:matt@wildcarddev.com',
                "I'll get that ready for you.",
              );
            }}
          >
            matt@wildcarddev.com
          </a>

          <a
            href="tel:+14029150789"
            onClick={(event) => {
              if (shouldBypassContactAssist(event)) return;
              event.preventDefault();
              onContactAssist(
                'tel:+14029150789',
                "I'll put you through.",
              );
            }}
          >
            402-915-0789
          </a>

          <div className="owner-project-pills">
            <a
              className="owner-labs-pill"
              href="https://labs.wildcarddev.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="See WildCard Labs live"
            >
              LABS
            </a>

            <a
              className="owner-labs-pill owner-possibilities-pill"
              href="https://pennysoffice.wildcarddev.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Explore the possibilities with Penny's Garage"
            >
              THE POSSIBILITIES
            </a>
          </div>

          <div
            className="identity-link-deck owner-link-deck mini-spinner mini-spinner--owner"
            role="group"
            onPointerDown={startMiniSpinnerDrag}
            onPointerMove={moveMiniSpinnerDrag}
            onPointerUp={endMiniSpinnerDrag}
            onPointerCancel={endMiniSpinnerDrag}
            onClickCapture={suppressMiniSpinnerDragClick}
            onDragStart={(event) => event.preventDefault()}
            onFocusCapture={focusMiniSpinnerLink}
            onBlurCapture={releaseMiniSpinnerLink}
            aria-label="Matt Tobaben social links"
          >

            <div className="mini-spinner-track">            <a
              className="identity-link-card owner-link-card--x"
              href={WILDCARD_X_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="WildCard DEV on X"
            >
              <span
                className="identity-link-card-icon"
                aria-hidden="true"
              >
                <XIcon />
              </span>
              <span className="identity-link-card-label">X</span>
            </a>

            <a
              className="identity-link-card owner-link-card--linkedin"
              href="https://www.linkedin.com/in/matt-tobaben/"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on LinkedIn"
            >
              <span
                className="identity-link-card-icon"
                aria-hidden="true"
              >
                <LinkedInIcon />
              </span>
              <span className="identity-link-card-label">IN</span>
            </a>

            <a
              className="identity-link-card owner-link-card--github"
              href="https://github.com/mtobabendev"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on GitHub"
            >
              <span
                className="identity-link-card-icon"
                aria-hidden="true"
              >
                <GitHubIcon />
              </span>
              <span className="identity-link-card-label">GH</span>
            </a>

            <a
              className="identity-link-card owner-link-card--discord"
              href="https://discord.com/users/1503417641086488708"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on Discord"
            >
              <span
                className="identity-link-card-icon"
                aria-hidden="true"
              >
                <DiscordIcon />
              </span>
              <span className="identity-link-card-label">DC</span>
            </a>

            <a
              className="identity-link-card owner-link-card--facebook"
              href="https://www.facebook.com/profile.php?id=61595096724035"
              target="_blank"
              rel="noreferrer"
              aria-label="Matt Tobaben on Facebook"
            >
              <span
                className="identity-link-card-icon"
                aria-hidden="true"
              >
                <FacebookIcon />
              </span>
              <span className="identity-link-card-label">FB</span>
            </a>
            </div>
            <div
              className="identity-link-hub owner-link-hub"
              aria-hidden="true"
            >
              <img
                src={wildCardDevIcon}
                alt=""
              />
            </div>

          </div>

          <div
            className="owner-feature-video-shell"
            aria-hidden="true"
          >
            <video
              ref={ownerFeatureVideoRef}
              className="owner-feature-video"
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source
                src={ownerPennyKandyVideo}
                type="video/webm"
                media="(min-width: 241px) and (max-width: 520px), (min-width: 900px)"
              />
            </video>
          </div>
        </article>

        {showKandy && (
          <article className="identity-card identity-card--kandy">
            <div className="kandy-video-shell">
              <KandyVideo
                active={open && pageVisible}
              />
            </div>

            <div className="kandy-copy">
              <h2>Kandy</h2>

              <a
                href="mailto:Kandy@wildcarddev.com"
                onClick={(event) => {
                  if (shouldBypassContactAssist(event)) return;
                  event.preventDefault();
                  onContactAssist(
                    'mailto:Kandy@wildcarddev.com',
                    "I'll get you over to Kandy.",
                  );
                }}
              >
                Kandy@wildcarddev.com
              </a>

              <div className="kandy-suno-feature">
                <p>Original music and cover art by Kopacetic Kandle.</p>
                <a
                  className="kandy-suno-cta"
                  href={KANDY_SUNO_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackAnalyticsEvent(
                      'kandy_suno_playlist_click',
                      {
                        source: 'kandy_card',
                        link_url: KANDY_SUNO_URL,
                      },
                    );
                  }}
                >
                  Listen to Kandy on Suno
                </a>

                <div className="kandy-suno-latest">
                  <a
                    className="kandy-suno-cta"
                    href={KANDY_LATEST_TRACK_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      trackAnalyticsEvent(
                        'kandy_suno_latest_track_click',
                        {
                          source: 'kandy_card',
                          link_url: KANDY_LATEST_TRACK_URL,
                        },
                      );
                    }}
                  >
                    Latest track: Listen now →
                  </a>
                </div>
              </div>

              <div
                className="identity-link-deck kandy-link-deck mini-spinner mini-spinner--kandy"
                role="group"
                onPointerDown={startMiniSpinnerDrag}
            onPointerMove={moveMiniSpinnerDrag}
            onPointerUp={endMiniSpinnerDrag}
            onPointerCancel={endMiniSpinnerDrag}
            onClickCapture={suppressMiniSpinnerDragClick}
            onDragStart={(event) => event.preventDefault()}
            onFocusCapture={focusMiniSpinnerLink}
                onBlurCapture={releaseMiniSpinnerLink}
                aria-label="Kandy links"
              >

                <div className="mini-spinner-track">                <a
                  className="identity-link-card kandy-link-card--facebook"
                  href={KANDY_FACEBOOK_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Kandy on Facebook"
                >
                  <span
                    className="identity-link-card-icon"
                    aria-hidden="true"
                  >
                    <FacebookIcon />
                  </span>
                  <span className="identity-link-card-label">FB</span>
                </a>

                <a
                  className="identity-link-card kandy-link-card--suno"
                  href={KANDY_SUNO_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Kandy on Suno"
                  onClick={() => {
                    trackAnalyticsEvent(
                      'kandy_suno_playlist_click',
                      {
                        source: 'kandy_card',
                        link_url: KANDY_SUNO_URL,
                      },
                    );
                  }}
                >
                  <span
                    className="identity-link-card-icon"
                    aria-hidden="true"
                  >
                    <SunoIcon />
                  </span>
                  <span className="identity-link-card-label">SUNO</span>
                </a>

                <a
                  className="identity-link-card kandy-link-card--play"
                  href={SUNO_ANDROID_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download Suno for Android"
                >
                  <span
                    className="identity-link-card-icon"
                    aria-hidden="true"
                  >
                    <GooglePlayIcon />
                  </span>
                  <span className="identity-link-card-label">GP</span>
                </a>

                <a
                  className="identity-link-card kandy-link-card--apple"
                  href={SUNO_IOS_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download Suno for iPhone"
                >
                  <span
                    className="identity-link-card-icon"
                    aria-hidden="true"
                  >
                    <AppleIcon />
                  </span>
                  <span className="identity-link-card-label">iOS</span>
                </a>
                </div>
                <div
                  className="identity-link-hub kandy-link-hub"
                  aria-hidden="true"
                >
                  <img
                    src={wildCardDevIcon}
                    alt=""
                  />
                </div>

              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}

function CombinationDial({
  value,
  position,
  onChange,
}) {
  const pointerStartRef = useRef(null);

  const adjust = (amount) => {
    onChange((value + amount + 10) % 10);
  };

  return (
    <div
      className="combination-dial"
      onWheel={(event) => {
        event.preventDefault();
        adjust(event.deltaY > 0 ? 1 : -1);
      }}
      onPointerDown={(event) => {
        if (event.target.closest('button')) {
          return;
        }

        pointerStartRef.current = event.clientY;

        event.currentTarget.setPointerCapture(
          event.pointerId,
        );
      }}
      onPointerUp={(event) => {
        if (pointerStartRef.current === null) {
          return;
        }

        const distance = (
          event.clientY - pointerStartRef.current
        );

        pointerStartRef.current = null;

        if (Math.abs(distance) >= 16) {
          adjust(distance < 0 ? 1 : -1);
        }
      }}
    >
      <button
        type="button"
        aria-label={`Increase digit ${position}`}
        onClick={() => adjust(1)}
      >
        ▲
      </button>

      <output
        aria-label={`Combination digit ${position}`}
      >
        {value}
      </output>

      <button
        type="button"
        aria-label={`Decrease digit ${position}`}
        onClick={() => adjust(-1)}
      >
        ▼
      </button>
    </div>
  );
}

function CombinationGate({
  open,
  onClose,
}) {
  const [digits, setDigits] = useState([0, 0, 0]);

  const [message, setMessage] = useState(
    'Set the house combination.',
  );

  const gateRef = useRef(null);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    setDigits([0, 0, 0]);
    setMessage('Set the house combination.');
    returnFocusRef.current = document.activeElement;

    closeRef.current?.focus();

    const gate = gateRef.current;
    const parent = gate?.parentElement;
    const inertState = new Map();

    const applyInert = () => {
      if (!parent || !gate) return;

      Array.from(parent.children).forEach((node) => {
        if (node === gate) return;

        if (!inertState.has(node)) {
          inertState.set(
            node,
            node.hasAttribute('inert'),
          );
        }

        node.setAttribute('inert', '');
      });
    };

    applyInert();

    const observer = parent
      ? new MutationObserver(applyInert)
      : null;

    observer?.observe(parent, {
      childList: true,
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (
        event.key !== 'Tab'
        || !dialogRef.current
      ) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => (
        !element.closest('[hidden]')
        && !element.hasAttribute('inert')
      ));

      if (!focusable.length) {
        event.preventDefault();
        closeRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (!dialogRef.current.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (
        event.shiftKey
        && activeElement === first
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey
        && activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
      observer?.disconnect();

      inertState.forEach((wasInert, node) => {
        if (!wasInert) {
          node.removeAttribute('inert');
        }
      });

      const returnFocus = returnFocusRef.current;

      if (returnFocus?.isConnected) {
        window.setTimeout(() => {
          returnFocus.focus();
        }, 0);
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const setDigit = (index, value) => {
    setDigits((current) => (
      current.map((digit, digitIndex) => (
        digitIndex === index ? value : digit
      ))
    ));
  };

  const unlock = (event) => {
    event.preventDefault();

    if (digits.join('') === '216') {
      setMessage('The door is open.');
      window.location.assign(PENNY_SERVICES_URL);
      return;
    }

    setMessage('Wrong room. Try the card again.');
  };

  return (
    <div
      ref={gateRef}
      className="combination-gate"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className="combination-lock"
        role="dialog"
        aria-modal="true"
        aria-labelledby="combination-title"
      >
        <button
          ref={closeRef}
          className="combination-close"
          type="button"
          onClick={onClose}
          aria-label="Close combination lock"
        >
          ×
        </button>

        <p className="eyebrow">Penny's Office</p>
        <h2 id="combination-title">
          Combination required
        </h2>

        <p>
          Private room. Turn the three dials and unlock the door.
        </p>

        <form onSubmit={unlock}>
          <div
            className="combination-dials"
            aria-label="Three digit combination"
          >
            {digits.map((digit, index) => (
              <CombinationDial
                key={index}
                value={digit}
                position={index + 1}
                onChange={(value) => {
                  setDigit(index, value);
                }}
              />
            ))}
          </div>

          <button
            className="combination-unlock"
            type="submit"
          >
            Unlock
          </button>
        </form>

        <p
          className="combination-message"
          aria-live="polite"
        >
          {message}
        </p>
      </section>
    </div>
  );
}

function readNavigationState() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/grimoire') {
    return { siteMode: 'section', activeIndex: 2 };
  }

  const saved = window.history.state?.wildcardDevNavigation;
  if (
    path === '/'
    && (saved?.siteMode === 'home' || saved?.siteMode === 'section')
    && Number.isInteger(saved.activeIndex)
    && saved.activeIndex >= 0
    && saved.activeIndex < CHANNELS.length
    && (saved.siteMode === 'home' || saved.activeIndex !== 2)
  ) {
    return saved;
  }

  return { siteMode: 'home', activeIndex: 3 };
}

export default function App() {
  const open = true;
  const [navigation, setNavigation] = useState(readNavigationState);
  const { siteMode, activeIndex } = navigation;
  const isHome = siteMode === 'home';
  const [contactPanelClosed, setContactPanelClosed] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [assistActive, setAssistActive] = useState(false);
  const [assistMessage, setAssistMessage] = useState('');

  useEffect(() => {
    const syncHistory = () => {
      setNavigation(readNavigationState());
      setContactPanelClosed(false);
    };

    window.addEventListener('popstate', syncHistory);
    return () => window.removeEventListener('popstate', syncHistory);
  }, []);

  const closeGate = useCallback(() => {
    setGateOpen(false);
  }, []);

  const assistVideoRef = useRef(null);
  const assistTimeoutRef = useRef(0);
  const assistRunningRef = useRef(false);
  const assistCompletionRef = useRef(false);
  const pendingHrefRef = useRef('');
  const assistFallbackRef = useRef('');

  const completeContactAssist = useCallback(() => {
    if (
      !assistRunningRef.current
      || assistCompletionRef.current
    ) {
      return;
    }

    assistCompletionRef.current = true;

    if (assistTimeoutRef.current) {
      window.clearTimeout(assistTimeoutRef.current);
      assistTimeoutRef.current = 0;
    }

    const destination = pendingHrefRef.current;
    const video = assistVideoRef.current;

    if (video) {
      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Some browsers can reject seeking before metadata is ready.
      }

      video.removeAttribute('src');
      video.load();
    }

    assistRunningRef.current = false;
    pendingHrefRef.current = '';
    assistFallbackRef.current = '';
    setAssistActive(false);
    setAssistMessage('');

    if (destination) {
      window.location.href = destination;
    }
  }, []);

  const cancelContactAssist = useCallback(() => {
    if (assistTimeoutRef.current) {
      window.clearTimeout(assistTimeoutRef.current);
      assistTimeoutRef.current = 0;
    }

    const video = assistVideoRef.current;

    if (video) {
      video.pause();

      try {
        video.currentTime = 0;
      } catch {
        // Some browsers can reject seeking before metadata is ready.
      }

      video.removeAttribute('src');
      video.load();
    }

    assistRunningRef.current = false;
    assistCompletionRef.current = false;
    pendingHrefRef.current = '';
    assistFallbackRef.current = '';
    setAssistActive(false);
    setAssistMessage('');
  }, []);

  const startContactAssist = useCallback((
    href,
    message,
    fallbackType = '',
  ) => {
    if (assistRunningRef.current) {
      return false;
    }

    const video = assistVideoRef.current;

    if (!video) {
      window.location.href = href;
      return true;
    }

    assistRunningRef.current = true;
    assistCompletionRef.current = false;
    pendingHrefRef.current = href;
    assistFallbackRef.current = fallbackType;

    setAssistMessage(message);
    setAssistActive(true);

    if (assistTimeoutRef.current) {
      window.clearTimeout(assistTimeoutRef.current);
    }

    assistTimeoutRef.current = window.setTimeout(
      completeContactAssist,
      CONTACT_ASSIST_TIMEOUT_MS,
    );

    video.pause();
    video.src = pennyContactAssistVideo;
    video.load();
    video.muted = false;
    video.volume = 1;

    try {
      video.currentTime = 0;
    } catch {
      // Seeking will be retried naturally when playback begins.
    }

    try {
      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {
          completeContactAssist();
        });
      }
    } catch {
      completeContactAssist();
    }

    return true;
  }, [completeContactAssist]);

  useEffect(() => (
    () => {
      if (assistTimeoutRef.current) {
        window.clearTimeout(assistTimeoutRef.current);
      }

      const video = assistVideoRef.current;

      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    }
  ), []);

  const handleContactFormSubmit = useCallback((event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    const mailtoHref = buildProjectInquiryMailto(
      new FormData(form),
    );

    startContactAssist(
      mailtoHref,
      "I'll get that ready for you.",
    );
  }, [startContactAssist]);

  const isWatch = useMediaQuery('(max-width: 240px)');
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const pageVisible = usePageVisible();

  const activeChannel = CHANNELS[activeIndex];
  const contactPanelDismissed = (
    activeChannel.id === 'contact'
    && contactPanelClosed
  );

  const handleChannelSelect = (index) => {
    const next = { siteMode: 'section', activeIndex: index };
    if (isHome || activeIndex !== index) {
      window.history.pushState(
        { wildcardDevNavigation: next },
        '',
        index === 2 ? '/grimoire' : '/',
      );
    }
    setContactPanelClosed(false);
    setNavigation(next);
  };

  const returnHome = () => {
    const next = { siteMode: 'home', activeIndex };
    window.history.pushState({ wildcardDevNavigation: next }, '', '/');
    setContactPanelClosed(false);
    setNavigation(next);
  };

  const pennyVideoActive = (
    open
    && isHome
    && pageVisible
    && !isWatch
  );

  return (
    <main className={`landing${open ? ' is-open' : ''}${isHome ? '' : ' is-section'}${!isHome && activeChannel.id === 'portfolio' ? ' is-grimoire' : ''}${!isHome && activeChannel.id === 'penny' ? ' is-penny-throne' : ''}${!isHome && activeChannel.id === 'automation' ? ' is-imp-workshop' : ''}${!isHome && activeChannel.id === 'interface' ? ' is-veil' : ''}${!isHome && activeChannel.id === 'systems' ? ' is-arcane-forge' : ''}${pageVisible ? '' : ' is-page-hidden'}`}>
      <header className="site-header">
        <div className="brand">
          <span
            className="brand-dot"
            aria-hidden="true"
          />
          <span>WildCard DEV</span>
        </div>

        <a
          className="donate"
          href="https://square.link/u/sb0tYH9C"
          target="_blank"
          rel="noreferrer"
        >
          Donate
        </a>
      </header>

      {!isHome && (
        <button
          className="section-home-button"
          type="button"
          onClick={returnHome}
        >
          ← Home
        </button>
      )}

      <ContactPanels
        open={isHome}
        showKandy={!isWatch}
        pageVisible={pageVisible}
        onContactAssist={startContactAssist}
      />

      <Spinner
        channels={CHANNELS}
        compact={!isHome}
        open={open}
        activeIndex={activeIndex}
        onSelect={handleChannelSelect}
        isWatch={isWatch}
        pageVisible={pageVisible}
        reducedMotion={reducedMotion}
      />

      <section
        id="channel-content"
        className={`context-window${open && !contactPanelDismissed ? ' is-active' : ''}${activeChannel.id === 'contact' ? ' context-window--contact' : ''}${activeChannel.id === 'systems' ? ' context-window--systems' : ''}${activeChannel.id === 'portfolio' ? ' context-window--portfolio' : ''}${activeChannel.id === 'penny' ? ' context-window--penny' : ''}${activeChannel.id === 'automation' ? ' context-window--automation' : ''}${activeChannel.id === 'interface' ? ' context-window--interface' : ''}`}
        aria-live="polite"
        aria-hidden={!open || contactPanelDismissed}
        inert={!open || contactPanelDismissed}
        hidden={contactPanelDismissed}
      >
        {isHome && activeChannel.id === 'contact' && !contactPanelDismissed && (
          <button
            className="context-window-close"
            type="button"
            aria-label="Close contact panel"
            onClick={() => setContactPanelClosed(true)}
          >
            ×
          </button>
        )}

        <p className="eyebrow">
          Channel {activeChannel.number}
        </p>
        <h2>{activeChannel.title}</h2>
        <p className="channel-copy">
          {activeChannel.copy}
        </p>

        {activeChannel.id === 'contact' && (
          <>
            <div className="penny-contact-actions">
              <p className="eyebrow">Penny // Direct</p>
              <div className="penny-contact-links">
                <a
                  href="mailto:penny@wildcarddev.com"
                  onClick={(event) => {
                    if (shouldBypassContactAssist(event)) return;
                    event.preventDefault();
                    startContactAssist(
                      'mailto:penny@wildcarddev.com',
                      "I'll open a line to Penny.",
                      'penny-email',
                    );
                  }}
                >
                  EMAIL PENNY
                </a>

                <a
                  href="tel:+14029150789"
                  onClick={(event) => {
                    if (shouldBypassContactAssist(event)) return;
                    event.preventDefault();
                    startContactAssist(
                      'tel:+14029150789',
                      "I'll put Penny through.",
                      'penny-phone',
                    );
                  }}
                >
                  CALL PENNY
                  <span>(402) 915-0789</span>
                </a>
              </div>
            </div>

            <ContactForm
              onSubmit={handleContactFormSubmit}
            />
          </>
        )}

        {activeChannel.id === 'systems' && (
          isHome ? (
          <div className="arcane-feature">
            <p className="eyebrow">Live projects</p>
            <div className="arcane-project-links">
              <a
                href="https://pennysoffice.wildcarddev.com/"
                target="_blank"
                rel="noreferrer"
              >
                PENNY’S GARAGE
              </a>
              <a
                href="https://labs.wildcarddev.com/"
                target="_blank"
                rel="noreferrer"
              >
                WILDCARD LABS
              </a>
            </div>
          </div>
          ) : (
          <div className="arcane-forge">
            <figure className="arcane-forge-art">
              <img
                src="/static/arcane-engineering.webp"
                width="1280"
                height="853"
                alt="Penny Bella Morningstar, blonde with a bright flame-red streak, conjures holographic blueprints and systems diagrams in a pink-lit gothic engineering forge alongside her black cat."
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="arcane-forge-intro">
              <p className="arcane-forge-overline">♠ WildCard DEV // Chamber Two</p>
              <h2>Arcane Engineering</h2>
              <p className="arcane-forge-subtitle">The Forge of Creation</p>
              <p>
                Behind every extraordinary experience is a system that actually works.
                We build practical technology for good people with unusual problems,
                combining reliable engineering with a little WildCard imagination.
              </p>
            </div>
            <section className="arcane-forge-section" aria-labelledby="arcane-forge-capabilities">
              <p className="arcane-forge-kicker">I. The Workshop</p>
              <h3 id="arcane-forge-capabilities">What we forge</h3>
              <div className="arcane-forge-grid">
                <article className="arcane-forge-card">
                  <span className="arcane-forge-symbol" aria-hidden="true">⌘</span>
                  <h4>Web Development</h4>
                  <p>Responsive sites, storefronts, and business tools designed to work in the real world.</p>
                </article>
                <article className="arcane-forge-card">
                  <span className="arcane-forge-symbol" aria-hidden="true">▣</span>
                  <h4>Applications</h4>
                  <p>Custom apps, interactive tools, and useful experiences built around the actual task.</p>
                </article>
                <article className="arcane-forge-card">
                  <span className="arcane-forge-symbol" aria-hidden="true">⛓</span>
                  <h4>Integrations</h4>
                  <p>Connect existing services and data flows without creating unnecessary moving parts.</p>
                </article>
                <article className="arcane-forge-card">
                  <span className="arcane-forge-symbol" aria-hidden="true">⚙</span>
                  <h4>Automation</h4>
                  <p>Take repetitive processes off the workbench while keeping humans in control.</p>
                </article>
                <article className="arcane-forge-card">
                  <span className="arcane-forge-symbol" aria-hidden="true">✧</span>
                  <h4>AI Systems</h4>
                  <p>Purpose-built assistants and practical AI integrations with clear boundaries.</p>
                </article>
              </div>
            </section>
            <section className="arcane-forge-section arcane-forge-portals" aria-labelledby="arcane-forge-portals">
              <p className="arcane-forge-kicker">II. The Working Worlds</p>
              <h3 id="arcane-forge-portals">Explore the builds</h3>
              <div className="arcane-forge-links">
                <a href="https://pennysoffice.wildcarddev.com/" target="_blank" rel="noopener noreferrer">
                  <span className="arcane-forge-symbol" aria-hidden="true">♠</span>
                  <strong>Penny’s Garage</strong>
                  <span>Services, storefronts, and interactive merchandise.</span>
                  <span className="arcane-forge-link-arrow" aria-hidden="true">↗</span>
                </a>
                <a href="https://labs.wildcarddev.com/" target="_blank" rel="noopener noreferrer">
                  <span className="arcane-forge-symbol" aria-hidden="true">◇</span>
                  <strong>WildCard Labs</strong>
                  <span>Experiments and systems under construction.</span>
                  <span className="arcane-forge-link-arrow" aria-hidden="true">↗</span>
                </a>
                <a href="https://wildcard-showroom-enhanced-1500.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <span className="arcane-forge-symbol" aria-hidden="true">✦</span>
                  <strong>Web &amp; App Showroom</strong>
                  <span>Explore the Enhanced Build demonstration.</span>
                  <span className="arcane-forge-link-arrow" aria-hidden="true">↗</span>
                </a>
                <a href="mailto:matt@wildcarddev.com?subject=Arcane%20Engineering%20Inquiry">
                  <span className="arcane-forge-symbol" aria-hidden="true">✉</span>
                  <strong>Bring Us a Problem</strong>
                  <span>Tell us what you need built, connected, or automated.</span>
                  <span className="arcane-forge-link-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </section>
            <p className="arcane-forge-footer">
              Good people. Unusual problems. Creative solutions. <span aria-hidden="true">♠</span>
            </p>
          </div>
          )
        )}

        {activeChannel.id === 'penny' && (
          isHome ? (
          <div className="penny-bunker-feature">
            <p className="eyebrow">Penny // Discord</p>
            <a href="/bunker">
              ENTER THE DISCORD BUNKER →
            </a>
          </div>
          ) : (
          <div className="penny-throne">
            <figure className="penny-throne-art">
              <img
                src="/static/penny-throne-room.webp"
                alt="Penny Bella Morningstar with blonde hair and a flame-red streak, seated on her gothic spade throne with a black wolf and violet-lit computers."
                width="1536"
                height="730"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="penny-throne-intro">
              <p className="penny-throne-overline">♠ WildCard DEV // Chamber Four</p>
              <h2>Penny Bella Morningstar</h2>
              <p>
                Welcome to my throne room. This is where ideas get loud,
                builds go sideways, and the WildCard worlds come together.
              </p>
            </div>
            <nav className="penny-throne-destinations" aria-label="Penny’s destinations">
              <a className="penny-throne-link" href="/bunker">
                <span className="penny-throne-link-symbol" aria-hidden="true">♠</span>
                <strong>Discord Bunker</strong>
                <span>The community doorway</span>
                <span className="penny-throne-link-arrow" aria-hidden="true">→</span>
              </a>
              <a className="penny-throne-link" href="https://pennysoffice.wildcarddev.com/" target="_blank" rel="noopener noreferrer">
                <span className="penny-throne-link-symbol" aria-hidden="true">⚒</span>
                <strong>Penny’s Garage</strong>
                <span>Services and merchandise</span>
                <span className="penny-throne-link-arrow" aria-hidden="true">↗</span>
              </a>
              <a className="penny-throne-link" href={WILDCARD_PARTY_URL} target="_blank" rel="noopener noreferrer">
                <span className="penny-throne-link-symbol" aria-hidden="true">♥</span>
                <strong>WildCard Party</strong>
                <span>Community and messaging</span>
                <span className="penny-throne-link-arrow" aria-hidden="true">↗</span>
              </a>
              <a className="penny-throne-link" href="mailto:penny@wildcarddev.com">
                <span className="penny-throne-link-symbol" aria-hidden="true">✉</span>
                <strong>Contact Penny</strong>
                <span>Get in touch directly</span>
                <span className="penny-throne-link-arrow" aria-hidden="true">→</span>
              </a>
            </nav>
            <p className="penny-throne-footer">
              Some queens build empires. I prefer playgrounds. <span aria-hidden="true">♠</span>
            </p>
          </div>
          )
        )}

        {activeChannel.id === 'portfolio' && (
          <div className="grimoire-collections">
            {!isHome && (
              <header className="grimoire-hero">
                <div className="grimoire-hero-copy">
                  <p className="grimoire-overline">♠ WildCard DEV // The Living Archive</p>
                  <h2>The Grimoire</h2>
                  <p className="grimoire-hero-lead">
                    The living portfolio and archive of WildCard DEV.
                  </p>
                  <p className="grimoire-hero-description">
                    Active builds, restored concepts, and creative work.
                    Every page holds another story.
                  </p>
                  <nav className="grimoire-hero-actions" aria-label="Grimoire collections">
                    <a href="#grimoire-living-works">Explore the Living Works ↓</a>
                    <a href="#grimoire-resurrection">Enter the Archive ↓</a>
                  </nav>
                </div>
                <div className="grimoire-hero-art">
                  <img
                    src="/static/grimoire-keeper.webp"
                    alt="Penny, keeper of the Grimoire, with her spade-bound book in a candlelit gothic library"
                    width="850"
                    height="1062"
                    loading="lazy"
                    decoding="async"
                  />
                  <span aria-hidden="true" className="grimoire-hero-seal">♠</span>
                </div>
              </header>
            )}
            <section className="grimoire-collection" aria-labelledby="grimoire-living-works">
              <h3 id="grimoire-living-works">I. The Living Works</h3>
              <p className="grimoire-collection-intro">
                Real WildCard DEV sites, platforms, and development demonstrations.
              </p>
              <div className="grimoire-grid">
                {GRIMOIRE_PROJECTS.map((project) => (
                  <article className="grimoire-card" key={project.name}>
                    <p className="grimoire-card-status">{project.status}</p>
                    <h4>{project.name}</h4>
                    <p className="grimoire-card-description">{project.description}</p>
                    <ul className="grimoire-capabilities" aria-label="Demonstrated capabilities">
                      {project.capabilities.map((capability) => (
                        <li key={capability}>{capability}</li>
                      ))}
                    </ul>
                    <div className="grimoire-links">
                      {project.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="grimoire-collection" aria-labelledby="grimoire-resurrection">
              <h3 id="grimoire-resurrection">II. The Resurrection Chamber</h3>
              <p className="grimoire-collection-intro">
                Original WildCard Mark III source and historical experiments.
                Preserved as built, not presented as new working demos.
              </p>
              <article className="grimoire-mark3" aria-labelledby="grimoire-mark3-title">
                <div className="grimoire-mark3-copy">
                  <p className="grimoire-card-status">Original archive · Unmodified source</p>
                  <h4 id="grimoire-mark3-title">WildCard Mark III</h4>
                  <p>
                    The early WildCard DEV project built during incarceration,
                    preserved in its original HTML, CSS, and supporting files.
                    This is a record of where the work began, not a modern remake.
                  </p>
                  <p className="grimoire-mark3-note">
                    Historical source view. This archive is not currently a hosted interactive demo.
                  </p>
                  <div className="grimoire-links">
                    <a href="https://github.com/mtobabendev/WildCard-Mark-III/blob/main/Index.html" target="_blank" rel="noopener noreferrer">
                      View the original Mark III HTML ↗
                    </a>
                    <a href="https://github.com/mtobabendev/WildCard-Mark-III" target="_blank" rel="noopener noreferrer">
                      Browse the preserved repository ↗
                    </a>
                  </div>
                </div>
                <div className="grimoire-mark3-emblem" aria-hidden="true">
                  <span>♠</span><span>III</span>
                  <small>Original Edition</small>
                </div>
              </article>
              <div className="grimoire-grid">
                {GRIMOIRE_ARCHIVE.map((experiment) => (
                  <article className="grimoire-card" key={experiment.name}>
                    <p className="grimoire-card-status">Archive only · Restoration candidate</p>
                    <h4>{experiment.name}</h4>
                    <p className="grimoire-card-description">{experiment.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grimoire-collection" aria-labelledby="grimoire-creative">
              <h3 id="grimoire-creative">III. The Creative Vault</h3>
              <div className="grimoire-feature grimoire-card">
                <p className="grimoire-card-status">Creative showcase</p>
                <h4>Kandy’s Soundtrack</h4>
                <p className="grimoire-card-description">
                  Original songs and cover art by Kopacetic Kandle.
                </p>
                <a
                  href={KANDY_SUNO_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    trackAnalyticsEvent(
                      'kandy_suno_playlist_click',
                      {
                        source: 'grimoire',
                        link_url: KANDY_SUNO_URL,
                      },
                    );
                  }}
                >
                  Explore the playlist →
                </a>
              </div>
            </section>
          </div>
        )}

        {activeChannel.id === 'interface' && !isHome && (
          <div className="veil-realm">
            <figure className="veil-portal-art">
              <img
                src="/static/veil-looking-glass.webp"
                width="1280"
                height="1024"
                alt="Penny Bella Morningstar, blonde with a flame-red streak, reaches through a luminous violet looking glass framed by gothic black architecture into a world of glowing digital portals."
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="veil-intro">
              <p className="veil-overline">♠ WildCard DEV // Chamber Six</p>
              <h2>The Veil</h2>
              <p className="veil-subtitle">Through the Looking Glass</p>
              <p>
                Every screen is a doorway. Penny invites you into interfaces that
                feel alive, without losing sight of the person on the other side.
                Distinctive design, practical interactions, and a little digital magic.
              </p>
            </div>
            <section className="veil-collection" aria-labelledby="veil-capabilities">
              <p className="veil-kicker">I. Beyond the Glass</p>
              <h3 id="veil-capabilities">Experiences worth exploring</h3>
              <div className="veil-grid">
                <article className="veil-card">
                  <span className="veil-symbol" aria-hidden="true">◈</span>
                  <h4>Responsive Interfaces</h4>
                  <p>Layouts that work across desktop and mobile without sacrificing character.</p>
                </article>
                <article className="veil-card">
                  <span className="veil-symbol" aria-hidden="true">✧</span>
                  <h4>Interactive Visuals</h4>
                  <p>Hands-on navigation, rotating merchandise, and purposeful visual feedback.</p>
                </article>
                <article className="veil-card">
                  <span className="veil-symbol" aria-hidden="true">⌁</span>
                  <h4>Motion With Purpose</h4>
                  <p>Transitions that guide attention, with reduced-motion behavior respected.</p>
                </article>
                <article className="veil-card">
                  <span className="veil-symbol" aria-hidden="true">♠</span>
                  <h4>Usable by Design</h4>
                  <p>Readable content, accessible controls, and clear paths to the next action.</p>
                </article>
              </div>
            </section>
            <section className="veil-collection veil-doorways" aria-labelledby="veil-doorways">
              <p className="veil-kicker">II. Doorways</p>
              <h3 id="veil-doorways">Step through</h3>
              <div className="veil-links">
                <div className="veil-book">
                  <span className="veil-symbol" aria-hidden="true">♠</span>
                  <strong>Penny’s Little Black Book</strong>
                  <p>Already woven into this site. Tap the small spade launcher at the right edge to explore the real interactive book.</p>
                  <small>One original. No duplicate or redirected copy.</small>
                </div>
                <a href="https://wildcard-showroom-enhanced-1500.vercel.app/" target="_blank" rel="noopener noreferrer">
                  <span className="veil-symbol" aria-hidden="true">◇</span>
                  <strong>Enhanced Build Demo</strong>
                  <span>Explore the Web &amp; App Showroom.</span>
                  <span className="veil-link-arrow" aria-hidden="true">↗</span>
                </a>
                <a href="https://wildcard-showroom-enhanced-1500.vercel.app/launch/" target="_blank" rel="noopener noreferrer">
                  <span className="veil-symbol" aria-hidden="true">✦</span>
                  <strong>Launch Build Demo</strong>
                  <span>See the simpler showroom experience.</span>
                  <span className="veil-link-arrow" aria-hidden="true">↗</span>
                </a>
              </div>
            </section>
            <p className="veil-footer">The magic belongs in the experience, not in the maintenance. <span aria-hidden="true">♠</span></p>
          </div>
        )}

        {activeChannel.id === 'automation' && (
          isHome ? (
          <div className="wildcard-social-feature">
            <p className="eyebrow">WildCard Social // Live</p>
            <h3>Penny took the keys.</h3>
            <p>
              An ad-free social network with live feeds, direct messaging,
              rooms, and Penny’s AI presence woven into the experience.
            </p>
            <a
              href={WILDCARD_PARTY_URL}
              onClick={() => {
                trackAnalyticsEvent(
                  'wildcard_party_click',
                  {
                    source: 'hells_little_helpers',
                    link_url: WILDCARD_PARTY_URL,
                  },
                );
              }}
            >
              Enter WildCard Party →
            </a>
          </div>
          ) : (
          <div className="imp-workshop">
            <figure className="imp-workshop-art">
              <img
                src="/static/imp-workshop.webp"
                width="1672"
                height="941"
                alt="Penny in her black-and-pink French maid outfit, blonde hair with a flame-red streak, surrounded by dark-haired, brunette and redheaded adult female Coding Imps at glowing computers."
                loading="lazy"
                decoding="async"
              />
            </figure>
            <header className="imp-workshop-intro">
              <p className="imp-workshop-overline">♠ WildCard DEV // Chamber Five</p>
              <h2>Hell’s Little Helpers</h2>
              <p className="imp-workshop-subtitle">The Imp Workshop</p>
              <p>
                Clean code. Clever automation. Less repetitive work.
                Penny oversees the workshop where unusual ideas become
                focused tools that actually solve problems.
              </p>
            </header>
            <section className="imp-workshop-services" aria-labelledby="imp-workshop-capabilities">
              <h3 id="imp-workshop-capabilities">What we build</h3>
              <p className="imp-workshop-section-copy">
                Practical solutions for the work that should not consume your day.
              </p>
              <div className="imp-workshop-grid">
                <article className="imp-workshop-card">
                  <span className="imp-workshop-symbol" aria-hidden="true">⚙</span>
                  <h4>Workflow Automation</h4>
                  <p>Streamlining routine tasks and administrative steps.</p>
                </article>
                <article className="imp-workshop-card">
                  <span className="imp-workshop-symbol" aria-hidden="true">⌘</span>
                  <h4>System Integrations</h4>
                  <p>Connecting applications, data sources, and existing business processes.</p>
                </article>
                <article className="imp-workshop-card">
                  <span className="imp-workshop-symbol" aria-hidden="true">✧</span>
                  <h4>AI-Assisted Processes</h4>
                  <p>Support for drafting, organizing, analyzing, and routing work.</p>
                </article>
                <article className="imp-workshop-card">
                  <span className="imp-workshop-symbol" aria-hidden="true">♠</span>
                  <h4>Custom Utilities</h4>
                  <p>Focused tools for specific operational problems.</p>
                </article>
              </div>
            </section>
            <section className="imp-workshop-doors" aria-labelledby="imp-workshop-next">
              <h3 id="imp-workshop-next">Open a workshop door</h3>
              <p className="imp-workshop-section-copy">
                Explore a live WildCard project or tell Penny what needs building.
              </p>
              <div className="imp-workshop-links">
                <a href={WILDCARD_PARTY_URL} onClick={() => {
                  trackAnalyticsEvent('wildcard_party_click', {
                    source: 'hells_little_helpers',
                    link_url: WILDCARD_PARTY_URL,
                  });
                }}>
                  <span aria-hidden="true">♥</span>
                  <strong>WildCard Party</strong>
                  <small>Community, messages, and works in progress. Calling is still in development.</small>
                  <span className="imp-workshop-link-arrow" aria-hidden="true">↗</span>
                </a>
                <a href="mailto:penny@wildcarddev.com?subject=WildCard%20DEV%20Automation%20Inquiry">
                  <span aria-hidden="true">✉</span>
                  <strong>Ask Penny</strong>
                  <small>Bring us an automation or custom-systems problem.</small>
                  <span className="imp-workshop-link-arrow" aria-hidden="true">→</span>
                </a>
              </div>
            </section>
            <p className="imp-workshop-footer">Good people. Unusual problems. Creative solutions. <span aria-hidden="true">♠</span></p>
          </div>
          )
        )}
      </section>

      <section
        className={`card-stage card-stage--penny${isHome ? ' is-active' : ''}`}
        aria-hidden={!isHome}
        inert={!isHome}
      >
        <article className="identity-card identity-card--penny">
          {!isWatch && (
            <div className="penny-video-static">
              <div className="penny-video-shell">
                <PennyLoopVideo
                  active={pennyVideoActive}
                />
              </div>
            </div>
          )}

          <div className="penny-copy">
            <p className="eyebrow">Digital Avatar of Lilith</p>
            <h2>Penny</h2>
            <p>
              Concierge guidance, contact routing, and controlled chaos.
            </p>

            <div className="penny-destination-pills">
              <button
                className="penny-destination-pill penny-destination-pill--office"
                type="button"
                onClick={() => setGateOpen(true)}
              >
                PENNY’S DISCORD
              </button>

              <a
                className="penny-destination-pill penny-destination-pill--garage"
                href="https://pennysoffice.wildcarddev.com/"
                target="_blank"
                rel="noreferrer"
              >
                PENNY’S GARAGE
              </a>
            </div>

            <div
              className="penny-link-deck mini-spinner mini-spinner--penny"
              role="group"
              onPointerDown={startMiniSpinnerDrag}
            onPointerMove={moveMiniSpinnerDrag}
            onPointerUp={endMiniSpinnerDrag}
            onPointerCancel={endMiniSpinnerDrag}
            onClickCapture={suppressMiniSpinnerDragClick}
            onDragStart={(event) => event.preventDefault()}
            onFocusCapture={focusMiniSpinnerLink}
              onBlurCapture={releaseMiniSpinnerLink}
              aria-label="Penny links"
            >

              <div className="mini-spinner-track">              <a
                className="penny-link-card penny-link-card--party penny-party-link"
                href={WILDCARD_PARTY_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="WildCard Party"
              >
                <span
                  className="penny-link-card-icon penny-link-card-icon--party"
                  aria-hidden="true"
                >
                  <img
                    className="penny-party-spade"
                    src={pennySpadeLogo}
                    alt=""
                  />
                  <FacebookIcon />
                </span>
                <span className="penny-link-card-label">
                  PARTY
                </span>
              </a>

              <a
                className="penny-link-card penny-link-card--x"
                href={WILDCARD_X_URL}
                target="_blank"
                rel="noreferrer"
                aria-label="WildCard DEV on X"
              >
                <span
                  className="penny-link-card-icon"
                  aria-hidden="true"
                >
                  <XIcon />
                </span>
                <span className="penny-link-card-label">
                  X
                </span>
              </a>
              </div>
              <div
                className="penny-link-hub"
                aria-hidden="true"
              >
                <img
                  src={pennySpadeLogo}
                  alt=""
                />
              </div>

            </div>
          </div>
        </article>
      </section>

      <PennyContactAssist
        active={assistActive}
        message={assistMessage}
        fallbackType={assistFallbackRef.current}
        videoRef={assistVideoRef}
        onComplete={completeContactAssist}
        onClose={cancelContactAssist}
      />

      <CombinationGate
        open={gateOpen}
        onClose={closeGate}
      />
    </main>
  );
}