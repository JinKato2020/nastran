(() => {
 'use strict';
 const C=window.AnalysisResponseCore,L=window.AnalysisResponseLabs,S=window.AnalysisScenarios,G=window.AnalysisModelGuides,Q=window.AnalysisModelQuizzes;
 const {n,p,f,table,source,question}=window.AnalysisEigenLessonHelpers;
 const qrg=(pg,title)=>source('Quick_Reference_Guide',pg,title),dyn=(pg,title)=>source('Dynamic_Analysis_User_Guide',pg,title);
 const beamStructure=[['GRID','G1〜G13の位置と変位座標。観測するT3は全体Zとそろえます。'],['CBEAM','EID101〜112、PID20。支持・メッシュ・向きは解法比較で共通です。'],['PBEAM','PID20→MID70。断面36×6 mm、弱軸I=648 mm⁴。'],['MAT1','E=70,000 MPa、ν=0.33、ρ=2.70×10⁻⁹ tonne/mm³。質量密度と重量密度を混同しません。'],['SPC1','SID10で根元G1の123456固定。先端G13/T3は自由です。'],['PARAM_COUPMASS','既存梁では1。質量定式化を比較途中で変えません。'],['PARAM_GRDPNT','任意に0を指定し、総質量0.000209952 tonneと照合します。']];
 const twoStructure=[['GRID','G1・G2をX方向だけ動く質点位置として定義します。'],['SPC1','SID10で両点の23456を拘束。動かしたいT1は拘束しません。'],['CONM2','各GRIDに1 kg。N・m・s・kg系の比較です。N・mm・s系の値をそのまま移しません。'],['CELAS2','地面–G1、G1–G2、G2–地面の3本、各K=400 N/m。成分1を結び、地面側はG=0。物性・材料カードはこの集中ばねには不要です。']];
 const outputs=[['CASE_DISPLACEMENT','振幅・位相または実部・虚部を周波数ごとに出力します。SORT1/2は並び順、PHASE/REALは表現形式で、別の解析ではありません。'],['CASE_VELOCITY','必要時に速度。複素振幅はv=iωu。変位と同位相ではありません。'],['CASE_ACCELERATION','必要時に加速度。a=−ω²u。N・mm・s系ではmm/s²で、g単位ではありません。'],['CASE_FORCE','ばね力・梁断面力など。変位の収束だけで局所力の収束を代用しません。'],['CASE_SPCFORCES','拘束の反力を確認。動解析では外力だけでなく慣性力・減衰力も含めて釣合います。'],['PARAM_POST','必要時に結果ファイルへ出力。計算周波数や出力要求そのものの代用ではありません。']];
 function cards(sol,{two=false,count=0,g=.04,coarse=false}={}){
  return [
   ['解析・条件の選択',[['EXEC_SOL_'+sol,sol===108?'拘束後の物理変数で各周波数の複素連立方程式を解きます。':'選んだ実モードへ縮約して周波数応答を解きます。'],['EXEC_CEND','Executiveを終えてCase Controlへ移ります。'],['CASE_SUBCASE','荷重、拘束、周波数、出力を同じケースで対応させます。'],['CASE_SPC','SPC=10で支持条件を選択します。'],['CASE_DLOAD','DLOAD=50。単独荷重ならRLOAD1 SID50を直接選択。複数荷重の比較ではBulk DLOAD SID50を選択します。'],['CASE_FREQUENCY','FREQUENCY=60は加振周波数セット。固有モードを選ぶMETHODとは別です。']]],
   ['モデル・質量・支持',two?twoStructure:beamStructure],
   ['荷重の場所・大きさ・位相',two?[
    ['DLOAD','SID50からRLOAD1の511・512を係数1で合成。S×Siも掛かるため二重倍率を確認。G1だけの比較では512側の係数を0にします。'],
    ['RLOAD1','511→EXCITEID521、512→522。両方TC=530。第2荷重だけDPHASE=541で位相を参照します。'],
    ['DAREA','SID521はG1/C1へ1 N、522はG2/C1へ1 N。荷重の空間分布であり周波数表ではありません。'],
    ['DPHASE','SID541のG2/C1に位相0°または180°。位相進みの指定。整数541はカード参照、RLOAD1へ180.と実数で直接書く場合とは区別します。'],
    ['TABLED1','TID530：全周波数で実部倍率1。横軸はHz、RLOAD1のTCから参照。'],
    ['DELAY','必要時だけ時間遅れτを指定。位相への寄与は−2πfτで周波数に依存し、一定の180°とは異なります。']
   ]:[
    ['RLOAD1','SID50→EXCITEID51、TC52。C(f)+iD(f)を定義。この基準はC=1、D=0、遅れと位相進み0。'],
    ['DAREA','SID51、G13、C3、A=1 N。振幅の符号と観測方向を確認。'],
    ['TABLED1','TID52の横軸は周波数、縦軸は倍率1。値1を荷重1 Nと二重に掛けないようにします。'],
    ['RLOAD2','振幅B(f)と位相φ(f)で与える代替形式。RLOAD1の実部・虚部の表をそのまま使いません。'],
    ['DPHASE','必要時の位相進みを度で与えます。実数の直接値と整数のカード参照を区別。'],
    ['DELAY','必要時の時間遅れ。fがHzならτはs。位相と遅れの両方を意図せず重ねないようにします。']]],
   ['周波数・減衰・基底',[
    ['FREQ1',two?'SID60で0〜8 Hzを細分。必要な2つの共振と中間の谷を含めます。':coarse?'SID60：F1=11、DF=2、NDF=30で31点、最後は71 Hz。':'SID60：F1=10、DF=0.5、NDF=120で121点、最後は70 Hz。'],
    ['FREQ','共振近傍や比較したい周波数を個別に追加する選択肢。重複周波数の扱いは使用版で確認します。'],
    ['PARAM_G','この比較の構造減衰G='+g+'。2%の粘性減衰比を値2として入れません。G≈2ζは小減衰・共振付近の対応であり全周波数で同じ減衰則ではありません。'],
    ...(sol===111?[
     ['CASE_METHOD','METHOD=30→EIGRL SID30。これは基底を求める範囲・数です。'],
     ['EIGRL',two?'ND=1または2。第1モードは同方向、第2モードは逆方向に動きます。':'既存のND='+count+'は全方向の低い'+count+'モード。弱軸曲げだけの次数とは区別します。'],
     ['CASE_RESVEC','基底打切りだけを比較する既存梁はRESVEC=NO。実務で常に無効にする指示ではありません。静的補完で何が改善し、何が残るか確認します。'],
     ['CASE_SDAMPING','モード減衰を別途与えるときにTABDMP1のTIDを選択。今回のPARAM,Gに無意識に追加すると減衰を重ねます。'],
     ['TABDMP1','TYPE=CRITはζ、Gは減衰係数、Qは品質係数。横軸はモードの固有振動数です。今回の比較では未使用。'],
     ['PARAM_KDAMP','モード減衰を粘性／構造減衰として扱う指定を照合します。GとCRITの単位選択とは別です。']
    ]:[]) ]],
   ['出力の照合',outputs]
  ];
 }
 const info={
  'dfreq-coarse':{key:'direct-frequency',title:'粗い周波数刻み：共振を見落とす',lab:'sweep',point:'計算が正常終了しても、計算点の間にある共振ピークは出力されません。',change:'11〜71 Hz、2 Hzごと。減衰G=0.04と梁は固定。',mistake:['最大値が小さいから共振しないと判断した','37 Hzと39 Hzの間に第1共振があります。固有値で位置を調べ、その周辺を細分して最大振幅と位相の収束を確認します。']},
  'dfreq-fine':{key:'direct-frequency',title:'細かい周波数刻み：振幅と位相を読む',lab:'sweep',point:'振幅の山だけでなく位相変化を確認し、複素変位・片振幅・RMSを区別します。',change:'10〜70 Hz、0.5 Hzごと。共振付近はさらに細分して比較します。',mistake:['REAL列の最大値を振幅とした','振幅は√(REAL²+IMAG²)。共振近傍では実部が小さく、虚部が大きい場合があります。位相も同じ加振基準で読みます。']},
  'dfreq-low-damping':{key:'direct-frequency',title:'小さい減衰：同じ刻みでは足りない',lab:'sweep',point:'減衰を1/10にすると共振が高く狭くなり、以前の刻みでは最大値を捉えにくくなります。',change:'理論比較だけGを0.04→0.004。初期の周波数刻みは0.5 Hzのまま。',mistake:['Gを小さくしたのにピークが10倍にならず不具合と思った','計算点がピークを外れている可能性があります。半値幅の目安Gf₁は約0.15 Hz。固有値近傍に点を追加し、数値と物理条件の変更を分けます。']},
  'dfreq-phase':{key:'direct-frequency',title:'2点加振：荷重の位相で励起モードが変わる',lab:'two',two:true,point:'同じ1 Nを2点に加えても、同位相と逆位相では励起するモードが変わります。',change:'独立した対称2質点系。荷重位相を0°／180°、または片側だけへ切り替えます。',mistake:['荷重の振幅だけを足して常に2 Nとして扱った','離れた2点の荷重は位置と位相を保ったベクトルです。同位相は対称モード、逆位相は逆対称モードを励起します。']},
  'mfreq-one':{key:'modal-frequency',title:'1モード：共振が合っても全域は合わない',lab:'beam-modal',count:1,point:'第1共振を捉えられても、低周波の柔らかさや局所力まで十分とは限りません。',change:'既存梁のEIGRL ND=1、RESVEC=NO。加振・周波数・Gは直接法と同じ。',mistake:['10 Hzの振幅は静たわみより必ず小さいと思った','10 Hzでは動的増幅も起きています。「同じ周波数での全モード解との差」と「周波数0での静たわみとの差」を分けます。']},
  'mfreq-six':{key:'modal-frequency',title:'複数モード：出力ごとに収束を確かめる',lab:'beam-modal',count:6,point:'NDの数字ではなく、加振方向・最高保持振動数・観測する応力や反力まで確認します。',change:'既存梁のND=6。1モード比較と同じRESVEC=NO。',mistake:['最高加振周波数の2倍まで入れれば必ず十分と思った','上限倍率は目安であって保証ではありません。局所荷重や応力は高次の寄与を受けます。基底数を増やし、同じ点・同じ成分の変化で判断します。']},
  'mfreq-antisymmetric':{key:'modal-frequency',title:'逆位相荷重：必要なモードを捨てる',lab:'two',two:true,count:1,point:'荷重と直交する第1モードしか残さないと、動くはずの系が応答0になります。',change:'対称2質点に逆位相の1 N。基底を第1モードだけ／全2モードで比較。',mistake:['結果0なので構造が十分硬いと思った','φ₁ᵀF=0で、残したモードへ荷重が入りません。第2モードを含めると応答が現れます。荷重方向とモード形を照合します。']},
  'mfreq-antiresonance':{key:'modal-frequency',title:'反共振：モード間の相殺を失う',lab:'two',two:true,count:1,point:'応答が小さい谷は、複数のモードが逆位相で相殺して生じる場合があります。',change:'G1だけに1 N、G1のu₁を観測。第1モードだけと全2モードを比較。',mistake:['大きなモードの振幅だけを足した','モード寄与は符号と位相を持ちます。複素成分を加えてから振幅を求めます。G2を観測すると同じ位置に同じ谷が出るとは限りません。']}
 };
 for(const [id,d]of Object.entries(info)){
  const s=S[d.key],existing=s.models.find(m=>m.id===id),m=existing||{id,diagram:d.two?(id==='mfreq-antiresonance'?'response-single':'response-pair'):'harmonic',theoretical:true};
  if(!existing)s.models.push(m);
  const modal=d.key==='modal-frequency',gg=id==='dfreq-low-damping'?.004:.04;
  m.title=d.title;m.takeaway=d.point;
  m.diagramCaption=d.two?'青い両端は地面。3本のばねは各400 N/m、2質点は各1 kg。G1とG2はX方向だけ動けます。赤は荷重、u₁・u₂は観測変位。':'青い左端G1を123456固定し、自由端G13/T3へ振幅1 N。図は変形結果ではなく、支持・荷重・観測位置の模式図です。';
  m.conditions=[['モデルと単位',d.two?'N・m・s・kg。各質点のX以外を拘束。地面ばね2本と連結ばね1本。':'N・mm・s・tonne。L=360 mm、断面36×6 mm、E=70,000 MPa、ρ=2.70×10⁻⁹ tonne/mm³。'],['比較で変えるもの',d.change],['固定するもの',d.two?'質量・3本のばね剛性・支持・構造減衰G=0.04。':'支持、材料、断面、質量、加振方向。変更項目以外は共通。'],['数値の位置づけ',d.two?'図中の2自由度行列を独立計算した理論比較です。完成入力ファイルやNastran実行結果ではありません。':'操作図は一様梁の弱軸曲げ理論。既存CBEAMモデルの実行結果ではなく、せん断・回転慣性・他方向のモードは含みません。']];
  m.results=[d.point,d.two?'f₁=3.18310 Hz（同方向）、f₂=5.51329 Hz（逆方向）をモード形とセットで確認します。':'G13のT3について、同じ加振周波数で振幅・位相を照合します。f₁≈38.1 Hzは弱軸梁理論の目安です。',modal?'保持モードと残余ベクトルの設定を記録し、変位・加速度・力を別々に収束確認します。':'共振付近の周波数を細分し、計算点の最大値が収束するかを調べます。','加速度の振幅は同じ成分でω²|u|。大きさだけでなく符号・位相・単位も対応させます。'];
  m.check=[['CASE_FREQUENCY','周波数の選択'],['FREQ1','周波数間隔'],['CASE_DLOAD','荷重セット'],['RLOAD1','荷重の複素係数'],['PARAM_G','減衰'],['CASE_DISPLACEMENT','出力形式'],...(modal?[['CASE_METHOD','基底選択'],['EIGRL','保持モード'],['CASE_RESVEC','補完の有無']]:[])];
  G[id]={items:[d.point,d.change,'誤った指定 → 形と数値の変化 → 入力の選び直し → 結果での確認を対応させます。'],
   explanation:()=>p(d.point)+p('定常調和応答ではu(t)=Re[Ûeⁱʷᵗ]と置きます。1回微分でiω、2回微分で−ω²が掛かります。')+
    f('Mü + Bu̇ + Ku = P(t) → [K − ω²M + iωB]Û = P̂')+
    p('全体の構造減衰Gを使う今回の比較では粘性Bを別途加えず、Kを(1+iG)Kへ置き換えます。fはHz、ω=2πfはrad/s。振幅は|Û|、位相はatan2(ImÛ,ReÛ)です。')+
    f('[(1+iG)K − ω²M]Û = P̂、|Û| = √[(ReÛ)²+(ImÛ)²]')+
    (modal?p('Û≈Φqと置いてΦᵀを掛けます。M̄=ΦᵀMΦ、K̄=ΦᵀKΦ、P̄=ΦᵀP̂。全基底なら座標変換、切り捨てれば近似です。局所減衰などがある場合は減衰行列が対角になるとは限りません。')+
     f('[(1+iG)K̄ − ω²M̄]q = P̄ → Û≈Φq'):p('SOL 108では実モードの打切りをせず、各周波数で拘束後の物理変数系を解きます。ただしメッシュ・拘束・荷重・周波数点の誤りは残ります。'))+
    (d.two?p('この系ではM=I kg、K=[[800,−400],[−400,800]] N/m。対称形φ₁=[1,1]/√2と逆対称形φ₂=[1,−1]/√2を代入すると、λ₁=400、λ₂=1200 s⁻²です。')+
      f('P̂=[1,1] → P̄=[√2,0] ／ P̂=[1,−1] → P̄=[0,√2]')+
      p('逆位相の荷重は第1モードに入らず、第2モードだけを励起します。一方、片側荷重では両方が励起され、観測点の複素寄与が相殺する反共振も生まれます。')+
      p('無減衰でG1だけを加振すると、u₁=(800−ω²)/[(400−ω²)(1200−ω²)]。分子が0になるω²=800が谷ですが、u₂の分子は400なので同じ谷ではありません。減衰ありでは谷底は0から離れます。'):
      p('一様片持ち梁の弱軸曲げはcoshβ cosβ=−1を満たし、ωⱼ=βⱼ²√(EI/ρA)/L²。先端加振・先端観測では、先端を1とする各モードの一般化質量がρAL/4となります。')+
      f('Û_tip = Σⱼ [4P̂/(ρAL)] / [(1+iG)ωⱼ²−ω²]')+
      p('操作図はこの理論を弱軸8モードまで加算しています。G→0・f→0の全モード極限はPL³/(3EI)。第1弱軸だけの静たわみ寄与は約97.1%ですが、10 Hzなど有限周波数の振幅を静たわみと直接同一視しません。'))+
    L.render(id,d.lab)+
    (d.lab==='sweep'?p('構造減衰1モード近似では半値幅は小減衰時にΔf≈Gf₁。半値は振幅が最大の1/√2で、1/2ではありません。刻みはこの幅より十分細かくし、最大値の収束を確認します。'):
     modal?p('モード形の全体倍率を変えても、一般化質量・荷重・復元を整合させれば物理応答は変わりません。規格化されたモードの最大値1を、実際の変位1 mmと解釈しません。'):''),
   inputReview:cards(modal?111:108,{two:d.two,count:d.count,g:gg,coarse:id==='dfreq-coarse'}),
   verify:['SOL 103で質量、支持、注目モードの方向と固有振動数を確認します。','Case DLOAD→RLOADi→空間分布とTABLEDiをたどり、倍率・符号・位相・単位を照合します。','FREQUENCYの範囲・点数・刻み、減衰の種類と重複を確認します。',modal?'同じ周波数・同じ物理条件の直接法と比較し、基底と残余ベクトルを段階的に変えます。':'共振付近を細分し、最大値と位相変化が安定するかを確認します。','出力位置・成分・複素形式をそろえ、変位だけでなく評価したい力・応力・加速度を確認します。'],
   resultExtra:()=>table(['照合する量','意味と確認'],[['複素振幅','実部・虚部を合成。異なる周波数の最大値を同時に起きる値として足しません。'],['片振幅・RMS','単一の正弦波ならRMS=片振幅/√2、両振幅=2×片振幅。ランダム振動へそのまま使いません。'],['位相','同じ荷重基準で比較。−180°と+180°の折返しは不連続な物理変化とは限りません。振幅0では位相を定義しません。'],['動的釣合い','外力＋支持反力と慣性・減衰・内部力の対応。反力振幅だけを静解析のように加算しません。']]),
   pitfalls:[d.mistake,['METHODの上限とFREQUENCYの上限を混同した','METHODはモード基底、FREQUENCYは実際に応答を計算する周波数。SOL 108にモード基底は不要です。'],['2%をG=2と入力した','百分率を小数へ直した上で、Gとζの定義を確認します。G=.04とζ=.02は共振付近の小減衰対応です。'],['実部が負なので振幅を負と報告した','振幅は非負で、符号と時間のずれは位相に含まれます。実部の符号を荷重の向きだけで説明しません。'],['大きいモードだけを絶対値で足した','複素成分を加えてから絶対値を取ります。先に絶対値を取ると反共振や相殺を失います。']]
  };
 }
 for(const key of ['direct-frequency','modal-frequency']){
  const s=S[key],modal=key==='modal-frequency';
  s.summary=modal?'荷重・観測点と保持モードを対応させ、打切り・相殺・基底収束を確認します。':'計算周波数・減衰・荷重位相が、見える共振と応答にどう影響するかを比較します。';
  s.shared='梁の比較と2質点の比較は別モデルです。それぞれの中で、変更項目以外の物理条件をそろえます。';
  s.columns=['比較モデル','変更する条件','確認する失敗'];s.rows=s.models.map(m=>[m.title,info[m.id].change,info[m.id].mistake[0]]);
  s.compare='同じ位置・方向・周波数・減衰・荷重で照合します。正常終了と、必要な応答を捉えたことは別です。';
  s.sources=[dyn(140,'直接周波数応答'),dyn(149,'モード法と減衰'),dyn(186,'応答点の選定'),qrg(2777,'RLOAD1'),qrg(2780,'RLOAD2'),qrg(1895,'FREQ1'),qrg(2937,'TABDMP1')];
  const common=window.AnalysisScenarioGuides[key];
  common.basics=[['この記事で分かること',[s.summary,'入力の参照先と出力の意味をつなげます。','必要な応答を落とす指定を、条件比較と4択で見分けます。']],['対象とする応答',['線形の定常調和応答。初期状態から立ち上がる時間波形は過渡応答で調べます。','一次資料は入力仕様の確認に使い、図・理論計算・問題は独立して記述しています。']]];
  common.terms=[['fとω','Hzとrad/s。ω=2πf。'],['複素振幅','振幅と位相を1つの数で表す。'],['反共振','指定した加振・観測の組合せで応答が小さくなる谷。'],['保持モード','縮約へ残す実モード。荷重と観測の両方に関係。']];
  common.steps=G[s.models[0].id].verify;
 }
 // Theory-only maps use the same rendering/data schema as all other analyses.
 function mapTwo(id,sol){
  const node=(id,label,card,detail)=>({id,label,card,detail}),edge=(from,to,label)=>({from,to,label});
  const panel=(title,nodes,edges,layers,note)=>({title,nodes,edges,layers,note});
  const panels=[
   panel('2質点・支持・ばね',[node('grid','GRID','GRID','G1・G2 / T1だけ自由'),node('mass','CONM2','CONM2','各1 kg'),node('spring','CELAS2','CELAS2','3本 / 各400 N/m'),node('spc','SPC','CASE_SPC','選択値10'),node('spc1','SPC1','SPC1','SID10 / 両点23456')],[edge('mass','grid','接続'),edge('spring','grid','端点・成分1'),edge('spc','spc1','SID10'),edge('spc1','grid','拘束')],[['mass','spring','spc'],['spc1'],['grid']],'地面側のばね端点は0。物性・材料カードを介さずKを指定します。'),
   panel('複数荷重の参照',[node('case','DLOAD','CASE_DLOAD','選択値50'),node('sum','DLOAD','DLOAD','SID50 / 511・512を合成'),node('a','RLOAD1','RLOAD1','SID511 / EXCITEID521'),node('b','RLOAD1','RLOAD1','SID512 / EXCITEID522 / DPHASE541'),node('load','DAREA','DAREA','521:G1/C1、522:G2/C1 / 各1 N'),node('table','TABLED1','TABLED1','TID530 / 実部倍率1'),node('phase','DPHASE','DPHASE','SID541 / G2/C1 / 0°または180°')],[edge('case','sum','SID50'),edge('sum','a','L1=511'),edge('sum','b','L2=512'),edge('a','load','521'),edge('b','load','522'),edge('a','table','TC530'),edge('b','table','TC530'),edge('b','phase','541')],[['case'],['sum'],['a','b'],['load','table','phase']],'片側加振では512側係数を0。位相は荷重ごとに対応します。'),
   panel('周波数・出力',[node('sol','SOL '+sol,'EXEC_SOL_'+sol,'解法'),node('freq','FREQUENCY','CASE_FREQUENCY','選択値60'),node('f','FREQ1','FREQ1','SID60 / 0〜8 Hzを細分'),node('g','PARAM,G','PARAM_G','0.04'),node('u','DISPLACEMENT','CASE_DISPLACEMENT','G1/G2 T1の複素変位')],[edge('freq','f','SID60')],[['sol','freq'],['f','g','u']],'数値は理論比較。入力ファイルを実行済みとは扱いません。')
  ];
  if(sol===111)panels.push(panel('保持モード',[node('m','METHOD','CASE_METHOD','選択値30'),node('e','EIGRL','EIGRL','SID30 / ND1または2'),node('r','RESVEC','CASE_RESVEC','打切り比較はNO')],[edge('m','e','SID30')],[['m','r'],['e']],'基底を変える比較。全2モードなら同じ有限自由度系で直接法に一致。'));
  window.AnalysisRelationMaps[id]={scope:'独立した2自由度の理論比較に対応する設定例。実行済み入力ファイルではありません。',panels};window.AnalysisScenarioRelationKeys.push(id);
 }
 for(const id of ['dfreq-phase','mfreq-antisymmetric','mfreq-antiresonance'])mapTwo(id,id==='dfreq-phase'?108:111);
 const low=JSON.parse(JSON.stringify(window.AnalysisRelationMaps['dfreq-fine']));low.scope='既存の梁からGだけを0.004へ変更した理論比較の構成。新規DATは未収録。';
 for(const panel of low.panels)for(const node of panel.nodes)if(node.card==='PARAM_G')node.detail='値=0.004';
 window.AnalysisRelationMaps['dfreq-low-damping']=low;window.AnalysisScenarioRelationKeys.push('dfreq-low-damping');
 window.AnalysisResponseLessonHelpers={n,p,f,table,source,qrg,dyn,question,beamStructure,outputs};
})();