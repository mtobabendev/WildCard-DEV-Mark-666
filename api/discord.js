import { createPublicKey, verify } from 'node:crypto';
import { waitUntil } from '@vercel/functions';
import { parsePennyMemoryCommand, privateMemoryCommand, contextWithNotes, buildConversationMessages } from '../lib/penny-discord-memory.js';
const APP = '1531868631325999256';
const PARTY = 'https://party.wildcarddev.com/api/penny-provider';


const MEMORY_ENDPOINT = 'https://party.wildcarddev.com/api/penny-memory';
async function memoryOperation(action, interaction, extra = {}) {
  const secret = process.env.PENNY_MEMORY_BRIDGE_SECRET;
  if (typeof secret !== 'string' || secret.length < 40) throw new Error('Memory is not configured');
  const userId = interaction.member?.user?.id || interaction.user?.id;
  if (!/^\d{17,20}$/.test(userId || '')) throw new Error('Invalid Discord user');
  const response = await fetch(MEMORY_ENDPOINT, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(9000),
    headers: { Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' },
    body: JSON.stringify({action, guildId:interaction.guild_id,channelId:interaction.channel_id,userId,...extra})
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Memory service unavailable');
  return body;
}

export function verifyInteraction(raw, sig, stamp, hex) {
  if (!/^[a-f\d]{128}$/i.test(sig || '') || !/^\d{10}$/.test(stamp || '') || !/^[a-f\d]{64}$/i.test(hex || '')) return false;
  if (Math.abs(Date.now()/1000 - Number(stamp)) > 300) return false;
  try {
    const key = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100','hex'), Buffer.from(hex,'hex')]), format:'der', type:'spki' });
    return verify(null, Buffer.concat([Buffer.from(stamp), Buffer.from(raw)]), key, Buffer.from(sig,'hex'));
  } catch { return false; }
}


async function reply(interaction, question) {
  const command = parsePennyMemoryCommand(question);
  let content;
  try {
    if (command.type === 'save') {
      const result = await memoryOperation('add',interaction,{note:command.note});
      content = result.saved ? "Got it, Honey. I've saved that note just for your Discord account. 🖤" : 'That note could not be saved.';
    } else if (command.type === 'list') {
      const {items} = await memoryOperation('list',interaction);
      content = items.length ? 'Here is what you asked me to remember, Honey:\n' + items.map((x,i)=>String(i+1)+'. '+x.note).join('\n').slice(0,1750)
        : "I don't have any saved notes for you yet, Honey. Say: remember that ...";
    } else if (command.type === 'clear') {
      await memoryOperation('clear',interaction);
      content = "All your saved Discord notes have been deleted, Honey.";
    } else if (command.type === 'forget') {
      const {items} = await memoryOperation('list',interaction);
      const note = items[command.number - 1];
      if (!note) {
        content = "That note number isn't in your memory list, Honey. Try: what do you remember";
      } else {
        await memoryOperation('forget',interaction,{id:note.id});
        content = 'Forgotten that note, Honey.';
      }
    } else if (command.type === 'conversation_enable') {
      await memoryOperation('convo_enable', interaction);
      content = "Conversation continuity is on, Honey. I'll remember up to four of our recent exchanges in this channel for 24 hours. Say 'conversation off' to erase them and stop. 🖤";
    } else if (command.type === 'conversation_disable') {
      await memoryOperation('convo_disable', interaction);
      content = "Our short-term conversation history is erased and continuity is off, Honey.";
    } else if (command.type === 'conversation_clear') {
      await memoryOperation('convo_clear', interaction);
      content = "Fresh start, Honey. I've cleared our recent conversation in this channel.";
    } else if (command.type === 'conversation_status') {
      const {enabled} = await memoryOperation('convo_read', interaction);
      content = enabled ? "Our 24-hour conversation continuity is on in this channel, Honey. Say 'conversation off' to erase it."
        : "Our conversation continuity is off here, Honey. Say 'keep our conversation' to turn it on.";
    } else {
      let prompt = command.prompt;
      if (command.type === 'recall') {
        const {items} = await memoryOperation('list',interaction);
        prompt = contextWithNotes(command.prompt, items);
      }
      let continuityEnabled = false;
      let contextMessages = [{role:'user',content:prompt.slice(0,1800)}];
      if (command.type === 'chat') {
        try {
          const continuity = await memoryOperation('convo_read', interaction);
          continuityEnabled = continuity.enabled === true;
          if (continuityEnabled) contextMessages = buildConversationMessages(prompt, continuity.exchanges);
        } catch {
          // A memory outage never prevents normal, stateless public conversation.
        }
      }
      const control = new AbortController();
      const timeout = setTimeout(()=>control.abort(),25000);
      try {
        const result = await fetch(PARTY, {
          method:'POST',redirect:'error',signal:control.signal,
          headers:{'Content-Type':'application/json',Origin:'https://party.wildcarddev.com',Accept:'text/plain'},
          body:JSON.stringify({messages:contextMessages,provider:'gemini',presentation:'standard'})
        });
        if(!result.ok||result.headers.get('X-Penny-Provider')!=='gemini')throw new Error('Provider unavailable');
        content=(await result.text()).trim().slice(0,1900)||"My answer came back empty, Honey. 🖤";
        if (continuityEnabled && command.type === 'chat') {
          try {
            await memoryOperation('convo_append', interaction, {exchange:{
              interactionId:interaction.id,question:command.prompt,answer:content
            }});
          } catch { console.warn('Penny conversation append failed'); }
        }
      } finally { clearTimeout(timeout); }
    }
  } catch {
    content = privateMemoryCommand(command)
      ? "Penny's saved memory isn't available right now, Honey. I haven't claimed anything was saved or deleted."
      : "Penny's AI connection isn't responding just now. Try again shortly. 🖤";
  }
  try {
    const url='https://discord.com/api/v10/webhooks/'+APP+'/'+encodeURIComponent(interaction.token)+'/messages/@original';
    const sent=await fetch(url,{method:'PATCH',redirect:'error',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({content,allowed_mentions:{parse:[]}})});
    if(!sent.ok)console.error('Discord reply failed',sent.status);
  } catch {console.error('Discord reply transport failed');}
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
    const memoryCommand = parsePennyMemoryCommand(q.trim());
    waitUntil(reply(data,q.trim()));
    return Response.json({type:5, data:{ flags: privateMemoryCommand(memoryCommand) ? 64 : 0 }});
  }
};
