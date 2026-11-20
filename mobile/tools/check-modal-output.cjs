'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),C=require(path.join(dir,'analysis-modal-output-core.js'));
const near=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)),a+' != '+b);
const mv=(a,x)=>a.map(row=>row.reduce((s,v,i)=>s+v*x[i],0));
// Two-mass lesson lab (theory.html#modes): eigen residuals and normalization invariants.
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
assert(card&&card.kind==='control'&&card.sourceVersion==='2025.1'&&card.page===502);
for(const label of ['PRINT','PUNCH','GRID','SUMMARY','PARTFAC','MEFFM','MEFFW','FRACSUM','ALL','YES'])assert(card.terms.some(x=>x[0].includes(label)),label);
for(const model of ['baseline','tip-mass','both-fixed']){
 const sections=w.AnalysisModalOutput.sections(model),html=sections.map(x=>x[1]).join('');
 assert.equal(sections.length,6);assert.equal(new Set(sections.map(x=>x[2])).size,6);
 for(const [,key]of html.matchAll(/href="bulk.html#([^"]+)"/g))assert(keys.has(key),key);
 assert(html.includes('theory.html#modes'));  // concepts live in the lesson; this tab stays technical
 assert(html.includes('仮想の出力')&&html.includes('仮想の F06')&&!html.includes('github.com'));
 assert(w.AnalysisRelationMaps[model].panels.some(x=>x.nodes.some(n=>n.card==='CASE_MEFFMASS')));
 assert(w.AnalysisModelGuides[model].inputReview.flatMap(x=>x[1]).some(x=>x[0]==='CASE_MEFFMASS'));
}

