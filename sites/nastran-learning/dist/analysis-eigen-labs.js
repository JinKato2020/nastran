(() => {
 'use strict';
 const C=window.AnalysisEigenCore,ui=window.BeamLabs.ui,g=window.BeamLabs.graphics;
 const n=v=>Number(v.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:8});
 const states=new Map(),ink='#48627e',blue='#2c60ad',red='#ad3928',green='#1b705a';
 const path=(d,color=ink,width=2,dash='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-dasharray="'+dash+'"/>';
 const txt=(x,y,t)=>'<text x="'+x+'" y="'+y+'" text-anchor="middle" fill="'+ink+'">'+t+'</text>';
 const svg=body=>'<svg class="theory-lab-svg" viewBox="0 0 360 180" role="img" aria-label="選択条件の模式図"><g font-family="system-ui,sans-serif" font-size="13">'+body+'</g></svg>';
 function modeShape(order){
  const points=Array.from({length:81},(_,i)=>[40+i*3.5,93-42*Math.sin(order*Math.PI*i/80)].join(',')).join(' ');
  return svg(path('M40 93H320',ink,2,'6 4')+'<polyline points="'+points+'" fill="none" stroke="'+green+'" stroke-width="3"/>'+path('M40 97l-11 18h22Z M320 97l-11 18h22Z',blue)+path('M23 124H57 M303 124H337',blue)+txt(180,155,'φ(x) = sin(nπx/L)')+txt(40,140,'0')+txt(320,140,'L')+txt(180,22,'n = '+order));
 }
 function twoDiagram(){
  return svg(path('M26 43v66 M18 50l8-7 M18 62l8-7 M18 74l8-7 M18 86l8-7',blue)+
   path('M26 70h12l7-9 12 18 12-18 12 18 7-9h12 M160 70h12l7-9 12 18 12-18 12 18 7-9h12')+
   '<rect x="100" y="48" width="60" height="44" fill="#eaf1fa" stroke="'+ink+'"/><rect x="240" y="48" width="60" height="44" fill="#eaf1fa" stroke="'+ink+'"/>'+
   path('M181 112v32 M173 120l8-8 M173 132l8-8 M173 144l8-8 M181 130h50 M231 120v20 M221 117h21v26h-21 M242 130h28V92',blue)+
   txt(130,75,'m₁')+txt(270,75,'m₂')+txt(65,42,'k₁')+txt(200,42,'k₂')+txt(222,160,'c')+
   path('M106 117h42m-6-5 6 5-6 5 M246 32h42m-6-5 6 5-6 5',red)+txt(130,142,'q₁')+txt(270,21,'q₂')+txt(180,175,'m₁=m₂=1 kg   k₁=k₂=400 N/m'));
 }
 function render(id,kind){
  const key=id+':'+kind,s=states.get(key)||{};
  let controls,caption;
  if(kind==='pre'){
   const initial=C.prestress(id).ratio;
   controls=ui.slider('ratio','部材の軸力 N / Pcr（引張＋・圧縮−）',-1.2,1,.05,s.ratio??initial)+ui.select('order','比較する弱軸曲げの次数',[['1','1次'],['2','2次'],['3','3次']],s.order||'1');
   caption='一様な両端ピン梁の理論。実線・破線・一点鎖線は弱軸曲げの1・2・3次。横軸は部材内部の軸力です。青い支持は横変位を止め、右端は軸方向に動けます。表示形状の振幅は任意です。';
  }else if(kind==='decay'){
   controls=ui.slider('c','粘性係数 c（N·s/mm）',0,.06,.0005,s.c??(id.includes('damped')&&!id.includes('undamped')?.055:0));
   caption='梁を静たわみ形1つで近似した独立計算。m*=33ρAL/140、k*=3EI/L³、先端変位を1に規格化。初期変位1・初期速度0の自由減衰を示します。この1自由度の根は、全梁のNastran実行結果ではありません。上は時間変化、下は根の複素平面。虚軸の左が減衰、実軸上は虚部0の根です。';
  }else{
   controls=ui.slider('c','右側ダンパ c（N·s/m）',0,12,.5,s.c??4)+ui.select('basis','縮約に残す実モード',[['1','低い方の1モード'],['2','2モード（この系の全基底）']],s.basis||'1');
   caption='打切りの仕組みを見る別の2自由度系。物理座標の直接計算と実モードへの縮約を比べます。実部も虚部も確認し、局所ダンパによるモード間の連成を保持します。N・m・s・kg系で、上の梁とは単位系が異なります。';
  }
  return '<figure data-eigen-lab="'+key+'" data-kind="'+kind+'" data-model="'+id+'">'+ui.box('',controls,caption)+'</figure>';
 }
 function bind(root){
  for(const fig of root.querySelectorAll('[data-eigen-lab]')){
   const id=fig.dataset.model,kind=fig.dataset.kind,key=fig.dataset.eigenLab;
   ui.mount(fig,{html:()=>fig.innerHTML,draw:(el,v)=>{
    states.set(key,v);for(const [k,out]of Object.entries(el.out))out.textContent=n(+v[k]);
    if(kind==='pre'){
     const order=+v.order,d=C.prestress(id,order,+v.ratio);
     const series=[1,2,3].map((j,i)=>({dash:['','6 4','8 3 2 3'][i],pts:Array.from({length:111},(_,k)=>{const r=-1.2+k*.02,x=C.prestress(id,j,r);return x.f===null?null:[r,x.f/x.f0];}).filter(Boolean)}));
     el.plot.innerHTML=g.chart({id:'eigen-pre',label:'軸力と固有振動数比',x:[-1.2,1],y:[0,1.5],xt:[-1,-.5,0,.5,1],yt:[0,.5,1,1.5],xf:n,yf:n,xl:'N/Pcr',yl:'f_n / f_n0',series,marks:d.f===null?[]:[[+v.ratio,d.f/d.f0]]})+modeShape(order);
     const unstable=+v.ratio<=-1;
     el.readout.innerHTML='<b>N='+n(d.N)+' N、Pcr='+n(d.Pcr)+' N、λ='+n(d.lambda)+' s⁻²</b><br>'+
      (d.f===null?'この次数のλは負。安定した周期振動の周波数へは換算できません。':order+'次：f='+n(d.f)+' Hz、無荷重比='+n(d.f/d.f0))+
      '<br>'+(unstable?'1次のλが0以下なので、この基準状態は安定な微小振動の比較範囲を外れます。2次・3次が正でも、全体の安定を保証しません。':'圧縮では横方向の復元力が減り、引張では増えます。高次は同じ荷重でも相対的な変化が小さくなります。')+
      (id==='pre-blocked'?'<br>選択モデルの実際の部材軸力は0です。スライダーは「もし部材へ軸力が入ったら」の比較で、入力荷重をそのまま使う操作ではありません。':'');
    }else if(kind==='decay'){
     const d=C.beamApprox(+v.c),tmax=.16,pts=Array.from({length:241},(_,i)=>[tmax*i/240,C.decay(d,tmax*i/240)]),r=d.roots;
     el.plot.innerHTML=g.chart({id:'eigen-decay',label:'粘性係数と自由減衰の形',x:[0,tmax],y:[-1.1,1.1],xt:[0,.04,.08,.12,.16],yt:[-1,0,1],xf:n,yf:n,xl:'t (s)',yl:'q(t) / q(0)',series:[{pts},{pts:[[0,1],[tmax,1]],dash:'5 4'}]});
     const left=Math.min(-d.wn,...r.map(z=>z[0]))*1.1;
     el.plot.innerHTML+=g.chart({id:'eigen-root-plane',label:'複素平面上の根',x:[left,d.wn*.2],y:[-d.wn*1.1,d.wn*1.1],xt:[left,left/2,0],yt:[-d.wn,0,d.wn],xf:n,yf:n,xl:'σ (1/s)',yl:'ωd (rad/s)',series:[{pts:[[0,-d.wn*1.1],[0,d.wn*1.1]],dash:'5 4'}],marks:r});
     const roots=r.map(z=>n(z[0])+(z[1]?' '+(z[1]>0?'+':'−')+' i '+n(Math.abs(z[1])):'')).join(' / ');
     el.readout.innerHTML='<b>ζ='+n(d.zeta)+'、s='+roots+' s⁻¹</b><br>m*='+n(d.m)+' tonne、k*='+n(d.k)+' N/mm。fₙ='+n(d.fn)+' Hz。<br>'+
      (d.zeta<1?'減衰振動数f_d='+n(d.fd)+' Hz。振動しながら減衰します（c=0では減衰しません）。':'虚部は0です。変位が減っても往復振動はしません。減衰を増やすほど常に早く戻るとは限りません。')+
      '<br>臨界係数2√(k*m*)='+n(2*Math.sqrt(d.k*d.m))+' N·s/mm。c=0.055はこの近似の臨界値を超えるため、小減衰の式をそのまま使えません。';
    }else{
     const d=C.twoDof(+v.c),full=d.roots,reduced=+v.basis===2?full:[d.reduced];
     const rows=full.map((z,i)=>['直接・'+(i+1),n(z[0]),n(z[1]),n(z[1]/(2*Math.PI))]).concat(reduced.map((z,i)=>['縮約・'+(i+1),n(z[0]),n(z[1]),n(z[1]/(2*Math.PI))]));
     el.plot.innerHTML=twoDiagram()+window.LessonArticle.table(['根','実部 σ（s⁻¹）','虚部 ωd（rad/s）','f_d（Hz）'],rows);
     el.readout.innerHTML='<b>ΦᵀCΦ の非対角項='+n(d.modalC[0][1])+' kg/s</b><br>'+
      (+v.basis===2?'全2モードを残すので、この有限自由度系では座標変換だけになり、直接計算と同じ根を得ます。':'1モードでは第2の根を表せません。第1根の周波数誤差='+n((reduced[0][1]/full[0][1]-1)*100)+'%。周波数差が小さくても、実部の差と欠けた根を別に確認します。')+
      '<br>cが0でないと、実モードに変換しても減衰行列の非対角成分が残ります。これを0にするのは、モード数を選ぶ操作とは別の近似です。';
    }
   }});
  }
 }
 const old=window.renderAnalysisScenarioDiagram;
 window.renderAnalysisScenarioDiagram=id=>{
  if(id==='pre-critical')return old('pre-compression').replaceAll('1727','3108.93');
  if(id==='pre-blocked')return old('pre-compression').replaceAll('M=0, uₓ','M=0, uₓ=0').replaceAll('ピン（軸方向に可動）','ピン（軸方向も拘束した誤設定）')+
   '<p class="element-note">右端は誤設定として軸方向も拘束。集中荷重は同じ節点の反力へ流れ、梁の軸力は0です。</p>';
  return old(id);
 };
 window.AnalysisEigenLabs={render,bind,modeShape,twoDiagram};
})();
