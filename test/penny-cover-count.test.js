import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { advancePostCount, FIRST_POST_COUNT, LAST_POST_COUNT, POST_COUNT_TICK_MS } from '../src/components/PennyCoverCountCycle.js'

function source(path) { return readFileSync(new URL(path, import.meta.url), 'utf8') }

test('the decorative Posts counter starts at 666, resets to 661, then increments every two seconds', () => {
  assert.equal(FIRST_POST_COUNT, 661)
  assert.equal(LAST_POST_COUNT, 666)
  assert.equal(POST_COUNT_TICK_MS, 2000)
  let current = LAST_POST_COUNT
  const cycle = Array.from({ length: 12 }, () => (current = advancePostCount(current)))
  assert.deepEqual(cycle, [661, 662, 663, 664, 665, 666, 661, 662, 663, 664, 665, 666])
})

test('both banner versions use the same cover count, not the published preview inventory', () => {
  assert.match(source('../src/PennyAfterHours.jsx'), /<PennyCoverCount \/>/)
  assert.match(source('../src/components/AfterHoursDesktop.jsx'), /<PennyCoverCount \/>/)
  const component = source('../src/components/PennyCoverCount.jsx')
  assert.match(component, /if \(!document\.hidden\) setCount\(advancePostCount\)/)
  assert.match(component, /if \(reduceMotion\)/)
  assert.match(component, /aria-live="off"/)
  assert.match(component, /count === FIRST_POST_COUNT.*penny-cover-count__digits--glitch/)
})
