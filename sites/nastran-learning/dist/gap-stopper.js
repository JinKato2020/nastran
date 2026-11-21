(() => {
 'use strict';
 const ui=window.BeamLabs.ui;
 const support=100, closed=1000, clearance=.5;
 function solve(load) {
   const d=load<=support*clearance ? load/support : (load+closed*clearance)/(support+closed);
   return {d, reaction:support*d, contact:closed*Math.max(0,d-clearance)};
 }
 const lab={
   html:()=>ui.box('stopper',ui.slider('p','押す荷重 P（N）',0,160,5,105),
     '左のばねが可動部を支え、右のストッパーが圧縮を受けます。破線はストッパーの初期位置。すきま・変位を拡大した概念図です。'),
   draw(el,v){
     const load=Number(v.p),{d,reaction,contact}=solve(load);
     const right=132+104*d, stop=132+104*clearance, face=Math.max(stop,right);
     const spring=Array.from({length:17},(_,i)=>(32+(right-68)*i/16)+','+(i%2?74:87)).join(' ');
     el.plot.innerHTML='<svg class="theory-lab-svg" viewBox="0 0 320 140" role="img" aria-label="支持ばね、動くブロック、すきまのあるストッパー"><path class="el-edge" d="M30 53V107M292 53V107"/>'+
       '<polyline class="el-edge" points="'+spring+'"/><rect class="b2-sec" x="'+(right-36)+'" y="62" width="36" height="37"/>'+
       '<rect class="b2-slab" x="'+face+'" y="62" width="'+(292-face)+'" height="37"/>'+
       '<path class="b2-ghost" d="M'+stop+' 45v68"/><text class="b2-small" x="65" y="114">k</text>'+
       '<text class="b2-small" x="236" y="117">KA</text>'+
       (load>0?'<path fill="none" class="b2-move" d="M'+(right-34)+' 44h27l-5 -4m5 4l-5 4"/><text class="b2-small" x="'+(right-32)+'" y="36">P</text>':'')+'</svg>';
     el.out.p.textContent=load+' N';
     el.readout.textContent=(load<50?'開':load===50?'接触開始':'閉')+'　接近量 '+d.toFixed(3)+' mm、支持ばね '+reaction.toFixed(1)+' N、ストッパー '+contact.toFixed(1)+' N。';
   }
 };
 document.addEventListener('DOMContentLoaded',()=>{
   const fig=document.querySelector('[data-gap-stopper]');
   if(fig)ui.mount(fig,lab);
 });
})();
