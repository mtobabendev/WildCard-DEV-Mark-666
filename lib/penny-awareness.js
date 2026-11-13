import { CITIES } from '../src/components/penny-awareness-data.js'

const NWS = 'https://api.weather.gov'
const headers = { 'User-Agent': 'WildCard DEV awareness (https://www.wildcarddev.com/)', Accept:'application/geo+json' }
const tidy = (value, max=150) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max) : ''
const iso = value => { const n=Date.parse(value); return Number.isFinite(n)?new Date(n).toISOString():null }
const sameDomain = (url, domains) => { try {const u=new URL(url);return u.protocol==='https:' && !u.username && !u.password && !u.port && domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d)) ? u.href:null}catch{return null} }
const nowIso = n => new Date(n).toISOString()
async function read(url, fetcher, type='json', options={}) {
  const r=await fetcher(url,{...options,redirect:'error',signal:AbortSignal.timeout(6500)})
  if(!r.ok) throw Error('source unavailable')
  return type==='text'?r.text():r.json()
}
const nws=(url,f)=>read(url,f,'json',{headers})
const weatherLink = point => 'https://forecast.weather.gov/MapClick.php?lat='+point.split(',')[0]+'&lon='+point.split(',')[1]

export async function forecast(city, f=fetch, now=Date.now()) {
  const {label,point}=city
  const points=await nws(NWS+'/points/'+point,f)
  const hourly=points?.properties?.forecastHourly
  if(typeof hourly!=='string'||!/^https:\/\/api\.weather\.gov\/gridpoints\/[A-Z]{3}\/\d+,\d+\/forecast\/hourly$/.test(hourly)) throw Error('invalid grid')
  const data=await nws(hourly,f)
  const p=data?.properties?.periods?.find(x=>Date.parse(x.startTime)<=now && Date.parse(x.endTime)>now)
  if(!p||!Number.isFinite(p.temperature)||!['F','C'].includes(p.temperatureUnit)||!tidy(p.shortForecast)) throw Error('missing current forecast')
  const conditions=tidy(p.shortForecast,80)
  const temperature=p.temperature+'°'+p.temperatureUnit
  return [{kind:'weather',label:'Weather · '+label,text:temperature+' · '+conditions+'. '+(p.temperatureUnit==='F'&&p.temperature>=90?'Stay cool out there.':p.temperatureUnit==='F'&&p.temperature<=32?'Bundle up before leaving the bunker.':'A little planning goes a long way.'),source:'National Weather Service · hourly forecast',url:weatherLink(point),observedAt:iso(data.properties.updateTime)||iso(p.startTime),expiresAt:nowIso(Math.min(now+900000,Date.parse(p.endTime)))}]
}

export async function alerts(city,f=fetch,now=Date.now()) {
  const data=await nws(NWS+'/alerts/active?point='+city.point,f)
  if(!Array.isArray(data?.features))throw Error('invalid alerts')
  return data.features.map(x=>x.properties).filter(p=>p?.status==='Actual'&&['Alert','Update'].includes(p.messageType)&&['Severe','Extreme'].includes(p.severity)&&Date.parse(p.expires)>now&&tidy(p.event)).sort((a,b)=>Number(b.severity==='Extreme')-Number(a.severity==='Extreme')||Date.parse(b.sent)-Date.parse(a.sent)).slice(0,2).map(p=>({kind:'alert',label:'Weather alert · '+city.label,text:tidy(p.event,120)+'. See official guidance.',source:'National Weather Service',url:weatherLink(city.point),observedAt:iso(p.sent),expiresAt:nowIso(Math.min(now+300000,Date.parse(p.expires)))}))
}

