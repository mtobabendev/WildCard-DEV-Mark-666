import { useEffect, useRef } from 'react';
import { bindViewportPlayback, bindViewportMetadata } from './viewport-video-playback.js';
import { usePerformance } from './use-performance.js';
import { decorativeVideoBudget } from './decorative-video-budget.js';
import { getHomeMedia } from './home-performance-media.js';

const MAIN_H264 = 'video/mp4; codecs="avc1.4D401F"';

// Decorative video only. Deliberate user-controlled playback remains independent.
export default function ViewportVideo({
  src, compatibilitySrc, lightweightSrc, compatibilityPoster, fallbackSrc, active = true,
  viewportRef, respectReducedMotion = false, budgeted = false, ...props
}) {
  const ref = useRef(null);
  const profile = usePerformance();
  const variants = budgeted ? getHomeMedia(src) : {};
  const lightSource = lightweightSrc || variants.lightweightSrc;
  const poster = compatibilityPoster || variants.compatibilityPoster;
  const softwareSrc = variants.softwareSrc;
  useEffect(() => {
    const video = ref.current;
    if (!active || !video) return undefined;
    const candidate = profile.name === 'lightweight'
      ? lightSource || compatibilitySrc : compatibilitySrc || lightSource;
    // The Pi's Chromium can advertise H.264 but still fail to decode it. Keep a low-resolution VP8 alternative.
    const sources = profile.releaseOffscreen
      ? [candidate && video.canPlayType(MAIN_H264) ? candidate : null,
        softwareSrc && video.canPlayType('video/webm; codecs="vp8"') ? softwareSrc : null, src, fallbackSrc].filter(Boolean)
      : [src, fallbackSrc].filter(Boolean);
    const [source, ...fallbacks] = [...new Set(sources)];
    return bindViewportPlayback(video, source, {
      target: viewportRef?.current || video,
      budget: budgeted && profile.releaseOffscreen ? decorativeVideoBudget : undefined,
      motion: respectReducedMotion || (budgeted && profile.releaseOffscreen) ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined,
      releaseOffscreen: profile.releaseOffscreen,
      fallbackSrc: fallbacks,
    });
  }, [active, src, compatibilitySrc, lightSource, softwareSrc, fallbackSrc, viewportRef, respectReducedMotion, budgeted, profile]);

  return <video {...props} poster={props.poster || (profile.releaseOffscreen ? poster : undefined)}
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
