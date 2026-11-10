/* Read-only presentation of small-field data. Copy/download always use the original deck. */
(() => {
  'use strict';
  const schemas = {
    GRID:{name:'節点',labels:['カード名','ID','CP','X1','X2','X3','CD','PS','SEID','継続']},
    CROD:{name:'棒要素',labels:['カード名','EID','PID','G1','G2','未使用','未使用','未使用','未使用','継続']},
    PROD:{name:'棒のプロパティ',labels:['カード名','PID','MID','A','J','C','NSM','未使用','未使用','継続']},
    MAT1:{name:'等方性材料',labels:['カード名','MID','E','G','NU','RHO','A','TREF','GE','継続']},
    SPC1:{name:'単点拘束',labels:['カード名','SID','C','G1','G2','G3','G4','G5','G6','継続']},
    FORCE:{name:'集中荷重',labels:['カード名','SID','G','CID','F','N1','N2','N3','未使用','継続']},
    PARAM:{name:'パラメータ',labels:['カード名','N','V1','V2','未使用','未使用','未使用','未使用','未使用','継続']},
    MDLPRM:{name:'モデル設定',labels:['カード名','PARAM1','VAL1','PARAM2','VAL2','PARAM3','VAL3','PARAM4','VAL4','継続']},
    CORD2R:{name:'直交座標系',labels:['カード名','CID','RID','A1','A2','A3','B1','B2','B3','継続'],continuation:['継続','C1','C2','C3','未使用','未使用','未使用','未使用','未使用','継続']}
  };
  const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function canRender(raw){
    const lines=raw.replace(/\r\n/g,'\n').split('\n').filter(l=>l.trim());
    return lines.some(l=>l.trim()==='BEGIN BULK') || (lines.length>0 && lines.every(l=>l.length===80 && /^[\x20-\x7e]+$/.test(l) && (Object.hasOwn(schemas,l.slice(0,8).trim()) || l.startsWith('+'))));
  }
  function render(container,input,options={}){
    const rows=(typeof input==='string'?input.replace(/\r\n/g,'\n').split('\n').map(text=>({text})):input).filter(r=>r.text.trim());
    if(!rows.length){container.replaceChildren();return;}
    const active=r=>options.active && (r.group===options.active);
    const begin=rows.findIndex(r=>r.text.trim()==='BEGIN BULK');
    const end=rows.findIndex(r=>r.text.trim()==='ENDDATA');
    const commands=(title,items)=>`<section class="nf-commands"><h4>${title} <small>命令文・8文字区切りの対象外</small></h4><pre>${items.map(r=>`<span class="nf-command${active(r)?' nf-active':''}">${escape(r.text)}</span>`).join('')}</pre></section>`;
    let markup='<p class="nf-guide"><strong>1マス＝8文字</strong> · ヘッダーは欄番号／列位置／項目名です。横にスクロールして全10欄を確認できます。項目名を押すと、意味・空欄時・具体例の説明を開きます。<span>「空欄」は8文字分の空白を表します。ヘッダー・罫線・「空欄」の文字は入力データに含めません。</span></p>';
    if(begin>=0){
      const cend=rows.findIndex(r=>r.text.trim()==='CEND');
      if(cend>=0){markup+=commands('Executive Control',rows.slice(0,cend+1));markup+=commands('Case Control',rows.slice(cend+1,begin+1));}
      else if(begin>0)markup+=commands('制御文',rows.slice(0,begin+1));
      markup+='<h4 class="nf-bulk-title">Bulk Data <small>1行80列・10フィールド</small></h4>';
    }
    const bulkRows=rows.slice(begin>=0?begin+1:0,end>=0?end:rows.length);
    let lastName='',current=null;const groups=[];
    for(const row of bulkRows){
      if(row.text.trim().startsWith('$')){groups.push({comment:row.text});current=null;continue;}
      let name=row.text.slice(0,8).trim(),continuation=false;
      if(name.startsWith('+')||!name){name=lastName;continuation=true;}else lastName=name;
      const descriptor=schemas[name];
      if(!descriptor){groups.push({comment:row.text});current=null;continue;}
      const labels=continuation?(descriptor.continuation||['継続',...Array(8).fill('データ'),'継続']):descriptor.labels;
      const key=name+(continuation?'-continuation':'');
      if(!current||current.key!==key){current={key,name,descriptor,labels,rows:[]};groups.push(current);}
      current.rows.push(row);
    }
    for(const group of groups){
      if(group.comment){markup+=`<pre class="nf-comment">${escape(group.comment)}</pre>`;continue;}
      markup+=`<div class="nf-card" data-card="${group.name}"><div class="nf-caption"><strong><a href="bulk.html#${group.name}">${group.name}</a></strong><span>${group.descriptor.name}${group.key.endsWith('continuation')?'・継続行':''}</span></div><div class="nf-scroll" tabindex="0" aria-label="${group.name}の8文字フィールド表。横にスクロールできます"><table class="nf-table"><thead><tr>${group.labels.map((label,i)=>`<th scope="col"><small>第${i+1}欄</small><span>${i*8+1}–${i*8+8}列</span><b><a href="bulk.html#${group.name}${i===0&&!group.key.endsWith('continuation')?'':'/'+encodeURIComponent(i===9?'次行':i===0?'継続行':label==='未使用'?'空欄':label)}">${label}</a></b></th>`).join('')}</tr></thead><tbody>${group.rows.map(row=>{
        const padded=row.text.padEnd(80,' ');
        return `<tr${active(row)?' class="nf-active"':''}>${Array.from({length:10},(_,i)=>{const value=padded.slice(i*8,i*8+8);return `<td data-column="${i+1}" data-value="${escape(value)}"${value.trim()?'':' class="nf-empty"'}>${value.trim()?`<code>${escape(value)}</code>`:'<span aria-label="8文字分の空欄">空欄</span>'}</td>`;}).join('')}</tr>`;
      }).join('')}</tbody></table></div></div>`;
    }
    if(end>=0)markup+=`<div class="nf-end${active(rows[end])?' nf-active':''}"><code>ENDDATA</code><span>Bulk Dataと入力ファイルの終わり</span></div>`;
    container.innerHTML=markup;
  }
  window.NastranFields={render,canRender};
})();
