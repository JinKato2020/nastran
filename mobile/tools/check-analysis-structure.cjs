const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist');
const C=require(path.join(dir,'analysis-structure-core.js'));
const near=(a,b,t=1e-8)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const [id,u,sz,ez]of [
 ['cyl-open',.01426190476190476,0,-.00003142857142857],
 ['cyl-closed',.01347619047619048,10/3,.00001619047619048],
 ['cyl-locked',.01374333333333333,2.2,0],
 ['cyl-external',-.01590476190476190,-40/3,-.00006476190476190]
]){const a=C.cylinder(id);near(a.u,u);near(a.sz,sz);near(a.ez,ez);}
for(const id of Object.keys(C.ends))for(const b of [55,100,150]){
 const a=C.cylinder(id,50,b),o=C.cylinder(id,b,b);near(a.sr,-a.pi);near(o.sr,-a.po);
 // Independently integrate hoop stress over a half-cylinder cut: pressure resultant.
 let hoop=0;const count=4000,dr=(b-50)/count;
 for(let i=0;i<count;i++)hoop+=C.cylinder(id,50+(i+.5)*dr,b).st*dr;
 near(hoop,a.pi*50-a.po*b,1e-7);
 if(C.ends[id].axial==='closed')near(a.N,Math.PI*(a.pi*50**2-a.po*b*b));
 // Radial strain from differentiating displacement must match 3D Hooke's law.
 const r=(50+b)/2,h=1e-3,d=C.cylinder(id,r,b);
 near((C.cylinder(id,r+h,b).u-C.cylinder(id,r-h,b).u)/(2*h),(d.sr-d.nu*(d.st+d.sz))/d.E);
}
for(const [id,P]of [['buck-cantilever',863.5903850953],['buck-pinned',3454.3615403813],['buck-fixed',13817.4461615251],['buck-fixed-pinned',7066.7549947493]]){
 const ref=C.buckling(id);near(ref.P,P);near(C.buckling(id,100).lambda*100,P);near(C.buckling(id,1,true).P/P,36);
 near(C.shape(id,0),0);if(id!=='buck-cantilever')near(C.shape(id,1),0);
 // Rayleigh quotient from independent finite differences of the exact mode shape.
 const h=1e-4,N=2000;let b=0,g=0;
 for(let i=0;i<N;i++){const x=(i+.5)/N,f=C.shape(id,x),lo=C.shape(id,x-h),hi=C.shape(id,x+h);b+=((hi-2*f+lo)/h**2)**2;g+=((hi-lo)/(2*h))**2;}
 near(ref.E*ref.I/ref.L**2*b/g,P,2e-5);
}
assert.equal(C.buckling('buck-blocked').lambda,null);
const context={window:{},console};vm.createContext(context);
const names=['lesson-article','analysis-data','extended-analysis-data','analysis-relations-data','analysis-scenario-relations','analysis-scenario-guides','analysis-scenarios','analysis-scenario-diagrams','beam-labs','analysis-mode-quiz','analysis-quiz','analysis-model-quiz','analysis-structure-core','analysis-structure-labs','analysis-structure-lessons'];
for(const name of names)vm.runInContext(fs.readFileSync(path.join(dir,name+'.js'),'utf8'),context,{filename:name+'.js'});
const w=context.window,keys=[];
for(const type of ['thick-cylinder','buckling'])for(const m of w.AnalysisScenarios[type].models){
 const q=w.AnalysisQuiz.resolve(type,m.id),g=w.AnalysisModelGuides[m.id];
 assert(q&&q.questions.length===3,m.id);assert(g.items.length===3&&g.verify.length>=3,m.id);assert(w.AnalysisRelationMaps[m.id]);
 for(const question of q.questions){assert.equal(question.options.length,4);assert(question.options[question.answer]);assert.equal(w.AnalysisQuiz.diagnose(String(question.verify.check.expect),question.verify.check)[0],'ok');}
 keys.push(m.id);
}
assert.equal(keys.length,12);assert.equal(new Set(keys).size,12);
assert.equal(w.AnalysisQuiz.diagnose('1',{expect:0,diag:[]})[0],'warn');
const groups=w.AnalysisScenarios['thick-cylinder'].studyGroups;
assert.deepEqual(groups.map(g=>g.models.length).join(','),'4,3');
for(const g of groups)assert.equal(g.models.length,g.rows.length);
for(const id of keys)for(const panel of w.AnalysisRelationMaps[id].panels){const ids=new Set(panel.nodes.map(n=>n.id));for(const e of panel.edges)assert(ids.has(e.from)&&ids.has(e.to));}
console.log('PASS: cylinder boundary tractions, integrated equilibrium, Hooke law, 4 end/pressure cases; 4 Euler supports and Rayleigh integrals; blocked loading; 12 comparisons and 36 quizzes.');
