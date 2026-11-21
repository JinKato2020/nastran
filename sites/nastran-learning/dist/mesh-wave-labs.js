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
   shape: {
     html:()=>ui.box('shape',ui.select('corner','四角形の形',[['square','20 mmの正方形'],['small','全体を半分に縮小'],['pinch','右上の角を中心近くへ'],['fold','角を中心より内側へ']],'square'),
       '破線は元の外形、実線は形を変えた後の方眼です。右上の角と、その周りの升目を見てください。'),
     draw(el,v){
       const [side,corner]={square:[20,20],small:[10,10],pinch:[20,11],fold:[20,8]}[v.corner];
       // Bilinear four-node map of the unit square. Display det J on [-1,1]².
       const point=(u,w)=>[119+5.5*(side*u+(corner-side)*u*w),143-5.5*(side*w+(corner-side)*u*w)];
       let grid=line([[119,143],[229,143],[229,33],[119,33],[119,143]],'b2-ghost');
       for(let i=0;i<=4;i++){
         const t=i/4;
         grid+=line([point(t,0),point(t,1)],'b2-sec')+line([point(0,t),point(1,t)],'b2-sec');
       }
       const [x,y]=point(1,1);
       grid+='<circle cx="'+x+'" cy="'+y+'" r="3.4" fill="white" stroke="currentColor" stroke-width="1.8"/>';
       el.plot.innerHTML=svg('正方形の縮小と、右上の角の移動による方眼のつぶれ',grid);
       const observation={square:'升目はどこも同じ広さです。',small:'全体が相似に縮み、升目の形は保たれます。',pinch:'角の近くだけ升目が細くなります。',fold:'角の近くで内側の線が外形からはみ出し、写像が折り返します。'}[v.corner];
       el.readout.textContent=observation+' 左下と白丸の面積倍率（det J）は順に '+fmt(side*side/4)+'、'+fmt(side*(2*corner-side)/4)+' mm²。';
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
