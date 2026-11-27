import test from 'node:test'
import assert from 'node:assert/strict'
import {parsePennyMemoryCommand,privateMemoryCommand,contextWithNotes} from '../lib/penny-discord-memory.js'
test('explicit save/list/forget commands are recognized',()=>{
 assert.equal(parsePennyMemoryCommand('remember that my cat is Luna').type,'save')
 assert.equal(parsePennyMemoryCommand('what do you remember?').type,'list')
 assert.equal(parsePennyMemoryCommand('forget everything').type,'clear')
 assert.equal(parsePennyMemoryCommand('forget 2').number,2)
 assert.equal(parsePennyMemoryCommand('hello').type,'chat')
})
test('all personal memory operations are ephemeral',()=>{
 for(const text of ['remember that I like tea','what do you remember','forget 1','forget everything','with memory: help me'])
   assert.equal(privateMemoryCommand(parsePennyMemoryCommand(text)),true)
 assert.equal(privateMemoryCommand(parsePennyMemoryCommand('hello')),false)
})
test('memory notes are contextual data, not authority',()=>{
 const prompt=contextWithNotes('what do you think?',[{note:'I like cats'}])
 assert.match(prompt,/user-supplied context/)
 assert.match(prompt,/I like cats/)
 assert.match(prompt,/what do you think/)
})

test('continuity needs a deliberate opt-in and isolates normal chats', () => {
  const on=parsePennyMemoryCommand('keep our conversation')
  const off=parsePennyMemoryCommand('conversation off')
  const clear=parsePennyMemoryCommand('clear our conversation')
  assert.equal(on.type,'conversation_enable')
  assert.equal(off.type,'conversation_disable')
  assert.equal(clear.type,'conversation_clear')
  assert.equal(privateMemoryCommand(on),true)
  assert.equal(privateMemoryCommand(parsePennyMemoryCommand('What did I say earlier?')),false)
})
