import { initializePerformance } from './components/performance-profile.js';
import './performance.css';
import './little-black-book.css';
import { shouldSkipIntro, rememberIntro, deferAnalytics } from './components/startup-policy.js';
import PennyContactRouter from './components/PennyContactRouter.jsx';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import MessengerLauncher from './components/MessengerLauncher.jsx';
import AfterHoursGate from './components/AfterHoursGate.jsx';
import AskPenny from './components/AskPenny.jsx';
import pennySaysHelloWebm from '../assets/PennyWildCardIntro-new-mobile-optimized.webm';

const performanceProfile = initializePerformance();

const GOOGLE_ANALYTICS_SRC =
  'https://www.googletagmanager.com/gtag/js?id=G-SQ55HQVQXX';
let googleAnalyticsRequested = false;

function loadGoogleAnalytics() {
  if (
    googleAnalyticsRequested
    || document.querySelector(`script[src="${GOOGLE_ANALYTICS_SRC}"]`)
  ) {
    googleAnalyticsRequested = true;
    return;
  }

  googleAnalyticsRequested = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = GOOGLE_ANALYTICS_SRC;
  document.head.append(script);
}

function SiteEntry() {
  const [introFinished, setIntroFinished] = useState(
    () => shouldSkipIntro(performanceProfile, window),
  );
  const [AppComponent, setAppComponent] = useState(null);
  const [appFailed, setAppFailed] = useState(false);
  const [LittleBlackBookComponent, setLittleBlackBookComponent] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookFailed, setBookFailed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    import('./App.jsx')
      .then(({ default: LoadedApp }) => {
        if (!cancelled) {
          setAppComponent(() => LoadedApp);
        }
      })
      .catch(() => { if (!cancelled) setAppFailed(true); });

    const video = videoRef.current;

    if (!video) {
      if (!cancelled) {
        setIntroFinished(true);
      }
    } else if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
    ) {
      if (!cancelled) {
        setIntroFinished(true);
      }
    } else {
      video.muted = true;

      try {
        const playAttempt = video.play();

        if (playAttempt?.catch) {
          playAttempt.catch(() => {
            if (!cancelled) {
              setIntroFinished(true);
            }
          });
        }
      } catch {
        if (!cancelled) {
          setIntroFinished(true);
        }
      }
    }

    let stallTimer;
    const clearStall = () => window.clearTimeout(stallTimer);
    const armStall = () => { clearStall(); stallTimer = window.setTimeout(() => setIntroFinished(true), 8000); };
    if (video) {
      armStall();
      video.addEventListener('playing', clearStall);
      video.addEventListener('waiting', armStall);
    }
    return () => {
      cancelled = true;
      clearStall();
      video?.removeEventListener('playing', clearStall);
      video?.removeEventListener('waiting', armStall);
    };
  }, []);

  useEffect(() => {
    if (!introFinished || !AppComponent) return undefined;
    return deferAnalytics(window, loadGoogleAnalytics);
  }, [introFinished, AppComponent]);

  const openBook = () => {
    if (bookLoading) return;
    setBookLoading(true);
    setBookFailed(false);
    import('./LittleBlackBook.jsx')
      .then(({ default: LoadedLittleBlackBook }) => setLittleBlackBookComponent(() => LoadedLittleBlackBook))
      .catch(() => setBookFailed(true))
      .finally(() => setBookLoading(false));
  };

  const finishIntro = () => {
    videoRef.current?.pause();
    rememberIntro(window);
    setIntroFinished(true);
  };

  return (
    <>
      <div style={{ display: 'contents' }}>
        {introFinished ? (
          AppComponent ? <AppComponent /> : appFailed ? (
            <main className="startup-recovery" role="alert">WildCard DEV could not finish loading. <button onClick={() => window.location.reload()}>Retry</button></main>
          ) : <div className="startup-recovery" role="status">Loading WildCard DEV...</div>
        ) : (
          <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100dvh',
            minHeight: '100vh',
            overflow: 'hidden',
            background: '#000',
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            role="button"
            tabIndex={0}
            aria-label="Penny introduction video. Tap, click, Enter, or Space to skip."
            title="Tap or click to skip Penny's intro"
            onClick={finishIntro}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                finishIntro();
              }
            }}
            onEnded={finishIntro}
            onError={() => setIntroFinished(true)}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              maxWidth: '100vw',
              maxHeight: '100dvh',
              objectFit: 'contain',
              objectPosition: 'center',
              background: '#000',
              cursor: 'pointer',
            }}
          >
            {!window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
              <source src={pennySaysHelloWebm} type="video/webm" />
            )}
            </video>
            <button className="startup-skip" type="button" onClick={finishIntro}>Skip intro</button>
          </div>
        )}
      </div>
      {introFinished && <MessengerLauncher />}
      {introFinished && <AskPenny />}
      {introFinished && (LittleBlackBookComponent ? (
        <LittleBlackBookComponent initiallyOpen />
      ) : (
        <div className="lbb-root">
          <button className="lbb-edge-tab" type="button" aria-expanded={false} aria-busy={bookLoading}
            aria-label={bookFailed ? 'Retry opening Penny’s Little Black Book' : 'Open Penny’s Little Black Book'} onClick={openBook}>
            <span className="lbb-edge-glyph" aria-hidden="true">♠</span>
            <span className="lbb-edge-label">{bookLoading ? 'WAIT' : bookFailed ? 'RETRY' : 'BOOK'}</span>
          </button>
        </div>
      ))}
    </>
  );
}

