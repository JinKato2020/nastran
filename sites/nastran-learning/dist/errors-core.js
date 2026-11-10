/* Pure search and explanation rules, shared by browser and offline reader. */
(function (root) {
  'use strict';
  const norm = value => String(value || '').normalize('NFKC').toUpperCase().replace(/\s+/g, ' ').trim();
  const severity = {
    FATAL: ['停止', '計算を続けられないという通知です。止まった理由を直してから、もう一度実行します。'],
    WARNING: ['警告', '注意が必要という通知です。計算が続いても、その結果をそのまま正しいと判断せず、警告の影響を確認します。'],
    INFORMATION: ['情報', '計算中の状態や処理内容のお知らせです。これだけで失敗とは限りません。'],
    'FATAL/WARNING': ['停止／警告', '原典では停止と警告をまとめた項目です。実際のF06に書かれた区分を確認します。'],
    UNSPECIFIED: ['区分記載なし', 'この項目には区分の見出しがありません。エラー番号から区分を推測せず、実際のF06を確認します。']
  };
  const groups = [
    {id:'memory',title:'メモリ・作業領域',test:/INSUFFICIENT.*(?:MEMORY|CORE)|(?:MEMORY|CORE).*(?:INSUFFICIENT|EXCEED|REQUIR)|ALLOCAT.*FAIL|OUT OF MEMORY/,terms:'メモリ 容量 作業領域 RAM 不足',meaning:'計算用の作業机に当たる領域についてのメッセージです。必要量と使用できる量を照合します。',checks:['本文の必要量・使用可能量・単位を読みます。','同時に動くジョブ数、指定メモリ、実際に使えるRAMを確認します。','一時ファイルの領域とRAMは別です。どちらの不足かを確認してから設定を変えます。'],links:[['batch.html','メモリと並列計算']]},
    {id:'license',title:'ライセンス・利用権',test:/LICEN[CS]|AUTHORIZATION|AUTHORI[ZS]ED/,terms:'ライセンス 認証 使用権 トークン サーバー',meaning:'ソフトや機能を使用できるかの確認に関するメッセージです。入力モデルの修正で解決するとは限りません。',checks:['利用できなかった機能名とライセンス名を本文で確認します。','ライセンスサーバーへの接続と利用可能数を管理者と確認します。','F06とlogに出た元のメッセージを残します。'],links:[['batch.html','実行時の確認']]},
    {id:'singular',title:'特異行列・計算の不安定',test:/SINGULAR|PIVOT|NEGATIVE.*(?:DIAGONAL|FACTOR)|EXCESSIVE PIVOT/,terms:'特異 行列 拘束不足 剛体運動 不安定 ピボット ゼロ',meaning:'連立方程式を解く際の問題に関するメッセージです。例えば、押しても支えがなく全体が動く模型では、変位が一つに決まりません。ただし、拘束不足以外の原因もあります。',checks:['本文に出た行列名、節点番号、自由度と、その直前のメッセージを確認します。','離れた部品・要素の接続・必要な支持・材料や断面の値を照合します。','解析目的にない拘束を足して止めるのではなく、実物の支持条件を確かめます。'],links:[['basics.html','節点・自由度・拘束'],['modeling.html','模型の仮定']]},
    {id:'reference',title:'番号の参照先',test:/UNDEFINED|NOT DEFINED|DOES NOT (?:EXIST|REFERENCE)|NON.?EXISTENT|NOT FOUND|MISSING.*(?:ENTRY|GRID|MATERIAL|PROPERTY)/,terms:'未定義 参照 番号 ID 節点 材料 物性 見つからない',meaning:'ある番号で呼び出すデータが見つかるかを確かめる種類のメッセージです。番号は「名札」です。呼ぶ側と、その名札を定義する側を見比べます。',checks:['本文で「何の番号がないのか」を確かめます。節点・物性・材料・座標系は別の名札です。','呼ぶ側の欄と、呼ばれるカードのIDを比較します。','INCLUDEしたファイルが実際に読まれたか、SUBCASEの選択が正しいかを確認します。'],links:[['relations.html','番号をつなぐ相関図'],['include.html','INCLUDEの確認']]},
    {id:'duplicate',title:'番号・自由度の重複',test:/DUPLICAT|MULTIPLY DEFINED|DEFINED MORE THAN ONCE/,terms:'重複 二重 同じ番号 多重 定義',meaning:'同じ定義や指定が重なっていないかを調べるメッセージです。同じ番号を使えるかどうかは、カードの種類と使い方で違います。',checks:['重なった対象が節点IDなのか、拘束する自由度なのかを読み分けます。','親ファイルとINCLUDE先の両方を検索します。','同じ番号をすべて変更するのではなく、原典のカード規則に沿って必要な重複だけを直します。'],links:[['include.html','分割しても番号は共有'],['bulk.html','カードの入力規則']]},
    {id:'geometry',title:'要素の形・向き',test:/JACOBIAN|ASPECT RATIO|WARP|SKEW|COLLINEAR|NEGATIVE VOLUME|ZERO (?:LENGTH|AREA|VOLUME)|ELEMENT.*GEOMETR|DISTORT/,terms:'形状 要素 メッシュ ヤコビアン 体積 長さ ゆがみ ねじれ',meaning:'小さな部品である要素の形や節点の並びに関するメッセージです。つぶれた形や裏返った並びでは、計算に必要な量を作れないことがあります。',checks:['本文の要素IDに対応する節点座標と、カード上の節点順を確認します。','重なった点・ゼロの長さ・大きなゆがみを確認します。','許容値だけを緩める前に、形状とメッシュを直して品質を比較します。'],links:[['bulk.html','要素カード図鑑'],['coordinates.html','要素の向き']]},
    {id:'constraint',title:'拘束・従属自由度',test:/\bSPC\b|\bMPC\b|DEPENDENT.*(?:DOF|DEGREE)|CONSTRAINT|RIGID BODY/,terms:'拘束 SPC MPC RBE 剛体 従属 自由度 支持',meaning:'点の動きを止める条件や、点同士の動きを結び付ける条件についてのメッセージです。同じ動きに矛盾する条件を与えていないかを調べます。',checks:['節点番号だけでなく、成分1〜6と座標系を確認します。','SPC、GRIDのPS、MPC、剛体要素の指定を合わせて確認します。','実物で動ける方向・止まる方向と、入力条件を照合します。'],links:[['basics.html','6つの動きと拘束'],['bulk.html#RBE2','RBE2の説明']]},
    {id:'material',title:'材料・断面・物性',test:/YOUNG|POISSON|SHEAR MODUL|MATERIAL|\bMAT[1289]\b|THICKNESS|DENSITY/,terms:'材料 ヤング率 ポアソン比 厚さ 密度 断面 MAT1',meaning:'材料の硬さ、重さ、厚さなどに関するメッセージです。値だけでなく、要素が正しい物性・材料を使っているかも確認します。',checks:['本文で指定された材料・物性・要素のIDをつなげて確認します。','必要な値が空欄やゼロになっていないか、カード規則を読みます。','長さ・力・質量の単位と、材料定数同士の整合を確認します。'],links:[['bulk.html#MAT1','材料MAT1'],['relations.html','要素から材料への参照']]},
    {id:'eigen',title:'固有値・振動・周波数',test:/EIGEN|LANCZOS|FREQUENC|\bMODES?\b|GENERALIZED MASS/,terms:'固有値 固有振動数 モード 周波数 質量 EIGRL 振動',meaning:'振動の形や速さ、周波数ごとの計算に関するメッセージです。欲しいモード数・探索範囲・質量・支持条件を一緒に確認します。',checks:['使うSOLと、METHODやFREQUENCYの参照先を確認します。','周波数の範囲と単位、質量の設定を確認します。','ゼロに近いモードが、意図した自由支持の剛体運動か、つなぎ忘れかを見分けます。'],links:[['dynamics.html','動解析の基礎']]},
    {id:'damping',title:'減衰',test:/DAMP|\bW3\b|\bW4\b/,terms:'減衰 モード減衰 粘性 構造減衰 TABDMP1',meaning:'振動が弱まる性質である減衰についてのメッセージです。減衰の種類によって、同じ数値でも意味と単位が変わります。',checks:['減衰比・構造減衰係数・粘性係数のどれを入力するか確認します。','SDAMPINGやTABDMP1の参照と周波数範囲を確認します。','複数の減衰を重ねて指定していないか、解析方式で有効かを確認します。'],links:[['damping.html','減衰の種類と入力']]},
    {id:'file',title:'ファイル・入出力',test:/\bFILE\b|END.OF.FILE|\bEOF\b|\bDISK\b|\bI\/O\b|DIRECTORY|PATH NAME/,terms:'ファイル 読み込み 保存 ディスク パス INCLUDE 入出力',meaning:'データを読む・書く・開く処理に関するメッセージです。ファイル名と保存場所、容量、アクセスできる状態を確認します。',checks:['本文のファイル名・パス・読み書きのどの操作で止まったかを確認します。','実行フォルダ、INCLUDE先、出力先と一時フォルダを区別して調べます。','logのOSエラー、空き容量、権限も確認します。入力モデルのエラーとは対処が異なる場合があります。'],links:[['workflow.html','関連ファイル'],['include.html','INCLUDEのパス']]},
    {id:'format',title:'入力の書き方・値',test:/FORMAT|SYNTAX|ILLEGAL|INVALID|OUT.OF.RANGE|MUST BE|MUST NOT|REQUIRED|UNRECOGNI[ZS]ED/,terms:'入力 書式 8桁 フィールド 範囲 不正 空欄 整数 実数',meaning:'入力の形や値が規則に合うかを調べるメッセージです。「その欄に何を書くか」と「何文字目に書くか」を分けて確認します。',checks:['F06で指摘されたカード名・行・欄を見つけます。','8文字ごとに区切り、整数・実数・文字・空欄の規則を確認します。','継続行、ID参照、Executive／Case／Bulkの区画も見直します。'],links:[['input.html','入力の4ステップ'],['bulk.html','全フィールドの説明']]},
    {id:'convergence',title:'収束・繰り返し計算',test:/CONVERG|ITERATION|TIME STEP|INCREMENT/,terms:'収束 反復 繰り返し 時間刻み 非線形',meaning:'繰り返し計算や刻み幅についてのメッセージです。計算がどこまで進み、何が許容値に届かなかったかを確認します。',checks:['止まった時刻・荷重段階・反復数を記録します。','その直前の残差や収束判定、材料・接触・支持条件を確認します。','回数や許容値だけを変える前に、模型と解析手法の適合を確認します。'],links:[['dynamics.html','時間と周波数の違い']]},
    {id:'load',title:'荷重・解析条件',test:/LOAD|\bSUBCASE\b|CASE CONTROL/,terms:'荷重 LOAD SUBCASE サブケース 解析条件 力',meaning:'力などの荷重や、どの条件を使うかに関するメッセージです。定義した条件が実際のSUBCASEから選ばれているかを確認します。',checks:['Case Controlで選ぶ番号とBulkで作った番号を比べます。','静荷重・動荷重のカードと、使う解析方式が合うか確認します。','荷重の向き・座標系・倍率を確認します。'],links:[['relations.html','解析カードの相関図'],['input.html','Case Controlの入力']]},
    {id:'general',title:'原典で個別確認',test:/.*/,terms:'その他 原典 調査',meaning:'この項目の個別の日本語解説はまだありません。下のメッセージ原文と、番号・処理名が一致する原典のページを確認してください。',checks:['エラーの前後を含むF06とlogを保存します。','直前に出た別のメッセージに、より具体的な原因がないか確認します。','使用したNastranの版・SOL・入力ファイルをそろえて、原典やサポートで調べます。'],links:[['workflow.html','F06とlogの読み方']]}
  ];
  function prepare(data) {
    const notes = new Map(data.notes.map(n=>[n.key,n]));
    return data.records.map(r=>{
      const note=notes.get(r.key), group=groups.find(g=>g.test.test(norm(r.message)));
      return {...r,note,group,search:norm([r.id,r.number,r.emitted,r.module,r.message,group.title,group.terms,note?.title,note?.meaning,...(note?.terms||[])].join(' '))};
    });
  }
  function queryInfo(value) {
    const q=norm(value), patterns=[...q.matchAll(/\b(?:USER|SYSTEM)\s+(?:FATAL(?:\s*\/\s*WARNING)?|WARNING|INFORMATION)\s+MESSAGE\s+(\d+)(?:\s*\(([^)]+)\))?/g)];
    if(patterns.length) return {q,type:'log',headers:patterns.map(m=>({number:m[1],module:m[2]||'',start:m.index,end:m.index+m[0].length}))};
    if(/^\d+(?:\.\d+)?$/.test(q))return {q,type:q.includes('.')?'entry':'number'};
    return {q,type:'words',tokens:q.split(' ').filter(Boolean)};
  }
  function search(rows,value,filter={}) {
    const info=queryInfo(value);
    let matches=rows.filter(r=>{
      if(r.template)return false;
      if(filter.severity&&filter.severity!==r.severity)return false;
      if(filter.group&&filter.group!==r.group.id)return false;
      if(filter.notes&&!r.note)return false;
      if(!info.q)return true;
      if(info.type==='entry')return r.id===info.q;
      if(info.type==='number')return r.number===info.q||r.emitted===info.q;
      if(info.type==='log')return info.headers.some(h=>r.number===h.number||r.emitted===h.number);
      return info.tokens.every(t=>r.search.includes(t));
    });
    const score=r=>{
      let n=r.note?2:0;
      if(info.type==='log')for(const h of info.headers){
        if(r.number!==h.number&&r.emitted!==h.number)continue;
        if(h.module&&norm(r.module)===h.module)n+=100;
        const tokens=norm(r.message).match(/[A-Z][A-Z0-9_]{3,}/g)||[];
        n+=new Set(tokens.filter(t=>info.q.includes(t))).size;
      }
      return n;
    };
    matches.sort((a,b)=>score(b)-score(a)||Number(a.number)-Number(b.number)||Number(a.id.split('.')[1])-Number(b.id.split('.')[1])||a.page-b.page);
    return {matches,info};
  }
  function explain(r) {
    const s=severity[r.severity]||severity.UNSPECIFIED;
    return {title:r.note?.title||r.group.title,meaning:r.note?.meaning||r.group.meaning,checks:r.note?.checks||r.group.checks,caution:r.note?.caution||'',links:r.note?.links||r.group.links.map(([href,label])=>({href,label})),label:s[0],status:s[1],individual:!!r.note};
  }
  root.NastranErrorSearch={norm,severity,groups,prepare,queryInfo,search,explain};
})(typeof window==='undefined'?globalThis:window);
