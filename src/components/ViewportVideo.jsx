import { useEffect, useRef } from 'react';
import { bindViewportPlayback, bindViewportMetadata } from './viewport-video-playback.js';
import { getPerformance } from './performance-profile.js';

const MAIN_H264 = 'video/mp4; codecs="avc1.4D401F"';

// Decorative video only. Deliberate user-controlled playback remains independent.
export default function ViewportVideo({
  src, compatibilitySrc, lightweightSrc, compatibilityPoster, active = true,
  viewportRef, respectReducedMotion = false, ...props
}) {
  const ref = useRef(null);
  const profile = getPerformance();
  useEffect(() => {
    const video = ref.current;
    if (!active || !video) return undefined;
    const candidate = profile.name === 'lightweight'
      ? lightweightSrc || compatibilitySrc : compatibilitySrc;
    const source = profile.releaseOffscreen && candidate && video.canPlayType(MAIN_H264)
      ? candidate : src;
    return bindViewportPlayback(video, source, {
      target: viewportRef?.current || video,
      motion: respectReducedMotion ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined,
      releaseOffscreen: profile.releaseOffscreen,
      fallbackSrc: source === src ? undefined : src,
    });
  }, [active, src, compatibilitySrc, lightweightSrc, viewportRef, respectReducedMotion, profile]);

  return <video {...props} poster={props.poster || (profile.releaseOffscreen ? compatibilityPoster : undefined)}
    ref={ref} muted playsInline preload="none" />;
}

// Native controls and audio remain available; defer metadata only.
export function ViewportMetadataVideo(props) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return undefined;
    return bindViewportMetadata(ref.current);
  }, []);
  return <video {...props} ref={ref} preload="none" />;
}
