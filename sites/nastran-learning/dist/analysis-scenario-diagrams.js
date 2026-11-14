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
 const hot='#b2452f', cold='#2c60ad';
 function heatStrip(convection){
  let shape=path('M70 78H290V112H70Z',stroke,2,'#eaf1fa')+path('M70 78V112',hot,6)+path('M290 78V112',cold,6)+
   path('M96 95H256m-7-6 7 6-7 6',force,2)+dot(180,95)+
   text(70,140,'100 ℃を指定',hot,'middle')+text(290,140,'20 ℃を指定',cold,'middle')+text(180,170,'中央の未知温度',result,'middle');
  if(convection)shape+=[132,180,228].map(x=>path(`M${x} 72v-26m-5 6 5-6 5 6 M${x} 118v26m-5-6 5 6 5-6`,force,2)).join('')+text(180,28,'表裏から周囲20 ℃へ対流',force,'middle');
  else shape+=path('M70 70H290 M70 120H290','#7b8794',2)+text(180,60,'表裏は断熱','#5b6673','middle');
  return svg(convection?'左端100度、右端20度の板。表と裏から周囲へ対流で放熱する。中央の温度が未知量。':'左端100度、右端20度の板。表と裏は断熱。熱は左から右へ流れる。',shape);
 }
 const cantilever=()=>wall(49,96)+chain(49,286,96)+dot(286,96)+text(21,140,'固定',fixed);
 const harmonic=()=>svg('左端を固定した梁の先端を、正弦波の力で上下に加振する。先端の変位を読む。',
  cantilever()+path('M286 52v-22m-6 6 6-6 6 6 M286 52v22',force,2.5)+path('M214 40c7-18 14-18 21 0s14 18 21 0',force,2)+
  text(238,20,'正弦加振 1 N',force,'middle')+text(286,128,'先端の観測点',result,'middle')+text(160,84,'梁の中心線'));
 function pulse(long){
  const w=long?70:14;
  return svg(long?'左端固定の梁の先端に、周期より長い矩形波の荷重を与える。':'左端固定の梁の先端に、周期より短い矩形波の荷重を与える。',
   cantilever()+arrow(286,96)+text(286,128,'先端の観測点',result,'middle')+
   path(`M96 60H110V30H${110+w}V60H216`,force,2)+path('M92 60H222',stroke,1)+text(96,22,'荷重の時間変化',force)+
   text(110+w/2,76,long?'0.05 s':'0.005 s',force,'middle')+text(226,64,'時間'));
 }
 function column(kind){
  const pin=(x,y)=>path(`M${x} ${y}l-11 18h22z`,fixed,2,'#fff')+ground(x,y+20);
  let shape=chain(60,286,92)+path('M340 92H292m7-6-7 6 7 6',force,2.5)+text(332,78,'圧縮',force,'end')+dot(173,92)+text(173,70,'座屈形を読む',result,'middle');
  if(kind==='buck-pinned')shape+=pin(60,94)+pin(286,94)+text(60,150,'ピン',fixed,'middle')+text(286,150,'ピン（軸方向に可動）',fixed,'end');
  else{
   shape+=wall(60,92)+text(34,138,'固定',fixed);
   if(kind==='buck-fixed')shape+=path('M286 70v44',fixed,5)+text(290,138,'回転を拘束（軸方向に可動）',fixed,'end');
   else shape+=text(286,124,'自由端',stroke,'middle');
  }
  return svg({'buck-cantilever':'一端を固定し他端が自由な柱に、軸方向の圧縮を与える。','buck-pinned':'両端をピンで支えた柱に、軸方向の圧縮を与える。','buck-fixed':'両端の回転を拘束した柱に、軸方向の圧縮を与える。'}[kind],shape);
 }
 const mass='#855612';
 const spring=(x)=>path(`M${x} 90h14l6-9 8 18 8-18 8 18 6-9h10`,stroke,2);
 const officialHeat=()=>svg('両端の温度を指定した棒。5本の要素でつなぎ、途中の節点の温度を求める。',
  path('M60 88H300V104H60Z',stroke,2,'#eaf1fa')+path('M60 80V112',hot,6)+path('M300 80V112',cold,6)+[108,156,204,252].map(x=>dot(x,96)).join('')+
  text(64,140,'1300 K を指定',hot,'middle')+text(296,140,'300 K を指定',cold,'middle')+text(180,66,'5本の棒要素',stroke,'middle')+text(180,170,'途中の節点の温度を読む',result,'middle'));
 const officialDirect=()=>svg('ばねとダンパで台に支えた重り。台を上下に揺らし、重りの振幅を読む。',
  path('M90 150H270',fixed,5)+path('M150 150v-12l-9-6 18-9-18-9 18-9-9-6v-15',stroke,2)+
  path('M210 150v-24 M201 126h18 M197 112v20h26v-20 M210 112v-28',stroke,2)+path('M125 48H235V84H125Z',stroke,2,'#eaf1fa')+
  path('M300 118v40 M294 124l6-6 6 6 M294 152l6 6 6-6',force,2)+dot(235,66)+
  text(180,71,'重り',stroke,'middle')+text(132,122,'ばね',stroke,'end')+text(230,122,'ダンパ')+text(300,178,'台を上下に加振',force,'middle')+text(296,58,'振幅を読む',result,'middle'));
 const officialModal=()=>svg('大きな質量の土台に、2つの質量をばねで直列につなぐ。土台に一定の加速度を与える。',
  path('M40 70H100V110H40Z',mass,2,'#f7e1bd')+spring(100)+path('M160 72H200V108H160Z',stroke,2,'#eaf1fa')+spring(200)+path('M260 76H290V104H260Z',stroke,2,'#eaf1fa')+
  path('M40 52h60m-7-6 7 6-7 6',force,2.5)+text(70,38,'一定の加速度',force,'middle')+
  text(70,134,'大質量（土台）',mass,'middle')+text(180,134,'質量2',stroke,'middle')+text(275,134,'質量1',stroke,'middle'));
 const officialTransient=()=>svg('片持ち梁の根元に大質量を置き、根元へ立ち上がる加速度を与える。先端の応答を読む。',
  path('M30 76H70V116H30Z',mass,2,'#f7e1bd')+chain(70,290,96)+dot(290,96)+path('M50 70V34m-6 6 6-6 6 6',force,2.5)+
  path('M170 60H190L230 30V60H300',force,2)+path('M166 60H306',stroke,1)+
  text(60,26,'根元に加速度',force)+text(50,140,'大質量',mass,'middle')+text(290,128,'先端の観測点',result,'middle')+text(196,22,'加速度の時間変化',force));
 function heated(both){
  let shape=path('M49 84H286V108H49Z',stroke,2,'#fbe9e4')+wall(49,96)+text(21,140,'固定',fixed)+text(168,66,'全体を 20 → 80 ℃ に加熱',hot,'middle');
  if(both)shape+=path('M286 74v44',fixed,5)+text(300,140,'固定',fixed,'middle')+text(168,140,'伸びられず圧縮になる',force,'middle');
  else shape+=path('M292 96h36m-7-6 7 6-7 6',result,2.5)+text(300,128,'伸びを読む',result,'middle');
  return svg(both?'両端を固定した梁を一様に加熱する。伸びが止められ、圧縮の応力が生じる。':'左端を固定し右端が自由な梁を一様に加熱する。右端が自由に伸びる。',shape);
 }
 function ring(nr){
  const cx=110,cy=164,pt=(r,a)=>(cx+r*Math.cos(a)).toFixed(1)+' '+(cy-r*Math.sin(a)).toFixed(1),q=Math.PI/2;
  let lines='';
  for(let i=1;i<nr;i++){const r=60+60*i/nr;lines+=`M${pt(r,0)}A${r} ${r} 0 0 0 ${pt(r,q)}`;}
  for(let j=1;j<2*nr;j++){const a=q*j/(2*nr);lines+=`M${pt(60,a)}L${pt(120,a)}`;}
  const push=[1,2,3].map(k=>{const a=q*k/4;return `M${pt(26,a)}L${pt(54,a)}M${pt(45,a-.16)}L${pt(54,a)}L${pt(45,a+.16)}`;}).join('');
  return svg('内圧を受ける厚肉円筒の4分の1。切り口の2面に対称条件を与え、内面の点で変位と応力を読む。',
   path(`M${pt(60,0)}L${pt(120,0)}A120 120 0 0 0 ${pt(120,q)}L${pt(60,q)}A60 60 0 0 1 ${pt(60,0)}Z`,stroke,2,'#eaf1fa')+path(lines,'#9eb4ce',1)+
   path(`M${pt(60,0)}L${pt(120,0)}`,fixed,5)+path(`M${pt(60,q)}L${pt(120,q)}`,fixed,5)+path(push,force,2)+dot(170,164)+
   text(102,160,'内圧',force,'end')+text(240,182,'Y方向を固定',fixed,'middle')+text(102,80,'X方向を固定',fixed,'end')+text(238,52,'内面の点で',result)+text(238,70,'変位・応力を読む',result));
 }
 function prestressed(kind){
  const pin=(x,y)=>path(`M${x} ${y}l-11 18h22z`,fixed,2,'#fff')+ground(x,y+20);
  let shape=chain(60,286,92)+pin(60,94)+pin(286,94)+path('M60 92Q173 38 286 92',result,2)+text(173,50,'1次のモード形',result,'middle')+
   text(60,150,'ピン',fixed,'middle')+text(286,150,'ピン（軸方向に可動）',fixed,'end');
  if(kind==='pre-tension')shape+=path('M292 92h44m-7-6 7 6-7 6',force,2.5)+text(346,76,'引張 1727 N',force,'end');
  if(kind==='pre-compression')shape+=path('M340 92H292m7-6-7 6 7 6',force,2.5)+text(346,76,'圧縮 1727 N',force,'end');
  return svg({'pre-none':'両端をピンで支えた梁。軸方向の力はない。','pre-tension':'両端をピンで支えた梁を、軸方向に引っ張った状態で振動させる。','pre-compression':'両端をピンで支えた梁を、軸方向に圧縮した状態で振動させる。'}[kind],shape);
 }
 const extra={'ts-free':()=>heated(false),'ts-fixed':()=>heated(true),'cyl-coarse':()=>ring(2),'cyl-standard':()=>ring(4),'cyl-fine':()=>ring(8),
  'pre-none':()=>prestressed('pre-none'),'pre-tension':()=>prestressed('pre-tension'),'pre-compression':()=>prestressed('pre-compression'),
  'heat-official':officialHeat,'direct-frequency-official':officialDirect,'modal-frequency-official':officialModal,'transient-official':officialTransient,'buckling-official':()=>column('buck-pinned'),
  'heat-insulated':()=>heatStrip(false),'heat-convection':()=>heatStrip(true),harmonic,'pulse-short':()=>pulse(false),'pulse-long':()=>pulse(true),
  'buck-cantilever':()=>column('buck-cantilever'),'buck-pinned':()=>column('buck-pinned'),'buck-fixed':()=>column('buck-fixed')};
 window.renderAnalysisScenarioDiagram=kind=>extra[kind]?extra[kind]():({beam,shell,solid,'static-official':officialStatic,'modes-official':officialModes,'complex-modes-official':officialComplex}[kind]?.()||vibration(kind));
})();
