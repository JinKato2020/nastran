(() => {
 'use strict';
 const guides=window.FIELD_GUIDE,esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const special={
  '空欄':{meaning:'この書式ではデータを書かずに空ける場所です。後ろの項目を、ここへ左詰めしてはいけません。',blank:'空欄のままにします。8文字の幅は保ちます。「値が不明」だから空ける欄とは違います。',example:'RBE3の第3欄は空けたまま、第4欄にREFGRIDを書きます。「空欄」という日本語や0は入力しません。',link:'basics.html#blanks'},
  '次行':{meaning:'73〜80列は、次の行とのつながりを示す継続識別子の欄です。普通のデータを入れる第9個目の場所ではありません。',blank:'追加の行が不要なら空欄です。必要な継続行を省いてよいという意味ではありません。原典には自動継続の書き方もありますが、この教材の入力例は識別子を対応させる方式です。',example:'この行の最後に+C10、次の行の先頭にも+C10と書くと、2行がつながります。IDはほかの継続と重ならない名前にします。',link:'bulk.html#CORD2R'},
  '継続行':{meaning:'前の行の続きであることを示す、行の先頭の8文字です。新しいカード名を書く場所ではありません。',blank:'この教材の明示的な継続方式では、前の行の継続識別子に合わせます。自動継続の方式では、対応する先頭・末尾を空欄にする別の規則があります。',example:'前行の第10欄が+H702なら、この行の第1欄にも+H702。続きのデータは第2欄から書きます。',link:'bulk.html#CHEXA'}
 };
 function keyFor(card,key){
  if(key==='—'||key==='未使用')return '空欄';if(key==='続き')return '次行';if(key==='継続')return '継続行';
  if(guides[card]?.fields[key])return key;
  return Object.keys(guides[card]?.fields||{}).find(k=>k.split('/').map(s=>s.trim()).includes(key))||key;
 }
 function get(card,key){const name=keyFor(card,key);if(name===card)return {key:card,meaning:`第1欄の${card}は、この行で何を定義するかをNastranへ伝えるカード名です。${window.BULK_CARDS?.find(c=>c.id===card)?.summary||''}`,blank:'新しいカードの最初の行では省略できません。カード名を間違えると、意図した種類のデータとして読まれません。継続行の先頭には、別の継続規則を使います。',example:`1〜8列に半角の${card}を左寄せで書きます。足りない部分は半角スペースで埋め、次の項目は9列目から始めます。`,link:'basics.html#blanks'};if(special[name])return {...special[name],key:name};const data=guides[card]?.fields[name];return data?{...data,key:name}:null;}
 function body(data){return `<p class="field-meaning">${esc(data.meaning)}</p><dl class="field-explanation"><dt>空欄にすると</dt><dd>${esc(data.blank)}</dd><dt>具体例</dt><dd>${esc(data.example)}</dd>${data.unit?`<dt>単位</dt><dd>${esc(data.unit)}</dd>`:''}</dl>${data.tip?`<p class="field-tip"><strong>ここも確認</strong> ${esc(data.tip)}</p>`:''}${data.link?`<a class="field-common-link" href="${esc(data.link)}">関連する考え方を読む →</a>`:''}`;}
 function positions(guide,key){const list=[];guide.rows.forEach((row,r)=>row.forEach((name,i)=>{if(name===key)list.push(`${r+1}行目・第${i+1}欄（${i*8+1}–${i*8+8}列）`);}));return list;}
 function manual(card){
  const g=guides[card];if(!g)return '';
  const keys=[...new Set(g.rows.flat())].filter(k=>!(k in special));for(const k of Object.keys(g.fields))if(!keys.includes(k))keys.push(k);
  const layout=g.rows.map((row,r)=>`<tr>${row.map((name,i)=>`<td><small>${r+1}行目・第${i+1}欄<br>${i*8+1}–${i*8+8}列</small>${name===card?`<b>${card}</b>`:`<button type="button" data-guide-jump="${esc(name)}">${esc(name)}</button>`}</td>`).join('')}</tr>`).join('');
  const descriptions=keys.concat(['空欄','次行','継続行'].filter(k=>g.rows.flat().includes(k))).map(key=>{
   const data=get(card,key);if(!data)throw new Error(`Missing field explanation: ${card}.${key}`);
   const pos=data.position||positions(g,key).join(' / ');
   return `<details class="field-entry" data-guide-field="${esc(key)}" open><summary><code>${esc(key)}</code><span>${esc(pos)}</span></summary><div class="field-entry-body">${body(data)}</div></details>`;
  }).join('');
  return `<section class="complete-fields" aria-label="全フィールドの詳しい説明"><div class="manual-heading"><div class="eyebrow">空欄の項目も、省略せずに読む</div><h3>全フィールドの説明</h3><p>入力例で使わない欄や、追加の行も含みます。各項目の「空欄にすると」と「具体例」を確認しましょう。</p></div>${g.layoutNote?`<p class="layout-note">${esc(g.layoutNote)}</p>`:''}<details class="field-map"><summary>欄の地図を見る · 継続行・空欄の位置も確認</summary><p>これは項目名を示す見取り図です。入力データではありません。項目名を押すと説明へ移動します。</p><div class="manual-map-scroll" tabindex="0"><table><tbody>${layout}</tbody></table></div></details><nav class="field-shortcuts" aria-label="${card}の項目へ移動">${keys.map(key=>`<button type="button" data-guide-jump="${esc(key)}">${esc(key)}</button>`).join('')}</nav><div class="field-open-controls"><button type="button" data-guide-expand="true">全部開く</button><button type="button" data-guide-expand="false">見出しだけにする</button></div><div class="field-entry-list">${descriptions}</div><p class="manual-reference">原典：MSC Nastran 2020 SP1 QRG（PDF通しページ） ${g.pages.map(p=>`<a target="_blank" rel="noopener" href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=${p}">${p}</a>`).join(' · ')}。パラメータ名の全種類や、別の解析方法だけの特殊な機能をすべて学ぶページではありません。</p></section>`;
 }
 function go(key,card){
  const name=keyFor(card,key),entry=[...document.querySelectorAll('[data-guide-field]')].find(el=>el.dataset.guideField===name);
  if(!entry)return false;entry.open=true;entry.scrollIntoView({block:'start',behavior:'instant'});entry.querySelector('summary').focus({preventScroll:true});return true;
 }
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-guide-jump]');
  if(button){const card=document.querySelector('.card-title h2')?.textContent;if(go(button.dataset.guideJump,card))history.replaceState(null,'','#'+card+'/'+encodeURIComponent(keyFor(card,button.dataset.guideJump)));}
  const expand=e.target.closest('[data-guide-expand]');if(expand)document.querySelectorAll('.field-entry').forEach(el=>{el.open=expand.dataset.guideExpand==='true';});
 });
 window.FieldGuide={get,body,manual,go,keyFor};
})();
