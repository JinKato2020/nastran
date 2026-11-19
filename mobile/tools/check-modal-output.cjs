'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),C=require(path.join(dir,'analysis-modal-output-core.js'));
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),a+' != '+b);
const mv=(a,x)=>a.map(row=>row.reduce((s,v,i)=>s+v*x[i],0));
for(const norm of ['MASS','MAX'])for(const sign of [1,-1]){
 const modes=[1,2].map(i=>C.mode(i,norm,sign));
 for(const d of modes){
  const k=mv(C.K,d.phi),m=mv(C.M,d.phi);
  k.forEach((v,i)=>near(v,d.lambda*m[i]));
  near(d.stiffness/d.mu,d.lambda);near((2*Math.PI*d.frequency)**2,d.lambda);
  near(d.eff,d.mu*d.beta*d.beta);
  if(norm==='MASS')near(d.mu,1);else near(Math.max(...d.phi.map(Math.abs)),1);
 }
 near(modes.reduce((s,d)=>s+d.eff,0),3);
 for(let i=0;i<2;i++)near(modes.reduce((s,d)=>s+d.psi[i],0),1);
 // Recover the physical inverse stiffness from both modal bases.
 const F=[1,0],direct=[.0025,.0025],u=[0,0];
 for(const d of modes){const q=d.phi.reduce((s,v,i)=>s+v*F[i],0)/d.stiffness;d.phi.forEach((v,i)=>u[i]+=v*q);}
 u.forEach((v,i)=>near(v,direct[i]));
}
const max=C.mode(1,'MAX'),mass=C.mode(1,'MASS'),reverse=C.mode(1,'MAX',-1);
near(max.mu,1.5);near(max.L,2);near(max.beta,4/3);near(max.eff,8/3);
near(mass.beta,Math.sqrt(8/3));near(mass.eff,max.eff);near(reverse.beta,-max.beta);
max.psi.forEach((v,i)=>{near(v,mass.psi[i]);near(v,reverse.psi[i]);});
const c={window:{},console};vm.createContext(c);
for(const f of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards','lesson-article','analysis-data','extended-analysis-data','analysis-relations-data','analysis-scenario-relations','analysis-scenario-guides','analysis-scenarios','beam-labs','analysis-mode-quiz','analysis-quiz','analysis-model-quiz','analysis-modal-output-core','analysis-f06-reader','analysis-modal-output'])vm.runInContext(fs.readFileSync(path.join(dir,f+'.js'),'utf8'),c,{filename:f+'.js'});
const w=c.window,entries=w.InputCatalog.entries,keys=new Set(entries.map(x=>x.key)),card=entries.find(x=>x.key==='CASE_MEFFMASS');
// Cross-check the printed values of the primary job at its F06 precision.
function printedNear(value, reference) {
 assert(Math.abs(value-reference)<=Math.abs(reference)*2e-6);
}
printedNear(40.48877/(2*Math.PI),6.443987);
printedNear((-15.63371)**2,244.4130);
printedNear(244.4130/373.6090,.6541947);
printedNear(356.9882/373.6090,.9555129);
printedNear(524.9101/.0003934821,1.334013e6);
assert(card&&card.kind==='control'&&card.sourceVersion==='2025.1'&&card.page===502);
for(const label of ['PRINT','PUNCH','GRID','SUMMARY','PARTFAC','MEFFM','MEFFW','FRACSUM','ALL','YES'])assert(card.terms.some(x=>x[0].includes(label)),label);
for(const model of ['baseline','tip-mass','both-fixed']){
 const sections=w.AnalysisModalOutput.sections(model),html=sections.map(x=>x[1]).join('');
 assert.equal(sections.length,9);assert.equal(new Set(sections.map(x=>x[2])).size,9);
 for(const [,key]of html.matchAll(/href="bulk.html#([^"]+)"/g))assert(keys.has(key),key);
 assert(html.includes('実機F06と照合した例は未収録'));
 assert(html.includes('MASSでは一致しますが、MAXでは定義の確認'));
 assert(w.AnalysisRelationMaps[model].panels.some(x=>x.nodes.some(n=>n.card==='CASE_MEFFMASS')));
 assert(w.AnalysisModelGuides[model].inputReview.flatMap(x=>x[1]).some(x=>x[0]==='CASE_MEFFMASS'));
}
console.log('PASS: independent two-mass eigen residuals, normalization/sign invariants, modal force recovery, effective-mass completeness, 3 result routes and MEFFMASS catalog links.');
