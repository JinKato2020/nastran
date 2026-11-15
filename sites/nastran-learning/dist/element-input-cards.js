/* Fixed-field references checked against MSC Nastran 2025.1 QRG. */
(() => {
 'use strict';
 const GRID=['GRID','節点の位置と変位の軸を定義します。','GRID'];
 const MAT1=['MAT1','等方性材料の剛性を定義します。','MAT1'];
 const entryId='要素番号。他の種類も含め、同じモデル内の要素番号と重複させません。';
 const propId='プロパティ番号。要素のPIDでこの番号を参照します。';
 const directionComponent=i=>`GAの変位座標系における方向ベクトルvの第${i}成分。第7欄（CBENDでは第6欄）に整数のG0を指定する方式では、ベクトル成分を記入しません。`;
 const field=(label,help)=>({label,help});
 const fixedRow=(key,definitions,continuation)=>{
  const padded=[[key,key.startsWith('+')?'直前の行の継続記号と対応します。':'要素またはプロパティのカード名です。',key],...definitions];
  while(padded.length<9)padded.push(['空欄','この書式・行で使わない欄です。後ろの項目を詰めず、空欄にします。','']);
  padded.push(['継続',continuation?'次行の先頭に同じ継続記号を書きます。':'次行に続かないので空欄です。',continuation||'']);
  return padded;
 };
 const cards=[];
 function add(id,title,category,summary,sourcePages,data,details){
  const rows=data.map(parts=>parts.map(([, ,value])=>value));
  const lines=data.map(parts=>parts.map(([name,help])=>field(name,help)));
  cards.push({key:id,id,title,category,family:'bulk',kind:'fixed',summary,sourceVersion:'2025.1',page:sourcePages[0],sourcePages,rows,lines,...details,
   notes:['書式を確認する入力例です。参照先の節点や材料を含む完成BDFではありません。',...(details.notes||[])]});
 }
 add('CBEND','円弧の梁・曲がり管','棒・梁','2節点間を円弧で結びます。円弧の決め方はGEOM、断面特性はPBENDで指定します。',[1388,1389,1390],[
  fixedRow('CBEND',[['EID',entryId,'41'],['PID','PBENDの番号です。空欄時はEIDと同じ番号を参照します。','81'],['GA','A端の接続節点。GBとは別のGRIDです。','31'],['GB','B端の接続節点。','32'],...['0.','1.','0.'].map((v,i)=>['X'+(i+1),directionComponent(i+1),v]),['GEOM','1は曲率中心の方向、2はA端接線、3はPBENDのRB、4はPBENDのTHETABで円弧を指定します。既定値はありません。','1']])
 ],{connections:[GRID,['PBEND','曲がり梁・配管の断面と曲率の情報。','PBEND']],notes:['GEOM 3・4では入力するvまたはG0が、弦ABに対して曲率中心の反対側になります。曲がり方向と円弧を前処理画面で確認します。'],outputs:['要素力を評価する端と円弧の局所軸を確認し、軸力・曲げ・ねじりを区別して読みます。'],reference:'elements.html#beam-curved'});
 add('PBEND','曲がり梁・曲がり管の特性','棒・梁','CBENDの断面特性と円弧の補足条件です。表は一般断面の書式で、曲がり管の寸法で記述する別書式もあります。',[2517,2518,2519],[
  fixedRow('PBEND',[['PID',propId,'81'],['MID','構造ではMAT1。熱伝導の対応用途ではMAT4またはMAT5を参照します。','12'],['A','断面積。正の値を指定します。','120.'],['I1','面1で使う断面二次モーメント。','1500.'],['I2','面2で使う断面二次モーメント。','1500.'],['J','ねじりに使う断面の特性値。正の値を指定します。','2500.'],['RB','図心を通る円弧の半径。必要性はCBENDのGEOMで決まります。',''],['THETAB','円弧の角度（度）。必要性はCBENDのGEOMで決まります。','']],'+B81'),
  fixedRow('+B81',Array.from('CDEF').flatMap((point,index)=>[[point+'1',`評価点${point}の半径方向座標。断面の図心基準です。`,['6.','-6.','0.','0.'][index]],[point+'2',`評価点${point}の断面第2方向座標。曲げ応力を読む点を決めます。`,['0.','0.','6.','-6.'][index]]]),'+B82'),
  fixedRow('+B82',[['K1','面1のせん断剛性係数。K1·A·Gの係数です。',''],['K2','面2のせん断剛性係数。',''],['NSM','単位長さ当たりの非構造質量。',''],['RC','GA・GBに対する図心の半径方向のオフセット。',''],['ZC','円弧の面に垂直な方向への図心のオフセット。',''],['DELTAN','図心から中立軸への半径方向のずれ。曲率中心に向かう向きが正です。','']])
 ],{connections:[MAT1,['CBEND','このプロパティを使用する要素。','CBEND']],notes:['曲がり管用の代替書式は、第4欄にFSI、第5〜7欄に断面平均半径RM・管厚T・内圧Pを書きます。RBは曲がり半径で、断面半径RMと区別します。'],reference:'elements.html#beam-curved'});
 add('CBEAM3','中間節点付きの曲がり梁','棒・梁','A・Bの両端と中間節点Cで梁軸を定義します。断面の初期ねじれ、せん断中心へのオフセット、反り自由度を指定できます。',[1384,1385],[
  fixedRow('CBEAM3',[['EID',entryId,'63'],['PID','PBEAM3または条件を満たすPBMSECTを参照する番号。必須です。','43'],['GA','A端のGRID。','21'],['GB','B端のGRID。','23'],['GC','中央のGRID。空欄では2節点の定式化になり、CBEAMと同じ定式化にはなりません。','22'],...['0.','1.','0.'].map((v,i)=>['X'+(i+1),directionComponent(i+1),v])],'+CB31'),
  fixedRow('+CB31',['W1A','W2A','W3A','W1B','W2B','W3B','W1C','W2C'].map(name=>[name,`節点${name[2]}の変位座標の第${name[1]}方向の、せん断中心へのオフセット。既定値0。`,'']),'+CB32'),
  fixedRow('+CB32',[['W3C','節点Cの変位座標の第3方向の、せん断中心へのオフセット。既定値0。',''],...['A','B','C'].map(end=>['TW'+end,`位置${end}での初期ねじれ角（度）。空欄では0°です。`,'']),...['A','B','C'].map(end=>['S'+end,`位置${end}の反り自由度の点番号。反りを考慮する場合はSPOINT、またはT1を使用するGRIDを参照します。`,''])])
 ],{connections:[GRID,['SPOINT','反り自由度の点として使用できます。','SPOINT']],notes:['方向ベクトルを節点で指定する場合は第7欄にG0を入力します。G0はGA・GB・GCとは別の節点です。'],outputs:['応力を読む断面がA端・B端・中間位置のどれかを確認し、曲率と断面の回転を含めて比較します。'],reference:'elements.html#beam-curved'});
 add('CFAST','シェル面を点で締結','結合・凝着要素','2つのシェル面に、締結具の剛性を与えます。面の指定と締結位置の指定は別です。',[1414,1415],[
  fixedRow('CFAST',[['EID',entryId,'81'],['PID','PFASTの番号。空欄でEIDと同じ番号を使います。','51'],['TYPE','PROPはシェルのプロパティ番号、ELEMはシェルの要素番号で面を指定します。','ELEM'],['IDA','面Aのプロパティ番号または要素番号。','205'],['IDB','面Bのプロパティ番号または要素番号。','309'],['GS','締結位置を与えるGRID。GAを指定する方式ではGSよりGAが優先されます。','42'],['GA','面A側の貫通点GRID。ここではGSから投影するので空欄です。',''],['GB','面B側の貫通点GRID。ここではGSから投影するので空欄です。','']],'+CF1'),
  fixedRow('+CF1',['X','Y','Z'].map(axis=>[axis+'S',`締結位置の基本座標${axis}成分。GSもGAも使わない場合に3成分を指定します。`,'']))
 ],{connections:[['PFAST','締結部の直径と並進・回転剛性を定義します。','PFAST'],GRID],notes:['パッチ面への投影位置、実際に結合された範囲、剛性方向を確認します。締結具を置いた位置の近くに正しい面があるか確認します。'],reference:'elements.html#connector-cfast'});
 add('PFAST','締結具の特性','結合・凝着要素','CFASTが使うパッチの代表直径と、3方向の並進剛性・回転剛性を定義します。',[2605,2606,2607],[
  fixedRow('PFAST',[['PID',propId,'51'],['D','締結具の直径。正の値で、パッチの範囲に関係します。','8.'],['MCID','剛性に用いる座標系。既定の−1では締結軸から要素座標が作られます。',''],['MFLAG','0はMCIDを相対方向指定に、1は絶対方向指定に使います。既定は0。MCIDが−1のときは無視されます。',''],...['1800.','900.','900.'].map((v,i)=>['KT'+(i+1),`方向${i+1}の並進剛性（力／長さ）。`,v]),['KR1','方向1まわりの回転剛性（モーメント／rad）。既定値0。','']],'+PF1'),
  fixedRow('+PF1',[['KR2','方向2まわりの回転剛性。既定値0。',''],['KR3','方向3まわりの回転剛性。既定値0。',''],['MASS','締結具の集中質量。既定値0。',''],['GE','構造減衰係数。既定値0。',''],['ALPHA','締結具の熱膨張係数。既定値0。',''],['TREF','熱荷重を計算するための基準温度。既定値0。',''],['COINL','貫通点の座標が同じ場合に使う長さ。0以上、既定値0。','']])
 ],{connections:[['CFAST','締結する面と位置を定義します。','CFAST']],notes:['面内の方向ごとに異なる剛性を入れる場合は、座標系を指定し、どの方向にKT2・KT3が作用するかを点検します。'],reference:'elements.html#connector-cfast'});
 function interfacePoint(index,lastCorner,bottom,top){
  if(index<=lastCorner)return [`G${index}`,`角のGRID。G1〜G${lastCorner}は必須です。相対する面の節点順を図で確認します。`,String(80+index)];
  const location=index<=bottom?'下面の辺上':index>=top?'上面の辺上':'上下を結ぶ辺の中間';
  return [`G${index}`,`${location}のGRID。ここでは角節点だけの一次要素を例にするため空欄です。`,''];
 }
 for(const [id,title,firstPage,lastCorner,bottom,top,last] of [
  ['CIFHEX','四角形の凝着界面',1440,8,12,17,20],
  ['CIFPENT','三角形の凝着界面',1442,6,9,13,15],
 ]){
  const points=Array.from({length:last},(_,i)=>interfacePoint(i+1,lastCorner,bottom,top));
  add(id,title,'結合・凝着要素','SOL 400の剥離モデルに使う立体の界面要素です。2面の相対変位に対して界面トラクションを計算します。',[firstPage,firstPage+1],[
   fixedRow(id,[['EID',entryId,'121'],['PID','界面のPCOHEプロパティを参照する番号。','41'],...points.slice(0,6)],'+IF1'),
   fixedRow('+IF1',points.slice(6,14),'+IF2'),
   fixedRow('+IF2',points.slice(14))
  ],{connections:[['PCOHE','界面材料、積分方式、評価する位置を選びます。','PCOHE'],GRID],notes:['上下面の節点順はQRGの図で確認します。上下の面を同じ位置に置けますが、界面の相対変位を表せるよう両面の節点を区別します。中間節点を使うモデルでは対応する接続図に従います。'],outputs:['開口とすべりの方向を区別し、相対変位とトラクションを同じ評価点で照合します。'],reference:'elements.html#connector-cohesive'});
 }
 add('PCOHE','凝着界面の特性','結合・凝着要素','CIFHEXなどに与える界面のプロパティです。界面材料、積分点、結果位置、剛性行列の種類を選びます。',[2554],[
  fixedRow('PCOHE',[['PID',propId,'41'],['MID','界面の材料則を与えるMCOHEの番号。','71'],['INT','0はGauss積分、1はNewton–Coates/Lobatto積分。既定値0。',''],['T','厚さ。既定値1.0で、CIFQUADに適用されます。',''],['OUTPUT','GRIDは角節点、GAUSSは積分点。空欄はGRID、INT=1でもGRIDになります。',''],['SECANT','0は割線型、1は接線型の剛性行列。既定値0。','']])
 ],{connections:[['CIFHEX','四角形面の界面で使用します。','CIFHEX'],['CIFPENT','三角形面の界面で使用します。','CIFPENT']],reference:'elements.html#connector-cohesive'});
 add('GENEL','行列を直接与える一般要素','一般要素','指定した自由度の間に、剛性行列Kまたは柔性行列Zを与えます。この例は2つのスカラー自由度を結ぶ剛性形式です。',[1954,1955,1956],[
  fixedRow('GENEL',[['EID',entryId,'71'],['空欄','第3欄は空欄にします。最初の自由度の点番号は第4欄です。',''],['UI1','行列の第1自由度の点番号。','901'],['CI1','第1自由度の成分。スカラー点なので0です。','0'],['UI2','行列の第2自由度の点番号。','902'],['CI2','第2自由度の成分。スカラー点なので0です。','0'],['UI3','第3自由度があれば点番号。ここでは2自由度なので空欄。',''],['CI3','第3自由度があれば成分番号。ここでは空欄。','']],'+GE1'),
  fixedRow('+GE1',[['K','以下が剛性行列の値であることを示します。柔性形式ではZと書きます。','K'],['K11','剛性行列の第1行・第1列。','75.'],['K21','第2行・第1列。K12と対称なので、下三角の側だけを書きます。','-75.'],['K22','第2行・第2列。','75.']])
 ],{connections:[['SPOINT','成分番号0でスカラー点を参照できます。','SPOINT'],GRID],notes:['KまたはZは下三角を列方向に、Sは行方向に並べます。Sを指定する場合は、対応するUDの自由度一覧も必要です。','この例では2点が同じ量だけ動くと内力が0になります。実際のモデルの支持は別途指定します。'],outputs:['GENEL固有の応力回復は行いません。接続自由度の変位と反力、入力した行列の積から作用を確認します。'],reference:'elements.html#genel'});
 add('CWELD','スポット溶接・点接続','結合・凝着要素','2つのシェル面や点を結合します。この入力例はシェルの頂点同士を接続するALIGN方式です。',[1579,1580,1581],[
  fixedRow('CWELD',[['EWID',entryId,'76'],['PWID','溶接特性を定めるPWELDの番号。','86'],['空欄','ALIGN方式では第4欄を使いません。パッチ方式ではここにGSを置く書式があります。',''],['ALIGN','2つのシェル頂点のGRIDを指定する方式です。','ALIGN'],['GA','面A側の頂点GRID。','21'],['GB','面B側の頂点GRID。','31'],['空欄','ALIGN方式では第8欄を使いません。',''],['MCID','剛性の座標系。空欄では既定値−1です。','']])
 ],{connections:[['PWELD','溶接の材料・直径・形式を定義します。','PWELD'],GRID],notes:['PARTPATとELPATは複数要素にまたがるパッチを選べます。ELEMIDは各側のシェルを1要素ずつ選び、GRIDIDは面を構成する節点列を指定します。パッチ方式の入力順はQRGで確認します。'],reference:'elements.html#connector-cweld'});
 add('PWELD','スポット溶接・結合の特性','結合・凝着要素','CWELDの材料・コネクタ径・形式を定義します。',[2709,2710],[
  fixedRow('PWELD',[['PID',propId,'86'],['MID','溶接部の材料番号。','12'],['D','コネクタ直径。正の値を指定します。','5.'],['MSET','PARAM,OLDWELD,YESの場合だけ有効。OFFで従属自由度を消去、ONで拘束方程式を生成します。既定はOFF。',''],['TYPE','空欄は一般コネクタ。SPOTはスポット溶接として扱います。',''],['LDMIN','旧方式で有効になる、剛性計算用の長さ／直径の下限。既定0.2。',''],['LDMAX','旧方式で有効になる、剛性計算用の長さ／直径の上限。既定5.0。','']])
 ],{connections:[MAT1,['CWELD','結合位置と結合形式を定義する要素。','CWELD']],reference:'elements.html#connector-cweld'});
 add('CSEAM','線状の溶接を表す結合要素','結合・凝着要素','シェル面同士を線の区間で結びます。始端・終端のGRIDを指定する書式の例です。',[1537,1538,1539],[
  fixedRow('CSEAM',[['EID',entryId,'740'],['PID','PSEAMの番号。','540'],['SMLN','連続する溶接線の識別名。8文字以内で、同じ線に分岐を作れません。',''],['CTYPE','PSHELL（既定）はプロパティ番号、ELEMは要素番号で面を探します。',''],['IDAS','始端側の面Aのプロパティまたは要素番号。','211'],['IDBS','始端側の面Bのプロパティまたは要素番号。','212'],['IDAE','終端側の面Aを指定する場合の番号。',''],['IDBE','終端側の面Bを指定する場合の番号。','']],'+SE1'),
  fixedRow('+SE1',[['GS','溶接線の始端のGRID番号。','71'],['GE','溶接線の終端のGRID番号。','72']])
 ],{connections:[['PSEAM','溶接線の幅や材料を定義します。','PSEAM'],GRID],notes:['座標で始端・終端を指定する代替書式では、CTYPE以降の位置が変わります。QRGの代替書式を参照します。'],reference:'elements.html#connector-cseam'});
 add('PSEAM','線状溶接の特性','結合・凝着要素','CSEAMの幅、厚さ、材料と積分方式を定義します。',[2670],[
  fixedRow('PSEAM',[['PID',propId,'540'],['MID','溶接部の材料番号。','12'],['TYPE','生成する溶接の種類。既定はLINEです。',''],['W','線に垂直に測る溶接の幅。パッチへの投影にも使います。','8.'],['T','溶接部の厚さ。空欄では両面の板厚の平均です。',''],['IN','積分方式。2は低減せん断積分（既定）、0はバブル関数を用いる低減せん断積分です。','']])
 ],{connections:[MAT1,['CSEAM','線の端と結合面を指定する要素。','CSEAM']],reference:'elements.html#connector-cseam'});
 const crackPoints=Array.from({length:64},(_,i)=>{
  const n=i+1,required=n<=10||(19<=n&&n<=28);
  return ['G'+n,`き裂先端要素の接続図でG${n}に対応するGRID。${required?'全体き裂形式では必須です。':'全体き裂形式のこの例では省略する位置です。中間節点や対称形式の適用条件はQRGを確認します。'}`,required?String(1000+n):''];
 });
 add('CRAC3D','三次元き裂先端要素','亀裂先端要素','三次元き裂先端の特別な変位分布を表す要素です。全体き裂形式の必須欄を示しています。',[1526,1527,1528],[
  fixedRow('CRAC3D',[['EID',entryId,'843'],['PID','PRAC3Dのプロパティ番号。','314'],...crackPoints.slice(0,6)],'+R1'),
  ...Array.from({length:8},(_,i)=>fixedRow('+R'+(i+1),crackPoints.slice(6+i*8,14+i*8),i===7?'':'+R'+(i+2)))
 ],{connections:[['PRAC3D','き裂先端の材料と評価条件を定義します。','PRAC3D'],GRID],notes:['ADUM9の宣言が必要です。図の上下、重なる節点の組、要素の右手系を確認します。全体形式と対称半き裂形式では必須・省略欄が変わります。'],outputs:['き裂先端の節点応力の最大値だけで評価せず、指定した局所軸で応力拡大係数とモードを読みます。'],reference:'elements.html#solid-crack'});
 add('PRAC3D','三次元き裂先端の特性','亀裂先端要素','CRAC3Dの材料と、き裂先端の変位場・応力拡大係数の評価条件を指定します。',[2664],[
  fixedRow('PRAC3D',[['PID',propId,'314'],['MID','材料番号。MAT1またはMAT9を参照できます。','12'],['GAMMA','変位場に使う指数。既定0.5。',''],['PHI','応力拡大係数を評価する方向。要素のx軸基準の角度（度）で既定180°。','']])
 ],{connections:[MAT1,['MAT9','異方性材料の定義。','MAT9'],['CRAC3D','要素の接続先と形式を定義します。','CRAC3D']],notes:['QRGではGAMMAとPHIの非既定値に検証上の制限が示されているため、基本形では既定値を使用します。'],reference:'elements.html#solid-crack'});
 const unused=['空欄','この位置は空欄です。後続の欄を左に詰めません。',''];
 const loadSet=['CASE_LOAD','静解析で使用する荷重セットを選びます。','CASE_LOAD'];
 const loadId='静荷重セットの番号。SOL 101のCase Controlで選ぶ番号です。';
 const direction=(values)=>values.map((value,i)=>['N'+(i+1),`CIDの第${i+1}方向の成分。3成分で加速度または荷重の向きを決めます。`,value]);
 add('MAT3','軸対称の直交異方性材料','材料','軸対称断面のx・周方向θ・zで弾性特性が異なる材料を定義します。',[2050,2051],[
  fixedRow('MAT3',[['MID','材料番号。CTRIAX6などの対応する要素・物性から参照します。','41'],['EX','断面x方向のヤング率。正の値、必須。','70000.'],['ETH','周方向θのヤング率。正の値、必須。','43000.'],['EZ','軸z方向のヤング率。正の値、必須。','55000.'],['NUXTH','x方向と周方向のポアソン比。','0.22'],['NUTHZ','周方向とz方向のポアソン比。','0.19'],['NUZX','z方向とx方向のポアソン比。','0.20'],['RHO','質量密度。自重や慣性荷重で単位を確認します。','']],'+M31'),
  fixedRow('+M31',[unused,unused,['GZX','断面のz–x面のせん断弾性係数。正の値、必須。','18000.'],['AX','x方向の熱膨張係数。',''],['ATH','周方向の熱膨張係数。',''],['AZ','z方向の熱膨張係数。',''],['TREF','熱荷重や温度依存の熱膨張係数を計算する際の参照温度。',''],['GE','構造減衰係数。適用範囲はQRGで確認します。','']])
 ],{connections:[['CTRIAX6','軸対称の三角形要素で参照します。','CTRIAX6']],reference:'theory.html#materials'});
 add('MPCY','右辺付きの多点拘束','拘束・結合','複数の成分を結ぶ式に、0以外の右辺を指定できます。例では uA − uB = 0.25 とします。',[2367],[
  fixedRow('MPCY',[['SID','拘束式のセット番号。Case ControlのMPCで選びます。','43'],['GM','式を識別する従属側の節点またはスカラー点。','81'],['CM','GMの成分番号。GRIDは1〜6です。','1'],['AM','GM・CMに掛ける0以外の係数。','1.'],['YM','式の右辺。空欄で0になります。','0.25']],'+MY1'),
  fixedRow('+MY1',[unused,['G1','独立側の節点またはスカラー点の番号。','82'],['C1','G1の成分。','1'],['A1','G1・C1の変位に掛ける係数。','-1.'],['G2','同じ式に加える次の節点またはスカラー点。ここでは省略。',''],['C2','G2で指定する成分。G2がないので空欄。',''],['A2','G2・C2の係数。ここでは空欄。','']])
 ],{connections:[['MPCD','GM・CMで式を特定し、YMを上書きします。','MPCD'],['CASE_MPC','使用する拘束式のセットを選びます。','CASE_MPC']],notes:['同じ成分への拘束の重複を確認します。PARAM,AUTOMSETの設定により内部で選ぶ従属自由度が入れ替わる場合でも、MPCDで式を識別するGM・CMを追います。MSC 2025.1 QRGではSOL 400非対応です。'],reference:'theory.html#boundary'});
 add('MPCD','多点拘束の右辺を荷重ケースで変更','拘束・結合','MPCYの式をGM・CMで特定し、その右辺を荷重ケースに応じて上書きします。',[2366],[
  fixedRow('MPCD',[['SID',loadId,'75'],...['1','2'].flatMap((n,i)=>[['GM'+n,'対象MPCYで式を識別する節点またはスカラー点の番号。',i?'':'81'],['CM'+n,'GMと組にして対象の式を識別する成分。',i?'':'1'],['YM'+n,'その式に与える新しい右辺値。',i?'':'0.50']])])
 ],{connections:[['MPCY','MPCDのGM・CMは、選択したMPCYに存在する必要があります。','MPCY'],loadSet],notes:['SOL 101ではCase ControlのLOADで直接選びます。Bulk DataのLOADでは合成できません。2つ目の式を変更しない場合はGM2・CM2・YM2を空欄にします。'],reference:'theory.html#boundary'});
 add('SLOAD','スカラー点・GRIDのT1への集中荷重','荷重','スカラー自由度、またはGRIDの変位座標系の第1並進成分に集中荷重を与えます。',[2875],[
  fixedRow('SLOAD',[['SID',loadId,'24'],...['1','2','3'].flatMap((n,i)=>[['S'+n,'荷重を与えるスカラー点またはGRIDの番号。GRIDならCDのT1方向です。',i?'':'51'],['F'+n,'その自由度に与える符号付きの荷重値。',i?'':'30.']])])
 ],{connections:[loadSet,['SPOINT','位置を持たない1自由度の点。','SPOINT'],GRID],reference:'theory.html#common-loads'});
 add('PLOAD1','1次元要素上の集中・分布荷重','荷重','梁の長手方向に作用位置と荷重強度を指定します。例はCBAR全長に与える一様な線荷重です。',[2626,2627,2628],[
  fixedRow('PLOAD1',[['SID',loadId,'61'],['EID','対象CBAR・CBEAM・CBENDの要素番号。CBENDは全長の分布荷重に限ります。','71'],['TYPE','FX・FY・FZは基本軸の力、MX・MY・MZは基本軸まわりのモーメント。末尾E付きは要素軸を使います。','FY'],['SCALE','LE・LEPRの位置は実距離、FR・FRPRの位置は実長に対する比です。PR付きでは分布強度を投影長さ当たりで与えます。','FR'],['X1','A端から荷重開始位置までの長さまたは比。','0.'],['P1','開始位置の荷重強度。集中荷重の指定では荷重値そのものです。','-4.'],['X2','A端から終了位置までの長さまたは比。空欄またはX1と同じなら集中荷重です。','1.'],['P2','終了位置の強度。P1と同じ強度なら一様分布です。','-4.']])
 ],{connections:[loadSet,['CBAR','要素IDが分布荷重の適用先になります。','CBAR'],['CBEAM','梁軸と局所成分を確認します。','CBEAM']],notes:['位置と荷重の単位、基本軸か要素軸かを確認します。'],reference:'theory.html#common-loads'});
 add('PLOADB3','3節点梁の全長分布荷重','荷重','CBEAM3の全長に分布荷重を与えます。強度をA・B・Cの位置に個別に指定します。',[2634],[
  fixedRow('PLOADB3',[['SID',loadId,'62'],['EID','対象CBEAM3の要素番号。','72'],['CID','BASIC（既定）または0は基本座標。LOCAL、ELEMENT、またはユーザー座標のIDを指定できます。','BASIC'],...direction(['0.','-1.','0.']),['TYPE','FORCE、MOMENT、BIMOMENTから荷重の種類を指定します。','FORCE'],['SCALE','荷重ベクトル全体の倍率。既定値1.0。','']],'+PL3'),
  fixedRow('+PL3',['A','B','C'].map((node,i)=>['P('+node+')',`${node}位置での荷重強度。既定値0。指定した方向成分と倍率を掛けます。`,['5.','9.','7.'][i]]))
 ],{connections:[loadSet,['CBEAM3','対象の3節点梁。荷重はせん断中心線に沿います。','CBEAM3']],reference:'theory.html#common-loads'});
 add('ACCEL','位置に応じた加速度荷重','荷重','DIRで分布を見る軸を選び、LOCとVALの組を使って位置ごとの倍率を補間します。',[1126,1127],[
  fixedRow('ACCEL',[['SID',loadId,'81'],['CID','方向と位置を読む座標系。0は基本座標。','0'],...direction(['0.','0.','-1.']),['DIR','倍率が変化する座標方向。X・Y・Zから選びます。','X']],'+AC1'),
  fixedRow('+AC1',[['LOC1','DIR方向の最初の位置。','0.'],['VAL1','最初の位置での加速度ベクトルの倍率。','100.'],['LOC2','DIR方向の次の位置。','500.'],['VAL2','次の位置での倍率。','300.']])
 ],{connections:[loadSet,['GRAV','位置によらない一様加速度を与える場合に比較します。','GRAV']],notes:['位置と倍率の組を最低2組指定します。範囲外では近い端の倍率を使います。異なる荷重定義とSIDを共有せず、組み合わせるときはLOADを使います。スカラー点に置いた質量には作用しません。'],reference:'theory.html#common-loads'});
 add('ACCEL1','選択GRIDに与える加速度荷重','荷重','指定したGRIDに静的加速度を与えます。位置による倍率補間を行うACCELと使い分けます。',[1128],[
  fixedRow('ACCEL1',[['SID',loadId,'82'],['CID','加速度方向を読む座標系。空欄は0（基本座標）。','0'],['A','N1〜N3で与えるベクトルに掛ける倍率。','250.'],...direction(['0.','0.','-1.'])],'+AC2'),
  fixedRow('+AC2',[['GRIDID1','加速度を適用する最初の節点番号。継続行の第2欄から記載します。','51'],['GRIDID2','同じ加速度を与える次の節点番号。続きに他のGRID番号も記述できます。','52']])
 ],{connections:[loadSet,GRID],notes:['節点一覧にはTHRUとBYを使えます。ほかの荷重定義とはSIDを共有せず、組み合わせるときはLOADを使います。スーパーエレメントには非対応です。スカラー点の質量には作用しません。加速度を与えても対象に有効な質量がなければ、その分の慣性力は生じません。'],reference:'theory.html#common-loads'});
 add('DEFORM','棒・梁に与える初期伸び','荷重','対応する1次元要素の軸方向の伸び・縮みに相当する荷重を与えます。',[1606],[
  fixedRow('DEFORM',[['SID','変形指定セットの番号。Case ControlのDEFORMで選びます。','91'],...['1','2','3'].flatMap((n,i)=>[['EID'+n,'伸びを指定するCROD、CONROD、CTUBE、CBARまたはCBEAMの番号。',i?'':'61'],['D'+n,'指定する軸方向伸び。長さの単位で、正は伸び、負は縮みです。',i?'':'0.15']])])
 ],{connections:[['CROD','初期伸びを与えられる棒要素の例。','CROD'],['SPCD','節点の変位を規定する場合に使用。','SPCD']],notes:['周囲が変形を拘束する場合、実際の伸びは入力値と一致するとは限りません。支持反力や軸力も確認します。'],reference:'theory.html#common-loads'});
 for(const [id,load,page] of [['GRAVSET','GRAV',893],['RFORSET','RFORCE',940]]){
  add('PARAM_'+id,load+'を適用する節点範囲','荷重・拘束',load+'による荷重を、SET1で選んだ節点に限定します。',[page],[
   fixedRow('PARAM',[[id,'適用範囲を指定するパラメータ名。',id],['値','SET1の番号。既定値0では、このパラメータによる部分選択を行いません。','25']])
  ],{connections:[[load,'適用する加速度・回転荷重の定義。',load]],notes:['解析の初めに1回解釈されます。先頭SUBCASE内またはそれより前の指定がBulk Dataより優先します。2番目以降のSUBCASE内の指定で切り替える用途には使いません。'],reference:'theory.html#common-loads'});
  Object.assign(cards.at(-1),{id:'PARAM,'+id,family:'parameter'});
 }
 function caseEntry(name,title,category,summary,page,syntax,example,terms,notes,connections=[]){
  cards.push({key:'CASE_'+name,id:name,title,category,family:'case',kind:'control',location:'Case Control（CENDとBEGIN BULKの間）',
   sourceVersion:'2025.1',page,sourcePages:[page],summary,syntax,example,terms,notes,connections,reference:'theory.html#common-loads'});
 }
 caseEntry('DEFORM','要素変形セットを選ぶ','荷重・拘束','初期伸びを与えるBulk DataのDEFORMを選びます。',309,'DEFORM = SID','DEFORM = 91',
  [['SID','Bulk DataのDEFORMに書いた変形セット番号。']],
  ['対応するSOLで使います。機械荷重、熱荷重、要素変形のセット番号を区別します。'],
  [['DEFORM','伸び・縮みに相当する入力値を定義します。','DEFORM']]);
 caseEntry('SUBCOM','解いたケースを合成するための区切り','サブケース','前に定義されたSUBCASEを組み合わせるケースを始めます。',659,'SUBCOM = n','SUBCOM = 30',
  [['n','2より大きい整数で、それまでに出現したすべてのケース番号より大きい値。']],
  ['次にSUBSEQで係数を指定します。熱荷重や要素変形を含む場合は、合成ケースに対応する温度場またはDEFORMの指定が必要です。'],
  [['SUBSEQ','直前のSUBCASEを合成する係数。','CASE_SUBSEQ']]);
 caseEntry('SUBSEQ','結果を重ね合わせる係数','サブケース','SUBCOMの直後で、直前のSUBCASEを組み合わせる係数を指定します。',661,'SUBSEQ = R1 [, R2, …, Rn]','SUBSEQ = 0.5, -1.0',
  [['R1〜Rn','直前のn個のSUBCASEに対する実数の倍率です。最後のRnは最も近いSUBCASEに掛かります。最大200個です。']],
  ['SUBCOMに続けます。SOL 101・144、またはSOL 200のANALYSIS=STATICS／SAEROが対象です。合成前後で比較する出力成分・座標・単位を揃えます。'],
  [['SUBCOM','結果の合成ケースを始める指定。','CASE_SUBCOM']]);
 caseEntry('BENDL','梁端荷重・パネルのせん断流を要求','結果出力','対応する桁・パネル構造で端部荷重とせん断流を求めます。',291,'BENDL [(PRINT = YES | NO)] = ALL | n | NONE','BENDL(PRINT=YES) = ALL',
  [['PRINT','YESでF06に出力。NOが既定です。'],['ALL','パネルに関連する対象の梁・棒をすべて選びます。'],['n','対象要素をまとめたCase ControlのSET番号。'],['NONE','そのSUBCASEでBENDLを無効にします。']],
  ['SOL 101またはANALYSIS=STATICが対象です。BENDLは入力する荷重ではなく、端部荷重などの計算・出力を選ぶ指定です。']);
 caseEntry('FBODYLD','自由体荷重を出力する対象を選ぶ','結果出力','部分モデルに受け渡す自由体荷重を、指定した領域ごとに作ります。',405,'FBODYLD [(LID)] = ALL | name1 [, name2, …]','FBODYLD(90) = PATCHLD',
  [['LID','出力の荷重ID。省略時はSUBCASEの番号。'],['ALL','定義済みの全FBODYLDを対象にします。'],['namei','対象を定義するBulk DataのFBODYLDの名前。']],
  ['複数の領域には個別の荷重が作られます。受け渡し先で座標、切断面、合力・モーメントを確認します。']);
 window.InputCatalog.entries.push(...cards);
})();
