/* Independent elastic reference calculations; no Nastran solver results. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AnalysisStructureCore=api;})(typeof window==='undefined'?globalThis:window,()=>{
 'use strict';
 const ends={
  'cyl-open':{title:'内圧・開放端',axial:'open',pi:10,po:0},
  'cyl-closed':{title:'内圧・閉止端',axial:'closed',pi:10,po:0},
  'cyl-locked':{title:'内圧・軸方向拘束',axial:'locked',pi:10,po:0},
  'cyl-external':{title:'外圧・閉止端',axial:'closed',pi:0,po:10},
 };
 function cylinder(id='cyl-locked',r=50,b=100){
  const c=ends[id]||ends['cyl-locked'],a=50,E=70000,nu=.33;
  const A=(c.pi*a*a-c.po*b*b)/(b*b-a*a),B=(c.pi-c.po)*a*a*b*b/(b*b-a*a);
  const sr=A-B/r**2,st=A+B/r**2,sz=c.axial==='open'?0:c.axial==='closed'?A:2*nu*A;
  return {a,b,E,nu,pi:c.pi,po:c.po,A,B,r,sr,st,sz,ez:(sz-2*nu*A)/E,u:r*(st-nu*(sr+sz))/E,N:sz*Math.PI*(b*b-a*a)};
 }
 const supports={
  'buck-cantilever':{title:'片持ち',beta:Math.PI/2,left:'123456',right:'なし'},
  'buck-pinned':{title:'両端ピン',beta:Math.PI,left:'1234',right:'23'},
  'buck-fixed':{title:'両端固定',beta:2*Math.PI,left:'123456',right:'23456'},
  'buck-fixed-pinned':{title:'一端固定・他端ピン',beta:4.493409457909064,left:'123456',right:'23'},
  'buck-blocked':{title:'誤設定：荷重点の軸方向も拘束',left:'123456',right:'123456'},
 };
 function buckling(id,load=1,strong=false){
  const s=supports[id],E=70000,L=360,I=strong?23328:648;
  const P=s.beta?s.beta**2*E*I/L**2:null;
  return {...s,E,L,I,P,load,lambda:P===null?null:P/load,k:s.beta?Math.PI/s.beta:null};
 }
 function shape(id,x){
  if(id==='buck-blocked')return 0;
  if(id==='buck-cantilever')return 1-Math.cos(Math.PI*x/2);
  if(id==='buck-pinned')return Math.sin(Math.PI*x);
  if(id==='buck-fixed')return (1-Math.cos(2*Math.PI*x))/2;
  const b=supports[id].beta,f=s=>Math.sin(b*s)-b*Math.cos(b*s)+b*(1-s);
  const max=Math.max(...Array.from({length:1001},(_,i)=>f(i/1000)));
  return f(x)/max;
 }
 return {ends,cylinder,supports,buckling,shape};
});
