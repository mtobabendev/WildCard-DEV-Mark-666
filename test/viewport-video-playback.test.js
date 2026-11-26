import test from 'node:test';
import assert from 'node:assert/strict';
import { bindViewportPlayback, bindViewportMetadata } from '../src/components/viewport-video-playback.js';

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

test('optional reduced motion prevents decorative source loading and pauses on change', () => {
  const page = Object.assign(new EventTarget(), { hidden: false });
  const motion = Object.assign(new EventTarget(), { matches: true });
  const video = {
    source: null, plays: 0, pauses: 0,
    getAttribute() { return this.source; },
    setAttribute(name, value) { this.source = value; },
    play() { this.plays++; return Promise.resolve(); },
    pause() { this.pauses++; },
  };
  const dispose = bindViewportPlayback(video, '/archive.webm', { page, motion, Observer: null });
  assert.equal(video.source, null);
  motion.matches = false;
  motion.dispatchEvent(new Event('change'));
  assert.equal(video.source, '/archive.webm');
  assert.equal(video.plays, 1);
  motion.matches = true;
  motion.dispatchEvent(new Event('change'));
  assert.equal(video.pauses, 1);
  dispose();
  motion.matches = false;
  motion.dispatchEvent(new Event('change'));
  assert.equal(video.plays, 1);
});

test('native metadata hint stays deferred until first visible intersection', () => {
  const video = { preload: 'none', src: '/memory.webm', controls: true, loop: true };
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe(node) { assert.equal(node, video); }
    disconnect() { this.disconnected = true; }
  }
  const dispose = bindViewportMetadata(video, Observer);
  observer.callback([{ target: video, isIntersecting: false }]);
  assert.equal(video.preload, 'none');
  observer.callback([{ target: {}, isIntersecting: true }]);
  assert.equal(video.preload, 'none');
  observer.callback([{ target: video, isIntersecting: true }]);
  assert.equal(video.preload, 'metadata');
  assert.equal(observer.disconnected, true);
  observer.callback([{ target: video, isIntersecting: false }]);
  assert.equal(video.preload, 'metadata');
  assert.equal(video.src, '/memory.webm');
  assert.equal(video.controls, true);
  assert.equal(video.loop, true);
  dispose();
});

test('metadata observer cleanup blocks stale callbacks', () => {
  const video = { preload: 'none' };
  let observer;
  class Observer {
    constructor(callback) { this.callback = callback; observer = this; }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  const dispose = bindViewportMetadata(video, Observer);
  dispose();
  observer.callback([{ target: video, isIntersecting: true }]);
  assert.equal(video.preload, 'none');
  assert.equal(observer.disconnected, true);
});

test('metadata hint falls back to native metadata loading without observer support', () => {
  const video = { preload: 'none' };
  const dispose = bindViewportMetadata(video, null);
  assert.equal(video.preload, 'metadata');
  dispose();
});

test('constrained playback ignores slivers of visibility and releases source below 15 percent',()=>{
  const page=Object.assign(new EventTarget(),{hidden:false}); let observe;
  const target={}; const video={source:null,plays:0,pauses:0,getAttribute(){return this.source},setAttribute(_,v){this.source=v},removeAttribute(){this.source=null},load(){},play(){this.plays++;return Promise.resolve()},pause(){this.pauses++}};
  class Observer { constructor(callback,options){observe=callback;assert.deepEqual(options.threshold,[0,0.15])}observe(){}disconnect(){} }
  const stop=bindViewportPlayback(video,'/panel.webm',{page,target,Observer,releaseOffscreen:true});
  observe([{target,isIntersecting:true,intersectionRatio:.01}]); assert.equal(video.source,null);
  observe([{target,isIntersecting:true,intersectionRatio:.25}]); assert.equal(video.source,'/panel.webm');
  observe([{target,isIntersecting:true,intersectionRatio:.1}]); assert.equal(video.source,null);assert.equal(video.pauses,1);stop();
});
