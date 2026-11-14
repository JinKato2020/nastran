/* Technical lessons and comparison conditions. */
window.NastranAnalysis.entries.push(...[
  {
    "key": "thermal-stress",
    "title": "熱応力解析 — 加熱と拘束",
    "sol": "SOL 101",
    "summary": "同じトラスで機械荷重のみ・温度荷重のみ・両者の合成を比較し、温度差、自由膨張、拘束による応力を区別します。温度を求める熱伝導解析ではなく、既知の温度を構造へ与える解析です。",
    "inputs": [
      [
        "2. 形状と材料",
        "500×500 mmの正方形に縦横4本と対角2本を配置した4節点・6部材のCONRODモデルです。G1=(500,500)、G2=(500,0)、G3=(0,500)、G4=(0,0) mm。対角線の交差位置には節点を置かず、そこで部材を接続しません。E=70000 MPa、ν=0.3、熱膨張係数α=2.3×10⁻⁵ /℃。縦横材の断面積は600 mm²、対角材は424.2641 mm²です。"
      ],
      [
        "3. 支持・荷重・温度",
        "左のG3/G4は平面内並進を固定し、全節点の面外並進と回転を抑制します。支持はGRIDのPS欄です。右上G1へ+Y方向4000 N、右縦部材103へ80℃を与えます。他の部材は20℃、MAT1の応力ゼロの基準温度TREFも20℃なので、部材103の温度差だけが60℃になります。"
      ],
      [
        "4. 温度セットと機械荷重の対応",
        "TEMPDのSID=20を20℃とし、TEMPRBのSID=20・EID=103でその部材の両端温度を80℃へ上書きします。SID=21は全体20℃の比較用温度場。FORCEのSID=10は4000 N、SID=11は0 Nです。温度セット番号と機械荷重セット番号を分け、全要素に基準温度を含む温度場を定義します。"
      ],
      [
        "5. 3つのSUBCASE",
        "SUBCASE 1はLOAD=10＋TEMPERATURE(LOAD)=21で機械のみ。SUBCASE 2はLOAD=11＋TEMPERATURE(LOAD)=20で熱のみ。SUBCASE 3はLOAD=10＋TEMPERATURE(LOAD)=20で機械＋熱です。0 NのFORCEは熱のみケースで外力を明示的に0にするための定義で、温度に比例する力を手入力したものではありません。"
      ],
      [
        "6. 入力の参照関係",
        "GRID → CONROD → MAT1が剛性と熱膨張係数を構成します。TEMPRBのEIDはGRID番号ではなく部材103を参照します。Case ControlのLOADはFORCEのSID、TEMPERATURE(LOAD)はTEMPD/TEMPRBのSIDを選びます。DISPLACEMENT・FORCE・STRESS・SPCFORCESを一緒に要求し、温度、変形、軸応力、支持反力を結び付けて読みます。"
      ]
    ],
    "outputs": [
      "変位はG1/G2のT1・T2を読みます。独立計算のG1 Uyは機械のみ0.1298701 mm、熱のみ0.3136364 mm、合成0.4435065 mmです。合成のG1 Uxは−0.08870130 mm、G2 Uyは−0.2054113 mmとなります。",
      "CONRODの軸応力は正が引張、負が圧縮です。部材103は機械のみ+3.030303 MPa、熱のみ−8.781819 MPa、合成−5.751516 MPa。合成では加熱部材が圧縮となり、対角部材102は+24.83636 MPaの引張になります。",
      "加熱部材103の自由膨張量は0.690000 mmですが、合成ケースの実際の伸びはG1 Uy−G2 Uy=0.6489177 mmです。伸びていても、自由膨張より伸びが小さければ弾性ひずみは圧縮側となります。",
      "SPCFORCESはG3/G4を確認します。合成でRyは+3450.909 Nと−7450.909 N、和は−4000 Nです。温度荷重を外力4000 Nへ単純加算して反力の合計を評価しないでください。熱のみの支持反力は内部拘束による対で、合力は0です。",
      "以上は入力と同条件の独立トラス計算です。実行後はf06のSUBCASEと結果の成分・単位を揃えて比較します。"
    ],
    "checks": [
      "温度差は80−20=60℃。80℃をそのままΔTにしないこと、MAT1のαとTREF、TEMPDの20℃が一貫することを確認します。",
      "すべての変位・部材軸力・部材軸応力・支持反力で「合成＝機械のみ＋熱のみ」が成立することを確認します。比較は同じ部材・同じ座標成分で行います。",
      "部材103についてσ=E[(Uy1−Uy2)/L−αΔT]、軸力N=Aσを再計算します。モデル全体に完全拘束棒の式−EαΔTを直接当てはめないでください。",
      "合成ケースの支持反力合計はRx=0、Ry=−4000 N。熱のみでは両方向の合力0を確認し、釣合いと自由膨張の抑制を別々に評価します。",
      "全節点を同じ温度差だけ加熱しても支持条件次第では応力が発生します。「一様温度だから熱応力0」とは判断できません。"
    ],
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2021.2_Verification_Guide/raw/resource/enus/MSC_Nastran_2021.2_Verification_Guide.pdf#page=59",
        "label": "MSC Nastran Verification Guide 2021.2 · 問題2.3 · PDF 59–61頁"
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=3272",
        "label": "QRG 2020 SP1 · TEMPRB · PDF 3272–3274頁"
      }
    ],
    "diagram": {
      "kind": "heated-truss",
      "description": "正方形4点と6棒を描き、左2点のXY固定を明示。右縦103を赤で加熱、残りを暗色。対角交差点には接続点を描かない。G1の4000 N上向き矢印は機械力、103の80℃は温度指定。TREF/他の部材20℃を凡例へ。未知結果は破線の変形形状とu、Nで区別。機械・熱・合成の3ケースを同じ図で比較できるようにする。",
      "units": "N, mm, MPa, ℃",
      "nodes": [
        {
          "id": 1,
          "x": 500,
          "y": 500
        },
        {
          "id": 2,
          "x": 500,
          "y": 0
        },
        {
          "id": 3,
          "x": 0,
          "y": 500
        },
        {
          "id": 4,
          "x": 0,
          "y": 0
        }
      ],
      "elements": [
        {
          "id": 101,
          "a": 3,
          "b": 1
        },
        {
          "id": 102,
          "a": 4,
          "b": 1
        },
        {
          "id": 103,
          "a": 1,
          "b": 2,
          "temperature": 80
        },
        {
          "id": 104,
          "a": 3,
          "b": 2
        },
        {
          "id": 105,
          "a": 4,
          "b": 2
        },
        {
          "id": 106,
          "a": 3,
          "b": 4
        }
      ],
      "supports": [
        {
          "node": 3,
          "components": "123456"
        },
        {
          "node": 4,
          "components": "123456"
        },
        {
          "node": 1,
          "components": "3456"
        },
        {
          "node": 2,
          "components": "3456"
        }
      ],
      "load": {
        "node": 1,
        "direction": "+Y",
        "N": 4000
      },
      "temperatureBase": 20,
      "nonThermalBoundaryNote": "熱伝導を解かないため断熱面や熱流束を付けない。"
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ]
    ],
    "variants": [
      {
        "id": "thermal-stress",
        "title": "温度荷重を受けるトラス"
      }
    ]
  },
  {
    "key": "thick-cylinder",
    "title": "厚肉円筒 — 内圧とメッシュ収束",
    "sol": "SOL 101",
    "summary": "軸対称の厚肉円筒をCTRIAX6で解き、半径方向・円周方向・軸方向の応力をLamé解と比較します。形状と圧力を固定して半径方向だけを細かくし、変位と応力それぞれの収束を評価します。",
    "inputs": [
      [
        "2. 軸対称モデル",
        "内半径40 mm、外半径80 mm、軸方向の帯高さ10 mmです。基本座標のXを半径r、Zを軸zとしてr-z断面だけを作り、全節点のYは0です。この断面を軸回りに回転した360度の構造をCTRIAX6が表現します。3D全周メッシュでも板厚付きシェルでもありません。"
      ],
      [
        "3. 材料と境界条件",
        "MAT1でE=210000 MPa、ν=0.28を指定します。全節点のGRID PS=23456とし、半径方向T1だけを自由にして軸方向ひずみを0とします。これは軸方向伸びを拘束した長い円筒の断面理想化で、開放端・閉鎖端を持つ有限長円筒の端部挙動をモデル化したものではありません。"
      ],
      [
        "4. 圧力と自由面",
        "内周r=40 mmにPLOADX1で5 MPaを与え、外周r=80 mmは荷重0の自由面です。内面の正圧は材料へ押し込む向き、つまり+r方向に作用します。端面圧力は与えません。PLOADX1へ2πや円周長を掛けず、圧力値をそのまま入力します。"
      ],
      [
        "5. 3段階のメッシュ",
        "半径4・8・16分割を比較します。各区画を2枚の6節点三角形に分けるため、要素数は8・16・32、節点数は27・51・99です。縦方向は同じ1区画とし、形状・材料・圧力・拘束を共通に保ちます。節点番号はメッシュごとに異なるので、位置r,zで結果を揃えます。"
      ],
      [
        "6. 入力の参照関係",
        "CTRIAX6は要素番号の次にMAT1のMIDを直接指定します。PSOLID番号ではありません。G1/G3/G5が三角形の頂点、G2/G4/G6が各辺の中間点です。PLOADX1は最内側の要素2と内周辺の2つの頂点を参照します。Case ControlのLOAD=10からこの面圧を選びます。"
      ]
    ],
    "outputs": [
      "DISPLACEMENTは半径方向T1を読みます。解析解の内面変位は0.001804190 mm、外面変位は0.001170286 mm。半径方向は固定していないため、0に近い変位を得た場合は過拘束や座標の取り違えを先に確認します。",
      "STRESSでは半径σr、円周σθ、軸σzを区別します。等方材・TH=0のこのモデルでは内面がσr=−5 MPa、σθ=+8.333333 MPa、外面がσr=0、σθ=+3.333333 MPa。軸方向拘束によってσz=+0.9333333 MPaが全半径で生じます。",
      "軸対称2次三角形を別実装した独立FE計算の最大節点変位相対誤差は、4分割0.07363%、8分割0.01546%、16分割0.003277%。要素重心の円周応力誤差を圧力5 MPaで割った値は0.5797%、0.1771%、0.04869%です。",
      "同じr位置のLamé解で誤差を評価します。表面応力の外挿値を要素重心値の検算表へ直接比べないでください。",
      "この軸対称表示での「半径方向の荷重和」は、3D空間で全周の力ベクトルを合成したものと異なります。内圧の全周ベクトル和が0だから径方向変形も0になる、とは解釈しません。OLOADの荷重換算と面圧の方向を確認します。"
    ],
    "checks": [
      "基本座標Xが40〜80 mm、全Y=0、Zが0〜10 mmであることを確認します。節点を任意の2D平面に置くだけでは軸対称モデルになりません。",
      "内面σr=−p、外面σr=0、円周応力は内面が最大という境界条件・傾向を最初に確認します。応力符号は引張正で、正の内圧が正の半径応力を意味するわけではありません。",
      "変位誤差はmax |(u_FE−u_exact)/u_exact|、応力誤差はmax |σ_FE−σ_exact|/pとします。外面の厳密σr=0に相対誤差を割り当てると発散するため、圧力を共通の基準にします。",
      "4→8→16分割で位置を揃えた誤差が低下するかを確認します。自由面と節点平均化の表示差をメッシュ誤差に混ぜず、変位が早く収束しても応力も十分とは判断しません。",
      "ν=0.28かつεz=0なのでσzは0ではありません。閉鎖端の軸応力p ri²/(ro²−ri²)とも異なります。実構造の端部条件を変えるなら解析解・拘束・比較値をまとめて変更します。"
    ],
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2021.2_Verification_Guide/raw/resource/enus/MSC_Nastran_2021.2_Verification_Guide.pdf#page=79",
        "label": "MSC Nastran Verification Guide 2021.2 · 問題2.10 · PDF 79–81頁"
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=1713",
        "label": "QRG 2020 SP1 · CTRIAX6 · PDF 1713–1716頁"
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=2897",
        "label": "QRG 2020 SP1 · PLOADX1 · PDF 2897–2899頁"
      }
    ],
    "diagram": {
      "kind": "thick-cylinder-axisymmetric",
      "description": "左に中空円筒の切欠き立体図、右にr-z断面を描く。回転軸r=0と実体の内半径40・外半径80 mmを分け、断面は軸から離れた矩形。内周に+rの圧力矢印5 MPa、外周に自由面σr=0。上下は軸方向拘束uz=0と明記し端面圧力を描かない。半径方向変位は未知の破線矢印。断面内を4/8/16分割の三角形メッシュで切り替える。円周σθは断面外の周方向引張として別小図に描く。",
      "ri_mm": 40,
      "ro_mm": 80,
      "strip_height_mm": 10,
      "pressure_MPa": 5,
      "E_MPa": 210000,
      "nu": 0.28,
      "coordinateMapping": {
        "basicX": "半径r",
        "basicY": "0（断面外）",
        "basicZ": "軸z"
      },
      "known": [
        "内面圧力5 MPa",
        "外面荷重0",
        "全節点uz=0"
      ],
      "unknown": [
        "半径変位ur",
        "σr・σθ・σz",
        "軸方向拘束反力"
      ],
      "radialDivisions": [
        4,
        8,
        16
      ],
      "notIncluded": [
        "閉鎖端の端面圧力",
        "有限長円筒の端部変形"
      ]
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ]
    ],
    "variants": [
      {
        "id": "thick-cylinder-coarse",
        "title": "粗いメッシュ · 4分割"
      },
      {
        "id": "thick-cylinder-standard",
        "title": "標準メッシュ · 8分割"
      },
      {
        "id": "thick-cylinder-fine",
        "title": "細かいメッシュ · 16分割"
      }
    ]
  },
  {
    "key": "large-deformation",
    "title": "大変形・スナップスルー解析",
    "sol": "SOL 400",
    "summary": "中央を押した薄い円筒シェルの釣合い経路を、弧長法で追跡します。材料は線形弾性のまま、形状の変化によって剛性が変わる幾何学非線形を扱います。限界点の前後で、荷重・変位・反復の関係を確認します。",
    "inputs": [
      [
        "モデルと寸法",
        "円筒半径 R=2400 mm、軸方向全長480 mm、全開き角0.2 rad、板厚6 mm。対称性を利用した1/4モデルを、36節点・25個のCQUADRで分割します。座標はXが円筒の横方向、Yが高さ、Zが円筒軸方向です。"
      ],
      [
        "支持・対称・自由境界",
        "開き角の外側にある直線縁はX・Y並進を拘束し、回転を自由にします。Z=0面はUZ・RX・RY、X=0面はUX・RY・RZを拘束する対称境界です。Z=240 mmの曲線縁は自由です。自由縁に固定や対称拘束を追加すると別のモデルになります。"
      ],
      [
        "材料と荷重",
        "MAT1はE=3000 MPa、ν=0.3の線形弾性材料。中央節点6へ全体−Y方向に基準荷重220 Nを設定します。これは1/4モデルの値で、全体相当の基準荷重は880 Nです。弧長法では荷重係数λが未知量なので、実際の荷重は220λ Nとなり、λは単調増加するとは限りません。"
      ],
      [
        "入力のつながり",
        "SOL400→SUBCASE→STEP→ANALYSIS=NLSTATICで手順を選び、NLSTEPで弧長法を指定します。CQUADR→PSHELL→MAT1が形状・厚さ・材料をつなぎ、PSHLN1がDCTN/LDKの薄肉シェル定式化を指定します。SPCADDは3種類の境界集合、LOADは基準集中荷重をまとめます。各フィールドはInputデータへリンクします。"
      ],
      [
        "非線形の設定",
        "LGDISP=1で更新形状を用います。NLSTEPのARCLN/CRISでCrisfield法を選び、初期増分0.01、相対変位・力の収束許容値0.001を設定します。一般制御は最大25反復・最大10分割。これは収束を保証する値ではなく、初回実行から調整する開始条件です。"
      ],
      [
        "出力と評価点",
        "節点6（中央荷重点）と36（自由縁の中央）のY変位を、それぞれ同じ荷重係数に対して確認します。DISPLACEMENTとOLOADから荷重―変位を作り、SPCFORCESで支持反力を照合します。応力は変形形状と表裏を確認した後に評価します。"
      ]
    ],
    "outputs": [
      "弧長法で追跡した経路範囲と、極大荷重の前後を通過できたかをF06で確認します。",
      "横軸を−UY6、縦軸を1/4モデル荷重220λ Nとして釣合い経路を描きます。全体荷重で示す場合だけ縦軸を4倍し、図の単位と対象を明記します。",
      "中央と自由縁では変位の進み方が異なります。スナップバックでは選んだ変位が逆向きに進むことがあるため、結果を変位の大小で並べ替えず増分順を保ちます。",
      "極大荷重や反転点はこの変更モデルを実行して求めます。原典の596 Nなどを変更後の計算値として転用しません。"
    ],
    "checks": [
      "生成時の検算：全節点がR=2400 mmの円筒面上にあり、8文字丸め後の半径誤差は0.001 mm未満。厚さ比R/t=400、シェルの立上りは約11.99 mmです。",
      "各要素の接続点、非ゼロ面積、法線の一貫性、36節点・25要素、荷重と境界集合の参照を確認済みです。これは入力整合性検査であり、非線形解の検証ではありません。",
      "各収束増分で外力と反力の釣合いを確認します。対称面反力も含め、モデルに実際に作用する全成分を集計します。",
      "初期増分を0.01から0.005へ小さくし、収束許容値を1桁厳しくして主要な極値・変位が安定するか比較します。無条件に反復上限を増やすだけでは精度を確認できません。",
      "次に5×5から10×10、20×20へ分割を増やし、同じ厚さ・境界・点荷重位置で荷重―変位曲線を比較します。点荷重近傍の最大応力は局所特異性の影響を受けるため、経路収束と最大応力収束を分けます。",
      "アプリには未検証の極大荷重やスナップバック変位を結果として掲載していません。"
    ],
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2024.1_Demonstration_Problems_Manual-Implicit_Nonlinear/raw/resource/enus/MSC_Nastran_2024.1_Demonstration_Problems_Manual-Implicit_Nonlinear.pdf",
        "label": "MSC Nastran 2024.1 Implicit Nonlinear Demonstration、Chapter36、PDF486–494頁"
      }
    ],
    "diagram": {
      "type": "quarter-cylinder-shell",
      "radiusMm": 2400,
      "halfLengthMm": 240,
      "halfAngleRad": 0.1,
      "thicknessMm": 6,
      "modulusMPa": 3000,
      "poisson": 0.3,
      "quarterReferenceLoadN": 220,
      "fullReferenceLoadN": 880,
      "nodeCount": 36,
      "elementCount": 25,
      "coordinates": {
        "X": "円筒横方向",
        "Y": "高さ方向",
        "Z": "円筒軸方向"
      },
      "boundaries": [
        {
          "edge": "theta=0.1",
          "kind": "直線縁のピン支持",
          "components": "UX=UY=0",
          "free": "UZと回転"
        },
        {
          "edge": "Z=0",
          "kind": "対称面",
          "components": "UZ=RX=RY=0"
        },
        {
          "edge": "X=0",
          "kind": "対称面",
          "components": "UX=RY=RZ=0"
        },
        {
          "edge": "Z=240",
          "kind": "曲線の自由縁",
          "components": "追加拘束なし"
        }
      ],
      "load": {
        "node": 6,
        "position": [
          0,
          2400,
          0
        ],
        "direction": [
          0,
          -1,
          0
        ],
        "label": "指定：基準220 N、実荷重=220λ N"
      },
      "unknowns": [
        "中央節点6のUY",
        "自由縁中央節点36のUY",
        "荷重係数λ"
      ],
      "description": "斜め上から見た1/4円筒シェルを5×5格子で描く。中央節点6と自由縁節点36を区別。赤い矢印で−Y荷重、青で直線支持、点線で2つの対称境界、灰色で自由縁を示す。全体の小図には4分割と全体相当880λ Nを添える。曲率を強調した模式図であると注記し、寸法値は実寸を表示。",
      "svgPath": "教材/model/11_大変形解析/model-diagram.svg"
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ],
      [
        "bulk.html#CASE_OLOAD",
        "実際の外荷重"
      ]
    ]
  },
  {
    "key": "plasticity",
    "title": "弾塑性・除荷解析",
    "sol": "SOL 106",
    "summary": "片持ち梁を初降伏の前後まで段階的に載荷し、最後に荷重をゼロへ戻します。弾性回復と残留変位を分けて読み、従来CBEAMの塑性ヒンジ近似の適用範囲も確認します。",
    "inputs": [
      [
        "モデルと境界",
        "長さ120 mm、幅1.2 mm、高さ12 mmの矩形断面片持ち梁。2節点・1 CBEAMで表し、根元節点1の6自由度を固定します。先端節点2のUZ・RX・RYを拘束してXY面内の曲げに限定し、−Y方向へ集中荷重を加えます。"
      ],
      [
        "断面と材料",
        "A=14.4 mm²、面内曲げのI1=172.8 mm⁴。MAT1はE=210000 MPa、ν=0.3、MATS1は降伏応力250 MPa・H=0の弾完全塑性です。PBEAMには矩形の回復点を与え、せん断変形を除く設定を維持します。"
      ],
      [
        "載荷と除荷の順序",
        "連続する4 SUBCASEの目標荷重を48→72→81→0 Nとします。各数値はその段階の全荷重で、前段に加える増分値ではありません。最後は81 Nから0 Nへ20増分で除荷します。0 Nだけを独立した新規計算として実行すると、残留状態は得られません。"
      ],
      [
        "入力のつながり",
        "SOL106のSUBCASEごとにLOADとNLPARMを選びます。FORCEで目標荷重、NLPARMで増分と収束を設定し、CBEAM→PBEAM→MAT1/MATS1で断面と弾塑性を結びます。GRIDのPSが拘束を定義し、LGDISP=-1が大変位効果を除きます。"
      ],
      [
        "この梁要素の近似",
        "SOL106の従来CBEAMは各端から要素長の1/8を塑性ヒンジとして扱う近似です。断面内の全ての材料点を詳細に積分した3Dモデルではありません。ここでは初降伏・崩壊荷重・除荷という流れを学び、局所塑性ひずみの詳細分布は対象にしません。"
      ],
      [
        "出力と読み方",
        "先端UY、根元反力と曲げモーメント、増分の収束履歴を段階順に追います。48 Nで線形範囲、72/81 Nで降伏後、最後の0 Nで残留変位を確認します。降伏後の通常の梁応力回復値だけで、断面全体の塑性状態や損傷を断定しません。"
      ]
    ],
    "outputs": [
      "先端の下向き変位−UY2と荷重を増分順に結びます。除荷では荷重が減るため、荷重値で並べ替えると履歴が壊れます。",
      "最終SUBCASEの外力は0 Nです。自由端に許されたUYとRZの残留、根元の反力・反力モーメントがほぼゼロに戻ることを併せて調べます。",
      "外力・支持反力がゼロでも、材料点の残留応力や塑性ひずみが全てゼロとは限りません。断面の残留応力を調べるには、その分布を解像できる要素・材料モデルへ進みます。",
      "荷重–変位履歴を載荷から除荷まで読み、0 Nで残る変位を確認します。"
    ],
    "checks": [
      "矩形断面の初降伏モーメントMy=σy I/(h/2)=7200 N·mm、先端初降伏荷重Py=My/L=60 N。最初の48 Nはこの値より小さく設定しています。",
      "全塑性モーメントMp=σy b h²/4=10800 N·mm、理想的な崩壊荷重Pp=Mp/L=90 N。最大荷重81 Nは崩壊前で止め、荷重制御で除荷まで進めます。",
      "弾性たわみP L³/(3EI)より、48 N時の先端たわみは0.761905 mm。降伏後の81 Nにこの線形式を当てはめた1.285714 mmは弾性比較線であり、弾塑性結果ではありません。",
      "独立した分布塑性の矩形梁理論では81 N時約1.367774 mm、弾性除荷後約0.082060 mm。これらは理論の参考値で、L/8塑性ヒンジ近似を使うMSC CBEAMとの一致判定値ではありません。",
      "各段階の増分数を2倍、収束許容値を1桁厳しくして、荷重―変位と残留変位の変化を確認します。要素分割を変えると端部ヒンジ長も変わるため、単なる数値収束とモデル近似の変化を区別します。",
      "0 NのFORCE定義と、それを選ぶ第4 SUBCASEの存在を検査済みです。"
    ],
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Verification_Guide/raw/resource/enus/MSC_Nastran_2025.1_Verification_Guide.pdf",
        "label": "MSC Nastran2025.1 Verification、§2.27、PDF127–128頁"
      },
      {
        "url": "https://nexus.hexagon.com/community/public/msc-nastran/f/msc-nastran-community-forum/144239/combine-a-sol106-static-solution-with-a-static-thermal-subcase",
        "label": "Hexagon技術コミュニティ：SOL106の継続SUBCASEと除荷の扱い"
      }
    ],
    "diagram": {
      "type": "cantilever-plastic-hinge",
      "lengthMm": 120,
      "widthMm": 1.2,
      "heightMm": 12,
      "E_MPa": 210000,
      "nu": 0.3,
      "yieldMPa": 250,
      "hardeningMPa": 0,
      "loadHistoryN": [
        48,
        72,
        81,
        0
      ],
      "yieldForceN": 60,
      "collapseForceN": 90,
      "sourceTopology": {
        "grids": 2,
        "CBEAM": 1
      },
      "boundaries": [
        {
          "node": 1,
          "components": "UX=UY=UZ=RX=RY=RZ=0",
          "kind": "固定端"
        },
        {
          "node": 2,
          "components": "UZ=RX=RY=0",
          "kind": "XY面内曲げ"
        }
      ],
      "unknowns": [
        "先端UYとRZ",
        "除荷後の残留変位"
      ],
      "description": "左固定・右端集中荷重の梁、断面1.2×12 mm、L120 mmを描く。根元側15 mm=L/8を淡色で示し、塑性ヒンジ近似領域と注記。4段階の荷重履歴48→72→81→0 Nを別の小図で示す。最後は荷重矢印を消し、元形状を破線、残留変形を模式的な曲線で描く。初降伏60 N・全塑性90 Nは理論値として表示し、模式変形に実行済みの変位数値を付けない。",
      "svgPath": "教材/model/12_弾塑性解析/model-diagram.svg"
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ],
      [
        "bulk.html#CASE_OLOAD",
        "実際の外荷重"
      ]
    ],
    "variants": [
      {
        "id": "plastic-hinge-unload",
        "title": "塑性ヒンジ梁の載荷・除荷"
      }
    ]
  },
  {
    "key": "contact",
    "title": "接触・摩擦・ボルト締結",
    "sol": "SOL 106 / SOL 400",
    "summary": "片側支持の浮き上がりから、摩擦と締付け履歴を持つ実体ボルト締結へ進む。小モデルと詳細モデルで役割を分け、接触状態・反力・締付け保持を確認する。",
    "inputs": [
      [
        "形状・材料",
        "単位系はin・lbf・psi。A/B/C/Dのx座標は0/200/400/530 in。E=2.8×10⁷ psi、ν=0.3、A=90 in²、面内曲げI=1200 in⁴。梁軸はX、面内変位はY、回転はZ。"
      ],
      [
        "境界と荷重",
        "AはUx=Uy=0、回転Rzは自由。C・Dには下方から押す支持だけをCGAPで置く。地盤側節点5・6は固定し、全節点の面外自由度3/4/5を拘束。Bに−Y 35,000 lbf、Dに−Y 8,000 lbf。"
      ],
      [
        "カードの関係",
        "CBEAM → PBEAM → MAT1で梁、CGAP → PGAPで片側支持を作る。同位置の地盤／梁節点をCORD2R=10で向き付けし、要素X軸を全体+Yとする。初期すき間U0=0、閉じた剛性KA=2.8×10⁸ lbf/in。"
      ],
      [
        "実行",
        "SOL 106、SPC=10、LOAD=5、NLPARM=5。10荷重増分で接触状態を更新する。従来SOLの小接触例であり、面接触・大すべりをCGAPの並列配置で代用する教材ではない。"
      ]
    ],
    "outputs": [
      "DISPLACEMENTでBの下向き変位、Cの小さい押込み、Dの上向き変位を確認する。CGAPの要素X軸力は圧縮を正として読む。",
      "SPCFORCESでAと地盤側節点5・6の反力を読む。Dが開いた後は地盤側6の支持反力がほぼ0になる。",
      "最初からCとDをSPCで固定した線形モデルと比較すると、引張反力を伝えてしまう支持を見つけられる。"
    ],
    "checks": [
      "つり合いからC反力=(35,000×200+8,000×530)/400=28,100 lbf、A反力=14,900 lbf、D反力=0。反力合計43,000 lbfを確認する。",
      "独立Euler–Bernoulli梁計算ではBのUy≈−1.07942 in、C≈−0.000100357 in、D≈+0.643161 in。PBEAMのせん断変形との差があるため、変位は近似検算値として扱う。",
      "Cは押込み量×KA≈28,100 lbf、Dは正の隙間かつ無反力という組合せを確認する。数値だけでなく開閉状態が物理条件と整合するか判断する。"
    ],
    "sources": [
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Verification_Guide/raw/resource/enus/MSC_Nastran_2025.1_Verification_Guide.pdf",
        "label": "MSC Nastran 2025.1 Verification Guide §2.26／PDF 125–126頁",
        "pdfPages": [
          125,
          126
        ]
      },
      {
        "url": "https://nexus.hexagon.com/community/public/msc-nastran/f/msc-nastran-community-forum/143151/how-to-do-the-bolt-preload-analysis-using-3d-bolt-model",
        "label": "MSC公式コミュニティ：3Dボルト予荷重の3工程と添付BDF"
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf",
        "label": "QRG 2020 SP1：CGAP/PGAP、BOLT/SPCR、3D接触"
      }
    ],
    "diagram": {
      "type": "lift-off-beam",
      "unit": "in / lbf",
      "x": [
        0,
        200,
        400,
        530
      ],
      "labels": [
        "A：ピン",
        "B：荷重点",
        "C：片側支持",
        "D：片側支持"
      ],
      "loads": [
        {
          "x": 200,
          "direction": "-Y",
          "value": 35000
        },
        {
          "x": 530,
          "direction": "-Y",
          "value": 8000
        }
      ],
      "supports": [
        {
          "x": 0,
          "fixed": [
            "Ux",
            "Uy"
          ],
          "free": [
            "Rz"
          ]
        },
        {
          "x": 400,
          "type": "compression-only",
          "stateExpected": "closed"
        },
        {
          "x": 530,
          "type": "compression-only",
          "stateExpected": "open"
        }
      ],
      "description": "水平梁の下にC/Dのローラーを描く。実線を初期形状、破線を変形形状とし、Dの支持と梁の間の隙間を拡大。下向き荷重2本、A/Cの上向き反力、Dの反力0を別色で区別する。"
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ],
      [
        "bulk.html#CASE_FORCE",
        "CGAPの要素力"
      ],
      [
        "bulk.html#CASE_BCONTACT",
        "接触の選択条件"
      ]
    ],
    "variants": [
      {
        "id": "lift-off",
        "title": "片側支持梁の浮き上がり",
        "inputs": [
          [
            "形状・材料",
            "単位系はin・lbf・psi。A/B/C/Dのx座標は0/200/400/530 in。E=2.8×10⁷ psi、ν=0.3、A=90 in²、面内曲げI=1200 in⁴。梁軸はX、面内変位はY、回転はZ。"
          ],
          [
            "境界と荷重",
            "AはUx=Uy=0、回転Rzは自由。C・Dには下方から押す支持だけをCGAPで置く。地盤側節点5・6は固定し、全節点の面外自由度3/4/5を拘束。Bに−Y 35,000 lbf、Dに−Y 8,000 lbf。"
          ],
          [
            "カードの関係",
            "CBEAM → PBEAM → MAT1で梁、CGAP → PGAPで片側支持を作る。同位置の地盤／梁節点をCORD2R=10で向き付けし、要素X軸を全体+Yとする。初期すき間U0=0、閉じた剛性KA=2.8×10⁸ lbf/in。"
          ],
          [
            "実行",
            "SOL 106、SPC=10、LOAD=5、NLPARM=5。10荷重増分で接触状態を更新する。従来SOLの小接触例であり、面接触・大すべりをCGAPの並列配置で代用する教材ではない。"
          ]
        ],
        "outputs": [
          "DISPLACEMENTでBの下向き変位、Cの小さい押込み、Dの上向き変位を確認する。CGAPの要素X軸力は圧縮を正として読む。",
          "SPCFORCESでAと地盤側節点5・6の反力を読む。Dが開いた後は地盤側6の支持反力がほぼ0になる。",
          "最初からCとDをSPCで固定した線形モデルと比較すると、引張反力を伝えてしまう支持を見つけられる。"
        ],
        "checks": [
          "つり合いからC反力=(35,000×200+8,000×530)/400=28,100 lbf、A反力=14,900 lbf、D反力=0。反力合計43,000 lbfを確認する。",
          "独立Euler–Bernoulli梁計算ではBのUy≈−1.07942 in、C≈−0.000100357 in、D≈+0.643161 in。PBEAMのせん断変形との差があるため、変位は近似検算値として扱う。",
          "Cは押込み量×KA≈28,100 lbf、Dは正の隙間かつ無反力という組合せを確認する。数値だけでなく開閉状態が物理条件と整合するか判断する。"
        ]
      }
    ]
  },
  {
    "key": "prestressed-modes",
    "title": "予荷重を考慮した固有値解析",
    "sol": "SOL 103 + STATSUB",
    "summary": "静的な圧縮による幾何剛性を、積層補強板の固有値に反映する。通常の固有値解析と静的解析を結び、予応力・拘束・質量の役割を分ける。",
    "inputs": [
      [
        "形状・メッシュ",
        "330×330 mm、厚さ2.23872 mmの16層積層板。100×100節点、99×99のCQUAD4、x方向の直線補強材2本をCBEAM 198要素で表す。補強材はy=110/220 mmの板中央面に置く同心モデル。固体の面内予応力と振動を扱う構造例であり、3Dソリッド要素モデルではない。"
      ],
      [
        "材料・積層",
        "SI単位系。MAT8はE1=162.9 GPa、E2=9.243 GPa、ν12=.28、G12=6.453 GPa、G1z=G2z=3.6 GPa、ρ=1890 kg/m³。層厚は0.13992 mm、面内で変化する繊維方向と対称16層の並びを保持する。同一定義のPCOMPは統合し、LAM=SYMで対称後半を指定する。補強材のMAT1はE=162.9 GPaとG=6.453 GPaを独立に与えた等価梁特性で、3D等方材料として解釈・流用しない。"
      ],
      [
        "静的拘束・予荷重",
        "左右端をそれぞれ内側へ11 μm強制移動し、全短縮22 μmを与える。上下辺はUy=0、外周はUz=0。左右のSPCDには対応するSPC集合を選ぶ。平均の軸ひずみは−22 μm/330 mm≈−6.667×10⁻⁵。"
      ],
      [
        "固有値側の拘束",
        "静的状態と微小振動の拘束は役割が異なる。この例の固有値側は外周の並進1/2/3を固定し、回転は固定しない。SPC=22→SPC1=49の参照を確認する。"
      ],
      [
        "解析の接続",
        "SUBCASE 1はSPC=2、LOAD=1による静的状態。SUBCASE 2はMETHOD=10→EIGRL、STATSUB=1で予応力剛性を取り込み、最初の10モードを求める。VECTORはDISPLACEMENTの別名で固有ベクトルを出力する。"
      ]
    ],
    "outputs": [
      "SUBCASE 1のDISPLACEMENTで左右端の±11 μmと面外の拘束を確認し、SPCFORCESの左右合力がつり合うか読む。CQUAD4の膜応力結果が予荷重の向きと整合しているか確認する。",
      "SUBCASE 2のREAL EIGENVALUESのCYCLES列がHz、RADIANS列がrad/s。VECTORは任意規格化したモード形状であり、実際の振動振幅ではない。",
      "圧縮によって必ず全モードが同じ比率で変わるわけではない。無予荷重と比較する場合、固有値側の拘束・質量・抽出条件を一致させ、モード形状も対応付ける。"
    ],
    "checks": [
      "長さ・厚さ・補強材寸法・強制変位を1.1倍、弾性定数を0.9倍、密度を1.05倍にした相似則では f新/f原=√(0.9/1.05)/1.1≈0.841655。一次154.716 Hz、二次277.064 Hzが比較目安になる。8文字丸めやバージョン差を含む実行照合は別途必要。",
      "10,000節点と9,999要素（CQUAD4 9,801＋CBEAM 198）の参照を確認。板の要素面積がすべて正、総面積0.1089 m²、積層の物理的並びと材料参照を保つことを生成器で確認する。",
      "負またはほぼ0の固有値が出た場合は、拘束不足・過大な圧縮・座屈近傍を区別する。数値を絶対値にして周波数へ変換しない。"
    ],
    "sources": [
      {
        "url": "https://github.com/zhaowei0566/SPAD/tree/7a5b6b7cec77511549bfa0bfca434b38b1b9bbec/AIAAJ_Paper_Data/paper_2019/Section_IV_A/straight_concentric",
        "label": "Wei Zhao：SPAD論文公開データ Section IV.A（BDFとINCLUDE・F06）"
      },
      {
        "url": "https://doi.org/10.2514/1.J057719",
        "label": "Zhao & Kapania, AIAA Journal 57 (2019), 2575–2593"
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Dynamic_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Dynamic_Analysis_User_Guide.pdf",
        "label": "MSC Nastran 2020 SP1 Dynamic Analysis User’s Guide／PDF 74–75頁",
        "pdfPages": [
          74,
          75
        ]
      },
      {
        "url": "https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf",
        "label": "QRG 2020 SP1：STATSUB、EIGRL、PCOMP、MAT8"
      }
    ],
    "diagram": {
      "type": "prestressed-stiffened-plate",
      "unit": "mm / μm",
      "plateSize": [
        330,
        330
      ],
      "thickness": 2.23872,
      "stiffenersY": [
        110,
        220
      ],
      "stiffenerDirection": "+X",
      "shorteningDirection": "X",
      "leftDisplacementUm": 11,
      "rightDisplacementUm": -11,
      "staticSupports": {
        "leftRight": "Uxを内向き11 μm、外周Uz=0",
        "topBottom": "Uy=0、Uz=0"
      },
      "modalSupports": "外周Ux=Uy=Uz=0、回転は自由",
      "description": "上面図の正方形板にx方向の補強材2本と左右の内向き矢印を描く。図を「静的短縮」→「その平衡状態で微小振動」の2段に分け、右図は面外の振動形状を破線で示す。短縮値は指定、周波数とモード形は結果と区別。左図と右図で並進境界が異なることを凡例に明記する。"
    },
    "links": [],
    "resultLinks": [
      [
        "bulk.html#CASE_DISPLACEMENT",
        "変位・モード形"
      ],
      [
        "bulk.html#CASE_STRESS",
        "応力の出力"
      ],
      [
        "bulk.html#CASE_SPCFORCES",
        "支持反力"
      ]
    ],
    "variants": [
      {
        "id": "stiffened-plate",
        "title": "面内圧縮を受ける積層補強板",
        "inputs": [
          [
            "形状・メッシュ",
            "330×330 mm、厚さ2.23872 mmの16層積層板。100×100節点、99×99のCQUAD4、x方向の直線補強材2本をCBEAM 198要素で表す。補強材はy=110/220 mmの板中央面に置く同心モデル。固体の面内予応力と振動を扱う構造例であり、3Dソリッド要素モデルではない。"
          ],
          [
            "材料・積層",
            "SI単位系。MAT8はE1=162.9 GPa、E2=9.243 GPa、ν12=.28、G12=6.453 GPa、G1z=G2z=3.6 GPa、ρ=1890 kg/m³。層厚は0.13992 mm、面内で変化する繊維方向と対称16層の並びを保持する。同一定義のPCOMPは統合し、LAM=SYMで対称後半を指定する。補強材のMAT1はE=162.9 GPaとG=6.453 GPaを独立に与えた等価梁特性で、3D等方材料として解釈・流用しない。"
          ],
          [
            "静的拘束・予荷重",
            "左右端をそれぞれ内側へ11 μm強制移動し、全短縮22 μmを与える。上下辺はUy=0、外周はUz=0。左右のSPCDには対応するSPC集合を選ぶ。平均の軸ひずみは−22 μm/330 mm≈−6.667×10⁻⁵。"
          ],
          [
            "固有値側の拘束",
            "静的状態と微小振動の拘束は役割が異なる。この例の固有値側は外周の並進1/2/3を固定し、回転は固定しない。SPC=22→SPC1=49の参照を確認する。"
          ],
          [
            "解析の接続",
            "SUBCASE 1はSPC=2、LOAD=1による静的状態。SUBCASE 2はMETHOD=10→EIGRL、STATSUB=1で予応力剛性を取り込み、最初の10モードを求める。VECTORはDISPLACEMENTの別名で固有ベクトルを出力する。"
          ]
        ],
        "outputs": [
          "SUBCASE 1のDISPLACEMENTで左右端の±11 μmと面外の拘束を確認し、SPCFORCESの左右合力がつり合うか読む。CQUAD4の膜応力結果が予荷重の向きと整合しているか確認する。",
          "SUBCASE 2のREAL EIGENVALUESのCYCLES列がHz、RADIANS列がrad/s。VECTORは任意規格化したモード形状であり、実際の振動振幅ではない。",
          "圧縮によって必ず全モードが同じ比率で変わるわけではない。無予荷重と比較する場合、固有値側の拘束・質量・抽出条件を一致させ、モード形状も対応付ける。"
        ],
        "checks": [
          "長さ・厚さ・補強材寸法・強制変位を1.1倍、弾性定数を0.9倍、密度を1.05倍にした相似則では f新/f原=√(0.9/1.05)/1.1≈0.841655。一次154.716 Hz、二次277.064 Hzが比較目安になる。8文字丸めやバージョン差を含む実行照合は別途必要。",
          "10,000節点と9,999要素（CQUAD4 9,801＋CBEAM 198）の参照を確認。板の要素面積がすべて正、総面積0.1089 m²、積層の物理的並びと材料参照を保つことを生成器で確認する。",
          "負またはほぼ0の固有値が出た場合は、拘束不足・過大な圧縮・座屈近傍を区別する。数値を絶対値にして周波数へ変換しない。"
        ]
      }
    ]
  }
]);
