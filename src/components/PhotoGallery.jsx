import { useEffect, useRef, useState } from 'react';

export function countGalleryPhotos(collections) {
  return collections.reduce((total, collection) => total + collection.photos.length, 0);
}

export default function PhotoGallery({
  collections,
  label = 'Photo gallery',
  eyebrow = 'PHOTOS',
  description,
  classPrefix = 'penny-fans',
}) {
  const [selection, setSelection] = useState(null);
  const dialogRef = useRef(null);
  const visibleCollections = collections.filter((collection) => collection.photos.length > 0);
  const gallery = selection && visibleCollections.find((collection) => collection.id === selection.id);
  const photo = gallery?.photos[selection.index];
  const active = Boolean(photo);
  const close = () => setSelection(null);
  const step = (offset) => {
    setSelection((current) => {
      if (!current) return null;
      const currentGallery = visibleCollections.find((collection) => collection.id === current.id);
      const length = currentGallery?.photos.length || 0;
      if (!length) return null;
      return { ...current, index: (current.index + offset + length) % length };
    });
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  return (
    <section className={classPrefix + '__media-gallery'} aria-label={label}>
      <header className={classPrefix + '__gallery-heading'}>
        <p className={classPrefix + '__eyebrow'}>{eyebrow}</p>
        <h2>Photo gallery <span>{countGalleryPhotos(visibleCollections)} photographs · {visibleCollections.length} collections</span></h2>
        {description && <p>{description}</p>}
      </header>
      <div className={classPrefix + '__photo-grid'}>
        {visibleCollections.map((collection) => (
          <button
            className={classPrefix + '__photo-tile'}
            type="button"
            key={collection.id}
            onClick={() => setSelection({ id: collection.id, index: 0 })}
            aria-label={'Open ' + collection.title + ', ' + collection.photos.length + ' photographs'}
          >
            <img src={collection.photos[0].src} alt="" loading="lazy" decoding="async" />
            <span>{collection.title}<small>{collection.photos.length} {collection.photos.length === 1 ? 'PHOTO' : 'PHOTOS'}</small></span>
          </button>
        ))}
      </div>
      <dialog
        ref={dialogRef}
        className={classPrefix + '__photo-dialog'}
        aria-label={label + ' viewer'}
        onClose={close}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            step(event.key === 'ArrowRight' ? 1 : -1);
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        {active && (
          <div className={classPrefix + '__photo-dialog-body'}>
            <header>
              <strong>{gallery.title}{' · '}{photo.title}</strong>
              <button type="button" onClick={close} aria-label="Close photo viewer">Close ✕</button>
            </header>
            <img src={photo.src} alt={photo.alt || label + ': ' + photo.title} />
            <nav aria-label="Photo navigation">
              <button type="button" onClick={() => step(-1)} disabled={gallery.photos.length === 1}>← Previous</button>
              <span>{selection.index + 1} / {gallery.photos.length}</span>
              <button type="button" onClick={() => step(1)} disabled={gallery.photos.length === 1}>Next →</button>
            </nav>
          </div>
        )}
      </dialog>
    </section>
  );
}
