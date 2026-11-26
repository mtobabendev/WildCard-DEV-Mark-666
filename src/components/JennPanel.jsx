import ViewportVideo from './ViewportVideo.jsx';

const TOON = '/static/JennToon.webm';
const TOON_POSTER = '/static/JennToon.webp';

export default function JennPanel({ videoActive, links }) {
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
        .identity-card--jenn .jenn-toon-frame img,
        .identity-card--jenn .jenn-toon-frame video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 0;
          margin: 0;
        }
        .identity-card--jenn .jenn-toon-credit {
          margin: 0;
          font-size: .75rem;
          line-height: 1.3;
          font-weight: 700;
          color: #ffb5e8;
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
          <div className="jenn-toon-frame">
            {videoActive ? (
              <ViewportVideo budgeted
                src={TOON}
                poster={TOON_POSTER}
                loop
                controls
                respectReducedMotion
                aria-label="A Jenn Original! AI animation created by Jenn"
              />
            ) : (
              <img src={TOON_POSTER} alt="Jenn’s cyber-goth avatar" loading="lazy" decoding="async" />
            )}
          </div>
          <small className="jenn-toon-credit">✨ A Jenn Original! Check it out! ✨</small>
        </div>
        {links}
      </div>
    </article>
  );
}
