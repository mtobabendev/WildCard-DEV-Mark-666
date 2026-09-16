import { StrictMode, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import pennySaysHello from '../assets/PennySaysHello.mp4';
import './styles.css';

function SiteEntry() {
  const [introFinished, setIntroFinished] = useState(false);
  const videoRef = useRef(null);

  if (introFinished) return <App />;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <video
        ref={videoRef}
        src={pennySaysHello}
        autoPlay
        playsInline
        controls
        preload="auto"
        onEnded={() => setIntroFinished(true)}
        onError={() => setIntroFinished(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
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
