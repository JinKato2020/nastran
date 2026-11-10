(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sources={static:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide.pdf',qrg:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf'};
  $$('[data-source]').forEach(a=>{a.href=sources[a.dataset.source]+'#page='+a.dataset.page;a.target='_blank';a.rel='noopener';});
  function fixed(fields){
    if(fields.length>10)throw new Error('Too many fields');
    return Array.from({length:10},(_,i)=>{const v=String(fields[i]??'');if(v.length>8||/[^\x20-\x7e]|,/.test(v))throw new Error('Invalid small field');return i===0||i===9?v.padEnd(8):v.padStart(8);}).join('');
  }
  $('#param-post-example').textContent=fixed(['PARAM','POST','1']);
  $('#param-grdpnt-example').textContent=fixed(['PARAM','GRDPNT','0']);
  $('#param-wtmass-example').textContent=fixed(['PARAM','WTMASS','1.']);
  ['post','grdpnt','wtmass'].forEach(name=>NastranFields.render($('#param-'+name+'-table'),$('#param-'+name+'-example').textContent));
  const lessons={
    executive:{title:'Executive Control',explanation:'先頭のSOL 101で線形静解析を選択し、CENDで区画を終了します。この2行は8文字固定長ではありません。'},
    case:{title:'Case Control',explanation:'CENDからBEGIN BULKまで。共通のSPC = 10と結果要求、各SUBCASEのLOADを確認します。力の大きさはBulkのFORCEに書いてあります。'},
    param:{title:'PARAM',explanation:'BEGIN BULKの後のPARAM行です。POSTは設定名、1は整数の値。PARAMもBulkカードなので1欄8文字で書きます。'},
    bulk:{title:'Bulk Data',explanation:'節点・要素・断面・材料・拘束・荷重を8文字固定長で定義し、ENDDATAで終了します。PARAMも同じBulk区画内にあります。'}
  };
  let selected='executive', deck='';
  function caseLines(second){
    const suffix=$('#include-pch').checked?'(PRINT,PUNCH)':'';
    const lines=['TITLE = AXIAL ROD CONTROLS EXAMPLE','ECHO = NONE',...['DISPLACEMENT','SPCFORCES','FORCE','STRESS'].map(c=>c+suffix+' = ALL'),'SPC = 10','SUBCASE 1','    LABEL = AXIAL 1000 N','    LOAD = 20'];
    if(second)lines.push('SUBCASE 2','    LABEL = AXIAL 2000 N','    LOAD = 21');
    return lines;
  }
  function render(){
    const post=$('#include-post').checked, second=$('#include-second').checked, rows=[];
    const add=(text,group)=>rows.push({text,group});const bulk=fields=>add(fixed(fields),'bulk');
    add('SOL 101','executive');add('CEND','executive');caseLines(second).forEach(line=>add(line,'case'));add('BEGIN BULK','case');
    if(post)add(fixed(['PARAM','POST','1']),'param');
    if($('#include-h5').checked)add(fixed(['MDLPRM','HDF5','1']),'param');
    bulk(['GRID','1','','0.','0.','0.']);bulk(['GRID','2','','1000.','0.','0.']);bulk(['CROD','100','200','1','2']);bulk(['PROD','200','300','100.']);bulk(['MAT1','300','210000.','','0.3']);bulk(['SPC1','10','123456','1']);bulk(['SPC1','10','23456','2']);bulk(['FORCE','20','2','0','1000.','1.','0.','0.']);
    if(second)bulk(['FORCE','21','2','0','2000.','1.','0.','0.']);
    add('ENDDATA','bulk');deck=rows.map(r=>r.text).join('\n')+'\n';
    $('#input-deck').innerHTML=rows.map(r=>`<span class="deck-line${r.group===selected?' highlight':''}" data-group="${r.group}"><code>${esc(r.text)}</code></span>`).join('');
    NastranFields.render($('#input-fields'),rows,{active:selected});
    $('#case-example').textContent=caseLines(false).concat('BEGIN BULK').join('\n');
    $('#deck-current-title').textContent='いま読む場所 · '+lessons[selected].title;
    $('#deck-current-explanation').textContent=selected==='param'&&!post?'現在はPOSTの追加を外しているため、PARAM行を省略しています。この棒の基本解析は、PARAM行なしでも記述できます。':lessons[selected].explanation;
    $('#second-values').hidden=!second;
    $('#output-explanation').textContent='F06へ変位・反力・要素力・応力を要求します。'+($('#include-pch').checked?' PCHにも同じ4種類を出します。':'')+(post?' OP2用にPARAM,POST,1を8文字形式で追加します。':'')+($('#include-h5').checked?' H5用にMDLPRM,HDF5,1（圧縮あり）を8文字形式で追加します。':'');
  }
  function route(){
    const id=location.hash.slice(1);
    if(id==='sources')return;
    const stage=Object.hasOwn(lessons,id)||['rules','complete'].includes(id)?id:'executive';
    if(Object.hasOwn(lessons,stage))selected=stage;
    $$('.input-lesson').forEach(p=>{p.hidden=p.id!==stage;});
    $('#rules').hidden=stage!=='rules';
    $$('.input-nav a').forEach(a=>{if(a.hash==='#'+stage)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    $$('[data-map]').forEach(a=>a.classList.toggle('active',a.dataset.map===selected));
    document.title=(lessons[stage]?.title||({rules:'8文字の入力規則',complete:'完成BDFの保存'}[stage]))+' — Nastran はじめの一歩';
    render();
    if(id===stage)requestAnimationFrame(()=>document.getElementById(stage).scrollIntoView({block:'start'}));
  }
  // Initialize even when opening the complete-deck or source anchor directly.
  render();
  route();
  addEventListener('hashchange',route);
  ['include-post','include-second','include-pch','include-h5'].forEach(id=>$('#'+id).addEventListener('change',render));
  let timer;
  function toast(message){clearTimeout(timer);$('#toast').textContent=message;$('#toast').hidden=false;timer=setTimeout(()=>{$('#toast').hidden=true;},3000);}
  $('#copy-input').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(deck);toast('空欄と8文字の欄を保ってコピーしました。');}catch{toast('コピーできませんでした。「BDFを保存」を利用してください。');}});
  $('#download-input').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([deck],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='axial_rod_controls.bdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('axial_rod_controls.bdfを保存します。');});
})();
