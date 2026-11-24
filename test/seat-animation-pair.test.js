import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

test('seat companion stays private and both previews share one playback state', () => {
  const component = readFileSync(new URL('../src/components/SeatAnimationPair.jsx', import.meta.url), 'utf8')
  assert.match(component, /pennyPrivateMedia\('5041\.webm'\)/)
  assert.equal(existsSync(new URL('../public/static/5041.webm', import.meta.url)), false)
  assert.match(component, /active=\{!paused\}/)
  assert.match(component, /clip\(original, 'left'/)
  assert.match(component, /clip\(SEAT_COMPANION, 'right'/)
  assert.match(component, /setPaused\(value => !value\)/)
  for (const path of ['../src/PennyAfterHours.jsx', '../src/components/AfterHoursDesktop.jsx']) {
    assert.match(readFileSync(new URL(path, import.meta.url), 'utf8'), /<SeatAnimationPair/)
  }
})
