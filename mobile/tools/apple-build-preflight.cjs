'use strict';
// Validate the explicitly titled release before starting a Mac runner.
// Apple reference: https://developer.apple.com/documentation/appstoreconnectapi/get-v1-prereleaseversions-_id_-builds
const fs=require('node:fs'),{get}=require('./apple-api.cjs');
const app=require('../app.json').expo;
const {validVersion}=require('./release-version.cjs');
const required=['APP_STORE_CONNECT_KEY_ID','APP_STORE_CONNECT_ISSUER_ID','APP_STORE_CONNECT_API_KEY_BASE64'];
function requiredValue(k){const v=process.env[k]?.trim();if(!v)throw Error('Missing secret: '+k);return v;}
async function main(){
 required.forEach(requiredValue);
 const appId=process.env.APP_STORE_APP_ID||'6816586481';
 if(appId!=='6816586481'||app.ios.bundleIdentifier!=='com.safa.nastran')throw Error('Unexpected Nastran app identity.');
 const remote=(await get('/v1/apps/'+appId)).data;
 if(remote.attributes.bundleId!==app.ios.bundleIdentifier)throw Error('App Store Connect app and bundle ID do not match.');
 const version=process.env.APP_VERSION||app.version,build=process.env.BUILD_NUMBER||app.ios.buildNumber;
 if(!validVersion(version)||!/^\d+$/.test(build||'')||Number(build)<1001)throw Error('Specify version and build, e.g. 1.2.1 (1001).');
 if(version!==app.version||build!==app.ios.buildNumber)throw Error('Dispatch version must match app.json; update release settings before building.');
 let versions=[],url='/v1/preReleaseVersions?filter[app]='+appId+'&filter[platform]=IOS&limit=200';
 while(url){const page=await get(url);versions.push(...page.data);url=page.links?.next;}
 let largest=1000;
 for(const train of versions.filter(v=>v.attributes.version===version)){
  url='/v1/preReleaseVersions/'+train.id+'/builds?limit=200';
  while(url){const page=await get(url);for(const b of page.data){if(/^\d+$/.test(b.attributes.version))largest=Math.max(largest,Number(b.attributes.version));}url=page.links?.next;}
 }
 if(Number(build)<=largest)throw Error(`Build ${version} (${build}) was already used. Increase the build above ${largest}, or increase the version.`);
 if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,`build_number=${build}\napp_version=${version}\n`);
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,`App: ${appId}\n\nBundle: ${app.ios.bundleIdentifier}\n\nVersion: ${version}（${build}）\n`);
 console.log(`Verified Nastran destination: ${version}（${build}）.`);
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
