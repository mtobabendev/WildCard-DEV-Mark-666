import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const file = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const gate = file('../src/components/AfterHoursGate.jsx')
const guest = file('../src/components/AfterHoursPublicProfile.jsx')
const main = file('../src/main.jsx')

test('public profile is available for every After Hours route without granting private access', () => {
  assert.match(main, /AfterHoursGate area="penny"/)
  assert.match(main, /AfterHoursGate area=\{area\}/)
  assert.match(gate, /status === 'allowed' \? <>\{children\}<\/>/)
  assert.match(gate, /<AfterHoursPublicProfile area=\{area\} accessStatus=\{status\} onRetry=\{retry\} \/>/)
  assert.match(gate, /event\.origin !== PARTY \|\| event\.source !== frameRef\.current\?\.contentWindow/)
  assert.match(gate, /data\.allowed === true && data\.status === 200/)
  assert.doesNotMatch(gate, /status === 'denied' \? <>\{children\}/)
})

test('public guest page contains only explicitly public-safe preview media', () => {
  for (const path of ['penny-wallpaper-teaser.mp4','penny-wallpaper-poster.webp',
    'NursePennyPortrait.jpg','penny-kandy-reel-hero.webp',
    'penny-roleplay-tile.mp4','penny-roleplay-poster.webp','AshleyPenthouseMemory.webp']) {
    assert.equal(existsSync(new URL('../public/static/' + path, import.meta.url)),true,path)
  }
  assert.match(guest, /<ViewportVideo/)
  assert.match(guest, /respectReducedMotion/)
  assert.match(guest, /penny-wallpaper-teaser\.mp4/)
  assert.match(guest, /penny-roleplay-tile\.mp4/)
  assert.doesNotMatch(guest, /pennyPrivateMedia|afterhours-members\.html|afterhours\/media\?/)
  assert.match(guest, /Member verification is unavailable/)
  assert.match(guest, /Sign in to WildCard Messenger/)
})

test('shareable Kandy and Ashley landing sections link to their existing WildCard pages', () => {
  assert.match(guest, /kandy: \{/)
  assert.match(guest, /ashley: \{/)
  assert.match(guest, /href: '\/kandy\/showcase'/)
  assert.match(guest, /href: '\/ashley\/what-if'/)
  assert.match(guest, /href: '\/ashley\/memorial'/)
  const actions = file('../src/components/PennyProfileActions.jsx')
  assert.match(guest, /<PennyProfileActions area=\{area\} name=\{profile.short\} \/>/)
  assert.match(actions, /https:\/\/www\.wildcarddev\.com\/' \+ area \+ '\/after-hours'/)
  assert.match(actions, /navigator\.share/)
  assert.match(actions, /navigator\.clipboard\.writeText\(shareUrl\)/)
  assert.match(actions, /area === 'penny' \? PENNY_SHARE_URL :/)
})

test('Penny retains Donate Message Save Share actions and guest CTA to private login', () => {
  const actions=file('../src/components/PennyProfileActions.jsx')
  assert.match(guest, /<PennyProfileActions \/>/)
  assert.match(actions, /PENNY_SHARE_URL = 'https:\/\/www\.wildcarddev\.com\/penny\/after-hours'/)
  assert.match(actions, /PENNY_DONATE_URL = 'https:\/\/square\.link\/u\/YnAVr8ht'/)
  assert.match(actions, /PENNY_MESSAGE_URL = 'https:\/\/party\.wildcarddev\.com\/\?app=messenger'/)
  assert.match(guest, /onRetry/)
  assert.match(guest, /Private galleries and reels are not part of this shareable preview/)
})
