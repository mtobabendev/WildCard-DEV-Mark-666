import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('each gated creator view uses editable posts and covers, leaving built-in defaults',()=>{
 for(const p of ['src/PennyAfterHours.jsx','src/components/AfterHoursDesktop.jsx','src/AfterHoursPrivateArea.jsx']){
  const s=read(p);assert.match(s,/<ManagedCover data=\{managed\}/);assert.match(s,/<ManagedPosts data=\{managed\}/)
 }
 const component=read('src/components/ManagedCreatorContent.jsx')
 assert.match(component,/credentials:'include'/)
 assert.match(component,/cache:'no-store'/)
 assert.match(component,/return children/)
 assert.doesNotMatch(read('src/components/AfterHoursPublicProfile.jsx'),/ManagedCover|ManagedPosts/)
})
