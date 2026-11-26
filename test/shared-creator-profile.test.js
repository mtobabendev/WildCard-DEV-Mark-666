import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('unwanted Ashley spotlight is absent from both Penny feeds and Nurse remains', () => {
  const mobile = read('src/PennyAfterHours.jsx')
  const desktop = read('src/components/AfterHoursDesktop.jsx')
  assert.doesNotMatch(mobile, /CreatorLinkPost/)
  assert.doesNotMatch(desktop, /CreatorLinkPost/)
  assert.match(mobile, /aria-labelledby="penny-nurse-news"/)
  assert.match(desktop, /id: 'nurse-post'/)
})
test('Kandy and Ashley use Penny layout classes and the area-specific shared media frame', () => {
  const member = read('src/AfterHoursPrivateArea.jsx')
  const guest = read('src/components/AfterHoursPublicProfile.jsx')
  const frame = read('src/components/PennyPrivateCollections.jsx')
  assert.match(member, /className="ah-desktop creator-member"/)
  assert.match(member, /'penny-fans creator-member' \+ \(area === 'kandy' \? ' creator-member--kandy' : ''\)/)
  assert.match(member, /<PennyProfileActions area=\{area\} name=\{name\}/)
  assert.match(member, /<PennyPrivateCollections key=\{tab\} area=\{area\}/)
  assert.match(frame, /data\.area !== selectedArea/)
  assert.doesNotMatch(guest, /afterhours-members\.html|PennyPrivateCollections/)
})
