import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')
test('mobile thought position follows existing avatar expansion and restores when collapsed', () => {
  const page = read('src/PennyAfterHours.jsx')
  const css = read('src/components/PennyThoughtBubble.css')
  assert.match(page, /profileExpanded \? ' penny-fans__profile--avatar-expanded' : ''/)
  assert.match(page, /setProfileExpanded\(\(value\) => !value\)/)
  assert.match(css, /\.penny-fans__profile > \.penny-thought--after-hours \{[\s\S]*?position: absolute/)
  assert.match(css, /\.penny-fans__profile--avatar-expanded > \.penny-thought--after-hours \{[\s\S]*?position: relative;[\s\S]*?grid-row: 1;/)
  assert.match(css, /margin: 0 0 0 calc\(var\(--pf-avatar-size\) \+ var\(--pf-expanded-eye-width\) \+ 2 \* var\(--pf-expanded-gap\)\)/)
  assert.match(css, /@media \(max-width: 365px\)/)
})
