import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecorativeVideoBudget } from '../src/components/decorative-video-budget.js';
import { bindViewportPlayback } from '../src/components/viewport-video-playback.js';
import { lowerPerformanceProfile, PROFILES } from '../src/components/performance-profile.js';
test('budget revokes before granting; stable ties, live capacity and disposal',()=>{
 const budget=createDecorativeVideoBudget(1), active=new Set(), events=[];
 const reg=n=>budget.register(on=>{events.push([n,on]);if(on)active.add(n);else active.delete(n);assert.ok(active.size<=2)});
 const a=reg('a'),b=reg('b'),c=reg('c'); a.update(1);b.update(1);c.update(.5);assert.deepEqual([...active],['a']);
 b.update(10);assert.deepEqual(events.slice(-2),[['a',false],['b',true]]);
 budget.setLimit(2);assert.deepEqual([...active],['b','a']); budget.setLimit(1);assert.deepEqual([...active],['b']);
 b.dispose();assert.deepEqual([...active],['a']);a.update(0);assert.deepEqual([...active],['c']);c.dispose();assert.equal(active.size,0);
});
test('shared controller never leaves two decorative sources allocated in lightweight',()=>{
 const budget=createDecorativeVideoBudget(1), page=Object.assign(new EventTarget(),{hidden:false}), active=new Set();
 function fixture(n){const video=Object.assign(new EventTarget(),{source:null,getAttribute(){return this.source},setAttribute(_,v){this.source=v;active.add(n);assert.ok(active.size<=1)},removeAttribute(){this.source=null;active.delete(n)},load(){},pause(){},play(){return Promise.resolve()}});let observer;
 class Observer{constructor(fn){observer=fn}observe(){}disconnect(){}}
 const dispose=bindViewportPlayback(video,'/'+n+'.mp4',{page,Observer,releaseOffscreen:true,budget});
 return {video,dispose,see(r){observer([{target:video,isIntersecting:r>0,intersectionRatio:r}])}};}
 const a=fixture('a'),b=fixture('b');a.see(.5);b.see(1);assert.deepEqual([...active],['b']);
 a.video.dispatchEvent(new Event('pointerenter'));assert.deepEqual([...active],['a']);
 a.dispose();assert.deepEqual([...active],['b']);page.hidden=true;page.dispatchEvent(new Event('visibilitychange'));assert.equal(active.size,0);
 page.hidden=false;page.dispatchEvent(new Event('visibilitychange'));assert.deepEqual([...active],['b']);b.dispose();assert.equal(active.size,0);
});
test('profiles have monotonic downgrade and explicit playback budgets',()=>{assert.equal(PROFILES.cinematic.decorativeLimit,Infinity);assert.equal(PROFILES.balanced.decorativeLimit,2);assert.equal(PROFILES.lightweight.decorativeLimit,1);assert.equal(lowerPerformanceProfile(PROFILES.cinematic),PROFILES.balanced);assert.equal(lowerPerformanceProfile(PROFILES.balanced),PROFILES.lightweight);});

test('codec fallback tries efficient alternate then original, once each',()=>{const page=Object.assign(new EventTarget(),{hidden:false});const video=Object.assign(new EventTarget(),{source:null,getAttribute(){return this.source},setAttribute(_,s){this.source=s},removeAttribute(){this.source=null},load(){},pause(){},play(){return Promise.resolve()}});const stop=bindViewportPlayback(video,'/light.mp4',{page,Observer:null,releaseOffscreen:true,fallbackSrc:['/light.webm','/original.webm']});assert.equal(video.source,'/light.mp4');video.dispatchEvent(new Event('error'));assert.equal(video.source,'/light.webm');video.dispatchEvent(new Event('error'));assert.equal(video.source,'/original.webm');video.dispatchEvent(new Event('error'));assert.equal(video.source,'/original.webm');stop();});
