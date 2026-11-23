import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { INITIAL_LIKES_TENTHS, formatLikes, nextLikesTenths, randomLikesDelay } from '../src/components/PennyLikesCycle.js'

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('Likes start at 216K and grow by 0.1K forever', () => {
  assert.equal(formatLikes(INITIAL_LIKES_TENTHS), '216K')
  assert.equal(formatLikes(nextLikesTenths(INITIAL_LIKES_TENTHS)), '216.1K')
  assert.equal(formatLikes(INITIAL_LIKES_TENTHS + 9), '216.9K')
  assert.equal(formatLikes(INITIAL_LIKES_TENTHS + 10), '217K')
})

test('Likes increments occur at randomized one-to-six-second intervals', () => {
  assert.equal(randomLikesDelay(() => 0), 1000)
  assert.equal(randomLikesDelay(() => .5), 3500)
  assert.equal(randomLikesDelay(() => .999999), 6000)
  const component = read('src/components/PennyCoverCount.jsx')
  assert.match(component, /setLikes\(nextLikesTenths\)/)
  assert.match(component, /window\.setTimeout\(/)
  assert.match(component, /randomLikesDelay\(\)/)
  assert.match(component, /document\.addEventListener\('visibilitychange'/)
  assert.match(component, /penny-cover-count__like-stat/)
  assert.match(read('src/components/PennyCoverCount.css'), /penny-cover-like-flash/)
})

test('Penny and Kandy reel is moved out of More Info into a Friends-sized featured row on both layouts', () => {
  const mobile = read('src/PennyAfterHours.jsx')
  const desktop = read('src/components/AfterHoursDesktop.jsx')
  const intro = read('src/components/PennyAfterHoursIntro.jsx')
  const spotlight = read('src/components/PennySpotlightRow.jsx')
  const styles = read('src/components/PennySpotlightRow.css')
  assert.doesNotMatch(intro, /PennyKandyReel/)
  assert.match(mobile, /<PennySpotlightRow\s*\/>[\s\S]*penny-fans__friends/)
  assert.match(desktop, /<PennySpotlightRow\s*\/>[\s\S]*ah-desktop-friends/)
  assert.match(spotlight, /<PennyKandyReel\s*\/>/)
  assert.match(spotlight, /<ViewportVideo[\s\S]*loop respectReducedMotion/)
  assert.match(spotlight, /penny-roleplay-tile\.mp4/)
  assert.match(spotlight, /penny-roleplay-poster\.webp/)
  assert.match(styles, /160px; height: 204px/)
  assert.match(styles, /92px; height: 151px/)
})
