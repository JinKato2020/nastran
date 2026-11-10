'use strict';
const fs=require('node:fs'),{get}=require('./apple-api.cjs');
async function main(){
 const appId=process.env.APP_STORE_APP_ID||'6816586481',build=process.env.BUILD_NUMBER;
 if(appId!=='6816586481'||!/^\d+$/.test(build||''))throw Error('Invalid TestFlight destination or build.');
 const app=(await get('/v1/apps/'+appId)).data;
 if(app.attributes.bundleId!=='com.safa.nastran')throw Error('App ID mismatch.');
 for(let attempt=0;attempt<40;attempt++){
  const query=new URLSearchParams({'filter[app]':appId,'filter[version]':build,limit:'10'});
  const rows=(await get('/v1/builds?'+query)).data;
  const record=rows.find(b=>b.attributes.version===build);
  const state=record?.attributes.processingState||'AWAITING_APPLE';
  console.log('Build '+build+': '+state);
  if(state==='VALID'){
   if(record.attributes.expired)throw Error('Uploaded build is already expired.');
   if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\nTestFlight: Build ${build} — Apple processing VALID.\n\nhttps://appstoreconnect.apple.com/apps/${appId}/testflight/ios\n\nApp Storeの審査申請・公開は行っていません。\n`);
   return;
  }
  if(['FAILED','INVALID'].includes(state))throw Error('Apple rejected processing of this build: '+state);
  await new Promise(resolve=>setTimeout(resolve,30000));
 }
 throw Error('Upload finished, but Apple processing has not completed within 20 minutes. Check TestFlight before uploading again.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
