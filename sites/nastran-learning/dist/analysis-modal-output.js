(() => {
 'use strict';
 const C=window.AnalysisModalOutputCore,A=window.LessonArticle,U=window.BeamLabs.ui,G=window.BeamLabs.graphics;
 const n=x=>Number(x.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:7}),states=new Map();
 const p=s=>'<p>'+s+'</p>',f=s=>'<p class="element-formula">'+s+'</p>',table=A.table;
 const ordered=items=>'<ol class="analysis-steps">'+items.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
 const card=(key,label=key)=>'<a href="bulk.html#'+key+'">'+label+'</a>';
 const links=()=>'<div class="analysis-links">'+[['EIGRL','EIGRL：NORM'],['EIGR','EIGR：NORM'],['CASE_MEFFMASS','MEFFMASS：刺激係数・有効質量'],['CASE_DISPLACEMENT','DISPLACEMENT：モード形'],['PARAM_GRDPNT','GRDPNT：総質量'],['PARAM_WTMASS','WTMASS：質量換算']].map(([id,label])=>card(id,label)).join('')+'</div>';
 const jump=(id,label)=>'<a href="#'+id+'" data-jump="'+id+'">'+label+'</a>';
 const scope='MSC Nastran 2025.1の通常の実固有値解析（SOL 103）を対象にします。複素固有値や非対称系へ、実モードの直交性と以下の式をそのまま適用しません。';
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
 const topics=[
  ['modal-output-start','F06を読む順番と出力ファイル'],
  ['modal-output-norm','MAX／MASSで変わるもの・変わらないもの'],
  ['modal-output-example','切り替えて確認する手計算例'],
  ['modal-output-request','刺激係数と有効質量を出力する'],
  ['modal-output-factor','刺激係数・刺激関数・有効質量を区別する'],
  ['modal-output-tables','F06の表と列を対応させる'],
  ['modal-output-judge','方向別の累積比とモード数の判断'],
  ['modal-output-traps','間違いやすい読み方を点検する']
 ];
 function sections(model){
  return [
   ['正規化・刺激係数・有効質量を結果から読む',p(scope)+p(context[model]||context.baseline)+A.toc(topics),'modal-output-guide'],
   ['1. F06を読む順番と出力ファイル',ordered([
    '同じモデル、単位、拘束、METHOD、対象モードで比較していることを確認します。MAXとMASSの比較で、NDや密度まで変えません。',
    'REAL EIGENVALUESで固有値・CYCLES・GENERALIZED MASSを読み、続く固有ベクトルの節点・成分と対応させます。',
    'モードの向き、節の位置、動く部位を確認します。表示倍率と正規化による数値を実振幅と取り違えません。',
    'MEFFMASSで出した係数と方向別のFRACTION・SUMを読み、励起したい方向を表せるか判断します。',
    'モード数を増やし、周波数応答・過渡応答で必要な変位・加速度・応力も収束するか確認します。'
   ])+table(['ファイル','ここで確認する内容'],[
    ['F06','固有値表、モード成分、刺激係数・有効質量の印刷出力。まずこの数値を基準にします。'],
    ['OP2などの結果データ','ポスト処理でモード形を確認。自動スケールや「最大値を1」の表示設定があり、画面の倍率とソルバーのNORMは別です。MEFFMASSの各表を読めるかは出力形式とポスト処理側の対応を確認します。'],
    ['PCH','MEFFMASSでPUNCHを指定したときのパンチ出力。PRINTと別に要求します。'],
    ['F04','実行経過・処理の診断。刺激係数や変位振幅を探す主なファイルではありません。']
   ]),'modal-output-start'],
   ['2. MAX／MASSで変わるもの・変わらないもの',p('固有ベクトルφは、定数cを掛けても同じ固有値を満たします。NORMはこの大きさの約束です。支持や剛性を変える入力ではありません。')+
    f('Kφ = λMφ　→　K(cφ) = λM(cφ)、λ=ω²、f=ω/(2π)')+
    table(['指定','規則','F06での確認'],[
     ['MASS','μ=φᵀMφ=1となるようにそろえる。通常の実固有値解析では既定。','GENERALIZED MASSが約1。GENERALIZED STIFFNESSは数値上λと対応。節点成分の最大値は1とは限らない。'],
     ['MAX','解析セット（a-set）内の最大変位成分を単位値にそろえる。','固有ベクトルの基準となる成分の大きさが1。一般化質量μと一般化剛性k*はモードごとに異なる。a-set外に回復した成分は1を超え得る。']
    ])+p('a-setは、拘束や縮約などの処理後に固有値計算で使う自由度の集合です。出力された全節点のT1〜R3を無条件に並べ、全成分が1以下でないと異常、と判断しません。並進成分と回転成分は物理単位も異なります。')+
    f('μ=φᵀMφ、k*=φᵀKφ、λ=k*/μ')+
    table(['φ′=cφへ変更','変換','変わらない量'],[
     ['一般化質量・剛性','μ′=c²μ、k*′=c²k*','λ=k*/μ、固有振動数、同一モードの成分比'],
     ['刺激係数・モード座標','β′=β/c、q′=q/c','ψ=φβ、物理変位u=φq'],
     ['モード応力・ひずみ','φに比例してc倍（線形回復）','荷重応答として復元した物理量'],
     ['有効質量','m_eff=μβ²=L²/μ','同じ方向の有効質量と比率']
    ])+p('MASSの一般化質量1は「構造物の総質量が1 kg」という意味ではありません。MAXのモード変位1も「外力を受けて1 mm動いた」という結果ではありません。モード応力をそのまま許容応力と比べないでください。')+
    p('MAXからMASSへの変換はφ_MASS=φ_MAX/√μ_MAX。逆変換では同じモードのa-set基準成分を使います。φと−φは同じモードなので、比較前に全体の符号もそろえます。')+links(),'modal-output-norm'],
   ['3. 切り替えて確認する手計算例',p('既存の梁とは別の、計算を追える2質点系です。質量行列M=diag(2,1)、剛性行列K=[[600,−200],[−200,200]]。固有値は100と400 s⁻²で、入力方向r=[1,1]ᵀを使います。')+
    experiment(model)+p('1次のMAX形φ=[0.5,1]ᵀで、μ=2×0.5²+1×1²=1.5、L=2×0.5+1×1=2。したがってβ=2/1.5=4/3、m_eff=2²/1.5=8/3 kgです。')+
    p('MASS形は[0.408248,0.816497]ᵀ。μ=1、β=1.632993、m_eff=β²=8/3 kgです。両方の刺激関数は[2/3,4/3]ᵀ。値の大きいモード成分だけを見て「MASSの方が揺れやすい」とは判断できません。')+
    p('MAXではφとβはこの例で無次元、μはkg。MASSではφはkg⁻¹ᐟ²、βはkg¹ᐟ²となり、μは数値上1です。単位系もそろえて比較します。'),'modal-output-example'],
   ['4. 刺激係数と有効質量を出力する',p('次は通常の実固有値解析に追加するCase Controlの指定例です。CENDとBEGIN BULKの間で、対象の固有値SUBCASEへ置きます。完成したDATではありません。METHODの30は既存のEIGRL／EIGRのSIDと一致させます。')+
    '<pre class="analysis-deck"><code>METHOD = 30\nDISPLACEMENT(PRINT) = ALL\nMEFFMASS(PRINT,ALL) = YES</code></pre>'+
    p('まず'+card('EIGRL')+'または'+card('EIGR')+'のNORMをMASSとして係数を照合します。MAXとの比較ではNORMだけを変えます。Bulk Dataの8文字フィールドと、上のCase Controlの自由形式を混同しません。')+
    p('ALLは一式を要求します。必要な表を選ぶ場合は、例えば <code>MEFFMASS(PRINT,<wbr>SUMMARY,<wbr>PARTFAC,<wbr>MEFFM,<wbr>FRACSUM)=YES</code>。裸のMEFFMASSの既定はSUMMARYなので、刺激係数表まで当然に出るとは考えません。')+
    p('各選択肢、出力先、GRID、YES／NO、既定値は'+card('CASE_MEFFMASS','InputデータのMEFFMASS')+'に集約しています。通常のモード形は'+card('CASE_DISPLACEMENT','DISPLACEMENT')+'で要求します。OP2表示だけを指定しても、F06にモード成分表が出るとは限りません。'),'modal-output-request'],
   ['5. 刺激係数・刺激関数・有効質量を区別する',p('ここでは刺激係数をβと定義します。基盤が一定方向へ動くとき、rはその方向の剛体運動を各自由度に配るベクトルです。基本Xの一様並進なら、対応するX並進は1、直交方向は0です。各節点の座標系が異なる場合は同じ方向へ変換します。')+
    f('μᵢ=φᵢᵀMφᵢ、Lᵢ=φᵢᵀMr、βᵢ=Lᵢ/μᵢ')+
    p('相対変位uに対する一様な基盤加速度a_gの式から、どこにβが現れるかを追います。')+
    f('Mü + Ku = −Mr a_g　→　u≈Σφᵢqᵢ')+
    f('φᵢᵀを掛ける：μᵢq̈ᵢ + kᵢ*qᵢ = −Lᵢa_g')+
    f('μᵢで割る：q̈ᵢ + ωᵢ²qᵢ = −βᵢa_g')+
    p('刺激係数は、この方向の基盤加速度が各モードへどの程度入るかを表します。変位そのものではありません。モード形まで掛けたψᵢ=φᵢβᵢを刺激関数と呼び、各節点・成分への寄与を表します。')+
    f('m_eff,i = μᵢβᵢ² = Lᵢ²/μᵢ、M_r=rᵀMr、割合ᵢ=m_eff,i/M_r')+
    p('MASSならμ=1なので、L=β、m_eff=β²です。MAXではμを省けません。負のβは負の質量ではなく、選んだモード形に対する符号です。有効質量は2乗から得るので非負になります。')+
    '<div class="element-note"><strong>出力名と文献の記号をそろえる</strong>'+p('MSC動解析ガイドはLに当たる量をΓと呼び、QRGのPARTFACはεという記号で説明されています。文献でΓを見ただけで、LなのかL/μなのかを決めないでください。MASSでは一致しますが、MAXでは定義の確認が必要です。')+
    p('2025.1 QRGはMEFFMをPARTFACの項別2乗、FRACSUMを一般化質量を含む比として説明しています。MAX出力の表題だけから、MEFFMの数字をそのままkgやtonneと断定しません。MAX時の表内スケールを実機F06と照合した例は未収録です。下の数値表はMASSでの理論照合値とし、MAXは一般式L²/μとMASSへそろえた出力、FRACSUMで検算します。')+'</div>'+
    p('特定の点へ加える力F(t)では、モード荷重はφᵢᵀF(t)です。一様な基盤加速度に対するMEFFMASSの係数とは別です。ある方向の有効質量が小さくても、そのモードの腹へ局所的な力を加えると大きく励起されることがあります。'),'modal-output-factor'],
   ['6. F06の表と列を対応させる',table(['探す表・列','何を読むか','実務での照合'],[
    ['REAL EIGENVALUES','EIGENVALUE=λ、RADIANS=ω、CYCLES=f、GENERALIZED MASS=μ、GENERALIZED STIFFNESS=k*','f=√λ/(2π)、k*/μ=λ。秒を使う単位系ならCYCLESはHz。'],
    ['REAL EIGENVECTOR','対象MODEのPOINT IDとTYPE、T1〜T3、R1〜R3','GRIDの出力座標系（CD等）を確認。Rは回転成分で並進mmではない。ポスト処理の表示座標も確認。'],
    ['MODAL PARTICIPATION FACTORS','方向ごとの符号付き係数','MASSの基準で係数とその2乗を検算。異なるNORM・質量単位・符号規約の値を直接大小比較しない。'],
    ['MODAL EFFECTIVE MASS','各モード・方向の有効質量に関する出力','MASSでは係数の2乗と照合。重量との違い、MAX時の表の定義に注意。'],
    ['MODAL EFFECTIVE MASS FRACTION','各MODE/FREQUENCYのFRACTIONとSUM','FRACTIONはそのモード、SUMはそこまでの累積。0.90は90%。'],
    ['TOTAL EFFECTIVE MASS FRACTION','保持した全モードの方向別の合計','FRACSUMの最後のSUMと対応。T1〜T3を足して100%を目指す表ではない。'],
    ['A-SET RIGID BODY MASS MATRIX','比率の分母となる剛体運動に対する質量','並進方向の質量と回転方向の慣性を区別。GPWGの全体質量と解析セットの質量を無条件に同一視しない。']
   ])+p('F06の見出しは文字間に空白が入ることがあります。検索で見つからない場合は、短い語や空白を含む表記で探します。モード番号だけでなくSUBCASE・振動数・形も照合します。')+
    table(['独立2質点例・MASS','f (Hz)','係数β','m_eff (kg)','FRACTION','SUM'],[
     ['1次','1.591549','1.632993','2.666667','0.888889','0.888889'],
     ['2次','3.183099','0.577350','0.333333','0.111111','1.000000']
    ],{caption:'手計算で求めた一様X並進への照合値。実行済みF06の転載・再現ではありません。係数の全体符号は反転し得ます。'})+
    p('1次だけなら88.89%、2次までなら100%。仮に業務の採用基準を90%とした場合、1次だけでは不足です。この例の100%は、2自由度の全モードを残したためで、一般の有限要素モデルのND=2を推奨する意味ではありません。'),'modal-output-tables'],
   ['7. 方向別の累積比とモード数の判断',ordered([
    '実際に励起する方向と周波数帯を決めます。基本X・Y・Zの一様並進のどれか、局所荷重か、回転励起かを区別します。',
    'MEFFMASSのT1・T2・T3は基本座標の並進方向、R1・R2・R3は基準点まわりの回転方向として読みます。GRID指定は基準点を変えるためのもので、座標系CIDの選択ではありません。',
    '各方向のFRACTIONとSUMを追います。別方向のモードが途中に入ると、その方向のSUMはほとんど増えないことがあります。',
    'V2やNDを増やし、対象帯域とモード形を確認します。90%や95%を普遍的な合格値にせず、適用する規格・評価目的を使います。',
    '累積比だけで局所応力・加速度の精度を決めません。応答解析で、評価位置の必要量が基底数と残余ベクトルの扱いに対して収束するか確認します。'
   ])+p('回転の有効量は慣性に対応し、並進のkgと単純比較できません。基準点を変えると回転・並進回転の連成が変わります。比較時は同じGRIDまたは同じ基本原点にそろえます。')+
    p('MEFFWは重量側の出力で、QRG上の換算はMEFFMをPARAM,WTMASSで割る扱いです。WTMASS=1で入力した質量に対し、出力の名称だけを見て自動的に9.81が掛かった力だと思わないでください。N・mm・s系で質量を直接入力する場合の質量単位はtonneです。')+
    p('重根・近接モードでは、同じモード群でもベクトルの組合せや並びが変わる場合があります。モード形と振動数を対応させ、必要ならモード群の有効質量の合計も比較します。単に1行目同士を引き算しません。'),'modal-output-judge'],
   ['8. 間違いやすい読み方を点検する',table(['見え方・疑問','確認すること'],[
    ['MASSでGENERALIZED MASSが1。質量が消えた？','正規化の結果です。物理的な総質量はGPWGや質量定義で別に確認します。'],
    ['MAXにしたらモード応力が増えた','モード形の倍率が変わるとモード応力も変わります。実荷重による応力増加とは限りません。'],
    ['MAXなのに出力に1を超える成分がある','a-set外の回復成分、出力座標への変換、ポスト処理の表示倍率を確認します。'],
    ['刺激係数が負。逆向きにしか揺れない？','固有ベクトルの符号は任意です。φと係数を一組で扱います。係数だけ絶対値へ変えて線形和を作りません。'],
    ['係数0ならそのモードを削除してよい？','指定した剛体運動方向への寄与が0という意味です。局所加振や別方向の荷重への寄与は別に確認します。'],
    ['累積比が90%を超えたから全て十分','評価帯域、局所応力・加速度、残余ベクトル、応答の収束を別に確認します。'],
    ['MEFFMASSを入れたのに係数表がない','SUMMARYだけになっていないか、PARTFACまたはALL、PRINT/NOPRINT、対象SUBCASEと固有値抽出の実施を確認します。'],
    ['MASSとMAXで振動数が大きく変わった','NORMだけを変えたか、METHOD参照、質量・拘束・モード対応を確認します。正規化そのものは固有値を変えません。']
   ])+'<div class="theory-quiz"><details><summary>確認問題：MAXのμ=1.5、β=4/3。有効質量は？</summary>'+
    p('m_eff=μβ²=1.5×(4/3)²=8/3 kg。β²=16/9だけでは一般化質量が抜けています。')+'</details><details><summary>確認問題：φの符号を逆にすると、βと有効質量は？</summary>'+
    p('Lとβも逆符号になります。φβは同じ、m_effは2乗なので同じです。')+'</details><details><summary>確認問題：FRACTION=0.111111、SUM=1.000000の意味は？</summary>'+
    p('このモード単独が11.1111%、ここまでの合計が100%。単独モードが100%なのではありません。')+'</details></div>'+
    '<div class="analysis-sources">'+[
     ['Dynamic_Analysis_User_Guide',59,'MSC 2025.1 動解析ガイド：正規化（PDF 59）'],
     ['Dynamic_Analysis_User_Guide',119,'MSC 2025.1 動解析ガイド：係数と有効質量（PDF 119–123）'],
     ['Quick_Reference_Guide',502,'MSC 2025.1 QRG：MEFFMASS（PDF 502–503）'],
     ['Quick_Reference_Guide',1814,'MSC 2025.1 QRG：EIGRL（PDF 1814–1817）']
    ].map(([book,pg,label])=>'<a href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_'+book+'/raw/resource/enus/MSC_Nastran_2025.1_'+book+'.pdf#page='+pg+'" target="_blank" rel="noopener">'+label+' ↗</a>').join('')+'</div>','modal-output-traps']
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
 window.AnalysisScenarioGuides.modes.basics[0][1].push('結果タブでMAX／MASS、刺激係数、有効質量、F06の列と出力要求を対応させます。');

 window.AnalysisModalOutput={sections,bind,reference};
})();
