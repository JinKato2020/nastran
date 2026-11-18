(() => {
 'use strict';
 const C=window.AnalysisEigenCore,L=window.AnalysisEigenLabs,A=window.LessonArticle,S=window.AnalysisScenarios,G=window.AnalysisModelGuides,Q=window.AnalysisModelQuizzes;
 const n=v=>Number(v.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:8});
 const p=t=>'<p>'+t+'</p>',f=t=>'<p class="element-formula">'+t+'</p>',table=(h,r)=>A.table(h,r);
 const source=(name,page,label)=>({url:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_'+name+'/raw/resource/enus/MSC_Nastran_2025.1_'+name+'.pdf#page='+page,label:'MSC 2025.1 '+label+'（PDF '+page+'）'});
 const sources=[source('Dynamic_Analysis_User_Guide',72,'動解析ガイド・予荷重からの実固有値'),source('Quick_Reference_Guide',644,'QRG・STATSUB')];
 const pre=S['prestressed-modes'];
 const preInfo={
  'pre-none':{title:'予荷重なし：比較の基準',point:'同じ両端ピン梁の無荷重状態を基準にします。片持ち梁の38 Hzを、この支持の正解値として使いません。',action:'G1は1234、G13は23を拘束。軸方向に移動できる右端と、両端の曲げ回転5・6を残します。',mistake:['片持ち梁の結果と比較した','支持条件が違います。この梁の弱軸1次は約106.9 Hz。質量やEを調整して38 Hzへ合わせてはいけません。']},
  'pre-tension':{title:'引張：横方向の剛性が増す',point:'材料のEを変えずに、引張軸力による幾何剛性を加えます。質量増加による振動数変化と区別します。',action:'右端G13を軸方向に動ける状態にし、+Xへ1727 N。静解析の軸力が正、左端の反力が−1727 Nであることを先に確認します。',mistake:['Eを1.5倍にして予荷重を代用した','同じE・質量のまま幾何剛性が変化する問題です。Eの変更は高次モードまで一律に変え、予荷重とは異なる結果になります。']},
  'pre-compression':{title:'圧縮：振動数が下がる',point:'圧縮は横方向の復元力を減らします。負の軸力と、まだ正である実固有値λ=ω²を区別します。',action:'右端G13へ−X方向に1727 N。成分1は自由にし、静解析の軸力−1727 Nを確認してから固有値を読みます。',mistake:['圧縮なので固有値も負が正しいと思った','安定な圧縮状態ではλは正です。理論上の1次λが0になるのが臨界点で、その先の負値は周期振動の周波数には変換できません。']},
  'pre-critical':{title:'座屈直前：圧縮0.9 Pcr',point:'荷重が臨界値に近づくと1次が強く低下します。高次が正でも、最も柔らかい方向の安定性を別に確認します。',action:'右端に−0.9 Pcr ≈ −3108.93 N。支持・質量・断面は維持。完全な直線梁・線形弾性の理論比較であり、初期不整や塑性を含む耐力の予測ではありません。',mistake:['振動数から実構造の座屈余裕が正確に分かると思った','この式は一様梁、既知の支持と軸力、小変形の条件付きです。初期不整、接触、残留応力、塑性がある実構造の安全率へ、そのまま換算できません。']},
  'pre-blocked':{title:'誤設定：荷重点の軸方向を拘束',point:'入力に荷重が存在しても、部材へ軸力が入るとは限りません。同じ節点の拘束反力が荷重を受け持つ例です。',action:'G13の拘束を23から123へ変えた診断例。G13へ−1727 Nを加えると、そのT1反力が+1727 Nとなり、梁内部の軸力は0です。',mistake:['反力が1727 Nだから予荷重は正しいと判断した','反力の合計だけでは荷重経路を確認できません。FORCEの軸力、DISPLACEMENTの軸方向変位、SPCFORCESの発生節点を組にして確認します。']}
 };
 for(const id of ['pre-critical','pre-blocked'])pre.models.push({id,title:preInfo[id].title,diagram:id,theoretical:true});
 for(const model of pre.models){
  const id=model.id,info=preInfo[id],d=C.prestress(id),none=id==='pre-none',blocked=id==='pre-blocked';
  model.title=info.title;model.takeaway=info.point;
  model.diagramCaption='Xは梁の長手方向、曲げはZ方向。左端G1は1234、右端G13は23を拘束し、曲げ回転5・6は自由です。φ₁は表示用の1次形で実振幅ではありません。'+(blocked?'この診断例だけ右端T1も拘束します。':'右のピン支持は軸方向に移動できます。');
  model.conditions=[['共通の形状・材料','L=360 mm、断面36×6 mm、E=70,000 MPa、ν=0.33、ρ=2.70×10⁻⁹ tonne/mm³。弱軸I=648 mm⁴。N・mm・s・tonneで統一します。'],['支持と軸力',info.action],['観測するモード','Z方向の1次半波を基準にします。2次は1つ、3次は2つの内部節を持ちます。弱軸n次と、全方向を混ぜた表のn番目の行は同じとは限りません。'],['比較の範囲','Euler–Bernoulli梁の一般理論。微小振動・一様な軸力を仮定し、減衰、せん断変形、回転慣性、初期不整・塑性は理論値に含めません。']];
  model.results=[none?'この基準では予荷重の静解析ケースを設けません。GPWGで質量を、モード形で支持条件を確認します。':'最初に静解析の部材軸力N='+n(d.N)+' Nを確認します。入力した荷重の値だけで代用しません。','弱軸1次の理論値f₁='+n(d.f)+' Hz、λ₁='+n(d.lambda)+' s⁻²。F06のCYCLESとEIGENVALUEを取り違えないようにします。','モードの向き・節の数・支持位置を見て対応づけます。振動数だけが近い別方向のモードを比較しません。'];
  model.check=[['CASE_STATSUB','予荷重を求めたSUBCASE'],['CASE_METHOD','実固有値の抽出条件'],['EIGRL','周波数範囲と個数'],['CASE_FORCE','静解析の軸力'],['CASE_DISPLACEMENT','静的変位・モード形'],['CASE_SPCFORCES','荷重を受け持つ支持点']];
  G[id]={items:[info.point,info.action,'同じ支持・材料・質量のまま、部材の軸力と対応するモードを比較します。'],
   explanation:()=>p(info.point)+p('静解析で求めた軸力Nから、横たわみに対する幾何剛性K_Gを作ります。弾性剛性Kに加えた状態で、小さな振動を調べます。')+
    f('(K + K_G(N))φ = λMφ、λ = ω²、f = ω/(2π)')+
    p('この一様な両端ピン梁では、横変位をw(x,t)=φ(x)q(t)、φ(x)=sin(nπx/L)とおけます。Nを引張正とすると、梁の運動方程式は次の形です。')+
    f('EI ∂⁴w/∂x⁴ − N ∂²w/∂x² + ρA ∂²w/∂t² = 0')+
    p('φ″=−(nπ/L)²φ、φ⁗=(nπ/L)⁴φ、q̈=−ω²qを代入し、共通のφqを除きます。')+
    f('EI(nπ/L)⁴ + N(nπ/L)² − ρAω² = 0')+
    f('ωₙ² = [EI(nπ/L)⁴ + N(nπ/L)²]/(ρA)')+
    p('無荷重のωₙ₀²=EI(nπ/L)⁴/(ρA)で割り、Pcr=π²EI/L²と置くと、各次数の違いが見えます。')+
    f('fₙ/fₙ₀ = √[1 + N/(n²Pcr)]、Pcr = '+n(C.Pcr)+' N')+
    p('引張正・圧縮負の符号を式に1回だけ入れます。圧縮の大きさPを正で使う表記なら、N=−Pに置き換えます。1次が0へ近づいても、2次はn²=4、3次は9なので低下率は異なります。')+
    L.render(id,'pre'),
   inputReview:[
    ['Executive / Case Control',[['EXEC_SOL_103','同じSOL 103内で、必要な静解析と予荷重を考慮した実固有値を定義します。先に別実行のSOL 101を作る必要がある、という意味ではありません。'],['EXEC_CEND','Executive Controlの終端。'],['CASE_SUBCASE',none?'基準では固有値用のSUBCASEを定義します。':'静解析SUBCASE 1を先、固有値SUBCASE 2を後に置きます。METHODを全体指定して静解析ケースへ継承させないようにします。'],['CASE_SPC','比較する支持セット10を選択。予荷重を作る支持と振動時の支持を区別し、この比較では同じ支持を使います。'],...(!none?[['CASE_LOAD','静解析ケースでLOAD=40。固有値の振幅を決めるための外力ではありません。'],['CASE_STATSUB','固有値ケースでSTATSUB(PRELOAD)=1。参照するのは先行する静解析SUBCASE 1であり、荷重SID 40ではありません。動解析ではPRELOADが既定です。']]:[]),['CASE_METHOD','固有値ケースのMETHOD=30からEIGRL SID 30を選択。STATSUBと同じ固有値ケースに置きます。']]],
    ['Bulk Data',[['GRID','G1〜G13の位置と変位座標CDを確認。ここでは基本座標にそろえ、成分1=X、3=Zと読みます。'],['CBEAM','中心線12要素で断面特性を参照。向きベクトルで弱軸の曲げ方向が変わらないことを確認します。'],['PBEAM','A=216、I1=648、I2=23,328 mm⁴。軸力と曲げ方向の対応を保ちます。'],['MAT1','E・νと密度ρを与えます。静解析で密度が不要でも、実固有値には質量が必要です。'],['SPC1',info.action],...(!none?[['FORCE','静解析で選んだSID=40、G13、CID=0。Fと方向成分の積が実際の力なので、圧縮の負号を二重に入れません。'],['LOAD','複数の荷重セットを合成する場合に使用します。今回の単一FORCEセットを選択するだけなら必須ではありません。']]:[]),['EIGRL','SID=30、ND=6を既存の基準にします。NDは個数、V1・V2は振動数範囲です。正のV1で低い根を除外すると、0や負のλの兆候を見落とす場合があります。']]],
    ['PARAMと出力',[['PARAM_COUPMASS','既存比較の連成質量指定1を全ケースでそろえます。質量定式化を変更した差を予荷重の効果へ混ぜません。'],['PARAM_GRDPNT','0で基本原点を基準とする質量特性を確認。予荷重が変わっても材料・形状が同じなら、この比較の総質量は同じです。'],['PARAM_POST','ポスト処理用の出力設定。予荷重の引継ぎや固有値抽出を有効にするスイッチではありません。'],['CASE_FORCE',none?'基準では予荷重の静的軸力はありません。規格化モードの要素力を、予荷重と読み替えないでください。':'静解析のCBEAM軸力を確認。振動の規格化モード力と混同しません。'],['CASE_SPCFORCES',none?'必要に応じモードの拘束反力を出力できますが、外荷重とつり合う静的反力ではありません。':'静解析で反力の発生位置と符号を調べます。'],['CASE_DISPLACEMENT','静解析では実変位、固有値ケースでは任意に規格化したモード形です。'],['CASE_STRESS','必要なら静解析の軸応力N/Aを確認。塑性域へ入っていれば、この線形弾性比較の適用範囲を外れます。']]]
   ],
   verify:['無荷重・同じ支持のSOL 103で質量とモード形を確認します。',none?'GPWGの総質量0.000209952 tonneと、両端の横変位0・曲げ回転自由を確認します。':'予荷重ケースのLOAD・FORCE・SPCと、部材軸力・支持反力を照合します。',none?'METHOD=30からEIGRLをたどり、予荷重なしの基準ではSTATSUBを指定しません。':'固有値ケースのSTATSUBが参照するSUBCASEを入力エコーでたどります。','REAL EIGENVALUESのλ・RADIANS・CYCLESを関係式で照合し、モード方向・節を確認します。','無荷重からの比と弱軸の1〜3次を比較。近接根は番号だけで追わず、必要ならモード相関も使います。'],
   resultExtra:()=>table(['弱軸次数','無荷重 fₙ₀（Hz）','選択条件 fₙ（Hz）','比'],[1,2,3].map(j=>{const a=C.prestress(id,j);return[j,n(a.f0),n(a.f),n(a.f/a.f0)];}))+p('表は一般理論による値です。梁要素の質量・せん断・回転慣性の定式化や分割数による差を、ただちに入力ミスと判断しません。メッシュと設定をそろえて収束を確認します。'),
   pitfalls:[info.mistake,['STATSUBを入れたのに変化しない','参照先だけでなく、参照した静解析に実際の軸力が生じているか、荷重・拘束・出力ケースを確認します。'],['負の固有値を絶対値にしてHzへ換算した','λ<0はこの保守的な線形化問題で安定な周期振動を表しません。圧縮の臨界超過だけでなく拘束不足やモデルの異常も点検します。'],['固有値モードの変位量を実変位と読んだ','モードの規格化は表示尺度です。予荷重による静的変位は先行する静解析ケースで読みます。'],['接触・塑性・大変形でも同じ手順で十分とした','線形静解析の小変形周りの比較です。接触状態や材料接線剛性が変わる問題は、対応する非線形平衡状態と線形摂動の製品別手順を確認します。']]
  };
 }
 pre.summary='予荷重の荷重経路と、その状態での微小振動を分けて確認します。';
 pre.shared='同じ両端ピン梁で、無荷重・引張・圧縮・座屈直前を比較。最後の1例だけ荷重点T1を拘束した誤設定です。数値は一般理論値で、MSC実行結果ではありません。';
 pre.columns=['比較','部材軸力N（N）','弱軸1次（Hz）'];
 pre.rows=pre.models.map(m=>{const d=C.prestress(m.id);return[m.title,n(d.N),n(d.f)];});
 pre.compare='入力した荷重、部材に生じた軸力、固有値の3段階を照合します。右端の軸方向拘束は荷重経路を変えますが、この一様梁の横曲げ支持は同じです。';
 pre.sources=sources;
 // New comparisons reuse established card-map components; no new input deck is authored.
 for(const id of ['pre-critical','pre-blocked']){
  const map=JSON.parse(JSON.stringify(window.AnalysisRelationMaps['pre-compression']));
  for(const panel of map.panels)for(const node of panel.nodes){
   if(node.card==='FORCE'&&id==='pre-critical')node.detail=node.detail.replace('1727','3108.93');
   if(node.card==='SPC1'&&id==='pre-blocked')node.detail='SID=10 / G1:1234 / G13:123';
  }
  map.scope='理論比較用のカード構成です。番号は既存の参照体系と対応し、実行済みの入力ファイルを示すものではありません。';
  window.AnalysisRelationMaps[id]=map;window.AnalysisScenarioRelationKeys.push(id);
 }
 const pg=window.AnalysisScenarioGuides['prestressed-modes'];
 pg.basics=[
  ['この解析で分かること',['予荷重の静的な荷重経路、固有値への引継ぎ、振動数変化を順に確認します。','引張・圧縮の符号と、固有値λ=ω²の符号を区別します。','支持の誤設定・根の見落としを結果から診断します。']],
  ['線形化する状態',['線形静解析の平衡状態から差分剛性を作り、その周りの微小振動を求めます。','一般には幾何剛性や追従荷重の剛性が関わります。この教材は小変形の一様軸力梁に範囲を絞ります。']],
  ['比較をそろえる',['形状・材料・質量・支持を固定し、軸力だけを変えます。誤設定例は荷重経路の診断として分けます。','一様な両端ピン梁の式を、接触や塑性を伴う一般構造の安全率へ直接使いません。']]
 ];
 pg.terms=[['予荷重','振動を調べる前の静的な荷重と平衡状態。'],['差分剛性','基準応力などによる微小変位への復元力の変化。'],['STATSUB','先行する静解析SUBCASEの参照。'],['λとf','λ=ω²、f=ω/(2π)。安定な振動ではλ>0。']];
 pg.steps=['同じ支持の無荷重固有値を確認する。','静解析ケースで荷重・反力・部材軸力を確認する。','固有値ケースでSTATSUBとMETHODを対応させる。','同じ方向・節のモードを比較し、低い根と符号を確認する。'];
 const check=(label,expect,diag=[])=>({label,expect,diag:[[1,'条件をそろえた理論値・指定値と一致します。出力ケースと単位も確認します。'],...diag]});
 const question=(title,code,ask,options,answer,steps,label,value,note='一般理論・入力の役割を確かめる問題です。MSC Nastranの実行確認値ではありません。')=>({title,code,ask,options,answer,verify:{title,steps,note,check:check(label,value)}});
 Q['prestressed-modes']={};
 for(const m of pre.models){
  const id=m.id,d=C.prestress(id),blocked=id==='pre-blocked',none=id==='pre-none';
  const qs=[
   question('荷重点の軸方向を確認する','SPC1：G13のC',blocked?'G13に−1727 Nを加え、G13を123で拘束。梁へ圧縮が入らない理由は？':'右端の横変位を止め、軸方向の荷重を梁へ伝える指定は？',[[blocked?'同じ節点のT1拘束が荷重を受け持つ':'C=23','右端の横支持と軸方向の自由度を分けます。'],['C=123なら常に正しい','軸方向も止めるため、同じ節点の軸方向荷重は反力へ流れます。'],['PA=56だけで接地支持できる','端部解放は地面への支持ではありません。'],['荷重があれば拘束に無関係に軸力が生じる','拘束と荷重の位置によって、部材へ伝わる力が変わります。']],0,[preInfo[id].action,'部材の軸力と、どの節点の反力が荷重を受け持つかを確認します。'],'静解析の梁軸力（N）',d.N),
   question(none?'振動数と固有値を区別する':'予荷重の参照番号','SUBCASE 1：LOAD=40 / SUBCASE 2：METHOD=30',none?'REAL EIGENVALUESのCYCLESからλを求める式は？':'固有値ケースのSTATSUB(PRELOAD)の右辺は？',none?[[ 'λ=f','Hzとs⁻²を混同しています。'],['λ=(2πf)²','RADIANS=2πf、その2乗がλです。'],['λ=2πf','これは角振動数です。'],['λ=f²','2πの換算が不足しています。']]:[['40','荷重セットのSIDです。'],['1','先行する静解析SUBCASE番号です。'],['30','EIGRLのSIDです。'],['103','SOL番号です。']],1,none?['f='+n(d.f)+' Hz。ω=2πf、λ=ω²を順に計算します。']:['STATSUB=1 → SUBCASE 1 → LOAD=40。METHOD=30 → EIGRL SID30。','静解析ケースへMETHODを継承させないことも確認します。'],none?'1次EIGENVALUE（s⁻²）':'入力エコーのSTATSUB参照番号',none?d.lambda:1),
   question('1次の変化を読む','f₁/f₁₀ = √(1 + N/Pcr)','選択した条件の弱軸1次を比較する方法は？',[['入力荷重を常にNへ代入する','部材に入った軸力を先に確認します。'],['Eを荷重に比例して変更する','応力剛性と材料剛性は別です。'],['部材軸力と支持を確認し、同じモード形でCYCLESを比較する','誤設定では入力荷重と部材軸力が一致しません。'],['λが負でも絶対値にしてHzへ換算する','安定な周期振動の根として扱えません。']],2,['N='+n(d.N)+' N、Pcr='+n(C.Pcr)+' N。','基準f₁₀='+n(d.f0)+' Hz。比の式よりf₁='+n(d.f)+' Hz。'],'弱軸1次のCYCLES（Hz）',d.f),
   question('2次も同じ割合か','fₙ/fₙ₀ = √(1 + N/(n²Pcr))','同じ軸力で弱軸2次を比較するときの分母は？',[['Pcr','1次の式をそのまま使っています。'],['2 Pcr','次数ではなく次数の2乗が入ります。'],['9 Pcr','3次に対応します。'],['4 Pcr','n=2を2乗します。同じ軸力の相対的な影響は小さくなります。']],3,['弱軸2次は中央に節を持ち、1次の4倍が無荷重の振動数です。','選択条件ではf₂='+n(C.prestress(id,2).f)+' Hz。全方向を混ぜた表の2行目と決めつけません。'],'弱軸2次のCYCLES（Hz）',C.prestress(id,2).f)
  ];
  if(none){qs[0].verify.steps=['SPC1の23は右端のT2とT3を止めます。T1と曲げ回転5・6は自由です。','DISPLACEMENTでG13のT3が0であることを確認します。'];qs[0].verify.check.label='G13のT3（規格化モード）';}
  Q['prestressed-modes'][id]={intro:m.title+'：荷重経路・参照先・根の読み方・高次モードの4問。',links:[['bulk.html#CASE_STATSUB','STATSUB'],['bulk.html#SPC1','SPC1'],['bulk.html#EIGRL','EIGRL']],questions:qs};
 }
 window.AnalysisEigenLessonHelpers={n,p,f,table,source,check,question};
})();
