import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import pennySaysHelloWebm from '../assets/PennySaysHello.webm';

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
  const [introFinished, setIntroFinished] = useState(false);
  const [AppComponent, setAppComponent] = useState(null);
  const [LittleBlackBookComponent, setLittleBlackBookComponent] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const playAttempt = video.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {});
    }

    let cancelled = false;

    import('./App.jsx')
      .then(({ default: LoadedApp }) => {
        if (!cancelled) {
          setAppComponent(() => LoadedApp);
        }
      })
      .catch(() => {});

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
    setIntroFinished(true);
  };

  return (
    <>
      <div style={{ display: 'contents' }}>
        {introFinished && AppComponent ? (
          <AppComponent />
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
            autoPlay
            muted
            playsInline
            preload="auto"
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
            }}
          >
            <source src={pennySaysHelloWebm} type="video/webm" />
            </video>
          </div>
        )}
      </div>
      {introFinished && LittleBlackBookComponent ? (
        <LittleBlackBookComponent />
      ) : null}
    </>
  );
}

const root = createRoot(document.getElementById('root'));
const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';

if (normalizedPath === '/bunker') {
  import('./Bunker.jsx')
    .then(({ default: Bunker }) => {
      root.render(
        <StrictMode>
          <Bunker />
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
