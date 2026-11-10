(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const source={static:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide.pdf',qrg:'https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Quick_Reference_Guide/raw/resource/enus/MSC_Nastran_2020_Quick_Reference_Guide.pdf'};
  $$('[data-source]').forEach(a=>{a.href=source[a.dataset.source]+'#page='+a.dataset.page;a.target='_blank';a.rel='noopener';});
  const colors={basic:'#4368d6',local:'#2b9383',force:'#c7873e',ink:'#7b8fab'};
  const defs=document.createElementNS('http://www.w3.org/2000/svg','svg');
  defs.setAttribute('aria-hidden','true');defs.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
  defs.innerHTML='<defs>'+Object.entries(colors).map(([key,color])=>`<marker id="coord-arrow-${key}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')+'</defs>';
  document.body.prepend(defs);
  const arrow=(x1,y1,x2,y2,tone='basic',extra='')=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${colors[tone]}" stroke-width="2.5" marker-end="url(#coord-arrow-${tone})" ${extra}/>`;
  const text=(x,y,value,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${esc(value)}</text>`;
  const svg=(title,body,box='0 0 520 300')=>`<svg class="coordinate-diagram" viewBox="${box}" role="img" aria-label="${esc(title)}">${body}</svg>`;
  const circle=(x,y,r=6)=>`<circle class="node" cx="${x}" cy="${y}" r="${r}"/>`;
  function route(){
    const id=location.hash.slice(1);if(id==='sources')return;
    const selected=['systems','elements','signs','shell'].includes(id)?id:'systems';
    $$('.guide-panel').forEach(p=>{p.hidden=p.id!==selected;});
    $$('.guide-nav a').forEach(a=>{if(a.hash==='#'+selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(id===selected)requestAnimationFrame(()=>document.getElementById(selected).scrollIntoView({block:'start'}));
  }
  addEventListener('hashchange',route);route();
  $('#hero-axes').innerHTML=svg('青の基本X・Y軸と、45度回した緑の局所x・y軸。物理的な点は同じ。',`<circle cx="240" cy="180" r="92" fill="none" stroke="#d8e3f4"/>${arrow(240,180,450,180)}${arrow(240,180,240,25)}${arrow(240,180,362,58,'local')}${arrow(240,180,160,100,'local')}${text(462,188,'X','basic-text label')}${text(225,24,'Y','basic-text label')}${text(376,58,'x','local-text label')}${text(144,95,'y','local-text label')}${circle(240,180)}${text(240,245,'同じ点を、違う軸で読む。','', 'middle')}`);
  $('#grid-diagram').innerHTML=svg('基本座標のXは右、Yは上。局所10のxは上、yは左。節点Pは基本X100、Y0で、物理的な力と変位の方向は上。',`${arrow(120,220,450,220)}${arrow(120,220,120,25)}${arrow(120,220,120,80,'local','stroke-dasharray="6 4"')}${arrow(120,220,25,220,'local')}${text(462,228,'X','basic-text label')}${text(100,25,'Y','basic-text label')}${text(139,86,'x₁₀','local-text label')}${text(22,250,'y₁₀','local-text label')}${circle(120,220,4)}${text(117,247,'O','small')}${circle(360,220,7)}${arrow(360,208,360,112,'force')}${text(360,92,'+Y方向','force-text label','middle')}${text(360,261,'P (100, 0, 0)','', 'middle')}`);
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
  $('#rod-axes').innerHTML=svg('斜めの棒を両端から引く。要素x軸はG1からG2へ向くが、両側の荷重の矢印は逆向きでも棒は引張り。',`<path class="body" d="M125 197L365 77L375 97L135 217Z"/>${circle(130,207)}${circle(370,87)}${arrow(130,207,75,235,'force')}${arrow(370,87,425,59,'force')}${arrow(220,197,350,132,'local')}${text(107,185,'G1')}${text(355,64,'G2')}${text(362,137,'xₑ','local-text label')}${text(260,265,'軸応力＋：棒の両端を引く','', 'middle')}`);
  $('#bar-axes').innerHTML=svg('オフセットなしの梁。x軸はAからBへ、方向ベクトルvはx-y平面を定め、yはxに直交し、zは紙面の手前。',`<path d="M145 210L405 125L145 50Z" fill="#eef5f1" stroke="#d1e4dc"/><path class="body" d="M140 201L400 116L410 134L150 219Z"/>${circle(145,210)}${circle(405,125)}${arrow(145,210,365,138,'local')}${arrow(145,210,145,50,'force')}${arrow(145,210,104,85,'local')}${text(415,125,'B')}${text(139,242,'A')}${text(333,170,'xₑ','local-text label')}${text(155,65,'v','force-text label')}${text(73,81,'yₑ','local-text label')}<circle cx="70" cy="210" r="11" fill="none" stroke="#2b9383"/><circle cx="70" cy="210" r="3" fill="#2b9383"/>${text(49,245,'zₑ','local-text label')}${text(260,285,'⊙：紙面の手前','small','middle')}`);
  $('#quad-axes').innerHTML=svg('長方形CQUAD4の節点順G1、G2、G3、G4。要素xは右、yは上、zは手前。緑の材料x軸は30度回転。',`<rect class="body" x="125" y="60" width="270" height="170"/>${circle(125,230)}${circle(395,230)}${circle(395,60)}${circle(125,60)}${text(99,258,'G1')}${text(384,258,'G2')}${text(384,42,'G3')}${text(98,42,'G4')}${arrow(240,155,365,155)}${arrow(240,155,240,72)}${arrow(240,155,348,93,'local')}${text(365,179,'xₑ','basic-text label')}${text(251,76,'yₑ','basic-text label')}${text(357,95,'xₘ','local-text label')}<circle cx="240" cy="155" r="9" fill="#fff" stroke="#4368d6"/><circle cx="240" cy="155" r="3" fill="#4368d6"/>${text(216,187,'zₑ','basic-text')}`);
  $('#solid-axes').innerHTML=svg('立体要素の応力出力はPSOLIDのCORDMを確認する。通常の既定値0は基本座標。',`<path class="body" d="M190 95L340 95L400 145L400 245L250 245L190 195Z"/><path d="M190 95L250 145L400 145M250 145V245" class="ghost"/>${arrow(85,240,165,240)}${arrow(85,240,134,195)}${arrow(85,240,85,140)}${text(171,248,'X','basic-text label')}${text(139,194,'Y','basic-text label')}${text(73,131,'Z','basic-text label')}${text(300,55,'CORDM = 0 → 基本座標','', 'middle')}`);
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
    const arc=Math.abs(angle)<0.01?'':`<path d="M325 165A65 65 0 0 ${angle<0?1:0} ${x+65*c} ${y-65*s}" fill="none" stroke="#2b9383" stroke-width="1.5"/>`;
    return svg(`固定の応力状態に対して、読み取る軸を${angle}度回転した図。`, `<rect x="170" y="85" width="180" height="160" fill="#f1f4fa" stroke="#d4deed"/>${loads}<rect x="200" y="105" width="120" height="120" fill="#e7f4ef" fill-opacity="0.55" stroke="#62a998" stroke-dasharray="5 4" transform="rotate(${-angle} 260 165)"/>${arrow(45,290,118,290)}${arrow(45,290,45,218)}<path d="M260 165H325" fill="none" stroke="#4368d6" stroke-dasharray="3 3"/>${arrow(x,y,x+120*c,y-120*s,'local')}${arrow(x,y,x-100*s,y-100*c,'local')}${arc}${text(129,298,'X','basic-text label')}${text(45,205,'Y','basic-text label','middle')}${text(x+132*c-20*s,y-132*s-20*c,'x','local-text label','middle')}${text(x-120*s+25*c,y-120*c-25*s,'y','local-text label','middle')}${text(260,323,`θ = ${angle>0?'+':''}${angle}°`,'local-text label','middle')}`,'0 0 520 335');
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
    $('#shell-diagram').innerHTML=svg(`厚さ2mmの板の断面。物理的な上面は引張り100MPa、下面は圧縮100MPa。要素法線は基本Zの${normal===1?'正':'負'}方向。`,`<rect x="140" y="100" width="240" height="100" fill="#eef2f9" stroke="#c3d0e4"/><path d="M140 100H380" stroke="#c7873e" stroke-width="6"/><path d="M140 200H380" stroke="#4368d6" stroke-width="6"/><path d="M115 150H405" class="ghost"/>${arrow(75,235,75,65)}${text(65,50,'Z','basic-text label')}${arrow(445,150,445,normal===1?65:235,'local')}${text(465,normal===1?65:242,'zₑ','local-text label')}${text(260,80,'+100 MPa · 引張り','force-text label','middle')}${text(260,233,'−100 MPa · 圧縮','basic-text label','middle')}${text(260,175,'基準面 z = 0','small','middle')}${text(260,280,normal===1?'zₑ = +Z':'zₑ = −Z','local-text','middle')}`);
    $('#fiber-values').innerHTML=[-1,1].map(fiber=>{const globalZ=normal*fiber,stress=100*globalZ;return `<tr data-fiber="${fiber}"><td>${fmt(fiber,0)} mm</td><td>${globalZ>0?'+Z側（物理的な上側）':'−Z側（物理的な下側）'}</td><td class="${stress>0?'tension':'compression'}" data-value="${stress}">${fmt(stress,0)}</td></tr>`;}).join('');
    $('#shell-explanation').textContent=normal===1?'FIBER DISTANCEが+1 mmの行は物理的な上側で、引張り+100 MPaです。':'法線が−Zを向いたため、FIBER DISTANCEが−1 mmの行が物理的な上側です。負の距離の行に、引張り+100 MPaが現れます。';
  }
  $$('[data-normal]').forEach(b=>b.addEventListener('click',()=>updateShell(Number(b.dataset.normal))));updateShell(1);
  NastranFields.render($('#omid-fields'),fixed(['PARAM','OMID','YES']));
})();
