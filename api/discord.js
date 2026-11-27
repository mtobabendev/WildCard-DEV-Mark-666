import { createPublicKey, verify } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
const APP = '1531868631325999256';
const PARTY = 'https://party.wildcarddev.com/api/penny-provider';

export function verifyInteraction(raw, sig, stamp, hex) {
  if (!/^[a-f\d]{128}$/i.test(sig || '') || !/^\d{10}$/.test(stamp || '') || !/^[a-f\d]{64}$/i.test(hex || '')) return false;
  if (Math.abs(Date.now()/1000 - Number(stamp)) > 300) return false;
  try {
    const key = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100','hex'), Buffer.from(hex,'hex')]), format:'der', type:'spki' });
    return verify(null, Buffer.concat([Buffer.from(stamp), Buffer.from(raw)]), key, Buffer.from(sig,'hex'));
  } catch { return false; }
}

async function reply(interaction, question) {
  let content;
  const control = new AbortController();
  const timeout = setTimeout(() => control.abort(), 25000);
  try {
    const result = await fetch(PARTY, {
      method:'POST', redirect:'error', signal:control.signal,
      headers:{ 'Content-Type':'application/json', Origin:'https://party.wildcarddev.com', Accept:'text/plain' },
      body:JSON.stringify({messages:[{role:'user',content:question}],provider:'gemini',presentation:'standard'})
    });
    if (!result.ok || result.headers.get('X-Penny-Provider') !== 'gemini') throw new Error('Provider unavailable');
    content = (await result.text()).trim().slice(0,1900) || 'My answer came back empty, darling. 🖤';
  } catch {
    content = "Penny's AI connection isn't responding just now. Try again shortly. 🖤";
  } finally { clearTimeout(timeout); }
  try {
    const url = `https://discord.com/api/v10/webhooks/${APP}/${encodeURIComponent(interaction.token)}/messages/@original`;
    const sent = await fetch(url, { method:'PATCH', redirect:'error', headers:{'Content-Type':'application/json'}, body:JSON.stringify({content,allowed_mentions:{parse:[]}}) });
    if (!sent.ok) console.error('Discord reply failed',sent.status);
  } catch { console.error('Discord reply transport failed'); }
}

export default {
  async fetch(request) {
    if (request.method !== 'POST') return new Response('POST only',{status:405});
    const key = process.env.DISCORD_PUBLIC_KEY;
    if (!key) return new Response('Discord endpoint not configured',{status:503});
    const raw = await request.text();
    if (Buffer.byteLength(raw)>16384) return new Response('Too large',{status:413});
    if (!verifyInteraction(raw,request.headers.get('x-signature-ed25519'),request.headers.get('x-signature-timestamp'),key))
      return new Response('Invalid signature',{status:401});
    let data;
    try { data=JSON.parse(raw); } catch {return new Response('Invalid JSON',{status:400});}
    if (data.application_id !== APP) return new Response('Wrong application',{status:403});
    if (data.type===1) return Response.json({type:1});
    if (data.type!==2 || data.data?.name!=='penny')
      return Response.json({type:4,data:{flags:64,content:'Unsupported command'}});
    if (!process.env.DISCORD_ALLOWED_GUILD_ID || data.guild_id!==process.env.DISCORD_ALLOWED_GUILD_ID)
      return Response.json({type:4,data:{flags:64,content:'Penny is not enabled in this server.'}});
    const q=data.data.options?.find(x=>x.name==='question')?.value;
    if (typeof q!=='string' || !q.trim() || q.length>1800 || typeof data.token!=='string' || !data.token)
      return Response.json({type:4,data:{flags:64,content:'Ask /penny a question (up to 1800 characters).'}});
    waitUntil(reply(data,q.trim()));
    return Response.json({type:5});
  }
};
