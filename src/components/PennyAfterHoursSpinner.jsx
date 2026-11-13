import { useEffect, useRef, useState } from 'react';
import './PennyAfterHoursSpinner.css';

export const PANEL_IMAGES = [2, 1, 3, 4, 5, 6, 7, 8].map((imageNumber, index) => ({
  number: index + 1,
  src: `/static/${imageNumber}.jpg`,
}));

export default function PennyAfterHoursSpinner() {
  const pointer = useRef(null);
  const dialogRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [orbitVisible, setOrbitVisible] = useState(true);
  const [viewerIndex, setViewerIndex] = useState(null);

  const viewerOpen = viewerIndex !== null;
  const activePhoto = viewerOpen ? PANEL_IMAGES[viewerIndex] : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (viewerOpen && !dialog.open) dialog.showModal();
    if (!viewerOpen && dialog.open) dialog.close();
  }, [viewerOpen]);

  useEffect(() => () => {
    if (dialogRef.current?.open) dialogRef.current.close();
  }, []);

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

  const selectRelative = (step) => {
    setViewerIndex((current) => (
      current === null ? null : (current + step + PANEL_IMAGES.length) % PANEL_IMAGES.length
    ));
  };

  const handleDialogKeyDown = (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      selectRelative(event.key === 'ArrowRight' ? 1 : -1);
    }
  };

  return (
    <section className="penny-after-orbit" id="penny-after-gallery" aria-label="Penny's photo gallery and 3D spinner">
      <div className="penny-after-orbit__heading">
        <div className="penny-after-orbit__heading-copy">
          <span className="penny-after-orbit__eyebrow">PENNY / AFTER HOURS GALLERY</span>
          <span className="penny-after-orbit__subline">Eight portraits. Choose a tile to explore.</span>
        </div>
        <button
          type="button"
          className="penny-after-orbit__toggle"
          aria-expanded={orbitVisible}
          aria-controls="penny-after-orbit-stage"
          onClick={() => setOrbitVisible((current) => !current)}
        >
          {orbitVisible ? 'Hide 3D orbit' : 'Explore in 3D'}
        </button>
      </div>

      <div className="penny-after-orbit__tiles" aria-label="Choose a gallery photograph">
        {PANEL_IMAGES.map(({ number, src }, index) => (
          <button
            className="penny-after-orbit__tile"
            type="button"
            key={number}
            onClick={() => setViewerIndex(index)}
            aria-label={`Open Penny gallery photo ${number} of 8`}
          >
            <img src={src} alt="" loading="lazy" decoding="async" draggable="false" />
            <span className="penny-after-orbit__tile-tag">PENNY ♠</span>
            <span className="penny-after-orbit__tile-label">PHOTO {String(number).padStart(2, '0')}</span>
          </button>
        ))}
      </div>

      {orbitVisible && (
        <div id="penny-after-orbit-stage" className="penny-after-orbit__stage">
          <div
            className="penny-after-orbit__viewport"
            tabIndex={0}
            role="group"
            aria-label="Eight photograph panels in 3D. Drag horizontally or use left and right arrow keys to rotate; choose a photo from the tiles above to view it."
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
              <div className={'penny-after-orbit__ring' + (paused || dragging || viewerOpen ? ' is-paused' : '')}>
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
                      <img src={src} alt="" loading="lazy" decoding="async" draggable="false" />
                    </div>
                  </div>
                ))}
                <strong className="penny-after-orbit__center" aria-hidden="true">Penny ♠ After Hours</strong>
              </div>
            </div>
          </div>
          <div className="penny-after-orbit__toolbar">
            <span>Drag to rotate · Arrow keys supported</span>
            <button type="button" onClick={() => setPaused((current) => !current)}>
              {paused ? 'Resume spin' : 'Pause spin'}
            </button>
          </div>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className="penny-after-orbit__viewer"
        aria-label="Penny After Hours photo viewer"
        onClose={() => setViewerIndex(null)}
        onKeyDown={handleDialogKeyDown}
        onClick={(event) => {
          if (event.target === event.currentTarget) setViewerIndex(null);
        }}
      >
        {activePhoto && (
          <div className="penny-after-orbit__viewer-inner">
            <header>
              <strong>PENNY / PHOTO {String(activePhoto.number).padStart(2, '0')} OF 08</strong>
              <button type="button" onClick={() => setViewerIndex(null)} aria-label="Close photo viewer">
                Close ✕
              </button>
            </header>
            <img
              src={activePhoto.src}
              alt={`Penny After Hours gallery photograph ${activePhoto.number} of 8`}
              draggable="false"
            />
            <nav aria-label="Gallery photo navigation">
              <button type="button" onClick={() => selectRelative(-1)} aria-label="Previous photograph">
                ← Previous
              </button>
              <span>{activePhoto.number} / {PANEL_IMAGES.length}</span>
              <button type="button" onClick={() => selectRelative(1)} aria-label="Next photograph">
                Next →
              </button>
            </nav>
          </div>
        )}
      </dialog>
    </section>
  );
}
