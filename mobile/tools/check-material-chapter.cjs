const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','beam-labs','material-labs','material-chapter'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx,{filename:n});
const c=ctx.window.MaterialLabs.core,near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(b)),`${a} != ${b}`);
near(c.tension(210000,100,'force').sigma,10);near(c.tension(210000,100,'force').u,1/105);
near(c.tension(210000,100,'displacement').F/c.tension(70000,100,'displacement').F,3);
near(c.lateral(.3,false).ey,-.3*100/210000);near(c.lateral(.3,true).sy,300/7);
near(c.lateral(.3,false).K,175000);near(c.lateral(.3,false).G,210000/2.6);
// Independent closed-form off-axis compliance, and positive/negative angle symmetry.
for(const a of [-90,-60,-30,0,15,45,90]){
 const m=Math.cos(a*Math.PI/180),n=Math.sin(a*Math.PI/180),ex=m**4/135000+n**4/9000+m*m*n*n*(1/5000-2*.28/135000);
 near(c.strain(a,[1,0,0])[0],ex,1e-12);near(c.strain(a,[1,0,0])[0],c.strain(-a,[1,0,0])[0],1e-12);
 near(c.strain(a,[1,0,0])[2],-c.strain(-a,[1,0,0])[2],1e-12);
 const Q=c.qbar(a);for(let i=0;i<3;i++)for(let j=0;j<3;j++)near(Q[i][j],Q[j][i]);
 for(const s of [[100,0,0],[0,100,0],[0,0,100],[100,20,-30]])c.mul(Q,c.strain(a,s)).forEach((v,i)=>near(v,s[i]));
}
const d=1-.28*.28*9000/135000;near(c.qbar(0)[0][0],135000/d);near(c.qbar(0)[0][1],.28*9000/d);near(c.qbar(0)[2][2],5000);
const outer=c.laminate(c.stacks.outer),inner=c.laminate(c.stacks.inner),u=c.laminate(c.stacks.unsym),rev=c.laminate(c.stacks.reverse);
near(outer.ABD[0][0],inner.ABD[0][0]);assert(outer.ABD[3][3]>inner.ABD[3][3]);
for(const a of [outer,inner,c.laminate(c.stacks.angle)])for(let i=0;i<3;i++)for(let j=3;j<6;j++)near(a.ABD[i][j],0);
near(u.u[3],-rev.u[3]);assert(Math.abs(u.u[3])>1e-4);
// Two-point Gauss integration of recovered stresses must reproduce all 6 applied resultants.
for(const stack of Object.values(c.stacks)){
 const r=c.laminate(stack),N=[0,0,0],M=[0,0,0];
 for(const p of r.plies)for(const xi of [-1/Math.sqrt(3),1/Math.sqrt(3)]){const z=(p.z0+p.z1)/2+(p.z1-p.z0)/2*xi,w=(p.z1-p.z0)/2,s=p.stress(z);s.forEach((v,i)=>{N[i]+=v*w;M[i]+=v*z*w;});}
 N.forEach((v,i)=>near(v,i===0?100:0));M.forEach(v=>near(v,0));
}
const C=c.inv(c.S3);for(let i=0;i<6;i++){
 const strain=c.mul(c.S3,Array.from({length:6},(_,j)=>i===j?100:0)),stress=c.mul(C,strain);
 stress.forEach((v,j)=>near(v,i===j?100:0));
 for(let j=0;j<6;j++)near(C[i][j],C[j][i]);
}
// Cholesky validates the full positive definiteness, not just positive diagonal coefficients.
const L=Array.from({length:6},()=>Array(6).fill(0));for(let i=0;i<6;i++)for(let j=0;j<=i;j++){let v=C[i][j];for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];if(i===j){assert(v>0);L[i][j]=Math.sqrt(v);}else L[i][j]=v/L[j][j];}
for(const dt of [-100,0,50,100])for(const r of [0,1,10,Infinity]){const t=c.thermal(dt,r);near(t.sigma,210000*(t.u/200-12e-6*dt));if(Number.isFinite(r))near(t.F+r*210000*100/200*t.u,0);else near(t.u,0);}
near(c.thermal(50,Infinity).sigma,-126);near(c.thermal(50,0).u,.12);
for(const Et of [0,2000,10000]){const r=c.plastic(.005,Et);near(r.H/(1+r.H/210000),Et);near(r.residual+r.sigma/210000,.005);assert(r.residual>0);}near(c.plastic(.001).residual,0);
near(c.plastic(.005,2000).H,2019.2307692307693);
for(const hc of [4,12,40]){const a=c.sandwich(hc,5),b=c.sandwich(hc,25);near(a.bend,b.bend);near(a.shear,5*b.shear);}
const html=ctx.window.MaterialChapter.html();assert.equal((html.match(/class="theory-section"/g)||[]).length,23);assert.equal(ctx.window.MaterialChapter.questions.length,12);assert.equal(Object.keys(ctx.window.MaterialLabs.labs).length,9);
for(const n of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference','reference-review','extended-input-cards','element-input-cards'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
const keys=new Set(ctx.window.InputCatalog.entries.map(e=>e.key));for(const m of html.matchAll(/href="bulk\.html#([^"]+)"/g))assert(keys.has(m[1]),m[1]);
console.log('PASS: material chapter — off-axis transformation, ABD force/moment recovery, positive energy, thermal equilibrium, plastic hardening, 23 sections, 9 labs, 12 questions and input links.');
