import { useState } from 'react';
import ViewportVideo from './ViewportVideo.jsx';

const TOON = '/static/JennToon.webm';
const TOON_POSTER = '/static/JennToon.webp';

export default function JennPanel({ videoActive, links }) {
  const [toon, setToon] = useState(false);
  const [failed, setFailed] = useState(false);
  const toggle = () => {
    setFailed(false);
    setToon(value => !value);
  };

  return (
    <article className="identity-card identity-card--jenn" aria-labelledby="jenn-panel-title">
      <div className="jenn-video-shell">
        {videoActive ? (
          <ViewportVideo
            key={toon ? 'toon' : 'intro'}
            budgeted
            src={toon ? TOON : '/static/JennIntro.webm'}
            poster={toon ? TOON_POSTER : undefined}
            loop
            controls={toon}
            style={toon ? { objectFit: 'contain' } : undefined}
            onError={toon ? () => setFailed(true) : undefined}
            aria-label={toon ? 'Jenn’s Toon, created by Jenn' : 'Jenn’s introduction'}
          />
        ) : toon ? (
          <img src={TOON_POSTER} alt="Jenn’s cyber-goth avatar" loading="lazy"
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : null}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.35rem .5rem' }}>
        <h2 id="jenn-panel-title">Jenn</h2>
        <button type="button" className="penny-destination-pill" aria-pressed={toon}
          onClick={toggle} style={{ width: 'auto', paddingInline: '.65rem' }}>
          {toon ? 'Back to intro' : 'Jenn’s Toon'}
        </button>
        {toon && (
          <small style={{ flexBasis: '100%', opacity: .85 }}>
            {failed ? 'Animation unavailable — try the intro.' : 'Created by Jenn • Sound & full screen in video controls'}
          </small>
        )}
      </div>
      <a className="jenn-company-email" href="mailto:Jenn@WildCardDEV.com" style={{ color: "inherit", fontSize: ".8rem", overflowWrap: "anywhere", alignSelf: "start" }}>Jenn@WildCardDEV.com</a>
      {links}
    </article>
  );
}
