/* 学習用の仮想出力（SOL 103）。MSC Nastran の実行結果ではない。
   表題・列の並び・数値の書式は実際の F06 に合わせ、数値は手計算で確かめやすい切りの良い値にした。
   想定：基本X方向に置いた長さ1.5 mの片持ちの柱。0.15 mおきの節点1〜11に10 kgずつ、節点1を固定、正方形断面。単位 kg・m・s。
   EIGRL ND=8（NORM=MASS）、MEFFMASS(ALL,GRID=1)=YES、PARAM,GRDPNT、PARAM,PRTMAXIM,YES、DISPLACEMENT(PRINT)=ALL を想定。
   表どうしの数値の関係は mobile/tools/check-modal-output.cjs で確かめる。 */
(() => {
  'use strict';
  const V={
   "gpwgTitle": "O U T P U T   F R O M   G R I D   P O I N T   W E I G H T   G E N E R A T O R",
   "gpwgDir": "     DIRECTION",
   "gpwgHead": "MASS AXIS SYSTEM (S)     MASS              X-C.G.        Y-C.G.        Z-C.G.",
   "gpwg": [
    "        X            1.100000E+02      0.000000E+00  0.000000E+00  0.000000E+00",
    "        Y            1.100000E+02      7.500000E-01  0.000000E+00  0.000000E+00",
    "        Z            1.100000E+02      7.500000E-01  0.000000E+00  0.000000E+00"
   ],
   "rootsTitle": "E I G E N V A L U E  A N A L Y S I S   S U M M A R Y   (READ MODULE)",
   "roots": "           NUMBER OF ROOTS FOUND ................     8",
   "eigTitle": "                                           R E A L   E I G E N V A L U E S",
   "eigHead": [
    "MODE    EXTRACTION      EIGENVALUE            RADIANS             CYCLES            GENERALIZED         GENERALIZED",
    " NO.       ORDER                                                                       MASS              STIFFNESS"
   ],
   "eig": [
    "     1         1        9.869604E+02        3.141593E+01        5.000000E+00        1.000000E+00        9.869604E+02",
    "     2         2        9.869604E+02        3.141593E+01        5.000000E+00        1.000000E+00        9.869604E+02",
    "     3         3        3.553058E+04        1.884956E+02        3.000000E+01        1.000000E+00        3.553058E+04",
    "     4         4        3.553058E+04        1.884956E+02        3.000000E+01        1.000000E+00        3.553058E+04",
    "     5         5        9.869604E+04        3.141593E+02        5.000000E+01        1.000000E+00        9.869604E+04",
    "     6         6        2.526619E+05        5.026548E+02        8.000000E+01        1.000000E+00        2.526619E+05",
    "     7         7        2.526619E+05        5.026548E+02        8.000000E+01        1.000000E+00        2.526619E+05",
    "     8         8        5.684892E+05        7.539822E+02        1.200000E+02        1.000000E+00        5.684892E+05"
   ],
   "sumTitle": "                    M O D A L   E F F E C T I V E   M A S S   S U M M A R Y",
   "sumSub": [
    "                                 TOTAL EFFECTIVE MASS FRACTION",
    "                   AT REFERENCE POINT          1   IN BASIC COORDINATE SYSTEM"
   ],
   "sumHead": "     T1                T2                T3",
   "sum": "8.100000E-01      8.900000E-01      8.900000E-01",
   "asetTitle": "                              A-SET RIGID BODY MASS MATRIX",
   "asetStars": "***                                                                                  ***",
   "aset": [
    "*   1.000000E+02  0.000000E+00  0.000000E+00  0.000000E+00  0.000000E+00  0.000000E+00 *",
    "*   0.000000E+00  1.000000E+02  0.000000E+00  0.000000E+00  0.000000E+00  8.250000E+01 *",
    "*   0.000000E+00  0.000000E+00  1.000000E+02  0.000000E+00 -8.250000E+01  0.000000E+00 *"
   ],
   "fracTitle": [
    "                                                MODAL EFFECTIVE MASS FRACTION",
    "                                            (FOR TRANSLATIONAL DEGREES OF FREEDOM)"
   ],
   "fracHead": [
    "MODE    FREQUENCY                      T1                                  T2                                  T3",
    " NO.                        FRACTION            SUM             FRACTION            SUM             FRACTION            SUM"
   ],
   "frac": [
    "   1    5.000000E+00      3.015370E-32      3.015370E-32      6.400000E-01      6.400000E-01      7.526897E-14      7.526897E-14",
    "   2    5.000000E+00      6.698727E-32      9.714097E-32      7.526897E-14      6.400000E-01      6.400000E-01      6.400000E-01",
    "   3    3.000000E+01      9.330127E-33      1.064711E-31      1.600000E-01      8.000000E-01      1.946603E-14      6.400000E-01",
    "   4    3.000000E+01      1.786062E-33      1.082572E-31      1.946603E-14      8.000000E-01      1.600000E-01      8.000000E-01",
    "   5    5.000000E+01      9.549151E-30      9.657408E-30      2.447175E-28      8.000000E-01      7.938926E-29      8.000000E-01",
    "   6    8.000000E+01      5.000000E-33      9.662408E-30      9.000000E-02      8.900000E-01      3.819660E-15      8.000000E-01",
    "   7    8.000000E+01      1.169777E-33      9.663578E-30      3.819660E-15      8.900000E-01      9.000000E-02      8.900000E-01",
    "   8    1.200000E+02      8.100000E-01      8.100000E-01      2.061074E-27      8.900000E-01      4.322727E-28      8.900000E-01"
   ],
   "pfTitle": "                                                 MODAL PARTICIPATION FACTORS",
   "tableHead": [
    "MODE     FREQUENCY               T1                T2                T3",
    " NO."
   ],
   "pf": [
    "   1    5.000000E+00      1.736482E-15      8.000000E+00      2.743519E-06",
    "   2    5.000000E+00     -2.588190E-15     -2.743519E-06     -8.000000E+00",
    "   3    3.000000E+01      9.659258E-16     -4.000000E+00      1.395207E-06",
    "   4    3.000000E+01     -4.226183E-16      1.395207E-06      4.000000E+00",
    "   5    5.000000E+01      3.090170E-14     -1.564345E-13      8.910065E-14",
    "   6    8.000000E+01     -7.071068E-16      3.000000E+00      6.180340E-07",
    "   7    8.000000E+01      3.420201E-16     -6.180340E-07     -3.000000E+00",
    "   8    1.200000E+02      9.000000E+00      4.539905E-13     -2.079117E-13"
   ],
   "massTitle": "                                                     MODAL EFFECTIVE MASS",
   "mass": [
    "   1    5.000000E+00      3.015370E-30      6.400000E+01      7.526897E-12",
    "   2    5.000000E+00      6.698727E-30      7.526897E-12      6.400000E+01",
    "   3    3.000000E+01      9.330127E-31      1.600000E+01      1.946603E-12",
    "   4    3.000000E+01      1.786062E-31      1.946603E-12      1.600000E+01",
    "   5    5.000000E+01      9.549151E-28      2.447175E-26      7.938926E-27",
    "   6    8.000000E+01      5.000000E-31      9.000000E+00      3.819660E-13",
    "   7    8.000000E+01      1.169777E-31      3.819660E-13      9.000000E+00",
    "   8    1.200000E+02      8.100000E+01      2.061074E-25      4.322727E-26"
   ],
   "massTotal": "              TOTAL       8.100000E+01      8.900000E+01      8.900000E+01",
   "weightTitle": "                                                    MODAL EFFECTIVE WEIGHT",
   "weight": [
    "   1    5.000000E+00      3.015370E-30      6.400000E+01      7.526897E-12"
   ],
   "maxTitle": [
    "0                                                  MAXIMUM  DISPLACEMENTS",
    "  SUBCASE/",
    "  DAREA ID        T1             T2             T3             R1             R2             R3"
   ],
   "max": [
    "0        1   2.1316282E-16  2.0000000E-01  6.8587975E-08  4.4408921E-15  6.2940898E-08  1.8353333E-01",
    "0        2   3.0531133E-16  6.8587975E-08  2.0000000E-01  1.9984014E-15  1.8353333E-01  6.2940898E-08",
    "0        3   1.3877788E-16  2.0000000E-01  6.9760350E-08  2.6645353E-15  2.2237739E-07  6.3754667E-01",
    "0        4   2.4980018E-16  6.9760350E-08  2.0000000E-01  3.3306691E-15  6.3754667E-01  2.2237739E-07",
    "0        5   3.6082248E-15  8.1878948E-15  5.8869504E-15  1.0000000E+00  2.2204460E-14  1.6653345E-14",
    "0        6   1.1102230E-16  2.0000000E-01  4.1202267E-08  5.5511151E-15  2.1575430E-07  1.0472933E+00",
    "0        7   1.6653345E-16  4.1202267E-08  2.0000000E-01  3.8857806E-15  1.0472933E+00  2.1575430E-07",
    "0        8   1.4142136E-01  4.1078251E-15  2.8865799E-15  6.6613381E-15  3.3306691E-14  2.7755576E-14"
   ],
   "vecCols": "POINT ID.   TYPE          T1             T2             T3             R1             R2             R3",
   "vecZero": "       1      G      0.0            0.0            0.0            0.0            0.0            0.0",
   "vec1": [
    "EIGENVALUE =  9.869604E+02",
    "    CYCLES =  5.000000E+00         R E A L   E I G E N V E C T O R   N O .          1"
   ],
   "vec1Tip": "      11      G      2.131628E-16   2.000000E-01   6.858798E-08  -4.440892E-15  -6.294090E-08   1.835333E-01",
   "vec2": [
    "EIGENVALUE =  9.869604E+02",
    "    CYCLES =  5.000000E+00         R E A L   E I G E N V E C T O R   N O .          2"
   ],
   "vec2Tip": "      11      G      3.053113E-16  -6.858798E-08  -2.000000E-01   1.998401E-15   1.835333E-01  -6.294090E-08",
   "end": [
    "0                                   * * * *  A N A L Y S I S  S U M M A R Y  T A B L E  * * * *",
    "1                                        * * * END OF JOB * * *"
   ]
  };
  const omitR='（右に続く R1・R2・R3 の列は省略）';
  const print = {
    gpwg:{label:'全体の質量と重心', parts:[[V.gpwgTitle],[V.gpwgDir,V.gpwgHead,...V.gpwg]]},
    roots:{label:'見つかった根の数', parts:[[V.rootsTitle],[V.roots]]},
    rootsTable:{label:'8モードの固有値', parts:[[V.eigTitle,...V.eigHead,...V.eig]]},
    summary:{label:'8モード合計の方向別比率', parts:[[V.sumTitle,'',...V.sumSub,'',V.sumHead,V.sum]], note:omitR},
    reference:{label:'分母になる質量行列・1〜3行目', parts:[[V.asetTitle,V.asetStars,...V.aset]], note:'（4〜6行目は省略）'},
    translation:{label:'並進・8モードの割合と累積', parts:[[...V.fracTitle,'',...V.fracHead,'',...V.frac]]},
    participation:{label:'刺激係数・8モード', parts:[[V.pfTitle,'',...V.tableHead,'',...V.pf]], note:omitR},
    mass:{label:'有効質量・8モードと合計', parts:[[V.massTitle,'',...V.tableHead,'',...V.mass,'',V.massTotal]], note:omitR},
    weight:{label:'有効重量・1次', parts:[[V.weightTitle,'',...V.tableHead,'',...V.weight]], note:omitR},
    maximum:{label:'モードごとの最大成分・1〜8行', parts:[[...V.maxTitle,...V.max]]},
    vector1:{label:'1次・節点1と11', parts:[[...V.vec1,'',V.vecCols,V.vecZero],[V.vec1Tip]], gap:'（節点2〜10は省略）'},
    vector2:{label:'2次・節点11', parts:[[...V.vec2,'',V.vecCols],[V.vec2Tip]], gap:'（節点1〜10は省略）'},
    end:{label:'解析の終了', parts:[[V.end[0]],[V.end[1]]]}
  };
  const steps = [
    {
      name:'結果を読む前に', blocks:['gpwg','roots'],
      read:'GPWG の MASS は 110、重心の X 座標は 0.75 です（Y・Z の行で読みます）。11節点 × 10 kg ＝ 110 kg、重心は長さ 1.5 m の柱の中央で、入力どおりです。見つかった根の数は 8 で、EIGRL で指定した数（ND ＝ 8）と合っています。',
      use:'まず末尾の END OF JOB と FATAL の有無を見てから、ここへ戻ります。質量と重心が設計値と合わなければ、固有値を読む前に密度・単位・集中質量を直します。根の数が指定より少なければ、指定した振動数の範囲に根がそれだけしかなかったということです。拘束したのに 0 Hz 付近の根が出たら、拘束漏れや未接続の部品を探します。'
    },{
      name:'固有値と振動数', blocks:['rootsTable'],
      read:'CYCLES が固有振動数で、時間の単位が秒なら Hz です（F06 に単位は印字されません）。1・2次は 5 Hz、3・4次は 30 Hz、6・7次は 80 Hz で、同じ振動数の対です。断面が正方形なので、Y と Z の曲げが同じ振動数になります。5次（50 Hz）と8次（120 Hz）は対になりません（後の表で、ねじりと軸方向と分かります）。RADIANS は CYCLES の 2π 倍（5 Hz なら 31.41593）、EIGENVALUE はその2乗です。GENERALIZED MASS がすべて 1 なので MASS 正規化です。',
      use:'加振源の周波数がどのモードの近くかを見ます。同じ振動数の対は、片方を重複と思って捨てず、2つとも残します。対のベクトルが Y・Z にきれいに分かれて出る保証はありません。斜めに回った組合せも正しい解なので、方向は有効質量比を対で合計して確かめます。'
    },{
      name:'方向別の合計と、その分母', blocks:['summary','reference'],
      read:'8モードの合計で、T1 は 0.81、T2・T3 は 0.89 です。分母は A-SET RIGID BODY MASS MATRIX の対角で、どの方向も 100 です。これは動ける節点2〜11の質量の合計です。',
      use:'分母は GPWG の 110 ではありません。差の 10 は固定した節点1の質量で、どのモードでも動かないので数えません。拘束を変えると分母も変わるので、別のモデルと比べるときは分母をそろえます。'
    },{
      name:'並進の各モードと累積比', blocks:['translation'],
      read:'各方向に FRACTION（このモードだけ）と SUM（この行までの累積）が並びます。T2 は1次で 0.64、3次で 0.16 増えて SUM 0.80、6次で 0.89。T3 は2・4・7次で同じように増えます。T1 は7次まで 0 で、8次（120 Hz）で 0.81 になります。8次は軸方向の伸び縮みです。7.526897E-14 のような値は 10 のマイナス14乗の大きさなので、計算上の 0 と読みます。',
      use:'Y 方向の一様な基盤加振で、案件の目安が 80% なら3次で届きます。3・4次は対なので、残すモードの境を対の途中に置かず、4次まで残します。X 方向に 0〜100 Hz で加振するなら、120 Hz の8次は帯域のすぐ外です。共振はしませんが応答には効くので残します。残りの 19% はさらに高い縦振動にあるので、モードを足すより、静的な補正で扱えるかを検討します。'
    },{
      name:'刺激係数の符号と方向', blocks:['participation'],
      read:'1次は T2 が 8、2次は T3 が −8 です。MASS 正規化（一般化質量 1）なので、2乗すると次の表の有効質量 64 になります。5次（ねじり）は T1〜T3 がほぼ 0 で、一様な並進の加振ではほとんど揺れません。',
      use:'一様な基盤加速度が入る方向の列を読みます。符号は固有ベクトルの向きと対です。形全体の符号を逆にすれば係数も逆になり、両者の積は同じです。節点に直接力を加える試験では、この表ではなく、その節点・方向のモード成分を使います。'
    },{
      name:'有効質量と有効重量', blocks:['mass','weight'],
      read:'有効質量は刺激係数の2乗です（1・2次 64、3・4次 16、6・7次 9、8次 81）。分母の 100 で割ると FRACTION になり、TOTAL 行（T1 81、T2・T3 89）を割ると方向別の合計 0.81・0.89 に戻ります。MODAL EFFECTIVE WEIGHT は有効質量と同じ数値です。QRG では有効重量＝有効質量 ÷ PARAM,WTMASS で、この例は WTMASS ＝ 1（既定）だからです。',
      use:'「この方向の加振にどれだけの質量が効くか」を言うならこの表、「何割をとらえたか」なら FRACTION を使います。有効重量という名前でも、WTMASS ＝ 1 なら重力加速度は掛かっていません。表に kg や N の単位は印字されないので、報告書にはモデルの単位を自分で付けます。'
    },{
      name:'各モードの主成分と、節点のモード形', blocks:['maximum','vector1','vector2'],
      read:'MAXIMUM DISPLACEMENTS は、この実行では1〜8行がモード番号に対応します。各行は、そのモードで全節点から成分ごとに選んだ最大の絶対値です。1行目は T2、2行目は T3 が大きく曲げ、5行目は R1（X 軸まわりの回転）だけが大きくねじり、8行目は T1 が大きく軸方向です。曲げの行で R3・R2 にも値があるのは、たわみ角です。固有ベクトルでは、固定した節点1は全成分 0、先端の節点11 は1次で T2 ＝ 0.2、2次で T3 ＝ −0.2 です。',
      use:'センサーは、主要モードで値が大きい節点（腹）に置き、0 に近い節点（節）を避けます。加振点も同じ考えで選びます。0.2 は MASS 正規化した形の成分で、実際の変位ではありません。実際の振幅は、加振力と減衰を与えた周波数応答・過渡応答で求めます。MAXIMUM DISPLACEMENTS の表は、PARAM,PRTMAXIM,YES のときだけ印字されます。'
    },{
      name:'終了確認と解析判断', blocks:['end'],
      read:'ANALYSIS SUMMARY TABLE の後に END OF JOB が出ます。終了の目印に加え、FATAL・WARNING の本文、見つかった根の数 8、評価に使う表がそろったかを確かめます。',
      use:'8番目の根が 120 Hz なので、100 Hz までのモードは全部求まっています。この柱を Y・Z に 0〜100 Hz で一様に加振するなら、帯域内の1〜7次で各 89% をとらえており、残りは帯域外なので静的な補正で扱えるかを確かめます。先端に加振器を付けるなら、方向別の比ではなく、先端の各モード成分で揺れやすさを判断します。'
    }
  ];
  const axes=['T1','T2','T3','R1','R2','R3'];
  const axisNames=['X並進','Y並進','Z並進','X軸まわりの回転','Y軸まわりの回転','Z軸まわりの回転'];
  const directions=axes.map((axis,i)=>[axis,axisNames[i]]),translational=directions.slice(0,3);
  const modeFrequency=[['MODE NO.','モード番号'],['FREQUENCY','そのモードの固有振動数（この例はHz）']];
  const fractions=[...modeFrequency,...translational.flatMap(([axis,name])=>[
    [axis+' / FRACTION',name+'の、このモードだけの割合'],
    [axis+' / SUM',name+'の、このモードまでの累積割合']
  ])];
  const layouts={
    gpwg:['GRID POINT WEIGHT GENERATOR → MASS AXIS SYSTEM (S)',[
      ['DIRECTION','質量が動く方向（X・Y・Z）'],
      ['MASS','その方向に動く質量。拘束した点も含む全体の値'],
      ['X-C.G.・Y-C.G.・Z-C.G.','重心の座標']
    ]],
    roots:['EIGENVALUE ANALYSIS SUMMARY (READ MODULE)',[['NUMBER OF ROOTS FOUND','抽出で得た根の数。この集計は項目名の右に値が出る。']]],
    rootsTable:['REAL EIGENVALUES',[
      ['MODE NO.','モード番号。他の結果表で同じ振動形を探すときの番号'],
      ['EXTRACTION ORDER','ソルバーが根を抽出した順序'],
      ['EIGENVALUE','固有値 λ。通常の弾性モードでは ω²'],
      ['RADIANS','固有角振動数 ω（rad/s）'],
      ['CYCLES','固有振動数 f（Hz）。加振周波数と比較する列'],
      ['GENERALIZED MASS','一般化質量 φᵀMφ。MASS正規化では1'],
      ['GENERALIZED STIFFNESS','一般化剛性 φᵀKφ。この値を一般化質量で割ると λ']
    ]],
    summary:['MODAL EFFECTIVE MASS SUMMARY → TOTAL EFFECTIVE MASS FRACTION',translational],
    reference:['A-SET RIGID BODY MASS MATRIX',directions],
    translation:['MODAL EFFECTIVE MASS FRACTION (FOR TRANSLATIONAL DEGREES OF FREEDOM)',fractions],
    participation:['MODAL PARTICIPATION FACTORS',[...modeFrequency,...translational]],
    mass:['MODAL EFFECTIVE MASS',[...modeFrequency,...translational]],
    weight:['MODAL EFFECTIVE WEIGHT',[...modeFrequency,...translational]],
    maximum:['MAXIMUM DISPLACEMENTS',[['SUBCASE/DAREA ID','この実行では行の番号がモード番号（1〜8行）。節点番号はこの表に出ない'],...directions]],
    vector1:['REAL EIGENVECTOR NO. 1',[['POINT ID.','節点または点の番号'],['TYPE','点の種類。本例の G は GRID'],...directions]],
    vector2:['REAL EIGENVECTOR NO. 2',null],
    end:['ANALYSIS SUMMARY TABLE → END OF JOB',null]
  };
  const layoutNotes={
    gpwg:'各行で、自分と同じ方向の重心の欄は 0 と印字されます（X の行の X-C.G. など）。重心の X 座標は Y・Z の行で読みます。',
    rootsTable:'上下2行の列名を縦につなげて読みます。右端の GENERALIZED は2列あり、下段の MASS と STIFFNESS で区別します。',
    summary:'総括の大見出しの下にある1行の結果です。各列は、抽出した全モードの方向別の累積比です。',
    reference:'6×6行列の1〜3行目です。数値の上に列名は再印字されません。行も列も T1・T2・T3・R1・R2・R3 の順です。対角の 1.000000E+02 が各方向の分母です。8.250000E+01 は並進と回転のつながり（質量 × 基準点からの距離の合計）で、割合の計算には使いません。',
    translation:'「T1 / SUM」は上段の T1 と下段の SUM を組み合わせた読み方です。スラッシュは解説用で、印字には入りません。',
    participation:'T1〜T3 に並ぶ数値は符号付きの刺激係数です。この実行では基本座標、回転の基準は節点1です。',
    mass:'T1〜T3 に並ぶのは各モードの有効質量で、最後の TOTAL 行が列ごとの合計です。',
    weight:'列順は直前の MODAL EFFECTIVE MASS と同じで、重量側の値が入ります。',
    maximum:'各行は、そのモードで全節点の中から成分ごとに選んだ最大の絶対値です。並進（T）と回転（R）は単位が違うので、T 同士・R 同士で比べます。6列の最大が同じ節点とは限りません。',
    vector1:'EIGENVALUE と CYCLES は表の上に印字されるモードの情報です。節点データの第1列は POINT ID.。T・R はその節点の出力座標系で読みます。',
    vector2:'1次と同じ8列が繰り返されます。表題末尾の NO. と節点番号を組にして同じ点を比べます。',
    end:'END OF JOB は終了の目印で、数値列を持ちません。'
  };
  function columnGuide(key) {
    const [,columns]=layouts[key];
    const labels=columns?'<ol class="f06-columns" aria-label="左端からの列順">'+columns.map(([name,meaning])=>
      '<li><code>'+name+'</code>　'+meaning+'</li>').join('')+'</ol>':'';
    return (columns?'<strong>'+(key==='roots'?'集計項目':'各列の読み方（左から）')+'</strong>':'')+labels+(layoutNotes[key]?'<p>'+layoutNotes[key]+'</p>':'');
  }
  const gapLine=text=>'<span class="f06-gap">'+text+'</span>';
  function excerpt(key) {
    const block=print[key];
    const rows=block.parts.map(part=>part.join('\n')).join('\n'+gapLine(block.gap||'（中略）')+'\n')+(block.note?'\n'+gapLine(block.note):'');
    return '<h4 class="f06-title" lang="en">'+layouts[key][0]+'</h4><figure class="f06-excerpt"><pre class="aq-line" dir="ltr" tabindex="0" aria-label="'+block.label+'">'+rows+'</pre><figcaption>学習用の仮想出力　'+block.label+'</figcaption></figure>'+columnGuide(key);
  }
  const stepLabel=i=>(i+1)+'. '+steps[i].name;
  function stepBody(index) {
    const step=steps[index];
    return '<h3>'+stepLabel(index)+'</h3>'+step.blocks.map(excerpt).join('')+
      '<p><strong>この行から分かること</strong></p><p>'+step.read+'</p><div class="element-note"><strong>実務での判断</strong><p>'+step.use+'</p></div>';
  }
  function reader() {
    const options=steps.map((step,i)=>'<option value="'+i+'"'+(i===1?' selected':'')+'>'+stepLabel(i)+'</option>').join('');
    const index=steps.map((step,i)=>'<li><button type="button" data-f06-index="'+i+'">'+stepLabel(i)+'</button><span lang="en">'+step.blocks.map(key=>layouts[key][0]).join(' → ')+'</span></li>').join('');
    return '<div data-f06-reader><p>ここで読むのは、読み方を学ぶために作った<strong>仮想の F06</strong> です。MSC Nastran の実行結果ではありません。表題・列の並び・数値の書式は実際の F06 と同じにし、数値は手計算で確かめやすい切りの良い値にしました。</p>'+
      '<p>想定したモデル：基本 X 方向に置いた長さ 1.5 m の片持ちの柱。0.15 m おきの節点1〜11 に 10 kg ずつ質量があり、節点1を固定しています。断面は正方形です。単位は kg・m・s なので、振動数は Hz、質量は kg で読みます。各表を横に動かすと、右端の列まで読めます。</p>'+
      '<details class="analysis-shared f06-index"><summary>英語の表題を印字順に見る</summary><ol>'+index+'</ol></details>'+
      '<label class="analysis-selector">読む表を選ぶ<select data-f06-page>'+options+'</select></label>'+
      '<div class="f06-controls"><button type="button" data-f06-prev>前の表</button><button type="button" data-f06-next>次の表</button></div>'+
      '<div data-f06-body aria-live="polite">'+stepBody(1)+'</div>'+
      '<p>印字の順序やページ番号は、実行条件と出力要求で変わります。抜粋では共通の左余白を詰め、省いた行と列は（ ）で示しました。</p></div>';
  }
  function bind(root) {
    const element=root.querySelector('[data-f06-reader]');
    if(!element)return;
    const select=element.querySelector('[data-f06-page]'), previous=element.querySelector('[data-f06-prev]'), next=element.querySelector('[data-f06-next]');
    function show(index) {
      select.selectedIndex=index;
      previous.disabled=index===0;
      next.disabled=index===steps.length-1;
      element.querySelector('[data-f06-body]').innerHTML=stepBody(index);
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
  window.AnalysisF06Reader={reader,bind,print,line:V};
})();
