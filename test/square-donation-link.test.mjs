import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const current = 'https://square.link/u/YnAVr8ht'
const obsolete = 'https://square.link/u/sb0tYH9C'
const paths = [
  'src/App.jsx',
  'src/PennyAfterHours.jsx',
  'src/components/AfterHoursDesktop.jsx',
]

test('WildCard DEV uses the Owner-provided Square checkout on every donation surface', () => {
  for (const path of paths) {
    const src = readFileSync(new URL('../' + path, import.meta.url), 'utf8')
    assert.ok(src.includes(current), path + ' must use the current Square link')
    assert.ok(!src.includes(obsolete), path + ' must not use the deleted checkout')
  }
})
