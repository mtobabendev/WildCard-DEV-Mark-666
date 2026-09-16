import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import pennySaysHello from '../assets/PennySaysHello.mp4';
import './styles.css';

function SiteEntry() {
  const [introFinished, setIntroFinished] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playAttempt = video.play();
    if (playAttempt?.catch) playAttempt.catch(() => {});
  }, []);

  if (introFinished) return <App />;

  return (
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
        src={pennySaysHello}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => setIntroFinished(true)}
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
        }}
      />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteEntry />
  </StrictMode>,
);
