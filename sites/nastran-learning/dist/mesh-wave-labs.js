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
 const labs = {
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
     html:()=>ui.box('jacMetric',ui.slider('det','右上の det J',-30,100,5,100),'黒丸は左下、白丸は右上です。白丸を通る方眼がどこでつぶれるかを見ます。'),
     draw(el,v){
       const det=Number(v.det), pinch=(1-det/100)/2;
       el.out.det.textContent=det+' mm²';
       const point=(u,w)=>[105+110*(u-pinch*u*w),143-110*(w-pinch*u*w)];
       let grid=line([[105,143],[215,143],[215,33],[105,33],[105,143]],'b2-ghost');
       for(let i=0;i<=6;i++){
         const t=i/6;
         grid+=line([point(0,t),point(1,t)],'b2-sec')+line([point(t,0),point(t,1)],'b2-sec');
       }
       const [x,y]=point(1,1);
       el.plot.innerHTML=svg('右上の面積倍率に対応する方眼の変化',grid+'<circle cx="105" cy="143" r="3" fill="currentColor"/><circle cx="'+x+'" cy="'+y+'" r="3.5" fill="white" stroke="currentColor" stroke-width="2"/>');
       const note=det<0?'右上の近くで方眼が折り返しました。':det===0?'右上で方眼の二方向が一直線に重なります。':det===100?'どこでも同じ広がりです。':'右上ほど方眼が狭くなります。';
       el.readout.textContent='det J（mm²）　左下 100 ／ 中央 '+fmt((100+det)/2)+' ／ 右上 '+det+'。'+note;
     }
   },
   shape: {
     html:()=>ui.box('shape',
       ui.slider('size','基準寸法',10,25,1,20)+ui.slider('aspect','幅／高さ',0.5,2,0.1,1)+
       ui.slider('skew','上辺の横ずれ',-10,10,1,0)+ui.slider('pinch','右上角の押し込み',0,65,1,0)+
       '<button type="button" data-lab-action="reset:shape">正方形に戻す</button>',
       '破線は最初の20 mm角、実線は現在の要素です。左下の黒丸、中央の十字、右上の白丸で、それぞれ同じ場所の方眼の広がりを読みます。'),
     action(el){for(const input of Object.values(el.inputs))input.value=input.defaultValue;},
     draw(el,v){
       const h=Number(v.size), b=h*Number(v.aspect), shift=Number(v.skew), p=Number(v.pinch)/100;
       el.out.size.textContent=h+' mm'; el.out.aspect.textContent=fmt(b/h);
       el.out.skew.textContent=shift+' mm'; el.out.pinch.textContent=v.pinch+' %';
       // First pull the corner towards the origin, then apply an area-preserving shear.
       const point=(u,w)=>{
         const uw=p*u*w, x=b*(u-uw)+shift*(w-uw), y=h*(w-uw);
         return [69+4.5*x,144-4.5*y];
       };
       let grid=line([[69,144],[159,144],[159,54],[69,54],[69,144]],'b2-ghost');
       for(let i=0;i<=6;i++){
         const t=i/6;
         grid+=line([point(t,0),point(t,1)],'b2-sec')+line([point(0,t),point(1,t)],'b2-sec');
       }
       const [ax,ay]=point(0,0),[mx,my]=point(.5,.5),[cx,cy]=point(1,1);
       grid+='<circle cx="'+ax+'" cy="'+ay+'" r="3.2" fill="currentColor"/>'+
         '<path d="M'+(mx-4)+' '+my+' h8 M'+mx+' '+(my-4)+' v8" stroke="currentColor" stroke-width="2"/>'+
         '<circle cx="'+cx+'" cy="'+cy+'" r="3.5" fill="white" stroke="currentColor" stroke-width="1.8"/>';
       el.plot.innerHTML=svg('4節点の平面要素。実線の方眼と三つの測定位置。',grid);
       const det0=b*h/4;
       const values=[det0,det0*(1-p),det0*(1-2*p)].map(fmt);
       const note=p>.5?'右上の近くで方眼が折り返しています。':p===.5?'右上で升目の面積倍率がゼロになりました。':p>0?'右上へ近づくほど升目が狭くなっています。':shift?'角度が変わっても、高さと底辺が同じなら升目の面積は変わりません。':'どの位置でも升目の面積は同じです。';
       el.readout.textContent='det J（mm²）　左下 '+values[0]+' ／ 中央 '+values[1]+' ／ 右上 '+values[2]+'。'+note;
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
