// Physical invariants for the independent connection / constraint / matrix lessons.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dist=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};
vm.createContext(ctx);
for(const file of ['lesson-article.js','beam-labs.js','connection-labs.js'])vm.runInContext(fs.readFileSync(path.join(dist,file),'utf8'),ctx,{filename:file});
const c=ctx.window.ConnectionLabs.core;
const close=(a,b)=>assert(Math.abs(a-b)<1e-9*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const kc of [100,500,1000,100000]){const r=c.series(kc);close(kc*r.c,100);close(r.total,r.a+r.b+r.c);close(r.share,r.c/r.total);assert(r.total>.2);}
close(c.series(500).total,.4);
for(const x of [0,.17,.5,1])for(const y of [0,.3,1]){
 const r=c.patch(x,y,[0,.4,.6,.2]);close(r.N.reduce((a,b)=>a+b),1);close(r.w,.4*x+.2*y);
 close(c.patch(x,y,[.3,.3,.3,.3]).w,.3);
}
const t=c.cohesive(50,.02,-.03);close(t.tn,4);close(t.Fn,200);close(t.Fs,-150);close(t.U,4.25);
close(c.cohesive(100,.02,-.03).U,2*t.U);
const r=c.rigid([40,-25],[0,0],.04);close(r[0],1);close(r[1],1.6);
for(const kind of ['rigid','average'])for(const k2 of [100,400,1000])for(const a of [.1,.5,.9]){
 const d=c.distribute(100,k2,a,100,kind);close(d.f1+d.f2,100);close(d.f1,100*d.u1);close(d.f2,k2*d.u2);close(2*d.U,100*d.ref);
 if(kind==='rigid')close(d.u1,d.u2);else close(d.ref,a*d.u1+(1-a)*d.u2);
}
close(c.distribute(100,400,.5).ref,.3125);close(c.distribute(100,400,.5,100,'rigid').ref,.2);
for(const rho of [-.9,-.5,0,.5,.9]){
 const r=c.coupled(rho);assert(r.det>0&&r.U>0);c.mv(r.K,r.u).forEach((f,i)=>close(f,i===0?10:0));
 for(let i=0;i<2;i++)for(let j=0;j<2;j++)close(r.K[i].reduce((v,x,k)=>v+x*r.Z[k][j],0),i===j?1:0);
}
const reference=c.order([0,1,2]);
for(const p of [[0,1,2],[2,0,1],[1,2,0],[2,1,0]]){
 const r=c.order(p);r.u.forEach((x,i)=>close(x,reference.u[i]));c.mv(c.K3,r.u).forEach((x,i)=>close(x,c.F3[i]));
 let index=0;for(let j=0;j<3;j++)for(let i=j;i<3;i++)close(r.lower[index++],c.K3[p[i]][p[j]]);
}
assert(c.order([2,0,1],true).u.some((x,i)=>Math.abs(x-reference.u[i])>.01));
for(const theta of [-.03,0,.03])for(const d of [-.5,0,.2]){
 const r=c.reference(theta,d);close(r.fy,200*d);close(r.fy+r.fd,0);close(r.fy*100+r.md,0);
}
close(c.reference(.02,.2).fy,40);close(c.reference(.02,.2,true).fy,440);
assert.equal(Object.keys(ctx.window.ConnectionLabs.labs).length,9);
console.log('PASS: 9 connection lessons — compliance, interpolation, interface units, virtual work, matrix inverse/permutation, rigid motion and force/moment balance.');
