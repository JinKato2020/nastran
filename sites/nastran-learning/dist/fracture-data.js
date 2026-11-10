/* Original teaching patch. Documented CRAC2D geometry; no MSC solver result implied. */
(() => {
 'use strict';
 const E=210000,nu=.3,K=1000,L=10,mu=E/(2*(1+nu)),kappa=(3-nu)/(1+nu);
 const xy=[[0,0],[-L,0],[-L,L],[0,L],[L,L],[L,0],[L,-L],[0,-L],[-L,-L],[-L,0],[-L,L/2],[-L/2,L],[L/2,L],[L,L/2],[L,-L/2],[L/2,-L],[-L/2,-L],[-L,-L/2]];
 function displacement(x,y,thetaOverride){const r=Math.hypot(x,y);if(!r)return {ux:0,uy:0};const theta=thetaOverride??Math.atan2(y,x),a=K/(2*mu)*Math.sqrt(r/(2*Math.PI))*(kappa-Math.cos(theta));return {ux:a*Math.cos(theta/2),uy:a*Math.sin(theta/2)};}
 const roles=['亀裂先端','亀裂面の上側端','左上の角','上辺の中央','右上の角','右辺の中央','右下の角','下辺の中央','左下の角','亀裂面の下側端','G2–G3間の外周中間節点','G3–G4間の外周中間節点','G4–G5間の外周中間節点','G5–G6間の外周中間節点','G6–G7間の外周中間節点','G7–G8間の外周中間節点','G8–G9間の外周中間節点','G9–G10間の外周中間節点'];
 const nodes=xy.map(([x,y],i)=>({g:i+1,id:101+i,x,y,...displacement(x,y,i===1?Math.PI:i===9?-Math.PI:undefined),role:roles[i],required:i<10}));
 const fixed=values=>{if(values.length>10)throw Error('Too many fields');return Array.from({length:10},(_,i)=>{const v=String(values[i]??'');if(v.length>8||/[^\x20-\x7e]/.test(v))throw Error('Invalid field: '+v);return v.padEnd(8);}).join('');};
 function real(v){if(Math.abs(v)<.0000005)return '0.';const s=v.toFixed(6).replace(/^(-?)0\./,'$1.');if(s.length>8)throw Error('Displacement overflows field');return s;}
 const rows=[],add=(card,values,line=0)=>rows.push({card,line,values,text:fixed(values)});
 add('PARAM',['PARAM','POST','-1']);add('ADUM8',['ADUM8','18','0','5','0','CRAC2D']);
 for(const n of nodes)add('GRID',['GRID',n.id,'0',n.x+'.',n.y+'.','0.','0']);
 add('CRAC2D',['CRAC2D','100','200',...nodes.slice(0,6).map(n=>n.id),'+C1']);
 add('CRAC2D',['+C1',...nodes.slice(6,14).map(n=>n.id),'+C2'],1);
 add('CRAC2D',['+C2',...nodes.slice(14).map(n=>n.id)],2);
 add('PRAC2D',['PRAC2D','200','300','1.','1']);
 add('MAT1',['MAT1','300','210000.','','0.3']);
 for(let i=0;i<18;i+=6)add('SPC1',['SPC1','10','3456',...nodes.slice(i,i+6).map(n=>n.id)]);
 for(const n of nodes.slice(1))add('SPC',['SPC','10',n.id,'1',real(n.ux),n.id,'2',real(n.uy)]);
 const executive=['SOL 101','CEND'],control=['TITLE = CRAC2D LOCAL K FIELD TEACHING PATCH','ECHO = NONE','SUBCASE 1','  SPC = 10','  DISPLACEMENT = ALL','  SPCFORCES = ALL','  STRESS = ALL'];
 const deck=[...executive,...control,'BEGIN BULK',...rows.map(r=>r.text),'ENDDATA',''].join('\r\n');
 const blank='この欄は使いません。8文字分の空白を残し、右の欄を左へ詰めません。値0を書く指示ではありません。';
 const next='次の行へ続く目印。ここでは+C1、+C2を使い、次行の第1欄と同じ名前にします。最後の行では空欄です。';
 const continuation='前の行の第10欄と同じ目印を書きます。新しい要素ではなく、前のカードの続きです。';
 const common={'未使用':blank,'次行':next,'継続':continuation,'カード名':'データの種類を指定する名前。半角英字で左端から書きます。この欄は省略しません。'};
 const fields=(labels,help)=>labels.map(label=>({label,help:help[label]||common[label]}));
 const gi=Object.fromEntries(nodes.map(n=>['G'+n.g,`この要素の${roles[n.g-1]}を指定する欄です。この例ではGRIDのID=${n.id}を入れ、座標は(${n.x}, ${n.y}, 0) mm。`+(n.g===1?'先端はこの1点です。':n.g===2||n.g===10?'G2とG10は同じ座標ですが、上下面なので別の節点IDにします。節点を同一化すると亀裂面がつながってしまいます。':n.g<=10?'全形のCRAC2Dでは必須なので空欄にしません。':'全形では任意で、省略する場合も欄の位置は残します。この例は外周形状を表すため使用します。亀裂先端から1/4の位置へ動かす節点ではありません。')]));
 const cards={
  ADUM8:{title:'CRAC2Dを使うための属性指定',page:1250,intro:'2020 SP1のCRAC2Dはダミー要素の仕組みを使うため、この属性行が必要です。原典の固定の組合せをそのまま使います。18節点を自動で作る命令ではありません。',lines:[fields(['カード名','NG','NC','NP','ND','ELNM','未使用','未使用','未使用','次行'],{NG:'このダミー要素が扱う接続節点数の上限。CRAC2D用の指定は整数18です。',NC:'接続データに追加する項目の数（整数で指定）。CRAC2D用では0です。ここは空欄とせず原典どおり0を書きます。',NP:'プロパティに追加する項目数。CRAC2D用の指定は5です。材料番号や厚さの値ではありません。',ND:'微分剛性に関係する自由度数の指定です。CRAC2D用では0で、微分剛性を生成しない指定です。初学者はこの公式の値を変更しません。',ELNM:'使う要素系列の名前。この例はCRAC2D。数字の要素番号ではなく、半角の名前です。'})]},
  CRAC2D:{title:'亀裂先端を含む2次元の専用要素',page:1657,intro:'EIDは要素自身、PIDは物性、G1〜G18は図で決まった位置の節点です。G1という欄へ、必ずGRID 1を書くという意味ではありません。この例はG1へ101を書きます。',lines:[fields(['カード名','EID','PID','G1','G2','G3','G4','G5','G6','次行'],{EID:'要素の識別番号。この例は100。別の要素と重複しない正の整数を必ず書きます。',PID:'PRAC2DのPIDを参照します。この例は200。板厚・材料・平面応力の指定をそのカードから受け取ります。',...gi}),fields(['継続','G7','G8','G9','G10','G11','G12','G13','G14','次行'],gi),fields(['継続','G15','G16','G17','G18','未使用','未使用','未使用','未使用','次行'],gi)]},
  PRAC2D:{title:'材料・厚さ・平面状態と特異場の設定',page:2931,intro:'この例は平面応力、厚さ1 mmです。GAMMAとPHIは空欄で既定値を使います。原典は両者の非既定値を未試験としているため、特異性を消す目的で変更しません。',lines:[fields(['カード名','PID','MID','T','IPLANE','NSM','GAMMA','PHI','未使用','次行'],{PID:'物性セットの番号。この例は200で、CRAC2DのPID=200と一致させます。必須です。',MID:'材料の番号。この例は300で、MAT1のMID=300を使います。この等方性の例では平面応力・平面ひずみともMAT1を使えます。',T:'要素の厚さ。この例は1. mm。面内の2次元模型でも、板厚の指定が必要です。必須の正の実数です。',IPLANE:'0は平面ひずみ、1は平面応力です。空欄の既定は0なので、今回の薄い板の仮定には1を明示します。数字を逆にしないようにします。',NSM:'面積あたりの追加質量。この例は静的な強制変位だけなので空欄（既定0）です。材料密度や厚さそのものではありません。N・mm・s系で使うなら質量単位もそろえます。',GAMMA:'変位場に使う指数。空欄の既定は0.5です。先端近傍の平方根型の変位・逆平方根型の応力を表すための設定です。0などに変えて特異性を消す操作はしません。',PHI:'要素x軸を基準にKを評価する角度（度）。空欄の既定は180です。荷重の方向を決める欄でも、亀裂の節点配置を回転する欄でもありません。下の理論式の角度θと混同せず、既定を保ちます。'})]}
 };
 const schemas={
  GRID:[['カード名','ID','CP','X1','X2','X3','CD','PS','SEID','次行']],MAT1:[['カード名','MID','E','G','NU','RHO','A','TREF','GE','次行']],PARAM:[['カード名','N','V1','V2','未使用','未使用','未使用','未使用','未使用','次行']],SPC1:[['カード名','SID','C','G1','G2','G3','G4','G5','G6','次行']],SPC:[['カード名','SID','G1','C1','D1','G2','C2','D2','未使用','次行']]
 };
 for(const [name,card]of Object.entries(cards)){schemas[name]=card.lines.map(r=>r.map(f=>f.label));if(card.lines.some(r=>r.length!==10||r.some(f=>!f.help)))throw Error('Missing field explanation '+name);}
 window.NastranFracture={E,nu,K,L,mu,kappa,nodes,rows,deck,executive,control,cards,schemas,displacement,real,filename:'crac2d_kfield_patch.bdf'};
})();
