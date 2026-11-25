import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('other creators reuse the managed controls without inheriting Penny media',()=>{
 const member=read('src/AfterHoursPrivateArea.jsx')
 const spinner=read('src/components/PennyAfterHoursSpinner.jsx')
 const managed=read('src/components/ManagedCreatorContent.jsx')
 assert.match(member,/<PennyAfterHoursSpinner managed=\{managed\} area=\{area\} name=\{name\}/)
 assert.match(member,/<ManagedProfileVideo data=\{managed\}/)
 assert.match(member,/managedAsset\(managed,'avatarId'\)/)
 assert.match(member,/<PennyThoughtBubble provider="gemini" placement="after-hours"/)
 assert.match(spinner,/if\(id==null\)return area==='penny'\?original:/)
 assert.match(managed,/managedAsset\(data,'coverVideoId'\)/)
 assert.match(member,/<PennyPrivateCollections key=\{tab\} area=\{area\}/)
})
