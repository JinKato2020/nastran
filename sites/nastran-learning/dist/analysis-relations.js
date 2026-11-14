/* Current analysis inputs: card references, not solver execution order. */
(()=>{
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const units=s=>[...s].reduce((n,c)=>n+(/[\x20-\x7e]/.test(c)?.56:1),0);
 function wrap(value,max){const result=[];for(const line of String(value||'').split('\n')){let current='';for(const c of line){if(current&&units(current+c)>max){const at=current.lastIndexOf(' ');if(at>current.length*.3){result.push(current.slice(0,at));current=current.slice(at+1);}else{result.push(current);current='';}}current+=c;}if(current)result.push(current);}return result;}
 function text(x,y,value,size=12,fill='#405e83',anchor='start'){return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}">${esc(value)}</text>`;}
 function panel(p,mapKey,index){
  const w=340,pad=12,gap=18,positions={};let y=14;
  for(const [rank,layer] of p.layers.entries()){
   const nw=(w-2*pad-gap*(layer.length-1))/layer.length;let h=0;
   layer.forEach((id,j)=>{const n=p.nodes.find(n=>n.id===id),labels=wrap(n.label,(nw-18)/13),details=wrap(n.detail,(nw-18)/11);const nh=26+labels.length*18+details.length*16;positions[id]={x:pad+j*(nw+gap),y,w:nw,h:nh,labels,details,rank};h=Math.max(h,nh);});
   layer.forEach(id=>positions[id].h=h);y+=h+64;
  }
  const marker=`analysis-map-${mapKey}-${index}`;let lines='',nodes='';
  for(const edge of p.edges){
   const a=positions[edge.from],b=positions[edge.to];if(!a||!b)throw Error('Unknown relation node');
   const x1=a.x+a.w/2,x2=b.x+b.w/2,y1=a.y+a.h,y2=b.y,mid=(y1+y2)/2,color=edge.dashed?'#8c6b9c':'#617fa5';
   const skip=b.rank>a.rank+1,lane=x1>w/2?w-4:4,label=wrap(edge.label,22),labelX=p.edges.filter(e=>e.to===edge.to).length>1?x1:x2;
   const d=skip?`M${x1} ${y1}V${y1+14}H${lane}V${y2-22}H${x2}V${y2-4}`:`M${x1} ${y1}V${mid}H${x2}V${y2-4}`;
   lines+=`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" ${edge.dashed?'stroke-dasharray="5 3"':''} marker-end="url(#${marker})"><title>${esc(edge.from+' → '+edge.to+'：'+edge.label)}</title></path>`;
   label.forEach((s,k)=>{const yy=(skip?y2-30:mid-8)+(k-(label.length-1)/2)*13,lw=Math.min(310,units(s)*10+10),xx=Math.max(lw/2+2,Math.min(w-lw/2-2,labelX));lines+=`<rect x="${xx-lw/2}" y="${yy-10}" width="${lw}" height="13" fill="#f5f8fc"/>`+text(xx,yy,s,10,color,'middle');});
  }
  for(const n of p.nodes){const box=positions[n.id],caseNode=n.card?.startsWith('CASE_'),paramNode=n.card?.startsWith('PARAM_'),color=caseNode?'#315ba0':paramNode?'#805497':'#426581',fill=caseNode?'#e9f0ff':paramNode?'#f4edf8':'#fff';
   const link=n.card?`<a href="bulk.html#${esc(n.card)}" data-relation-card="${esc(n.card)}" data-analysis-card="${esc(n.card)}" aria-label="${esc(n.label)}のInputデータ解説">`:'<g>';
   nodes+=link+`<title>${esc(n.label+'：'+n.detail)}</title><rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="7" fill="${fill}" stroke="${color}"/>`;
   let yy=box.y+21;for(const s of box.labels){nodes+=text(box.x+9,yy,s,13,color);yy+=18;}yy+=3;for(const s of box.details){nodes+=text(box.x+9,yy,s,11);yy+=16;}nodes+=n.card?'</a>':'</g>';
  }
  return `<figure class="analysis-relation-panel"><figcaption><h4>${esc(p.title)}</h4>${p.note?'<p>'+esc(p.note)+'</p>':''}</figcaption><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${y-48}" role="group" aria-label="${esc(p.title)}のカード参照関係"><defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#617fa5"/></marker></defs>${lines}${nodes}</svg></figure>`;
 }
 window.renderAnalysisRelations=(key,example)=>{
  const mapKey=example||key,map=window.AnalysisRelationMaps[mapKey];
  if(!map)throw Error('Missing analysis relation map: '+mapKey);
  return `<div class="analysis-relation-heading"><h3>${key==='complex-modes'?'SOL 107／110のカード相関図':'このモデルのカード相関図'}</h3><a href="analysis.html#common/relations">図の読み方 →</a></div><p class="analysis-relation-scope">${esc(map.scope)}</p><div class="analysis-relation-grid">${map.panels.map((p,i)=>panel(p,mapKey,i)).join('')}</div>`;
 };
})();
