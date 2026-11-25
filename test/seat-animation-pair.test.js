import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'

test('both seat animations use static media and share one playback state', () => {
  const component = readFileSync(new URL('../src/components/SeatAnimationPair.jsx', import.meta.url), 'utf8')
  assert.ok(component.includes("SEAT_COMPANION = '/static/PennySeatAtTheTableCompanion.webm'"))
  assert.doesNotMatch(component, /pennyPrivateMedia/)
  const companion=readFileSync(new URL('../public/static/PennySeatAtTheTableCompanion.webm',import.meta.url))
  assert.equal(companion.length,1848705)
  assert.equal(createHash('sha256').update(companion).digest('hex'),'09d1edaf63f556b6e8f6bfd9273b727ee56e8383ea32854f28231e7a890df9e1')
  assert.ok(existsSync(new URL('../public/static/PennySeatAtTheTable.webm',import.meta.url)))
  assert.equal(existsSync(new URL('../public/static/5041.webm', import.meta.url)), false)
  assert.match(component, /active=\{!paused\}/)
  assert.match(component, /clip\(original, 'left'/)
  assert.match(component, /clip\(SEAT_COMPANION, 'right'/)
  assert.match(component, /setPaused\(value => !value\)/)
  for (const path of ['../src/PennyAfterHours.jsx', '../src/components/AfterHoursDesktop.jsx']) {
    const source=readFileSync(new URL(path, import.meta.url), 'utf8')
    assert.match(source, /<SeatAnimationPair/)
    assert.ok(source.includes("'/static/PennySeatAtTheTable.webm'"))
    assert.ok(!source.includes("pennyPrivateMedia('PennySeatAtTheTable.webm')"))
  }
})
