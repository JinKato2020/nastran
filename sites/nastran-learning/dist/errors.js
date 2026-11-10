(function () {
  'use strict';
  const data=window.NASTRAN_ERRORS, core=window.NastranErrorSearch;
  const $=id=>document.getElementById(id), esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const rows=core.prepare(data), byKey=new Map(rows.map(r=>[r.key,r]));
  let result={matches:[],info:{}},shown=30,selected='',timer,copyText='';
  const badge=r=>'<span class="error-badge '+(r.severity==='FATAL'?'fatal':r.severity==='WARNING'?'warning':r.severity==='INFORMATION'?'information':'')+'">'+esc(core.explain(r).label)+'</span>';
  $('error-total').textContent=data.source.recordCount.toLocaleString('ja-JP');
  $('error-coverage').textContent=data.source.numberCount.toLocaleString('ja-JP')+'番号 · 個別日本語解説 '+data.source.noteCount+'項目';
  $('error-scope').textContent='原典の掲載'+data.source.recordCount.toLocaleString('ja-JP')+'件を収録（枝番の異なる項目を別々に数え、通知書式6件と重複掲載1件を含みます）。検索結果からは通知書式6件を除きます。うち'+data.source.noteCount+'項目に個別の日本語解説があります。';
  $('error-group').insertAdjacentHTML('beforeend',core.groups.map(g=>'<option value="'+g.id+'">'+esc(g.title)+'</option>').join(''));
  function filter(){return {severity:$('error-severity').value,group:$('error-group').value,notes:$('error-notes-only').checked};}
  function drawList(){
    $('error-list').innerHTML=result.matches.slice(0,shown).map(r=>{
      const x=core.explain(r);
      return '<button type="button" class="error-result" data-key="'+esc(r.key)+'" aria-pressed="'+(r.key===selected)+'"><span class="error-result-top"><strong>'+esc(r.id)+'</strong>'+badge(r)+'</span><span class="result-title">'+esc(x.title)+'</span><span class="result-excerpt">'+esc((r.module?'('+r.module+') ':'')+(r.message||'通知書式'))+'</span><span class="result-note">'+(r.note?'個別の日本語解説':'共通の確認手順')+' · PDF '+r.page+'ページ</span></button>';
    }).join('')||'<div class="error-empty"><b>一致する項目がありません。</b><p>区分・内容の絞り込みを「すべて」に戻すか、番号だけ、または短い語句で検索してください。</p><p>2025.1版にない番号や、OS・ライセンス機構独自の番号は、使用した版のマニュアルとlogを確認します。</p></div>';
    $('error-more').hidden=shown>=result.matches.length;
  }
  function detail(r,move){
    selected=r.key;
    const x=core.explain(r), source=data.source.url+'#page='+r.page;
    const header=r.kind?'*** '+r.kind+' '+r.severity+' MESSAGE '+r.emitted+(r.module?' ('+r.module+')':''):'';
    copyText=['原典項目 '+r.id+' / MSC Nastran 2025.1',header,r.message,'','意味：'+x.meaning,...x.checks.map((t,i)=>(i+1)+'. '+t),x.caution?'注意：'+x.caution:'',x.individual?'個別解説（原典照合）':'共通の確認手順。原因の特定・全文翻訳ではありません。','出典：'+source].filter(Boolean).join('\n');
    $('error-detail').innerHTML='<button class="button secondary error-mobile-back" id="error-back-results" type="button">検索結果の一覧へ ↓</button><div class="detail-meta"><span class="error-id">'+esc(r.id)+'</span>'+badge(r)+(r.module?'<code>'+esc(r.module)+'</code>':'')+'</div><h2>'+esc(x.title)+'</h2><span class="explanation-kind">'+(x.individual?'個別解説 · 原典を照合':'共通の確認手順 · 個別原因は未確認')+'</span><p>'+esc(x.meaning)+'</p><div class="error-status-box"><b>'+esc(r.severity==='UNSPECIFIED'?'区分の読み方':r.severity)+'</b><p>'+esc(x.status)+'</p></div><h3>原典のメッセージ</h3><pre>'+esc([header,r.message].filter(Boolean).join('\n'))+'</pre><p class="error-search-hint">%1などは、実際の出力ではIDや値に置き換わります。番号・処理名・本文をF06と比べてください。</p>'+(r.mismatch?'<p class="error-caution"><b>原典の番号表記に差があります。</b> 見出しは '+esc(r.id)+'、本文のMESSAGE番号は '+esc(r.emitted)+' です。どちらでも検索できます。原典と実際の出力を照合してください。</p>':'')+(r.key!==r.id?'<p class="error-caution">原典に同じ見出し番号の項目が複数あります。この項目はPDF '+r.page+'ページです。</p>':'')+'<h3>次に確認すること</h3><ol>'+x.checks.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol>'+(x.caution?'<p class="error-caution"><b>気を付けること</b><br>'+esc(x.caution)+'</p>':'')+'<h3>意味を学び直す</h3><div class="error-related">'+x.links.map(l=>'<a href="'+esc(l.href)+'">'+esc(l.label)+' →</a>').join('')+'</div><div class="error-source-row"><p>MSC Nastran Error Messages Guide 2025.1<br>PDF '+r.page+'ページ（表紙から数えたページ）</p><a class="button secondary" href="'+source+'" target="_blank" rel="noopener">原典の該当ページを開く ↗</a> <button id="error-copy" class="button secondary" type="button">確認手順をコピー</button></div>';
    $('error-back-results').addEventListener('click',()=>{$('error-list').scrollIntoView({block:'start'});$('error-list').querySelector('button')?.focus({preventScroll:true});});
    $('error-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(copyText);toast('確認手順をコピーしました');}catch{toast('コピーできませんでした。本文を選択してコピーしてください。');}});
    drawList();
    if(move){$('error-detail').focus({preventScroll:true});$('error-detail').scrollIntoView({block:'start'});}
  }
  function toast(message){$('error-toast').textContent=message;$('error-toast').hidden=false;setTimeout(()=>$('error-toast').hidden=true,2500);}
  function run(keepHash=false){
    clearTimeout(timer);
    if(!keepHash&&location.hash.startsWith('#error-'))history.replaceState(null,'','#search');
    shown=30;result=core.search(rows,$('error-query').value,filter());
    $('error-status').textContent=result.matches.length.toLocaleString('ja-JP')+'項目が見つかりました'+(result.info.type==='log'?' · 貼り付けから'+result.info.headers.length+'件の通知を検出':'');
    $('error-search-hint').textContent=result.info.type==='log'?'通知の番号が一致する候補を表示し、処理名や本文が近い項目を先に並べます。自動的に一つの原因へ確定はしません。':result.info.type==='number'?'同じ番号の枝番をすべて表示します。処理名と本文が実際のF06に合う項目を選んでください。':'英語は原典のメッセージ、日本語は個別解説と共通分類を検索します。複数語は空白で区切ると、すべての語を含む項目に絞ります。';
    selected='';$('error-detail').innerHTML='';drawList();
    if(result.matches.length&&matchMedia('(min-width:681px)').matches)detail(result.matches[0],false);
  }
  function pick(key,move=true){const r=byKey.get(key);if(!r||r.template)return;detail(r,move);if(location.hash!=='#error-'+key)location.hash='error-'+key;}
  function restore(){const m=/^#error-([\d.]+(?:-p\d+)?)$/.exec(location.hash);if(!m)return;const r=byKey.get(m[1]);if(!r||r.template){$('error-status').textContent='保存された項目は見つかりません。番号で検索してください。';return;}
    if(selected===r.key)return;
    $('error-query').value=r.number;$('error-severity').value='';$('error-group').value='';$('error-notes-only').checked=false;run(true);detail(r,false);
  }
  $('error-search-form').addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);run();});
  $('error-query').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,200);});
  for(const id of ['error-severity','error-group','error-notes-only'])$(id).addEventListener('change',()=>run());
  document.querySelectorAll('[data-query]').forEach(b=>b.addEventListener('click',()=>{$('error-query').value=b.dataset.query;run();}));
  $('error-demo').addEventListener('click',()=>{$('error-query').value='*** USER FATAL MESSAGE 2025 (SEPOMT)\nCOORDINATE SYSTEM 10 REFERENCED BY GRID 101 IS UNDEFINED IN SUPERELEMENT OR MODULE 0.';run();});
  $('error-clear').addEventListener('click',()=>{$('error-query').value='';$('error-severity').value='';$('error-group').value='';$('error-notes-only').checked=false;history.replaceState(null,'','#search');run();$('error-query').focus();});
  $('error-more').addEventListener('click',()=>{shown+=30;drawList();});
  $('error-list').addEventListener('click',e=>{const b=e.target.closest('[data-key]');if(b)pick(b.dataset.key);});
  window.addEventListener('hashchange',restore);
  run(true);restore();
})();
