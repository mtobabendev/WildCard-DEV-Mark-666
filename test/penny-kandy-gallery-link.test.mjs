import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
test('featured Penny and Kandy tile links to the authenticated gallery without changing its artwork', () => {
  const src = readFileSync(new URL('../src/components/PennyKandyReel.jsx', import.meta.url), 'utf8')
  const gallery = src.match(/const GALLERY = '([^']+)'/)[1]
  const url = new URL(gallery)
  assert.equal(url.origin, 'https://party.wildcarddev.com')
  assert.equal(url.pathname, '/afterhours-members.html')
  assert.equal(url.searchParams.get('area'), 'penny')
  assert.equal(url.searchParams.get('collection'), 'Penny and Kandy')
  assert.equal(url.searchParams.get('view'), 'galleries')
  assert.match(src, /href=\{GALLERY\}/)
  assert.match(src, /penny-kandy-reel-teaser\.webp/)
})
