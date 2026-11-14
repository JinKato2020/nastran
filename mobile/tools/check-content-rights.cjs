const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function checkRights(pages){
 const text=Object.values(pages).join('\n');
 const analysis=pages['analysis.html'];
 assert(analysis,'Missing analysis reader');
 assert(!/PublicAnalysisModels|ExtendedAnalysis\.models|BEGIN BULK|ENDDATA|[a-z_][a-z_\d-]*\.(?:dat|bdf)\b/i.test(analysis),'An analysis input deck or filename leaked into the reader');
 assert(!/id="(?:copy|save)-analysis"|analysis-example-raw/.test(analysis),'Analysis deck controls must not be bundled');
 for(const name of ['bolt_friction_three_steps.dat','bolt_frictionless_three_steps.dat','shallow_shell_arclength.dat','bolt_preload_no_friction.dat'])
  assert(!text.includes(name),`Blocked or unverified input included in app: ${name}`);
 assert(text.includes('Copyright (c) [2018] [Stiffened Plate Anaysis and Design]'),'SPAD attribution missing');
 assert(text.includes('Permission is hereby granted'),'SPAD license missing');
 assert(text.includes('THE SOFTWARE IS PROVIDED'),'SPAD warranty notice missing');
}
module.exports={checkRights};
if(require.main===module){checkRights(JSON.parse(fs.readFileSync(path.join(root,'src/generated/lessons.json'),'utf8')).pages);console.log('PASS: analysis decks and blocked/candidate DAT absent; SPAD license present.');}
