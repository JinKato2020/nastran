'use strict';
const crypto=require('node:crypto');
function value(k){const v=process.env[k]?.trim();if(!v)throw Error('Missing secret: '+k);return v;}
async function get(url){
 const full=new URL(url,'https://api.appstoreconnect.apple.com');
 if(full.origin!=='https://api.appstoreconnect.apple.com')throw Error('Unexpected Apple API origin.');
 const stamp=Math.floor(Date.now()/1000),encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const unsigned=encode({alg:'ES256',kid:value('APP_STORE_CONNECT_KEY_ID'),typ:'JWT'})+'.'+encode({iss:value('APP_STORE_CONNECT_ISSUER_ID'),iat:stamp,exp:stamp+600,aud:'appstoreconnect-v1'});
 const key=crypto.createPrivateKey(Buffer.from(value('APP_STORE_CONNECT_API_KEY_BASE64'),'base64'));
 const jwt=unsigned+'.'+crypto.sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
 const r=await fetch(full,{headers:{Authorization:'Bearer '+jwt},signal:AbortSignal.timeout(45000)});
 if(!r.ok)throw Error('Apple API HTTP '+r.status+' at '+full.pathname);
 return r.json();
}
module.exports={get};
