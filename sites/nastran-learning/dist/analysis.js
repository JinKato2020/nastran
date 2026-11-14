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
 const conditions=rows=>`<dl class="analysis-inputs">${rows.map(([label,body])=>`<div><dt>${esc(label)}</dt><dd>${esc(body)}</dd></div>`).join('')}</dl>`;
 const links=items=>`<div class="analysis-links">${items.map(([url,label])=>`<a href="${esc(url)}">${esc(label)} →</a>`).join('')}</div>`;
 const cardLinks=items=>links(items.map(([id,label])=>['bulk.html#'+id,label]));
 const sources=items=>`<div class="analysis-sources">${items.map(({url,label})=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`).join('')}</div>`;
 const section=(title,body,id='')=>`<section class="analysis-section"${id?' id="'+id+'"':''}><h2>${title}</h2>${body}</section>`;
 const displayCard=id=>id.startsWith('CASE_')?id.slice(5):id.startsWith('EXEC_SOL_')?id.replace('EXEC_SOL_','SOL '):id;
 function chains(rows){
  return `<div class="analysis-scenario-chains">${rows.map(row=>{
   const cards=row.split('|').map(id=>`<a href="bulk.html#${id}" data-relation-card="${id}">${displayCard(id)}</a>`);
   return `<div class="analysis-scenario-chain">${cards.join('<span aria-hidden="true">→</span>')}</div>`;
  }).join('')}</div>`;
 }
 function heading(entry,summary,extra=''){
  return `<div class="analysis-head"><span class="analysis-sol">MSC Nastran · ${esc(entry.sol)}</span><h1>${esc(entry.title)}</h1>${summary?`<p>${esc(summary)}</p>`:''}${extra}</div>`;
 }
 function contextLinks(entry,related=[]){
  return links([['theory.html#'+entry.key,'この解析の理論'],...related,['analysis.html#common','共通の確認手順']]);
 }
 function compare(scenario,selected){
  return `<table class="analysis-scenario-comparison"><caption>${esc(scenario.shared)}</caption><thead><tr>${scenario.columns.map(col=>`<th scope="col">${esc(col)}</th>`).join('')}</tr></thead><tbody>${scenario.rows.map(([name,...cells],index)=>`<tr${index===selected?' aria-current="true"':''}><th scope="row">${esc(name)}</th>${cells.map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p class="analysis-scenario-summary">${esc(scenario.compare)}</p>`;
 }
 function showScenario(entry,scenario,modelKey){
  const model=scenario.models.find(item=>item.id===modelKey)||scenario.models[0];
  const figure=`<figure class="analysis-scenario-figure">${window.renderAnalysisScenarioDiagram(model.diagram)}<figcaption>境界条件の模式図</figcaption><p>${esc(model.takeaway)}</p></figure>`;
  detail.innerHTML=heading(entry,'')+
   `<label class="analysis-selector analysis-model-selector" for="analysis-example-picker">モデル<select id="analysis-example-picker">${scenario.models.map(item=>`<option value="${item.id}">${esc(item.title)}</option>`).join('')}</select></label>`+
   figure+`<p class="analysis-scenario-summary">${esc(scenario.summary)}</p>`+
   section('1 · モデル化と境界条件',conditions(model.conditions))+
   section('2 · 主要カードの相関図',chains(model.chains)+`<p>${esc(model.meaning)}</p>`,'analysis-relations')+
   section('3 · 結果の読み方',list(model.results)+cardLinks(model.check))+
   section('4 · モデル間の比較',compare(scenario,scenario.models.indexOf(model)))+
   contextLinks(entry,scenario.links)+sources(scenario.sources||entry.sources);
  const modelPicker=byId('analysis-example-picker');
  modelPicker.value=model.id;
  modelPicker.addEventListener('change',()=>{
   history.replaceState(null,'','#'+entry.key+'/'+modelPicker.value);
   showScenario(entry,scenario,modelPicker.value);
   byId('analysis-example-picker').focus({preventScroll:true});
  });
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
 function showAnalysis(entry,modelKey){
  const variants=entry.variants||[];
  const model=variants.find(item=>item.id===modelKey)||variants[0]||{};
  const note=scope.nonlinear[entry.key]?.msc||scope.analysisNote(entry.key).replace('・例題','').replace('入力例','主要カード');
  const selector=variants.length>1?`<label class="analysis-selector analysis-model-selector" for="analysis-example-picker">モデル<select id="analysis-example-picker">${variants.map(item=>`<option value="${item.id}">${esc(item.title)}</option>`).join('')}</select></label>`:'';
  const diagram=`<div class="analysis-visual">${window.analysisDiagram(entry.key,model.id)}</div>`;
  const related=[...(entry.links||[])];
  detail.innerHTML=heading(entry,entry.summary,scope.nonlinear[entry.key]?solverLinks(entry.key):'')+selector+
   section('1 · モデルと境界条件',diagram+`<p class="solver-scope">${esc(note)}</p>`+conditions(model.inputs||entry.inputs))+
   section('2 · 主要カードの相関図',window.renderAnalysisRelations(entry.key,model.id),'analysis-relations')+
   section('3 · 結果の読み方・照合',list(model.outputs||entry.outputs)+`<h3>確認する条件</h3>`+list(model.checks||entry.checks)+links(entry.resultLinks||[]))+
   contextLinks(entry,related)+sources(entry.sources);
  if(selector){
   const modelPicker=byId('analysis-example-picker');
   modelPicker.value=model.id;
   modelPicker.addEventListener('change',()=>{
    history.replaceState(null,'','#'+entry.key+'/'+modelPicker.value);
    showAnalysis(entry,modelPicker.value);
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
  else if(Object.hasOwn(scenarios,entry.key))showScenario(entry,scenarios[entry.key],model);
  else showAnalysis(entry,model);
  if(subsection==='map')requestAnimationFrame(()=>byId('analysis-relations')?.scrollIntoView({block:'start'}));
 }
 picker.innerHTML='<option value="common">共通</option>'+catalog.entries.map(e=>`<option value="${e.key}">${esc(e.title)}</option>`).join('');
 picker.addEventListener('change',()=>{location.hash=picker.value;window.scrollTo(0,0);});
 addEventListener('hashchange',route);
 route();
})();
