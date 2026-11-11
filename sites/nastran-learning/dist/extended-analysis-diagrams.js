/* Authored condition diagrams. No solver result contours are depicted. */
(()=>{
 'use strict';
 const previous=window.analysisDiagram;
 const T=(x,y,s,a='')=>`<text x="${x}" y="${y}" ${a}>${s}</text>`;
 const path=(d,color='#496a91',width=2,other='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${other}/>`;
 const arrow=(x,y,xx,yy,type='load')=>path(`M${x} ${y}L${xx} ${yy}`,type==='result'?'#21765f':'#b84d36',2.5,`marker-end="url(#ext-${type})" ${type==='result'?'stroke-dasharray="5 3"':''}`);
 const box=(x,y,w,h,fill='#edf3fa',stroke='#718bad')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" rx="3"/>`;
 const circle=(x,y,r=5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="white" stroke="#456b9b" stroke-width="2"/>`;
 const wall=(x,y,w,h)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ext-hatch)" stroke="#5576a2"/>`;
 const pin=(x,y)=>`<path d="M${x} ${y}l-10 18h20Z" fill="#e1ebfb" stroke="#426bb1"/>`;
 function wrap(title,body,height=520){return `<svg viewBox="0 0 420 ${height}" role="img" aria-label="${title}"><title>${title}</title><defs><marker id="ext-load" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#b84d36"/></marker><marker id="ext-result" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#21765f"/></marker><pattern id="ext-hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#72869e"/></pattern></defs><g font-family="sans-serif" font-size="15" fill="#294b70">${body}${path(`M16 ${height-60}H404`,'#d7e1ed',1)}${T(18,height-37,'赤：荷重・温度指定','fill="#a74430"')}${T(226,height-37,'青：支持・拘束','fill="#426bb1"')}${T(18,height-14,'緑破線：求める量。図は条件の模式図です。','font-size="13" fill="#21765f"')}</g></svg>`;}
 function thermal(){return wrap('4節点6部材のトラス。左の2点を固定し、右上へ4000N、右縦部材へ80℃。基準温度20℃。',`
  ${T(18,26,'熱膨張と機械荷重を分けて比較')}${T(18,52,'4 GRID / 6 CONROD · 単位 N–mm–MPa')}
  ${wall(52,125,16,194)}${path('M68 132H270V312H68Z M68 132L270 312 M68 312L270 132','#5d789c',4)}${path('M270 132V312','#b84d36',7)}
  ${[[68,132,'3'],[68,312,'4'],[270,132,'1'],[270,312,'2']].map(([x,y,n])=>circle(x,y)+T(x+10,y+18,'G'+n)).join('')}
  ${arrow(270,120,270,75)}${T(285,89,'4000 N')}${T(285,110,'+Y')}${T(300,202,'部材103')}${T(300,225,'80°C','fill="#a74430"')}
  ${T(118,116,'500 mm')}${T(125,214,'交差部は')}${T(125,235,'非接続','font-size="13"')}
  ${T(26,343,'G3 / G4：uₓ = uᵧ = 0')}${T(26,366,'全節点：面外自由度3456を拘束','font-size="13"')}
  ${arrow(270,145,299,145,'result')}${T(307,150,'uₓ, uᵧ','fill="#21765f"')}
  ${T(26,392,'Tref = 20°C / 他の部材も20°C')}${T(26,415,'部材103：ΔT = 60°C、自由膨張 0.69 mm')}
  ${box(18,434,120,36)}${box(150,434,120,36)}${box(282,434,120,36)}${T(29,457,'①機械のみ')}${T(161,457,'②温度のみ')}${T(293,457,'③①＋②')}
 `,550);}
 function cylinder(model){const div=model.endsWith('fine')?16:model.endsWith('standard')?8:4;
  return wrap('内半径40、外半径80mmの厚肉円筒。内圧5MPa、外面自由、全節点の軸方向変位を固定。CTRIAX6の軸対称断面。',`
   ${T(18,26,'軸対称断面で円周全体を表す')}${T(18,52,'内圧5 MPa / E = 210000 MPa / ν = 0.28')}
   <circle cx="102" cy="157" r="68" fill="#e5edf8" stroke="#718bad"/><circle cx="102" cy="157" r="34" fill="white" stroke="#718bad"/>
   ${arrow(123,157,145,157)}${arrow(81,157,59,157)}${arrow(102,136,102,114)}${arrow(102,178,102,200)}${T(78,161,'pᵢ','fill="#a74430"')}
   ${T(36,248,'円筒の横断面')}${T(29,271,'内側 → 外側へ加圧','font-size="13"')}
   ${path('M210 235V90','#8192a7',1,'stroke-dasharray="5 4"')}${T(199,81,'z')}${T(190,253,'r = 0','font-size="12"')}
   ${box(258,110,125,120)}
   ${Array.from({length:div},(_,i)=>{const a=258+125*i/div,b=a+125/div;return path(`M${a} 110V230L${b} 110`,'#99b0cb',1);}).join('')}
   ${[135,170,205].map(y=>arrow(227,y,254,y)).join('')}
   ${T(262,99,'r-z断面')}${T(263,252,'rᵢ=40 → rₒ=80','font-size="13"')}${T(274,279,'高さ10 mm','font-size="13"')}
   ${path('M258 106H383 M258 234H383','#426bb1',4)}${T(244,308,'全節点：u_z = 0','fill="#426bb1"')}
   ${arrow(385,170,407,170,'result')}${T(321,194,'uᵣ','fill="#21765f"')}
   ${T(18,341,'内面：σᵣ = −5 MPa / 外面：σᵣ = 0')}${T(18,365,'外周は自由面。端面圧力は与えない。')}
   ${T(18,391,`半径方向 ${div} 分割 · CTRIAX6（二次三角形）`)}${T(18,416,'4 → 8 → 16分割で変位・応力の収束を比較')}${T(18,441,'結果：uᵣ、σᵣ、σθ、σz / Lamé解と照合','fill="#21765f"')}
  `,520);}
 function shell(){return wrap('浅い円筒シェルの4分の1。円周端を支持し、2つの対称面で拘束。中央G6へ下向き220Nを基準荷重とし、弧長法で荷重変位経路を追う。',`
  ${T(18,26,'浅い円筒シェル · 1/4モデル')}${T(18,52,'36節点 / 25 CQUADR · 厚さ6 mm')}
  <path d="M60 246Q155 191 275 190L355 86Q235 87 140 142Z" fill="#e9f0f8" stroke="#597a9f" stroke-width="2"/>
  ${[1,2,3,4].map(i=>{const a=i/5;return path(`M${60+80*a} ${246-104*a}Q${155+80*a} ${191-104*a} ${275+80*a} ${190-104*a}`,'#a9bed5',1)+path(`M${60+215*a} ${246-56*Math.sin(a*Math.PI/2)}L${140+215*a} ${142-56*Math.sin(a*Math.PI/2)}`,'#a9bed5',1);}).join('')}
  ${path('M60 246L140 142','#426bb1',6)}${T(18,282,'円周端：uₓ = uᵧ = 0','fill="#426bb1"')}
  ${circle(275,190)}${arrow(275,120,275,180)}${T(291,139,'G6')}${T(291,161,'220 N','fill="#a74430"')}${arrow(286,199,286,239,'result')}${T(298,231,'変位 −uᵧ','fill="#21765f"')}
  ${T(156,78,'R = 2400 mm')}${T(180,287,'軸方向の半長240 mm','font-size="13"')}
  ${T(18,310,'z=240 mmの曲線縁：自由','font-size="13"')}${T(18,335,'z=0面：u_z・θₓ・θᵧを拘束')}${T(18,360,'x=0面：uₓ・θᵧ・θ_zを拘束')}
  ${T(18,389,'全モデル換算の基準荷重：880 N')}${T(18,414,'実荷重＝荷重係数 × 基準荷重')}
  ${box(18,437,384,47)}${T(29,457,'NLSTEP / ARCLN：荷重と変位を同時に更新')}${T(29,477,'求めるもの：荷重係数–中央変位の釣合い経路','font-size="13"')}
 `,565);}
 function plastic(){return wrap('長さ120mmの片持ち梁。幅1.2高さ12mmの矩形断面。先端荷重48、72、81、0Nの順に載荷除荷し塑性の残留変形を調べる。',`
  ${T(18,26,'材料非線形と除荷 · SOL 106')}${T(18,52,'2節点 / 1 CBEAM · 幾何学的には微小変形')}
  ${wall(35,100,18,106)}${box(53,141,265,22)}${box(53,141,33,22,'#f6dfd4','#b87961')}${box(285,141,33,22,'#f6dfd4','#b87961')}
  ${circle(53,152)}${circle(318,152)}${T(47,125,'G1')}${T(308,125,'G2')}${arrow(318,164,318,219)}${T(334,201,'P','fill="#a74430"')}
  ${T(151,186,'L = 120 mm')}${T(18,233,'G1：6自由度固定 / G2：成分345を拘束','font-size="13"')}
  ${arrow(333,164,333,246,'result')}${T(275,273,'先端変位','fill="#21765f"')}
  ${box(70,275,18,78)}${T(100,298,'断面：幅1.2 × 高さ12 mm')}${T(100,324,'E = 210000 MPa')}${T(100,348,'降伏応力250 MPa / H = 0')}
  ${T(18,382,'端部各L/8＝15 mmの塑性ヒンジ近似')}${T(18,405,'初降伏60 N / 理論上の全塑性荷重90 N')}
  ${box(18,425,384,49)}${T(32,448,'48 → 72 → 81 → 0 N')}${T(32,468,'弾性 → 塑性化 → 除荷後の残留変位を確認','font-size="13"')}
 `,555);}
 function liftOff(){return wrap('長さ530inの梁。左端ピン、400inと530inの位置に片側接触支え。200in位置で35000lbf、先端で8000lbf下向き。',`
  ${T(18,26,'片側の支え：押せるが引けない')}${T(18,52,'3 CBEAM / 2 CGAP · 単位 in–lbf–psi')}
  ${path('M40 164H376','#5b779b',7)}${[40,167,294,376].map((x,i)=>circle(x,164)+T(x-5,148,['A','B','C','D'][i])).join('')}
  ${pin(40,171)}${path('M26 192H54','#426bb1',3)}${arrow(167,93,167,155)}${T(117,81,'35000 lbf','fill="#a74430"')}${arrow(376,93,376,155)}${T(310,81,'8000 lbf','fill="#a74430"')}
  ${box(281,177,26,25,'#dce8f8','#426bb1')}${box(363,177,26,25,'#dce8f8','#426bb1')}${wall(279,203,30,12)}${wall(361,203,30,12)}
  ${T(24,242,'A：ピン支持')}${T(234,242,'C・D：下側接触支え')}${T(18,274,'A–B：200 / B–C：200 / C–D：130 in')}
  ${T(18,307,'初期間隙0 / 開口時の引張力0')}${T(18,332,'圧縮剛性 Kₐ = 2.8×10⁸ lbf/in')}
  ${arrow(376,161,376,129,'result')}${T(18,363,'確認する結果：接触力と開口','fill="#21765f"')}
  ${T(18,389,'独立梁計算：Cは閉、Dは浮き上がる')}${T(18,415,'反力 A：14900 / C：28100 / D：0 lbf')}${T(18,440,'Nastran実行後は変位の符号とCGAP力を照合','font-size="13"')}
 `,520);}
 function bolt(model){const friction=model.includes('frictionless')?'0（摩擦なし）':'0.25';return wrap('上面図。下板左端を固定し、重ねた上板の右端面に+Z方向900psiを負荷。接合部をY方向に並ぶ3本のボルトで各500lbf締め付ける。',`
  ${T(18,26,'3Dボルト締結 · 上面から見る')}${T(18,52,'10966節点 / 5538 CTETRA · in–lbf–psi','font-size="13"')}
  ${box(50,125,136,154,'#c8d9ed')}${wall(36,125,14,154)}
  ${box(95,125,272,154,'#eef3fa')}${box(95,125,91,154,'#dbe6f5')}
  ${[148,202,256].map(y=>`<circle cx="141" cy="${y}" r="15" fill="#a8bed9" stroke="#3a587c" stroke-width="2"/><circle cx="141" cy="${y}" r="6" fill="white" stroke="#3a587c"/>`).join('')}
  ${box(364,125,5,154,'#f6e1d8','#b84d36')}
  ${[148,202,256].map(y=>`<circle cx="367" cy="${y}" r="10" fill="none" stroke="#b84d36" stroke-width="2"/><circle cx="367" cy="${y}" r="3" fill="#b84d36"/>`).join('')}
  ${T(207,112,'+Z：紙面の手前')}${T(224,167,'上板')}${T(220,224,'張出し部')}
  ${T(20,95,'下板左端を固定','fill="#426bb1"')}${T(18,308,'重ね部：3本 × 締付け500 lbf')}${T(232,308,'外荷重900 psi','fill="#a74430"')}
  ${T(18,337,`接触面の摩擦係数 μ = ${friction}`)}${T(18,360,'固定面は並進123を拘束 / 上板先端は自由','font-size="13"')}
  ${box(18,381,384,38)}${T(30,406,'① 締付け：ボルト制御節点へ各500 lbf')}
  ${box(18,427,384,38)}${T(30,452,'② 固定：SPCRで締付け長さを保持')}
  ${box(18,473,384,38)}${T(30,498,'③ 外荷重：上板の右端面へ+Z・900 psi')}
  ${T(18,540,'結果：軸力・接触圧・開閉・すべり','fill="#21765f"')}
 `,625);}
 function prestress(){return wrap('330mm四方の積層板に2本の補強梁。両端から各11マイクロメートル押し縮め静的釣合いを求めた後、その予荷重状態まわりの微小振動を解く。',`
  ${T(18,26,'予荷重を受けた補強積層板')}${T(18,52,'SOL 103 · 静的釣合い → 固有値')}
  ${box(85,105,250,210)}${path('M85 105H335V315H85Z','#426bb1',4)}
  ${[1,2,3,4,5,6,7].map(i=>path(`M${85+250*i/8} 105V315 M85 ${105+210*i/8}H335`,'#c0d0e1',1)).join('')}
  ${path('M85 175H335 M85 245H335','#536e8c',7)}
  ${[145,210,275].map(y=>arrow(38,y,78,y)+arrow(382,y,342,y)).join('')}
  ${T(156,92,'330 mm')}${T(109,339,'板厚2.23872 mm / 補強梁2本')}
  ${T(18,369,'各端の押込み：11 μm → 全短縮22 μm')}${T(18,395,'静的：上下辺uᵧ=0、外周u_z=0')}${T(18,420,'振動：外周uₓ=uᵧ=u_z=0、回転自由')}
  ${box(18,442,384,37)}${T(29,467,'SUBCASE 1：SPCDから初期応力を計算')}
  ${box(18,489,384,37)}${T(29,514,'SUBCASE 2：STATSUB=1 → EIGRL')}
  ${T(18,552,'結果：振動数・モード形。振幅は実変位でない','font-size="13" fill="#21765f"')}
 `,635);}
 const renderers={'thermal-stress':thermal,'thick-cylinder':cylinder,'large-deformation':shell,plasticity:plastic,contact:m=>m.includes('bolt')?bolt(m):liftOff(),'prestressed-modes':prestress};
 window.analysisDiagram=(key,model='')=>renderers[key]?renderers[key](model):previous(key,model);
})();
