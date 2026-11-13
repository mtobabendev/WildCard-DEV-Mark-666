import { useEffect, useRef } from 'react';
import { bindAvatarPlayback } from './penny-avatar-playback.js';

export default function ExhibitVideoPreview({ video, poster, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return;
    return bindAvatarPlayback(node, video, document, window.matchMedia('(prefers-reduced-motion: reduce)'));
  }, [video, active]);
  return <video ref={ref} poster={poster} muted loop playsInline preload="none" aria-hidden="true" className="creator-display__card-video" />;
}
