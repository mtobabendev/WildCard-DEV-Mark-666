import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import LittleBlackBook from './LittleBlackBook.jsx';
import pennySaysHelloWebm from '../assets/PennySaysHello.webm';
import pennySaysHelloMp4 from '../assets/PennySaysHello.mp4';

function SiteEntry() {
  const [introFinished, setIntroFinished] = useState(false);
  const [AppComponent, setAppComponent] = useState(null);
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
            <source src={pennySaysHelloMp4} type="video/mp4" />
            </video>
          </div>
        )}
      </div>
      <LittleBlackBook />
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteEntry />
  </StrictMode>,
);
