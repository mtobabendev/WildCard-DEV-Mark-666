import { useCallback, useEffect, useRef, useState } from 'react';
import mattAvatar from '../assets/matt-avatar.png';
import pennyAvatar from '../assets/penny-hot-still.png';

const CHANNELS = [
  { id: 'contact', number: '01', title: 'Contact', copy: 'Direct operator access for WildCard DEV, Matt, and Penny.' },
  { id: 'systems', number: '02', title: 'Systems', copy: 'Premium web, app, automation, and AI systems built with cinematic precision.' },
  { id: 'portfolio', number: '03', title: 'Portfolio', copy: 'Selected builds, experiments, client systems, and interface work.' },
  { id: 'penny', number: '04', title: 'Penny', copy: 'Concierge guidance, contact routing, and controlled chaos.', penny: true },
  { id: 'automation', number: '05', title: 'Automation', copy: 'Workflow logic, task support, and smart execution systems.' },
  { id: 'interface', number: '06', title: 'Interface', copy: 'Distinctive digital experiences built to feel responsive, useful, and alive.' },
];

const STEP = 360 / CHANNELS.length;

function shortestTurn(current, target) {
  const normalized = ((target - current + 540) % 360) - 180;
  return current + normalized;
}

function Portal({ open, onOpen }) {
  return (
    <section className="portal-stage" aria-labelledby="portal-title">
      <button className={`portal-trigger${open ? ' is-open' : ''}`} type="button" aria-describedby="portal-hint" aria-expanded={open} onClick={onOpen}>
        <span className="portal-ring portal-ring--outer" aria-hidden="true" />
        <span className="portal-ring portal-ring--middle" aria-hidden="true" />
        <span className="portal-ring portal-ring--inner" aria-hidden="true" />
        <span className="portal-core" aria-hidden="true" />
        <span className="portal-copy">
          <span className="eyebrow">WildCard DEV</span>
          <strong id="portal-title">Enter the portal</strong>
          <span id="portal-hint">Experience coming next</span>
        </span>
      </button>
    </section>
  );
}

