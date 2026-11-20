/* Worked numbers, interactive single-degree-of-freedom charts and self-check questions for
   the dynamics, damping and fracture theory lessons. The charts evaluate textbook formulas;
   they are not MSC Nastran results. Content merged from the retired dynamics/damping/fracture pages. */
(() => {
 'use strict';
 const T=window.NastranTheory,V=window.TheoryTopicVisuals||{};
 const entry=key=>T.find(e=>e.key===key);
 const dyn=page=>['https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Dynamic_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Dynamic_Analysis_User_Guide.pdf#page='+page,'MSC Nastran 2020 SP1 · Dynamic Analysis User Guide · PDF '+page];

 /* ---------- 実固有値解析 ---------- */
 entry('modes').sections.push(
  ['1自由度で数値を確かめる',[
   'ばね定数 k = 100 N/mm、質量 m = 0.01 t（10 kg）の1自由度モデルで考えます。固有角振動数は ωₙ = √(k/m) = √(100/0.01) = 100 rad/s、固有振動数は fₙ = ωₙ/(2π) ≈ 15.9155 Hz、周期は T = 1/fₙ ≈ 0.06283 s です。',
   'SOL 103 の F06 にある REAL EIGENVALUES の表では、EIGENVALUE 列が ω²（この例では 10000）、RADIANS 列が ω（100）、CYCLES 列が Hz（15.9155）です。RADIANS と CYCLES は 2π 倍違うので、どの列を読んでいるかを先に確かめます。',
   'GENERALIZED MASS と GENERALIZED STIFFNESS の列は、モードの大きさの決め方（規格化）で値が変わります。EIGRL の NORM 欄が既定の MASS なら一般化質量は 1 になり、一般化剛性は ω² と同じ値になります。値の大きさだけで異常と判断しません。',
   '固有振動数は √(k/m) に比例するので、剛性を4倍にすると2倍、質量を4倍にすると半分になります。下の表の最後の行は、質量の単位を誤ったときにどれだけ外れるかを示しています。'],
   null,
   ['質量・剛性を変えたときの固有振動数（k=100 N/mm、m=0.01 t を基準）',['条件','計算','fₙ (Hz)'],[
    ['基準','100 / (2π)','15.9155'],
    ['質量を4倍（m = 0.04 t）','50 / (2π)','7.9577'],
    ['剛性を4倍（k = 400 N/mm）','200 / (2π)','31.8310'],
    ['10 kg のつもりで m = 10 と入力','15.9155 / √1000','0.5033']]]],
  ['動解析では質量の単位までそろえる',[
   '静解析では力と長さの単位がそろっていれば結果が出ますが、動解析では質量の単位も効きます。N・mm・s の組合せでは、質量の単位は N·s²/mm = t（トン）です。10 kg は 0.01 t なので、CONM2 の M 欄には 0.01 と書きます。10 と書くと 10 t になり、固有振動数は √1000 ≈ 31.6 分の1に下がります。',
   '材料の密度も同じ単位系で入れます。鋼の 7850 kg/m³ は N・mm・s 系で 7.85×10⁻⁹ t/mm³ です。MAT1 の RHO に密度を入れて要素の質量を作り、さらに同じ部品の質量を CONM2 でも足すと、質量を二重に数えます。',
   'PARAM WTMASS は、入力した質量にまとめて掛ける係数です。重量の単位で入力したモデルを質量に直すときに使います。質量の単位を入力の段階でそろえているなら、WTMASS は既定の 1.0 のままにします。'],
   null],
  ['2つの質点で有効質量を確かめる',[
   '壁に 400 N/m のばね、2 kg の質点、200 N/m のばね、1 kg の質点を順につないだ例です（全質量 3 kg）。1次は2つの質点が同じ向きに、2次は逆向きに動きます。',
   '壁ごと X 方向に揺らすと、1次は 3 kg のうち 8/3 kg（約 89%）、2次は 1/3 kg（約 11%）の質量を動かします。これが有効質量です。全部のモードを足すと、動ける部分の質量 3 kg になります。同じ向きに動く1次の方が多くの質量を動かすので、揺れの主役になります。',
   '有効質量と刺激係数は別の量です。刺激係数は、壁ごと揺らしたときにそのモードがどれだけ揺すられるかを表す係数です。英語の participation factor を直訳して参加係数とも呼びます。刺激係数には符号があり、モード形の大きさの決め方で値が変わります。有効質量は刺激係数の2乗に一般化質量を掛けた値で、いつも正、単位は kg です。例えば1次の刺激係数は MASS で 1.633、MAX で 1.333 と変わりますが、有効質量はどちらも 8/3 kg です。',
   '下の切替で、モード形の大きさの決め方（MASS：一般化質量を 1、MAX：最大の成分を 1）を変えると、モード形の数字と刺激係数は変わりますが、振動数・有効質量・割合は変わりません。F06 の GENERALIZED MASS が 1 になるのは、この決め方の結果です。'
  ],'lab-modal-mass'],
  ['自分で確かめる',['答えを開く前に、式から数字を出してみてください。'],'quiz-modes']);
 entry('modes').sources.push(dyn(49));
 (entry('modes').links=entry('modes').links||[]).push(['analysis.html#modes/baseline/results','F06 の表の読み方と実務の判断（解析タブ）']);

 /* ---------- 直接周波数応答 ---------- */
 entry('direct-frequency').sections.push(
  ['1自由度で共振と位相を動かして確かめる',[
   '実固有値解析と同じ1自由度モデル（k = 100 N/mm、m = 0.01 t、fₙ ≈ 15.9155 Hz）に、振幅 F₀ = 100 N の調和荷重をかけます。静的に押したときの変位は uₛ = F₀/k = 1 mm です。',
   '振動数比 r = f/fₙ を使うと、変位振幅は U = uₛ / √{(1 − r²)² + (2ζr)²} です。r = 1 では U = uₛ/(2ζ) となり、ζ = 0.02 なら 1 mm ÷ 0.04 = 25 mm です。減衰があると振幅が最大になる周波数は fₙ より少し低くなる（r = √(1 − 2ζ²)）ので、25 mm は「fₙ での値」であって厳密な最大値ではありません。',
   '荷重 F₀cos(ωt) に対して変位は U cos(ωt − φ) と遅れます。遅れ角は tan φ = 2ζr / (1 − r²) で、r = 1 で 90°、r が大きくなるほど 180° に近づきます。複素振幅で表した変位の位相角は −φ になるので、Nastran の PHASE 出力と比べるときは符号の約束をそろえます。',
   '下の図は理論式の計算で、MSC Nastran の出力ではありません。減衰比を変えると共振付近だけが大きく変わり、共振から離れた範囲はほとんど変わらないことを確かめてください。'],
   'lab-frf'],
  ['周波数の刻みをどう決めるか',[
   '周波数応答は、指定した周波数の点ごとにしか計算しません。点の間に共振ピークがあると、最大値を見落とします。',
   '一般的な理論の補足：減衰比が小さいとき、共振ピークの幅（振幅が最大値の 1/√2 以上になる範囲）はおよそ Δf ≈ 2ζfₙ です。ζ = 0.02、fₙ = 15.9 Hz なら Δf ≈ 0.64 Hz なので、0.1 Hz 刻みならピークの中に約6点入ります。1 Hz 刻みでは1点も入らないことがあります。',
   'FREQ1 は等間隔、FREQ2 は対数間隔で点を並べます。FREQ4 は各固有振動数のまわりに点を集めるので、共振を見落としにくくなります。必要な範囲を細かくし、さらに細かくしても最大値が変わらないことを確かめます。',
   '出力の並べ方も選べます。SORT1 は1つの周波数について節点・要素を並べ、SORT2 は1つの節点・要素について周波数を並べます。周波数ごとの変化を見たいときは SORT2 が読みやすく、計算方法は変わりません。'],
   null,
   ['刻みと読み取れる最大振幅（1自由度、理論値）',['減衰比','fₙ での振幅','0.1 Hz 刻み（15.9 Hz）','1 Hz 刻み（16 Hz）'],[
    ['ζ = 0.02','25.0 mm','25.0 mm','24.0 mm（−4%）'],
    ['ζ = 0.01','50.0 mm','49.8 mm','43.9 mm（−12%）']]]],
  ['自分で確かめる',['ζ = 0.02、uₛ = 1 mm として計算してから答えを開いてください。'],'quiz-frf']);
 entry('direct-frequency').sources.push(dyn(137),dyn(184));

 /* ---------- 過渡応答 ---------- */
 entry('transient').sections.push(
  ['三角形の短い荷重で確かめる',[
   '同じ1自由度モデルに、0 s から 0.02 s で 0 → 100 N に増え、0.04 s で 0 N に戻る三角形の荷重をかけます。荷重の継続時間 0.04 s は固有周期 0.0628 s より短いので、力がなくなった後もおもりは揺れ続け、減衰によって少しずつ小さくなります。',
   '変位の最大値が出る時刻は、荷重が最大の 0.02 s とは一致しません。図の最大値と発生時刻を読み、減衰比を変えたときに何が変わるかを確かめてください。',
   'この図は運動方程式 m ü + c u̇ + k u = F(t) を、刻み 0.0005 s の4次ルンゲ・クッタ法で数値積分した学習用の計算です。MSC Nastran の時間積分法を再現したものではありません。'],
   'lab-pulse'],
  ['荷重の点と、計算の刻みを分ける',[
   'TABLED1 には、荷重の形を決める時刻と値の組を書きます。上の三角形なら (0, 0)、(0.02, 1)、(0.04, 0) のような数点で足ります。点と点の間は直線で結ばれます。荷重の点が3つでも、計算が3回だけになるわけではありません。',
   '計算の刻みは TSTEP で決めます。N = 2000、DT = 0.0005 なら計算する時間は 1 s です。NO は何ステップごとに結果を出力するかで、NO = 10 なら 0.005 s ごとの出力になります。出力を間引いても計算の刻みは変わりませんが、出力の点の間にあるピークは読めなくなります。',
   'この例の固有周期 0.0628 s は DT = 0.0005 s の約126ステップに当たり、荷重の立ち上がり 0.02 s は40ステップです。刻みが足りるかは、DT を半分にして最大値・発生時刻・波形がほぼ変わらないかで確かめます。'],
   null],
  ['自分で確かめる',['TSTEP と荷重の時間の関係を計算してから答えを開いてください。'],'quiz-transient']);
 entry('transient').sources.push(dyn(225));

 /* ---------- 減衰（旧「減衰の種類と使い分け」を統合） ---------- */
 // The independent damping chapter is authored once in damping-chapter.js.
 // Legacy chart functions below remain unchanged for geometry-preserving reuse.
 /* ---------- 亀裂先端（旧「亀裂先端のモデル化」を統合） ---------- */
 entry('fracture').sections.push(
  ['同じ K でも、見る位置で応力は変わる',[
   '亀裂の正面（θ = 0）では、先端からの距離 r の位置の応力が σyy = KⅠ / √(2πr) で表されます。KⅠ = 1000 MPa√mm なら、r = 1 mm で約 399 MPa、r = 0.01 mm で約 3989 MPa です。K が同じでも、先端に近づくほど応力は大きくなり、r → 0 で有限の値に落ち着きません。',
   'メッシュを細かくすると先端の最大応力が増え続けるのはこのためで、要素を細かくすれば収束するという性質の量ではありません。比べるべき量は、荷重と形状で決まる有限の値 K です。',
   'K の単位に注意します。MPa√mm を MPa√m に直すには √1000 で割ります。1000 MPa√mm ≈ 31.62 MPa√m です。K を応力（MPa）や、単位の違う破壊靱性とそのまま比べません。',
   '「特異」という言葉は2つの意味で使われます。ここでの応力の特異性は鋭い亀裂の近くの応力分布の性質です。拘束不足で剛性行列が特異になる、という計算上の問題とは別で、AUTOSPC で亀裂の応力特異性を消すことはできません。'],
   'lab-crack'],
  ['評価方法を目的から選ぶ',[
   '有限な最大応力を知りたいなら、実際の先端半径を持つ切欠きとしてモデル化します。半径を付けると、鋭い亀裂とは別の問題になります。',
   '鋭い亀裂の K を求めるなら、亀裂先端要素（CRAC2D・CRAC3D）か、2次要素の中間節点を先端から 1/4 の位置へ寄せた要素（1/4点要素）を使います。両者の作り方を混ぜないようにします。塑性や大変形が重要なら、線形弾性の K ではなく、条件に合った J・開口変位・ひずみで評価します。'],
   null,
   ['目的と方法',['目的・方法','表すもの','見る量'],[
    ['鋭い亀裂＋CRAC2D','特異な近傍場を含む専用要素','KⅠ・KⅡと、その安定性'],
    ['鋭い亀裂＋1/4点要素','中間節点の位置で特異場を表す','その方法で求めた K や J'],
    ['半径 ρ > 0 の切欠き','実際に丸い先端','その半径での局所応力とメッシュ収束'],
    ['塑性・先端の鈍化など','非線形材料・大変形を含むモデル','条件に合う J・開口変位・ひずみ']]]],
  ['CRAC2D の出力で K を読む',[
   'CRAC2D の応力出力は、ダミー要素の形式（S1〜S9）で並びます。S1 だから最大主応力、という読み方はしません。下の表の対応で読みます。',
   '応力と評価位置は、要素を内部で分けた三角形のうち4番と5番で求めた値の平均、KⅠ・KⅡ は1番と8番から求めた値の平均です。したがって S3〜S5 は「r = 0 の先端応力」ではありません。',
   '亀裂の上下の面は、同じ座標にある別々の節点です。前処理で同じ座標の節点を自動でまとめると、上下の面がつながって亀裂が開かなくなります。CRAC2D の節点の並べ方と全形・半形の違いは、シェル要素の記事の CRAC2D の節で確かめてください。'],
   null,
   ['CRAC2D の出力欄（N・mm 系）',['出力欄','意味','単位'],[
    ['S1・S2','応力を評価した位置の要素座標 x・y','mm'],
    ['S3・S4・S5','σx・σy・τxy','MPa'],
    ['S6','モード I の応力拡大係数 KⅠ','MPa√mm'],
    ['S7','モード II の応力拡大係数 KⅡ','MPa√mm'],
    ['S8・S9','0（追加の主応力ではない）','—']]]],
  ['J との関係と、実際の部品へ広げる順番',[
   '均質・等方の線形弾性でモード I だけなら、J = KⅠ² / E′ です。平面応力では E′ = E、平面ひずみでは E′ = E/(1 − ν²) です。KⅠ = 1000 MPa√mm、E = 210000 MPa なら、平面応力で J ≈ 4.76 N/mm、平面ひずみ（ν = 0.3）で J ≈ 4.33 N/mm です。',
   '実際の部品へ広げるときは、①鋭い亀裂の K を見るのか切欠きの局所応力を見るのかと、平面応力・平面ひずみ・3次元の仮定を決め、②亀裂長さ・板幅・板厚・荷重・拘束を含む全体形状を作り、③先端に CRAC2D を置いて周囲の要素と節点を共有し、④既知の解（対象形状に合ったハンドブックの式や試験）と比べ、⑤全体の条件を保ったまま先端周りと外側の分割を変えて K の変化を確かめます。',
   'K を破壊靱性と比べるときは、単位だけでなく、材料・温度・板厚・拘束状態・先端の塑性域が十分小さいことなど、適用条件をそろえます。3次元では先端は線（亀裂前縁）になり、CRAC3D は CRAC2D の番号を押し出したものではない専用の節点配置を使います。'],
   null],
  ['自分で確かめる',['σyy = KⅠ / √(2πr) と J = KⅠ² / E′ を使って考えてください。'],'quiz-fracture']);
 (entry('fracture').links=entry('fracture').links||[]).push(['elements.html#shell-crack','CRAC2D の節点と入力（シェル要素）']);

 /* ---------- 図と問い ---------- */
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=(v,d=3)=>{if(!isFinite(v))return '—';const a=Math.abs(v);return a!==0&&(a<1e-3||a>=1e5)?v.toExponential(2):Number(v.toPrecision(d)).toString();};
 const K=100,M=0.01,WN=Math.sqrt(K/M),FN=WN/(2*Math.PI);
 const DASH=['','7 4','2 4','10 4 2 4'];
 function chart(o){
  const named=(o.legend?o.series.filter(s=>s.name):[]),rows=Math.ceil(named.length/2),w=360,L=50,R=12,T=14,B=38,ph=178,pw=w-L-R,h=T+ph+B+rows*18;
  const lg=v=>Math.log10(v);
  const tx=v=>L+pw*(o.xlog?(lg(v)-lg(o.x[0]))/(lg(o.x[1])-lg(o.x[0])):(v-o.x[0])/(o.x[1]-o.x[0]));
  const ty=v=>{const y=o.ylog?(lg(Math.max(v,o.y[0]/10))-lg(o.y[0]))/(lg(o.y[1])-lg(o.y[0])):(v-o.y[0])/(o.y[1]-o.y[0]);return T+ph*(1-Math.min(1.05,Math.max(-0.05,y)));};
  let s=`<svg class="theory-lab-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(o.label)}"><defs><clipPath id="clip-${o.id}"><rect x="${L}" y="${T}" width="${pw}" height="${ph}"/></clipPath></defs>`;
  s+=`<rect x="${L}" y="${T}" width="${pw}" height="${ph}" class="lab-frame"/>`;
  for(const v of o.xt){const x=tx(v);s+=`<line x1="${x}" y1="${T}" x2="${x}" y2="${T+ph}" class="lab-grid"/><text x="${x}" y="${T+ph+15}" text-anchor="middle">${v}</text>`;}
  for(const v of o.yt){const y=ty(v);s+=`<line x1="${L}" y1="${y}" x2="${L+pw}" y2="${y}" class="lab-grid"/><text x="${L-5}" y="${y+4}" text-anchor="end">${v}</text>`;}
  s+=`<text x="${L+pw/2}" y="${T+ph+B-4}" text-anchor="middle">${o.xl}</text><text x="12" y="${T+ph/2}" text-anchor="middle" transform="rotate(-90 12 ${T+ph/2})">${o.yl}</text>`;
  s+=`<g clip-path="url(#clip-${o.id})">`;
  for(const v of o.vlines||[])s+=`<line x1="${tx(v)}" y1="${T}" x2="${tx(v)}" y2="${T+ph}" class="lab-ref"/>`;
  for(const [i,ser] of o.series.entries())s+=`<polyline class="lab-line${ser.strong?' strong':''}" stroke-dasharray="${ser.dash??DASH[i%4]}" points="${ser.pts.map(([x,y])=>tx(x).toFixed(1)+','+ty(y).toFixed(1)).join(' ')}"/>`;
  for(const [x,y] of o.marks||[])s+=`<circle cx="${tx(x)}" cy="${ty(y)}" r="5" class="lab-mark"/>`;
  s+='</g>';
  if(o.legend){let n=0;for(const [i,ser] of o.series.entries()){if(!ser.name)continue;const lx=L+(n%2)*150,ly=T+ph+B+12+Math.floor(n/2)*18;s+=`<line x1="${lx}" y1="${ly-4}" x2="${lx+26}" y2="${ly-4}" class="lab-line${ser.strong?' strong':''}" stroke-dasharray="${ser.dash??DASH[i%4]}"/><text x="${lx+31}" y="${ly}">${ser.name}</text>`;n++;}}
  return s+'</svg>';
 }
 const range=(a,b,n,log)=>Array.from({length:n},(_,i)=>log?Math.pow(10,Math.log10(a)+(Math.log10(b)-Math.log10(a))*i/(n-1)):a+(b-a)*i/(n-1));
 const zetaSelect=(id,value)=>`<label>減衰比 ζ <select data-lab-input="${id}">${[0.01,0.02,0.05,0.1].map(z=>`<option value="${z}"${z===value?' selected':''}>${z}</option>`).join('')}</select></label>`;
 const box=(name,controls,caption)=>`<figure class="theory-lab" data-lab="${name}"><div class="theory-lab-controls">${controls}</div><div class="theory-lab-plot"></div><p class="theory-lab-readout" aria-live="polite"></p><figcaption>${caption}</figcaption></figure>`;
 const amp=(r,z)=>1/Math.sqrt((1-r*r)**2+(2*z*r)**2);
 const labs={
  'lab-frf':{html:()=>box('lab-frf',zetaSelect('z',0.02)+`<label>加振周波数 f <input type="range" min="0.5" max="40" step="any" value="15.9155" data-lab-input="f"></label><button type="button" data-lab-action="fn">f = fₙ にする</button>`,'1自由度（k = 100 N/mm、m = 0.01 t、F₀ = 100 N）の理論式。横軸は加振周波数 f、縦軸は変位振幅 U（対数）。破線は固有振動数 fₙ、丸は選んだ周波数です。'),
   draw(el,v){const z=+v.z,f=+v.f,r=f/FN,U=amp(r,z),phi=Math.atan2(2*z*r,1-r*r)*180/Math.PI;
    el.plot.innerHTML=chart({id:'frf',label:'周波数と変位振幅',x:[0,40],y:[0.01,100],ylog:true,xt:[0,10,20,30,40],yt:[0.01,0.1,1,10,100],xl:'f (Hz)',yl:'U (mm)',vlines:[FN],series:[{pts:range(0.2,40,300).map(x=>[x,amp(x/FN,z)]),strong:true,dash:''}],marks:[[f,U]]});
    el.readout.textContent=`f = ${f.toFixed(2)} Hz、r = ${num(r,4)}、U = ${num(U,4)} mm（静的変位の ${num(U,3)} 倍）、遅れ角 φ = ${phi.toFixed(1)}°`;},
   action(el,name){if(name==='fn'){el.inputs.f.value=FN.toFixed(4);}}},
  'lab-pulse':{html:()=>box('lab-pulse',zetaSelect('z',0.02),'上段：荷重 F（N）、下段：変位 u（mm）。三角形の荷重（0.02 s で 100 N、0.04 s で 0 N）に対する1自由度の応答を、刻み 0.0005 s の数値積分で求めた学習用の計算です。'),
   draw(el,v){const z=+v.z,c=2*z*Math.sqrt(K*M),dt=0.0005,F=t=>t<=0.02?5000*t:t<=0.04?100-5000*(t-0.02):0;
    const acc=(t,u,w)=>(F(t)-c*w-K*u)/M;let u=0,w=0,pts=[[0,0]],best=[0,0],min=[0,0];
    for(let i=0;i<600;i++){const t=i*dt;
     const k1u=w,k1w=acc(t,u,w),k2u=w+dt/2*k1w,k2w=acc(t+dt/2,u+dt/2*k1u,w+dt/2*k1w),k3u=w+dt/2*k2w,k3w=acc(t+dt/2,u+dt/2*k2u,w+dt/2*k2w),k4u=w+dt*k3w,k4w=acc(t+dt,u+dt*k3u,w+dt*k3w);
     u+=dt/6*(k1u+2*k2u+2*k3u+k4u);w+=dt/6*(k1w+2*k2w+2*k3w+k4w);const tt=(i+1)*dt;pts.push([tt,u]);if(u>best[1])best=[tt,u];if(u<min[1])min=[tt,u];}
    const force=range(0,0.3,121).map(t=>[t,F(t)]);
    el.plot.innerHTML=chart({id:'pulse-f',label:'荷重の時刻歴',x:[0,0.3],y:[0,120],xt:[0,0.1,0.2,0.3],yt:[0,50,100],xl:'t (s)',yl:'F (N)',series:[{pts:force,strong:true,dash:''}]})+
     chart({id:'pulse-u',label:'変位の時刻歴',x:[0,0.3],y:[-1.5,1.5],xt:[0,0.1,0.2,0.3],yt:[-1.5,-1,-0.5,0,0.5,1,1.5],xl:'t (s)',yl:'u (mm)',vlines:[0.04],series:[{pts,strong:true,dash:''}],marks:[best]});
    el.readout.textContent=`最大変位 ${num(best[1],3)} mm（t = ${best[0].toFixed(4)} s）、最小 ${num(min[1],3)} mm（t = ${min[0].toFixed(4)} s）、t = 0.3 s で ${num(pts.at(-1)[1],2)} mm。100 N を静かにかけたときの変位は 1 mm です。`;}},
  'lab-convert':{html:()=>box('lab-convert',`<label>減衰比 ζ <select data-lab-input="z">${[0.01,0.02,0.05,0.1].map(z=>`<option value="${z}"${z===0.02?' selected':''}>${z}</option>`).join('')}</select></label>`,'上：選んだ ζ を各形式に直した値（k = 100 N/mm、m = 0.01 t）。下：初期変位 1 mm・初速度 0 から放したときの自由振動の理論解。ζ = 0.02・0.2（不足減衰）、1（臨界減衰）、2（過減衰）を線の種類で区別しています。'),
   draw(el,v){const z=+v.z;
    const free=zz=>range(0,0.3,240).map(t=>{const a=zz*WN;let u;if(zz<1){const wd=WN*Math.sqrt(1-zz*zz);u=Math.exp(-a*t)*(Math.cos(wd*t)+a/wd*Math.sin(wd*t));}else if(zz===1)u=(1+WN*t)*Math.exp(-WN*t);else{const wd=WN*Math.sqrt(zz*zz-1);u=Math.exp(-a*t)*(Math.cosh(wd*t)+a/wd*Math.sinh(wd*t));}return [t,u];});
    el.plot.innerHTML=`<table class="theory-lab-table"><tr><th>粘性減衰係数 c</th><td>${num(2*z*Math.sqrt(K*M),3)} N·s/mm</td></tr><tr><th>TABDMP1 CRIT（= ζ）</th><td>${num(z,3)}</td></tr><tr><th>TABDMP1 G（= 2ζ）</th><td>${num(2*z,3)}</td></tr><tr><th>TABDMP1 Q（= 1/(2ζ)）</th><td>${num(1/(2*z),3)}</td></tr></table>`+
     chart({id:'decay',label:'自由振動',x:[0,0.3],y:[-1,1],xt:[0,0.1,0.2,0.3],yt:[-1,-0.5,0,0.5,1],xl:'t (s)',yl:'u (mm)',legend:true,series:[{pts:free(0.02),name:'ζ=0.02',strong:true},{pts:free(0.2),name:'ζ=0.2'},{pts:free(1),name:'ζ=1'},{pts:free(2),name:'ζ=2'}]});
    el.readout.textContent=`ζ = ${z} のとき c = ${num(2*z,3)} N·s/mm。TYPE を空欄（G）にして ${z} と書くと、ζ = ${num(z/2,3)} として扱われます。`;}},
  'lab-visc-struct':{html:()=>box('lab-visc-struct',zetaSelect('z',0.05),'横軸は振動数比 r = f/fₙ、縦軸は静的変位に対する振幅の倍率（対数）。実線が粘性減衰、破線が構造減衰（g = 2ζ）です。1自由度の理論式で、MSC Nastran の出力ではありません。'),
   draw(el,v){const z=+v.z,g=2*z,rs=range(0.1,3,300,true);
    el.plot.innerHTML=chart({id:'vs',label:'粘性減衰と構造減衰の倍率',x:[0.1,3],xlog:true,y:[0.1,100],ylog:true,xt:[0.1,0.3,1,3],yt:[0.1,1,10,100],xl:'r = f/fₙ',yl:'U / uₛ',legend:true,series:[{pts:rs.map(r=>[r,amp(r,z)]),name:'粘性 ζ='+z,strong:true,dash:''},{pts:rs.map(r=>[r,1/Math.sqrt((1-r*r)**2+g*g)]),name:'構造 g='+num(g,3),dash:'7 4'}]});
    const at=r=>[amp(r,z),1/Math.sqrt((1-r*r)**2+g*g)];
    el.readout.textContent=`r = 1：粘性 ${num(at(1)[0],3)}、構造 ${num(at(1)[1],3)}（一致）。r = 0.2：粘性 ${num(at(0.2)[0],4)}、構造 ${num(at(0.2)[1],4)}。r = 3：粘性 ${num(at(3)[0],3)}、構造 ${num(at(3)[1],3)}。`;}},
  'lab-rayleigh':{html:()=>box('lab-rayleigh','','α₁ = 1.6 /s、α₂ = 0.00016 s の Rayleigh 減衰で、各固有振動数のモードが受ける減衰比。実線が合計、破線が質量比例の項、点線が剛性比例の項、一点鎖線が目標の 2% です。'),
   draw(el){const fs=range(1,60,300),z=f=>{const w=2*Math.PI*f;return [1.6/(2*w),0.00016*w/2];};
    el.plot.innerHTML=chart({id:'ray',label:'Rayleigh減衰の減衰比',x:[0,60],y:[0,0.06],xt:[0,15,30,45,60],yt:[0,0.02,0.04,0.06],xl:'fᵢ (Hz)',yl:'ζᵢ',legend:true,vlines:[50/(2*Math.PI),200/(2*Math.PI)],series:[{pts:fs.map(f=>[f,z(f)[0]+z(f)[1]]),name:'α₁/(2ω)+α₂ω/2',strong:true,dash:''},{pts:fs.map(f=>[f,z(f)[0]]),name:'α₁/(2ω)',dash:'7 4'},{pts:fs.map(f=>[f,z(f)[1]]),name:'α₂ω/2',dash:'2 4'},{pts:[[0,0.02],[60,0.02]],name:'0.02',dash:'10 4 2 4'}]});
    el.readout.textContent=`7.96 Hz と 31.8 Hz で 0.020、15.9 Hz で ${num(z(100/(2*Math.PI))[0]+z(100/(2*Math.PI))[1],3)}、1 Hz で ${num(z(1)[0]+z(1)[1],3)}、60 Hz で ${num(z(60)[0]+z(60)[1],3)}。`;}},
  'lab-crack':{html:()=>box('lab-crack',`<label>距離 r（mm、対数） <input type="range" min="-2" max="1" step="0.05" value="0" data-lab-input="r"></label>`,'亀裂の正面（θ = 0）の線形弾性の近傍式 σyy = KⅠ/√(2πr)。両軸とも対数です。実線が KⅠ = 1000、破線が 500 MPa√mm。r = 0 は計算しません。'),
   draw(el,v){const r=Math.pow(10,+v.r),s=k=>k/Math.sqrt(2*Math.PI*r),rs=range(0.01,10,120,true);
    el.plot.innerHTML=chart({id:'crack',label:'先端からの距離と応力',x:[0.01,10],xlog:true,y:[10,10000],ylog:true,xt:[0.01,0.1,1,10],yt:[10,100,1000,10000],xl:'r (mm)',yl:'σyy (MPa)',legend:true,series:[{pts:rs.map(x=>[x,1000/Math.sqrt(2*Math.PI*x)]),name:'KⅠ=1000',strong:true,dash:''},{pts:rs.map(x=>[x,500/Math.sqrt(2*Math.PI*x)]),name:'KⅠ=500',dash:'7 4'}],marks:[[r,s(1000)]]});
    el.readout.textContent=`r = ${num(r,3)} mm：KⅠ = 1000 で σyy = ${num(s(1000),4)} MPa、KⅠ = 500 で ${num(s(500),4)} MPa。r を 1/4 にすると応力は2倍になります。`;}},
  'lab-modal-mass':{html:()=>box('lab-modal-mass',`<label>モード形の大きさの決め方 <select data-lab-input="norm"><option value="MASS">MASS：一般化質量を 1</option><option value="MAX">MAX：最大の成分を 1</option></select></label><label>モード <select data-lab-input="mode"><option value="1">1次：同じ向き</option><option value="2">2次：逆向き</option></select></label>`,'壁 − 400 N/m − 2 kg − 200 N/m − 1 kg の2質点（全質量 3 kg）を、壁ごと X 方向に揺らす場合の理論計算です。グラフは各質点のモード形の値。MSC Nastran の実行結果ではありません。'),
   draw(el,v){const d=window.AnalysisModalOutputCore.mode(+v.mode,v.norm,1);
    el.plot.innerHTML=`<table class="theory-lab-table"><tr><th>モード形（質点1, 質点2）</th><td>${num(d.phi[0],4)}, ${num(d.phi[1],4)}</td></tr><tr><th>一般化質量</th><td>${num(d.mu,4)}</td></tr><tr><th>刺激係数</th><td>${num(d.beta,4)}</td></tr><tr><th>有効質量</th><td>${num(d.eff,4)} kg</td></tr><tr><th>割合（有効質量 ÷ 3 kg）</th><td>${num(100*d.fraction,4)}%</td></tr></table>`+
     chart({id:'modal-mass',label:'モード形の値',x:[1,2],y:[-1.5,1.5],xt:[1,2],yt:[-1.5,-1,-0.5,0,0.5,1,1.5],xl:'質点の番号',yl:'モード形',series:[{pts:d.phi.map((y,i)=>[i+1,y]),strong:true,dash:''}],marks:d.phi.map((y,i)=>[i+1,y])});
    el.readout.textContent=`${v.mode}次：固有振動数 ${num(d.frequency,4)} Hz、有効質量 ${num(d.eff,4)} kg。決め方を MASS と MAX で切り替えても、この2つは変わりません。`;}}
 };
 const qa=items=>`<div class="theory-quiz">${items.map(([q,a],i)=>`<details><summary>問${i+1}　${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`;
 const quizzes={
  'quiz-modes':[['CONM2 の質量を 0.01 から 0.04 にすると、固有振動数はいくつになりますか？','fₙ は 1/√m に比例するので半分になり、約 7.958 Hz です。'],
   ['CELAS2 のばね定数を 100 から 400 にすると？','fₙ は √k に比例するので2倍の約 31.83 Hz です。100 N をゆっくりかけたときの変位は 1 mm から 0.25 mm になります。'],
   ['N・mm・s 系のモデルで、10 kg のつもりで CONM2 に 10 と書くと？','10 t と解釈され、fₙ = 15.9155 / √1000 ≈ 0.503 Hz になります。正しくは 0.01 です。'],
   ['2質点の例で、1次と2次の有効質量を足すと何 kg ですか？','8/3 + 1/3 = 3 kg で、動ける部分の全質量になります。全部のモードを使えば、割合の合計は 100% です。']],
  'quiz-frf':[['f = fₙ で、減衰比を 0.02 から 0.05 にすると振幅は？','U = uₛ/(2ζ) なので 25 mm から 10 mm になります。固有振動数は変わりません。'],
   ['f = 0.5fₙ（約 7.96 Hz）での振幅と遅れ角は？','r = 0.5 で U = 1/√(0.75² + 0.02²) ≈ 1.33 mm、φ = atan(0.02/0.75) ≈ 1.5° です。剛性が支配的で、荷重とほぼ同じ時刻に変位が最大になります。'],
   ['f = 2fₙ では？','r = 2 で U = 1/√(3² + 0.08²) ≈ 0.333 mm、φ ≈ 178.5° です。慣性が支配的になり、変位は荷重とほぼ逆向きに動きます。']],
  'quiz-transient':[['TSTEP が N = 2000、DT = 0.0005、NO = 10 のとき、計算する時間と出力の間隔は？','計算する時間は 2000 × 0.0005 = 1 s、出力は 10 × 0.0005 = 0.005 s ごとです。固有周期 0.0628 s の1周期に出力点は約12.6点しかありません。'],
   ['同じ最大 100 N の荷重を、1 s かけてゆっくり増やしたら最大変位はどうなりますか？','荷重の変化が固有周期 0.0628 s よりずっと遅いので、ほぼ静的な応答になり、最大変位は 100 N の静的変位 1 mm に近づきます。']],
  'quiz-damping':[['TABDMP1 の TYPE を空欄にして 0.02 と書くと、減衰比はいくつですか？','既定の TYPE は G なので g = 0.02、ζ = g/2 = 0.01（1%）です。2% にするなら TYPE を CRIT にして 0.02、または G のまま 0.04 と書きます。'],
   ['ばねの GE を 0.02 にすると、共振付近で相当する減衰比は？','g = 2ζ の関係から ζ ≈ 0.01 です。'],
   ['2% のモード減衰に、c = 0.04 N·s/mm の CDAMP2 を足すと？','c_crit = 2 N·s/mm なので CDAMP2 だけで 2% 相当です。両方入れると約 4% になります。同じ損失を二重に数えていないか確かめます。'],
   ['α₁ = 1.6、α₂ = 0.00016 の Rayleigh 減衰で、1 Hz のモードの減衰比は？','ω = 6.283 rad/s で ζ = 1.6/(2 × 6.283) + 0.00016 × 6.283/2 ≈ 0.128（約13%）です。質量比例の項が低い振動数で大きくなります。']],
  'quiz-fracture':[['KⅠ が2倍になると、同じ位置の応力と J はどうなりますか？','応力は KⅠ に比例するので2倍、J は KⅠ² に比例するので4倍です。'],
   ['1000 MPa√mm を MPa√m に直すと？','1000 / √1000 ≈ 31.62 MPa√m です。'],
   ['見る位置を r = 1 mm から 0.25 mm に近づけると、応力は何倍ですか？','1/√r に比例するので √4 = 2倍です。K は変わりません。']]
 };
 function connect(root){
  for(const fig of root.querySelectorAll('figure.theory-lab')){
   const lab=labs[fig.dataset.lab],el={plot:fig.querySelector('.theory-lab-plot'),readout:fig.querySelector('.theory-lab-readout'),inputs:{}};
   for(const input of fig.querySelectorAll('[data-lab-input]'))el.inputs[input.dataset.labInput]=input;
   const values=()=>Object.fromEntries(Object.entries(el.inputs).map(([k,i])=>[k,i.value]));
   const draw=()=>lab.draw(el,values());
   fig.addEventListener('input',draw);fig.addEventListener('change',draw);
   fig.addEventListener('click',event=>{const b=event.target.closest('[data-lab-action]');if(b){lab.action(el,b.dataset.labAction);draw();}});
   draw();
  }
 }
 window.TheoryTopicVisuals=V;
 window.TheoryLabs={html:name=>labs[name]?.html()||(quizzes[name]?qa(quizzes[name]):''),connect,labs,quizzes};
})();
