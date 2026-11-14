/* Geometry and conditions are schematic. Illustrations contain no solver results. */
(() => {
 'use strict';
 const fixed='#2c60ad', force='#ad3928', result='#1b705a', stroke='#48627e';
 const text=(x,y,value,color=stroke,align='start')=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="${align}">${value}</text>`;
 const path=(d,color=stroke,width=2,fill='none')=>`<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;
 const arrow=(x,y)=>path(`M${x} ${y-43}v36m-6-6 6 6 6-6`,force,2.5);
 const dot=(x,y)=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="${result}" stroke-width="2.5"/>`;
 const wall=(x,y)=>`<path d="M${x} ${y-22}v44" stroke="${fixed}" stroke-width="5"/>`+path(Array.from({length:5},(_,i)=>`M${x-12} ${y-13+8*i}l10-9`).join(' '),fixed,1);
 const ground=(x,y)=>path(`M${x-12} ${y}h24 M${x-15} ${y+7}l8-7 M${x-7} ${y+7}l8-7 M${x+1} ${y+7}l8-7`,fixed);
 const chain=(x1,x2,y)=>path(`M${x1} ${y}H${x2}`,stroke,4);
 const svg=(title,shape)=>`<svg viewBox="0 0 360 184" role="img" aria-label="${title}"><g font-family="system-ui,sans-serif" font-size="14" font-weight="550">${shape}</g></svg>`;
 const beam=()=>svg('左端の一点を固定した梁。右端に下向き荷重を与え、そこで変位を読む。',
  wall(51,101)+chain(51,290,101)+arrow(290,101)+dot(290,101)+text(23,145,'固定点',fixed)+text(289,47,'横荷重',force,'middle')+text(291,145,'変位の観測点',result,'middle')+text(168,89,'梁の中心線'));
 const shell=()=>svg('板の中立面。左辺を固定し、右辺の3点に面外荷重を分配する。',
  path('M62 72H308L277 119H31Z',stroke,2,'#eaf1fa')+
  path('M123 72l-31 47 M185 72l-31 47 M246 72l-31 47 M47 95H292','#bdcce0',1)+
  path('M62 72L31 119',fixed,6)+[ [308,72],[292,95],[277,119] ].map(([x,y])=>arrow(x,y)).join('')+
  dot(292,95)+text(24,145,'固定辺',fixed)+text(240,20,'先端辺へ配分',force)+text(294,157,'変位の観測点',result,'middle')+text(117,107,'板の中立面'));
 const solid=()=>svg('厚みのある部材。左の端面を固定し、右端面に下向き荷重を分配する。',
  path('M61 75H292L312 60H81Z',stroke,2,'#e9f1fa')+path('M61 75H292V119H61Z',stroke,2,'#dce7f3')+
  path('M292 75L312 60V104L292 119Z',stroke,2,'#c6deec')+
  path('M61 75L81 60V104L61 119Z',fixed,2,'#b5cdef')+
  path('M61 89H292L312 74 M61 104H292L312 89 M137 75V119 M212 75V119','#9eb4ce',1)+
  arrow(287,75)+arrow(312,60)+dot(302,90)+text(32,145,'固定面',fixed)+text(222,16,'先端面へ配分',force)+text(293,156,'変位の観測点',result,'middle')+text(132,143,'厚さ方向にも分割'));
 function vibration(kind){
  const tipMass=kind==='tip-mass',both=kind==='both-fixed',damped=kind==='damped';
  let shape=wall(49,82)+chain(49,286,82)+text(21,125,'固定',fixed);
  if(both){
   shape+=wall(286,82)+text(276,124,'固定',fixed)+dot(168,82)+text(168,60,'中央の観測点',result,'middle');
  }else{
   if(tipMass)shape+=`<rect x="265" y="62" width="43" height="41" rx="5" fill="#f7e1bd" stroke="#855612" stroke-width="2"/>`+text(286,52,'追加質量', '#855612','middle');
   shape+=dot(286,82)+text(286,tipMass?128:56,'先端の観測点',result,'middle');
  }
  if(damped){
   shape+=path('M286 87v20m-9 0h18m-22 9v19h26v-19m-13 0v28',stroke,2)+ground(286,144)+text(156,132,'横方向のダンパ')+text(308,156,'固定側',fixed);
  }
  return svg({baseline:'左端固定、右端自由の梁。先端を観測する。','tip-mass':'左端固定の梁の自由端に集中質量を追加する。','both-fixed':'梁の左端と右端を固定し、梁中央を観測する。',undamped:'左端を固定した梁。先端は自由でダンパなし。',damped:'左端固定の梁の先端から固定側へ横方向のダンパを接続する。'}[kind],shape);
 }
 const officialStatic=()=>svg('固定端から伸びる矩形片持ち梁。自由端の荷重方向を変えて先端変位を評価する。',
  wall(43,94)+path('M43 77H265V111H43Z',stroke,2,'#eaf1fa')+dot(265,94)+
  path('M279 94h43m-6-5 6 5-6 5 M265 82V45m-6 6 6-6 6 6',force,2)+
  text(42,143,'固定',fixed,'middle')+text(270,138,'先端変位',result,'middle')+text(318,38,'荷重方向を変える',force,'end'));
 const officialModes=()=>svg('固定端を介して、2つのばねと2点の集中質量を直列に結ぶ。',wall(37,89)+
  path('M37 89H63l8-9 9 18 9-18 9 18 9-9h24 M162 89h30l8-9 9 18 9-18 9 18 9-9h25',stroke,2)+
  path('M131 72h31v34h-31z M260 72h36v34h-36z',stroke,2,'#eaf1fa')+
  text(91,55,'ばね',stroke,'middle')+text(212,55,'ばね',stroke,'middle')+
  text(147,136,'質量1',stroke,'middle')+text(278,136,'質量2',stroke,'middle')+text(19,122,'固定',fixed));
 const officialComplex=()=>svg('筐体側とパッド側の接触を概念的に表した断面。法線力に応じた摩擦力が接線方向へ作用する。',
  path('M75 48H264V86H75Z',stroke,2,'#dde9f7')+path('M108 99H230V137H108Z',stroke,2,'#e6f3ef')+
  path('M75 92H264',stroke,1)+path('M171 31v18m-5-5 5 5 5-5',force,2)+path('M236 113h66m-7-6 7 6-7 6',force,2)+
  text(178,28,'法線方向',force,'middle')+text(168,73,'筐体側',stroke,'middle')+text(164,124,'パッド側',stroke,'middle')+text(270,138,'摩擦力',force,'middle'));
 window.renderAnalysisScenarioDiagram=kind=>({beam,shell,solid,'static-official':officialStatic,'modes-official':officialModes,'complex-modes-official':officialComplex}[kind]?.()||vibration(kind));
})();
