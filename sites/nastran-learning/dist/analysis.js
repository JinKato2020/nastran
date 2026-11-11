(() => {
 'use strict';
 const A=window.NastranAnalysis,$=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let entry=A.entries[0],selectedExample='',expanded=false,timer;
 $('analysis-picker').innerHTML='<option value="common">共通</option>'+A.entries.map(e=>`<option value="${e.key}">${e.title}</option>`).join('');
 function linkedDeck(text){
  let zone='executive';
  const html=text.split(/(\r\n|\n)/).map((line,index)=>{
   // Character references preserve CRLF through HTML parsing as well as export.
   if(index%2)return line.replace(/\r/g,'&#13;');
   let match=/^(\s*)([A-Z][A-Z0-9]*)(?=[\s(=,]|$)/i.exec(line),key='';
   if(zone==='bulk'&&(!line.slice(0,8).trim()||/^[+*]/.test(line)))match=null;
   if(match){
    const code=match[2].toUpperCase();
    if(/^\s*BEGIN\s+BULK\b/.test(line)){match=/^(\s*)(BEGIN\s+BULK)/.exec(line);key='CASE_BEGIN_BULK';zone='bulk';}
    else if(zone==='executive'){key=code==='SOL'?'EXEC_SOL_'+(/SOL\s+(\d+)/.exec(line)?.[1]||''): 'EXEC_'+code;if(code==='CEND')zone='case';}
    else if(zone==='case')key='CASE_'+(code==='VECTOR'?'DISPLACEMENT':code);
    else key=code==='PARAM'?'PARAM_'+line.slice(8,16).trim().toUpperCase():code;
   }
   if(!key)return esc(line);
   return esc(match[1])+'<a class="deck-card-link" href="bulk.html#'+esc(key)+'" aria-label="'+esc(match[2])+'のInputデータ解説">'+esc(match[2])+'</a>'+esc(line.slice(match[1].length+match[2].length));
  }).join('');
  $('analysis-example-raw').innerHTML=html;
 }
 const list=rows=>rows.map(t=>'<li>'+esc(t)+'</li>').join('');
 const conditions=rows=>rows.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('');
 function showModelConditions(m={}){
  document.querySelector('.analysis-visual').innerHTML=window.analysisDiagram(entry.key,selectedExample);
  $('analysis-relations').innerHTML=window.renderAnalysisRelations(entry.key,selectedExample);
  $('analysis-conditions').innerHTML=conditions(m.inputs||entry.inputs);
  $('analysis-results').innerHTML=list(m.outputs||entry.outputs);
  $('analysis-checks').innerHTML=list(m.checks||entry.checks);
  $('analysis-run-notes').innerHTML=list(m.runNotes||entry.runNotes||[]);
 }
 function exampleHash(){return '#'+entry.key+'/'+selectedExample+(expanded?'/raw':'');}
 function rememberExample(){history.replaceState(null,'',exampleHash());}
 function showRaw(){
  const text=A.models[selectedExample].text,lines=text.replace(/\r?\n$/,'').split(/\r?\n/),canExpand=lines.length>6;
  linkedDeck(expanded?text:lines.slice(0,6).join('\r\n'));
  $('analysis-raw-details').dataset.expanded=String(expanded);
  $('analysis-toggle-raw').textContent=expanded?'6行に戻す':'全て表示';
  $('analysis-toggle-raw').setAttribute('aria-expanded',String(expanded));
  $('analysis-toggle-raw').hidden=!canExpand;
  $('analysis-collapse-raw').hidden=!expanded||!canExpand;
  $('analysis-code-status').textContent=expanded?`全${lines.length}行を表示`:`先頭${Math.min(6,lines.length)}行 / 全${lines.length}行`;
  $('analysis-example-raw').setAttribute('aria-label',expanded?'入力ファイル全文。先頭コードからカード解説へ移動':'入力ファイルの先頭6行。全て表示で全文を開く');
 }
 function toggleRaw(fromBottom=false){
  expanded=!expanded;showRaw();rememberExample();
  if(fromBottom){$('analysis-raw-details').scrollIntoView({block:'start'});$('analysis-toggle-raw').focus({preventScroll:true});}
 }
 function showExample(){
  const m=A.models[selectedExample];if(!m)return;
  showModelConditions(m);showRaw();$('analysis-filename').textContent=m.name;$('analysis-fragment').hidden=m.complete;$('analysis-model-note').textContent=m.note||'';$('analysis-model-note').hidden=!m.note;const command=document.querySelector('.run-command');if(command)command.textContent='nastran '+m.name;
 }
 function renderCommon(section){
  entry=null;selectedExample='';expanded=false;$('analysis-picker').value='common';document.title='共通 — FEM Guide';
  $('analysis-detail').innerHTML=window.AnalysisCommon;
  if(['input','run','results','verification','relations'].includes(section))requestAnimationFrame(()=>$('analysis-common-'+section).scrollIntoView({block:'start'}));
 }
 function render(key){
  entry=A.entries.find(e=>e.key===key)||A.entries[0];selectedExample=entry.examples?.[0]||'';expanded=false;$('analysis-picker').value=entry.key;document.title=entry.title+' — FEM Guide';
  const examples=entry.examples?`<section class="analysis-section"><h2>3 · 固定長入力ファイル</h2><div class="analysis-example"><label>モデル<select id="analysis-example-picker">${entry.examples.map(k=>`<option value="${k}">${esc(A.models[k].title)}</option>`).join('')}</select></label><p id="analysis-model-note"></p><p id="analysis-fragment" class="analysis-fragment" hidden>入力断片：単体では解析できません。</p><div id="analysis-raw-details" class="analysis-code-preview" data-expanded="false"><div class="analysis-code-header"><h3>固定長テキスト全文</h3><button id="analysis-toggle-raw" class="button secondary" type="button" aria-expanded="false" aria-controls="analysis-example-raw">全て表示</button></div><p id="analysis-code-status" class="analysis-code-status" aria-live="polite"></p><pre id="analysis-example-raw" tabindex="0"></pre><button id="analysis-collapse-raw" class="button secondary" type="button" aria-controls="analysis-example-raw" hidden>6行に戻す</button></div><p id="analysis-filename"></p><div class="analysis-tools"><button id="copy-analysis" class="button secondary">コピー</button><button id="save-analysis" class="button primary">DATを保存</button></div></div></section>`:`<section class="analysis-section"><h2>3 · 入力データの取得状況</h2><p>${esc(entry.availability)}</p></section>`;
  $('analysis-detail').innerHTML=`<div class="analysis-head"><span class="analysis-sol">${esc(entry.sol)} · 解析手順</span><h1>${entry.title}</h1><p>${entry.summary}</p><div class="analysis-context-links"><a href="analysis.html#common">共通：入力・実行・検算 →</a><a href="theory.html#${entry.key}">この解析の理論 →</a></div></div><section class="analysis-section"><h2>1 · モデルと境界条件</h2><div class="analysis-visual">${window.analysisDiagram(entry.key,selectedExample)}</div></section><section class="analysis-section"><h2>2 · 条件と入力の対応</h2><div id="analysis-relations">${window.renderAnalysisRelations(entry.key,selectedExample)}</div><dl id="analysis-conditions" class="analysis-inputs">${conditions(entry.inputs)}</dl></section>`+examples+
   `<section class="analysis-section"><h2>4 · 実行と出力の取得</h2><ul id="analysis-run-notes">${list(entry.runNotes||[])}</ul>${entry.examples?'<pre class="run-command">nastran '+esc(A.models[entry.examples[0]].name)+'</pre>':'<p><a href="analysis.html#common/run">実行手順・終了確認 →</a></p>'}</section><section class="analysis-section"><h2>5 · 結果の読み方・検算</h2><ul id="analysis-results">${list(entry.outputs)}</ul><h3>照合する条件</h3><ul id="analysis-checks">${list(entry.checks)}</ul>${entry.resultLinks?.length?'<h3>欲しい結果が見つからないとき</h3><div class="analysis-links">'+entry.resultLinks.map(([url,title])=>'<a href="'+url+'">'+esc(title)+' →</a>').join('')+'</div>':''}</section>${entry.links.length?'<section class="analysis-section"><h2>関連する解説</h2><div class="analysis-links">'+entry.links.map(([url,title])=>'<a href="'+url+'">'+esc(title)+' →</a>').join('')+'</div></section>':''}<div class="analysis-sources">${entry.sources.map(r=>'<a href="'+r.url+'" target="_blank" rel="noopener">'+esc(r.label)+' ↗</a>').join('')}</div>`;
  if(entry.examples){selectedExample=entry.examples[0];showExample();$('analysis-toggle-raw').addEventListener('click',()=>toggleRaw());$('analysis-collapse-raw').addEventListener('click',()=>toggleRaw(true));$('analysis-example-picker').addEventListener('change',()=>{selectedExample=$('analysis-example-picker').value;showExample();rememberExample();});$('copy-analysis').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(A.models[selectedExample].text);toast('入力例をコピーしました');}catch{toast('コピーできませんでした。保存を使用してください。');}});$('save-analysis').addEventListener('click',()=>{const m=A.models[selectedExample],a=document.createElement('a'),u=URL.createObjectURL(new Blob([m.text],{type:'text/plain;charset=us-ascii'}));a.href=u;a.download=m.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});}
 }
 function route(){const [key,example,view]=location.hash.slice(1).split('/');if(!key||key==='common'){renderCommon(example);return;}render(key);if(entry.examples?.includes(example)){$('analysis-example-picker').value=example;selectedExample=example;showExample();}if($('analysis-raw-details')){expanded=view==='raw';showRaw();}if(view==='map')requestAnimationFrame(()=>$('analysis-relations').scrollIntoView({block:'start'}));}
 function toast(t){clearTimeout(timer);$('analysis-toast').textContent=t;$('analysis-toast').hidden=false;timer=setTimeout(()=>$('analysis-toast').hidden=true,2200);}
 $('analysis-picker').addEventListener('change',()=>{location.hash=$('analysis-picker').value;window.scrollTo(0,0);});addEventListener('hashchange',route);route();
})();
