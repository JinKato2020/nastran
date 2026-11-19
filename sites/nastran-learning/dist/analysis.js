(() => {
 'use strict';
 const catalog=window.NastranAnalysis;
 const scope=window.SolverScope;
 const scenarios=window.AnalysisScenarios;
 const byId=id=>document.getElementById(id);
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const picker=byId('analysis-picker');
 const detail=byId('analysis-detail');
 const list=items=>`<ul>${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
 const article=window.LessonArticle;
 const conditions=(rows,cardLabels=false)=>article.table(['項目','説明'],rows,{htmlFirst:cardLabels,narrow:true});
 const links=items=>`<div class="analysis-links">${items.map(([url,label])=>`<a href="${esc(url)}">${esc(label)} →</a>`).join('')}</div>`;
 const cardLinks=items=>links(items.map(([id,label])=>['bulk.html#'+id,label]));
 const sources=items=>`<div class="analysis-sources">${items.map(({url,label})=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>`;
 const section=article.section;
 const sub=(title,body)=>`<h3>${esc(title)}</h3>${body}`;
 const ordered=items=>`<ol class="analysis-steps">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
 const prerequisiteTopics={
  static:[['elements.html#beam','梁要素'],['theory.html#boundary','境界条件']],
  modes:[['elements.html#beam','梁要素'],['theory.html#modes','実固有値の理論']],
  'complex-modes':[['analysis.html#modes','実固有値解析'],['theory.html#damping','減衰']],
  heat:[['theory.html#heat','熱伝導の理論']],
  'direct-frequency':[['analysis.html#modes','実固有値解析'],['theory.html#damping','減衰']],
  'modal-frequency':[['analysis.html#direct-frequency','直接周波数応答'],['analysis.html#modes','実固有値解析']],
  transient:[['analysis.html#modes','実固有値解析'],['theory.html#damping','減衰']],
  buckling:[['analysis.html#static','静解析'],['theory.html#buckling','座屈の理論']],
  'thermal-stress':[['analysis.html#heat','熱伝導解析'],['theory.html#materials','材料']],
  'thick-cylinder':[['elements.html#solid','ソリッド要素'],['theory.html#common-mesh','メッシュ']],
  'prestressed-modes':[['analysis.html#modes','実固有値解析'],['analysis.html#buckling','座屈解析']],
  fracture:[['theory.html#fracture','亀裂の理論']],
  'large-deformation':[['analysis.html#static','静解析'],['theory.html#large-deformation','大変形の理論']],
  plasticity:[['theory.html#materials','材料'],['theory.html#plasticity','弾塑性の理論']],
  contact:[['theory.html#boundary','境界条件'],['theory.html#contact','接触の理論']]
 };
 const nonlinearPoints={
  fracture:['評価する量は先端最大応力ではなく、K・Gとその適用範囲です。','亀裂面と対称面を区別し、先端付近の節点位置を確かめます。','荷重条件・亀裂寸法・メッシュをそろえ、評価量の収束を確認します。'],
  'large-deformation':['幾何学的非線形を扱い、材料の塑性とは分けて考えます。','荷重増分と各増分内の反復を区別し、収束経過も読みます。','極限点付近では、同じ荷重値だけでなく荷重–変位の経路を比較します。'],
  plasticity:['降伏の開始、降伏後の変形、除荷後の残留を順番に確認します。','最終荷重だけでなく、載荷・除荷の履歴と材料の設定を対応させます。','塑性ヒンジ近似が表す範囲と、断面内の詳細な塑性分布を区別します。'],
  contact:['最初に接触面・すき間と、伝えられる力の向きを確認します。','開離・固着・滑りの状態が変わる場所を、接触力と一緒に読みます。','締付けを扱う場合は、締付け・保持・外力の順序をそろえて比較します。']
 };
 function readingIntro(entry,scenario,model,specific){
  const guide=window.AnalysisScenarioGuides[entry.key];
  const prerequisites=entry.key==='static'
   ?[['elements.html#'+model.id,{beam:'梁要素',shell:'シェル要素',solid:'ソリッド要素'}[model.id]],...prerequisiteTopics.static.slice(1)]
   :prerequisiteTopics[entry.key];
  return article.intro({goals:guide.basics[0][1],prerequisites,
   points:specific?.items|| (scenario?[scenario.summary,model.takeaway,scenario.compare]:nonlinearPoints[entry.key])});
 }
 const guideBasics=g=>g.basics.slice(1).map(([title,items])=>sub(title,list(items))).join('')+sub('用語',conditions(g.terms))+sub('入力を組み立てる順番',ordered(g.steps));
 const verifySteps=g=>g?sub('実行後に確かめる順番',ordered(g.verify)):'';
 // Three tabs grouped by purpose; older tab names in saved links map onto them.
 const tabLabels=[['model','解説'],['input','入力'],['results','結果'],['quiz','問題']];
 const tabAlias={basics:'model',map:'input',dat:'input',pitfalls:'results',compare:'results'};
 const tabOf=key=>{const tab=tabAlias[key]||key;return tabLabels.some(([id])=>id===tab)?tab:'model';};
 function tabbed(current,blocks){
  const shown=tabLabels.filter(([id])=>blocks[id]);
  return `<div class="analysis-tabs" role="tablist" aria-label="この解析の説明">${shown.map(([id,label])=>`<button type="button" role="tab" data-analysis-tab="${id}" aria-selected="${id===current}">${label}</button>`).join('')}</div>`+
   shown.map(([id])=>`<div class="analysis-tab-panel" role="tabpanel" data-analysis-panel="${id}"${id===current?'':' hidden'}>${blocks[id].filter(Boolean).map(([title,body,anchor])=>title?section(title,body,anchor):body).join('')}</div>`).join('');
 }
 function bindTabs(state,save){
  for(const button of detail.querySelectorAll('[data-analysis-tab]'))button.addEventListener('click',()=>{
   state.current=button.dataset.analysisTab;
   for(const item of detail.querySelectorAll('[data-analysis-tab]'))item.setAttribute('aria-selected',String(item===button));
   for(const item of detail.querySelectorAll('[data-analysis-panel]'))item.hidden=item.dataset.analysisPanel!==state.current;
   const bar=detail.querySelector('.analysis-tabs'),shown=detail.querySelector('[data-analysis-panel]:not([hidden])');
   const top=shown.getBoundingClientRect().top+scrollY-bar.offsetHeight-6;
   if(scrollY>top)scrollTo(0,top);
   save();
  });
 }
 const unlinkedCards=new Set(['DMIG','K2PP','SVECT','SDISP','PARAM,FRIC']);
 const displayCard=id=>id.startsWith('EXEC_SOL_')?id.replace('EXEC_SOL_','SOL '):id.replace(/^EXEC_|^CASE_/,'').replace(/^PARAM_/,'PARAM,').replaceAll('_',' ');
 function cardGroups(groups){
  return groups.map(([title,rows])=>`<h3>${esc(title)}</h3>`+conditions(rows.map(([id,body])=>[!unlinkedCards.has(id)?'<a href="bulk.html#'+id+'" data-analysis-card="'+id+'">'+esc(displayCard(id))+'</a>':esc(displayCard(id)),body]),true)).join('');
 }
 function deckSection(deck,open){
  const count=deck.text.trimEnd().split(/\r?\n/).length;
  return `<p>Bulk Dataは8文字固定長です。カード名をタップすると、そのカードのInputデータの説明へ移ります。MSC Nastran本体での実行は未確認です。</p>
   <details id="analysis-original-input"${open?' open':''}><summary>入力データ全文を開く（${count}行）</summary><div class="analysis-original-tools">
   <button type="button" id="save-original-dat" class="button secondary">DATを保存</button><span>${esc(deck.name)}</span></div>
   <pre tabindex="0" aria-label="8文字固定長の入力データ">${window.AnalysisDeckLinks.render(deck.text)}</pre></details>`;
 }
 function saveDeck(deck){
  const url=URL.createObjectURL(new Blob([deck.text],{type:'text/plain'}));
  const link=document.createElement('a');link.href=url;link.download=deck.name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 function heading(entry,summary,extra=''){
  return `<div class="analysis-head"><div class="analysis-title"><h1>${esc(entry.title)}</h1><span class="analysis-sol">${esc(entry.sol)}</span></div>${summary?`<p>${esc(summary)}</p>`:''}${extra}</div>`;
 }
 function contextLinks(entry,related=[]){
  return links([['theory.html#'+entry.key,'この解析の理論'],...related,['analysis.html#model-verification','モデル検証']]);
 }
 function compare(scenario,selected,specific){
  return article.table(scenario.columns,scenario.rows,{caption:scenario.shared,selected})+(specific?`<p>${esc(scenario.compare)}</p>`:'');
 }
 const complexChoices=[
  {id:'analysis-damping-picker',label:'ダンパ',options:[['off','なし'],['on','あり']],value:model=>model.damped?'on':'off'},
  {id:'analysis-method-picker',label:'解法',options:[['107','直接法（SOL 107）'],['110','モード法（SOL 110）']],value:model=>String(model.sol)},
 ];
 function select(id,label,options,value,css=''){
  return `<label class="analysis-selector analysis-model-selector ${css}" for="${id}">${esc(label)}<select id="${id}">${options.map(([key,title])=>`<option value="${esc(key)}"${key===value?' selected':''}>${esc(title)}</option>`).join('')}</select></label>`;
 }
 function scenarioControls(scenario,model,complex){
  if(scenario.studyGroups){
   const group=scenario.studyGroups.find(g=>g.models.some(m=>m.id===model.id));
   return `<div class="analysis-complex-options">${select('analysis-study-picker','比較の目的',scenario.studyGroups.map(g=>[g.id,g.title]),group.id)}${select('analysis-example-picker','モデル',group.models.map(m=>[m.id,m.title]),model.id)}</div>`;
  }
  if(!complex)return select('analysis-example-picker','モデル',
   scenario.models.map(item=>[item.id,item.title]),model.id);
  return `<div class="analysis-complex-options">${complexChoices.map(({id,label,options,value})=>select(id,label,options,value(model))).join('')}</div>`;
 }
 function bucklingSetup(){
  return ordered([
    '静解析SUBCASEを先に定義し、SPCとLOAD、TEMP(LOAD)、DEFORMなどの基準条件を指定します。SPCの強制変位だけで載荷する場合も、どの成分が基準になるか確認します。',
    'その後に座屈SUBCASEを置き、SPCとMETHODを指定します。複数の座屈SUBCASEでは各STATSUBが参照する静解析のIDを明記します。単一の座屈SUBCASEで最初の静解析を使う場合はSTATSUBを省略できます。',
    'METHODからEIGRLまたはEIGBへ番号をつなげます。例えば静解析SUBCASE 10から座屈SUBCASE 30を計算するなら、30側でSTATSUB=10を指定します。METHODが40なら抽出カード側のSIDも40です。',
    'モードを見るSUBCASEで変位出力を要求します。F06の符号付き倍率とモードを組みで読み、基準荷重の方向・大きさに戻して臨界荷重を確認します。近い根は形を見分け、荷重条件やメッシュを点検します。'
   ])+sub('EIGRLでV1・V2・NDを組み合わせる',conditions([
    ['V1・V2あり','NDなしは区間内の全根、NDありは区間内の低い方から最大ND個。'],
    ['V1だけあり','下限以上の根を対象にし、NDなしは最小根、NDありは低い方からND個。'],
    ['V2だけあり','上限以下の根を対象にし、NDなしは全根、NDありは低い方からND個。'],
    ['上下限なし','NDなしは最小根、NDありは低い方からND個。基準荷重と逆向きの根も候補になり得ます。']
   ]))+cardLinks([['EXEC_SOL_105','SOL 105'],['CASE_STATSUB','STATSUB'],['CASE_METHOD','METHOD'],['EIGRL','EIGRL'],['EIGB','EIGB'],['PARAM_EXCLUDE','PARAM,EXCLUDE'],['PARAM_K6ROT','PARAM,K6ROT']]);
 }
 function showScenario(entry,scenario,modelKey,tabKey){
  const complex=entry.key==='complex-modes';
  const model=scenario.models.find(item=>item.id===modelKey)||scenario.models[0];
  const comparison=scenario.studyGroups?.find(g=>g.models.some(m=>m.id===model.id))||scenario;
  const deck=window.AnalysisOriginalDecks[model.id];
  const figure=`<figure class="analysis-scenario-figure">${window.renderAnalysisScenarioDiagram(model.diagram)}<figcaption>${esc(model.diagramCaption||'境界条件の模式図')}</figcaption></figure>`;
  const selection=scenarioControls(scenario,model,complex);
  const related=[...(scenario.links||[])];
  if(entry.key==='static')related.push(
   ['analysis.html#model-verification','モデル検証'],
   ['analysis.html#material-check','材料と断面の照合'],
   ['analysis.html#constraint-check','支持・強制変位の照合'],
   ['analysis.html#load-check','荷重・反力の照合'],
  );
  const guide=window.AnalysisScenarioGuides?.[entry.key];
  const quiz=window.AnalysisQuiz?.resolve(entry.key,model.id);
  const specific=window.AnalysisModelGuides?.[model.id];
  const state={current:tabOf(tabKey)==='quiz'&&!quiz?'model':tabOf(tabKey)};
  // "dat" in the address means the Input tab with the full deck open, so Back from a card returns there.
  const token=()=>state.current==='input'&&byId('analysis-original-input')?.open?'dat':state.current;
  const place=(id,tab)=>'#'+entry.key+'/'+id+(tab&&tab!=='model'?'/'+tab:'');
  detail.innerHTML=heading(entry,'')+selection+figure+(tabbed(state.current,{
      model:[[null,readingIntro(entry,scenario,model,specific)],['モデル化と境界条件',conditions(model.conditions)],specific?.explanation&&['条件から結果までをつなぐ',specific.explanation()],guide&&['この解析で共通する基礎',specific?'<div class=theory-quiz><details><summary>全モデルに共通する用語と手順</summary>'+guideBasics(guide)+'</details></div>':guideBasics(guide)]],
      input:[['カードの相関図',window.renderAnalysisRelations(entry.key,model.id),'analysis-relations'],
       entry.key==='buckling'&&['SOL 105で静解析と座屈を対応させる',bucklingSetup(),'analysis-buckling-setup'],
       guide?.inputReview&&['入力で確認する指定',cardGroups(guide.inputReview)+sources([{url:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide.pdf#page=38',label:'線形静解析ユーザーガイド 2025.1 · 第2章 PDF 38–40ページ'}])],
       specific?.inputReview&&['このモデルで指定する内容',cardGroups(specific.inputReview)],
       deck&&['自作モデルのDAT',deckSection(deck,tabKey==='dat')],
       !deck&&['入力モデルの扱い','<p>境界条件と入力の役割を比較する理論教材です。この比較用の実行確認済み入力ファイルは未収録です。下記の数値は理論値で、MSC Nastranの実行結果ではありません。</p>']],
      quiz:quiz&&[['入力の4択問題',window.AnalysisQuiz.render(entry.key,model.id),'analysis-quiz']],
      results:[...(entry.key==='modes'?(window.AnalysisModalOutput?.sections(model.id)||[]):[]),['結果の読み方',list(model.results)+cardLinks(model.check)+verifySteps(specific||guide)],specific?.resultExtra&&['照合する量と条件',specific.resultExtra()],['prestressed-modes','complex-modes','modal-frequency','transient'].includes(entry.key)&&['実モードの結果を確認する',window.AnalysisModalOutput?.reference()||''],['モデル間の比較',compare(comparison,comparison.models.indexOf(model),specific)],specific?.pitfalls?['このモデルで間違えやすい点',conditions(specific.pitfalls)]:guide&&['よくある失敗と直し方',conditions(guide.pitfalls)]]
     }))+
   contextLinks(entry,related)+sources(scenario.sources||entry.sources);
  bindTabs(state,()=>history.replaceState(null,'',place(model.id,token())));
  if(quiz)window.AnalysisQuiz.bind(detail);
  window.AnalysisStructureLabs?.bind(detail);
  window.AnalysisEigenLabs?.bind(detail);
  window.AnalysisResponseLabs?.bind(detail);
  window.AnalysisModalOutput?.bind(detail);
  byId('analysis-original-input')?.addEventListener('toggle',()=>history.replaceState(null,'',place(model.id,token())));
  byId('save-original-dat')?.addEventListener('click',()=>saveDeck(deck));
  function changeModel(id,controlId){
   const tab=token();
   history.replaceState(null,'',place(id,tab));
   showScenario(entry,scenario,id,tab);
   byId(controlId)?.focus({preventScroll:true});
  }
  if(complex){
   for(const {id} of complexChoices)byId(id).addEventListener('change',()=>{
    const selected=scenario.models.find(item=>complexChoices.every(choice=>choice.value(item)===byId(choice.id).value));
    if(selected)changeModel(selected.id,id);
   });
  }
  const modelPicker=byId('analysis-example-picker');
  modelPicker?.addEventListener('change',()=>changeModel(modelPicker.value,modelPicker.id));
  const studyPicker=byId('analysis-study-picker');
  studyPicker?.addEventListener('change',()=>changeModel(scenario.studyGroups.find(g=>g.id===studyPicker.value).models[0].id,studyPicker.id));
 }
 function solverLinks(key,simcenter=false){
  return `<nav class="solver-options" aria-label="対象ソルバー"><a href="#${key}"${simcenter?'':' aria-current="page"'}>MSC Nastran</a><a href="#${key}/simcenter"${simcenter?' aria-current="page"':''}>Simcenter Nastran</a></nav>`;
 }
 function showSimcenter(entry,tabKey){
  const item=scope.nonlinear[entry.key];
  const state={current:tabOf(tabKey)==='quiz'?'model':tabOf(tabKey)};
  document.title=entry.title+' · Simcenter Nastran';
  detail.innerHTML=`<div class="analysis-head"><span class="analysis-sol">Simcenter Nastran · SOL 401／402</span><h1>${esc(entry.title)}</h1>${solverLinks(entry.key,true)}<p class="solver-scope">Siemensの公開資料で確認した機能と、使用版で照合する設定です。</p></div>`+
   tabbed(state.current,{
    model:[[null,readingIntro(entry,null,{})]],
    input:[[item.steps[0][0],`<p>${esc(item.steps[0][1])}</p>`]],
    results:[[item.steps[1][0],`<p>${esc(item.steps[1][1])}</p>`]]
   })+
   contextLinks(entry)+sources([{url:scope.support,label:'Siemens公式ドキュメント案内'},{url:scope.training,label:'Siemens公式のSOL 401／402講習'}]);
  bindTabs(state,()=>history.replaceState(null,'','#'+entry.key+'/simcenter/'+state.current));
 }
 function showAnalysis(entry,modelKey,tabKey){
  const variants=entry.variants||[];
  const model=variants.find(item=>item.id===modelKey)||variants[0]||{};
  const note=scope.nonlinear[entry.key]?.msc||scope.analysisNote(entry.key).replace('・例題','').replace('入力例','主要カード');
  const selector=variants.length>1?`<label class="analysis-selector analysis-model-selector" for="analysis-example-picker">モデル<select id="analysis-example-picker">${variants.map(item=>`<option value="${item.id}">${esc(item.title)}</option>`).join('')}</select></label>`:'';
  const diagram=`<div class="analysis-visual">${window.analysisDiagram(entry.key,model.id)}</div>`;
  const related=[...(entry.links||[])];
  const guide=window.AnalysisScenarioGuides?.[entry.key];
  const head=heading(entry,'',scope.nonlinear[entry.key]?solverLinks(entry.key):'')+selector;
  const modelBody=`<p>${esc(entry.summary)}</p><p class="solver-scope">${esc(note)}</p>`+conditions(model.inputs||entry.inputs);
  const mapBody=window.renderAnalysisRelations(entry.key,model.id);
  const resultBody=list(model.outputs||entry.outputs)+`<h3>確認する条件</h3>`+list(model.checks||entry.checks)+links(entry.resultLinks||[]);
  if(guide){
   const state={current:tabOf(tabKey)==='quiz'?'model':tabOf(tabKey)};
   detail.innerHTML=head+diagram+tabbed(state.current,{
     model:[[null,readingIntro(entry,null,model)],['モデル化と境界条件',modelBody],['この解析の基礎',guideBasics(guide)]],
     input:[['主要カードの相関図',mapBody,'analysis-relations']],
     results:[['結果の読み方・照合',resultBody+verifySteps(guide)],['よくある失敗と直し方',conditions(guide.pitfalls)]]
    })+
    contextLinks(entry,related)+sources(entry.sources);
   bindTabs(state,()=>history.replaceState(null,'','#'+entry.key+'/'+(model.id||'msc')+(state.current==='model'?'':'/'+state.current)));
  }else detail.innerHTML=head+
   section('1 · モデルと境界条件',diagram+modelBody)+
   section('2 · 主要カードの相関図',mapBody,'analysis-relations')+
   section('3 · 結果の読み方・照合',resultBody)+
   contextLinks(entry,related)+sources(entry.sources);
  if(selector){
   const modelPicker=byId('analysis-example-picker');
   modelPicker.value=model.id;
   modelPicker.addEventListener('change',()=>{
    history.replaceState(null,'','#'+entry.key+'/'+modelPicker.value);
    showAnalysis(entry,modelPicker.value,'model');
    byId('analysis-example-picker').focus({preventScroll:true});
   });
  }
 }
 const movedReferences={input:'input.html#rules',relations:'input.html#executive',run:'workflow.html#run',results:'workflow.html#results',verification:'analysis.html#index'};
 function route(){
  let [key,model,subsection]=location.hash.slice(1).split('/');
  // Saved bookmarks and existing app binaries may still open the previous hashes.
  if(key==='common'){
   if(movedReferences[model]){
    detail.innerHTML=links([[movedReferences[model],'移動先の解説']]);
    detail.querySelector('a').click();
    return;
   }
   key=Object.hasOwn(window.AnalysisReferenceTopics,model)?model:'index';
   history.replaceState(null,'','#'+key);
  }
  if(!key||key==='index'){
   picker.value='index';
   document.title='解析 — FEM Guide';
   const items=window.NASTRAN_LEARNING.navigation.analyses;
   const groups=[...new Set(items.map(item=>item.group))];
   detail.innerHTML='<div class="analysis-head"><h1>解析</h1><p>解析の種類、または確認したい作業を選んでください。</p></div>'+groups.map(group=>section(esc(group),items.filter(item=>item.group===group).map(item=>`<article class="analysis-index-item"><a href="${esc(item.path+item.hash)}"><strong>${esc(item.title)}</strong> · ${esc(item.kind)}</a><p>${esc(item.description)}</p></article>`).join(''))).join('');
   return;
  }
  if(Object.hasOwn(window.AnalysisReferenceTopics,key)){
   picker.value=['model-verification','restart','database'].includes(key)?key:'index';
   const title=window.AnalysisReferenceTopics[key];
   document.title=title+' — FEM Guide';
   const template=document.createElement('template');
   template.innerHTML=window.AnalysisReferenceHTML;
   const selected=template.content.querySelector('#analysis-common-'+key);
   selected.querySelector('h2')?.remove();
   for(const el of [selected,...selected.querySelectorAll('.analysis-section')]){el.classList.remove('analysis-section');el.classList.add('theory-section');}
   for(const el of selected.querySelectorAll('.analysis-reference-table')){el.classList.remove('analysis-reference-table');el.classList.add('element-table');}
   for(const el of selected.querySelectorAll('.analysis-table-wrap')){el.classList.remove('analysis-table-wrap');el.classList.add('element-table-wrap');}
   detail.innerHTML='<div class="analysis-head"><h1>'+esc(title)+'</h1></div>'+selected.outerHTML+links([['analysis.html#index','解析一覧']]);
   return;
  }
  const entry=catalog.entries.find(item=>item.key===key)||catalog.entries[0];
  picker.value=entry.key;
  document.title=entry.title+' — FEM Guide';
  if(model==='simcenter'&&Object.hasOwn(scope.nonlinear,entry.key))showSimcenter(entry,subsection);
  else if(Object.hasOwn(scenarios,entry.key))showScenario(entry,scenarios[entry.key],model,subsection);
  else showAnalysis(entry,model,subsection);
  if(subsection==='map')requestAnimationFrame(()=>byId('analysis-relations')?.scrollIntoView({block:'start'}));
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const groups=new Map();
  const listed=new Set();
  for(const item of window.NASTRAN_LEARNING.navigation.analyses){
   const entry=catalog.entries.find(e=>e.key===item.hash.slice(1));
   if(!entry)continue;
   if(!groups.has(item.group))groups.set(item.group,[]);
   groups.get(item.group).push(entry);
   listed.add(entry.key);
  }
  const remaining=catalog.entries.filter(e=>!listed.has(e.key));
  if(remaining.length)groups.set('その他',remaining);
  picker.innerHTML='<option value="index">解析一覧</option>'+[...groups].map(([group,entries])=>
   `<optgroup label="${esc(group)}">${entries.map(e=>`<option value="${e.key}">${esc(e.title)}（${esc(e.sol)}）</option>`).join('')}</optgroup>`).join('')+
   '<optgroup label="検証・再実行">'+['model-verification','restart','database'].map(key=>`<option value="${key}">${esc(window.AnalysisReferenceTopics[key])}</option>`).join('')+'</optgroup>';
  picker.addEventListener('change',()=>{location.hash=picker.value;window.scrollTo(0,0);});
  addEventListener('hashchange',route);
  route();
 });
})();
