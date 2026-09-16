import { useCallback, useEffect, useRef, useState } from 'react';
import mattAvatar from '../assets/matt-avatar.png';
import pennyAvatar from '../assets/BetterThanJarvis.jpg';
import pennyLandingAvatar from '../assets/PennyLanding.jpg';
import pennyYogaVideo from '../assets/Yoga.mp4';
import pennyCardVideo from '../assets/PennyCard1.mp4';

const CHANNELS = [
  { id: 'contact', number: '01', title: 'Contact', copy: 'Direct operator access for WildCard DEV, Matt, and Penny.', video: pennyCardVideo },
  { id: 'systems', number: '02', title: 'Systems', copy: 'Premium web, app, automation, and AI systems built with cinematic precision.' },
  { id: 'portfolio', number: '03', title: 'Portfolio', copy: 'Selected builds, experiments, client systems, and interface work.' },
  { id: 'penny', number: '04', title: 'Penny', copy: 'Concierge guidance, contact routing, and controlled chaos.', penny: true, video: pennyYogaVideo },
  { id: 'automation', number: '05', title: 'Automation', copy: 'Workflow logic, task support, and smart execution systems.' },
  { id: 'interface', number: '06', title: 'Interface', copy: 'Distinctive digital experiences built to feel responsive, useful, and alive.' },
];

const STEP = 360 / CHANNELS.length;
const SPADE_URL = 'https://the-spade.wildcarddev.com/';

function shortestTurn(current, target) {
  const normalized = ((target - current + 540) % 360) - 180;
  return current + normalized;
}