const root = createRoot(document.getElementById('root'));
const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

const showcaseRoutes = { '/creators': 'directory', '/kandy/showcase': 'kandy', '/lucy/showcase': 'lucy', '/erica/showcase': 'erica', '/ashley/memorial': 'ashley' };
if (Object.hasOwn(showcaseRoutes, normalizedPath)) {
  import('./CreatorShowcase.jsx')
    .then(({ default: CreatorShowcase }) => {
      root.render(<StrictMode><CreatorShowcase profileId={showcaseRoutes[normalizedPath]} /><MessengerLauncher /><PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>);
    })
    .catch(() => { window.location.replace('/'); });
} else if (normalizedPath === '/jenn/art') {
  import('./JennArt.jsx')
    .then(({ default: JennArt }) => {
      root.render(
        <StrictMode>
          <JennArt />
          <MessengerLauncher />
        <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>,
      );
    })
    .catch(() => { window.location.replace('/'); });
} else if (normalizedPath === '/ashley/what-if') {
  import('./AshleyTimeCapsule.jsx')
    .then(({ default: AshleyTimeCapsule }) => {
      root.render(
        <StrictMode>
          <AshleyTimeCapsule />
          <MessengerLauncher />
        <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>,
      );
    })
    .catch(() => {
      window.location.replace('/');
    });
} else if (normalizedPath === '/penny/after-hours') {
  import('./PennyAfterHours.jsx')
    .then(({ default: PennyAfterHours }) => {
      root.render(
        <StrictMode>
          <AfterHoursGate area="penny"><PennyAfterHours /></AfterHoursGate>
          <MessengerLauncher />
        <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>,
      );
    })
    .catch(() => {
      window.location.replace('/');
    });
} else if (normalizedPath === '/kandy/after-hours' || normalizedPath === '/ashley/after-hours') {
  const area = normalizedPath.startsWith('/kandy/') ? 'kandy' : 'ashley';
  import('./AfterHoursPrivateArea.jsx')
    .then(({ default: AfterHoursPrivateArea }) => {
      root.render(
        <StrictMode>
          <AfterHoursGate area={area}><AfterHoursPrivateArea area={area} /></AfterHoursGate>
          <MessengerLauncher />
        </StrictMode>,
      );
    })
    .catch(() => { window.location.replace('/'); });
} else if (normalizedPath === '/bunker') {
  import('./Bunker.jsx')
    .then(({ default: Bunker }) => {
      root.render(
        <StrictMode>
          <Bunker />
          <AskPenny />
          <MessengerLauncher />
        <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>,
      );

      deferAnalytics(window, loadGoogleAnalytics);
    })
    .catch(() => {
      window.location.replace('/');
    });
} else {
  root.render(
    <StrictMode>
      <SiteEntry />
    <PennyContactRouter videoSource="/static/PennyContactAssistVideo.webm" /></StrictMode>,
  );
}
