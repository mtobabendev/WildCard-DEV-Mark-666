import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

function file(path) { return readFileSync(new URL(path, import.meta.url), 'utf8') }

test('mobile and desktop use three tabs and render protected collections within media tabs', () => {
  const mobile = file('../src/PennyAfterHours.jsx')
  const desktop = file('../src/components/AfterHoursDesktop.jsx')
  assert.match(mobile, /<PennyAfterHoursSpinner \/>/)
  assert.match(desktop, /<PennyAfterHoursSpinner \/>/)
  for (const source of [mobile, desktop]) {
    assert.doesNotMatch(source, /chooseTab\('private'\)|openTab\('private'\)/)
    assert.match(source, /PennyPrivateCollections view="galleries"|PennyPrivateCollections view='galleries'/)
    assert.match(source, /PennyPrivateCollections view="reels"|PennyPrivateCollections view='reels'/)
  }
  assert.match(mobile, /openTab\('photos'\)/)
  assert.match(mobile, /openTab\('videos'\)/)
  assert.match(desktop, /chooseTab\('photos'\)/)
  assert.match(desktop, /chooseTab\('videos'\)/)
})
test('private frame reuses Party grant checks and trusts only the exact Party origin', () => {
  const component = file('../src/components/PennyPrivateCollections.jsx')
  const gate = file('../src/components/AfterHoursGate.jsx')
  assert.match(component, /https:\/\/party\.wildcarddev\.com/)
  assert.match(component, /afterhours-members\.html\?area=penny&embed=1/)
  assert.match(component, /event\.origin !== PARTY/)
  assert.match(component, /event\.source !== frameRef\.current\?\.contentWindow/)
  assert.match(component, /data\.area !== 'penny'/)
  assert.match(component, /referrerPolicy="origin"/)
  assert.match(gate, /status === 'allowed' \? <>\{children\}<\/>/)
  assert.doesNotMatch(gate, /approved-members media vault/)
})
