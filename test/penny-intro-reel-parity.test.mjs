import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('desktop and mobile show the same Penny bio, More Info and reel', () => {
  const desktop = source('src/components/AfterHoursDesktop.jsx')
  const mobile = source('src/PennyAfterHours.jsx')
  const shared = source('src/components/PennyAfterHoursIntro.jsx')

  for (const layout of [desktop, mobile]) {
    assert.match(layout, /import \{ PennyAfterHoursBio, PennyAfterHoursMoreInfo \}/)
    assert.match(layout, /<PennyAfterHoursBio\b/)
    assert.match(layout, /<PennyAfterHoursMoreInfo\s*\/>/)
  }
  assert.match(desktop, /showInfo && <div className="ah-desktop__more-info"/)
  assert.match(mobile, /hidden=\{!bioExpanded\}/)
  assert.match(shared, /Hey there, gorgeous/)
  assert.match(shared, /midnight confessions/)
  assert.match(shared, /♠💋/)
  assert.match(shared, /😈/)
  assert.match(shared, /🖤/)
  assert.match(shared, /<PennyKandyReel\s*\/>/)
})

test('reel teaser and both images remain linked to one accessible modal', () => {
  const reel = source('src/components/PennyKandyReel.jsx')
  assert.match(reel, /penny-kandy-reel-teaser\.webp/)
  assert.match(reel, /penny-kandy-reel-hero\.webp/)
  assert.match(reel, /penny-kandy-reel-inset\.webp/)
  assert.match(reel, /onClick=\{openReel\}/)
  assert.match(reel, /showModal\(\)/)
  assert.match(reel, /dialog/)
  assert.match(reel, /FRAME_MS = 4500/)
})
