import test from 'node:test';
import assert from 'node:assert/strict';
import { bindViewportPlayback } from '../src/components/viewport-video-playback.js';

function fixture({ hidden = false, fallback = false } = {}) {
  const page = Object.assign(new EventTarget(), { hidden });
  const target = {};
  const video = {
    muted: false, source: null, plays: 0, pauses: 0, assignments: 0,
    getAttribute() { return this.source; },
    setAttribute(name, value) {
      assert.equal(name, 'src');
      this.assignments++;
      this.source = value;
    },
    play() { this.plays++; return Promise.resolve(); },
    pause() { this.pauses++; },
  };
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(node) { assert.equal(node, target); }
    disconnect() { this.disconnected = true; }
  }
  const dispose = bindViewportPlayback(video, '/panel.webm', {
    target, page, Observer: fallback ? null : Observer,
  });
  const intersect = visible => observer.callback([{ target, isIntersecting: visible }]);
  const hide = value => {
    page.hidden = value;
    page.dispatchEvent(new Event('visibilitychange'));
  };
  return { video, intersect, hide, dispose, observer };
}

test('offscreen videos have no source until they intersect', () => {
  const { video, intersect, dispose } = fixture();
  intersect(false);
  assert.equal(video.source, null);
  assert.equal(video.plays, 0);
  intersect(true);
  assert.equal(video.source, '/panel.webm');
  assert.equal(video.muted, true);
  assert.equal(video.plays, 1);
  intersect(true);
  assert.equal(video.plays, 1);
  dispose();
});

test('leaving viewport pauses and returning resumes without reassigning source', () => {
  const { video, intersect, dispose } = fixture();
  intersect(true);
  intersect(false);
  assert.equal(video.pauses, 1);
  intersect(true);
  assert.equal(video.plays, 2);
  assert.equal(video.assignments, 1);
  dispose();
});

test('hidden tab prevents initial load and pauses visible playback', () => {
  const { video, intersect, hide, dispose } = fixture({ hidden: true });
  intersect(true);
  assert.equal(video.source, null);
  hide(false);
  assert.equal(video.plays, 1);
  hide(true);
  assert.equal(video.pauses, 1);
  intersect(false);
  hide(false);
  assert.equal(video.plays, 1);
  dispose();
});

test('cleanup disconnects observer and stale callbacks cannot restart playback', () => {
  const { video, intersect, hide, dispose, observer } = fixture();
  intersect(true);
  dispose();
  assert.equal(observer.disconnected, true);
  assert.equal(video.pauses, 1);
  intersect(true);
  hide(false);
  assert.equal(video.plays, 1);
});

test('legacy fallback plays only in foreground and preserves source on resume', () => {
  const { video, hide, dispose } = fixture({ fallback: true, hidden: true });
  assert.equal(video.plays, 0);
  hide(false);
  assert.equal(video.plays, 1);
  hide(true);
  assert.equal(video.pauses, 1);
  hide(false);
  assert.equal(video.plays, 2);
  assert.equal(video.assignments, 1);
  dispose();
});
