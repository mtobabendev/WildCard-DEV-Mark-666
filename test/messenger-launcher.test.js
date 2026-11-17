import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/static/messenger-launcher.js', import.meta.url), 'utf8');
const PARTY = 'https://party.wildcarddev.com';
const PREFIX = 'wildcard:messenger:v1:';

function harness(origin = 'https://www.wildcarddev.com') {
  class Events {
    listeners = new Map();
    addEventListener(type, fn) { this.listeners.set(type, [...(this.listeners.get(type) || []), fn]); }
    dispatchEvent(event) { for (const fn of this.listeners.get(event.type) || []) fn(event); }
  }
  let document;
  class Node extends Events {
    constructor(tag) { super(); this.tagName = tag; this.children = []; this.attrs = {}; this.dataset = {}; this.isConnected = true; this.open = false; this.hidden = false; this.textContent = ''; this.classList = { toggle: (key, enabled) => { this[key] = enabled; } }; }
    append(...children) { this.children.push(...children); }
    attachShadow() { this.shadowRoot = new Node('shadow'); return this.shadowRoot; }
    setAttribute(k,v) { this.attrs[k] = v; }
    getAttribute(k) { return this.attrs[k]; }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.dispatchEvent({type:'close'}); }
  }
  const sent = [];
  document = new Events();
  document.body = new Node('body');
  document.activeElement = document.body;
  document.hidden = false;
  document.querySelector = tag => document.body.children.find(n => n.tagName === tag) || null;
  document.createElement = tag => {
    const node = new Node(tag);
    if (tag === 'iframe') node.contentWindow = { postMessage: (data, target) => sent.push({data,target}) };
    return node;
  };
  const window = new Events(); window.top = window;
  runInNewContext(source, { window, document, location: {origin, href:origin+'/'}, URL, Element:Node, Event:class {constructor(type){this.type=type;}}, setTimeout:()=>1, clearTimeout:()=>{} });
  const host = document.querySelector('wildcard-messenger');
  const nodes = host?.shadowRoot.children || [];
  const launcher = nodes[1], toast = nodes[2], dialog = nodes[3], frame = dialog?.children[2];
  const receive = (kind, data = {}, from = PARTY, sender = frame?.contentWindow) => window.dispatchEvent({type:'message',origin:from,source:sender,data:{type:PREFIX+kind,...data}});
  return {window,document,host,launcher,toast,dialog,frame,receive,sent};
}

test('Messenger opens and closes in place, validates sender and restores focus', () => {
  const h = harness();
  h.receive('ready');
  assert.equal(h.sent.at(-1).data.open, false);
  assert.equal(h.sent.at(-1).target, PARTY);
  h.receive('unread',{count:3,signedIn:true},'https://evil.test');
  assert.equal(h.launcher.children[0].hidden,true);
  h.receive('unread',{count:3,signedIn:true},PARTY,{});
  assert.equal(h.launcher.children[0].hidden,true);
  h.receive('unread',{count:3,signedIn:true});
  assert.equal(h.launcher.unread,true);
  assert.equal(h.launcher.children[0].textContent,'3');
  assert.equal(h.toast.hidden,false);
  h.launcher.dispatchEvent({type:'click'});
  assert.equal(h.dialog.open,true);
  assert.equal(h.sent.at(-1).data.open,true);
  assert.equal(h.toast.hidden,true);
  h.receive('unread',{count:0,signedIn:true});
  assert.equal(h.launcher.unread,false);
  h.receive('close');
  assert.equal(h.dialog.open,false);
  assert.equal(h.sent.at(-1).data.open,false);
  assert.equal(h.document.activeElement,h.launcher);
});
test('unread toast does not repeat for unchanged counts and resets on logout', () => {
  const h = harness();
  h.receive('unread',{count:2,signedIn:true});
  assert.equal(h.toast.hidden,false);
  h.toast.children[1].children[1].dispatchEvent({type:'click'});
  assert.equal(h.toast.hidden,true);
  h.receive('unread',{count:2,signedIn:true});
  assert.equal(h.toast.hidden,true);
  h.receive('unread',{count:3,signedIn:true});
  assert.equal(h.toast.hidden,false);
  h.receive('unread',{count:99,signedIn:false});
  assert.equal(h.launcher.children[0].hidden,true);
  assert.equal(h.toast.hidden,true);
});
test('cross-site aliases use full-app fallback and unknown hosts receive no widget', () => {
  const alias = harness('https://pennytube.vercel.app');
  assert.equal(alias.launcher.tagName,'a');
  assert.equal(alias.launcher.href,PARTY+'/?app=messenger');
  assert.equal(alias.dialog,undefined);
  assert.equal(harness('https://evil.test').host,null);
});
