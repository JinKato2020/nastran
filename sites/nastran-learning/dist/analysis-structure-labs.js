(() => {
 'use strict';
 const c=window.AnalysisStructureCore,ui=window.BeamLabs.ui,g=window.BeamLabs.graphics;
 const n=v=>Number(v.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:8});
 const blue='#2c60ad',red='#ad3928',ink='#48627e',green='#1b705a';
 const txt=(x,y,t,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${ink}">${t}</text>`;
 const path=(d,color=ink,w=2,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" ${extra}/>`;
 const arrow=(x1,y1,x2,y2,color=red)=>{
  const a=Math.atan2(y2-y1,x2-x1),p=t=>[x2-8*Math.cos(a+t),y2-8*Math.sin(a+t)].join(' ');
  return path(`M${x1} ${y1}L${x2} ${y2}M${p(.45)}L${x2} ${y2}L${p(-.45)}`,color);
 };
 const svg=(label,body,h=220)=>`<svg class="theory-lab-svg" viewBox="0 0 360 ${h}" role="img" aria-label="${label}"><g font-size="13" font-family="system-ui,sans-serif">${body}</g></svg>`;
 function cylinderDiagram(id){
  const model=c.ends[id],ext=!!model.po,closed=model.axial==='closed',locked=model.axial==='locked';
  let s=`<rect x="68" y="48" width="224" height="25" fill="#dce7f3" stroke="${ink}"/><rect x="68" y="133" width="224" height="25" fill="#dce7f3" stroke="${ink}"/>`;
  s+=path('M35 103H326',ink,1,'stroke-dasharray="6 4"')+arrow(210,103,235,103,ink)+txt(244,107,'z')+arrow(210,103,210,77,ink)+txt(221,85,'r');
  if(closed)s+=`<rect x="60" y="48" width="12" height="110" fill="#c6deec" stroke="${ink}"/><rect x="288" y="48" width="12" height="110" fill="#c6deec" stroke="${ink}"/>`+
   (ext?arrow(29,103,56,103)+arrow(331,103,304,103):arrow(54,103,25,103)+arrow(306,103,335,103));
  for(const x of [107,180,253])s+=ext?arrow(x,20,x,44)+arrow(x,187,x,162):arrow(x,96,x,77)+arrow(x,110,x,129);
  if(locked)s+=path('M50 55V152 M42 55V152 M308 55V152 M316 55V152',blue)+txt(32,193,'u_z=0')+txt(328,193,'u_z=0');
  s+=txt(180,ext?15:195,ext?'pₒ = 10 MPa':'pᵢ = 10 MPa')+txt(180,218,locked?'ε_z = 0':closed?'N_z = π(pᵢ a² − pₒ b²)':'N_z = 0');
  return svg('円筒の軸を通る断面。圧力の作用面と軸方向の境界条件。ふたの局所変形を表した図ではありません。',s,235);
 }
 function columnDiagram(id,scale=0,strong=false){
  const blocked=id==='buck-blocked',pinLeft=id==='buck-pinned',pinRight=['buck-pinned','buck-fixed-pinned'].includes(id),rightFixed=id==='buck-fixed'||blocked;
  const wall=x=>`<rect x="${x-8}" y="52" width="8" height="97" fill="#e3e8ee" stroke="${blue}"/>`+path(Array.from({length:7},(_,i)=>`M${x-16} ${57+13*i}l8-7`).join(' '),blue,1);
  const pin=(x,roller)=>path(`M${x} 105l-11 18h22Z`,blue)+(roller?`<circle cx="${x-6}" cy="128" r="3" fill="white" stroke="${blue}"/><circle cx="${x+6}" cy="128" r="3" fill="white" stroke="${blue}"/>`:'')+path(`M${x-16} ${roller?134:128}h32`,blue);
  let s=path('M52 101H294',ink,2,'stroke-dasharray="6 4"')+(pinLeft?pin(52,false):wall(52));
  if(pinRight)s+=pin(294,true);else if(rightFixed)s+=wall(302)+(blocked?'':path('M294 144h17m-17 6h17',blue));
  const pts=Array.from({length:81},(_,i)=>[52+242*i/80,101-38*scale*c.shape(id,i/80)]);
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${green}" stroke-width="4"/>`;
  s+=arrow(344,101,308,101)+txt(332,83,'P₀')+txt(175,177,'L = 360 mm')+arrow(52,195,99,195,ink)+txt(108,199,'X');
  s+=arrow(52,195,52,165,ink)+txt(39,160,strong?'Y':'Z')+txt(52,219,'G1')+txt(294,219,'G13');
  if(scale)s+=txt(183,13,'φ × '+n(scale));
  if(blocked)s+=arrow(304,119,340,119,blue)+txt(330,143,'R_x');
  return svg('柱の支持・荷重・座屈形。破線は元の中心線。荷重点のローラーと二重線は軸方向に可動、誤設定では軸方向も拘束。',s,235);
 }
 const states=new Map();
 function render(id){
  const isCyl=id.startsWith('cyl-'),s=states.get(id)||{};
  const controls=isCyl?ui.slider('b','外半径 b（mm）',55,150,5,s.b||100)+ui.slider('r','壁厚内の観測位置（内面0・外面100%）',0,100,5,s.r||0):
   ui.select('load','基準荷重 P₀（N）',[['1','1'],['10','10'],['100','100'],['1000','1000']],s.load||'1')+ui.select('axis','比較する曲げ方向',[['weak','弱軸曲げ：Z方向'],['strong','強軸曲げ：Y方向']],s.axis||'weak')+ui.slider('scale','座屈形の表示倍率',.5,2,.25,s.scale||1);
  const caption=isCyl?'一般の弾性理論による比較。半径a=50 mm、E=70,000 MPa、ν=0.33。実線は周方向σθ、破線は半径方向σr、一点鎖線は軸方向σz。図中の点は選択した半径。ふた・支持付近の局所応力、塑性、外圧による座屈は含みません。':
   '一般の細長柱理論による比較。基準荷重だけを変えると倍率λが変わり、λP₀は一定です。表示した曲げ方向の1次形であり、強軸の根がモデル全体の最小根になるとは限りません。実線の大きさは表示倍率で、実変位ではありません。MSC Nastranの実行結果ではありません。';
  return `<figure data-structure-lab="${id}">${ui.box('',controls,caption)}</figure>`;
 }
 function bind(root){for(const fig of root.querySelectorAll('[data-structure-lab]')){
  const id=fig.dataset.structureLab,isCyl=id.startsWith('cyl-');
  ui.mount(fig,{html:()=>fig.innerHTML,draw:(el,v)=>{
   states.set(id,v);for(const [k,out]of Object.entries(el.out))out.textContent=n(+v[k]);
   if(isCyl){
    const b=+v.b,r=50+(b-50)*(+v.r)/100,d=c.cylinder(id,r,b),inner=c.cylinder(id,50,b);
    const samples=Array.from({length:81},(_,i)=>c.cylinder(id,50+(b-50)*i/80,b));
    const values=samples.flatMap(x=>[x.sr,x.st,x.sz]),lo=Math.min(0,...values),hi=Math.max(0,...values),pad=(hi-lo)*.08;
    el.plot.innerHTML=g.chart({id:'structure-'+id,label:'半径に沿う応力の理論分布',x:[50,b],y:[lo-pad,hi+pad],xt:[50,(50+b)/2,b],yt:[lo,0,hi].filter((v,i,a)=>a.indexOf(v)===i),xf:n,yf:n,xl:'r (mm)',yl:'σ (MPa)',series:[['st',''],['sr','6 4'],['sz','8 3 2 3']].map(([key,dash])=>({pts:samples.map(x=>[x.r,x[key]]),dash})),marks:[[r,d.st],[r,d.sr],[r,d.sz]]});
    const thin=d.pi?d.pi*(50+b)/2/(b-50):null;
    el.readout.innerHTML=`<b>r=${n(r)} mm：σθ=${n(d.st)}、σr=${n(d.sr)}、σz=${n(d.sz)} MPa</b><br>uᵣ=${n(d.u)} mm、εz=${n(d.ez)}。内面の変位=${n(inner.u)} mm。<br>${thin!==null?`平均半径を使う薄肉近似 pᵢ(a+b)/(2t)=${n(thin)} MPa、内面の厳密値=${n(inner.st)} MPa。t/a=${n((b-50)/50)}。薄肉近似には局所最大応力や半径方向応力を表す役割はありません。`:'外圧による圧縮応力と内向き変位です。SOL 101で変位が小さくても、外圧座屈への安全性は判定できません。'}`;
   }else{
    const d=c.buckling(id,+v.load,v.axis==='strong');
    el.plot.innerHTML=columnDiagram(id,+v.scale,v.axis==='strong');
    el.readout.innerHTML=d.P===null?'<b>意図した柱の圧縮軸力は0です。</b><br>この集中荷重は、同じ節点の軸方向拘束の反力へ流れます。基準軸力から作る座屈問題が成立していないので、非常に強い柱だと解釈しません。':
     `<b>Pcr=${n(d.P)} N、λ=${n(d.lambda)}、λP₀=${n(d.lambda*d.load)} N</b><br>K=${n(d.k)}、I=${n(d.I)} mm⁴。Pcr=π²EI/(KL)²。${v.axis==='strong'?'同じ支持の弱軸曲げに対して36倍の臨界荷重です。先に弱軸が不安定になる可能性を除外しないでください。':'基準荷重と表示倍率を変えても、断面と支持が同じならPcrは変わりません。'}<br>断面積A=216 mm²より、臨界時の平均圧縮応力Pcr/A=${n(d.P/216)} MPa。材料の弾性範囲を超える場合、この弾性理論値を実際の耐力に使いません。`;
   }
  }});
 }}
 const oldDiagram=window.renderAnalysisScenarioDiagram;
 window.renderAnalysisScenarioDiagram=id=>c.ends[id]?cylinderDiagram(id):['buck-fixed-pinned','buck-blocked'].includes(id)?columnDiagram(id):oldDiagram(id);
 window.AnalysisStructureLabs={render,bind,cylinderDiagram,columnDiagram};
})();
