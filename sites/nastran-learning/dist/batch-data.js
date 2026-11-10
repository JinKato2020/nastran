/* Windows CMD teaching examples. This code builds text; it never runs a solver. */
(() => {
 'use strict';
 const defaults={launcher:'C:\\YOUR_NASTRAN\\bin\\YOUR_LAUNCHER.exe',input:'model.bdf',run:'trial01',method:'smp',smp:4,dmp:0,memory:4};
 function validate(c){
  const errors=[];
  if(!/^[A-Za-z]:\\[A-Za-z0-9 _().\\-]+\.exe$/i.test(c.launcher))errors.push('起動ファイルは、ドライブ名から始まる正規ランチャーの.exeのパスにしてください。この例では半角英数字・空白・_・-・.・()・\\を使えます。');
  if(!/^[A-Za-z0-9][A-Za-z0-9_. -]*\.(bdf|dat)$/i.test(c.input))errors.push('入力名は、同じフォルダに置く.bdfまたは.datのファイル名にしてください。パスや特殊な記号は入れません。');
  if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(c.run))errors.push('実行名は半角英数字・_・-で、先頭は英数字、32文字以内にしてください。');
  if(!['serial','smp','dmp','hybrid'].includes(c.method))errors.push('計算方式を選び直してください。');
  if(!Number.isInteger(c.smp)||c.smp<0||c.smp>64)errors.push('SMPは0〜64の整数にしてください。');
  if(!Number.isInteger(c.dmp)||c.dmp<0||c.dmp>32)errors.push('DMPは0〜32の整数にしてください。');
  if(['smp','hybrid'].includes(c.method)&&c.smp<1)errors.push('SMPを使う方式では1以上を指定してください。');
  if(['dmp','hybrid'].includes(c.method)&&c.dmp<2)errors.push('この教材でDMPを使う例は2タスク以上にしてください。');
  if(!Number.isInteger(c.memory)||c.memory<1||c.memory>256)errors.push('メモリ予算は1〜256 GBの整数にしてください。');
  return errors;
 }
 function counts(c){return {smp:c.method==='serial'||c.method==='dmp'?0:c.smp,dmp:c.method==='dmp'||c.method==='hybrid'?c.dmp:0};}
 function make(c={...defaults}){
  const errors=validate(c);if(errors.length)throw new Error(errors.join('\n'));
  const n=counts(c),files={};
  const begin=()=>[];
  const add=(rows,text,why)=>rows.push({text,why});
  const setup=(r,runSuffix)=>{
   add(r,'@echo off','バッチの命令文そのものを1行ずつ画面へ表示する動作を止めます。計算を止める命令ではありません。');
   add(r,'setlocal EnableExtensions DisableDelayedExpansion','ここで設定した変数を、このバッチの中だけで有効にします。通常のCMD拡張を有効にし、!を変数として読み直す機能は使いません。');
   add(r,`set "NASTRAN=${c.launcher}"`,'最初に書き換える場所です。インストール済みの正規の起動用.exeを指定します。内部のanalysis.exeを直接指定しません。初期表示のYOUR_NASTRANやYOUR_LAUNCHERは、実際の名前に置き換えるための仮の名前です。');
   add(r,`set "INPUT=${c.input}"`,'解析する入力ファイル名です。単独実行ではバッチと同じ場所、複数実行ではcase_A/case_Bの各フォルダにこの名前の入力を置きます。');
   add(r,`set "SMP=${n.smp}"`,'1プロセス内の共有メモリ並列の設定です。0はSMPなし。1は並列用の計算法を1プロセッサで使う設定なので、0とは区別します。');
   add(r,`set "DMP=${n.dmp}"`,'1件の解析で使うDMPタスク数です。0ならDMPを使いません。2件の別モデルを起動する数とは違います。');
   add(r,`set "MEMORY_GB=${c.memory}"`,'memory=maxと組み合わせる、1ジョブ当たりのmemorymax予算です。OSで見えるメモリ使用量全体を厳密にこの値以下へ固定する設定ではありません。');
   add(r,`set "RUN_DIR=%~dp0runs\\${c.run}_${runSuffix}"`,'%~dp0は、このバッチ自身があるドライブとフォルダです。その下のrunsに今回専用の結果フォルダを作ります。再実行するときは実行名を変えます。');
   add(r,'if not exist "%NASTRAN%" goto missing_launcher','指定した起動ファイルがなければ、計算を始めず説明用のエラー表示へ移動します。');
   add(r,'if exist "%RUN_DIR%" goto existing_run','同名の結果フォルダがあれば中断します。以前の結果や終了記録を今回のものと取り違えないためです。');
  };
  const footer=r=>{
   add(r,':missing_launcher','起動ファイルが見つからない場合の行先です。コロンで始まる行はラベルで、Nastranへの命令ではありません。');
   add(r,'echo ERROR: Set NASTRAN to the installed launcher .exe.','最初のNASTRAN設定を直すよう画面に表示します。');
   add(r,'exit /b 2','このバッチを終了し、呼び出した側へ2を返します。ここでの2は教材側の準備エラー番号です。');
   add(r,':existing_run','今回の結果フォルダが既にある場合の行先です。');
   add(r,'echo ERROR: Run folder exists. Use a new run name.','別の実行名にするよう表示します。以前のフォルダを自動削除しません。');
   add(r,'exit /b 3','既存フォルダとの衝突を、教材側の番号3で知らせます。');
   add(r,':missing_input','入力または補助ファイルが足りない場合の行先です。');
   add(r,'echo ERROR: Check the input file and run_worker.bat if used.','入力ファイル名と、複数実行で使う補助バッチを確認するよう表示します。');
   add(r,'exit /b 4','必要ファイル不足を、教材側の番号4で知らせます。');
   add(r,':folder_error','フォルダの作成や移動ができなかった場合の行先です。');
   add(r,'echo ERROR: Could not create or enter the working folder.','保存場所の権限や空き容量、パスを確認するよう表示します。');
   add(r,'exit /b 5','フォルダ操作の問題を、教材側の番号5で知らせます。');
  };
  let r=begin();setup(r,'single');
  add(r,'if not exist "%~dp0%INPUT%" goto missing_input','単独実行では、バッチと同じフォルダに入力ファイルが必要です。');
  add(r,'mkdir "%RUN_DIR%\\scratch"','今回の結果フォルダと、その下の一時作業用scratchフォルダを作ります。');
  add(r,'if errorlevel 1 goto folder_error','直前の操作の終了コードが1以上なら、フォルダ操作のエラーへ進みます。1と等しいかだけの判定ではありません。');
  add(r,'pushd "%~dp0"','元の作業場所を覚え、バッチがあるフォルダへ移動します。相対パスの入力やINCLUDEは、配置に応じて確認してください。');
  add(r,'if errorlevel 1 goto folder_error','移動できなければ計算を始めません。');
  const command='"%NASTRAN%" "%INPUT%" smp=%SMP% dmp=%DMP% memory=max memorymax=%MEMORY_GB%gb pause=no scratch=yes "out=%RUN_DIR%\\model" "sdir=%RUN_DIR%\\scratch" > "%RUN_DIR%\\console.txt" 2>&1';
  add(r,command,'ここでNastranを実行します。公式のWindows起動は前景実行なので、通常の直接呼出しは戻るまで次の行へ進みません。outは出力名、sdirは一時作業場所。画面出力とエラー出力をconsole.txtへ保存します。');
  add(r,'set "RC=%ERRORLEVEL%"','Nastranの呼出しが戻った直後の終了コードを保存します。後の命令で変わる前に記録するためです。');
  add(r,'> "%RUN_DIR%\\launcher_exit.txt" echo %RC%','呼出しが終わった記録として、終了コードをファイルへ保存します。0でも解析結果の妥当性を保証しません。');
  add(r,'popd','pushdする前のフォルダへ戻ります。');
  add(r,'echo Launcher returned %RC%. Check model.f06, model.log and console.txt.','戻り値を表示し、F06・LOG・画面ログの確認を促します。「解析成功」と自動判定する表示ではありません。');
  add(r,'exit /b %RC%','保存した戻り値を呼び出し元へ返して、このバッチを終えます。');footer(r);files['run_single.bat']=r;
  for(const concurrent of [false,true]){
   r=begin();setup(r,concurrent?'two':'sequence');
   add(r,'if not exist "%~dp0run_worker.bat" goto missing_input','1件ずつ実行する共通の補助バッチが、同じ場所にあるか確認します。');
   for(const job of ['case_A','case_B'])add(r,`if not exist "%~dp0${job}\\%INPUT%" goto missing_input`,`${job}の入力を、起動前に確認します。2件のファイルは別フォルダに置き、INCLUDE先も各モデルの構成を保ちます。`);
   for(const job of ['case_A','case_B']){
    add(r,`mkdir "%RUN_DIR%\\${job}\\scratch"`,`${job}専用の結果・scratchフォルダを作ります。もう一方と同じ出力先にしません。`);
    add(r,'if errorlevel 1 goto folder_error','フォルダを作れなければ、ジョブを起動しません。');
   }
   for(const job of ['case_A','case_B']){
    if(concurrent){
     add(r,`start "" /b "%ComSpec%" /d /s /c ""%~dp0run_worker.bat" "${job}" "%RUN_DIR%\\${job}""`,`別のCMDで${job}を起動し、親は待たず次へ進みます。最初の""はウィンドウタイトル。/bは新しいウィンドウを開かない指定。%ComSpec%はcmd.exeです。この例は2件だけを起動します。`);
     add(r,'if errorlevel 1 goto launch_error','Windows側の起動要求が失敗した場合の判定です。解析途中の失敗をここで検出するわけではありません。既に起動した相手のジョブは自動停止しません。');
    }else{
     add(r,`call "%~dp0run_worker.bat" "${job}" "%RUN_DIR%\\${job}"`,`補助バッチで${job}を実行し、戻るのを待ちます。別の.batから戻るためにcallを付けています。call自体はNastranのオプションではありません。`);
     add(r,'if not "%ERRORLEVEL%"=="0" goto child_error','呼出しが0以外で戻った場合は、次のジョブを始めず中断します。ただし0で戻った場合にもF06の確認は必要です。');
    }
   }
   add(r,concurrent?'echo Two launch requests sent. This is NOT a completion message.':'echo Both launcher calls returned. Check both F06 and LOG files.',concurrent?'親バッチはここで戻ります。2件の解析が終わったという意味ではありません。各結果フォルダのlauncher_exit.txtとF06/LOGを確認します。':'2件の呼出しが戻ったことを表示します。結果が正しいことまでは自動判定しません。');
   add(r,'exit /b 0',concurrent?'親は「2件の起動要求を出せた」という意味で0を返します。2件の解析結果の終了コードではありません。':'親バッチを終了します。実際の戻り値の記録は各ジョブのlauncher_exit.txtにも残ります。');
   add(r,concurrent?':launch_error':':child_error','途中の起動・呼出しに問題があった場合の行先です。');
   add(r,'echo ERROR: A job launch or call failed. Inspect each result folder.','どちらのジョブで止まったか、それぞれのログを確認します。');
   add(r,'exit /b 6','親バッチのまとめ用エラー番号6を返します。子の元の終了コードは個別の記録で確認します。');footer(r);
   files[concurrent?'run_two_parallel.bat':'run_in_order.bat']=r;
  }
  r=begin();
  add(r,'@echo off','補助バッチの命令文の表示を止めます。');
  add(r,'setlocal EnableExtensions DisableDelayedExpansion','子の作業用変数が、呼出し元の設定を変えないようにします。親で設定したNASTRANなどの値は受け取れます。');
  add(r,'set "CASE_NAME=%~1"','最初の引数をケースのフォルダ名として受け取ります。%~1は第1引数の外側の引用符を外した値です。');
  add(r,'set "OUT_DIR=%~2"','2番目の引数を、今回の結果フォルダとして受け取ります。');
  add(r,'if not defined NASTRAN goto bad_worker','この補助ファイルだけをダブルクリックしても、親の起動設定がなければ実行しません。');
  add(r,'if not defined INPUT goto bad_worker','親で指定した入力名が必要です。');
  add(r,'if not defined OUT_DIR goto bad_worker','出力先が未指定なら実行しません。');
  add(r,'if not exist "%OUT_DIR%\\scratch\\" goto bad_worker','親が作った専用の作業フォルダを確認します。');
  add(r,'if /i not "%CASE_NAME%"=="case_A" if /i not "%CASE_NAME%"=="case_B" goto bad_worker','この教材はcase_Aかcase_Bの2件を対象にします。/iは英字の大文字・小文字を区別しない比較です。');
  add(r,'pushd "%~dp0%CASE_NAME%"','入力があるケースのフォルダへ移動します。入力とINCLUDEの関連ファイルを、元の構成のまま使います。');
  add(r,'if errorlevel 1 goto bad_worker','移動できなければ、起動準備のエラーへ進みます。');
  add(r,'"%NASTRAN%" "%INPUT%" smp=%SMP% dmp=%DMP% memory=max memorymax=%MEMORY_GB%gb pause=no scratch=yes "out=%OUT_DIR%\\model" "sdir=%OUT_DIR%\\scratch" > "%OUT_DIR%\\console.txt" 2>&1','このケースのNastranを直接実行し、呼出しが戻るまで待ちます。2件が同時に動いても出力・scratch・画面ログは別々です。');
  add(r,'set "RC=%ERRORLEVEL%"','直後に、そのジョブの呼出し終了コードを保存します。');
  add(r,'> "%OUT_DIR%\\launcher_exit.txt" echo %RC%','呼出しが戻った後でだけ、この記録を作ります。ファイルがまだなければ、実行中か、開始前の問題かをconsole.txtなどで確認します。');
  add(r,'popd','元の作業フォルダへ戻ります。');
  add(r,'echo %CASE_NAME% launcher returned %RC%. Check its F06 and LOG.','どちらのケースの呼出しが戻ったかを表示します。2件分の表示が前後しても、各ファイルの記録は独立しています。');
  add(r,'exit /b %RC%','このケースの呼出し終了コードを返します。');
  add(r,':bad_worker','補助バッチの呼出し方や準備が違う場合の行先です。');
  add(r,'echo ERROR: Start this worker through run_in_order.bat or run_two_parallel.bat.','親バッチから実行するよう案内します。');
  add(r,'exit /b 7','補助バッチの準備エラー番号7で戻ります。Nastran自身が返した番号ではありません。');files['run_worker.bat']=r;
  return files;
 }
 function raw(rows){return rows.map(r=>r.text).join('\r\n')+'\r\n';}
 window.NastranBatch={defaults,validate,counts,make,raw};
})();
