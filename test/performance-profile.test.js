import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPerformance, resolvePerformance } from '../src/components/performance-profile.js';
import { bindViewportPlayback } from '../src/components/viewport-video-playback.js';

test('only Fire TV and evidence of constrained devices select lower modes', () => {
  assert.equal(detectPerformance({ userAgent: 'Mozilla AFTT Silk/108' }), 'lightweight');
  assert.equal(detectPerformance({ userAgent: 'Linux Android Silk/108 KFAPWI' }), 'cinematic');
  assert.equal(detectPerformance({ userAgent: 'Linux Firefox', platform: 'Linux aarch64' }), 'lightweight');
  assert.equal(detectPerformance({ userAgent: 'Linux x86_64', platform: 'Linux x86_64', hardwareConcurrency: 4 }), 'lightweight');
  assert.equal(detectPerformance({ userAgent: 'Linux Android', hardwareConcurrency: 4 }), 'balanced');
  assert.equal(detectPerformance({ userAgent: 'Linux x86_64', hardwareConcurrency: 8 }), 'cinematic');
  assert.equal(detectPerformance({ deviceMemory: 2 }), 'lightweight');
  assert.equal(detectPerformance({ deviceMemory: 4 }), 'balanced');
  assert.equal(detectPerformance({ saveData: true }), 'lightweight');
  assert.equal(detectPerformance({ deviceMemory: 8 }), 'cinematic');
  assert.equal(detectPerformance({ userAgent: 'Firefox Windows' }), 'cinematic');
});

test('explicit preferences override detection; unknown values use auto', () => {
  assert.equal(resolvePerformance({ userAgent: 'AFTT' }, 'cinematic').name, 'cinematic');
  assert.equal(resolvePerformance({}, 'balanced').releaseOffscreen, true);
  assert.equal(resolvePerformance({}, 'lightweight').skipIntro, true);
  assert.equal(resolvePerformance({}, 'bogus').name, 'cinematic');
});

test('constrained decorative playback releases on hide, resumes and releases on cleanup', () => {
  const page = Object.assign(new EventTarget(), { hidden: false });
  const video = {
    source: null, plays: 0, pauses: 0, loads: 0,
    getAttribute() { return this.source; },
    setAttribute(_, value) { this.source = value; },
    removeAttribute() { this.source = null; },
    load() { this.loads++; },
    play() { this.plays++; return Promise.resolve(); },
    pause() { this.pauses++; },
  };
  const dispose = bindViewportPlayback(video, '/panel.mp4', { page, Observer: null, releaseOffscreen: true });
  assert.equal(video.source, '/panel.mp4');
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.source, null);
  assert.equal(video.loads, 1);
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.loads, 1);
  page.hidden = false;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.source, '/panel.mp4');
  assert.equal(video.plays, 2);
  dispose();
  assert.equal(video.source, null);
  assert.equal(video.loads, 2);
});

test('compatibility media error falls back once and releases the fallback on hide', () => {
  const page = Object.assign(new EventTarget(), { hidden: false });
  const video = Object.assign(new EventTarget(), {
    source: null, plays: 0, loads: 0,
    getAttribute() { return this.source; },
    setAttribute(_, value) { this.source = value; },
    removeAttribute() { this.source = null; },
    load() { this.loads++; },
    play() { this.plays++; return Promise.resolve(); },
    pause() {},
  });
  const stop = bindViewportPlayback(video, '/compat.mp4', {
    page, Observer: null, releaseOffscreen: true, fallbackSrc: '/original.webm',
  });
  assert.equal(video.source, '/compat.mp4');
  video.dispatchEvent(new Event('error'));
  assert.equal(video.source, '/original.webm');
  assert.equal(video.plays, 2);
  video.dispatchEvent(new Event('error'));
  assert.equal(video.plays, 2);
  page.hidden = true;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.source, null);
  page.hidden = false;
  page.dispatchEvent(new Event('visibilitychange'));
  assert.equal(video.source, '/original.webm');
  stop();
  assert.equal(video.source, null);
});
