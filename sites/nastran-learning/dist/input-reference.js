/* Supplemental definitions checked against the 2020 SP1 QRG; page numbers count PDF pages. */
(() => {
 'use strict';
 const entries=[];
 function control(id,title,category,summary,syntax,example,terms,pages,notes,connections=[]){
  entries.push({key:'CASE_'+id,id,title,family:'case',category,kind:'control',summary,syntax,example,terms,page:pages[0],sourcePages:pages,notes,connections,location:'Case Control（CENDとBEGIN BULKの間）'});
 }
 control('CMETHOD','複素固有値抽出条件','動解析条件',
  '複素固有値の抽出条件をEIGCのSIDで選びます。減衰を含む自由振動や不安定性の評価で使用します。実固有値用のMETHODとは別の指定です。',
  'CMETHOD = n','CMETHOD = 40',[
   ['n','正整数。EIGCのSID。SOL107/110で複素固有値を計算する場合に必要です。'],
   ['METHODとの関係','SOL110ではMETHODで実モード基底、CMETHODでその基底上の複素固有値抽出条件を選択します。同じ番号を使う必要はなく、役割も異なります。']],
  [320,1949],['SOL106等でも複素固有値評価の用途があります。「107/110以外では使用不可」とは限りません。SOL106で減衰効果を含める場合のUNSYMF等、解法別の条件を確認します。'],[['EIGC','SIDがCMETHODの右辺と一致する抽出定義。','EIGC']]);
 control('STATSUB','基準静解析・予荷重の選択','荷重・拘束',
  '静解析SUBCASEの結果を、座屈・振動等の基準として利用します。右辺は静荷重セットのSIDではなく、先行する静解析SUBCASE番号です。',
  'STATSUB(BUCKLING) = n\nSTATSUB(PRELOAD) = n','SUBCASE 1\n  LOAD = 20\nSUBCASE 2\n  STATSUB(BUCKLING) = 1\n  METHOD = 30',[
   ['n','参照する静解析SUBCASE番号。METHOD/CMETHOD/FREQUENCY/TSTEP等を含む解析SUBCASEに置きます。'],
   ['BUCKLING','座屈倍率を掛ける基準荷重の静解析。座屈解析の既定オプション。SOL105でSTATSUB自体を省くと最初の静解析SUBCASEを使用します。'],
   ['PRELOAD','一定予荷重の静解析。動解析の既定オプション。予荷重付きSOL105ではBUCKLINGとPRELOADを併記し、限界荷重は予荷重＋λ×基準荷重と解釈します。']],
  [621,622],['SOL116では別の静解析SUBCASEを明示的に参照します。SOL105の省略規則と同じ扱いにしません。','このQRG版ではSTATSUB(PRELOAD)はSOL200/400で非対応。予荷重のない動解析で無荷重静解析を参照するとエラーになる場合もあります。'],[['SOL105','座屈の2つのSUBCASEと結果の解釈。','EXEC_SOL_105']]);
 control('ANALYSIS','SUBCASE・STEPの解析種類','解析種別・非線形',
  'SOLが用意する手順の中で、SUBCASE/STEP/SUBSTEPが実行する解析種類を指定します。SOLそのものを切り替える命令ではありません。',
  'ANALYSIS = type','ANALYSIS = HEAT',[
   ['SOL153 / 159','HEATは熱伝導、STRUCTUREは構造。この2つのSOLではSTRUCTUREが既定のため、熱解析はHEATを明示します。'],
   ['SOL400','NLSTATICS：非線形静解析、NLTRAN：非線形過渡、HSTAT：定常熱、HTRAN：過渡熱、MODES：実固有値等。HEATを全SOL共通の熱指定としません。'],
   ['SOL200','各SUBCASEで解析種類を指定する必要があります。全SUBCASEより上で共通値を与えることも可能です。'],
   ['MODES','SOL110/111/112では、応答に使う実モードの結果回復を要求するSUBCASEにも使用します。拘束とMETHODの適用範囲を整合させます。']],
  [275,276,277,278,279],['一般には1SUBCASEに1種類。SOL400はSTEPや連成SUBSTEPを使う構成と、その配置規則を確認します。'],[['SOL400','SUBCASE・STEP・SUBSTEPの違い。','EXEC_SOL_400'],['SOL153','定常熱の制御例。','EXEC_SOL_153']]);
 control('NLPARM','非線形静解析の制御選択','解析種別・非線形',
  '非線形の荷重増分、剛性更新、収束判定等を定義したBulk NLPARMを選択します。Bulkに定義しただけでは解析へ適用されません。',
  'NLPARM = n','SUBCASE 1\n  NLPARM = 100\n  LOAD = 20',[
   ['n','NLPARMのID。同じIDのNLPCIがある場合は弧長法等の追加制御にも関係します。'],['配置','共通部またはSUBCASE内。SUBCASEで指定すればその段階に異なる増分・収束条件を使えます。']],
  [536,2634,2639],['SOL400ではNLSTEPが推奨されます。SUBCASE内にNLSTEPがあると、そのSUBCASEのNLPARMは無視されます。','SOL600では使用されるNLPARMのフィールドが限定されます。'],[['NLPARM（Bulk）','各フィールドと省略値。','NLPARM']]);
 control('NLSTEP','非線形ステップ制御の選択','解析種別・非線形',
  'Bulk NLSTEPのIDを選び、SOL400等の荷重・時間増分、反復収束、出力間隔を制御します。ANALYSISによる解析種類の指定とは役割が異なります。',
  'NLSTEP = n','SUBCASE 1\n  STEP 1\n    ANALYSIS = NLSTATICS\n    NLSTEP = 10\n    LOAD = 20',[
   ['n','Bulk NLSTEPのID。FIXED/ADAPT/ARCLN等の増分制御、MECH/HEAT等の物理別制御を参照します。'],
   ['配置と優先','SUBCASE内にNLSTEPがあると、そのSUBCASEのNLPARMは無視されます。連成では最初のSUBSTEPより上に置き、STEP内で共通に適用します。']],
  [540,541,2651,2653],['SOL400のNLBUCKではNLPARMの代わりにNLSTEPが必要です。','Bulk NLSTEPはSOL101の接触解析にも用途があり、名称だけでSOL400専用と判断しません。'],[['NLSTEP（Bulk）','固定増分の基本フィールド。','NLSTEP']]);
 control('TSTEPNL','非線形過渡の時間条件選択','解析種別・非線形',
  '非線形過渡解析の時間範囲・初期時間刻み・反復制御を、Bulk TSTEPNLのIDで選びます。線形用Bulk TSTEPとは定義内容が異なります。',
  'TSTEPNL = n','TSTEPNL = 200',[
   ['n','Bulk TSTEPNLのID。SOL129/159ではADAPT方式の時間刻み自動調整を使用します。'],
   ['TSTEPとの関係','Case TSTEPもBulk TSTEPNLを選択できます。Case側で同義の使い方があっても、Bulk TSTEPとTSTEPNLが同じカードという意味ではありません。']],
  [665,666,3321,3323],['SOL400の1SUBCASE/STEPではTSTEP・TSTEPNL・NLSTEPのうち1つを指定します。','荷重波形はTLOADi等、初期状態はIC等で別に指定します。'],[['TSTEPNL（Bulk）','NDT×DT、出力NO、反復条件。','TSTEPNL']]);
 control('TEMPERATURE','温度場の選択','温度・熱伝導',
  'TEMP/TEMPD等で定義した温度セットを、初期温度・熱荷重・温度依存材料評価に使います。この命令だけでは温度を固定する境界条件にはなりません。',
  'TEMPERATURE(option) = n','TEMPERATURE(INITIAL) = 20\nTEMPERATURE(LOAD) = 30',[
   ['n','TEMP/TEMPD等の温度セットSID。温度値そのものではありません。'],['INITIAL','初期温度。定常非線形熱解析では反復計算の開始温度にも使用。過渡熱のIC指定との適用差を確認します。'],
   ['LOAD','構造の熱ひずみ・等価熱荷重に使う温度場。線形熱膨張の基本はα(T−T0)で、参照温度も必要です。'],['MATERIAL / BOTH','MATERIALは温度依存材料の評価、BOTHはLOADとMATERIALを同じセットで指定。初期・材料・材料カードのTREFとの優先規則を確認します。']],
  [652,653,654,655],['INITIALとMATERIALは同時指定できません。非線形静解析ではMATERIAL/BOTHはfatalとなり、LOADで温度依存特性も更新します。','固定温度はSPC、温度結果の出力はTHERMALです。これらを区別して設定します。'],[['TEMP / TEMPD','温度セットの個別値と既定値。','TEMP'],['THERMAL','温度結果の出力要求。','CASE_THERMAL']]);
 control('THERMAL','温度結果の出力','結果出力',
  '熱解析で計算した温度の出力を要求します。温度の入力セットを選ぶTEMPERATUREとは役割が異なります。',
  'THERMAL(PRINT,SORT1) = ALL','THERMAL(PRINT) = ALL',[
   ['ALL / NONE / n','全点／出力なし／Case SET nに含まれる点。nは温度入力セット番号ではありません。'],['PRINT / PUNCH / PLOT','PRINTまたは省略はF06、PUNCHはPCH、PLOTは結果データベース用。結果ファイル側のPARAM POST等の設定も必要です。'],
   ['SORT1 / SORT2','SORT1は荷重・時刻ごとに各点、SORT2は点ごとに荷重・時刻を並べます。'],['PUNCHの用途','TEMP形式で出力され、SIDはSUBCASE番号（SUBCASEなしは1）。熱解析から構造熱荷重への温度受渡しに利用できます。']],
  [658],['温度の単位系と、熱ひずみに使う参照温度を整合させます。温度差と絶対温度を無条件に交換しません。'],[['SET','対象点を限定。','CASE_SET'],['TEMPERATURE','入力温度の選択。','CASE_TEMPERATURE']]);
 control('FLUX','温度勾配・熱流束の出力','結果出力',
  '熱伝導要素の温度勾配と熱流束を出力します。熱流束は単位面積当たりの熱の流れで、境界全体の熱流量とは異なります。',
  'FLUX(PRINT) = ALL / NONE / n','SET 90 = 1 THRU 20\nFLUX(PRINT) = 90',[
   ['n','Case SETの番号。SETには対象の要素番号を記載。THERMAL用の点番号集合とは区別します。'],['ALL / NONE','全対象要素／出力なし。NONEで共通部の出力要求を取り消せます。'],['熱流束と熱流量','例：熱流束はW/m²、SPCFORCESによる温度境界の熱流量はW。面積積分して比較します。']],
  [416],['過渡熱の全時刻・全要素出力は大きくなるため、結果を確認したい要素と保存間隔を設定します。'],[['MAT4','伝導率と熱物性。','MAT4'],['SET','出力要素を選択。','CASE_SET']]);
 control('IC','初期条件の選択','動解析条件',
  '過渡応答の開始時の変位・速度、または熱伝導の初期温度を選択します。荷重波形や時間刻みは別の指定です。',
  'IC(PHYSICAL) = n\nIC(MODAL) = n\nIC(STATSUB) = n','IC = 80',[
   ['PHYSICAL','既定。構造ではTICの初期変位・速度セット、熱伝導ではTEMP/TEMPDの温度セットを選択します。'],['MODAL','SOL112で使用可能なモード座標の初期条件。物理節点の変位をそのままモード量として入力しません。'],
   ['STATSUB','右辺が静解析SUBCASE番号になります。TICのSIDではありません。DIFFK併記は静解析と差分剛性効果を利用します。']],
  [459,460],['熱ではPHYSICALのみ。時刻0の初期温度と既知温度境界を整合させます。SOL400過渡熱で不一致なら境界温度が優先します。'],[['TEMP','熱の初期温度。','TEMP'],['SOL112','モード法過渡応答。','EXEC_SOL_112']]);
 control('SET','番号リストの定義','識別・サブケース',
  '出力要求等で参照する番号リストを定義します。SET自体に点・要素という固定の種別はなく、参照する命令によって意味が決まります。',
  'SET n = i1, i2, i3 THRU i4 EXCEPT i5','SET 90 = 1 THRU 20 EXCEPT 5, 6\nDISPLACEMENT = 90',[
   ['n','セット番号。リスト中の節点・要素番号とは別です。SUBCASE内で定義すると、そのSUBCASEでだけ有効です。'],['リストの意味','DISPLACEMENT/THERMALから参照すると点番号、STRESS/FLUXなら要素番号。循環対称のHARMONICSでは周方向次数になります。'],
   ['THRU / EXCEPT','THRUは範囲、EXCEPTは直前の範囲の除外。範囲外の番号は追加として扱われるため、意図した集合を確認します。'],['継続','行末をコンマにすると次行へ続きます。最後の行はコンマで終えません。THRUと範囲の終端番号の間では改行しません。']],
  [609,610],['存在しない番号は要求が無視され得ます。件数と結果の対象を確認してください。','Case SETは自由形式。Bulk SET1とは入力位置・用途が異なります。']);
 const blank='未使用';
 const unused='この欄はこの書式では使用しません。空欄を保ち、後ろの項目を左へ詰めません。';
 function fixed(id,title,category,summary,rows,definitions,pages,notes,connections=[],sections=[]){
  const lines=definitions.map((defs,row)=>Array.from({length:10},(_,i)=>{
   if(i===0)return {label:row?'継続':'カード名',help:row?'前行から続く行の識別子。例では前行の第10欄と一致させます。':id+'の識別名。1〜8列に記載します。'};
   if(i===9)return {label:'継続',help:row<rows.length-1?'次行へ続く識別子。次行の第1欄と一致させます。':'この例では最終行なので空欄。追加行の要否と書式はQRGの該当項目を確認します。'};
   const d=defs[i-1];return d?{label:d[0],help:d[1]}:{label:blank,help:unused};
  }));
  entries.push({key:id,id,title,family:'bulk',category,kind:'fixed',summary,rows,lines,page:pages[0],sourcePages:pages,notes,connections,sections});
 }
 fixed('EIGC','複素固有値抽出','固有値・周波数・時間設定',
  'CMETHODで選択する複素固有値抽出条件。例は複素Lanczos法で12根を要求する先頭行です。抽出法に応じたシフト・領域の継続行はQRGで別途指定します。',
  [['EIGC','40','CLAN','MAX','','','','12']],[[
   ['SID','正の整数。Case CMETHODの右辺と一致させます。'],['METHOD','INV：逆べき乗、HESS：Hessenberg、CLAN：複素Lanczos等。IRAMの記載もあります。手法により継続行・収束値の条件が異なります。'],
   ['NORM','規格化。既定MAXは最大成分を実部1・虚部0にします。POINTではG/Cの成分を基準にします。実振幅を1にする指定ではありません。'],['G','POINT規格化の基準点。例のMAXでは不要なので空欄。'],['C','POINT規格化の基準成分。Gと組で指定。MAXでは空欄。'],
   ['E','収束判定値。既定はINVで1E−4、HESSで1E−15、CLANは機種依存。空欄は0指定ではありません。'],['ND0','継続行を使用しない場合の要求根数。第8欄です。継続行でNDjを指定するときはND0を入れません。'],null]],
  [1949,1950,1951,1952],['シフトの実部・虚部の単位はrad/単位時間で、Hzとは異なります。','CLANのシフトは最初の継続行のみ。SOL400の大変位後DCEIG線形摂動ではHESSを避けCLANを推奨する条件があります。'],[['CMETHOD','このSIDを選択。','CASE_CMETHOD']]);
 fixed('NLPARM','非線形静解析の増分・収束','非線形制御',
  '荷重増分、剛性更新、反復上限と収束判定を設定します。例はSOL106で10増分・力と仕事の収束・各増分出力を指定。収束許容値等の継続行は省略し、解法の既定を使います。',
  [['NLPARM','100','10','','AUTO','','25','PW','YES']],[[
   ['ID','Case NLPARMで選択する正の整数。'],['NINC','前SUBCASEからの荷重変化を分割する数。一般既定10、ギャップ・線接触・熱伝導等では1。弧長法では初期弧長に関係し、実増分数とは一致しません。'],
   ['DT','クリープの時間増分。既定0はクリープなし。通常静解析の荷重増分幅ではありません。'],['KMETHOD','剛性更新方法。SOL106の既定AUTO。ITERとKSTEP=1は毎反復更新。FNT/PFNTはSOL400用です。'],
   ['KSTEP','更新周期等。KMETHODにより解釈が変わります。SOL106既定5、SOL400既定10で、例では既定に任せます。'],['MAXITER','1増分の反復上限。通常25。大きくしても収束を保証しません。'],['CONV','U：変位誤差、P：力の釣合い誤差、W：仕事誤差。組合せは全て満たす必要があります。SOL106表の既定PW。SOL400の既定は接触等の条件で異なります。'],['INTOUT','NO：SUBCASE最後、YES：各計算増分、ALL：計算増分とユーザー指定増分。通常既定NO。例はYES。']]],
  [2634,2635,2636,2637,2638,2639],['非収束でも最善解で続行する設定があります。正常終了だけでなく、収束判定と残差を確認します。','SOL400ではNLSTEP推奨。SOL600では適用されるフィールドが限定されます。'],[['Case NLPARM','IDを解析で選択。','CASE_NLPARM']],
  [{title:'追加制御の位置',paragraphs:['第2行はEPSU/EPSP/EPSW（許容誤差）、MAXDIV/MAXQN/MAXLS、FSTRESS、LSTOL。LSTOLは第9欄です。第3行はMAXBISが第2欄、MAXRが第6欄、RTOLBが第8欄、MINITERが第9欄。間の空欄を詰めてはいけません。','収束しない場合は、拘束・接続・単位・材料特性を確認した後に増分幅と更新方法を検討します。許容値を緩める前に、残差の大きさと工学的な影響を判断します。']}]);
 fixed('NLSTEP','非線形ステップ・固定増分','非線形制御',
  'SOL400等のステップ時間、増分制御、収束・出力を設定します。例は全時間1.0を20個の固定増分に分け、各増分で出力する基本形です。静的な擬似時間か実時間かはANALYSISに従います。',
  [['NLSTEP','10','1.0','','','','','','','+N1'],['+N1','FIXED','20','1']],[[
   ['ID','Case NLSTEPで選択する番号。'],['TOTTIME','ステップの全時間。既定1.0。FIXEDなら1増分はTOTTIME/NINC。'],['CTRLDEF','制御の既定セットを選ぶ欄。例は省略して解法の既定を使用。既定だけで必要な過渡時間分解能が得られるとは限りません。'],null,null,null,null,null],
   [['TYPE','この行はFIXEDキーワード。固定増分の制御行であることを示します。'],['NINC','全時間を分割する増分数。例は20なので増分時間0.05。'],['NO','結果の出力間隔。例は1で各増分。計算増分を大きくする欄ではありません。'],null,null,null,null,null]],
  [2651,2652,2653],['LCNT/FIXED/ADAPT/ARCLNは1荷重ケースでいずれか。GENERAL/MECH/HEAT等は別の制御行です。','過渡解析では適切な増分数・初期時間刻みを明示します。CTRLDEFの既定だけに任せないでください。'],[['Case NLSTEP','配置とNLPARMに対する優先順位。','CASE_NLSTEP']]);
 fixed('TSTEPNL','非線形過渡の時間増分・反復','非線形制御',
  '非線形過渡の解析時間、初期刻み、出力間隔、反復を設定します。例はSOL129/159用ADAPTで、全時間1.0、初期刻み0.01。刻み調整により実ステップ数は変わります。',
  [['TSTEPNL','200','100','0.01','1','ADAPT','2','10','PW']],[[
   ['ID','Case TSTEPNLまたはTSTEPで選ぶ番号。'],['NDT','3より大きい整数。NDT×DTが解析時間。例は100×0.01=1.0。自動刻みの実ステップ数ではありません。'],['DT','正の初期時間刻み。時間単位を荷重・密度・剛性等と整合させます。'],['NO','結果の出力間隔。既定1。出力を間引く欄で、計算時間刻み自体ではありません。'],
   ['METHOD','SOL129/159はADAPTのみ、既定もADAPT。SOL400の他の方法を無条件に転用しません。'],['KSTEP','ADAPTでは剛性更新間の収束済み二分割解の数。既定2。ITERでの反復更新周期とは意味が異なります。'],['MAXITER','ADAPTの反復上限、既定10。刻み・モデルの不適切さを上限値だけで解決しません。'],['CONV','U：変位、P：力、W：仕事の収束判定。SOL129/159既定PW。組合せた条件を全て満たす必要があります。']]],
  [3321,3322,3323,3325],['SOL129/159の複数SUBCASEは時間的に連続します。前SUBCASE終端を引き継ぎます。','継続行のSOL129/159の既定許容値はEPSU=1E−2、EPSP=1E−3、EPSW=1E−6。変更は収束と結果への影響を確認して行います。','ADAPTの自動時間調整は主に応答を基準にするため、短い荷重パルスを十分に追えない場合があります。初期DTをパルス幅より十分小さくし、必要に応じ継続行のADJUST=0で自動増大を抑えます。'],[['Case TSTEPNL','選択とTSTEPとの関係。','CASE_TSTEPNL']]);
 fixed('MAT4','等方性熱物性','材料',
  '等方性の熱伝導率、比熱、密度等を定義します。構造用MAT1のヤング率・ポアソン比とは別の物性です。例はm–kg–s–K系のK=45、CP=460、RHO=7800です。',
  [['MAT4','15','45.','460.','7800.','','','','','+M1'],['+M1']],[[
   ['MID','材料番号。MAT4/MAT5間で重複できません。熱伝導要素に対応するプロパティ等から参照します。'],['K','熱伝導率。例は45 W/(m·K)。温度差に応じて熱を伝える性質で、熱容量ではありません。'],['CP','質量当たりの比熱。例は460 J/(kg·K)。空欄可ですが、過渡熱の蓄熱評価にはCP×RHOが必要です。'],
   ['RHO','密度。既定1.0なので、実材料を扱う場合は単位系に合う値を明示します。例は7800 kg/m³。'],['H','自然対流の熱伝達率。対流境界カードと組み合わせます。固体の伝導だけを扱う例では空欄。'],['MU','粘性係数。強制対流流体では必要。固体の伝導だけなら空欄です。'],['HGEN','QVOLと使う発熱能力係数。既定1.0。体積発熱量そのものをこの欄だけで与える説明は誤りです。'],['REFENTH','基準エンタルピー。CP一定なら温度0、表指定なら表の最初の温度での値。例は省略します。']],
   [['TCH','相変化温度の下限。相変化を扱わないこの例では空欄。'],['TDELTA','相変化の温度幅。TCHからの範囲を定義。相変化を扱わないので空欄。'],['QLAT','質量当たりの潜熱。相変化に必要な熱量。例では相変化を扱わないため空欄。'],null,null,null,null,null]],
  [2255,2256],['この例の第2行は、空欄にも意味があることを確認するために表示しています。相変化を扱わない通常の入力では、第1行の継続識別子と第2行を省略できます。','過渡熱の時間応答は伝導率だけで決まりません。CPとRHOによる蓄熱を設定します。'],[['SOL159','過渡熱の時間条件。','EXEC_SOL_159']]);
 fixed('TEMP','節点ごとの温度','温度・熱伝導',
  '温度セット内で、指定した節点の温度を定義します。TEMPDによる全体の既定温度に対して、一部の節点だけ別の値を与える用途にも使います。',
  [['TEMP','20','1','373.15','3','293.15']],[[
   ['SID','温度セット番号。TEMPERATUREまたはICから用途に応じて参照します。'],['G1','温度を個別指定する1番目の節点番号。例は節点1。'],['T1','G1の温度。例は373.15 K。空欄を0度の意味で使用しません。'],['G2','2番目の節点番号。例は節点3。'],['T2','G2の温度。例は293.15 K。'],['G3','3番目の節点番号。この例ではペアを使用しないため空欄。'],['T3','G3の温度。G3を指定しないので空欄。'],null]],
  [3256,3257],['TEMPは温度データの定義です。既知温度を固定する境界条件にはSPCを使います。','定常熱のINITIAL、過渡熱のIC、構造熱荷重のTEMPERATURE(LOAD)では同じ温度データでも役割が異なります。'],[['TEMPD','個別指定がない節点の既定温度。','TEMPD'],['TEMPERATURE','初期・荷重・材料温度の選択。','CASE_TEMPERATURE']]);
 fixed('TEMPD','温度セットの既定温度','温度・熱伝導',
  'TEMP等で個別に与えていない節点の温度を、温度セット単位で補います。1行で最大4つの別々の温度セットに既定温度を定義できます。',
  [['TEMPD','20','293.15']],[[
   ['SID1','1番目の温度セット番号。節点番号ではありません。'],['T1','SID1の既定温度。例はセット20の全体既定293.15 K。同じSIDのTEMPが個別に上書きします。'],
   ['SID2','2番目の別の温度セット番号。この例では不要なので空欄。節点2を示す欄ではありません。'],['T2','SID2の既定温度。ペアを使わないので空欄。'],['SID3','3番目の温度セット番号。例では空欄。'],['T3','SID3の既定温度。例では空欄。'],['SID4','4番目の温度セット番号。例では空欄。'],['T4','SID4の既定温度。例では空欄。']]],
  [3264,3265],['構造の熱負荷に使うSIDは他のLOAD型IDと重複させません。','要素温度を直接与える入力がある場合は、節点温度平均より直接要素温度が優先します。'],[['TEMP','同じSIDの個別温度が既定値より優先。','TEMP']]);
 // Strengthen already indexed selectors without duplicating their cards.
 const enrich={
  CASE_SPC:{connections:[['SPC / SPC1','変位値を含む拘束／ゼロ拘束集合。','SPC1'],['SPCADD','複数セットを1つのSIDへまとめる。','SPCADD']],notes:['同じSIDのSPC/SPC1は同一セットとして選択されます。節点GRIDのPSによる恒久拘束はSPCの選択とは別です。','SPCは自由度の変位を指定するもの。剛体結合や多点拘束による自由度間の関係とは異なります。熱解析では温度境界として使用します。']},
  CASE_LOAD:{connections:[['Bulk LOAD','全体倍率と各セット倍率で複数の静荷重を線形結合。','LOAD'],['FORCE','SIDと荷重点、座標系、倍率、方向ベクトルを定義。','FORCE']],notes:['Case LOADの右辺は荷重の大きさではありません。BulkのSIDに接続して初めて荷重が決まります。','同じSIDを持つFORCE等は同じ荷重集合です。合力・モーメントを確認し、意図しない重複を見つけます。']},
  CASE_DLOAD:{connections:[['DLOAD','動荷重の全体倍率・個別倍率と参照先SID。','DLOAD'],['RLOAD1','周波数応答の複素荷重。','RLOAD1'],['TLOAD1','過渡応答の時間波形。','TLOAD1']],notes:['空間分布（どの自由度に作用するか）と時間・周波数波形を分けて定義します。DLOADの番号だけで荷重振幅は決まりません。','Case LOADとDLOADを入れ替えるだけでは、静荷重が時間依存荷重に変換されるわけではありません。']},
  CASE_METHOD:{connections:[['EIGRL','探索範囲・抽出数・規格化。','EIGRL'],['CMETHOD','複素固有値抽出には別の選択。','CASE_CMETHOD']],notes:['SOL103/111/112等の実モードと、SOL105の座屈固有値で利用します。同じEIGRLでもV1/V2は前者では周波数、後者では荷重係数です。','モード法では抽出範囲と応答計算の周波数範囲が別です。応答に必要なモードが基底に含まれるか確認します。']},
  CASE_FREQUENCY:{connections:[['FREQ1','開始値・刻み・増分数から周波数列を定義。','FREQ1']],notes:['FREQUENCYのSIDは加振の計算点を選びます。METHOD/EIGRLの固有値探索範囲を指定する命令ではありません。','共振ピークを拾える間隔を設定します。範囲を広げても刻みが粗いとピークは正確になりません。']},
  CASE_TSTEP:{connections:[['TSTEP','線形過渡のN・DT・NO。','TSTEP'],['TSTEPNL','非線形過渡の時間刻み・収束。','TSTEPNL']],notes:['荷重の時間波形はTLOAD1/TABLED1等で別に指定します。出力間隔NOと計算時間刻みDTを区別します。','Case TSTEPはBulk TSTEPNLも選択可能。SOL400の1SUBCASE/STEPではTSTEP・TSTEPNL・NLSTEPのうち1つを使います。']},
  CASE_SDAMPING:{connections:[['TABDMP1','周波数に対する減衰値とTYPE。','TABDMP1'],['PARAM KDAMP','モード減衰の扱いを指定。','PARAM_KDAMP']],notes:['TABDMP1のG・CRIT・Qはそれぞれ異なる減衰の定義。例えば小減衰の1自由度でg≈2ζ、Q≈1/(2ζ)の関係があるため、同じ値をそのまま移しません。','材料GE、PARAM G、CDAMPi等の減衰も併用する場合は、同じ物理的な減衰を重複計上していないか確認します。']}
 };
 for(const [key,extra] of Object.entries(enrich))Object.assign(window.INPUT_CONTROLS.find(e=>e.key===key),extra);
 window.INPUT_REFERENCES=entries;
})();
