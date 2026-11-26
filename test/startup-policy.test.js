import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldSkipIntro, rememberIntro, deferAnalytics } from '../src/components/startup-policy.js';
function fakeWindow() {
  const storage = new Map();
  const win = Object.assign(new EventTarget(), { location:{pathname:'/'}, matchMedia:()=>({matches:false}), sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}, setTimeout, clearTimeout });
  return win;
}
test('cinematic intro runs once per tab; reduced-motion and lightweight bypass it',()=>{
  const win=fakeWindow();
  assert.equal(shouldSkipIntro({skipIntro:false},win),false);
  assert.equal(shouldSkipIntro({skipIntro:true},win),true);
  rememberIntro(win);
  assert.equal(shouldSkipIntro({skipIntro:false},win),true);
  const fresh=fakeWindow(); fresh.matchMedia=()=>({matches:true});
  assert.equal(shouldSkipIntro({skipIntro:false},fresh),true);
  fresh.matchMedia=()=>({matches:false}); fresh.location.pathname='/grimoire/';
  assert.equal(shouldSkipIntro({skipIntro:false},fresh),true);
});
test('blocked session storage does not break intro',()=>{
  const win=fakeWindow(); win.sessionStorage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
  assert.equal(shouldSkipIntro({skipIntro:false},win),false); assert.doesNotThrow(()=>rememberIntro(win));
});
test('analytics starts on interaction only once and can be cancelled',()=>{
  const win=fakeWindow(); let calls=0; const dispose=deferAnalytics(win,()=>calls++);
  assert.equal(calls,0); win.dispatchEvent(new Event('pointerdown')); win.dispatchEvent(new Event('keydown')); assert.equal(calls,1); dispose();
  const stop=deferAnalytics(win,()=>calls++); stop(); win.dispatchEvent(new Event('keydown')); assert.equal(calls,1);
});
test('analytics has a bounded fallback',()=>{
  const win=fakeWindow(); let callback; let calls=0; win.setTimeout=(fn,ms)=>{assert.equal(ms,12000);callback=fn;return 1};win.clearTimeout=()=>{};
  const dispose=deferAnalytics(win,()=>calls++); callback(); callback(); assert.equal(calls,1);dispose();
});
