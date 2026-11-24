import {readFileSync} from 'node:fs'
import {test} from 'node:test'
import assert from 'node:assert/strict'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('spinner and matching tiles and viewer share the managed image array',()=>{
 const s=read('src/components/PennyAfterHoursSpinner.jsx')
 assert.match(s,/const panels=resolveOrbitCards\(managed\)/)
 assert.equal((s.match(/panels\.map\(\{?/g)||[]).length,2)
 assert.match(s,/viewerOpen \? panels\[viewerIndex\]/)
 assert.match(s,/id==='blank'/)
 assert.match(s,/orbit-card-placeholder\.svg/)
 for(const p of ['src/PennyAfterHours.jsx','src/components/AfterHoursDesktop.jsx']) assert.match(read(p),/<PennyAfterHoursSpinner managed=\{managed\} \/>/)
})
