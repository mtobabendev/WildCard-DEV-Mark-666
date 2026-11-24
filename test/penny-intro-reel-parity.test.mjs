import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('desktop and mobile show the same Penny bio and More Info, with reel moved into featured row', () => {
  const desktop = source('src/components/AfterHoursDesktop.jsx')
  const mobile = source('src/PennyAfterHours.jsx')
  const shared = source('src/components/PennyAfterHoursIntro.jsx')
  const spotlight = source('src/components/PennySpotlightRow.jsx')

  for (const layout of [desktop, mobile]) {
    assert.match(layout, /import \{ PennyAfterHoursBio, PennyAfterHoursMoreInfo \}/)
    assert.match(layout, /<PennyAfterHoursBio\b/)
    assert.match(layout, /<PennyAfterHoursMoreInfo\s*\/>/)
    assert.match(layout, /<PennySpotlightRow\s*\/>/)
  }
  assert.match(desktop, /showInfo && <div className="ah-desktop__more-info"/)
  assert.match(mobile, /hidden=\{!bioExpanded\}/)
  assert.match(shared, /Hey there, gorgeous/)
  assert.match(shared, /midnight confessions/)
  assert.match(shared, /♠💋/)
  assert.match(shared, /😈/)
  assert.match(shared, /🖤/)
  assert.doesNotMatch(shared, /PennyKandyReel/)
  assert.match(spotlight, /<PennyKandyReel\s*\/>/)
})

test('featured teaser opens the authorized photoshoot collection directly', () => {
  const reel = source('src/components/PennyKandyReel.jsx')
  assert.match(reel, /penny-kandy-reel-teaser\.webp/)
  assert.match(reel, /href=\{GALLERY\}/)
  assert.match(reel, /aria-label="Open Penny and Kandy photoshoot gallery"/)
  const url = new URL(reel.match(/const GALLERY = '([^']+)'/)[1])
  assert.equal(url.origin, 'https://party.wildcarddev.com')
  assert.equal(url.searchParams.get('area'), 'penny')
  assert.equal(url.searchParams.get('collection'), 'Penny and Kandy')
  assert.doesNotMatch(reel, /showModal\(\)/)
})
