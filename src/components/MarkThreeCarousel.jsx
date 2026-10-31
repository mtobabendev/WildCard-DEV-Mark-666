import { useEffect, useRef, useState } from 'react';
import './MarkThreeCarousel.css';

const archive = 'https://github.com/mtobabendev/WildCard-Mark-III/blob/main/';
const panels = [
  ['Joker · Résumé', 'joker.webm', archive + 'dist/resume.html'],
  ['Harley · Résumé', 'harleyQuinn2.webm', archive + 'dist/resume.html'],
  ['Rick · Flashcards', 'rickDance.webm', archive + 'dist/flashcards.html'],
  ['Balrog · Pathfinder', 'balrog.webm', archive + 'dist/PathFinder.html'],
  ['Negan · Zombies', 'negan.webm', archive + 'dist/Zombies.html'],
  ['JARVIS · Conan', 'jarvis2.webm', archive + 'dist/CONAN.html'],
  ['Seven of Nine', 'so9.webm', archive + 'dist/Seven.html'],
  ['Dice Mark II', 'die2.webm', '/dice'],
];

const DRAG_DEGREES_PER_PIXEL = .30;

export default function MarkThreeCarousel() {
  const area = useRef(null);
  const dragPlane = useRef(null);
  const angles = useRef({ x: 11, y: 0 });
  const pointer = useRef(null);
  const frame = useRef(0);
  const ignoreClickUntil = useRef(0);
  const [radius, setRadius] = useState(180);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);

  const turn = (dx, dy) => {
    angles.current.y += dx;
    angles.current.x = Math.min(180, Math.max(0, angles.current.x + dy));
    if (dragPlane.current) dragPlane.current.style.transform =
      'rotateX(' + -angles.current.x + 'deg) rotateY(' + angles.current.y + 'deg)';
  };

  useEffect(() => {
    const element = area.current;
    if (!element) return undefined;
    const resize = () => setRadius(Math.max(90, Math.min(240, (element.clientWidth - 118) / 2)));
    resize();
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    if (!observer) window.addEventListener('resize', resize);
    const wheel = event => {
      if (!event.deltaY) return;
      event.preventDefault();
      setRadius(current => Math.max(90, Math.min(260, current - event.deltaY * .12)));
    };
    element.addEventListener('wheel', wheel, { passive: false });
    const media = [...element.querySelectorAll('video')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => media.forEach(video => {
      if (document.hidden || motion.matches) video.pause();
      else video.play()?.catch(() => {});
    });
    sync();
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener?.('change', sync);
    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
      element.removeEventListener('wheel', wheel);
      document.removeEventListener('visibilitychange', sync);
      motion.removeEventListener?.('change', sync);
      media.forEach(video => video.pause());
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const onDown = event => {
    if (event.button !== 0) return;
    cancelAnimationFrame(frame.current);
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY,
      startX: event.clientX, startY: event.clientY, dx: 0, dy: 0, moved: false };
    setDragging(true);
  };
  const onMove = event => {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId) return;
    p.dx = event.clientX - p.x;
    p.dy = event.clientY - p.y;
    p.x = event.clientX;
    p.y = event.clientY;
    if (!p.moved && Math.hypot(p.x - p.startX, p.y - p.startY) > 8) {
      p.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    turn(p.dx * DRAG_DEGREES_PER_PIXEL, p.dy * DRAG_DEGREES_PER_PIXEL);
  };
  const onEnd = event => {
    const p = pointer.current;
    if (!p || p.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (!p.moved || event.type === 'pointercancel' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDragging(false);
      return;
    }
    ignoreClickUntil.current = performance.now() + 350;
    let dx = p.dx, dy = p.dy;
    const coast = () => {
      dx *= .95; dy *= .95;
      if (Math.abs(dx) + Math.abs(dy) < .5) {
        frame.current = 0;
        setDragging(false);
        return;
      }
      turn(dx * DRAG_DEGREES_PER_PIXEL, dy * DRAG_DEGREES_PER_PIXEL);
      frame.current = requestAnimationFrame(coast);
    };
    frame.current = requestAnimationFrame(coast);
  };

  return (
    <section className="mark3-carousel" aria-label="Original Mark III video carousel">
      <div className={'mark3-carousel__viewport' + (dragging ? ' is-dragging' : '')}
        ref={area} style={{ '--mark3-radius': radius + 'px' }}
        onPointerDown={onDown} onPointerMove={onMove}
        onPointerUp={onEnd} onPointerCancel={onEnd}
        aria-describedby="mark3-carousel-instructions">
        <div className="mark3-carousel__ground" aria-hidden="true" />
        <div className="mark3-carousel__drag" ref={dragPlane}>
          <div className={'mark3-carousel__orbit' + (dragging || paused ? ' is-paused' : '')}>
            {panels.map(([title, file, href], index) => (
              <a key={file} className="mark3-carousel__tile"
                style={{ transform: 'rotateY(' + (index * 45) + 'deg) translateZ(var(--mark3-radius))' }} href={href}
                target={href.startsWith('https:') ? '_blank' : undefined}
                rel={href.startsWith('https:') ? 'noopener noreferrer' : undefined}
                aria-label={title + ': open the archived source or live demo'}
                onClick={event => {
                  if (performance.now() < ignoreClickUntil.current) event.preventDefault();
                }}>
                <video src={'/static/mark3-carousel/' + file}
                  muted loop playsInline preload="none" aria-hidden="true" />
                <span>{title}</span>
              </a>
            ))}
            <strong className="mark3-carousel__center" aria-hidden="true">WildCard DEV</strong>
          </div>
        </div>
      </div>
      <div className="mark3-carousel__toolbar">
        <span id="mark3-carousel-instructions">Drag to spin · Wheel to resize · Tap a card for its project</span>
        <button type="button" onClick={() => setPaused(value => !value)}>
          {paused ? 'Resume spin' : 'Pause spin'}
        </button>
      </div>
      <p className="mark3-carousel__note">
        Mark III original-era exhibit. Historic source links may require repository access.
        JARVIS uses the alternate archived clip.
      </p>
    </section>
  );
}
