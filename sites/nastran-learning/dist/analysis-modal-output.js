(() => {
 'use strict';
 /* SOL 103 results tab: technical reading of the F06. Concepts (mode-shape size, effective mass) live in theory.html#modes.
    The F06 shown here is a virtual output for learning (analysis-f06-reader.js), not an MSC Nastran run. */
 const A=window.LessonArticle;
 const p=s=>'<p>'+s+'</p>',table=A.table;
 const ordered=items=>'<ol class="analysis-steps">'+items.map(s=>'<li>'+s+'</li>').join('')+'</ol>';
 const card=(key,label=key)=>'<a href="bulk.html#'+key+'">'+label+'</a>';
 const report=window.AnalysisF06Reader,V=report.line;
 const key=s=>'<code class="f06-key">'+s+'</code>';
 const lines=(...rows)=>rows.join('\n');

 const context={
  baseline:'選択中の片持ち梁では、弱軸曲げを主に基本Z方向のT3で追います。T1の有効質量比が小さくても、T3の曲げが求まっていないことにはなりません。方向別に確認します。',
  'tip-mass':'選択中の先端質量付き梁では、CONM2を含めた質量行列で一般化質量・刺激係数・有効質量を評価します。基準梁から総質量だけを置き換えて係数を流用しません。',
  'both-fixed':'選択中の両端固定梁では、先端G13は観測点に適しません。中央などの自由な節点でモード形を読み、支持の変更に対応したモードと有効質量比を確認します。'
 };
 function bind(root){
  A.bindNavigation(root);
  report.bind(root);
  window.AnalysisQuiz?.bind(root);
 }

 /* ---------- F06 の読解問題（このタブで読んだ仮想の出力から） ---------- */
 window.AnalysisQuiz.data['modes-f06']={
  intro:'このタブで読んだ仮想の F06 から7問です。数値が切りの良い値なので、暗算か電卓で確かめられます。誤答には、初学者がやりがちな読み違いを入れました。答えると各選択肢の意味が開き、続けて手計算で確かめられます。',
  links:[['bulk.html#CASE_MEFFMASS','MEFFMASS'],['bulk.html#EIGRL','EIGRL'],['bulk.html#PARAM_WTMASS','WTMASS'],['bulk.html#CASE_RESVEC','RESVEC']],
  questions:[
   {title:'固有振動数の列を選ぶ',code:lines(...V.eigHead,V.eig[0]),
    ask:'1次の固有振動数を報告書に書きます。どの数値を使いますか？',
    options:[
     ['9.869604E+02（EIGENVALUE）','固有値 λ ＝ ω²（rad²/s²）です。振動数ではありません。'],
     ['3.141593E+01（RADIANS）','角振動数 ω（rad/s）です。Hz の 2π 倍なので、加振周波数（Hz）と比べると共振の判断を誤ります。'],
     ['5.000000E+00（CYCLES）','固有振動数 f です（時間の単位が秒なら Hz）。加振周波数と比べるのはこの列です。'],
     ['1.000000E+00（GENERALIZED MASS）','一般化質量です。MASS 正規化で 1 にそろえた値で、振動数とは関係ありません。']],
    answer:2,
    verify:{title:'振動数から角振動数と固有値を計算する',
     steps:['ω ＝ 2π × f ＝ 2π × 5 ＝ 31.416 rad/s（RADIANS と一致）','λ ＝ ω² ＝ 31.416² ＝ 986.96（EIGENVALUE と一致）','GENERALIZED STIFFNESS ÷ GENERALIZED MASS ＝ 986.96 ÷ 1 ＝ λ も確かめる'],
     note:'3つの列が互いに合わなければ、別の行や別の表を読んでいます。',
     check:{prefix:'計算した ',label:'1次の ω（rad/s）',expect:10*Math.PI,diag:[[1,'一致しています。RADIANS の列と同じ値です。'],[1/(2*Math.PI),'f のままです。2π を掛けます。'],[10*Math.PI,'ω² です。EIGENVALUE の値を入れていないか確かめます。'],[0.5,'π しか掛けていません。2π を掛けます。']]}}},
   {title:'同じ振動数の2モード',code:lines(V.eig[0],V.eig[1],'（MODAL EFFECTIVE MASS FRACTION：並進）',V.frac[0],V.frac[1]),
    ask:'1次と2次が同じ 5 Hz です。正しい扱いは？',
    options:[
     ['同じモードが2回出ただけなので、2次を消して数える','Y 曲げと Z 曲げという別のモードです。消すと Z 方向の質量 64% を失います。'],
     ['断面が正方形なので Y・Z の曲げが同じ振動数。2つとも残し、方向は有効質量比で見分ける','1次は T2、2次は T3 の FRACTION が 0.64 です。'],
     ['計算の誤りなので、EIGRL を変えて再計算する','対称な構造では、同じ振動数の対は正常な結果です。'],
     ['2次は1次の逆位相なので、応答では打ち消し合う','固有ベクトルの符号は任意で、逆位相の別モードという意味はありません。2次は直交する方向の曲げです。']],
    answer:1,
    verify:{title:'対の合計で確かめる',
     steps:['1次：T2 の FRACTION 0.64、T3 は 7.5E−14（ほぼ 0）','2次：T3 の FRACTION 0.64、T2 は 7.5E−14','同じ振動数の対では、ベクトルが Y・Z に分かれず斜めに出ても正しい解。比べるときは対の FRACTION を合計する'],
     note:'対が斜め 45° で出ると、各モードの T2・T3 はともに 0.32 になります。対の合計 0.64 は変わりません。',
     check:{prefix:'計算した ',label:'1・2次の T2 FRACTION の合計',expect:0.64,diag:[[1,'一致しています。対で見ると Y 方向の 64% です。'],[0.5,'半分です。斜めに出た対の片方だけを数えていないか確かめます。']]}}},
   {title:'とらえた質量の割合を読む',code:lines(V.sumSub[0],V.sumHead,V.sum,'（MODAL EFFECTIVE MASS の TOTAL 行）',V.massTotal,'（A-SET RIGID BODY MASS MATRIX の2行目）',V.aset[1]),
    ask:'Y 方向（T2）の一様な基盤加振です。8モードでとらえた質量の割合は？（GPWG の質量は 110）',
    options:[
     ['64%（1次の FRACTION）','1次だけの割合です。8モード分は SUM の最後か、TOTAL EFFECTIVE MASS FRACTION を読みます。'],
     ['80.9%（89 ÷ 110）','GPWG の全質量で割っています。固定した節点1の 10 kg はどのモードでも動かないので、分母に入れません。'],
     ['89%（89 ÷ 100）','A-SET RIGID BODY MASS MATRIX の T2 対角 100 が分母です。TOTAL EFFECTIVE MASS FRACTION の T2 と一致します。'],
     ['89（有効質量の合計）','とらえた質量そのもので、割合ではありません。']],
    answer:2,
    verify:{title:'分母を確かめる',
     steps:['89 ÷ 100 ＝ 0.89（TOTAL の T2 と一致）','110 − 100 ＝ 10 は、固定した節点1の質量。どのモードでも動かないので、割合の分母に入らない','分母は「動ける部分の質量」で、GPWG の全質量とは違う'],
     note:'拘束を変えると分母も変わります。別のモデルと比べるときは、同じ方向・同じ分母どうしで比べます。',
     check:{prefix:'計算した ',label:'T2 の割合（小数）',expect:0.89,diag:[[1,'一致しています。'],[100/110,'GPWG の全質量 110 で割っています。固定した点の質量は分母に入りません。'],[0.64/0.89,'1次の FRACTION だけを読んでいます。'],[100,'有効質量 89 のままです。割合にするには分母の 100 で割ります。']]}}},
   {title:'刺激係数と有効質量のつながり',code:lines('（MODAL PARTICIPATION FACTORS）',V.tableHead[0],V.pf[1],'（MODAL EFFECTIVE MASS）',V.mass[1]),
    ask:'2次の T3 の刺激係数は −8、一般化質量は 1 です。2次の T3 の有効質量は？',
    options:[
     ['−8','刺激係数そのものです。有効質量は2乗から求めるので、負になりません。'],
     ['8（絶対値）','2乗していません。'],
     ['64','(−8)² × 1 ＝ 64。MODAL EFFECTIVE MASS の2次 T3 と一致します。'],
     ['0.64','それは有効質量を分母 100 で割った割合（FRACTION）です。']],
    answer:2,
    verify:{title:'2乗と割合を計算する',
     steps:['有効質量 ＝ (刺激係数)² × 一般化質量 ＝ (−8)² × 1 ＝ 64','割合 ＝ 64 ÷ 100 ＝ 0.64（FRACTION と一致）','2乗するので、刺激係数の符号は関係ない'],
     note:'実務では MODAL EFFECTIVE MASS の表を見れば、計算しなくても同じ値が読めます。この計算は、表どうしのつながりを確かめるためのものです。',
     check:{prefix:'計算した ',label:'2次 T3 の有効質量',expect:64,diag:[[1,'一致しています。'],[8/64,'2乗していません。'],[-8/64,'刺激係数のままです。'],[0.64/64,'割合を入れています。']]}}},
   {title:'固有ベクトルの値の意味',code:lines(...V.vec2,V.vecCols,V.vec2Tip),
    ask:'2次で先端の節点11 の T3 は −0.2 です（長さの単位は m）。先端は実際にどれだけ動きますか？',
    options:[
     ['0.2 m（200 mm）','MASS 正規化した形の成分で、実際の変位ではありません。'],
     ['負なので −Z 方向にだけ 0.2 m 動く','符号は形全体の向きの約束で、反転しても同じモードです。'],
     ['この表だけでは決まらない。加振力と減衰を与えた応答解析で求める','固有ベクトルは形と成分の比だけを表します。大きさは正規化の約束で変わります。'],
     ['0.2 mm','単位を読み替えても、正規化した値であることは変わりません。']],
    answer:2,
    verify:{title:'数値が約束で決まることを確かめる',
     steps:['GENERALIZED MASS が 1 なので MASS 正規化。形の大きさは「一般化質量を1にする」という約束で決まっている','同じモードを MAX 正規化（最大の成分を1にする）で出すと、先端の T3 は大きさ 1 になる。倍率は 1 ÷ 0.2 ＝ 5','約束を変えるだけで値が5倍になるので、この数値は実際の変位ではない。振動数は変わらない'],
     note:'実際に何 mm 動くかは、加振の大きさと減衰を入れた周波数応答・過渡応答で求めます。',
     check:{prefix:'計算した ',label:'MAX 正規化にするときの倍率',expect:5,diag:[[1,'一致しています。'],[0.04,'逆数になっていません。1 ÷ 0.2 で計算します。'],[-1,'符号は要りません。倍率は大きさだけで決まります。']]}}},
   {title:'5次は何のモードか',code:lines(...V.maxTitle,V.max[4],V.max[7]),
    ask:'5行目は R1 だけが 1.0 と大きく、ほかはほぼ 0 です。この柱の軸は基本 X。5次は何のモードですか？',
    options:[
     ['Y 方向の曲げ','曲げなら T2 か T3 が大きくなります（1〜4・6・7行目）。'],
     ['柱の軸まわりのねじり','R1 は X 軸まわりの回転で、X はこの柱の軸です。並進の FRACTION も5次はほぼ 0 です。'],
     ['軸方向の伸び縮み','それは T1 が大きい8行目（120 Hz）です。'],
     ['剛体モード','剛体モードなら振動数がほぼ 0 です。5次は 50 Hz です。']],
    answer:1,
    verify:{title:'別の表で確かめる',
     steps:['並進の FRACTION：5次の T1〜T3 は大きいものでも 2.4E−28 で、ほぼ 0','GPWG の重心は X 軸上（Y・Z は 0）なので、柱の軸は X。X 軸まわりの回転 R1 がねじり','8行目は T1（軸方向の並進）だけが大きいので、8次は軸方向の伸び縮み'],
     note:'MAXIMUM DISPLACEMENTS の T（並進）と R（回転）は単位が違うので、1.0 と 0.14 の大小では比べません。',
     check:{prefix:'F06 の ',label:'5行目の R1',expect:1,diag:[[1,'一致しています。5次はねじりです。'],[Math.sqrt(1/50),'8行目（軸方向）の T1 を読んでいます。'],[0.2,'曲げの行の T2・T3 を読んでいます。']]}}},
   {title:'軸方向に加振するときの判断',code:lines(V.sumHead,V.sum,'（MODAL EFFECTIVE MASS FRACTION：並進の8次）',V.frac[7]),
    ask:'この柱を X（軸方向）に 0〜100 Hz で一様に加振します。T1 は7次まで 0、8次（120 Hz）で 0.81 です。正しい判断は？',
    options:[
     ['T1 が7次まで 0 なので、X の加振では揺れない。解析は不要','揺れないのではありません。帯域内に縦振動の共振がないだけで、柱の質量は加振とともに動き、支持部には力がかかります。'],
     ['ND を増やして、T1 が 90% を超えるまでモードを足す','次の縦振動は約3倍の 360 Hz で帯域外です。帯域外のモードを足しても、共振の予測は変わりません。'],
     ['120 Hz は帯域外。帯域内では共振しないので、足りない質量を静的な補正（残差ベクトルなど）で扱えるかを確かめる','帯域外の質量は、モードを足すより、静的な補正で扱うのが効率的です。'],
     ['81% で 90% に届かないので、このモデルは誤り','割合の不足はモデルの誤りではなく、残りの質量がさらに高い縦振動にあるためです。']],
    answer:2,
    verify:{title:'次の縦振動を見積もる',
     steps:['一様な棒（固定・自由）の縦振動は、2番目が1番目の約3倍の振動数','2番目 ≈ 3 × 120 ＝ 360 Hz で、加振帯域 100 Hz よりずっと高い','帯域内では共振しないので、残り 19% の質量は静的な補正で扱うかを確かめる'],
     note:'8次（120 Hz）は帯域のすぐ外なので応答に効きます。捨てずに残します。Y・Z の加振では、帯域内の1〜7次で各 89% をとらえています。',
     check:{prefix:'計算した ',label:'2番目の縦振動の見積もり（Hz）',expect:360,diag:[[1,'一致しています。帯域外です。'],[2/3,'2倍で計算しています。固定・自由の棒は約3倍です。'],[1/3,'1番目のままです。']]}}}
  ]
 };

 const topics=[
  ['modal-output-map','F06を開いたら最初に見る6か所'],
  ['modal-output-start','仮想のF06を印字順に読む'],
  ['modal-output-judge','方向別の累積比とモード数の判断'],
  ['modal-output-traps','間違いやすい読み方'],
  ['modal-output-quiz','F06を読む確認問題']
 ];
 function sections(model){
  return [
   ['実固有値解析のF06を読む',p('この結果タブの F06 は、読み方を学ぶための仮想の出力です（実際の解析結果ではありません）。数値を切りの良い値にしてあるので、表どうしのつながりを暗算や電卓で確かめられます。想定した柱は、選択中の梁と同じく基本 X 方向に伸びています。')+
    p('アプリの梁で自分の F06 を読むとき：'+(context[model]||context.baseline))+
    p('このタブでは、F06 の表と数値の読み方、実務での判断を扱います。モード形の大きさが決まる仕組みや、有効質量の考え方は、教材の<a href="theory.html#modes">実固有値解析</a>で説明しています。')+
    '<details class="analysis-shared"><summary>結果の読み方・目次</summary>'+A.toc(topics)+'</details>','modal-output-guide'],
   ['1. F06を開いたら最初に見る6か所',p('F06 は長くなりがちです。最初は次の6か所だけを、この順で見ます。表題は印字のまま書きました。一部の表題は1文字ずつ空けて印字されるので、「REAL EIGENVALUES」と続けて検索しても見つかりません。検索には、空いた語を1語だけ使います（例：E I G E N V A L U E S、E I G E N V E C T O R）。')+
    ordered([
     ['END OF JOB・FATAL・WARNING',key('* * * END OF JOB * * *')+'、'+key('FATAL')+'、'+key('WARNING'),'最後まで解けたか','FATAL・WARNING の本文','FATAL があれば結果を使わない。WARNING は内容を読んでから進む。'],
     ['固有値',key('R E A L   E I G E N V A L U E S'),'何 Hz で揺れるか','CYCLES、ほぼ 0 や負の根','加振周波数と比べる。拘束したのに 0 Hz 付近の根が出たら拘束漏れや未接続を疑う。負の根は、ごく小さければ剛体モードの計算上の0、そうでなければモデルの誤りの兆候。'],
     ['方向別の合計',key('TOTAL EFFECTIVE MASS FRACTION'),'方向ごとに質量の何割をとらえたか','加振する方向の T（並進）または R（回転）','不足なら、その方向の次のモードが加振帯域の中か外かで、モード追加か静的補正かを決める。'],
     ['モードごとの割合',key('MODAL EFFECTIVE MASS FRACTION'),'どのモードがどの方向に効くか','FRACTION（そのモード）と SUM（累積）','加振方向で FRACTION が大きいモードを、応答で追う主要モードにする。'],
     ['各モードの主成分',key('MAXIMUM  DISPLACEMENTS'),'各モードの主な動きは','行（モード）ごとに一番大きい列','曲げ・ねじり・軸方向の見当をつける。T と R は単位が違うので混ぜて比べない。'],
     ['モード形',key('R E A L   E I G E N V E C T O R   N O .'),'どこがどう動くか','測定点・取付点の POINT ID の行','腹と節の位置から、センサーと加振点を選ぶ。値は正規化した形で、実際の変位ではない。']
    ].map(([name,title,question,look,next])=>'<strong>'+name+'</strong>　'+title+'<br>問い：'+question+'<br>見る：'+look+'<br>判断：'+next))+
    p('3・4の表は、ケース制御に '+card('CASE_MEFFMASS','MEFFMASS')+' を書いたときだけ印字されます。何も付けないと総括（SUMMARY）だけで、刺激係数や有効質量の表は ALL や PARTFAC を付けたときに出ます。5の表は、バルクデータに PARAM,PRTMAXIM,YES を書いたときだけ印字されます（既定は NO）。6の固有ベクトルは、'+card('CASE_DISPLACEMENT','DISPLACEMENT')+'（VECTOR も同じ）の出力先が PRINT のとき F06 に出ます。PLOT だけなら F06 には印字されず、OP2・H5 などの結果ファイルで確認します。印字順やページ番号は、実行条件や出力要求で変わります。'),'modal-output-map'],
   ['2. 仮想のF06を印字順に読む',report.reader(),'modal-output-start'],
   ['3. 方向別の累積比とモード数の判断',ordered([
    '加振の種類を決めます。支持がまとめて動く一様な基盤加振（地震・輸送振動など）か、特定の点に力がかかる局所加振か、回転の揺動かを区別します。',
    '一様な基盤加振なら、その方向の TOTAL EFFECTIVE MASS FRACTION と SUM を見ます。T1・T2・T3 は基本座標の並進、R1・R2・R3 は基準点まわりの回転です。',
    '不足があれば、その方向の次のモードが加振帯域の中か外かを見ます。中なら V2・ND を増やしてモードを足します。外なら共振しないので、足りない質量を静的な補正（'+card('CASE_RESVEC','残差ベクトル')+'など）で扱えるかを確かめます。',
    '90%・95% は案件や規格で決める目安で、普遍的な合格値ではありません。',
    '局所加振では、方向別の割合ではなく、加振点と評価点の固有ベクトルの値で判断します。割合が小さいモードでも、腹を直接押せば大きく揺れます。',
    '累積比で応力や加速度の精度は保証されません。応答解析で、評価点の結果がモード数で変わらなくなるかを確かめます。'
   ])+p('<a href="analysis.html#modal-frequency/mfreq-six/results">モーダル周波数応答の結果で、有効質量と局所応力を別々に比較する →</a>')+
    p('同じ振動数の対や近い振動数のモードは、実行ごとに組合せや並びが変わることがあります。対の有効質量を合計して比べ、1行目同士を引き算しません。')+
    p('振動数を加振周波数から離したいときは、要素ひずみエネルギー（ESE）をモードごとに出力し、そのモードでエネルギーが集中する要素の剛性を上げると効率よく振動数が動きます。ESE はモードの中で比べ、モード間では比べません。'),'modal-output-judge'],
   ['4. 間違いやすい読み方',table(['見え方・疑問','実際の意味と確かめ方'],[
    ['「REAL EIGENVALUES」で検索しても見つからない','表題は1文字ずつ空けて印字されています。E I G E N V A L U E S のように空いた語で探します。'],
    ['EIGENVALUE を固有振動数として報告した','λ ＝ ω² です。Hz は CYCLES（時間の単位が秒のとき）を使います。'],
    ['GENERALIZED MASS が 1。質量が消えた？','MASS 正規化の結果です。構造の総質量は GPWG（GRID POINT WEIGHT GENERATOR）で確かめます。'],
    ['7.526897E-14 のような値を、そのまま割合として読んだ','E−14 は 10 のマイナス14乗で、計算上の 0 です。E の後ろの指数を必ず見ます。'],
    ['固有ベクトルの値を実際の変位だと思った','正規化した形の成分です。正規化の約束を変えると数値が変わります。実際の振幅は応答解析で求めます。'],
    ['モード応力や反力を、そのまま許容値と比べた','固有ベクトルと同じく、形の倍率で大きさが変わる値です。分布や集中する場所を見るのに使い、実際の値は応答解析で求めます。'],
    ['MAXIMUM DISPLACEMENTS の行番号を SUBCASE だと思った','SOL 103 のこの例では各行がモード（1〜8）です。成分ごとの最大で、場所は固有ベクトルの表で探します。'],
    ['FRACTION と SUM を取り違えた','FRACTION はそのモードだけ、SUM はその行までの累積です。FRACTION 0.16・SUM 0.80 は「単独で 16%、累積で 80%」です。'],
    ['有効質量を GPWG の質量で割った','分母は A-SET RIGID BODY MASS MATRIX の同じ方向の対角です。固定した点の質量は動かないので入りません。'],
    ['同じ振動数の2モードの片方を消した','別方向の曲げなどの別モードです。対で残し、方向は対の合計で比べます。'],
    ['R の列に値があるのでねじりだと思った','曲げでも、たわみ角として R2・R3 に値が出ます。ねじりは梁の軸（この例は X）まわりの回転だけが大きいモードです。'],
    ['ある方向の割合が7次まで 0。その方向には揺れない？','その方向のモードが高い振動数にあるだけです。帯域外でも質量は加振とともに動き、支持には力がかかります。'],
    ['累積比が 90% を超えたので全部十分','評価する周波数帯、局所の応力・加速度、応答がモード数で変わらないかを別に確かめます。'],
    ['MODAL EFFECTIVE WEIGHT には重力加速度が掛かっている','QRG では有効重量＝有効質量 ÷ WTMASS です。WTMASS ＝ 1 なら有効質量と同じ数値です。'],
    ['刺激係数が負。逆向きにしか揺れない？','固有ベクトルの符号は任意です。形と係数を一組で扱い、係数だけ絶対値にして足し合わせません。'],
    ['MEFFMASS を入れたのに係数の表がない','SUMMARY だけになっていないか、ALL か PARTFAC、PRINT の指定、対象の SUBCASE を確かめます。']
   ]),'modal-output-traps'],
   ['5. F06を読む確認問題',window.AnalysisQuiz.render('modes-f06')+
    '<div class="analysis-sources">'+[
     ['Dynamic_Analysis_User_Guide',79,'MSC 2025.1 動解析ガイド：固有値・固有ベクトル・拘束反力の印字（PDF 79）'],
     ['Dynamic_Analysis_User_Guide',119,'MSC 2025.1 動解析ガイド：刺激係数・有効質量・ESE（PDF 119–123）'],
     ['Quick_Reference_Guide',502,'MSC 2025.1 QRG：MEFFMASS（PDF 502–503）'],
     ['Quick_Reference_Guide',938,'MSC 2025.1 QRG：PARAM,PRTMAXIM（PDF 938）'],
     ['Quick_Reference_Guide',1814,'MSC 2025.1 QRG：EIGRL（PDF 1814–1817）']
    ].map(([book,pg,label])=>'<a href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_'+book+'/raw/resource/enus/MSC_Nastran_2025.1_'+book+'.pdf#page='+pg+'" target="_blank" rel="noopener">'+label+' ↗</a>').join('')+'</div>','modal-output-quiz']
  ];
 }
 const reference=()=>p('<a href="analysis.html#modes/baseline/results">実固有値の結果：F06 の読み方・有効質量・確認問題 →</a>');

 for(const model of ['baseline','tip-mass','both-fixed']){
  const guide=window.AnalysisModelGuides[model];
  guide.inputReview=[...(guide.inputReview||[]),['追加する結果出力',[
   ['CASE_MEFFMASS','MEFFMASS(PRINT,ALL)=YESを追加すると、刺激係数・有効質量・累積比をF06で確認できます。既存DATの条件は変更していません。表の読み方は結果タブへ。']
  ]]];
  window.AnalysisRelationMaps[model].panels.push({
   title:'必要に応じて追加する結果出力',note:'既存DATとは別の追加要求です。自由形式のCase Controlへ記入し、通常の実固有モードについて評価します。',
   layers:[['meffmass']],nodes:[{id:'meffmass',label:'MEFFMASS',card:'CASE_MEFFMASS',detail:'PRINT,ALL = YES / 刺激係数・有効質量・累積比'}],edges:[]
  });
 }
 window.AnalysisScenarioGuides.modes.basics[0][1].push('結果タブでは、学習用の仮想F06を印字順にたどり、同じモードの振動数・刺激係数・方向別質量比・節点成分を照合できます。');

 window.AnalysisModalOutput={sections,bind,reference};
})();
