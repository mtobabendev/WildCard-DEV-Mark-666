import test from 'node:test'
import assert from 'node:assert/strict'
import { galleryStep, bindSlideshow } from '../src/components/gallery-slideshow.js'
import { presentationForPath, cabaretAwarenessLine } from '../src/components/penny-presentation.js'
test('presentation is scoped to After Hours only',()=>{assert.equal(presentationForPath('/penny/after-hours/'),'cabaret');for(const p of ['/','/ask-penny/','/creators','/jenn/art','/penny/after-hours/extra'])assert.equal(presentationForPath(p),'standard');assert.equal(cabaretAwarenessLine({kind:'alert',text:'Official alert'}),'Official alert');assert.equal(cabaretAwarenessLine({kind:'news',text:'Headline'}),'Headline')})
test('gallery wraps and empty galleries are safe',()=>{assert.equal(galleryStep(2,3,1),0);assert.equal(galleryStep(0,3,-1),2);assert.equal(galleryStep(0,0),null)})
test('slideshow pauses on hidden and reduced motion, releases timer on close',()=>{const doc=new EventTarget();doc.hidden=false;const motion=new EventTarget();motion.matches=false;let id=0;const active=new Map();let ticks=0;const cleanup=bindSlideshow({advance:()=>ticks++,doc,motion,interval:8000,schedule:(fn,ms)=>{assert.equal(ms,8000);active.set(++id,fn);return id},cancel:n=>active.delete(n)});assert.equal(active.size,1);[...active.values()][0]();assert.equal(ticks,1);doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(active.size,0);doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));assert.equal(active.size,1);motion.matches=true;motion.dispatchEvent(new Event('change'));assert.equal(active.size,0);cleanup();motion.matches=false;motion.dispatchEvent(new Event('change'));assert.equal(active.size,0)})

import { EventEmitter } from 'node:events'
import relay from '../api/penny.js'
test('public relay defaults to Gemini, blocks alternate providers, and never falls back',async()=>{
 const old=globalThis.fetch, calls=[]
 class Reply extends EventEmitter { headers={};statusCode=200;setHeader(k,v){this.headers[k.toLowerCase()]=v}status(c){this.statusCode=c;return this}json(p){this.payload=p;return this}write(v){this.payload=(this.payload??'')+v.toString()}end(){this.writableEnded=true} }
 const req=provider=>({method:'POST',headers:{host:'www.wildcarddev.com'},body:{messages:[{role:'user',content:'synthetic test'}],...(provider===undefined?{}:{provider})}})
 try{globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return new Response('hello',{headers:{'X-Penny-Provider':'gemini'}})}
 for(const provider of [undefined,'gemini']){const res=new Reply();await relay(req(provider),res);assert.equal(res.statusCode,200);assert.equal(res.headers['x-penny-provider'],'gemini');assert.equal(res.payload,'hello')}
 for(const provider of ['openai','grok']){const res=new Reply();await relay(req(provider),res);assert.equal(res.statusCode,400)}
 assert.equal(calls.length,2);assert.ok(calls.every(c=>c.url==='https://party.wildcarddev.com/api/penny-provider'&&c.body.provider==='gemini'))
 globalThis.fetch=async()=>new Response('wrong provider',{headers:{'X-Penny-Provider':'openai'}});const res=new Reply();await relay(req(),res);assert.equal(res.statusCode,503)
 }finally{globalThis.fetch=old}
})
