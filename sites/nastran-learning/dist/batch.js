(() => {
 'use strict';
 const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const io='https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Installation_and_Operations_Guide/raw/resource/enus/MSC_Nastran_2020_Installation_and_Operations_Guide.pdf';
 document.querySelectorAll('[data-io]').forEach(a=>{a.href=io+'#page='+a.dataset.io;a.target='_blank';a.rel='noopener';});
 const purpose={
  'run_single.bat':'1件を実行し、起動コマンドが戻ってから終了コードを保存します。まずはこの例で、入力と実行環境を確認します。',
  'run_in_order.bat':'case_Aが戻ってからcase_Bを実行します。同時に動くのは1件です。run_worker.batを同じフォルダに置きます。',
  'run_two_parallel.bat':'独立したcase_Aとcase_Bを2件同時に起動します。親バッチは待たずに戻ります。2件の完了は各結果フォルダで確認します。run_worker.batも必要です。',
  'run_worker.bat':'親から設定とフォルダを受け取り、1件を実行する補助バッチです。単独でダブルクリックして使うファイルではありません。'
 };
 let files=null,selectedLine=2;
 const config=()=>({launcher:$('launch-path').value.trim(),input:$('input-name').value.trim(),run:$('run-name').value.trim(),method:$('parallel-method').value,smp:Number($('smp-count').value),dmp:Number($('dmp-count').value),memory:Number($('memory-gb').value)});
 function showLine(index){
  if(!files)return;const rows=files[$('script-choice').value];selectedLine=Math.max(0,Math.min(index,rows.length-1));
  document.querySelectorAll('.batch-line').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.line)===selectedLine)));
  const row=rows[selectedLine];$('line-explanation').innerHTML=`<span class="line-number">${selectedLine+1}行目の意味</span><p>${esc(row.why)}</p><code>${esc(row.text)}</code>`;
 }
 function resources(c){
  const jobs=Number($('budget-jobs').value),physical=Number($('budget-cores').value),ram=Number($('budget-ram').value),n=NastranBatch.counts(c),dmp=Math.max(1,n.dmp),smp=Math.max(1,n.smp),cpu=jobs*dmp*smp,mem=jobs*c.memory;
  $('resource-values').innerHTML=`<div><span>CPUを数える目安</span><strong data-resource="cores">${cpu}</strong><small>${jobs}件 × DMP ${dmp} × SMP ${smp}</small></div><div><span>メモリ予算の合計</span><strong data-resource="memory">${mem} GB</strong><small>${jobs}件 × ${c.memory} GB</small></div>`;
  let note='SMP/DMPを使わない部分も、数え方では1として扱います。実際の使用率と実行時間はモデル・計算法・ディスク速度にも左右されます。';
  if(!(physical>0&&ram>0)){note='PCの物理コア数とRAMを、正の数で入力してください。';}
  else if(cpu>physical||mem>ram*0.8){note=`この例では${cpu>physical?'CPUの目安が入力した物理コア数を超えています。':''}${mem>ram*0.8?'メモリ予算の合計がRAMの80%を超えています。':''} 同時ジョブ数や並列数、1件のメモリ予算を見直して考えます。`;}
  $('resource-note').textContent=note;
 }
 function update(){
  const c=config(),errors=NastranBatch.validate(c);
  $('builder-error').hidden=!errors.length;$('builder-error').textContent=errors.join(' ');$('copy-batch').disabled=!!errors.length;$('save-batch').disabled=!!errors.length;
  if(errors.length){files=null;$('batch-code').textContent='設定を確認すると、ここにバッチが表示されます。';$('line-explanation').textContent='入力欄の説明を確認してください。';return;}
  files=NastranBatch.make(c);const key=$('script-choice').value;
  $('script-purpose').textContent=purpose[key];
  $('batch-code').innerHTML=files[key].map((row,i)=>`<button type="button" class="batch-line" data-line="${i}" aria-label="${i+1}行目の説明を読む" aria-pressed="false"><span aria-hidden="true">${i+1}</span><code>${esc(row.text)}</code></button>`).join('');
  showLine(selectedLine);resources(c);
 }
 $('batch-settings').addEventListener('submit',e=>e.preventDefault());
 $('batch-settings').addEventListener('input',update);
 $('parallel-method').addEventListener('change',()=>{const m=$('parallel-method').value;$('smp-count').disabled=['serial','dmp'].includes(m);$('dmp-count').disabled=['serial','smp'].includes(m);if(!$('smp-count').disabled&&Number($('smp-count').value)<1)$('smp-count').value=4;if(!$('dmp-count').disabled&&Number($('dmp-count').value)<2)$('dmp-count').value=2;update();});
 $('script-choice').addEventListener('change',()=>{selectedLine=2;$('budget-jobs').value=$('script-choice').value==='run_two_parallel.bat'?'2':'1';update();});
 ['budget-jobs','budget-cores','budget-ram'].forEach(id=>$(id).addEventListener('input',()=>{if(files)resources(config());}));
 $('batch-code').addEventListener('click',e=>{const b=e.target.closest('[data-line]');if(b)showLine(Number(b.dataset.line));});
 let timer;function toast(msg){$('batch-toast').hidden=false;$('batch-toast').textContent=msg;clearTimeout(timer);timer=setTimeout(()=>{$('batch-toast').hidden=true;},4000);}
 $('copy-batch').addEventListener('click',async()=>{if(!files)return;try{await navigator.clipboard.writeText(NastranBatch.raw(files[$('script-choice').value]));toast('CRLF改行でコピーしました。');}catch(_){toast('この環境ではコピーできません。.batを保存してください。');}});
 $('save-batch').addEventListener('click',()=>{if(!files)return;const name=$('script-choice').value,url=URL.createObjectURL(new Blob([NastranBatch.raw(files[name])],{type:'text/plain;charset=us-ascii'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 window.BatchLesson={config,getFiles:()=>files};update();
})();
