/* Measured output from the cited SOL 103 job. Ranges use the source's 1-based F06 lines. */
(() => {
  'use strict';
  const source = 'https://github.com/LorenzoSekules/RoboticArm/blob/3feefaab63ef83f90e21cdb4a86c65dbb93856cc/Assembling/Patran/boom.f06';
  const print = {
    roots: {label:"抽出した根の数", parts:[
      {first:288, text:`E I G E N V A L U E  A N A L Y S I S   S U M M A R Y   (READ MODULE)`},
      {first:296, text:`           NUMBER OF ROOTS FOUND ................    10`}
    ]},
    rootsTable: {label:"1次と2次の固有値", parts:[
      {first:304, text:`                                           R E A L   E I G E N V A L U E S
MODE    EXTRACTION      EIGENVALUE            RADIANS             CYCLES            GENERALIZED         GENERALIZED
 NO.       ORDER                                                                       MASS              STIFFNESS
     1         1        1.639340E+03        4.048877E+01        6.443987E+00        1.000000E+00        1.639340E+03
     2         2        1.639340E+03        4.048877E+01        6.443987E+00        1.000000E+00        1.639340E+03`}
    ]},
    summary: {label:"10モード合計の方向別比率", parts:[
      {first:321, text:`                    M O D A L   E F F E C T I V E   M A S S   S U M M A R Y



                                 TOTAL EFFECTIVE MASS FRACTION
                   AT REFERENCE POINT          1   IN BASIC COORDINATE SYSTEM


     T1                T2                T3                R1                R2                R3
9.555129E-01      9.555129E-01      8.613486E-01      9.995207E-01      9.995207E-01      8.613486E-01`}
    ]},
    captured: {label:"有効質量行列・第1行", parts:[
      {first:335, text:`                                 EFFECTIVE MASS MATRIX
***                                                                                  ***
*   3.569882E+02 -2.631790E-13 -2.467413E-11  4.732376E-13  9.287343E+02  9.152076E-15 *`}
    ]},
    reference: {label:"基準となる質量行列・第1行", parts:[
      {first:345, text:`                              A-SET RIGID BODY MASS MATRIX
***                                                                                  ***
*   3.736090E+02  0.000000E+00  0.000000E+00  0.000000E+00  9.334795E+02  0.000000E+00 *`}
    ]},
    translation: {label:"並進・1、2、3、5、10次", parts:[
      {first:359, text:`                                                MODAL EFFECTIVE MASS FRACTION
                                            (FOR TRANSLATIONAL DEGREES OF FREEDOM)

MODE    FREQUENCY                      T1                                  T2                                  T3
 NO.                        FRACTION            SUM             FRACTION            SUM             FRACTION            SUM

   1    6.443987E+00      6.541947E-01      6.541947E-01      2.634671E-12      2.634671E-12      6.009189E-33      6.009189E-33
   2    6.443987E+00      2.634671E-12      6.541947E-01      6.541947E-01      6.541947E-01      2.796262E-33      8.805451E-33
   3    4.018907E+01      2.004851E-01      8.546798E-01      2.691264E-17      6.541947E-01      1.973791E-34      9.002830E-33`},
      {first:369, text:`   5    1.117079E+02      6.767109E-02      9.223509E-01      8.882430E-20      8.546798E-01      1.872764E-31      1.974931E-31`},
      {first:374, text:`  10    2.711163E+02      5.013194E-27      9.555129E-01      1.280478E-27      9.555129E-01      8.613486E-01      8.613486E-01`}
    ]},
    rotation: {label:"回転・1次と7次", parts:[
      {first:380, text:`                                                MODAL EFFECTIVE MASS FRACTION
                                             (FOR ROTATIONAL DEGREES OF FREEDOM)

MODE    FREQUENCY                      R1                                  R2                                  R3
 NO.                        FRACTION            SUM             FRACTION            SUM             FRACTION            SUM

   1    6.443987E+00      3.910487E-12      3.910487E-12      9.709825E-01      9.709825E-01      2.041986E-32      2.041986E-32`},
      {first:392, text:`   7    1.652317E+02      6.316832E-33      9.987321E-01      2.166484E-32      9.987321E-01      8.613486E-01      8.613486E-01`}
    ]},
    participation: {label:"刺激係数・1次と2次", parts:[
      {first:401, text:`                                                 MODAL PARTICIPATION FACTORS

MODE     FREQUENCY               T1                T2                T3                R1                R2                R3
 NO.

   1    6.443987E+00     -1.563371E+01      3.137414E-05      1.495313E-15     -1.071325E-04     -5.338404E+01     -1.949106E-16
   2    6.443987E+00     -3.137414E-05     -1.563371E+01     -1.020030E-15      5.338404E+01     -1.071325E-04     -1.970463E-17`}
    ]},
    mass: {label:"有効質量・1次と合計", parts:[
      {first:424, text:`                                                     MODAL EFFECTIVE MASS

MODE     FREQUENCY               T1                T2                T3                R1                R2                R3
 NO.

   1    6.443987E+00      2.444130E+02      9.843369E-10      2.235961E-30      1.147737E-08      2.849856E+03      3.799015E-32`},
      {first:440, text:`              TOTAL       3.569882E+02      3.569882E+02      3.204994E+02      2.933616E+03      2.933616E+03      1.602497E+00`}
    ]},
    weight: {label:"有効重量・1次", parts:[
      {first:447, text:`                                                    MODAL EFFECTIVE WEIGHT

MODE     FREQUENCY               T1                T2                T3                R1                R2                R3
 NO.

   1    6.443987E+00      2.444130E+02      9.843369E-10      2.235961E-30      1.147737E-08      2.849856E+03      3.799015E-32`}
    ]},
    maximum: {label:"モードごとの最大成分・1、7、10行", parts:[
      {first:469, text:`0                                                  MAXIMUM  DISPLACEMENTS
  SUBCASE/
  DAREA ID        T1             T2             T3             R1             R2             R3
0        1   1.0012604E-01  2.0093555E-07  7.0565855E-18  5.8773656E-08  2.9286871E-02  1.8499935E-16`},
      {first:478, text:`0        7   4.1142646E-16  5.0257300E-16  2.7054341E-16  4.7897242E-15  5.6484900E-15  1.0037307E+00`},
      {first:481, text:`0       10   2.5628798E-12  1.0633335E-12  7.0974480E-02  1.8546787E-11  2.5258407E-11  2.4550027E-11`}
    ]},
    vector1: {label:"1次・節点1と11", parts:[
      {first:485, text:`EIGENVALUE =  1.639340E+03
    CYCLES =  6.443987E+00         R E A L   E I G E N V E C T O R   N O .          1

POINT ID.   TYPE          T1             T2             T3             R1             R2             R3
       1      G      0.0            0.0            0.0            0.0            0.0            0.0`},
      {first:499, text:`      11      G     -1.001260E-01   2.009355E-07   3.312385E-18  -5.877366E-08  -2.928687E-02  -8.129436E-17`}
    ]},
    vector2: {label:"2次・節点11", parts:[
      {first:503, text:`EIGENVALUE =  1.639340E+03
    CYCLES =  6.443987E+00         R E A L   E I G E N V E C T O R   N O .          2

POINT ID.   TYPE          T1             T2             T3             R1             R2             R3`},
      {first:517, text:`      11      G     -2.009355E-07  -1.001260E-01  -2.629334E-18   2.928687E-02  -5.877365E-08  -7.073937E-17`}
    ]},
    end: {label:"解析の終了", parts:[
      {first:669, text:`0                                   * * * *  A N A L Y S I S  S U M M A R Y  T A B L E  * * * *`},
      {first:693, text:`1                                        * * * END OF JOB * * *`}
    ]}
  };
  const pages = [
    {
      page:'3–8', name:'結果を読む前に', blocks:['roots'],
      read:'3頁の CASE CONTROL ECHO で、SUBCASE 1、METHOD = 1、SPC = 2、MEFFMASS(ALL,GRID=1) を確認します。4頁の MODEL SUMMARY は GRID 11・CBEAM 10。5頁の GRID POINT WEIGHT GENERATOR（GPWG）では、質量 398.6681 と重心 Z = 2.35（X・Y は 0）が読めます。重心が Z 軸上にあるので、このブームは基本 Z 方向に伸びています。X・Y まわりの慣性も同じ（7.338816E+02）なので、断面は対称で、X と Y の曲げは同じ振動数の対になると予想できます。8頁には見つかった根の数 10 が出ます。',
      use:'まず末尾の END OF JOB と FATAL の有無を見てから、ここへ戻ります。GPWG の質量と重心が設計値と合わなければ、固有値を読む前に密度・単位・集中質量を直します。拘束したのに 0 Hz 付近の根が出たら、そのモードで動く部位（拘束漏れや未接続の部品）を探します。'
    },{
      page:'9', name:'固有値と振動数', blocks:['rootsTable'],
      read:'1・2次の CYCLES は 6.443987。時間の単位が秒なら Hz です（F06 に単位は印字されません）。RADIANS の 40.48877 ÷ 2π と、√EIGENVALUE ÷ 2π が同じ値になります。GENERALIZED MASS がすべて 1 なので MASS 正規化です。この実行では 1・2、3・4、5・6、8・9 次が同じ振動数の対で、X と Y の曲げです。7次と10次は対になりません（後の表で、ねじりと軸方向と分かります）。',
      use:'加振源の周波数がどのモードの近くかを見ます。同じ振動数の対は、片方を重複と思って捨てず、2つとも残します。対のベクトルが X・Y に分かれて出る保証はありません。同じ振動数の範囲で回った組合せも正しい解です。方向は11頁の有効質量比で、対の合計として確かめます。'
    },{
      page:'10', name:'方向別の合計と、その分母', blocks:['summary','captured','reference'],
      read:'10モードの合計で、T1・T2（このブームの曲げ方向）は各 95.55%、T3（軸方向）は 86.13%。同じ頁の2つの 6×6 行列の T1 対角を比べます。EFFECTIVE MASS MATRIX の 356.9882 がモードでとらえた質量、A-SET RIGID BODY MASS MATRIX の 373.6090 が動ける自由度全体の質量で、比は 0.955513 です。行列の印字例は各第1行です。',
      use:'分母は5頁の GPWG の 398.6681 ではありません。差の 25.059 は固定した節点1が受け持つ質量で、どのモードでも動かないので数えられません。一様な梁10要素に連成質量（PARAM,COUPMASS）を使ったとすると、要素1本の質量 39.86681 のうち固定端に割り当たる分（隣の節点との連成を含めて 264/420）が 25.059 で、差と一致します。PARAM の中身は F06 に印字されていないので、この一致からの推定です。T3 の分母は 320.4994 ÷ 0.8613486 ≈ 372.09 と少し違うので、比は必ず同じ方向の対角で取ります。'
    },{
      page:'11', name:'並進の各モードと累積比', blocks:['translation'],
      read:'各方向に FRACTION（このモードだけ）と SUM（この行までの累積）が並びます。1次の T1 は 65.42%。2次では T1 の SUM はほぼ動かず、T2 が 65.42% 増えます。T1 の SUM は3次で 85.47%、5次で 92.24%。T3 は9次までほぼ 0 で、10次（271.1 Hz）で一気に 86.13% になります。10次はこのブームの軸方向の伸び縮みです。',
      use:'X 方向の一様な基盤加振で、案件の目安が 90% なら、この出力では5次で初めて超えます。5・6次は対なので、保持する範囲の境を対の途中に置きません。Z（軸方向）に加振するなら、271 Hz が加振帯域の中か外かで判断が分かれます。帯域の外なら共振せず、質量はほぼ一体で（準静的に）動きます。残りの 13.9% はさらに高い縦振動にあるので、モードを足すより、帯域外の質量を静的な補正で扱えるかを検討します。'
    },{
      page:'12', name:'回転の各モードと累積比', blocks:['rotation'],
      read:'括弧内が ROTATIONAL に変わり、列は R1・R2・R3 です。1次の R2 は 97.10%。X 方向の曲げで、先端側が基準点1のまわりに Y 軸回転するためです。ねじり（軸まわりの回転）はこのブームでは R3 で、7次（165.2 Hz）が 86.13% を持ちます。',
      use:'回転の有効量が大きいだけで、ねじりとは決めません。どの軸まわりかを梁の軸の向きと照らします。回転の比は基準点（ここでは GRID=1）で変わるので、別のモデルと比べるときは基準点をそろえます。支持が揺動する試験では、この表で加振軸を選びます。'
    },{
      page:'13', name:'刺激係数の符号と方向', blocks:['participation'],
      read:'同じ1次の行でも、基本 X の係数は −15.63371、基本 Y は約 0.0000314 です。2次では Y の方が −15.63371。この表の値は QRG の ε（＝m⁻¹φᵀMD）で、この教材の β です。MASS 正規化なので、動解析ガイドの Γ（＝φᵀMD）とも同じ数値になります。',
      use:'一様な基盤加速度が入る方向の列を読みます。符号は固有ベクトルと対です。モード形全体の符号を逆にすれば係数も逆になり、両者の積は同じです。節点に直接力を加える試験では、この表ではなく、その節点・方向のモード成分を使います。'
    },{
      page:'14–15', name:'有効質量と有効重量', blocks:['mass','weight'],
      read:'14頁の1次 T1 は 244.4130。MASS 正規化（一般化質量 1）なので、13頁の (−15.63371)² と印字精度で一致します。244.4130 ÷ 373.6090 ＝ 0.654195 が11頁の1次 T1 の FRACTION です。TOTAL 行の T1 は10頁の 356.9882 に戻ります。15頁の MODAL EFFECTIVE WEIGHT は14頁と同じ数値です。QRG では有効重量＝有効質量 ÷ PARAM,WTMASS なので、この実行は WTMASS ＝ 1（既定）と読めます。',
      use:'「この方向の加振にどれだけの質量が効くか」を言うなら14頁、「何割をとらえたか」なら11頁を使います。有効重量という名前でも、WTMASS ＝ 1 なら重力加速度は掛かっていません。表に kg や N の単位は印字されないので、報告書にはモデルの単位を自分で付けます。'
    },{
      page:'16–26', name:'各モードの主成分と、節点のモード形', blocks:['maximum','vector1','vector2'],
      read:'16頁の MAXIMUM DISPLACEMENTS は、この実行では1〜10行がモード番号に対応します。各行は、そのモードで全節点から成分ごとに選んだ最大の絶対値です。1行目は T1 が最大で X 曲げ、7行目は R3 だけが大きくねじり、10行目は T3 が大きく軸方向です。場所と符号は17頁からの固有ベクトルで読みます。固定端の節点1は全成分 0、先端の節点11 は1次で T1 ＝ −0.1001260、2次で T2 ＝ −0.1001260 です。',
      use:'センサーは、主要モードで値が大きい節点（腹）に置き、0 に近い節点（節）を避けます。加振点も同じ考えで選びます。測定と比べるときは、節点の出力座標系をセンサーの向きに合わせます。0.1001260 は MASS 正規化した形の成分で、実際の変位ではありません。実際の振幅は、加振力と減衰を与えた周波数応答・過渡応答で求めます。'
    },{
      page:'27', name:'終了確認と解析判断', blocks:['end'],
      read:'ANALYSIS SUMMARY TABLE の後に END OF JOB が出ます。終了の目印に加え、FATAL・WARNING の本文、対象の SUBCASE、抽出された根の数 10、評価に使う表がそろったかを確かめます。',
      use:'このブームを X・Y に一様加振するなら、10モードで 95% を超えています。Z（軸方向）なら、271 Hz の縦振動と加振帯域の関係を先に確かめます。先端に加振器を付けるなら、方向別の比ではなく、先端の各モード成分で励起されやすさを判断します。'
    }
  ];
  function external(url, label) {
    return '<a href="'+url+'" target="_blank" rel="noopener">'+label+' ↗</a>';
  }
  const axes=['T1','T2','T3','R1','R2','R3'];
  const axisNames=['X並進','Y並進','Z並進','X軸まわりの回転','Y軸まわりの回転','Z軸まわりの回転'];
  const directions=axes.map((axis,i)=>[axis,axisNames[i]]);
  const modeFrequency=[['MODE NO.','モード番号'],['FREQUENCY','そのモードの固有振動数（この例はHz）']];
  function fractions(first) {
    return [...modeFrequency,...directions.slice(first,first+3).flatMap(([axis,name])=>[
      [axis+' / FRACTION',name+'の、このモードだけの割合'],
      [axis+' / SUM',name+'の、このモードまでの累積割合']
    ])];
  }
  const layouts={
    roots:['EIGENVALUE ANALYSIS SUMMARY (READ MODULE)',[['NUMBER OF ROOTS FOUND','抽出で得た根の数。この集計は項目名の右に値が出る。']]],
    rootsTable:['REAL EIGENVALUES',[
      ['MODE NO.','モード番号。他の結果表で同じ振動形を探すときの番号'],
      ['EXTRACTION ORDER','ソルバーが根を抽出した順序'],
      ['EIGENVALUE','固有値 λ。通常の弾性モードでは ω²'],
      ['RADIANS','固有角振動数 ω（rad/s）'],
      ['CYCLES','固有振動数 f（Hz）。加振周波数と比較する列'],
      ['GENERALIZED MASS','一般化質量 φᵀMφ。MASS正規化では約1'],
      ['GENERALIZED STIFFNESS','一般化剛性 φᵀKφ。この値を一般化質量で割ると λ']
    ]],
    summary:['MODAL EFFECTIVE MASS SUMMARY → TOTAL EFFECTIVE MASS FRACTION',directions],
    captured:['EFFECTIVE MASS MATRIX',directions],
    reference:['A-SET RIGID BODY MASS MATRIX',directions],
    translation:['MODAL EFFECTIVE MASS FRACTION (FOR TRANSLATIONAL DEGREES OF FREEDOM)',fractions(0)],
    rotation:['MODAL EFFECTIVE MASS FRACTION (FOR ROTATIONAL DEGREES OF FREEDOM)',fractions(3)],
    participation:['MODAL PARTICIPATION FACTORS',[...modeFrequency,...directions]],
    mass:['MODAL EFFECTIVE MASS',[...modeFrequency,...directions]],
    weight:['MODAL EFFECTIVE WEIGHT',[...modeFrequency,...directions]],
    maximum:['MAXIMUM DISPLACEMENTS',[['SUBCASE/DAREA ID','この実行では行の番号がモード番号（1〜10行）。節点番号はこの表に出ない'],...directions]],
    vector1:['REAL EIGENVECTOR NO. 1',[['POINT ID.','節点または点の番号'],['TYPE','点の種類。本例の G は GRID'],...directions]],
    vector2:['REAL EIGENVECTOR NO. 2',null],
    end:['ANALYSIS SUMMARY TABLE → END OF JOB',null]
  };
  const layoutNotes={
    rootsTable:'上下2行の列名を縦につなげて読みます。右端の GENERALIZED は2列あり、下段の MASS と STIFFNESS で区別します。',
    summary:'総括の大見出しの下にある1行の結果です。各列の値は、抽出した全モードの方向別累積比です。',
    captured:'6×6行列です。数値の上に列名は再印字されません。行も列もT1・T2・T3・R1・R2・R3の順。対角は同一方向、非対角は方向間の連成です。',
    reference:'直前の EFFECTIVE MASS MATRIX と同じ行・列順です。同一方向の比率を確かめるには、両行列の同じ対角位置を使います。',
    translation:'「T1 / SUM」は上段のT1と下段のSUMを組み合わせた読み方です。スラッシュは解説用で、印字には入りません。',
    rotation:'上段がR1・R2・R3に変わります。それぞれの下に FRACTION と SUM の2列があります。',
    participation:'T1～R3に並ぶ数値は符号付きの刺激係数です。この実行では基本座標、回転の基準は節点1です。',
    mass:'T1～R3に並ぶのは各モードの有効量です。T列は並進質量、R列は回転慣性に対応し、最後の TOTAL 行が列ごとの合計です。',
    weight:'列順は直前の MODAL EFFECTIVE MASS と同じで、重量側の値が入ります。',
    maximum:'各行は、そのモードで全節点の中から成分ごとに選んだ最大の絶対値です。並進（T）と回転（R）は単位が違うので、T同士・R同士で比べます。6列の最大が同じ節点とは限りません。',
    vector1:'EIGENVALUE と CYCLES は表の上に印字されるモードの情報です。節点データの第1列は POINT ID.。T・Rはその節点の出力座標系で読みます。',
    vector2:'1次と同じ8列が繰り返されます。表題末尾の NO. と節点番号を組にして同じ点を比較します。',
    end:'END OF JOB は終了の目印で、数値列を持ちません。'
  };
  function columnGuide(key) {
    const [,columns]=layouts[key];
    const labels=columns?'<ol class="f06-columns" aria-label="左端からの列順">'+columns.map(([name,meaning])=>
      '<li><code>'+name+'</code>　'+meaning+'</li>').join('')+'</ol>':'';
    return (columns?'<strong>'+(key==='roots'?'集計項目':'各列の読み方（左から）')+'</strong>':'')+labels+(layoutNotes[key]?'<p>'+layoutNotes[key]+'</p>':'');
  }
  function excerpt(key) {
    const block=print[key];
    const last=part=>part.first+part.text.split('\n').length-1;
    const rows=block.parts.map((part,i)=>{
      const gap=i?'<span class="f06-gap">（原本の'+(last(block.parts[i-1])+1)+'～'+(part.first-1)+'行を省略）</span>\n':'';
      return gap+part.text;
    }).join('\n');
    const start=block.parts[0].first,end=last(block.parts[block.parts.length-1]);
    return '<h4 class="f06-title" lang="en">'+layouts[key][0]+'</h4><figure class="f06-excerpt"><pre class="aq-line" dir="ltr" tabindex="0" aria-label="'+block.label+'">'+rows+'</pre><figcaption>'+
      external(source+'#L'+start+'-L'+end,'原本 '+start+'–'+end+' 行　'+block.label)+'</figcaption></figure>'+columnGuide(key);
  }
  function pageBody(index) {
    const page=pages[index];
    return '<h3>F06 p. '+page.page+'　'+page.name+'</h3>'+page.blocks.map(excerpt).join('')+
      '<p><strong>この行から分かること</strong></p><p>'+page.read+'</p><div class="element-note"><strong>実務での判断</strong><p>'+page.use+'</p></div>';
  }
  function reader() {
    const options=pages.map((page,i)=>'<option value="'+i+'"'+(i===1?' selected':'')+'>p. '+page.page+'　'+page.name+'</option>').join('');
    const index=pages.map((page,i)=>'<li><button type="button" data-f06-index="'+i+'">p. '+page.page+'　'+page.name+'</button><span lang="en">'+page.blocks.map(key=>layouts[key][0]).join(' → ')+'</span></li>').join('');
    return '<div data-f06-reader><p>ここで読むのは、公開されたロボットアームのブーム（基本 Z 方向に伸びる片持ち梁）の実出力です（MSC Nastran 2022.2、SUBCASE 1）。アプリの梁モデルとは別のモデルです。各表を横に動かすと、右端の列まで読めます。</p>'+
      '<details class="analysis-shared f06-index"><summary>英語の表題を印字順に見る</summary><ol>'+index+'</ol></details>'+
      '<label class="analysis-selector">読む表を選ぶ<select data-f06-page>'+options+'</select></label>'+
      '<div class="f06-controls"><button type="button" data-f06-prev>前の表</button><button type="button" data-f06-next>次の表</button></div>'+
      '<div data-f06-body aria-live="polite">'+pageBody(1)+'</div>'+
      '<p>ページ番号・表題・数値は公開された実行結果の印字に合わせています。各抜粋は共通の左右余白を詰め、離れた行の間には省略位置を示しました。'+external(source,'公開されたF06全27頁')+'</p></div>';
  }
  function bind(root) {
    const element=root.querySelector('[data-f06-reader]');
    if(!element)return;
    const select=element.querySelector('[data-f06-page]'), previous=element.querySelector('[data-f06-prev]'), next=element.querySelector('[data-f06-next]');
    function show(index) {
      select.selectedIndex=index;
      previous.disabled=index===0;
      next.disabled=index===pages.length-1;
      element.querySelector('[data-f06-body]').innerHTML=pageBody(index);
    }
    select.addEventListener('change',()=>show(select.selectedIndex));
    for(const item of element.querySelectorAll('[data-f06-index]'))item.addEventListener('click',()=>{
      show(Number(item.dataset.f06Index));
      item.closest('details').open=false;
      select.focus();
    });
    previous.addEventListener('click',()=>show(select.selectedIndex-1));
    next.addEventListener('click',()=>show(select.selectedIndex+1));
  }
  window.AnalysisF06Reader={reader,bind,print,source};
})();
