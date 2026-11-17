(() => {
 'use strict';
 /* 梁要素の記事の動く図。数値はすべてこのファイル内の梁理論の式と小さな有限要素計算で、MSC Nastran の出力ではありません。 */
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fx=(v,d=0)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
 const sg=(v,d=3)=>{if(!isFinite(v))return '—';if(v===0)return '0';const p=Number(v.toPrecision(d));return fx(p,Math.min(6,Math.max(0,d-1-Math.floor(Math.log10(Math.abs(p))))));};
 const signed=(v,d=2)=>(v<0?'−':'+')+fx(Math.abs(v),d);
 const E=205000,NU=0.3,G=E/(2*(1+NU)),DEG=Math.PI/180;

 /* ---------- 小さな線形代数 ---------- */
 function solve(A,b){const n=b.length,M=A.map((r,i)=>[...r,b[i]]);let big=0;for(let i=0;i<n;i++)big=Math.max(big,Math.abs(A[i][i]));
  for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(M[r][c])>Math.abs(M[p][c]))p=r;
   if(Math.abs(M[p][c])<=1e-12*big)return null;[M[c],M[p]]=[M[p],M[c]];
   for(let r=c+1;r<n;r++){const f=M[r][c]/M[c][c];if(f)for(let k=c;k<=n;k++)M[r][k]-=f*M[c][k];}}
  const x=Array(n).fill(0);for(let i=n-1;i>=0;i--){let s=M[i][n];for(let k=i+1;k<n;k++)s-=M[i][k]*x[k];x[i]=s/M[i][i];}return x;}
 function jacobi(S){const n=S.length,A=S.map(r=>r.slice()),V=A.map((_,i)=>A.map((__,j)=>i===j?1:0));
  for(let sweep=0;sweep<80;sweep++){let off=0,dg=0;for(let i=0;i<n;i++){dg+=A[i][i]**2;for(let j=i+1;j<n;j++)off+=A[i][j]**2;}if(off<=1e-24*dg)break;
   for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){if(A[p][q]===0)continue;const th=(A[q][q]-A[p][p])/(2*A[p][q]),t=(th>=0?1:-1)/(Math.abs(th)+Math.sqrt(th*th+1)),c=1/Math.sqrt(t*t+1),s=t*c;
    for(let k=0;k<n;k++){const a=A[k][p],b=A[k][q];A[k][p]=c*a-s*b;A[k][q]=s*a+c*b;}
    for(let k=0;k<n;k++){const a=A[p][k],b=A[q][k];A[p][k]=c*a-s*b;A[q][k]=s*a+c*b;}
    for(let k=0;k<n;k++){const a=V[k][p],b=V[k][q];V[k][p]=c*a-s*b;V[k][q]=s*a+c*b;}}}
  return A.map((r,i)=>({val:r[i],vec:V.map(row=>row[i])})).sort((a,b)=>a.val-b.val);}
 function cholesky(M){const n=M.length,L=M.map(()=>Array(n).fill(0));for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let s=M[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];L[i][j]=i===j?Math.sqrt(s):s/L[j][j];}return L;}
 const fwd=(L,b)=>{const y=[];for(let i=0;i<b.length;i++){let s=b[i];for(let k=0;k<i;k++)s-=L[i][k]*y[k];y.push(s/L[i][i]);}return y;};
 const bwdT=(L,y)=>{const n=y.length,x=Array(n);for(let i=n-1;i>=0;i--){let s=y[i];for(let k=i+1;k<n;k++)s-=L[k][i]*x[k];x[i]=s/L[i][i];}return x;};
 const zeros=n=>Array.from({length:n},()=>Array(n).fill(0));

 /* ---------- 断面 ---------- */
 // poly は [y（幅方向）, z（高さ方向）]、反時計回り。Is は高さ方向に曲げるときの I、Iw は幅方向に曲げるときの I。
 const rect=(b,h)=>({A:b*h,Is:b*h**3/12,Iw:h*b**3/12,cs:h/2,cw:b/2,dim:Math.max(b,h),poly:[[-b/2,-h/2],[b/2,-h/2],[b/2,h/2],[-b/2,h/2]]});
 function hsec(h,b,tw,tf){const hw=h-2*tf,y1=b/2,y2=tw/2,z1=h/2,z2=h/2-tf,If=tf*b**3/12;
  return {A:2*b*tf+hw*tw,Aw:hw*tw,Is:(b*h**3-(b-tw)*hw**3)/12,Iw:2*If+hw*tw**3/12,J:(2*b*tf**3+hw*tw**3)/3,Cw:2*If*(h-tf)**2/4,cs:h/2,cw:b/2,dim:h,
   poly:[[-y1,-z1],[y1,-z1],[y1,-z2],[y2,-z2],[y2,z2],[y1,z2],[y1,z1],[-y1,z1],[-y1,z2],[-y2,z2],[-y2,-z2],[-y1,-z2]]};}
 function boxsec(B,t){const o=B/2,i=B/2-t,I=(B**4-(B-2*t)**4)/12;return {A:B*B-(B-2*t)**2,Is:I,Iw:I,cs:o,cw:o,dim:B,poly:[[-o,-o],[o,-o],[o,o],[-o,o]],hole:[[-i,-i],[i,-i],[i,i],[-i,i]]};}
 const H300=hsec(300,150,6.5,9);
 // 薄肉I形断面のせん断係数（Cowper の式）。PBARL が断面から計算する K の目安として使う。
 function cowperI(h,b,tw,tf){const m=2*b*tf/(h*tw),n=b/h,v=NU;
  return 10*(1+v)*(1+3*m)**2/((12+72*m+150*m*m+90*m**3)+v*(11+66*m+135*m*m+90*m**3)+30*n*n*(m+m*m)+5*v*n*n*(8*m+9*m*m));}

 /* ---------- 3次元の簡易描画（正射影・面の明暗・奥から順に塗る） ---------- */
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
 const unit=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];};
 function camera(az=-50,el=24){const a=az*DEG,e=el*DEG;return {r:[-Math.sin(a),Math.cos(a),0],u:[-Math.sin(e)*Math.cos(a),-Math.sin(e)*Math.sin(a),Math.cos(e)],d:[Math.cos(e)*Math.cos(a),Math.cos(e)*Math.sin(a),Math.sin(e)]};}
 const LIGHT=unit([0.35,-0.5,0.8]);
 const shade=(rgb,n)=>{const k=Math.min(1.08,0.48+0.62*Math.max(0,dot(n,LIGHT)));return `rgb(${rgb.map(v=>Math.round(Math.min(255,v*k))).join(',')})`;};
 function render3d(items,{w=360,h=220,cam=camera(),pad=18,label='',cls='beam-3d'}={}){
  const P=v=>[dot(v,cam.r),-dot(v,cam.u)];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const it of items)if(!it.nofit)for(const p of it.p){const q=P(p);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
  const s=Math.min((w-2*pad)/((x1-x0)||1),(h-2*pad)/((y1-y0)||1)),ox=(w-(x1-x0)*s)/2-x0*s,oy=(h-(y1-y0)*s)/2-y0*s;
  const S=p=>{const q=P(p);return [ox+q[0]*s,oy+q[1]*s];},F=v=>v.toFixed(1),pts=ps=>ps.map(p=>S(p).map(F).join(',')).join(' ');
  const back=[],faces=[],front=[];
  for(const it of items){if(it.k==='face'){if(!it.two&&it.n&&dot(it.n,cam.d)<=1e-6)continue;const c=it.p.reduce((a,p)=>[a[0]+p[0],a[1]+p[1],a[2]+p[2]],[0,0,0]);faces.push({it,z:dot(c,cam.d)/it.p.length+(it.bias||0)});}else(it.back?back:front).push(it);}
  faces.sort((a,b)=>a.z-b.z);
  const draw=it=>{
   if(it.k==='face'){const f=it.fill||shade(it.rgb,it.n);return `<polygon points="${pts(it.p)}" fill="${f}" stroke="${it.stroke||f}" stroke-width="${it.sw||0.7}"${it.op?` fill-opacity="${it.op}"`:''}/>`;}
   if(it.k==='poly')return `<polygon points="${pts(it.p)}" class="${it.c}"/>`;
   if(it.k==='line')return `<polyline points="${pts(it.p)}" class="${it.c}"/>`;
   if(it.k==='arrow'){const [a,b]=it.p.map(S),dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,hl=Math.min(10,l*0.5),hw=hl*0.42;
    return `<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(b[0]-ux*hl*0.7)}" y2="${F(b[1]-uy*hl*0.7)}" class="${it.c}"/><polygon points="${F(b[0])},${F(b[1])} ${F(b[0]-ux*hl-uy*hw)},${F(b[1]-uy*hl+ux*hw)} ${F(b[0]-ux*hl+uy*hw)},${F(b[1]-uy*hl-ux*hw)}" class="${it.c}-head"/>`;}
   if(it.k==='text'){const [x,y]=S(it.p[0]);return `<text x="${F(x+(it.dx||0))}" y="${F(y+(it.dy||0))}" class="${it.c||''}" text-anchor="${it.a||'start'}">${esc(it.s)}</text>`;}
   if(it.k==='dot'){const [x,y]=S(it.p[0]);return `<circle cx="${F(x)}" cy="${F(y)}" r="${it.r||4}" class="${it.c}"/>`;}
   return '';};
  return `<svg class="${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${back.map(draw).join('')}${faces.map(f=>draw(f.it)).join('')}${front.map(draw).join('')}</svg>`;
 }
 // 断面を中心線に沿って押し出す。center(x)=[Y,Z] の変位、rot(x)=x軸まわりの回転、slope(x)=[dY/dx, dZ/dx]
 function extrude(sec,{L,n=24,ds,center=()=>[0,0],rot=()=>0,slope=()=>[0,0],rgb=[150,178,206]}){
  const poly=sec.poly.map(([y,z])=>[y*ds,z*ds]),m=poly.length,st=[],ang=[];
  const place=(x,y,z)=>{const [cy,cz]=center(x),a=rot(x),c=Math.cos(a),s=Math.sin(a),[sy,sz]=slope(x),Y=y*c-z*s,Z=y*s+z*c;return [x-Y*sy-Z*sz,cy+Y,cz+Z];};
  for(let i=0;i<=n;i++){const x=L*i/n;ang.push(rot(x));st.push(poly.map(([y,z])=>place(x,y,z)));}
  const n2=poly.map((p,j)=>{const q=poly[(j+1)%m];return unit([0,q[1]-p[1],-(q[0]-p[0])]);}),items=[];
  for(let i=0;i<n;i++){const a=(ang[i]+ang[i+1])/2,c=Math.cos(a),s=Math.sin(a);
   for(let j=0;j<m;j++){const k=(j+1)%m,ny=n2[j][1],nz=n2[j][2];items.push({k:'face',p:[st[i][j],st[i][k],st[i+1][k],st[i+1][j]],n:[0,ny*c-nz*s,ny*s+nz*c],rgb});}}
  items.push({k:'face',p:st[n],n:[1,0,0],rgb,stroke:'#3c5570',sw:1,bias:0.01});
  items.push({k:'face',p:st[0].slice().reverse(),n:[-1,0,0],rgb});
  if(sec.hole)items.push({k:'face',p:sec.hole.map(([y,z])=>place(L+1e-3,y*ds,z*ds)),n:[1,0,0],fill:'#eef2f6',stroke:'#3c5570',sw:0.9,bias:0.02});
  return {items,st,place};
 }
 const wall=(Y,Z)=>({k:'poly',back:true,c:'b3-wall',p:[[0,-Y,-Z],[0,Y,-Z],[0,Y,Z],[0,-Y,Z]]});

 /* ---------- 2次元のグラフ ---------- */
 const DASH=['','7 4','2 4','10 4 2 4'];
 function chart(o){
  const named=o.legend?o.series.filter(s=>s.name):[],rows=Math.ceil(named.length/2),w=360,L=54,R=12,T=14,B=38,ph=o.ph||170,pw=w-L-R,h=T+ph+B+rows*18;
  const tx=v=>L+pw*(v-o.x[0])/(o.x[1]-o.x[0]),ty=v=>T+ph*(1-Math.min(1.04,Math.max(-0.04,(v-o.y[0])/(o.y[1]-o.y[0]))));
  let s=`<svg class="theory-lab-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label)}"><defs><clipPath id="bl-clip-${o.id}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs><rect x="${L}" y="${T}" width="${pw}" height="${ph}" class="lab-frame"/>`;
  for(const v of o.xt){const x=tx(v);s+=`<line x1="${x}" y1="${T}" x2="${x}" y2="${T+ph}" class="lab-grid"/><text x="${x}" y="${T+ph+15}" text-anchor="middle">${o.xf?o.xf(v):v}</text>`;}
  for(const v of o.yt){const y=ty(v);s+=`<line x1="${L}" y1="${y}" x2="${L+pw}" y2="${y}" class="lab-grid"/><text x="${L-5}" y="${y+4}" text-anchor="end">${o.yf?o.yf(v):v}</text>`;}
  s+=`<text x="${L+pw/2}" y="${T+ph+B-4}" text-anchor="middle">${esc(o.xl)}</text><text x="13" y="${T+ph/2}" text-anchor="middle" transform="rotate(-90 13 ${T+ph/2})">${esc(o.yl)}</text><g clip-path="url(#bl-clip-${o.id})">`;
  for(const [i,ser] of o.series.entries())s+=`<polyline class="lab-line${ser.strong?' strong':''}" stroke-dasharray="${ser.dash??DASH[i%4]}" points="${ser.pts.map(([x,y])=>tx(x).toFixed(1)+','+ty(y).toFixed(1)).join(' ')}"/>`;
  for(const [x,y] of o.marks||[])s+=`<circle cx="${tx(x).toFixed(1)}" cy="${ty(y).toFixed(1)}" r="4.5" class="lab-mark"/>`;
  for(const [x,y] of o.dots||[])s+=`<circle cx="${tx(x).toFixed(1)}" cy="${ty(y).toFixed(1)}" r="3" class="bl-node"/>`;
  s+='</g>';
  if(o.legend){let n=0;for(const [i,ser] of o.series.entries()){if(!ser.name)continue;const lx=L+(n%2)*150,ly=T+ph+B+12+Math.floor(n/2)*18;s+=`<line x1="${lx}" y1="${ly-4}" x2="${lx+26}" y2="${ly-4}" class="lab-line${ser.strong?' strong':''}" stroke-dasharray="${ser.dash??DASH[i%4]}"/><text x="${lx+31}" y="${ly}">${esc(ser.name)}</text>`;n++;}}
  return s+'</svg>';
 }
 const range=(a,b,n)=>Array.from({length:n},(_,i)=>a+(b-a)*i/(n-1));
 function ticks(max,count=5){const raw=max/count,p=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(k=>k*p).find(v=>v>=raw);return {step,top:Math.ceil(max/step-1e-9)*step,list:range(0,Math.ceil(max/step-1e-9)*step,Math.round(Math.ceil(max/step-1e-9))+1)};}

 /* ================= 1. 要素数と質量（片持ち梁） ================= */
 const BETA=[1.875104069,4.694091133,7.854757438];
 const MESH={L:1000,b:20,E,rho:7.85e-9,P:10};
 MESH.I=MESH.b**4/12;MESH.m=MESH.rho*MESH.b*MESH.b;MESH.scale=Math.sqrt(E*MESH.I/(MESH.m*MESH.L**4))/(2*Math.PI);
 function cantilever(N,coupled){ // EI = m = L = 1 の無次元で組み立てる
  const l=1/N,n=2*N,K=zeros(n),M=zeros(n);
  const ke=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]].map(r=>r.map(v=>v/l**3));
  const mc=[[156,22*l,54,-13*l],[22*l,4*l*l,13*l,-3*l*l],[54,13*l,156,-22*l],[-13*l,-3*l*l,-22*l,4*l*l]].map(r=>r.map(v=>v*l/420));
  for(let e=0;e<N;e++){const d=[2*e-2,2*e-1,2*e,2*e+1];
   for(let a=0;a<4;a++)for(let b=0;b<4;b++)if(d[a]>=0&&d[b]>=0){K[d[a]][d[b]]+=ke[a][b];if(coupled)M[d[a]][d[b]]+=mc[a][b];}
   if(!coupled)for(const nd of [e,e+1])if(nd>0)M[2*nd-2][2*nd-2]+=l/2;}
  const F=Array(n).fill(0);F[n-2]=1;const tip=solve(K,F)[n-2];
  let modes=[];
  if(coupled){const L=cholesky(M),Bc=K.map(row=>fwd(L,row)),Bm=Bc[0].map((_,i)=>Bc.map(r=>r[i])),A=Bm.map(row=>fwd(L,row));
   for(let i=0;i<n;i++)for(let j=0;j<i;j++)A[i][j]=A[j][i]=(A[i][j]+A[j][i])/2;
   modes=jacobi(A).map(({val,vec})=>({w:Math.sqrt(Math.max(val,0)),x:bwdT(L,vec)}));}
  else{const t=[],r=[];for(let i=0;i<n;i++)(i%2?r:t).push(i);
   const Krr=r.map(i=>r.map(j=>K[i][j])),X=t.map(j=>solve(Krr,r.map(i=>K[i][j])));// X[j] = Krr^-1 Krt[:,j]
   const Kc=t.map((i,a)=>t.map((j,b)=>K[i][j]-r.reduce((s,rr,c)=>s+K[i][rr]*X[b][c],0))),m=t.map(i=>M[i][i]);
   const A=Kc.map((row,a)=>row.map((v,b)=>v/Math.sqrt(m[a]*m[b])));
   modes=jacobi(A).map(({val,vec})=>{const tt=vec.map((v,a)=>v/Math.sqrt(m[a])),x=Array(n).fill(0);t.forEach((i,a)=>x[i]=tt[a]);r.forEach((i,c)=>x[i]=-X.reduce((s,col,b)=>s+col[c]*tt[b],0));return {w:Math.sqrt(Math.max(val,0)),x};});}
  return {tip,modes};
 }
 function feShape(N,x){const pts=[],l=1/N;for(let e=0;e<N;e++){const w1=e?x[2*e-2]:0,t1=e?x[2*e-1]:0,w2=x[2*e],t2=x[2*e+1];
   for(let k=e?1:0;k<=8;k++){const s=k/8;pts.push([(e+s)*l,(1-3*s*s+2*s**3)*w1+l*(s-2*s*s+s**3)*t1+(3*s*s-2*s**3)*w2+l*(-s*s+s**3)*t2]);}}
  const tip=pts.at(-1)[1]||1;return pts.map(([a,b])=>[a,b/tip]);}
 function exactShape(i){const b=BETA[i],sg_=(Math.cosh(b)+Math.cos(b))/(Math.sinh(b)+Math.sin(b)),f=s=>Math.cosh(b*s)-Math.cos(b*s)-sg_*(Math.sinh(b*s)-Math.sin(b*s)),tip=f(1);return range(0,1,121).map(s=>[s,f(s)/tip]);}

 /* ================= 2. 向きベクトルの角度 ================= */
 const ORIENT={flat:{name:'平鋼 100×20',sec:rect(20,100)},h:{name:'H形鋼 300×150×6.5×9',sec:H300},box:{name:'角形鋼管 100×100×4',sec:boxsec(100,4)}};
 const OL=2000,OP=1000;
 function orient(sec,deg){const a=-deg*DEG,c=Math.cos(a),s=Math.sin(a),k=OP*OL**3/(3*E);
  return {a,dY:-k*s*c*(1/sec.Iw-1/sec.Is),dZ:-k*(c*c/sec.Is+s*s/sec.Iw),sig:OP*OL*(Math.abs(c)*sec.cs/sec.Is+Math.abs(s)*sec.cw/sec.Iw)};}

 /* ================= 3. オフセットと合成断面 ================= */
 const SLAB={t:120,bw:300,hb:500,M:1e8};SLAB.e=SLAB.t/2+SLAB.hb/2;
 function composite(b,off){const As=b*SLAB.t,Is=b*SLAB.t**3/12,Ab=SLAB.bw*SLAB.hb,Ib=SLAB.bw*SLAB.hb**3/12,e=SLAB.e;
  if(!off){const I=Is+Ib;return {I,zbar:0,top:-SLAB.M*(SLAB.t/2)/I,bot:SLAB.M*(SLAB.hb/2)/I,slabBot:SLAB.M*(SLAB.t/2)/I,beamTop:-SLAB.M*(SLAB.hb/2)/I};}
  const zbar=Ab*e/(As+Ab),I=Is+As*zbar**2+Ib+Ab*(e-zbar)**2,f=z=>SLAB.M*(z-zbar)/I;// z は床の中央面から下向き
  return {I,zbar,top:f(-SLAB.t/2),bot:f(e+SLAB.hb/2),slabBot:f(SLAB.t/2),beamTop:f(SLAB.t/2)};}

 /* ================= 4. せん断変形と K の既定値 ================= */
 const SHEAR={h:{name:'H形鋼 300×150×6.5×9（強軸）',sec:H300,h:300,k:cowperI(300,150,6.5,9)},rect:{name:'長方形 幅100×高さ300',sec:rect(100,300),h:300,k:10*(1+NU)/(12+11*NU)}};
 const shearRatio=(s,r,k)=>k?1+3*E*s.sec.Is/(k*G*s.sec.A*(r*s.h)**2):1;

 /* ================= 5. 反り拘束 ================= */
 const WARP={T:1e5,sec:H300};WARP.GJ=G*H300.J;WARP.lam=Math.sqrt(G*H300.J/(E*H300.Cw));
 const twistFree=x=>WARP.T*x/WARP.GJ,twistRestrained=(x,L)=>{const l=WARP.lam;return WARP.T/(WARP.GJ*l)*(l*x-Math.sinh(l*x)+Math.tanh(l*L)*(Math.cosh(l*x)-1));};

 /* ================= 6. 端部の解放（2径間の連続梁） ================= */
 const SPAN={L:4000,w:10};
 const momentCont=x=>3*SPAN.w*SPAN.L*x/8-SPAN.w*x*x/2,momentSimple=x=>SPAN.w*SPAN.L*x/2-SPAN.w*x*x/2;
 const deflCont=s=>s*(1-3*s*s+2*s**3)/48,deflSimple=s=>s*(1-2*s*s+s**3)/24; // wL⁴/EI 単位、s = x/L

 /* ================= 7. 補強の位置 ================= */
 const taperRatio=(a,n)=>(1-(1-a)**3)/n+(1-a)**3;

 /* ================= 8. 溝形のせん断中心 ================= */
 const CH={h:100,b:50,t:5,P:1000};CH.yS=-3*CH.b**2/(CH.h+6*CH.b);CH.yG=CH.b**2/(CH.h+2*CH.b);

 /* ---------- 図の HTML ---------- */
 const box=(name,controls,caption)=>`<div class="theory-lab-controls">${controls}</div><div class="theory-lab-plot"></div><p class="theory-lab-readout" aria-live="polite"></p><figcaption>${caption}</figcaption>`;
 const slider=(id,label,min,max,step,value)=>`<label>${label} <input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-lab-input="${id}"><output data-out="${id}"></output></label>`;
 const select=(id,label,opts,value)=>`<label>${label} <select data-lab-input="${id}">${opts.map(([v,t])=>`<option value="${v}"${v===value?' selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
 const presets=(id,vals,fmt)=>`<span class="beam-lab-presets">${vals.map(v=>`<button type="button" data-lab-action="${id}:${v}">${fmt(v)}</button>`).join('')}</span>`;

 const labs={
  mesh:{html:()=>box('mesh',slider('n','要素数',1,20,1,1)+select('mass','質量',[['lumped','集中質量（既定）'],['coupled','連成質量（COUPMASS）']],'lumped')+select('mode','表示するモード',[['0','1次'],['1','2次'],['2','3次']],'0'),
    '鋼の正方形断面 20×20 mm、長さ 1,000 mm の片持ち梁を CBAR と同じ3次式の梁要素で分割した計算。実線が要素の振動の形（先端を1にそろえた）、破線が理論の形、点が節点です。集中質量は要素の質量を両端の並進に半分ずつ置き、連成質量は MSC Nastran の CBAR と同じく曲げに古典的な一貫質量を使います。'),
   draw(el,v){const N=+v.n,c=v.mass==='coupled',i=+v.mode,res=cantilever(N,c);el.out.n.textContent=N;
    const fe=res.modes[i],dots=[[0,0]];
    if(fe){const sh=feShape(N,fe.x);for(let k=1;k<=N;k++)dots.push(sh[Math.min(sh.length-1,k*8)]);}
    el.plot.innerHTML=chart({id:'mesh',label:'振動の形',x:[0,1],y:[-1.1,1.1],xt:[0,0.25,0.5,0.75,1],yt:[-1,-0.5,0,0.5,1],xf:v=>v*1000,xl:'x (mm)',yl:'φ/φ(L)',legend:true,
     series:[{pts:exactShape(i),name:'φ',dash:'7 4'},...(fe?[{pts:feShape(N,fe.x),name:`φh, n=${N}`,strong:true,dash:''}]:[])],dots:fe?dots:[]})+
     `<table class="theory-lab-table beam-lab-freq"><tr><th>モード</th><th>理論</th><th>要素 ${N} 本</th><th>誤差</th></tr>${BETA.map((b,k)=>{const ex=b*b*MESH.scale,m=res.modes[k],f=m?m.w*MESH.scale:NaN;return `<tr${k===i?' class="on"':''}><td>${k+1}次</td><td>${sg(ex,4)} Hz</td><td>${m?sg(f,4)+' Hz':'—'}</td><td>${m?signed((f/ex-1)*100)+'%':'—'}</td></tr>`;}).join('')}</table>`;
    const tip=res.tip*MESH.P*MESH.L**3/(E*MESH.I),exact=MESH.P*MESH.L**3/(3*E*MESH.I);
    el.readout.innerHTML=`先端に ${MESH.P} N の静荷重：たわみ ${fx(tip,4)} mm（手計算 PL³/(3EI) = ${fx(exact,4)} mm）。要素数にかかわらず一致します。${fe?'':`<br><span class="warn">${N} 本・${c?'連成':'集中'}質量では、${i+1}次のモードを表す自由度がありません。</span>`}`;}},
  orient:{html:()=>box('orient',select('sec','断面',Object.entries(ORIENT).map(([k,o])=>[k,o.name]),'flat')+slider('deg','v のずれ',0,90,1,10)+presets('deg',[0,5,10,45,90],v=>v+'°'),
    `長さ ${fx(OL)} mm の片持ち梁の先端に、真下へ ${fx(OP)} N（E = ${fx(E)} MPa、せん断変形なし）。0° は強い向きで荷重を受ける設計どおりの向きです。左の立体図は変形と断面を拡大、y は v の向きです。右は先端から根元を見た図で、破線が変形前、緑の矢印が先端の動きです。変形の拡大率は角度ごとに変えて、向きが分かるようにしています。大きさは下の数値で比べてください。`),
   draw(el,v){const o=ORIENT[v.sec],deg=+v.deg,r=orient(o.sec,deg),r0=orient(o.sec,0),worst=Math.hypot(r.dY,r.dZ);
    el.out.deg.textContent=deg+'°';
    el.plot.innerHTML=`<div class="beam-lab-views">${orientScene(o.sec,r,worst)}${endView(o.sec,r,worst)}</div>`;
    el.readout.innerHTML=`鉛直たわみ <b>${fx(Math.abs(r.dZ),2)} mm</b>（0° の ${fx(r.dZ/r0.dZ,2)} 倍）　横たわみ <b>${fx(Math.abs(r.dY),2)} mm</b>（0° の鉛直たわみの ${fx(Math.abs(r.dY/r0.dZ),2)} 倍）<br>根元の最大曲げ応力 <b>${fx(r.sig,1)} MPa</b>（0° の ${fx(r.sig/r0.sig,2)} 倍）`;},
   action(el,name,val){el.inputs[name].value=val;}},
  offset:{html:()=>box('offset',select('off','オフセット',[['1','あり（W3A = W3B = −310.）'],['0','なし']],'1')+slider('b','床の有効幅 b',500,3000,100,1000),
    `床 厚さ ${SLAB.t} mm、梁 幅 ${SLAB.bw} × せい ${SLAB.hb} mm（床の下面から下）、同じ材料。曲げモーメント M = 100 kN·m をかけたときの断面の応力を、梁理論で計算しています。幅方向は縮めて描いています。左は計算上の断面、右は曲げ応力。zₙ は中立軸、B₀ の破線は実物の梁の位置です。オフセットなしでは梁の中心を床の中央面として計算し、ありでは床と梁を一体の断面として計算します。`),
   draw(el,v){const b=+v.b,on=v.off==='1',a=composite(b,on),other=composite(b,!on),ratio=composite(b,true).I/composite(b,false).I;el.out.b.textContent=fx(b)+' mm';
    el.plot.innerHTML=offsetFigure(b,on,a,Math.max(...[a,other].flatMap(q=>[q.top,q.bot,q.slabBot,q.beamTop].map(Math.abs))));
    el.readout.innerHTML=`断面二次モーメント：オフセットなし ${sg(composite(b,false).I/1e9,3)}×10⁹ mm⁴、あり ${sg(composite(b,true).I/1e9,3)}×10⁹ mm⁴（<b>${fx(ratio,2)} 倍</b>）。同じ荷重のたわみは ${fx(1/ratio,2)} 倍になります。<br>梁の下端の応力 ${fx(a.bot,2)} MPa、床の上面 ${fx(a.top,2)} MPa（−は圧縮）。`;}},
  shear:{html:()=>box('shear',select('sec','断面',Object.entries(SHEAR).map(([k,o])=>[k,o.name]),'h')+slider('r','細長さ L/h',2,30,0.5,5),
    `先端に 10 kN を受ける片持ち梁の先端たわみを、せん断変形を含めない値（曲げだけ）で割った比。PBARL の線は、断面から計算される K の目安として Cowper の式（H形 k = ${fx(SHEAR.h.k,3)}、長方形 k = ${fx(SHEAR.rect.k,3)}）を使っています。MSC Nastran が計算する値とは少し違うことがあります。`),
   draw(el,v){const s=SHEAR[v.sec],r=+v.r,rs=range(2,30,113);el.out.r.textContent=fx(r,1);
    const cases=[['PBAR（K 空欄）',0],['PBEAM（K = 1.0）',1],['PBARL（K 自動）',s.k]],top=Math.max(1.2,Math.ceil(shearRatio(s,2,s.k)*4)/4);
    el.plot.innerHTML=chart({id:'shear',label:'細長さとせん断たわみ',x:[2,30],y:[1,top],xt:[2,5,10,15,20,25,30],yt:range(1,top,Math.round((top-1)/0.25)+1),yf:v=>v.toFixed(2),xl:'L/h',yl:'δ/δb',legend:true,
     series:cases.map(([n,k],i)=>({pts:rs.map(x=>[x,shearRatio(s,x,k)]),name:['PBAR','PBEAM','PBARL'][i],strong:i===2,dash:DASH[i]})),marks:cases.map(([,k])=>[r,shearRatio(s,r,k)])});
    const L=r*s.h,db=1e4*L**3/(3*E*s.sec.Is);
    el.readout.innerHTML=`L = ${fx(L)} mm、先端たわみ：${cases.map(([n,k])=>`${n} <b>${fx(db*shearRatio(s,r,k),3)} mm</b>`).join('、')}。PBAR は PBARL より ${fx((1-1/shearRatio(s,r,s.k))*100,1)}% 小さく出ます。`;}},
  release:{html:()=>box('release',`<label><input type="checkbox" data-lab-input="pb"> 梁1 の PB = 6</label><label><input type="checkbox" data-lab-input="pa"> 梁2 の PA = 6</label>`+select('v','v の向き',[['up','上向き（鉛直）'],['side','水平']],'up'),
    `径間 ${SPAN.L/1000} m × 2 の梁に、${SPAN.w} kN/m の等分布荷重。A はピン、B・C はローラーで、B は GRID 20 を梁1・梁2が共有します。曲げモーメントは引張側に描き、変形は拡大しています。`),
   draw(el,v){const up=v.v==='up',rel=(v.pb?1:0)+(v.pa?1:0),eff=up?rel:0;
    el.plot.innerHTML=releaseFigure(v.pb,v.pa,up,eff);
    let msg=eff?`B の曲げモーメント <b>0</b>（ピン）。径間の最大 <b>+${fx(SPAN.w*SPAN.L**2/8/1e6,1)} kN·m</b>。最大たわみは連続梁の ${fx(5/384/0.005416,2)} 倍です。`:`B の曲げモーメント <b>−${fx(SPAN.w*SPAN.L**2/8/1e6,1)} kN·m</b>（連続梁）。径間の最大 <b>+${fx(9*SPAN.w*SPAN.L**2/128/1e6,2)} kN·m</b>。`;
    if(rel===2)msg+=`<br><span class="warn">両側で同じ回転を解放したので、GRID 20 の${up?'鉛直面':'水平面'}の回転はどの梁ともつながっていません。剛性が 0 になり特異です。片側だけで同じ結果になります。</span>`;
    if(rel&&!up)msg+=`<br><span class="warn">6 は要素 z 軸まわりの回転です。v が水平だと z 軸は鉛直を向くので、6 は水平面の曲げを解放し、鉛直面のモーメントは残ります。</span>`;
    el.readout.innerHTML=msg;}},
  shearcenter:{html:()=>box('shearcenter',slider('p','荷重の作用線の位置',-40,50,0.25,CH.yG)+presets('p',[CH.yG,CH.yS,0],v=>v===CH.yG?'G を通す':v===CH.yS?'S を通す':'ウェブの中心'),
    `板厚 ${CH.t} mm の溝形（ウェブの中心線の高さ ${CH.h} mm、フランジの長さ ${CH.b} mm）に下向き ${fx(CH.P)} N。位置はウェブの中心線から測り、フランジ側を＋とします。断面の回転は拡大して描いています。G は図心、S はせん断中心で、どちらも薄肉断面の公式による値です。`),
   draw(el,v){const p=+v.p,e=p-CH.yS,T=CH.P*e;el.out.p.textContent=signed(p,1).replace('+','＋')+' mm';
    el.plot.innerHTML=channelFigure(p,T);
    el.readout.innerHTML=Math.abs(e)<0.13?`作用線がせん断中心 S を通るので、ねじりモーメントは <b>0</b>。梁は曲がるだけで、ねじれません。`:`S からの距離 e = ${fx(Math.abs(e),1)} mm、ねじりモーメント T = P·e = <b>${fx(Math.abs(T))} N·mm</b>（${T>0?'時計回り':'反時計回り'}）。`;},
   action(el,name,val){el.inputs[name].value=val;}},
  warp:{html:()=>box('warp',slider('L','長さ L',500,8000,100,2000)+select('show','立体図',[['beam','CBEAM（根元で反りを拘束）'],['bar','CBAR（反り自由）']],'beam'),
    `H形鋼 300×150×6.5×9 の片持ち梁の先端に、トルク ${WARP.T/1000} N·m。J = ${fx(H300.J)} mm⁴、Cw = ${sg(H300.Cw/1e11,3)}×10¹¹ mm⁶ は薄肉断面の公式による値です。グラフの実線が反りを拘束した場合（根元で dθ/dx = 0、先端は反り自由）、破線が反りを考えない場合（CBAR）。立体図のねじれは拡大しています。`),
   draw(el,v){const L=+v.L,xs=range(0,L,81),tf=twistFree(L),tr=twistRestrained(L,L),yt=ticks(tf/DEG);el.out.L.textContent=fx(L)+' mm';
    el.plot.innerHTML=warpScene(L,v.show==='beam')+chart({id:'warp',label:'ねじれ角の分布',x:[0,L],y:[0,yt.top],xt:ticks(L,4).list,yt:yt.list,yf:v=>sg(v,2),xl:'x (mm)',yl:'θ (°)',legend:true,
     series:[{pts:xs.map(x=>[x,twistRestrained(x,L)/DEG]),name:'CBEAM',strong:true,dash:''},{pts:xs.map(x=>[x,twistFree(x)/DEG]),name:'CBAR',dash:'7 4'}],marks:[[L,tr/DEG],[L,tf/DEG]]});
    el.readout.innerHTML=`先端のねじれ角：CBAR <b>${fx(tf/DEG,2)}°</b>、反りを拘束した CBEAM <b>${fx(tr/DEG,2)}°</b>（CBAR の ${fx(tr/tf,2)} 倍）。反りの影響が届く長さの目安 1/λ = √(E·Cw/(G·J)) = ${fx(1/WARP.lam)} mm。`;}},
  taper:{html:()=>box('taper',slider('a','補強する長さ（根元から）',0,100,5,50)+select('n','補強した部分の EI',[['2','2倍'],['4','4倍'],['8','8倍']],'4'),
    '先端に集中荷重を受ける片持ち梁で、根元から一部だけ曲げ剛性 EI を大きくしたときの先端たわみ（補強なしを1とする）。曲げモーメントは根元ほど大きく、先端で0です。'),
   draw(el,v){const a=+v.a/100,n=+v.n,r=taperRatio(a,n),as=range(0,1,101);el.out.a.textContent=fx(a*100)+'%';
    el.plot.innerHTML=taperFigure(a,n)+chart({id:'taper',label:'補強長さと先端たわみ',x:[0,100],y:[0,1],xt:[0,25,50,75,100],yt:[0,0.25,0.5,0.75,1],yf:v=>v.toFixed(2),xl:'a/L (%)',yl:'δ/δ0',legend:true,
     series:[2,4,8].map((k,i)=>({pts:as.map(x=>[x*100,taperRatio(x,k)]),name:`EI × ${k}`,strong:k===n,dash:DASH[i]})),marks:[[a*100,r]]});
    const gain=(1-r)/(1-1/n);
    el.readout.innerHTML=`先端たわみ：補強なしの <b>${fx(r,3)} 倍</b>（全長を補強すると ${fx(1/n,3)} 倍）。全長を補強したときの減少のうち <b>${fx(gain*100,1)}%</b> を、長さ ${fx(a*100)}% の補強で得ています。`;}}
 };

 /* ---------- 個別の図 ---------- */
 function orientScene(sec,r,worst){const L=10,ds=1.5/sec.dim,dd=2.6/worst,sh=x=>{const q=x/L;return q*q*(3-q)/2;},sp=x=>{const q=x/L;return (6*q-3*q*q)/(2*L);};
  const ex=extrude(sec,{L,ds,center:x=>[r.dY*dd*sh(x),r.dZ*dd*sh(x)],rot:()=>r.a,slope:x=>[r.dY*dd*sp(x),r.dZ*dd*sp(x)]});
  const c=Math.cos(r.a),s=Math.sin(r.a),tip=[L,r.dY*dd,r.dZ*dd],top=Math.max(...sec.poly.map(([y,z])=>(y*s+z*c)*ds));
  const ghost=sec.poly.map(([y,z])=>[L,(y*c-z*s)*ds,(y*s+z*c)*ds]);
  const ax=(d,len)=>[tip[0]+0.25,tip[1]+d[1]*len,tip[2]+d[2]*len];
  return render3d([wall(1.5,1.7),{k:'line',c:'b3-ghost',p:[[0,0,0],[L,0,0]]},{k:'line',c:'b3-ghost',p:[...ghost,ghost[0]],back:true},...ex.items,
   {k:'arrow',c:'b3-load',p:[[L,tip[1],tip[2]+top+1.9],[L,tip[1],tip[2]+top+0.2]]},{k:'text',c:'b3-loadText',p:[[L,tip[1],tip[2]+top+1.9]],s:'P',dx:6,dy:4},
   {k:'arrow',c:'b3-axis',p:[[tip[0]+0.25,tip[1],tip[2]],ax([0,-s,c],1.25)]},{k:'text',c:'b3-axisText',p:[ax([0,-s,c],1.35)],s:'y',dx:4},
   {k:'arrow',c:'b3-axis',p:[[tip[0]+0.25,tip[1],tip[2]],ax([0,-c,-s],1.25)]},{k:'text',c:'b3-axisText',p:[ax([0,-c,-s],1.4)],s:'z',dx:-4,dy:4,a:'end'}],
   {w:300,h:210,label:'片持ち梁の立体図',cam:camera(-40,32)});}
 function endView(sec,r,worst){const w=190,h=210,cx=95,cy=88,k=72/sec.dim,dk=78/worst,c=Math.cos(r.a),s=Math.sin(r.a);
  const P=(y,z,dy=0,dz=0)=>[(cx+(y*c-z*s)*k+dy*dk).toFixed(1),(cy-(y*s+z*c)*k-dz*dk).toFixed(1)].join(',');
  const poly=(dy,dz,cls)=>`<polygon points="${sec.poly.map(([y,z])=>P(y,z,dy,dz)).join(' ')}" class="${cls}"/>`+(sec.hole?`<polygon points="${sec.hole.map(([y,z])=>P(y,z,dy,dz)).join(' ')}" class="${cls==='b2-sec'?'b2-hole':cls}"/>`:'');
  const ex=cx+r.dY*dk,ey=cy-r.dZ*dk,arrow=Math.hypot(r.dY,r.dZ)*dk>6;
  return `<svg class="beam-end" viewBox="0 0 ${w} ${h}" role="img" aria-label="先端から見た図">`+
   `<line x1="${cx}" y1="22" x2="${cx}" y2="${h-34}" class="b2-guide"/><line x1="12" y1="${cy}" x2="${w-12}" y2="${cy}" class="b2-guide"/><text x="${w-12}" y="${cy-5}" text-anchor="end" class="b2-small">Y</text><text x="${cx+5}" y="30" class="b2-small">Z</text>`+
   poly(0,0,'b2-ghost')+poly(r.dY,r.dZ,'b2-sec')+
   (arrow?`<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" class="b2-move"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="3.5" class="b2-moveDot"/>`:'')+
   `</svg>`;}
 function offsetFigure(b,on,a,smax){const W=360,H=262,x0=24,sw=140,kz=0.24,top=76,mid=top+SLAB.t/2*kz,bwpx=Math.max(12,sw*SLAB.bw/b),cxs=x0+sw/2;
  const realTop=top+SLAB.t*kz,modelTop=on?realTop:mid-SLAB.hb/2*kz,F=v=>v.toFixed(1);
  let s=`<svg class="theory-lab-svg beam-offset-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="床と梁の断面と応力">`;
  s+=`<text x="${x0}" y="16" class="b2-title">y–z</text><text x="236" y="16" class="b2-title">σx (MPa)</text>`;
  s+=`<rect x="${x0}" y="${top}" width="${sw}" height="${F(SLAB.t*kz)}" class="b2-slab"/>`;
  if(!on)s+=`<rect x="${F(cxs-bwpx/2)}" y="${F(realTop)}" width="${F(bwpx)}" height="${F(SLAB.hb*kz)}" class="b2-real"/><text x="${F(cxs+bwpx/2+5)}" y="${F(realTop+SLAB.hb*kz-8)}" class="b2-small">B₀</text>`;
  s+=`<rect x="${F(cxs-bwpx/2)}" y="${F(modelTop)}" width="${F(bwpx)}" height="${F(SLAB.hb*kz)}" class="${on?'b2-beam':'b2-beam ghosted'}"/>`;
  s+=`<line x1="${x0-6}" y1="${F(mid)}" x2="${x0+sw+8}" y2="${F(mid)}" class="b2-ref"/><text x="${x0+sw+10}" y="${F(mid+4)}" class="b2-small">GA / GB</text>`;
  if(on){const bc=realTop+SLAB.hb/2*kz;s+=`<line x1="${F(cxs-bwpx/2-14)}" y1="${F(bc)}" x2="${F(cxs+bwpx/2+14)}" y2="${F(bc)}" class="b2-ref"/><line x1="${x0+12}" y1="${F(mid)}" x2="${x0+12}" y2="${F(bc)}" class="b2-dim"/><text x="${x0+16}" y="${F((mid+bc)/2+4)}" class="b2-small">e = ${SLAB.e}</text>`;}
  const na=mid+a.zbar*kz;s+=`<line x1="${x0-6}" y1="${F(na)}" x2="${x0+sw+8}" y2="${F(na)}" class="b2-na"/><text x="${x0+sw+10}" y="${F(na+(on?4:18))}" class="b2-naText">zₙ</text>`;
  // 応力図：横軸が応力、縦は断面の位置にそろえる
  const zx=286,ks=56/smax,st=v=>F(zx+v*ks),slabTopY=top,slabBotY=top+SLAB.t*kz,beamTopY=modelTop,beamBotY=modelTop+SLAB.hb*kz;
  s+=`<line x1="${zx}" y1="${top-8}" x2="${zx}" y2="${H-18}" class="b2-guide"/>`;
  s+=`<polygon points="${zx},${F(slabTopY)} ${st(a.top)},${F(slabTopY)} ${st(a.slabBot)},${F(slabBotY)} ${zx},${F(slabBotY)}" class="${a.top<0?'b2-comp':'b2-ten'}"/>`;
  const zb0=on?a.beamTop:a.beamTop,yz=beamTopY+(0-zb0)/(a.bot-zb0)*(beamBotY-beamTopY);
  if(zb0<0&&a.bot>0)s+=`<polygon points="${zx},${F(beamTopY)} ${st(zb0)},${F(beamTopY)} ${zx},${F(yz)}" class="b2-comp"/><polygon points="${zx},${F(yz)} ${st(a.bot)},${F(beamBotY)} ${zx},${F(beamBotY)}" class="b2-ten"/>`;
  else s+=`<polygon points="${zx},${F(beamTopY)} ${st(zb0)},${F(beamTopY)} ${st(a.bot)},${F(beamBotY)} ${zx},${F(beamBotY)}" class="${a.bot>0?'b2-ten':'b2-comp'}"/>`;
  s+=`<text x="${st(a.top)}" y="${F(slabTopY-4)}" text-anchor="middle" class="b2-small">${fx(a.top,2)}</text><text x="${st(a.bot)}" y="${F(beamBotY+13)}" text-anchor="middle" class="b2-small">${fx(a.bot,2)}</text>`;
  if(!on)s+=`<text x="${x0}" y="${H-6}" class="b2-small"></text>`;
  else s+=`<text x="${x0}" y="${H-6}" class="b2-small"></text>`;
  return s+'</svg>';}
 function releaseFigure(pb,pa,up,eff){const W=360,H=250,xa=24,xb=180,xc=336,yb=82,sp=xc-xb,F=v=>v.toFixed(1),dk=24/(5/384);
  let s=`<svg class="theory-lab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="2径間の梁の曲げモーメント"><text x="${xa}" y="16" class="b2-small">w = ${SPAN.w} kN/m</text>`;
  s+=`<line x1="${xa}" y1="38" x2="${xc}" y2="38" class="b2-load"/>`;for(let x=xa;x<=xc+0.1;x+=13)s+=`<line x1="${x}" y1="38" x2="${x}" y2="${yb-9}" class="b2-load"/><polygon points="${x},${yb-4} ${x-3.5},${yb-11} ${x+3.5},${yb-11}" class="b2-loadHead"/>`;
  s+=`<line x1="${xa}" y1="${yb}" x2="${xc}" y2="${yb}" class="b2-beamLine"/>`;
  const sup=(x,roller)=>`<polygon points="${x},${yb+2} ${x-9},${yb+16} ${x+9},${yb+16}" class="b2-support"/>`+(roller?`<circle cx="${x-5}" cy="${yb+20}" r="3" class="b2-support"/><circle cx="${x+5}" cy="${yb+20}" r="3" class="b2-support"/>`:`<line x1="${x-13}" y1="${yb+17}" x2="${x+13}" y2="${yb+17}" class="b2-ground"/>`);
  s+=sup(xa,false)+sup(xb,true)+sup(xc,true)+`<text x="${xa}" y="${yb+38}" text-anchor="middle" class="b2-small">A</text><text x="${xb}" y="${yb+38}" text-anchor="middle" class="b2-small">B（GRID 20）</text><text x="${xc}" y="${yb+38}" text-anchor="middle" class="b2-small">C</text>`;
  const mark=(x,on,label,anchor)=>on?`<circle cx="${x}" cy="${yb}" r="5" class="${up?'b2-hinge':'b2-hinge off'}"/><text x="${x+(anchor==='end'?-8:8)}" y="${yb-14}" text-anchor="${anchor}" class="b2-small">${label}</text>`:'';
  s+=mark(xb-9,pb,'PB=6','end')+mark(xb+9,pa,'PA=6','start');
  const d=eff?deflSimple:deflCont,dpts=[];for(let i=0;i<=40;i++){const q=i/40;dpts.push([xa+q*sp,yb+d(q)*dk]);}for(let i=39;i>=0;i--){const q=i/40;dpts.push([xc-q*sp,yb+d(q)*dk]);}
  s+=`<polyline points="${dpts.map(([x,y])=>F(x)+','+F(y)).join(' ')}" class="b2-defl"/>`;
  const ym=186,km=40/(SPAN.w*SPAN.L**2/8),mf=eff?momentSimple:momentCont,mp=[];for(let i=0;i<=40;i++){const x=i/40*SPAN.L;mp.push([xa+i/40*sp,ym+mf(x)*km]);}for(let i=40;i>=0;i--){const x=i/40*SPAN.L;mp.push([xc-i/40*sp,ym+mf(x)*km]);}
  const path=`M${xa},${ym} `+mp.map(([x,y])=>`L${F(x)},${F(y)}`).join(' ')+` L${xc},${ym}Z`;
  s+=`<defs><clipPath id="bl-mpos"><rect x="0" y="${ym}" width="${W}" height="${H-ym}"/></clipPath><clipPath id="bl-mneg"><rect x="0" y="0" width="${W}" height="${ym}"/></clipPath></defs>`;
  s+=`<path d="${path}" class="b2-ten" clip-path="url(#bl-mpos)"/><path d="${path}" class="b2-comp" clip-path="url(#bl-mneg)"/><path d="${path}" class="b2-mline"/><line x1="${xa}" y1="${ym}" x2="${xc}" y2="${ym}" class="b2-guide"/>`;
  const smax=eff?SPAN.w*SPAN.L**2/8:9*SPAN.w*SPAN.L**2/128,xmax=eff?SPAN.L/2:3*SPAN.L/8;
  s+=`<text x="${F(xa+xmax/SPAN.L*sp)}" y="${F(ym+smax*km+14)}" text-anchor="middle" class="b2-small">+${fx(smax/1e6,eff?1:2)}</text>`;
  if(!eff)s+=`<text x="${xb}" y="${F(ym-SPAN.w*SPAN.L**2/8*km-5)}" text-anchor="middle" class="b2-small">−${fx(SPAN.w*SPAN.L**2/8/1e6,1)}</text>`;
  s+=`<text x="${xc}" y="${ym-6}" text-anchor="end" class="b2-small">M（kN·m）</text>`;
  return s+'</svg>';}
 function channelFigure(p,T){const W=360,H=230,cx=168,cy=118,k=1.55,F=v=>v.toFixed(1),t=CH.t,h=CH.h,b=CH.b;
  const poly=[[-t/2,-h/2-t/2],[b,-h/2-t/2],[b,-h/2+t/2],[t/2,-h/2+t/2],[t/2,h/2-t/2],[b,h/2-t/2],[b,h/2+t/2],[-t/2,h/2+t/2]];
  const ang=Math.max(-22,Math.min(22,-T/(CH.P*31.25)*11))*DEG,c=Math.cos(ang),s=Math.sin(ang);
  const P=(y,z,rot)=>{if(rot){const dy=y-CH.yS;[y,z]=[CH.yS+dy*c-z*s,dy*s+z*c];}return [cx+y*k,cy-z*k];};
  const pts=rot=>poly.map(([y,z])=>P(y,z,rot).map(F).join(',')).join(' ');
  let s_=`<svg class="theory-lab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="溝形断面のせん断中心"><polygon points="${pts(false)}" class="b2-ghost"/><polygon points="${pts(true)}" class="b2-sec"/>`;
  const [gx,gy]=P(CH.yG,0,true),[sx,sy]=P(CH.yS,0,false),lx=cx+p*k;
  s_+=`<line x1="${F(lx)}" y1="14" x2="${F(lx)}" y2="${H-40}" class="b2-action"/><line x1="${F(lx)}" y1="14" x2="${F(lx)}" y2="34" class="b2-loadBold"/><polygon points="${F(lx)},${44} ${F(lx-5)},${33} ${F(lx+5)},${33}" class="b2-loadHead"/><text x="${F(lx+7)}" y="26" class="b2-loadText">P</text>`;
  s_+=`<circle cx="${F(gx)}" cy="${F(gy)}" r="5" class="b2-g"/><line x1="${F(gx-5)}" y1="${F(gy)}" x2="${F(gx+5)}" y2="${F(gy)}" class="b2-gx"/><line x1="${F(gx)}" y1="${F(gy-5)}" x2="${F(gx)}" y2="${F(gy+5)}" class="b2-gx"/><text x="${F(gx+7)}" y="${F(gy+14)}" class="b2-small">G</text>`;
  s_+=`<polygon points="${F(sx)},${F(sy-6)} ${F(sx+6)},${F(sy)} ${F(sx)},${F(sy+6)} ${F(sx-6)},${F(sy)}" class="b2-s"/><text x="${F(sx-9)}" y="${F(sy+4)}" text-anchor="end" class="b2-small">S</text>`;
  if(Math.abs(T)>130){const r=30,cw=T>0,a0=-150*DEG,a1=-30*DEG,[x0,y0]=[sx+r*Math.cos(cw?a0:a1),sy+r*Math.sin(cw?a0:a1)],[x1,y1]=[sx+r*Math.cos(cw?a1:a0),sy+r*Math.sin(cw?a1:a0)];
   s_+=`<path d="M${F(x0)},${F(y0)} A${r},${r} 0 0 ${cw?1:0} ${F(x1)},${F(y1)}" class="b2-twist"/><circle cx="${F(x1)}" cy="${F(y1)}" r="3.5" class="b2-twistHead"/><text x="${F(sx)}" y="${F(sy-r-6)}" text-anchor="middle" class="b2-twistText">T</text>`;}
  const yb=H-24;s_+=`<line x1="${F(sx)}" y1="${yb-8}" x2="${F(sx)}" y2="${yb+4}" class="b2-dim"/><line x1="${F(lx)}" y1="${yb-8}" x2="${F(lx)}" y2="${yb+4}" class="b2-dim"/><line x1="${F(sx)}" y1="${yb}" x2="${F(lx)}" y2="${yb}" class="b2-dim"/><text x="${F((sx+lx)/2)}" y="${yb+16}" text-anchor="middle" class="b2-small">e = ${fx(Math.abs(p-CH.yS),1)} mm</text>`;
  return s_+'</svg>';}
 function warpScene(L,restrained){const Ld=2.5+7.5*L/8000,ds=1.5/300,scale=40*DEG/twistFree(L);
  const ex=extrude(H300,{L:Ld,n:30,ds,rot:x=>(restrained?twistRestrained(x*L/Ld,L):twistFree(x*L/Ld))*scale,rgb:[160,184,210]});
  const edge=ex.st.map(row=>row[7]),ghost=H300.poly.map(([y,z])=>[Ld,y*ds,z*ds]);
  return render3d([wall(0.75,1.0),{k:'line',c:'b3-ghost',p:[...ghost,ghost[0]],back:true},...ex.items,{k:'line',c:'b3-edge',p:edge}],
   {w:360,h:190,label:'ねじれたH形鋼の立体図',cam:camera(-52,26)});}
 function taperFigure(a,n){const W=360,H=78,x0=34,x1=330,y=40,t0=5,t1=t0*Math.cbrt(n),xr=x0+(x1-x0)*a,F=v=>v.toFixed(1);
  let s=`<svg class="theory-lab-svg beam-taper-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="補強した片持ち梁"><rect x="${x0-12}" y="${y-26}" width="12" height="52" class="b2-wallFill"/>`;
  s+=`<polygon points="${x0},${y-26} ${x1},${y} ${x0},${y}" class="b2-mfill"/><text x="${x0+6}" y="${y-28}" class="b2-small">M(x)</text>`;
  if(a>0)s+=`<rect x="${x0}" y="${F(y-t1)}" width="${F(xr-x0)}" height="${F(2*t1)}" class="b2-reinf"/>`;
  s+=`<rect x="${F(xr)}" y="${y-t0}" width="${F(x1-xr)}" height="${2*t0}" class="b2-beam"/><line x1="${x1}" y1="${y+8}" x2="${x1}" y2="${y+28}" class="b2-loadBold"/><polygon points="${x1},${y+7} ${x1-4.5},${y+16} ${x1+4.5},${y+16}" class="b2-loadHead" transform="rotate(180 ${x1} ${y+11.5})"/><text x="${x1-8}" y="${y+28}" text-anchor="end" class="b2-loadText">P</text>`;
  return s+'</svg>';}

 /* ---------- 静止した図 ---------- */
 const figs={
  axes:()=>{const L=8,v=[1.5,0,2.1],sec={poly:[[-0.22,-0.32],[0.22,-0.32],[0.22,0.32],[-0.22,0.32]],dim:1};
   const ex=extrude(sec,{L,n:6,ds:1,rgb:[170,192,214]});ex.items.forEach(it=>{it.op=0.92;});
   return `<figure class="element-figure beam-fig">${render3d([
    {k:'poly',back:true,c:'b3-plane1',p:[[0,0,0],[L,0,0],[L,0,2.3],[0,0,2.3]]},{k:'poly',back:true,c:'b3-plane2',p:[[0,0,0],[L,0,0],[L,-2.3,0],[0,-2.3,0]]},
    {k:'text',back:true,c:'b3-plane1Text',p:[[L*0.55,0,2.0]],s:'1: x–y'},{k:'text',back:true,c:'b3-plane2Text',p:[[L*0.58,-2.15,0]],s:'2: x–z',dy:12},
    ...ex.items,{k:'dot',c:'b3-node',p:[[0,0,0]]},{k:'dot',c:'b3-node',p:[[L,0,0]]},{k:'text',c:'b3-nodeText',p:[[0,0,0]],s:'GA',dx:-8,dy:16,a:'end'},{k:'text',c:'b3-nodeText',p:[[L,0,0]],s:'GB',dx:6,dy:16},
    {k:'arrow',c:'b3-v',p:[[0,0,0],v]},{k:'text',c:'b3-vText',p:[v],s:'v',dx:5,dy:-2},{k:'line',c:'b3-ghost',p:[v,[v[0],0,0]]},{k:'line',c:'b3-ghost',p:[v,[0,0,v[2]]]},
    {k:'arrow',c:'b3-axis',p:[[L,0,0],[L+1.6,0,0]]},{k:'text',c:'b3-axisText',p:[[L+1.6,0,0]],s:'x',dx:4,dy:4},
    {k:'arrow',c:'b3-axis',p:[[0,0,0],[0,0,2.1]]},{k:'text',c:'b3-axisText',p:[[0,0,2.1]],s:'y',dx:-10,dy:2},
    {k:'arrow',c:'b3-axis',p:[[0,0,0],[0,-1.9,0]]},{k:'text',c:'b3-axisText',p:[[0,-1.9,0]],s:'z',dx:-10,dy:4}],{w:360,h:230,label:'梁の要素座標と向きベクトル',cam:camera(-56,20)})}
    <figcaption>v は斜めでもかまいません。x に沿った成分（横の破線）を除いた残り（縦の破線の向き）が y になります。z = x × y。面1 は x と y を含む面で、ここでの曲げに I1 を使い、出力は M1・V1、端部の解放では 6 が対応します。面2 は x と z を含む面で、I2・M2・V2・解放の 5 が対応します。</figcaption></figure>`;},
  stresspoints:()=>{const W=360,H=196,F=v=>v.toFixed(1),bz=40,hy=80,k=1.15,I1=bz*hy**3/12,I2=hy*bz**3/12,M1=1e6,M2=2e5,s1=M1*(hy/2)/I1,s2=M2*(bz/2)/I2;
   const panel=(ox,filled)=>{const x=ox,y=56,w=bz*k*1.6,h=hy*k,cx=x+w/2,cy=y+h/2,id='bl-g'+ox;
    let s=`<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#7fa3d0"/><stop offset="0.5" stop-color="#f4f6f8"/><stop offset="1" stop-color="#d97b74"/></linearGradient></defs><rect x="${F(x)}" y="${F(y)}" width="${F(w)}" height="${F(h)}" fill="url(#${id})" class="b2-secEdge"/>`;
    s+=`<line x1="${F(cx)}" y1="${F(y-10)}" x2="${F(cx)}" y2="${F(y+h+10)}" class="b2-guide"/><line x1="${F(x-10)}" y1="${F(cy)}" x2="${F(x+w+10)}" y2="${F(cy)}" class="b2-guide"/>`;
    const pts=[['C',1,1],['D',-1,1],['E',-1,-1],['F',1,-1]];
    if(filled)for(const [n,sy,sz] of pts){const px=cx+sz*w/2,py=cy-sy*h/2,val=sy*s1+sz*s2;s+=`<circle cx="${F(px)}" cy="${F(py)}" r="4" class="b2-pt"/><text x="${F(px+(sz>0?7:-7))}" y="${F(py+(sy>0?-6:14))}" text-anchor="${sz>0?'start':'end'}" class="b2-small">${n} ${signed(val,1)}</text>`;}
    else{s+=`<circle cx="${F(cx)}" cy="${F(cy)}" r="4" class="b2-pt"/><text x="${F(cx+8)}" y="${F(cy-6)}" class="b2-small">C,D,E,F</text><text x="${F(cx+8)}" y="${F(cy+14)}" class="b2-small">σb = 0.0</text>`;}
    return s;};
   return `<figure class="element-figure beam-fig"><svg class="theory-lab-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="応力を求める点"><text x="16" y="18" class="b2-title">C–F: (±${hy/2}, ±${bz/2})</text><text x="206" y="18" class="b2-title">C–F: (0, 0)</text>${panel(66,true)}${panel(236,false)}</svg>
    <figcaption>幅 ${bz} mm × 高さ ${hy} mm の断面に、面1 の曲げ M1 = 1.0 kN·m と面2 の曲げ M2 = 0.2 kN·m が同時にかかった例。色は曲げ応力の分布で、赤が引張、青が圧縮（モーメントの向きで入れ替わります）。左は四隅で最大 ${fx(s1+s2,1)} MPa。右は4点がすべて図心 (0, 0) にあるので、曲げ応力の出力は 0 になります。</figcaption></figure>`;}
 };

 /* ---------- 画面とのつなぎ ---------- */
 function connect(root){
  for(const fig of root.querySelectorAll('[data-beam-fig]')){const t=document.createElement('template');t.innerHTML=figs[fig.dataset.beamFig]().trim();const node=t.content.firstElementChild;if(fig.id)node.id=fig.id;fig.replaceWith(node);}
  for(const fig of root.querySelectorAll('figure[data-beam-lab]')){
   const lab=labs[fig.dataset.beamLab];fig.classList.add('theory-lab','beam-lab');fig.innerHTML=lab.html();
   const el={plot:fig.querySelector('.theory-lab-plot'),readout:fig.querySelector('.theory-lab-readout'),inputs:{},out:{}};
   for(const input of fig.querySelectorAll('[data-lab-input]'))el.inputs[input.dataset.labInput]=input;
   for(const o of fig.querySelectorAll('[data-out]'))el.out[o.dataset.out]=o;
   const values=()=>Object.fromEntries(Object.entries(el.inputs).map(([k,i])=>[k,i.type==='checkbox'?i.checked:i.value]));
   const draw=()=>{try{lab.draw(el,values());}catch(err){el.readout.textContent='図を描けませんでした：'+err.message;}};
   fig.addEventListener('input',draw);fig.addEventListener('change',draw);
   fig.addEventListener('click',event=>{const b=event.target.closest('[data-lab-action]');if(!b)return;const [name,val]=b.dataset.labAction.split(':');lab.action(el,name,val);draw();});
   draw();
  }
 }
 window.BeamLabs={connect,labs,figs,graphics:{render3d,camera,chart,extrude,wall},core:{cantilever,orient,ORIENT,composite,shearRatio,SHEAR,twistFree,twistRestrained,WARP,taperRatio,CH,H300,MESH,BETA}};
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>connect(document));
})();
