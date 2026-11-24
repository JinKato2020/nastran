(() => {
 'use strict';
 const ui=window.BeamLabs.ui,G=window.BeamLabs.graphics,A=window.LessonArticle;
 const fmt=(v,n=4)=>Number.isFinite(v)?Number((Math.abs(v)<1e-10?0:v).toPrecision(n)).toLocaleString('en-US',{maximumFractionDigits:5}):'—';
 const range=(a,b,n=81)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
 const core={
  normal:(F,g0=.4,k=1000)=>{const u=Math.min(F/k,g0),R=Math.max(0,F-k*g0);return {u,g:g0-u,R,Fs:k*u};},
  geometry:(d,t1,t2)=>({g:d-(t1+t2)/2,mid:d}),
  penalty:(ratio,F=1000,g0=.4,k=1000)=>{const kc=k*ratio,u=F>k*g0?(F+kc*g0)/(k+kc):F/k,delta=Math.max(0,u-g0);return {u,delta,R:kc*delta,Fs:k*u,kc};},
  friction:(u,mu,N=1000,kt=1000,old=0)=>{const Q=mu*N,trial=kt*(u-old),T=Math.max(-Q,Math.min(Q,trial)),sp=u-T/kt;return {T,sp,elastic:T/kt,Q,D:Q*Math.abs(sp-old),slip:Math.abs(trial)>Q+1e-9};},
  cycle:(amp,mu)=>{const us=[...range(0,amp,41),...range(amp,-amp,81).slice(1),...range(-amp,amp,81).slice(1)];let sp=0,D=0;return us.map((u,i)=>{const r=core.friction(u,mu,1000,1000,sp);sp=r.sp;D+=r.D;return {i,u,T:r.T,sp,D,slip:r.slip};});},
  patches:(u,mu)=>[200,600,200].map(N=>core.friction(u,mu,N)),
  hertz:(F,R=20,E=210000,nu=.3)=>{const Es=1/(2*(1-nu*nu)/E),a=F===0?0:Math.cbrt(3*F*R/(4*Es)),delta=a*a/R,p0=a===0?0:3*F/(2*Math.PI*a*a);return {Es,a,delta,p0,kt:2*Es*a};},
  bolt:(F,F0=10000,kb=100000,kj=400000)=>{const C=kb/(kb+kj),sep=F0/(1-C),separated=F>sep,Fb=separated?F:F0+C*F,Fc=separated?0:F0-(1-C)*F,u=separated?F/kb-F0/kb:F/(kb+kj),gap=separated?(F-sep)/kb:0;return {C,sep,Fb,Fc,u,gap,separated};},
  preload:(delta,kb=100000,kj=400000)=>({keq:kb*kj/(kb+kj),F:delta*kb*kj/(kb+kj)}),
  stages:stage=>{if(stage==='preload')return {...core.bolt(0),F:0,shorten:.125};if(stage==='locked')return {...core.bolt(8000),F:8000,shorten:.125};if(stage==='force')return {Fb:10000,Fc:2000,F:8000,gap:0,shorten:.105};return {...core.bolt(8000,0),F:8000,shorten:0};},
  shear:(F,mu,V)=>{const r=core.bolt(F);return {...r,Q:mu*r.Fc,V,margin:mu*r.Fc-V};},
  torque:(T,K,d=10)=>({F:T*1000/(K*d),T,K,d}),
  loss:(dT,settle)=>{const kb=100000,kj=400000,L=40,alphaB=12e-6,alphaJ=23e-6,keq=kb*kj/(kb+kj),thermal=(alphaJ-alphaB)*L*dT,change=keq*(thermal-settle),raw=10000+change;return {keq,thermal,change,F:Math.max(0,raw),raw};}
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(x,y,s,a='middle')=>`<text x="${x}" y="${y}" text-anchor="${a}">${esc(s)}</text>`;
 const line=(a,b,c='el-edge')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${c}"/>`;
 function arrow(a,b,c='el-force'){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<.1)return '';const u=dx/l,v=dy/l,h=Math.min(8,l/2);return line(a,b,c)+`<polygon points="${b} ${b[0]-h*u+3*v},${b[1]-h*v-3*u} ${b[0]-h*u-3*v},${b[1]-h*v+3*u}" class="${c}-head"/>`;}
 const svg=(s,label,h=240)=>`<svg class="theory-lab-svg" viewBox="0 0 360 ${h}" role="img" aria-label="${esc(label)}">${s}</svg>`;
 const plate=(x,y,w,h,c='el-fill')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${c}"/>`;
 const ground=(y)=>line([60,y],[300,y])+range(65,295,15).map(x=>line([x,y],[x-7,y+9])).join('');
 const spring=(x,y0,y1)=>`<polyline points="${[[x,y0],...range(y0+8,y1-8,13).map((y,i)=>[x+(i===0||i===12?0:i%2?6:-6),y]),[x,y1]].map(p=>p.join(',')).join(' ')}" class="el-edge"/>`;
 const out=(e,v)=>Object.entries(v).forEach(([k,x])=>{if(e.out[k])e.out[k].textContent=fmt(+x);});
 const table=(h,r)=>A.table(h,r,{narrow:true}),frame=(controls,cap)=>ui.box('',controls,cap);
 const plot=(id,label,x,y,series,extra={})=>G.chart({id:'contact-'+id,label,x,y,xt:range(...x,5),yt:range(...y,5),xf:v=>fmt(v,3),yf:v=>fmt(v,3),xl:'u (mm)',yl:'F (N)',legend:true,series,...extra});
 function boltFigure(F,Fb,Fc,gap=0){
  const g=Math.min(30,gap*300),y=110-g/2,z=110+g/2,top=y-32,bottom=z+32;
  const plates=plate(90,top,81,32)+plate(189,top,81,32)+plate(90,z,81,32)+plate(189,z,81,32);
  const bolt=plate(175,top-14,10,bottom-top+28,'el-soft')+plate(151,top-14,58,14,'el-soft')+plate(151,bottom,58,14,'el-soft');
  return svg(plates+bolt+line([180,25],[180,200],'el-ghost')+
   (F?arrow([290,y-8],[290,y-40])+arrow([290,z+8],[290,z+40])+text(307,top-12,'F'):'')+
   (Fc?arrow([120,top+5],[120,top+25],'el-motion')+arrow([240,bottom-5],[240,bottom-25],'el-motion')+text(111,top-7,'Fc'):'')+
   (Fb?arrow([180,top+27],[180,top+8])+arrow([180,z+5],[180,z+24])+text(218,top+17,'Fb'):'')+
   text(180,217,'Fb − Fc = F'),'ボルトと板の断面：ボルトは引張、板は圧縮、外力は面を開く',240);
 }
 const labs={
  feet:{
   html:()=>frame(ui.slider('x','左脚から荷重点までの距離（mm）',0,100,5,50),'板の重さを無視し、100 mm離れた二つの脚で支えます。下向き矢印を右へ動かし、各脚の上向き矢印の長さを見比べます。'),
   draw(e,v){
    out(e,v);
    const x=Number(v.x),right=100*x/100,left=100-right,at=70+2.2*x;
    e.plot.innerHTML=svg(plate(42,85,276,14)+plate(60,99,20,18)+plate(280,99,20,18)+ground(117)+
     arrow([at,32],[at,81])+text(at,24,'100 N')+
     arrow([70,117+left*.54],[70,117],'el-motion')+arrow([290,117+right*.54],[290,117],'el-motion')+
     text(70,198,fmt(left)+' N')+text(290,198,fmt(right)+' N'),'荷重点を右脚へ移すと左脚の反力が減る',211);
    e.readout.innerHTML=x===100?'右脚だけで100 Nを支えます。左脚は無荷重で触れられます。':x===0?'左脚だけで100 Nを支えます。右脚は無荷重で触れられます。':'左右の合力は100 Nです。荷重点に近い脚ほど多く支え、中央では各50 Nです。';
   }
  },
  footprint:{
   html:()=>frame(ui.select('pattern','押し跡の分布',[['even','全面に均一'],['tilted','右側ほど強く当たる'],['edge','右だけに当たる']],'tilted'),'各区画は100 mm²です。下向きの矢印は区画に加わる力、◇は合力が作用する位置です。位置は区画の中心から測ります。'),
   draw(e,v){
    const pressures={even:[2,2,2],tilted:[0,2,4],edge:[0,0,6]}[v.pattern];
    const forces=pressures.map(p=>p*100),center=forces.reduce((sum,F,i)=>sum+F*i*10,0)/600;
    const blocks=forces.map((F,i)=>{const x=85+i*95;return plate(x-47.5,110,95,17)+arrow([x,105-F*.11],[x,105])+text(x,25,pressures[i]+' MPa')+text(x,151,i*10+' mm');}).join('');
    const cx=85+center*9.5;
    e.plot.innerHTML=svg(blocks+text(cx,179,'◇'),'圧力分布と合力が作用する位置',187);
    e.readout.innerHTML='合力は<strong>600 N</strong>、左の区画中心からの作用位置は<strong>'+fmt(center,3)+' mm</strong>です。';
   }
  },
  normal:{html:()=>frame(ui.slider('F','押す力 F（N）',-200,1200,100,700),'上側ばねk=1000 N/mmで支えたブロックと、剛な下側の台。初期すき間0.4 mm、下向き変位uを正。変位・すき間は拡大表示。赤は外力、緑の破線矢印は台の反力。'),draw(e,v){out(e,v);const r=core.normal(+v.F),y=100+r.u*70; e.plot.innerHTML=svg(ground(176)+line([120,30],[240,30])+spring(180,30,y)+plate(130,y,100,48)+line([120,148],[240,148],'el-ghost')+arrow([270,70],[270,70+v.F*.045])+text(290,92,'F')+(r.R?arrow([180,218],[180,187],'el-motion'):'')+text(248,170,'g')+text(205,213,'R'),'押したときだけ台から反力を受ける',245)+table(['u (mm)','g (mm)','R (N)'],[[fmt(r.u),fmt(r.g),fmt(r.R)]]);e.readout.innerHTML=r.R>0?'<strong>接触中はu=0.4 mm。</strong>外力のうち400 Nをばね、残りを台が受けます。台は引張力を伝えません。':r.g===0?'<strong>ちょうど台に届きました。</strong>すき間0 mm、台の反力0 Nです。外力400 Nのすべてを上側のばねが支えています。':'<strong>開いている間の接触反力は0。</strong>F/kだけ動き、F=400 Nでちょうど接触します。接触直前と直後で力と変位の関係が切り替わります。';}},
  thickness:{html:()=>frame(ui.slider('d','シェル中立面の距離 d（mm）',0,8,.5,5)+ui.slider('t','両シェルの厚さ t（mm）',1,6,1,4),'同じ厚さの平行な2枚。中立面を破線、実際の板の厚さを塗りで示します。厚さと距離を同じ縮尺で表示。オフセットは0とした幾何の説明です。'),draw(e,v){out(e,v);const r=core.geometry(+v.d,+v.t,+v.t),s=17,y1=140-v.d*s/2,y2=140+v.d*s/2,h=v.t*s;e.plot.innerHTML=svg(plate(90,y1-h/2,180,h)+plate(90,y2-h/2,180,h,'el-soft')+line([65,y1],[295,y1],'el-ghost')+line([65,y2],[295,y2],'el-ghost')+line([55,y1],[55,y2])+text(39,144,'d')+text(180,286,'g = d − (t1 + t2)/2'),'シェルの中立面間距離と実表面のすき間',310)+table(['中立面の距離 (mm)','表面すき間 g (mm)'],[[v.d,fmt(r.g)]]);e.readout.innerHTML=r.g<0?'<strong>中立面が離れていても、実表面は重なっています。</strong>これを意図した締まりばめとして扱うか、入力の厚さ・オフセットの誤りとして直すかを決めます。':'接触を判断するのは中立面同士の距離だけではありません。厚さ4 mmならd=4 mmで表面が接し、d=0では4 mmの重なりになります。';}},
  penalty:{html:()=>frame(ui.slider('log','接触剛性／部材剛性（10の指数）',0,5,1,2),'ブロックのばねk=1000 N/mm、初期すき間0.4 mm、外力1000 N。接触後だけ接触ばねkcが働く1自由度の説明用計算です。許容貫通の万能な推奨値を示すものではありません。'),draw(e,v){out(e,v);const ratio=10**v.log,r=core.penalty(ratio),height=Math.min(60,r.delta*200);e.plot.innerHTML=svg(plate(120,90+height,120,60)+line([70,150],[290,150],'el-ghost')+spring(180,150+height,210+height)+ground(215+height)+arrow([180,30],[180,60])+text(217,49,'F')+text(244,110+height,'u')+text(245,172,'δ')+text(215,204+height,'kc'),'有限の接触剛性は小さい貫通を許す',310)+table(['kc (N/mm)','貫通 δ (mm)','接触力 R (N)'],[[r.kc.toExponential(1),fmt(r.delta,5),fmt(r.R)]]);e.readout.innerHTML=`<strong>厳密な片側拘束の反力は600 N。</strong>この設定は${fmt(r.R)} N、部材のばね力は${fmt(r.Fs)} Nで、合計1000 Nです。接触剛性を大きくすると貫通は減りますが、剛性の尺度差も大きくなります。`; }},
  friction:{html:()=>frame(ui.slider('u','接線方向の変位 u（mm）',0,.6,.02,.2)+ui.slider('mu','摩擦係数 μ',0,.6,.05,.3),'一定押付け力N=1000 N、接線ばねkt=1000 N/mmと滑り要素を直列にした正則化モデル。単調載荷。正方向へ動かすために必要な力Tを表示し、面がブロックへ及ぼす摩擦力は−Tです。'),draw(e,v){out(e,v);const r=core.friction(+v.u,+v.mu),x=100+v.u*200;e.plot.innerHTML=svg(ground(165)+plate(x,110,90,45)+arrow([x+45,65],[x+45,100])+text(x+65,80,'N')+arrow([x+95,130],[x+130,130])+text(x+115,116,'T')+arrow([x+35,153],[x+5,153],'el-motion')+line([100,105],[100,158],'el-ghost')+text(180,214,'u = ue + us'),'固着から滑りへの切替と接線力',235)+table(['T (N)','弾性ずれ ue (mm)','滑り us (mm)'],[[fmt(r.T),fmt(r.elastic),fmt(r.sp)]]);e.readout.innerHTML=r.slip?'<strong>滑り中は上限μNに達しています。</strong>さらに動かした分は主に滑りに回ります。摩擦が運動を妨げる向きであることを確認します。':'<strong>摩擦力は常にμNではありません。</strong>固着中は必要な力だけを受け持ち、上限に届くまではT=kt uです。この小さい弾性ずれは数値的な正則化の例です。';}},
  cycle:{html:()=>frame(ui.slider('amp','往復変位の振幅（mm）',.1,.8,.1,.6)+ui.slider('mu','摩擦係数 μ',.1,.5,.1,.3)+ui.slider('step','履歴をたどる位置',0,200,1,120),'N=1000 N、kt=1000 N/mm。0→+振幅→−振幅→+振幅の順。初回載荷は破線、往復部分は実線、点が現在位置。モデルの履歴を毎回初めから計算して表示しています。'),draw(e,v){out(e,v);const data=core.cycle(+v.amp,+v.mu),i=+v.step,r=data[i],Q=1000*v.mu;e.plot.innerHTML=plot('cycle','摩擦の履歴と仕事',[ -v.amp,+v.amp],[-Q*1.2,Q*1.2],[{pts:data.slice(0,41).map(s=>[s.u,s.T]),name:'0 → A',dash:'6 4'},{pts:data.slice(40).map(s=>[s.u,s.T]),name:'A → −A → A',dash:'',strong:true}],{marks:[[r.u,r.T]]})+table(['現在u (mm)','T (N)','累積散逸 (N·mm)'],[[fmt(r.u),fmt(r.T),fmt(r.D)]]);e.readout.innerHTML='<strong>同じ変位でも、どこから戻ってきたかで力が変わります。</strong>除荷直後に摩擦力が即座に逆符号になるわけではなく、弾性ずれを戻してから逆滑りします。往復ループの面積が1周期の散逸仕事です。';}},
  patches:{html:()=>frame(ui.slider('u','共通の接線変位 u（mm）',0,.25,.01,.08),'3つの等面積パッチ、法線力200・600・200 N、μ=0.3、各接線剛性1000 N/mm。3点の同じ接線変位を仮定した独立ばね・摩擦モデルです。連続体の局所解を再現するものではありません。'),draw(e,v){out(e,v);const r=core.patches(+v.u,.3),T=r.reduce((s,x)=>s+x.T,0);e.plot.innerHTML=svg(ground(175)+r.map((s,i)=>{const x=60+85*i;return plate(x,100,70,55,s.slip?'el-soft':'el-fill')+arrow([x+35,45],[x+35,90])+text(x+35,32,[200,600,200][i]+' N')+arrow([x+10,165],[x+10+s.T*.22,165])+text(x+35,211,String(i+1));}).join(''),'面の一部だけが先に滑る',235)+table(['パッチ','接線力 (N)','状態'],r.map((s,i)=>[i+1,fmt(s.T),s.slip?'滑り':'固着']))+table(['合計T (N)','面全体のμN (N)'],[[fmt(T),300]]);e.readout.innerHTML='<strong>全体のTがμN未満でも、一部は滑れます。</strong>この例では端の上限60 N、中央180 N。接触圧が低い部分から先に上限へ達します。全体の摩擦余裕だけで局所の微小滑りを判断しません。';}},
  hertz:{html:()=>frame(ui.slider('F','押付け力 P（N）',100,1600,100,800),'球と平面の摩擦なし弾性接触。球半径20 mm、両材E=210,000 MPa、ν=0.3。接触域が半径に比べ十分小さいHertz近似。左図の変形は模式的、下の曲線は式から計算した接触圧です。'),draw(e,v){out(e,v);const r=core.hertz(+v.F);e.plot.innerHTML=svg(`<path d="M100 50 Q100 110 160 120 L200 120 Q260 110 260 50" class="el-fill"/>${ground(120)}${line([155,117],[205,117],'b3-edge')}${arrow([180,18],[180,48])}${text(204,33,'P')}${text(180,151,'2a')}`,'球と平面の小さい接触域',170)+plot('hertz','接触圧の分布',[-r.a,r.a],[0,r.p0*1.1],[{pts:range(-r.a,r.a).map(x=>[x,r.p0*Math.sqrt(Math.max(0,1-(x/r.a)**2))]),name:'p(r)',strong:true}],{xl:'r (mm)',yl:'p (MPa)',xf:v=>fmt(v,2)})+table(['半径 a (mm)','接近量 δ (mm)','最大p0 (MPa)'],[[fmt(r.a),fmt(r.delta),fmt(r.p0)]]);e.readout.innerHTML='<strong>荷重8倍では、接触半径と最大圧力は2倍、接近量は4倍。</strong>材料が線形弾性でも、接触面積が変わるため力と接近量は比例しません。塑性・粗さ・薄い部材ではこの近似の範囲を確認します。';}},
  bolt:{html:()=>frame(ui.slider('F','接合部を開く外力 F（kN）',0,20,.25,8)+ui.select('ratio','被締結体剛性 kj／ボルト剛性 kb',[[2,'2'],[4,'4'],[8,'8']],4),'初期軸力F0=10 kN、kb=100 kN/mm。外力は被締結体の外側の面へ作用、軸方向・線形ばね・非偏心の近似。開離後も弾性と仮定します。図の開きは拡大表示。頭・ナットは板の外面に接しています。FbとFcの矢印は断面内力の引張・圧縮の向きを模式的に示します。'),draw(e,v){out(e,v);const F=v.F*1000,kj=100000*v.ratio,r=core.bolt(F,10000,100000,kj);e.plot.innerHTML=boltFigure(F,r.Fb,r.Fc,r.gap)+plot('bolt','外力を受けたボルト軸力と締付け力',[0,20],[0,22],[{pts:range(0,20).map(x=>[x,core.bolt(x*1000,10000,100000,kj).Fb/1000]),name:'Fb',strong:true},{pts:range(0,20).map(x=>[x,core.bolt(x*1000,10000,100000,kj).Fc/1000]),name:'Fc'}],{xl:'F (kN)',yl:'F (kN)',marks:[[+v.F,r.Fb/1000],[+v.F,r.Fc/1000]]})+table(['Fb (kN)','Fc (kN)','開離外力 (kN)'],[[fmt(r.Fb/1000),fmt(r.Fc/1000),fmt(r.sep/1000)]]);e.readout.innerHTML=F===r.sep?'<strong>面が離れ始める境目です。</strong>すき間も締付け力も0です。さらに引くと、すき間が開きます。':r.separated?'<strong>接合面が開き、Fc=0。</strong>この単純モデルでは全外力をボルトが負担し、Fb=Fになります。開離前の荷重分担式を延長して負の締付け力を許してはいけません。':`<strong>外力の${fmt(100*r.C)}%がボルト軸力増分へ、残りが締付け力の減少へ。</strong>Fb−Fc=${fmt(F/1000)} kNで外力とつり合います。FをそのままF0へ加えると、この分担を失います。`; }},
  stages:{html:()=>frame(ui.select('stage','締付け後の扱い',[['preload','1：10 kNで締付け'],['locked','2・3：締付け変形を保持＋外力'],['force','比較：締付け力を10 kNに保つ'],['reset','誤り：締付け変形を0へ戻す']],'locked'),'kb=100、kj=400 kN/mm。F0=10 kNに相当する締付け短縮量は0.125 mm。保持後の外力は8 kN。保持するのは締付け用の相対変形であり、ボルト全体の変形や物体の位置を固定することではありません。'),draw(e,v){const r=core.stages(v.stage);e.plot.innerHTML=boltFigure(r.F,r.Fb,r.Fc,r.gap)+table(['外力 F (kN)','軸力 Fb (kN)','締付け力 Fc (kN)'],[[fmt(r.F/1000),fmt(r.Fb/1000),fmt(r.Fc/1000)]])+table(['締付け短縮量 (mm)'],[[fmt(r.shorten)]]);e.readout.innerHTML=v.stage==='locked'?'<strong>保持後の軸力は11.6 kNへ増えます。</strong>10 kNへ固定した力制御ではありません。締付け短縮量は保持しても、ボルトは外力に応じて弾性伸びします。':v.stage==='force'?'力を10 kNへ制御し続ける比較では、必要な締付け短縮量も変化します。通常の締め終えたボルトとは別の境界条件です。':v.stage==='reset'?'<strong>短縮量0へ戻すと初期締付けを失います。</strong>このモデルでは面が開き、8 kNをボルトだけが負担します。':'ボルトの10 kNの引張と、被締結体の10 kNの圧縮が内部でつり合います。外部の引張荷重はまだ0です。';}},
  shear:{html:()=>frame(ui.slider('F','開く方向の外力（kN）',0,15,.25,6)+ui.slider('V','横荷重 V（kN）',0,5,.25,2)+ui.slider('mu','接合面のμ',.1,.5,.05,.3),'F0=10 kN、kb/kj=1/4。すべり面は1面、軸方向の開離前モデルから得た残存締付け力を使用します。全体滑りの上限比較であり、局所滑りや、滑った後の孔当たりは計算していません。'),draw(e,v){out(e,v);const r=core.shear(v.F*1000,+v.mu,v.V*1000);const gap=Math.min(24,r.gap*480);e.plot.innerHTML=svg(plate(80,75-gap,200,40)+plate(80,115,200,40,'el-soft')+(r.V>0?arrow([286,90-gap],[335,90-gap])+arrow([74,140],[25,140])+text(320,70-gap,'V')+text(37,172,'V'):'')+(r.Fc>0?arrow([130,33],[130,67])+arrow([230,200],[230,164])+text(158,45,'Fc'):'')+text(180,230,'V ≤ μFc'),'外力で締付けが減ると摩擦の上限も下がる',250)+table(['Fc (kN)','μFc (kN)','V (kN)'],[[fmt(r.Fc/1000),fmt(r.Q/1000),fmt(r.V/1000)]]);e.readout.innerHTML=r.Fc===0?'<strong>押し付ける力が0なので摩擦の上限も0です。</strong>ボルトに軸力が残っていても、この面では横荷重を渡せません。':Math.abs(r.margin)<1e-8?'<strong>横荷重が摩擦の上限にちょうど達しました。</strong>上限に等しいだけでは、すでに滑ったかは決まりません。これ以上の横荷重を静止摩擦だけで支える余裕はありません。':r.margin<0?'<strong>このモデルの全面固着では横荷重を支えきれません。</strong>すべり、孔壁とボルトの支圧、ボルトせん断へ荷重経路が変わる可能性があります。':'全体の摩擦上限内です。ただし、面の一部の滑り・偏心・圧力分布を調べたことにはなりません。μに初期軸力10 kNを常に掛けると、締付け低下を見落とします。';}},
  torque:{html:()=>frame(ui.slider('T','締付けトルク（N·m）',10,40,5,20)+ui.slider('K','トルク係数 K',.12,.3,.02,.2),'呼び径d=10 mm、概算T=K F0 d。Kはねじ・座面の摩擦や幾何をまとめた係数で、接合面の摩擦係数μとは別です。製品の推奨締付け値を示す図ではありません。'),draw(e,v){out(e,v);const r=core.torque(+v.T,+v.K);e.plot.innerHTML=plot('torque','同じトルクでも係数で軸力が変わる',[.12,.3],[0,35],[{pts:range(.12,.3).map(K=>[K,core.torque(+v.T,K).F/1000]),name:'F0',strong:true}],{xl:'K',yl:'F0 (kN)',marks:[[+v.K,r.F/1000]]})+table(['推定F0 (kN)','K=0.12〜0.30での範囲 (kN)'],[[fmt(r.F/1000),fmt(core.torque(+v.T,.3).F/1000)+' ～ '+fmt(core.torque(+v.T,.12).F/1000)]]);e.readout.innerHTML='<strong>同じトルクでも、摩擦条件が変われば軸力は変わります。</strong>潤滑・表面・再使用・締付け方法をそろえ、最大軸力側で強度、最小軸力側で開離や滑りを評価します。';}},
  loss:{html:()=>frame(ui.slider('dT','温度変化 ΔT（K）',-100,100,20,60)+ui.slider('settle','座面等のなじみ量 s（mm）',0,.15,.01,.02),'初期10 kN、締付け長40 mm。ボルトαb=12×10⁻⁶/K、被締結体αj=23×10⁻⁶/K、kb=100・kj=400 kN/mm。Eと剛性は一定、温度は各部で一様とした軸方向近似です。'),draw(e,v){out(e,v);const r=core.loss(+v.dT,+v.settle);e.plot.innerHTML=boltFigure(0,r.F,r.F)+table(['自由膨張差 (mm)','軸力変化の線形予測 (kN)','残る軸力 (kN)'],[[fmt(r.thermal),fmt(r.change/1000),fmt(r.F/1000)]]);e.readout.innerHTML=r.raw<=0?'<strong>線形予測が0以下となり、締付けを失う範囲です。</strong>圧縮するボルトへ式を延長せず、接触の開閉を解き直します。':'部材の方が多く伸びると軸力は増え、座面のなじみは軸力を減らします。変位差に合成剛性kb kj/(kb+kj)を掛けて見積もります。';}}
 };
 function connect(root){for(const e of root.querySelectorAll('[data-contact-lab]'))ui.mount(e,labs[e.dataset.contactLab]);}
 window.ContactLabs={core,labs,connect};
})();
