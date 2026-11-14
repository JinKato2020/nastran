/* Analytic waveforms for the theory lesson, using the same angular frequency in each case. */
(() => {
 'use strict';
 const frequency = 1;
 const cases = [
  {label:'減衰',sigma:-0.2,color:'#075a94',note:'実部が負なので、振動しながら振幅が小さくなります。'},
  {label:'振幅一定',sigma:0,color:'#526171',note:'実部がゼロなので、この単純な振動モードの振幅は一定です。'},
  {label:'成長',sigma:0.2,color:'#a33d32',note:'実部が正なので、振動しながら振幅が大きくなります。'},
 ];
 const fmt=value=>value===0?'0':(value<0?'−':'+')+Math.abs(value);
 const line=(d,stroke,width=1,dashed=false)=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dashed?'stroke-dasharray="5 4"':''}/>`;
 const plot=(evaluate,seconds,mid,scale)=>{
  const coords=Array.from({length:241},(_,i)=>{
   const t=i*seconds/240;
   return `${(37+274*i/240).toFixed(2)} ${(mid-scale*evaluate(t)).toFixed(2)}`;
  });
  return 'M'+coords.join('L');
 };
 const chart=(label,body)=>`<svg viewBox="0 0 340 160" role="img" aria-label="${label}"><g font-family="system-ui, sans-serif" font-size="12" fill="#344f6e">${body}</g></svg>`;
 const xaxis5=`${line('M37 21V140H311 M37 80H311','#718498')}
  <text x="36" y="155" text-anchor="middle">0</text>
  <text x="312" y="155" text-anchor="middle">5 s</text>
  <text x="16" y="84">0</text>
  <text x="39" y="16">相対変位</text><text x="270" y="155">時間</text>`;
 const envelope=(sigma,t)=>Math.exp(sigma*t);
 function plane(selected){
  return chart('複素平面の上半面。点の横位置が実部、縦位置が虚部。'+selected.label+'を選択中。',`
   <rect x="19" y="22" width="151" height="96" fill="#e8f4fc"/>
   <rect x="170" y="22" width="151" height="96" fill="#fbeeea"/>
   ${line('M19 118H321l-7-5m7 5l-7 5 M170 131V19l-5 7m5-7l5 7','#718498')}
   ${line('M19 57H321','#718498',1,true)}
   <text x="168" y="14" text-anchor="middle">虚部 ωd</text>
   <text x="18" y="51">2π rad/s</text>
   <text x="163" y="134" text-anchor="end">0</text>
   <text x="320" y="134" text-anchor="end">実部 σ</text>
   <text x="68" y="153" text-anchor="middle">減衰</text>
   <text x="170" y="153" text-anchor="middle">振幅一定</text>
   <text x="272" y="153" text-anchor="middle">成長</text>
   ${cases.map((item,index)=>`<circle cx="${68+index*102}" cy="57" r="${item===selected?7:4}" fill="${item===selected?item.color:'#fff'}" stroke="${item.color}" stroke-width="2"/>`).join('')}`);
 }
 function waveform({sigma,color,label}){
  return chart(label+'する1 Hzの自由振動。破線は振幅の包絡線。',`
   ${xaxis5}
   ${line(plot(t=>envelope(sigma,t),5,80,20),color,1.2,true)}
   ${line(plot(t=>-envelope(sigma,t),5,80,20),color,1.2,true)}
   ${line(plot(t=>envelope(sigma,t)*Math.cos(2*Math.PI*frequency*t),5,80,20),color,2)}
   <line x1="203" y1="18" x2="219" y2="18" stroke="${color}" stroke-dasharray="4 3"/>
   <text x="225" y="22">振幅の包絡線</text>`);
 }
 const growthFigure=`<figure class="eigen-figure">
  <figcaption>根を選んで、同じ振動数の波形を比べる</figcaption>
  <label class="eigen-select">振幅の変化
   <select id="eigen-growth">${cases.map(({label},index)=>`<option value="${index}">${label}</option>`).join('')}</select>
  </label>
  <div class="eigen-chart-grid" id="eigen-charts"></div>
  <p id="eigen-interpretation" aria-live="polite" class="eigen-interpretation"></p>
  <p class="eigen-note">振動数は3例とも1 Hzに固定。図では虚部が正の根を示しています。波形は式で計算した概念図です。</p>
 </figure>`;
 const phaseFigure=`<figure class="eigen-figure">
  <figcaption>2点の位相差が90°のとき</figcaption>
  ${chart('1周期のグラフ。Aは時刻ゼロで最大、Bは4分の1周期後に最大。',`
   ${line('M37 26V135H311 M37 80H311','#718498')}
   ${line('M105.5 42V135','#718498',1,true)}
   ${line(plot(t=>Math.cos(2*Math.PI*t),1,80,38),'#075a94',2.3)}
   ${line(plot(t=>Math.sin(2*Math.PI*t),1,80,38),'#a33d32',2.3,true)}
   <circle cx="37" cy="42" r="3.5" fill="#075a94"/><circle cx="105.5" cy="42" r="3.5" fill="#a33d32"/>
   <text x="37" y="35" fill="#075a94">Aの山</text><text x="110" y="35" fill="#a33d32">Bの山</text>
   <text x="37" y="152" text-anchor="middle">0</text>
   <text x="105.5" y="152" text-anchor="middle">T/4</text>
   <text x="311" y="152" text-anchor="middle">T</text>
   <text x="14" y="84">0</text><text x="39" y="17">相対変位</text><text x="268" y="152">時間</text>`)}
  <p class="eigen-note">青の実線がA、赤の破線がB。Tは1周期です。位相差を見やすくするため、振幅と増減率は両点でそろえています。</p>
 </figure>`;
 function connect(parent){
  const picker=parent.querySelector('#eigen-growth');
  const charts=parent.querySelector('#eigen-charts');
  const interpretation=parent.querySelector('#eigen-interpretation');
  function render(){
   const item=cases[Number(picker.value)];
   charts.innerHTML=plane(item)+waveform(item);
   interpretation.textContent=`実部 σ = ${fmt(item.sigma)} s⁻¹、虚部 ωd = 2π rad/s。${item.note}`;
  }
  picker.addEventListener('change',render);
  render();
 }
 window.EigenvalueVisuals={growthFigure,phaseFigure,connect};
})();
