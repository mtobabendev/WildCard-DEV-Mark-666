import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

const source = path => readFileSync(new URL(path, import.meta.url), 'utf8')

test('Nurse Penny tap toggle reuses one component on mobile and desktop', () => {
  const mobile = source('../src/PennyAfterHours.jsx')
  const desktop = source('../src/components/AfterHoursDesktop.jsx')
  assert.match(mobile, /<NursePennyEasterEgg className="penny-fans__nurse-easter-egg" \/>/)
  assert.match(desktop, /post\.id === 'nurse-post' \? <NursePennyEasterEgg className="ah-desktop__post-image" \/>/)
  assert.match(desktop, /onClick=\{\(\) => setSelected\(post\.media\)\}/)
})

test('tap starts the approved muted autoplay loop; second tap restores unchanged photo', () => {
  const component = source('../src/components/NursePennyEasterEgg.jsx')
  assert.match(component, /const VIDEO = '\/static\/SpermBankPennyLoop\.webm'/)
  assert.match(component, /PHOTO = '\/static\/NursePennyPortrait\.jpg'/)
  assert.match(component, /setShowVideo\(previous => !previous\)/)
  assert.match(component, /autoPlay muted loop playsInline/)
  assert.match(component, /showVideo \? <video/)
  assert.match(component, /: <img/)
  assert.match(component, /onError=\{\(\) => setShowVideo\(false\)\}/)
  assert.doesNotMatch(component, /pennyPrivateMedia|api\/afterhours\/media\?/)
})

test('nurse media styles preserve the existing image footprint and clickable area', () => {
  const css = source('../src/components/NursePennyEasterEgg.css')
  assert.match(css, /aspect-ratio: 1496 \/ 1023/)
  assert.match(css, /object-fit: contain/)
  assert.match(css, /pointer-events: none/)
  assert.match(css, /focus-visible/)
})

test('user-supplied clip is packaged alongside the approved static post media', () => {
  const clip = new URL('../public/static/SpermBankPennyLoop.webm', import.meta.url)
  const bytes = readFileSync(clip)
  assert.ok(statSync(clip).size > 600000)
  assert.ok(statSync(clip).size < 1000000)
  assert.deepEqual([...bytes.subarray(0, 4)], [0x1a, 0x45, 0xdf, 0xa3])
})
