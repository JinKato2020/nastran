(() => {
 'use strict';
 const C=window.AnalysisStructureCore,L=window.AnalysisStructureLabs,A=window.LessonArticle;
 const scenarios=window.AnalysisScenarios,guides=window.AnalysisModelGuides,quizzes=window.AnalysisModelQuizzes;
 const n=v=>Number(v.toPrecision(6)).toLocaleString('en-US',{maximumFractionDigits:8});
 const p=s=>'<p>'+s+'</p>',formula=s=>'<p class="element-formula">'+s+'</p>';
 const table=(heads,rows)=>A.table(heads,rows);
 const qrg=page=>'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2025.1_Quick_Reference_Guide.pdf#page='+page;
 const theorySource={url:'https://solidmechanics.org/Text/Chapter4_1/Chapter4_1.php',label:'一般理論：A. F. Bower, Applied Mechanics of Solids §4.1.9'};
 const buckSource={url:'https://www.purdue.edu/freeform/me323/wp-content/uploads/sites/2/2024/06/column_buckling.pdf',label:'一般理論：Purdue University · Column Buckling'};
 const manual={url:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide.pdf#page=505',label:'MSC 2025.1 線形静解析ガイド · 倍率と臨界荷重・SOL 105（PDF 505–507）'};
 const meshScenario=scenarios['thick-cylinder'],meshModels=meshScenario.models;
 const cylDetails={
  'cyl-open':{
   take:'内圧で周方向に伸びても、軸方向の引張荷重がなければσz=0です。ポアソン効果によって軸方向には縮みます。',
   boundary:'長い円筒の端部から離れた領域。筒端に軸方向合力を与えません。軸方向の剛体移動だけを除き、全体の伸縮を許します。短い輪の平面応力近似とは適用範囲を区別します。',
   axial:'Nz=0 → σz=0。εz=−ν(σr+σθ)/E=−2νA/Eで、εzも0になるわけではありません。',
   mistake:['軸方向変位を全節点で0にした','開放端の比較が、平面ひずみの拘束条件へ変わります。周方向応力が同じでもσzと半径方向変位で見分けられます。'],
   action:'軸方向の全節点拘束を与えず、剛体移動の除去と伸縮の拘束を分けます。軸方向荷重は0です。'
  },
  'cyl-closed':{
   take:'ふたに働く内圧の合力を円筒壁が引張力として受け持ちます。「閉じた端」と「変位を固定した端」は別です。',
   boundary:'ふたの付いた長い円筒の、端部から離れた筒部。軸方向の伸縮は許します。ふたとの接合部の局所曲げは、この比較では扱いません。',
   axial:'ふたへの力はpi·πa²。壁の軸力はσz·π(b²−a²)。両者を等置し、σz=pi·a²/(b²−a²)=Aとなります。',
   mistake:['閉止端なので両端を軸方向固定した','ふたの圧力を支える条件と、伸びを止める条件を混同しています。閉止端では軸方向に伸びることがあり、この例のεzは正です。'],
   action:'筒部だけをモデル化する場合は、ふたの合力に等価な端面の軸方向分布荷重を与えます。内面圧だけを入れても、ふたの軸方向合力は自動では追加されません。'
  },
  'cyl-locked':{
   take:'止めるのは軸方向の伸縮です。εz=0でもσzは0ではなく、半径方向には膨らめます。',
   boundary:'円筒の軸方向の伸縮を止める平面ひずみ状態。対称面では面法線変位だけを拘束します。長い円筒だから自動的に平面ひずみになる、と判断しません。',
   axial:'εz=[σz−ν(σr+σθ)]/E=0。両辺にEを掛け、σz=ν(σr+σθ)=2νAと求まります。',
   mistake:['平面ひずみだから軸方向応力も0と思った','0にするのはひずみです。伸縮を妨げるための応力・反力が必要で、この例ではσz=2.2 MPaになります。'],
   action:'軸方向変位を全節点で0にします。既存メッシュ比較はGRIDのPS欄でZ成分を拘束しています。半径方向まで固定すると内圧による膨張を妨げます。'
  },
  'cyl-external':{
   take:'外圧は周方向・軸方向に圧縮を生み、円筒を縮めます。静解析で応力が求まることと、外圧座屈に耐えることは別です。',
   boundary:'外圧10 MPa・内圧0の閉止端円筒。外周面と、閉止端の外圧合力を対応させます。内圧ケースと比較するときは内圧の符号だけを反転したモデルにしません。',
   axial:'内外圧をともに含めたふたの合力はπ(pi·a²−po·b²)。壁断面積で割るとσz=A。外圧だけの場合は軸方向圧縮です。',
   mistake:['内面に負の圧力を入れて外圧の代わりにした','荷重面と受圧面積が違うため、別の境界条件です。外周面へ正の圧力を与え、閉止端の軸方向合力も外半径で評価します。'],
   action:'PLOAD4の荷重面を外周面へ切り替えます。継続行の方向を省略したソリッド面では正圧が材料へ押し込む向きです。外面では半径が小さくなる向きになります。'
  }
 };
 const cylinderModels=Object.entries(C.ends).map(([id,end])=>{
  const d=C.cylinder(id),info=cylDetails[id];
  return {id,title:end.title,diagram:id,theoretical:true,takeaway:info.take,
   diagramCaption:'円筒の軸を通る縦断面。上下の帯が円筒壁、中央が空洞です。赤矢印は圧力・ふたの軸方向合力、青線は軸方向の拘束。zは円筒軸、rは半径方向です。ふたの局所的な変形は描いていません。',
   conditions:[['形状・材料','内半径a=50 mm、外半径b=100 mm、E=70,000 MPa、ν=0.33。等方・均質・線形弾性で、小変形を仮定します。'],['圧力',`内圧pi=${d.pi} MPa、外圧po=${d.po} MPa。圧力は正の大きさ、応力は引張を正とします。`],['軸方向・適用範囲',info.boundary],['モデル化への対応',info.action]],
   results:[`内面の理論値：σr=${n(d.sr)} MPa、σθ=${n(d.st)} MPa、σz=${n(d.sz)} MPa。`, `内面変位uᵣ=${n(d.u)} mm、軸方向ひずみεz=${n(d.ez)}。符号を含めて確認します。`,'円筒座標のr・θ・zへ成分をそろえて比較します。任意の角度で全体X方向の応力を周方向応力と読み替えないでください。'],
   check:[['PLOAD4','圧力面・圧力の向き'],['SPC1','拘束する方向'],['PSOLID','材料座標・応力評価位置'],['CASE_STRESS','応力出力'],['CASE_DISPLACEMENT','変位出力'],['CASE_SPCFORCES','拘束反力']]};
 });
 const endGroup={id:'ends',title:'圧力・端部条件の比較',models:cylinderModels,
  shared:'寸法・材料は共通。内圧3条件では軸方向の条件だけを変更。外圧の閉止端は、内圧の閉止端と荷重面・ふたの合力を比較します。数値は端部影響を除いた弾性理論値です。',
  columns:['条件','σz（MPa）','内面uᵣ（mm）'],rows:cylinderModels.map(m=>{const d=C.cylinder(m.id);return[m.title,n(d.sz),n(d.u)];}),
  compare:'内圧3条件のσrとσθは同じでも、σz・εz・uᵣは異なります。周方向応力1つが合っただけでは、軸方向条件の正しさを検証できません。'};
 const meshGroup={...meshScenario,id:'mesh',title:'メッシュ収束の検証',models:meshModels};
 meshGroup.compare='軸方向拘束・内圧10 MPaを固定し、分割だけを変えます。同じ物理位置・成分・出力位置・平均化条件で、内面変位と応力の両方を比較します。細かいモデルを自動的に正解とはしません。';
 scenarios['thick-cylinder']={...meshScenario,summary:'圧力面と軸方向の条件から、応力・変位・検算の違いを調べます。',models:[...cylinderModels,...meshModels],studyGroups:[endGroup,meshGroup],sources:[theorySource,{url:qrg(2631),label:'MSC 2025.1 QRG · PLOAD4（PDF 2631–2633）'},{url:qrg(2699),label:'MSC 2025.1 QRG · PSOLID（PDF 2699–2700）'}]};
 const node=(id,card,detail)=>({id,label:card.replace('EXEC_SOL_','SOL ').replace('CASE_','').replace('PARAM_','PARAM,'),card,detail});
 const edge=(from,to,label)=>({from,to,label});
 for(const model of cylinderModels){
  const d=C.cylinder(model.id),info=cylDetails[model.id];
  window.AnalysisRelationMaps[model.id]={title:'主要カードと条件の対応',scope:'条件を理解するための構成図です。小文字の記号は参照IDの役割を表し、実行用の節点・要素リストではありません。カードからInputデータへ移動できます。',panels:[
   {title:'制御と出力',note:'SOL 101を選び、荷重・拘束のセットと必要な結果出力を対応させます。',layers:[['sol'],['spc','load'],['disp','stress','rf']],nodes:[node('sol','EXEC_SOL_101',''),node('spc','CASE_SPC','SPC=c'),node('load','CASE_LOAD','LOAD=l'),node('disp','CASE_DISPLACEMENT','u'),node('stress','CASE_STRESS','σ'),node('rf','CASE_SPCFORCES','R')],edges:[]},
   {title:'形状と材料',note:'立体要素は断面全体の体積を表します。PSOLIDへ板厚を別入力する方式ではありません。',layers:[['el'],['grid','prop'],['mat']],nodes:[node('el','CHEXA','EID=e / PID=p'),node('grid','GRID','G1…G8'),node('prop','PSOLID','PID=p / MID=m'),node('mat','MAT1','E=70000 / ν=0.33')],edges:[edge('el','grid','G1…G8'),edge('el','prop','PID'),edge('prop','mat','MID')]},
   {title:'圧力と軸方向条件',note:info.action+' 端面に等価な引張表面力を与える場合も、ソリッドの正圧は材料の内向きであることを踏まえ、面法線と符号を確認します。',layers:[['load','spc'],['press','support'],['el','grid']],nodes:[node('load','CASE_LOAD','LOAD=l'),node('spc','CASE_SPC','SPC=c'),node('press','PLOAD4',`pᵢ=${d.pi} / pₒ=${d.po}`),node('support','SPC1',model.id==='cyl-locked'?'u_z=0':'ε_z ≠ 0'),node('el','CHEXA','EID=e'),node('grid','GRID','G1 / G3 / CD')],edges:[edge('load','press','SID'),edge('spc','support','SID'),edge('press','el','EID'),edge('press','grid','G1 / G3'),edge('support','grid','G')]}]};
  window.AnalysisScenarioRelationKeys.push(model.id);
 }
 function cylInput(id){return [
  ['Executive / Case Control',[['EXEC_SOL_101','線形静解析。塑性、変形に伴う剛性変化、座屈後の挙動はこの比較に含めません。'],['CASE_SUBCASE','比較条件ごとに荷重と拘束を対応させます。'],['CASE_SPC','対称条件・剛体移動の除去・軸方向条件を選びます。'],['CASE_LOAD','内外面の圧力と、必要な端面の等価荷重を選びます。'],['CASE_STRESS','半径・周・軸方向の応力を読むための出力要求です。'],['CASE_DISPLACEMENT','半径方向の変位と、軸方向の伸縮を確認します。'],['CASE_SPCFORCES','拘束した成分の反力を集計します。']]],
  ['Bulk Data・任意設定',[['GRID','位置CPと変位成分のCDを区別します。PS欄の拘束は全サブケースに作用するため、軸方向の拘束あり・なしを切り替える比較では共通GRIDへの永久拘束に注意します。'],['CHEXA','円筒壁の体積と、圧力をかける面を節点接続で定義します。'],['PSOLID','材料IDと座標系・積分・応力評価位置を設定します。板厚入力ではありません。'],['MAT1','Eとνを与えます。重力・慣性なしのこの静解析に密度は必須ではありません。'],['SPC1',cylDetails[id].action],['PLOAD4','CHEXAの四角面では同一面上の対角節点G1・G3で面を指定。方向成分を省略した正圧は材料へ押し込む向きです。'],['LOAD','複数の荷重セットを組み合わせる場合に使用。ふたをモデル化した場合、その圧力と等価端面荷重を二重に与えません。'],['CORD2C','円筒座標を利用する場合の座標定義。円筒軸・原点・成分方向を照合します。'],['PARAM_POST','OP2などをポスト処理に使う場合の出力設定。圧力・拘束の物理条件を決める設定ではありません。']]]
 ];}
 function cylinderMath(id){const d=C.cylinder(id),info=cylDetails[id];return p(info.axial)+
  formula('σr = A − B/r²、σθ = A + B/r²')+
  p('境界条件σr(a)=−pi、σr(b)=−poを代入します。2式の差からB=(pi−po)a²b²/(b²−a²)、元の式へ戻してA=(pi·a²−po·b²)/(b²−a²)。ここに軸方向の条件を組み合わせます。')+
  formula('εθ = [σθ − ν(σr + σz)]/E、uᵣ = r εθ')+
  p(`r=aで${n(d.sr)}・${n(d.st)}・${n(d.sz)} MPaを使うと、uᵣ=${n(d.u)} mm。周方向応力が同じでも、σzが変わるとポアソン効果を通して変位が変わります。`)+L.render(id);}
 for(const model of cylinderModels){const id=model.id,info=cylDetails[id];guides[id]={
  items:[info.take,info.action,'応力の3成分、半径方向変位、軸方向の伸縮を組にして確認します。'],explanation:()=>cylinderMath(id),inputReview:cylInput(id),
  verify:['圧力面と矢印を表示し、内面・外面の取り違えを確認します。','円筒座標の向きと、節点変位・要素応力の出力座標をそろえます。','端部影響から離れた同じ半径でσr・σθ・σz・uᵣを理論値と照合。要素中心、積分点、節点への外挿、平均化の違いも記録します。','閉止端は圧力の端面合力と壁の軸力を、軸方向拘束は拘束反力と壁の軸力を対応させます。'],
  pitfalls:[info.mistake,['圧力を4分の1にした','1/4モデルでも圧力の単位面積当たりの大きさは同じです。切り出した面積に応じて合力が4分の1になります。'],['最大主応力だけを比較した','半径・周・軸方向の成分が分からなくなります。まず3成分で荷重と境界条件を確認し、必要に応じて主応力やミーゼス応力へ進みます。'],['理論値と固定端の局所ピークを直接比較した','この理論比較は端部影響のない領域です。ふたや支持との接合部には別の曲げや局所応力が生じ得ます。']]};}
 for(const [i,m]of meshModels.entries()){
  const mesh=[[2,4,8],[4,8,32],[8,16,128]][i];
  m.conditions=m.conditions.map(row=>row[0]==='平面ひずみ'?[row[0],'全節点のZ方向の変位をGRIDのPS欄で止めた、軸方向に伸縮しない条件です。円筒が長いだけではこの拘束条件は決まりません。']:row);
  m.takeaway=['まず荷重面・対称条件・全体の変形を確認する基準です。粗い結果だけで内面応力の精度を判断しません。','粗いモデルとの差を変位と応力で別々に記録します。標準という名前は必要精度を保証しません。','標準との差が小さいかを調べます。出力位置・平均化や形状近似が変わっていないかも確認します。'][i];
  m.results=m.results.slice(0,2).concat([m.takeaway,'軸方向を拘束した同じ物理条件で比較。σzの理論値は2.2 MPaです。']);
  guides[m.id]={items:[`半径${mesh[0]}×周方向${mesh[1]}、軸方向1層。CHEXA ${mesh[2]}要素の既存比較です。`,m.takeaway,'軸方向拘束の比較であり、開放端・閉止端の理論変位を正解値に流用しません。'],
   verify:['座標・寸法・圧力・材料・拘束が全モデルで同じかを確認します。','内面X軸上の同じ物理位置で、半径方向変位と周方向応力を記録します。','応力の評価位置と節点平均化をそろえ、理論誤差と隣り合うメッシュ間の変化率を分けて計算します。','変化率が小さくても全モデルで同じ誤設定なら収束します。理論値と荷重・反力のつり合いを独立に点検します。'],
   explanation:()=>p(m.takeaway)+formula('理論誤差 = (FE値 − 理論値) / |理論値| × 100%')+formula('メッシュ間の変化率 = |Q細 − Q粗| / |Q細| × 100%')+p('Qが0に近い成分では相対誤差が不安定になるため、絶対差と適切な基準量で評価します。各行には利用者の実行値を記録し、未実行のFE値を理論値から作りません。'),
   resultExtra:()=>table(['比較','内面uᵣ','内面σθ'],[['理論値（軸方向拘束）','0.0137433 mm','16.6667 MPa'],['粗い：2×4','利用者の実行値を記録','同じ評価位置で記録'],['標準：4×8','利用者の実行値を記録','同じ評価位置で記録'],['細かい：8×16','利用者の実行値を記録','同じ評価位置で記録']]),
   pitfalls:[['細かくすると必ず単調に正解へ近づく？','要素定式化・形状近似・外挿・平均化によって単調にならない場合があります。十分な分割かどうかは評価量ごとに調べます。'],['節点番号が同じなので同じ位置だと思った','番号は位置を保証しません。r・θ・zと、応力の評価位置を照合します。'],['長い円筒なら平面ひずみでよい？','長さだけでは軸方向の伸縮を決められません。このメッシュ比較は伸縮を拘束した条件です。']]};
 }
 const buck=scenarios.buckling;
 for(const id of ['buck-fixed-pinned','buck-blocked']){const d=C.buckling(id),blocked=d.P===null;buck.models.push({id,title:d.title,diagram:id,theoretical:true,
  takeaway:blocked?'圧縮を与えた節点で同じ軸方向を拘束すると、荷重が支持反力へ流れ、意図した軸力が柱に入りません。':'固定端とピン端の非対称な支持。最大たわみの位置は中央とは限りません。',
  conditions:[['柱','L=360 mm、E=70,000 MPa、弱軸I=648 mm⁴。支持の考え方を比較する模式例です。'],['根元','GRID 1：123456を拘束。'],['荷重点',blocked?'GRID 13：123456を拘束した誤設定。−X方向に集中荷重を与えています。':'GRID 13：横方向23を拘束、軸方向1と曲げ回転56は自由。'],['比較の目的',blocked?'反力が出たことだけでは、柱へ圧縮を伝えた証明にならないことを診断します。':'ピン端を回転拘束すると両端固定へ、固定端の曲げ回転を放すと両端ピンへ変わることを比較します。']],
  results:blocked?['荷重点の軸方向反力は荷重を打ち消しますが、柱の軸力は0です。','基準応力から作る幾何剛性が意図と異なります。固有値が出ないことを高い耐力と解釈しません。']:[`β=4.493409…、K=π/β≈${n(d.k)}。弱軸Pcr≈${n(d.P)} N。`,'固定端で変位と傾きが0、ピン端で変位と曲げモーメントが0になる形を確認します。'],
  check:[['SPC1','自由度の指定'],['CASE_FORCE','基準静解析の軸力'],['CASE_SPCFORCES','反力'],['CASE_METHOD','抽出条件'],['CASE_DISPLACEMENT','モード形']]});}
 buck.columns=['支持・診断例','荷重点の軸方向','弱軸の理論臨界荷重'];
 buck.rows=buck.models.map(m=>{const d=C.buckling(m.id);return[m.title,d.P===null?'拘束（誤設定）':'自由',d.P===null?'基準軸力が0。臨界荷重の比較対象外':n(d.P)+' N'];});
 buck.compare='まず正しい4支持を比べ、次に誤設定例で基準軸力を診断します。固有値λと荷重Pcrの単位、基準SUBCASE、座屈形の境界条件を組にして確認します。';
 buck.sources=[manual,buckSource,{url:qrg(2884),label:'MSC 2025.1 QRG · SPC1（PDF 2884）'}];
 for(const id of ['buck-fixed-pinned','buck-blocked']){
  const map=JSON.parse(JSON.stringify(window.AnalysisRelationMaps['buck-fixed']));
  map.scope='支持条件を比較する模式例です。基準の梁と同じIDの役割を示しますが、この条件の実行確認済み入力は未収録です。';
  const d=C.buckling(id);
  // Locate by the SPC1 card rather than depending on the displayed heading.
  for(const panel of map.panels)for(const item of panel.nodes)if(item.card==='SPC1')item.detail='G1: '+d.left+' / G13: '+d.right;
  for(const panel of map.panels)if(panel.nodes.some(n=>n.card==='SPC1'))panel.note=id==='buck-blocked'?'荷重点の軸方向まで止めた誤設定を診断します。':'固定端の曲げ回転は拘束、ピン端の曲げ回転は自由。荷重点の軸方向は自由です。';
  window.AnalysisRelationMaps[id]=map;window.AnalysisScenarioRelationKeys.push(id);
 }
 function buckInput(id){const d=C.buckling(id);return [
  ['制御・結果出力',[['EXEC_SOL_105','線形の基準応力状態から弾性安定性を調べます。実際の座屈後変形や塑性崩壊の解析ではありません。'],['CASE_SUBCASE','先の基準静解析と、後の座屈計算を分けます。'],['CASE_SPC',`このモデルでは根元${d.left}、荷重点${d.right}。GRIDのCDを含めて拘束方向を照合します。`],['CASE_LOAD','静解析側で基準荷重セットを選びます。座屈側の倍率はその荷重パターンに対する値です。'],['CASE_STATSUB','座屈側から基準静解析のSUBCASE番号を参照。LOADのセット番号を入れる欄ではありません。'],['CASE_METHOD','座屈側から固有値抽出カードのSIDを参照します。'],['CASE_FORCE','静解析側で圧縮軸力が柱へ入ったことを確認します。'],['CASE_SPCFORCES','荷重が直接拘束点へ流れていないかを反力と要素力の組で確認します。'],['CASE_DISPLACEMENT','静解析の変位と、座屈側の規格化されたモード形を区別します。']]],
  ['要素・荷重・抽出',[['GRID','柱の位置、拘束・荷重を表す座標の基準です。'],['CBEAM','柱の向きと断面方向。向きベクトルにより弱軸曲げと強軸曲げを対応させます。'],['PBEAM','A・I1・I2・Jを与えます。弱軸I=648、強軸I=23,328 mm⁴です。'],['MAT1','E=70,000 MPa。通常のこの線形座屈の基準荷重に密度は不要です。'],['SPC1','固定・ピンの違いは並進と曲げ回転の拘束で表します。梁端のPA/PB解放を必ず併用するわけではありません。'],['FORCE','荷重点へ−Xの基準圧縮荷重。符号を2回反転して引張にしないよう確認します。'],['EIGRL','METHODの参照先。SOL 105の探索上下限は座屈倍率で、SOL 103のHzとして読まないでください。'],['PARAM_POST','結果ファイルをポスト処理する際の任意設定。密度や表示倍率の変更で座屈荷重を調整する設定ではありません。']]]
 ];}
 for(const model of buck.models){const id=model.id,d=C.buckling(id),blocked=d.P===null;
  if(id==='buck-cantilever')model.takeaway='自由端が横へ逃げるため、今回の正しい4支持の中で最も小さい理論荷重で座屈します。';
  if(['buck-cantilever','buck-pinned','buck-fixed'].includes(id))model.results[0]=`弱軸曲げの最小の正の倍率λを読み、基準荷重P₀を掛けます。理論臨界荷重は${n(d.P)} Nです。P₀=1 Nのときだけλと荷重の数値が一致します。`;
  guides[id]={items:[model.takeaway,`根元は${d.left}、荷重点は${d.right}を拘束。荷重の方向は全体−Xで、弱軸の横変位はZ方向です。`,blocked?'軸力0の誤設定を診断し、基準状態を直してから固有値計算へ進みます。':'最初に基準軸力、次に固有値λ、最後にλP₀とモード形を確認します。'],
   inputReview:buckInput(id),explanation:()=>p(blocked?'下の図で荷重と反力の位置を確認します。軸方向も拘束した荷重点へ力を加えても、この直線柱を圧縮する変形は生じません。':'基準静解析でP₀に比例する幾何剛性KG(P₀)を作ります。倍率λを求める式は[K+λKG(P₀)]φ=0。P₀をa倍するとKGもa倍になるため、同じ状態を表す倍率はλ/aになります。')+
    formula(blocked?'N = 0 → 意図した圧縮の基準状態になっていない':'Pcr = λP₀ = π²EI/(KL)²')+
    p(id==='buck-fixed-pinned'?'固定端とピン端の条件を曲げの微分方程式へ入れるとtan β=β。0以外の最初の根β=4.493409…を使い、K=π/β≈0.699156です。両端ピンの正弦半波とは形も最大位置も異なります。':'支持を変えると許される曲げの形が変わります。Iの取り違えと支持の取り違えは別の原因なので、一度に変更せず切り分けます。')+L.render(id),
   verify:blocked?['基準静解析で荷重点の軸方向反力と、柱の軸力を別々に読みます。','柱の軸力が0なら、LOADの選択・荷重方向・荷重点の軸方向拘束を確認します。','軸方向の伸縮を許した適切な支持へ戻し、基準軸力を確認してから座屈計算を行います。']:['静解析SUBCASEで軸力が全長にわたって−P₀となることを確認。反力だけで判断しません。','座屈SUBCASEのSTATSUBとMETHODが、意図した基準状態とEIGRLを参照するかを確認します。',`弱軸の曲げモードを見分け、λP₀を理論値${n(d.P)} Nと比較します。`,'座屈形の端変位・傾きと支持を照合し、要素分割を変えて同じ形の根の収束を確認します。','求まった臨界状態でも応力が弾性範囲か、初期不整・塑性・大変形の影響を無視できるかを別途判断します。'],
   pitfalls:[['λをNやHzとして読んだ','SOL 105の固有値は基準荷重に掛ける無次元の倍率です。P₀=1 Nのときだけ荷重の数値と一致します。P₀を10倍にしてλが1/10になるかを操作図で確認します。'],['固定端なら荷重点の軸方向も必ず止める？','曲げを固定することと軸方向の伸縮を止めることは別です。荷重を入れる側まで軸方向拘束すると、この集中荷重が支持反力へ流れます。'],['大きなモード変位が出たので壊れると思った','固有ベクトルの表示振幅は任意です。実際の座屈後変位や荷重–変位関係を求めるには別の解析が必要です。'],['負の根を絶対値にして採用した','この単純圧縮の比較では荷重の向き・基準軸力を確認します。一般には逆向きの荷重パターンに対応する根もあるため、符号と形を保って意味を判断します。']]};
 }
 // Shared basic notes remain in one expandable section; model-specific details stay above it.
 const cg=window.AnalysisScenarioGuides['thick-cylinder'];
 cg.basics=[['この記事で分かること',['内外圧と軸方向条件を入力へ対応させ、応力3成分と変位で条件の違いを見分けます。','圧力の符号、1/4モデルの対称条件、円筒座標と出力位置の読み違いを防ぎます。','理論解とメッシュ収束を別の検証として使います。']],['共通の仮定',['均質・等方・線形弾性、小変形、軸対称な圧力を仮定します。温度、回転、重力、初期応力は含みません。','開放端・閉止端は長い筒の端部から離れた領域の比較。軸方向拘束は伸縮を止める条件です。','外圧の圧縮状態が計算できても、座屈の安全性をSOL 101だけで判定しません。']],['比較量の選び方',['内面の周方向応力だけでなく、半径・軸方向応力と変位も比べます。','1/4モデルでも圧力値はそのまま。切断面で対称条件を与えます。','メッシュの変化率が小さくても、全モデル共通の誤拘束は検出できません。']]];
 cg.terms=[['σr・σθ・σz','半径・周・軸方向の応力。内圧の内面ではσr=−pi、外面ではσr=−po。'],['一般化平面ひずみ','軸方向ひずみが断面内で一定。値は0とは限らず、端部の合力などから決まります。'],['平面ひずみ','軸方向ひずみを0とした条件。長いという形状だけからは決まりません。'],['応力評価位置','要素中心・積分点・節点への外挿を区別し、節点平均化の条件も記録します。']];
 cg.steps=['圧力面と軸方向の条件を先に決めます。','変位・応力・反力のうち何を比較するかと、その位置・座標を決めます。','材料・要素・拘束・圧力面を対応させます。','理論値、荷重のつり合い、メッシュ収束の3つから確認します。'];
 const bg=window.AnalysisScenarioGuides.buckling;
 bg.basics[0][1]=['支持・断面方向・基準荷重を切り分け、座屈倍率と臨界荷重を読み分けます。','基準静解析に圧縮が入らない誤設定を、要素力と反力から診断します。','理想的な線形座屈の範囲と、実物の崩壊・座屈後変形を区別します。'];
 bg.terms=bg.terms.map(([t,s])=>[t,t==='座屈固有値'?'基準荷重を何倍すると理想的な不安定状態になるかを表す倍率。1未満は基準荷重より低い予測臨界荷重を意味し、実物の変形履歴そのものではありません。':t==='負の固有値'?'逆向きの基準荷重パターンに対応する根。符号を消さず、軸力とモード形を確認します。':s]);
 // Questions use the same four-option, first-attempt score and F06 check component.
 const check=(label,expect,extra=[])=>({label,expect,diag:[[1,'条件をそろえた理論値と約3%以内です。入力と出力位置も確認します。'],...extra]});
 const question=(title,code,ask,options,answer,steps,label,expect,note='一般理論による値です。MSC Nastranの実行確認値ではありません。',diag=[])=>({title,code,ask,options,answer,verify:{title,steps,note,check:check(label,expect,diag)}});
 quizzes['thick-cylinder']={};quizzes.buckling={};
 for(const m of cylinderModels){const id=m.id,d=C.cylinder(id),info=cylDetails[id],external=id==='cyl-external';
  quizzes['thick-cylinder'][id]={intro:m.title+'：荷重面、軸方向条件、応力の方向を別々に確認する3問です。',links:[['bulk.html#PLOAD4','PLOAD4'],['bulk.html#SPC1','SPC1'],['bulk.html#PSOLID','PSOLID']],questions:[
   question('圧力の作用面と符号','PLOAD4：P1 = ?（方向を省略）',external?'外圧10 MPaを与える指定は？':'内圧10 MPaを与える指定は？',[[`${external?'外':'内'}面に +10 MPa`,'正圧はソリッドの材料へ押し込む向き。内面では半径外向き、外面では半径内向きです。'],[`${external?'内':'外'}面に −10 MPa`,'作用面と境界条件が異なります。同じ半径方向の合力にもなりません。'],['1/4モデルなので2.5 MPa','圧力は面積当たりの値です。切り出す面積に応じて合力が減ります。'],['全表面へ10 MPa','端面と円周面を区別できず、目的と違う応力状態になります。']],0,[`荷重面の半径方向応力は−10 MPa。${external?'外面r=b':'内面r=a'}を読みます。`,'反対側の無荷重の円周面ではσr=0です。'],`${external?'外面':'内面'}のσr（MPa）`,-10,undefined,[[-1,'圧力面の符号・応力座標を確認してください。']]),
   question('軸方向の条件を選ぶ','軸方向：荷重とSPCの選択',m.title+'に対応するのは？',[[info.action,'この比較の条件です。剛体移動の除去と、伸縮を妨げる拘束は区別します。'],['常に全節点の123456を拘束する','半径方向の膨張まで止めてしまいます。'],['内圧があれば必ずσz=piになる','端面の合力と壁断面積、または軸方向のひずみ条件から決まります。'],['外力があるので必ずεz=0になる','ひずみを0にするには、それに対応する拘束条件が必要です。']],0,[info.axial,`この条件のσz=${n(d.sz)} MPa。εz=${n(d.ez)}を併せて確認します。`],'筒中央部のσz（MPa）',d.sz),
   question('X軸上で周方向応力を読む','(x,y)=(a,0)、出力は基本直交座標', '円筒軸Z、内面のX軸上。周方向応力に対応する成分は？',[['σX','この点ではXが半径方向です。'],['σY','この点ではYが円周の接線方向なのでσθです。'],['σZ','軸方向の成分です。'],['常に最大主応力','主応力の大小順から方向は一意に分かりません。']],1,['この点ではr=X、θ=Y、軸=z。','他の角度では座標変換が必要です。例えばσθ=sin²θ·σX+cos²θ·σY−2sinθcosθ·τXY。',`内面σθ=${n(d.st)} MPa。応力の評価位置・平均化もそろえます。`],'内面のσθ（MPa）',d.st)
  ]};
 }
 for(const [i,m]of meshModels.entries())quizzes['thick-cylinder'][m.id]={intro:m.title+'メッシュ：物理条件を固定して検証する3問です。',links:[['bulk.html#PSOLID','PSOLID'],['bulk.html#GRID','GRID'],['theory.html#common-mesh','メッシュ']],questions:[
  question('比較に使う軸方向条件','GRID：PSに3を含む既存モデル','このモデルの内面変位と比べる理論値は？',[['開放端の0.0142619 mm','軸方向を伸縮させる別の条件です。'],['閉止端の0.0134762 mm','ふたの合力を負担して伸縮する別の条件です。'],['軸方向拘束の0.0137433 mm','全節点の軸方向変位を0にする条件と対応します。'],['0 mm','止めているのはZ方向。半径方向の膨張は許されています。']],2,['εz=0からσz=2νA=2.2 MPa。','u(a)=a[σθ−ν(σr+σz)]/E=0.0137433 mm。'],'内面の半径方向変位（mm）',C.cylinder('cyl-locked').u),
  question('1/4モデルの圧力','PLOAD4：P1 = ?','分割数を変えても保持する内圧は？',[['10 MPa','同じ物理条件なので圧力値は変えません。'],['2.5 MPa','面積と圧力を両方4分の1にしています。'],['要素数に比例させる','要素が増えるほど合力を増やす誤設定です。'],['各要素に10 N','力と圧力の単位・意味を混同しています。']],0,['内面にσr=−10 MPaという境界条件を与えています。','分割だけを変えても境界条件は変わりません。'],'内面のσr（MPa）',-10),
  question('応力の比較位置','STRESS / PSOLID：出力位置の照合','次のメッシュと比較するときにそろえる条件は？',[['最大値だけ','位置や成分が変わると収束の比較になりません。'],['節点番号だけ','番号が同じでも座標が同じとは限りません。'],['同じr・θ・z、成分、評価位置、平均化','同じ物理量を比較できます。変位と応力を別々に記録します。'],['細かい方は平均化してよい','平均化の差をメッシュ精度の差と混同します。']],2,['内面r=aでσθ=A+B/a²=16.6667 MPa。','要素中心の値は内面の値ではありません。節点外挿値も実行結果として精度を確認します。'],'内面のσθ（MPa）',C.cylinder('cyl-locked').st)
 ]};
 for(const m of buck.models){const id=m.id,d=C.buckling(id),blocked=d.P===null;
  const correct=d.right==='なし'?'SPC1で先端を拘束しない':d.right;
  const qs=[question('荷重点の自由度を選ぶ','SPC1：荷重点GRID 13の成分',blocked?'この誤設定で圧縮が入らない原因は？':m.title+'で荷重点に与える指定は？',[[correct,blocked?'軸方向1まで拘束すると、同じ節点へ加えた軸力は支持反力へ流れます。':'曲げの支持条件と、荷重を伝える軸方向の自由度を区別しています。'],['常に123456','固定端という言葉だけで全方向を拘束すると、荷重点から圧縮を入れられない場合があります。'],['必要なのはPA=56だけ','要素端の解放だけでは接地支持を定義できません。'],['全節点の123を拘束','柱の横たわみと軸方向変形を妨げます。']],0,[blocked?'集中荷重と拘束反力が同じ節点でつり合い、柱の軸力は0です。':'自由な軸方向へP₀=1 Nの圧縮を加えると、柱全長の軸力は−1 Nです。','SPCFORCESと要素のFORCEを両方確認します。'],'静解析の軸力（N）',blocked?0:-1),
   question('基準SUBCASEを参照する','SUBCASE 1：LOAD=40\nSUBCASE 2：STATSUB=?、METHOD=30','STATSUBの参照先は？',[['40','荷重セットの番号です。'],['30','抽出条件の番号です。'],['1','参照する静解析SUBCASE番号です。'],['105','SOLの番号です。']],2,['STATSUB=1 → 静解析SUBCASE 1 → LOAD=40。','METHOD=30 → EIGRLのSID=30。','F06の基準結果がSUBCASE 1に属することを確かめます。'],'基準静解析のSUBCASE番号',1)
  ];
  if(blocked){qs[0].options[0][0]='荷重点の軸方向1まで拘束している';qs[0].options[1]=['曲げ回転56を拘束しているため','曲げ回転を止めても軸方向が自由なら、軸方向の集中荷重を柱へ伝えられます。'];}
  if(!blocked)qs.push(question('基準荷重と固有値を区別する','FORCEの基準荷重：1 N → 100 N','形状・材料・支持を固定してP₀を100倍にすると？',[['λも100倍','λは荷重をさらに何倍するかという倍率です。'],['λは1/100、λP₀は同じ','幾何剛性が100倍になるため、倍率が逆に1/100になります。'],['λとPcrは両方同じ','倍率と荷重を混同しています。'],['固有振動数が100倍','SOL 105の固有値は振動数ではありません。']],1,[`Pcr=${n(d.P)} N。`,`P₀=100 Nならλ=Pcr/100=${n(d.P/100)}。`,'表示倍率を変えても、この値は変わりません。'],'P₀=100 Nとしたときの座屈倍率',d.P/100,undefined,[[100,'基準荷重1 Nの倍率と取り違えていないか確認します。']]));
  else qs.push(question('荷重の行き先を診断する','基準荷重：GRID 13へ−X方向に1 N','荷重点の反力が+1 Nなら圧縮を確認できた？',[['確認できた','反力だけでは柱へ入った軸力は分かりません。'],['柱の軸力を別に確認する','同じ節点の拘束が荷重を受け持ち、柱の軸力が0の可能性があります。'],['固有値がないなら安全','基準応力状態の誤りを安全性へ読み替えています。'],['Eを大きくする','拘束と荷重経路の誤りを材料変更では直せません。']],1,['ここでは荷重点のT1反力は+1 N。','柱の軸力は0で、意図した圧縮の基準状態ではありません。'],'荷重点のT1反力（N）',1));
  quizzes.buckling[id]={intro:m.title+'：自由度、基準状態の参照、固有値の意味を確認する3問です。',links:[['bulk.html#SPC1','SPC1'],['bulk.html#CASE_STATSUB','STATSUB'],['bulk.html#EIGRL','EIGRL']],questions:qs};
 }
})();
