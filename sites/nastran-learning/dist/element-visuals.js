(() => {
 'use strict';
 const {arrow,svg}=window.LessonDiagrams;
 const line=(d,kind='outline')=>`<path class="${kind}" d="${d}"/>`;
 const point=(x,y,kind='node',r=4)=>`<circle class="${kind}" cx="${x}" cy="${y}" r="${r}"/>`;
 const label=(x,y,value,kind='',anchor='start')=>`<text class="${kind}" x="${x}" y="${y}" text-anchor="${anchor}">${value}</text>`;
 const centered=(x,y,value,kind='')=>label(x,y,value,kind,'middle');
 const a=(id,x1,y1,x2,y2,kind)=>arrow('element-'+id,x1,y1,x2,y2,kind);
 const spring=(x,y)=>line(`M${x} ${y}h8l5 -7 7 14 7 -14 7 14 7 -14 5 7h8`);
 const figure=(id,title,body,height)=>svg('element-'+id,title,body,height);

 const drawings={
  families(title){
   return figure('families',title,`
    ${spring(18,58)}${point(18,58)}${point(72,58)}
    ${line('M103 64L143 49')}${point(103,64)}${point(143,49)}
    ${line('M173 64L183 45H226L216 64Z','surface')}
    ${line('M254 49H297V72H254Z M254 49L268 38H312L297 49Z M297 49L312 38V60L297 72Z','surface')}
    ${[45,124,200,283].map((x,i)=>centered(x,89,['スカラー','棒・梁','板・シェル','ソリッド'][i],'label')+centered(x,106,['0次元','1次元','2次元','3次元'][i],'small')).join('')}
    ${a('families',63,126,281,126)}${centered(172,147,'形を表す次元が増える')}`,156);
  },
  offsetSpring(title){
   return figure('offset',title,`
    ${centered(85,22,'ずれた2点をつなぐ','label')}${centered(255,22,'一体のまま回転','label')}
    ${line('M34 108H115V54','ghost')}${point(48,104)}${point(125,49)}
    ${spring(58,77)}${line('M48 104V77H58M112 77H125V49')}
    ${a('offset',44,104,16,104,'load')}${a('offset',128,49,155,49,'load')}
    ${label(28,127,'A・−F','load-label')}${label(110,42,'B・＋F','load-label')}${label(36,76,'d','axis-label')}
    ${line('M214 108L214 49 M217 104L262 63','ghost')}${line('M217 104L252 48')}
    ${point(217,104)}${point(252,48)}${point(214,49,'open-node')}
    ${a('offset',216,42,250,42)}${centered(251,125,'水平変位の差 ≈ θd')}${centered(85,147,'力の対が Fd を生む')}`,156);
  },
  cbush(title){
   return figure('cbush',title,`
    ${line('M38 93H134M188 93H295','rigid-link')}${spring(134,93)}${point(38,93)}${point(295,93)}
    ${a('cbush',38,92,38,37)}${a('cbush',38,92,90,52,'direction')}${a('cbush',295,93,326,93)}
    ${label(45,38,'＋y','axis-label')}${label(92,50,'v')}${label(310,81,'＋x','axis-label')}
    ${label(21,110,'GA')}${label(284,110,'GB')}${centered(161,76,'ばね','label')}
    ${line('M38 119V128H161V119M161 128H295V119','ghost')}
    ${centered(99,148,'Sℓ')}${centered(228,148,'(1−S)ℓ')}`,157);
  },
  springEnds(title){
   return figure('spring-ends',title,`
    ${line('M63 108L197 51','ghost')}${point(63,108)}${point(197,51)}
    ${a('spring-ends',63,108,127,108)}${a('spring-ends',197,51,261,51)}
    ${label(40,131,'端1')}${label(177,38,'端2')}
    ${label(135,112,'正の成分1','axis-label')}${label(269,55,'正の成分1','axis-label')}
    ${centered(164,151,'各端で、青の方向の変位を比べる')}`,160);
  },
  beamAxes(title){
   return figure('beam-axes',title,`
    ${label(13,21,'軸を作る','label')}${label(192,21,'力を読む','label')}
    ${line('M27 99H146M207 99H306')}${point(27,99)}${point(146,99)}${point(207,99)}${point(306,99)}
    ${a('beam-axes',27,98,27,41)}${a('beam-axes',27,98,154,98)}${a('beam-axes',27,98,102,39,'direction')}
    ${label(34,43,'＋y','axis-label')}${label(127,87,'＋x','axis-label')}${label(107,41,'v')}
    ${label(16,118,'GA')}${label(134,118,'GB')}${label(32,141,'⊙ ＋z：手前')}
    ${a('beam-axes',207,98,207,55)}${a('beam-axes',306,45,306,94,'load')}
    ${label(214,55,'＋y','axis-label')}${label(261,39,'荷重 −y','load-label')}${centered(250,141,'面1（x–y面）で曲がる')}`,156);
  },
  rectangularSection(title){
   return figure('rectangle',title,`
    ${line('M30 77H120V107H30Z M251 51H281V141H251Z','surface')}
    ${a('rectangle',75,39,75,73,'load')}${a('rectangle',266,13,266,47,'load')}
    ${centered(76,125,'幅30 × 高さ10')}${centered(266,154,'幅10 × 高さ30')}
    ${a('rectangle',137,89,221,89,'direction')}${centered(177,76,'90°回転')}
    ${centered(76,29,'荷重 −Y','load-label')}`,163);
  },
  pin(title){
   return figure('pin',title,`
    ${line('M34 105H170L306 73')}${point(170,105,'open-node',7)}
    ${line('M151 81Q172 56 194 78','direction').replace('/>',' marker-end="url(#material-element-pin-direction)"/>')}
    ${centered(172,52,'456：相対回転を解放','label')}
    ${centered(83,127,'CBAR 1　PB=456')}${centered(263,103,'CBAR 2')}
    ${centered(172,151,'共通節点：並進123を共有')}`,160);
  },
  shellStress(title){
   return figure('shell-stress',title,`
    ${line('M26 43H68V111H26Z','surface')}${line('M12 77H329','ghost')}
    ${label(6,39,'Z2')}${label(6,122,'Z1')}${centered(47,141,'板厚')}
    ${[111,201,291].map(x=>line(`M${x} 42V112`)).join('')}
    ${line('M132 43V111','axis')}${line('M181 111L221 43','axis')}${line('M292 111L332 43','axis')}
    ${point(292,111)}${point(332,43)}${centered(162,79,'＋','label')}${centered(252,79,'＝','label')}
    ${centered(120,143,'膜：一定')}${centered(201,143,'曲げ：直線')}${centered(299,143,'合計の応力')}`,157);
  },
  shellOrder(title){
   const corners=[[26,111],[133,111],[133,51],[26,51]];
   const panel=(offset,reverse)=>`
    ${line(`M${26+offset} 51H${133+offset}V111H${26+offset}Z`,'surface')}
    ${corners.map(([x,y],i)=>point(x+offset,y)+label(x+offset+(i===0||i===3?-9:-8),y+(i<2?18:-8),'G'+(reverse?[1,4,3,2][i]:i+1))).join('')}
    ${reverse?a('shell-order',35+offset,101,35+offset,63):a('shell-order',45+offset,101,114+offset,101)}
    ${reverse?a('shell-order',44+offset,63,114+offset,63):a('shell-order',121+offset,96,121+offset,61)}
    ${centered(80+offset,88,reverse?'⊗ ＋z：奥':'⊙ ＋z：手前','axis-label')}`;
   return figure('shell-order',title,`${centered(80,24,'節点順が反時計回り','label')}${centered(254,24,'節点順を逆にする','label')}${panel(0,false)}${panel(174,true)}`,140);
  },
  shellAngle(title){
   return figure('shell-angle',title,`
    ${line('M42 42H297V112H42Z','surface')}${point(42,112)}${point(297,112)}
    ${a('shell-angle',88,94,244,94)}${a('shell-angle',88,94,193,49,'direction')}
    ${line('M125 94Q125 86 121 81','axis')}${label(133,84,'θ','axis-label')}
    ${label(202,50,'材料1軸')}${label(219,84,'G1→G2に平行','small')}
    ${label(28,130,'G1')}${label(286,130,'G2')}${centered(171,147,'⊙ シェルの＋z側から見る')}`,157);
  },
  shearPanel(title){
   return figure('shear-panel',title,`
    ${line('M79 41H255V118H79Z','surface')}${line('M79 41H255V118H79V41')}
    ${point(79,118)}${point(255,118)}${point(255,41)}${point(79,41)}
    ${a('shear-panel',103,55,225,55,'load')}${a('shear-panel',230,105,109,105,'load')}
    ${a('shear-panel',94,66,94,95,'load')}${a('shear-panel',240,95,240,66,'load')}
    ${centered(168,86,'パネル：せん断流 q','load-label')}${centered(168,144,'周囲の棒：軸力を伝える')}`,154);
  },
  hexaNodes(title){
   const xy=[[51,130],[191,130],[245,100],[105,100],[51,63],[191,63],[245,33],[105,33]];
   const edges=[[0,1],[1,2],[2,3],[3,0],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[7,4]];
   return figure('hexa-nodes',title,`
    ${line('M51 63H191V130H51Z M51 63L105 33H245L191 63Z M191 63L245 33V100L191 130Z','surface')}
    ${line('M51 130L105 100H245M105 100V33','ghost')}
    ${xy.map(([x,y],i)=>point(x,y)+label(x+(x<100?-25:6),y+(i<4?16:-7),'G'+(i+1),'small')).join('')}
    ${edges.map(([u,v],i)=>{const x=(xy[u][0]+xy[v][0])/2,y=(xy[u][1]+xy[v][1])/2;return point(x,y,'open-node',3)+(i===3?label(x-32,y-4,'G12','axis-label'):'');}).join('')}
    ${label(246,140,'角節点 ●')}${label(246,157,'中間節点 ○')}`,169);
  },
  solidRotation(title){
   return figure('solid-rotation',title,`
    ${line('M32 65H128V130H32Z M32 65L59 44H155L128 65Z M128 65L155 44V109L128 130Z','surface')}
    ${point(155,80,'open-node',6)}${line('M161 80H300')}${line('M160 83L290 119','ghost')}
    ${line('M186 67Q209 82 189 102','direction')}
    ${label(211,69,'梁')}${label(48,99,'ソリッド')}${label(215,124,'回転できる')}
    ${centered(174,155,'結合点で伝わる成分：T1・T2・T3')}`,166);
  },
  distortedHexa(title){
   return figure('hexa-axes',title,`
    ${line('M61 55L215 64L210 137L50 128Z M61 55L110 28L266 37L215 64Z M215 64L266 37L261 110L210 137Z','surface')}
    ${line('M50 128L99 101L261 110M99 101L110 28','ghost')}
    ${a('hexa-axes',80,78,238,87)}${a('hexa-axes',134,96,184,69)}${a('hexa-axes',155,119,163,46)}
    ${label(245,87,'R','axis-label')}${label(190,70,'S','axis-label')}${label(169,45,'T','axis-label')}
    ${centered(170,157,'向かい合う面の中心を結ぶ')}`,166);
  },
  couple(title){
   return figure('couple',title,`
    ${line('M117 46H201V122H117Z M117 46L150 28H234L201 46Z M201 46L234 28V104L201 122Z','surface')}
    ${a('couple',120,57,54,57,'load')}${a('couple',119,111,190,111,'load')}
    ${label(42,50,'−F','load-label')}${label(179,106,'＋F','load-label')}
    ${line('M95 57V111M90 57H101M90 111H101','ghost')}${label(79,89,'d')}
    ${a('couple',245,114,316,114)}${label(288,104,'＋X','axis-label')}
    ${centered(172,155,'合力 0　　モーメントの大きさ Fd')}`,163);
  },
  weldPatch(title){
   return figure('patch',title,`
    ${line('M42 58L86 33H248L206 58Z M58 124L101 100H263L220 124Z','surface')}
    ${line('M111 52L131 40H188L168 52Z M126 118L147 106H204L183 118Z','core')}
    ${line('M111 52L126 118M131 40L147 106M188 40L204 106M168 52L183 118','ghost')}
    ${line('M148 46L164 112','axis')}${point(148,46)}${point(164,112)}
    ${label(168,42,'GA')}${label(178,104,'GB')}${label(251,44,'シェル A')}${label(260,120,'シェル B')}
    ${label(82,83,'GS')}${point(103,78,'open-node',3)}
    ${centered(175,148,'等面積の正方形の角を両面へ投影')}`,158);
  },
  cohesive(title){
   return figure('cohesion',title,`
    ${line('M15 54L45 37H135L105 54Z M15 107L45 90H135L105 107Z','surface')}
    ${point(72,47)}${point(72,99)}${line('M72 47V99','ghost')}
    ${a('cohesion',73,81,73,59)}${a('cohesion',74,81,109,81)}${a('cohesion',73,81,105,62)}
    ${label(39,69,'δn')}${label(111,88,'δs')}${label(110,62,'δt')}${label(21,128,'上下の面の相対変位')}
    ${a('cohesion',190,116,321,116)}${a('cohesion',190,116,190,25)}
    ${line('M190 116L279 35','direction')}${line('M190 116L246 66L302 111','ghost')}
    ${label(200,29,'トラクション t')}${label(266,136,'相対変位 δ')}${label(281,49,'線形','small')}
    ${label(247,92,'損傷を含む例','small')}`,151);
  },
  rigidDirection(title){
   const group=(id,x,inward)=>[[x-48,49],[x+48,49],[x-48,110],[x+48,110]].map(([u,v])=>{
    const dx=(u-x)/8,dy=(v-79)/8;
    return (inward?a(id,u-dx,v-dy,x+dx,79+dy):a(id,x+dx,79+dy,u-dx,v-dy))+point(u,v,inward?'node':'dependent');
   }).join('')+point(x,79,inward?'dependent':'node',6);
   return figure('rigid',title,`
    ${centered(85,23,'RBE2：剛体結合','label')}${centered(257,23,'RBE3：重み付き補間','label')}
    ${group('rigid',85,false)}${group('rigid',257,true)}
    ${centered(85,134,'中心が足先を決める')}${centered(257,134,'足先が参照点を決める')}
    ${point(65,151)}${label(75,156,'独立')}${point(180,151,'dependent')}${label(190,156,'従属')}`,165);
  },
  rbar(title){
   const row=(y,name,detail,pass)=>`${line(`M17 ${y}H93`)}${point(17,y)}${point(93,y,'dependent')}${label(108,y-3,name,'label')}${label(108,y+14,detail,'small')}${label(313,y+4,pass,pass==='×'?'load-label':'axis-label')}`;
   return figure('rbar',title,`
    ${label(8,19,'GA')}${label(81,19,'GB')}
    ${row(42,'GA：123456','GAで剛体運動を決める','○')}
    ${row(91,'GA：12346、GB：2','Y回転によるGBのZ変位が残る','×')}
    ${row(140,'GA：12346、GB：3','GBのZ変位でY回転を決める','○')}`,169);
  },
  weightedPlate(title){
   return figure('weighted',title,`
    ${line('M79 39H259V129H79Z','surface')}${line('M73 39V129M62 48L72 57M62 68L72 77M62 88L72 97M62 108L72 117','ghost')}
    ${[[79,129,'1','20 N'],[259,129,'2','30 N'],[259,39,'3','30 N'],[79,39,'4','20 N']].map(([x,y,id,f])=>point(x,y)+label(x+(x<100?-67:11),y+4,id+'：'+f,'load-label')).join('')}
    ${point(169,84,'open-node')}${point(187,84,'dependent',5)}${label(123,79,'重心')}${label(194,88,'99')}
    ${centered(175,19,'参照点99に ＋Z へ100 N','load-label')}
    ${centered(170,152,'左辺固定　重心と参照点の差：10 mm')}`,162);
  },
  genelFlexibility(title){
   return figure('flexibility',title,`
    ${line('M106 52H230V113H106Z','surface')}${line('M48 82H106M230 82H270')}
    ${point(49,82)}${point(269,82)}${line('M43 60V108M31 65L42 74M31 82L42 91M31 99L42 108','ghost')}
    ${a('flexibility',274,82,325,82,'load')}${label(279,68,'荷重 fᵢ','load-label')}
    ${centered(168,87,'行列で置き換えた部品')}${label(33,127,'u_d：固定')}${label(249,127,'変位 uᵢ')}
    ${centered(173,151,'1成分ずつ載荷 → 応答が柔性行列の1列')}`,163);
  },
  genelPipe(title){
   return figure('pipe',title,`
    ${line('M46 133L111 77M113 48L129 40L271 34')}${line('M111 77L113 48','direction')}
    ${[[46,133],[111,77],[113,48],[129,40],[271,34]].map(([x,y])=>point(x,y)).join('')}
    ${label(9,148,'1 (0,0)')}${label(120,86,'2 (5,10)')}${label(46,51,'3 (5,11)')}${label(134,31,'4 (5,12)')}${label(251,25,'5 (15,14)')}
    ${label(11,101,'GENEL')}${line('M70 96L111 62','ghost')}
    ${a('pipe',271,39,271,91,'load')}${label(219,109,'25 lbf（−Y）','load-label')}
    ${a('pipe',193,141,226,141)}${a('pipe',193,141,193,113)}${label(230,145,'X','axis-label')}${label(182,112,'Y','axis-label')}`,159);
  },
 };
 window.ElementVisuals=drawings;
})();
