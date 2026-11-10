(() => {
 'use strict';
 const A=window.NastranAnalysis,$=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let entry=A.entries[0],selectedExample='',timer;
 $('analysis-picker').innerHTML=A.entries.map(e=>`<option value="${e.key}">${e.title}</option>`).join('');
 function linkedDeck(text){
  const pre=$('analysis-example-raw');pre.replaceChildren();let zone='executive';
  for(const [index,line] of text.split(/(\r\n|\n)/).entries()){
   if(index%2){pre.append(document.createTextNode(line));continue;}
   let match=/^(\s*)([A-Z][A-Z0-9]*)(?=[\s(=,]|$)/.exec(line),key='';
   if(match){
    const code=match[2];
    if(/^\s*BEGIN\s+BULK\b/.test(line)){match=/^(\s*)(BEGIN\s+BULK)/.exec(line);key='CASE_BEGIN_BULK';zone='bulk';}
    else if(zone==='executive'){key=code==='SOL'?'EXEC_SOL_'+(/SOL\s+(\d+)/.exec(line)?.[1]||''): 'EXEC_'+code;if(code==='CEND')zone='case';}
    else if(zone==='case')key='CASE_'+code;
    else key=code==='PARAM'?'PARAM_'+line.slice(8,16).trim():code;
   }
   if(!key){pre.append(document.createTextNode(line));continue;}
   pre.append(document.createTextNode(match[1]));const link=document.createElement('a');link.href='bulk.html#'+key;link.textContent=match[2];link.className='deck-card-link';link.setAttribute('aria-label',match[2]+'のInputデータ解説');pre.append(link,document.createTextNode(line.slice(match[1].length+match[2].length)));
  }
 }
 function exampleHash(){return '#'+entry.key+'/'+selectedExample+($('analysis-raw-details')?.open?'/raw':'');}
 function rememberExample(){history.replaceState(null,'',exampleHash());}
 function showExample(){
  const m=A.models[selectedExample];if(!m)return;
  linkedDeck(m.text);$('analysis-filename').textContent=m.name;$('analysis-fragment').hidden=m.complete;$('analysis-model-note').textContent=m.note;const command=document.querySelector('.run-command');if(command)command.textContent='nastran '+m.name;
 }
 function render(key){
  entry=A.entries.find(e=>e.key===key)||A.entries[0];$('analysis-picker').value=entry.key;document.title=entry.title+' — FEMノート';
  const examples=entry.examples?`<section class="analysis-section"><h2>3 · 固定長入力ファイル</h2><p>公開PDFの完全リストを転記した入力です。繰返し行と共通INCLUDEを展開し、旧プロッター命令を省略しています。MSC Nastran本体では未実行です。</p><div class="analysis-example"><label>モデル<select id="analysis-example-picker">${entry.examples.map(k=>`<option value="${k}">${esc(A.models[k].title)}</option>`).join('')}</select></label><p id="analysis-model-note"></p><p id="analysis-fragment" class="analysis-fragment" hidden>入力断片：単体では解析できません。</p><details id="analysis-raw-details"><summary>固定長テキスト全文</summary><p class="analysis-link-hint">先頭コードからInputデータの解説へ移動し、戻る操作でこの全文と読んでいた位置に戻れます。</p><pre id="analysis-example-raw" tabindex="0" aria-label="入力ファイル全文。先頭コードからカード解説へ移動"></pre></details><p id="analysis-filename"></p><div class="analysis-tools"><button id="copy-analysis" class="button secondary">コピー</button><button id="save-analysis" class="button primary">DATを保存</button></div></div></section>`:`<section class="analysis-section"><h2>3 · 入力データの取得状況</h2><p>${esc(entry.availability)}</p></section>`;
  $('analysis-detail').innerHTML=`<div class="analysis-head"><span class="analysis-sol">${esc(entry.sol)} · 解析手順</span><h1>${entry.title}</h1><p>${entry.summary}</p><a href="theory.html#${entry.key}">この解析の理論を読む →</a></div><section class="analysis-section"><h2>1 · モデルと境界条件</h2><div class="analysis-visual">${window.analysisDiagram(entry.key)}</div></section><section class="analysis-section"><h2>2 · 条件と入力の対応</h2><dl class="analysis-inputs">${entry.inputs.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd></div>').join('')}</dl></section>`+examples+
   `<section class="analysis-section"><h2>4 · 実行と出力の取得</h2><p>${entry.examples?'DATを専用の作業フォルダへ保存し、MSC Nastranの実行環境で解析します。':'原典の手順または配布モデルから入力を用意してから、MSC Nastranで解析します。'} F06の終了状態、FATAL・WARNINGを先に確認し、次に要求した結果を読みます。実行コマンドとファイルの役割は下の共通手順を参照してください。</p>${entry.examples?'<pre class="run-command">nastran '+esc(A.models[entry.examples[0]].name)+'</pre>':''}</section><section class="analysis-section"><h2>5 · 結果の読み方・検算</h2><ul>${entry.outputs.map(t=>'<li>'+esc(t)+'</li>').join('')}</ul><h3>照合する条件</h3><ul>${entry.checks.map(t=>'<li>'+esc(t)+'</li>').join('')}</ul></section><section class="analysis-section"><h2>関連する解説</h2><div class="analysis-links">${entry.links.map(([url,title])=>'<a href="'+url+'">'+esc(title)+' →</a>').join('')}</div></section><div class="analysis-sources">${entry.sources.map(r=>'<a href="'+r.url+'" target="_blank" rel="noopener">'+esc(r.label)+' ↗</a>').join('')}</div>`;
  if(entry.examples){selectedExample=entry.examples[0];showExample();$('analysis-raw-details').addEventListener('toggle',rememberExample);$('analysis-example-picker').addEventListener('change',()=>{selectedExample=$('analysis-example-picker').value;showExample();rememberExample();});$('copy-analysis').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(A.models[selectedExample].text);toast('入力例をコピーしました');}catch{toast('コピーできませんでした。保存を使用してください。');}});$('save-analysis').addEventListener('click',()=>{const m=A.models[selectedExample],a=document.createElement('a'),u=URL.createObjectURL(new Blob([m.text],{type:'text/plain;charset=us-ascii'}));a.href=u;a.download=m.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});}
 }
 function route(){const [key,example,view]=location.hash.slice(1).split('/');render(key);if(entry.examples?.includes(example)){$('analysis-example-picker').value=example;selectedExample=example;showExample();}if($('analysis-raw-details'))$('analysis-raw-details').open=view==='raw';}
 function toast(t){clearTimeout(timer);$('analysis-toast').textContent=t;$('analysis-toast').hidden=false;timer=setTimeout(()=>$('analysis-toast').hidden=true,2200);}
 $('analysis-picker').addEventListener('change',()=>{location.hash=$('analysis-picker').value;window.scrollTo(0,0);});addEventListener('hashchange',route);route();
})();
