// Numerical invariants and reference values for the interactive element lessons.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dist=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};
vm.createContext(ctx);
for(const f of ['element-labs.js','analysis-mode-quiz.js','analysis-quiz.js'])vm.runInContext(fs.readFileSync(path.join(dist,f),'utf8'),ctx,{filename:f});
const c=ctx.window.ElementLabs.core,m=ctx.window.AnalysisModeQuiz.core;
const close=(a,b,tol=1e-10)=>assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
for(const shift of [-10,0,7]){const r=c.spring(120,.6+shift,.2+shift);close(r.f1,48);close(r.f1+r.f2,0);close(r.energy,9.6);}
const series=c.network(120,80,48,false),parallel=c.network(120,80,48,true);
close(series.k,48);close(series.u,1);close(series.q,.6);close(series.f1,series.f2);close(parallel.u,.24);close(parallel.f1+parallel.f2,48);
for(const angle of [0,13,45,89,90]){const r=c.direction(200,200,angle);close(r.xx,200);close(r.xy,0);close(r.Fy,0);}
const ob=c.direction(200,20,45);close(ob.xx,110);close(ob.xy,90);close(ob.Fx,55);close(ob.Fy,45);
close(c.kelvin(100,0,5).loss,0);close(c.kelvin(100,5,2).loss,2*c.kelvin(100,5,1).loss);
const surface=c.surface(100,100,4);close(surface.top,62.5);close(surface.bottom,-12.5);
for(const angle of [0,17,45,83,90]){const r=c.material(angle,true);close(r.ex,100/70000);close(r.ey,-.3*100/70000);close(r.gxy,0);close(r.s1+r.s2,100);close(r.s1*r.s2-r.tau**2,0);}
close(c.material(0).ex,100/140000);close(c.material(90).ex,100/10000);
close(c.quad(1,1).min,1);close(c.quad(1,1).jac(0,0),1);assert(c.quad(-1.4,-1.4).min<0);
for(const h of [0,5,10,30]){const r=c.sandwich(h);assert(r.B>0);close(r.mass,5.4+.1*h);}
close(c.poisson(.3,true).ratio,1.3461538461538463);close(c.poisson(.49,true).ratio,17.11409395973153);
close(c.poisson(.3,true).sy,30/7);close(c.poisson(.3,false).ey,-.0015);
for(const n of [1,2,4,12]){close(c.interpolate(.5/n,n,false).u-(.5/n)**2,1/(4*n*n));for(const x of [0,.13,.55,1])close(c.interpolate(x,n,true).u,x*x);}
for(const h of [10,40,80])for(const n of [2,4,8]){const f=c.couple(1000,h,n);close(f.reduce((s,q)=>s+q.F,0),0);close(f.reduce((s,q)=>s+q.z*q.F,0),1000);}
close(c.tetra(1).volume,1e6/6);close(c.tetra(1,true).det,-c.tetra(1).det);close(c.tetra(.05).gradient,.2);
close(c.pressure(50,20).vm,Math.sqrt(3)*20);close(c.pressure(100,20).vm,c.pressure(0,20).vm);close(c.pressure(50,0).vm,0);
for(const b of [24,50,80]){close(c.cylinder(20,b).sr,-10);close(c.cylinder(b,b).sr,0);close(c.cylinder(20,b,20,10,true).sz,4000/(b*b-400));}
close(m.mass,.000209952);close(m.mass+m.added,.000289952);close(m.estimate(0,2)/m.estimate(0,1),Math.sqrt(2));assert(m.estimate(.08,1)<m.estimate(0,1));
assert.equal(Object.keys(ctx.window.ElementLabs.labs).length,18);
const quiz=ctx.window.AnalysisQuiz;
assert.equal(quiz.data.modes.questions.length,5);
for(const q of quiz.data.modes.questions){assert.equal(q.options.length,4);assert(q.options[q.answer]);assert.equal(quiz.diagnose(String(q.verify.check.expect),q.verify.check)[0],'ok');}
assert(quiz.render('modes').includes('METHOD = ？'));assert(!quiz.render('modes').includes('undefined'));
console.log('PASS: 18 element experiments, equilibrium/energy/coordinate invariants, analytic reference values, modal scaling and 5 quiz answers.');
