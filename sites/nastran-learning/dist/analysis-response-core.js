/* Independent linear mechanics for teaching. No solver results or executable decks. */
(function(root){
 'use strict';
 const B={E:70000,L:360,I:648,A:216,rho:2.7e-9};
 const beta=[1.875104068711961,4.694091132974175,7.854757438237613,10.99554073487547,14.13716839104647,17.27875953208824,20.42035225104125,23.56194490180644];
 const mass=B.rho*B.A*B.L,k=3*B.E*B.I/B.L**3;
 const wn=beta.map(b=>b*b*Math.sqrt(B.E*B.I/(B.rho*B.A))/B.L**2),fn=wn[0]/(2*Math.PI);
 const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]];
 const scale=(a,s)=>[a[0]*s,a[1]*s],div=(a,b)=>{const d=b[0]**2+b[1]**2;return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];};
 const amp=a=>Math.hypot(...a),phase=a=>amp(a)<1e-14?null:Math.atan2(a[1],a[0])*180/Math.PI;
 function beam(f,g=.04,count=8){
  const omega=2*Math.PI*f;
  return wn.slice(0,count).reduce((sum,w)=>add(sum,div([4/mass,0],[w*w-omega*omega,g*w*w])),[0,0]);
 }
 function sweep(start,step,intervals,g=.04){return Array.from({length:intervals+1},(_,i)=>{const f=start+step*i;return[f,amp(beam(f,g))];});}
 // Independent two-mass model: both masses have a 400 N/m ground spring, plus a 400 N/m coupling spring.
 const lambdas=[400,1200],phi=[[Math.SQRT1_2,Math.SQRT1_2],[Math.SQRT1_2,-Math.SQRT1_2]];
 function forces(kind='single',degrees=0){return [[1,0],kind==='single'?[0,0]:[Math.cos(degrees*Math.PI/180),Math.sin(degrees*Math.PI/180)]];}
 function two(f,g=.04,kind='single',degrees=0,count=2){
  const w=2*Math.PI*f,F=forces(kind,degrees),a=[800-w*w,800*g],b=[-400,-400*g],det=sub(mul(a,a),mul(b,b));
  const direct=[div(sub(mul(a,F[0]),mul(b,F[1])),det),div(sub(mul(a,F[1]),mul(b,F[0])),det)];
  const generalized=phi.map(v=>add(scale(F[0],v[0]),scale(F[1],v[1])));
  const modal=[[0,0],[0,0]],parts=[];
  for(let j=0;j<count;j++){
   const q=div(generalized[j],[lambdas[j]-w*w,g*lambdas[j]]);
   const part=phi[j].map(v=>scale(q,v));parts.push(part);
   for(let i=0;i<2;i++)modal[i]=add(modal[i],part[i]);
  }
  return {direct,modal,parts,generalized,F,lambdas,frequencies:lambdas.map(x=>Math.sqrt(x)/(2*Math.PI))};
 }
 function step(t,w,z){
  if(t<=0)return 0;
  const a=z*w,b=w*Math.sqrt(1-z*z);
  return 1-Math.exp(-a*t)*(Math.cos(b*t)+a/b*Math.sin(b*t));
 }
 function ramp(t,w,z){
  if(t<=0)return 0;
  const a=z*w,b=w*Math.sqrt(1-z*z);
  return t-2*a/(w*w)+Math.exp(-a*t)*(2*a*Math.cos(b*t)-(b*b-a*a)/b*Math.sin(b*t))/(w*w);
 }
 function pulse(t,tau=.05,z=.02,rise=0,w=wn[0]){
  if(rise>0)return (ramp(t,w,z)-ramp(t-rise,w,z)-ramp(t-tau,w,z)+ramp(t-tau-rise,w,z))/rise;
  return step(t,w,z)-step(t-tau,w,z);
 }
 function load(t,tau,rise=0){
  if(t<0)return 0;
  if(rise)return Math.max(0,Math.min(t/rise,1,(tau+rise-t)/rise));
  if(Math.abs(t-tau)<1e-10)return .5;
  return t<tau?1:0;
 }
 function newmark({dt=.0005,tau=.05,z=.02,rise=0,end=.2,w=wn[0]}={}){
  // Average-acceleration Newmark illustration: normalized m=1, k=w², F=w² p(t).
  const c=2*z*w,kk=w*w,aa=4/dt**2,bb=2/dt,ke=kk+aa+bb*c;
  let u=0,v=0,a=kk*load(0,tau,rise);const out=[[0,u,v,a]];
  for(let i=1;i<=Math.round(end/dt);i++){
   const t=i*dt,rhs=kk*load(t,tau,rise)+aa*u+4/dt*v+a+c*(bb*u+v);
   const next=rhs/ke,an=aa*(next-u)-4/dt*v-a,vn=v+dt*(a+an)/2;
   u=next;v=vn;a=an;out.push([t,u,v,a]);
  }
  return out;
 }
 const api={B,mass,k,wn,fn,beta,beam,sweep,two,forces,amp,phase,add,sub,mul,div,scale,step,ramp,pulse,load,newmark};
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.AnalysisResponseCore=api;
})(typeof window==='undefined'?null:window);
