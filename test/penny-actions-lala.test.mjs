import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8')
const mobile = read('src/PennyAfterHours.jsx')
const desktop = read('src/components/AfterHoursDesktop.jsx')
const actions = read('src/components/PennyProfileActions.jsx')
const actionCss = read('src/components/PennyProfileActions.css')
const socials = read('src/components/PennySocialPills.jsx')
const socialCss = read('src/components/PennySocialPills.css')
const friends = read('src/components/PennyFriends.jsx')

test('all four actions work on mobile and desktop, with a compact sticky bar', () => {
  assert.match(mobile, /<PennyProfileActions \/>/)
  assert.match(desktop, /<PennyProfileActions \/>/)
  assert.match(actions, /PENNY_DONATE_URL = 'https:\/\/square\.link\/u\/YnAVr8ht'/)
  assert.match(actions, /PENNY_MESSAGE_URL = 'https:\/\/party\.wildcarddev\.com\/\?app=messenger'/)
  assert.match(actions, /window\.localStorage\.setItem\(SAVE_KEY/)
  assert.match(actions, /navigator\.share\(/)
  assert.match(actions, /navigator\.clipboard\.writeText\(PENNY_SHARE_URL\)/)
  assert.match(actions, /PENNY_SHARE_URL = 'https:\/\/www\.wildcarddev\.com\/penny\/after-hours'/)
  assert.match(actions, /getBoundingClientRect\(\)\.bottom <= 66/)
  assert.match(actions, /penny-profile-actions__sticky/)
  assert.match(actionCss, /position: fixed; z-index: 90/)
})

test('social pills form one swipeable row on both layouts', () => {
  assert.match(mobile, /<PennySocialPills \/>/)
  assert.match(desktop, /<PennySocialPills \/>/)
  assert.match(socialCss, /display: flex; flex-wrap: nowrap/)
  assert.match(socialCss, /overflow-x: auto; overflow-y: hidden/)
  for (const link of ['party.wildcarddev.com/', 'x.com/Dev_WildCard', 'party.wildcarddev.com/stripagram/', 'pennytv.wildcarddev.com/']) {
    assert.ok(socials.includes(link))
  }
})

test('LALA reuses the independent 8-cover 8-avatar slideshow engine', () => {
  assert.match(friends, /name: 'LALA'.*handle: '@laurencorazza'.*slideshow: \{ src: '\/static\/lala-slides\.webp', frames: 8, avatarFrames: true \}/)
  assert.match(friends, /sheetFrames = slideshow\?\.avatarFrames \? frames \* 2 : frames/)
  assert.match(friends, /setCoverIndex\(\(current\) => \(current \+ 1\) % frames\)/)
  assert.match(friends, /setAvatarIndex\(\(current\) =>/)
  assert.match(friends, /FRIEND_SLIDESHOW_INTERVAL_MS = 6000/)
  const asset = new URL('../public/static/lala-slides.webp', import.meta.url)
  assert.ok(statSync(asset).size > 15000)
})

test('public profile has usable teaser posters while private vault stays protected', () => {
  assert.match(mobile, /poster="\/static\/penny-kandy-reel-hero\.webp"/)
  assert.match(desktop, /poster="\/static\/penny-kandy-reel-hero\.webp"/)
  assert.match(mobile, /poster="\/static\/NursePennyPortrait\.jpg"/)
  assert.match(desktop, /poster="\/static\/NursePennyPortrait\.jpg"/)
  assert.match(mobile, /event\.currentTarget\.onerror = null/)
  assert.match(desktop, /event\.currentTarget\.onerror = null/)
  assert.match(read('src/components/PennyPrivateCollections.jsx'), /afterhours-members\.html\?area=penny&embed=1/)
})
