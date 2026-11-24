import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('creator spotlight precedes the Nurse post and links to the approved internal route', () => {
  const mobile = read('src/PennyAfterHours.jsx')
  const desktop = read('src/components/AfterHoursDesktop.jsx')
  const spotlight = read('src/components/CreatorLinkPost.jsx')
  assert.ok(mobile.indexOf('<CreatorLinkPost />') >= 0)
  assert.ok(mobile.indexOf('<CreatorLinkPost />') < mobile.indexOf('aria-labelledby="penny-nurse-news"'))
  assert.ok(desktop.indexOf('<CreatorLinkPost desktop />') >= 0)
  assert.ok(desktop.indexOf('<CreatorLinkPost desktop />') < desktop.indexOf('{posts.map'))
  assert.match(spotlight, /href="\/ashley\/what-if"/)
})
test('Kandy and Ashley member views use the shared shell without bypassing the existing gate', () => {
  const member = read('src/AfterHoursPrivateArea.jsx')
  const guest = read('src/components/AfterHoursPublicProfile.jsx')
  assert.match(member, /<AfterHoursPublicProfile area=\{area\} accessStatus="allowed">/)
  assert.match(member, /afterhours-members\.html\?area=/)
  assert.match(guest, /\{children \? <section/)
  assert.doesNotMatch(guest, /afterhours-members\.html/)
})
