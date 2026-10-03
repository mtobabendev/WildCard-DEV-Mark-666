import { useEffect, useRef, useState } from 'react';
import './bunker.css';
import bunkerVideo from '../assets/LilithPortal-bunker-silent-optimized.webm';
import bunkerFallback from '../assets/LilithPortal.webp';
import pennySpadeLogo from '../assets/wildcard-logo-penny.png';

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

export default function Bunker() {
  const videoRef = useRef(null);
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const watchWidth = useMediaQuery('(max-width: 240px)');
  const animateWallpaper = !reducedMotion && !watchWidth;

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !animateWallpaper) {
      return undefined;
    }

    const syncPlayback = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      const playAttempt = video.play();

      if (playAttempt?.catch) {
        playAttempt.catch(() => {});
      }
    };

    syncPlayback();

    document.addEventListener(
      'visibilitychange',
      syncPlayback,
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        syncPlayback,
      );
      video.pause();
    };
  }, [animateWallpaper]);

  return (
    <main
      className="bunker-page"
      style={{
        '--bunker-fallback':
          `url("${bunkerFallback}")`,
      }}
    >
      {animateWallpaper && (
        <video
          ref={videoRef}
          className="bunker-wallpaper"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={bunkerFallback}
          aria-hidden="true"
        >
          <source
            src={bunkerVideo}
            type="video/webm"
          />
        </video>
      )}

      <div
        className="bunker-scrim"
        aria-hidden="true"
      />

      <section
        className="bunker-panel"
        aria-labelledby="bunker-title"
      >
        <img
          className="bunker-spade"
          src={pennySpadeLogo}
          alt=""
          aria-hidden="true"
        />

        <h1 id="bunker-title">
          DISCORD SUMMONING IN PROGRESS
        </h1>

        <p>
          PENNY IS STILL WIRING THE BUNKER.
        </p>

        <a
          className="bunker-return"
          href="/"
        >
          RETURN TO WILDCARD DEV
        </a>
      </section>
    </main>
  );
}
