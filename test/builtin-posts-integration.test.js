import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../src/'+p,import.meta.url),'utf8')
test('all original mobile posts are editable and retain specialized original rendering',()=>{
 const s=read('PennyAfterHours.jsx')
 for(const id of ['nurse','velvet','cover']){assert.ok(s.includes("builtinVisible(managed,'"+id+"')"));assert.ok(s.includes('id="'+id+'"'))}
 assert.match(s,/POSTS.filter\(post=>builtinVisible/)
 assert.match(s,/<SeatAnimationPair/)
 assert.match(s,/<NursePennyEasterEgg/)
 assert.match(s,/<UserLoopVideo/)
})
test('desktop uses identical stable keys and includes the existing vault post',()=>{
 const s=read('components/AfterHoursDesktop.jsx')
 for(const id of ['nurse','velvet','cover','throne','vault','letter'])assert.ok(s.includes(":'"+id+"'"))
 assert.match(s,/builtinCopy\(managed,BUILTIN_KEYS/)
 assert.match(s,/<SeatAnimationPair/)
})
test('Kandy and Ashley share the editable spotlight renderer',()=>{
 const s=read('AfterHoursPrivateArea.jsx')
 assert.ok(s.includes("builtinVisible(managed,'spotlight')"))
 assert.ok(s.includes("builtinCopy(managed,'spotlight'"))
 assert.ok(s.includes('id="spotlight"'))
})
