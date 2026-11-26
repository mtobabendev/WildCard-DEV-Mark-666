import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8')

test('Kandy homepage spinner points Fans and Music to After Hours, while Art & Tarot preserves showcase', () => {
  const app = read('src/App.jsx')
  const styles = read('src/styles.css')
  assert.match(app, /kandy-link-card--fans" href="\/kandy\/after-hours"/)
  assert.match(app, /kandy-link-card--music" href="\/kandy\/after-hours\?tab=music"/)
  assert.match(app, /kandy-link-card--tarot" href="\/kandy\/showcase"/)
  assert.match(app, /kandy-link-card--stripagram/)
  assert.match(app, /kandy-link-card--suno/)
  assert.doesNotMatch(app, /kandy-link-card--play"|kandy-link-card--apple"/)
  assert.match(styles, /"facebook hub suno"[\s\S]*"music hub tarot"[\s\S]*"fans hub stripagram"/)
  assert.match(styles, /\.kandy-link-card--music \{[\s\S]*?grid-area: music;/)
  assert.match(styles, /\.kandy-link-card--tarot \{[\s\S]*?grid-area: tarot;/)
  assert.match(styles, /\.mini-spinner--kandy \.mini-spinner-track > a:nth-child\(6\)/)
})

test('Kandy Art & Tarot creative portfolio is preserved and linked from After Hours', () => {
  const showcase = read('src/CreatorShowcase.jsx')
  const profile = read('src/components/AfterHoursPublicProfile.jsx')
  const routes = read('src/main.jsx')
  assert.match(showcase, /src="\/static\/KandyRealTarotHot\.webm"/)
  assert.match(showcase, /\['art', 'Art'\], \['tarot', 'Tarot'\]/)
  assert.match(showcase, /Music at WildCard DEV', href:'\/kandy\/after-hours\?tab=music'/)
  assert.match(showcase, /Listen to Kandy's complete music library on WildCard DEV/)
  assert.match(profile, /name: 'Kandy Art & Tarot', href: '\/kandy\/showcase'/)
  assert.match(routes, /'\/kandy\/showcase'/)
  assert.match(routes, /'\/kandy\/after-hours'/)
})