function Portal({ open, onOpen }) {
  return (
    <section className={`portal-stage${open ? ' is-open' : ''}`} aria-labelledby="portal-title">
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
  const dragRef = useRef({ active: false, pointerId: null, cardIndex: null, startX: 0, lastX: 0, lastTime: 0, velocity: 0, moved: false });
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
    const pressedCard = event.target.closest?.('.spinner-card');
    inertiaRef.current = 0;
    resumeAtRef.current = Number.POSITIVE_INFINITY;
    dragRef.current = { active: true, pointerId: event.pointerId, cardIndex: pressedCard ? Number(pressedCard.dataset.index) : null, startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setEngaged(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag.active || drag.pointerId !== event.pointerId) return;
    const now = performance.now();
    const deltaX = event.clientX - drag.lastX;
    const elapsed = Math.max(now - drag.lastTime, 8);
    if (Math.abs(event.clientX - drag.startX) > 8) drag.moved = true;
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
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.moved && Number.isInteger(drag.cardIndex)) {
      selectCard(drag.cardIndex);
      suppressClickUntilRef.current = performance.now() + 250;
      return;
    }
    if (window.matchMedia('(max-width: 240px)').matches && drag.moved) {
      const direction = event.clientX < drag.startX ? 1 : -1;
      const nextIndex = (activeIndex + direction + CHANNELS.length) % CHANNELS.length;
      inertiaRef.current = 0;
      resumeAtRef.current = Number.POSITIVE_INFINITY;
      changeRotation(-nextIndex * STEP);
      onSelect(nextIndex);
      return;
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
          <button key={channel.id} data-index={index} className={`spinner-card${channel.penny ? ' spinner-card--penny' : ''}${activeIndex === index ? ' is-selected' : ''}`} style={{ '--i': index, '--angle': `${index * STEP}deg` }} type="button" aria-controls="channel-content" aria-pressed={activeIndex === index} tabIndex={open ? 0 : -1} onAnimationEnd={(event) => { if (index === CHANNELS.length - 1 && event.animationName === 'card-unfold') setSettled(true); }} onClick={() => selectCard(index)}>
            {channel.video && open && <video className="spinner-card-video" src={channel.video} autoPlay muted loop playsInline aria-hidden="true" />}
            <span>{channel.number}</span>
            <strong>{channel.title}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function CombinationDial({ value, position, onChange }) {
  const pointerStartRef = useRef(null);
  const adjust = (amount) => onChange((value + amount + 10) % 10);
  return (
    <div className="combination-dial" onWheel={(event) => { event.preventDefault(); adjust(event.deltaY > 0 ? 1 : -1); }} onPointerDown={(event) => { if (event.target.closest('button')) return; pointerStartRef.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={(event) => { if (pointerStartRef.current === null) return; const distance = event.clientY - pointerStartRef.current; pointerStartRef.current = null; if (Math.abs(distance) >= 16) adjust(distance < 0 ? 1 : -1); }}>
      <button type="button" aria-label={`Increase digit ${position}`} onClick={() => adjust(1)}>▲</button>
      <output aria-label={`Combination digit ${position}`}>{value}</output>
      <button type="button" aria-label={`Decrease digit ${position}`} onClick={() => adjust(-1)}>▼</button>
    </div>
  );
}

function CombinationGate({ open, onClose }) {
  const [digits, setDigits] = useState([0, 0, 0]);
  const [message, setMessage] = useState('Set the house combination.');
  useEffect(() => {
    if (!open) return undefined;
    setDigits([0, 0, 0]);
    setMessage('Set the house combination.');
    const handleKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);
  if (!open) return null;
  const setDigit = (index, value) => setDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? value : digit));
  const unlock = (event) => {
    event.preventDefault();
    if (digits.join('') === '216') { setMessage('The door is open.'); window.location.assign(SPADE_URL); return; }
    setMessage('Wrong room. Try the card again.');
  };
  return (
    <div className="combination-gate" role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="combination-lock" role="dialog" aria-modal="true" aria-labelledby="combination-title">
        <button className="combination-close" type="button" aria-label="Close combination lock" onClick={onClose}>×</button>
        <p className="eyebrow">Penny’s Office</p><h2 id="combination-title">The Spade</h2><p className="combination-instruction">Turn the three dials. Wheel, swipe, or use the arrows.</p>
        <form onSubmit={unlock}><div className="combination-dials" aria-label="Three digit combination">{digits.map((digit, index) => <CombinationDial key={index} value={digit} position={index + 1} onChange={(value) => setDigit(index, value)} />)}</div><p className="combination-message" aria-live="polite">{message}</p><button className="combination-enter" type="submit">Try the door</button></form>
      </section>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pennyRevealed, setPennyRevealed] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const pennyNavigationRef = useRef(null);
  const activeChannel = CHANNELS[activeIndex];
  const closeGate = useCallback(() => setGateOpen(false), []);
  useEffect(() => () => clearTimeout(pennyNavigationRef.current), []);
  const enterPennyOffice = () => {
    setPennyRevealed(true);
    if (pennyNavigationRef.current) return;
    pennyNavigationRef.current = window.setTimeout(() => { setGateOpen(true); pennyNavigationRef.current = null; }, 2000);
  };
  return (
    <>
      <header className="site-header"><a className="brand" href="/" aria-label="WildCard DEV home"><span className="brand-dot" aria-hidden="true" /><span>WildCard DEV</span></a><a className="donate" href="https://square.link/u/YnAVr8ht" target="_blank" rel="noopener noreferrer">Donate</a></header>
      <main className="landing">
        <Portal open={open} onOpen={() => setOpen(true)} />
        <section className={`card-stage card-stage--matt${open ? ' is-active' : ''}`} aria-label="Owner information" aria-hidden={!open}><article className="identity-card identity-card--matt"><img src={mattAvatar} alt="Matt Tobaben" /><p className="eyebrow">Owner</p><h2>Matt Tobaben</h2><p>WildCard DEV</p><a href="mailto:matt@wildcarddev.com">matt@wildcarddev.com</a><a href="tel:+14029150789">402-915-0789</a></article></section>
        <Spinner open={open} activeIndex={activeIndex} onSelect={setActiveIndex} />
        <section id="channel-content" className={`context-window${open ? ' is-active' : ''}`} aria-live="polite" aria-hidden={!open}><p className="eyebrow">Active channel</p><h2>{activeChannel.title}</h2><p>{activeChannel.copy}</p></section>
        <section className={`card-stage card-stage--penny${open ? ' is-active' : ''}`} aria-label="Penny concierge" aria-hidden={!open}><article className="identity-card identity-card--penny"><button className={`penny-avatar-toggle${pennyRevealed ? ' is-revealed' : ''}`} type="button" aria-label="Reveal Penny, then enter Penny’s Office" onMouseEnter={() => setPennyRevealed(true)} onFocus={() => setPennyRevealed(true)} onClick={enterPennyOffice}><span className="penny-avatar-flip" aria-hidden="true"><img className="penny-avatar-front" src={pennyLandingAvatar} alt="" /><img className="penny-avatar-back" src={pennyAvatar} alt="" /></span></button><p className="eyebrow">Concierge</p><h2>Penny</h2><p>Project guidance, contact routing, and interface support.</p><button type="button" onClick={() => setGateOpen(true)}>Enter Penny’s Office</button></article></section>
      </main>
      <CombinationGate open={gateOpen} onClose={closeGate} />
    </>
  );
}

export default App;