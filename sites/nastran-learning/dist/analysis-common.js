// Independent technical reference topics. No combined common-procedure page.

const linearStaticGuide2024 = 'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide.pdf';
const verificationQrg = 'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2025.1_Quick_Reference_Guide.pdf';
const verificationReferences = entries => `<div class="analysis-links">${entries.map(([page,name])=>`<a href="${verificationQrg}#page=${page}" target="_blank" rel="noopener">${name}の書式 ↗</a>`).join('')}</div>`;

window.AnalysisReferenceHTML = `


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
</ol>
<details><summary>初回から読み書きリスタートまで</summary>
<p>解析を最初から実行する回はcold startです。<code>scr=no</code>で永続DBを保存し、入力BDF、F04、F06、MASTER・DBALL・IFPDATなど、実行環境が作った関連ファイルを同じ計算として記録します。FMSはExecutive Controlより前に置き、NASTRAN文のBUFFSIZEは再開時も同じ設定にします。</p>
<p>読み書き再開ではFMSで<code>RESTART VERSION=2,KEEP</code>と<code>ASSIGN MASTER='baseline.MASTER'</code>のように指定します。実行時に<code>dbs=baseline</code>を使う場合はASSIGNの代わりになりますが、RESTART文は必要です。版番号2とファイル名は、手元の保存内容に合わせる記入例です。版を省くとLAST、KEEPを省くとNOKEEPが既定です。</p>
<p>Case Controlには継続するSPC・MPC・LOADを残し、今回必要な出力を選びます。Bulk Dataの変更は追加・置換・削除の差分だけに絞ります。追加する荷重ケースには既存セットと区別できるSIDを割り当てます。既定のUPDATEで対応する定義を置き換えられます。削除用の<code>/DELETE</code>は対象範囲をQRGで確認し、<code>ECHO=SORT</code>で再開後に組み上がった入力を照合します。</p>
</details>
<details><summary>版選択・読み取り専用・ミニDB</summary>
<p>失敗した計算でも版番号が進む場合があります。F04の版番号とF06の終了を対にして記録し、再開可能な版を選びます。履歴が分からない場合は、MASTERを割り当て、<code>DBDIR VERSION=*,PROJECT=*</code>を指定して<code>ENDJOB</code>で終了する照会ジョブを使えます。F06のプロジェクト版一覧を確認します。この照会では新しい版を作りません。</p>
<p>読み取り専用は<code>RESTART LOGICAL=BASE</code>と<code>ASSIGN BASE='baseline.MASTER'</code>のように接続します。新しいデータは今回のDBへ書き、元のDBは参照します。今回のDBを残して再利用する場合は、元への依存も管理します。</p>
<p>結果の追加回復だけが目的なら、初回に<code>scr=mini</code>で保存する方式があります。完全DBの平均約4分の1とガイドには記載されています。再開ではBulk Dataの変更や荷重・支持の変更を行わず、対応する出力要求を選びます。HOUTPUT・NOUTPUTは再開時に変更できません。</p>
<p>SOL 101のミニDBで変更できる要求には、DISPLACEMENT・STRESS・STRAIN・FORCE・ESE・GPFORCE・SPCFORCES・MPCFORCES、GPSTRESS・GPSDCON・ELSDCON・STRFIELD、SURFACE・VOLUME、REPCASE・SUBCOM・SUBSEQ・SYMCOM・SYMSEQ・THERMAL・PARAM,POSTがあります。新しい下処理に必要なデータがなければ完全DBまたは初回計算から用意します。</p>
</details>
<details><summary>保存DBからBulk Dataを回収する</summary>
<p>ガイドは<code>PARAM,SERST,SEMI</code>を使った一覧回収の例を示しています。<code>ECHO=SORT</code>は印刷用、<code>ECHO=PUNCH</code>はPCHへの書き出し用です。回収したBulk Dataを使うときは、元のCase Control・FMS・外部ファイルと照合します。</p>
</details>
<details><summary>公式の3回の実行例 · 入力差分とF04・F06の照合</summary>
<p>第14章のListing 14-1〜14-3の入力から、変えた行と確認すべき出力箇所を対応させています。原典にはこの3回のF04・F06全文が掲載されていないため、以下の出力欄は入力と記述から導いた確認内容です。</p>
<div class="analysis-table-wrap" tabindex="0" role="region" aria-label="リスタート3回の入力と出力"><table class="analysis-reference-table">
<thead><tr><th scope="col">実行と変更箇所</th><th scope="col">F04で見る点</th><th scope="col">F06で見る点</th></tr></thead><tbody>
<tr><th scope="row">1回目 stat1 · 初回保存</th><td>新規実行として、保存したDBのパスと作成した版を記録。剛性の組立・分解が実施された回を基準にします。</td><td>SPC 1、SUBCASE 1でLOAD 1、DISPを指定。正方向1,000 Nの応答として変位表を読む回です。応力は要求していません。</td></tr>
<tr><th scope="row">2回目 stat2 · RESTARTとASSIGNを追加</th><td>stat1のMASTERを参照したことと、今回作成した版を照合。モデルの剛性が同じなので分解の再利用を確認します。</td><td>SUBCASE 1のLOAD 1は維持。DISP指定を外しSTRESSを追加したため、元の荷重条件の応力を確認します。</td></tr>
<tr><th scope="row">2回目 stat2 · 荷重とSUBCASE 2を追加</th><td>既存の剛性で新しい右辺を処理する回。組立・分解のやり直しと区別します。</td><td>新規のFORCEセット2（反対方向500 N）をLOAD 2で選び、DISPとSTRESSを確認します。元の荷重セット1や要素は再入力しません。</td></tr>
<tr><th scope="row">3回目 stat3 · MAT1のMID 1を置換</th><td>前回までの版を参照します。Eを1×10⁷から3×10⁷へ変更したため、剛性の再組立・分解に対応する処理を照合します。</td><td>ECHO=BOTHで入力と反映後の定義を確認。両SUBCASEでDISP・STRESSを要求します。同じ外力・断面の軸力問題では、Eを3倍にすると変位は約1/3になるのが手計算の目安です。</td></tr>
</tbody></table></div>
<p>F04の版番号と処理、F06のCase ControlエコーとSUBCASE・出力表を対で記録します。版番号が進んでいても、F06に致命的エラーがある版は再開元に選びません。3回目の例は同じMIDの入力による置換です。<code>/DELETE MAT1</code>は対象が広いため、個別の置換と区別します。</p>
<div class="analysis-links"><a href="${linearStaticGuide2024}#page=539" target="_blank" rel="noopener">Listing 14-1〜14-3 ↗</a><a href="${linearStaticGuide2024}#page=543" target="_blank" rel="noopener">F04・F06と版の確認 ↗</a></div>
</details>
<div class="analysis-links"><a href="theory.html#restart">リスタートで再利用できる処理 →</a><a href="analysis.html#database">データベース管理 →</a><a href="${linearStaticGuide2024}#page=535" target="_blank" rel="noopener">MSC 2024.1 第14章 · 実行例 ↗</a><a href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2025.1_Quick_Reference_Guide.pdf#page=138" target="_blank" rel="noopener">RESTART文の書式 ↗</a></div></section>
<section class="analysis-section" id="analysis-common-database"><h2>MSC Nastranのデータベース管理</h2>
<p>第15章は、後からリスタートするための保存と、大規模モデルのディスク・メモリ割当を扱います。標準の小中規模ジョブは既定割当から始め、保存の要否、容量不足が起きた場所、別ドライブを使う必要があるかで設定を選びます。</p>
<h3>データブロック、DBset、物理ファイルを区別する</h3>
<p>剛性行列や固有値表などの保存単位がデータブロックです。DBsetは物理ファイルをまとめた格納先で、今回割り当てたDBset全体がデータベースです。MASTERは索引とDB構造の定義（NDDL）を持ち、DBALLは通常の永続データを持ちます。SCRATCHはジョブの一時作業、SCR300はモジュールの間だけ使う作業領域、OBJSCRはDMAPのコンパイル用です。MASTERだけを残すと、索引から参照するデータが失われることがあります。</p>
<h3>FMSの文を目的から選ぶ</h3>
<p>第15章のFMSでは1行が72文字を超えるときに継続行を用います。同時に割り当てられるファイルは章では最大200と説明されていますが、実機ではOSの制限も確認します。</p>
<dl>
<dt><strong>INIT</strong></dt><dd>DBsetのメンバーと上限容量を初期化します。単一ファイルの容量調整は実行オプションも比較します。SCRATCHの通常領域とSCR300の指定は分けます。</dd>
<dt><strong>ASSIGN</strong></dt><dd>論理名をパスに結び付けます。別ドライブへ分けたDBALLのメンバーも割り当てられます。FORTRAN入出力ではOUTPUT2などの入出力先に対してSTATUS・UNIT・FORMを選びます。テキスト形式で転送するファイルとバイナリ形式を区別します。</dd>
<dt><strong>EXPAND</strong></dt><dd>既存の永続DBsetの容量が足りなかったとき、再開時に新しいメンバーを追加します。ASSIGNで新しいパスを指定し、EXPANDでDBALLへ加えます。章の説明では1実行に1回で、一時ファイルの拡張には使いません。</dd>
<dt><strong>RESTART</strong></dt><dd>プロジェクトと版を選び、保持方法を指定します。<a href="analysis.html#restart">リスタート手順</a>で読み書きと読み取り専用を比較します。</dd>
<dt><strong>DBCLEAN</strong></dt><dd>不要な版のデータブロックを整理し、DB内部で領域を再利用できるようにします。物理ファイルの長さは縮みません。対象のPROJECT・VERSIONをDBDIRで照合します。ガイドで示す上限は1実行に10文です。</dd>
<dt><strong>DBDIR</strong></dt><dd>版やデータブロックの目録を表示します。FORMATのビット相当値を加算して項目を選びます。1はプロジェクト版、2はNDDLデータブロック、4はNDDLパラメータ、8は空のデータブロック、16はトレーラ、32はパス値表、64は一時データブロックです。既定の63は最初の6項目の合計です。</dd>
<dt><strong>INCLUDE</strong></dt><dd>指定位置に別ファイルを読み込みます。FMSのほか、Case ControlやBulk Dataでも使えます。挿入先とパスの扱いは<a href="include.html">INCLUDEとファイル分割</a>を参照します。</dd>
</dl>
<h3>容量不足と大規模ジョブを扱う</h3>
<ol class="analysis-steps">
<li><code>scr=no</code>で残す領域と、一時領域を分けて見積もります。<code>scr=yes</code>では通常DBALLに置く永続データも一時領域へ流れるため、SCRATCH側にその分の容量を見込みます。終了後の再開に使うDBは残りません。</li>
<li>単一のファイルシステムで足りるなら実行オプションかINITで上限を調整します。複数ドライブが必要ならINITでDBALLとSCRATCHのメンバーを分け、ASSIGNでそれぞれに書き込み可能な物理パスを割り当てます。F04とF06で、容量上限と実際の空き容量のどちらが先に不足したか確認します。</li>
<li>容量の単位はB・KB・MBなどのバイト、W・KW・MWなどのワード、単位省略時のGINOブロックを区別します。1ブロックはBUFFSIZE−1ワードです。BUFFSIZE=8193で1ワード8バイトの環境なら、1ブロックは8192×8＝65,536バイトです。</li>
<li>BUFFSIZEを大きくするとI/O回数を減らせる場合がありますが、同じブロック数でも物理容量は増え、実行管理用のメモリも増えます。変更前後でI/O時間とF04のUser OPENCORE（HICORE）を比較し、機種ごとの上限と実際のメモリ割当を確認します。<code>mem=estimate</code>は必要メモリを見積もる入口です。</li>
</ol>
<details><summary>診断結果に合わせて設定を変える</summary>
<p><strong>DBの上限に達した場合</strong>　保存したジョブでDBALLだけが不足したなら、再計算で割当を増やすか、再開できる版がある場合はメンバー追加を検討します。保存が不要なジョブでSCRATCHが不足したなら、永続DBALLだけの上限を増やす設定は目的に合わない場合があります。F06のメッセージにあるDBset名を先に確認します。</p>
<p><strong>容量を分割する例</strong>　例えば論理名をDBA・DBBとし、ASSIGNで二つの異なる場所のファイルに割り当てます。<code>INIT DBALL LOGICAL=(DBA(300MB),DBB(200MB))</code>なら、それぞれの上限をMBで指定します。実行後にアーカイブするときはMASTERと両メンバーをセットで扱います。</p>
<p><strong>ブロック数を見直す例</strong>　BUFFSIZEが8193から65537へ変わると、1ブロックのワード数は8192から65536になり8倍です。同じ物理容量をブロック単位で割り当て直すなら、例えば8000ブロック相当は1000ブロックになります。実行時メモリ全体と計算モジュールが利用できるメモリは別なので、F04で両方を照合します。</p>
</details>
<details><summary>単一・複数ドライブの割当例 I〜M</summary>
<div class="analysis-table-wrap" tabindex="0" role="region" aria-label="DB割当例IからM"><table class="analysis-reference-table">
<thead><tr><th scope="col">例</th><th scope="col">設定と物理ファイルの違い</th></tr></thead><tbody>
<tr><th scope="row">I · 単一、保存あり</th><td>scr=no。DBALLとMASTERを保存し、同時にSCRATCHとSCR300を既定の作業場所に確保します。ガイドではDBALLを30万ブロック、作業用を各20万ブロックに割り当てます。</td></tr>
<tr><th scope="row">J · 単一、保存なし</th><td>scr=yes。通常の永続ブロックも作業領域へ流れます。通常SCRATCHとモジュール用SCR300を見積もり、完了後に一時DBは削除されます。</td></tr>
<tr><th scope="row">K · 複数、保存あり</th><td>DBALL1は作業ディレクトリに200,000 KB、DBALL2は第2ドライブに100,000 KB。通常SCRATCHは既定場所と第3ドライブに各100,000ブロック。SCR300は既定場所に150,000、第4ドライブに50,000ブロックです。MASTERとDBALLの両メンバーを残します。</td></tr>
<tr><th scope="row">L · 複数、保存なし</th><td>ガイドの掲載入力ではKと同じ論理メンバーと容量を指定し、起動オプションをscr=yesに変えます。永続データが通常SCRATCHへ流れるため、ガイド本文は通常SCRATCHを増やし、DBALL側を減らす調整を示しています。実際の不足分に合わせて配分し、再開用のDBは残りません。</td></tr>
<tr><th scope="row">M · BUFFSIZE変更</th><td>Iと同等の物理割当に合わせ、1ブロックを8倍にする場合はブロック数を1/8にします。DBALL 30万→37,500、通常SCRATCHとSCR300は各20万→25,000です。</td></tr>
</tbody></table></div>
<p>INITは論理メンバーと上限、ASSIGNは個別の物理パスを決めます。分割先の空き容量と書き込み権限を確認し、保存ありの実行はMASTERが参照する全物理ファイルを管理します。</p>
</details>
<details><summary>FORTRAN入出力ファイルのASSIGN</summary>
<p>DBsetのメンバー名を割り当てる形式とは別に、FORTRAN入出力では機能のキーワードを使って物理ファイルを指定します。例えば <code>ASSIGN OUTPUT2='results.op2',STATUS=NEW,UNIT=11,FORM=UNFORMATTED</code> は、装置番号11のバイナリOUTPUT2を指定する書式例です。割り当てるだけで結果出力が始まるわけではないため、出力処理側の装置番号も揃えます。</p>
<dl><dt><strong>論理キーワード</strong></dt><dd>OUTPUT2・OUTPUT4、INPUTT2・INPUTT4、DBUNLOAD・DBLOAD、DBC・DBMIG、USERFILEなど、行う処理で選びます。利用できる装置番号と既定のSTATUSはキーワードごとに確認します。</dd><dt><strong>STATUSとUNIT</strong></dt><dd>NEWは新規、OLDは既存のファイルを指定します。UNITは処理が利用するFORTRAN装置番号です。</dd><dt><strong>FORMとDELETE</strong></dt><dd>FORMATTEDはテキスト形式で、OUTPUT2では圧縮ASCIIです。UNFORMATTEDはバイナリです。DELETEは既存ファイルを実行前に消去する指定です。再開元や残すべきファイルには使わないよう、パスを確認します。</dd></dl>
${verificationReferences([[87,'ASSIGN']])}
</details>
<details><summary>BUFFSIZEと計算モジュールが使えるメモリ</summary>
<p>ブロック容量は <code>ブロック数 × (BUFFSIZE − 1) × 1ワードのバイト数</code> です。初回保存と再開で同じBUFFSIZEを使います。</p>
<p>第15章の式(15-2)は、既定のSCRATCH(MEM)とBUFFERPOOLを仮定した目安です。全量を同じワード単位にそろえると、<code>User OPENCORE ≈ mem − 150 × BUFFSIZE − 500 KW</code> です。例えばBUFFSIZEを8193から65537へ増やすと、同じmemでも計算モジュールに残る量は約860万ワード減ります。1ワード8バイトなら約68.8 MBです。実際の割当はF04のメモリ要約で確認します。</p>
</details>
<div class="analysis-links"><a href="analysis.html#restart">保存したDBから再開する →</a><a href="workflow.html#files">入力・出力ファイルの見方 →</a><a href="${linearStaticGuide2024}#page=547" target="_blank" rel="noopener">MSC 2024.1 第15章 · データベース管理 ↗</a><a href="${linearStaticGuide2024}#page=550" target="_blank" rel="noopener">FMSの文と設定例 ↗</a><a href="${linearStaticGuide2024}#page=556" target="_blank" rel="noopener">大規模モデルとBUFFSIZE ↗</a></div></section>

<section class="analysis-section" id="analysis-common-model-verification">
<h2>モデル検証</h2>
<p>まず、何を評価するか、期待する変形方向、手計算や試験で比較できる量を決めます。以下は線形静解析の確認手順です。評価量は先端の変位、支点の反力、特定断面の応力など、位置と成分まで決めて記録します。</p>
<h3>1. 解析前に結合・断面・単位を見る</h3>
<ul>
<li><strong>接続</strong>　自由エッジ・自由面を表示し、本来つながる境界でメッシュが切れていないか確認します。非表示面や要素を少し縮めた表示も使います。画面上で同じ位置に見える節点でも、IDが別なら共有節点ではありません。接触や継手として分離する境界は、その接続定義を確認します。</li>
<li><strong>重なりと交互接続</strong>　陰影表示と隠線表示を切り替え、裏側の面や意図しない重なりを確認します。自由エッジが接続境界に沿って断続的に現れる場合は、見かけの連続線に沿って節点番号を追い、接続済みと未接続の節点が交互になる状態（zipper effect）を探します。重複要素も別途確認します。</li>
<li><strong>向きと割当</strong>　梁の断面軸とオフセット、シェルの法線と板厚、材料・物性の割当を表示します。隣り合う面で圧力矢印が逆を向くときは、要素節点順と荷重の定義を照合します。</li>
<li><strong>単位と質量</strong>　長さ、荷重、弾性係数、密度の単位を揃えます。質量が効く解析では <a href="bulk.html#PARAM_GRDPNT">PARAM,GRDPNT</a> の質量特性を、概算の体積×密度や付加質量、想定した重心と比較します。</li>
</ul>
<h3>2. F06と変形図で、支持と荷重を点検する</h3>
<p>F06の警告、要素形状チェック（GEOMCHECK）、Grid Point Singularity Tableを読みます。AUTOSPCの成分が意図した未使用自由度か、接続漏れなどで剛性を失った成分かを区別します。節点単体の特異性と、複数の節点が一緒に動く機構は別々に調べます。変形図は未変形形状と重ね、倍率と変位ベクトルを確認します。</p>
<p><a href="bulk.html#CASE_OLOAD">OLOAD</a>と<a href="bulk.html#CASE_SPCFORCES">SPCFORCES</a>で、同じ座標系・同じ基準点の力とモーメントを照合します。合計が釣り合っていても反力が予想外の支点へ集中する場合は、過拘束や結合範囲を見直します。局所的な荷重経路は<a href="bulk.html#CASE_GPFORCE">GPFORCE</a>で、接続要素ごとの力と外力・拘束力の寄与を追います。</p>
<h3>3. 手計算とひずみエネルギーを照合する</h3>
<p>たとえば長さ500 mmの片持ち梁の先端に下向き100 Nを加えると、根元には上向き100 Nと、外荷重のモーメントに逆らう50,000 N·mmの反力モーメントが必要です。変位の向きとたわみの大きさは、釣合いと別に確認します。</p>
<p><a href="bulk.html#CASE_ESE">ESE</a>で要素ごとのひずみエネルギーを確認すると、どこが荷重を受けて変形しているかを追えます。線形でゼロから比例載荷したこの例で、荷重点が力と同じ向きに0.5 mm動いた場合、系のひずみエネルギーは½×100×0.5＝25 N·mmです。一定断面の片持ち梁では曲げモーメントが根元に近いほど大きく、根元側の要素で曲げによるエネルギーが大きくなると予想できます。温度荷重や強制伸びがあるときは、出力の定義と仕事に含める項を個別に確認します。ガイドには線形要素にも非線形要素側のひずみエネルギー定義を使うPARAM,XFLAG,2の説明があります。</p>
<h3>4. 応力の評価位置とメッシュ依存性を見る</h3>
<p>対象のSUBCASE、座標、板の表裏、要素中心・隅節点・平均節点のどこを読むかを揃えます。平均化したコンターと平均化前の要素応力を見比べます。形状・荷重・拘束を固定して分割を変え、同じ物理位置の値が安定するか確認します。荷重点や理想固定端の角で最大応力だけが増え続ける場合は、特異性や荷重の与え方を確認します。</p>
<p>応力不連続の推定値は、同じ領域の隣接要素の応力のばらつきを調べる指標です。材料境界や段差では物理的に応力が変わり得るため、値だけでメッシュの良否を決めず、境界を分けて評価します。</p>
<h3>症状に応じて追加する診断</h3>
<details><summary>GEOMCHECKの要素別判定条件と既定値</summary>
<p>GEOMCHECKはExecutive Controlに置きます。任意の品質検査にはしきい値と重大度を設定できます。零長の梁など、要素行列を作れない形状は必須検査の対象です。まずSUMMARYで件数と代表的な違反を確認し、個別出力では要素番号と検査項目を確認します。</p>
<div class="analysis-table-wrap" tabindex="0" role="region" aria-label="GEOMCHECKの要素別判定"><table class="analysis-reference-table">
<thead><tr><th scope="col">要素</th><th scope="col">判定と2025.1 QRGの既定値</th></tr></thead><tbody>
<tr><th scope="row">CBAR／CBEAM</th><td>BAR_OFF／BEAM_OFFは、端部オフセットを入れたことによる長さの相対変化を確認します。15%を超えると違反です。</td></tr>
<tr><th scope="row">CQUAD4／CQUADR</th><td>Q4_SKEWは向かい合う辺の中点を結んだ2線の鋭角が30°未満で違反。四隅の内角はQ4_IAMIN 30°〜Q4_IAMAX 150°。Q4_TAPERは各隅の三角形面積 Aᵢ と総面積 A を使った最大偏差 max|2Aᵢ/A−1| が0.50を超えると違反。Q4_WARPは平均面からの反り係数 H/[2(D₁+D₂)] が0.05を超えると違反です。</td></tr>
<tr><th scope="row">CTRIA3／CTRIAR</th><td>T3_SKEWは三角形のスキュー角が10°未満、T3_IAMAXは最大内角が160°超で違反です。四辺形のテーパや反りの検査は適用されません。</td></tr>
<tr><th scope="row">CHEXA</th><td>HEX_AR 100、HEX_EPLR 0.50、HEX_EPIA 150°、HEX_DETJ 0、HEX_WARP 0.707。細長さ、中間節点の位置、積分点のヤコビアン、四辺形面の反りを検査します。</td></tr>
<tr><th scope="row">CPENTA</th><td>PEN_AR 100、PEN_EPLR 0.50、PEN_EPIA 150°、PEN_DETJ 0、PEN_WARP 0.707。反りを調べるのは四辺形の側面です。</td></tr>
<tr><th scope="row">CPYRAM</th><td>PYR_AR 100、PYR_EPLR 0.50、PYR_EPIA 150°、PYR_DETJ 0、PYR_WARP 0.707。反りを調べるのは四辺形の底面です。中間節点の長さ比の綴りは2025.1 QRGのPYR_EPLRを使用しています。</td></tr>
<tr><th scope="row">CTETRA</th><td>TET_AR 100、TET_EPLR 0.50、TET_EPIA 150°、TET_DETJ 0、TET_DETG 0。DETGは頂点でのヤコビアンを調べます。四辺形面の反りは対象外です。</td></tr>
</tbody></table></div>
<p>ソリッドのARは長い辺・高さと短い辺・高さの比を点検します。EPLRとEPIAは中間節点がある場合の検査で、節点が端へ寄る、または本来の辺から外れる状態を調べます。DETJは積分点での座標変換の退化や符号変化を調べます。HEX／PEN／PYRの面反りはソリッド側の係数で判定します。シェルのQ4_WARPと大小の向きを混同せず、F06に印刷される係数と限界値を照合します。</p>
<p>MSGTYPEはINFORM・WARN・FATALから選びます。MSGLIMITはQRG上、要素タイプごとのメッセージ数の下限指定です。SUMMARYは集計のみ、NONEは任意検査を解除し、ADVNLELMは対応する高度非線形要素も含めます。例えばスキュー角が25°の四辺形は既定30°では違反です。形状を直すか判断する前に、しきい値を変えて違反を消すだけの操作に注意します。</p>
${verificationReferences([[170,'GEOMCHECK']])}
</details>
<details><summary>MAXMINの従来形式と定義形式</summary>
<h4>従来形式 · 既に要求した節点結果から抜き出す</h4>
<p>MAX・MIN・BOTHは符号付きの上位・下位を選び、各件数の既定は5です。VMAGは並進と回転の各ベクトルの大きさを求め、T1・R1欄に出します。VMAGを使う場合はCOMPが効きません。DISP・SPCF・OLOAD・MPCF・VELO・ACCEを選び、対応する通常の出力要求も置きます。PRINTはF06、PUNCHはPCHを選びます。COMPはT1〜T3・R1〜R3、CIDはGLOBAL・BASIC・任意CID、対象はALL・SET番号・NONEから選びます。スカラー点はT1を選んだ場合に対象になります。</p>
<p>例えば変位を要求したうえで <code>MAXMIN(BOTH=3,DISP,CID=BASIC,COMP=T2)=42</code> とすると、SET 42の節点から基本座標のT2を順に選びます。共通部に置けば各ケースへ、個別のSUBCASE内に置けばそのケースへ適用します。順位を付けた成分と併記された他の成分を区別し、出力座標と比較座標が異なるときの2行表示にも注意します。</p>
<h4>定義形式 · 監視する量と対象を別々に指定する</h4>
<p>すべてのSUBCASEより前にMAXMIN(DEF)で監視量を指定し、各SUBCASEのMAXMIN(GRID)／MAXMIN(ELEM)などで対象集合を選びます。節点は変位・速度・加速度・荷重・SPC／MPC力の成分や並進／回転の大きさ、要素はSTRESS・STRAIN・FORCEの要素名と成分を選びます。ABSOLUTE、MINALG、MAXALG、ALLで順位と件数を、RMSで二乗平均平方根、BRIEF／FULLで極値の要約だけか関連する全成分も残すかを選びます。時間応答はOTIMEで監視範囲を絞れます。</p>
<p>選択側はGRID・ELEM・BOTH、PRINT・PUNCH・NOPRINT、ALL・SET番号・NONEを確認します。シェルではCENTER、CORNER／BILIN、SGAGE、CUBICや、VONMISES・SHEAR・STRCUR・FIBERが評価位置や結果量に関係します。通常の出力要求は定義形式では原則不要ですが、ひずみはSTRAINが必要で、表裏のひずみではSTRAIN(FIBER)も確認します。REPCASEでは使用できません。SUBCOM・SYMCOMでは使用できます。</p>
<p>例として <code>MAXMIN(DEF) DISP T2 MINALG(3) MAXALG(3) BRIEF</code> と、対象ケースの <code>MAXMIN(GRID)=42</code> を組み合わせます。要素応力を比較するときは、要素型ごとの成分名、板の表裏と評価位置、座標、符号付き極値か絶対値かを先に揃えます。</p>
${verificationReferences([[490,'MAXMIN（従来形式）'],[492,'MAXMIN（対象選択）'],[494,'MAXMIN(DEF)（監視量の定義）']])}
</details>
<details><summary>要素の仕様・形状・質量を診断する</summary>
<dl>
<dt><strong>ELSUM</strong></dt><dd>要素やプロパティの単位で長さ・面積・体積、構造質量、非構造質量、合計質量を照合します。予想より質量が重い領域では、重複要素、密度、板厚、付加質量を分けて確認します。</dd>
<dt><strong>GEOMCHECK</strong></dt><dd>要素の種類に応じて、細長さ、角度、反り、ヤコビアンなどを確認します。例えば四面体でヤコビアンがゼロまたは符号が変わる場合は座標変換の退化を疑います。対象要素と判定項目を読み、形状異常を直してから再計算します。</dd>
<dt><strong>MODEL_CHECK</strong></dt><dd>Executive ControlとNASTRAN文のDEF系設定で密度や熱膨張係数を試験用に一時変更します。例えば材料密度の寄与を抑え、集中質量や非構造質量だけの重量を確認します。結果は試験用の物性値で計算されます。保存された元の材料定義と区別します。</dd>
<dt><strong>WEIGHTCHECK／GRDPNT</strong></dt><dd>Grid Point Weight Generatorで総質量、重心、慣性を読みます。SOL 101のWEIGHTCHECKはG集合が対象です。GRDPNT=0なら基本座標の原点、節点IDを与えればその節点が基準になります。慣性を比較するときは軸と基準点も揃えます。</dd>
<dt><strong>機構と数値的な悪条件</strong></dt><dd>局所的な自由度の不足はGPSP、広域の機構は剛性行列の分解時にも現れます。SPARSESOLVERの対角項比の診断では並進と回転を分け、対象節点と成分を追います。支持の不足、剛性の極端な差、接続漏れを切り分けます。</dd>
</dl>
${verificationReferences([[344,'ELSUM'],[170,'GEOMCHECK'],[182,'MODEL_CHECK'],[708,'WEIGHTCHECK'],[200,'SPARSESOLVER']])}
</details>
<details><summary>1g・剛体移動・熱膨張でモデルを試す</summary>
<p><strong>1g荷重</strong>　質量が定義された点検用ケースで、直交3方向にそれぞれ重力加速度を1方向ずつ与えます。不自然に大きく動く部品を探し、質量・支持・結合を確認します。合力の目安は総質量×gです。</p>
<p><strong>自由な並進</strong>　点検用コピーで意図した支持を外し、剛体回転を止められる点に単位並進を与えます。自由な部分が同じ向きに同じ量だけ動くかを3方向で比較します。変形した領域は地面への誤った接続、剛体要素、梁オフセット、ばね方向を調べます。</p>
<p><strong><a href="bulk.html#CASE_GROUNDCHECK">GROUNDCHECK</a></strong>　剛体並進3方向と回転3方向に対して剛性行列が抵抗を作るかを、ひずみエネルギーで判定します。GはSPC・MPC・剛体要素を適用する前、NはMPC・剛体要素を適用した後、N+AUTOは自動拘束を反映した状態、FはSPCも適用した後、Aは縮約後です。どの段階で意図しない抵抗が生じたかを見ます。DATARECで抵抗力の分布を出し、THRESHは合否に使うエネルギーのしきい値、RTHRESHは力の出力範囲に関係します。支持を意図した段階では、期待する抵抗と結果を照合します。</p>
<p><strong>自由熱膨張</strong>　点検用コピーで材料の熱膨張係数を揃え、一様な温度差を与え、剛体運動だけを除く支持に変更します。正常なら熱ひずみで伸びても、拘束反力・応力はほぼゼロです。ソリッドだけのモデルでは1節点の並進拘束だけで剛体回転は止まりません。試験後は元の支持・物性・温度条件へ戻します。</p>
</details>
<details><summary>釣合い・極値・応力誤差の出力を読む</summary>
<p><strong><a href="bulk.html#CASE_EQUILIBRIUM">EQUILIBRIUM</a></strong>　外荷重、SPC反力、MPC反力などの合力・合モーメントを共通の軸と基準点に換算して集計します。例えば外力が下向き100 Nで上向き反力が99.8 Nなら残差は下向き0.2 Nです。力とモーメントを別々に評価し、比較対象の桁やモデルの大きさに照らして残差の意味を判断します。OLOAD RESULTANTにスカラー点の荷重が含まれない点にも注意します。</p>
<p><strong>MAXMIN</strong>　レビューに必要な成分と対象集合を指定して、上位・下位の値と発生位置を抽出します。従来形式は節点変位などの成分の順位を確認するために使えます。新しい定義形式で要素結果を調べるときは、評価成分、SUBCASE、座標、シェルの表裏、通常出力も残すFULLの要否を揃えます。</p>
<p><strong>応力不連続</strong>　要素の応力を共通座標の同じ節点へそろえ、平均応力と各要素の寄与との差を求めます。例えば寄与が90 MPaと110 MPaなら単純平均100 MPaに対し、それぞれ−10 MPaと＋10 MPaです。節点側は周囲の要素間のばらつき、要素側は複数の隅節点での差を二乗平均平方根などで集計した値から見ます。</p>
<p>出力はOUTPUT(POST)でSURFACEまたはVOLUMEを定義して対象のSTRESSを要求し、STRFIELDを選びます。節点応力の印刷にはGPSTRESS、節点と要素の不連続の要求にはそれぞれGPSDCONとELSDCONを確認します。要素中心だけから外挿した値と隅節点応力を使った値では指標が違います。境界の物理的な応力差を分け、メッシュ変更前後を同じ条件で比較します。</p>
${verificationReferences([[490,'MAXMIN（従来形式）'],[492,'MAXMIN（定義形式）'],[657,'STRFIELD'],[452,'GPSTRESS']])}
</details>
<details><summary>モニター点で断面荷重や応答を追う</summary>
<p>MONITORは全SUBCASEに共通する印刷制御で、先頭SUBCASE以前またはその中に置きます。MONPNT1は指定領域の積分荷重、MONPNT2は指定要素の応力・ひずみ・力などの成分、MONPNT3は節点力の合計、MONDSP1は変位の集計を扱います。MONPNT1の領域はCOMPからAECOMPを経由して構造節点の集合を追います。線形の成分で照合し、ミーゼス応力のような合成量を線形に加算しません。</p>
<p>MONSUMは重み付きの数値合成、MONSUM1は出力位置と座標を定義した合成、MONSUMTは腕の長さによるモーメント移送も含む合成です。位置を移すときは M新＝M旧＋(r旧−r新)×F を確認します。例えば力100 Nの基準位置を力の作用線から垂直に50 mm移せば、モーメントの差の大きさは5,000 N·mmです。出力のSUBCASE、軸、集計範囲、基準点を確認します。</p>
${verificationReferences([[527,'MONITOR']])}
</details>
<div class="analysis-links"><a href="analysis.html#node-element-check">節点・要素の結果の確認 →</a><a href="analysis.html#load-check">荷重と反力の入力を照合 →</a><a href="analysis.html#constraint-check">支持とAUTOSPCを確認 →</a><a href="modeling.html#model-mesh-transition">メッシュ境界と節点応力 →</a><a href="workflow.html#results">F06の結果表を読む →</a></div>
<div class="analysis-links"><a href="${linearStaticGuide2024}#page=385" target="_blank" rel="noopener">MSC 2024.1 第10章・モデル検証 ↗</a><a href="${linearStaticGuide2024}#page=394" target="_blank" rel="noopener">ひずみエネルギー ↗</a><a href="${linearStaticGuide2024}#page=398" target="_blank" rel="noopener">モデルの診断ツール ↗</a><a href="${linearStaticGuide2024}#page=418" target="_blank" rel="noopener">荷重・反力・釣合い ↗</a><a href="${linearStaticGuide2024}#page=436" target="_blank" rel="noopener">応力誤差の指標 ↗</a></div>
</section>

<section class="analysis-section" id="analysis-common-node-element-check"><h2>節点・要素の結果が想定と違うとき</h2>
<dl>
<dt><strong>拘束したはずの向きに動く</strong></dt><dd>まず結果の節点番号とSUBCASEを確認します。<a href="bulk.html#GRID">GRID</a>のCPは節点位置を決め、CDは変位・拘束の成分方向を決めます。位置が正しければ、CDと<a href="bulk.html#CASE_SPC">Case ControlのSPC</a>で選んだセットを確認します。</dd>
<dt><strong>ばねの変位・力の符号が合わない</strong></dt><dd><a href="bulk.html#CASE_DISPLACEMENT">DISPLACEMENT</a>の出力対象に点番号を含めます。SPOINTの値は接続カードの点番号から追います。ばね力は接続端の順と、各端の選択成分を照合します。</dd>
<dt><strong>梁の曲がり方やシェル表裏の応力が合わない</strong></dt><dd>梁は断面の向きに使ったベクトルと、読む断面の位置を確認します。シェルは節点順の法線、出力座標と応力評価位置を確認します。<a href="bulk.html#CASE_STRESS">STRESS</a>の結果は同じ位置・同じ軸で比較します。</dd>
</dl><div class="analysis-links"><a href="coordinates.html#points">節点・スカラー点の基本 →</a><a href="coordinates.html#elements">梁の方向ベクトル・シェルの法線 →</a><a href="elements.html#scalar-overview">各要素の選び方 →</a></div></section>
`;
// BEGIN THIRD PARTY NOTICES
window.AnalysisReferenceHTML += "<section class=\"analysis-section\" id=\"analysis-common-rights\"><h2>出典・利用条件</h2><p>本教材は非公式です。MSC Nastranの開発元による提供・認定・保証を示すものではありません。記載の製品名・商標は各権利者に帰属します。</p><h3>予荷重固有値モデル：SPAD</h3><p>予荷重固有値の解説が参照するSPADの配布条件は以下のMITライセンスです。</p><p><a href=\"https://github.com/zhaowei0566/SPAD/blob/7a5b6b7cec77511549bfa0bfca434b38b1b9bbec/LICENSE.txt\" target=\"_blank\" rel=\"noopener\">取得時点のライセンス</a></p><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere\">MIT License\n\nCopyright (c) [2018] [Stiffened Plate Anaysis and Design]\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the &quot;Software&quot;), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all\ncopies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\nSOFTWARE.\n</pre><p>この許諾文はSPAD由来の対象データに適用する表示です。他のマニュアル・教材・アプリ全体に同じ許諾を与えるものではありません。</p></section>";

window.AnalysisReferenceTopics = {
 'model-verification':'モデル検証',
 'restart':'リスタート',
 'database':'データベース管理',
 'material-check':'材料・積層の入力と結果',
 'constraint-check':'拘束の入力と反力',
 'load-check':'荷重の設定と確認',
 'contact-check':'接触状態の確認',
 'damping-check':'減衰設定の照合',
 'node-element-check':'節点・要素の結果の確認',
 'rights':'出典・利用条件'
};
