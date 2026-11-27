export const CONVERSATION_LIFETIME_MS = 24 * 60 * 60 * 1000
export const RECENT_MESSAGE_LIMIT = 8

export function interpretConversationControl(value) {
  const text=String(value||'').trim()
  if(/^(?:keep our conversation|remember our conversation|conversation on)$/i.test(text))return 'enable'
  if(/^(?:clear our conversation|clear conversation|start fresh)$/i.test(text))return 'clear'
  if(/^(?:stop remembering our conversation|conversation off|forget our conversation)$/i.test(text))return 'disable'
  if(/^(?:conversation status|is conversation memory on\??)$/i.test(text))return 'status'
  return null
}
export function normalizeConversationMessages(value) {
  if(!Array.isArray(value))return []
  return value.filter(x => (x?.role==='user'||x?.role==='assistant')
    && typeof x.text==='string' && x.text.trim() && x.text.length<=2000
    && !x.pending && !x.failed)
    .slice(-RECENT_MESSAGE_LIMIT)
    .map(({id,role,text})=>({id,role,text}))
}
export function readBrowserConversation(storage,key,now=Date.now()) {
  try {
    const stored=JSON.parse(storage.getItem(key)||'null')
    if(!stored || stored.enabled!==true)return {enabled:false,messages:[]}
    const valid=Number.isFinite(stored.updatedAt)
      && stored.updatedAt<=now && now-stored.updatedAt<CONVERSATION_LIFETIME_MS
    return {enabled:true,messages:valid?normalizeConversationMessages(stored.messages):[]}
  } catch { return {enabled:false,messages:[]} }
}
export function saveBrowserConversation(storage,key,messages,now=Date.now()) {
  storage.setItem(key,JSON.stringify({enabled:true,updatedAt:now,messages:normalizeConversationMessages(messages)}))
}
