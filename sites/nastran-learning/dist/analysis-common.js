// Shared technical guidance for every analysis. Card definitions live in Input data.
window.AnalysisCommon = `
<div class="analysis-head"><span class="analysis-sol">解析手順</span><h1>共通</h1><p>入力の準備から実行、出力の照合まで、各解析に共通する手順です。個別の解析では、モデル固有の条件・出力・検算を確認します。</p></div>
<nav class="analysis-common-index" aria-label="共通の目次"><a href="analysis.html#common/input">入力ファイル</a><a href="analysis.html#common/run">実行・終了確認</a><a href="analysis.html#common/results">結果の照合</a><a href="analysis.html#common/verification">教材の検証範囲</a></nav>
<section class="analysis-section" id="analysis-common-input"><h2>1 · 入力ファイルとカード解説</h2>
<p>「固定長テキスト全文」は先頭6行を表示し、「全て表示」で展開します。「コピー」「DATを保存」は表示範囲によらず全文が対象です。先頭のコードを押すとInputデータの該当カードへ移動し、戻る操作で例題・展開状態・読んでいた位置を復元します。</p>
<p>配布DATのBulk Dataは8文字固定長です。空欄・継続行を含む列位置を保って保存します。Executive Control・Case Controlにはこの8文字規則を適用しません。DATが未提供の解析は、取得状況を個別ページに表示します。</p>
<div class="analysis-links"><a href="input.html#rules">入力規則・固定長・継続行 →</a><a href="bulk.html">カードの用途・全フィールド →</a><a href="include.html">INCLUDEによるファイル分割 →</a></div></section>
<section class="analysis-section" id="analysis-common-run"><h2>2 · 実行・終了確認</h2>
<ol><li>解析ごとに作業フォルダを分け、DATと必要な参照ファイルを保存します。実行するSOLを扱えるバージョン・ライセンスを確認します。</li><li>MSC Nastranのコマンド環境から、各解析ページに示すコマンドを実行します。実行ファイルの場所、メモリ、scratch、並列数は使用環境に合わせます。</li><li>F06の終了状態とFATAL・WARNINGを先に確認します。非線形解析は収束履歴と到達した荷重・増分も確認し、途中までの結果を完了結果として扱いません。</li><li>要求したSUBCASE・結果が出力されていることを確かめ、数値とモデルを照合します。正常終了だけで条件の正しさが確認できるわけではありません。</li></ol>
<div class="analysis-links"><a href="workflow.html#files">入力・出力ファイルの役割 →</a><a href="batch.html">バッチ・実行オプション・並列計算 →</a><a href="errors.html">エラーメッセージを調べる →</a></div></section>
<section class="analysis-section" id="analysis-common-results"><h2>3 · 結果の照合</h2>
<dl class="analysis-inputs"><div><dt>要求した結果が見つからない</dt><dd>Case Controlの出力要求、対象のSET・SUBCASE、出力先を確認します。各解析の「欲しい結果が見つからないとき」から、必要な要求カードへ移動できます。</dd></div><div><dt>比較する条件をそろえる</dt><dd>単位・座標系・成分・対象節点／要素・SUBCASEをそろえます。応力は出力位置（積分点・要素中心・節点など）、表裏・層、平均化の有無も確認します。動解析は周波数／時刻、振幅・位相などの表記を合わせます。</dd></div><div><dt>物理的な整合を確認する</dt><dd>支持条件と変形形状、静力学の力・モーメントのつり合い、定常熱解析の熱収支などを、解析の種類に応じて確認します。具体的な照合値と式は各解析に掲載します。</dd></div><div><dt>分割・解法への依存を調べる</dt><dd>メッシュ、時間・周波数刻み、採用モード数、非線形の増分・収束条件を一つずつ変え、目的とする量が安定するかを比べます。先端や角部などの最大応力だけを一律の合格基準にせず、各解析で定めた評価量を使います。</dd></div></dl>
<div class="analysis-links"><a href="workflow.html#results">F06の結果表を読む →</a><a href="coordinates.html">座標系・応力方向・符号 →</a><a href="bulk.html#CASE_DISPLACEMENT">出力要求の設定 →</a></div></section>
<section class="analysis-section" id="analysis-common-verification"><h2>4 · 教材の検証範囲と参照資料</h2>
<p>現在の学習用DATはMSC Nastran本体では未実行です。入力の参照・構造の点検、独立計算、解析解との比較を行った範囲と、ソルバーでの収束・出力確認を区別します。</p>
<dl class="analysis-inputs"><div><dt>独立計算・解析解</dt><dd>教材の条件を別の計算方法で求めた照合値です。各解析には計算方法と近似の違いを記します。要素の定式化、せん断変形、積分・応力回復などが異なる場合、完全一致を前提にしません。</dd></div><div><dt>参照値の換算</dt><dd>原典の無次元値や相似則を現在の条件へ換算した比較値です。変更後のDATを実行した結果とは区別して表示します。</dd></div><div><dt>参照資料</dt><dd>各解析末尾に出典を示します。PDFページは表紙からの通し番号です。原典PDF・原本DATは保管資料であり、アプリへ同梱していません。各画面の条件・図・入力・検算を一組として使用してください。</dd></div></dl></section>`;
