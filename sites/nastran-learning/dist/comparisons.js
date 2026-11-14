(() => {
 'use strict';
 const data=window.CardComparisons,topics=data.topics,$=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const list=rows=>'<ul>'+rows.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>';
 const qrg='https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=';
 const qrgFor=version=>version?qrg.replaceAll('Nastran_2020_', 'Nastran_'+version+'_'):qrg;
 const groups=[...new Set(topics.map(t=>t.category))];
 $('comparison-picker').innerHTML=groups.map(g=>'<optgroup label="'+esc(g)+'">'+topics.filter(t=>t.category===g).map(t=>'<option value="'+t.key+'">'+esc(t.title)+'</option>').join('')+'</optgroup>').join('');
 $('comparison-count').textContent=topics.length+'テーマ';
 function flow(t){return '<figure class="comparison-flow"><figcaption>'+esc(t.diagram.caption)+'</figcaption>'+t.diagram.lanes.map(([label,...nodes])=>'<div class="comparison-lane"><h4>'+esc(label)+'</h4><ol>'+nodes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ol></div>').join('')+'</figure>';}
 function section(id,title,body){return '<section class="comparison-section" id="comparison-'+id+'"><h3>'+title+'</h3>'+body+'</section>';}
 let current='';
 function render(){
  const [key,sectionId]=location.hash.slice(1).split('/');
  const t=topics.find(t=>t.key===key)||topics[0];
  $('comparison-picker').value=t.key;document.title=t.title+' — FEM Guide for nas';
  if(current!==t.key){
   current=t.key;
   const table='<table class="comparison-table"><caption>'+esc(t.title)+'の比較</caption><thead><tr><th scope="col">観点</th>'+t.columns.map(c=>'<th scope="col">'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+t.differences.map(([label,...cells])=>'<tr><th scope="row">'+esc(label)+'</th>'+cells.map((s,i)=>'<td data-column="'+esc(t.columns[i])+'">'+esc(s)+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
   const choices='<dl class="comparison-choices">'+t.choose.map(([a,b])=>'<div><dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd></div>').join('')+'</dl>';
   const links=t.cards.map(c=>'<a href="bulk.html#'+encodeURIComponent(c)+'">'+esc(c.startsWith('CASE_')?c.slice(5)+' (Case)':c.startsWith('PARAM_')?'PARAM '+c.slice(6):c)+' ↗</a>').join('');
   $('comparison-detail').innerHTML='<header><span class="comparison-eyebrow">'+esc(t.category)+' · '+(topics.indexOf(t)+1)+' / '+topics.length+'</span><h2 class="comparison-topic-title">'+esc(t.title)+'</h2><p class="comparison-question">'+esc(t.question)+'</p><p>'+esc(t.summary)+'</p></header>'+
    '<nav class="comparison-jumps" aria-label="この比較の目次">'+[['compare','相違点'],['choose','選び方'],['results','結果'],['pitfalls','注意点'],['cards','Inputデータ']].map(([id,name])=>'<a href="#'+t.key+'/'+id+'">'+name+'</a>').join('')+'</nav>'+
    section('common','1 · 共通する前提',list(t.common))+flow(t)+section('compare','2 · 相違点',table)+section('choose','3 · 選択基準',choices)+section('results','4 · 結果に出る違い・確認する量',list(t.results))+section('pitfalls','5 · 間違えやすい設定',list(t.pitfalls))+
    section('cards','Inputデータで書式・全フィールドを確認する','<p class="comparison-note">カード名から該当する入力解説へ移動します。戻る操作でこの比較に戻れます。</p><div class="comparison-card-links">'+links+'</div>')+
    section('related','関連する比較・理論','<div class="comparison-related">'+t.related.map(k=>{const r=topics.find(x=>x.key===k);return '<a href="#'+r.key+'">'+esc(r.title)+' →</a>';}).join('')+(t.links||[]).map(([url,title])=>'<a href="'+esc(url)+'">'+esc(title)+' →</a>').join('')+'</div>')+
    '<details class="comparison-sources"><summary>参照資料と適用範囲</summary><p>'+esc(data.scope)+'</p><p>'+esc(t.sourceVersion?'MSC Nastran '+t.sourceVersion+' Quick Reference Guide':data.source)+' / PDF通しページ。カードの仕様を参照し、用途と選択の観点から説明を構成しています。</p>'+t.pages.map(([c,p])=>'<a href="'+qrgFor(t.sourceVersion)+p+'" target="_blank" rel="noopener">'+esc(c)+' · p.'+p+' ↗</a>').join('')+'</details><footer class="comparison-footer"><a href="index.html#home">教材一覧へ →</a></footer>';
  }
  if(['common','compare','choose','results','pitfalls','cards','related'].includes(sectionId))requestAnimationFrame(()=>$('comparison-'+sectionId)?.scrollIntoView({block:'start'}));
 }
 $('comparison-picker').addEventListener('change',()=>{location.hash=$('comparison-picker').value;window.scrollTo(0,0);});
 document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(a&&a.getAttribute('href').slice(1).split('/')[0]!==current)window.scrollTo(0,0);});
 addEventListener('hashchange',render);render();
})();
