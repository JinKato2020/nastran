/* Original teaching example: a rod split into complete small-field entries. */
(() => {
 'use strict';
 function fixed(fields){
  if(fields.length>10)throw new Error('Too many fields');
  return Array.from({length:10},(_,i)=>{const v=String(fields[i]??'');if(v.length>8||/[^\x20-\x7e]|,/.test(v))throw new Error('Invalid small field');return i===0||i===9?v.padEnd(8):v.padStart(8);}).join('');
 }
 const parts={
  'mesh.inc':{title:'形を決める',role:'GRIDで2つの節点を置き、CRODで1本の棒につなぎます。CRODのPID=200は、別ファイルにあるPROD 200を参照します。ファイルが違っても、番号でつながります。',rows:[['GRID','1','','0.','0.','0.'],['GRID','2','','1000.','0.','0.'],['CROD','100','200','1','2']]},
  'properties.inc':{title:'断面と材料を決める',role:'PROD 200で断面積100 mm²を指定し、MID=300でMAT1 300を参照します。MAT1のEは210000 MPa、NUは0.3です。形状のファイルと共通の番号を使います。',rows:[['PROD','200','300','100.'],['MAT1','300','210000.','','0.3']]},
  'constraints.inc':{title:'動きを止める',role:'節点1は123456、節点2は23456を0にします。節点2の軸方向の動きだけを残した、棒の引張り例です。2行のSID=10は同じ拘束セットを作り、親のSPC = 10から選ばれます。',rows:[['SPC1','10','123456','1'],['SPC1','10','23456','2']]},
  'load_1000.inc':{title:'1000 Nで引く',role:'FORCEのSID=20が荷重セットの番号です。節点2を基本座標の＋X方向へ1000 Nで引きます。親のLOAD = 20は、このセットを選びます。',rows:[['FORCE','20','2','0','1000.','1.','0.','0.']]},
  'load_2000.inc':{title:'2000 Nで引く',role:'1000 N版と同じ節点・方向・SID=20で、大きさだけを2000 Nにします。親でこちらのファイルを選べば、LOAD = 20を書き換えず荷重を変更できます。',rows:[['FORCE','20','2','0','2000.','1.','0.','0.']]}
 };
 const order=load=>['mesh.inc','properties.inc','constraints.inc',`load_${load}.inc`];
 const controls=['SOL 101','CEND','TITLE = AXIAL ROD INCLUDE EXAMPLE','ECHO = NONE','DISPLACEMENT = ALL','SPCFORCES = ALL','FORCE = ALL','STRESS = ALL','SPC = 10','SUBCASE 1','    LOAD = 20','BEGIN BULK'];
 function make(load=1000){
  if(![1000,2000].includes(load))throw new Error('Choose 1000 or 2000');
  const files={'main.bdf':controls.concat(order(load).map(n=>`INCLUDE '${n}'`),'ENDDATA').join('\r\n')+'\r\n'};
  for(const [name,part]of Object.entries(parts))files[name]=part.rows.map(fixed).join('\r\n')+'\r\n';
  return files;
 }
 function expanded(load=1000){const f=make(load);return controls.concat(order(load).flatMap(n=>f[n].trimEnd().split('\r\n').map(l=>l.padEnd(80))),'ENDDATA').join('\r\n')+'\r\n';}
 window.NastranInclude={fixed,parts,order,controls,make,expanded};
})();
