const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','beam-labs','contact-labs','contact-chapter'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const c=ctx.window.ContactLabs.core,near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(let F=-200;F<=2000;F+=50){const r=c.normal(F);near(r.R+r.Fs,F);near(r.R*r.g,0);assert(r.R>=0&&r.g>=0);for(const ratio of [1,10,1e3,1e5]){const p=c.penalty(ratio,F);near(p.R+p.Fs,F);near(p.R,ratio*1000*Math.max(0,p.u-.4));}}
for(const u of [-.8,-.2,0,.2,.8])for(const mu of [0,.1,.3,.6]){const r=c.friction(u,mu);assert(Math.abs(r.T)<=mu*1000);near(r.sp+r.elastic,u);assert(r.D>=0);}
for(const A of [.1,.6,.8]){const cycle=c.cycle(A,.3);near(cycle.length,201);for(let i=1;i<cycle.length;i++){assert(cycle[i].D>=cycle[i-1].D);near(cycle[i].T,1000*(cycle[i].u-cycle[i].sp));}if(A>.3)near(cycle[200].D-cycle[40].D,4*300*(A-.3),.01);}
for(const F of [100,800,1600]){const r=c.hertz(F),next=c.hertz(F*8);near(next.a,2*r.a);near(next.delta,4*r.delta);near(next.p0,2*r.p0); // Radial pressure integration via the substitution r=a sin(theta).
 const n=20000,h=Math.PI/(2*n);let integral=0;for(let i=0;i<n;i++){const t=(i+.5)*h;integral+=2*Math.PI*r.p0*r.a*r.a*Math.sin(t)*Math.cos(t)**2*h;}near(integral,F,1e-7);}
for(const kb of [50000,100000])for(const kj of [200000,400000,800000])for(let F=0;F<=30000;F+=500){const r=c.bolt(F,10000,kb,kj);near(r.Fb-r.Fc,F);assert(r.Fc>=0&&r.gap>=0);near(r.Fc*r.gap,0);if(!r.separated)near((r.Fb-10000)/kb,(10000-r.Fc)/kj);else near(r.Fb,F);}
near(c.preload(.125).F,10000);
for(const stage of ['preload','locked','force','reset']){const r=c.stages(stage);near(r.Fb-r.Fc,r.F);near(r.shorten,r.Fb/100000+r.Fc/400000-r.gap);}
near(c.shear(8000,.3,1000).Q,1080);near(c.torque(20,.2).F,10000);near(c.loss(0,.025).F,8000);near(c.loss(100,0).F,13520);
// At first touch both the gap and the contact force vanish.
near(c.normal(400).g,0);near(c.normal(400).R,0);
assert(c.normal(399).g>0);assert(c.normal(401).R>0);
for(const ratio of [2,4,8]){
 const kj=100000*ratio,sep=c.bolt(0,10000,100000,kj).sep;
 const at=c.bolt(sep,10000,100000,kj);
 near(at.Fc,0);near(at.gap,0);assert.equal(at.separated,false);
 assert(c.bolt(sep+1,10000,100000,kj).separated);
 assert(c.bolt(sep-1,10000,100000,kj).Fc>0);
}
const labs=ctx.window.ContactLabs.labs;
function draw(name,values){const e={plot:{},readout:{},out:{}};labs[name].draw(e,values);return e;}
assert.match(draw('normal',{F:400}).readout.innerHTML,/ちょうど/);
assert.match(draw('bolt',{F:12.5,ratio:4}).readout.innerHTML,/境目/);
assert.match(draw('shear',{F:0,V:3,mu:.3}).readout.innerHTML,/ちょうど/);
assert.match(draw('shear',{F:13,V:0,mu:.3}).readout.innerHTML,/摩擦の上限も0/);
for(const [pattern,pos] of [['even',10],['tilted',16.7],['edge',20]]){
 const out=draw('footprint',{pattern}).readout.innerHTML;
 assert(out.includes('600 N')&&out.includes(pos+' mm'));
}
assert.match(draw('feet',{x:100}).readout.innerHTML,/右脚だけ/);
const ch=ctx.window.ContactChapter;assert.equal(ch.sections.length,30);assert.equal(ch.questions.length,14);assert.equal(Object.keys(ctx.window.ContactLabs.labs).length,14);
for(const n of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const keys=new Set(ctx.window.InputCatalog.entries.map(e=>e.key));for(const m of ch.html().matchAll(/href="bulk\.html#([^"]+)"/g))assert(keys.has(m[1]),m[1]);
const spcr=ctx.window.InputCatalog.entries.find(e=>e.key==='SPCR');assert(spcr.connections.some(x=>x[2]==='CASE_LOAD'));assert(!spcr.connections.some(x=>x[2]==='LOAD'));
console.log('PASS: contact complementarity, friction history, Hertz pressure integral, preload compatibility, load balance and card references.');
