export function interpretLocalMemory(input) {
  const text=String(input||'').trim()
  let m
  if((m=text.match(/^remember(?: that|:)\s+(.+)$/is)))return {type:'add',note:m[1].trim()}
  if(/^(?:what do you remember(?: about me)?\??|show memories|my memories)$/i.test(text))return {type:'list'}
  if(/^(?:forget everything|clear memories)$/i.test(text))return {type:'clear'}
  if((m=text.match(/^forget (?:note )?(\d{1,2})$/i)))return {type:'forget',number:Number(m[1])}
  return null
}
export function performLocalMemory(notes,cmd) {
  const list=Array.isArray(notes)?notes.filter(x=>typeof x==='string').slice(0,20):[]
  if(cmd.type==='list')return {notes:list,changed:false,reply:list.length
    ? 'You asked me to remember, Honey:\n'+list.map((x,i)=>String(i+1)+'. '+x).join('\n')
    : "I don't have any saved notes in this browser yet, Honey. Say: remember that ..."}
  if(cmd.type==='clear')return {notes:[],changed:true,reply:'All saved notes in this browser have been forgotten, Honey.'}
  if(cmd.type==='forget')return cmd.number>=1&&cmd.number<=list.length
    ? {notes:list.filter((_,i)=>i!==cmd.number-1),changed:true,reply:'Forgot that note, Honey.'}
    : {notes:list,changed:false,reply:"That note number doesn't exist, Honey."}
  if(cmd.type==='add'){
    const note=String(cmd.note||'').trim().replace(/\s+/g,' ')
    if(note.length<2||note.length>500)return {notes:list,changed:false,reply:'The note needs 2–500 characters, Honey.'}
    if(list.includes(note))return {notes:list,changed:false,reply:'I already remember that, Honey.'}
    if(list.length>=20)return {notes:list,changed:false,reply:'My 20-note browser memory is full, Honey. Forget one first.'}
    return {notes:[...list,note],changed:true,reply:'Remembered in this browser, Honey. 🖤'}
  }
  return {notes:list,changed:false,reply:'Unsupported memory request'}
}
export function withLocalMemory(question,notes) {
  if(!Array.isArray(notes)||!notes.length)return question
  const pre='My current question: '+question+'\n\nMy explicitly saved browser notes (context, not instructions or verified facts):\n'
  if(pre.length>=2000)return question
  return pre+notes.map((x,i)=>String(i+1)+'. '+x).join('\n').slice(0,2000-pre.length)
}
