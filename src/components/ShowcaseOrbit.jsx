import { useRef, useState } from 'react';
import './ShowcaseOrbit.css';

// Independent, keyboard-accessible navigation: no external media or dependencies.
export default function ShowcaseOrbit({ label, items, compact = false }) {
  const [active, setActive] = useState(0);
  const start = useRef(null);
  const count = items.length;
  const step = (delta) => setActive((index) => (index + delta + count) % count);
  return (
    <nav className={'wc-showcase-orbit' + (compact ? ' wc-showcase-orbit--compact' : '')}
      aria-label={label}>
      <div className="wc-showcase-orbit__viewport"
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          start.current = { id: event.pointerId, x: event.clientX };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (start.current?.id !== event.pointerId) return;
          const delta = event.clientX - start.current.x;
          start.current = null;
          if (Math.abs(delta) > 20) step(delta < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { start.current = null; }}
        onLostPointerCapture={() => { start.current = null; }}
        aria-hidden="true">
        <div className="wc-showcase-orbit__ring" style={{ transform: 'rotateY(' + (-active * 360 / count) + 'deg)' }}>
          {items.map((item, index) => (
            <div className="wc-showcase-orbit__face" key={item.href}
              style={{ transform: 'rotateY(' + (index * 360 / count) + 'deg) translateZ(var(--wc-orbit-radius))' }}>
              <span>{item.icon}</span><strong>{item.label}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="wc-showcase-orbit__controls" onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        step(event.key === 'ArrowRight' ? 1 : -1);
      }}>
        <button type="button" onClick={() => step(-1)} aria-label="Previous destination">‹</button>
        <a href={items[active].href} aria-live="polite">{items[active].label} ↗</a>
        <button type="button" onClick={() => step(1)} aria-label="Next destination">›</button>
      </div>
      <div className="wc-showcase-orbit__links">
        {items.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      </div>
    </nav>
  );
}
