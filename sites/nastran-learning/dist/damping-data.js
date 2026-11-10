/* Original damping comparisons; textbook equations, not MSC solver results. */
(() => {
 'use strict';
 const D=window.NastranDynamics;
 const m=.01,k=100,wn=100,fn=wn/(2*Math.PI);
 const fixed=D.fixed, record=(name,values,line=0)=>({name,values,line,text:fixed(values)});
 function coefficients(z){return {z,g:2*z,Q:1/(2*z),c:2*z*m*wn,critical:2*m*wn};}
 function harmonic(r,z){return {viscous:1/Math.hypot(1-r*r,2*z*r),structural:1/Math.hypot(1-r*r,2*z)};}
 function decay(t,z){const q=wn*t;if(z===0)return Math.cos(q);if(z===1)return (1+q)*Math.exp(-q);if(z<1){const a=Math.sqrt(1-z*z);return Math.exp(-z*q)*(Math.cos(a*q)+z/a*Math.sin(a*q));}const a=Math.sqrt(z*z-1),s1=-z+a,s2=-z-a;return (-s2*Math.exp(s1*q)+s1*Math.exp(s2*q))/(s1-s2);}
 function rayleigh(w,a1=1.6,a2=.00016){return {mass:a1/(2*w),stiffness:a2*w/2,total:a1/(2*w)+a2*w/2};}
 const variants={
  modal:{title:'モード減衰 2% / SOL 111',sol:'111',note:'モードの固有振動数からTABDMP1を読み、粘性モード減衰を与えます。TYPE=CRITとKDAMP=1を明示します。',rows:[],modal:true},
  dashpot:{title:'粘性ダンパー / SOL 111',sol:'111',note:'節点1のX方向と固定端の間へ、CDAMP2でc=0.04 N·s/mmを入れます。この1自由度ではζ=2%の粘性モード減衰と同じ理論応答です。',rows:[record('CDAMP2',['CDAMP2','300','0.04','1','1','0','0'])]},
  structural:{title:'全体の構造減衰 / SOL 111',sol:'111',note:'PARAM G=0.04で剛性に対応する構造減衰を与えます。粘性2%と一致するのはこの例のf=fₙで、周波数域全体で同一ではありません。W3/W4は周波数応答のこの指定には不要です。',rows:[record('PARAM',['PARAM','G','0.04'])]},
  converted:{title:'構造減衰を粘性へ換算 / SOL 112',sol:'112',note:'全体のG=0.04をW3=100 rad/sで換算します。c=Gk/W3=0.04 N·s/mm。100 Hzではありません。この1自由度の粘性2%と対応します。',rows:[record('PARAM',['PARAM','G','0.04']),record('PARAM',['PARAM','W3','100.'])]},
  element:{title:'ばねのGEを粘性へ換算 / SOL 112',sol:'112',note:'CELAS2のGE=0.04だけを使い、W4=100 rad/sで換算します。全体Gは入れません。この模型はばね1個なので上のG＋W3と同じ粘性係数になります。',rows:[record('PARAM',['PARAM','W4','100.'])],ge:true},
  rayleigh:{title:'Rayleigh減衰 / SOL 112',sol:'112',note:'α₁=1.6 /s、α₂=0.00016 s。ω=50と200 rad/sで2%に合わせた例です。この模型のωₙ=100 rad/sでは1.6%になります。全モード一律2%の指定とは違います。',rows:[record('PARAM',['PARAM','ALPHA1','1.6','0.']),record('PARAM',['PARAM','ALPHA2','0.00016','0.'])]}
 };
 for(const [id,v]of Object.entries(variants)){
  const base=D.models[v.sol];v.exec=[...base.exec];v.control=base.control.map(s=>s.startsWith('TITLE')?'TITLE = DAMPING LEARNING '+id.toUpperCase():s).filter(s=>v.modal||!s.includes('SDAMPING'));
  v.fullRows=base.rows.filter(r=>v.modal||(r.name!=='TABDMP1'&&!(r.name==='PARAM'&&r.values[1]==='KDAMP'))).map(r=>v.ge&&r.name==='CELAS2'?record('CELAS2',['CELAS2','100','100.','1','1','0','0','0.04']):r);
  v.fullRows.push(...v.rows);v.filename='damping_'+id+'_sol'+v.sol+'.bdf';
  v.deck=[...v.exec,...v.control,'BEGIN BULK',...v.fullRows.map(r=>r.text),'ENDDATA',''].join('\r\n');
  v.focusRows=v.fullRows.filter(r=>r.name==='CDAMP2'||r.name==='TABDMP1'||(r.name==='PARAM'&&r.values[1]!=='POST')||(v.ge&&r.name==='CELAS2'));
 }
 const params={
  G:{page:865,value:'0.04',meaning:'全体剛性に対応する構造減衰の係数g。無次元です。0.04は、この1自由度の固有振動数で粘性減衰比2%に対応します。0.02をそのまま2%と読まないでください。既定は0。GEなどを同時に入れると加算されます。'},
  W3:{page:1043,value:'100.',meaning:'全体のPARAM Gを過渡解析用の粘性減衰へ換算する基準角振動数。時間を秒で扱うならrad/sです。100 rad/sは約15.915 Hz。既定0ではこのG由来の換算項が無視されます。G自体を設定する欄ではありません。'},
  W4:{page:1043,value:'100.',meaning:'材料・要素のGEを過渡解析用の粘性減衰へ換算する基準角振動数。秒系ではrad/sです。既定0ではこのGE由来の換算項が無視されます。W3の代わりに何にでも使える設定ではありません。'},
  KDAMP:{page:871,value:'1',meaning:'モード減衰の扱い。既定1は粘性減衰として扱います。モード周波数応答で-1を選ぶと複素剛性による構造減衰として扱います。TYPE=Gと書くだけでは、この切替えになりません。過渡応答の配布例は既定の粘性の扱いを使います。'},
  ALPHA1:{page:823,value:'1.6',meaning:'Rayleigh減衰の質量比例係数α₁。B=α₁M+α₂KのMに掛けます。秒系の単位は1/s。低い固有振動数ほど減衰比への寄与が大きくなります。既定0。減衰比そのものではありません。'},
  ALPHA2:{page:823,value:'0.00016',meaning:'Rayleigh減衰の剛性比例係数α₂。B=α₁M+α₂KのKに掛けます。秒系の単位はs。高い固有振動数ほど減衰比への寄与が大きくなります。既定0。材料のGEやPARAM Gとは別の設定です。'}
 };
 const blank='この欄は使いません。8文字分の空白を残します。空欄を消して後ろの値を左へ詰めず、数字0で埋めることもしません。';
 const cdamp=[
  ['カード名','CDAMP2という種類の名前。減衰係数をこの行へ直接書く粘性ダンパーです。'],
  ['EID','ダンパー自身の要素番号。この例は300。ほかの要素と重ならない正の整数を使います。'],
  ['B','速度差1 mm/sに対して抵抗力が何Nになるかを表す係数。この並進の例は0.04 N·s/mmです。2%を直接入れる欄ではありません。この例は0.04を明示します。B=0では減衰力が出ません。回転自由度を使う場合は対応するモーメントの単位になります。'],
  ['G1','ダンパーの1つ目の端の節点ID。この例はGRID 1。場所の座標ではなく、既に定義した節点の番号です。0または空欄は固定端を表すため、この例の動く端には1を明示します。'],
  ['C1','1つ目の端で使う自由度。この例は1でX方向の並進。GRIDでは1〜6から1つを選びます。0はスカラ点用などの指定で、GRIDの全方向という意味ではありません。'],
  ['G2','2つ目の端の節点ID。この例は0で固定端（グラウンド）を指定します。GRID 0を別に作る必要はありません。実際の2節点間へ置く場合は相手の節点IDを書きます。'],
  ['C2','2つ目の端の自由度。この例はG2=0なので0です。実際のGRIDへ接続するときは、その点の1〜6のどの動きを使うかを書きます。'],
  ['未使用',blank],['未使用',blank],['次行','この単純なCDAMP2入力は1行で終わるため空欄です。8文字分は保持します。']
 ];
 window.NastranDamping={m,k,wn,fn,coefficients,harmonic,decay,rayleigh,variants,params,cdamp,blank};
})();