// ---------- Virtual F06: the printed tables must agree with each other at print precision ----------
const R=w.AnalysisF06Reader,V=R.line;
const tok=s=>s.trim().split(/\s+/),num=s=>tok(s).map(Number);
const same=(a,b,what)=>assert(Math.abs(a-b)<=2e-6*Math.max(Math.abs(a),Math.abs(b))+1e-300,what+': '+a+' vs '+b);
const ends=s=>{const r=[],re=/\S+/g;let m;while((m=re.exec(s)))r.push(m.index+m[0].length);return r.join(',');};
// Column end positions measured on a real MSC Nastran F06 (right-aligned fields).
const layout=(rows,want,what)=>rows.forEach((row,i)=>assert.equal(ends(row),want,what+' row '+(i+1)));
layout(V.eig,'6,16,36,56,76,96,116','REAL EIGENVALUES');
layout(V.frac,'4,20,38,56,74,92,110,128','MODAL EFFECTIVE MASS FRACTION');
layout([...V.pf,...V.mass,...V.weight],'4,20,38,56,74','PARTFAC/MEFFM/MEFFW');
layout([V.massTotal],'19,38,56,74','MEFFM TOTAL');
layout([V.sum],'12,30,48','TOTAL EFFECTIVE MASS FRACTION');layout([V.sumHead],'7,25,43','SUMMARY header');
layout(V.aset,'1,16,30,44,58,72,86,88','A-SET matrix');
layout(V.max,'1,10,26,41,56,71,86,101','MAXIMUM DISPLACEMENTS');
layout([V.vec1Tip,V.vec2Tip],'8,15,33,48,63,78,93,108','EIGENVECTOR');
layout(V.gpwg,'9,33,51,65,79','GPWG mass axis');
// Eigenvalues: CYCLES = RADIANS/2pi, EIGENVALUE = RADIANS^2, stiffness = lambda x mass, mass = 1.
const eig=V.eig.map(num),f=eig.map(r=>r[4]);
assert.equal(Number(tok(V.roots).pop()),eig.length);
for(const [n,order,lam,om,cyc,gm,gk] of eig){assert(n===order);same(om/(2*Math.PI),cyc,'cycles '+n);same(om*om,lam,'lambda '+n);same(gm,1,'gen mass');same(gk,lam*gm,'gen stiffness');}
// Participation -> effective mass -> fraction -> cumulative sum -> totals.
const pf=V.pf.map(num),meff=V.mass.map(num),frac=V.frac.map(num),aset=V.aset.map(r=>num(r.slice(1,-1)));
const gp=V.gpwg.map(r=>num(r.slice(9)));
const denom=[aset[0][0],aset[1][1],aset[2][2]];
denom.forEach(d=>same(d,100,'a-set diagonal'));
const total=num(V.massTotal.replace('TOTAL','')),sumLine=num(V.sum);
const run=[0,0,0];
eig.forEach((_,i)=>{
 for(const r of [pf[i],meff[i],frac[i]]){assert.equal(r[0],i+1);same(r[1],f[i],'frequency column');}
 for(let j=0;j<3;j++){
  same(meff[i][2+j],pf[i][2+j]**2,'MEFFM = PARTFAC^2');
  same(frac[i][2+2*j],meff[i][2+j]/denom[j],'FRACTION = MEFFM/a-set');
  run[j]+=frac[i][2+2*j];same(frac[i][3+2*j],run[j],'SUM');
 }
});
for(let j=0;j<3;j++){same(total[j],meff.reduce((s,r)=>s+r[2+j],0),'TOTAL');same(sumLine[j],total[j]/denom[j],'TOTAL FRACTION');same(sumLine[j],run[j],'last SUM');}
num(V.weight[0]).slice(2).forEach((v,j)=>same(v,meff[0][2+j],'MEFFW = MEFFM / WTMASS(1)'));
// GPWG: 11 nodes x 10 kg; the a-set leaves out the fixed node; CG and the T2-R3 coupling follow from x = 0, 0.15, ... 1.5.
const xs=Array.from({length:11},(_,i)=>i*0.15);
gp.forEach(r=>same(r[0],110,'GPWG mass'));same(gp[0][0]-denom[0],10,'fixed node mass');
same(gp[1][1],xs.reduce((s,x)=>s+10*x,0)/110,'CG');assert(gp[0][1]===0&&gp[1][2]===0&&gp[2][3]===0);
same(aset[1][5],xs.slice(1).reduce((s,x)=>s+10*x,0),'T2-R3 coupling');same(aset[2][4],-aset[1][5],'T3-R2 coupling');
// Mode shapes: the largest component per row tells the mode; the printed tips do not exceed the maxima.
const mx=V.max.map(r=>num(r).slice(2)),big=r=>r.indexOf(Math.max(...r));
[1,2,1,2,3,1,2,0].forEach((want,i)=>assert.equal(big(mx[i].slice(0,i===4?6:3)),i===4?3:want,'main component of mode '+(i+1)));
for(const [tip,row] of [[V.vec1Tip,mx[0]],[V.vec2Tip,mx[1]]]){
 const t=num(tip).slice(2);t.forEach((v,j)=>assert(Math.abs(v)<=row[j]*(1+2e-6),'tip within max'));
 same(Math.max(...t.map(Math.abs)),0.2,'MAX normalization picks the tip translation');
}
// F06 reading quiz: expected values are hand calculations from these printed numbers.
const quiz=w.AnalysisQuiz.data['modes-f06'];
assert.equal(quiz.questions.length,7);
const printed=new Set(Object.values(R.print).flatMap(b=>b.parts.flat()));
for(const q of quiz.questions){
 assert(q.options.length===4&&q.answer>=0&&q.answer<4&&q.code&&q.verify.steps.length>=3);
 for(const row of q.code.split('\n'))if(!row.startsWith('（'))assert(printed.has(row),'quiz line not in the reader: '+row);
 assert.equal(w.AnalysisQuiz.diagnose(String(q.verify.check.expect),q.verify.check)[0],'ok');
 for(const [k] of q.verify.check.diag)if(k!==1&&k!==0)assert.equal(w.AnalysisQuiz.diagnose(String(q.verify.check.expect*k),q.verify.check)[0],'warn');
}
const ex=quiz.questions.map(q=>q.verify.check.expect),vec2=num(V.vec2Tip).slice(2);
same(ex[0],eig[0][3],'Q1 omega');
same(ex[1],frac[0][4]+frac[1][4],'Q2 pair');
same(ex[2],total[1]/denom[1],'Q3 fraction');
same(ex[3],pf[1][4]**2,'Q4 effective mass');
same(ex[4],1/Math.abs(vec2[2]),'Q5 MAX factor');assert.equal(vec2.map(Math.abs).indexOf(Math.max(...vec2.map(Math.abs))),2);
same(ex[5],mx[4][3],'Q6 torsion R1');
same(ex[6],3*f[7],'Q7 second axial mode');
console.log('PASS: two-mass lab invariants, virtual F06 table relations and real-F06 column layout, 7 reading questions tied to the printed lines, 3 result routes and MEFFMASS catalog links.');
