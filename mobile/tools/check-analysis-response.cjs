'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),C=require(path.join(dir,'analysis-response-core.js'));
const near=(a,b,t=1e-8)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),a+' != '+b);
// Independent 60-element Euler-Bernoulli FE model with consistent mass, solved with scipy.linalg.solve.
const beamRef={0:[.3423094477556511,-.013692377910707758],10:[.3668488230023591,-.015731694492144357],38.1:[-.2112909028788923,-8.314700405853127],70:[-.1290047136140612,-.002820138583703707]};
for(const [f,ref]of Object.entries(beamRef))C.beam(+f).forEach((v,i)=>near(v,ref[i],3e-5));
near(1/C.k,12/35);assert(C.amp(C.beam(10,.04,1))>1/C.k,'finite-frequency amplification must not be confused with static truncation');
for(const f of [0,1,3.18,4.5,5.51,8])for(const deg of [0,90,180])for(const g of [.004,.04,.08]){
 const d=C.two(f,g,'pair',deg,2),w=2*Math.PI*f;
 for(let i=0;i<2;i++){
  d.modal[i].forEach((v,j)=>near(v,d.direct[i][j],1e-10));
  const r=C.add(C.mul([800-w*w,800*g],d.direct[i]),C.mul([-400,-400*g],d.direct[1-i]));
  r.forEach((v,j)=>near(v,d.F[i][j]));
 }
}
// Elastic outer-fibre stress from the independent continuous clamped/free solution:
 // P*z*(sinh(bL)+sin(bL))/(I*(1+iG)*b*(1+cosh(bL)*cos(bL))), b^4=rho*A*w²/(EI*(1+iG)).
const exactStress=[1.8032169310451043,-.07813100441331315];
const stress8=C.beamRootStress(10,.04,8);
for(let i=0;i<2;i++)assert(Math.abs(stress8[i]/exactStress[i]-1)<.004);
assert(C.amp(C.beamRootStress(10,.04,1))>1.10*C.amp(stress8));
const missed=C.two(5,.04,'pair',180,1);assert(C.amp(missed.modal[0])<1e-15);assert(C.amp(missed.direct[0])>.001);
const anti=C.two(Math.sqrt(800)/(2*Math.PI),0,'single',0,2);near(C.amp(anti.direct[0]),0);assert(C.amp(anti.direct[1])>0);
const timeRef=[[0,.005,0,.003,.24673600588970448],[0,.005,0,.017,-.36250268261431967],[0,.005,0,.071,-.7094615561559641],[0,.005,0,.18,-1.1243768315949467],[.02,.05,0,.003,.24441198681215412],[.02,.05,0,.017,1.5695086445714848],[.02,.05,0,.071,.47994480253140887],[.02,.05,0,.18,.2585341837110809],[.04,.05,.05,.003,.004950408573027623],[.04,.05,.05,.017,.3863763167198347],[.04,.05,.05,.071,.4926822118644406],[.04,.05,.05,.18,-.014293039084410894]];
// Independent physical-state integration with scipy.solve_ivp and max step 0.00005 s.
for(const [z,tau,rise,t,value]of timeRef)near(C.pulse(t,tau,z,rise),value,1e-7);
for(const tau of [.005,.05])for(const z of [0,.02,.08]){
 const error=dt=>Math.max(...C.newmark({dt,tau,z}).map(([t,u])=>Math.abs(u-C.pulse(t,tau,z))));
 assert(error(.0001)<error(.001),[tau,z]);assert(error(.0001)<.01);
}
near(C.pulse(1/C.fn,1/C.fn,0),0);
const ctx={window:{},console};vm.createContext(ctx);
const files=['lesson-article','analysis-data','extended-analysis-data','analysis-relations-data','analysis-scenario-relations','analysis-scenario-guides','analysis-scenarios','analysis-scenario-diagrams','beam-labs','analysis-mode-quiz','analysis-quiz','analysis-model-quiz','analysis-structure-core','analysis-structure-labs','analysis-structure-lessons','analysis-eigen-core','analysis-eigen-labs','analysis-prestress-lessons','analysis-complex-lessons','analysis-response-core','analysis-response-labs','analysis-modal-cases','analysis-frequency-lessons','analysis-transient-lessons','analysis-response-quiz'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),ctx,{filename:file+'.js'});
const catalogContext={window:{}};vm.createContext(catalogContext);
for(const file of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),catalogContext);
const cardKeys=new Set(catalogContext.window.InputCatalog.entries.map(e=>e.key));
const w=ctx.window;let models=0,questions=0;
for(const key of ['direct-frequency','modal-frequency','transient'])for(const m of w.AnalysisScenarios[key].models){
 models++;const g=w.AnalysisModelGuides[m.id],q=w.AnalysisQuiz.resolve(key,m.id);
 for(const section of g.inputReview)for(const [card]of section[1])assert(cardKeys.has(card),m.id+' -> '+card);
 for(const panel of w.AnalysisRelationMaps[m.id].panels)for(const node of panel.nodes)if(node.card)assert(cardKeys.has(node.card),m.id+' map -> '+node.card);
 assert(g.items.length===3&&g.verify.length>=5,m.id);assert(g.inputReview.flatMap(x=>x[1]).length>=20,m.id);assert(g.pitfalls.length>=5);
 assert(g.explanation().includes('data-response-lab'));assert(!g.explanation().includes('undefined'));
 if(key==='modal-frequency'){
  const lesson=w.ModalFrequencyCases[m.id];
  assert(lesson.input.body.includes('<table'));assert(lesson.result.body().includes('<svg'));
  assert.equal(q.questions.filter(item=>w.AnalysisQuiz.partOf(key,item)==='input').length,2,m.id);
  if(m.id==='mfreq-antiresonance'){
   const loadMap=w.AnalysisRelationMaps[m.id].panels.find(p=>p.nodes.some(n=>n.card==='RLOAD1'));
   assert.equal(loadMap.nodes.filter(n=>n.card==='RLOAD1').length,1);
   assert(!loadMap.nodes.some(n=>n.card==='DPHASE'));
  }
 }
 assert.equal(q.questions.length,4);
 for(const item of q.questions){questions++;assert.equal(item.options.length,4);assert(item.options[item.answer]);assert.equal(w.AnalysisQuiz.diagnose(String(item.verify.check.expect),item.verify.check)[0],'ok');}
 for(const panel of w.AnalysisRelationMaps[m.id].panels){const ids=new Set(panel.nodes.map(x=>x.id));for(const e of panel.edges)assert(ids.has(e.from)&&ids.has(e.to));}
 assert(!/[\u3040-\u30ff\u3400-\u9fff]/.test(w.renderAnalysisScenarioDiagram(m.diagram).match(/<svg[\s\S]*?<\/svg>/)[0].replace(/<[^>]+>/g,'')),m.id);
}
assert.equal(models,13);assert.equal(questions,52);
console.log('PASS: independent beam FE and state-integration references, complex-force balance, full-basis equivalence, missing-mode/antiresonance cases, time-step convergence, 13 comparisons and 52 questions.');
