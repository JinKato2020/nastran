(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escape = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sources = {
    static: 'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide.pdf',
    qrg: 'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf'
  };
  $$('[data-source]').forEach(a => {a.href = sources[a.dataset.source] + '#page=' + a.dataset.page; a.target='_blank'; a.rel='noopener';});

  function route() {
    const id = location.hash.slice(1);
    if (id === 'sources') return;
    const selected = ['run','files','results'].includes(id) ? id : 'files';
    $$('.guide-panel').forEach(panel => {panel.hidden = panel.id !== selected;});
    $$('.guide-nav a').forEach(a => {
      if (a.hash === '#' + selected) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    });
    document.title = $('.guide-nav a[aria-current]').textContent.slice(2).trim() + ' — Nastran はじめの一歩';
    if (id === selected) requestAnimationFrame(() => document.getElementById(selected).scrollIntoView({block:'start'}));
  }
  addEventListener('hashchange', route);
  route();

  const files = [
    {id:'input',ext:'.bdf / .dat',short:'解析の入力',type:'テキスト',when:'自分で用意',title:'モデル・解析条件・出力要求を記述',body:'拡張子だけで解析の種類は決まりません。中身のSOL、Case Control、Bulk Dataで解析を定義します。本教材は.bdfを使い、同じ構成は.datでも記述できます。',open:'等幅フォントのテキストエディター、または対応プリプロセッサー。',check:'完全な入力ファイルか、INCLUDE用の部品かを区別。単位、区画、ID参照、空欄の位置を確認。'},
    {id:'f06',ext:'.f06',short:'主な結果と診断',type:'テキスト',when:'最初に読む',title:'計算結果とメッセージの主出力',body:'入力のエコー、診断メッセージ、出力要求に応じた変位・拘束反力・要素力・応力などが入ります。ファイルがあるだけでは、解析の完了やモデルの正しさは保証されません。',open:'テキストエディター。長い行は折り返しを切って読むと、表の列を追いやすくなります。',check:'今回のジョブとSUBCASE、FATAL / WARNING、終端、必要な結果表。出力の要求がない量は表に現れません。'},
    {id:'f04',ext:'.f04',short:'実行の詳細',type:'テキスト',when:'実行状況を調べる',title:'処理の履歴・ファイル・資源使用を確認',body:'解析で使われた処理モジュール、割り当てられたファイル、ディスク使用など、実行の詳細を追うためのファイルです。応力の値を読むときの入口はF06です。',open:'テキストエディター。',check:'どの処理まで進んだか、資源やファイル割り当てに関連する問題がないか。F06・LOGと合わせて確認。'},
    {id:'log',ext:'.log',short:'起動・実行情報',type:'テキスト',when:'起動や終了を調べる',title:'実行コマンドや処理のつながりを確認',body:'コマンドラインオプションや実行に関わる情報が記録されます。F06ができない場合も、LOGと起動時のメッセージが手掛かりになります。内容は実行環境によって異なります。',open:'テキストエディター、ジョブ管理画面。',check:'入力先・出力先、起動オプション、実行時の異常。LOGだけで解析結果の正しさを判定しない。'},
    {id:'op2',ext:'.op2',short:'結果の可視化用',type:'バイナリ',when:'出力指定時',title:'ポストプロセッサーへ渡す結果データ',body:'OUTPUT2形式のファイルです。変形図や応力コンターなどを表示するため、対応したポストプロセッサーで読み込みます。読める形式や結果の種類は利用ソフトの対応を確認します。',open:'MSC Patranなどの対応ポストプロセッサー。通常のテキストエディターでは数値表として読めません。',check:'この教材はBulkのPARAMでPOST = 1を追加します。Case Controlの結果要求も必要です。2020 SP1 QRGでは新しい結果向けにPOST = 1を案内しています。'},
    {id:'pch',ext:'.pch',short:'パンチ出力',type:'テキスト',when:'PUNCH要求時',title:'指定した結果をテキストで受け取る',body:'Case ControlでPUNCHを要求した結果などが入ります。後処理や数値の取り出しに使えますが、CSVとは異なる形式で、F06のページ付き表示とも構成が異なります。',open:'テキストエディター、対応した読込み処理。',check:'例えばDISPLACEMENT(PRINT,PUNCH) = ALLなら変位をF06とPCHの両方へ要求。括弧内のコンマはCase Controlの構文で、Bulkの区切りではありません。'},
    {id:'h5',ext:'.h5',short:'HDF5形式の結果',type:'バイナリ',when:'出力指定時',title:'構造化されたHDF5の結果データベース',body:'MSC NastranのHDF5形式のデータベースです。HDF5対応ツールや対応ポストプロセッサーで利用します。可視化できる結果は各ソフトの対応範囲に依存します。',open:'MSC NastranのHDF5結果に対応したポスト処理ツール。',check:'本教材はBulkのMDLPRMでHDF5 = 1（圧縮あり）を追加します。Case Controlで必要な結果を要求します。OP2と同時に生成する指定もできます。'},
    {id:'db',ext:'DBALL / MASTER',short:'再開用データベース',type:'バイナリ',when:'実行設定による',title:'再開解析に必要な計算データを保持',body:'DBALLは入力・組み立てられた行列・解など、MASTERは関連ファイルの管理情報を保持します。どちらか一方だけを結果表として読むファイルではありません。',open:'MSC Nastranのrestart機能などで使用。',check:'再開解析の予定があれば必要なデータベース一式を保管。実行オプションによって残らない場合があります。'},
    {id:'scratch',ext:'scratch files',short:'計算中の作業用',type:'主にバイナリ',when:'実行中に使用',title:'計算処理のための一時ファイル',body:'中間処理やディスク上の作業領域に使います。原典では通常、解析の完了時に自動削除される一時ファイルが説明されています。保存先・名前は実行環境やオプションで変わります。',open:'通常、結果確認のために直接開く必要はありません。',check:'容量不足や異常終了時はF04・LOGと実行設定を確認。実行中のファイルは変更せず、出力用データベースと区別して管理。'}
  ];
  $('#file-buttons').innerHTML = files.map(f => `<button type="button" data-file="${f.id}" aria-pressed="false"><strong>${escape(f.ext)}</strong><small>${f.short}</small></button>`).join('');
  function selectFile(id) {
    const f = files.find(f => f.id === id);
    $$('[data-file]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.file === id)));
    $('#file-detail').innerHTML = `<h3>${escape(f.ext)}</h3><div class="detail-badges"><span>${f.type}</span><span>${f.when}</span></div><p class="file-purpose">${f.title}</p><p>${f.body}</p><dl><dt>開き方</dt><dd>${f.open}</dd><dt>見るポイント</dt><dd>${f.check}</dd></dl>`;
  }
  $('#file-buttons').addEventListener('click', e => {const b=e.target.closest('[data-file]');if(b)selectFile(b.dataset.file);});
  selectFile('f06');

  const results = {
    displacement:{title:'変位 — 節点2はどれだけ伸びる？',command:'DISPLACEMENT = ALL',headers:['節点ID','T1 / X方向 [mm]','意味'],rows:[['1','0.','固定端'],['2','4.761905E-02','荷重端の軸方向変位']],explanation:'期待値はFL / EA = 1000 × 1000 / (210000 × 100) = 0.047619… mm。正のX方向へ伸びます。このモデルで拘束したT2・T3・R1・R2・R3は0です。',find:'F06のDISPLACEMENT VECTORの表を探します。見出しは文字の間に空白を入れて印字される場合があるため、検索で見つからなければ周辺の表も確認します。'},
    reaction:{title:'拘束反力 — 外力とつり合っている？',command:'SPCFORCES = ALL',headers:['節点ID','T1 / X方向 [N]','意味'],rows:[['1','-1.000000E+03','固定端の反力'],['2','0.','Xは自由なので反力なし']],explanation:'この軸方向のモデルでは、外力+1000 Nと固定端反力−1000 Nがつり合い、合計0 Nになります。一般のMPC・剛体要素を含むモデルでは、SPCFORCESだけで確認が完結するとは限りません。',find:'FORCES OF SINGLE-POINT CONSTRAINTの表で、節点1のT1を確認します。'},
    force:{title:'要素力 — 棒の中を伝わる軸力',command:'FORCE = ALL',headers:['要素ID','軸力 [N]','意味'],rows:[['100','1.000000E+03','引張りの軸力']],explanation:'この例の軸力は1000 N。外力と同じ大きさの引張力が棒を伝わります。Case ControlのFORCEは要素力の出力要求で、荷重の入力値を設定する命令ではありません。',find:'ROD ELEMENTS (CROD)に関する要素力の表で、ELEMENT ID 100のAXIAL FORCEを確認します。'},
    stress:{title:'応力 — 軸力を断面積で割る',command:'STRESS = ALL',headers:['要素ID','軸応力 [MPa]','意味'],rows:[['100','1.000000E+01','引張りの軸応力']],explanation:'期待値はF / A = 1000 / 100 = 10 MPa。今回読むのはCRODの軸応力です。シェルやソリッドのミーゼス応力、曲げ応力などと同じ表として扱わないでください。',find:'ROD ELEMENTS (CROD)に関する応力表で、ELEMENT ID 100のAXIAL STRESSを確認します。'}
  };
  function selectResult(id) {
    const r=results[id];
    $$('[data-result]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.result===id)));
    $('#result-detail').innerHTML=`<h3>${r.title}</h3><span class="output-command">${r.command}</span><div class="table-scroll"><table><caption class="visually-hidden">手計算による期待値・読み方の簡略表</caption><thead><tr>${r.headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${r.rows.map(row=>`<tr>${row.map((value,i)=>`<td${i===1?' class="expect-value"':''}>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p><strong>読む場所：</strong>${r.find}</p><p>${r.explanation}</p>`;
  }
  $('#result-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-result]');if(b)selectResult(b.dataset.result);});
  selectResult('displacement');
})();
