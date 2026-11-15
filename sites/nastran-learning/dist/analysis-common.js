// Shared technical guidance for every analysis. Card definitions live in Input data.

window.AnalysisCommon = `
<div class="analysis-head"><span class="analysis-sol">Nastran共通</span><h1>共通</h1><p>モデル図で条件を確かめ、主要カードの役割と、結果を照合する観点を学びます。</p></div>
<nav class="analysis-common-index" aria-label="共通の目次"><a href="analysis.html#common/relations">主要カードの読み方</a><a href="analysis.html#common/material-check">材料</a><a href="analysis.html#common/constraint-check">境界条件</a><a href="analysis.html#common/load-check">荷重</a><a href="analysis.html#common/contact-check">接触</a><a href="analysis.html#common/damping-check">減衰</a><a href="analysis.html#common/restart">リスタート</a><a href="comparisons.html#beam">似たカード</a><a href="analysis.html#common/run">実行・終了確認</a><a href="analysis.html#common/results">結果の照合</a></nav>
<section class="analysis-section" id="analysis-common-relations"><h2>主要カードの読み方</h2><p>各解析の入力では、解法を選び、解析ケースと出力を指定し、その解析に必要な設定やモデルの定義を確認します。</p>
<dl>
<dt><strong>Executive Control</strong></dt><dd>実行する解析を選びます。たとえば実固有値解析では <a href="bulk.html#EXEC_SOL_103">SOL 103</a> を指定します。</dd>
<dt><strong>Case Control</strong></dt><dd>各ケースで使う拘束・荷重・解法設定と、出力する結果を指定します。たとえば <a href="bulk.html#CASE_METHOD">METHOD</a> で固有値抽出条件を選び、<a href="bulk.html#CASE_DISPLACEMENT">DISPLACEMENT</a> で変位ベクトルの出力を要求します。</dd>
<dt><strong>PARAM</strong></dt><dd>指定によって計算や出力が変わる項目を確認します。たとえば <a href="bulk.html#PARAM_COUPMASS">PARAM,COUPMASS</a> は、対応する要素の質量行列の扱いに関係します。PARAMは通常Bulk Dataに記載します。</dd>
<dt><strong>Bulk Data</strong></dt><dd>節点・要素・材料・拘束・荷重や解法の設定を定義します。たとえば <code>METHOD = 30</code> は <a href="bulk.html#EIGRL">EIGRL</a> の <code>SID = 30</code> に対応します。</dd>
</dl><p>カードの参照関係は相関図の矢印で追えます。カード名を押すと、Inputデータで書式・全フィールド・既定値を確認できます。</p></section>
<section class="analysis-section" id="analysis-common-input"><h2>入力規則とカードの詳細</h2><div class="analysis-links"><a href="input.html#rules">入力規則・固定長・継続行 →</a><a href="bulk.html">カードの用途・全フィールド →</a><a href="include.html">INCLUDEによるファイル分割 →</a></div></section>
<section class="analysis-section" id="analysis-common-material-check"><h2>材料・積層の入力と結果</h2>
<ol class="analysis-steps">
<li>要素のPIDから物性カードへ、物性のMIDから材料へと番号を追います。<a href="bulk.html#PSHELL">PSHELL</a>の膜・曲げ材、<a href="bulk.html#PSOLID">PSOLID</a>の材料座標CORDM、<a href="bulk.html#PCOMP">PCOMP</a>の各層は、対象に応じて確認します。</li>
<li><a href="bulk.html#MAT1">MAT1</a>のE・G・ν、<a href="bulk.html#MAT8">MAT8</a>の1方向・2方向の剛性などを実際の単位と材料軸に揃えます。自重を与える場合は密度・集中質量・非構造質量を点検します。</li>
<li>積層板は法線と角度の基準、層の順番、各層の出力指定を確認してから、<a href="bulk.html#CASE_STRESS">STRESS</a>の層別結果を読みます。破壊指標を要求する場合は破壊理論と層の強度入力も確認します。</li>
</ol><div class="analysis-links"><a href="theory.html#materials">材料の考え方と積層の検算 →</a></div></section>
<section class="analysis-section" id="analysis-common-constraint-check"><h2>拘束の入力と反力</h2>
<ol class="analysis-steps">
<li>目的のSUBCASEで<a href="bulk.html#CASE_SPC">SPC (Case)</a>が選ぶSIDを確認し、GRIDのCDで拘束方向を読みます。強制変位には対象成分の拘束と、<a href="bulk.html#SPCD">SPCD</a>の値を選ぶLOADを照合します。</li>
<li><a href="bulk.html#MPCY">MPCY</a>と<a href="bulk.html#MPCD">MPCD</a>では、MPCで選んだ式のGM・CMの組と、LOADで直接選ぶ右辺値を照合します。解析結果の変位を式に代入して確認します。</li>
<li>F06のGrid Point Singularity Tableで<a href="bulk.html#PARAM_AUTOSPC">AUTOSPC</a>が扱った成分を確認し、意図した支持位置の<a href="bulk.html#CASE_SPCFORCES">SPCFORCES</a>で釣合いを点検します。</li>
</ol><div class="analysis-links"><a href="theory.html#boundary">境界条件と自由度の考え方 →</a><a href="comparisons.html#rigid-interpolation">SPC・RBE2・RBE3・MPCの使い分け →</a></div></section>
<section class="analysis-section" id="analysis-common-load-check"><h2>荷重の設定と確認</h2><p>静荷重は各SUBCASEで選択し、作用位置・方向・大きさを確認します。動荷重はこれらに加え、周波数または時間に対する変化も確認します。</p>
<ol class="analysis-steps">
<li><a href="bulk.html#CASE_LOAD">LOAD (Case)</a>から荷重SIDを追います。機械荷重を複数組み合わせるなら<a href="bulk.html#LOAD">LOAD (Bulk)</a>の全体倍率と個別倍率を確認します。温度は<a href="bulk.html#CASE_TEMPERATURE">TEMPERATURE (Case)</a>、初期伸びは<a href="bulk.html#CASE_DEFORM">DEFORM (Case)</a>の経路を確認します。</li>
<li>点荷重では作用点、線荷重ではA端と作用区間、面荷重では対象面と法線、加速度荷重では単位と質量を確認します。<a href="bulk.html#PLOAD1">PLOAD1</a>、<a href="bulk.html#PLOAD4">PLOAD4</a>、<a href="bulk.html#ACCEL1">ACCEL1</a>は適用範囲の指定方法が異なります。</li>
<li><a href="bulk.html#CASE_OLOAD">OLOAD</a>の合力とモーメントを、同じ座標・基準点で手計算と照合します。支持反力との釣合いを見て、荷重の選択漏れ・符号・二重計上を確認します。</li>
</ol><div class="analysis-links"><a href="theory.html#common-loads">静荷重と荷重ケースの考え方 →</a><a href="analysis.html#direct-frequency">周波数応答の荷重設定 →</a><a href="analysis.html#transient">過渡応答の荷重設定 →</a></div></section>
<section class="analysis-section" id="analysis-common-contact-check"><h2>接触状態を確認する</h2>
<p>解析前に初期隙間、接触面の向き、接触対象を照合します。解析後は、閉じるはずの面の接触圧、離れるはずの面の開き、摩擦面の滑りと反力を荷重ステップごとに確認します。接触圧を評価するときは、面のどこで出力された値かも確認します。</p>
<div class="analysis-links"><a href="theory.html#contact">開離・摩擦・締付けの理論 →</a><a href="analysis.html#contact">解析別の接触設定と出力 →</a></div></section>
<section class="analysis-section" id="analysis-common-damping-check"><h2>減衰の設定を照合する</h2>
<p>適用したSOLで使われる減衰入力を確認します。モード減衰を指定した場合はCase ControlのSDAMPINGとTABDMP1のID、周波数軸、減衰の種類を照合します。要素の粘性減衰や材料の構造減衰がある場合は、対象と単位を確認し、同じ散逸を二重に見込んでいないか点検します。</p>
<div class="analysis-links"><a href="bulk.html#CASE_SDAMPING">SDAMPING →</a><a href="bulk.html#TABDMP1">TABDMP1 →</a><a href="theory.html#damping">減衰比と減衰の種類 →</a></div></section>
<section class="analysis-section" id="analysis-common-restart"><h2>MSC Nastranのリスタートを指定する</h2>
<ol class="analysis-steps">
<li>初回計算で再利用するデータベースを保存します。通常の保存例は実行オプション <code>scr=no</code> です。F04で使用可能な版を確認し、MASTERと対応するデータベースを保管します。</li>
<li>今回使うデータベースを実行オプションの <code>dbs=</code> で指定するか、FMSのASSIGNで接続します。FMSのRESTARTで版を選びます。<code>VERSION=LAST,KEEP</code> なら元の版を残す指定です。NOKEEPの動作を確認して使います。</li>
<li>出力要求だけを追加するときは、引き続き必要な拘束・荷重などのCase Control指定を維持します。材料などを変える場合は再計算される範囲に注意し、今回のF04とF06で参照した版と対象SUBCASEを確認します。</li>
</ol><div class="analysis-links"><a href="theory.html#restart">リスタートで再利用できる処理 →</a><a href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2025.1_Quick_Reference_Guide.pdf#page=138" target="_blank" rel="noopener">RESTART文の書式 ↗</a></div></section>
<section class="analysis-section" id="analysis-common-run"><h2>実行・終了確認</h2><p>手元で実行したら、F06の終了状態、警告、対象のSUBCASE、要求した結果の順に確認します。非線形解析では到達した荷重・増分と収束履歴も読みます。</p><div class="analysis-links"><a href="workflow.html#files">入力・出力ファイルの役割 →</a><a href="batch.html">バッチ・実行オプション・並列計算 →</a><a href="errors.html">エラーメッセージ →</a></div></section>
<section class="analysis-section" id="analysis-common-results"><h2>結果の照合</h2><ul><li>比較する単位・座標系・成分・位置をそろえます。</li><li>応力の出力位置、表裏、平均化の有無を確認します。</li><li>目当ての結果を出す出力要求、対象のSET・SUBCASE、出力先を確認します。</li></ul><div class="analysis-links"><a href="workflow.html#results">F06の結果表を読む →</a><a href="coordinates.html">座標・応力の符号 →</a></div></section>
<section class="analysis-section" id="analysis-common-node-element-check"><h2>節点・要素の結果が想定と違うとき</h2>
<dl>
<dt><strong>拘束したはずの向きに動く</strong></dt><dd>まず結果の節点番号とSUBCASEを確認します。<a href="bulk.html#GRID">GRID</a>のCPは節点位置を決め、CDは変位・拘束の成分方向を決めます。位置が正しければ、CDと<a href="bulk.html#CASE_SPC">Case ControlのSPC</a>で選んだセットを確認します。</dd>
<dt><strong>ばねの変位・力の符号が合わない</strong></dt><dd><a href="bulk.html#CASE_DISPLACEMENT">DISPLACEMENT</a>の出力対象に点番号を含めます。SPOINTの値は接続カードの点番号から追います。ばね力は接続端の順と、各端の選択成分を照合します。</dd>
<dt><strong>梁の曲がり方やシェル表裏の応力が合わない</strong></dt><dd>梁は断面の向きに使ったベクトルと、読む断面の位置を確認します。シェルは節点順の法線、出力座標と応力評価位置を確認します。<a href="bulk.html#CASE_STRESS">STRESS</a>の結果は同じ位置・同じ軸で比較します。</dd>
</dl><div class="analysis-links"><a href="coordinates.html#points">節点・スカラー点の基本 →</a><a href="coordinates.html#elements">梁の方向ベクトル・シェルの法線 →</a><a href="elements.html#scalar-overview">各要素の選び方 →</a></div></section>
<section class="analysis-section" id="analysis-common-verification"><h2>図と参照資料</h2><p>モデル図は形状・境界条件・観測位置の模式図です。参照資料は各解析の末尾に示します。</p></section>`;
// BEGIN THIRD PARTY NOTICES
window.AnalysisCommon += "<section class=\"analysis-section\" id=\"analysis-common-rights\"><h2>出典・利用条件</h2><p>本教材は非公式です。MSC Nastranの開発元による提供・認定・保証を示すものではありません。記載の製品名・商標は各権利者に帰属します。</p><h3>予荷重固有値モデル：SPAD</h3><p>予荷重固有値の解説が参照するSPADの配布条件は以下のMITライセンスです。</p><p><a href=\"https://github.com/zhaowei0566/SPAD/blob/7a5b6b7cec77511549bfa0bfca434b38b1b9bbec/LICENSE.txt\" target=\"_blank\" rel=\"noopener\">取得時点のライセンス</a></p><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere\">MIT License\n\nCopyright (c) [2018] [Stiffened Plate Anaysis and Design]\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the &quot;Software&quot;), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n</pre><p>この許諾文はSPAD由来の対象データに適用する表示です。他のマニュアル・教材・アプリ全体に同じ許諾を与えるものではありません。</p></section>";
