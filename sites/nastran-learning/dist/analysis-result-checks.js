/* Independent mechanics examples for reading results on the analysis tab. */
(() => {
 'use strict';
 const {ui,graphics}=window.BeamLabs;
 const C=window.AnalysisResponseCore;
 const {table}=window.LessonArticle;
 const p=text=>'<p>'+text+'</p>';
 const card=(id,label)=>'<a href="bulk.html#'+id+'">'+label+'</a>';
 const figure=key=>'<figure data-result-check="'+key+'"></figure>';
 const question=(prompt,answer)=>'<div class="theory-quiz"><details><summary>'+prompt+'</summary>'+p(answer)+'</details></div>';
 const source=(url,label)=>'<div class="analysis-sources"><a href="'+url+'" target="_blank" rel="noopener">'+label+' ↗</a></div>';
 const fmt=(v,d=2)=>Number(v.toFixed(d)).toString();
 const signed=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toLocaleString('en-US');
 const box=(controls,caption)=>ui.box('',controls,caption);
 const points=(a,b,count,f)=>Array.from({length:count},(_,i)=>{const x=a+(b-a)*i/(count-1);return [x,f(x)];});
 const svg=(name,h,body)=>'<svg class="theory-lab-svg" viewBox="0 0 360 '+h+'" role="img" aria-label="'+name+'">'+body+'</svg>';
 const poly=(pts,cls='el-edge')=>'<polyline class="'+cls+'" points="'+pts.map(pt=>pt.join(',')).join(' ')+'"/>';
 const line=(x,y,X,Y,cls)=>poly([[x,y],[X,Y]],cls);
 const label=(x,y,text)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle">'+text+'</text>';
 const dot=(x,y)=>'<circle class="lab-mark" cx="'+x+'" cy="'+y+'" r="4"/>';
 const rect=(x,y,w,h,cls='el-soft')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" class="'+cls+'"/>';
 function arrow(x,y,X,Y,cls='el-force'){
  const angle=Math.atan2(Y-y,X-x);
  const tip=side=>[X-7*Math.cos(angle+side*.54),Y-7*Math.sin(angle+side*.54)];
  return line(x,y,X,Y,cls)+poly([tip(-1),[X,Y],tip(1)],cls);
 }
 const diamond=(x,y)=>poly([[x,y-5],[x+5,y],[x,y+5],[x-5,y],[x,y]]);
 const calcConnector=(f,count)=>{
  const {modal}=C.two(f,.04,'single',0,count);
  const relative=C.sub(modal[0],modal[1]);
  return {mean:1000*C.amp(C.scale(C.add(...modal),.5)),stress:C.amp(C.mul([400,16],relative))};
 };
 const shape=(n,x)=>x===.5?(n===1?1:0):Math.sin(n*Math.PI*x);
 function beamResponse(f,a,b){
  return C.amp([1,2].reduce((sum,n)=>{
   const fn=10*n*n;
   const denominator=[4*Math.PI**2*(fn*fn-f*f),4*Math.PI**2*.04*fn*f];
   return C.add(sum,C.div([shape(n,a)*shape(n,b),0],denominator));
  },[0,0]))*1e6;
 }
 const labs={
  mass:{
   html:()=>box(ui.select('count','応答に使うモード',[['1','同方向の1次だけ'],['2','同方向の1次と逆方向の2次']],'1'),
    '両端を地面のばねで支えた同じ質量2個を、細い軸材で結びます。左だけを1 Nで加振します。上図の矢印は採用したモードの向きです。下図は軸材の軸応力振幅で、地面のばねの応力は含みません。'),
   draw(e,v){
    const count=Number(v.count),value=calcConnector(4,count);
    const spring=(x,y)=>poly([[x,y],[x+8,y],[x+13,y-5],[x+19,y+5],[x+25,y-5],[x+31,y+5],[x+36,y],[x+44,y]]);
    const track=rect(85,43,40,31)+rect(235,43,40,31)+line(36,42,36,75)+line(324,42,324,75)+spring(40,59)+spring(276,59)+rect(125,56,110,6,'el-fill')+dot(180,59)+label(102,65,'m₁')+label(253,65,'m₂')+arrow(50,28,101,28)+label(57,22,'F')+label(180,47,'σₐ');
    const shapes=arrow(100,93,126,93,'el-edge')+arrow(251,93,277,93,'el-edge')+label(178,97,'φ₁')+
     (count===2?arrow(100,119,126,119,'el-edge')+arrow(251,119,225,119,'el-edge')+label(178,123,'φ₂'):'');
    e.plot.innerHTML=svg('二質点を結ぶ軸材の位置と採用モード',139,track+shapes)+graphics.chart({
     id:'result-modal-stress',label:'軸材の軸応力振幅の比較',x:[.85,5.9],y:[-.45,9.4],xt:[1,2,3,4,5,5.5],yt:[0,2,4,6,8],xl:'f (Hz)',yl:'|σₐ| (MPa)',ph:112,
     series:[{pts:[[.85,0],[5.9,0]],dash:'5 4'},{pts:points(.85,5.9,161,f=>calcConnector(f,count).stress),dash:'',strong:true}],marks:[[4,value.stress]]
    });
    e.readout.textContent='X方向の累積有効質量比 100％。4 Hzで、2質点の平均変位の振幅は '+fmt(value.mean)+' mm、軸材の公称軸応力の振幅は '+fmt(value.stress)+' MPa。'+
     (count===1?'同方向のモードだけなので、軸材の両端が同じ距離だけ動きます。':'逆方向のモードも入ると、軸材の両端に相対変位が生じます。');
   }
  },
  peak:{
   html:()=>box(ui.select('load','上下に加振する位置',[['.25','左の腹（L/4）'],['.5','中央の節（L/2）']],'.25')+
    ui.select('sensor','上下の変位を読む位置',[['.25','左の腹（L/4）'],['.5','中央の節（L/2）'],['.75','右の腹（3L/4）']],'.25'),
    '両端単純支持梁の1次10 Hzと2次40 Hzで計算する例です。上の実線は2次のモード形、破線は元の梁。Fは上向きの点荷重、◇は変位を読む位置。下図の丸は40 Hzでの応答です。'),
   draw(e,v){
    const a=Number(v.load),b=Number(v.sensor),x=t=>43+274*t,y=t=>66-32*shape(2,t);
    const support=s=>poly([[s-9,80],[s,66],[s+9,80],[s-9,80]]);
    const value=beamResponse(40,a,b);
    e.plot.innerHTML=svg('曲げ2次のモード形に対する加振位置と観測位置',139,
     line(x(0),66,x(1),66,'el-ghost')+support(x(0))+support(x(1))+line(305,85,328,85)+
     poly(points(0,1,81,t=>y(t)).map(([t,Y])=>[x(t),Y]))+diamond(x(b),y(b))+
     arrow(x(a),121,x(a),75)+label(x(a)+14,118,'F')+label(180,21,'φ₂'))+
     graphics.chart({id:'result-hidden-peak',label:'40 Hz周辺の変位振幅',x:[33,47],y:[-20,460],xt:[34,36,38,40,42,44,46],yt:[0,100,200,300,400],xl:'f (Hz)',yl:'|u| (µm)',ph:120,
      series:[{pts:[[40,0],[40,400]],dash:'5 4'},{pts:points(33,47,141,f=>beamResponse(f,a,b)),dash:'',strong:true}],marks:[[40,value]]});
    const input=shape(2,a)===0,output=shape(2,b)===0;
    const diagnosis=input&&output?'加振点も観測点も2次の節です。':input?'2次の節を押しているため、2次への入力がありません。':
     output?'2次は揺れていますが、観測点が節のため、ここには2次の変位が出ません。':'加振点も観測点も腹にあるので、40 Hz付近に2次のピークが現れます。';
    e.readout.textContent='40 Hzの変位振幅 '+fmt(value,1)+' µm。'+diagnosis+
     (input||output?'小さく残る変位は1次モードの寄与です。':'左を押したまま反対側の腹で測ると、2次の寄与の符号が逆になります。');
   }
  },
  support:{
   html:()=>box(ui.select('k','根元の回転剛性 kθ',[['fixed','完全固定'],['18','18 × 10⁶ N·mm/rad'],['9','9 × 10⁶ N·mm/rad']],'fixed'),
    '長さ300 mmの梁の先端に下向き100 N。根元の並進はどの条件でも固定します。水平の破線は変形前、曲線の破線は完全固定での曲げ、太い実線は選んだ根元条件での変形です。短い斜めの点線で、根元での梁の傾きを示します。たわみは拡大しています。'),
   draw(e,v){
    const tilt=v.k==='fixed'?0:30_000/(Number(v.k)*1e6);
    const curve=(x,t)=>56+20*(x*x*(3-x)/2+300*t*x);
    const xs=x=>57+250*x;
    const path=(t,cls)=>poly(points(0,1,41,x=>curve(x,t)).map(([x,y])=>[xs(x),y]),cls);
    const tip=curve(1,tilt);
    e.plot.innerHTML=svg('根元が回転する場合と完全固定の場合のたわみ',124,
     line(57,31,57,82)+Array.from({length:6},(_,i)=>line(48,37+i*8,57,29+i*8)).join('')+
     line(57,56,307,56,'el-ghost')+path(0,'el-ghost')+path(tilt,'el-edge')+
     (tilt?line(57,56,177,56+20*300*tilt*.48,'lab-ref')+label(167,84,'θ₀'):'')+dot(307,tip)+
     arrow(307,16,307,49)+label(274,27,'100 N')+line(315,56,330,56,'el-dimension')+
     line(315,tip,330,tip,'el-dimension')+line(324,56,324,tip,'el-dimension')+label(339,(56+tip)/2+4,'δ'));
    e.readout.textContent='根元の回転 '+fmt(tilt*1000,3)+' mrad、先端たわみ '+fmt(1+300*tilt)+' mm（梁自体の曲げ 1 mm ＋ 根元回転分 '+fmt(300*tilt)+' mm）。どの場合も根元反力は上向き100 N、反力モーメントの大きさは30,000 N·mmです。';
   }
  },
  bolts:{
   html:()=>box(ui.slider('offset','荷重位置の偏心 e（mm）',-40,40,5,20),
    '上から見た取付板。A・Bは板の面内せん断を受け持つ2本のボルトです。Pは外力、RₐとRᵦは各ボルトから板へ働く反力。面の摩擦は0とした静力学の例です。反力矢印の長さは力に比例します。'),
   draw(e,v){
    const offset=Number(v.offset),a=500*(1-offset/40),b=1000-a,x=180+offset*2;
    const reaction=(X,value)=>value===0?'':arrow(X,77,X,77+value*.044);
    e.out.offset.textContent=offset;
    e.plot.innerHTML=svg('二本のボルトの間を偏心荷重が動く',162,rect(67,57,226,53)+
     line(180,51,180,118,'el-ghost')+dot(100,77)+dot(260,77)+arrow(x,56,x,18)+label(x+16,30,'P')+
     reaction(100,a)+reaction(260,b)+label(84,70,'A')+label(276,70,'B')+label(87,143,'Rₐ')+label(273,143,'Rᵦ')+
     line(100,128,260,128)+line(100,123,100,133)+line(260,123,260,133)+label(180,147,'80 mm'));
    e.readout.textContent='外力は＋Yへ1,000 N。板への反力は A '+signed(-a)+' N、B '+signed(-b)+' N（＋Y基準）。'+
     '反力の合計 −1,000 N。板の中央まわりの外力モーメント '+signed(1000*offset)+' N·mm、反力モーメント '+signed(-1000*offset)+' N·mm。';
   }
  }
 };

 const sections={
  'modal-frequency':[
   ['有効質量が100％でも、取付部の応力が変わる','modal-stress-check',
    p('同じ重さの二つの機器を細い筋交いで結びます。左の機器だけに周期的な横荷重がかかります。緩みや疲労が気になるのは、その二つを結ぶ筋交いです。2台が同じ向きに同じ距離だけ動けば筋交いは伸びず、逆向きに動けば引張・圧縮を繰り返します。')+
    figure('mass')+
    p('各質量は1 kg、地面ばね2本と軸材の軸剛性は各400 N/m。軸材断面は1 mm²とし、全剛性の構造減衰係数をG＝0.04とした理論計算です。軸応力振幅は軸材の複素軸力の大きさを断面積で割った値です。')+
    table(['確認すること','出力で見る場所'],[
     ['基盤がXに一様に動く条件','SOL 103の有効質量比では、1次だけで100％です。逆方向に動く2次では、X方向に一様に与えた慣性力のモードへの寄与が相殺されます。'],
     ['左だけに力が入る条件','加振点のモード形から、2次にも力が入ると分かります。1次だけでは軸応力は0 MPa。2次まで採用すると、同じ4 Hzで '+fmt(calcConnector(4,2).stress)+' MPaです。平均変位の振幅はどちらも '+fmt(calcConnector(4,2).mean)+' mmです。'],
     ['手元のモデルを照合','荷重、周波数点、減衰、応力の位置・成分をそろえて保持モードを増やします。同じ取付断面の応力振幅と帯域内のピークを比較し、案件で決めた許容差に入るか確認します。残余ベクトルの設定も記録します。']
    ])+
    p('実務で応力を読むなら '+card('CASE_STRESS','STRESS')+' で対象断面・成分を押さえます。軸材をばねで置き換えたモデルでは '+card('CASE_FORCE','FORCE')+' からエレメントの力を照合し、断面積を定義できるときだけ公称応力に換算します。必要に応じ、同じ物理条件で直接法 SOL 108 と比較します。')+
    question('有効質量比100％と平均変位の一致だけで、筋交いまで評価できる？','この例では2次の有効質量が0でも、局所荷重には応答します。先に比較するのは、2次を追加したときの筋交いの同じ断面における軸応力です。')+
    source('https://ansyshelp.ansys.com/public/views/secured/corp/v251/en/ans_thry/thy_anproc3.html','刺激係数と方向別有効質量の定義（Ansys理論資料）')],
   ['40 Hzのピークが消えたとき、加振点と観測点を切り分ける','modal-peak-check',
    p('細長い梁の1/4位置をたたくと、40 Hz付近に山が出ます。計測点を梁の中央に移したら、同じ力で加振しても山が消えました。今度は加振点を中央に移し、計測点を元へ戻してみます。二通りの操作で山が消える理由を、形とグラフで追います。')+
    figure('peak')+
    p('一様な単純支持梁の最初の2モードを使い、各モードの一般化質量を1 kg、粘性減衰比を2％、加振力を1 Nとした理論計算です。')+
    table(['調べる順番','読み方'],[
     ['1. 固有値とモード形','SOL 103で対象の周波数とモード形を開きます。荷重方向とセンサー方向それぞれについて、対象点のモード成分を見ます。'],
     ['2. 周波数点と基底','SOL 111で対象モードが基底に入り、その固有振動数付近を十分細かく計算しているかを確認します。METHODとFREQUENCYをそれぞれ照合します。'],
     ['3. 片方ずつ変えて比較','元の荷重点を固定して観測点だけを節から腹へ移します。次に腹での観測を固定し、荷重点だけを移します。変位の振幅と位相を同じ加振基準で比較します。']
    ])+
    p('固有値表の読み方は <a href="analysis.html#modes/baseline/results">実固有値解析の結果</a>、節と腹の意味は <a href="theory.html#modal-frequency">モーダル周波数応答の理論</a> で確認できます。')+
    question('中央のセンサーに山がない。中央をもっと強く押せば40 Hzの山が出る？','この理想対称梁の曲げ2次では、中央は加振にも観測にも効かない位置です。先に腹にセンサーを置き、荷重点を中央と腹で切り替えると、2次が励起されたかを切り分けられます。')+
    source('https://community.sw.siemens.com/s/article/Modal-Driving-Point-Survey-What-s-at-Stake','加振点の場所と見えるモード（Siemens）')]
  ],
  static:[['梁とシェルで先端たわみが合わないとき、取付部の回転を調べる','support-rotation-check',
   p('板から突き出した腕の先端を下に押します。梁モデルでは根元の1節点を完全固定、シェルモデルでは取付板を面で固定し、腕と板を結びます。荷重と反力の合計は合っているのに、シェルの腕がよくたわむなら、腕の根元が取付板と一緒に回っているかを確認します。')+
   figure('support')+
   p('曲げ剛性EI＝9×10⁸ N·mm²の一様梁で、梁自体の曲げたわみは PL³/(3EI)＝1 mm。根元が θ₀ だけ回ると、同じ梁に根元回転分 Lθ₀ が加わります。この計算例ではせん断たわみを省き、回転剛性だけを変えます。')+
   table(['出力をそろえる順番','照合する量'],[
    ['1. 荷重と反力','同じ座標系で '+card('CASE_SPCFORCES','SPCFORCES')+' を見ます。シェルの複数の拘束点に反力が分散する場合は、各点の力によるモーメントも同じ基準点まわりに集計します。'],
    ['2. 腕の根元','梁の曲げ回転と、シェル上の同じ断面・近傍点の変位から得た傾きを照合します。シェルの法線まわりの回転成分をそのまま曲げ回転と照合すると、軸が合いません。'],
    ['3. 腕の曲げ','取付直近の局所変形域を避け、同じ位置に比較断面を取ります。断面力の分布が近く、根元の回転分を差し引くと曲線が重なるか確認します。差が残る場合は、断面剛性・荷重位置・結合の範囲も照合します。']
   ])+
   question('合計反力も根元のモーメントも同じ。先端たわみが違うのは計算ミス？','支持反力は釣合いを確認する値です。この図ではどちらの反力も等しくても、根元の回転により先端のたわみは1〜2 mmになります。変位と回転を別に確認します。')]],
  contact:[['偏心荷重を受けるボルトの負担を検算する','bolt-load-check',
   p('2本のボルトで板を壁に留め、板の面に沿って1,000 Nを引っ張ります。引く位置を右へ移すと、中央に荷重を掛けたときと総荷重は同じでも、右ボルトの負担が増えます。まず摩擦がせん断を伝えない場合を、板を切り出して確認します。')+
   figure('bolts')+
   p('Aをx＝−40 mm、Bを＋40 mmに置き、＋Yの荷重を2本の間に掛けます。＋Zまわりをモーメントの正とします。荷重が中央なら各500 N、右へ20 mmずらすとAが250 N、Bが750 Nです。反力の大きさの和は1,000 N。BとAの負担の差500 Nに中央からの腕40 mmを掛けると、外力と逆向きの20,000 N·mmになります。')+
   table(['実際の解析モデルで見る量','どこを確認するか'],[
    ['ボルトごとの軸力・せん断力','梁でモデル化したボルトなら '+card('CASE_FORCE','FORCE')+' の断面力から、ボルト軸方向と軸に直交する成分を確認。ソリッドなら軸部の同じ断面を切り、節点力などから断面合力を求めます。'],
    ['接触面が負担する力','締付けだけの増分と外力を加えた増分を対応させます。摩擦付きの場合は、評価したい接触面の接線力と、固着・滑りの範囲を合わせて確認します。ボルトの負担は外力の増分に対応する成分で比べます。'],
    ['板全体の釣合い','板の片側だけを切り出します。ボルト断面を横切る力と、別の部品からその板の接触面へ入る力を、共通の座標と基準点で合計します。同じ荷重経路をボルト断面力と支持反力で二重に足さないようにします。']
   ])+
   p('局所の力の流れを追うときは '+card('CASE_GPFORCE','GPFORCE')+'、支持全体との照合には '+card('CASE_SPCFORCES','SPCFORCES')+' を参照します。面接触の力は使用するSOL・版での接触出力を確認し、板に作用する側の値だけを足します。')+
   question('A・Bがどちらも500 Nなら、合力が合うので偏心20 mmでも正しい？','500 Nずつでは中央まわりの反力モーメントが0です。偏心20 mmの外力は＋20,000 N·mm。Aを250 N、Bを750 Nとすると、反力が−20,000 N·mmを負担してつり合います。')+
   source('https://nexus.hexagon.com/community/cfs-file/__key/communityserver-discussions-components-files/811/MyFreebody_5F00_revb.pdf','節点力と切り出し断面の釣合い（MSC資料）')]]
 };
 function bind(root){
  for(const node of root.querySelectorAll('[data-result-check]'))ui.mount(node,labs[node.dataset.resultCheck]);
 }
 window.AnalysisResultChecks={sections:(key)=>(sections[key]||[]).map(([title,id,body])=>[title,body,id]),bind};
})();
