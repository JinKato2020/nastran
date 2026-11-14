/* Card reference maps for the independently authored lesson models. IDs match the lesson DAT files. */
(() => {
 'use strict';
 const n=(id,label,card,detail)=>({id,label,card,detail});
 const e=(from,to,label,dashed=false)=>({from,to,label,...(dashed?{dashed:true}:{})});
 const scope='矢印は、カードが番号で参照する相手を示します。計算の実行順ではありません。カード名を押すとInputデータの解説へ移動します。';
 const structures={
  beam:{note:'梁要素12個。要素は物性を、物性は材料を番号で参照します。',element:['CBEAM','EID=101–112 / PID=20 / GA・GB'],property:['PBEAM','PID=20 / MID=70 / 断面積・I1・I2・J'],material:['MAT1','MID=70 / E・ν・ρ'],grid:'ID=1–13',materialLabel:'MID=70'},
  shell:{note:'四辺形シェル48個。板厚はPSHELLに、弾性はMAT1にあります。',element:['CQUAD4','EID=101–148 / PID=20 / G1–G4'],property:['PSHELL','PID=20 / 板厚6 mm'],material:['MAT1','MID=70 / E・ν・ρ'],grid:'ID=1–65',materialLabel:'MID1・MID2・MID3=70'},
  solid:{note:'六面体192個。ソリッドの物性は材料番号を受け渡します。',element:['CHEXA','EID=101–292 / PID=20 / G1–G8'],property:['PSOLID','PID=20 / MID=70'],material:['MAT1','MID=70 / E・ν・ρ'],grid:'ID=1–375 / PS=456',materialLabel:'MID=70'},
  heat:{note:'四辺形要素12個が熱伝導を受け持ちます。熱解析ではPSHELLの材料番号からMAT4を参照します。',element:['CQUAD4','EID=101–112 / PID=20 / G1–G4'],property:['PSHELL','PID=20 / 板厚6 mm'],material:['MAT4','MID=70 / 熱伝導率167'],grid:'ID=1–26',materialLabel:'MID1=70'},
 };
 function structure(kind,title='要素・物性・材料'){
  const s=structures[kind];
  return {title,note:s.note,layers:[['el'],['prop','grid'],['mat']],
   nodes:[n('el',s.element[0],s.element[0],s.element[1]),n('prop',s.property[0],s.property[0],s.property[1]),n('mat',s.material[0],s.material[0],s.material[1]),n('grid','GRID','GRID',s.grid)],
   edges:[e('el','prop','PID=20'),e('el','grid','節点番号'),e('prop','mat',s.materialLabel)]};
 }
 function support(components,target,note='Case ControlのSPCが拘束セットを選び、SPC1が節点と成分を指定します。'){
  return {title:'支持条件',note,layers:[['case'],['spc1'],['grid']],
   nodes:[n('case','SPC','CASE_SPC','選択値=10'),n('spc1','SPC1','SPC1','SID=10 / C='+components),n('grid','GRID','GRID',target)],
   edges:[e('case','spc1','SID=10'),e('spc1','grid','拘束する節点')]};
 }
 const root=()=>support('123456','根元の節点1');
 function staticLoad(target,detail){
  return {title:'荷重',note:'Case ControlのLOADが荷重セットを選び、FORCEが節点・大きさ・向きを指定します。',layers:[['case'],['force'],['grid']],
   nodes:[n('case','LOAD','CASE_LOAD','選択値=40'),n('force','FORCE','FORCE','SID=40 / '+detail),n('grid','GRID','GRID',target)],
   edges:[e('case','force','SID=40'),e('force','grid','作用する節点')]};
 }
 function realModes(count,title='実固有値の抽出',note='Case ControlのMETHODが抽出条件のセットを選びます。'){
  return {title,note,layers:[['case'],['eigrl']],
   nodes:[n('case','METHOD','CASE_METHOD','選択値=30'),n('eigrl','EIGRL','EIGRL','SID=30 / ND='+count)],edges:[e('case','eigrl','SID=30')]};
 }
 const massParams=tip=>({title:'質量の設定',note:tip?'集中質量は節点を直接参照します。PARAMは番号の参照を持たず、モデル全体に作用します。':'PARAMは番号の参照を持たず、モデル全体に作用します。',
  layers:tip?[['conm2','coup','grdpnt'],['grid']]:[['coup','grdpnt']],
  nodes:[...(tip?[n('conm2','CONM2','CONM2','EID=201 / M=8.0E-5 t'),n('grid','GRID','GRID','先端の節点13')]:[]),n('coup','PARAM,COUPMASS','PARAM_COUPMASS','値=1 / 連成質量'),n('grdpnt','PARAM,GRDPNT','PARAM_GRDPNT','値=0 / 質量の集計')],
  edges:tip?[e('conm2','grid','G=13')]:[]});
 function complexMethod(sol){
  const modal=sol===110;
  return {title:'複素固有値の抽出',note:modal?'SOL 110では、METHODで選んだ実モードを基底にして、CMETHODの条件で複素根を求めます。':'SOL 107では、CMETHODだけで複素根の抽出条件を選びます。',
   layers:modal?[['method','cmethod'],['eigrl','eigc']]:[['cmethod'],['eigc']],
   nodes:[...(modal?[n('method','METHOD','CASE_METHOD','選択値=30'),n('eigrl','EIGRL','EIGRL','SID=30 / ND=12')]:[]),n('cmethod','CMETHOD','CASE_CMETHOD','選択値=50'),n('eigc','EIGC','EIGC','SID=50 / HESS / 8根')],
   edges:[...(modal?[e('method','eigrl','SID=30')]:[]),e('cmethod','eigc','SID=50')]};
 }
 const damper={title:'ダンパ',note:'ダンパ要素は、粘性係数を持つ物性と、作用する節点・成分を参照します。',layers:[['el'],['prop','grid']],
  nodes:[n('el','CDAMP1','CDAMP1','EID=301 / PID=31'),n('prop','PDAMP','PDAMP','PID=31 / 0.055 N·s/mm'),n('grid','GRID','GRID','先端の節点13 / 成分3')],
  edges:[e('el','prop','PID=31'),e('el','grid','G1=13 / C1=3')]};
 function dynamicLoad(card,detail,tableDetail){
  return {title:'動的荷重',note:'Case ControlのDLOADが荷重を選びます。荷重カードは、作用位置（DAREA）と変化の表（TABLED1）を別々に参照します。',
   layers:[['case'],['load'],['darea','table'],['grid']],
   nodes:[n('case','DLOAD','CASE_DLOAD','選択値=50'),n('load',card,card,'SID=50'),n('darea','DAREA','DAREA','SID=51 / '+detail),n('table','TABLED1','TABLED1','TID=52 / '+tableDetail),n('grid','GRID','GRID','先端の節点13 / 成分3')],
   edges:[e('case','load','SID=50'),e('load','darea','EXCITEID=51'),e('load','table','TID=52'),e('darea','grid','G=13 / C=3')]};
 }
 function frequency(sol,stepDetail,count){
  const panels=[structure('beam'),root(),dynamicLoad('RLOAD1','1 N','全周波数で倍率1'),
   {title:'周波数と減衰',note:'FREQUENCYが計算する周波数のセットを選びます。PARAM,Gは番号の参照を持たず、全体の構造減衰として作用します。',layers:[['case','g'],['freq']],
    nodes:[n('case','FREQUENCY','CASE_FREQUENCY','選択値=60'),n('freq','FREQ1','FREQ1','SID=60 / '+stepDetail),n('g','PARAM,G','PARAM_G','値=0.04')],edges:[e('case','freq','SID=60')]}];
  if(sol===111)panels.splice(3,0,realModes(count,'モードによる縮約','METHODで選んだ実モードが、応答を解く基底になります。'));
  return panels;
 }
 function transient(sol,duration){
  const panels=[structure('beam'),root(),dynamicLoad('TLOAD1','−18 N',duration+' sまで倍率1'),
   {title:'時間刻みと減衰',note:'TSTEPが時間刻みのセットを選びます。PARAM,GとW3は番号の参照を持たず、組になって等価な粘性減衰を与えます。',layers:[['case','g','w3'],['tstep']],
    nodes:[n('case','TSTEP','CASE_TSTEP','選択値=60'),n('tstep','TSTEP','TSTEP','SID=60 / 400刻み×0.0005 s'),n('g','PARAM,G','PARAM_G','値=0.04'),n('w3','PARAM,W3','PARAM_W3','値=239.3 rad/s')],edges:[e('case','tstep','SID=60')]}];
  if(sol===112)panels.splice(3,0,realModes(6,'モードによる縮約','METHODで選んだ実モードが、時刻歴を解く基底になります。'));
  return panels;
 }
 function buckling(components,target,note){
  return [structure('beam','柱の要素・物性・材料'),support(components,target,note),
   {title:'2つのSUBCASEの関係',note:'SUBCASE 1の静解析で求めた軸力が、SUBCASE 2の座屈固有値の計算に使われます。破線は番号の参照ではなく、結果の受け渡しです。',
    layers:[['s1'],['load','s2'],['force','method'],['grid','eigrl']],
    nodes:[n('s1','SUBCASE 1','CASE_SUBCASE','静解析'),n('load','LOAD','CASE_LOAD','選択値=40'),n('force','FORCE','FORCE','SID=40 / −X方向へ1 N'),n('grid','GRID','GRID','荷重側の節点13'),
     n('s2','SUBCASE 2','CASE_SUBCASE','座屈固有値'),n('method','METHOD','CASE_METHOD','選択値=30'),n('eigrl','EIGRL','EIGRL','SID=30 / ND=3')],
    edges:[e('s1','load','荷重を選ぶ'),e('s1','s2','軸力による剛性',true),e('load','force','SID=40'),e('force','grid','G=13'),e('s2','method','抽出条件を選ぶ'),e('method','eigrl','SID=30')]}];
 }
 function heat(convection){
  const panels=[structure('heat','伝導の要素・物性・材料'),
   {title:'温度の指定',note:'熱解析では、SPCが温度を指定します。'+(convection?'周囲温度のスカラー点も同じセットで指定します。':''),
    layers:convection?[['case'],['spc'],['grid','spoint']]:[['case'],['spc'],['grid']],
    nodes:[n('case','SPC','CASE_SPC','選択値=10'),n('spc','SPC','SPC','SID=10 / 100 ℃・20 ℃'),n('grid','GRID','GRID','左端辺1・2、右端辺25・26'),...(convection?[n('spoint','SPOINT','SPOINT','ID=99 / 周囲20 ℃')]:[])],
    edges:[e('case','spc','SID=10'),e('spc','grid','温度を指定する節点'),...(convection?[e('spc','spoint','G=99')]:[])]}];
  if(convection)panels.push({title:'対流の境界条件',note:'CONVは同じ番号の面要素に対流を割り当て、特性（PCONV）と周囲温度の点を参照します。熱伝達係数はMAT4にあります。',
   layers:[['conv'],['chbdyg','pconv','spoint'],['grid','mat']],
   nodes:[n('conv','CONV','CONV','EID=201–212・301–312'),n('chbdyg','CHBDYG','CHBDYG','同じEID / AREA4'),n('pconv','PCONV','PCONV','PCONID=80 / MID=70'),n('spoint','SPOINT','SPOINT','ID=99 / 周囲温度'),n('grid','GRID','GRID','伝導要素と同じ4節点'),n('mat','MAT4','MAT4','MID=70 / H=0.02')],
   edges:[e('conv','chbdyg','EID'),e('conv','pconv','PCONID=80'),e('conv','spoint','TA1=99'),e('chbdyg','grid','G1–G4'),e('pconv','mat','MID=70')]});
  panels.push({title:'解法の条件',note:'初期温度と反復条件は、Case Controlからセット番号で選びます。',layers:[['temp','nl'],['tempd','nlparm']],
   nodes:[n('temp','TEMPERATURE(INITIAL)','CASE_TEMPERATURE','選択値=90'),n('tempd','TEMPD','TEMPD','SID=90 / 20 ℃'),n('nl','NLPARM','CASE_NLPARM','選択値=95'),n('nlparm','NLPARM','NLPARM','ID=95 / 既定値')],
   edges:[e('temp','tempd','SID=90'),e('nl','nlparm','ID=95')]});
  return panels;
 }
 const maps={
  beam:[structure('beam'),root(),staticLoad('先端の節点13','−Z方向へ18 N')],
  shell:[structure('shell'),support('123456','固定辺の節点1–5'),staticLoad('先端辺の節点61–65','合計18 Nを配分')],
  solid:[structure('solid'),support('123','固定面の節点1–15'),staticLoad('先端面の節点361–375','合計18 Nを配分')],
  baseline:[structure('beam'),root(),massParams(false),realModes(12)],
  'tip-mass':[structure('beam'),root(),massParams(true),realModes(12)],
  'both-fixed':[structure('beam'),support('123456','両端の節点1・13'),massParams(false),realModes(12)],
  undamped:[structure('beam'),root(),complexMethod(107)],
  'modal-undamped':[structure('beam'),root(),complexMethod(110)],
  'direct-damped':[structure('beam'),root(),damper,complexMethod(107)],
  'modal-damped':[structure('beam'),root(),damper,complexMethod(110)],
  'heat-insulated':heat(false),'heat-convection':heat(true),
  'dfreq-coarse':frequency(108,'11 Hzから2 Hzごと'),'dfreq-fine':frequency(108,'10 Hzから0.5 Hzごと'),
  'mfreq-one':frequency(111,'10 Hzから0.5 Hzごと',1),'mfreq-six':frequency(111,'10 Hzから0.5 Hzごと',6),
  'trans-short':transient(109,'0.005'),'trans-long':transient(109,'0.05'),'trans-modal':transient(112,'0.05'),
  'buck-cantilever':buckling('123456','根元の節点1','根元の節点だけを固定します。荷重側は自由です。'),
  'buck-pinned':buckling('1234 と 23','節点1（1234）・節点13（23）','SPC1を2枚使い、節点ごとに異なる成分を拘束します。'),
  'buck-fixed':buckling('123456 と 23456','節点1（全成分）・節点13（軸方向以外）','SPC1を2枚使います。荷重側は軸方向の成分1だけを自由にします。'),
 };
 for(const [key,panels] of Object.entries(maps)){
  if(window.AnalysisRelationMaps[key])throw Error('Duplicate relation map: '+key);
  window.AnalysisRelationMaps[key]={title:'カード相関図',scope,panels};
 }
 window.AnalysisScenarioRelationKeys=Object.keys(maps);
})();
