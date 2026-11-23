import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const base = new URL('../public/static/', import.meta.url)
const privateFiles = [
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

test('all 39 private Penny assets, including new friends, are absent from site public tree', () => {
  assert.equal(privateFiles.length, 39)
  for (const file of privateFiles) {
    assert.equal(existsSync(new URL(file, base)), false, file + ' is still public')
  }
})

test('new desktop and friend designs use the authenticated Party media resolver', () => {
  const files = [
    '../src/PennyAfterHours.jsx',
    '../src/components/AfterHoursDesktop.jsx',
    '../src/components/PennyFriends.jsx',
    '../src/components/PennyAfterHoursSpinner.jsx',
    '../src/components/PennyClassicCards.jsx',
  ]
  const sources = files.map(file => readFileSync(new URL(file, import.meta.url), 'utf8'))
  for (const source of sources) assert.match(source, /pennyPrivateMedia/)
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
