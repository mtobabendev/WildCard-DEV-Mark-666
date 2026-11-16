import { useEffect, useRef } from 'react';
import { bindViewportPlayback } from './viewport-video-playback.js';

// No declarative src or autoplay: the observer owns initial media loading.
export default function ViewportVideo({ src, active = true, viewportRef, ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    return bindViewportPlayback(ref.current, src, {
      target: viewportRef?.current || ref.current,
    });
  }, [active, src, viewportRef]);

  return <video {...props} ref={ref} muted playsInline preload="none" />;
}
