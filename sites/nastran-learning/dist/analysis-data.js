window.NastranAnalysis = {models:window.PublicAnalysisModels,entries:[
  {
    "key": "static",
    "title": "静解析",
    "sol": "SOL 101",
    "summary": "単純支持トラスの静解析。7節点・11部材を通じて、節点・要素・断面・材料の参照関係、支持自由度、荷重の組合せを学び、変位・軸力・支持反力を検算します。",
    "inputs": [
      [
        "形状・単位系",
        "N・mm・MPaを使用します。全長6000 mm、高さ1800 mm。下側の節点1・3・5・7はX=0・2000・4000・6000 mm、Y=0。上側の節点2・4・6はX=1500・3000・4500 mm、Y=900・1800・900 mmです。全節点のZは0です。"
      ],
      [
        "要素・断面・材料",
        "11本のCRODはGRIDで定義した2点を接続し、PROD 1を介してMAT1 1を参照します。断面積A=800 mm²、ヤング率E=70000 MPa、ポアソン比ν=0.33。部材はピン接合・軸力のみの平面トラスとして扱い、線形弾性・微小変位を仮定します。"
      ],
      [
        "支持条件",
        "左端GRID1は成分12、右端GRID7は成分2を拘束。全節点のGRID PS=3456で面外並進と回転を止めます。SPCADD 2がSPC1セット1と3を結び、Case ControlのSPC=2で選択します。"
      ],
      [
        "荷重の選択",
        "GRID2・4・6に、それぞれ鉛直下向き2000 Nと水平右向き1000 Nを与えます。FORCEセット1は−Y、セット3は＋X。LOAD 2で各倍率1.0として合成し、Case ControlのLOAD=2で選択します。集中荷重は全て節点へ作用させます。"
      ]
    ],
    "outputs": [
      "以下は節点の釣合い式と平面トラス剛性法による独立計算の照合値です。MSC Nastranの実行結果ではありません。F06ではSPCFORCES→DISPLACEMENT→ELEMENT FORCES/STRESSESの順に同じ節点・部材を照合します。",
      "支持反力：節点1のX=−3000 N、Y=＋2400 N、節点7のY=＋3600 N。全体の水平外力＋3000 Nと鉛直外力−6000 Nに釣り合います。符号は基本座標系の＋X右向き、＋Y上向きです。",
      "左支持点まわりのモーメント：6000×Ry7 − 2000×(1500＋3000＋4500) − 1000×(900＋1800＋900)=0。これからRy7=3600 N、Ry1=6000−3600=2400 Nを得ます。水平荷重の作用高さも含めるのが要点です。",
      "荷重の重ね合わせ：鉛直荷重のみでは左右3000 Nずつ。水平荷重のみでは左Y=−600 N、右Y=＋600 Nが生じます。両者の和が上の反力です。LOADの水平セット倍率を0にすると、この比較を確認できます。",
      "節点変位：中央上部の節点4はUx=＋0.371556 mm、Uy=−1.179794 mm。最大の下向き変位は節点3のUy=−1.206095 mmで、頂点とは限りません。変位図の表示倍率と数値を区別します。",
      "部材の軸力・軸応力：CROD 9（節点1–3）は＋7000 N、＋8.750000 MPaで引張り。CROD 4（節点6–7）は−6997.142 N、−8.746428 MPaで圧縮。σ=N/Aで照合します。正が引張り、負が圧縮です。"
    ],
    "checks": [
      "節点1のUx・Uyと節点7のUyが0であることを確認する。節点7のUxは拘束しない。",
      "CRODの軸力は部材軸方向の力であり、全体座標のX成分やY成分そのものではありません。",
      "この静定トラスでは、支持・形状・荷重を保って全てのEまたはAを2倍にすると変位は半分、軸力と反力は同じです。Aを2倍にした場合は軸応力も半分になります。"
    ],
    "examples": [
      "static"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas101/lesson_01.pdf",
        "label": "入力構成の参考：NAS101 Workshop 1 · PDF3・23"
      }
    ],
    "links": [
      [
        "theory.html#static",
        "静解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ],
    "inputNote": "N・mm・MPaにそろえた入力全文です。節点・接続・荷重・拘束と、独立計算の照合値を確認しています。MSC Nastran本体では未実行です。"
  },
  {
    "key": "modes",
    "title": "固有値解析",
    "sol": "SOL 103",
    "summary": "NAS102 Workshop 1の片持ち板から5つの固有振動数を抽出します。この板を後続の周波数応答・過渡応答でも使用します。",
    "inputs": [
      [
        "共通板モデル",
        "5 in×2 in×0.1 inの板、55 GRID・40 CQUAD4。E=3.0×10⁷ psi、ν=0.3、重量密度0.282 lbf/in³。WTMASS=0.00259で質量へ換算し、COUPMASS=1を保持します。"
      ],
      [
        "支持",
        "左辺GRID1・12・23・34・45の成分12345をSPC1で拘束します。成分6を勝手に追加せず、原典の支持とシェルの回転自由度の扱いを確認します。"
      ],
      [
        "固有値条件",
        "METHOD=1がEIGRL 1を選択し、ND=5で5モードを要求します。外力を与えずに、質量と剛性、支持条件から固有値を計算します。"
      ]
    ],
    "outputs": [
      "原典PDF23の周波数は133.6996、689.7916、843.8915、2212.030、2379.052 Hz。固有値表のCYCLES欄と比較します。",
      "モード形は任意の規格化倍率です。応答変位と混同せず、曲げ・ねじりの形、固定辺の動き、モード順序を確認します。"
    ],
    "checks": [
      "低次モードが極端に低い場合は拘束・未接続・単位を点検する。",
      "周波数だけでなくモード形も比較する。材料密度とWTMASSを同時に変更して二重換算しない。"
    ],
    "examples": [
      "modes"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas102/prob01.pdf",
        "label": "NAS102 Workshop 1: Modal Analysis of a Flat Plate · PDF 3, 4, 18, 19, 20, 23"
      }
    ],
    "links": [
      [
        "theory.html#modes",
        "固有値解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "heat",
    "title": "熱伝導解析",
    "sol": "SOL 153",
    "summary": "Patran 2021の公開ガイド第2章に沿って、温度指定・入熱・対流を同じ板で扱います。求める量は板内部の温度と熱流で、熱応力は別の解析です。",
    "inputs": [
      [
        "形状・物性",
        "幅1 m×高さ3 m×厚さ0.1 m。0.2 m間隔、5×15=75四角形要素。熱伝導率204 W/(m·K)、密度2707 kg/m³、比熱896 J/(kg·K)。後二者は非定常解析への拡張で蓄熱に関係します。"
      ],
      [
        "既知温度と未知温度",
        "下辺を50°Cに保持します。左側の周囲温度20°Cは流体の温度であり、板の左辺温度そのものを20°Cに固定しません。板内部と左・右辺の温度は求める結果です。"
      ],
      [
        "入出熱・断熱",
        "右辺へ内向き5000 W/m²。左辺はh=10 W/(m²·K)で20°Cの周囲と対流します。上辺・表裏には熱交換を定義しない2次元モデルです。この断熱扱いは条件の省略から読み取るモデル仮定です。"
      ],
      [
        "入力への対応",
        "原典PDF28–30でメッシュ、37–46で境界条件を作成します。MAT4・板要素の物性・温度拘束・熱流束・対流面と周囲温度の対応を確認し、PatranからMSC Nastran入力を出力します。"
      ]
    ],
    "outputs": [
      "原典PDF51には温度分布のコンターが掲載されています。これは表形式の数値出力ではないため、図から読み取った温度を厳密な正解値にはしません。",
      "独自の熱収支検算：右辺の面積3×0.1=0.3 m²、総入熱5000×0.3=1500 W。定常状態では、温度を維持する下辺と左辺の対流から出る正味熱量がこの入熱と釣り合います。",
      "温度境界の反力に相当する熱流と対流面の熱流を集計します。上下の温度差だけで放熱先を判断しません。"
    ],
    "checks": [
      "境界の熱流束と面積から熱流量を別々に計算する。",
      "定常反復の開始温度を非定常の初期温度と混同しない。非定常への拡張は原典第7章を参照。"
    ],
    "examples": null,
    "availability": "原典にはPatranでの一連の作成手順があります。完全なDATリスト・直接ダウンロードできるDATは未取得です。画面の条件説明を「公式の完成入力ファイル」とは扱いません。",
    "sources": [
      {
        "url": "https://nexus.hexagon.com/community/cfs-file/__key/communityserver-discussions-components-files/816/DOC12832-_2D00_-patran_5F00_2021_5F00_nastran_5F00_thermal.pdf",
        "label": "Patran 2021 Interface to MSC Nastran Thermal, Chapter 2: Getting Started – A Guided Exercise · PDF 21, 22, 23, 28, 29, 30, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 51"
      }
    ],
    "links": [
      [
        "theory.html#heat",
        "熱伝導解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "modal-frequency",
    "title": "モーダル周波数応答解析",
    "sol": "SOL 111",
    "summary": "NAS102 Workshop 6の板に、一様な調和圧力と位相の異なる集中力を与えます。参照番号をたどり、荷重分布・振幅・位相を確認します。",
    "inputs": [
      [
        "板と支持",
        "5 in×2 in×0.1 inの板、55 GRID・40 CQUAD4。E=3.0×10⁷ psi、ν=0.3、重量密度0.282 lbf/in³。WTMASS=0.00259で質量へ換算し、COUPMASS=1を保持します。 左辺GRID1・12・23・34・45の成分12345をSPC1で拘束します。成分6を勝手に追加せず、原典の支持とシェルの回転自由度の扱いを確認します。"
      ],
      [
        "モード・減衰",
        "METHOD=100→EIGRLで10～2000 Hzのモードを抽出。SDAMPING=100→TABDMP1 CRITで減衰比0.03。FREQ1の20 Hz刻みに加えFREQ4で共振周辺を補います。"
      ],
      [
        "圧力の経路",
        "LOADSET=100→LSEQ 100→PLOAD2 400が全40要素へ1 psiを定義。DLOADの倍率0.1により実効圧力0.1 psiになります。RLOAD2 400のEXCITEID=300をLSEQのEXCITEIDと対応させます。"
      ],
      [
        "集中力の経路",
        "RLOAD2 500→DAREA 600がGRID11の成分3へ1 lbfを定義。DPHASE 320で−45°。両荷重をDLOAD 100で合成します。"
      ]
    ],
    "outputs": [
      "原典PDF21：GRID11の成分3は133.6996 Hzで振幅0.1699121 in。周波数、振幅、位相を同じ条件で比較します。",
      "GRID11・33・55の応答を比べ、圧力と偏心した集中力が板の曲げ・ねじりへどう寄与するかを確認します。"
    ],
    "checks": [
      "Workshop 5の直接法例とは荷重と減衰の定義が違います。そのまま振幅差を解法の誤差と解釈しない。",
      "モード上限と周波数刻みを変えて、ピーク値が安定するか確認する。"
    ],
    "examples": [
      "modal-frequency"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas102/prob06.pdf",
        "label": "NAS102 Workshop 6: Modal Frequency Response Analysis · PDF 15, 16, 17, 21"
      }
    ],
    "links": [
      [
        "theory.html#modal-frequency",
        "モーダル周波数応答解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "direct-frequency",
    "title": "直接周波数応答解析",
    "sol": "SOL 108",
    "summary": "NAS102 Workshop 5の板先端へ単一の調和集中力を与え、20～1000 Hzの応答を物理自由度で解きます。",
    "inputs": [
      [
        "板と支持",
        "5 in×2 in×0.1 inの板、55 GRID・40 CQUAD4。E=3.0×10⁷ psi、ν=0.3、重量密度0.282 lbf/in³。WTMASS=0.00259で質量へ換算し、COUPMASS=1を保持します。 左辺GRID1・12・23・34・45の成分12345をSPC1で拘束します。成分6を勝手に追加せず、原典の支持とシェルの回転自由度の扱いを確認します。"
      ],
      [
        "荷重と減衰",
        "DLOAD=500→RLOAD2 500→DAREA 600がGRID11の成分3へ1 lbfを与えます。TABLED1 310は振幅倍率1。PARAM G=0.06は構造減衰で、粘性減衰比を直接指定した値ではありません。"
      ],
      [
        "周波数・出力",
        "FREQUENCY=100→FREQ1、20 Hz開始・20 Hz間隔・49増分、合計50点。DISPLACEMENT(SORT2,PHASE)=111はSET 111の3節点の複素応答を振幅と位相で要求します。"
      ]
    ],
    "outputs": [
      "原典PDF19：GRID11、20 Hz、成分3の振幅0.008817999 in、位相356.4954°。位相は−3.5046°と同じ角度です。",
      "20 Hz刻みではピーク周辺を十分に捉えない場合があります。粗い走査で共振位置を見つけ、その付近を細分化します。"
    ],
    "checks": [
      "振幅を実部、PHASEを時間遅れそのものと混同しない。",
      "応答の単位、力の成分、構造減衰Gを原典条件と照合する。"
    ],
    "examples": [
      "direct-frequency"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas102/prob05.pdf",
        "label": "NAS102 Workshop 5: Direct Frequency Response Analysis · PDF 14, 15, 19"
      }
    ],
    "links": [
      [
        "theory.html#direct-frequency",
        "直接周波数応答解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "transient",
    "title": "過渡応答解析",
    "sol": "SOL 109 / 112",
    "summary": "NAS102 Workshop 3・4の板へ有限時間の正弦波荷重を与え、加振中と加振終了後の変位を追います。二つの例は荷重条件が異なります。",
    "inputs": [
      [
        "板と支持",
        "5 in×2 in×0.1 inの板、55 GRID・40 CQUAD4。E=3.0×10⁷ psi、ν=0.3、重量密度0.282 lbf/in³。WTMASS=0.00259で質量へ換算し、COUPMASS=1を保持します。 左辺GRID1・12・23・34・45の成分12345をSPC1で拘束します。成分6を勝手に追加せず、原典の支持とシェルの回転自由度の扱いを確認します。"
      ],
      [
        "直接法 SOL109",
        "一様圧力1 psiとGRID11の50 lbf。250 Hz、0～0.008 sの2周期。TLOAD2の位相は圧力−90°、集中力＋90°。G=0.06、W3=1571 rad/sで過渡応答用の減衰へ変換します。"
      ],
      [
        "モード法 SOL112",
        "5モード、減衰比0.03。一様圧力1 psiとGRID11の25 lbf。集中力はDELAY 610で0.004 s遅れ、0.004～0.012 sに作用。TLOAD2の位相はいずれも−90°です。"
      ],
      [
        "時間・参照番号",
        "TSTEP 100は100増分×0.0004 s、出力間隔1。LOADSET→LSEQ→PLOAD2で圧力分布、DLOAD→TLOAD2で波形と倍率、DAREAで集中力の位置を選びます。"
      ]
    ],
    "outputs": [
      "原典PDF21の時刻歴と、GRID11・33・55の成分3を比較します。加振終了後も自由振動が残ること、減衰によって振幅が低下することを確認します。",
      "歴史的出力の例：0.0004 sにおけるGRID11のT3はSOL109で−0.02173625 in、SOL112で0.0001873720 in。ただし2020 SP1 QRG PDF3305 Remark18には旧版TLOAD2との1時間ステップの相違が記載されており、現行版で同時刻の一致を合格条件にはできません。"
    ],
    "checks": [
      "時間刻みを小さくし、波形のピーク・位相が安定するか確認する。",
      "直接法とモード法の比較には荷重倍率・位相・遅延・減衰をそろえた別検討が必要です。掲載2例をそのまま比較しない。"
    ],
    "examples": [
      "transient-direct",
      "transient-modal"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas102/prob03.pdf",
        "label": "NAS102 Workshop 3: Direct Transient Response Analysis · PDF 16, 17, 21"
      },
      {
        "url": "https://www.scc.kit.edu/scc/sw/msc/Nas102/prob04.pdf",
        "label": "NAS102 Workshop 4: Modal Transient Response Analysis · PDF 16, 17, 21"
      }
    ],
    "links": [
      [
        "theory.html#transient",
        "過渡応答解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "fracture",
    "title": "亀裂先端解析",
    "sol": "SOL 400",
    "summary": "MSC Nastran 2025.1 Verification Guide §6.45の中央亀裂板を参照し、四分点要素とVCCTによる破壊力学量の評価を学びます。",
    "inputs": [
      [
        "形状・材料",
        "NAFEMS R0020 Test1.1。b=20、a=10、h=20の1/4モデル、平面ひずみ、E=207000、ν=0.3。原典の単位系に整合させ、記載のないmm・MPaを原典指定と断定しません。"
      ],
      [
        "境界条件",
        "上辺に一様引張応力100。左辺はuₓ=0。下面は亀裂先端より右側だけuᵧ=0とし、亀裂面は自由。下面全体を拘束すると亀裂の開口が失われます。"
      ],
      [
        "先端要素と評価",
        "原典モデルはQUAD8と四分点TRIA6、評価はVCCT。CRAC2Dとは別のモデルです。四分点要素は先端の特異場を表すために用い、先端の物理的な特異性を消すものではありません。"
      ],
      [
        "原典データ",
        "モデル名nvcct001、配布先としてtpl/verifman/nafemsが示されています。完全な節点・要素リストはPDFにないため、図から推測したメッシュを原典DATとはしません。"
      ]
    ],
    "outputs": [
      "原典PDF387：エネルギー解放率G=2.4665、KI=749.0、K₀=560.5、KI/K₀=1.3364。参照解の正規化値は1.325です。",
      "比較対象は先端節点の最大応力ではなく、K・Gとその収束です。掲載値の差は約0.86%。この数字は原典の結果で、本アプリで実行した結果ではありません。"
    ],
    "checks": [
      "亀裂面の自由条件、対称拘束、四分点位置、平面ひずみ設定を確認する。",
      "旧版のE値に相違があるため、本教材は確認した2025.1版の207000を使用します。"
    ],
    "examples": null,
    "availability": "原典PDFでモデル条件と結果は確認済みですが、nvcct001の完全なDATは未取得です。モデル名と入手先を記録し、未完成の制御部を完成DATとして配布しません。",
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Verification_Guide/raw/resource/enus/MSC_Nastran_2025.1_Verification_Guide.pdf",
        "label": "Verification Guide 2025.1 §6.45 / NAFEMS R0020 Test1.1: Center Cracked Plate in Tension · PDF 385, 386, 387"
      }
    ],
    "links": [
      [
        "theory.html#fracture",
        "亀裂先端解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  },
  {
    "key": "buckling",
    "title": "座屈解析",
    "sol": "SOL 105",
    "summary": "2024.1 Linear Static GuideのEuler梁検証例で、基準静荷重と座屈固有値の関係を確認します。",
    "inputs": [
      [
        "梁と断面",
        "長さ10 m、10個のCBAR。断面0.1 m×0.02 m、A=0.002 m²、I1=6.667×10⁻⁸ m⁴、I2=1.667×10⁻⁶ m⁴。E=7.1×10¹⁰ Pa、ν=0.33、ρ=2700 kg/m³。GRID100を梁断面の方向指定に使用します。"
      ],
      [
        "支持・基準荷重",
        "左端GRID1は123と4を拘束、右端GRID11は23を拘束。右端へX方向−1000 N。両端の横変位を止め、片端の軸変位と剛体ねじりを止めたモデルです。"
      ],
      [
        "二つのSUBCASE",
        "SUBCASE1でLOAD=10の静解析、SUBCASE2でMETHOD=10の座屈抽出。EIGRLのND=5。STATSUBを省くと最初の静解析SUBCASEを参照するSOL105の規則を用いています。"
      ]
    ],
    "outputs": [
      "原典PDF512：最低固有値λ=0.4671909。基準圧縮力1000 Nに掛け、最低座屈荷重の大きさは約467.2 Nです。",
      "5番目の固有値は11.68153で約11681.5 N。これは強軸方向の最初の座屈に対応し、弱軸方向の高次モードと番号だけで混同しません。",
      "固有値表のCYCLES欄を振動数として読みません。SOL105では荷重倍率と座屈形状を読み取ります。"
    ],
    "checks": [
      "PBARのI1/I2とCBARの要素軸を確認し、Euler式の対応する断面二次モーメントを用いる。",
      "原典の弱軸手計算の記号表記には不整合があるため、数値6.667×10⁻⁸ m⁴で照合する。初期不整や塑性を含む耐力とは区別する。"
    ],
    "examples": [
      "buckling"
    ],
    "availability": "",
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide.pdf",
        "label": "Classical Euler Beam Buckling, bukeuler.dat · PDF 510, 511, 512, 512, 513, 514, 515"
      }
    ],
    "links": [
      [
        "theory.html#buckling",
        "座屈解析の理論"
      ],
      [
        "workflow.html#results",
        "F06・OP2の読み方"
      ],
      [
        "batch.html",
        "実行コマンド・並列計算"
      ]
    ]
  }
]};
