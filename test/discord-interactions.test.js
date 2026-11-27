import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyInteraction} from '../api/discord.js';
test('signed Discord request accepted; tampered and replay rejected',()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
 const body=JSON.stringify({type:1,application_id:'1531868631325999256'});
 const stamp=String(Math.floor(Date.now()/1000));
 const pub=publicKey.export({type:'spki',format:'der'}).subarray(-32).toString('hex');
 const sig=sign(null,Buffer.from(stamp+body),privateKey).toString('hex');
 assert.equal(verifyInteraction(body,sig,stamp,pub),true);
 assert.equal(verifyInteraction(body+' ',sig,stamp,pub),false);
 assert.equal(verifyInteraction(body,sig,String(+stamp-601),pub),false);
 assert.equal(verifyInteraction(body,'0'.repeat(128),stamp,pub),false);
});
