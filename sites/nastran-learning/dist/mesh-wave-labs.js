(() => {
 'use strict';
 const ui = window.BeamLabs.ui;
 const svg = (label, body) => '<svg class="theory-lab-svg" viewBox="0 0 360 166" role="img" aria-label="'+label+'">'+body+'</svg>';
 const line = (points, cls) => '<polyline class="'+cls+'" style="fill:none" points="'+points.map(p=>p.join(',')).join(' ')+'"/>';
 const text = (x,y,s) => '<text class="b2-small" x="'+x+'" y="'+y+'">'+s+'</text>';
 const fmt = n => Number(n.toFixed(3)).toString();

 // One shared node per ring/sector. Outer-edge nodes are equally spaced on a square.
 function holeRings(divisions, bias) {
   const rings = [];
   const n = divisions / 4, outer = 48, radius = 15, layers = 6;
   for (let j=0; j<=layers; j++) {
     const t = bias===1 ? j/layers : (bias**j-1)/(bias**layers-1);
     const ring = [];
     for (let i=0; i<divisions; i++) {
       const side=Math.floor(i/n), q=2*(i%n)/n-1;
       const [sx,sy]=[[1,q],[-q,1],[-1,-q],[q,-1]][side];
       const angle=2*Math.PI*i/divisions-Math.PI/4;
       ring.push([(1-t)*radius*Math.cos(angle)+t*outer*sx,(1-t)*radius*Math.sin(angle)+t*outer*sy]);
     }
     rings.push(ring);
   }
   return rings;
 }
 // Both patches start as 4 mm squares in the same 20 mm element.
 function jacobianPlate(det,title,position){
   const tip=10*(1+det/100);
   // Corner coordinates in mm: (0,0), (20,0), (tip,tip), (0,20).
   const delta=tip-20;
   const point=(u,w)=>[14+5*(20*u+delta*u*w),116-5*(20*w+delta*u*w)];
   const square=(lo,hi)=>[[lo,lo],[hi,lo],[hi,hi],[lo,hi]].map(([u,w])=>point(u,w));
   const polygon=(lo,hi,style)=>'<polygon points="'+square(lo,hi).map(p=>p.join(',')).join(' ')+'" '+style+'/>';
   let marks=polygon(0,1,'fill="#edf3f7" stroke="#344f6e" stroke-width="1.8"');
   for(let i=1;i<5;i++){
     const t=i/5;
     marks+=line([point(0,t),point(1,t)],'b2-guide')+line([point(t,0),point(t,1)],'b2-guide');
   }
   marks+=polygon(.4,.6,'data-patch="center" fill="#98d5ba" stroke="#226448" stroke-width="1.6"')+
     polygon(.8,1,'data-patch="corner" fill="#ffd7a2" stroke="#8c490c" stroke-width="1.6"');
   const [mx,my]=point(.5,.5),[cx,cy]=point(1,1);
   marks+='<circle cx="'+mx+'" cy="'+my+'" r="2.5" fill="#21354b"/>'+
     '<circle cx="'+cx+'" cy="'+cy+'" r="3.2" fill="white" stroke="#21354b" stroke-width="1.5"/>';
   const u=(1+position/100)/2, w=u;
   const [px,py]=point(u,w);
   // det(d(x,y)/d(xi,eta)); u=(1+xi)/2 and w=(1+eta)/2.
   const measured=((20+delta*w)*(20+delta*u)-(delta*u)*(delta*w))/4;
   marks+='<path d="M'+mx+' '+my+' L'+cx+' '+cy+'" fill="none" stroke="#314d78" stroke-dasharray="2 2"/>'+
     '<rect data-probe x="'+(px-5)+'" y="'+(py-5)+'" width="10" height="10" fill="none" stroke="#143f91" stroke-width="2"/>';
   return '<div><span dir="auto">'+title+'</span><svg dir="ltr" viewBox="0 0 130 130" role="img" aria-label="'+title+'、四角い枠が選択中の測定点">'+marks+'</svg>'+
     '<span dir="ltr" data-probe-value>det J = '+fmt(measured)+' mm²</span></div>';
 }
 // Euler–Bernoulli cantilever eigenfunction, normalized to unit tip deflection.
 function bendingShape(x,mode){
   const b=[1.875104068712,4.694091132974,7.854757438238][mode-1];
   const ratio=(Math.cosh(b)+Math.cos(b))/(Math.sinh(b)+Math.sin(b));
   const amplitude=t=>Math.cosh(t)-Math.cos(t)-ratio*(Math.sinh(t)-Math.sin(t));
   return amplitude(b*x)/amplitude(b);
 }
 const labs = {
   peakStress: {
     html:()=>ui.box('peakStress',ui.select('size','要素の辺長 h',[['4','粗　4 mm'],['2','中　2 mm'],['1','細　1 mm']],'4'),
       '数値は変化の読み方を示す例示値です。▲と◇の位置、固定辺、荷重はすべての分割で共通です。'),
     draw(el,v){
       const h=Number(v.size);
       const [corner,away]={4:[210,116],2:[285,121],1:[390,122]}[h];
       const step=5*h; // 5 SVG units per millimetre.
       let grid='';
       for(let x=38+step;x<278;x+=step) grid+='M'+x+' 30v80 ';
       for(let y=30+step;y<110;y+=step) grid+='M38 '+y+'h240 ';
       let marks='<rect x="38" y="30" width="240" height="80" fill="#edf3f7" stroke="#344f65" stroke-width="2"/>'+
         '<path data-stress-grid d="'+grid+'" fill="none" stroke="#899faa" stroke-width=".7"/>';
       for(let y=30;y<=110;y+=10) marks+='<path d="M38 '+y+'l-8 6" stroke="#344f65"/>';
       for(const y of [47,73,99]) marks+='<path d="M280 '+y+'v-17m-4 5 4 -5 4 5" fill="none" stroke="#176a50" stroke-width="2.2"/>';
       marks+='<path d="M38 110h60" stroke="#914a18" stroke-width="2.2"/>'+
         '<path data-corner d="M38 103l7 12H31z" fill="#934910"/>'+
         '<path data-fixed-probe d="M98 103l7 7 -7 7 -7 -7z" stroke="#24394b" stroke-width="2" fill="white"/>'+
         '<text x="20" y="132">A</text><path d="M38 121v16m60 -16v16m-60 -5h60" stroke="#455c70" fill="none"/>'+
         '<text x="68" y="151" text-anchor="middle">12 mm</text>';
       el.plot.innerHTML=svg('左辺を固定した板。右辺に上向きの分布荷重を加え、下辺の角Aと12 mm離れた白いひし形で応力を読む。',marks);
       el.readout.innerHTML='長手方向の応力 σₓ<br>▲ 固定端の角A　<strong>'+corner+' MPa</strong><br>◇ Aから12 mm　<strong>'+away+' MPa</strong>';
     }
   },
   refinePlate: {
     html:()=>ui.box('refinePlate',ui.select('rows','板の分割',[['4','粗'],['8','中'],['16','細']],'4'),
       '左の斜線が固定辺、右の矢印が辺全体に加える上向き荷重です。●Pで長手方向の応力、○Qで上向き変位を読みます。'),
     draw(el,v){
       const rows=Number(v.rows), cols=3*rows;
       let drawing='<rect x="40" y="43" width="240" height="80" fill="#edf3f7" stroke="#334b63" stroke-width="2"/>';
       let grid='';
       for(let i=1;i<cols;i++) grid+='M'+(40+240*i/cols)+' 43v80 ';
       for(let j=1;j<rows;j++) grid+='M40 '+(43+80*j/rows)+'h240 ';
       drawing+='<path data-grid d="'+grid+'" fill="none" stroke="#67849c" stroke-width="0.75"/>';
       for(let y=43;y<=123;y+=10) drawing+=line([[40,y],[31,y+7]],'b2-sec');
       for(const y of [57,82,107]) drawing+='<path d="M288 '+(y+7)+'v-16 m-3 5 l3 -5 3 5" fill="none" stroke="#a35315" stroke-width="2"/>';
       drawing+='<circle data-observation="P" cx="160" cy="103" r="4" fill="#192d45" stroke="white"/>'+
         '<circle data-observation="Q" cx="280" cy="83" r="4" fill="white" stroke="#192d45" stroke-width="2"/>'+
         line([[160,108],[160,135]],'b2-sec')+text(156,151,'P')+text(298,86,'Q');
       el.plot.innerHTML=svg('同じ長方形の板と、固定した二つの観測位置',drawing);
       el.readout.textContent='長さ方向 '+cols+' × 高さ方向 '+rows+' ＝ '+cols*rows+' 要素。PとQの位置、固定辺、荷重を加える辺は共通です。';
     }
   },
   sampleMode: {
     html:()=>ui.box('sampleMode',ui.select('mode','比べる曲げモード',[['1','曲げ1次'],['2','曲げ2次'],['3','曲げ3次']],'3')+
       ui.select('parts','長さ方向の分割',[['2','2分割'],['4','4分割'],['8','8分割']],'2'),
       '破線は片持ち梁の理論形、実線は黒丸の値を直線で結んだ形です。白い◇は理論形が横のゼロ線を横切る内部の節です。右端の振幅を1にそろえています。'),
     draw(el,v){
       const mode=Number(v.mode), n=Number(v.parts);
       const point=x=>[35+285*x,91-55*bendingShape(x,mode)];
       const curve=Array.from({length:151},(_,i)=>point(i/150));
       const samples=Array.from({length:n+1},(_,i)=>point(i/n));
       let drawing='<path d="M30 91H329" stroke="#657381" stroke-dasharray="1 3"/>'+
         '<path d="M35 73v36 m0-30 -7 6 m7 2 -7 6 m7 2 -7 6" stroke="#405063" fill="none"/>'+
         line(samples,'b2-move')+
         '<polyline points="'+curve.map(p=>p.join(',')).join(' ')+'" fill="none" stroke="#a55423" stroke-width="2" stroke-dasharray="5 4"/>';
       for(const [x,y] of samples) drawing+='<circle cx="'+x+'" cy="'+y+'" r="3" fill="#22394e"/>';
       let internalNodes=0;
       for(let i=2;i<curve.length;i++){
         const [x1,y1]=curve[i-1],[x2,y2]=curve[i];
         if((y1-91)*(y2-91)>=0) continue;
         const x=x1+(x2-x1)*(91-y1)/(y2-y1);
         drawing+='<path data-mode-node d="M'+x+' 86l5 5 -5 5 -5 -5z" fill="white" stroke="#125849" stroke-width="1.8"/>';
         internalNodes++;
       }
       const sides=samples.slice(1).map(([,y])=>Math.sign(91-y)).filter(Boolean);
       const observed=sides.slice(1).filter((sign,i)=>sign!==sides[i]).length;
       el.plot.innerHTML=svg('固定端から自由端までの曲げモード形と、等間隔に読んだ変位',drawing);
       el.readout.textContent='● モデルの節点 '+(n+1)+'個 ／ ◇ 理論形の内部の節 '+internalNodes+'個。黒丸を結んだ実線が途中でゼロを横切る回数は'+observed+'回です。';
     }
   },
   midpoint: {
     html:()=>ui.box('midpoint',ui.select('profile','比べる変形',[
       ['local','途中で変位の増え方が変わる'],['linear','変位が直線的に増える']
     ],'local'),
       '両図とも10は動かず、30は右に2 mm動きます。破線は変形後の10と30を結ぶ直線、緑の実線は板の境目です。左の黒丸と右の白いひし形が節点20です。'),
     draw(el,v){
       const linear=v.profile==='linear';
       el.plot.innerHTML=window.MeshFeatureFigures.compareMidpoint(linear?1:1.5);
       el.readout.textContent=linear?'両端が0・2 mmで、途中の変位が直線的に増えれば、中点は両方式とも1 mmです。':
        '左図の1.5 mmは、共有節点で表せる変形の一例として仮定した値です。右図では、同じ両端変位を与えると、20は拘束式により必ず1 mm動きます。';
     }
   },
   hanging: {
     html:()=>ui.box('hanging',ui.select('connection','20・40のつなぎ方',[['mpc','MPCで両端から補間'],['none','つながない'],['one','上の端だけに合わせる']],'mpc')+
       ui.select('motion','10・30・50の右向き変位',[['gradient','順に 0・2・4 mm'],['together','すべて 2 mm'],['rest','すべて 0 mm']],'gradient'),
       '破線は元の境目、黒丸の10・30・50は共有節点です。白いひし形の20・40が、動いた後の粗い辺に乗るかを見比べてください。動きを拡大した模式図です。「つながない」場合は、許される動きの一例として20・40を元の位置に描いています。'),
     draw(el,v){
       const ends={gradient:[0,2,4],together:[2,2,2],rest:[0,0,0]}[v.motion];
       const [u10,u30,u50]=ends;
       const mid=[(u10+u30)/2,(u30+u50)/2];
       const [u20,u40]={mpc:mid,none:[0,0],one:[u10,u30]}[v.connection];
       const gap=Math.abs(u20-mid[0]);
       const readings='節点20は '+u20+' mm、節点40は '+u40+' mm。';
       let observation='節点20と粗い辺の中点のずれは '+gap+' mm。';
       if(v.connection==='mpc')observation+='両方の辺が全長で重なります。';
       else if(!gap)observation+='今は位置が合っています。「順に 0・2・4 mm」にすると違いが現れます。';
       else observation+='動いた粗い辺と、細かい側の間にすきまが見えます。';
       el.plot.innerHTML=window.MeshFeatureFigures.edgeConnection([u10,u20,u30,u40,u50],ends,readings+observation);
       el.readout.textContent=readings+observation;
     }
   },
   hole: {
     html:()=>ui.box('hole',ui.select('n','円周の分割数',[['16','16'],['32','32'],['48','48']],'16')+
       ui.select('bias','径方向の間隔',[['1','均等'],['1.3','外へ1.3倍ずつ']],'1.3'),
       'まず円周を16分割から48分割に変え、穴の輪郭を見比べてください。太枠が四角形要素1個、四隅の白丸がその節点です。上下の黒丸は、分割を変えても同じ場所で応力を読むための印です。'),
     draw(el,v) {
       const n=Number(v.n), rows=holeRings(n,Number(v.bias));
       const xy=([x,y])=>[180+1.34*x,83-1.34*y];
       let edges='';
       for(const row of rows) edges+=line([...row,row[0]].map(xy),'b2-sec');
       for(let i=0;i<n;i++) edges+=line(rows.map(row=>xy(row[i])),'b2-sec');
       for(const side of [-1,1]){
         const columns=[48,62,78,96].map(x=>side*x);
         for(let j=0;j<=n/4;j++){
           const y=-48+j*96/(n/4);
           edges+=line(columns.map(x=>xy([x,y])),'b2-sec');
         }
         for(const x of columns.slice(1)) edges+=line([xy([x,-48]),xy([x,48])],'b2-sec');
         for(const y of [55,83,111]){
           const x=180+side*133,end=x+side*17;
           edges+=line([[x,y],[end,y],[end-side*4,y-3]],'b2-move')+line([[end,y],[end-side*4,y+3]],'b2-move');
         }
         edges+='<circle fill="currentColor" cx="180" cy="'+xy([0,side*15])[1]+'" r="2.8"/>';
       }
       // Mark an outer cell so that even the finest mesh leaves room for the four nodes.
       const i=n/8, cell=[rows[4][i],rows[5][i],rows[5][i+1],rows[4][i+1]].map(xy);
       edges+='<g stroke="currentColor" stroke-width="2"><polygon fill="currentColor" fill-opacity=".14" points="'+cell.map(p=>p.join(',')).join(' ')+'"/>'+cell.map(([x,y])=>'<circle fill="white" stroke-width="1.2" cx="'+x+'" cy="'+y+'" r="1.8"/>').join('')+'</g>';
       el.plot.innerHTML=svg('円孔板を左右に引く。穴を囲む四角形のうち1個と、その4節点を強調',edges);
       const at=n/8;
       el.readout.textContent='半径15 mmの穴を '+n+' 本の直線で囲んでいます。1辺の長さ '+fmt(30*Math.sin(Math.PI/n))+' mm。穴の右端で測った第1層の幅 '+fmt(rows[1][at][0]-15)+' mm。';
     }
   },
   aspectMetric: {
     html:()=>ui.box('aspectMetric',ui.slider('ratio','アスペクト比',1,3,.1,1),'高さは20 mmで一定です。破線は最初の正方形です。'),
     draw(el,v){
       const ratio=Number(v.ratio), width=20*ratio, right=60+4*width;
       el.out.ratio.textContent=fmt(ratio);
       const outline=line([[60,120],[right,120],[right,40],[60,40],[60,120]],'b2-sec');
       el.plot.innerHTML=svg('長方形の横と縦の長さ',outline+line([[140,40],[140,120]],'b2-ghost')+
         text((60+right)/2-14,141,fmt(width)+' mm')+text(10,83,'20 mm'));
       el.readout.textContent='長い辺 '+fmt(width)+' mm ÷ 短い辺 20 mm ＝ '+fmt(ratio)+'（単位なし）。';
     }
   },
   skewMetric: {
     html:()=>ui.box('skewMetric',ui.slider('angle','スキュー角',0,45,1,0),'破線は直角の基準線、円弧はそこから傾いた角度です。'),
     draw(el,v){
       const angle=Number(v.angle), radians=angle*Math.PI/180, shift=20*Math.tan(radians);
       el.out.angle.textContent=angle+'°';
       const dx=4.5*shift, endX=85+25*Math.sin(radians), endY=130-25*Math.cos(radians);
       const outline=line([[85,130],[175,130],[175+dx,40],[85+dx,40],[85,130]],'b2-sec');
       const arc='<path d="M85 105 A25 25 0 0 1 '+endX+' '+endY+'" fill="none" stroke="#196548" stroke-width="2"/>';
       el.plot.innerHTML=svg('平行四辺形の左辺と直角の基準線',outline+line([[85,130],[85,30]],'b2-ghost')+arc+text(39,100,angle+'°'));
       el.readout.textContent='左下の内角 '+(90-angle)+'°。直角からのずれは 90° − '+(90-angle)+'° ＝ '+angle+'°。上辺の横移動は '+fmt(shift)+' mm。';
     }
   },
   jacMetric: {
     html:()=>ui.box('jacMetric',ui.slider('det','右上の det J',-30,100,5,0)+ui.slider('probe','調べる場所',0,100,5,0),
       '□がいま値を読む位置です。●は元の方眼の中央、○は右上の節点。左右の図で同じ方眼上の位置を測ります。'),
     draw(el,v){
       const det=Number(v.det), center=(100+det)/2;
       const position=Number(v.probe);
       const probeLabel=position===0?'中央':position===100?'右上':position+' %';
       el.out.probe.textContent=probeLabel;
       el.inputs.probe.setAttribute('aria-valuetext',probeLabel);
       el.out.det.textContent=det+' mm²';
       el.plot.innerHTML='<div class="mesh-feature-pair">'+jacobianPlate(100,'元の板',position)+jacobianPlate(det,'今の板',position)+'</div>';
       const note=det<0?'白丸の近くで方眼が折り返しています。':det===0?'白丸から隣の二節点へたどると、両方とも同じ直線の上にあります。':det===100?'まだ押し込んでいないので、左右の図は同じです。':'白丸に近い印のほうが細くなります。';
       el.readout.textContent='点ごとの det J（mm²）　● 中央（測定点） '+fmt(center)+' ／ ○ 右上（節点） '+det+'。'+note;
     }
   },
   warp: {
     html:()=>ui.box('warp',ui.slider('angle','反り角',0,40,1,0),
       '20 mm角の板を斜めから見た図です。測定用に対角線を一本引き、その両側の三角形に薄く色を付けています。白丸が持ち上がる節点です。'),
     draw(el,v){
       const angle=Number(v.angle), lift=20/Math.sqrt(2)*Math.tan(angle*Math.PI/180);
       el.out.angle.textContent=angle+'°';
       const a=[68,138], b=[214,113], c=[286,64-4.4*lift], d=[140,89];
       const face=(pts,color)=>'<polygon points="'+pts.map(q=>q.join(',')).join(' ')+'" fill="'+color+'" stroke="#38576c"/>';
       const grid=face([a,b,d],'#deecf6')+face([b,c,d],'#d9eee3')+line([b,d],'b2-sec')+line([[286,64],c],'b2-ghost');
       el.plot.innerHTML=svg('反り角を測る二つの三角形と共有する対角線',grid+'<circle cx="'+c[0]+'" cy="'+c[1]+'" r="3.5" fill="white" stroke="currentColor" stroke-width="1.8"/>');
       el.readout.textContent='二つの面の傾きの差 '+angle+'°。白丸の元の平面からの高さ '+fmt(lift)+' mm。';
     }
   },
   reflect: {
     html:()=>ui.box('reflect',ui.select('end','境界条件',[['fixed','固定端'],['free','自由端'],['match','整合した粘性境界'],['half','係数が適正値の半分']],'fixed'),
       '境界の手前の観測点で読む粒子速度。左の破線が境界へ進むパルス、右の実線が戻るパルス。均質な媒質の垂直入射を仮定した理論波形です。'),
     draw(el,v){
       const ratio={fixed:-1,free:1,match:0,half:1/3}[v.end];
       const curve=(center,amplitude)=>Array.from({length:91},(_,i)=>{
         const t=center-15+i/3;
         return [38+2.75*t,78-45*amplitude*Math.exp(-.5*((t-center)/3.5)**2)];
       });
       el.plot.innerHTML=svg('観測点の速度波形。条件によって戻り波の符号と大きさが変わる',
         line([[32,18],[32,135]],'b2-guide')+line([[32,78],[338,78]],'b2-guide')+
         line(curve(20,1),'b2-ghost')+line(curve(80,ratio),'b2-move')+
         text(8,19,'v')+text(77,151,'20 ms')+text(242,151,'80 ms')+text(335,95,'t'));
       el.readout.textContent='速度振幅の反射係数 '+fmt(ratio)+'。戻るエネルギーの割合 '+fmt(100*ratio**2)+' %。波速200 m/s、境界まで6 mで往復60 ms。';
     }
   }
 };
 function connect(root) {
   for(const fig of root.querySelectorAll('[data-mesh-wave-lab]')) ui.mount(fig,labs[fig.dataset.meshWaveLab]);
 }
 window.MeshWaveLabs={connect,holeRings};
})();
