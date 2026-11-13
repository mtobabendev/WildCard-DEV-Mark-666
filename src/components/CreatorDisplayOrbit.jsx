import { useCallback, useEffect, useId, useRef, useState } from 'react';
import GallerySlideshow from './GallerySlideshow.jsx';
import { galleryStep } from './gallery-slideshow.js';
import './PennyAfterHoursSpinner.css';
import './CreatorDisplayOrbit.css';

export default function CreatorDisplayOrbit({ name, symbol, items, slideshow = false }) {
  const id = useId();
  const pointer = useRef(null);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [selected, setSelected] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const count = items.length;
  const active = selected === null ? null : items[selected];

  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (selected !== null && !node.open) node.showModal();
    if (selected === null && node.open) node.close();
  }, [selected]);
  const step = useCallback(direction => { setVideoPlaying(false); setSelected(index => index === null ? null : galleryStep(index, count, direction)); }, [count]);
  const advance = useCallback(() => step(1), [step]);
  const end = event => {
    if (pointer.current?.id !== event.pointerId) return;
    pointer.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const face = item => <div className="creator-display__face"><span aria-hidden="true">{item.icon || symbol}</span><strong>{item.title}</strong></div>;

  return (
    <section className="penny-after-orbit creator-display" aria-label={name + ' display gallery'}>
      <div className="penny-after-orbit__heading">
        <div className="penny-after-orbit__heading-copy">
          <span className="penny-after-orbit__eyebrow">{name.toUpperCase()} / DISPLAY GALLERY</span>
          <span className="penny-after-orbit__subline">{count} exhibits · Select a tile to explore</span>
        </div>
        <button type="button" className="penny-after-orbit__toggle" aria-expanded={visible} aria-controls={id} onClick={() => setVisible(value => !value)}>{visible ? 'Hide 3D orbit' : 'Explore in 3D'}</button>
      </div>
      <div className="penny-after-orbit__tiles">
        {items.map((item, index) => <button key={item.title} className="penny-after-orbit__tile" type="button" onClick={event => { trigger.current = event.currentTarget; setSelected(index); }} aria-label={'Open ' + item.title}>{face(item)}<span className="penny-after-orbit__tile-label">EXHIBIT {String(index + 1).padStart(2, '0')}</span></button>)}
      </div>
      {visible && <div id={id} className="penny-after-orbit__stage">
        <div className="penny-after-orbit__viewport" tabIndex={0} role="group" aria-label="3D display orbit. Drag or use arrow keys to rotate. Select a tile above to open an exhibit."
          onPointerDown={event => { if (event.button !== 0 || !event.isPrimary) return; pointer.current = { id: event.pointerId, x: event.clientX }; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }}
          onPointerMove={event => { const drag = pointer.current; if (!drag || drag.id !== event.pointerId) return; const delta = event.clientX - drag.x; drag.x = event.clientX; setRotation(value => value + delta * .4); }}
          onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}
          onKeyDown={event => { if (!['ArrowLeft','ArrowRight'].includes(event.key)) return; event.preventDefault(); setRotation(value => value + (event.key === 'ArrowRight' ? 360/count : -360/count)); }}>
          <div className="penny-after-orbit__glow" aria-hidden="true" />
          <div className="penny-after-orbit__tilt" style={{transform: 'rotateX(-8deg) rotateY(' + rotation + 'deg)'}}>
            <div className={'penny-after-orbit__ring' + (paused || dragging || active ? ' is-paused' : '')}>
              {items.map((item,index) => <div key={item.title} className="penny-after-orbit__panel" style={{ '--display-angle': (index * 360/count) + 'deg' }}>
                <div className="penny-after-orbit__face penny-after-orbit__face--front">{face(item)}</div>
                <div className="penny-after-orbit__face penny-after-orbit__face--back" aria-hidden="true">{face(item)}</div>
              </div>)}
              <strong className="penny-after-orbit__center" aria-hidden="true">{name} {symbol}</strong>
            </div>
          </div>
        </div>
        <div className="penny-after-orbit__toolbar"><span>Drag to rotate · Arrow keys supported</span><button type="button" onClick={() => setPaused(value => !value)}>{paused ? 'Resume spin' : 'Pause spin'}</button></div>
      </div>}
      <dialog ref={dialog} className="penny-after-orbit__viewer creator-display__viewer" aria-label={name + ' exhibit viewer'}
        onClose={() => { setSelected(null); setVideoPlaying(false); trigger.current?.focus(); }}
        onKeyDown={event => { if (['ArrowLeft','ArrowRight'].includes(event.key) && event.target.tagName !== 'VIDEO') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); } }}
        onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>
        {active && <div className="penny-after-orbit__viewer-inner">
          <header><strong>{active.title}</strong><button type="button" onClick={() => setSelected(null)}>Close ✕</button></header>
          {active.video && <video key={active.video} src={active.video} controls playsInline preload="metadata" aria-label={active.title} onPlay={() => setVideoPlaying(true)} onPause={() => setVideoPlaying(false)} onEnded={() => setVideoPlaying(false)} />}
          {!active.video && <div className="creator-display__emblem" aria-hidden="true">{active.icon || symbol}</div>}
          <p>{active.description}</p>
          {active.href && <a href={active.href}>Explore {active.title} →</a>}
          <nav aria-label="Exhibit navigation"><button type="button" onClick={() => step(-1)}>← Previous</button><span>{selected+1} / {count}</span><button type="button" onClick={() => step(1)}>Next →</button></nav>
          {slideshow && <GallerySlideshow enabled={slideshow} open={selected !== null} count={count} onAdvance={advance} blocked={videoPlaying} />}
        </div>}
      </dialog>
    </section>
  );
}