function Spinner({ open, activeIndex, onSelect }) {
  const stageRef = useRef(null);
  const deckRef = useRef(null);
  const rotationRef = useRef(0);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const resumeAtRef = useRef(0);
  const dragRef = useRef({ active: false, pointerId: null, lastX: 0, lastTime: 0, velocity: 0, moved: false });
  const inertiaRef = useRef(0);
  const suppressClickUntilRef = useRef(0);
  const [engaged, setEngaged] = useState(false);
  const [settled, setSettled] = useState(false);

  const changeRotation = useCallback((updater) => {
    const current = rotationRef.current;
    const next = typeof updater === 'function' ? updater(current) : updater;
    rotationRef.current = next;
    deckRef.current?.style.setProperty('--rotation', `${next}deg`);
  }, []);

  useEffect(() => {
    if (!open) {
      setSettled(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setSettled(true), 2500);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const tick = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const elapsed = Math.min(time - lastTimeRef.current, 40);
      lastTimeRef.current = time;
      if (dragRef.current.active) {
        // Pointer movement owns the rotation while dragging.
      } else if (Math.abs(inertiaRef.current) > 0.002) {
        changeRotation((current) => current + inertiaRef.current * elapsed);
        inertiaRef.current *= Math.pow(0.94, elapsed / 16.67);
        if (Math.abs(inertiaRef.current) <= 0.002) {
          inertiaRef.current = 0;
          resumeAtRef.current = time + 1200;
        }
      } else if (time > resumeAtRef.current) {
        changeRotation((current) => current + elapsed * 0.006);
      }
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [changeRotation, open]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !open) return undefined;
    const handleWheel = (event) => {
      event.preventDefault();
      const amount = Math.max(-48, Math.min(48, event.deltaY || event.deltaX));
      resumeAtRef.current = performance.now() + 1800;
      changeRotation((current) => current + amount * 0.16);
    };
    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => stage.removeEventListener('wheel', handleWheel);
  }, [changeRotation, open]);

  const selectCard = (index) => {
    if (performance.now() < suppressClickUntilRef.current) return;
    inertiaRef.current = 0;
    resumeAtRef.current = performance.now() + 2600;
    changeRotation((current) => shortestTurn(current, -index * STEP));
    onSelect(index);
  };

  const handlePointerDown = (event) => {
    if (!open || event.button > 0) return;
    inertiaRef.current = 0;
    resumeAtRef.current = Number.POSITIVE_INFINITY;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setEngaged(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - drag.lastX;
    const elapsed = Math.max(now - drag.lastTime, 8);
    if (Math.abs(deltaX) > 1) drag.moved = true;
    changeRotation((current) => current + deltaX * 0.38);
    drag.velocity = (drag.velocity * 0.55) + ((deltaX * 0.38) / elapsed) * 0.45;
    drag.lastX = event.clientX;
    drag.lastTime = now;
  };

  const handlePointerEnd = (event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    drag.active = false;
    if (drag.moved) suppressClickUntilRef.current = performance.now() + 250;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    inertiaRef.current = Math.max(-0.9, Math.min(0.9, drag.velocity));
    if (Math.abs(inertiaRef.current) <= 0.002) {
      inertiaRef.current = 0;
      resumeAtRef.current = performance.now() + 1200;
    }
  };

  const handleKeyDown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    selectCard((activeIndex + direction + CHANNELS.length) % CHANNELS.length);
  };

  return (
    <section ref={stageRef} className={`spinner-stage${open ? ' is-active' : ''}${settled ? ' is-settled' : ''}${engaged ? ' is-engaged' : ''}`} aria-label="WildCard navigation" aria-hidden={!open} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd} onPointerEnter={() => setEngaged(true)} onPointerLeave={() => { if (!dragRef.current.active) setEngaged(false); }} onFocus={() => setEngaged(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false); }} onKeyDown={handleKeyDown}>
      <div ref={deckRef} className="spinner-deck" style={{ '--rotation': '0deg' }}>
        {CHANNELS.map((channel, index) => (
          <button key={channel.id} className={`spinner-card${channel.penny ? ' spinner-card--penny' : ''}${activeIndex === index ? ' is-selected' : ''}`} style={{ '--i': index, '--angle': `${index * STEP}deg` }} type="button" aria-pressed={activeIndex === index} tabIndex={open ? 0 : -1} onClick={() => selectCard(index)}>
            <span>{channel.number}</span>
            <strong>{channel.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeChannel = CHANNELS[activeIndex];

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/" aria-label="WildCard DEV home"><span className="brand-dot" aria-hidden="true" /><span>WildCard DEV</span></a>
        <a className="donate" href="https://square.link/u/YnAVr8ht" target="_blank" rel="noopener noreferrer">Donate</a>
      </header>
      <main className="landing">
        <Portal open={open} onOpen={() => setOpen(true)} />
        <section className={`context-window${open ? ' is-active' : ''}`} aria-live="polite" aria-hidden={!open}>
          <p className="eyebrow">Active channel</p><h2>{activeChannel.title}</h2><p>{activeChannel.copy}</p>
        </section>
        <Spinner open={open} activeIndex={activeIndex} onSelect={setActiveIndex} />
        <section className={`card-stage${open ? ' is-active' : ''}`} aria-label="WildCard interface" aria-hidden={!open}>
          <article className="identity-card identity-card--matt">
            <img src={mattAvatar} alt="Matt Tobaben" /><p className="eyebrow">Owner</p><h2>Matt Tobaben</h2><p>WildCard DEV</p><a href="mailto:matt@wildcarddev.com">matt@wildcarddev.com</a><a href="tel:+14029150789">402-915-0789</a>
          </article>
          <article className="identity-card identity-card--penny">
            <img src={pennyAvatar} alt="Penny, WildCard DEV concierge" /><p className="eyebrow">Concierge</p><h2>Penny</h2><p>Project guidance, contact routing, and interface support.</p><button type="button">Enter Penny’s Office</button>
          </article>
        </section>
      </main>
    </>
  );
}

export default App;
