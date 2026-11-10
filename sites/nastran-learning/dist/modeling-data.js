/* Three original teaching models. No MSC Nastran result is embedded. */
(() => {
 'use strict';
 const L=1000,b=30,h=40,E=210000,nu=.3,P=120,A=b*h,I=b*h**3/12,I2=h*b**3/12,k=3*E*I/L**3;
 const fixed=values=>{if(values.length>10)throw Error('Too many fields');return Array.from({length:10},(_,i)=>{const v=String(values[i]??'');if(v.length>8||/[^\x20-\x7e]/.test(v))throw Error('Invalid field '+v);return v.padEnd(8);}).join('');};
 const row=(card,values,line=0)=>({card,values,line,text:fixed(values)}),real=v=>Number.isInteger(v)?v+'.':String(v);
 const grid=n=>row('GRID',['GRID',n.id,'0',real(n.x),real(n.y),real(n.z),'0']);
 const material=()=>row('MAT1',['MAT1','300','210000.','','0.3']);
 const force=g=>row('FORCE',['FORCE','20',g,'0','120.','0.','-1.','0.']);
 const settings=()=>row('PARAM',['PARAM','POST','-1']);
 function spc(rows,components,nodes){for(let i=0;i<nodes.length;i+=6)rows.push(row('SPC1',['SPC1','10',components,...nodes.slice(i,i+6).map(n=>n.id)]));}
 const springNodes=[{id:1,x:L,y:0,z:0}],springRows=[settings(),grid(springNodes[0]),row('CELAS2',['CELAS2','100','100.8','1','2','0','0']),row('SPC1',['SPC1','10','13456','1']),force(1)];
 const beamNodes=Array.from({length:11},(_,i)=>({id:i+1,x:L*i/10,y:0,z:0}));
 const beamRows=[settings(),...beamNodes.map(grid)];
 for(let i=0;i<10;i++)beamRows.push(row('CBAR',['CBAR',101+i,'200',i+1,i+2,'0.','1.','0.','GGG']));
 beamRows.push(row('PBAR',['PBAR','200','300','1200.','160000.','90000.','194328.','','','+PB1']),row('PBAR',['+PB1','20.','15.','-20.','15.','-20.','-15.','20.','-15.'],1),material(),row('SPC1',['SPC1','10','123456','1']),force(11));
 const edgePairs=[[0,1],[1,2],[2,3],[3,0],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[7,4]];
 function solidMesh(nx=20,ny=2,nz=2){const nodes=[],elements=[],map=new Map();function node(i,j,l){const key=[i,j,l].join(':');if(!map.has(key)){const n={id:nodes.length+1,i,j,l,x:L*i/(2*nx),y:-h/2+h*j/(2*ny),z:-b/2+b*l/(2*nz)};nodes.push(n);map.set(key,n.id);}return map.get(key);}
  for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++)for(let iz=0;iz<nz;iz++){const i=2*ix,j=2*iy,l=2*iz,c=[[i,j,l],[i+2,j,l],[i+2,j+2,l],[i,j+2,l],[i,j,l+2],[i+2,j,l+2],[i+2,j+2,l+2],[i,j+2,l+2]],all=[...c,...edgePairs.map(([a,b])=>c[a].map((v,d)=>(v+c[b][d])/2))];elements.push({id:1001+elements.length,ix,iy,iz,nodes:all.map(c=>node(...c))});}
  return {nodes,elements,nx,ny,nz};
 }
 const mesh=solidMesh(),solidRows=[settings(),...mesh.nodes.map(grid)];
 for(const e of mesh.elements){const c1='+H'+e.id+'A',c2='+H'+e.id+'B';solidRows.push(row('CHEXA',['CHEXA',e.id,'200',...e.nodes.slice(0,6),c1]),row('CHEXA',[c1,...e.nodes.slice(6,14),c2],1),row('CHEXA',[c2,...e.nodes.slice(14)],2));}
 solidRows.push(row('PSOLID',['PSOLID','200','300','0','THREE','GRID','REDUCED','SMECH']),material());
 spc(solidRows,'456',mesh.nodes);spc(solidRows,'123',mesh.nodes.filter(n=>n.x===0));
 const faces=[];
 for(const e of mesh.elements.filter(e=>e.ix===mesh.nx-1)){const cont='+L'+e.id;solidRows.push(row('PLOAD4',['PLOAD4','20',e.id,'0.1','','','',e.nodes[1],e.nodes[6],cont]),row('PLOAD4',[cont,'0','0.','-1.','0.','SURF'],1));faces.push({element:e.id,corner:e.nodes[1],opposite:e.nodes[6],area:b*h/(mesh.ny*mesh.nz)});}
 const models={
  simple:{title:'簡易 · 1本の等価ばね',element:'CELAS2',filename:'cantilever_simple.bdf',nodes:springNodes,rows:springRows,elementCount:1,tip:1,goal:'先端が何mm下がるかだけを知りたい。',keeps:'先端のY方向の変位と、それに対する硬さ。',omits:'梁の途中の形、先端の回転、断面の応力、根元の曲げモーメント。',note:'実物にばねが付いているのではありません。梁全体の曲がりやすさを、先端の1つの動きに置き換えています。'},
  standard:{title:'標準 · 10個の梁要素',element:'CBAR',filename:'cantilever_standard.bdf',nodes:beamNodes,rows:beamRows,elementCount:10,tip:11,goal:'梁全体の変形・断面力・公称曲げ応力を知りたい。',keeps:'長さ方向の位置、節点の移動と回転、断面積と曲げにくさ。',omits:'断面内の細かな変形、固定端の局所応力、穴や接触の細部。',note:'断面を線へ置き換えても、太さを忘れるわけではありません。幅と高さの効果はPBARのA・I1・I2などへ入っています。'},
  detailed:{title:'詳細 · 80個の立体要素',element:'CHEXA20',filename:'cantilever_detailed.bdf',nodes:mesh.nodes,rows:solidRows,elementCount:mesh.elements.length,mesh,faces,tip:mesh.nodes.find(n=>n.x===L&&n.y===0&&n.z===0).id,goal:'断面内の変形や3次元の応力分布を調べたい。',keeps:'幅・高さ・長さを持つ体積と、その中の3方向の変形。',omits:'今回入力していない取付具・接触・塑性・実際の角丸など。',note:'立体化しただけでは実物の取付けまで再現されません。この例は根元の面を完全固定した理想化です。'}
 };
 for(const [id,m]of Object.entries(models)){m.executive=['SOL 101','CEND'];m.control=['TITLE = CANTILEVER '+id.toUpperCase()+' TEACHING MODEL','ECHO = NONE','SUBCASE 1','  SPC = 10','  LOAD = 20','  DISPLACEMENT = ALL','  SPCFORCES = ALL',...(id==='detailed'?[]:['  FORCE = ALL']),...(id==='simple'?[]:['  STRESS = ALL'])];m.deck=[...m.executive,...m.control,'BEGIN BULK',...m.rows.map(r=>r.text),'ENDDATA',''].join('\r\n');}
 const schemas={
  GRID:[['GRID','ID','CP','X1','X2','X3','CD','PS','SEID','次行']],
  CELAS2:[['CELAS2','EID','K','G1','C1','G2','C2','GE','S','次行']],
  CBAR:[['CBAR','EID','PID','GA','GB','X1 / G0','X2','X3','OFFT','次行']],
  PBAR:[['PBAR','PID','MID','A','I1','I2','J','NSM','空欄','次行'],['継続行','C1','C2','D1','D2','E1','E2','F1','F2','次行']],
  CHEXA:[['CHEXA','EID','PID','G1','G2','G3','G4','G5','G6','次行'],['継続行','G7','G8','G9','G10','G11','G12','G13','G14','次行'],['継続行','G15','G16','G17','G18','G19','G20','空欄','空欄','次行']],
  PSOLID:[['PSOLID','PID','MID','CORDM','IN','STRESS','ISOP','FCTN','空欄','次行']],
  MAT1:[['MAT1','MID','E','G','NU','RHO','A','TREF','GE','次行']],
  SPC1:[['SPC1','SID','C','G1','G2','G3','G4','G5','G6','次行']],
  FORCE:[['FORCE','SID','G','CID','F','N1','N2','N3','空欄','次行']],
  PLOAD4:[['PLOAD4','SID','EID','P1','P2','P3','P4','G1','G3/G4','次行'],['継続行','CID','N1','N2','N3','SORL','LDIR','空欄','空欄','次行']],
  PARAM:[['PARAM','N','V1','V2','空欄','空欄','空欄','空欄','空欄','次行']]
 };
 function theory(x=L,load=P){return {u:-load*x*x*(3*L-x)/(6*E*I),theta:-load*x*(2*L-x)/(2*E*I),stressTop:load*(L-x)*(h/2)/I,stressBottom:-load*(L-x)*(h/2)/I,momentMagnitude:load*(L-x)};}
 window.NastranModeling={L,b,h,E,nu,P,A,I,I2,k,models,schemas,edgePairs,solidMesh,theory,fixed};
})();
