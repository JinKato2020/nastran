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
 const guidePitfalls=g=>sub('よくある失敗と直し方',conditions(g.pitfalls))+sub('実行後に確かめる順番',ordered(g.verify));
 const explanation=window.AnalysisScenarioCards;
 const unlinkedCards=new Set(['DMIG','K2PP','SVECT','SDISP','PARAM,FRIC']);
 const displayCard=id=>id.startsWith('EXEC_SOL_')?id.replace('EXEC_SOL_','SOL '):id.replace(/^EXEC_|^CASE_/,'').replace(/^PARAM_/,'PARAM,').replaceAll('_',' ');
 function cardGroups(groups){
  return groups.map(([title,rows])=>`<h3 class="analysis-card-group">${esc(title)}</h3>`+conditions(rows.map(([id,body])=>[!unlinkedCards.has(id)?'<a href="bulk.html#'+id+'" data-analysis-card="'+id+'">'+esc(displayCard(id))+'</a>':esc(displayCard(id)),body]),true)).join('');
 }
 function deckSection(deck){
  const count=deck.text.trimEnd().split(/\r?\n/).length;
  return `<p>Bulk Dataは8文字固定長です。MSC Nastran本体での実行は未確認です。</p>
   <details id="analysis-original-input"><summary>入力データ全文を開く（${count}行）</summary><div class="analysis-original-tools">
   <button type="button" id="save-original-dat" class="button secondary">DATを保存</button><span>${esc(deck.name)}</span></div>
   <pre tabindex="0" aria-label="8文字固定長の入力データ">${esc(deck.text)}</pre></details>`;
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
  return links([['theory.html#'+entry.key,'この解析の理論'],...related,['analysis.html#common','共通の確認手順']]);
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
 function showScenario(entry,scenario,modelKey,tabKey){
  const reference=explanation.official[entry.key];
  const official=modelKey==='official'&&!!reference;
  const complex=entry.key==='complex-modes';
  const model=scenario.models.find(item=>item.id===modelKey)||scenario.models[0];
  const deck=window.AnalysisOriginalDecks[model.id];
  const figure=`<figure class="analysis-scenario-figure">${window.renderAnalysisScenarioDiagram(official?entry.key+'-official':model.diagram)}<figcaption>境界条件の模式図</figcaption><p>${esc(official?reference.title:model.takeaway)}</p></figure>`;
  const selection=scenarioControls(scenario,reference,model,official,complex);
  const related=complex&&!official?[['analysis.html#complex-modes/official','公式例題 · '+reference.title],...scenario.links]:scenario.links;
  const guide=window.AnalysisScenarioGuides?.[entry.key];
  const tabs=[['model','条件'],...(guide?[['basics','基礎']]:[]),['map','カード相関図'],['dat','DAT'],['results','結果'],...(guide?[['pitfalls','つまずき']]:[]),['compare','比較']];
  let current=!official&&tabs.some(([id])=>id===tabKey)?tabKey:'model';
  const panel=(id,title,body,anchor='')=>`<section class="analysis-section analysis-tab-panel" role="tabpanel" data-analysis-panel="${id}"${anchor?' id="'+anchor+'"':''}${id===current?'':' hidden'}><h2>${title}</h2>${body}</section>`;
  const tabBar=`<div class="analysis-tabs" role="tablist" aria-label="このモデルの説明">${tabs.map(([id,label])=>`<button type="button" role="tab" data-analysis-tab="${id}" aria-selected="${id===current}">${label}</button>`).join('')}</div>`;
  const place=(id,tab)=>'#'+entry.key+'/'+id+(tab&&tab!=='model'?'/'+tab:'');
  detail.innerHTML=heading(entry,'')+selection+figure+(official
   ? `<p class="analysis-scenario-summary">${esc(reference.intro)}</p>`+
     sources([reference.source])+section('公式例題の主要カード',cardGroups(reference.groups),'analysis-relations')
   : tabBar+
     panel('model','モデル化と境界条件',`<p class="analysis-scenario-summary">${esc(scenario.summary)}</p>`+conditions(model.conditions))+
     (guide?panel('basics','この解析の基礎',guideBasics(guide)):'')+
     panel('map','カードの相関図',window.renderAnalysisRelations(entry.key,model.id),'analysis-relations')+
     panel('dat','自作モデルのDAT',deckSection(deck))+
     panel('results','結果の読み方',list(model.results)+cardLinks(model.check))+
     (guide?panel('pitfalls','つまずきやすい点と確認',guidePitfalls(guide)):'')+
     panel('compare','モデル間の比較',compare(scenario,scenario.models.indexOf(model))))+
   contextLinks(entry,related)+sources(scenario.sources||entry.sources);
  for(const button of detail.querySelectorAll('[data-analysis-tab]'))button.addEventListener('click',()=>{
   current=button.dataset.analysisTab;
   for(const item of detail.querySelectorAll('[data-analysis-tab]'))item.setAttribute('aria-selected',String(item===button));
   for(const item of detail.querySelectorAll('[data-analysis-panel]'))item.hidden=item.dataset.analysisPanel!==current;
   history.replaceState(null,'',place(model.id,current));
  });
  byId('save-original-dat')?.addEventListener('click',()=>saveDeck(deck));
  function changeModel(id,controlId){
   history.replaceState(null,'',place(id,current));
   showScenario(entry,scenario,id,current);
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
   const tabs=[['model','条件'],['basics','基礎'],['map','カード相関図'],['results','結果'],['pitfalls','つまずき']];
   let current=tabs.some(([id])=>id===tabKey)?tabKey:'model';
   const panel=(id,title,body,anchor='')=>`<section class="analysis-section analysis-tab-panel" role="tabpanel" data-analysis-panel="${id}"${anchor?' id="'+anchor+'"':''}${id===current?'':' hidden'}><h2>${title}</h2>${body}</section>`;
   detail.innerHTML=head+diagram+
    `<div class="analysis-tabs" role="tablist" aria-label="この解析の説明">${tabs.map(([id,label])=>`<button type="button" role="tab" data-analysis-tab="${id}" aria-selected="${id===current}">${label}</button>`).join('')}</div>`+
    panel('model','モデル化と境界条件',modelBody)+panel('basics','この解析の基礎',guideBasics(guide))+
    panel('map','主要カードの相関図',mapBody,'analysis-relations')+panel('results','結果の読み方・照合',resultBody)+
    panel('pitfalls','つまずきやすい点と確認',guidePitfalls(guide))+
    contextLinks(entry,related)+sources(entry.sources);
   for(const button of detail.querySelectorAll('[data-analysis-tab]'))button.addEventListener('click',()=>{
    current=button.dataset.analysisTab;
    for(const item of detail.querySelectorAll('[data-analysis-tab]'))item.setAttribute('aria-selected',String(item===button));
    for(const item of detail.querySelectorAll('[data-analysis-panel]'))item.hidden=item.dataset.analysisPanel!==current;
    history.replaceState(null,'','#'+entry.key+'/'+(model.id||'msc')+(current==='model'?'':'/'+current));
   });
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
 function route(){
  const [key,model,subsection]=location.hash.slice(1).split('/');
  if(!key||key==='common'){
   picker.value='common';
   document.title='共通 — FEM Guide';
   detail.innerHTML=window.AnalysisCommon;
   const target=byId('analysis-common-'+model);
   if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
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
 picker.innerHTML='<option value="common">共通</option>'+catalog.entries.map(e=>`<option value="${e.key}">${esc(e.title)}（${esc(e.sol)}）</option>`).join('');
 picker.addEventListener('change',()=>{location.hash=picker.value;window.scrollTo(0,0);});
 addEventListener('hashchange',route);
 route();
})();
