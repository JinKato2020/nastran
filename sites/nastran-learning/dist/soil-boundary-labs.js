(() => {
 'use strict';
 const ui=window.BeamLabs.ui;
 const text=(x,y,s)=>`<text class="b2-small" x="${x}" y="${y}">${s}</text>`;
 const waterBlue='#20647e',copper='#a34e24',plum='#854161';
 function arrow(x,y,X,Y,color,dashed=false) {
   const angle=Math.atan2(Y-y,X-x)*180/Math.PI;
   return `<path d="M${x} ${y}L${X} ${Y}" fill="none" stroke="${color}" stroke-width="2.6" ${dashed?'stroke-dasharray="4 3"':''}/><path d="M0 0l-8 -3.8v7.6z" fill="${color}" transform="translate(${X} ${Y}) rotate(${angle})"/>`;
 }
 // A is the right-hand edge of the footing. All three figures use the same physical section.
 function section(id,label,left,right,base,overlay) {
   const bands=[[60,107,'#e8d5a7'],[107,150,'#ddaa83'],[150,197,'#a2b2bb']];
   const strata=bands.map(([top,bottom,fill])=>`<rect x="8" y="${top}" width="344" height="${bottom-top}" fill="${fill}"/>`).join('');
   return `<svg class="theory-lab-svg" viewBox="0 0 360 204" role="img" aria-label="${label}" direction="ltr">
     <defs><pattern id="rock-${id}" width="16" height="9" patternUnits="userSpaceOnUse"><path d="M0 8l6-3 5 1 5-3" stroke="#647b88" stroke-width="1" fill="none"/></pattern></defs>
     ${strata}<rect x="8" y="150" width="344" height="47" fill="url(#rock-${id})"/>
     <path d="M8 107h344 M8 150h344" fill="none" stroke="#856b5c" stroke-width="1.4"/>
     <path d="M8 60h${left-8}v${base-60}H8z M${right} 60h${352-right}v${base-60}H${right}z M8 ${base}h344v${197-base}H8z" fill="white" opacity=".67"/>
     <path d="M8 60h344" stroke="#455f50" stroke-width="2"/>
     <path d="M${left} 60V${base}H${right}V60" fill="none" stroke="#245a7e" stroke-width="2.5" stroke-dasharray="7 3"/>
     <path d="M159 17h30v6h-30z M159 36h30v4h-30z M160 23v32m13-32v32m15-32v32" fill="#c6d6de" stroke="#29465d" stroke-width="2"/>
     <rect x="150" y="54" width="48" height="9" fill="#435c72"/><circle cx="198" cy="63" r="3.5" fill="#172f40" stroke="white"/>${text(204,56,'A')}${overlay}</svg>`;
 }
 function dashpot(x,y) {
   return `<g transform="translate(${x} ${y})" stroke="#245a7e" stroke-width="2" fill="none"><path d="M0 0h8m14-5H8V5h14m-3-8v6m0-3h13"/></g>`;
 }
 const labs={
   soilExtent:{
     html:()=>ui.box('soilExtent',ui.select('reach','Aから側面まで',[['20','20 m'],['40','40 m']],'20')+
       ui.select('floor','底面を置く位置',[['top','硬い層の上端'],['inside','硬い層の中']],'top'),
       '黒丸Aは基礎右端の観測点。破線の内側を要素で表し、淡く描いた外側は境界条件で表します。薄茶と橙は性質の異なる土層、模様のある灰色は硬い層です。'),
     draw(el,v){
       const L=Number(v.reach),right=198+1.65*L,base=v.floor==='top'?150:176;
       const dimension=`<path d="M198 37v-9m0 5H${right}m0-5v9" fill="none" stroke="#284a60" stroke-width="1.4"/>`+text((198+right)/2-13,25,L+' m');
       el.plot.innerHTML=section('extent','同じ断面で左右の切断面と底面の位置を変える',348-right,right,base,dimension);
       el.readout.textContent='Aから側面まで '+L+' m。Vs=200 m/sのS波が水平に往復する時間は '+(2*L/200).toFixed(2)+' 秒。'+(v.floor==='top'?'硬い層は底面条件で表します。':'硬い層の上部も要素に含まれ、底面と地層境界が別々の位置にあります。');
     }
   },
   soilSide:{
     html:()=>ui.box('soilSide',ui.select('side','側面に置く条件',[['ff','自由地盤境界'],['transmit','エネルギー伝達境界'],['fixed','側面固定（比較用）']],'ff'),
       '右側面に注目します。矢印は波の進む向き。FFは同じ地層で作った自由地盤の計算列です。破線の矢印は戻り波、斜線の壁は固定面を示します。'),
     draw(el,v){
       let sketch=arrow(202,74,253,89,copper),message;
       if(v.side==='ff'){
         sketch+='<path d="M296 60h15v90h-15z" fill="#f2e2be" stroke="#245a7e" stroke-width="2"/><path d="M296 107h15v43h-15z" fill="#ddaa83" stroke="#245a7e"/>'+
           text(293,52,'FF')+dashpot(264,82)+dashpot(264,126)+arrow(303,178,303,153,waterBlue);
         message='補助列FFも下から揺れます。同じ深さで速度差があると図のダンパーが働きます。FFから本体へ伝える地盤の力も条件に含めます。';
       }else if(v.side==='transmit'){
         sketch+=arrow(255,90,285,98,copper)+arrow(291,99,324,107,copper)+
           '<path d="M279 74q12 19 0 37m17-39q15 22 0 43" stroke="#925432" fill="none" stroke-width="1.6"/>';
         message='側面の外に続く成層地盤を想定します。外へ伝わる波と、それに伴い切断面に働く力を外部地盤の応答として扱います。';
       }else{
         sketch+='<path d="M264 60v90m0-81l8-7m-8 24l8-7m-8 24l8-7m-8 24l8-7m-8 24l8-7" stroke="#314353" stroke-width="2" fill="none"/>'+arrow(261,95,211,109,plum,true);
         message='側面の変位を止めると、右へ進んだ波が本体側へ反射します。遠方地盤が地震で動くという条件も失われます。';
       }
       el.plot.innerHTML=section('side','側面の固定、補助列との結合、外部への波の伝達を比較',84,264,150,sketch);
       el.readout.textContent=message;
     }
   },
   soilBase:{
     html:()=>ui.box('soilBase',ui.select('baseType','基盤の仮定',[['compliant','下方へ続く弾性基盤'],['rigid','運動を指定する剛基盤']],'compliant'),
       '左の上向き矢印が入射S波、右の下向き矢印が地盤から戻る波。左右の両矢印は水平な粒子運動です。'),
     draw(el,v){
       const rigid=v.baseType==='rigid';
       let sketch=arrow(128,rigid?148:184,128,78,waterBlue)+arrow(210,85,210,rigid?148:184,copper)+
         arrow(165,95,181,95,'#3a4e58')+arrow(165,95,149,95,'#3a4e58');
       if(rigid){
         sketch+='<path d="M84 150h180" stroke="#314353" stroke-width="4"/>';
         for(let x=89;x<264;x+=12)sketch+=`<path d="M${x} 152l-6 7" stroke="#314353" stroke-width="1.4"/>`;
         sketch+=arrow(220,146,220,98,plum,true)+arrow(145,176,169,176,'#3a4e58')+arrow(145,176,121,176,'#3a4e58');
       }
       el.plot.innerHTML=section('base','下から入る波と、剛基盤で反射または弾性基盤へ逸散する下降波',84,264,150,sketch);
       el.readout.textContent=rigid?'底面の水平運動を指定します。右の破線は戻った波が底面で再び上向きに反射する経路です。':'底面で上昇波を与え、下降波は下方へ通します。底の全変位や全加速度は応答として求まります。';
     }
   }
 };
 window.SoilBoundaryLabs={connect(root){for(const fig of root.querySelectorAll('[data-soil-lab]'))ui.mount(fig,labs[fig.dataset.soilLab]);}};
})();
