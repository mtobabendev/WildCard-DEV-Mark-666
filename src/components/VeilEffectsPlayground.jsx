import { useState } from 'react';
import './VeilEffectsPlayground.css';

const MODES = [
  { id: 'glass', label: 'Glass & Neon' },
  { id: 'flip', label: '3D Card Flip' },
  { id: 'motion', label: 'Motion Orbit' },
];

const PALETTES = [
  { id: 'pink', label: 'Penny Pink', color: '#ff5bd6' },
  { id: 'cyan', label: 'Electric Cyan', color: '#60cfff' },
  { id: 'lime', label: 'Acid Green', color: '#dfff3f' },
];

export default function VeilEffectsPlayground() {
  const [mode, setMode] = useState('glass');
  const [opacity, setOpacity] = useState(30);
  const [neon, setNeon] = useState(0);
  const [palette, setPalette] = useState('pink');
  const [flipped, setFlipped] = useState(false);
  const [speed, setSpeed] = useState(45);
  const [paused, setPaused] = useState(false);

  const accent = PALETTES.find((entry) => entry.id === palette)?.color || PALETTES[0].color;
  const reset = () => {
    setOpacity(30);
    setNeon(0);
    setPalette('pink');
    setFlipped(false);
    setSpeed(45);
    setPaused(false);
  };

  return (
    <section className="veil-collection veil-fx" aria-labelledby="veil-fx-heading">
      <p className="veil-kicker">III. Effects Playground</p>
      <h3 id="veil-fx-heading">Don't just look. Play.</h3>
      <p className="veil-fx-lead">
        Adjust live visual effects to see how a tiny design choice changes an experience.
        These controls only affect the demonstration below.
      </p>

      <div className="veil-fx-shell" style={{ '--veil-fx-accent': accent }}>
        <div className="veil-fx-tabs" role="group" aria-label="Choose an effect">
          {MODES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={`veil-fx-tab${mode === id ? ' is-active' : ''}`}
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'glass' && (
          <div className="veil-fx-demo">
            <div className="veil-fx-scene" aria-label={`Glass opacity ${opacity} percent, neon intensity ${neon} percent`}>
              <div className="veil-fx-glass-card" style={{
                backgroundColor: `rgba(6, 7, 24, ${opacity / 100})`,
                borderWidth: `${1 + neon / 18}px`,
                boxShadow: `0 0 ${neon * .75}px ${accent}, inset 0 0 ${neon / 3}px rgba(255,255,255,.22)`,
              }}>
                <span className="veil-fx-emblem" aria-hidden="true">♠</span>
                <strong>WILDCARD DEV</strong>
                <small>INTERACTIVE EXPERIENCE</small>
                <span className="veil-fx-demo-button">EXPLORE</span>
              </div>
            </div>
            <div className="veil-fx-controls">
              <label className="veil-fx-slider-label" htmlFor="veil-fx-opacity">
                Glass opacity <output htmlFor="veil-fx-opacity">{opacity}%</output>
              </label>
              <input id="veil-fx-opacity" type="range" min="10" max="100" step="5"
                value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} />
              <div className="veil-fx-presets">
                <button type="button" onClick={() => setOpacity(10)}>Clear</button>
                <button type="button" onClick={() => setOpacity(50)}>Medium</button>
                <button type="button" onClick={() => setOpacity(100)}>Solid</button>
              </div>

              <label className="veil-fx-slider-label" htmlFor="veil-fx-neon">
                Neon intensity <output htmlFor="veil-fx-neon">{neon}%</output>
              </label>
              <input id="veil-fx-neon" type="range" min="0" max="100" step="5"
                value={neon} onChange={(event) => setNeon(Number(event.target.value))} />
              <div className="veil-fx-presets">
                <button type="button" onClick={() => setNeon(0)}>Off</button>
                <button type="button" onClick={() => setNeon(50)}>Medium</button>
                <button type="button" onClick={() => setNeon(100)}>Full power</button>
              </div>

              <p className="veil-fx-control-title">Neon color</p>
              <div className="veil-fx-palettes" role="group" aria-label="Neon color preset">
                {PALETTES.map((option) => (
                  <button type="button" key={option.id}
                    aria-pressed={palette === option.id}
                    onClick={() => setPalette(option.id)}
                    className={palette === option.id ? 'is-selected' : ''}
                  >
                    <span className="veil-fx-swatch" style={{ background: option.color }} aria-hidden="true" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'flip' && (
          <div className="veil-fx-demo">
            <div className="veil-fx-flip-scene">
              <div className={`veil-fx-flip-card${flipped ? ' is-flipped' : ''}`}>
                <div className="veil-fx-face veil-fx-face-front">
                  <span className="veil-fx-card-corner">♠</span>
                  <span className="veil-fx-card-symbol">♠</span>
                  <strong>WILDCARD DEV</strong>
                  <small>FRONT FACE</small>
                </div>
                <div className="veil-fx-face veil-fx-face-back">
                  <span className="veil-fx-card-corner">♦</span>
                  <span className="veil-fx-card-symbol">♦</span>
                  <strong>THE OTHER SIDE</strong>
                  <small>BACK FACE</small>
                </div>
              </div>
            </div>
            <div className="veil-fx-controls veil-fx-controls-short">
              <h4>Two sides. One interaction.</h4>
              <p>Flip the card to reveal a genuinely separate back face. This is a visual demonstration, not the site's actual merchandise viewer.</p>
              <button type="button" className="veil-fx-primary" onClick={() => setFlipped((value) => !value)}>
                {flipped ? 'Show front' : 'Flip card'}
              </button>
              <p className="veil-fx-readout" role="status">Showing: {flipped ? 'Back face' : 'Front face'}</p>
            </div>
          </div>
        )}

        {mode === 'motion' && (
          <div className="veil-fx-demo">
            <div className="veil-fx-motion-scene">
              <div className="veil-fx-orbit" style={{
                animationDuration: `${24 - speed * .2}s`,
                animationPlayState: paused ? 'paused' : 'running',
              }}>
                <span className="veil-fx-satellite" aria-hidden="true">✦</span>
              </div>
              <div className="veil-fx-motion-core"><span aria-hidden="true">♠</span><strong>WILDCARD</strong></div>
              <span className="veil-fx-motion-label">PURPOSEFUL MOTION</span>
            </div>
            <div className="veil-fx-controls veil-fx-controls-short">
              <h4>Motion with a purpose.</h4>
              <p>Speed up, slow down, or stop the motion. System reduced-motion preferences are respected.</p>
              <label className="veil-fx-slider-label" htmlFor="veil-fx-speed">
                Orbit speed <output htmlFor="veil-fx-speed">{speed}%</output>
              </label>
              <input type="range" id="veil-fx-speed" min="0" max="100" step="5"
                value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
              <button type="button" className="veil-fx-primary" aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}>
                {paused ? 'Resume motion' : 'Pause motion'}
              </button>
              <p className="veil-fx-readout" role="status">{paused ? 'Paused' : 'Motion enabled'} · Speed {speed}%</p>
            </div>
          </div>
        )}

        <div className="veil-fx-bottom">
          <span>LIVE DEMONSTRATION · NO SETTINGS SAVED</span>
          <button type="button" onClick={reset}>Reset effects ↺</button>
        </div>
      </div>
    </section>
  );
}
