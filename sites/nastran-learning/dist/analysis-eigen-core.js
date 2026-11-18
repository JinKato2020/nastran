/* Independent mechanics for teaching; not Nastran solver results. */
(function(root){
 'use strict';
 const B={E:70000,L:360,A:216,I:648,rho:2.7e-9};
 const Pcr=Math.PI**2*B.E*B.I/B.L**2;
 const loads={'pre-none':0,'pre-tension':1727,'pre-compression':-1727,'pre-critical':-.9*Pcr,'pre-blocked':0};
 function prestress(id,n=1,ratio){
  const N=ratio===undefined?loads[id]:ratio*Pcr,w0=(n*Math.PI/B.L)**2*Math.sqrt(B.E*B.I/(B.rho*B.A));
  const lambda=w0*w0*(1+N/(n*n*Pcr));
  return {...B,N,n,Pcr,ratio:N/Pcr,lambda,f0:w0/(2*Math.PI),f:lambda>=0?Math.sqrt(lambda)/(2*Math.PI):null,growth:lambda<0?Math.sqrt(-lambda):0,applied:id==='pre-blocked'?-1727:N};
 }
 function oscillator(m,k,c){
  const wn=Math.sqrt(k/m),alpha=-c/(2*m),zeta=c/(2*Math.sqrt(k*m)),disc=alpha*alpha-wn*wn;
  const roots=disc<0?[[alpha,Math.sqrt(-disc)],[alpha,-Math.sqrt(-disc)]]:[[alpha+Math.sqrt(disc),0],[alpha-Math.sqrt(disc),0]];
  return {m,k,c,wn,fn:wn/(2*Math.PI),alpha,zeta,roots,fd:disc<0?Math.sqrt(-disc)/(2*Math.PI):0};
 }
 function beamApprox(c){return oscillator(33/140*B.rho*B.A*B.L,3*B.E*B.I/B.L**3,c);}
 function decay(d,t){
  const [a,b]=d.roots[0];
  if(b>0)return Math.exp(a*t)*(Math.cos(b*t)-a/b*Math.sin(b*t));
  const r1=d.roots[0][0],r2=d.roots[1][0];
  if(Math.abs(r1-r2)<1e-8*d.wn)return Math.exp(r1*t)*(1-r1*t);
  return (-r2*Math.exp(r1*t)+r1*Math.exp(r2*t))/(r1-r2);
 }
 const mul=(a,b)=>[a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
 const div=(a,b)=>{const d=b[0]*b[0]+b[1]*b[1];return [(a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d];};
 function polynomial(z,d){let p=[1,0];for(const v of [d,3,2*d,1]){p=mul(p,z);p[0]+=v;}return p;}
 function twoDof(c=4){
  // m1=m2=1 kg, k1=k2=400 N/m; only q2 has a dashpot to ground.
  const scale=20,d=c/scale;let roots=Array.from({length:4},(_,i)=>[2*Math.cos(.23+i*Math.PI/2),2*Math.sin(.23+i*Math.PI/2)]);
  for(let iter=0;iter<160;iter++){
   let max=0;const next=roots.map((z,i)=>{let den=[1,0];for(let j=0;j<4;j++)if(j!==i)den=mul(den,sub(z,roots[j]));const step=div(polynomial(z,d),den);max=Math.max(max,Math.hypot(...step));return sub(z,step);});
   roots=next;if(max<1e-13)break;
  }
  roots=roots.map(z=>z.map(x=>x*scale)).filter(z=>z[1]>0).sort((a,b)=>a[1]-b[1]);
  const eig=(3-Math.sqrt(5))/2,r=2-eig,a=1/Math.hypot(1,r),b=r*a;
  const reduced=oscillator(1,400*eig,c*b*b);
  return {c,roots,reduced:reduced.roots[0],modalC:[[c*b*b,c*a*b],[c*a*b,c*a*a]],basis:[[a,b],[-b,a]]};
 }
 const api={B,Pcr,loads,prestress,oscillator,beamApprox,decay,twoDof,polynomial};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.AnalysisEigenCore=api;
})(typeof window!=='undefined'?window:null);
