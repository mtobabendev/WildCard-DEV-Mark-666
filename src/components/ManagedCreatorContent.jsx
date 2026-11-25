import { useEffect,useRef,useState } from 'react'
const PARTY='https://party.wildcarddev.com'
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const empty={content:{bannerId:null,coverVideoId:null,avatarId:null,profileVideoId:null,posts:[]},media:[]}
export function useManagedContent(area) {
  const [record,setRecord]=useState(null)
  useEffect(()=>{
    let active=true
    setRecord(null)
    fetch(PARTY+'/api/afterhours/creator-content?area='+encodeURIComponent(area),{credentials:'include',cache:'no-store'})
      .then(async r=>{if(!r.ok)throw Error('Content unavailable');return r.json()})
      .then(d=>{if(active&&d?.content&&Array.isArray(d.content.posts)&&Array.isArray(d.media))setRecord({area,data:d})})
      .catch(()=>{})
    return ()=>{active=false}
  },[area])
  return record?.area===area?record.data:empty
}
const src=id=>PARTY+'/api/afterhours/media?id='+encodeURIComponent(id)
function lookup(data,id){return typeof id==='string'&&UUID.test(id)?data.media.find(x=>x.id===id):null}
export function managedAsset(data,field) {
  const item=lookup(data,data.content[field])
  return item ? {...item,src:src(item.id)} : null
}
// A new asset gets a fresh element and playback state.
function ManagedCoverVideo({video,className}) {
  const ref=useRef(null)
  const [paused,setPaused]=useState(false)
  const [problem,setProblem]=useState('')
  const start=()=>{
    const element=ref.current
    if(!element)return
    element.muted=true
    element.play()?.catch(error=>{
      if(error?.name!=='AbortError' && ref.current===element){setPaused(true);setProblem('Tap to play cover video.')}
    })
  }
  useEffect(()=>{
    const element=ref.current
    if(!element)return
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
    if(motion.matches){setPaused(true);return}
    start()
    return ()=>element.pause()
  },[])
  return <>
    <video ref={ref} className={className} src={video.src} muted loop playsInline preload="metadata"
      aria-label="Creator cover video" onPlaying={()=>{setPaused(false);setProblem('')}}
      onError={()=>{setPaused(true);setProblem('Cover video could not be played. Tap to retry.')}} />
    <button type="button" className={className==='ah-desktop__cover-video'?'ah-desktop__cover-pause':'penny-fans__cover-control'}
      aria-pressed={paused} aria-label={paused?'Resume cover animation':'Pause cover animation'} title={problem||undefined}
      onClick={()=>{const element=ref.current;if(!element)return;if(element.paused){if(element.error)element.load();start()}else{element.pause();setPaused(true)}}}>&#128520;</button>
    {problem&&<span role="status" style={{position:'absolute',bottom:8,left:8,zIndex:3,background:'#22152c',color:'white',padding:4,fontSize:12}}>{problem}</span>}
  </>
}
export function ManagedCover({data,className,children}) {
  const item=lookup(data,data.content.bannerId)
  const [failed,setFailed]=useState(null)
  const video=managedAsset(data,'coverVideoId')
  if (video && ['video/mp4','video/webm'].includes(video.type)) {
    return <ManagedCoverVideo key={video.id} video={video} className={className}/>
  }
  if(!item?.type?.startsWith('image/')||failed===item.id)return children
  return <img className={className} src={src(item.id)} alt="Creator cover" onError={()=>setFailed(item.id)}/>
}
// Built-in posts remain in their original layout unless the Owner explicitly replaces their media.
export function builtinOverride(data,id){return data?.content?.postOverrides?.[id]??{}}
export function builtinVisible(data,id){return builtinOverride(data,id).hidden!==true}
export function builtinCopy(data,id,defaults){const p=builtinOverride(data,id);return {...defaults,title:p.title??defaults.title,copy:p.body??defaults.copy}}
export function BuiltinBody({data,id,children}){
  const body=builtinOverride(data,id).body
  return typeof body==='string'?<p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{body}</p>:children
}
export function BuiltinMedia({data,id,title,children}){
  const p=builtinOverride(data,id)
  if(p.mediaMode==='none')return null
  if(p.mediaMode!=='replace')return children
  const item=lookup(data,p.mediaId)
  if(!item)return <p role="status">Assigned media unavailable.</p>
  return item.type.startsWith('image/')?<img src={src(item.id)} alt={title} loading="lazy" style={{display:'block',width:'100%',maxHeight:'75vh',objectFit:'contain'}}/>:
    <video key={item.id} src={src(item.id)} controls loop playsInline preload="metadata" aria-label={title} style={{display:'block',width:'100%',maxHeight:'75vh',objectFit:'contain'}}/>
}
export function BuiltinLink({data,id}){
  const link=builtinOverride(data,id).link
  return typeof link==='string'&&/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(link)?<p><a href={link}>Open page</a></p>:null
}
export function ManagedPosts({data,name,desktop=false,query=''}) {
  const search=query.trim().toLowerCase()
  return data.content.posts.filter(p=>!search||[p.title,p.body].some(x=>typeof x==='string'&&x.toLowerCase().includes(search))).map(p=>{
    const item=lookup(data,p.mediaId)
    return <article key={p.id} className={desktop?'ah-desktop__post':'penny-fans__featured-post'} aria-label={p.title}>
      <div style={{padding:16}}><small>{name} ♠</small><h2>{p.title}</h2><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{p.body}</p>
      {item?.type?.startsWith('image/')&&<img loading="lazy" src={src(item.id)} alt={p.title} style={{display:'block',maxWidth:'100%',width:'100%',maxHeight:'75vh',objectFit:'contain'}}/>}
      {item?.type?.startsWith('video/')&&<video controls playsInline preload="none" src={src(item.id)} style={{display:'block',width:'100%',maxHeight:'75vh'}}/>}
      {typeof p.link==='string'&&/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(p.link)&&<p><a href={p.link}>Open page ↗</a></p>}</div>
    </article>
  })
}

export function ManagedProfileVideo({data}) {
  const item=lookup(data,data.content.profileVideoId)
  const [failed,setFailed]=useState(null)
  if (!item || !['video/mp4','video/webm'].includes(item.type)) return null
  return <section aria-label="Profile video" style={{margin:'1rem 0'}}>
    {failed===item.id ? <p role="status">Profile video unavailable.</p> :
      <video key={item.id} controls loop playsInline preload="metadata" src={src(item.id)}
        aria-label="Profile video" onError={()=>setFailed(item.id)}
        style={{display:'block',width:'100%',maxHeight:'75dvh',objectFit:'contain',background:'#100a18',borderRadius:12}} />}
  </section>
}
