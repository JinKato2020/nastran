const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),C=require(path.join(dir,'analysis-eigen-core.js'));
const near=(a,b,t=1e-8)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),a+' != '+b);
// Independent Rayleigh energy integrals of sine modes, rather than duplicating the closed-form implementation.
for(const ratio of [-1.1,-.9,-.5,0,.5,1])for(const mode of [1,2,3]){
 const d=C.prestress('pre-none',mode,ratio);let mass=0,bend=0,geo=0;const count=4000,dx=d.L/count;
 for(let i=0;i<count;i++){const x=(i+.5)*dx,k=mode*Math.PI/d.L,v=Math.sin(k*x);mass+=d.rho*d.A*v*v*dx;bend+=d.E*d.I*k**4*v*v*dx;geo+=d.N*k*k*Math.cos(k*x)**2*dx;}
 near(d.lambda,(bend+geo)/mass);if(d.lambda<0)assert.equal(d.f,null);
}
near(C.Pcr,3454.361540381276);near(C.prestress('pre-none').f,106.89136936813375,1e-10);
assert.equal(C.prestress('pre-none',1,-1).f,0);
assert.equal(C.prestress('pre-blocked').N,0);
const base=C.beamApprox(0),critical=2*Math.sqrt(base.m*base.k);
for(const c of [0,.005,critical,.055,.06]){
 const d=C.beamApprox(c);near(C.decay(d,0),1);
 for(const t of [.002,.015,.05]){
  const h=1e-6,q=C.decay(d,t),v=(C.decay(d,t+h)-C.decay(d,t-h))/(2*h),a=(C.decay(d,t+h)-2*q+C.decay(d,t-h))/h**2;
  near(d.m*a+c*v+d.k*q,0,2e-5);
 }
 for(const [a,b]of d.roots){near(d.m*(a*a-b*b)+c*a+d.k,0,1e-8);near((2*d.m*a+c)*b,0,1e-8);}
}
assert(C.beamApprox(.055).zeta>1);
// Independent reference: numpy.linalg.eigvals of [[0,I],[-K,-C]] for the physical two-DOF system.
const ref={0:[[0,12.360679774997896],[0,32.3606797749979]],4:[[-1.4529306720400776,12.297185740186196],[-.5470693279599139,32.298444471192575]],12:[[-4.493689524468417,11.721310262441293],[-1.5063104755315937,31.828809316758964]]};
for(const [c,roots]of Object.entries(ref)){const d=C.twoDof(+c);assert.equal(d.roots.length,2);d.roots.forEach((r,i)=>r.forEach((v,j)=>near(v,roots[i][j])));}
for(let c=0;c<=12;c+=.5){const d=C.twoDof(c);for(const z of d.roots){const e=C.polynomial(z.map(x=>x/20),c/20);near(Math.hypot(...e),0);}if(c)assert(d.modalC[0][1]>0);}
const ctx={window:{},console};vm.createContext(ctx);
const files=['lesson-article','analysis-data','extended-analysis-data','analysis-relations-data','analysis-scenario-relations','analysis-scenario-guides','analysis-scenarios','analysis-scenario-diagrams','beam-labs','analysis-mode-quiz','analysis-quiz','analysis-model-quiz','analysis-structure-core','analysis-structure-labs','analysis-structure-lessons','analysis-eigen-core','analysis-eigen-labs','analysis-prestress-lessons','analysis-complex-lessons'];
for(const file of files)vm.runInContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),ctx,{filename:file+'.js'});
const w=ctx.window;let models=0,questions=0;
for(const key of ['prestressed-modes','complex-modes'])for(const m of w.AnalysisScenarios[key].models){
 models++;const g=w.AnalysisModelGuides[m.id],q=w.AnalysisQuiz.resolve(key,m.id);
 assert(g.items.length===3&&g.verify.length>=4,m.id);assert(g.inputReview.flatMap(x=>x[1]).length>=15,m.id);assert(g.pitfalls.length>=4);
 const html=g.explanation();assert(html.includes('data-eigen-lab'));assert(!html.includes('undefined'));
 assert.equal(q.questions.length,4);
 for(const item of q.questions){questions++;assert.equal(item.options.length,4);assert(item.options[item.answer]);assert.equal(w.AnalysisQuiz.diagnose(String(item.verify.check.expect),item.verify.check)[0],'ok');}
 for(const panel of w.AnalysisRelationMaps[m.id].panels){const ids=new Set(panel.nodes.map(x=>x.id));for(const e of panel.edges)assert(ids.has(e.from)&&ids.has(e.to));}
}
assert.equal(models,9);assert.equal(questions,36);
assert.equal(w.AnalysisScenarios['prestressed-modes'].rows.length,5);
const fresh={window:{}};vm.createContext(fresh);vm.runInContext(fs.readFileSync(path.join(dir,'analysis-scenario-diagrams.js'),'utf8'),fresh);
for(const id of ['undamped','damped','pre-none','pre-tension','pre-compression'])assert(!/[\u3040-\u30ff\u3400-\u9fff]/.test(fresh.window.renderAnalysisScenarioDiagram(id).match(/<svg[\s\S]*?<\/svg>/)[0].replace(/<[^>]+>/g,'')));
console.log('PASS: Rayleigh energies, preload signs/critical state, damped ODE and roots, independent physical-state eigenvalues, 9 models and 36 questions.');
