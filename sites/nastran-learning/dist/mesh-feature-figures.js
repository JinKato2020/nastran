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
 // All three views show the same strip. The ends have four/either two or four
 // element edges along their height. Cells reuse their neighbours' vertices.
 function stripCells(xs,ys){
  const cells=[];
  for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){
   cells.push([[xs[i-1],ys[j-1]],[xs[i],ys[j-1]],[xs[i],ys[j]],[xs[i-1],ys[j]]]);
  }
  return cells;
 }
 const levels=[24,49,74,99,124], coarseLevels=[24,74,124];
 const fineStrip=stripCells([29,54,79,104,129],levels);
 function bridgeCells(){
  const a=[129,24],b=[129,49],c=[129,74],e=[193,24],f=[193,74],p=[163,49],v=[159,74];
  const upper=[[a,e,p,b],[e,f,v,p],[b,p,v,c]];
  return [...upper,...upper.map(cell=>cell.map(([x,y])=>[x,148-y]).reverse())];
 }
 function tiles(cells,fill){
  return cells.map(cell=>'<polygon points="'+points(cell)+'" fill="'+fill+'" stroke="'+edge+'" stroke-width="1.15" stroke-linejoin="round"/>').join('');
 }
 function joint(x,y){
  return '<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="'+edge+'"/>';
 }
 function countEdge(x,ys){
  const left=x<29, direction=left?1:-1;
  return '<g fill="none" stroke="'+grid+'" stroke-width="1"><path d="M'+x+' '+ys[0]+' V'+ys.at(-1)+'"/>'+
   ys.map(y=>'<path d="M'+(x-2)+' '+y+' h4"/>').join('')+'</g>'+
   '<text x="'+(x-8*direction)+'" y="78" text-anchor="middle" fill="'+edge+'" font-size="14" font-weight="700">'+(ys.length-1)+'</text>';
 }
 function stripView(label,left,right,rightEdge,extras=''){
  return drawing(label,'0 8 323 132',left+right+extras+countEdge(19,levels)+countEdge(303,rightEdge));
 }
 function bridge(){
  const middle=bridgeCells();
  const nodes=new Map(middle.flat().map(p=>[p.join(','),p]));
  const picture=stripView('四角形だけで左辺の4分割を右辺の2分割につなぐ。中央の六つの四角形は上下対称。',
   tiles(fineStrip,plateFill)+tiles(middle,'#ffe6bd'),tiles(stripCells([193,243,293],coarseLevels),plateFill),coarseLevels,
   Array.from(nodes.values(),([x,y])=>joint(x,y)).join(''));
  return '<figure class="element-figure" data-mesh-strip="bridge">'+picture+
   '<figcaption>左端は縦に4段、右端は2段です。中央の色の付いた6枚がつなぎ目。黒丸はその四角形の角です。上半分を見れば、左の2段を中央の3枚で右の1段につないでいます。下半分はその鏡写しです。</figcaption></figure>';
 }
 function spacing(){
  const cells=stripCells([129,159,196,240,293],levels);
  const picture=stripView('左辺も右辺も4分割。右へ進むにつれて横幅だけが増える四角形。',
   tiles(fineStrip,plateFill),tiles(cells,plateFill),levels);
  return '<figure class="element-figure" data-mesh-strip="spacing">'+picture+
   '<figcaption>横線を1本、左から右へ指でたどってください。そのまま右端まで続きます。四角形を横長にしただけなので、右端を縦に数えると4段のままです。</figcaption></figure>';
 }
 function edgeConnection(fineMotion,coarseMotion,label){
  const seam=129,scale=6;
  const shift=(cells,displacements,heights)=>cells.map(cell=>cell.map(([x,y])=>
   [x===seam?x+scale*displacements[heights.indexOf(y)]:x,y]));
  const left=shift(fineStrip,fineMotion,levels);
  const right=shift(stripCells([seam,193,243,293],coarseLevels),coarseMotion,coarseLevels);
  const original='<path d="M129 24 V124" stroke="#687a8e" stroke-width="1" stroke-dasharray="3 3" fill="none"/>';
  const marks=levels.map((y,i)=>{
   const x=seam+scale*fineMotion[i];
   const marker=i%2===0?joint(x,y):'<path d="M'+x+' '+(y-4)+' l4 4 -4 4 -4 -4 Z" fill="white" stroke="#973e16" stroke-width="1.8"/>';
   return marker+'<text x="'+(x+7)+'" y="'+(y-4)+'" font-size="12" fill="'+edge+'">'+(i+1)*10+'</text>';
  }).join('');
  return stripView(label,tiles(left,plateFill),tiles(right,'#f6f9fc'),coarseLevels,original+marks);
 }
 function midpointPanel(mode,sharedU20){
  // Close-up of the same top half as bridge(). Both panels have u10=0 and u30=2 mm.
  const seam=129, top=24, mid=49, bottom=74, scale=20;
  const linearU=y=>2*(y-top)/(bottom-top);
   const shared=mode==='shared', free=mode==='free';
   const u20=free?0:shared?sharedU20:linearU(mid);
   const deform=cell=>cell.map(([x,y])=>[
    x+scale*((x===seam||(free&&x<seam))&&y===mid?u20:linearU(y)),y
   ]);
   const left=tiles(stripCells([104,seam],[top,mid,bottom]).map(deform),plateFill);
   const adjacent=shared?bridgeCells().slice(0,3):stripCells([seam,193],[top,bottom]);
   const patch=tiles(adjacent.map(deform),shared?'#ffe6bd':'#d8e5f1');
   const [a,b,c]=deform([[seam,top],[seam,mid],[seam,bottom]]);
   const coarseMid=[(a[0]+c[0])/2,mid];
   const opening=free?'<path d="M'+a.join(' ')+' L'+b.join(' ')+' L'+c.join(' ')+' Z" fill="white"/>'+
    '<path d="M'+b.join(' ')+' H'+coarseMid[0]+'" stroke="#934016" stroke-width="1.6"/>'+
    '<circle cx="'+coarseMid[0]+'" cy="'+mid+'" r="2.2" fill="white" stroke="#934016"/>':'';
   const trace='<polyline points="'+points([a,b,c])+'" fill="none" stroke="#156747" stroke-width="2.2"/>';
   const chord='<path d="M'+a.join(' ')+' L'+c.join(' ')+'" fill="none" stroke="#283f59" stroke-width="1" stroke-dasharray="2 2"/>';
   const mark=shared?joint(...b):'<path d="M'+b[0]+' '+(b[1]-3.5)+' l3.5 3.5 -3.5 3.5 -3.5 -3.5 Z" fill="white" stroke="#973e16" stroke-width="1.5"/>';
   const ids=[a,b,c].map(([x,y],i)=>'<text x="'+(x+(free&&i===1?-17:4))+'" y="'+(y+(i===2?11:-4))+'" fill="'+edge+'" font-size="12">'+(i+1)*10+'</text>').join('');
   const title=free?'MPCなし':shared?'四角形で節点を共有':'MPCで中点を補間';
   return '<div><span dir="auto">'+title+'</span>'+
    drawing(title+'。節点20の右向き変位 '+u20+' mm','99 8 138 81',
     left+patch+opening+trace+chord+joint(...a)+mark+joint(...c)+ids)+
    '<span dir="ltr">u₂₀ = '+u20+' mm</span></div>';
 }
 function compareMidpoint(sharedU20){
  return '<div class="mesh-feature-pair">'+midpointPanel('shared',sharedU20)+midpointPanel('mpc')+'</div>';
 }
 function midpointGap(){
  return '<figure class="element-figure" data-mesh-strip="midpoint-gap"><div class="mesh-feature-pair">'+midpointPanel('free')+midpointPanel('mpc')+'</div>'+
   '<figcaption>左図で水色の要素の間に開いた白い三角形が隙間です。節点10を動かさず、30を右へ2 mm動かすと、粗い辺の中点（小丸）は右へ1 mm動きます。20（ひし形）が元の位置に残ると、二つの印の間が水平方向に1 mm開きます。右図ではMPCで20も中点と一緒に動き、辺がぴったり重なります。変形は拡大しています。</figcaption></figure>';
 }
 function pointLoadSurvey(){
  let marks='<rect x="36" y="22" width="240" height="80" fill="'+plateFill+'" stroke="'+edge+'" stroke-width="2"/>';
  for(let y=22;y<=102;y+=10) marks+='<path d="M36 '+y+'l-8 6" stroke="'+edge+'"/>';
  marks+='<path d="M276 62h44m-8 -5 8 5 -8 5" fill="none" stroke="#176a50" stroke-width="2.6"/>'+
   '<path d="M216 62h60" stroke="'+edge+'" stroke-dasharray="3 3"/>'+
   '<path d="M216 56l6 6 -6 6 -6 -6z" stroke="'+edge+'" stroke-width="2" fill="white"/>'+
   '<path d="M276 56l6 11h-12z" fill="#934910"/><text x="270" y="48">B</text>'+
   '<text x="246" y="86" text-anchor="middle">12 mm</text><text x="302" y="49">F</text>';
  return '<figure class="element-figure" data-mesh-feature="point-load">'+drawing('右辺の荷重点Bから板内へ12 mm離れた点を白いひし形で示す。','15 10 315 103','<g font-size="14" fill="'+edge+'">'+marks+'</g>')+'</figure>';
 }
 function stressDistance(){
  const scale=12, origin=30, length=24;
  let body='';
  for(const [h,y] of [[4,46],[2,129]]){
   const step=h*scale, width=length*scale, pick=origin+1.5*step, fixed=origin+12*scale;
   body+='<text x="'+origin+'" y="'+(y-16)+'">h = '+h+' mm</text>'+
    '<rect x="'+origin+'" y="'+(y-10)+'" width="'+width+'" height="22" fill="'+plateFill+'" stroke="'+edge+'"/>'+
    '<rect x="'+(origin+step)+'" y="'+(y-10)+'" width="'+step+'" height="22" fill="#f8d294" stroke="'+edge+'"/>';
   for(let x=origin+step;x<origin+width;x+=step) body+='<path d="M'+x+' '+(y-10)+'v22" stroke="'+grid+'"/>';
   const edgeY=y+12;
   body+='<circle data-second-mid cx="'+pick+'" cy="'+edgeY+'" r="3.8" fill="'+edge+'"/>'+
    '<path data-fixed-distance d="M'+fixed+' '+(edgeY-5)+'l5 5 -5 5 -5 -5z" fill="white" stroke="'+edge+'" stroke-width="1.6"/>'+
    '<text x="'+origin+'" y="'+(edgeY+19)+'" text-anchor="middle">A</text>'+
    '<text x="'+pick+'" y="'+(edgeY+19)+'" text-anchor="middle">'+(1.5*h)+' mm</text>'+
    '<text x="'+fixed+'" y="'+(edgeY+19)+'" text-anchor="middle">12 mm</text>';
  }
  return '<figure class="element-figure" data-mesh-feature="stress-distance">'+drawing('Aを原点とする同じ下辺。2番目の辺の中点は6 mmから3 mmへ移り、12 mmの測定位置は同じ。','0 0 350 170','<g font-size="13" fill="'+edge+'">'+body+'</g>')+
   '<figcaption>上と下はAから右へ同じ24 mmを拡大した図です。色付きの2要素目を選び続けると、下辺の中点（●）はAに近づきます。同じ実距離を指定した白いひし形（◇）は、上下で縦にそろいます。</figcaption></figure>';
 }
 window.MeshFeatureFigures={shoulder,holes,bridge,spacing,edgeConnection,compareMidpoint,midpointGap,pointLoadSurvey,stressDistance};
})();
