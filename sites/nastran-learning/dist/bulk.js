(() => {
 'use strict';
 const cards=window.BULK_CARDS, common=window.BULK_COMMON, $=id=>document.getElementById(id);
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const byId=new Map(cards.map(c=>[c.id,c]));
 let requestedField='';
 function packed(row){return Array.from({length:10},(_,i)=>{const value=String(row[i]??'');if(value.length>8||/[^\x20-\x7e]/.test(value)||value.includes(','))throw new Error('Invalid small field '+value);return i===0||i===9?value.padEnd(8):value.padStart(8);}).join('');}
 function desc(c,key){if(key===c.id)return c.summary;return FieldGuide.get(c.id,key)?.meaning||common[key]||'';}
 const line=(x1,y1,x2,y2,kind='line',arrow=false)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${kind}"${arrow?' marker-end="url(#arrow)"':''}/>`;
 const label=(x,y,t,cls='')=>`<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${escape(t)}</text>`;
 const node=(x,y,t,key='',dx=0,dy=25)=>`<circle cx="${x}" cy="${y}" r="5" class="node" data-field="${key}"/>${label(x+dx,y+dy,t,'label')}`;
 const box=(x,y,w,h,t)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" class="shape"/>${label(x+w/2,y+h/2+5,t,'label')}`;
 function figure(c){
  let s='';const type=c.figure;
  if(type==='grid')s=line(65,170,330,170,'line',true)+line(65,170,65,40,'line',true)+line(65,170,125,105,'line',true)+label(340,175,'X')+label(57,30,'Y')+label(135,100,'Z')+node(65,170,'0','CP',-15,25)+node(270,170,'GRID 2','ID',0,-24)+label(265,205,'X1 = 1000 mm','small');
  else if(type==='coordinate')s='<polygon points="90,170 90,45 285,170" class="shape" opacity=".7"/>'+line(90,170,90,27,'accent',true)+line(90,170,330,170,'accent',true)+line(90,170,38,203,'line',true)+node(90,170,'A','A1',-18,0)+node(90,55,'B','B3',-20,0)+node(278,170,'C','C1',0,27)+label(112,30,'+Z')+label(345,177,'+X')+label(26,220,'+Y')+label(200,135,'XZ 平面','small');
  else if(['rod','force','constraint','enforced','beam'].includes(type)){
   s='<rect x="56" y="85" width="252" height="25" class="shape"/>'+node(56,97,'G1 / 1','G1',0,41)+node(308,97,'G2 / 2','G2',0,41);
   if(type==='rod')s+=label(181,68,'CROD 100','label')+label(181,178,'PID 200 → PROD','small');
   if(['force','constraint','enforced'].includes(type)){s+=line(47,62,47,137);for(let y=63;y<139;y+=14)s+=line(31,y+13,47,y);}
   if(type==='force')s+=line(310,97,378,97,'accent',true)+label(333,70,'+X / 1000 N','small');
   if(type==='constraint')s+=label(180,175,'1, 2, 3：並進','small')+label(180,201,'4, 5, 6：回転','small')+label(90,39,'節点1を拘束','small');
   if(type==='enforced')s+=line(309,64,359,64,'accent',true)+line(359,78,359,124,'ghost')+label(275,39,'uX = +0.1 mm','small');
   if(type==='beam')s+=line(180,85,180,30,'accent',true)+label(215,33,'v / +Y','small')+line(230,165,321,165,'line',true)+label(272,195,'要素X軸','small');
  }
  else if(type==='section'||type==='beam-section'){
   s='<rect x="120" y="40" width="150" height="150" class="shape"/>'+line(113,205,277,205)+line(105,35,105,195)+label(198,228,'10 mm','small')+label(65,122,'10 mm','small');
   if(type==='section')s+=label(195,109,'A = 100','label')+label(195,138,'mm²','small');
   else s+=node(270,40,'C','C1',16,-7)+node(120,40,'D','D1',-17,-7)+node(120,190,'E','E1',-17,8)+node(270,190,'F','F1',17,8)+line(195,115,295,115,'line',true)+line(195,115,195,15,'line',true)+label(312,121,'1')+label(212,18,'2');
  }
  else if(type==='material')s=line(72,180,335,180,'line',true)+line(72,180,72,28,'line',true)+line(72,180,280,54,'accent')+label(346,187,'ε')+label(63,23,'σ')+label(220,55,'σ = E ε','label')+label(220,135,'直線の傾きが E','small');
  else if(['quad','triangle','pressure'].includes(type)){
   const triangle=type==='triangle';s=`<polygon points="70,160 290,160 ${triangle?'200,57':'330,65 110,65'}" class="shape"/>`+node(70,160,'G1','G1',-9,26)+node(290,160,'G2','G2',10,26);
   if(triangle)s+=node(200,57,'G3','G3',0,-13);else s+=node(330,65,'G3','G3',16,0)+node(110,65,'G4','G4',-20,-8);
   s+=line(200,118,200,31,'accent',true)+label(230,28,'+法線','small');
   if(type==='pressure')s+=line(133,132,133,77,'accent',true)+line(265,132,265,77,'accent',true)+label(199,214,'シェルの正の面圧','small');
  }
  else if(type==='shell-section')s='<polygon points="65,90 270,90 335,55 130,55" class="shape"/><polygon points="65,90 270,90 270,132 65,132" class="shape"/><polygon points="270,90 335,55 335,97 270,132" class="shape"/>'+line(355,55,355,97)+label(323,158,'T = 2 mm','small')+label(178,190,'MID1：面内 / MID2：曲げ','small')+label(178,218,'MID3：横せん断','small');
  else if(type==='tetra')s='<polygon points="70,170 280,170 145,35" class="shape"/><polygon points="145,35 280,170 205,105" class="shape"/>'+line(70,170,205,105,'ghost')+line(145,35,205,105,'line')+node(70,170,'G1','G1',-12,24)+node(280,170,'G2','G2',12,24)+node(205,105,'G3','G3',26,0)+node(145,35,'G4','G4',0,-13);
  else if(type==='hexa'){
   const pts=[[80,165],[245,165],[325,110],[160,110],[80,85],[245,85],[325,30],[160,30]];
   s='<polygon points="80,85 245,85 325,30 160,30" class="shape"/><polygon points="80,85 245,85 245,165 80,165" class="shape"/><polygon points="245,85 325,30 325,110 245,165" class="shape"/>'+line(80,165,160,110,'ghost')+line(160,110,325,110,'ghost')+line(160,110,160,30,'ghost');
   pts.forEach(([x,y],i)=>s+=node(x,y,'G'+(i+1),'G'+(i+1),i===3?-17:0,[0,1,3].includes(i)?25:-13));
  }
  else if(['solid-property','spc-combine','load-combine','parameter','hdf5'].includes(type)){
   const titles=type==='solid-property'?['CTETRA / CHEXA','PSOLID 801','MAT1 300']:type==='spc-combine'?['SPC / SPC1 10','SPC / SPC1 11','SPCADD 100']:type==='load-combine'?['FORCE 20','GRAV 50','LOAD 100']:type==='hdf5'?['MDLPRM','HDF5 = 1','.h5']:['PARAM','POST = -1','.op2'];
   if(type==='solid-property'||type==='parameter'||type==='hdf5')s=box(85,15,230,45,titles[0])+line(200,60,200,88,'accent',true)+box(85,91,230,45,titles[1])+line(200,136,200,163,'accent',true)+box(85,168,230,45,titles[2]);
   else s=box(8,35,180,50,titles[0])+box(212,35,180,50,titles[1])+line(100,85,180,135,'accent',true)+line(300,85,220,135,'accent',true)+box(110,145,180,50,titles[2])+label(200,225,type==='load-combine'?'全体倍率 × 各セットの倍率':'拘束セットの和集合','small');
  }
  else if(type==='moment')s='<circle cx="195" cy="110" r="29" class="shape"/>'+'<path d="M 250 110 A 55 55 0 1 0 195 165" class="accent" marker-end="url(#arrow)"/>'+node(195,110,'節点2','G',0,-80)+label(195,207,'+Z側から見た回転','small')+label(320,107,'1000','label')+label(320,133,'N·mm','small');
  else if(type==='gravity')s='<rect x="100" y="38" width="200" height="80" rx="5" class="shape"/>'+label(200,84,'質量 m','label')+line(145,119,145,183,'accent',true)+line(200,119,200,183,'accent',true)+line(255,119,255,183,'accent',true)+label(200,218,'g：−Z / 荷重：m g','small');
  else if(['rigid','interpolation'].includes(type)){
   const center=[200,111],pts=[[80,45],[320,45],[200,188]];
   pts.forEach(([x,y],i)=>{s+=type==='rigid'?line(200,111,x,y,'accent'):line(x,y,200,111,'ghost',true);s+=node(x,y,String(i+1),type==='rigid'?'GM'+(i+1):'G1,'+(i+1),i===0?-16:i===1?16:0,i===2?27:-13);});
   s+=node(...center,'99',type==='rigid'?'GN':'REFGRID',30,6)+label(200,25,type==='rigid'?'剛体関係':'重み付きの補間','small');
  }
  return `<svg viewBox="0 0 400 240" role="img" aria-label="${escape(c.caption)}"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7" fill="#3259d8"/></marker></defs>${s}</svg>`;
 }
 function renderDetail(c){
  const raw=c.rows.map(packed).join('\n')+'\n';
  const rows=c.rows.map((row,r)=>`<div class="field-row">${Array.from({length:10},(_,i)=>{const key=i===9?'次行':r>0&&i===0?'継続行':c.labels[r][i]||'—';const value=String(row[i]??'');return `<button type="button" class="field-cell${key==='継続'||key==='続き'?' continuation':''}" data-row="${r}" data-col="${i}" aria-pressed="false" aria-label="${r+1}行目 ${i*8+1}〜${i*8+8}列 ${escape(key)} ${escape(value||'空欄')}"><span class="field-label">${escape(key)}</span><span class="${value?'field-value':'field-blank'}">${value?escape(packed(row).slice(i*8,(i+1)*8)):'空欄'}</span></button>`;}).join('')}</div>`).join('');
  const keys=[...new Set(c.labels.flat())].filter(k=>![c.id,'—','続き','継続'].includes(k));
  $('card-detail').innerHTML=`<div class="card-heading"><div class="card-title"><h2>${c.id}</h2><p>${escape(c.name)}</p></div><span class="category-badge">${escape(c.category)}</span></div><p class="card-summary">${escape(c.summary)}</p><div class="subheading"><h3>入力例</h3><span>フィールド選択で定義を表示</span></div><div class="field-scroll" role="region" aria-label="8文字固定長の入力欄"><div class="field-board"><div class="field-ruler">${Array.from({length:10},(_,i)=>`<span>${i*8+1}–${i*8+8}列</span>`).join('')}</div>${rows}</div></div><p class="scroll-hint">8文字×10欄。横スクロールに対応。</p><div class="field-inspector" id="field-inspector" aria-live="polite"></div><details class="library-diagram"><summary>模式図</summary><figure class="figure-box"><div class="figure-top"><strong>要素・入力の関係</strong><span>模式図</span></div>${figure(c)}<figcaption>${escape(c.caption)}</figcaption></figure><p class="meaning">${escape(c.meaning)}</p></details>${c.caseControl?`<div class="case-control"><span>解析で使うセットを選ぶ<br>Case Control / 8文字区切りの対象外</span><code>${escape(c.caseControl)}</code></div>`:''}<details class="code-box"><summary>固定長テキスト・コピー・保存</summary><div class="code-toolbar"><span>半角スペース / 1行80文字 / 継続行を保持</span><div><button class="button secondary" id="copy-card">コピー</button><button class="button primary" id="save-card">入力断片を保存 ↓</button></div></div><pre><code id="card-raw">${escape(raw)}</code></pre><p class="code-note">これはカード単体の入力断片です。関連するGRID・材料・プロパティ・荷重選択などを組み合わせて使用します。ソルバー実行による検証は未実施です。</p></details><div class="pitfalls"><h3>指定上の注意</h3><ul>${c.notes.map(n=>`<li>${escape(n)}</li>`).join('')}</ul></div>${FieldGuide.manual(c.id)}<div class="related"><h3>関連カード</h3><div class="related-links">${c.related.map(id=>`<button class="button" data-jump="${id}">${id} →</button>`).join('')}</div></div><a class="source-note" target="_blank" rel="noopener" href="https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf#page=${c.page}">原典を確認する ↗ QRG PDF ${c.page}ページ以降</a>`;
  $('card-detail').querySelectorAll('.field-cell').forEach(button=>button.addEventListener('click',()=>inspect(c,Number(button.dataset.row),Number(button.dataset.col))));
  $('copy-card').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(raw);toast('8文字の位置を保ってコピーしました');}catch(_){const range=document.createRange();range.selectNodeContents($('card-raw'));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);toast('入力を選択しました。端末のコピー操作を使ってください。');}});
  $('save-card').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([raw],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=c.id.toLowerCase()+'_small_field.bdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  inspect(c,0,1);
  if(requestedField){const key=requestedField;requestedField='';requestAnimationFrame(()=>FieldGuide.go(key,c.id));}
 }
 function inspect(c,row,col){
  const key=col===9?'次行':row>0&&col===0?'継続行':c.labels[row][col]||'—',value=String(c.rows[row][col]??'');
  $('card-detail').querySelectorAll('.field-cell').forEach(b=>{const active=Number(b.dataset.row)===row&&Number(b.dataset.col)===col;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  const original=FieldGuide.get(c.id,key);
  const definition=c.defs?.[key]||Object.entries(c.defs||{}).find(([names])=>names.split('|').includes(key))?.[1]||common[key];
  const data=original?{...original,meaning:definition||original.meaning}:null;
  $('field-inspector').innerHTML=`<span class="field-key">${escape(data?.key||key)}</span>${data?FieldGuide.body(data,true):`<p class="field-meaning">${escape(c.summary)}</p><p>第1欄はカード名です。この行で何を定義するかをNastranへ伝えます。</p>`}<small class="inspector-position">入力値：${row+1}行目 / 第${col+1}欄 / ${col*8+1}〜${col*8+8}列 / 入力値 ${escape(value||'空欄')}</small>`;
  $('card-detail').querySelectorAll('svg [data-field]').forEach(el=>el.classList.toggle('selected',el.dataset.field===key));
 }
 window.NastranBulk={render(id,field=''){requestedField=field;const c=byId.get(id);if(c)renderDetail(c);},packed,figure};
 let timer;function toast(t){$('toast').textContent=t;$('toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('toast').hidden=true,2700);}
})();
