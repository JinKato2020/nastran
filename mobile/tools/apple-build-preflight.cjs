'use strict';
// Check the destination and choose a build number before starting a Mac runner.
const fs=require('node:fs'),crypto=require('node:crypto');
const app=require('../app.json').expo;
const required=['APP_STORE_CONNECT_KEY_ID','APP_STORE_CONNECT_ISSUER_ID','APP_STORE_CONNECT_API_KEY_BASE64'];
function requiredValue(k){const v=process.env[k]?.trim();if(!v)throw Error('Missing secret: '+k);return v;}
async function main(){
 required.forEach(requiredValue);
 const appId=process.env.APP_STORE_APP_ID||'6816586481';
 if(appId!=='6816586481'||app.ios.bundleIdentifier!=='com.safa.nastran')throw Error('Unexpected Nastran app identity.');
 const stamp=Math.floor(Date.now()/1000),encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const unsigned=encode({alg:'ES256',kid:requiredValue(required[0]),typ:'JWT'})+'.'+encode({iss:requiredValue(required[1]),iat:stamp,exp:stamp+600,aud:'appstoreconnect-v1'});
 const key=crypto.createPrivateKey(Buffer.from(requiredValue(required[2]),'base64'));
 const jwt=unsigned+'.'+crypto.sign('sha256',Buffer.from(unsigned),{key,dsaEncoding:'ieee-p1363'}).toString('base64url');
 async function get(url){
  const full=new URL(url,'https://api.appstoreconnect.apple.com');
  if(full.origin!=='https://api.appstoreconnect.apple.com')throw Error('Unexpected API origin.');
  const r=await fetch(full,{headers:{Authorization:'Bearer '+jwt},signal:AbortSignal.timeout(45000)});
  if(!r.ok)throw Error('Apple API HTTP '+r.status+' at '+full.pathname);
  return r.json();
 }
 const remote=(await get('/v1/apps/'+appId)).data;
 if(remote.attributes.bundleId!==app.ios.bundleIdentifier)throw Error('App Store Connect app and bundle ID do not match.');
 let largest=0,url='/v1/builds?filter[app]='+appId+'&limit=200';
 while(url){const page=await get(url);for(const b of page.data){if(/^\d+$/.test(b.attributes.version))largest=Math.max(largest,Number(b.attributes.version));}url=page.links?.next;}
 const sequence=Number(process.env.GITHUB_RUN_NUMBER||1);
 const build=Math.max(1000+sequence,largest+1);
 if(!Number.isSafeInteger(build))throw Error('Invalid build number.');
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`build_number=${build}\n`);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`App: ${appId}\n\nBundle: ${app.ios.bundleIdentifier}\n\nVersion: ${app.version} (${build})\n`);
 console.log('Verified Nastran destination. Build '+build+' selected.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
