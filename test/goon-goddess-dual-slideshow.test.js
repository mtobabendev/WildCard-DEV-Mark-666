import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../src/components/PennyFriends.jsx', import.meta.url), 'utf8')

test('Goon Goddess uses Mia-style independent cover and avatar slideshow', () => {
  assert.match(source, /name: 'Goon Goddess', initial: 'G', handle: '@hotnweird'/)
  assert.match(source, /pennyPrivateMedia\('goon-goddess-slides\.webp'\), frames: 9, avatarFrames: true/)
  assert.match(source, /onlyfans\.com\/hotnweird\?rec=603551670/)
  assert.match(source, /const sheetFrames = slideshow\?\.avatarFrames \? frames \* 2 : frames/)
  assert.match(source, /setCoverIndex\(\(current\) => \(current \+ 1\) % frames\)/)
  assert.match(source, /setAvatarIndex\(\(current\) =>/)
  assert.match(source, /FRIEND_SLIDESHOW_INTERVAL_MS = 6000/)
})
