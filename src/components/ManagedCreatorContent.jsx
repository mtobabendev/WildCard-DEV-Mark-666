import { useEffect,useState } from 'react'
const PARTY='https://party.wildcarddev.com'
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const empty={content:{bannerId:null,posts:[]},media:[]}
export function useManagedContent(area) {
  const [data,setData]=useState(empty)
  useEffect(()=>{
    let active=true
    setData(empty)
    fetch(PARTY+'/api/afterhours/creator-content?area='+encodeURIComponent(area),{credentials:'include',cache:'no-store'})
      .then(async r=>{if(!r.ok)throw Error('Content unavailable');return r.json()})
      .then(d=>{if(active&&d?.content&&Array.isArray(d.content.posts)&&Array.isArray(d.media))setData(d)})
      .catch(()=>{})
    return ()=>{active=false}
  },[area])
  return data
}
const src=id=>PARTY+'/api/afterhours/media?id='+encodeURIComponent(id)
function lookup(data,id){return typeof id==='string'&&UUID.test(id)?data.media.find(x=>x.id===id):null}
export function ManagedCover({data,className,children}) {
  const item=lookup(data,data.content.bannerId)
  const [failed,setFailed]=useState(null)
  if(!item?.type?.startsWith('image/')||failed===item.id)return children
  return <img className={className} src={src(item.id)} alt="Creator cover" onError={()=>setFailed(item.id)}/>
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
