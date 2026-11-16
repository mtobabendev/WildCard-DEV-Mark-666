import { useEffect, useRef } from 'react';
import { bindViewportPlayback, bindViewportMetadata } from './viewport-video-playback.js';

// No declarative src or autoplay: the observer owns initial media loading.
export default function ViewportVideo({
  src, active = true, viewportRef, respectReducedMotion = false, ...props
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    return bindViewportPlayback(ref.current, src, {
      target: viewportRef?.current || ref.current,
      motion: respectReducedMotion ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined,
    });
  }, [active, src, viewportRef, respectReducedMotion]);

  return <video {...props} ref={ref} muted playsInline preload="none" />;
}

// For manually played clips without posters; keep native controls and audio.
export function ViewportMetadataVideo(props) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    return bindViewportMetadata(ref.current);
  }, []);
  return <video {...props} ref={ref} preload="none" />;
}
