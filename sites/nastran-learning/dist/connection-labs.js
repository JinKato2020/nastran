(() => {
 'use strict';
 // Independent analytic teaching experiments. No solver deck or MSC result is generated.
 const ui=window.BeamLabs.ui, graphics=window.BeamLabs.graphics;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=(x,n=4)=>Number.isFinite(x)?Number(x.toPrecision(n)).toLocaleString('en-US',{maximumFractionDigits:7}):'—';
 const text=(x,y,s,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}">${esc(s)}</text>`;
 const line=(a,b,c='el-edge')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${c}"/>`;
 const dot=(p)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" class="el-node"/>`;
 const path=(ps,c='el-edge')=>`<polyline points="${ps.map(p=>p.join(',')).join(' ')}" class="${c}"/>`;
 function arrow(a,b,c='el-force'){const dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.01)return '';const x=dx/len,y=dy/len,h=Math.min(8,len/2);return line(a,b,c)+`<polygon class="${c}-head" points="${b} ${b[0]-h*x+4*y},${b[1]-h*y-4*x} ${b[0]-h*x-4*y},${b[1]-h*y+4*x}"/>`;}
 function spring(a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return path([a,...Array.from({length:13},(_,i)=>{const t=.15+.7*i/12,d=i===0||i===12?0:i%2?6:-6;return [a[0]+dx*t-d*dy/l,a[1]+dy*t+d*dx/l];}),b]);}
 const ground=(x,y)=>line([x-22,y],[x+22,y])+[-2,-1,0,1,2].map(i=>line([x+i*9,y],[x+i*9-7,y+8])).join('');
 const svg=(body,label,h=230)=>`<svg class="theory-lab-svg" viewBox="0 0 360 ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;
 const layout=(c,caption)=>ui.box('',c,caption);
 const table=(h,r)=>window.LessonArticle.table(h,r,{narrow:true});
 const out=(el,v)=>Object.entries(v).forEach(([k,x])=>{if(el.out[k])el.out[k].textContent=fmt(Number(x));});
 const dotp=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),mv=(A,x)=>A.map(r=>dotp(r,x));
 function solve(A,b){const M=A.map((r,i)=>[...r,b[i]]);for(let j=0;j<b.length;j++){let p=j;for(let i=j+1;i<b.length;i++)if(Math.abs(M[i][j])>Math.abs(M[p][j]))p=i;[M[j],M[p]]=[M[p],M[j]];const d=M[j][j];if(Math.abs(d)<1e-12)throw Error('singular');M[j]=M[j].map(x=>x/d);for(let i=0;i<b.length;i++)if(i!==j){const t=M[i][j];M[i]=M[i].map((x,k)=>x-t*M[j][k]);}}return M.map(r=>r[b.length]);}
 const K3=[[100,-20,10],[-20,80,-10],[10,-10,60]], F3=[10,20,-10];
 const core={
  series:(kc,P=100,ka=1000,kb=1000)=>({a:P/ka,c:P/kc,b:P/kb,total:P/ka+P/kc+P/kb,share:(1/kc)/(1/ka+1/kc+1/kb)}),
  patch:(r,s,w)=>{const N=[(1-r)*(1-s),r*(1-s),r*s,(1-r)*s];return {N,w:dotp(N,w)};},
  cohesive:(A,dn,ds,kn=200,kt=100)=>({tn:kn*dn,ts:kt*ds,Fn:A*kn*dn,Fs:A*kt*ds,U:A*(kn*dn*dn+kt*ds*ds)/2}),
  rigid:(r,u,theta)=>[u[0]-theta*r[1],u[1]+theta*r[0]],
  distribute:(k1,k2,alpha,P=100,kind='average')=>{let u1,u2,f1,f2,ref;if(kind==='rigid'){ref=P/(k1+k2);u1=u2=ref;f1=k1*ref;f2=k2*ref;}else{f1=alpha*P;f2=(1-alpha)*P;u1=f1/k1;u2=f2/k2;ref=alpha*u1+(1-alpha)*u2;}return {u1,u2,f1,f2,ref,U:(f1*u1+f2*u2)/2};},
  coupled:(rho,ignore=false)=>{const c=ignore?0:rho*Math.sqrt(8000),K=[[100,c],[c,80]],det=8000-c*c,Z=[[80/det,-c/det],[-c/det,100/det]],u=mv(Z,[10,0]);return {K,Z,det,u,U:5*u[0]};},
  order:(perm,wrong=false)=>{const K=wrong?K3:perm.map(i=>perm.map(j=>K3[i][j])),F=perm.map(i=>F3[i]),q=solve(K,F),u=[0,0,0];perm.forEach((i,j)=>u[i]=q[j]);const lower=[];for(let j=0;j<3;j++)for(let i=j;i<3;i++)lower.push(K[i][j]);return {K,F,q,u,lower};},
  reference:(theta,delta,wrong=false)=>{const L=100,y=L*theta+delta,fy=200*(wrong?y:delta);return {y,elastic:delta,fy,fd:-fy,md:-L*fy};},
  solve,mv,K3,F3
 };
 const labs={
  'connector-compliance':{
   html:()=>layout(ui.select('kc','結合の剛性 kc（N/mm）',[[100,'100'],[1000,'1,000'],[10000,'10,000'],[100000,'100,000']],1000),'破線は荷重前、実線は荷重後。部材A・結合部c・部材Bを直列ばねで表した比較用のモデルです。変形は45倍。実際のCWELDやCFASTの内部定式化を再現したものではありません。'),
   draw(el,v){const r=core.series(+v.kc),base=[40,115,195,270],x=[40,115+45*r.a,195+45*(r.a+r.c),270+45*r.total];el.plot.innerHTML=svg(base.map(a=>line([a,90],[a,150],'el-ghost')).join('')+x.slice(0,3).map((a,i)=>spring([a,110],[x[i+1],110])+text((a+x[i+1])/2,77,['kA','kc','kB'][i])).join('')+x.map(a=>dot([a,110])).join('')+line([40,86],[40,142])+[-1,0,1,2].map(i=>line([40,92+12*i],[30,102+12*i])).join('')+arrow([x[3],110],[x[3]+30,110])+text(305,44,'P = 100 N')+text(180,189,'kA = kB = 1,000 N/mm'),'部材と結合部の変形分担',215);el.readout.innerHTML=`全体の伸び <strong>${fmt(r.total)} mm</strong>、結合部だけの伸び ${fmt(r.c)} mm（全体の${fmt(100*r.share,3)}%）。結合を100倍硬くしても、部材A・Bの伸び0.2 mmは残ります。`;}
  },
  'connector-patch':{
   html:()=>layout(ui.slider('r','結合位置 ξ（0〜1）',0,1,.05,.5)+ui.slider('s','結合位置 η（0〜1）',0,1,.05,.5)+ui.select('field','板の変位の形',[['tilt','傾いた平面'],['warp','1つの角だけ動く']],'tilt'),'長方形パッチの一般的な双一次補間。破線は変位前、青い面は変位後、点Pは結合位置です。変位の表示倍率は40倍。CWELDの探索範囲や個別の接続方式そのものは表していません。'),
   draw(el,v){out(el,v);const r=+v.r,s=+v.s,w=v.field==='tilt'?[0,.4,.6,.2]:[0,0,.6,0],q=core.patch(r,s,w),xy=[[0,0],[100,0],[100,70],[0,70]],ps=xy.map((p,i)=>[...p,w[i]*40]),P=[r*100,s*70,q.w*40],items=[{k:'line',p:[...xy,xy[0]].map(p=>[...p,0]),c:'b3-ghost'},...Array.from({length:16},(_,j)=>{const a=j%4/4,b=Math.floor(j/4)/4,p=[[a,b],[a+.25,b],[a+.25,b+.25],[a,b+.25]].map(([x,y])=>[100*x,70*y,core.patch(x,y,w).w*40]);return {k:'face',p,n:[0,0,1],rgb:[154,180,207],two:true,stroke:'#718aa1',sw:.6};}),...ps.flatMap((p,i)=>[{k:'dot',p:[p]},{k:'text',p:[p],s:String(i+1),dx:10,dy:-8}]),{k:'dot',p:[P]},{k:'text',p:[P],s:'P',dx:10,dy:-10},{k:'line',p:[[P[0],P[1],0],P],c:'b3-ghost'}];el.plot.innerHTML=graphics.render3d(items,{w:360,h:255,pad:48,cam:graphics.camera(-45,28),label:'パッチ内の結合位置と変位補間'});el.readout.innerHTML=`wP = ΣNi wi = <strong>${fmt(q.w)} mm</strong>。重み N1〜N4 = ${q.N.map(x=>fmt(x,3)).join(' / ')}（合計1）。${r===.5&&s===.5?'中央なので4点を等分に平均します。':'結合位置を動かすと重みが変わります。いつも単純平均ではありません。'}`;}
  },
  'connector-cohesive':{
   html:()=>layout(ui.slider('area','面積 A（mm²）',25,100,25,50)+ui.slider('dn','法線の開き δn（mm）',0,.05,.005,.02)+ui.slider('ds','接線のずれ δs（mm）',-.05,.05,.005,0),'青い下側を基準に、上側の面を開き・ずれに応じて移動します。破線は相対変位ゼロの面。開きとずれは400倍、面積の辺長は√Aに比例。記号nは法線、sは接線で、個別要素の軸番号ではありません。'),
   draw(el,v){out(el,v);const A=+v.area,dn=+v.dn,ds=+v.ds,r=core.cohesive(A,dn,ds),L=Math.sqrt(A)*6,base=[[0,0,0],[L,0,0],[L,L,0],[0,L,0]],top=base.map(([x,y,z])=>[x+ds*400,y,z+dn*400]),c=[L/2,L/2,0],ct=[c[0]+ds*400,c[1],dn*400],items=[{k:'face',p:base,n:[0,0,1],rgb:[130,161,190],two:true,stroke:'#496580'},{k:'line',p:[...base,base[0]],c:'b3-ghost'},{k:'face',p:top,n:[0,0,1],rgb:[184,206,215],two:true,stroke:'#496580'},...base.map((p,i)=>({k:'line',p:[p,top[i]],c:'b3-ghost'})),{k:'arrow',p:[ct,[ct[0],ct[1],ct[2]+28]],c:'b3-axis'},{k:'text',p:[[ct[0],ct[1],ct[2]+28]],s:'n',dx:8,dy:-5},{k:'arrow',p:[ct,[ct[0]+30,ct[1],ct[2]]],c:'b3-axis'},{k:'text',p:[[ct[0]+30,ct[1],ct[2]]],s:'s',dx:8,dy:-4}];el.plot.innerHTML=graphics.render3d(items,{w:360,h:260,pad:48,cam:graphics.camera(-48,25),label:'接着界面の開きとずれ'});el.readout.innerHTML=`kn = 200、ks = 100 N/mm³。<strong>tn = ${fmt(r.tn)} MPa、τ = ${fmt(r.ts)} MPa</strong>。界面全体の力は Fn = ${fmt(r.Fn)} N、Fs = ${fmt(r.Fs)} N。面積を変えても、同じ開きなら応力は変わらず合力だけが変わります。`;}
  },
  'rigid-rotation':{
   html:()=>layout(ui.slider('theta','GNの回転 θz（rad）',-.06,.06,.01,.04)+ui.slider('uy','GNの並進 uy（mm）',-1,1,.25,0)+ui.select('kind','変位の作り方',[['rigid','剛体運動：並進＋回転'],['equal','誤解の例：並進だけ同じ']],'rigid'),'GNは中央、GM1〜4は四隅。破線は変位前、実線は変位後（変位5倍）。RBE2の並進成分を説明する小回転の平面モデルです。CM=123でも、GMの並進にはGNの回転が寄与します。'),
   draw(el,v){out(el,v);const theta=+v.theta,uy=+v.uy,pts=[[-40,-25],[40,-25],[40,25],[-40,25]],map=p=>[180+2*p[0],120-2*p[1]],shift=p=>{const u=core.rigid(p,[0,uy],v.kind==='rigid'?theta:0);return map([p[0]+5*u[0],p[1]+5*u[1]]);},base=pts.map(map),next=pts.map(shift),gn=shift([0,0]);el.plot.innerHTML=svg(path([...base,base[0]],'el-ghost')+path([...next,next[0]])+next.map((p,i)=>line(gn,p)+dot(p)+text(p[0]+(i===0||i===3?-16:16),p[1]+(i<2?22:-12),String(i+1))).join('')+dot(gn)+text(gn[0],gn[1]-12,'GN')+arrow([37,201],[80,201],'el-axis')+text(93,205,'x')+arrow([37,201],[37,158],'el-axis')+text(37,147,'y'),'RBE2の剛体回転と並進');const u=core.rigid(pts[1],[0,uy],theta);el.readout.innerHTML=`GM2（r = 40, −25 mm）の正しい変位：<strong>ux = ${fmt(u[0])} mm、uy = ${fmt(u[1])} mm</strong>。${v.kind==='equal'?'図の誤解例は θ×r を落としたため、GNを回しても外周が回りません。':'各GMの変位は同じ値ではありません。同じ剛体運動に従うことが条件です。'}`;}
  },
  'rigid-distribution':{
   html:()=>layout(ui.select('kind','結合の条件',[['rigid','共通変位を強制（RBE2型）'],['average','平均変位を定義（RBE3型）']],'average')+ui.select('k2','2側の剛性 k2（N/mm）',[[100,'100'],[400,'400'],[1000,'1,000']],400)+ui.slider('alpha','1側の平均の重み α',.1,.9,.1,.5),'1方向だけの一般化した2自由度モデル。図の横位置は模式的で、回転・モーメントの釣合いは扱いません。上の線は拘束関係を表し、RBE3型では剛な板ではありません。実際のRBE3の3次元配分には節点の位置と成分も関係します。'),
   draw(el,v){out(el,v);const r=core.distribute(100,+v.k2,+v.alpha,100,v.kind),y1=90+r.u1*65,y2=90+r.u2*65,yr=55+r.ref*65;el.plot.innerHTML=svg(line([85,90],[275,90],'el-ghost')+spring([85,205],[85,y1])+spring([275,205],[275,y2])+ground(85,205)+ground(275,205)+line([85,y1],[180,yr])+line([180,yr],[275,y2])+[dot([85,y1]),dot([275,y2]),dot([180,yr])].join('')+text(65,165,'k1')+text(295,165,'k2')+text(68,y1-12,'u1')+text(292,y2-12,'u2')+arrow([180,yr-43],[180,yr])+text(180,yr-52,'P = 100 N'),'変位拘束と平均化の荷重分配',240);el.readout.innerHTML=`k1 = 100 N/mm。<strong>u1 = ${fmt(r.u1)}、u2 = ${fmt(r.u2)} mm</strong>、参照変位 = ${fmt(r.ref)} mm。支える力は f1 = ${fmt(r.f1)}、f2 = ${fmt(r.f2)} N（合計100 N）。${v.kind==='rigid'?'同じ変位を強制するため、硬い側ほど大きな力を受けます。重みαはこの条件では使いません。':'2点の変位差を許します。この1方向モデルでは重みαと1−αが力の配分になります。'}`;}
  },
  'rigid-dependency':{
   html:()=>layout(ui.select('mode','拘束の組合せ',[['good','AからBとCを決める'],['duplicate','Bを2回従属に指定'],['spc','従属BにもSPC'],['cycle','A→B→C→Aの循環']],'good'),'矢印は力ではなく「独立側から従属側へ変位を決める向き」。全点の同じ並進成分を扱います。末尾のSPC記号だけが地面への拘束です。'),
   draw(el,v){const ps={A:[70,90],B:[280,90],C:[180,195]},edges=v.mode==='cycle'?[['A','B'],['B','C'],['C','A']]:v.mode==='duplicate'?[['A','B'],['C','B']]:[['A','B'],['A','C']];el.plot.innerHTML=svg(edges.map(([a,b])=>{const p=ps[a],q=ps[b],d=Math.hypot(q[0]-p[0],q[1]-p[1]),u=[(q[0]-p[0])/d,(q[1]-p[1])/d];return arrow([p[0]+15*u[0],p[1]+15*u[1]],[q[0]-15*u[0],q[1]-15*u[1]],'el-axis');}).join('')+Object.entries(ps).map(([k,p])=>dot(p)+text(p[0],p[1]-19,k)).join('')+(v.mode==='spc'?line(ps.B,[280,130])+ground(280,130)+text(310,153,'SPC'):''),'独立自由度と従属自由度の衝突',235);const messages={good:'uB = uA、uC = uA。従属はBとCに1回ずつ。ただし全体を地面に支える条件は別です。これだけでは全体が移動できます。',duplicate:'uB = uA と uB = uC。Bの同じ成分を2つの要素で従属にしています。式が必ず数学的に重複するわけではありませんが、通常の従属自由度の割当規則に違反します。',spc:'uB = uA に加えて uB = 0。従属Bを直接SPCで消去しようとする衝突です。物理的にAを止める意図ならA側で支える、または拘束の構成を見直します。',cycle:'uB = uA、uC = uB、uA = uC。3本目は先の2本から導けるため独立な式は2本。閉じた輪の拘束を1本減らせるか、物理的な接続を確認します。'};el.readout.innerHTML=messages[v.mode];}
  },
  'genel-coupling':{
   html:()=>layout(ui.slider('rho','連成の係数 ρ',-.9,.9,.1,.5)+ui.select('kind','行列の扱い',[['full','連成項を含める'],['diagonal','誤解の例：連成項を捨てる']],'full'),'2つの並進自由度に対する独立した行列例。f = (10, 0) N、K11 = 100、K22 = 80 N/mm、K12 = K21 = ρ√(100×80)。各段の破線上の0から、緑の矢印の先までが変位です。横軸はmm。実在部品の試験結果ではありません。'),
   draw(el,v){out(el,v);const r=core.coupled(+v.rho,v.kind==='diagonal'),u=r.u;el.plot.innerHTML=svg(text(180,25,'f = (10, 0) N')+line([180,52],[180,205],'el-ghost')+[90,170].map((y,i)=>line([60,y],[300,y],'el-dimension')+[-.6,-.3,0,.3,.6].map(x=>line([180+200*x,y-4],[180+200*x,y+4],'el-dimension')).join('')+text(33,y+5,'u'+(i+1))+dot([180,y])+arrow([180,y],[180+200*u[i],y],'el-motion')+dot([180+200*u[i],y])+text(180+200*u[i],y-19,fmt(u[i],3))).join('')+[-.6,-.3,0,.3,.6].map(x=>text(180+200*x,222,String(x))).join('')+text(180,246,'u (mm)'),'連成項によって無荷重方向も変位する',265);el.readout.innerHTML=`<strong>u1 = ${fmt(u[0])}、u2 = ${fmt(u[1])} mm</strong>。det K = ${fmt(r.det)} (N/mm)²、ひずみエネルギー = ${fmt(r.U)} N·mm。${v.kind==='diagonal'?'連成を消すとu2はゼロになります。値の省略は別の物理モデルを作ります。':'f2 = 0でもu2 = 0とは限りません。|ρ|が1に近づくほど柔らかい変形の組合せが現れます。'}`;}
  },
  'genel-order':{
   html:()=>layout(ui.select('order','UIの並び',[['012','1 → 2 → 3'],['201','3 → 1 → 2']],'012')+ui.select('kind','行列の並べ替え',[['correct','行と列を両方そろえる'],['wrong','誤解の例：UI名だけ変える']],'correct'),'番号1〜3は、この独立例の物理的な並進自由度。色に頼らず行見出し・列見出しで対応を確認します。数値列はKの下三角を列ごとに読んだものです。'),
   draw(el,v){const p=[...v.order].map(Number),r=core.order(p,v.kind==='wrong');el.plot.innerHTML=table(['K (N/mm)',...p.map(i=>'u'+(i+1))],r.K.map((row,i)=>['f'+(p[i]+1),...row.map(x=>fmt(x))]))+table(['列ごとの下三角','1','2','3','4','5','6'],[['KZ',...r.lower.map(x=>fmt(x))]]);el.readout.innerHTML=`物理的な自由度の順に戻した変位：<strong>u1 = ${fmt(r.u[0])}、u2 = ${fmt(r.u[1])}、u3 = ${fmt(r.u[2])} mm</strong>。荷重は物理的な順で (10, 20, −10) N。${v.kind==='wrong'&&v.order!=='012'?'UI名だけを変えると、別の方向に別の剛性が入って答えが変わります。':'行・列・荷重の並びをそろえると、UIの順番を変えても物理的な答えは一致します。'}`;}
  },
  'genel-reference':{
   html:()=>layout(ui.slider('theta','部品全体の回転 θ（rad）',-.03,.03,.005,.02)+ui.slider('delta','弾性変位 δ（mm）',-.5,.5,.1,.2)+ui.select('kind','力を計算する変位',[['relative','ui − S ud'],['absolute','誤解の例：uiをそのまま使う']],'relative'),'破線は基準姿勢、薄い線は基準点と一緒に動く剛体姿勢、太い線は弾性変位を加えた姿勢。下段は剛体姿勢からの差δだけを拡大した図です（上下で倍率は異なります）。L = 100 mm、k = 200 N/mm。平面の3成分で式を説明する模式例であり、Sを省略できる6自由度の実入力例ではありません。'),
   draw(el,v){out(el,v);const theta=+v.theta,delta=+v.delta,r=core.reference(theta,delta,v.kind==='absolute'),A=[65,100],rigid=[290,100-theta*100*12],B=[290,100-r.y*12];el.plot.innerHTML=svg(line(A,[290,100],'el-ghost')+line(A,rigid,'el-dimension')+line(A,B)+dot(A)+dot(B)+arrow(rigid,B,'el-motion')+text(65,133,'ud')+text(316,B[1]+4,'ui')+text(180,155,'L = 100 mm')+text(180,25,'ui = Lθ + δ')+line([60,230],[300,230],'el-ghost')+line([90,230],[180,230],'el-dimension')+dot([180,230])+arrow([180,230],[180,230-delta*80],'el-motion')+dot([180,230-delta*80])+text(110,254,'S ud')+text(226,202,'δ = '+fmt(delta)+' mm')+text(235,254,'ui'),'剛体運動を差し引いた弾性変位',285);el.readout.innerHTML=`絶対変位 ui = ${fmt(r.y)} mm、弾性変位 δ = ${fmt(delta)} mm。<strong>fi = ${fmt(r.fy)} N</strong>、基準側 fd = ${fmt(r.fd)} N、Md = ${fmt(r.md)} N·mm。${v.kind==='absolute'?'この誤解例では、全体を回しただけで余分な力が生じます。':'δを保って全体を回しても、力は変わりません。基準側へは力だけでなくL×fiのモーメントも返ります。'}`;}
  }
 };
 function connect(root){for(const fig of root.querySelectorAll('figure[data-connection-lab]'))ui.mount(fig,labs[fig.dataset.connectionLab]);}
 window.ConnectionLabs={core,labs,connect};
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>connect(document));
})();
