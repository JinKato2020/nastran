const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','beam-labs','boundary-labs','boundary-chapter'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx,{filename:n});
const c=ctx.window.BoundaryLabs.core,near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
function solve(M,b){const a=M.map((r,i)=>[...r,b[i]]);for(let j=0;j<b.length;j++){let p=j;for(let i=j+1;i<b.length;i++)if(Math.abs(a[i][j])>Math.abs(a[p][j]))p=i;[a[j],a[p]]=[a[p],a[j]];const d=a[j][j];assert(Math.abs(d)>1e-12);a[j]=a[j].map(x=>x/d);for(let i=0;i<b.length;i++)if(i!==j){const t=a[i][j];a[i]=a[i].map((x,k)=>x-t*a[j][k]);}}return a.map(r=>r[b.length]);}
// Independent two-element Euler beam assembly, with upward displacement and CCW rotation.
const EI=210000*10000,l=200,K=Array.from({length:6},()=>Array(6).fill(0)),ke=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]];
for(let e=0;e<2;e++)for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[2*e+i][2*e+j]+=EI/l**3*ke[i][j];
for(const [kind,fix] of [['simple',[0,4]],['fixed',[0,1,4,5]],['cantilever',[0,1]]]){
 const free=[0,1,2,3,4,5].filter(i=>!fix.includes(i)),F=[0,0,-100,0,0,0],u=Array(6).fill(0),sol=solve(free.map(i=>free.map(j=>K[i][j])),free.map(i=>F[i]));free.forEach((i,j)=>u[i]=sol[j]);
 const R=K.map((row,i)=>row.reduce((s,v,j)=>s+v*u[j],0)-F[i]),r=c.beam(kind,200);
 near(-u[2],r.w);near(-u[4],c.beam(kind,400).w);near(R[0],r.RA);near(R[4],r.RB);near(R[1],r.MA);near(R[5],r.MB);
 near(r.RA+r.RB,100);near(r.MA+r.MB+400*r.RB-100*200,0);
 // Interpolate FE displacement throughout both elements, not just at the load point.
 for(let x=0;x<=400;x+=10){const e=Math.min(1,Math.floor(x/200)),t=(x-200*e)/200,N=[1-3*t*t+2*t**3,200*(t-2*t*t+t**3),3*t*t-2*t**3,200*(-t*t+t**3)];near(-N.reduce((s,n,i)=>s+n*u[2*e+i],0),c.beam(kind,x).w);}
}
assert.equal(c.supportRank('stable'),6);assert.equal(c.supportRank('collinear'),5);assert.equal(c.supportRank('point'),3);assert.equal(c.supportRank('face'),3);
for(const {p} of c.supportSets.stable){const q=[.2,-.3,.4,.01,.02,-.03],R=c.rigidRows(p),v=R.map(row=>row.reduce((s,x,i)=>s+x*q[i],0));near(v[0],q[0]+q[4]*p[2]-q[5]*p[1]);near(v[1],q[1]+q[5]*p[0]-q[3]*p[2]);near(v[2],q[2]+q[3]*p[1]-q[4]*p[0]);}
for(let a=0;a<=90;a+=5){const r=c.inclined(a);near(r.normal,0);near(r.R[0]*r.u[0]+r.R[1]*r.u[1],0);near(100*r.u[0],100+r.R[0]);near(100*r.u[1],r.R[1]);}assert(Math.abs(c.inclined(30,true).normal)>.8);
for(const d of [-.5,0,.2,.5])for(const P of [0,40]){const r=c.imposed(d,P);near(r.RA+r.RB+P,0);near(r.N1-r.N2,P);near(r.U,.5*(P*r.u+r.RB*d));}near(c.imposed(.2).u,.15);near(c.imposed(.2).U,1.5);
for(let ratio=-2;ratio<=2;ratio+=.25)for(const y of [0,.2]){const r=c.ratio(ratio,120,y);near(r.uA-ratio*r.uB,y);near(ratio*r.QA+r.QB,0);near(r.QA,100*r.uA);near(r.QB+120,200*r.uB);near(r.k,200+100*ratio**2);near(r.k*r.uB,120-ratio*100*y);}
assert.equal(c.conflict('valid').free,1);assert.equal(c.conflict('redundant').redundant,1);assert(c.conflict('inconsistent').inconsistent);assert.equal(c.conflict('fixed').free,0);
for(let p=-1;p<=6;p++){const r=c.compliance(10**p);near(r.u,r.structure+r.support);near((r.u-.1)/.1,10**(-p));}
for(let angle=0;angle<=90;angle+=5)for(const log of [-12,-8,-2]){const r=c.weak(angle,log),a=angle*Math.PI/180,v=[Math.cos(a),Math.sin(a)],kv=r.K.map(row=>row[0]*v[0]+row[1]*v[1]),kn=r.K.map(row=>row[0]*r.n[0]+row[1]*r.n[1]);near(kv[0],r.strong*v[0]);near(kv[1],r.strong*v[1]);near(kn[0],r.weak*r.n[0]);near(kn[1],r.weak*r.n[1]);}
for(let a=40;a<=360;a+=20){const r=c.reactions(a);near(r.RA+r.RB,120);for(const x0 of [0,400])near(-x0*r.RA+(400-x0)*r.RB-(a-x0)*120,0);}
for(const [axis,sym,anti]of [[0,'156','234'],[1,'246','135'],[2,'345','126']]){assert.equal(c.symmetry(axis).join(''),sym);assert.equal(c.symmetry(axis,true).join(''),anti);}
const chapter=ctx.window.BoundaryChapter,html=chapter.html();assert.equal(chapter.sections.length,24);assert.equal(chapter.questions.length,12);assert.equal(Object.keys(ctx.window.BoundaryLabs.labs).length,9);assert.equal((html.match(/data-boundary-legacy=/g)||[]).length,5);
for(const n of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const keys=new Set(ctx.window.InputCatalog.entries.map(e=>e.key));for(const m of html.matchAll(/href="bulk\.html#([^"]+)"/g))assert(keys.has(m[1]),m[1]);
for(const n of ['theory-data','extended-theory-data','practice-theory-data','linear-foundations'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
for(const m of html.matchAll(/href="theory\.html#([^"/]+)/g))assert(ctx.window.NastranTheory.some(e=>e.key===m[1]),m[1]);
for(const m of html.matchAll(/href="(elements|basics|coordinates)\.html#([^"]+)"/g))assert(fs.readFileSync(path.join(dir,m[1]+'.html'),'utf8').includes('id="'+m[2]+'"'),m[0]);
console.log('PASS: boundary chapter — independent beam FE, rigid-motion rank, coordinate projection, imposed-displacement work, MPC virtual work, consistency, weak directions, reaction balance, 24 sections, 9 labs, 12 questions and links.');
