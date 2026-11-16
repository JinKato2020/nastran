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
 const conditions=(rows,cardLabels=false)=>`<dl class="analysis-inputs">${rows.map(([label,body])=>`<div><dt>${cardLabels?label:esc(label)}</dt><dd>${esc(body)}</dd></div>`).join('')}</dl>`;
 const links=items=>`<div class="analysis-links">${items.map(([url,label])=>`<a href="${esc(url)}">${esc(label)} →</a>`).join('')}</div>`;
 const cardLinks=items=>links(items.map(([id,label])=>['bulk.html#'+id,label]));
 const sources=items=>`<div class="analysis-sources">${items.map(({url,label})=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>`;
 const section=(title,body,id='')=>`<section class="analysis-section"${id?' id="'+id+'"':''}><h2>${title}</h2>${body}</section>`;
 const sub=(title,body)=>`<h3 class="analysis-card-group">${esc(title)}</h3>${body}`;
 const ordered=items=>`<ol class="analysis-steps">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ol>`;
 const guideBasics=g=>g.basics.map(([title,items])=>sub(title,list(items))).join('')+sub('用語',conditions(g.terms))+sub('入力を組み立てる順番',ordered(g.steps));
 const verifySteps=g=>g?sub('実行後に確かめる順番',ordered(g.verify)):'';
 // Three tabs grouped by purpose; older tab names in saved links map onto them.
 const tabLabels=[['model','解説'],['input','入力'],['results','結果']];
 const tabAlias={basics:'model',map:'input',dat:'input',pitfalls:'results',compare:'results'};
 const tabOf=key=>{const tab=tabAlias[key]||key;return tabLabels.some(([id])=>id===tab)?tab:'model';};
 function tabbed(current,blocks){
  return `<div class="analysis-tabs" role="tablist" aria-label="この解析の説明">${tabLabels.map(([id,label])=>`<button type="button" role="tab" data-analysis-tab="${id}" aria-selected="${id===current}">${label}</button>`).join('')}</div>`+
   tabLabels.map(([id])=>`<div class="analysis-tab-panel" role="tabpanel" data-analysis-panel="${id}"${id===current?'':' hidden'}>${blocks[id].filter(Boolean).map(([title,body,anchor])=>section(title,body,anchor)).join('')}</div>`).join('');
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
 const explanation=window.AnalysisScenarioCards;
 const unlinkedCards=new Set(['DMIG','K2PP','SVECT','SDISP','PARAM,FRIC']);
 const displayCard=id=>id.startsWith('EXEC_SOL_')?id.replace('EXEC_SOL_','SOL '):id.replace(/^EXEC_|^CASE_/,'').replace(/^PARAM_/,'PARAM,').replaceAll('_',' ');
 function cardGroups(groups){
  return groups.map(([title,rows])=>`<h3 class="analysis-card-group">${esc(title)}</h3>`+conditions(rows.map(([id,body])=>[!unlinkedCards.has(id)?'<a href="bulk.html#'+id+'" data-analysis-card="'+id+'">'+esc(displayCard(id))+'</a>':esc(displayCard(id)),body]),true)).join('');
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
 function compare(scenario,selected){
  return `<table class="analysis-scenario-comparison"><caption>${esc(scenario.shared)}</caption><thead><tr>${scenario.columns.map(col=>`<th scope="col">${esc(col)}</th>`).join('')}</tr></thead><tbody>${scenario.rows.map(([name,...cells],index)=>`<tr${index===selected?' aria-current="true"':''}><th scope="row">${esc(name)}</th>${cells.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="analysis-scenario-summary">${esc(scenario.compare)}</p>`;
 }
 const complexChoices=[
  {id:'analysis-damping-picker',label:'ダンパ',options:[['off','なし'],['on','あり']],value:model=>model.damped?'on':'off'},
  {id:'analysis-method-picker',label:'解法',options:[['107','直接法（SOL 107）'],['110','モード法（SOL 110）']],value:model=>String(model.sol)},
 ];
 function select(id,label,options,value,css=''){
  return `<label class="analysis-selector analysis-model-selector ${css}" for="${id}">${esc(label)}<select id="${id}">${options.map(([key,title])=>`<option value="${esc(key)}"${key===value?' selected':''}>${esc(title)}</option>`).join('')}</select></label>`;
 }
 function scenarioControls(scenario,reference,model,official,complex){
  if(!complex)return select('analysis-example-picker','モデル',
   [...scenario.models.map(item=>[item.id,item.title]),...(reference?[['official','公式例題 · '+reference.title]]:[])],official?'official':model.id);
  if(official)return `<a class="analysis-example-switch" href="#complex-modes/${model.id}">自作例を見る →</a>`;
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
  const reference=explanation.official[entry.key];
  const official=modelKey==='official'&&!!reference;
  const complex=entry.key==='complex-modes';
  const model=scenario.models.find(item=>item.id===modelKey)||scenario.models[0];
  const deck=window.AnalysisOriginalDecks[model.id];
  const figure=`<figure class="analysis-scenario-figure">${window.renderAnalysisScenarioDiagram(official?entry.key+'-official':model.diagram)}<figcaption>境界条件の模式図</figcaption><p>${esc(official?reference.title:model.takeaway)}</p></figure>`;
  const selection=scenarioControls(scenario,reference,model,official,complex);
  const related=complex&&!official?[['analysis.html#complex-modes/official','公式例題 · '+reference.title],...scenario.links]:[...(scenario.links||[])];
  if(entry.key==='static')related.push(
   ['analysis.html#model-verification','モデル検証'],
   ['analysis.html#material-check','材料と断面の照合'],
   ['analysis.html#constraint-check','支持・強制変位の照合'],
   ['analysis.html#load-check','荷重・反力の照合'],
  );
  const guide=window.AnalysisScenarioGuides?.[entry.key];
  const state={current:official?'model':tabOf(tabKey)};
  // "dat" in the address means the Input tab with the full deck open, so Back from a card returns there.
  const token=()=>state.current==='input'&&byId('analysis-original-input')?.open?'dat':state.current;
  const place=(id,tab)=>'#'+entry.key+'/'+id+(tab&&tab!=='model'?'/'+tab:'');
  detail.innerHTML=heading(entry,'')+selection+figure+(official
   ? `<p class="analysis-scenario-summary">${esc(reference.intro)}</p>`+
     sources([reference.source])+section('公式例題の主要カード',cardGroups(reference.groups),'analysis-relations')
   : tabbed(state.current,{
      model:[['モデル化と境界条件',`<p class="analysis-scenario-summary">${esc(scenario.summary)}</p>`+conditions(model.conditions)],guide&&['この解析の基礎',guideBasics(guide)]],
      input:[['カードの相関図',window.renderAnalysisRelations(entry.key,model.id),'analysis-relations'],
       entry.key==='buckling'&&['SOL 105で静解析と座屈を対応させる',bucklingSetup(),'analysis-buckling-setup'],
       guide?.inputReview&&['入力で確認する指定',cardGroups(guide.inputReview)+sources([{url:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide.pdf#page=38',label:'線形静解析ユーザーガイド 2025.1 · 第2章 PDF 38–40ページ'}])],
       ['自作モデルのDAT',deckSection(deck,tabKey==='dat')]],
      results:[['結果の読み方',list(model.results)+cardLinks(model.check)+verifySteps(guide)],['モデル間の比較',compare(scenario,scenario.models.indexOf(model))],guide&&['よくある失敗と直し方',conditions(guide.pitfalls)]]
     }))+
   contextLinks(entry,related)+sources(scenario.sources||entry.sources);
  bindTabs(state,()=>history.replaceState(null,'',place(model.id,token())));
  byId('analysis-original-input')?.addEventListener('toggle',()=>history.replaceState(null,'',place(model.id,token())));
  byId('save-original-dat')?.addEventListener('click',()=>saveDeck(deck));
  function changeModel(id,controlId){
   const tab=token();
   history.replaceState(null,'',place(id,tab));
   showScenario(entry,scenario,id,tab);
   byId(controlId)?.focus({preventScroll:true});
  }
  if(complex&&!official){
   for(const {id} of complexChoices)byId(id).addEventListener('change',()=>{
    const selected=scenario.models.find(item=>complexChoices.every(choice=>choice.value(item)===byId(choice.id).value));
    if(selected)changeModel(selected.id,id);
   });
  }
  const modelPicker=byId('analysis-example-picker');
  modelPicker?.addEventListener('change',()=>changeModel(modelPicker.value,modelPicker.id));
 }
 function solverLinks(key,simcenter=false){
  return `<nav class="solver-options" aria-label="対象ソルバー"><a href="#${key}"${simcenter?'':' aria-current="page"'}>MSC Nastran</a><a href="#${key}/simcenter"${simcenter?' aria-current="page"':''}>Simcenter Nastran</a></nav>`;
 }
 function showSimcenter(entry){
  const item=scope.nonlinear[entry.key];
  document.title=entry.title+' · Simcenter Nastran';
  detail.innerHTML=`<div class="analysis-head"><span class="analysis-sol">Simcenter Nastran · SOL 401／402</span><h1>${esc(entry.title)}</h1>${solverLinks(entry.key,true)}<p class="solver-scope">Siemensの公開資料で確認した機能と、使用版で照合する設定です。</p></div>`+
   item.steps.map(([title,body])=>section(esc(title),`<p>${esc(body)}</p>`)).join('')+
   contextLinks(entry)+sources([{url:scope.support,label:'Siemens公式ドキュメント案内'},{url:scope.training,label:'Siemens公式のSOL 401／402講習'}]);
 }
 function showAnalysis(entry,modelKey,tabKey){
  const variants=entry.variants||[];
  const model=variants.find(item=>item.id===modelKey)||variants[0]||{};
  const note=scope.nonlinear[entry.key]?.msc||scope.analysisNote(entry.key).replace('・例題','').replace('入力例','主要カード');
  const selector=variants.length>1?`<label class="analysis-selector analysis-model-selector" for="analysis-example-picker">モデル<select id="analysis-example-picker">${variants.map(item=>`<option value="${item.id}">${esc(item.title)}</option>`).join('')}</select></label>`:'';
  const diagram=`<div class="analysis-visual">${window.analysisDiagram(entry.key,model.id)}</div>`;
  const related=[...(entry.links||[])];
  const guide=window.AnalysisScenarioGuides?.[entry.key];
  const head=heading(entry,entry.summary,scope.nonlinear[entry.key]?solverLinks(entry.key):'')+selector;
  const modelBody=`<p class="solver-scope">${esc(note)}</p>`+conditions(model.inputs||entry.inputs);
  const mapBody=window.renderAnalysisRelations(entry.key,model.id);
  const resultBody=list(model.outputs||entry.outputs)+`<h3>確認する条件</h3>`+list(model.checks||entry.checks)+links(entry.resultLinks||[]);
  if(guide){
   const state={current:tabOf(tabKey)};
   detail.innerHTML=head+diagram+tabbed(state.current,{
     model:[['モデル化と境界条件',modelBody],['この解析の基礎',guideBasics(guide)]],
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
   detail.innerHTML='<div class="analysis-head"><h1>'+esc(title)+'</h1></div>'+selected.outerHTML+links([['analysis.html#index','解析一覧']]);
   return;
  }
  const entry=catalog.entries.find(item=>item.key===key)||catalog.entries[0];
  picker.value=entry.key;
  document.title=entry.title+' — FEM Guide';
  if(model==='simcenter'&&Object.hasOwn(scope.nonlinear,entry.key))showSimcenter(entry);
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
