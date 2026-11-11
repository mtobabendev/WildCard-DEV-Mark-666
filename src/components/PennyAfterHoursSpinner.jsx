import { useRef, useState } from 'react';
import './PennyAfterHoursSpinner.css';

const PANEL_IMAGES = Array.from({ length: 8 }, (_, index) => ({
  number: index + 1,
  src: `/static/${index + 1}.jpg`,
}));

export default function PennyAfterHoursSpinner() {
  const pointer = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event) => {
    const drag = pointer.current;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    drag.x = event.clientX;
    setRotation((current) => current + delta * 0.4);
  };

  const handlePointerEnd = (event) => {
    if (!pointer.current || pointer.current.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setRotation((current) => current + (event.key === 'ArrowRight' ? 30 : -30));
  };

  return (
    <section className="penny-after-orbit" aria-label="Penny's eight-image 3D spinner">
      <div className="penny-after-orbit__heading">
        <span className="penny-after-orbit__eyebrow">PENNY / THE AFTER HOURS ORBIT</span>
        <span className="penny-after-orbit__subline">Eight portraits in motion.</span>
      </div>
      <div
        className="penny-after-orbit__viewport"
        tabIndex={0}
        role="group"
        aria-label="Eight photograph panels. Drag horizontally or use the left and right arrow keys to rotate."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        <div className="penny-after-orbit__glow" aria-hidden="true" />
        <div
          className="penny-after-orbit__tilt"
          style={{ transform: 'rotateX(-8deg) rotateY(' + rotation + 'deg)' }}
        >
          <div
            className={'penny-after-orbit__ring' + (paused || dragging ? ' is-paused' : '')}
          >
            {PANEL_IMAGES.map(({ number, src }, index) => (
              <div
                className="penny-after-orbit__panel"
                key={number}
                style={{ '--orbit-slot': index }}
              >
                <div className="penny-after-orbit__face penny-after-orbit__face--front">
                  <img
                    src={src}
                    alt={`Penny After Hours gallery photo ${number}`}
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </div>
                <div className="penny-after-orbit__face penny-after-orbit__face--back" aria-hidden="true">
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                </div>
              </div>
            ))}
            <strong className="penny-after-orbit__center" aria-hidden="true">Penny ♠ After Hours</strong>
          </div>
        </div>
      </div>
      <div className="penny-after-orbit__toolbar">
        <span>Drag to rotate · Arrow keys supported</span>
        <button type="button" onClick={() => setPaused((value) => !value)}>
          {paused ? 'Resume spin' : 'Pause spin'}
        </button>
      </div>
    </section>
  );
}
