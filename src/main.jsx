import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import MessengerLauncher from './components/MessengerLauncher.jsx';
import pennySaysHelloWebm from '../assets/PennyWildCardIntro-new-mobile-optimized.webm';

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
    () => window.location.pathname.replace(/\/+$/, '') === '/grimoire',
  );
  const [AppComponent, setAppComponent] = useState(null);
  const [LittleBlackBookComponent, setLittleBlackBookComponent] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    import('./App.jsx')
      .then(({ default: LoadedApp }) => {
        if (!cancelled) {
          setAppComponent(() => LoadedApp);
        }
      })
      .catch(() => {});

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

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!introFinished) return undefined;

    let cancelled = false;

    import('./LittleBlackBook.jsx')
      .then(({ default: LoadedLittleBlackBook }) => {
        if (!cancelled) {
          setLittleBlackBookComponent(() => LoadedLittleBlackBook);
        }
      })
      .catch(() => {});

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadGoogleAnalytics);
    } else {
      window.setTimeout(loadGoogleAnalytics, 3000);
    }

    return () => {
      cancelled = true;
    };
  }, [introFinished]);

  const finishIntro = () => {
    videoRef.current?.pause();
    setIntroFinished(true);
  };

  return (
    <>
      <div style={{ display: 'contents' }}>
        {introFinished ? (
          AppComponent ? <AppComponent /> : null
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
            preload="auto"
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
            onError={finishIntro}
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
          </div>
        )}
      </div>
      {introFinished && <MessengerLauncher />}
      {introFinished && LittleBlackBookComponent ? (
        <LittleBlackBookComponent />
      ) : null}
    </>
  );
}

const root = createRoot(document.getElementById('root'));
const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

if (normalizedPath === '/jenn/art') {
  import('./JennArt.jsx')
    .then(({ default: JennArt }) => {
      root.render(
        <StrictMode>
          <JennArt />
          <MessengerLauncher />
        </StrictMode>,
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
        </StrictMode>,
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
          <PennyAfterHours />
          <MessengerLauncher />
        </StrictMode>,
      );
    })
    .catch(() => {
      window.location.replace('/');
    });
} else if (normalizedPath === '/bunker') {
  import('./Bunker.jsx')
    .then(({ default: Bunker }) => {
      root.render(
        <StrictMode>
          <Bunker />
          <MessengerLauncher />
        </StrictMode>,
      );

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadGoogleAnalytics);
      } else {
        window.setTimeout(loadGoogleAnalytics, 3000);
      }
    })
    .catch(() => {
      window.location.replace('/');
    });
} else {
  root.render(
    <StrictMode>
      <SiteEntry />
    </StrictMode>,
  );
}
