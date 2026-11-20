(() => {
 'use strict';
 const C=window.AnalysisModalOutputCore,A=window.LessonArticle,U=window.BeamLabs.ui,G=window.BeamLabs.graphics;
 const n=x=>Number(x.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:7}),states=new Map();
 const p=s=>'<p>'+s+'</p>',f=s=>'<p class="element-formula">'+s+'</p>',table=A.table,h3=(s,id)=>'<h3'+(id?' id="'+id+'"':'')+'>'+s+'</h3>';
 const ordered=items=>'<ol class="analysis-steps">'+items.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
 const card=(key,label=key)=>'<a href="bulk.html#'+key+'">'+label+'</a>';
 const links=()=>'<div class="analysis-links">'+[['EIGRL','EIGRL：NORM'],['EIGR','EIGR：NORM'],['CASE_MEFFMASS','MEFFMASS：刺激係数・有効質量'],['CASE_DISPLACEMENT','DISPLACEMENT：モード形'],['PARAM_GRDPNT','GRDPNT：総質量'],['PARAM_WTMASS','WTMASS：質量換算']].map(([id,label])=>card(id,label)).join('')+'</div>';
 const report=window.AnalysisF06Reader;
 const key=s=>'<code class="f06-key">'+s+'</code>';

 // The F06 is a Z-axis boom; the app's beams run along X. Say so before any direction is read.
 const axisMap=()=>table(['振動の種類','F06 のブーム（軸 = 基本Z）','アプリの梁（軸 = 基本X）'],[
  ['曲げ','T1・T2（断面が対称なので同じ振動数の対）','T3（弱軸、主に読む方向）と T2（強軸）'],
  ['軸方向の伸び縮み','T3（10次）','T1'],
  ['軸まわりのねじり','R3（7次）','R1']
 ],{caption:'方向の読み替え',narrow:true});
 const context={
  baseline:'選択中の片持ち梁では、弱軸曲げを主に基本Z方向のT3で追います。T1の有効質量比が小さくても、T3の曲げが求まっていないことにはなりません。方向別に確認します。',
  'tip-mass':'選択中の先端質量付き梁では、CONM2を含めた質量行列で一般化質量・刺激係数・有効質量を評価します。基準梁から総質量だけを置き換えて係数を流用しません。',
  'both-fixed':'選択中の両端固定梁では、先端G13は観測点に適しません。中央などの自由な節点でモード形を読み、支持の変更に対応したモードと有効質量比を確認します。'
 };
 function experiment(model){
  const s=states.get(model)||{};
  const controls=U.select('norm','正規化',[['MASS','MASS：一般化質量を1'],['MAX','MAX：最大成分を1']],s.norm||'MASS')+
   U.select('mode','モード',[['1','1次：同じ向き'],['2','2次：逆向き']],s.mode||'1')+
   U.select('sign','モード全体の符号',[['1','＋'],['-1','−（符号だけ反転）']],s.sign||'1');
  return '<figure data-modal-output-lab="'+model+'">'+U.box('',controls,'独立した2自由度の手計算例。m₁=2 kg、m₂=1 kg、k₁=400 N/m、k₂=200 N/m。左壁だけ固定し、2質点はX方向へ動きます。実線は選んだ正規化のφ、破線は刺激関数ψ=φβ。2点を結ぶ線は成分の比較用で、ばねの変形形状ではありません。MASSとMAXではφとβの単位も変わるため、グラフは指定単位系での数値比較です。MSCのF06を再現した図ではありません。')+'</figure>';
 }
 function diagram(){
  const line=(d,color='#48627e',width=2)=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"/>';
  const text=(x,y,s)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle">'+s+'</text>';
  return '<svg class="theory-lab-svg" viewBox="0 0 360 160" role="img" aria-label="左壁、400 N/mのばね、2 kgの質点、200 N/mのばね、1 kgの質点を接続した独立比較系"><g font-family="system-ui,sans-serif" font-size="13" fill="#48627e">'+
   line('M28 40v65 M18 48l10-8 M18 62l10-8 M18 76l10-8 M18 90l10-8','#2c60ad')+
   line('M28 73h12l7-9 12 18 12-18 12 18 7-9h10 M160 73h12l7-9 12 18 12-18 12 18 7-9h18')+
   '<rect x="100" y="50" width="60" height="46" fill="#eaf1fa" stroke="#48627e"/><rect x="240" y="50" width="60" height="46" fill="#eaf1fa" stroke="#48627e"/>'+
   text(130,78,'m₁ = 2 kg')+text(270,78,'m₂ = 1 kg')+text(66,28,'k₁ = 400')+text(202,28,'k₂ = 200')+
   line('M108 116h40m-6-5 6 5-6 5 M248 116h40m-6-5 6 5-6 5','#1b705a')+
   text(130,141,'u₁')+text(270,141,'u₂')+text(180,158,'k: N/m     +X →')+'</g></svg>';
 }
 function bind(root){
  A.bindNavigation(root);
  report.bind(root);
  window.AnalysisQuiz?.bind(root);
  for(const fig of root.querySelectorAll('[data-modal-output-lab]')){
   U.mount(fig,{html:()=>fig.innerHTML,draw:(el,v)=>{
    states.set(fig.dataset.modalOutputLab,v);
    const d=C.mode(+v.mode,v.norm,+v.sign);
    el.plot.innerHTML=diagram()+G.chart({id:'modal-output',label:'正規化した成分と刺激関数',x:[1,2],y:[-1.5,1.5],xt:[1,2],yt:[-1.5,0,1.5],xl:'DOF',yl:'φ, ψ',series:[{pts:d.phi.map((y,i)=>[i+1,y])},{pts:d.psi.map((y,i)=>[i+1,y]),dash:'6 4'}]});
    el.readout.innerHTML='<b>f='+n(d.frequency)+' Hz、λ='+d.lambda+' s⁻²</b>'+
     table(['確認する量','数値'],[['φ₁, φ₂',d.phi.map(n).join(', ')],['一般化質量 μ',n(d.mu)],['一般化剛性 k*',n(d.stiffness)],['L = φᵀMr',n(d.L)],['刺激係数 β = L/μ',n(d.beta)],['刺激関数 ψ = φβ',d.psi.map(n).join(', ')],['有効質量 m_eff',n(d.eff)+' kg'],['質量比 m_eff / 3',n(d.fraction)+'（'+n(100*d.fraction)+'%）']],{narrow:true})+
     p(v.norm==='MASS'?'MASSではμ=1なので、この手計算のLとβは同じ数値です。φの最大値を1にする規則ではありません。':'MAXの1次ではμ=1.5、2次ではμ=3。β²だけを有効質量とすると誤ります。μを掛けてください。')+
     p('符号を反転するとφとβがともに反転し、φβと有効質量は変わりません。正規化を切り替えても、この2量と振動数は同じです。');
   }});
  }
 }

 /* ---------- F06 の読解問題（このタブで読んだブームの実出力から） ---------- */
 const FIX=1/0.100126**2;
 window.AnalysisQuiz.data['modes-f06']={
  intro:'このタブで読んだブームの F06 から7問です。誤答には、初学者が実際にやりがちな読み違いを入れました。答えると各選択肢の意味が開き、続けて手計算で確かめられます。数値は F06 の印字、またはその数値からの手計算です。',
  links:[['bulk.html#CASE_MEFFMASS','MEFFMASS'],['bulk.html#EIGRL','EIGRL（NORM）'],['bulk.html#PARAM_WTMASS','WTMASS'],['bulk.html#CASE_RESVEC','RESVEC']],
  questions:[
   {title:'固有振動数の列を選ぶ',code:`MODE    EXTRACTION      EIGENVALUE            RADIANS             CYCLES            GENERALIZED         GENERALIZED
 NO.       ORDER                                                                       MASS              STIFFNESS
     1         1        1.639340E+03        4.048877E+01        6.443987E+00        1.000000E+00        1.639340E+03`,
    ask:'1次の固有振動数を報告書に書きます。どの数値を使いますか？',
    options:[
     ['1.639340E+03（EIGENVALUE）','固有値 λ ＝ ω²（rad²/s²）です。振動数ではありません。Hz にするには √λ ÷ 2π です。'],
     ['4.048877E+01（RADIANS）','角振動数 ω（rad/s）です。Hz の 2π 倍なので、加振周波数（Hz）と比べると共振の判断を誤ります。'],
     ['6.443987E+00（CYCLES）','固有振動数 f です（時間の単位が秒なら Hz）。加振周波数と比べるのはこの列です。'],
     ['1.000000E+00（GENERALIZED MASS）','一般化質量です。MASS 正規化で 1 にそろえた値で、振動数とは関係ありません。']],
    answer:2,
    verify:{title:'固有値から振動数を計算する',
     steps:['ω ＝ √λ ＝ √1639.340 ＝ 40.4888 rad/s（RADIANS と一致）','f ＝ ω ÷ 2π ＝ 40.4888 ÷ 6.28319 ＝ 6.44399 Hz（CYCLES と一致）','GENERALIZED STIFFNESS ÷ GENERALIZED MASS ＝ 1639.340 ÷ 1 ＝ λ も確かめる'],
     note:'3つの列が互いに合わなければ、別の行や別の表を読んでいます。',
     check:{prefix:'計算した ',label:'1次の f（Hz）',expect:6.443987,diag:[[1,'一致しています。'],[2*Math.PI,'2π 倍です。RADIANS（rad/s）を読んでいます。'],[1639.340/6.443987,'EIGENVALUE のままです。√λ ÷ 2π で Hz にします。'],[1/(2*Math.PI),'1/(2π) です。Hz をさらに 2π で割っていないか確かめます。']]}}},
   {title:'同じ振動数の2モード',code:`     1         1        1.639340E+03        4.048877E+01        6.443987E+00        1.000000E+00        1.639340E+03
     2         2        1.639340E+03        4.048877E+01        6.443987E+00        1.000000E+00        1.639340E+03
（MODAL EFFECTIVE MASS FRACTION：並進）
   1    6.443987E+00      6.541947E-01      6.541947E-01      2.634671E-12      2.634671E-12      6.009189E-33      6.009189E-33
   2    6.443987E+00      2.634671E-12      6.541947E-01      6.541947E-01      6.541947E-01      2.796262E-33      8.805451E-33`,
    ask:'1次と2次が同じ 6.443987 Hz です。正しい扱いは？',
    options:[
     ['同じモードが2回出ただけなので、2次を消して数える','X 曲げと Y 曲げという別のモードです。消すと Y 方向の質量 65.42% を失います。'],
     ['断面が対称なので X・Y の曲げが同じ振動数。2つとも残し、方向は有効質量比で見分ける','GPWG で X・Y まわりの慣性が同じ（7.338816E+02）ことからも予想できます。1次は T1、2次は T2 の FRACTION が 65.42% です。'],
     ['計算の誤りなので、EIGRL を変えて再計算する','対称な構造では、同じ振動数の対は正常な結果です。'],
     ['2次は1次の逆位相なので、応答では打ち消し合う','固有ベクトルの符号は任意で、逆位相の別モードという意味はありません。2次は直交する方向の曲げです。']],
    answer:1,
    verify:{title:'対の合計で確かめる',
     steps:['1次：T1 の FRACTION 0.6541947、T2 は 2.6E−12（ほぼ 0）','2次：T2 の FRACTION 0.6541947、T1 は 2.6E−12','同じ振動数の対では、ベクトルが X・Y に分かれず斜めに出ても正しい解。比べるときは対の FRACTION を合計する'],
     note:'対が斜め 45° で出ると、各モードの T1・T2 はともに約 0.327 になります。対の合計 0.654 は変わりません。',
     check:{prefix:'計算した ',label:'1・2次の T1 FRACTION の合計',expect:0.6541947,diag:[[1,'一致しています。対で見ると X 方向の 65.42% です。'],[0.5,'約半分です。斜めに出た対の片方だけを数えていないか確かめます。']]}}},
   {title:'とらえた質量の割合を読む',code:`                                 TOTAL EFFECTIVE MASS FRACTION
     T1                T2                T3                R1                R2                R3
9.555129E-01      9.555129E-01      8.613486E-01      9.995207E-01      9.995207E-01      8.613486E-01
（EFFECTIVE MASS MATRIX の第1行）
*   3.569882E+02 -2.631790E-13 -2.467413E-11  4.732376E-13  9.287343E+02  9.152076E-15 *
（A-SET RIGID BODY MASS MATRIX の第1行）
*   3.736090E+02  0.000000E+00  0.000000E+00  0.000000E+00  9.334795E+02  0.000000E+00 *`,
    ask:'X 方向（T1）の一様な基盤加振です。10モードでとらえた質量の割合は？（5頁の GPWG の質量は 398.6681）',
    options:[
     ['65.42%（1次の FRACTION）','1次だけの割合です。10モード分は SUM の最後か、TOTAL EFFECTIVE MASS FRACTION を読みます。'],
     ['89.55%（356.9882 ÷ 398.6681）','GPWG の全質量で割っています。固定した節点1の質量はどのモードでも動かないので、分母に入れません。'],
     ['95.55%（356.9882 ÷ 373.6090）','A-SET RIGID BODY MASS MATRIX の T1 対角が分母です。TOTAL EFFECTIVE MASS FRACTION の T1 と一致します。'],
     ['356.9882（EFFECTIVE MASS MATRIX の T1）','とらえた質量そのもので、割合ではありません。']],
    answer:2,
    verify:{title:'分母を手計算で確かめる',
     steps:['356.9882 ÷ 373.6090 ＝ 0.955513（TOTAL の T1 と一致）','398.6681 − 373.6090 ＝ 25.0591：固定した節点1が受け持つ質量','一様な10要素に連成質量を使ったとすると、要素1本 39.86681 のうち固定端の分は 39.86681 × 264/420 ＝ 25.0591 で一致（推定）'],
     note:'T3 の分母は 320.4994 ÷ 0.8613486 ≈ 372.09 で、T1 と少し違います。比は必ず同じ方向の対角どうしで取ります。',
     check:{prefix:'計算した ',label:'T1 の割合（小数）',expect:0.9555129,diag:[[1,'一致しています。'],[356.9882/398.6681/0.9555129,'GPWG の全質量 398.6681 で割っていないか確かめます。固定した点の質量は分母に入りません。'],[0.6541947/0.9555129,'1次の FRACTION だけを読んでいないか確かめます。']]}}},
   {title:'刺激係数から有効質量へ',code:`（MODAL PARTICIPATION FACTORS）
   1    6.443987E+00     -1.563371E+01      3.137414E-05      1.495313E-15     -1.071325E-04     -5.338404E+01     -1.949106E-16
（MODAL EFFECTIVE MASS）
   1    6.443987E+00      2.444130E+02      9.843369E-10      2.235961E-30      1.147737E-08      2.849856E+03      3.799015E-32`,
    ask:'1次の T1 の刺激係数は −15.63371、一般化質量は 1 です。1次の T1 の有効質量は？',
    options:[
     ['−15.63371','刺激係数そのものです。有効質量は μβ² で、負になりません。'],
     ['15.63371（絶対値）','2乗していません。'],
     ['244.4130','μβ² ＝ 1 × 15.63371² ＝ 244.413。14頁の MODAL EFFECTIVE MASS の1次 T1 と一致します。'],
     ['0.6541947','それは有効質量を分母 373.6090 で割った割合（11頁）です。']],
    answer:2,
    verify:{title:'2乗と割合を計算する',
     steps:['有効質量 ＝ μβ² ＝ 1 × (−15.63371)² ＝ 244.413','割合 ＝ 244.413 ÷ 373.6090 ＝ 0.65419（11頁の FRACTION）','MAX 正規化の F06 では μ ≠ 1。β² だけでなく μβ² で計算する'],
     note:'QRG は MEFFM を PARTFAC の項ごとの2乗と説明しています。MAX 正規化のとき MEFFM の表がそのまま質量になるかは、実機の F06 で照合した例が未収録です。MASS 正規化なら一致します。',
     check:{prefix:'計算した ',label:'1次 T1 の有効質量',expect:244.4130,diag:[[1,'一致しています。'],[15.63371/244.4130,'2乗していません。'],[-15.63371/244.4130,'刺激係数のままです。'],[0.6541947/244.4130,'割合を入れています。']]}}},
   {title:'固有ベクトルの値の意味',code:`EIGENVALUE =  1.639340E+03
    CYCLES =  6.443987E+00         R E A L   E I G E N V E C T O R   N O .          1
POINT ID.   TYPE          T1             T2             T3             R1             R2             R3
      11      G     -1.001260E-01   2.009355E-07   3.312385E-18  -5.877366E-08  -2.928687E-02  -8.129436E-17`,
    ask:'1次で先端の節点11の T1 は −0.1001260 です。先端は実際に何 mm 動きますか？',
    options:[
     ['0.1001 mm','MASS 正規化した形の成分で、実際の変位ではありません。'],
     ['負なので −X 方向にだけ 0.1 動く','符号は形全体の向きの約束で、反転しても同じモードです。'],
     ['この表だけでは決まらない。加振力と減衰を与えた応答解析で求める','固有ベクトルは形と成分の比だけを表します。大きさは正規化の約束で変わります。'],
     ['100 mm（m から mm へ換算）','単位換算の問題ではありません。']],
    answer:2,
    verify:{title:'正規化で数値が変わることを確かめる',
     steps:['MAX 正規化では、解析セット内の最大成分（ここでは先端の T1）を 1 にする：倍率 c ＝ 1 ÷ 0.1001260 ＝ 9.98742','一般化質量は c² 倍：μ ＝ 9.98742² × 1 ＝ '+n(FIX),'同じモードなのに、先端の値は 0.1001 から 1 へ、μ は 1 から約 99.7 へ変わる。振動数は変わらない'],
     note:'先端の T1 が解析セットの中で最大の成分（R2 の 0.0293 より大きい）として計算しています。並進と回転は単位が違うので、実際に基準になる成分は MAX 正規化の F06 で確かめます。',
     check:{prefix:'計算した ',label:'MAX 正規化の一般化質量',expect:FIX,diag:[[1,'一致しています。'],[0.100126**2/FIX,'倍率が逆です。c ＝ 1 ÷ 0.1001260 です。'],[1/(0.100126*FIX),'2乗していません（c のままです）。']]}}},
   {title:'7次は何のモードか',code:`0                                                  MAXIMUM  DISPLACEMENTS
  SUBCASE/
  DAREA ID        T1             T2             T3             R1             R2             R3
0        7   4.1142646E-16  5.0257300E-16  2.7054341E-16  4.7897242E-15  5.6484900E-15  1.0037307E+00
0       10   2.5628798E-12  1.0633335E-12  7.0974480E-02  1.8546787E-11  2.5258407E-11  2.4550027E-11`,
    ask:'7行目は R3 だけが 1.0037 と大きく、ほかはほぼ 0 です。このブームの軸は基本 Z。7次は何のモードですか？',
    options:[
     ['X 方向の曲げ','曲げなら T1 か T2 が大きくなります（1・3・5・8行目など）。'],
     ['軸まわりのねじり','R3 は Z 軸まわりの回転で、Z はこのブームの軸です。12頁でも7次の R3 の FRACTION が 86.13% です。'],
     ['軸方向の伸び縮み','それは T3 が大きい10行目（271.1 Hz）です。'],
     ['剛体モード','剛体モードなら振動数がほぼ 0 です。7次は 165.2 Hz です。']],
    answer:1,
    verify:{title:'別の表で確かめる',
     steps:['12頁の回転の表：7次の R3 の FRACTION は 8.613486E−01（R1・R2 はほぼ 0）','11頁の並進の表：7次の T1〜T3 はほぼ 0','GPWG の重心は Z 軸上（X・Y は 0）なので、梁の軸は Z。軸まわりの回転 R3 がねじり'],
     note:'MAXIMUM DISPLACEMENTS の T（並進）と R（回転）は単位が違うので、1.0037 と 0.1 の大小では比べません。',
     check:{prefix:'F06 の ',label:'7次の R3 の FRACTION',expect:0.8613486,diag:[[1,'一致しています。7次はねじりです。'],[0,'0 です。並進の表（T1〜T3）を見ていないか確かめます。']]}}},
   {title:'軸方向に加振するときの判断',code:`     T1                T2                T3                R1                R2                R3
9.555129E-01      9.555129E-01      8.613486E-01      9.995207E-01      9.995207E-01      8.613486E-01
（MODAL EFFECTIVE MASS FRACTION：並進の10次）
  10    2.711163E+02      5.013194E-27      9.555129E-01      1.280478E-27      9.555129E-01      8.613486E-01      8.613486E-01`,
    ask:'このブームを Z（軸方向）に 0〜200 Hz で一様に加振します。T3 は9次まで 0、10次（271.1 Hz）で 86.13% です。正しい判断は？',
    options:[
     ['T3 が9次まで 0 なので、Z の加振では揺れない。解析は不要','揺れないのではなく、帯域内に共振する縦振動がないだけです。質量は一体で動き、支持部には力がかかります。'],
     ['ND を 100 に増やして、90% を超えるまでモードを足す','次の縦振動は理論上約3倍の約 813 Hz で帯域外です。帯域外のモードを足しても、共振の予測は変わりません。'],
     ['271 Hz は帯域外。帯域内では準静的に動くので、帯域外の質量を静的な補正（残差ベクトルなど）で扱えるかを確認する','動解析ガイドは、不足した質量（missing mass）を静的な荷重で補う考え方を紹介しています。'],
     ['86.13% で 90% に届かないので、このモデルは誤り','割合の不足はモデルの誤りではなく、残りの質量がさらに高い縦振動にあるためです。']],
    answer:2,
    verify:{title:'次の縦振動を見積もる',
     steps:['固定・自由の一様な棒の縦振動は f_n ＝ (2n − 1)·f₁（連続体の理論）','2次 ≈ 3 × 271.1 ＝ 813 Hz（10要素のモデルでは少しずれる）','加振帯域 200 Hz より十分高いので共振しない。残り 13.9% の質量は準静的な補正で扱う'],
     note:'X・Y の加振では 95.55% をとらえ、5次（111.7 Hz）で 90% を超えます。8・9次（216.8 Hz）は 200 Hz のすぐ外にあり、応答に効くので保持します。',
     check:{prefix:'計算した ',label:'2次の縦振動の見積もり（Hz）',expect:3*271.1163,diag:[[1,'一致しています。帯域外です。'],[2/3,'2倍で計算しています。固定・自由の棒は奇数倍（3倍）です。'],[1/3,'1次のままです。']]}}}
  ]
 };

 const topics=[
  ['modal-output-map','F06を開いたら最初に見る6か所'],
  ['modal-output-start','実際のF06を印字順に読む'],
  ['modal-output-judge','方向別の累積比とモード数の判断'],
  ['modal-output-traps','間違いやすい読み方'],
  ['modal-output-quiz','F06を読む確認問題'],
  ['modal-output-tables','設計変更に使う応力・反力・エネルギー'],
  ['modal-output-norm','数値の意味を式で確かめる'],
  ['modal-output-example','切り替えて確認する手計算例']
 ];
 function sections(model){
  return [
   ['実固有値解析のF06を読む',p('この結果タブの F06 は、公開されたブーム（基本Z方向に伸びる片持ち梁）の実出力です。選択中の梁モデル（基本X方向）とは軸の向きが違うので、方向を読み替えます。')+axisMap()+p(context[model]||context.baseline)+'<details class="analysis-shared"><summary>結果の読み方・目次</summary>'+A.toc(topics)+'</details>','modal-output-guide'],
   ['1. F06を開いたら最初に見る6か所',p('F06 は長くなりがちです。最初は次の6か所だけを、この順で見ます。表題は印字のまま書きました。一部の表題は1文字ずつ空けて印字されるので、「REAL EIGENVALUES」と続けて検索しても見つかりません。検索には、空いた語を1語だけ使います（例：E I G E N V A L U E S、E I G E N V E C T O R）。')+
    ordered([
     ['END OF JOB・FATAL・WARNING',key('* * * END OF JOB * * *')+'、'+key('FATAL')+'、'+key('WARNING'),'最後まで解けたか','FATAL・WARNING の本文','FATAL があれば結果を使わない。WARNING は内容を読んでから進む。'],
     ['固有値',key('R E A L   E I G E N V A L U E S'),'何 Hz で揺れるか','CYCLES、ほぼ 0 や負の根','加振周波数と比べる。拘束したのに 0 Hz 付近の根が出たら拘束漏れや未接続を疑う。負の根は、ごく小さければ剛体モードの計算上の0、そうでなければモデルの誤りの兆候。'],
     ['方向別の合計',key('TOTAL EFFECTIVE MASS FRACTION'),'方向ごとに質量の何割をとらえたか','加振する方向の T（並進）または R（回転）','不足なら、その方向の次のモードが加振帯域の中か外かで、モード追加か静的補正かを決める。'],
     ['モードごとの割合',key('MODAL EFFECTIVE MASS FRACTION'),'どのモードがどの方向に効くか','FRACTION（そのモード）と SUM（累積）','加振方向で FRACTION が大きいモードを、応答で追う主要モードにする。'],
     ['各モードの主成分',key('MAXIMUM  DISPLACEMENTS'),'各モードの主な動きは','行（モード）ごとに一番大きい列','曲げ・ねじり・軸方向の見当をつける。T と R は単位が違うので混ぜて比べない。'],
     ['モード形',key('R E A L   E I G E N V E C T O R   N O .'),'どこがどう動くか','測定点・取付点の POINT ID の行','腹と節の位置から、センサーと加振点を選ぶ。値は正規化した形で、実際の変位ではない。']
    ].map(([name,title,question,look,next])=>'<strong>'+name+'</strong>　'+title+'<br>問い：'+question+'<br>見る：'+look+'<br>判断：'+next))+
    p('3・4の表は、ケース制御に '+card('CASE_MEFFMASS','MEFFMASS')+' を書いたときだけ印字されます。何も付けないと総括（SUMMARY）だけで、刺激係数や有効質量の表は ALL や PARTFAC を付けたときに出ます。6の固有ベクトルは、'+card('CASE_DISPLACEMENT','DISPLACEMENT')+'（VECTOR も同じ）の出力先が PRINT のとき F06 に出ます。PLOT だけなら F06 には印字されず、OP2・H5 などの結果ファイルで確認します。印字順やページ番号は、実行条件や出力要求で変わります。'),'modal-output-map'],
   ['2. 実際のF06を印字順に読む',report.reader(),'modal-output-start'],
   ['3. 方向別の累積比とモード数の判断',ordered([
    '加振の種類を決めます。支持がまとめて動く一様な基盤加振（地震・輸送振動など）か、特定の点に力がかかる局所加振か、回転の揺動かを区別します。',
    '一様な基盤加振なら、その方向の TOTAL EFFECTIVE MASS FRACTION と SUM を見ます。T1・T2・T3 は基本座標の並進、R1・R2・R3 は基準点まわりの回転です。MEFFMASS の GRID= は基準点を変える指定で、座標系の選択ではありません。',
    '不足があれば、その方向の次のモードが加振帯域の中か外かを見ます。中なら V2・ND を増やしてモードを足します。外なら共振しないので、帯域外の質量を静的な補正（'+card('CASE_RESVEC','残差ベクトル')+'など）で扱う方法を検討します。動解析ガイドも、不足した質量（missing mass）を静的な荷重で補う考え方を紹介しています。',
    '90%・95% は案件や規格で決める目安で、普遍的な合格値ではありません。動解析ガイドも「目標を 90% とするなら」という例として扱っています。',
    '局所加振では、方向別の比ではなく、加振点と評価点の固有ベクトル成分で判断します。比が小さいモードでも、腹を直接押せば大きく揺れます。',
    '累積比で応力や加速度の精度は保証されません。応答解析で、評価点の結果がモード数や残差ベクトルの有無で変わらなくなるかを確かめます。'
   ])+p('回転の有効量は慣性に対応し、並進の質量と単純には比べられません。基準点を変えると回転の値が変わるので、比べるときは同じ GRID または同じ基本原点にそろえます。')+
    p('同じ振動数の対や近接モードは、ベクトルの組合せや並びが実行ごとに変わることがあります。モード形と振動数を対応させ、対の有効質量の合計で比べます。1行目同士を引き算しません。'),'modal-output-judge'],
   ['4. 間違いやすい読み方',table(['見え方・疑問','実際の意味と確かめ方'],[
    ['「REAL EIGENVALUES」で検索しても見つからない','表題は1文字ずつ空けて印字されています。E I G E N V A L U E S のように空いた語で探します。'],
    ['EIGENVALUE を固有振動数として報告した','λ ＝ ω² です。Hz は CYCLES（時間の単位が秒のとき）を使います。'],
    ['GENERALIZED MASS が 1。質量が消えた？','MASS 正規化の結果です。構造の総質量は GPWG（GRID POINT WEIGHT GENERATOR）で確かめます。'],
    ['固有ベクトルの値を実際の変位だと思った','正規化した形の成分です。MAX と MASS で数値が変わります。実際の振幅は応答解析で求めます。'],
    ['MAXIMUM DISPLACEMENTS の行番号を SUBCASE だと思った','SOL 103 のこの例では各行がモード（1〜10）です。成分ごとの最大で、場所は固有ベクトルの表で探します。'],
    ['FRACTION と SUM を取り違えた','FRACTION はそのモードだけ、SUM はその行までの累積です。FRACTION 0.111111・SUM 1.000000 は「単独で 11.1%、累積で 100%」です。'],
    ['有効質量を GPWG の質量で割った','分母は A-SET RIGID BODY MASS MATRIX の同じ方向の対角です。固定した点の質量は動かないので入りません。'],
    ['同じ振動数の2モードの片方を消した','別方向の曲げなどの別モードです。対で残し、方向は対の合計で比べます。'],
    ['回転の有効量が大きいのでねじりだと思った','ねじりは軸まわりの回転だけです。軸に直交する回転は曲げに伴います。梁の軸の向きと照らします。'],
    ['ある方向の割合が9次まで 0。その方向には揺れない？','その方向のモードが高い振動数にあるだけです。帯域外なら質量は一体で動き、支持には力がかかります。'],
    ['累積比が 90% を超えたので全部十分','評価帯域、局所の応力・加速度、残差ベクトル、応答の収束を別に確かめます。'],
    ['MODAL EFFECTIVE WEIGHT には重力加速度が掛かっている','QRG では有効重量＝有効質量 ÷ WTMASS です。WTMASS ＝ 1 なら有効質量と同じ数値です。'],
    ['刺激係数が負。逆向きにしか揺れない？','固有ベクトルの符号は任意です。形と係数を一組で扱い、係数だけ絶対値にして足し合わせません。'],
    ['MEFFMASS を入れたのに係数の表がない','SUMMARY だけになっていないか、ALL か PARTFAC、PRINT の指定、対象の SUBCASE を確かめます。'],
    ['MASS と MAX で振動数が変わった','正規化は固有値を変えません。METHOD の参照、質量、拘束も一緒に変えていないか確かめます。']
   ]),'modal-output-traps'],
   ['5. F06を読む確認問題',window.AnalysisQuiz.render('modes-f06'),'modal-output-quiz'],
   ['6. 設計変更に使う応力・反力・エネルギー',p('以下は、必要な出力を要求したときに使える結果です。どれもモード形の倍率に比例するので、値の大きさではなく、同じモードの中での分布を見ます。')+
    table(['実務で知りたいこと','確認する出力','結果をどう使うか'],[
     ['どこを補強すれば対象モードに効くか','要素ひずみエネルギー（ESE）のモード別分布','同じモードの中でエネルギーが集中する要素を探す。動解析ガイドのとおり、ESE はモード間では比べず、モードの中で比べる。そこへ剛性を足した案を再解析し、振動数とモード形を比べる。付加質量も変わる点に注意。'],
     ['取付部のどこが厳しいか','対象モードの要素応力・ひずみと出力位置','変形が集中する部位を選ぶ。応力の値そのものは、実荷重と減衰を与えた応答解析で計算し、メッシュの収束も確かめてから許容値と比べる。'],
     ['どの支持へ力が伝わるか','拘束点の反力（SPC forces）・要素の端力','同じモードの中で支持間の成分・向き・荷重経路を追う。報告する反力は応答解析で求める。'],
     ['実験と一致しているか','各モードの CYCLES と、測定点の固有ベクトル成分','計測と同じ軸に変換する。1点だけで倍率を合わせず、複数点の成分比や節の位置を比べる。近接・同じ振動数の対はモード群として対応づける。']
    ]),'modal-output-tables'],
   ['7. 数値の意味を式で確かめる',p('ここからは、F06 の数値がなぜそうなるかを式で確かめます。読むだけなら1〜6で足ります。')+
    h3('MAX と MASS：変わる量と変わらない量')+
    p('固有ベクトルφは、定数cを掛けても同じ固有値を満たします。NORM はこの大きさの約束で、支持や剛性を変える入力ではありません。')+
    f('Kφ = λMφ　→　K(cφ) = λM(cφ)、λ = ω²、f = ω/(2π)')+
    table(['指定','規則','F06での確認'],[
     ['MASS','μ = φᵀMφ = 1 となるようにそろえる。通常の実固有値解析では既定。','GENERALIZED MASS が約1。GENERALIZED STIFFNESS は数値上 λ と同じ。節点成分の最大値は1とは限らない。'],
     ['MAX','解析セット（a-set）内の最大成分を1にそろえる。','基準になる成分の大きさが1。μ と k* はモードごとに違う。a-set の外に回復した成分は1を超え得る（EIGRL の説明）。']
    ])+
    table(['φ′ = cφ に変えると','変換','変わらない量'],[
     ['一般化質量・剛性','μ′ = c²μ、k*′ = c²k*','λ = k*/μ、固有振動数、同じモードの成分比'],
     ['刺激係数・モード座標','β′ = β/c、q′ = q/c','ψ = φβ、物理変位 u = φq'],
     ['モード応力・ひずみ','φ に比例して c 倍','荷重応答として求めた物理量'],
     ['有効質量','m_eff = μβ² = L²/μ','同じ方向の有効質量と割合']
    ])+p('MAX から MASS への変換は φ_MASS = φ_MAX/√μ_MAX。φ と −φ は同じモードなので、比べる前に全体の符号もそろえます。')+
    h3('刺激係数・有効質量の式と、文献の記号','modal-output-factor')+
    p('基盤が一定方向へ動くとき、r はその方向の剛体運動を各自由度に配るベクトルです。基本 X の一様並進なら、X 並進の成分が1、ほかは0です。節点の座標系が違う場合は同じ方向へ変換します。')+
    f('μᵢ = φᵢᵀMφᵢ、Lᵢ = φᵢᵀMr、βᵢ = Lᵢ/μᵢ')+
    f('Mü + Ku = −Mr a_g　→　u ≈ Σφᵢqᵢ')+
    f('φᵢᵀ を掛けて μᵢ で割る：q̈ᵢ + ωᵢ²qᵢ = −βᵢ a_g')+
    p('刺激係数 β は、この方向の基盤加速度が各モードへどれだけ入るかを表し、変位そのものではありません。モード形まで掛けた ψᵢ = φᵢβᵢ を刺激関数と呼びます。')+
    f('m_eff,i = μᵢβᵢ² = Lᵢ²/μᵢ、M_r = rᵀMr、割合ᵢ = m_eff,i/M_r')+
    table(['量','この教材','QRG（MEFFMASS）','動解析ガイド','F06 の表'],[
     ['φᵀMr','L','（記号なし）','Γ（participation factor）','印字されない'],
     ['L/μ','β（刺激係数）','ε ＝ m⁻¹φᵀMD（PARTFAC）','ε（倍率）','MODAL PARTICIPATION FACTORS'],
     ['L²/μ ＝ μβ²','有効質量','εᵀmε の対角','Γ²/m','EFFECTIVE MASS MATRIX の対角。MODAL EFFECTIVE MASS は MASS 正規化なら同じ'],
     ['有効質量 ÷ 剛体質量','割合','FRACSUM','—','MODAL EFFECTIVE MASS FRACTION']
    ],{caption:'記号の対応'})+
    p('QRG と動解析ガイドは、どちらも ε をこの教材の β の意味で使っています。動解析ガイドの Γ は μ で割る前の L です。MASS 正規化なら μ ＝ 1 なので、L・β・ε・Γ はすべて同じ数値になります。')+
    '<div class="element-note"><strong>MAX 正規化の表は未照合</strong>'+p('QRG は MEFFM の表を PARTFAC の項ごとの2乗、FRACSUM を一般化質量を含む比として説明しています。MAX 正規化のとき MEFFM の表がそのまま質量になるかは、実機の F06 で照合した例が未収録です。MAX では一般式 L²/μ と、MASS 正規化の出力、FRACSUM で検算します。')+'</div>'+
    p('MAX の実出力の例として、別の公開研究例（予荷重付き板、SUBCASE 2）の1次は GENERALIZED MASS ＝ 3.934821E−04、GENERALIZED STIFFNESS ＝ 5.249101E+02 です。後者 ÷ 前者 ＝ 1.334013E+06、その平方根 ÷ 2π ＝ 183.823 Hz で、同じ行の CYCLES と一致します。モデルが違うので、ブームとの振動数の差を正規化の効果とは解釈しません。<a href="https://github.com/zhaowei0566/SPAD/blob/7a5b6b7cec77511549bfa0bfca434b38b1b9bbec/AIAAJ_Paper_Data/paper_2019/Section_IV_A/straight_concentric/sol103_prestressed_stiffened_plate_con.f06#L3078-L3082" target="_blank" rel="noopener">MAXの実出力 ↗</a>')+
    p('特定の点へ加える力 F(t) では、モード荷重は φᵢᵀF(t) です。一様な基盤加速度に対する MEFFMASS の係数とは別です。')+links(),'modal-output-norm'],
   ['8. 切り替えて確認する手計算例',p('ブームとは別の、計算を追える2質点系です。質量行列 M = diag(2,1)、剛性行列 K = [[600,−200],[−200,200]]。固有値は 100 と 400 s⁻² で、入力方向 r = [1,1]ᵀ を使います。')+
    experiment(model)+p('1次の MAX 形 φ = [0.5,1]ᵀ で、μ = 2×0.5² + 1×1² = 1.5、L = 2×0.5 + 1×1 = 2。したがって β = 2/1.5 = 4/3、m_eff = 2²/1.5 = 8/3 kg です。MASS 形 [0.408248,0.816497]ᵀ では μ = 1、β = 1.632993、m_eff = β² = 8/3 kg。両方の刺激関数は [2/3,4/3]ᵀ で同じです。成分の大きい方を見て「MASS の方が揺れやすい」とは判断できません。')+
    p('MAX では φ と β はこの例で無次元、μ は kg。MASS では φ は kg⁻¹ᐟ²、β は kg¹ᐟ² で、μ は数値上 1 です。')+
    '<div class="analysis-sources">'+[
     ['Dynamic_Analysis_User_Guide',59,'MSC 2025.1 動解析ガイド：正規化（PDF 59）'],
     ['Dynamic_Analysis_User_Guide',79,'MSC 2025.1 動解析ガイド：固有値・固有ベクトル・拘束反力の印字（PDF 79）'],
     ['Dynamic_Analysis_User_Guide',119,'MSC 2025.1 動解析ガイド：刺激係数・有効質量・missing mass・ESE（PDF 119–123）'],
     ['Quick_Reference_Guide',502,'MSC 2025.1 QRG：MEFFMASS（PDF 502–503）'],
     ['Quick_Reference_Guide',1814,'MSC 2025.1 QRG：EIGRL（PDF 1814–1817）']
    ].map(([book,pg,label])=>'<a href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_'+book+'/raw/resource/enus/MSC_Nastran_2025.1_'+book+'.pdf#page='+pg+'" target="_blank" rel="noopener">'+label+' ↗</a>').join('')+'</div>','modal-output-example']
  ];
 }
 const reference=()=>p('<a href="analysis.html#modes/baseline/results">実固有値の結果：MAX／MASS・刺激係数・有効質量の読み方 →</a>');

 for(const model of ['baseline','tip-mass','both-fixed']){
  const guide=window.AnalysisModelGuides[model];
  guide.inputReview=[...(guide.inputReview||[]),['追加する結果出力',[
   ['CASE_MEFFMASS','MEFFMASS(PRINT,ALL)=YESを追加すると、刺激係数・有効質量・累積比をF06で確認できます。既存DATの条件は変更していません。NORMと表の読み方は結果タブへ。']
  ]]];
  window.AnalysisRelationMaps[model].panels.push({
   title:'必要に応じて追加する結果出力',note:'既存DATとは別の追加要求です。自由形式のCase Controlへ記入し、通常の実固有モードについて評価します。',
   layers:[['meffmass']],nodes:[{id:'meffmass',label:'MEFFMASS',card:'CASE_MEFFMASS',detail:'PRINT,ALL = YES / 刺激係数・有効質量・累積比'}],edges:[]
  });
 }
 window.AnalysisScenarioGuides.modes.basics[0][1].push('結果タブでは実際のF06をページ順にたどり、同じモードの振動数・刺激係数・方向別質量比・節点成分を照合できます。');

 window.AnalysisModalOutput={sections,bind,reference};
})();
