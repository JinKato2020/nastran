(() => {
 'use strict';
 // Original local mesh sketches. Each pair uses the same geometry and scale.
 const plateFill='#e5eef7', edge='#284862', grid='#507189';
 const points=vertices=>vertices.map(([x,y])=>x.toFixed(2)+','+y.toFixed(2)).join(' ');
 const drawing=(label,box,body)=>'<svg dir="ltr" role="img" aria-label="'+label+'" viewBox="'+box+'">'+body+'</svg>';
 function overview(label,outline,selection){
  const pulls=[-1,1].map(sign=>{
   const x=sign<0?38:322;
   return [52,66,80].map(y=>{
    const tip=x+25*sign;
    return '<path d="M'+x+' '+y+' H'+tip+' m'+(-6*sign)+' -4 l'+(6*sign)+' 4 l'+(-6*sign)+' 4" fill="none" stroke="#12724e" stroke-width="2.2"/>';
   }).join('');
  }).join('');
  const [x,y,w,h]=selection;
  const box='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="none" stroke="#9c4b13" stroke-width="2" stroke-dasharray="5 3"/>';
  return drawing(label,'0 0 360 134',outline+pulls+box);
 }
 function meshPatch(rows){
  const rim=[...rows[0],...rows.at(-1).slice().reverse()];
  const columns=rows[0].map((_,i)=>rows.map(row=>row[i]));
  return '<polygon points="'+points(rim)+'" fill="'+plateFill+'"/>'+
   [...rows,...columns].map(row=>'<polyline fill="none" stroke="'+grid+'" stroke-width="1.1" points="'+points(row)+'"/>').join('');
 }
 function cornerPatch(fine){
  const sectors=fine?6:2;
  const rows=(fine?[28,35,45,57]:[28,57]).map(r=>{
   const row=[[81-r,5]];
   for(let j=0;j<=sectors;j++){
    const angle=j*Math.PI/(2*sectors);
    row.push([81-r*Math.cos(angle),17+r*Math.sin(angle)]);
   }
   row.push([110,17+r]);
   return row;
  });
  const contour='<path d="M53 5 V17 A28 28 0 0 0 81 45 H110" stroke="'+edge+'" fill="none" stroke-width="1.5" stroke-dasharray="3 2"/>';
  return drawing('同じ肩の丸みを'+sectors+'本の直線で近似した四角形要素','10 0 114 82',meshPatch(rows)+contour);
 }
 function ligamentPatch(fine){
  const rowCount=fine?4:1, radius=54, halfGap=18, rows=[];
  for(let i=0;i<=rowCount;i++){
   const row=[];
   for(let j=0;j<=8;j++){
    const dx=(j-4)*9;
    const halfWidth=halfGap+radius-Math.sqrt(radius*radius-dx*dx);
    row.push([70+dx,48+(2*i/rowCount-1)*halfWidth]);
   }
   rows.push(row);
  }
  const marks=[48-halfGap,48+halfGap].map(y=>'<circle cx="70" cy="'+y+'" r="2.7" fill="'+edge+'"/>').join('');
  return drawing('二つの穴の間の材料を幅方向に'+rowCount+'段に分けた拡大図','16 2 108 92',meshPatch(rows)+marks);
 }
 function figure(id,overviewSvg,localDrawing,labels,caption){
  return '<figure class="element-figure mesh-feature" data-mesh-feature="'+id+'">'+overviewSvg+
   '<div class="mesh-feature-pair">'+labels.map((label,i)=>'<div>'+localDrawing(i===1)+'<span dir="auto">'+label+'</span></div>').join('')+'</div><figcaption>'+caption+'</figcaption></figure>';
 }
 function shoulder(){
  const shape='<path d="M38 12 H140 V22 A15 15 0 0 0 155 37 H322 V87 H155 A15 15 0 0 0 140 102 V112 H38 Z" fill="'+plateFill+'" stroke="'+edge+'" stroke-width="1.8"/>';
  return figure('shoulder',overview('幅が半分になる板を左右へ引っ張る。枠は上側の段の内側に付けた丸み',shape,[129,16,37,33]),cornerPatch,
   ['円弧を2辺で描く','同じ円弧を6辺で描く'],
   '上は板を正面から見た形。矢印が引っ張る向き、破線の枠が下で拡大した場所です。下の破線は実物の丸み、実線は四角形要素の辺です。丸みに沿う辺と、板の内側へ続く列を見比べてください。');
 }
 function holes(){
  const plate='<rect x="38" y="8" width="284" height="116" fill="'+plateFill+'" stroke="'+edge+'" stroke-width="1.8"/>';
  const contours=[42,90].map(y=>'<circle cx="180" cy="'+y+'" r="18" fill="white" stroke="'+edge+'" stroke-width="1.8"/>').join('');
  return figure('holes',overview('左右に引く板に二つの穴が上下に並ぶ。枠で囲んだ二つの穴の間に材料が残る',plate+contours,[165,55,30,22]),ligamentPatch,
   ['穴と穴の間に1段','同じ幅の中に4段'],
   '白い円が穴で、淡い青が残った板です。下の二つは同じ帯の拡大図。黒丸は向かい合う穴の縁です。指で上の黒丸から下の黒丸までたどると、途中に何段の要素があるかを数えられます。');
 }
 window.MeshFeatureFigures={shoulder,holes};
})();
