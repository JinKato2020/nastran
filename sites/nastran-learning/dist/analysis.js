(() => {
 'use strict';
 const A=window.NastranAnalysis,$=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let entry=A.entries[0],selectedExample='',timer;
 $('analysis-picker').innerHTML=A.entries.map(e=>`<option value="${e.key}">${e.title}</option>`).join('');
 function visual(key){
  const start='<svg viewBox="0 0 640 160" role="img" aria-label="'+esc(entry.title)+'の概念図"><defs><linearGradient id="heat" x1="0" x2="1"><stop stop-color="#d97760"/><stop offset="1" stop-color="#5486cd"/></linearGradient></defs>',end='</svg>';
  if(key==='heat')return start+'<rect x="70" y="55" width="500" height="36" rx="4" fill="url(#heat)"/><g fill="#284b73" font-size="24" text-anchor="middle"><text x="70" y="35">400 K</text><text x="320" y="35">350 K</text><text x="570" y="35">300 K</text><text x="320" y="130">x = 0 / 0.5 / 1 m · Q = 10 W</text></g><g fill="#fff" stroke="#385b91" stroke-width="2"><circle cx="70" cy="73" r="5"/><circle cx="320" cy="73" r="5"/><circle cx="570" cy="73" r="5"/></g>'+end;
  if(key==='buckling')return start+'<path d="M160 130V25M460 130V25" stroke="#a6bad7" stroke-width="8"/><path d="M160 130Q300 75 160 25" stroke="#426ad2" stroke-width="6" fill="none"/><path d="M460 25V5M460 25L452 14M460 25L468 14" stroke="#c37652" stroke-width="3"/><text x="340" y="155" text-anchor="middle" font-size="24" fill="#33557e">直線状態 → 座屈形状 φ　 /　 荷重係数 λ</text>'+end;
  if(key==='fracture')return start+'<rect x="100" y="30" width="440" height="100" fill="#e9eff9" stroke="#7895c4"/><path d="M100 80H315" stroke="#344f79" stroke-width="5"/><path d="M315 80L375 40M315 80L395 80M315 80L375 120" stroke="#d39162" stroke-width="2"/><circle cx="315" cy="80" r="22" fill="none" stroke="#cf7753" stroke-dasharray="4 4"/><text x="430" y="85" font-size="23" fill="#345582">K / √(2πr)</text>'+end;
  if(key==='static')return start+'<path d="M80 25V130M65 35L80 25M65 60L80 50M65 85L80 75M65 110L80 100" stroke="#657fa5" stroke-width="3"/><rect x="80" y="60" width="400" height="25" rx="3" fill="#b8c9e8"/><path d="M480 72H575L560 63M575 72L560 81" fill="none" stroke="#c47552" stroke-width="4"/><text x="540" y="45" font-size="17" fill="#986040">F</text><text x="280" y="125" font-size="24" fill="#33557e">剛性 K → 変位 u・応力 σ</text>'+end;
  let path='';for(let i=0;i<=100;i++){const x=70+i*5,y=80-40*Math.sin(i/100*Math.PI*6)*(key==='transient'?Math.exp(-i/75):1);path+=(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2);}
  return start+'<path d="M60 15V135H590M60 80H590" stroke="#c7d4e7" fill="none"/><path d="'+path+'" stroke="#446bd1" stroke-width="3" fill="none"/><text x="320" y="155" text-anchor="middle" font-size="23" fill="#33557e">'+(key==='modes'?'固有振動数・モード形':key==='transient'?'時間に対する応答の変化':'調和応答の振幅と位相')+'</text>'+end;
 }
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
  linkedDeck(m.text);$('analysis-filename').textContent=m.name;$('analysis-fragment').hidden=m.complete;
 }
 function render(key){
  entry=A.entries.find(e=>e.key===key)||A.entries[0];$('analysis-picker').value=entry.key;document.title=entry.title+' — Nastran';
  $('analysis-detail').innerHTML='<div class="analysis-head"><span class="analysis-sol">'+esc(entry.sol)+'</span><h1>'+entry.title+'</h1><p>'+entry.summary+'</p></div><div class="analysis-visual">'+visual(entry.key)+'<p class="analysis-equation">'+entry.equation+'</p><p class="analysis-symbols">'+entry.symbols+'</p></div><div class="analysis-flow">'+entry.flow.map((x,i)=>'<div><small>0'+(i+1)+'</small>'+esc(x)+'</div>').join('')+'</div><section class="analysis-section"><h2>モデルと入力</h2><dl class="analysis-inputs">'+entry.inputs.map(([k,v])=>'<div><dt>'+k+'</dt><dd>'+v+'</dd></div>').join('')+'</dl></section><section class="analysis-section"><h2>結果の読み方</h2><ul>'+entry.outputs.map(t=>'<li>'+t+'</li>').join('')+'</ul></section><section class="analysis-section"><h2>確認事項</h2><ul>'+entry.checks.map(t=>'<li>'+t+'</li>').join('')+'</ul></section>'+
   (entry.examples?'<section class="analysis-section"><h2>入力例</h2><p>'+entry.exampleNote+'</p><div class="analysis-example"><label>例題<select id="analysis-example-picker">'+entry.examples.map(k=>'<option value="'+k+'">'+(k==='heat'?'SOL 153 · 棒の定常熱伝導':k==='buckling'?'SOL 105 · 制御文の断片':'SOL '+k+' · 1自由度モデル')+'</option>').join('')+'</select></label><p id="analysis-fragment" class="analysis-fragment">入力断片：このファイル単体では解析できません。</p><details id="analysis-raw-details"><summary>固定長テキスト全文</summary><p class="analysis-link-hint">先頭のコードを選ぶとInputデータの解説へ移動します。戻る操作でこの全文に戻れます。</p><pre id="analysis-example-raw" tabindex="0" aria-label="入力ファイル全文。先頭コードからカード解説へ移動"></pre></details><p id="analysis-filename"></p><div class="analysis-tools"><button id="copy-analysis" class="button secondary">コピー</button><button id="save-analysis" class="button primary">BDFを保存</button></div></div></section>':'')+
   '<section class="analysis-section"><h2>詳しい教材</h2><div class="analysis-links">'+entry.links.map(([url,title])=>'<a href="'+url+'">'+title+' →</a>').join('')+'</div></section><div class="analysis-sources">'+entry.sources.map(r=>'<a href="'+r.url+'" target="_blank" rel="noopener">'+r.label+' ↗</a>').join('')+'</div>';
  if(entry.examples){selectedExample=entry.examples[0];showExample();$('analysis-raw-details').addEventListener('toggle',rememberExample);$('analysis-example-picker').addEventListener('change',()=>{selectedExample=$('analysis-example-picker').value;showExample();rememberExample();});$('copy-analysis').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(A.models[selectedExample].text);toast('入力例をコピーしました');}catch{toast('コピーできませんでした。保存を使用してください。');}});$('save-analysis').addEventListener('click',()=>{const m=A.models[selectedExample],a=document.createElement('a'),u=URL.createObjectURL(new Blob([m.text],{type:'text/plain;charset=us-ascii'}));a.href=u;a.download=m.name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});}
 }
 function route(){const [key,example,view]=location.hash.slice(1).split('/');render(key);if(entry.examples?.includes(example)){$('analysis-example-picker').value=example;selectedExample=example;showExample();}if($('analysis-raw-details'))$('analysis-raw-details').open=view==='raw';}
 function toast(t){clearTimeout(timer);$('analysis-toast').textContent=t;$('analysis-toast').hidden=false;timer=setTimeout(()=>$('analysis-toast').hidden=true,2200);}
 $('analysis-picker').addEventListener('change',()=>{location.hash=$('analysis-picker').value;window.scrollTo(0,0);});addEventListener('hashchange',route);route();
})();
