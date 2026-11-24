/* Small theory experiments. Geometry and readouts use the same physical quantities. */
(() => {
 'use strict';
 const {ui,graphics}=window.BeamLabs;
 const box=(controls,caption)=>ui.box('',controls,caption);
 const svg=(name,body,height)=>'<svg class="theory-lab-svg" viewBox="0 0 360 '+height+'" role="img" aria-label="'+name+'">'+body+'</svg>';
 const line=(x,y,X,Y,css='el-edge')=>'<line class="'+css+'" x1="'+x+'" y1="'+y+'" x2="'+X+'" y2="'+Y+'"/>';
 const rect=(x,y,w,h,css)=>'<rect class="'+css+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'"/>';
 const label=(x,y,v)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle">'+v+'</text>';
 const dot=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="4" class="lab-mark"/>';
 const points=(lo,hi,fn)=>Array.from({length:81},(_,i)=>{const x=lo+(hi-lo)*i/80;return [x,fn(x)];});
 const poly=(pts,css='el-edge')=>'<polyline points="'+pts.map(p=>p.join(',')).join(' ')+'" class="'+css+'"/>';
 const arrow=(x,y,X,Y)=>{
  const angle=Math.atan2(Y-y,X-x),head=[-.48,.48].map(a=>[X-8*Math.cos(angle+a),Y-8*Math.sin(angle+a)]);
  return line(x,y,X,Y,'el-force')+poly([head[0],[X,Y],head[1]],'el-force');
 };
 const fmt=(n,d=2)=>Number(n.toFixed(d)).toString();
 const pin=(x,y)=>poly([[x-6,y+9],[x,y],[x+6,y+9],[x-6,y+9]]);
 const roller=(x,y)=>pin(x,y)+line(x-9,y+13,x+9,y+13);
 function cylinder(r){return {radial:4-1600/(r*r),hoop:4+1600/(r*r)};}
 function mode(x){return Math.abs(x-.5)<1e-12?0:Math.sin(2*Math.PI*x);}
 function arch(u){
  const halfSpan=50,h=10,y=h-u,L0=Math.hypot(halfSpan,h),L=Math.hypot(halfSpan,y);
  return 2*10000*(L0-L)/L0*y/L;
 }
 function sectionMoment(c){return c<=1?c:1.5-.5/(c*c);}
 const labs={
  heat:{
   html:()=>box(ui.select('end','右端の条件',[['cold','20 ℃の冷却板に接続'],['insulated','断熱して熱を通さない']],'cold'),'左端を30 ℃に保った一様な棒。側面は断熱、内部発熱なし。上は実物の断面、下は同じ横位置の定常温度。矢印は熱の流れる向きです。'),
   draw(e,v){
    const insulated=v.end==='insulated',right=insulated?30:20;
    const outline=rect(52,28,240,26,'el-soft')+line(52,20,52,60)+line(292,20,292,60);
    const boundary=insulated?Array.from({length:5},(_,i)=>line(293,22+8*i,302,16+8*i)).join(''):arrow(306,40,338,40);
    e.plot.innerHTML=svg('棒の端の条件と定常状態の温度分布',outline+boundary+(insulated?'':arrow(154,40,194,40))+
     line(52,158,292,158,'el-ghost')+line(52,98,292,98,'el-ghost')+line(52,98,292,insulated?98:158)+dot(52,98)+dot(292,insulated?98:158)+label(25,102,'30 °C')+label(25,162,'20 °C')+label(52,188,'0')+label(292,188,'L'),201);
    e.readout.textContent='定常時の右端は '+right+' ℃。'+(insulated?'熱の出口がなく、発熱もないので、やがて全体が30 ℃になり熱流が止まります。右端の温度を30 ℃と指定した結果ではありません。':'左から入る熱と同じ量が右端で出ます。温度の傾きも熱流も残ります。');
   }
  },
  cylinder:{
   html:()=>box(ui.slider('r','内壁から外壁へ測定位置を移す　r（mm）',10,20,1,10),'内半径10 mm・外半径20 mm、内圧12 MPa、外圧0の長い円筒。矢印は流体が内壁を押す向き。断面の丸とグラフ上の二つの丸は同じ半径です。実線は円周応力、破線は半径応力。引張を正とします。'),
   draw(e,v){
    const r=Number(v.r),s=cylinder(r),cx=165,cy=83,scale=3.3;
    const ring='<path class="el-fill" fill-rule="evenodd" d="M99 83a66 66 0 1 0 132 0a66 66 0 1 0 -132 0 M132 83a33 33 0 1 0 66 0a33 33 0 1 0 -66 0"/>';
    e.out.r.textContent=r;
    e.plot.innerHTML=svg('同じ半径で二方向の応力を読む',ring+arrow(cx-12,cy,cx-32,cy)+arrow(cx,cy-12,cx,cy-32)+arrow(cx,cy+12,cx,cy+32)+arrow(cx+12,cy,cx+32,cy)+line(cx+33,cy,cx+66,cy)+dot(cx+scale*r,cy)+label(273,cy+5,'r = '+r+' mm'),157)+
     graphics.chart({id:'theory-cylinder',label:'内壁から外壁までの応力',x:[9.5,20.5],y:[-15,23],xt:[10,12,14,16,18,20],yt:[-12,-4,0,8,16,20],xl:'r (mm)',yl:'σ (MPa)',legend:true,ph:128,
      series:[{name:'σθ',strong:true,pts:points(10,20,x=>cylinder(x).hoop)},{name:'σr',dash:'5 4',pts:points(10,20,x=>cylinder(x).radial)}],marks:[[r,s.hoop],[r,s.radial]]});
    e.readout.textContent='半径 '+r+' mmで、半径応力は '+fmt(s.radial)+' MPa、円周応力は ＋'+fmt(s.hoop)+' MPa。'+(r===20?'外壁で0になるのは半径応力です。管を裂こうとする円周方向の引張は外壁にも残ります。':r===10?'同じ内壁が半径方向には押され、円周方向には引かれます。':'丸を外へ動かすと、圧縮も円周方向の引張も弱まります。');
   }
  },
  observation:{
   html:()=>box(ui.select('force','縦方向に点荷重を加える位置',[['.25','左の腹（L/4）'],['.5','中央の節（L/2）']],'.25')+ui.select('sensor','縦変位を読む位置',[['.25','左の腹（L/4）'],['.5','中央の節（L/2）'],['.75','右の腹（3L/4）']],'.5'),'両端単純支持の一様な細長い板を梁として扱い、曲げ2次だけを取り出します。実線は正規化したモード形、破線は元の軸。Fは上向きの点荷重、◇は変位を測る位置。形は一定で、実際の振幅は描いていません。'),
   draw(e,v){
    const a=Number(v.force),b=Number(v.sensor),fa=mode(a),fb=mode(b),x=t=>38+284*t,y=t=>89-36*mode(t);
    const sensor=x(b),sy=y(b);
    e.plot.innerHTML=svg('曲げ2次の腹・節と加振点・観測点',line(33,89,328,89,'el-ghost')+pin(x(0),89)+roller(x(1),89)+poly(points(0,1,t=>y(t)).map(([t,Y])=>[x(t),Y]))+
     arrow(x(a),155,x(a),94)+label(x(a)+15,151,'F')+poly([[sensor,sy-6],[sensor+6,sy],[sensor,sy+6],[sensor-6,sy],[sensor,sy-6]])+label(180,29,'φ₂(x) = sin(2πx/L)'),172);
    e.readout.textContent='荷重点のモード成分 '+fmt(fa)+'、観測点の成分 '+fmt(fb)+'。'+(fa===0?'中央を押すと2次への入力が0です。他のモードは動き得ます。':fb===0?'左の腹を押すので2次は励起されますが、中央のセンサーにはこの成分が現れません。':fb<0?'このモードでは左右の腹は逆向きです。左の腹から右へ観測点を移すと変位の符号が反転します。':'押す点も見る点も腹なので、このモードの寄与が観測されます。');
   }
  },
  prestress:{
   html:()=>box(ui.slider('ratio','圧縮力 P／オイラー座屈荷重 Pcr（引張は負）',-.5,1,.05,.75),'両端単純支持の一様な細い梁。上は曲げ1次の形。下では梁中央を同じ量だけずらし、静かに離します。破線は軸力なし、実線は選んだ軸力の波形。横軸は無荷重の周期 T₀ を単位にした時間です。'),
   draw(e,v){
    const ratio=Number(v.ratio),fr=Math.sqrt(1-ratio);
    e.out.ratio.textContent=fmt(ratio);
    const forces=ratio===0?'':ratio>0?arrow(8,76,47,76)+arrow(352,76,313,76):arrow(47,76,8,76)+arrow(313,76,352,76);
    e.plot.innerHTML=svg('同じ梁の横振動に及ぼす引張と圧縮の影響',line(53,76,307,76,'el-ghost')+pin(53,76)+roller(307,76)+poly(points(0,1,t=>76-32*Math.sin(Math.PI*t)).map(([t,Y])=>[53+254*t,Y]))+forces+label(180,126,'f₁ / f₀ = '+fmt(fr)),142)+
     graphics.chart({id:'theory-prestress',label:'同じ時間内で梁中央が往復する回数',x:[0,2],y:[-1.1,1.1],xt:[0,.5,1,1.5,2],yt:[-1,0,1],xl:'t / T₀',yl:'u / u₀',ph:94,legend:true,
      series:[{name:'P = 0',dash:'5 4',pts:points(0,2,t=>Math.cos(2*Math.PI*t))},{name:'P / Pcr = '+fmt(ratio),strong:true,dash:'',pts:points(0,2,t=>Math.cos(2*Math.PI*fr*t))}]});
    e.readout.textContent=ratio===1?'理想柱の限界で、この横方向に戻す接線剛性が0になります。ここから先の変形の大きさはこの式では決まりません。':'無荷重時の固有振動数を f₀ とすると、今は '+fmt(fr)+' 倍です。'+(ratio<0?'張力が横方向の復元力を増やします。':ratio>0?'軸方向の圧縮が横方向の復元力を弱めます。':'ここが無荷重の比較基準です。');
   }
  },
  thermalPair:{
   html:()=>box(ui.slider('temp','上の棒だけを温める　ΔT（K）',0,60,5,40),'同じ長さ500 mm・同じ断面と剛性の棒2本を並べます。左端は固定。右の剛な端板は回転せず水平に動け、軸方向の外力は0です。破線は各棒を単独にしたときの自由端、太い縦線はつないだときの端板です。伸びは拡大表示。'),
   draw(e,v){
    const t=Number(v.temp),free=500*12e-6*t,shared=free/2,stress=200000*12e-6*t/2,x0=216,end=x0+shared*290;
    e.out.temp.textContent=t;
    e.plot.innerHTML=svg('温度の違う二本の棒が同じ距離だけ伸びる',line(40,35,40,132)+rect(40,51,end-40,12,'el-fill')+rect(40,101,end-40,12,'el-soft')+line(end,41,end,124)+line(x0+free*290,40,x0+free*290,75,'el-ghost')+line(x0,89,x0,126,'el-ghost')+label(103,35,'ΔT = '+t+' K')+label(95,144,'ΔT = 0 K'),157);
    e.readout.textContent='上の棒の自由な伸び '+fmt(free,3)+' mm、つないだ両棒の伸び '+fmt(shared,3)+' mm。'+(t===0?'両方とも応力は0です。':'上の棒は自由な伸びを抑えられて圧縮 '+fmt(stress)+' MPa、下の棒は引き伸ばされて引張 '+fmt(stress)+' MPaです。');
   }
  },
  arch:{
   html:()=>box(ui.slider('u','山の頂点を下へ動かす量 u（mm）',0,20,.5,4),'同じ2本の軸材を三つのピンでつないだ浅い山形。半幅50 mm、初期高さ10 mm、各材のEA＝10,000 N。破線は最初の形。下向きを正とした頂点の変位と、その位置に静止させる外力の組をグラフ上の丸で追います。'),
   draw(e,v){
    const u=Number(v.u),Y=70+(u-10)*2.6,P=arch(u);
    e.out.u.textContent=u;
    e.plot.innerHTML=svg('浅い山形の変形',poly([[50,70],[180,44],[310,70]],'el-ghost')+poly([[50,70],[180,Y],[310,70]])+pin(50,70)+pin(310,70)+dot(180,Y)+(Math.abs(P)<1e-8?'':P>0?arrow(180,Y-32,180,Y-6):arrow(180,Y+32,180,Y+6)),132)+
     graphics.chart({id:'theory-arch',label:'頂点をその位置に保つ力と変位',x:[0,20],y:[-33,33],xt:[0,5,10,15,20],yt:[-30,0,30],xl:'u (mm)',yl:'P (N)',ph:110,series:[{pts:points(0,20,arch),strong:true}],marks:[[u,P]]});
    e.readout.textContent='u = '+u+' mm、保持力 P = '+fmt(P)+' N。'+(u===10?'軸材が水平なので、縮んでいても軸力の鉛直成分は0です。':u>10&&u<20?'反転した形をその位置に保つには、上向きの外力が要ります。':'丸は静止できる力と形の組です。力を増やしたとき実物が通る時刻歴はこの線からは決まりません。');
   }
  },
  yielding:{
   html:()=>box(ui.slider('c','断面の曲がり具合 κ／初降伏時 κy',0,4,.25,2),'一様な長方形断面の純曲げ。引張・圧縮で同じ降伏応力の弾完全塑性材を仮定します。中央の破線が中立軸。左は断面、しま模様が降伏した範囲。右は同じ高さでの軸応力です。'),
   draw(e,v){
    const c=Number(v.c),half=56,middle=82,elastic=c<=1?half:half/c,band=half-elastic;
    e.out.c.textContent=c;
    const fill=(y)=>rect(52,y,58,band,'el-soft')+Array.from({length:Math.floor(band/5)},(_,i)=>line(55,y+3+5*i,100,y+1+5*i)).join('');
    const stress=poly(points(-1,1,t=>Math.max(-1,Math.min(1,t*c))).map(([t,s])=>[240+52*s,middle-half*t]));
    e.plot.innerHTML=svg('矩形断面の降伏域と軸応力分布',rect(52,26,58,112,'el-fill')+(band>0?fill(26)+fill(middle+elastic):'')+line(34,middle,305,middle,'el-ghost')+line(240,20,240,142)+stress+label(188,160,'−σy')+label(240,160,'0')+label(292,160,'+σy'),175);
    e.readout.textContent='曲げモーメント M／My = '+fmt(sectionMoment(c),3)+'。'+(c<1?'全断面が弾性で、応力は中立軸からの距離に比例します。':c===1?'上下の最外縁が初めて降伏応力に届きます。断面内部にはまだ弾性域が残ります。':'外側の応力が頭打ちになり、さらに曲げると降伏域が内側へ広がります。この理想断面の極限は1.5 Myです。');
   }
  }
 };
 function connect(root){
  for(const fig of root.querySelectorAll('[data-analysis-theory-figure]'))ui.mount(fig,labs[fig.dataset.analysisTheoryFigure]);
 }
 window.AnalysisTheoryFigures={connect,labs};
})();
