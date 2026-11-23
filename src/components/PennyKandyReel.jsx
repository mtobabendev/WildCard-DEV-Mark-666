import { useEffect, useRef, useState } from 'react';
import './PennyKandyReel.css';

const SLIDES = [
  { src: '/static/penny-kandy-reel-hero.webp', alt: 'Penny and Kandy together in the neon-lit After Hours lounge' },
  { src: '/static/penny-kandy-reel-inset.webp', alt: 'Penny and Kandy in the inset portrait from the After Hours artwork' },
];
const FRAME_MS = 4500;

export default function PennyKandyReel() {
  const dialogRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open || paused || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % SLIDES.length);
    }, FRAME_MS);
    return () => window.clearInterval(timer);
  }, [open, paused, reducedMotion, index]);

  const openReel = () => {
    setIndex(0);
    setPaused(false);
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const navigate = offset => setIndex(current => (current + offset + SLIDES.length) % SLIDES.length);

  return (
    <div className="penny-kandy-reel">
      <button type="button" className="penny-kandy-reel__teaser" onClick={openReel}
        aria-label="Open Penny and Kandy After Hours reel slideshow">
        <img src="/static/penny-kandy-reel-teaser.webp" width="640" height="800"
          alt="Penny and Kandy After Hours reel artwork, with neon-pink frame and Tap to open invitation"
          loading="lazy" decoding="async" />
      </button>
      <dialog ref={dialogRef} className="penny-kandy-reel__dialog"
        aria-label="Penny and Kandy After Hours reel"
        onClose={() => setOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }}
        onKeyDown={event => {
          if (event.key === 'ArrowRight') { event.preventDefault(); navigate(1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); navigate(-1); }
        }}>
        <div className="penny-kandy-reel__viewer">
          <header>
            <strong>Penny & Kandy · After Hours Reel</strong>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close reel">✕</button>
          </header>
          <div className="penny-kandy-reel__progress" aria-label={'Slide ' + (index + 1) + ' of ' + SLIDES.length}>
            {SLIDES.map((frame, i) => <span key={frame.src} className={i === index ? 'is-active' : ''} />)}
          </div>
          <img className="penny-kandy-reel__frame" src={SLIDES[index].src} alt={SLIDES[index].alt} />
          <nav aria-label="Reel controls">
            <button type="button" onClick={() => navigate(-1)} aria-label="Previous slide">‹</button>
            <button type="button" onClick={() => setPaused(value => !value)}
              aria-pressed={paused || reducedMotion} disabled={reducedMotion}>
              {reducedMotion ? 'Manual slides' : paused ? '▶ Play' : 'Ⅱ Pause'}
            </button>
            <span aria-live="polite">{index + 1} / {SLIDES.length}</span>
            <button type="button" onClick={() => navigate(1)} aria-label="Next slide">›</button>
          </nav>
        </div>
      </dialog>
    </div>
  );
}
