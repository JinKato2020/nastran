(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const source={guide2024:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2024.1_Linear_Static_Analysis_User_Guide.pdf',static:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2025.1_Linear_Static_Analysis_User_Guide.pdf',qrg:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2025.1_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2025.1_Quick_Reference_Guide.pdf'};
  $$('[data-source]').forEach(a=>{a.href=source[a.dataset.source]+'#page='+a.dataset.page;a.target='_blank';a.rel='noopener';});
  const colors={basic:'#326599',local:'#28785e',force:'#ad3938',ink:'#7b8fab'};
  const defs=document.createElementNS('http://www.w3.org/2000/svg','svg');
  defs.setAttribute('aria-hidden','true');defs.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  defs.innerHTML='<defs>'+Object.entries(colors).map(([key,color])=>`<marker id="coord-arrow-${key}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')+'</defs>';
  document.body.prepend(defs);
  const arrow=(x1,y1,x2,y2,tone='basic',extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${colors[tone]}" stroke-width="2.5" marker-end="url(#coord-arrow-${tone})" ${extra}/>`;
  const text=(x,y,value,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
  const svg=(title,body,box='0 0 520 300')=>`<svg class="coordinate-diagram lesson-coordinate" viewBox="${box}" role="img" aria-label="${esc(title)}">${body}</svg>`;
  const circle=(x,y,r=6)=>`<circle class="node" cx="${x}" cy="${y}" r="${r}"/>`;
  function route(){
    const id=location.hash.slice(1);if(id==='sources')return;
    const panels=$$('.guide-panel');
    const selected=panels.some(panel=>panel.id===id)?id:'systems';
    panels.forEach(p=>{p.hidden=p.id!==selected;});
    $$('.guide-nav a').forEach(a=>{if(a.hash==='#'+selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(id===selected)requestAnimationFrame(()=>document.getElementById(selected).scrollIntoView({block:'start'}));
  }
  addEventListener('hashchange',route);route();
  $('#grid-diagram').innerHTML=svg('基本座標のXは右、Yは上。局所10のxは上、yは左。節点Pは基本X100、Y0で、物理的な力と変位の方向は上。',`${arrow(120,220,450,220)}${arrow(120,220,120,25)}${arrow(120,220,120,80,'local','stroke-dasharray="6 4"')}${arrow(120,220,25,220,'local')}${text(462,228,'X','basic-text label')}${text(100,25,'Y','basic-text label')}${text(139,86,'x₁₀','local-text label')}${text(22,250,'y₁₀','local-text label')}${circle(120,220,4)}${text(117,247,'O','small')}${circle(360,220,7)}${arrow(349,205,349,106,'force')}${arrow(376,205,376,142)}${text(327,88,'荷重 F','force-text label','middle')}${text(394,132,'変位 u','basic-text label')}${text(360,261,'P (100, 0, 0)','', 'middle')}`);
  function fixed(fields){return Array.from({length:10},(_,i)=>{const value=String(fields[i]??'');if(value.length>8||/[^\x20-\x7e]|,/.test(value))throw new Error('Invalid fixed field');return i===0||i===9?value.padEnd(8):value.padStart(8);}).join('');}
  function updateCoordinates(){
    const cp=$('#choose-cp').value,cd=$('#choose-cd').value,cid=$('#choose-cid').value;
    const position=cp==='0'?['100.','0.','0.']:['0.','-100.','0.'];
    const direction=cid==='0'?['0.','1.','0.']:['1.','0.','0.'];
    const disp=cd==='0'?'(0, 0.1, 0)':'(0.1, 0, 0)';
    $('#coordinate-values').innerHTML=`<div><span>GRIDのX1・X2・X3 [mm]</span><strong id="cp-values">${cp==='0'?'(100, 0, 0)':'(0, −100, 0)'}</strong></div><div><span>変位T1・T2・T3 [mm]</span><strong id="cd-values">${disp}</strong></div><div><span>FORCEのN1・N2・N3</span><strong id="cid-values">${cid==='0'?'(0, 1, 0)':'(1, 0, 0)'}</strong></div><p>位置とベクトルは固定。書き表す成分だけを変えています。</p>`;
    const rows=[fixed(['CORD2R','10','0','0.','0.','0.','0.','0.','1.','+C10']),fixed(['+C10','0.','1.','0.']),fixed(['GRID','2',cp,...position,cd]),fixed(['FORCE','20','2',cid,'100.',...direction])];
    NastranFields.render($('#coordinate-fields'),rows.map(value=>({text:value})));
  }
  ['cp','cd','cid'].forEach(key=>$('#choose-'+key).addEventListener('change',updateCoordinates));updateCoordinates();
  $('#bar-axes').innerHTML=svg('オフセットなしの梁。x軸はAからBへ、方向ベクトルvはx-y平面を定め、yはxに直交し、zは紙面の手前。',`<path d="M145 210L405 125L145 50Z" fill="#e8f4ed" stroke="#7f9f90"/><path class="body" d="M140 201L400 116L410 134L150 219Z"/>${circle(145,210)}${circle(405,125)}${arrow(145,210,365,138,'local')}${arrow(145,210,145,50,'local')}${arrow(145,210,104,85,'local')}${text(415,125,'B')}${text(139,242,'A')}${text(333,170,'xₑ','local-text label')}${text(155,65,'v','local-text label')}${text(73,81,'yₑ','local-text label')}<circle cx="70" cy="210" r="11" fill="none" stroke="#28785e"/><circle cx="70" cy="210" r="3" fill="#28785e"/>${text(49,245,'zₑ','local-text label')}${text(260,285,'⊙：紙面の手前','small','middle')}`);
  $('#quad-axes').innerHTML=svg('長方形CQUAD4の節点順G1、G2、G3、G4。要素xは右、yは上、zは手前。緑の材料x軸は30度回転。',`<rect class="body" x="125" y="60" width="270" height="170"/>${circle(125,230)}${circle(395,230)}${circle(395,60)}${circle(125,60)}${text(99,258,'G1')}${text(384,258,'G2')}${text(384,42,'G3')}${text(98,42,'G4')}${arrow(240,155,365,155)}${arrow(240,155,240,72)}${arrow(240,155,348,93,'local')}${text(365,179,'xₑ','basic-text label')}${text(251,76,'yₑ','basic-text label')}${text(357,95,'xₘ','local-text label')}<circle cx="240" cy="155" r="9" fill="#fff" stroke="#326599"/><circle cx="240" cy="155" r="3" fill="#326599"/>${text(216,187,'zₑ','basic-text')}`);
  $('#bending-sign').innerHTML=svg('左端固定の片持ち梁。先端の荷重は下向き。固定端近くの上側は引張り、下側は圧縮。',`
   <rect x="32" y="34" width="18" height="162" fill="#a3b4ce"/>
   <path d="M50 81H330" class="ghost"/>
   <path class="body" d="M50 73C175 73 261 96 330 134L330 154C261 116 175 93 50 93Z"/>
   <path d="M50 73C102 73 145 77 180 84" fill="none" stroke-width="4" stroke="#ad3938"/>
   <path d="M50 93C102 93 145 97 180 104" fill="none" stroke-width="4" stroke="#326599"/>
   ${arrow(330,62,330,130,'force')}${text(330,49,'荷重','force-text label','middle')}
   ${text(64,59,'上側：引張り ＋','force-text label')}${text(64,138,'下側：圧縮 −','basic-text label')}
   ${text(50,221,'固定端','small','middle')}${text(326,190,'変形を拡大','small','middle')}`,'0 0 390 235');
  $('#torsion-sign').innerHTML=svg('丸棒の正の長手軸側から見た円形断面。接線方向のせん断は反時計回り。中心でゼロ、外周で最大。',`
   <circle cx="124" cy="121" r="70" class="body"/>
   <circle cx="124" cy="121" r="40" class="ghost"/>
   <path d="M124 121H193" class="ghost"/>
   ${arrow(194,121,194,56,'force')}${arrow(164,121,164,84,'force')}${arrow(124,51,62,51,'force')}${arrow(54,121,54,183,'force')}
   ${circle(124,121,4)}${text(92,149,'中心 0','small')}
   ${text(212,81,'外周で最大','force-text label')}${text(212,126,'接線方向のせん断','label')}
   ${text(124,222,'断面を +xₑ 側から見る','small','middle')}`,'0 0 390 235');
  function signFigure(mode){
    let arrows='';
    if(mode==='shear')arrows=arrow(250,160,250,72,'force')+arrow(120,50,221,50,'force')+arrow(90,75,90,160,'force')+arrow(220,183,120,183,'force');
    else if(mode==='tension')arrows=arrow(230,115,294,115,'force')+arrow(110,115,46,115,'force');
    else arrows=arrow(294,115,230,115,'force')+arrow(46,115,110,115,'force');
    const labels=mode==='shear'?text(267,115,'+x面','small')+text(170,31,'+y面','small','middle'):text(170,190,mode==='tension'?'σx > 0':'σx < 0','label','middle');
    return svg(mode==='shear'?'正のせん断。右面は上、上面は右、左面は下、下面は左向き。':mode==='tension'?'正の垂直応力。両側から外向きに引く。':'負の垂直応力。両側から内向きに押す。',`<rect class="body" x="110" y="70" width="120" height="90"/>${arrows}${labels}`,'0 0 340 220');
  }
  $('#tension-sign').innerHTML=signFigure('tension');$('#compression-sign').innerHTML=signFigure('compression');$('#shear-sign').innerHTML=signFigure('shear');
  const clean=n=>Math.abs(n)<1e-10?0:n;
  function stressTransform(sx,sy,tau,degrees){const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);return {sx:clean(c*c*sx+s*s*sy+2*c*s*tau),sy:clean(s*s*sx+c*c*sy-2*c*s*tau),tau:clean(c*s*(sy-sx)+(c*c-s*s)*tau)};}
  function invariants(sx,sy,tau){const mean=(sx+sy)/2,r=Math.hypot((sx-sy)/2,tau);return {major:clean(mean+r),minor:clean(mean-r),vonMises:Math.sqrt(Math.max(0,sx*sx-sx*sy+sy*sy+3*tau*tau))};}
  window.NastranCoordinates=Object.freeze({stressTransform,invariants});
  const fmt=(number,digits=1)=>{const n=clean(number);return (n>0?'+':n<0?'−':'')+Math.abs(n).toFixed(digits);};
  const states={tension:{sx:100,sy:0,tau:0},compression:{sx:-100,sy:0,tau:0},shear:{sx:0,sy:0,tau:50}};
  function stressFigure(angle,state){
    const a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=260,y=165;
    let loads='';
    if(state==='tension')loads=arrow(165,165,92,165,'force')+arrow(355,165,428,165,'force');
    else if(state==='compression')loads=arrow(92,165,165,165,'force')+arrow(428,165,355,165,'force');
    else loads=arrow(368,220,368,108,'force')+arrow(210,70,308,70,'force')+arrow(152,110,152,220,'force')+arrow(310,260,210,260,'force');
    const arc=Math.abs(angle)<0.01?'':`<path d="M325 165A65 65 0 0 ${angle<0?1:0} ${x+65*c} ${y-65*s}" fill="none" stroke="#28785e" stroke-width="1.5"/>`;
    return svg(`固定の応力状態に対して、読み取る軸を${angle}度回転した図。`, `<rect x="170" y="85" width="180" height="160" fill="#f1f4fa" stroke="#d4deed"/>${loads}<rect x="200" y="105" width="120" height="120" fill="#e8f4ed" fill-opacity="0.55" stroke="#28785e" stroke-dasharray="5 4" transform="rotate(${-angle} 260 165)"/>${arrow(45,290,118,290)}${arrow(45,290,45,218)}<path d="M260 165H325" fill="none" stroke="#326599" stroke-dasharray="3 3"/>${arrow(x,y,x+120*c,y-120*s,'local')}${arrow(x,y,x-100*s,y-100*c,'local')}${arc}${text(129,298,'X','basic-text label')}${text(45,205,'Y','basic-text label','middle')}${text(x+132*c-20*s,y-132*s-20*c,'x','local-text label','middle')}${text(x-120*s+25*c,y-120*c-25*s,'y','local-text label','middle')}${text(260,323,`θ = ${angle>0?'+':''}${angle}°`,'local-text label','middle')}`,'0 0 520 335');
  }
  function updateStress(){
    const angle=Number($('#axis-angle').value),state=$('#stress-state').value,s=states[state],r=stressTransform(s.sx,s.sy,s.tau,angle),inv=invariants(r.sx,r.sy,r.tau);
    $('#angle-value').textContent=(angle>0?'+':'')+angle+'°';
    $$('[data-angle]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.angle)===angle)));
    $('#stress-diagram').innerHTML=stressFigure(angle,state);
    $('#stress-values').innerHTML=[['sx','σx',r.sx],['sy','σy',r.sy],['tau','τxy',r.tau]].map(([key,label,n])=>`<div><span>${label}</span><strong data-component="${key}" data-value="${n}">${fmt(n)}</strong><small>MPa</small></div>`).join('');
    $('#stress-invariants').innerHTML=[['major','面内主応力 σ₁',inv.major],['minor','面内主応力 σ₂',inv.minor],['vonMises','ミーゼス応力',inv.vonMises]].map(([key,label,n])=>`<div><span>${label}</span><strong data-invariant="${key}" data-value="${n}">${key==='vonMises'?n.toFixed(1):fmt(n)}</strong><small>MPa · 軸を回しても不変</small></div>`).join('');
    let explanation='同じ物理状態でも、座標軸を回すとσx・σy・τxyの成分は変わります。せん断の符号は、その軸と面に対する向きを示します。';
    if(state==='tension'&&angle===45)explanation='X方向の引張り100 MPaを+45°回した軸で読むと、σx = +50、σy = +50、τxy = −50 MPa。負のせん断は、圧縮という意味ではありません。';
    if(state==='tension'&&angle===-45)explanation='−45°ではσx = +50、σy = +50、τxy = +50 MPa。+45°と比べてせん断の符号が反転しても、元の引張り状態は同じです。';
    if(state==='shear'&&Math.abs(angle)===45)explanation='純せん断を45°回した軸で読むと、せん断成分は0になり、垂直応力+50 MPaと−50 MPaで表せます。物理状態を変えずに、主応力方向で読んでいます。';
    if(state==='compression')explanation='これはX方向の圧縮状態です。軸を回すと成分は変わりますが、ミーゼス応力は100 MPaのままです。ミーゼスの値だけでは引張りと圧縮を区別できません。';
    $('#stress-explanation').textContent=explanation;
  }
  $('#axis-angle').addEventListener('input',updateStress);$('#stress-state').addEventListener('change',updateStress);
  $$('[data-angle]').forEach(b=>b.addEventListener('click',()=>{$('#axis-angle').value=b.dataset.angle;updateStress();}));updateStress();
  function updateShell(normal){
    $$('[data-normal]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.normal)===normal)));
    $('#shell-order').textContent='節点順：'+(normal===1?'1 → 2 → 3 → 4':'4 → 3 → 2 → 1');
    const ring=normal===1?[[150,133,360,133],[380,121,380,64],[360,51,150,51],[128,64,128,121]]:
      [[150,51,360,51],[380,64,380,121],[360,133,150,133],[128,121,128,64]];
    $('#shell-order-diagram').innerHTML=svg(normal===1?'上から見て反時計回り。法線は手前。':'上から見て時計回り。法線は奥。',`
     <rect x="128" y="51" width="252" height="82" class="body"/>
     ${ring.map(points=>arrow(...points,'local')).join('')}
     ${circle(128,133)}${circle(380,133)}${circle(380,51)}${circle(128,51)}
     ${text(112,153,'1')}${text(386,153,'2')}${text(386,44,'3')}${text(112,44,'4')}
     ${text(254,102,normal===1?'⊙ +zₑ は手前':'⊗ +zₑ は奥','local-text label','middle')}`,'0 0 520 165');
    $('#shell-diagram').innerHTML=svg(`厚さ2mmの板の断面。物理的な上面は引張り100MPa、下面は圧縮100MPa。要素法線は基本Zの${normal===1?'正':'負'}方向。`,`<rect x="140" y="100" width="240" height="100" fill="#eef2f9" stroke="#c3d0e4"/><path d="M140 100H380" stroke="#ad3938" stroke-width="6"/><path d="M140 200H380" stroke="#326599" stroke-width="6"/><path d="M115 150H405" class="ghost"/>${arrow(75,235,75,65)}${text(65,50,'Z','basic-text label')}${arrow(445,150,445,normal===1?65:235,'local')}${text(465,normal===1?65:242,'zₑ','local-text label')}${text(260,80,'+100 MPa · 引張り','force-text label','middle')}${text(260,233,'−100 MPa · 圧縮','basic-text label','middle')}${text(260,175,'基準面 z = 0','small','middle')}${text(260,280,normal===1?'zₑ = +Z':'zₑ = −Z','local-text','middle')}`);
    $('#fiber-values').innerHTML=[-1,1].map(fiber=>{const globalZ=normal*fiber,stress=100*globalZ;return `<tr data-fiber="${fiber}"><td>${fmt(fiber,0)} mm</td><td>${globalZ>0?'+Z側（物理的な上側）':'−Z側（物理的な下側）'}</td><td class="${stress>0?'tension':'compression'}" data-value="${stress}">${fmt(stress,0)}</td></tr>`;}).join('');
    $('#shell-explanation').textContent=normal===1?'FIBER DISTANCEが+1 mmの行は物理的な上側で、引張り+100 MPaです。':'法線が−Zを向いたため、FIBER DISTANCEが−1 mmの行が物理的な上側です。負の距離の行に、引張り+100 MPaが現れます。';
  }
  $$('[data-normal]').forEach(b=>b.addEventListener('click',()=>updateShell(Number(b.dataset.normal))));updateShell(1);
  NastranFields.render($('#omid-fields'),fixed(['PARAM','OMID','YES']));
})();
