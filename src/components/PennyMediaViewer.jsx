import { useEffect, useRef, useState } from 'react';

export default function PennyMediaViewer({ kind, items, initialIndex, onClose }) {
  const dialogRef = useRef(null);
  const touchStart = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const current = items[index];
  const isPhoto = kind === 'photo';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  const navigate = (direction) => {
    if (items.length < 2) return;
    setIndex((value) => (value + direction + items.length) % items.length);
    setZoom(1);
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) {
      touchStart.current = null;
      return;
    }
    touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  };

  const handleTouchEnd = (event) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || zoom > 1 || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.3) navigate(dx < 0 ? 1 : -1);
  };

  const mediaZoomStyle = zoom === 1 ? undefined : {
    width: (zoom * 100) + '%',
    maxWidth: 'none',
    maxHeight: 'none',
  };

  return (
    <dialog
      ref={dialogRef}
      className="penny-fans__media-viewer"
      aria-label={isPhoto ? 'Penny photo viewer' : 'Penny video viewer'}
      onClose={onClose}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.target.tagName === 'VIDEO') return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          navigate(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className="penny-fans__media-viewer-body">
        <header className="penny-fans__media-viewer-header">
          <strong>{isPhoto ? 'PHOTOS' : 'VIDEOS'} · {current.title}</strong>
          <div className="penny-fans__media-zoom-controls" aria-label="Media zoom controls">
            <button type="button" onClick={() => setZoom((value) => Math.max(1, Math.round((value - .25) * 100) / 100))} disabled={zoom === 1} aria-label="Zoom out">−</button>
            <output aria-label="Current zoom">{Math.round(zoom * 100)}%</output>
            <button type="button" onClick={() => setZoom((value) => Math.min(3, Math.round((value + .25) * 100) / 100))} disabled={zoom === 3} aria-label="Zoom in">+</button>
            <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1}>Reset</button>
            <button type="button" className="penny-fans__media-close" onClick={onClose} aria-label="Close media viewer">✕</button>
          </div>
        </header>
        <div
          className="penny-fans__media-viewport"
          style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'pan-y' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => { touchStart.current = null; }}
        >
          {isPhoto ? (
            <img
              key={current.src}
              src={current.src}
              alt={'Penny After Hours: ' + current.title}
              style={mediaZoomStyle}
            />
          ) : (
            <video
              key={current.src}
              controls
              playsInline
              preload="metadata"
              poster={current.poster}
              aria-label={current.title}
              style={mediaZoomStyle}
            >
              <source src={current.src} type="video/webm" />
              Your browser does not support this video.
            </video>
          )}
        </div>
        <nav className="penny-fans__media-viewer-nav" aria-label="Media navigation">
          <button type="button" onClick={() => navigate(-1)} disabled={items.length < 2}>← Previous</button>
          <span>{index + 1} / {items.length} · Swipe to browse</span>
          <button type="button" onClick={() => navigate(1)} disabled={items.length < 2}>Next →</button>
        </nav>
      </div>
    </dialog>
  );
}
