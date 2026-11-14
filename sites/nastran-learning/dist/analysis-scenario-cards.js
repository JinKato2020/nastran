/* Model-specific explanations grouped by the role of each input. */
(() => {
 'use strict';
 const structure={
  beam:[['CBEAM','中心線の隣り合う節点を接続します。GAからGBを+X、方向ベクトルを+Zとし、面1の曲げが荷重方向に対応します。PID 20からPBEAMを参照します。'],['PBEAM','断面積216 mm²、面1のI1=648 mm⁴、面2のI2=23,328 mm⁴を指定します。継続行で四隅の応力回復点を定義し、端BはYESAで端Aの位置を用います。ねじり定数Jには矩形断面の近似値2,318 mm⁴を指定します。']],
  shell:[['CQUAD4','中立面の4節点を接続します。+Zから見て反時計回りとし、表裏の基準をそろえます。先端中央の観測節点は63です。'],['PSHELL','板厚6 mm、膜・曲げ・横せん断の材料を同一のMAT1で指定します。']],
  solid:[['CHEXA','8節点を接続します。先頭行はG1〜G6、継続行はG7・G8です。'],['PSOLID','六面体で使う材料をMAT1に結び付けます。']],
 };
 function control(sol){
  return [['EXEC_SOL_'+sol,{101:'線形静解析を選びます。',103:'無減衰の実固有値を求めます。',107:'物理自由度で複素固有値を求めます。',110:'実モードの基底へ縮約してから複素固有値を求めます。'}[sol]],
   ['EXEC_CEND','Executive Controlを終了します。'],['CASE_TITLE','F06でモデルを識別する表題です。'],
   ['CASE_ECHO','NONEで入力一覧の再出力を抑えます。'],['CASE_SUBCASE','この例の拘束、荷重または抽出条件、出力要求を1つの計算ケースにまとめます。'],
   ['CASE_BEGIN_BULK','この行から節点・要素・物性などのBulk Dataを読みます。']];
 }
 function beamCards(kind){
  const grid=kind==='solid'?'節点の座標を定義し、PS欄の456でソリッドが使わない回転自由度を拘束します。先端中央の観測節点は368です。':'節点の座標をN・mm・s・tonne系で定義します。';
  return [['GRID',grid],...structure[kind],['MAT1','線形等方弾性。E=70,000 MPa、ν=0.33、質量密度2.70×10⁻⁹ tonne/mm³。空欄のGはEとνから求めます。']];
 }
 function support(components){
  return [['CASE_SPC','拘束セット10を選択します。'],['SPC1',components+'をセット10でゼロにします。']];
 }
 const end=[['ENDDATA','Bulk Dataを終了します。']];
 const modalParams=[['PARAM_COUPMASS','梁に連成質量行列を使用します。'],['PARAM_GRDPNT','基本座標系の原点を基準に、モデル全体の質量等を確認します。']];
 const realMethod=[['CASE_METHOD','実固有値抽出セット30を選択します。'],['EIGRL','Lanczos法で低次12モードを要求します。SOL 110では、この実モードが縮約に使われます。']];
 const solNotes={105:'線形座屈解析。静解析の結果から座屈固有値を求めます。',108:'直接法の周波数応答。物理自由度で各周波数の応答を解きます。',109:'直接法の過渡応答。物理自由度で時刻歴を積分します。',111:'モード法の周波数応答。実モードの基底へ縮約して解きます。',112:'モード法の過渡応答。実モードの基底へ縮約して時刻歴を解きます。',153:'定常の熱伝導解析を選びます。'};
 const head=(sol,subcase)=>[['EXEC_SOL_'+sol,solNotes[sol]],['EXEC_CEND','Executive Controlを終了します。'],['CASE_TITLE','F06でモデルを識別する表題です。'],['CASE_ECHO','NONEで入力一覧の再出力を抑えます。'],['CASE_SUBCASE',subcase],['CASE_BEGIN_BULK','この行から節点・要素・物性などのBulk Dataを読みます。']];
 const dynamicBeam=[...beamCards('beam'),['PARAM_COUPMASS','梁に連成質量行列を使用します。']];
 const fixedRoot=support('根元節点の並進・回転123456');
 const reduction=count=>[['CASE_METHOD','実固有値抽出セット30を選択します。'],['EIGRL','Lanczos法で低次'+count+'モードを求め、縮約の基底にします。']];
 const extended={
  heat(model){
   const convection=model.id==='heat-convection';
   return [['解析の指定',[...head(153,'拘束（温度の指定）、初期温度、反復条件、出力要求を1つの計算ケースにまとめます。'),['CASE_ANALYSIS','HEATを指定し、このケースを熱伝導として解きます。']]],
    ['節点・要素・物性',[['GRID','節点の座標を定義します。熱解析では各節点の未知量は温度1つです。'],['CQUAD4','板の中立面を四辺形要素で表します。伝導の要素として働きます。'],['PSHELL','板厚6 mmを与え、材料番号70を参照します。熱解析では同じ番号のMAT4が使われます。'],['MAT4',convection?'熱伝導率167 mW/(mm·K)と、対流の熱伝達係数0.02 mW/(mm²·K)を定義します。':'熱伝導率167 mW/(mm·K)を定義します。定常解析のため、比熱と密度は使いません。']]],
    ['温度の指定',[['CASE_SPC','拘束セット10を選択します。熱解析では、温度の指定に使います。'],['SPC','左端辺の節点に100 ℃、右端辺の節点に20 ℃を指定します。成分は1です。'+(convection?'周囲温度のスカラー点にも20 ℃を指定します。':'')]]],
    ...(convection?[['対流の境界条件',[['CHBDYG','伝導要素の表と裏に、熱の出入りを受け持つ面要素を定義します。種類はAREA4で、継続行に4節点を並べます。裏面は節点の順序を逆にします。'],['CONV','面要素に対流を割り当てます。PCONVの番号と、周囲温度を表す点99を指定します。'],['PCONV','対流の特性です。熱伝達係数を持つMAT4を参照します。温度依存の指数は0とします。'],['SPOINT','周囲温度を表すスカラー点99を定義します。']]]]:[]),
    ['解法の条件',[['CASE_TEMPERATURE','TEMPERATURE(INITIAL)で、反復の初期温度のセット90を選択します。'],['TEMPD','指定のない節点の初期温度を20 ℃にします。'],['CASE_NLPARM','反復条件のセット95を選択します。'],['NLPARM','反復の制御条件です。この例は線形の問題で、既定値を使います。']]],
    ['出力',[['CASE_THERMAL','節点の温度を出力します。'],['CASE_FLUX','要素の温度勾配と熱流束を出力します。'],['CASE_SPCFORCES','温度を指定した点の熱流量を出力します。入熱と出熱の照合に使います。']]],
    ['入力の終端',end]];
  },
  frequency(model,sol){
   const modal=sol===111, coarse=model.id==='dfreq-coarse';
   return [['解析の指定',head(sol,'拘束、加振、周波数、出力要求を1つの計算ケースにまとめます。')],
    ['節点・要素・物性',dynamicBeam],['支持条件',fixedRoot],
    ['加振と減衰',[['CASE_DLOAD','動的荷重セット50を選択します。'],['RLOAD1','周波数に依存する荷重です。加振位置のセット51と、振幅の表52を参照します。'],['DAREA','先端節点13の成分3に、基準の大きさ1 Nを与えます。'],['TABLED1','周波数に対する振幅の倍率です。0〜1000 Hzで一定の1とします。継続行の最後にENDTを置きます。'],['PARAM_G','全体の構造減衰係数0.04を与えます。']]],
    ...(modal?[['モードによる縮約',[...reduction(model.id==='mfreq-one'?1:6),['CASE_RESVEC','NOで残余ベクトルを使いません。モードの打切りの影響を確認するための設定です。']]]]:[]),
    ['周波数',[['CASE_FREQUENCY','周波数セット60を選択します。'],['FREQ1',coarse?'開始11 Hz、刻み2 Hz、刻み数30で、11〜71 Hzの31点を計算します。':'開始10 Hz、刻み0.5 Hz、刻み数120で、10〜70 Hzの121点を計算します。']]],
    ['出力',[['CASE_DISPLACEMENT','SORT2で節点ごとに周波数の順へ並べ、PHASEで振幅と位相を出力します。']]],
    ['入力の終端',end]];
  },
  transient(model){
   const modal=model.sol===112, short=model.id==='trans-short';
   return [['解析の指定',head(model.sol,'拘束、荷重、時間刻み、出力要求を1つの計算ケースにまとめます。')],
    ['節点・要素・物性',dynamicBeam],['支持条件',fixedRoot],
    ['荷重と減衰',[['CASE_DLOAD','動的荷重セット50を選択します。'],['TLOAD1','時間に依存する荷重です。作用位置のセット51と、時間関数の表52を参照します。'],['DAREA','先端節点13の成分3に、基準の大きさ−18 Nを与えます。'],['TABLED1','時間に対する倍率です。時刻0から'+(short?'0.005':'0.05')+' sまで1、その後は0とします。同じ時刻を2回並べて、不連続な変化を表します。'],['PARAM_G','全体の構造減衰係数0.04を与えます。'],['PARAM_W3','構造減衰を等価な粘性減衰へ換算する角振動数です。第1曲げの239.3 rad/sを指定します。']]],
    ...(modal?[['モードによる縮約',reduction(6)]]:[]),
    ['時間刻み',[['CASE_TSTEP','時間刻みのセット60を選択します。'],['TSTEP','刻み数400、刻み0.0005 s、出力間隔1で、0.2 sまで計算します。']]],
    ['出力',[['CASE_DISPLACEMENT','SORT2で節点ごとに時刻の順へ並べて出力します。']]],
    ['入力の終端',end]];
  },
  buckling(model){
   const supportText={'buck-cantilever':'根元節点の全成分123456','buck-pinned':'根元節点の1234と、荷重側節点の23','buck-fixed':'根元節点の123456と、荷重側節点の23456'}[model.id];
   return [['解析の指定',head(105,'SUBCASE 1は静解析、SUBCASE 2は座屈固有値の抽出です。両方で同じ拘束セットを選びます。')],
    ['節点・要素・物性',beamCards('beam')],['支持条件',support(supportText)],
    ['荷重',[['CASE_LOAD','SUBCASE 1で荷重セット40を選択します。'],['FORCE','荷重側の節点13に、−X方向へ1 Nの圧縮を与えます。単位荷重なので、固有値が座屈荷重になります。']]],
    ['固有値の抽出',[['CASE_METHOD','SUBCASE 2で固有値抽出セット30を選択します。'],['EIGRL','小さい方から3つの座屈固有値を求めます。']]],
    ['出力',[['CASE_DISPLACEMENT','SUBCASE 1では静的な変位、SUBCASE 2では座屈形を出力します。']]],
    ['入力の終端',end]];
  },
 };
 function generated(key,model){
  if(key==='heat')return extended.heat(model);
  if(key==='direct-frequency')return extended.frequency(model,108);
  if(key==='modal-frequency')return extended.frequency(model,111);
  if(key==='transient')return extended.transient(model);
  if(key==='buckling')return extended.buckling(model);
  const id=model.id, staticModel=key==='static', modal=key==='modes';
  const sol=staticModel?101:modal?103:model.sol;
  const damped=model.damped, sol110=sol===110;
  const supportText=id==='solid'?'固定端面の並進123':id==='shell'?'固定端辺の並進・回転123456':id==='both-fixed'?'両端節点の並進・回転123456':'根元節点の並進・回転123456';
  const groups=[['解析の指定',control(sol)],['節点・要素・物性',beamCards(staticModel?id:'beam')],['支持条件',support(supportText)]];
  if(staticModel){
   groups.push(['荷重',[
    ['CASE_LOAD','荷重セット40を選択します。'],
    ['FORCE',id==='beam'?'自由端節点に−Z方向へ18 Nを与えます。':'自由端の節点へ、分担する幅・面積に応じて−Z方向の節点力を配り、合計を18 Nにします。']
   ]],['出力',[
    ['CASE_DISPLACEMENT','荷重方向の変位T3を読みます。'],
    ['CASE_SPCFORCES','固定部の節点反力を出力します。'],
    ['CASE_FORCE','要素力・断面力を要求します。梁では根元の曲げモーメントを確認します。対応する要素力の種類は要素によって異なります。'],
    ['CASE_STRESS','応力を出力します。梁の回復点、シェルの表裏、ソリッドの応力成分を区別します。']
   ]]);
  }else{
   groups.push(['質量と減衰',[...modalParams,...(id==='tip-mass'?[['CONM2','自由端節点に0.08 kgの集中質量を加えます。偏心・回転慣性は省略します。']]:[]),
    ...(damped?[['CDAMP1','自由端節点の成分3と固定側（グラウンド）を接続します。'],['PDAMP','粘性係数0.055 N·s/mmを定義します。']]:[])]]);
   groups.push(['固有値の抽出',modal?realMethod:[
    ...(sol110?realMethod:[]),['CASE_CMETHOD','複素固有値抽出セット50を選択します。'],['EIGC','小規模モデルの比較用にHESS・MAXを指定し、基本行のND0で8根を要求します。']]]);
   groups.push(['出力',[['CASE_DISPLACEMENT',modal?'規格化された実モード形を出力します。':'複素モード形を出力します。位相は同じ根の成分間で比較します。']]]);
  }
  return [...groups,['入力の終端',end]];
 }
 const base = 'https://documentation-be.hexagon.com/bundle/';
 function guide(book,page){
  const name='MSC_Nastran_2025.1_'+book;
  return base+name+'/raw/resource/enus/'+name+'.pdf#page='+page;
 }
 const official={
  static:{
   title:'直線片持ち梁の要素比較',
   reference:['Verification Guide · PDF 17–20','Verification_Guide',17],
   intro:'矩形片持ち梁で要素の種類や形状による先端変位の違いを確かめる検証例です。PDF掲載の要素比較を読むための主要カードを示します。',
   groups:[
    ['解析・支持・荷重',[['EXEC_SOL_101','線形静解析で、各荷重方向の先端変位を評価します。'],['GRID','要素の頂点や中間点を定義します。'],['CASE_SPC','固定端の拘束セットを選びます。'],['SPC1','固定する節点と成分をまとめるカードです。実際の拘束の記述は資料・使用デッキで確認します。'],['CASE_LOAD','比較する荷重ケースを選ぶ指令です。'],['FORCE','先端に集中力を与える代表カードです。']]],
    ['要素と物性',[['CHEXA','8節点・20節点の六面体を比較します。'],['CPENTA','くさび形の固体要素です。'],['PSOLID','固体要素と材料を結び付けます。'],['CQUAD4','4節点の四辺形シェルです。'],['CQUAD8','辺の中間節点を含む四辺形シェルです。'],['CQUADR','四辺形シェルの比較対象です。'],['CTRIAR','三角形シェルの比較対象です。'],['PSHELL','シェルの厚さと膜・曲げなどの物性を指定します。'],['MAT1','比較するモデルの線形等方弾性を定義します。']]],
    ['確認する出力',[['CASE_DISPLACEMENT','荷重方向の先端変位を確認し、解析解と比較します。']]],
   ]},
  modes:{
   title:'ばね・質量の2自由度モデル',
   reference:['Dynamic Analysis User’s Guide · Listing 3-5 · PDF 77–78','Dynamic_Analysis_User_Guide',77],
   intro:'2つの質量が連成する例です。実固有値と、各モードで2点がどの方向に動くかを確認します。',
   groups:[
    ['解析・モデル',[['EXEC_SOL_103','実固有値を求めます。'],['CASE_TITLE','解析結果の表題を設定します。'],['GRID','ばねと質量の接続点を定義します。対象成分はCELAS2の端部で選びます。'],['CONM2','2点に異なる集中質量を与えます。'],['CELAS2','節点間の特定方向にばね剛性を与えます。'],['CASE_SPC','このモデルで使う拘束セットを選びます。'],['SPC','ばねの端に当たる節点の対象成分を拘束します。']]],
    ['抽出と出力',[['CASE_METHOD','実固有値抽出条件を選びます。'],['EIGR','例題ではAHOUを用います。上の自作例のEIGRLとは抽出方法が異なります。'],['CASE_SET','モード形・反力・要素力の出力対象をそれぞれ指定します。'],['CASE_DISPLACEMENT','対象節点のモード形を出力します。'],['CASE_SPCFORCES','原典表記のSPCFORCE。対象節点の拘束反力を確認します。'],['CASE_FORCE','原典表記のELFORCE。指定要素の力を確認します。']]],
   ]},
  'complex-modes':{
   title:'すべり摩擦による振動の安定性',
   reference:['Dynamic Analysis User’s Guide · Listing 14-1 · PDF 681–685','Dynamic_Analysis_User_Guide',681],
   intro:'摩擦による非対称な剛性項を含む検証例です。複素根の実部と、摩擦の強さを変えたときの安定性を確認します。',
   groups:[
    ['解法と行列',[['EXEC_SOL_107','Listingの直接法。物理自由度上で複素根を求めます。'],['EXEC_SOL_110','実モードへ縮約する比較法です。'],['CASE_METHOD','モード法で実モードの抽出条件を指定します。'],['EIGRL','縮約に用いる実モードを抽出します。'],['CASE_CMETHOD','使用する複素根の抽出セットを選びます。'],['EIGC','原典はCLAN・INV・HESSの入力例を掲載しています。直接法とモード法を比較するときは、どの抽出法を使用したかも確認します。'],['K2PP','Case Controlで摩擦由来の追加剛性行列を選び、倍率を与えます。'],['DMIG','法線力から接線方向への摩擦力を表す非対称行列を定義します。']]],
    ['構造と結合',[['GRID','筐体・パッド・結合点を定義します。'],['CONM2','筐体やパッド側の集中質量を与えます。'],['CELAS2','筐体の支持剛性と、法線力を評価するばねを表します。'],['RBE2','筐体側の節点を剛体運動で結びます。'],['RBE3','パッド側の節点の動きを参照点に関連付けます。'],['CHEXA','パッドを立体要素で表します。'],['PSOLID','パッドの立体要素の物性を指定します。'],['CQUAD4','地盤側の節点間の剛性を表す板要素です。'],['PSHELL','板要素の物性を与えます。'],['MAT1','各構造部の線形弾性や密度を定義します。'],['CASE_MPC','多点拘束のセットを選びます。'],['MPC','パッド側と筐体側の自由度の関係を式で指定します。'],['OMIT1','縮約の対象となる自由度を指定します。']]],
    ['質量・減衰と出力',[['PARAM_GRDPNT','質量特性の出力を要求します。'],['PARAM_G','全体の構造減衰を指定します。'],['PARAM,FRIC','摩擦係数を表す例題中のパラメータです。K2PPによる行列の倍率との対応は原典の設定を確認します。'],['CASE_DISPLACEMENT','原典表記のDISP。複素モード形を出力します。'],['SVECT','実モード形を確認するための出力指定です。'],['SDISP','複素モードを構成する実モードの成分を出力します。']]],
   ]},
 };
 for(const model of Object.values(official)){
  const [label,book,page]=model.reference;
  model.source={label,url:guide(book,page)};
 }
 window.AnalysisScenarioCards={generated,official};
})();
