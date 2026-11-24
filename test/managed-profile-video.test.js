import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8')
test('optional profile video appears under the profile heading only when configured',()=>{
 const page=read('../src/PennyAfterHours.jsx')
 const managed=read('../src/components/ManagedCreatorContent.jsx')
 assert.match(page,/<h2>A little danger looks good in pink\. ♠<\/h2>\s*<ManagedProfileVideo data=\{managed\} \/>/)
 assert.match(managed,/profileVideoId:null/)
 assert.match(managed,/if \(!item \|\| !\['video\/mp4','video\/webm'\]\.includes\(item.type\)\) return null/)
 assert.match(managed,/<video key=\{item.id\} controls loop playsInline preload="metadata"/)
})
