import test from 'node:test'
import assert from 'node:assert/strict'
import {interpretConversationControl,readBrowserConversation,saveBrowserConversation,CONVERSATION_LIFETIME_MS} from '../src/components/penny-conversation-client.js'

test('browser continuity requires explicit enable and supports disable',()=>{
 assert.equal(interpretConversationControl('keep our conversation'),'enable')
 assert.equal(interpretConversationControl('stop remembering our conversation'),'disable')
 assert.equal(interpretConversationControl('start fresh'),'clear')
 assert.equal(interpretConversationControl('what happened yesterday?'),null)
})
test('browser persistence is limited to recent valid messages and 24 hours',()=>{
 const m=new Map()
 const storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}
 assert.equal(readBrowserConversation(storage,'standard',1).enabled,false)
 saveBrowserConversation(storage,'standard',Array.from({length:15},(_,i)=>({role:i%2?'assistant':'user',text:'message '+i})),1000)
 const current=readBrowserConversation(storage,'standard',1001)
 assert.equal(current.enabled,true)
 assert.equal(current.messages.length,8)
 assert.equal(readBrowserConversation(storage,'standard',1000+CONVERSATION_LIFETIME_MS+1).messages.length,0)
 assert.equal(readBrowserConversation(storage,'standard',1000+CONVERSATION_LIFETIME_MS+1).enabled,true)
})
