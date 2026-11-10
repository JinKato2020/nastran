(() => {
 'use strict';
 const $=id=>document.getElementById(id),data=window.NastranInclude;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const docs={qrg:'Quick_Reference_Guide',io:'Installation_and_Operations_Guide'};
 for(const [key,name]of Object.entries(docs))document.querySelectorAll(`[data-${key}]`).forEach(a=>{a.href=`https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_${name}/raw/resource/enus/MSC_Nastran_2020_${name}.pdf#page=${a.dataset[key]}`;a.target='_blank';a.rel='noopener';});
 let selected='main.bdf',load=1000,files=data.make(load);
 $('include-files').innerHTML=['main.bdf',...Object.keys(data.parts)].map(name=>`<button type="button" data-file="${name}" aria-pressed="false"><strong>${name}</strong><span>${name==='main.bdf'?'親 · 実行するファイル':data.parts[name].title}</span><small></small></button>`).join('');
 function render(){
  const parent=selected==='main.bdf',active=data.order(load).includes(selected);
  document.querySelectorAll('[data-file]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.file===selected));const status=b.querySelector('small');if(status)status.textContent=b.dataset.file==='main.bdf'?'親':data.order(load).includes(b.dataset.file)?'今回読み込む':'今回は読み込まない';});
  $('include-file-tag').textContent=parent?'全体の入口':active?'Bulk Dataの一部分 · 今回読み込む':'切替え用の荷重 · 今回は読み込まない';
  $('include-file-name').textContent=selected;
  $('include-file-role').textContent=parent?'SOL 101からENDDATAまで、全体の枠を持つ親です。下のINCLUDE行を押すと、読み込むファイルの中身へ移れます。SPC = 10とLOAD = 20はセットの番号で、ファイル名ではありません。':data.parts[selected].role;
  $('include-file-boundary').textContent=parent?'BEGIN BULKの後へ、4つのファイルを順に挿入します。最後のENDDATAで全体を閉じます。':'このファイルにはBulkカードだけを書きます。SOL・CEND・BEGIN BULK・ENDDATAは不要です。';
  $('include-parent').hidden=!parent;$('include-fields').hidden=parent;
  if(parent){
   $('include-parent').innerHTML=`<div class="parent-code" aria-label="親BDFの入力。INCLUDE行から子ファイルへ移れます">${files[selected].trimEnd().split('\r\n').map(line=>{const match=line.match(/^INCLUDE '([^']+)'$/);return match?`<button type="button" data-open-file="${match[1]}" aria-label="${match[1]}の中身を読む"><code>${esc(line)}</code><span>中身を見る →</span></button>`:`<div><code>${esc(line)}</code></div>`;}).join('')}</div>`;
  }else NastranFields.render($('include-fields'),files[selected]);
  $('include-raw').textContent=files[selected];
 }
 function updateLoad(){
  load=Number($('include-load').value);files=data.make(load);selected='main.bdf';
  $('include-expected').innerHTML=`<span>手計算の目安</span><b>変位 ${(load*1000/(100*210000)).toFixed(6)} mm</b><span>軸応力 ${load/100} MPa · 固定端X反力 −${load} N</span><small>Nastranの実行結果ではありません。</small>`;
  $('include-switch-note').textContent=`親の荷重行は INCLUDE 'load_${load}.inc'。LOAD = 20は同じままです。${load===1000?'2000 N版は保存してあっても、読まなければ加わりません。':'1000 N版を読み込む行は外し、2000 N版だけに切り替えています。'}`;
  $('include-order').innerHTML=`<span>親の制御文</span>${data.order(load).map(n=>`<i>→</i><span>${n}</span>`).join('')}<i>→</i><span>ENDDATA</span>`;
  NastranFields.render($('include-expanded'),data.expanded(load));render();
 }
 $('include-load').addEventListener('change',updateLoad);
 $('include-files').addEventListener('click',e=>{const b=e.target.closest('[data-file]');if(b){selected=b.dataset.file;render();}});
 $('include-parent').addEventListener('click',e=>{const b=e.target.closest('[data-open-file]');if(b){selected=b.dataset.openFile;render();$('include-file-name').scrollIntoView({block:'center'});$('save-include').focus({preventScroll:true});}});
 let timer;function toast(s){$('include-toast').textContent=s;$('include-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>{$('include-toast').hidden=true;},4000);}
 $('copy-include').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(files[selected]);toast('入力テキストをコピーしました。');}catch{toast('この環境ではコピーできません。ファイルを保存してください。');}});
 $('save-include').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([files[selected]],{type:'text/plain;charset=us-ascii'})),a=document.createElement('a');a.href=url;a.download=selected;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 window.IncludeLesson={getFiles:()=>files,getSelected:()=>selected,getLoad:()=>load};updateLoad();
})();
