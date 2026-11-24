const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','beam-labs','theory-data','theory-labs','damping-labs','damping-chapter'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx,{filename:n});
const c=ctx.window.DampingLabs.core,near=(a,b,tol=1e-9)=>assert(Math.abs(a-b)<tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const z of [.01,.02,.1,.2,1,2]){near(c.free(z,0),1);assert(Math.abs((c.free(z,1e-7)-c.free(z,0))/1e-7)<.001);}
for(const z of [.01,.02,.1,.2])for(const n of [1,3,8]){const r=c.identify(z,n);near(r.estimate,z);near(c.free(z,r.t),r.a);}
for(const n of [1,2,3,4])for(const half of [false,true]){
 const r=c.identify(.02,n,half);
 near(r.peak,c.free(.02,r.t));near(Math.abs(r.peak),r.a);
}
near(c.identify(.02,1).a,0.8819,.0001);
assert(c.identify(.02,3,true).estimate<.011);
// Numerical loop integration independently checks the energy formula.
for(const f of [5,16,40])for(const U of [.25,1,2]){let loss=0;const N=20000,w=2*Math.PI*f,dt=2*Math.PI/N;for(let i=0;i<N;i++){const a=(i+.5)*dt;loss+=(100*U*Math.cos(a)-.04*w*U*Math.sin(a))*(-U*Math.sin(a))*dt;}near(loss,c.loss(.04,w,U),1e-8);}
const fit=c.fit(50/(2*Math.PI),200/(2*Math.PI),.02,.02);near(fit.a,1.6);near(fit.b,.00016);near(c.ray(fit.a,fit.b,100/(2*Math.PI)),.016);
for(const f2 of [20,40,80])for(const z2 of [.001,.02]){const r=c.fit(10,f2,.02,z2);near(c.ray(r.a,r.b,10),.02);near(c.ray(r.a,r.b,f2),z2);}
assert(c.fit(10,40,.02,.001).b<0);
const a=c.local(.04,true),b=c.local(.04,false);near(a.z[0],0);near(a.z[1],.02);near(a.B[0][1],0);near(b.z[0],.01);near(b.z[1],.005);near(b.B[0][1],.04);
near(c.lookup(25),.03);near(c.lookup(100,true),-.01);
near(c.equivalent(.04,100,c.fn),.02);near(c.equivalent(.04,c.fn,c.fn),.02*2*Math.PI);near(c.equivalent(.04,0,c.fn),0);
for(const z of [.005,.01,.05]){const r=c.sample(z,.08,true),fine=c.sample(z,.005,true);assert(r.best<=r.peak);assert(fine.best>r.best);near(c.amp(r.rpeak,z),r.peak);}
const html=ctx.window.DampingChapter.html();assert.equal((html.match(/class="theory-section"/g)||[]).length,19);assert.equal((html.match(/<summary>問/g)||[]).length,12);
assert.equal(Object.keys(ctx.window.DampingLabs.labs).length,8);
for(const n of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const keys=new Set(ctx.window.InputCatalog.entries.map(e=>e.key));for(const m of html.matchAll(/href="bulk\.html#([^"]+)"/g))assert(keys.has(m[1]),m[1]);
console.log('PASS: damping — energy integral, decay identification, modal projection, Rayleigh fit, Hz/rad conversion, peak sampling, 18 sections + sources, 12 questions and catalog links.');
