'use strict';
const fs=require('node:fs'),path=require('node:path');
function validVersion(value){return /^\d+\.\d+\.\d+$/.test(value);}
function nextRelease(version,build,mode='next'){
 if(!validVersion(version)||!/^\d+$/.test(String(build))||Number(build)<1001)throw Error('Invalid version or build.');
 const parts=version.split('.').map(Number);
 if(mode==='next')return {version:[parts[0],parts[1],parts[2]+1].join('.'),build:'1001'};
 if(mode==='rebuild')return {version,build:String(Number(build)+1)};
 throw Error('Use next or rebuild.');
}
function applyRelease(version,build){
 if(!validVersion(version)||!/^\d+$/.test(String(build))||Number(build)<1001)throw Error('Invalid version or build.');
 const root=path.resolve(__dirname,'..'),file=path.join(root,'app.json'),app=JSON.parse(fs.readFileSync(file,'utf8'));
 app.expo.version=version;app.expo.ios.buildNumber=String(build);fs.writeFileSync(file,JSON.stringify(app,null,2)+'\n');
 for(const name of ['package.json','package-lock.json']){const p=path.join(root,name),data=JSON.parse(fs.readFileSync(p,'utf8'));data.version=version;if(data.packages?.[''])data.packages[''].version=version;fs.writeFileSync(p,JSON.stringify(data,null,2)+'\n');}
 return {version,build:String(build)};
}
if(require.main===module){
 const app=require('../app.json').expo,mode=process.argv[2];
 const selected=mode==='apply'?{version:process.env.APP_VERSION,build:process.env.BUILD_NUMBER}:nextRelease(app.version,app.ios.buildNumber,mode);
 const result=applyRelease(selected.version,selected.build);
 if(mode!=='apply'){
  const root=path.resolve(__dirname,'..'),candidates=[path.join(root,'../.github/workflows/build-ios.yml'),path.join(root,'../github/nastran/.github/workflows/build-ios.yml')];
  const workflow=candidates.find(p=>fs.existsSync(p));
  if(workflow){let yaml=fs.readFileSync(workflow,'utf8');for(const [key,value]of [['app_version',result.version],['build_number',result.build]]){const pattern=new RegExp('(      '+key+':[\\s\\S]*?        default: )[^\\r\\n]+');if(!pattern.test(yaml))throw Error('Workflow version input missing: '+key);yaml=yaml.replace(pattern,`$1'${value}'`);}fs.writeFileSync(workflow,yaml);}
 }
 console.log(JSON.stringify(result));
}
module.exports={validVersion,nextRelease,applyRelease};
