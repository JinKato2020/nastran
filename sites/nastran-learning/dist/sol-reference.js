/* Coverage: MSC Nastran 2020 SP1 QRG, Table 2 (PDF 187–188). Original Japanese explanations. */
(() => {
 'use strict';
 const entries=[];
 function sol(n,alias,title,category,summary,method,connections,outputs,checks,comparison,example,pages,reference){
  entries.push({key:'EXEC_SOL_'+n,id:'SOL '+n,title,family:'executive',category,kind:'control',summary,
   location:'Executive Control（CENDより前）',syntax:n===600||n===700?'SOL '+n+',ID':'SOL '+n,
   example,exampleNote:'選択関係を示す制御部の抜粋です。参照先のBulk定義・モデル・ENDDATA等を加えないと実行用BDFにはなりません。',
   terms:[['番号 / 別名',n+' / '+alias],['解法と前提',method]],connections,outputs,notes:checks,
   sections:[{title:'近い解析との使い分け',paragraphs:[comparison]}],page:187,sourcePages:pages,reference});
 }
 sol(101,'SESTATIC','線形静解析','SOL · 静解析・座屈',
  '時間変化が十分に遅い荷重に対し、変位・反力・要素力・応力を求めます。材料線形・微小変形を基本とし、複数の独立した荷重条件をSUBCASEで切り替えます。',
  'Ku=fを解きます。Kは拘束を反映した剛性、uは未知変位、fは荷重。通常の線形静解析では荷重を2倍にすると変位・応力も2倍です。QRGでは線形定常熱伝導、慣性リリーフ等のオプションも含みます。',
  [['SPC = 10','SPC/SPC1/SPCADDのSID=10。支持・対称条件を選択。','CASE_SPC'],['LOAD = 20','FORCE/PLOAD等のSID=20、またはLOADの組合せを選択。','CASE_LOAD'],['STRESS / DISPLACEMENT','結果を要求する点・要素と出力先を指定。','CASE_STRESS']],
  ['DISPLACEMENTで変位、SPCFORCESで拘束反力、FORCEで要素力、STRESSで応力を確認します。反力と外力の釣合いを先に確認すると、荷重方向や拘束の誤りを見つけやすくなります。','応力成分は要素の種類・座標系・シェル表裏で意味が変わります。最大値だけでなく評価位置と座標系を併記します。'],
  ['拘束不足、要素未接続、材料・断面の欠落をAUTOSPCだけで補わないでください。自動拘束された自由度を確認します。','線形の前提を超える大変位、塑性、接触状態の変化が主要な現象なら、SOL106/400等の適用を検討します。'],
  'SOL105は同じ静的荷重状態を基準に座屈倍率を求めます。SOL106/400は荷重の増分と反復を用いて非線形の釣合いを追います。SOL101のSUBCASEは通常、前ケースの変形を引き継ぐ荷重ステップではありません。',
  'SOL 101\nCEND\nSPC = 10\nDISPLACEMENT = ALL\nSPCFORCES = ALL\nSTRESS = ALL\nSUBCASE 1\n  LOAD = 20\nBEGIN BULK',[186,187,472,616,628],'analysis.html#static');
 sol(103,'SEMODES','実固有値・固有モード','SOL · 固有値',
  '構造の固有振動数と固有モードを求めます。加振荷重の大きさに対する振幅を計算する解析ではなく、振動しやすい周波数と変形形状を調べる解析です。',
  '(K−ω²M)φ=0の固有値ω²と固有ベクトルφを求めます。周波数f=ω/(2π)。材料密度、集中質量、拘束条件が固有振動数に直接影響します。',
  [['METHOD = 30','EIGRL/EIGRのSID=30で探索範囲・抽出数・規格化を選択。','CASE_METHOD'],['EIGRL','V1/V2は振動数の下限・上限、NDは抽出数。SOL105の同じ欄とは物理的意味が異なります。','EIGRL'],['SPC = 10','拘束を付けた固有値解析の支持条件。自由支持モデルでは剛体モードも評価対象。','CASE_SPC']],
  ['固有値表の固有振動数、一般化質量・剛性とモード形状を併せて確認します。モードの符号反転は同じ形状を表します。','モード変位は規格化された形状です。図の振幅を実際の変位・許容変位と比較しないでください。'],
  ['密度の単位とPARAM WTMASSを確認します。剛性が正しくても質量を誤ると周波数が変わります。','意図しないゼロ近傍の固有値は、剛体運動・未接続部・機構を示すことがあります。一方、自由支持3次元モデルの剛体モードは正常です。'],
  '減衰を含む複素固有値はSOL107/110、特定の加振による応答はSOL108/111または109/112です。SOL111/112の基底となるモードは、応答に必要な周波数範囲を含むように抽出します。',
  'SOL 103\nCEND\nSPC = 10\nMETHOD = 30\nDISPLACEMENT = ALL\nBEGIN BULK',[187,495,1959,1960],'analysis.html#modes');
 sol(105,'SEBUCKL','線形座屈','SOL · 静解析・座屈',
  '静的な基準荷重から幾何剛性を作り、座屈荷重係数と座屈モードを求めます。初期不整や座屈後の変形を直接追跡する解析ではありません。',
  '予荷重がない場合は概念的に(K+λKG)φ=0を解き、限界荷重をλ×基準荷重として評価します。一定の予荷重がある場合は、予荷重＋λ×変動基準荷重です。',
  [['LOAD = 20','静解析SUBCASEで座屈基準となる圧縮等の荷重を選択。','CASE_LOAD'],['STATSUB(BUCKLING) = 1','荷重セット20ではなく静解析SUBCASE 1を参照。PRELOADは一定予荷重用。','CASE_STATSUB'],['METHOD = 30','EIGRL等の抽出条件。EIGRLのV1/V2は荷重係数の探索範囲。','EIGRL']],
  ['固有値λと座屈モードを組にして確認します。荷重方向・拘束の整合を確認してから正の荷重係数を評価します。','固有ベクトルの振幅は規格化量です。図のたわみから座屈後変位や塑性ひずみを求めることはできません。'],
  ['基準静解析に圧縮状態・適切な拘束があるか確認します。負の固有値は基準と逆向きの荷重に関係する場合があります。','薄肉構造の初期不整、塑性、接触が支配的なら、固有値だけを実耐力とせず非線形解析で評価します。'],
  'SOL101が指定荷重での変形を求めるのに対し、SOL105は基準荷重を何倍すると線形化した平衡が不安定になるかを求めます。SOL400の非線形座屈や弧長法は別の手順です。',
  'SOL 105\nCEND\nSPC = 10\nSUBCASE 1\n  LOAD = 20\nSUBCASE 2\n  STATSUB(BUCKLING) = 1\n  METHOD = 30\n  DISPLACEMENT = ALL\nBEGIN BULK',[187,495,621,622,1959],'analysis.html#buckling');
 sol(106,'NLSTATIC','非線形静解析','SOL · 非線形',
  '荷重を増分に分けて、材料非線形・幾何非線形・ギャップ等を含む静的な釣合いを反復計算します。適切なモデルなら線形静解析にも使えます。',
  '各増分で内力と外力の残差を評価し、接線剛性を更新して釣合いへ近づけます。大変位の考慮は解析設定・対応要素とともに指定し、SOL106を書くだけで全ての非線形現象が有効になるわけではありません。',
  [['NLPARM = 100','NLPARMのID=100。荷重増分、剛性更新、反復上限、収束判定を選択。','CASE_NLPARM'],['LOAD / SPC','荷重履歴・境界条件を設定。SUBCASEの順序が履歴に関係します。','CASE_LOAD'],['NLPARM / NLPCI','必要に応じ弧長制御を追加。塑性材料等も対応する材料・要素定義が必要。','NLPARM']],
  ['変位・応力に加え、荷重増分ごとの残差と収束状態を確認します。荷重−変位関係を読むと剛性変化や限界点を把握できます。','最終SUBCASEの結果だけでは、途中の塑性化・接触変化・除荷経路を見落とします。必要な増分で出力を残します。'],
  ['NLPARM.NINCは通常、前SUBCASEからの荷重変化の分割数です。全SUBCASEを独立したSOL101の荷重ケースのように扱わないでください。','反復回数の上限を増やすだけでは、拘束不備や不適切な材料値は解決しません。最善解で続行する設定もあるため終了だけで収束と判断しません。'],
  'SOL400はSTEP・SUBSTEPを用いる別の非線形手順で、対応材料・接触・増分設定も異なります。106から400への変更はSOL番号だけを置き換える作業ではありません。',
  'SOL 106\nCEND\nSPC = 10\nDISPLACEMENT = ALL\nSTRESS = ALL\nSUBCASE 1\n  NLPARM = 100\n  LOAD = 20\nBEGIN BULK',[187,536,2634,2639],'bulk.html#NLPARM');
 function complex(n,modal){sol(n,modal?'SEMCEIG':'SEDCEIG',modal?'モード法複素固有値':'直接法複素固有値','SOL · 固有値',
  '減衰や非対称性を含む系の複素固有値と固有ベクトルを求めます。振動数だけでなく、自由振動が減衰・成長する特性を評価します。',
  '(s²M+sC+K)φ=0を基本とし、s=σ+iωとするとe^(st)の表現でσ<0は減衰、σ>0は成長を表します。'+(modal?'実モード基底へ縮約した行列で複素固有値を求めます。':'物理自由度の行列で複素固有値を求めます。'),
  [['CMETHOD = 40','EIGCのSID=40で複素固有値抽出法・根数等を選択。','CASE_CMETHOD'],[modal?'METHOD = 30':'SPC = 10',modal?'EIGRL/EIGRで縮約に使う実モードを選択。CMETHODとは別の役割。':'モデルの支持条件を選択し、不要な剛体自由度を識別。',modal?'CASE_METHOD':'CASE_SPC'],['EIGC','CLAN等の手法、規格化、抽出数・シフト条件。単位や継続行の適用を確認。','EIGC']],
  ['複素固有値の実部・虚部、減衰指標、複素固有ベクトルを確認します。複素モードには成分間の位相差があります。','応答振幅は初期条件や外力に依存します。固有ベクトルの規格化値は強制応答の実振幅ではありません。'],
  [modal?'省略した実モードは複素解に寄与できません。基底の上限・モード数を増やして結果の安定性を確認します。':'直接法は縮約誤差を避けられる一方、自由度が大きいモデルでは計算費用が増えます。','減衰の符号や単位、非対称行列の扱いを確認します。SOL103の実固有値だけでは減衰・不安定性を同じ意味で評価できません。'],
  modal?'SOL107は物理自由度で解く直接法。SOL110は実モードを介するため、METHODとCMETHODの両方が必要です。周波数荷重への振幅を求めるならSOL111です。':'SOL110は実モードへ縮約して計算します。SOL107の結果は加振応答ではないため、周波数ごとの変位振幅を知りたい場合はSOL108を使用します。',
  'SOL '+n+'\nCEND\nSPC = 10\n'+(modal?'METHOD = 30\n':'')+'CMETHOD = 40\nDISPLACEMENT = ALL\nBEGIN BULK',[187,320,495,1949,1952]);}
 complex(107,false);complex(110,true);
 function response(n,modal,transient){sol(n,({108:'SEDFREQ',109:'SEDTRAN',111:'SEMFREQ',112:'SEMTRAN'})[n],(modal?'モード法':'直接法')+(transient?'過渡応答':'周波数応答'),'SOL · 線形動応答',
  transient?'時間とともに変化する荷重に対する変位・速度・加速度・応力の履歴を求めます。初期条件と時間刻みが応答に影響します。':'正弦波の定常加振に対する振幅・位相を、指定した各周波数で求めます。立上がり時の過渡成分は含みません。',
  (transient?'Mü+Ců+Ku=f(t)を時間積分します。':'(K−ω²M+iωC)u(ω)=f(ω)を各周波数で解きます。')+(modal?'実固有モードへ射影した一般化座標で解き、物理変位へ復元します。':'物理自由度で解くため、実モード抽出のMETHODは基本の手順では不要です。'),
  [[modal?'METHOD = 30':transient?'IC = 80':'SPC = 10',modal?'EIGRL/EIGRの基底モードを選択。応答に寄与するモードを十分に含めます。':transient?'TICの初期変位・速度を選択。初期静的釣合いとの関係を確認。':'拘束セットを選択。周波数応答の複素振幅の自由度にも同じ支持条件を適用。',modal?'CASE_METHOD':transient?'CASE_IC':'CASE_SPC'],['DLOAD = 50',transient?'DLOAD → TLOAD1 → TABLED1で時間波形、DAREA等で空間分布を定義。':'DLOAD → RLOAD1 → TABLED1等で周波数依存荷重を定義。','CASE_DLOAD'],[transient?'TSTEP = 90':'FREQUENCY = 60',transient?'TSTEPのN・DT・NOで計算刻みと出力間隔を設定。':'FREQ/FREQ1等のSID=60。計算する加振周波数を選択。',transient?'CASE_TSTEP':'CASE_FREQUENCY']],
  [transient?'時刻ごとの変位・速度・加速度を確認します。最大応力の発生時刻が最大変位の時刻と一致するとは限りません。':'複素応答の実部・虚部、または振幅・位相を確認します。位相が異なる成分の最大振幅を、同時刻のベクトルとして足さないでください。',modal?'モード数・上限周波数を増やして対象応答が安定するか確認します。残余ベクトル等の補正は用途に応じて検討します。':'入力荷重、変位・反力、減衰によるエネルギー散逸の整合を確認します。'],
  [transient?'短い立上がり・高周波振動を表せる時間刻みを設定します。NOで出力だけを細かくしても計算精度は上がりません。':'共振付近は周波数刻みを細かくします。粗い等間隔表では鋭いピークを見落とします。',modal?'TABDMP1のTYPEとPARAM KDAMPを確認します。臨界減衰比、構造減衰係数、Q値を同じ数値として流用しません。':'CDAMPi等の粘性減衰は力/速度の単位です。構造減衰からの変換や適用条件は解法ごとに確認します。'],
  (modal?'直接法（SOL'+(transient?'109':'108')+'）は実モードの打切りがありません。':'モード法（SOL'+(transient?'112':'111')+'）は十分な基底を選べば大規模モデル・多数の計算点で効率的です。')+(transient?'SOL129/400は非線形過渡応答に用いる別手順です。':'SOL'+(modal?'112':'109')+'は時間履歴を求める過渡応答です。'),
  'SOL '+n+'\nCEND\nSPC = 10\n'+(modal?'METHOD = 30\nSDAMPING = 70\n':'')+'DLOAD = 50\n'+(transient?'TSTEP = 90':'FREQUENCY = 60')+'\nDISPLACEMENT = ALL\nACCELERATION = ALL\nBEGIN BULK',[187,340,421,495,594,665],transient?'analysis.html#transient':modal?'analysis.html#modal-frequency':'analysis.html#direct-frequency');}
 response(108,false,false);response(109,false,true);response(111,true,false);response(112,true,true);
 function cyclic(n,alias,title,extra,compare){sol(n,alias,title,'SOL · 循環対称',
  '周方向に同じ形状が繰り返す構造を1セクタで表し、周方向の調和成分ごとに'+({114:'静的な釣合い',115:'実固有値',116:'座屈固有値',118:'直接周波数応答'})[n]+'を計算します。全周モデルの自由度を減らせる一方、周期性に合うモデル化が必要です。',
  'CYSYMで全周のセクタ数と対称の種類を定義し、CYJOINで両側境界を対応付けます。周方向次数は空間的な変化の次数であり、加振周波数や固有モード番号とは別の量です。',
  [['HARMONICS = ALL','計算する周方向次数。数値指定はCase SETの番号であり、次数そのものではありません。'],['CYSYM / CYJOIN','全周の分割数と左右境界の対応節点を定義。回転対称の両リストの点数を一致させます。'],[extra[0],extra[1],extra[2]]],
  ['HOUTPUTは周方向調和係数、NOUTPUTは各セクタの物理結果を回復します。少なくとも適切な一方を指定し、通常のDISPLACEMENT/STRESS等と組み合わせます。',n===115?'固有振動数と周方向次数・モード形状を一緒に読みます。':n===116?'荷重係数と座屈形状を確認します。正規化した形状は実際の座屈後変位ではありません。':n===118?'加振周波数ごとの振幅・位相と、どのセクタの結果かを確認します。':'セクタ間の復元後の変位・応力と周期的な荷重条件を確認します。'],
  ['HARMONICSを省くと循環対称解析は実行されません。出力にHOUTPUT/NOUTPUTが必要な点も通常のSOLと異なります。','軸上節点はCYAXで扱い、CYJOIN境界に重複させません。CYAXの変位座標系にも条件があるため、QRGを確認します。',n===116?'STATSUBはMETHODと同じSUBCASEに置き、別の静解析SUBCASEを参照します。SOL105の既定選択と同一に扱いません。':'鏡面対称拘束、軸対称要素、非線形周期拘束NLCYSYMとは別の手法です。'],
  compare,
  'SOL '+n+'\nCEND\nHARMONICS = ALL\nHOUTPUT = ALL\nDISPLACEMENT = ALL\n'+(n===116?'SUBCASE 1\n  LOAD = 20\nSUBCASE 2\n  STATSUB(BUCKLING) = 1\n  METHOD = 30':extra[0])+'\nBEGIN BULK',[187,188,453,457,544,621,1729,1735]);}
 cyclic(114,'CYCSTATX','循環対称静解析',['LOAD = 20','周期構造に作用する静的荷重セットを選択。','CASE_LOAD'],'SOL101の全周静解析と同じ物理を扱う際も、境界対応と周方向荷重分解が追加で必要です。');
 cyclic(115,'CYCMODE','循環対称実固有値',['METHOD = 30','EIGRL等の実固有値抽出条件を選択。予荷重はSTATSUBで静解析SUBCASEを参照。','CASE_METHOD'],'SOL103は全モデルのモード、SOL115は周期性を使って周方向次数ごとのモードを求めます。');
 cyclic(116,'CYCBUCKL','循環対称座屈',['METHOD = 30','固有値抽出に加えSTATSUBで別の静解析SUBCASEを指定。','CASE_STATSUB'],'SOL105の座屈手順に周期境界と調和成分の設定が加わります。例は静解析SUBCASE 1を座屈SUBCASE 2から参照し、HOUTPUTで調和係数を出力します。セクタの物理量を回復するときはNOUTPUTと対象次数を指定します。');
 cyclic(118,'CYCFREQ','循環対称直接周波数応答',['DLOAD = 50\nFREQUENCY = 60','動荷重セットと計算周波数セットを選択。','CASE_DLOAD'],'SOL108に相当する直接周波数応答を周期構造へ適用します。HARMONICSは周方向次数、FREQUENCYは加振周波数で、どちらも必要です。');
 sol(128,'SENLHARM','非線形調和応答','SOL · 非線形',
  '定常周期加振に対する非線形応答を、基本波・高調波・分数調波を用いて求めます。接触的な非線形力などにより、入力と同じ周波数だけでは応答を表せない場合に用います。',
  '周期応答を調和成分で表して求めます。NLHARMのNHARMは保持する高調波数、SUBFACは分数調波に関係します。時間履歴を長く積分するSOL129とは解の表し方が異なります。',
  [['NLHARM = 10','Bulk NLHARMのID=10を選択。'],['NLHARM.NLFREQ','NLFREQ/NLFREQ1のIDへ接続し、加振周波数・掃引を定義。'],['NONLINEAR = 20','NOLINi/NLRGAP/NLRSFDの非線形力。NOLIN1のTIDはTABLEDiへ接続。']],
  ['基本波だけでなく、採用した高調波と分数調波を含めて応答を解釈します。ピーク値を基本波の振幅だけで代用しないでください。','周波数掃引方向で応答経路が変わる場合があるため、周波数と解の継続経路を記録します。'],
  ['NOLINiをDLOADから選択する構成ではありません。NONLINEARで少なくとも1自由度の非線形力を選びます。','高調波数を増やしたときの解の変化を確認します。NLFREQ1のDFの正負は掃引方向に影響します。'],
  '線形周波数応答のSOL108/111で使うFREQUENCY→FREQを、そのままNLHARMの代わりにできません。非定常な衝撃や立上がり全体は過渡応答で扱います。',
  'SOL 128\nCEND\nSPC = 10\nNLHARM = 10\nNONLINEAR = 20\nDISPLACEMENT = ALL\nBEGIN BULK',[188,528,543,2610,2612,2675]);
 sol(129,'NLTRAN','非線形過渡応答','SOL · 非線形',
  '時間変動荷重に対する非線形、または線形の過渡応答を求めます。運動方程式の時間積分と、各時刻の非線形釣合いの反復を行います。',
  '材料・幾何・境界の非線形性に応じて剛性・内力が変わります。TSTEPNLのNDT×DTで解析時間を設定し、ADAPTで時間刻みを調整します。実ステップ数はNDTと同じとは限りません。',
  [['TSTEPNL = 200','TSTEPNL ID=200の時間増分、反復、収束条件を選択。','CASE_TSTEPNL'],['DLOAD = 50','TLOADi等による時間荷重。荷重波形と時間単位を合わせます。','CASE_DLOAD'],['IC = 80','TICで初期変位・速度を与える場合のセット。','CASE_IC']],
  ['時刻ごとの変位・速度・加速度・応力と、時間刻みの変化・反復の収束を確認します。','急激な荷重変化・衝突などでは、出力刻みが粗いと最大値を取り逃します。計算刻みと保存間隔を分けて管理します。'],
  ['このQRG版のSOL129はTSTEPNL.METHOD=ADAPTのみ。SOL400の他の方法を無条件に流用しません。','複数SUBCASEは時間的に連続し、前SUBCASE終端を引き継ぎます。独立した初期状態のケース群ではありません。'],
  'SOL109/112は線形過渡応答、SOL400はSTEPを組み合わせる陰解法非線形、SOL700は外部陽解法ソルバーを利用する別方式です。',
  'SOL 129\nCEND\nSPC = 10\nDISPLACEMENT = ALL\nSUBCASE 1\n  TSTEPNL = 200\n  DLOAD = 50\nBEGIN BULK',[188,459,665,3321,3323],'bulk.html#TSTEPNL');
 sol(144,'AESTAT','静的空力弾性・トリム','SOL · 空力弾性',
  '空気力による構造変形と、その変形による空気力の変化を含む定常釣合い・トリム条件を求めます。姿勢や操舵量等と構造変形が結び付きます。',
  '構造メッシュと空力パネルは別に定義し、SPLINEiで変位・荷重を対応付けます。TRIMでMach数、動圧、固定するトリム変数を与え、残る未知量を求めます。',
  [['TRIM = 10','TRIM.SID=10。LABELiはAESTAT/AESURFの変数名と対応し、単なるIDではありません。'],['CAERO1 → PAERO1','空力パネルの形状と空力プロパティ。AEROSは基準翼弦・翼幅・面積等を定義。'],['SPLINE1 → SETi','CAEROで空力要素、SETGで構造節点セットへ接続。']],
  ['構造の変位・応力と、求まったトリム状態を確認します。AEROFで空力制御点荷重、APRESSUREで空力圧力を要求できます。','空気力の合力・モーメントと構造に伝達された荷重の整合を確認します。'],
  ['TRIMで列挙しない変数は自由です。TRIM2の未指定変数の原則ゼロ固定と同じ省略規則ではありません。','TRIM.AEQR=0は剛体、1は空力弾性トリム。中間値は通常の物理状態を表しません。半翼モデルのAEROS基準量にも固有の規則があります。'],
  'SOL145はフラッタ安定性、SOL146は突風等の動的応答です。SOL144の定常釣合い結果だけでは動的なフラッタ速度を求められません。',
  'SOL 144\nCEND\nTRIM = 10\nDISPLACEMENT = ALL\nAEROF = ALL\nAPRESSURE = ALL\nBEGIN BULK',[188,271,283,661,1264,3170,3315,3316]);
 sol(145,'SEFLUTTR','フラッタ','SOL · 空力弾性',
  '空気力と構造振動の連成による動的不安定性を、速度・密度・Mach数を変えて評価します。外力に対する有限の応答振幅を求める解析とは異なります。',
  '構造モードと非定常空気力を組み合わせて複素固有値を追います。K/KE/PK等の手法で必要な指定・減衰の扱い・条件表の解釈が異なります。',
  [['FMETHOD = 40','FLUTTER.SID=40で手法と条件表を選択。'],['FLUTTER → FLFACT','密度・Mach数・換算振動数等の表。PK系のRFREQ位置は速度表を参照。'],['METHOD = 30','構造モード抽出条件。K法ではCMETHOD→EIGCも必要。AERO/MKAEROiで空力計算条件を設定。','CASE_METHOD']],
  ['速度等に対する固有値・振動数・減衰を追い、安定性が変わる条件を読みます。','モードの入替りや近接を考慮し、同じ物理モードを追跡します。出力表の同じ行番号を同じモードと即断しません。'],
  ['PKNL/PKNLSは密度・Mach・速度の対応する組を使うため、各表の件数を一致させます。他の手法の組合せ計算と区別します。','PK系ではMATiのGEによる構造減衰が無視されます。物理変位を要求する速度はFLFACTで負値とする規則もあります。'],
  'SOL146は突風等による応答。フラッタ条件付近の強制応答だけで安定限界を代用しません。SOL200でフラッタ設計を行う場合はPK/PKNLを選ぶ条件があります。',
  'SOL 145\nCEND\nMETHOD = 30\nFMETHOD = 40\nBEGIN BULK',[188,417,1263,2031,2032,2540]);
 sol(146,'SEAERO','動的空力弾性・突風応答','SOL · 空力弾性',
  '非定常空気力と構造振動を組み合わせ、突風や動的な入力に対する変位・加速度・応力を求めます。荷重の時間・周波数依存と飛行条件の指定が必要です。',
  '構造モードと空力行列を結合します。GUSTから参照するRLOADiは周波数依存、TLOADiは時間依存の突風です。時間荷重ではTSTEPを選択し、荷重をFourier変換する手順を使います。',
  [['GUST = 50','GUST.SID=50。GUST.DLOADからRLOADi/TLOADiへ接続。'],['METHOD = 30','構造の実モード基底。SPLINEiで空力・構造間を結合。','CASE_METHOD'],['FREQUENCY = 60','FREQiの周波数セット。Fourier法の過渡応答でも必要で、TSTEPだけでは不足します。','CASE_FREQUENCY'],['AERO / MKAEROi','飛行速度・空力基準と空力行列の計算条件。時間荷重ならTSTEPも選択。']],
  ['変位・加速度・応力の応答を評価し、突風の振幅・速度・到達位置と結果の対応を確認します。','AEROFのSOL146対応は周波数応答の場合です。全ての出力要求が時間応答でも同じように使えると仮定しません。'],
  ['GUST.VとAERO.VELOCITYを一致させます。GUST.X0とVは同じ実行のSUBCASE間で変更できません。','MKAERO1に複数Mach数があっても応答は1値を選びます。既定は最小値、PARAM MACH指定では最も近い表値を使います。'],
  'SOL144は静的トリム、SOL145は動的不安定性の評価。SOL146では荷重振幅・時間履歴が結果に直接影響します。',
  'SOL 146\nCEND\nMETHOD = 30\nGUST = 50\nFREQUENCY = 60\nTSTEP = 90\nDISPLACEMENT = ALL\nACCELERATION = ALL\nBEGIN BULK',[188,271,421,450,665,1263,2157,2540]);
 function thermal(n,transient){sol(n,transient?'NLTCSH':'NLSCSH',transient?'過渡熱伝導・構造':'定常熱伝導・構造','SOL · 熱・熱構造',
  (transient?'時間に伴う温度分布の変化':'定常状態の温度分布')+'を求める熱解析の代表的なSOLです。QRG上は熱だけに限定されず、線形・非線形の構造解析や熱構造の手順も含みます。ここでは熱伝導としての入力を説明します。',
  transient?'熱容量と熱伝導を含むCθ·Ṫ+Kθ·T=Qを時間積分します。密度×比熱が蓄熱を決め、伝導率が熱の移動を決めます。':'定常の熱収支Kθ·T=Qを解きます。温度依存特性や放射等があると非線形反復が必要です。定常熱では温度の時間変化に伴う蓄熱項は使いません。',
  [['ANALYSIS = HEAT','SOL153/159で熱伝導を明示。省略既定のSTRUCTUREと区別。','CASE_ANALYSIS'],[transient?'TSTEPNL = 200':'NLPARM = 100',transient?'TSTEPNLで時間範囲・初期刻み・収束を設定。':'NLPARMで増分・収束条件を設定。',transient?'CASE_TSTEPNL':'CASE_NLPARM'],[transient?'IC = 20':'TEMPERATURE(INITIAL) = 20','TEMP/TEMPDの温度セットを選択。既知温度境界は別途SPCで設定。',transient?'CASE_IC':'CASE_TEMPERATURE']],
  ['THERMALは節点温度、FLUXは温度勾配・熱流束、SPCFORCESは温度拘束点の熱流量。熱流束W/m²と熱流量Wを区別します。','温度境界、熱入力、境界熱流量'+(transient?'と蓄熱':'')+'の収支を確認します。構造用のSPCFORCESの力単位をそのまま当てはめません。'],
  ['MAT4のK・CP・RHOの単位をそろえます。SPCの温度自由度は構造の123等ではなく空欄で指定します。','TEMP/TEMPDは温度データであり固定温度境界ではありません。初期温度は時刻0の境界条件と整合させます。',transient?'SOL159のTSTEPNLはADAPTのみ。SPC/MPCとICは共通部に配置する手順を確認します。':'構造の熱膨張荷重はTEMPERATURE(LOAD)で温度場を選ぶ別の用途です。熱伝導のINITIALを荷重指定と混同しません。'],
  transient?'SOL153は定常、SOL159は時間変化を扱います。SOL400で熱解析を行う場合はHTRAN/HSTAT等の別のANALYSIS値を用います。':'温度が落ち着くまでの時間を知りたい場合はSOL159。SOL101にも線形定常熱伝導のオプションがありますが、入出力・適用条件を確認して選択します。',
  'SOL '+n+'\nCEND\nANALYSIS = HEAT\nSPC = 10\n'+(transient?'IC = 20':'TEMPERATURE(INITIAL) = 20')+'\nTHERMAL = ALL\nFLUX = ALL\nSPCFORCES = ALL\nSUBCASE 1\n  '+(transient?'TSTEPNL = 200':'NLPARM = 100')+'\nBEGIN BULK',[188,275,416,459,652,658,2255,2634,3321],'analysis.html#heat');}
 thermal(153,false);thermal(159,true);
 sol(200,'DESOPT','設計感度・最適化','SOL · 設計最適化',
  '厚さや断面等の設計変数を変更し、制約を満たしながら目的関数を最小化・最大化する設計を探索します。複数の解析条件を組み合わせて評価できます。',
  'DESVARの値を設計関係カードでモデルへ反映し、各SUBCASEの解析応答をDRESPiで評価します。感度と設計更新を繰り返すため、元の解析モデルと設計変数の対応が正確であることが前提です。',
  [['ANALYSIS','各SUBCASEの解析種類。全SUBCASEより上で共通指定することも可能。','CASE_ANALYSIS'],['DESVAR → DVPREL1','DVIDiから設計変数、TYPE/PID/PNAMEから変更するプロパティを指定。材料変更は別系統の関係カード。'],['DESOBJ / DESSUB','DESOBJはDRESPiの目的応答。DESSUBはDCONSTR/DCONADDからDRESPiの制約応答へ接続。']],
  ['設計変数、目的関数、制約応答と違反量の履歴を確認します。目的関数が下がっていても制約違反が残れば設計条件を満たしていません。','最終モデルを実際の製造寸法・材料選択に合わせて再評価します。連続変数の最適値が製造可能な寸法とは限りません。'],
  ['DESVARだけではモデルは変わりません。DVPREL1等の関係式とその継続行が必要です。','DCONSTRの上下限は応答と同じ単位。EIGNは(rad/時間)²、FREQはcycle/時間で異なります。共通部のSUBCASE依存目的関数は最初のSUBCASEだけを用いる規則に注意します。'],
  'SOL101/103等は与えたモデルの応答計算。SOL200では解析に加え「どの値を変えるか・何を良くするか・何を守るか」の3種類の定義が必要です。',
  'SOL 200\nCEND\nDESOBJ = 100\nSUBCASE 1\n  ANALYSIS = STATICS\n  SPC = 10\n  LOAD = 20\n  DESSUB = 200\nBEGIN BULK',[188,275,276,331,332,1741,1755,1848]);
 sol(400,'NONLIN','非線形・連成・線形摂動','SOL · 非線形',
  '非線形静解析、陰解法過渡応答、熱解析等をSTEPとして組み合わせます。非線形状態を基準とする実固有値等の線形摂動も扱います。',
  'SUBCASEは独立、同じSUBCASEのSTEPは前STEPの状態を引き継ぎ、SUBSTEPは連成して同時に解きます。ANALYSISで各段階の物理・解法を指定し、NLSTEPで増分と収束を制御します。',
  [['SUBCASE → STEP → ANALYSIS','NLSTATICS、NLTRAN、HSTAT、HTRAN、MODES等。連成時はSTEP内にSUBSTEPを設けます。','CASE_ANALYSIS'],['NLSTEP = 10','Bulk NLSTEPのFIXED/ADAPT/ARCLN等で増分制御、MECH/HEAT等で物理別の収束を指定。','CASE_NLSTEP'],['LOAD / DLOAD / METHOD','静荷重・時間荷重・線形摂動モード抽出等をANALYSISに合わせて選択。','CASE_LOAD']],
  ['STEP・増分ごとの変位や非線形応力（NLSTRESS）、接触を扱う場合は接触結果を確認します。','線形摂動の固有モードは、直前の非線形状態の剛性・応力状態を基準とする結果として解釈します。'],
  ['荷重履歴を続けたいときにSUBCASEを増やすだけでは継続しません。STEP構成を使います。','SUBCASE内のNLSTEPはそのSUBCASEのNLPARMより優先。連成では最初のSUBSTEPより上に置きます。NLPARMは全面禁止ではありませんが、NLBUCKではNLSTEPが必要です。'],
  'SOL106/129、Marc連携のSOL600、外部陽解法のSOL700とは対応カードと計算手順が異なります。SOL400でも目的に応じた材料・接触・大変形の指定が必要です。',
  'SOL 400\nCEND\nSPC = 10\nDISPLACEMENT = ALL\nSUBCASE 1\n  STEP 1\n    ANALYSIS = NLSTATICS\n    NLSTEP = 10\n    LOAD = 20\nBEGIN BULK',[188,275,279,527,540,541,2651,2652],'bulk.html#NLSTEP');
 sol(600,'SESTATIC','Marc連携による非線形','SOL · 外部ソルバー',
  'Nastran入力をMarc入力へ変換し、Marcで非線形計算を実行するインターフェースです。番号だけでなく解析種類を表すIDを指定します。',
  'SOL 600,106等で解析種類を選択します。Nastran内で要素計算を行うSOL400とは異なり、中間の.marc.datを生成してMarcを呼び出します。対応するID・要素・出力変換に制限があります。',
  [['SOL 600,ID','106/129/153/159等の対応IDを指定。任意のSOL番号を後置できるわけではありません。'],['NLPARM / NLAUTO','NLPARMを選択し、追加の自動増分は同じ選択IDのNLAUTO。使用されるNLPARMフィールドは限定。','CASE_NLPARM'],['TSTEP / TSTEPNL','過渡での時間条件。NLSTRATはSUBCASE番号ではなく1番目・2番目という順番のIDを使用。','CASE_TSTEPNL']],
  ['Marcの.out/.log/.t16等で計算の成否と結果を確認します。中間入力の生成は解析完了を意味しません。','OUTR=F06で一部結果をNastran形式へ変換可能。OUTR=OP2はPARAM POST=-1または-2も必要です。変換対象・解析種類の制限を確認します。'],
  ['SOL600で有効なNLPARM欄はID・NINC・クリープのDT・EPSU/P/W等に限られ、通常SOL106の全設定が同じ意味では働きません。','153/159にはANALYSIS=HEATが必要。他のSOL600 IDにはANALYSISを入れません。2D・熱・再スタートの対応と出力変換にも制限があります。'],
  'SOL400はNastranの非線形手順、SOL600はMarcとの変換・連携です。使用環境のMarc実行系・ライセンス・対応カードを確認して選択します。',
  'SOL 600,106\nCEND\nSPC = 10\nNLPARM = 100\nLOAD = 20\nBEGIN BULK',[188,189,190,194,276,536,2599,2665]);
 sol(700,'NLTRAN','陽解法非線形・外部連携','SOL · 外部ソルバー',
  '外部の陽解法ソルバーを利用する非線形過渡解析の手順です。衝撃等の短時間の大きな変化を扱います。SOL 700,IDという専用書式と、対応カードの確認が必要です。',
  '陽解法は各ステップの状態を明示的に更新し、安定な時間刻みは要素寸法・材料等の影響を受けます。2020 SP1 QRGでは2019以降の方式は旧LS-Dyna版と異なり、新しいexplicit solverを使うとされています。',
  [['SOL 700,129','使用できるIDは101/106/109/129。目的に合うIDと対応入力を確認。'],['TSTEP / TSTEPNL','時間条件。Bulk TSTEPは変換時にTSTEPNLへ変更される規則があります。','CASE_TSTEPNL'],['DLOAD → TLOAD1','時間荷重の対応例。QRGの変換対応表ではTLOAD2は非対応。','TLOAD1']],
  ['外部ソルバーのログ・結果を確認し、変換成功と計算成功を区別します。jid.dytr.datは結果ではなく中間入力です。','衝撃問題では変形だけでなく、運動・内部エネルギー等の収支と非物理的な変形の有無を確認します。'],
  ['外部ソルバー・ライセンス・実行パスが必要です。一般のBulkカード一覧と同じ対応範囲とは限りません。','STOP=3は中間入力生成まででDytranを実行しません。NP/DMP700・nprocはDMP、ncpusはSMPとして区別します。'],
  'SOL129/400の陰解法と比べ、陽解法では安定時間刻みが重要です。SOL700,129の129というIDを、通常のSOL129と同じ計算法と解釈しないでください。',
  'SOL 700,129\nCEND\nSPC = 10\nDLOAD = 50\nTSTEP = 200\nBEGIN BULK',[188,208,209,212,219,3321]);
 entries.sort((a,b)=>Number(a.id.slice(4))-Number(b.id.slice(4)));
 const overview=window.INPUT_CONTROLS.find(e=>e.key==='EXEC_SOL');
 Object.assign(overview,{summary:'実行する解析手順をExecutive Controlで選択します。2020 SP1 QRGのTable 2に掲載された25種類を、用途・解法・関連入力・結果・注意点に分けて収録しています。',
  syntax:'SOL n\nSOL subDMAP-name [SOLIN=obj-DBset] [NOEXE]',
  terms:[['n','正の整数で解析手順を指定。例：101は静解析、103は実固有値、108は直接周波数応答。各番号の詳細は下の一覧、またはカテゴリーとカードで選択します。'],['subDMAP-name','1〜8文字の英数字、先頭は英字。通常のSOL番号の代わりに実行するsubDMAP名を指定します。'],['SOLIN','指定したデータベース上の実行制御情報を使い、自動リンクを省略します。DMAPプログラムを扱う場合の指定です。'],['NOEXE','コンパイル・リンクのみ。Case ControlとBulk Dataは読み込まれず処理されません。モデルの入力検査用として代用しないでください。']],
  notes:['SOLは自由形式です。Bulk Dataの8文字固定長フィールドを当てはめません。SOL600/700は「SOL 600,106」等の専用書式です。','番号の同じ他社版Nastranでも機能・対応カードが同一とは限りません。この一覧はMSC Nastran 2020 SP1 QRGに基づきます。'],sourcePages:[186,187,188,189,208],solIndex:entries.map(e=>({key:e.key,id:e.id,title:e.title,category:e.category}))});
 window.SOL_REFERENCES=entries;
})();
