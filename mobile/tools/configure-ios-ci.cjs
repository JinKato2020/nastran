'use strict';
const fs=require('node:fs'),path=require('node:path'),xcode=require('xcode');
const names=fs.readdirSync('ios').filter(n=>n.endsWith('.xcodeproj'));
if(names.length!==1)throw Error('Expected one generated Xcode project.');
const projectName=path.basename(names[0],'.xcodeproj');
const file=path.join('ios',names[0],'project.pbxproj');
const project=xcode.project(file).parseSync();
const team=process.env.IOS_TEAM_ID?.trim(),profile=process.env.PROFILE_UUID,build=process.env.BUILD_NUMBER;
if(!/^[A-Z0-9]{10}$/.test(team||'')||!/^[A-Fa-f0-9-]{36}$/.test(profile||'')||!/^\d+$/.test(build||''))throw Error('Invalid CI signing metadata.');
for(const [key,value] of Object.entries({CODE_SIGN_STYLE:'Manual',DEVELOPMENT_TEAM:team,PROVISIONING_PROFILE_SPECIFIER:profile,CODE_SIGN_IDENTITY:'"Apple Distribution"',CURRENT_PROJECT_VERSION:build}))project.addBuildProperty(key,value,'Release');
// These settings affect this app project only; CocoaPods targets keep their defaults.
fs.writeFileSync(file,project.writeSync());
fs.appendFileSync(process.env.GITHUB_ENV,`PROJECT_NAME=${projectName}\n`);
console.log('Configured app Release signing and build number.');
