import { useEffect, useRef, useState } from 'react';
import ViewportVideo from './ViewportVideo.jsx';

const TOON = '/static/JennToon.webm';
const TOON_POSTER = '/static/JennToon.webp';

export default function JennPanel({ videoActive, links }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoActive) setPlaying(false);
  }, [videoActive]);

  useEffect(() => {
    const video = playerRef.current;
    if (!playing || !video) return undefined;
    const pauseWhenHidden = () => { if (document.hidden) video.pause(); };
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting && !document.fullscreenElement && !video.webkitDisplayingFullscreen) video.pause();
      }, { threshold: 0 })
      : null;
    observer?.observe(video);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      video.pause();
    };
  }, [playing, videoActive]);

  return (
    <article className="identity-card identity-card--jenn" aria-labelledby="jenn-panel-title">
      <style>{`
        .identity-card--jenn .jenn-panel-copy {
          min-width: 0;
          display: grid;
          align-content: start;
          justify-items: center;
          gap: .35rem;
        }
        .identity-card--jenn .jenn-panel-copy > * { grid-column: 1; min-width: 0; }
        .identity-card--jenn .jenn-toon {
          width: 100%;
          max-width: 11rem;
          margin: .1rem auto 0;
          display: grid;
          gap: .2rem;
          justify-items: center;
        }
        .identity-card--jenn .jenn-toon-frame {
          display: block;
          position: relative;
          box-sizing: border-box;
          width: 100%;
          height: clamp(6.5rem, 18vh, 10rem);
          padding: 0;
          overflow: hidden;
          border: 1px solid rgba(255,91,214,.55);
          border-radius: .8rem;
          background: #0b0715;
          color: #fff;
        }
        .identity-card--jenn button.jenn-toon-frame { cursor: pointer; }
        .identity-card--jenn .jenn-toon-frame:focus-visible {
          outline: 2px solid #ffb5e8;
          outline-offset: 3px;
        }
        .identity-card--jenn .jenn-toon-frame img,
        .identity-card--jenn .jenn-toon-frame video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 0;
          margin: 0;
        }
        .identity-card--jenn .jenn-toon-play {
          position: absolute;
          right: .35rem;
          bottom: .35rem;
          display: grid;
          place-items: center;
          width: 1.8rem;
          height: 1.8rem;
          border: 1px solid #ffb5e8;
          border-radius: 50%;
          background: rgba(12,7,25,.8);
          font-size: .8rem;
          pointer-events: none;
        }
        .identity-card--jenn .jenn-toon-credit {
          margin: 0;
          font-size: .68rem;
          line-height: 1.3;
          color: inherit;
        }
        .identity-card--jenn .jenn-toon-reset {
          grid-column: 1;
          color: inherit;
          background: transparent;
          border: 0;
          padding: .3rem;
          text-decoration: underline;
          font-size: .7rem;
          cursor: pointer;
        }
        @media (max-width: 600px) {
          .identity-card--jenn > .jenn-video-shell {
            grid-column: 1;
            grid-row: 1;
            align-self: center;
          }
          .identity-card--jenn > .jenn-panel-copy {
            grid-column: 2;
            grid-row: 1;
          }
        }
      `}</style>
      <div className="jenn-video-shell">
        {videoActive && (
          <ViewportVideo budgeted
            src="/static/JennIntro.webm"
            loop
            aria-label="Jenn’s introduction"
          />
        )}
      </div>
      <div className="jenn-panel-copy">
        <h2 id="jenn-panel-title">Jenn</h2>
        <a className="jenn-company-email" href="mailto:Jenn@WildCardDEV.com"
          style={{ color: 'inherit', fontSize: '.8rem', overflowWrap: 'anywhere' }}>Jenn@WildCardDEV.com</a>
        <div className="jenn-toon">
          {playing && videoActive ? (
            <>
              <div className="jenn-toon-frame">
                <video ref={playerRef} src={TOON} poster={TOON_POSTER}
                  autoPlay muted loop playsInline controls preload="none"
                  aria-label="Jenn’s Toon, created by Jenn"
                  onError={() => { setFailed(true); setPlaying(false); }} />
              </div>
              <button type="button" className="jenn-toon-reset"
                onClick={() => setPlaying(false)}>Show portrait</button>
            </>
          ) : (
            <button type="button" className="jenn-toon-frame"
              aria-label="Play Jenn’s Toon, created by Jenn"
              onClick={() => { setFailed(false); setPlaying(true); }}>
              <img src={TOON_POSTER} alt="Jenn’s cyber-goth avatar" loading="lazy" decoding="async" />
              <span className="jenn-toon-play" aria-hidden="true">▶</span>
            </button>
          )}
          <small className="jenn-toon-credit">Jenn’s Toon · Created by Jenn</small>
          {failed && <small role="status">Animation unavailable. Tap to retry.</small>}
        </div>
        {links}
      </div>
    </article>
  );
}
