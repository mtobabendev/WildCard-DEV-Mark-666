// Run only after deploying the signed endpoint. Never put the bot token in source.
const id='1531868631325999256', token=process.env.DISCORD_BOT_TOKEN, guild=process.env.DISCORD_ALLOWED_GUILD_ID;
if (!token || !/^\d{17,20}$/.test(guild || '')) { console.error('Set DISCORD_BOT_TOKEN and DISCORD_ALLOWED_GUILD_ID'); process.exit(1); }
const res=await fetch(`https://discord.com/api/v10/applications/${id}/guilds/${guild}/commands`,{
 method:'POST',redirect:'error',headers:{'Authorization':`Bot ${token}`,'Content-Type':'application/json'},
 body:JSON.stringify({name:'penny',description:'Ask Penny Bella Morningstar',type:1,
 options:[{type:3,name:'question',description:'Your question for Penny',required:true,max_length:1800}]})
});
if(!res.ok){console.error('Discord registration failed',res.status);process.exit(1);}
const result=await res.json();console.log('Registered /penny in guild',guild,'command',result.id);