const publishers=['reuters.com','apnews.com','bbc.com','bbc.co.uk']
const gdeltQuery='(domain:reuters.com OR domain:apnews.com OR domain:bbc.com OR domain:bbc.co.uk) (earthquake OR election OR summit OR ceasefire OR economy OR breakthrough OR emergency OR hurricane) sourcelang:english'
const gdeltUrl='https://api.gdeltproject.org/api/v2/doc/doc?'+new URLSearchParams({query:gdeltQuery,mode:'artlist',format:'json',maxrecords:'20',timespan:'24h',sort:'hybridrel'})
function gdeltDate(value) {
  if(typeof value!=='string'||!/^\d{8}T\d{6}Z$/.test(value))return null
  return iso(value.slice(0,4)+'-'+value.slice(4,6)+'-'+value.slice(6,8)+'T'+value.slice(9,11)+':'+value.slice(11,13)+':'+value.slice(13,15)+'Z')
}
const recent=(d,now,hours=24)=>d&&Date.parse(d)<=now+300000&&Date.parse(d)>=now-hours*3600000
const newsCard=(label,text,source,url,date,now,extra={})=>({kind:'news',label,text,source,url,observedAt:date,expiresAt:nowIso(now+900000),...extra})
export function headlines(data,now) {
  const seen=new Set()
  return (Array.isArray(data?.articles)?data.articles:[]).flatMap(a=>{
    const url=sameDomain(a.url,publishers), date=gdeltDate(a.seendate), title=tidy(a.title,145)
    if(!url||!title||!recent(date,now)||seen.has(title.toLowerCase()))return []
    seen.add(title.toLowerCase())
    return [newsCard('In the news',title,new URL(url).hostname.replace(/^www\./,''),url,date,now,{discoveredBy:'GDELT',discoveryUrl:'https://www.gdeltproject.org/'})]
  }).slice(0,3)
}
function rssField(item,tag) {
  const value=item.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'))?.[1]||''
  return value.replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g,'').replace(/<[^>]*>/g,'').replace(/&(amp|lt|gt|quot|apos|#39|#8217|#8211|#8212);/g,(_,e)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",'#39':"'",'#8217':'’','#8211':'–','#8212':'—'})[e]).trim()
}
export function nasaHeadlines(xml,now) {
  if(typeof xml!=='string'||xml.length>2000000)return []
  return Array.from(xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)).flatMap(m=>{
    const item=m[1],url=sameDomain(rssField(item,'link'),['nasa.gov']),date=iso(rssField(item,'pubDate')),title=tidy(rssField(item,'title'),145)
    if(!url||!title||!recent(date,now,48)||/\/image-article\/|\bAPOD:/.test(url+' '+title))return []
    return [newsCard('Science & space',title,'NASA',url,date,now)]
  }).slice(0,2)
}
export function earthquakes(data,now) {
  return (Array.isArray(data?.features)?data.features:[]).flatMap(x=>{
    const p=x.properties||{},url=sameDomain(p.url,['usgs.gov']),date=Number.isFinite(p.time)?nowIso(p.time):null
    if(!url||!recent(date,now)||!Number.isFinite(p.mag)||!tidy(p.place))return []
    return [newsCard('World event','USGS reports magnitude '+p.mag+' earthquake: '+tidy(p.place,95)+'.','USGS',url,date,now)]
  }).slice(0,2)
}
export async function news(f=fetch,now=Date.now()) {
  // Each source is independent. No fabricated headlines and no LLM-generated claims.
  const result=await Promise.allSettled([
    read(gdeltUrl,f).then(data=>headlines(data,now)),
    read('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',f).then(data=>earthquakes(data,now)),
    read('https://www.nasa.gov/news-release/feed/',f,'text').then(data=>nasaHeadlines(data,now)),
  ])
  if(result.every(r=>r.status==='rejected'))throw Error('all news sources unavailable')
  const [general,quakes,science]=result.map(r=>r.status==='fulfilled'?r.value:[])
  return [...quakes,...general,...science].slice(0,5)
}

export function parseQuery(query) {
  if(!query||Object.keys(query).some(k=>!['kind','city'].includes(k)))return null
  if(query.kind==='news'&&!Object.hasOwn(query,'city'))return {kind:'news'}
  if(['weather','alerts'].includes(query.kind)&&typeof query.city==='string'&&Object.hasOwn(CITIES,query.city))return {kind:query.kind,city:CITIES[query.city]}
  return null
}
export function createAwarenessHandler({fetcher=fetch,clock=Date.now}={}) {
  return async function handler(req,res) {
    // Public, nonpersonal, read-only data; no cookies or API credentials.
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('X-Content-Type-Options','nosniff')
    res.setHeader('Cache-Control','no-store')
    if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'GET only'})}
    const q=parseQuery(req.query)
    if(!q)return res.status(400).json({error:'Invalid awareness selection'})
    try {
      const now=clock()
      const cards=await (q.kind==='news'?news(fetcher,now):q.kind==='alerts'?alerts(q.city,fetcher,now):forecast(q.city,fetcher,now))
      const ttl=q.kind==='alerts'?300:900
      res.setHeader('Cache-Control','public, max-age=0, s-maxage='+ttl)
      return res.status(200).json({kind:q.kind,fetchedAt:nowIso(now),cards})
    } catch {return res.status(503).json({error:'Awareness source unavailable'})}
  }
}
