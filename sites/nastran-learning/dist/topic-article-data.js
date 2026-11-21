window.TopicArticleData = {
  "materials": {
    "title": "材料理論",
    "api": "MaterialChapter",
    "prefix": "materials",
    "articles": [
      {
        "key": "overview",
        "title": "材料の基本・等方弾性",
        "sections": [
          "roles",
          "stress-strain",
          "constitutive",
          "isotropic",
          "multiaxial"
        ],
        "questions": [
          0,
          1,
          2,
          3,
          6
        ],
        "goals": [
          "材料と形状の役割を区別する",
          "応力・ひずみと横収縮を式から確かめる"
        ],
        "points": [
          "Eは強度ではなく弾性の傾き。",
          "工学せん断ひずみとテンソル成分は2倍異なる。",
          "平面応力と平面ひずみでは、ゼロとする量が違う。"
        ]
      },
      {
        "key": "anisotropy",
        "title": "異方性・材料方向",
        "sections": [
          "anisotropy",
          "orientation",
          "plane-cards",
          "spatial-cards",
          "verification"
        ],
        "questions": [
          4,
          5
        ],
        "goals": [
          "材料方向による連成を読み取る",
          "MAT2・3・8・9を使い分ける"
        ],
        "points": [
          "試験定数と剛性行列の成分名を混同しない。",
          "材料軸を回すと、全体軸で連成が現れる。",
          "相反関係とひずみエネルギーで入力行列を確かめる。"
        ]
      },
      {
        "key": "composites",
        "title": "複合材料・積層板",
        "sections": [
          "shell-property",
          "abd",
          "layup",
          "ply-results",
          "sandwich"
        ],
        "questions": [
          7
        ],
        "goals": [
          "積層順からA・B・Dを組み立てる",
          "層別応力と面材・コアの役割を読む"
        ],
        "points": [
          "同じ層でも順序が変わると曲げ剛性は変わる。",
          "対称とバランスは異なる条件。",
          "平均した結果だけでは層ごとの損傷を判断できない。"
        ]
      },
      {
        "key": "thermal",
        "title": "熱膨張・密度・減衰",
        "sections": [
          "thermal",
          "mass-damping"
        ],
        "questions": [
          8,
          9
        ],
        "goals": [
          "熱ひずみと拘束応力を区別する",
          "材料欄の単位と作用を確認する"
        ],
        "points": [
          "自由膨張だけなら熱応力は生じない。",
          "温度差・基準温度・温度依存性を分ける。",
          "密度・減衰・強度はヤング率とは別の役割を持つ。"
        ]
      },
      {
        "key": "plasticity",
        "title": "塑性・試験データ",
        "sections": [
          "plasticity",
          "test-data",
          "time-temperature"
        ],
        "questions": [
          10,
          11
        ],
        "goals": [
          "降伏・除荷・硬化を図と式で追う",
          "試験曲線の量と入力条件を合わせる"
        ],
        "points": [
          "全ひずみと塑性ひずみの傾きは同じではない。",
          "試験値は温度・速度・方向・応力ひずみの定義と一緒に使う。",
          "採用する構成式の適用範囲を決めてから同定する。"
        ]
      },
      {
        "key": "diagnosis",
        "title": "材料の検証",
        "sections": [
          "diagnosis"
        ],
        "questions": [
          12,
          13
        ],
        "goals": [
          "症状から材料設定の誤りを切り分ける"
        ],
        "points": [
          "単位・材料IDから方向・拘束へ順に調べる。",
          "変位と固有振動数では疑う量が異なる。",
          "材料値の調整で、境界条件の誤りを隠さない。"
        ]
      }
    ],
    "prerequisites": [
      [
        "coordinates.html#signs",
        "応力方向"
      ],
      [
        "coordinates.html#systems",
        "座標"
      ]
    ],
    "aliases": {
      "elastic": "isotropic",
      "verification": "diagnosis"
    }
  },
  "boundary": {
    "title": "境界条件と拘束",
    "api": "BoundaryChapter",
    "prefix": "boundary",
    "articles": [
      {
        "key": "overview",
        "title": "境界条件・自由度・支持",
        "sections": [
          "meaning",
          "dofs",
          "supports"
        ],
        "questions": [
          0,
          4
        ],
        "goals": [
          "既知の変位と未知の反力を区別する",
          "実物が許す運動から支持を選ぶ"
        ],
        "points": [
          "並進と回転の自由度は要素ごとに確認する。",
          "ピンと固定では曲げ変形と反力が変わる。",
          "拘束した自由度の数だけでは支持の妥当性は決まらない。"
        ]
      },
      {
        "key": "geometry",
        "title": "剛体運動・座標・対称",
        "sections": [
          "rigid-body",
          "coordinates",
          "symmetry"
        ],
        "questions": [
          1,
          2,
          3
        ],
        "goals": [
          "止めるべき剛体運動を見分ける",
          "斜めの支持と対称条件を指定する"
        ],
        "points": [
          "拘束の位置と独立性を確認する。",
          "局所座標の成分を全体方向と混同しない。",
          "対称面は自由面ではなく、荷重の対称性も必要。"
        ]
      },
      {
        "key": "spc",
        "title": "SPC・指定変位",
        "sections": [
          "sets",
          "imposed",
          "partition"
        ],
        "questions": [
          5
        ],
        "goals": [
          "拘束セットと指定変位を使い分ける",
          "行列の分割から反力を導く"
        ],
        "points": [
          "セットは定義とケースでの選択を対にする。",
          "強制変位では必要な力が計算結果になる。",
          "既知の変位は剛性との積として右辺へ移す。"
        ]
      },
      {
        "key": "mpc",
        "title": "MPC・独立と従属",
        "sections": [
          "mpc",
          "work",
          "nonhomogeneous",
          "redundancy"
        ],
        "questions": [
          6,
          7,
          8,
          9
        ],
        "goals": [
          "節点と成分を明示して拘束式を読む",
          "変位関係から力の関係を導く"
        ],
        "points": [
          "独立成分は既知値を意味しない。",
          "従属の競合・矛盾・冗長な式を区別する。",
          "変位比の逆側にも、仮想仕事に従う力が生じる。"
        ]
      },
      {
        "key": "connections",
        "title": "結合と支持の選択",
        "sections": [
          "coincident",
          "rbe",
          "interfaces",
          "releases",
          "compliance"
        ],
        "questions": [
          10,
          13
        ],
        "goals": [
          "SPC・MPC・RBEと弾性結合を使い分ける",
          "異種要素の力とモーメントの受渡しを確認する"
        ],
        "points": [
          "部材間の結合と地面への支持を分ける。",
          "端部解放はその端が伝える力を解放する。",
          "大きい支持剛性は完全固定と数値的に同じではない。"
        ]
      },
      {
        "key": "verification",
        "title": "自動拘束と結果の検証",
        "sections": [
          "autospc",
          "freebody",
          "reactions",
          "diagnosis",
          "scope"
        ],
        "questions": [
          11
        ],
        "goals": [
          "拘束不足・過拘束を結果から診断する",
          "合力とモーメントで支持反力を検算する"
        ],
        "points": [
          "AUTOSPCは実物の支持を判断しない。",
          "自由支持の固有値と通常の静解析を区別する。",
          "変形・反力・拘束式を同じモデルの条件で確かめる。"
        ]
      },
      {
        "key": "viscous",
        "title": "波の反射と粘性境界",
        "sections": [
          "reflection",
          "impedance",
          "return-wave"
        ],
        "questions": [
          12
        ],
        "goals": [
          "法線・接線の速度から抵抗力を求める",
          "反射波を観測点の時刻と振幅で見分ける"
        ],
        "points": [
          "実際の自由表面と人工的に切った面を区別する。",
          "節点数を増やしたら負担面積を配り直す。",
          "係数の照合は対象とする波と方向を明示する。"
        ]
      }
    ],
    "prerequisites": [
      [
        "basics.html#node",
        "節点と自由度"
      ],
      [
        "coordinates.html#systems",
        "座標"
      ]
    ],
    "aliases": {
      "supports": "supports",
      "questions": "verification"
    }
  },
  "common-loads": {
    "title": "荷重の理論",
    "api": "LoadChapter",
    "prefix": "load",
    "articles": [
      {
        "key": "overview",
        "title": "荷重の基本・集中荷重",
        "sections": [
          "meaning",
          "units",
          "point",
          "coordinates",
          "eccentric"
        ],
        "questions": [
          0,
          1
        ],
        "goals": [
          "荷重の大きさ・方向・位置・単位をそろえる",
          "力の移動に伴うモーメントを計算する"
        ],
        "points": [
          "FORCEの方向ベクトルは自動で正規化されない。",
          "CIDと節点CDは役割が異なる。",
          "力を別の点へ移すときはモーメントも保つ。"
        ]
      },
      {
        "key": "distributed",
        "title": "分布荷重と等価節点荷重",
        "sections": [
          "line",
          "projection",
          "pressure",
          "consistent",
          "beamloads",
          "mesh"
        ],
        "questions": [
          2,
          3,
          4,
          5,
          6
        ],
        "goals": [
          "分布から合力と作用点を求める",
          "仮想仕事から等価節点荷重を導く"
        ],
        "points": [
          "荷重密度と合力を混同しない。",
          "等価荷重は補間した変位の仕事を保つ。",
          "梁の等価荷重には端部モーメントも含まれる。"
        ]
      },
      {
        "key": "inertia",
        "title": "自重・加速度・回転",
        "sections": [
          "mass",
          "gravity",
          "rotation"
        ],
        "questions": [
          7,
          8
        ],
        "goals": [
          "密度と単位から慣性荷重を求める"
        ],
        "points": [
          "N・mm・sでは質量単位はt。",
          "加速度の空間分布に応じてカードを選ぶ。",
          "回転数を2倍にすると遠心力は4倍になる。"
        ]
      },
      {
        "key": "initial",
        "title": "初期ひずみ・温度荷重",
        "sections": [
          "initial",
          "thermal",
          "mapping"
        ],
        "questions": [
          9,
          11
        ],
        "goals": [
          "自由伸びと指定変位を区別する",
          "温度分布からひずみと拘束応力へつなぐ"
        ],
        "points": [
          "DEFORMは自由伸びであって節点変位の強制ではない。",
          "温度は基準との差と拘束条件を対にする。",
          "温度を渡すときは位置・補間・単位も確認する。"
        ]
      },
      {
        "key": "cases",
        "title": "ケースと結果の組合せ",
        "sections": [
          "sets",
          "combination",
          "results"
        ],
        "questions": [
          10
        ],
        "goals": [
          "荷重IDの定義・選択・合成を追う",
          "線形結果の重ね合わせを正しく行う"
        ],
        "points": [
          "セットを作るだけでは作用しない。",
          "組合せの係数は入れ子の各段階で掛かる。",
          "応力成分の合成とミーゼスの足し算は違う。"
        ]
      },
      {
        "key": "applications",
        "title": "部分モデル・予荷重・動荷重",
        "sections": [
          "transfer",
          "preload",
          "fatigue",
          "dynamic"
        ],
        "questions": [
          12,
          13
        ],
        "goals": [
          "荷重の受渡しと履歴が結果に与える影響を読む"
        ],
        "points": [
          "部分モデルへの受渡しでは力とモーメントを保つ。",
          "予荷重状態は後続の応答の基準になる。",
          "疲労と動荷重は最大値だけでは決まらない。"
        ]
      },
      {
        "key": "verification",
        "title": "荷重の検証",
        "sections": [
          "diagnosis"
        ],
        "questions": [
          14
        ],
        "goals": [
          "倍率・向き・収支から誤りを見分ける"
        ],
        "points": [
          "先に単位とケースの選択を確認する。",
          "合力が合っても作用点が違えば曲げは異なる。",
          "荷重の分配と局所応力の感度を分けて調べる。"
        ]
      }
    ],
    "prerequisites": [
      [
        "coordinates.html#systems",
        "座標"
      ],
      [
        "theory.html#boundary",
        "境界条件と拘束"
      ]
    ],
    "aliases": {
      "temperature": "initial"
    }
  },
  "contact": {
    "title": "接触・摩擦・締結",
    "api": "ContactChapter",
    "prefix": "contact",
    "articles": [
      {
        "key": "overview",
        "title": "接触の基本・開閉",
        "sections": [
          "meaning",
          "normal",
          "geometry",
          "penalty",
          "methods"
        ],
        "questions": [
          0,
          1
        ],
        "goals": [
          "支持と接触の違いを式と図で理解する",
          "すき間・反力・貫通を確認する"
        ],
        "points": [
          "面が開くと接触反力はゼロになる。",
          "シェルは中立面ではなく板厚を含む物理面で考える。",
          "接触剛性を大きくするだけでは精度を保証できない。"
        ]
      },
      {
        "key": "friction",
        "title": "摩擦・固着・滑り",
        "sections": [
          "friction",
          "history",
          "partial"
        ],
        "questions": [
          2,
          3
        ],
        "goals": [
          "固着から滑りへの移行と履歴を追う"
        ],
        "points": [
          "固着中の摩擦力は常にμNではない。",
          "除荷と逆向き載荷では滑り履歴が残る。",
          "面全体の力だけでは局所の滑りを判断できない。"
        ]
      },
      {
        "key": "surfaces",
        "title": "接触面のモデル化",
        "sections": [
          "surface",
          "mesh",
          "hertz",
          "glue",
          "gap"
        ],
        "questions": [
          4,
          5
        ],
        "goals": [
          "面・メッシュ・接触則を評価目的から選ぶ"
        ],
        "points": [
          "局所圧力には面の離散化と曲率が効く。",
          "弾性材料でも接触面積の変化で非線形になる。",
          "永久固着・摩擦・GAPは同じモデルではない。"
        ]
      },
      {
        "key": "products",
        "title": "製品・SOL別の接触設定",
        "sections": [
          "msc101",
          "msc400",
          "siemens"
        ],
        "questions": [
          6,
          7
        ],
        "goals": [
          "SOLと接触方式の適用範囲を区別する"
        ],
        "points": [
          "SOL 101の摩擦を大滑りの履歴へ流用しない。",
          "接触体・接触対・接触則・ステップを分ける。",
          "MSCとSiemensの非線形カードを同一視しない。"
        ]
      },
      {
        "key": "bolts",
        "title": "締付け・保持・外力",
        "sections": [
          "preload",
          "stiffness",
          "partition",
          "stages",
          "bolt-cards",
          "shear"
        ],
        "questions": [
          8,
          9,
          10,
          12
        ],
        "goals": [
          "締結の荷重分担と開離を式から求める",
          "締付け後に保持する量を区別する"
        ],
        "points": [
          "締付けはボルトの引張と部材の圧縮を作る。",
          "外力はボルト軸力の増加と圧縮力の減少へ分かれる。",
          "締付け変形の保持と軸力一定の制御では荷重経路が違う。"
        ]
      },
      {
        "key": "management",
        "title": "トルク・予荷重の変化・詳細化",
        "sections": [
          "torque",
          "loss",
          "modeling"
        ],
        "questions": [
          11
        ],
        "goals": [
          "締付け軸力の変動とモデルの詳細度を判断する"
        ],
        "points": [
          "トルク係数Kと接触面の摩擦係数μは異なる。",
          "熱膨張差となじみ量は予荷重を変える。",
          "詳細化は評価したい量と検証できる情報に合わせる。"
        ]
      },
      {
        "key": "verification",
        "title": "収束と結果の検証",
        "sections": [
          "convergence",
          "diagnosis",
          "checks"
        ],
        "questions": [
          13
        ],
        "goals": [
          "接触状態・収支・感度から妥当性を確認する"
        ],
        "points": [
          "収束は設定が正しいことの証明ではない。",
          "法線反力・滑り・貫通・残差を対応させる。",
          "荷重刻み・メッシュ・接触剛性を変えて結果の安定性を調べる。"
        ]
      }
    ],
    "prerequisites": [
      [
        "theory.html#boundary",
        "境界条件と拘束"
      ],
      [
        "theory.html#common-loads",
        "荷重の理論"
      ]
    ],
    "aliases": {}
  },
  "damping": {
    "title": "減衰の理論",
    "api": "DampingChapter",
    "prefix": "damping",
    "articles": [
      {
        "key": "overview",
        "title": "減衰の意味・式・単位",
        "sections": [
          "meaning",
          "equation",
          "units"
        ],
        "questions": [
          0,
          2
        ],
        "goals": [
          "減衰力の仕事と係数の単位を理解する"
        ],
        "points": [
          "減衰はエネルギー損失のモデル。",
          "c・ζ・g・Qは異なる量。",
          "Hzとrad/sを入力欄の定義に合わせる。"
        ]
      },
      {
        "key": "response",
        "title": "自由振動・共振・構造減衰",
        "sections": [
          "free",
          "harmonic",
          "structural"
        ],
        "questions": [
          3
        ],
        "goals": [
          "自由振動と共振応答への減衰の効果を比べる"
        ],
        "points": [
          "不足・臨界・過減衰では根の形が変わる。",
          "ピークの高さだけでなく位相も読む。",
          "一定cと一定gは全周波数で等価ではない。"
        ]
      },
      {
        "key": "identify",
        "title": "実測からの同定",
        "sections": [
          "identify"
        ],
        "questions": [
          4,
          5
        ],
        "goals": [
          "対数減衰率と半値幅から減衰比を求める"
        ],
        "points": [
          "同符号のピーク間隔で周期数を数える。",
          "半値幅は振幅の1/√2を使う。",
          "近接モードや非線形性が強い場合は前提を見直す。"
        ]
      },
      {
        "key": "distribution",
        "title": "モード・局所・Rayleigh",
        "sections": [
          "modal",
          "local",
          "rayleigh"
        ],
        "questions": [
          1,
          6,
          7,
          9
        ],
        "goals": [
          "損失を構造へ配る方法を選ぶ",
          "局所運動とモード連成を見分ける"
        ],
        "points": [
          "局所ダンパーには相対速度が必要。",
          "モード減衰は各固有振動数で評価する。",
          "Rayleighの2点合わせは帯域外を保証しない。"
        ]
      },
      {
        "key": "implementation",
        "title": "過渡・材料・入力の対応",
        "sections": [
          "transient",
          "implementation",
          "hybrid",
          "materials"
        ],
        "questions": [
          8
        ],
        "goals": [
          "SOL・減衰モデル・入力を対応させる"
        ],
        "points": [
          "構造減衰の過渡換算は基準角周波数を使う。",
          "カードの定義とケースの選択をそろえる。",
          "材料・局所・モードの損失を重複計上しない。"
        ]
      },
      {
        "key": "verification",
        "title": "複素固有値・非線形・検証",
        "sections": [
          "complex",
          "nonlinear",
          "validation"
        ],
        "questions": [
          10,
          11
        ],
        "goals": [
          "安定性と数値精度から減衰設定を検証する"
        ],
        "points": [
          "複素固有値は実部の符号と虚部を分けて読む。",
          "物理的な損失と数値減衰を区別する。",
          "周波数刻みとモード数への感度も確認する。"
        ]
      }
    ],
    "prerequisites": [
      [
        "elements.html#scalar",
        "ばね要素"
      ],
      [
        "theory.html#modes",
        "実固有値の理論"
      ]
    ],
    "aliases": {}
  },
  "mesh": {
    "title": "メッシュ分割の理論",
    "api": "MeshChapter",
    "prefix": "mesh",
    "articles": [
      {
        "key": "sizing",
        "title": "評価位置と円孔のCQUAD4分割",
        "sections": [
          "target",
          "ring",
          "features"
        ],
        "questions": [
          0
        ],
        "goals": [
          "円周方向と径方向の分割を別々に選ぶ",
          "肩R・近接孔・狭い肉の評価位置を決める"
        ],
        "points": [
          "着目する量と位置を先に決める。",
          "曲線を表す辺と応力勾配を横切る辺を区別する。",
          "形状と応力が急変する領域を囲んで細分化する。"
        ]
      },
      {
        "key": "transitions",
        "title": "粗密の遷移と節点の接続",
        "sections": [
          "transition"
        ],
        "questions": [
          1
        ],
        "goals": [
          "列の幅と列の本数を区別する",
          "全四角形の3対1の遷移例を読む"
        ],
        "points": [
          "同じ列の間隔は連続的に変えられる。",
          "列の数を変えるには遷移領域が要る。",
          "適合境界は辺の両端の節点番号を共有する。"
        ]
      },
      {
        "key": "quality",
        "title": "要素形状とヤコビアン",
        "sections": [
          "shape",
          "jacobian"
        ],
        "questions": [
          2
        ],
        "goals": [
          "細長さ・ゆがみ・反りを見分ける",
          "ヤコビアンと品質比の意味を区別する"
        ],
        "points": [
          "悪い要素の番号を形状に戻す。",
          "面積倍率には寸法の影響がある。",
          "形状検査と結果の収束は別に確認する。"
        ]
      },
      {
        "key": "convergence",
        "title": "応力・固有振動数のメッシュ収束",
        "sections": [
          "study",
          "modes"
        ],
        "questions": [
          3
        ],
        "goals": [
          "同じ位置・成分でメッシュ差を測る",
          "対象とする高次モードまで追跡する"
        ],
        "points": [
          "細分化しても観測位置を変えない。",
          "設計で使う量ごとに分割の感度を測る。",
          "近接する固有値はモード形も比較する。"
        ]
      },
      {
        "key": "waves",
        "title": "波長・せん断波速度・時間刻み",
        "sections": [
          "wavelength",
          "time"
        ],
        "questions": [
          4
        ],
        "goals": [
          "対象周波数から空間刻みを試算する",
          "積分刻みと結果の保存間隔を選ぶ"
        ],
        "points": [
          "同じ振動数では波速が遅い層ほど波長が短い。",
          "陽解法では安定性も確認する。",
          "到達時刻と振幅を別々に検算する。"
        ]
      }
    ],
    "prerequisites": [
      [
        "elements.html#shell",
        "シェル要素"
      ],
      [
        "coordinates.html#systems",
        "座標系"
      ]
    ]
  }
};
