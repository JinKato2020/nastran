'use strict';
const assert=require('node:assert/strict'),{spawnSync}=require('node:child_process'),path=require('node:path');
const dir=__dirname,version=require('../app.json').expo.version,build=require('../app.json').expo.ios.buildNumber;
function run(existing,overrides={}){
 const code=`const id=require.resolve('./apple-api.cjs');require.cache[id]={exports:{get:async url=>{
  if(url==='/v1/apps/6816586481')return {data:{attributes:{bundleId:'com.safa.nastran'}}};
  if(url.startsWith('/v1/preReleaseVersions?'))return {data:[{id:'old',attributes:{version:'1.0.0'}},...(${existing}?[{id:'current',attributes:{version:${JSON.stringify(version)}}}]:[])]};
  if(url==='/v1/preReleaseVersions/current/builds?limit=200')return {data:[{attributes:{version:${JSON.stringify(build)}}}]};
  throw Error('Unexpected API request: '+url);
 }}};require('./apple-build-preflight.cjs');`;
 return spawnSync(process.execPath,['-e',code],{cwd:dir,encoding:'utf8',env:{...process.env,APP_STORE_CONNECT_KEY_ID:'test',APP_STORE_CONNECT_ISSUER_ID:'test',APP_STORE_CONNECT_API_KEY_BASE64:'test',APP_STORE_APP_ID:'6816586481',APP_VERSION:version,BUILD_NUMBER:build,GITHUB_OUTPUT:'',GITHUB_STEP_SUMMARY:'',...overrides}});
}
assert.equal(run(false).status,0,'New version starts at configured build independently of older version numbers');
const duplicate=run(true);assert.notEqual(duplicate.status,0);assert.match(duplicate.stderr,/already used/);
const mismatch=run(false,{APP_VERSION:'1.2.99'});assert.notEqual(mismatch.status,0);assert.match(mismatch.stderr,/match app.json/);
const invalid=run(false,{BUILD_NUMBER:'1001\nunsafe'});assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/Specify version and build/);
console.log('PASS: release preflight scopes build numbers by version and rejects reused/mismatched values.');
