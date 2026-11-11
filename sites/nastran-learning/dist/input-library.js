(() => {
 'use strict';
 const {entries,families}=window.InputCatalog,$=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const byKey=new Map(entries.map(e=>[e.key,e]));
 const cardOrder=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
 const qrg=p=>'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page='+p;
 let selected='EXEC_SOL',field='',timer;
 const label=f=>families.find(x=>x[0]===f)?.[1]||'';
 function options(select,items){select.innerHTML=items.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');}
 options($('input-family'),families.map(([value,name])=>[value,({executive:'Executive',case:'Case Control',parameter:'パラメータ',bulk:'Bulk Data'})[value]||name]));
 function categories(family){return [...new Set(entries.filter(e=>e.family===family).map(e=>e.category))];}
 function choose(key,detail='',scroll=false){
  const entry=byKey.get(key);if(!entry)return;
  selected=key;field=detail;$('card-search').value='';$('input-family').value=entry.family;
  options($('category'),categories(entry.family).map(c=>[c,c]));$('category').value=entry.category;
  renderList();if(scroll)$('card-detail').scrollIntoView({block:'start'});
 }
 function filtered(){const q=$('card-search').value.trim().toLowerCase();return entries.filter(e=>e.family===$('input-family').value&&e.category===$('category').value&&[e.id,e.title,e.summary].join(' ').toLowerCase().includes(q)).sort((a,b)=>cardOrder.compare(a.id,b.id)||cardOrder.compare(a.key,b.key));}
 function renderList(){
  const matches=filtered();options($('card-picker'),matches.map(e=>[e.key,e.id+' — '+e.title]));
  $('result-count').textContent=matches.length+'件 / 全'+entries.length+'件';$('card-picker').disabled=!matches.length;$('empty-state').hidden=!!matches.length;$('card-detail').hidden=!matches.length;$('library-location').hidden=!matches.length;
  if(!matches.length)return;
  if(!matches.some(e=>e.key===selected)){selected=matches[0].key;field='';}
  $('card-picker').value=selected;render(byKey.get(selected));
 }
 function rawFor(e){return e.kind==='fixed'?e.rows.map(NastranBulk.packed).join('\n')+'\n':e.example.trimEnd()+'\n';}
 function controls(e,raw){
  $('copy-card').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(raw);toast('入力例をコピーしました');}catch{toast('コピーできませんでした。保存を使用してください。');}});
  $('save-card').addEventListener('click',()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));a.href=url;a.download=e.key.toLowerCase()+(e.kind==='fixed'?'_small_field.bdf':'.txt');document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 }
 function tools(){return '<div class="library-controls"><button class="button secondary" id="copy-card">コピー</button><button class="button primary" id="save-card">入力例を保存</button></div>';}
 function termTable(terms){return '<table class="library-terms"><tbody>'+terms.map(([term,definition])=>'<tr><th scope="row">'+esc(term)+'</th><td>'+esc(definition)+'</td></tr>').join('')+'</tbody></table>';}
 function optionReference(e){
  if(!e.optionGroups?.length)return termTable(e.terms);
  const meanings=new Map(e.terms);
  return '<div class="output-options"><h3>オプションの選択と意味</h3>'+e.optionGroups.map(g=>'<section class="option-group"><h4>'+esc(g.title)+'</h4>'+termTable(g.options.map(name=>[name,meanings.get(name)]))+'</section>').join('')+'</div>';
 }
 function depth(e){
  let html='';
  if(e.solIndex)html+='<section class="reference-section"><h3>SOL一覧 · 25種類</h3><p>2020 SP1 QRG Table 2の全掲載番号。番号を選ぶと個別の解法・関連入力・結果・注意点を表示します。</p><div class="sol-index">'+e.solIndex.map(s=>'<button type="button" data-jump="'+esc(s.key)+'"><b>'+esc(s.id)+'</b><span>'+esc(s.title)+'</span></button>').join('')+'</div></section>';
  if(e.connections?.length)html+='<section class="reference-section"><h3>関連入力・参照関係</h3><dl class="reference-connections">'+e.connections.map(([term,meaning,key])=>'<div><dt>'+(key&&byKey.has(key)?'<button type="button" data-jump="'+esc(key)+'">'+esc(term)+' ↗</button>':esc(term))+'</dt><dd>'+esc(meaning)+'</dd></div>').join('')+'</dl></section>';
  if(e.outputs?.length)html+='<section class="reference-section"><h3>出力と結果の読み方</h3>'+e.outputs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</section>';
  for(const section of e.sections||[])html+='<section class="reference-section"><h3>'+esc(section.title)+'</h3>'+section.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</section>';
  return html;
 }
 function fixedTable(e){return '<div class="field-scroll"><div class="field-board"><div class="field-ruler">'+Array.from({length:10},(_,i)=>'<span>'+ (i*8+1)+'–'+(i*8+8)+'列</span>').join('')+'</div>'+e.rows.map((r,line)=>'<div class="field-row">'+Array.from({length:10},(_,i)=>{const f=e.lines[line]?.[i]||{label:'未使用',help:'この例では空欄。'},v=NastranBulk.packed(r).slice(i*8,i*8+8);return '<button type="button" class="field-cell" data-entry-field="'+line+':'+i+'" aria-pressed="false"><span class="field-label">'+esc(f.label)+'</span><span class="'+(v.trim()?'field-value':'field-blank')+'">'+(v.trim()?esc(v):'空欄')+'</span></button>';}).join('')+'</div>').join('')+'</div></div>';}
 function inspect(e,position){
  const [line,index]=position.split(':').map(Number),f=e.lines[line]?.[index];if(!f)return;
  $('card-detail').querySelectorAll('[data-entry-field]').forEach(b=>{const on=b.dataset.entryField===position;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
  $('field-inspector').innerHTML='<b>'+esc(f.label)+'</b><p>'+esc(f.help)+'</p><small>'+(line+1)+'行・第'+(index+1)+'欄 / '+(index*8+1)+'–'+(index*8+8)+'列</small>';
 }
 function render(e){
  const familyLabel=label(e.family);
  $('library-location').hidden=true;
  if(e.kind==='static')NastranBulk.render(e.key,field);
  else{
   const raw=rawFor(e);
   let content='<div class="card-heading"><div class="card-title"><h2>'+esc(e.id)+'</h2><p>'+esc(e.title)+'</p></div><span class="category-badge">'+esc(familyLabel)+'</span></div><p class="card-summary">'+esc(e.summary)+'</p>';
   if(e.kind==='fixed'){
    content+='<div class="subheading"><h3>入力例</h3><span>8文字×10欄</span></div>'+fixedTable(e)+'<div class="field-inspector" id="field-inspector" aria-live="polite"></div>';
    content+='<details class="code-box"><summary>固定長テキスト・コピー・保存</summary>'+tools()+'<pre><code id="card-raw">'+esc(raw)+'</code></pre><p class="code-note">カード単体の入力例です。関連する節点・材料・プロパティ・選択命令などをそろえて使用します。完成BDFではなく、MSC Nastran本体での実行検証は未実施です。</p></details>';
    content+='<div class="library-extra-fields"><h3>フィールド定義</h3>'+e.lines.map((r,line)=>r.map((f,i)=>'<details id="entry-field-'+line+'-'+i+'"><summary><code>'+esc(f.label)+'</code><small>'+(line+1)+'行・第'+(i+1)+'欄</small></summary><p>'+esc(f.help)+'</p></details>').join('')).join('')+'</div>';
    if(e.terms?.length)content+=optionReference(e);
   }else{
    content+='<p class="entry-position">'+esc(e.location)+'</p><h3>書式</h3><div class="library-syntax"><pre>'+esc(e.syntaxPreview||e.syntax)+'</pre></div>';
    if(e.syntaxPreview&&e.syntaxPreview!==e.syntax)content+='<details class="output-syntax"><summary>書式の全選択肢</summary><div class="library-syntax"><pre>'+esc(e.syntax)+'</pre></div></details>';
    content+='<h3>'+(e.exampleNote?'制御部の例':'入力例')+'</h3>'+(e.exampleNote?'<p class="example-note">'+esc(e.exampleNote)+'</p>':'')+'<div class="library-syntax"><pre><code id="card-raw">'+esc(raw)+'</code></pre></div>'+tools();
    content+=optionReference(e);
   }
   content+=depth(e);
   if(e.notes?.length)content+='<div class="pitfalls"><h3>指定上の注意</h3><ul>'+e.notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul></div>';
   if(e.reference)content+='<p><a class="library-reference-link" href="'+esc(e.reference)+'">関連する入力例・解析条件 →</a></p>';
   content+='<div class="reference-sources"><span>原典：MSC Nastran 2020 SP1 QRG（PDF通しページ）</span><div>'+(e.sourcePages||[e.page]).map(p=>'<a href="'+qrg(p)+'" target="_blank" rel="noopener">p.'+p+' ↗</a>').join(' ')+'</div></div>';
   $('card-detail').innerHTML=content;controls(e,raw);
   if(e.kind==='fixed'){
    const position=field&&/^\d+:\d+$/.test(field)?field.split(':').map(Number):[];
    if(!e.lines[position[0]]?.[position[1]])field='';
    inspect(e,field||'0:1');
    $('card-detail').querySelectorAll('[data-entry-field]').forEach(b=>b.addEventListener('click',()=>{field=b.dataset.entryField;inspect(e,field);setHash();}));
   }
  }
  if(e.family==='parameter')$('card-detail').querySelector('.card-heading').insertAdjacentHTML('afterend','<p class="entry-position">Bulk Data区画に記述するパラメータです。</p>');
  setHash();document.title=e.id+' — 入力データ学習';
 }
 function setHash(){history.replaceState(null,'','#'+selected+(field?'/'+encodeURIComponent(field):''));}
 function route(){
  let key,detail='';try{const raw=location.hash.slice(1),split=raw.indexOf('/');key=decodeURIComponent(split<0?raw:raw.slice(0,split));if(split>=0)detail=decodeURIComponent(raw.slice(split+1));}catch{key='EXEC_SOL';}
  if(key==='format-guide'){const a=document.createElement('a');a.href='input.html#rules';document.body.append(a);a.click();a.remove();return;}
  choose(byKey.has(key)?key:byKey.has(key.toUpperCase())?key.toUpperCase():'EXEC_SOL',detail);
 }
 $('input-family').addEventListener('change',()=>{field='';$('card-search').value='';options($('category'),categories($('input-family').value).map(c=>[c,c]));renderList();});
 $('category').addEventListener('change',()=>{field='';$('card-search').value='';renderList();});
 $('card-picker').addEventListener('change',()=>{selected=$('card-picker').value;field='';render(byKey.get(selected));});
 $('card-search').addEventListener('input',renderList);$('clear-search').addEventListener('click',()=>{$('card-search').value='';renderList();});
 document.addEventListener('click',event=>{const button=event.target.closest('[data-jump]');if(button)choose(button.dataset.jump,'',true);});
 function toast(message){clearTimeout(timer);$('toast').textContent=message;$('toast').hidden=false;timer=setTimeout(()=>$('toast').hidden=true,2200);}
 addEventListener('hashchange',route);route();
})();
