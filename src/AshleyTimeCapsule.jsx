import { useEffect, useState } from 'react';
import './ashley-time-capsule.css';

const MEMORIES = [
  {
    title: 'The Introduction',
    description: 'A familiar beginning.',
    src: '/static/AshleyIntroLoopmp4.webm',
  },
  {
    title: 'Another Moment',
    description: 'Another glimpse of Ashley.',
    src: '/static/AshleyHotLoop.webm',
  },
];

function CapsuleDial({ digit, position, onChange }) {
  const change = (step) => onChange((digit + step + 10) % 10);

  return (
    <div className="capsule-dial">
      <button
        type="button"
        aria-label={`Increase combination digit ${position}`}
        onClick={() => change(1)}
      >
        ▲
      </button>
      <output aria-label={`Combination digit ${position}`}>{digit}</output>
      <button
        type="button"
        aria-label={`Decrease combination digit ${position}`}
        onClick={() => change(-1)}
      >
        ▼
      </button>
    </div>
  );
}

export default function AshleyTimeCapsule() {
  const [digits, setDigits] = useState([0, 0, 0]);
  const [unlocked, setUnlocked] = useState(false);
  const [message, setMessage] = useState('Turn all three dials to open the capsule.');

  useEffect(() => {
    document.title = "Ashley's What If Time Capsule | WildCard DEV";
  }, []);

  const changeDigit = (position, value) => {
    setDigits(current => current.map((digit, i) => (i === position ? value : digit)));
    setMessage('Turn all three dials to open the capsule.');
  };

  const unlock = (event) => {
    event.preventDefault();
    if (digits.join('') === '216') {
      setUnlocked(true);
      return;
    }
    setMessage('That combination did not open the capsule. Try again.');
  };

  return (
    <main className="capsule-page">
      <div className="capsule-atmosphere" aria-hidden="true" />
      <header className="capsule-header">
        <a href="/" className="capsule-return">← WildCard DEV</a>
        <span>ASHLEY / THE TIME CAPSULE</span>
      </header>

      {!unlocked ? (
        <section className="capsule-lock-panel" aria-labelledby="capsule-lock-title">
          <p className="capsule-kicker">A room beyond the moment</p>
          <h1 id="capsule-lock-title">Ashley's “What If”</h1>
          <p className="capsule-lead">
            A time capsule for the memories, possibilities, and moments worth keeping.
          </p>
          <form onSubmit={unlock}>
            <fieldset className="capsule-dials">
              <legend>Three-digit combination</legend>
              {digits.map((digit, position) => (
                <CapsuleDial
                  key={position}
                  digit={digit}
                  position={position + 1}
                  onChange={(value) => changeDigit(position, value)}
                />
              ))}
            </fieldset>
            <button className="capsule-unlock" type="submit">Unlock the Time Capsule</button>
          </form>
          <p className="capsule-message" role="status" aria-live="polite">{message}</p>
        </section>
      ) : (
        <section className="capsule-gallery" aria-labelledby="capsule-gallery-title">
          <p className="capsule-kicker">The door is open</p>
          <h1 id="capsule-gallery-title">Ashley's “What If” Time Capsule</h1>
          <p className="capsule-lead">
            A place to remember Ashley and leave room for all the stories still to be gathered.
          </p>
          <div className="capsule-gallery-grid">
            {MEMORIES.map((memory) => (
              <article className="capsule-memory" key={memory.src}>
                <div className="capsule-memory-frame">
                  <video
                    src={memory.src}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={memory.title}
                  />
                </div>
                <h2>{memory.title}</h2>
                <p>{memory.description}</p>
              </article>
            ))}
          </div>
          <p className="capsule-footnote">
            The collection begins with these two videos. More memories can be added as the capsule grows.
          </p>
        </section>
      )}
    </main>
  );
}
