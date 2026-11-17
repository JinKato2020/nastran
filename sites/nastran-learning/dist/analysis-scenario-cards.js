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
 window.AnalysisScenarioCards={generated};
})();
