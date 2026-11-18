const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','beam-labs','load-labs','load-chapter'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx,{filename:n});
const c=ctx.window.LoadLabs.core,near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
// Independent quadrature of distributed work and moments; no source formula reuse.
const gauss=[[-Math.sqrt(3/5),5/9],[0,8/9],[Math.sqrt(3/5),5/9]];
const integrate=(fn,L)=>gauss.reduce((s,[x,w])=>s+w*fn((x+1)*L/2)*L/2,0);
for(let a=0;a<=90;a+=5)for(const n of [.5,1,2])for(const unit of [false,true]){const r=c.vector(a,n,unit);near(Math.hypot(r.x,r.y),unit?100:100*n);near(r.x*Math.sin(a*Math.PI/180)-r.y*Math.cos(a*Math.PI/180),0);}
for(const x of [0,40,100])for(const y of [-60,0,60])for(const a of [-90,0,45,90]){const r=c.eccentric(x,y,a),theta=.001;near(r.M*theta,r.Fx*(-theta*y)+r.Fy*(theta*x));}near(c.eccentric(80,40,0).M,-4000);
for(const qa of [-1,0,.5,2])for(const qb of [-1,0,1.5,2]){const r=c.line(qa,qb),q=x=>qa+(qb-qa)*x/400,F=integrate(q,400),M=integrate(x=>x*q(x),400);near(r.F,F);near(r.M,M);near(r.RA+r.RB,F);near(400*r.RB,M);if(r.x!==null)near(r.x*r.F,M);}
near(c.line(0,2,600).x,400);assert.equal(c.line(-1,1).x,null);assert.notEqual(c.line(-1,1).M,0);
for(const a of [0,30,60,75]){const r=c.projection(a);near(r.project/r.actual,Math.cos(a*Math.PI/180));}
for(const a of [0,15,60])for(const kind of ['shell','solid'])for(const sign of [-1,1]){const r=c.pressure(kind,sign,a);near(Math.hypot(...r.F),600);near(r.F.reduce((s,x,i)=>s+x*r.n[i],0),600*sign*(kind==='solid'?-1:1));}
for(const quad of [false,true])for(const q of [.5,1,3]){const r=c.edge(quad,q),N=quad?[x=>(x/300*2-1)*(x/300*2-2)/2,x=>1-(x/300*2-1)**2,x=>(x/300*2-1)*(x/300*2)/2]:[x=>1-x/300,x=>x/300];r.f.forEach((x,i)=>near(x,integrate(t=>N[i](t)*q,300)));near(r.f.reduce((s,x)=>s+x,0),q*300);near(r.f.reduce((s,x,i)=>s+x*r.x[i],0),q*300**2/2);for(const d of [r.x.map(()=>1),r.x.map((x,i)=>i===1?1:0),r.x.map(x=>x*x/90000)])near(r.f.reduce((s,x,i)=>s+x*d[i],0),integrate(x=>N.reduce((s,n,i)=>s+n(x)*d[i],0)*q,300));}
// Independent cantilever 2x2 stiffness solve with a consistent cubic beam load.
for(const consistent of [false,true]){const L=400,EI=210000*10000,q=.5,N=[x=>1-3*(x/L)**2+2*(x/L)**3,x=>L*(x/L-2*(x/L)**2+(x/L)**3),x=>3*(x/L)**2-2*(x/L)**3,x=>L*(-1*(x/L)**2+(x/L)**3)],r=c.beam(consistent),F=N.map(n=>integrate(x=>q*n(x),L));if(!consistent)F[1]=F[3]=0;F.forEach((x,i)=>near(x,r.f[i]));const k11=12*EI/L**3,k12=-6*EI/L**2,k22=4*EI/L,det=k11*k22-k12*k12;near(r.u,(k22*F[2]-k12*F[3])/det);near(r.theta,(-k12*F[2]+k11*F[3])/det);near(r.u/r.exact,consistent?1:4/3);}
near(c.mass('mass').kg,7.85);near(c.mass('mass').F,77.0085);near(c.mass('weight').F,c.mass('mass').F);near(c.mass('kg').F/c.mass('mass').F,1000);
for(const rpm of [100,600,900]){const r=c.rotation(rpm);near(r.A,rpm/60);near(c.rotation(rpm*2).F/r.F,4);near(c.rotation(rpm,.4).F/r.F,2);near(r.F,2*(2*Math.PI*rpm/60)**2*.2);}
// Von Mises independently from three principal stresses, including sigma_z=0.
for(const a of [-2,-1,0,1,2])for(const b of [-2,-1,0,1,2]){const r=c.combination(a,b);near(r.vm,Math.sqrt(((r.sx-r.sy)**2+r.sy**2+r.sx**2)/2));assert(r.vm>=0);}near(c.combination(1,1).vm,100);near(c.combination(1,1).wrong,200);
const ch=ctx.window.LoadChapter,html=ch.html();assert.equal(ch.sections.length,27);assert.equal(ch.questions.length,15);assert.equal(Object.keys(ctx.window.LoadLabs.labs).length,10);assert.equal((html.match(/data-load-legacy=/g)||[]).length,10);
for(const n of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const keys=new Set(ctx.window.InputCatalog.entries.map(e=>e.key));for(const m of html.matchAll(/href="bulk\.html#([^"]+)"/g))assert(keys.has(m[1]),m[1]);
for(const n of ['theory-data','extended-theory-data','practice-theory-data','linear-foundations'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
for(const m of html.matchAll(/href="theory\.html#([^"/]+)/g))assert(ctx.window.NastranTheory.some(e=>e.key===m[1]),m[1]);
for(const m of html.matchAll(/href="(elements|basics|coordinates)\.html#([^"]+)"/g))assert(fs.readFileSync(path.join(dir,m[1]+'.html'),'utf8').includes('id="'+m[2]+'"'),m[0]);
assert.equal(ctx.window.NastranTheory.find(e=>e.key==='static-subcases').chapter,'common-loads');
console.log('PASS: load chapter — independent quadrature, virtual work, beam stiffness solution, force/moment balance, units, rotation, stress combination; 27 sections, 10 labs, 15 questions and input links.');
