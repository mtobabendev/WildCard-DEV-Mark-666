import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
const source=readFileSync(new URL('../src/components/PennyFriends.jsx',import.meta.url),'utf8')
const expected=[['mia-slides.webp',6,false],['brooke-slides.webp',5,false],['aisha-moon-slides.webp',8,false],['angel-jessy-slides.webp',9,false],['lacie-heart-slides.webp',10,false],['snow-bird-slides.webp',7,false],['evemarie-slides.webp',8,true],['karley-stokes-slides.webp',8,true]]
test('all eight restored slide sheets retain their original cover and avatar frame configurations',()=>{
 for(const [file,frames,dual] of expected){
  assert.ok(source.includes("src: '/static/friends/"+file+"', frames: "+frames+(dual?', avatarFrames: true':'')+" }"),file)
  const path=new URL('../public/static/friends/'+file,import.meta.url)
  assert.ok(existsSync(path),file)
  const bytes=readFileSync(path)
  assert.equal(bytes.toString('ascii',0,4),'RIFF',file)
  assert.equal(bytes.toString('ascii',8,12),'WEBP',file)
 }
 assert.ok(source.includes('FRIEND_SLIDESHOW_INTERVAL_MS = 6000'))
 assert.ok(source.includes('setCoverIndex((current) => (current + 1) % frames)'))
 assert.ok(source.includes('setAvatarIndex((current) =>'))
 assert.ok(source.includes("accent: 'snow-bird'"))
 assert.equal([...source.matchAll(/name: '[^']+', initial:/g)].length,13)
})
