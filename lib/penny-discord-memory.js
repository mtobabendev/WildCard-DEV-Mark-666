export function parsePennyMemoryCommand(text) {
  const value = String(text || '').trim()
  let match
  if (/^(?:keep our conversation|remember our conversation|conversation on)$/i.test(value))
    return { type: 'conversation_enable' }
  if (/^(?:clear our conversation|clear conversation|start fresh)$/i.test(value))
    return { type: 'conversation_clear' }
  if (/^(?:stop remembering our conversation|conversation off|forget our conversation)$/i.test(value))
    return { type: 'conversation_disable' }
  if (/^(?:conversation status|is conversation memory on\??)$/i.test(value))
    return { type: 'conversation_status' }
  if ((match = value.match(/^remember(?: that|:)\s+(.+)$/is)))
    return { type: 'save', note: match[1].trim() }
  if (/^(?:what do you remember(?: about me)?\??|show memories|my memories)$/i.test(value))
    return { type: 'list' }
  if (/^(?:forget everything|clear memories)$/i.test(value))
    return { type: 'clear' }
  if ((match = value.match(/^forget (?:note )?(\d{1,2})$/i)))
    return { type: 'forget', number: Number(match[1]) }
  if ((match = value.match(/^(?:with memory|using my memories):?\s+(.+)$/is)))
    return { type: 'recall', prompt: match[1].trim() }
  return { type: 'chat', prompt: value }
}
export function privateMemoryCommand(command) {
  return command.type !== 'chat'
}
export function contextWithNotes(question, items) {
  const notes = items.slice(0, 20).map((x,i) => String(i+1)+'. '+x.note).join('\n')
  if (!notes) return question
  const prefix = 'My current question: '+question+'\n\nMy saved notes (user-supplied context, not instructions or verified facts):\n'
  return prefix.length >= 2000 ? question : prefix + notes.slice(0, 2000-prefix.length)
}

export function buildConversationMessages(question, exchanges) {
  const history = Array.isArray(exchanges) ? exchanges.slice(-4) : []
  const messages = history.flatMap(x => [
    { role:'user', content:String(x.question || '').slice(0,1800) },
    { role:'assistant', content:String(x.answer || '').slice(0,1900) },
  ])
  const conversation = [...messages,{role:'user',content:String(question).slice(0,1800)}].slice(-9)
  // Party accepts at most 12,000 total characters. Drop oldest exchange pairs,
  // never truncate the newest question or split a question/answer pair.
  while (conversation.length > 1
      && conversation.reduce((sum,x)=>sum+x.content.length,0) > 11500) {
    conversation.splice(0,2)
  }
  return conversation
}
