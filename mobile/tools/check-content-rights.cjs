const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function checkRights(pages){
 const text=Object.values(pages).join('\n');
 const analysis=pages['analysis.html'];
 assert(analysis,'Missing analysis reader');
 const originalScripts=[...analysis.matchAll(/<script>\s*\/\* Independently authored lesson inputs[^]*?<\/script>/g)];
 assert.equal(originalScripts.length,1,'Expected one original teaching-deck bundle');
 const payload=/window\.AnalysisOriginalDecks=(\{[^]*\});/.exec(originalScripts[0][0]);
 assert(payload,'Original deck bundle is malformed');
 const decks=JSON.parse(payload[1]);
 assert.equal(Object.keys(decks).length,10);
 for(const {name,text} of Object.values(decks)){
  assert(/^lesson_sol(?:101|103|107|110)_[a-z_]+\.dat$/.test(name));
  assert(/^SOL (?:101|103|107|110)\r\nCEND\r\n/.test(text));
  assert(text.endsWith('ENDDATA'.padEnd(80)+'\r\n'));
 }
 const withoutOriginals=analysis.replace(originalScripts[0][0],'');
 assert(!/PublicAnalysisModels|ExtendedAnalysis\.models|\b[a-z_][a-z_\d-]*\.(?:dat|bdf)\b/i.test(withoutOriginals),'An unapproved deck or filename leaked into the analysis reader');
 for(const name of ['bolt_friction_three_steps.dat','bolt_frictionless_three_steps.dat','shallow_shell_arclength.dat','bolt_preload_no_friction.dat'])
  assert(!text.includes(name),`Blocked or unverified input included in app: ${name}`);
 assert(text.includes('Copyright (c) [2018] [Stiffened Plate Anaysis and Design]'),'SPAD attribution missing');
 assert(text.includes('Permission is hereby granted'),'SPAD license missing');
 assert(text.includes('THE SOFTWARE IS PROVIDED'),'SPAD warranty notice missing');
}
module.exports={checkRights};
if(require.main===module){checkRights(JSON.parse(fs.readFileSync(path.join(root,'src/generated/lessons.json'),'utf8')).pages);console.log('PASS: only ten original analysis decks included; blocked inputs absent; SPAD license present.');}
