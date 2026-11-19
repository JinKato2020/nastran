/* Independent two-mass illustration; not a Nastran execution result. */
(function(root){
 'use strict';
 const M=[[2,0],[0,1]],K=[[600,-200],[-200,200]],vectors=[[.5,1],[1,-1]],lambda=[100,400];
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),mv=(A,x)=>A.map(r=>dot(r,x));
 function mode(index=1,norm='MASS',sign=1){
  const raw=vectors[index-1],rawMass=dot(raw,mv(M,raw)),scale=(norm==='MASS'?1/Math.sqrt(rawMass):1)*sign;
  const phi=raw.map(x=>x*scale),mu=dot(phi,mv(M,phi)),stiffness=dot(phi,mv(K,phi)),L=dot(phi,mv(M,[1,1])),beta=L/mu,eff=L*L/mu;
  return {phi,mu,stiffness,L,beta,eff,fraction:eff/3,psi:phi.map(x=>x*beta),lambda:lambda[index-1],frequency:Math.sqrt(lambda[index-1])/(2*Math.PI)};
 }
 const api={M,K,mode};
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.AnalysisModalOutputCore=api;
})(typeof window==='object'?window:null);
