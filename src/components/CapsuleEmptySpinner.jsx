import { useRef, useState } from 'react';
import './CapsuleEmptySpinner.css';

const EMPTY_SLOTS = Array.from({ length: 8 }, (_, index) => index);

export default function CapsuleEmptySpinner() {
  const pointer = useRef(null);
  const [angle, setAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const onPointerDown = (event) => {
    if (event.button !== 0) return;
    pointer.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event) => {
    const drag = pointer.current;
    if (!drag || drag.id !== event.pointerId) return;
    const delta = event.clientX - drag.x;
    drag.x = event.clientX;
    setAngle((current) => current + delta * 0.4);
  };

  const onPointerEnd = (event) => {
    if (!pointer.current || pointer.current.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const onKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    setAngle((current) => current + (event.key === 'ArrowRight' ? 30 : -30));
  };

  return (
    <section className="capsule-orbit" aria-label="Empty 3D spinner">
      <div
        className="capsule-orbit__viewport"
        role="group"
        tabIndex={0}
        aria-label="Eight empty panels. Drag horizontally or use the left and right arrow keys to rotate."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onKeyDown={onKeyDown}
      >
        <div className="capsule-orbit__glow" aria-hidden="true" />
        <div
          className="capsule-orbit__tilt"
          style={{ transform: 'rotateX(-11deg) rotateY(' + angle + 'deg)' }}
        >
          <div
            className={'capsule-orbit__ring' + (paused || dragging ? ' is-paused' : '')}
            aria-hidden="true"
          >
            {EMPTY_SLOTS.map((slot) => (
              <div
                key={slot}
                className="capsule-orbit__panel"
                style={{ '--slot': slot }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="capsule-orbit__toolbar">
        <span>Eight empty panels · Drag to rotate</span>
        <button type="button" onClick={() => setPaused((value) => !value)}>
          {paused ? 'Resume spin' : 'Pause spin'}
        </button>
      </div>
    </section>
  );
}
