(() => {
 'use strict';
 const D=window.NastranDynamics,$=id=>document.getElementById(id);
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const url=(book,page)=>`https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_${book}/raw/resource/enus/MSC_Nastran_2020_${book}.pdf#page=${page}`;
 document.querySelectorAll('[data-dyn]').forEach(a=>{a.href=url('Dynamic_Analysis_User_Guide',a.dataset.dyn);a.target='_blank';a.rel='noopener';});
 document.querySelectorAll('[data-qrg]').forEach(a=>{a.href=url('Quick_Reference_Guide',a.dataset.qrg);a.target='_blank';a.rel='noopener';});
 const num=(v,n=3)=>Number(v).toLocaleString('ja-JP',{maximumFractionDigits:n});
 function text(x,y,value,anchor='middle'){return `<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(value)}</text>`;}
 function path(points,x,y,color='#315bd0',width=2.5){return `<path d="${points.map((p,i)=>(i?'L':'M')+x(p).toFixed(2)+','+y(p).toFixed(2)).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}"/>`;}
 function axes(top,bottom,xMax,yMin,yMax,label){let svg='';for(let j=0;j<=4;j++){const y=bottom-(bottom-top)*j/4,val=yMin+(yMax-yMin)*j/4;svg+=`<path d="M70 ${y}H680" stroke="#dce4f0"/>`+text(57,y+6,num(val,2),'end');}for(let j=0;j<=4;j++){const x=70+610*j/4;svg+=text(x,bottom+27,num(xMax*j/4,2));}return svg+text(70,top-15,label,'start');}
 function plot(){const z=Number($('damping').value),f=Number($('drive-frequency').value),r=D.response(f,z);
  $('frequency-label').textContent=num(f,5)+' Hz';
  $('frequency-metrics').innerHTML=`<div><small>固有振動数</small><strong>${num(D.fn,4)}</strong><span>Hz · 模型で決まる</span></div><div><small>変位振幅</small><strong>${num(r.amplitude)}</strong><span>mm · 静的変位は1 mm</span></div><div><small>変位の遅れ角</small><strong>${num(r.lag,1)}°</strong><span>PHASEでは${num(-r.lag,1)}°相当</span></div>`;
  const data=Array.from({length:1601},(_,i)=>({f:i/40,u:D.response(i/40,z).amplitude})),yMax=Math.ceil(Math.max(...data.map(d=>d.u))/5)*5,x=p=>70+610*p.f/40,y=p=>250-205*p.u/yMax;
  $('frequency-plot').innerHTML=axes(45,250,40,0,yMax,'変位振幅 mm')+`<path d="M${x({f:D.fn})} 45V250" stroke="#78a99d" stroke-dasharray="5 5"/>`+path(data,x,y)+`<circle cx="${x({f})}" cy="${y({u:r.amplitude})}" r="5" fill="#cf723a" stroke="white" stroke-width="2"/>`+text(675,295,'周波数 Hz','end');
  const series=D.transient(z),peak=series.reduce((a,b)=>Math.abs(b.u)>Math.abs(a.u)?b:a),max=Math.ceil(Math.abs(peak.u)*2)/2;
  const tx=p=>70+610*p.t,fy=p=>150-100*p.f/100,uy=p=>340-100*(p.u+max)/(2*max);
  $('transient-plot').innerHTML=axes(50,150,1,0,100,'外力 N')+path(series,tx,fy,'#478c77')+axes(240,340,1,-max,max,'変位 mm')+path(series,tx,uy)+text(675,390,'時刻 s','end');
  $('transient-summary').textContent=`減衰比${num(z*100)}%：計算点での最大絶対変位は約${num(Math.abs(peak.u),4)} mm（${num(peak.t,4)} s）。力の最大値は0.02 s、力の終了は0.04 sです。`;
 }
 $('damping').addEventListener('change',plot);$('drive-frequency').addEventListener('input',plot);
 $('at-natural').addEventListener('click',()=>{$('drive-frequency').step='any';$('drive-frequency').value=String(D.fn);plot();});
 $('lab-reset').addEventListener('click',()=>{$('damping').value='.02';if(!$('damping').value)$('damping').value='0.02';$('drive-frequency').step='0.1';$('drive-frequency').value='15.9';plot();});
 const descriptions={103:'外力なしで、無減衰の固有振動数とモードを求めます。共通の模型とEIGRLだけを使い、動荷重・減衰・時間刻みは不要です。',111:'100 Nの調和荷重について、0〜40 Hzを0.1 Hz間隔で調べます。モードを1個使い、減衰比2%の定常応答を計算します。',112:'0.04秒で終わる三角形の力を加え、1秒まで追います。初期変位・初期速度は0、減衰比2%、計算刻みは0.0005秒です。'};
 const help={TITLE:'結果に付く題名です。計算条件を見分ける名前で、物理量は変えません。',ECHO:'NONEはBulk入力の一覧をF06へ繰り返し出さない指定。必要ならUNSORTなどへ変更して入力を確認します。',SUBCASE:'解析ケースの番号です。この下の指定がケース1に属します。',SPC:'使う拘束セット。SPC1のSID=10を選びます。',METHOD:'固有値計算の条件。EIGRLのSID=30を選びます。',DLOAD:'動荷重セット。BulkのDLOADカードSID=50を選びます。',FREQUENCY:'計算周波数のセット。FREQ1のSID=60を選びます。',SDAMPING:'モード減衰の表。TABDMP1のTID=70を選びます。',TSTEP:'時間刻みの設定。BulkのTSTEPカードSID=90を選びます。',DISPLACEMENT:'変位を出力します。ALLは全節点。この1自由度模型では節点1のT1を見ます。103では固有モードの形を出す指定です。',VELOCITY:'速度を出力します。N・mm・s系では並進速度はmm/s。',ACCELERATION:'加速度を出力します。この単位系では並進加速度はmm/s²。',SORT1:'周波数・時刻ごとに節点を並べる出力順です。',PHASE:'複素応答を振幅と位相角（度）の形で出します。実部だけの値と区別します。'};
 let current='103';
 function choose(sol){if(!D.models[sol])return;current=sol;const model=D.models[sol];document.querySelectorAll('[data-sol]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sol===sol)));
  $('dynamic-relation-link').href='relations.html#sol-'+sol;$('case-explanation').textContent=descriptions[sol];$('executive-explanation').textContent=`SOL ${sol}で解析方法を選び、CENDでExecutive Controlを終えます。次からCase Controlです。`;
  $('executive-code').textContent=model.exec.join('\n');$('case-code').textContent=model.control.concat('BEGIN BULK').join('\n');
  const keys=['TITLE','ECHO','SUBCASE','SPC','METHOD',...(sol==='103'?[]:['DLOAD',sol==='111'?'FREQUENCY':'TSTEP','SDAMPING']),'DISPLACEMENT',...(sol==='103'?[]:['VELOCITY','ACCELERATION','SORT1']),...(sol==='111'?['PHASE']:[])];
  $('case-control-help').innerHTML='<dl>'+keys.map(k=>`<dt>${k}</dt><dd>${help[k]}</dd>`).join('')+'<dt>BEGIN BULK</dt><dd>Case Controlの終わりとBulk Dataの始まりです。これより後に8文字フィールドのカードを置きます。</dd></dl>';
  $('id-trail').textContent=sol==='103'?'METHOD 30 → EIGRL 30 ／ SPC 10 → SPC1 10':`DLOAD 50 → DLOAD(SID 50, L1 40) → ${sol==='111'?'RLOAD1':'TLOAD1'}(SID 40, EXCITEID 20) → DAREA 20 → GRID 1`;
  $('deck-name').textContent=model.name;$('dynamic-raw').textContent=model.text;
  $('dynamic-fields').innerHTML=model.rows.map(r=>{const desc=D.cards[r.name],fields=desc.lines[r.line];return `<div class="nf-card" data-card="${r.name}"><div class="nf-caption"><strong><a href="#card-${r.name}">${r.name}</a></strong><span>${esc(desc.title)}${r.line?' · 継続行':''}</span></div><div class="nf-scroll" tabindex="0" aria-label="${r.name}の8文字フィールド表。横にスクロールできます"><table class="nf-table"><thead><tr>${fields.map((field,i)=>`<th scope="col"><small>第${i+1}欄</small><span>${i*8+1}–${i*8+8}列</span><b><button data-field="${r.name}-${r.line}-${i}" aria-label="${r.name} 第${i+1}欄 ${esc(field.label)}の説明">${esc(field.label)}</button></b></th>`).join('')}</tr></thead><tbody><tr>${fields.map((_,i)=>{const value=r.text.slice(i*8,i*8+8);return `<td data-value="${esc(value)}"${value.trim()?'':' class="nf-empty"'}>${value.trim()?`<code>${esc(value)}</code>`:'<span aria-label="8文字分の空欄">空欄</span>'}</td>`;}).join('')}</tr></tbody></table></div></div>`;}).join('')+'<div class="nf-end"><code>ENDDATA</code><span>Bulk Dataと入力ファイルの終わり</span></div>';
 }
 function showCard(name){const c=D.cards[name];if(!c)return;$('dynamic-card-picker').value=name;
  $('dynamic-card-detail').innerHTML=`<article class="field-detail" id="card-${name}"><div class="eyebrow">${name}</div><h3>${esc(c.title)}</h3><p>${esc(c.intro)}</p><a href="${url('Quick_Reference_Guide',c.page)}" target="_blank" rel="noopener">原典 QRG PDF ${c.page}を開く ↗</a>${name==='PARAM'?`<p class="reference">KDAMPは<a href="${url('Quick_Reference_Guide',871)}" target="_blank" rel="noopener">QRG PDF 871</a>も参照。</p>`:''}${c.lines.map((fields,line)=>`<h3>${line?`継続行 ${line}`:'基本行'}${name==='CONM2'&&line?'（配布例では省略）':''}${['DLOAD','TSTEP'].includes(name)&&line?'（追加する場合）':''}</h3><dl class="field-list">${fields.map((field,i)=>`<div class="field-row" id="field-${name}-${line}-${i}"><dt>${esc(field.label)}<span>第${i+1}欄 · ${i*8+1}–${i*8+8}列</span></dt><dd>${esc(field.help)}</dd></div>`).join('')}</dl>`).join('')}</article>`;
 }
 $('dynamic-card-picker').innerHTML=Object.values(D.cards).map(c=>`<option value="${c.name}">${c.name} · ${esc(c.title)}</option>`).join('');
 $('dynamic-card-picker').addEventListener('change',()=>{location.hash='card-'+$('dynamic-card-picker').value;});
 $('dynamic-fields').addEventListener('click',e=>{const b=e.target.closest('[data-field]');if(b)location.hash='field-'+b.dataset.field;});
 document.querySelectorAll('[data-sol]').forEach(b=>b.addEventListener('click',()=>{choose(b.dataset.sol);history.replaceState(null,'','#input-'+b.dataset.sol);}));
 function route(){const hash=decodeURIComponent(location.hash.slice(1)),field=/^(?:field|card)-([A-Z0-9]+)(?:-(\d+)-(\d+))?$/.exec(hash),sol=/^input-(103|111|112)$/.exec(hash);if(field&&D.cards[field[1]]){showCard(field[1]);requestAnimationFrame(()=>$(hash)?.scrollIntoView({block:'start'}));}else if(sol){choose(sol[1]);requestAnimationFrame(()=>$('inputs').scrollIntoView({block:'start'}));}}
 let timer;function toast(message){$('dynamic-toast').textContent=message;$('dynamic-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('dynamic-toast').hidden=true,4000);}
 $('save-dynamics').addEventListener('click',()=>{const model=D.models[current],blob=new Blob([model.text],{type:'text/plain;charset=us-ascii'}),href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;a.download=model.name;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);});
 $('copy-dynamics').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(D.models[current].text);toast('8文字幅を保ったBDFをコピーしました');}catch{toast('コピーできませんでした。「BDFを保存」を使ってください');}});
 choose('103');showCard('GRID');plot();window.addEventListener('hashchange',route);route();
})();
