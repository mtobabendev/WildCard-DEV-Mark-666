import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('Kandy mobile exposes the same private Music tab as desktop', () => {
  const view = read('src/AfterHoursPrivateArea.jsx')
  const css = read('src/CreatorMemberProfile.css')

  assert.match(view, /area === 'kandy' \? \['posts', 'photos', 'videos', 'music', 'profile'\]/)
  assert.match(view, /area === 'kandy' && !desktop && <button[^>]*className="creator-member__music-shortcut"/)
  assert.match(view, /area === 'kandy' && <button type="button" aria-current=\{tab === 'music' \? 'page'/)
  assert.match(view, /<span>Music<\/span>/)
  assert.match(view, /const openMusic = \(\) => \{/)
  assert.match(view, /choose\('music'\)/)
  assert.match(view, /scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\)/)
  assert.match(css, /\.creator-member--kandy \.penny-fans__bottom-nav \{ grid-template-columns:repeat\(5,minmax\(0,1fr\)\); \}/)
  assert.match(css, /\.creator-member \.penny-fans__bottom-nav \{ grid-template-columns:repeat\(4,minmax\(0,1fr\)\); \}/)
})

test('Music deep link preserves other query parameters and uses the private vault player', () => {
  const view = read('src/AfterHoursPrivateArea.jsx')
  const collections = read('src/components/PennyPrivateCollections.jsx')
  assert.match(view, /new URLSearchParams\(window.location.search\)\.get\('tab'\)/)
  assert.match(view, /url\.searchParams\.set\('tab', next\)/)
  assert.match(view, /window\.history\.replaceState\(null, '', url\)/)
  assert.match(view, /tab === 'music' \? 'music' : 'galleries'/)
  assert.match(collections, /'reels', 'music'/)
  assert.match(collections, /party\.wildcarddev\.com/)
})
