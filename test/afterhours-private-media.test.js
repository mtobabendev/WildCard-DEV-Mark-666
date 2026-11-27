import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const base = new URL('../public/static/', import.meta.url)
const publicFriendFiles = ['KandyOnlyFans2.jpg',
  'friends/aisha-moon-slides.webp',
  'friends/angel-jessy-slides.webp',
  'friends/brooke-slides.webp',
  'friends/evemarie-slides.webp',
  'friends/karley-stokes-slides.webp',
  'friends/lacie-heart-slides.webp',
  'friends/mia-slides.webp',
  'friends/snow-bird-slides.webp'
]
const formerlyPrivateFiles = [
  ...Array.from({ length: 8 }, (_, i) => (i + 1) + '.jpg'),
  'PennyOnlyFansBanner.jpg', 'KandyOnlyFans2.jpg',
  'PennySeatAtTheTable.webm', 'AnimePenny.webm',
  'PennyAfterHoursPatchNotes.webm', 'PennyAfterHoursPatchNotes.webp',
  'PennyNewFansBanner.webm', 'PennyOnlyFanzProfile-web.webm',
  'penny-after-hours-cover.webp',
  ...['PennyCard1.webm', 'Card2.webm', 'PennyCard3.webm', 'Yoga.mp4',
    'PennyCard4.webm', 'PennyQueen.mp4',
    ...Array.from({ length: 6 }, (_, i) => 'poster-' + (i + 1) + '.jpg')]
    .map(name => 'penny-classic-cards/' + name),
  ...['aisha-moon-slides.webp', 'angel-jessy-slides.webp', 'annabella.webp',
    'brooke-slides.webp', 'evemarie-slides.webp', 'karley-stokes-slides.webp',
    'lacie-heart-slides.webp', 'lala.webp', 'mia-slides.webp', 'snow-bird-slides.webp']
    .map(name => 'friends/' + name),
]

const restoredCartoons = ['PennySeatAtTheTable.webm']
const privateFiles = formerlyPrivateFiles.filter(file => !publicFriendFiles.includes(file) && !restoredCartoons.includes(file))

test('Owner-designated Friends assets and seat cartoon are public; remaining private assets stay absent', () => {
  assert.equal(formerlyPrivateFiles.length, 39)
  assert.equal(privateFiles.length, 29)
  for (const file of restoredCartoons) assert.equal(existsSync(new URL(file, base)), true, file)
  for (const file of publicFriendFiles) assert.equal(existsSync(new URL(file, base)), true, file)
  for (const file of privateFiles) {
    assert.equal(existsSync(new URL(file, base)), false, file + ' is still public')
  }
})

test('private content and Ashley loop use authenticated Party media while existing Friends assets stay public', () => {
  const files = [
    '../src/PennyAfterHours.jsx',
    '../src/components/AfterHoursDesktop.jsx',
    '../src/components/PennyFriends.jsx',
    '../src/components/PennyAfterHoursSpinner.jsx',
    '../src/components/PennyClassicCards.jsx',
  ]
  const sources = files.map(file => readFileSync(new URL(file, import.meta.url), 'utf8'))
  for (const [i,source] of sources.entries()) {
    if (i === 2) {
      // Only Ashley's new loop is private; existing public Friends assets stay public.
      assert.deepEqual([...source.matchAll(/pennyPrivateMedia\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map(match => match[1]), ['ashley-friend-loop.mp4'])
      assert.match(source, /cover: ASHLEY_FRIEND_VIDEO, avatar: ASHLEY_FRIEND_VIDEO, avatarOffset: 10/)
      assert.equal(existsSync(new URL('ashley-friend-loop.mp4', base)), false)
      assert.equal(existsSync(new URL('friends/ashley-friend-loop.mp4', base)), false)
      assert.doesNotMatch(source, /\/static\/(?:friends\/)?ashley-friend-loop\.mp4/)
      for (const file of publicFriendFiles) assert.ok(source.includes('/static/' + file), file)
    } else assert.match(source, /pennyPrivateMedia/)
  }
  for (const file of privateFiles) {
    const path = '/static/' + file
    for (const source of sources) assert.equal(source.includes(path), false, path)
  }
  assert.match(sources[0], /AfterHoursDesktop/)
  assert.match(sources[0], /PennyFriendCard/)
  assert.match(sources[0], /UserLoopVideo/)
  assert.match(sources[1], /AfterHoursDesktop/)
  assert.match(sources[2], /Snow Bird/)
  assert.match(sources[2], /Karley Stokes/)
  assert.match(sources[2], /Evemarie/)
})

test('one Messenger gate replaced the old 216 combination', () => {
  const penny = readFileSync(new URL('../src/PennyAfterHours.jsx', import.meta.url), 'utf8')
  const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(penny, /digits\.join|setUnlocked|PennyCombinationDial/)
  assert.match(main, /AfterHoursGate area="penny"/)
  assert.match(main, /AfterHoursGate area=\{area\}/)
})

test('shared public branding and Ashley memorial media are preserved', () => {
  for (const file of ['Penny.gif', 'NursePennyPortrait.jpg',
    'AnimePenny3.webm', 'AshleyPenthouseMemory.webp', 'NaughtyAshley.webm']) {
    assert.equal(existsSync(new URL(file, base)), true, file)
  }
})
