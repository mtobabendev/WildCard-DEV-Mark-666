import { useEffect, useRef, useState } from 'react';

const MEMORY_PHOTO = '/static/AshleyPenthouseMemory.webp';
const FLIP_INTERVAL_MS = 30000;

export default function AshleyPanel({ active, links }) {
  const [flipped, setFlipped] = useState(false);
  const [photoReady, setPhotoReady] = useState(false);
  const videoRef = useRef(null);
  const showPhoto = flipped && photoReady;

  // A manual flip starts a fresh 30-second interval.
  useEffect(() => {
    if (!active || !photoReady) return;
    const timer = window.setTimeout(() => setFlipped(value => !value), FLIP_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [active, photoReady, flipped]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active || showPhoto) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [active, showPhoto]);

  return (
    <article className="identity-card identity-card--ashley" aria-labelledby="ashley-panel-title">
      <style>{`
        .ashley-memory-flip {
          position: relative;
          display: block;
          padding: 0;
          cursor: pointer;
          appearance: none;
          perspective: 900px;
        }
        .ashley-memory-flip:focus-visible {
          outline: 2px solid #ffe0eb;
          outline-offset: 3px;
        }
        .ashley-memory-flip__inner {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          transition: transform 600ms cubic-bezier(.2,.7,.25,1);
        }
        .ashley-memory-flip[aria-pressed="true"] .ashley-memory-flip__inner {
          transform: rotateY(180deg);
        }
        .ashley-memory-flip__face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          pointer-events: none;
          overflow: hidden;
          border-radius: inherit;
        }
        .ashley-memory-flip__back {
          transform: rotateY(180deg);
          background: #100917;
        }
        .ashley-memory-flip__back img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        @media (prefers-reduced-motion: reduce) {
          .ashley-memory-flip__inner { transition: none; }
        }
      `}</style>
      <div className="ashley-video-pair">
        <button
          type="button"
          className="ashley-video-shell ashley-memory-flip"
          aria-label={showPhoto ? "Show Ashley’s introduction video" : "Show Ashley’s memory photograph"}
          aria-pressed={showPhoto}
          onClick={() => { if (active && photoReady) setFlipped(value => !value); }}
        >
          <span className="ashley-memory-flip__inner">
            <span className="ashley-memory-flip__face" aria-hidden={showPhoto}>
              {active && (
                <video
                  ref={videoRef}
                  className="ashley-video"
                  src="/static/AshleyIntroLoopmp4.webm"
                  autoPlay={!showPhoto}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="Ashley’s introduction"
                />
              )}
            </span>
            <span className="ashley-memory-flip__face ashley-memory-flip__back" aria-hidden={!showPhoto}>
              {active && (
                <img
                  src={MEMORY_PHOTO}
                  alt="Ashley sharing a celebratory evening with friends"
                  decoding="async"
                  onLoad={() => setPhotoReady(true)}
                  onError={() => { setPhotoReady(false); setFlipped(false); }}
                />
              )}
            </span>
          </span>
        </button>
        <a
          className="ashley-video-shell ashley-video-portal"
          href="/ashley/what-if"
          aria-label="Open Ashley's What If Time Capsule. Combination required."
        >
          {active && (
            <video
              className="ashley-video"
              src="/static/AshleyHotLoop.webm"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
            />
          )}
          <span className="ashley-video-portal-label" aria-hidden="true">
            <span className="ashley-video-lock">🔒</span>
            WHAT IF?
          </span>
        </a>
      </div>
      <div className="ashley-copy">
        <p className="eyebrow">In loving memory</p>
        <h2 id="ashley-panel-title">Ashley</h2>
        <p>Forever part of our story.</p>
        {links}
      </div>
    </article>
  );
}
