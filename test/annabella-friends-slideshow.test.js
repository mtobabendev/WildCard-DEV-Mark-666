import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const friendSource = readFileSync(new URL('../src/components/PennyFriends.jsx', import.meta.url), 'utf8')
const spritePath = new URL('../public/static/annabella-ivy-slides.webp', import.meta.url)
const sprite = readFileSync(spritePath)

test('Annabella Ivy uses the existing rotating Friends slideshow rather than a static image', () => {
  assert.match(friendSource,
    /name: 'Annabella Ivy'[\s\S]*?handle: '@annabellaivy'[\s\S]*?slideshow: \{ src: '\/static\/annabella-ivy-slides\.webp', frames: 9, avatarFrames: true \}/)
  assert.doesNotMatch(friendSource, /name: 'Annabella Ivy'[^\n]*image: pennyPrivateMedia/)
  assert.match(friendSource, /https:\/\/onlyfans\.com\/annabellaivy\?rec=603551670/)
  assert.match(friendSource, /const FRIEND_SLIDESHOW_INTERVAL_MS = 6000/)
  assert.match(friendSource, /setCoverIndex\(\(current\) => \(current \+ 1\) % frames\)/)
  assert.match(friendSource, /setAvatarIndex\(\(current\) =>/)
})

test('sprite is a compact locally hosted WebP containing two separate 9-frame strips', () => {
  assert.ok(statSync(spritePath).size > 20000)
  assert.ok(statSync(spritePath).size < 150000)
  assert.equal(sprite.toString('ascii', 0, 4), 'RIFF')
  assert.equal(sprite.toString('ascii', 8, 12), 'WEBP')
  assert.match(friendSource, /const sheetFrames = slideshow\?\.avatarFrames \? frames \* 2 : frames/)
  assert.match(friendSource, /index \+ \(avatar && slideshow.avatarFrames \? frames : 0\)/)
})

test('all thirteen Friends remain present and existing Mia / LALA setups are unchanged', () => {
  const entries = [...friendSource.matchAll(/name: '[^']+', initial:/g)]
  assert.equal(entries.length, 13)
  assert.match(friendSource, /name: 'Mia Brookes'[\s\S]*?frames: 6/)
  assert.match(friendSource, /name: 'LALA'[\s\S]*?frames: 8, avatarFrames: true/)
})
