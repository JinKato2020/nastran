(() => {
 'use strict';
 const entries=[];
 function add(family,id,title,category,summary,syntax,example,terms,page,notes=[],location){
  entries.push({key:(family==='executive'?'EXEC_':family==='case'?'CASE_':'')+id,id:id==='BEGIN_BULK'?'BEGIN BULK':id,title,family,category,kind:'control',summary,syntax,example,terms,page,notes,location:location||(family==='executive'?'Executive Control（CENDより前）':'Case Control（CENDとBEGIN BULKの間）')});
 }
 add('executive','SOL','解析手順','解析手順','実行するSolution Sequenceを指定します。','SOL n','SOL 101',[['n','101：線形静解析、103：実固有値解析、111：モード法周波数応答、112：モード法過渡応答。']],186);
 add('executive','TIME','CPU・I/O時間制限','実行制御','CPU実行時間とI/O時間の上限を分単位で指定します。','TIME[=]t1[,t2]','TIME 5',[['t1','CPU時間の上限（分）。正の実数または整数。省略時は1.89E9秒。'],['t2','I/O時間の上限（分）。正の実数または整数。省略時は無制限（機種依存）。t2を指定する場合はt1も必要です。']],225,['荷重の作用時間や、壁時計の経過時間を指定する命令ではありません。']);
 add('executive','CEND','Executiveの終了','区画境界','Executive Controlの終了を示します。','CEND','SOL 101\nCEND',[['CEND','以後をCase Controlとして扱います。QRGでは省略可能ですが、入力区画を明示するため記載します。']],152);
 add('case','TITLE','出力の第1見出し','識別・サブケース','出力に表示するタイトルを指定します。','TITLE = text','TITLE = AXIAL ROD',[['text','出力の第1見出しとなる文字列。解析条件や荷重値を変更しません。']],660);
 add('case','LABEL','サブケースの見出し','識別・サブケース','出力の第3見出しを指定します。','LABEL = text','SUBCASE 1\n    LABEL = AXIAL 1000 N',[['text','条件を識別する文字列。荷重は別途LOAD等で選択します。']],470);
 add('case','SUBCASE','サブケース定義','識別・サブケース','荷重・拘束・出力等の条件をサブケースごとに指定します。','SUBCASE n','SUBCASE 1\n    LOAD = 20\nSUBCASE 2\n    LOAD = 21',[['n','正の整数、9999999未満。直前のSUBCASE番号より大きく指定します。']],632,['SUBCASEより前の共通指定は、個別に上書きしないサブケースに適用されます。','SOL 101の独立した荷重ケースの扱いを、非線形解析等へそのまま一般化しないでください。']);
 add('case','ECHO','入力エコー','結果出力','Bulk Dataのエコー出力を制御します。','ECHO = NONE','ECHO = NONE',[['NONE','入力エコーを抑制。計算結果の出力要求とは独立です。']],345);
 for(const [id,title,page,summary] of [
  ['DISPLACEMENT','変位ベクトル',334,'節点変位の出力を要求します。'],['SPCFORCES','単点拘束反力',617,'単点拘束による反力の出力を要求します。'],['FORCE','要素力',418,'要素力の出力を要求します。集中荷重を定義するBulk FORCEとは異なります。'],['STRESS','要素応力',628,'要素応力の出力を要求します。出力成分と評価位置は要素形式によって異なります。']
 ])add('case',id,title,'結果出力',summary,id+'(PRINT,PUNCH) = ALL',id+' = ALL',[['ALL','対象となる全点・全要素を要求します。選択範囲は各命令の適用対象に従います。'],['PRINT / PUNCH','PRINTはF06、PUNCHはPCHへの出力要求。括弧内のコンマはCase Controlの構文です。']],page,['出力先の設定と、ここでの結果要求は別です。OP2を使用する場合も必要な結果を要求します。']);
 for(const [id,title,page] of [['VELOCITY','速度ベクトル',673],['ACCELERATION','加速度ベクトル',249]])add('case',id,title,'結果出力','周波数応答・過渡応答の'+title+'の出力を要求します。',id+'(SORT1,PHASE) = ALL',id+'(SORT1,PHASE) = ALL',[['SORT1','周波数・時刻を基準に並べる出力形式。'],['PHASE','複素応答を振幅・位相で表示する指定。過渡応答の例ではPHASEを付けません。'],['ALL','全対象点を要求します。']],page);
 for(const [id,title,page,example,description,target] of [
  ['SPC','拘束セットの選択',616,'10','SPC/SPC1/SPCADD等で定義した拘束セットを選択します。','拘束セットのSID'],
  ['LOAD','静的荷重の選択',472,'20','静的荷重セットを選択します。FORCE等のSID、またはBulk LOADの組合せを参照します。','静的荷重セットのSID'],
  ['DLOAD','動的荷重の選択',340,'50','動的荷重セットを選択します。教材例はDLOAD → RLOAD1/TLOAD1 → DAREAの参照関係です。','動的荷重セットのSID'],
  ['METHOD','固有値抽出条件',495,'30','実固有値抽出条件を選択します。教材のSOL 103・111・112ではEIGRLを参照します。','EIGRL等のSID'],
  ['FREQUENCY','加振周波数の選択',421,'60','周波数応答の計算周波数を選択します。固有値探索の周波数範囲とは別の指定です。','FREQ/FREQ1等のSID'],
  ['TSTEP','時間刻みの選択',665,'90','過渡応答の時間刻み・計算ステップ数・出力間隔を選択します。','Bulk TSTEPのSID'],
  ['SDAMPING','モード減衰の選択',594,'70','モード法の教材ではTABDMP1を参照し、固有振動数に応じたモード減衰を指定します。','TABDMP1のTID（本教材のモード法）']
 ])add('case',id,title,['SPC','LOAD','DLOAD'].includes(id)?'荷重・拘束':'動解析条件',description,id+' = n',id+' = '+example,[['n',target+'。指定値は番号であり、荷重・変位・周波数等の物理量ではありません。']],page, id==='TSTEP'?['荷重の時間波形はTLOAD1/TABLED1等で別に定義します。']:[]);
 add('case','AUTOSPC','自動拘束','荷重・拘束','剛性の特異・準特異な自由度を自動拘束します。','AUTOSPC = YES','AUTOSPC = YES',[['YES','自動拘束を有効にします。追加された拘束と、その原因を出力で確認します。']],284,['支持条件の誤りや未接続部分を正しくモデル化する作業の代わりにはなりません。','2020 SP1では旧PARAM AUTOSPCよりCase Controlの指定を使用します。']);
 add('case','PARAM','Case ControlのPARAM','パラメータ指定','適用可能なパラメータをCase Controlで指定します。','PARAM,n,V1,V2','PARAM,GRDPNT,0',[['n','パラメータ名。Case Controlへの記述可否はパラメータごとに異なります。'],['V1 / V2','値。型・既定値・優先順位は対応するパラメータ定義を確認します。']],564,['この命令はCase Controlの自由形式です。Bulk PARAMの8文字フィールド形式と混同しないでください。']);
 add('case','BEGIN_BULK','Bulk Dataの開始','区画境界','Case Controlを終了し、Bulk Dataを開始します。','BEGIN BULK','BEGIN BULK',[['BEGIN BULK','この行以降に節点・要素・材料・荷重・PARAM等を記述します。']],310);
 add('bulk','INCLUDE','外部ファイルの読込み','入力ファイル構成','外部ファイルの内容を指定位置へ挿入します。',"INCLUDE 'filename'","INCLUDE 'mesh.inc'",[['filename','読み込むファイル名・パス。読み込む内容は挿入位置の区画に従います。']],2184,['自由形式で1行72文字以内。通常の8文字フィールド表は使いません。','全区画で使用可能。入れ子は最大10段。Bulkだけを分割する場合、子ファイルにSOL/CEND/BEGIN BULK/ENDDATAを重ねません。'],'各入力区画で使用可能');
 add('bulk','ENDDATA','Bulk Dataの終了','入力ファイル構成','Bulk Dataの終了を示します。','ENDDATA','ENDDATA',[['ENDDATA','QRGでは省略可能。教材では親BDFの最後に明示します。']],1968,[],'Bulk Dataの末尾');
 window.INPUT_CONTROLS=entries;
})();
