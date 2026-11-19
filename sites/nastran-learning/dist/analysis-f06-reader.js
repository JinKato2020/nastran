/* Measured output from the cited SOL 103 job. Ranges use the source's 1-based F06 lines. */
(() => {
  'use strict';
  const source = 'https://github.com/LorenzoSekules/RoboticArm/blob/3feefaab63ef83f90e21cdb4a86c65dbb93856cc/Assembling/Patran/boom.f06';
  const plotSource = 'https://github.com/VirginiaTechWLee/Thesis_Workflow/blob/30ed2781e863ee307b7c8a384e1ec9ab4e4781b5/baseline/fixed_base_beam.f06';
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
    rotation: {label:"回転・1次", parts:[
      {first:380, text:`                                                MODAL EFFECTIVE MASS FRACTION
                                             (FOR ROTATIONAL DEGREES OF FREEDOM)

MODE    FREQUENCY                      R1                                  R2                                  R3
 NO.                        FRACTION            SUM             FRACTION            SUM             FRACTION            SUM

   1    6.443987E+00      3.910487E-12      3.910487E-12      9.709825E-01      9.709825E-01      2.041986E-32      2.041986E-32`}
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
    maximum: {label:"最大成分・先頭行", parts:[
      {first:469, text:`0                                                  MAXIMUM  DISPLACEMENTS
  SUBCASE/
  DAREA ID        T1             T2             T3             R1             R2             R3
0        1   1.0012604E-01  2.0093555E-07  7.0565855E-18  5.8773656E-08  2.9286871E-02  1.8499935E-16`}
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
      read:'3頁の CASE CONTROL ECHO で SUBCASE 1、4頁の MODEL SUMMARY で11節点・梁10要素、5頁の GRID POINT WEIGHT GENERATOR で基準点1と並進質量398.6681を確認します。7頁には OLOAD RESULTANT と抽出時の情報、8頁には計算で見つかった根の数10が出ます。',
      use:'まず末尾で解析の終了と FATAL MESSAGE の有無を確認してから、この順に戻ります。固定のつもりでほぼ0 Hzのモードが出たら、質量比の評価を始める前にそのモードで動く部位を探します。自由支持なら剛体モードが予想どおりかを先に調べます。'
    },{
      page:'9', name:'固有値と振動数', blocks:['rootsTable'],
      read:'1・2次とも CYCLES は6.443987。秒系なので Hz です。RADIANS の40.48877を2πで割ると同じ値になります。一般化剛性1639.340を一般化質量1で割ると EIGENVALUE に戻ります。モードを追う番号は MODE NO.、抽出処理の順序は EXTRACTION ORDER です。',
      use:'6.4 Hz付近に加振源があれば、まずこの2つを両方残します。振動数が表示桁まで同じでも、動く方向は別の可能性があります。方向は11頁と17・18頁で照合します。共振時の振幅を求める段階では、加振力と減衰も必要です。'
    },{
      page:'10', name:'方向別の合計と、その分母', blocks:['summary','captured','reference'],
      read:'10モード合計で基本X（T1）とY（T2）は各95.55%、Z（T3）は86.13%。同じ頁の2つの6×6行列を見ます。T1の対角値は、採用したモードが表す356.9882と、解析自由度全体に対する373.6090。前者÷後者＝0.955513です。行列の印字例は各第1行です。',
      use:'仮に案件の方向別目標が90%なら、水平2方向はこの指標を満たし、鉛直方向は追加抽出の候補です。分母に5頁の398.6681を入れると別の比率になります。基準点は1。回転方向の比を別モデルと比べるときは基準点もそろえます。'
    },{
      page:'11', name:'並進の各モードと累積比', blocks:['translation'],
      read:'各方向に FRACTION（このモード分）と SUM（この行までの合計）が並びます。1次のT1は65.42%。2次ではT1の SUM はほぼ横ばいで、代わりにT2が65.42%増えます。T1の SUM は3次で85.47%、5次で92.24%。T3は9次までほぼゼロで、10次で初めて86.13%になります。',
      use:'一様なX方向の基盤加振で90%を目安にするなら、この出力上は5次が最初の到達点です。ただし5・6次は同じ周波数域の対です。保持範囲の境を対の途中に置かず、加振帯域を覆い、評価点の応答が収束することも確かめます。'
    },{
      page:'12', name:'回転の各モードと累積比', blocks:['rotation'],
      read:'11頁と同じ表題ですが、括弧内が ROTATIONAL に変わり、列は R1・R2・R3 になります。1次のR2は97.10%。これは基準点1のまわりにY軸回転を与える剛体運動への寄与です。',
      use:'支持が並進する試験なら、励起方向はまず11頁で選びます。支持が揺動する試験なら12頁も使います。R2が大きいという事実だけで梁のねじりとは判定できません。曲げでも基準点まわりに大きく動きます。節点の並進と回転の分布へ戻ります。'
    },{
      page:'13', name:'刺激係数の符号と方向', blocks:['participation'],
      read:'同じ1次の行でも、基本Xの係数は−15.63371、基本Yは約0.0000314です。2次ではYの方が−15.63371。モード番号・振動数・列を一組で照合すると、同じ周波数帯の直交する応答を区別できます。',
      use:'一様な基盤加速度が入る方向の列を読みます。符号は固有ベクトルと対です。モード形全体の符号を逆にすれば係数も逆になり、両者の積は同じです。節点に直接力を加える試験では、その節点・方向でのモード成分と荷重の積を見ます。'
    },{
      page:'14–15', name:'有効質量と有効重量', blocks:['mass','weight'],
      read:'14頁の1次T1は244.4130。この実行では一般化質量が1なので、13頁の (−15.63371)² と印字精度内で一致します。さらに244.4130÷373.6090＝0.654195。これが11頁の1次T1の FRACTION です。TOTAL 行のT1は10頁の356.9882へ戻ります。',
      use:'「この方向の加振にどれだけの質量が効くか」を説明するなら14頁、採用率なら11頁を使います。15頁は重量側です。この例では数値が一致しますが、換算は WTMASS に依存します。結果表には kg や N の単位表示がないため、報告書にはモデルで確認した単位を付けます。'
    },{
      page:'16–26', name:'最大成分と節点のモード形', blocks:['maximum','vector1','vector2'],
      read:'16頁は成分ごとの最大値です。場所と符号を知るには17頁からの POINT ID. を読みます。固定端の節点1は全成分0。先端の節点11は1次でT1＝−0.1001260、2次でT2＝−0.1001260。振動数が同じでも、最大となる方向が入れ替わります。印字例は固定端・先端を抜き出しています。',
      use:'測定と比べるときはセンサー位置・向きを節点とその出力座標系に合わせます。T1～T3は並進、R1～R3は回転です。先端の0.1001260は正規化した形の成分です。変位や加速度の実振幅を知るには、周波数応答や過渡応答で実際の加振条件を与えます。'
    },{
      page:'27', name:'終了確認と解析判断', blocks:['end'],
      read:'ANALYSIS SUMMARY TABLE の後に END OF JOB が出ます。終了の目印に加え、FATAL・WARNING の本文、対象の SUBCASE、抽出された10根、評価に使うモードと表がそろったかを確かめます。',
      use:'この梁を水平・鉛直の基盤振動に使うなら、10モードではまず鉛直の不足を記録します。さらに高いモードを加え、鉛直の累積比と対象周波数帯の応答を再比較します。先端に加振器を付ける試験では、別途、先端の各モード成分と取付部の応力の収束を確認します。'
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
    maximum:['MAXIMUM DISPLACEMENTS',[['SUBCASE/DAREA ID','この集計行の識別欄。節点番号はこの表には出ない'],...directions]],
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
    maximum:'各成分の最大絶対値が並びます。6列の最大が同一節点で生じるとは限りません。',
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
    return '<div data-f06-reader><p>実固有値の一覧は <b lang="en">REAL EIGENVALUES</b>。左端がモード番号、5列目の <b lang="en">CYCLES</b> が固有振動数です。以下はアプリ内のモデルとは別の、公開されたロボットアームの梁の実出力です（MSC Nastran 2022.2、SUBCASE 1）。各表を横に動かすと、右端の列まで読めます。</p>'+
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
  function missing() {
    return '<p>照合したもう一つの固定梁（MSC Nastran 2025.1）では、F06に固有値と有効質量・刺激係数が並ぶ一方、節点ごとの固有ベクトル表はありません。ケースの出力先が DISPLACEMENT(PLOT) なので、形は結果データベース側で確認します。印字順やページ番号は実行条件・出力先で変わります。'+external(plotSource+'#L194-L198','2025.1の実ファイル')+'</p>';
  }
  window.AnalysisF06Reader={reader,bind,missing};
})();
