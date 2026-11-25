(() => {
 'use strict';
 const C=window.AnalysisResponseCore,ui=window.BeamLabs.ui,g=window.BeamLabs.graphics,A=window.LessonArticle;
 const states=new Map(),ink='#48627e',blue='#2c60ad',red='#ad3928',green='#1b705a';
 const n=x=>Number(x.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:7});
 const path=(d,c=ink,w=2,dash='')=>'<path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="'+w+'" stroke-dasharray="'+dash+'" stroke-linejoin="round"/>';
 const text=(x,y,t,c=ink)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+c+'">'+t+'</text>';
 const svg=body=>'<svg class="theory-lab-svg" viewBox="0 0 360 180" role="img" aria-label="2質点の支持・荷重と観測位置"><g font-family="system-ui,sans-serif" font-size="13">'+body+'</g></svg>';
 function twoDiagram(degrees=0,single=false,sensor=null){
  const arrow=(x,sign)=>path('M'+x+' 32h'+(sign*34)+'m'+(-sign*6)+' -5l'+(sign*6)+' 5 '+(-sign*6)+' 5',red,2.5);
  return svg(path('M20 57v46 M340 57v46',blue,4)+path('M11 65l9-8 M11 78l9-8 M11 91l9-8 M340 65l9-8 M340 78l9-8 M340 91l9-8',blue)+
   path('M20 80h12l6-8 10 16 10-16 10 16 6-8h16 M130 80h16l8-8 12 16 12-16 12 16 12-16 12 16 8-8h8 M270 80h12l6-8 10 16 10-16 10 16 6-8h16')+
   '<rect x="90" y="58" width="40" height="44" fill="#eaf1fa" stroke="'+ink+'"/><rect x="230" y="58" width="40" height="44" fill="#eaf1fa" stroke="'+ink+'"/>'+
   text(110,85,'m₁')+text(250,85,'m₂')+text(52,123,'k')+text(180,123,'k')+text(307,123,'k')+
   (sensor===null?'':'<circle cx="'+(sensor===0?110:250)+'" cy="102" r="5" fill="white" stroke="'+green+'" stroke-width="2.5"/>')+
   arrow(94,1)+text(110,19,'F₁')+(single?text(250,27,'F₂=0'):arrow(degrees===180?267:234,degrees===180?-1:1)+text(250,19,'F₂ · '+degrees+'°'))+
   path('M95 142h30m-6-5 6 5-6 5 M235 142h30m-6-5 6 5-6 5',green)+text(110,166,'u₁')+text(250,166,'u₂')+text(180,178,'m₁=m₂=1 kg   k=400 N/m'));
 }
 // The applied forces are shown in the model diagram; these arrows show mode shapes.
 function twoShapes(mode){
  const arrow=(x,y,dx)=>path('M'+x+' '+y+'h'+dx+'m'+(-Math.sign(dx)*6)+' -5l'+(Math.sign(dx)*6)+' 5 '+(-Math.sign(dx)*6)+' 5',blue,2.4);
  const row=(y,index)=>{
   const dx=index===1?32:-32;
   return text(26,y+4,'φ'+(index===1?'₁':'₂'))+
    [98,208].map((x,i)=>'<rect x="'+x+'" y="'+(y-12)+'" width="28" height="24" fill="#eaf1fa" stroke="'+ink+'"/>'+text(x+14,y+5,'G'+(i+1))).join('')+
    arrow(130,y,32)+arrow(dx>0?240:201,y,dx)+text(313,y+4,index===1?'0':'√2')+
    (index<=mode?path('M12 '+(y+19)+'H346',green,2):path('M12 '+(y+19)+'H346',ink,1,'3 4'));
  };
  return '<svg class="theory-lab-svg" viewBox="0 0 360 125" role="img" aria-label="両質点のモード形。上は同方向、下は逆方向。右に逆位相荷重の一般化荷重を表示"><g font-family="system-ui,sans-serif" font-size="13">'+text(309,16,'φᵀF')+row(42,1)+row(94,2)+'</g></svg>';
 }
 function rootAndTip(){
  return '<svg class="theory-lab-svg" viewBox="0 0 360 147" role="img" aria-label="片持ち梁。根元上面で長手方向の曲げ応力を、先端で板厚方向の変位を読む"><g font-family="system-ui,sans-serif" font-size="14">'+
   path('M44 51v60 M29 64l15-12 M29 78l15-12 M29 92l15-12 M29 106l15-12',blue,2)+
   '<rect x="45" y="70" width="256" height="13" fill="#eaf1fa" stroke="'+ink+'" stroke-width="2"/>'+
   path('M45 77Q170 78 301 115',blue,2,'6 4')+
   '<rect x="47" y="66" width="19" height="5" fill="'+green+'"/>'+path('M59 64l18-22h36',green)+text(88,33,'σₓ · A',green)+
   path('M301 28v34m-5-7 5 7 5-7',red,2.6)+text(295,21,'|F| = 1 N',red)+
   path('M316 84v29m-4-6 4 6 4-6',blue)+text(338,104,'|u₃|',blue)+
   text(52,130,'G1')+text(290,139,'G13')+'</g></svg>';
 }
 function render(id,kind){
  const saved=states.get(id+':'+kind)||{},v=(key,def)=>saved[key]??def;
  let controls,caption;
  if(kind==='sweep'||kind==='beam-modal'){
   const damping=id==='dfreq-low-damping'?.004:.04;
   controls=ui.slider('g','構造減衰 G（無次元）',.004,.08,.002,v('g',damping))+
    (kind==='sweep'?ui.select('step','計算点の間隔 Δf',[['2','2 Hz（11 Hzから）'],['.5','0.5 Hz（10 Hzから）'],['.1','0.1 Hz（10 Hzから）']],v('step',id==='dfreq-coarse'?'2':'.5')):
     ui.select('modes','この弱軸理論に残すモード数',[['1','弱軸1モード'],['2','弱軸2モード'],['6','弱軸6モード'],['8','弱軸8モード']],v('modes',id==='mfreq-one'?'1':'6')))+
    ui.slider('f','数値を読む加振周波数 f（Hz）',10,70,.1,v('f',kind==='beam-modal'?10:38.1));
   caption=id==='mfreq-six'?'同じ弱軸梁を先端で1 N加振した理論計算。上段は先端変位、下段は根元表面の曲げ応力。実線は弱軸8モード、破線は選んだモード数、丸は選択周波数。どちらの量が先に8モードの値に近づくかを比較します。':'一様なEuler–Bernoulli梁の弱軸曲げを8モードまで加算した理論目安。Nastranの実行値ではなく、軸・ねじり・強軸曲げを含む既存モデルのNDと弱軸次数は一致しません。上段は先端振幅（実線が8モード、モード数を選ぶ場合の破線が選択した基底）、下段は選択した条件での荷重に対する位相です。丸は評価した周波数を示します。';
  }else if(kind==='two'){
   controls=ui.select('load','荷重の組合せ',[['single','G1だけに1 N'],['same','両点に1 N・同位相'],['opposite','両点に1 N・逆位相']],v('load',id==='mfreq-antiresonance'?'single':'opposite'))+
    ui.select('modes','縮約に残すモード',[['1','対称な第1モードだけ'],['2','対称＋逆対称の2モード']],v('modes',id==='mfreq-antisymmetric'?'1':'2'))+
    (id==='mfreq-antiresonance'?ui.select('sensor','グラフに表示する観測点',[['0','G1（加振点）'],['1','G2（隣の質点）']],v('sensor','0')):'')+
    ui.slider('f','比較する周波数 f（Hz）',.1,8,.05,v('f',id==='mfreq-antiresonance'?Math.sqrt(800)/(2*Math.PI):Math.sqrt(1200)/(2*Math.PI)));
   caption='この2質点系だけの独立した行列計算（N・m・s・kg）。各質点はX方向だけ動き、両端のばねは地面へ接続。構造減衰G=0.04。図の荷重矢印は位相0°時点の向き。実線は物理座標の直接計算、破線は選択した基底による同じ観測点の変位振幅です。2モードなら線は重なります。'+(id==='mfreq-antiresonance'?'白丸を付けた質点が観測点です。':id==='mfreq-antisymmetric'?'逆位相を選ぶと、形の図の上段が同方向の1次、下段が逆方向の2次です。行の下線は実線が採用、点線が不採用。右欄は各モードへ実際に入る力です。':'');
  }else{
   controls=ui.slider('tau','矩形荷重の継続時間 τ（s）',.005,.08,.001,v('tau',id==='trans-short'?.005:.05))+
    ui.slider('z','この近似の粘性減衰比 ζ',0,.08,.005,v('z',.02))+
    ui.select('rise','立上り・立下り時間',[['0','瞬時（矩形）'],['.005','各0.005 s'],['.05','各0.05 s']],v('rise',id==='trans-ramp'?'.05':'0'))+
    ui.select('dt','独立積分の時間刻み Δt',[['.005','0.005 s'],['.001','0.001 s'],['.0005','0.0005 s'],['.0001','0.0001 s']],v('dt',id==='trans-coarse'?'.005':'.0005'))+
    ui.select('skip','出力間隔 NO（何刻みごとに保存）',[['1','1（毎刻み）'],['5','5'],['20','20']],v('skip','1'));
   caption='1自由度の等価系による独立検算。fₙは梁の弱軸1次、静たわみは18/k=6.1714 mm。青実線は解析解、破線は平均加速度Newmark法、丸は保存点。Nastran内部の積分法そのものの再現ではありません。上は荷重、下は変位。uは−Zを正として表示します。';
  }
  return '<figure data-response-lab="'+id+':'+kind+'" data-kind="'+kind+'" data-model="'+id+'">'+ui.box('',controls,caption)+'</figure>';
 }
 const chart=(id,label,x,y,xt,yt,xl,yl,series,marks=[])=>{
  const svg=g.chart({id,label,x,y,xt,yt,xf:n,yf:n,xl,yl,series,marks});
  // Dense saved times must remain visible without obscuring the two curves.
  return id==='response-time'?svg.replaceAll('r="4.5" class="lab-mark"','r="'+(marks.length>100?.7:2.6)+'" style="stroke-width:0.8" class="lab-mark"'):svg;
 };
 function bind(root){
  for(const fig of root.querySelectorAll('[data-response-lab]')){
   const id=fig.dataset.model,kind=fig.dataset.kind;
   ui.mount(fig,{html:()=>fig.innerHTML,draw:(el,v)=>{
    states.set(id+':'+kind,v);for(const [key,out]of Object.entries(el.out))out.textContent=n(+v[key]);
    if(kind==='sweep'||kind==='beam-modal'){
     const gg=+v.g,selected=kind==='sweep'?8:+v.modes;
     const fs=Array.from({length:1201},(_,i)=>10+i*.05).concat([C.fn]).sort((a,b)=>a-b);
     const ref=fs.map(f=>[f,C.amp(C.beam(f,gg))]),current=fs.map(f=>[f,C.amp(C.beam(f,gg,selected))]);
     const df=+(v.step||.5),start=df===2?11:10,marks=kind==='sweep'?C.sweep(start,df,Math.round(60/df),gg):[];
     const peak=Math.max(...ref.map(x=>x[1])),sample=marks.length?Math.max(...marks.map(x=>x[1])):C.amp(C.beam(+v.f,gg,selected));
     const value=C.beam(+v.f,gg,selected),angle=C.phase(value);
     let lower;
     if(id==='mfreq-six'){
      const stress=m=>fs.map(f=>[f,C.amp(C.beamRootStress(f,gg,m))]);
      const baseline=stress(8),chosen=stress(selected),top=1.1*Math.max(...baseline.map(p=>p[1]),...chosen.map(p=>p[1]));
      lower=chart('response-stress','根元表面の曲げ応力振幅',[10,70],[0,top],[10,30,50,70],[0,top/2,top],'f (Hz)','|σ| (MPa)',[{pts:baseline},{pts:chosen,dash:'6 4'}],[[+v.f,C.amp(C.beamRootStress(+v.f,gg,selected))]]);
     }else{
      lower=chart('response-phase','周波数・変位位相',[10,70],[-180,0],[10,30,50,70],[-180,-90,0],'f (Hz)','θ (°)',[{pts:fs.map(f=>[f,C.phase(C.beam(f,gg,selected))])}],[[+v.f,angle]]);
     }
     el.plot.innerHTML=chart('response-amplitude','周波数・先端変位',[10,71],[0,peak*1.12],[10,30,50,70],[0,peak/2,peak],'f (Hz)','|u| (mm)',[{pts:ref},...(kind==='beam-modal'?[{pts:current,dash:'6 4'}]:[])],kind==='sweep'?marks:[[+v.f,C.amp(value)]])+lower;
     el.readout.innerHTML='<b>f₁='+n(C.fn)+' Hz、f='+n(+v.f)+' Hz：|u|='+n(C.amp(value))+' mm、θ='+n(angle)+'°</b><br>'+
      (kind==='sweep'?'理論の最大付近='+n(peak)+' mm、選択点の最大='+n(sample)+' mm（'+n(100*sample/peak)+'%）。半値幅の目安Gf₁='+n(gg*C.fn)+' Hz。':'8弱軸モードとの差='+n(100*(C.amp(value)/C.amp(C.beam(+v.f,gg))-1))+'%。既存ND=6は全方向の低い6モードで、この「弱軸6モード」と同じ指定ではありません。')+
      (id==='mfreq-six'?'<br>同じ周波数の根元表面の曲げ応力：弱軸'+selected+'個で '+n(C.amp(C.beamRootStress(+v.f,gg,selected)))+' MPa、弱軸8個で '+n(C.amp(C.beamRootStress(+v.f,gg,8)))+' MPa。':'')+
      '<br>構造減衰なので静的極限にも複素剛性が残ります。Gを0へ近づけた静たわみは1/k='+n(1/C.k)+' mm。振幅は片振幅で、RMSや両振幅と区別します。';
    }else if(kind==='two'){
     const load=v.load,deg=load==='opposite'?180:0,mode=+v.modes,d=C.two(+v.f,.04,load==='single'?'single':'pair',deg,mode);
     const sensor=Number(v.sensor||0),symbol=sensor===0?'u₁':'u₂';
     const fs=Array.from({length:801},(_,i)=>i*.01),cur=fs.map(f=>{const x=C.two(f,.04,load==='single'?'single':'pair',deg,mode);return[f,C.amp(x.modal[sensor])*1000];}),ref=fs.map(f=>[f,C.amp(C.two(f,.04,load==='single'?'single':'pair',deg,2).direct[sensor])*1000]);
     const ymax=Math.max(...ref.map(x=>x[1]),...cur.map(x=>x[1]))*1.12;
     el.plot.innerHTML=(id==='mfreq-antisymmetric'&&load==='opposite'?twoShapes(mode):twoDiagram(deg,load==='single',id==='mfreq-antiresonance'?sensor:null))+chart('response-basis','基底と応答',[0,8],[0,ymax],[0,2,4,6,8],[0,ymax/2,ymax],'f (Hz)','|'+symbol+'| (mm)',[{pts:ref},{pts:cur,dash:'6 4'}],[[+v.f,C.amp(d.modal[sensor])*1000]])+
      A.table(['量','直接計算','選択した基底'],[['|u₁| (mm)',n(C.amp(d.direct[0])*1000),n(C.amp(d.modal[0])*1000)],['|u₂| (mm)',n(C.amp(d.direct[1])*1000),n(C.amp(d.modal[1])*1000)],['u₁の位相 (°)',n(C.phase(d.direct[0])??0),C.phase(d.modal[0])===null?'振幅0：定義しない':n(C.phase(d.modal[0]))]]);
     el.readout.innerHTML='<b>f₁='+n(d.frequencies[0])+' Hz、f₂='+n(d.frequencies[1])+' Hz</b><br>選択f='+n(+v.f)+' Hz、直接計算の|'+symbol+'|='+n(C.amp(d.direct[sensor])*1000)+' mm。<br>モード荷重の大きさ：|φ₁ᵀF|='+n(C.amp(d.generalized[0]))+'、|φ₂ᵀF|='+n(C.amp(d.generalized[1]))+'。<br>'+
      (load==='opposite'&&mode===1?'逆位相荷重は第1モードを励起しません。応答0は正解の静止ではなく、必要な第2モードを捨てた結果です。':load==='opposite'?'逆位相荷重は逆対称な第2モードだけを励起します。この理想対称系では第1モードの寄与は0です。2モードを保持しても、両方が必ず振動するわけではありません。':load==='single'?'G1への加振でu₁を読むと2モードの寄与が相殺する谷が現れます。無減衰の谷は√800/(2π)='+n(Math.sqrt(800)/(2*Math.PI))+' Hz。G=0.04では厳密な0にはなりません。':'対称な荷重は対称モードを励起します。この理想対称系では1モードでも応答を表せますが、非対称な質量・支持へ一般化しません。')+
      '<br>2モードを残せば、この2自由度系では座標変換だけなので直接計算と一致します。';
    }else{
     const tau=+v.tau,z=+v.z,dt=+v.dt,skip=+v.skip,rise=Math.min(+v.rise,tau),end=.2;
     const ref=Array.from({length:1601},(_,i)=>{const t=end*i/1600;return[t,C.pulse(t,tau,z,rise)];});
     const numeric=C.newmark({dt,tau,z,rise,end}),saved=numeric.filter((_,i)=>i%skip===0).map(x=>x.slice(0,2));
     const max=Math.max(...ref.map(x=>Math.abs(x[1]))),numMax=Math.max(...numeric.map(x=>Math.abs(x[1]))),savedMax=Math.max(...saved.map(x=>Math.abs(x[1]))),y=Math.max(2.1,max*1.1,numMax*1.1);
     el.plot.innerHTML=chart('response-force','荷重の立上り・除荷',[0,end],[-.05,1.2],[0,.05,.1,.15,.2],[0,1],'t (s)','P / 18 N',[{pts:ref.map(([t])=>[t,C.load(t,tau,rise)])}])+
      chart('response-time','解析解・積分・保存点',[0,end],[-y,y],[0,.05,.1,.15,.2],[-y,0,y],'t (s)','u / u_static',[{pts:ref},{pts:numeric.map(x=>x.slice(0,2)),dash:'6 4'}],saved);
     el.readout.innerHTML='<b>T₁='+n(1/C.fn)+' s、τ/T₁='+n(tau*C.fn)+'、保存間隔='+n(dt*skip)+' s</b><br>理論最大='+n(max*18/C.k)+' mm、積分点の最大='+n(numMax*18/C.k)+' mm、保存点の最大='+n(savedMax*18/C.k)+' mm。<br>'+
      'NOを変えても積分値は変わりません。Δtを変えると積分精度と荷重の表現が変わります。終了までの時間は同じ0.2 sにそろえます。'+
      (rise?'<br>立上りと立下りはそれぞれ'+n(rise)+' s（τを超える選択はτに制限）。立下りはτから始まり、τ＋立下り時間で荷重0。同じピーク18 N・力積18τで矩形と比較します。':'<br>除荷後の振幅は除荷時の変位と速度で決まります。τを長くすれば必ず残留振動が大きくなる、とは限りません。');
    }
   }});
  }
 }
 const old=window.renderAnalysisScenarioDiagram;
 window.renderAnalysisScenarioDiagram=id=>{
  if(id==='response-stress')return rootAndTip();
  if(id==='response-pair')return twoDiagram(180,false);
  if(id==='response-single')return twoDiagram(0,true);
  if(id==='response-ramp')return '<svg viewBox="0 0 360 184" role="img" aria-label="片持ち梁に有限時間で立ち上がる荷重を与える模式図"><g font-family="system-ui,sans-serif" font-size="14">'+path('M45 83v52',blue,4)+path('M33 91l12-8 M33 105l12-8 M33 119l12-8',blue)+path('M45 109H290',ink,4)+path('M290 74v29m-6-6 6 6 6-6',red,2.5)+path('M75 56h20l60-30 65 30h30',red,2)+text(166,16,'P(t)')+text(167,76,'0 → 18 N → 0')+text(45,150,'SPC')+text(290,150,'G13 · T3')+'</g></svg>';
  return old(id);
 };
 window.AnalysisResponseLabs={render,bind,twoDiagram};
})();