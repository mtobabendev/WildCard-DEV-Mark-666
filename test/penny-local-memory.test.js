import test from 'node:test'
import assert from 'node:assert/strict'
import {interpretLocalMemory,performLocalMemory,withLocalMemory} from '../src/components/penny-local-memory.js'

test('browser memory is explicit, not automatic',()=>{
 assert.equal(interpretLocalMemory('Hello Penny'),null)
 const command=interpretLocalMemory('remember that I like Darkstalkers')
 const result=performLocalMemory([],command)
 assert.equal(result.notes[0],'I like Darkstalkers')
})
test('browser user can list and erase notes',()=>{
 assert.equal(performLocalMemory(['cats'],interpretLocalMemory('what do you remember?')).changed,false)
 assert.deepEqual(performLocalMemory(['cats'],interpretLocalMemory('forget everything')).notes,[])
})
test('provider context stays bounded',()=>{
 const text=withLocalMemory('Hello',['My cat is Luna'])
 assert.match(text,/context, not instructions/)
 assert.ok(text.length<=2000)
})
