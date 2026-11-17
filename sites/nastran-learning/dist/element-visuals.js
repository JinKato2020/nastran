/* Original conceptual illustrations, not solver meshes or reproductions of manual figures.
 * SVGs contain symbols only. All prose (including accessible names) lives in the
 * locale catalogue below. Geometry must never be mirrored for RTL languages.
 */
(() => {
 'use strict';
 const copy = {
  shearThroughS:['① せん断中心Sを通す：溝形断面の灰色の形と、図心Gは共通です。赤い荷重Pの作用線（縦の破線）がSを通るのでe=0。この荷重によるねじりはなく、梁は曲げでたわみます。','① Load through shear centre S: the grey channel and centroid G are shared by both cases. The red load P acts along the vertical dashed line through S, so e=0. This load produces bending without torsion.'],
  shearThroughG:['② 図心Gを通す：作用線がSからeだけ離れるので、曲げに加えてトルクP·eが生じます。赤い円弧はこの荷重による時計回りのねじり作用で、変形後の形ではありません。','② Load through centroid G: the line of action lies distance e from S, producing torque P·e as well as bending. The red curved arrow shows the clockwise torsional action, not a deformed shape.'],
  warpRotation:['① ねじれ角θだけを見る端面図：灰色の破線は元のI形断面、緑線は軸まわりに回転した断面です。この向きからは、紙面の手前・奥へのずれは読み取れません。','① End view of twist angle θ: the dashed I-section is the original orientation; green is the rotated section. This view alone cannot reveal displacements towards or away from the viewer.'],
  warpAxial:['② 反りだけを取り出した斜視図：面内の回転を取り除いて比較しています。破線は反りのない平らな断面、緑は反った断面。緑の矢印は各端の軸方向のずれで、全てx軸と平行です。＋uと−uが混在し、断面全体の平行移動ではありません。変形量を強調した模式図です。','② Oblique view isolating warping, with in-plane rotation removed. Dashed lines show the unwarped planar section and green lines the warped section. All green displacement arrows are parallel to x. Both +u and −u occur: this is not a translation of the whole section. Deformation is exaggerated schematically.'],
  beamAxial:['① 軸方向に引く：赤いNで先端がuだけ伸びます。破線の先端位置と緑の先端位置を比較してください。Aは断面積で、EAが大きいほど伸びにくくなります。','① Axial tension: force N extends the tip by u. Compare the dashed original tip with the green displaced tip. A is section area; larger EA gives less extension.'],
  beamBend:['② 曲げ：先端の横荷重Pで中心線が曲がり、青い断面線も回転します。図はせん断変形を除いた曲げ成分δbです。EIが大きいほどたわみは小さくなります。','② Bending: transverse tip force P curves the centreline and rotates the blue section lines. This shows only the bending contribution δb, excluding shear. Larger EI gives less deflection.'],
  beamShear:['③ 横せん断：同じ横荷重Pによるせん断成分δsだけを取り出しています。断面は回転せず、中心線が傾くため直角が崩れます。γは中心線の傾きと断面回転の差です。②と③を足すと全たわみになります。','③ Transverse shear: isolated shear contribution δs under the same P. Sections do not rotate in this separated contribution, but the centreline tilts. γ is the difference between centreline slope and section rotation. Add ② and ③ for total deflection.'],
  beamTorsion:['④ ねじり：固定端Aから自由端Bを見た円形断面。外周の円は変わらず、目印の線が破線から緑線へθだけ回ります。赤いTは軸まわりのトルクです。GJが大きいほどねじれにくくなります。','④ Torsion: circular section at free end B viewed from fixed end A. The circular outline stays unchanged; a marked radius rotates from dashed to green by θ under torque T. Larger GJ gives less twist.'],
  cbarSection:['① 一定断面：端A・途中・端Bで同じ形と寸法を使います。薄い断面枠は確認用で、途中節点ではありません。下の2節点の線が解析上のCBARです。長さ方向に荷重や曲げモーメントまで一定という意味ではありません。','① Uniform section: the shape and dimensions are the same at A, along the span and at B. Section outlines are visual aids, not intermediate nodes. The two-node line below is the CBAR representation. Loads and bending moments need not be constant.'],
  cbarBending:['② 曲げを伝える：端Aを固定し、端Bに横荷重Pを加えます。CBARは曲げ剛性EIによって荷重を支え、先端はδだけたわみます。固定端には荷重と逆向きの反力RAと反時計回りの反モーメントMAが生じます。端部解放なしの例です。','② Transmitting bending: clamp A and apply transverse force P at B. Flexural stiffness EI supports the load while the tip deflects by δ. The clamp develops an opposing reaction RA and counterclockwise reaction moment MA. No end releases are used.'],
  inertiaSection:['① 共通の断面：端Bから端Aを見ています。xは手前、yは上、zは左です。y方向の寸法h=30 mm、z方向の寸法b=10 mm。荷重方向を変えても断面と軸は固定したままです。','① Shared section, viewed from B towards A: x points towards you, y up, z left. Dimension h=30 mm is along y and b=10 mm along z. Keep this section and these axes fixed when changing the load direction.'],
  inertiaY:['② y方向へ曲げる側面図：x-y面を見ています。z軸は紙面の手前向きです。断面はz軸まわりに回転するのでIzz、NastranではI1を使います。y方向に高さがあるこの断面は、この向きには曲がりにくくなります。','② Bending towards y, viewed in the x-y plane: z points out of the page. Sections rotate about z, so use Izz, called I1 in Nastran. The large dimension along y makes this the stiff bending direction.'],
  inertiaZ:['③ z方向へ曲げる側面図：見る方向を変えてx-z面を表示しています。y軸は紙面の奥向きです。断面はy軸まわりに回転するのでIyy、NastranではI2を使います。同じ荷重では②より大きくたわみます（模式図、縮尺は共通ではありません）。','③ Bending towards z, viewed in the x-z plane: y points into the page. Sections rotate about y, so use Iyy, called I2 in Nastran. The same load gives more deflection than ②. Deflections are schematic and not drawn to a shared scale.'],
  legend:['図の記号を確認','Diagram key'],
  symbols:['赤い矢印 F・M：力・モーメント。青い矢印 x・y・z：座標軸。緑のv：向きベクトル。緑のu・θ：変位や回転（説明用に誇張）。破線：基準形状・補助線。丸：節点。菱形：従属自由度を持つ点。矢印の意味は各図の説明でも確認してください。','Red arrows F, M: forces and moments. Blue arrows x, y, z: coordinate axes. Green v: orientation vector. Green u, θ: exaggerated displacement or rotation. Dashed lines: reference geometry or construction lines. Circles: nodes. Diamonds: points with dependent degrees of freedom. Check each caption for the meaning of its arrows.'],
  families:['形状の表し方を比較。ばねは自由度間、棒・梁は線、シェルは基準面、ソリッドは体積で表します。','Compare representations: a spring connects degrees of freedom; a rod or beam uses a line, a shell a reference surface, and a solid a volume.'],
  offsetTranslation:['① 平行移動。AとBはともにX方向へ同じだけ動くので、X変位差とばね力はゼロです。白丸は移動前です。','1. Translation. A and B move the same amount along X, so the displacement difference and spring force are zero. Open circles show the original positions.'],
  offsetRotation:['② Aを中心に一体で回転。Aはその場にあり、Bには左向きのX変位が生じます。A–B間の距離は一定です。','2. Rigid rotation about A. A stays in place and B moves left along X. The distance from A to B is unchanged.'],
  offsetCouple:['③ CELASが節点に及ぼす力を初期位置に重ねています。下のAを左へ、上のBを右へ押します。合力はゼロで、時計回りのモーメントが生じます。','3. Forces exerted by CELAS are drawn at the original positions. The lower node A is pushed left and the upper node B right. The forces sum to zero and generate a clockwise moment.'],
  cbush:['GA→GBとvで軸を定める場合の模式図。ばね位置Sℓと、そこまでの剛な区間を区別します。CIDなどの指定によって軸の決定方法は変わります。','Schematic for axes defined by GA→GB and v. Distinguish the spring location Sℓ from the rigid arms. CID and other settings can change how axes are defined.'],
  cbushOrientationZ:['① ＋Zと局所zをそろえた場合。緑の矢印は、ばね位置に与える同じ1 mmの相対変位です。この向きにはK3が効きます。','1. Global +Z aligns with local z. The green arrow shows the imposed 1 mm relative displacement at the spring location. Stiffness K3 acts in this direction.'],
  cbushOrientationY:['② 向きベクトルvをx軸まわりに90°回した場合。同じ＋Zが局所yに変わり、今度はK2が効きます。','2. Rotate orientation vector v by 90° about x. The same global +Z now aligns with local y, so K2 acts in this direction.'],
  axes:['A：xに垂直なvの成分がyを決めます。vそのものがyとは限りません。zはx×y、⊙は画面の手前です。','A: The part of v perpendicular to x defines y. v itself need not align with y. z = x × y; ⊙ points out of the screen.'],
  orientationComponents:['① 実数方式：第6〜8欄にX1=0.、X2=1.、X3=0.を入れます。GAから＋Yを指す緑の矢印がvです。オフセットなしなのでGAと端Aは重なります。','1. Real components: fields 6–8 contain X1=0., X2=1., X3=0. The green arrow from GA points along +Y. Without an offset, GA and End A coincide.'],
  orientationG0:['② G0方式：梁1–2と梁2–3が、同じGRID 90を向きの目印として参照します。緑の矢印はそれぞれのGAからG0への方向で、梁の形状を結ぶ部材ではありません。両方の局所yは＋Yです。','2. G0 method: beams 1–2 and 2–3 refer to the same GRID 90 as an orientation marker. Green arrows run from each GA to G0; they are not structural members. Both local y axes point along +Y.'],
  orientationOffset:['③ オフセットあり：GAとGBは接続節点、AとBはずれた梁端です。破線WA・WBだけ離れ、GA→G0の緑の向きをAへ平行移動して使います。','3. With offsets: GA and GB are connection grids; A and B are shifted beam ends. Dashed WA and WB separate them. Translate the green GA→G0 direction to A without rotating it.'],
  slabBeamSection:['① 断面図：薄い床はPSHELLの基準面、下の矩形は床下面から始まるRC梁です。GAは床の厚さ中央、Aは梁断面の中央にあり、上下の距離eは床厚の半分と梁せいの半分の和です。＋Zは上向きです。','1. Cross section: the thin slab has a PSHELL reference plane; the rectangular RC beam starts below the slab. GA lies at the slab midplane and A at the beam centroid. Their separation e equals half the slab thickness plus half the beam depth. +Z points upward.'],
  slabBeamLength:['② 長手方向：床シェルのGA・GBと、梁中心線のA・Bを同じ節点として描いていません。破線は両者のずれ、青い下向き矢印がWA・WBです。梁軸はAからBへ走ります。','2. Along the span: GA and GB on the slab shell are distinct from A and B on the beam centreline. Dashed lines show the eccentricity, and blue downward arrows are WA and WB. The beam axis runs from A to B.'],
  bending:['B：下向きの先端荷重に対する片持ち梁。破線は変形前、緑は曲げ変形です。局所軸と外力の符号を別々に読みます。','B: A cantilever under a downward tip force. Dashed lines show the original shape; green shows bending. Read the local axes and load signs separately.'],
  sectionA:['A：荷重方向の高さhが小さい断面。曲げに対する断面二次モーメントはbh³/12です。','A: A section with small height h in the load direction. Its second moment of area for this bending direction is bh³/12.'],
  sectionB:['B：同じ断面を90°回転。高さが3倍、幅が1/3なら、断面二次モーメントは9倍です。','B: Rotate the same section by 90°. Tripling the height and reducing the width to one third increases the second moment of area ninefold.'],
  releaseA:['A：同じ節点につながる梁1のB端だけをPB₁=456で解放し、梁2のA端のPA₂は空欄です。∅は空欄を示します。節点位置は共通ですが、梁同士の回転は別々です。','A: Only beam 1 releases B-end rotations with PB₁=456. Beam 2 leaves its A-end PA₂ blank; ∅ means blank. The joint position is shared, while the beams can rotate independently.'],
  releaseB:['B：端部解放は接地拘束ではありません。並進力は伝達でき、梁1のB端で解放した回転4・5・6に対応する端モーメントはゼロになります。','B: An end release is not a ground constraint. Translational forces can pass through. Beam 1 has zero B-end moments associated with its released rotations 4, 5 and 6.'],
  membrane:['A：膜応力は板厚方向に一定。横軸は応力、縦軸は基準面からの距離zです。','A: Membrane stress is constant through the thickness. The horizontal axis is stress and the vertical axis is distance z from the reference surface.'],
  bendStress:['B：純曲げの応力は厚さ方向に直線で変化し、基準面の上下で符号が反転します。','B: Pure bending stress varies linearly through the thickness, reversing sign across the reference surface.'],
  totalStress:['C：同じ位置zで膜成分と曲げ成分を加算します。例では下面がゼロ、上面で最大です。','C: Add membrane and bending stress at the same z. In this example the bottom stress is zero and the top stress is maximum.'],
  orderA:['A：この観測面から節点順が反時計回りなら、正法線は手前（⊙）です。','A: Counterclockwise node order from this viewpoint gives an outward positive normal (⊙).'],
  orderB:['B：同じ位置で節点順を逆転すると、正法線は奥（⊗）になります。物理的に同じ面でもzの符号が変わります。','B: Reversing node order at the same positions reverses the positive normal (⊗). The same physical face then has the opposite z sign.'],
  angle:['G1→G2に平行な基準方向から、材料1軸へθだけ回転します。図は正法線側から見ています。材料方向と要素の出力軸は区別します。','Rotate by θ from a direction parallel to G1→G2 to material axis 1. Viewed from the positive-normal side. Distinguish material direction from the element output axes.'],
  shear:['四辺の接線方向に働くせん断流q。互いに向きの異なる矢印でつり合いを示します。面内伸びを担う周囲の部材とは役割が異なります。','Tangential shear flow q acts along all four edges. Opposite arrow directions show equilibrium. The surrounding members carry a different role in resisting in-plane extension.'],
  hexa:['塗りつぶした丸は角節点G1〜G8、白丸は辺の中間節点G9〜G20。隠れた辺は破線です。節点位置と番号を対応させます。','Filled circles are corner nodes G1–G8; open circles are midside nodes G9–G20. Hidden edges are dashed. Match each number to its location.'],
  jointA:['A：梁をソリッドの1節点だけにつなぐ例。ソリッド側の節点は並進自由度だけを持つため、梁の回転を直接は受け止めません。','A: A beam attached to one solid node. The solid node has only translation degrees of freedom, so it does not directly restrain beam rotation.'],
  jointB:['B：曲げを面へ伝えるには、離れた点の力の対が必要です。分配方法と接続範囲による剛性への影響を確認します。','B: Transferring bending to a face requires forces at separated locations. Check how the coupling method and attachment area affect stiffness.'],
  hexaAxes:['向かい合う面の中心間を結ぶR・S・T。これらは軸の構成に使う補助ベクトルであり、ゆがんだ要素で必ず直交するわけではありません。','R, S and T connect opposing face centres. These are construction vectors for the axes; they need not be perpendicular in a distorted element.'],
  couple:['反対向きの力の作用線をdだけ離すと、合力はゼロ、モーメントの大きさはFdになります。','Opposing forces separated by distance d have zero resultant force and moment magnitude Fd.'],
  patch:['上下面のパッチを点線で対応づけた概念図です。面上の補助点と、結合要素の端点GA・GBを区別します。実メッシュではありません。','Conceptual patches on two faces are paired by dotted construction lines. Distinguish auxiliary surface points from connector endpoints GA and GB. This is not a solver mesh.'],
  opening:['A：法線方向の開きδnと接線方向のずれδs・δt。変位は上下の面の差として測ります。','A: Normal opening δn and tangential slips δs, δt are measured as relative displacements between the two faces.'],
  traction:['B：線形の凝着則はt=Kδ。直線の傾きが剛性です。この図に損傷や軟化は含みません。','B: Linear cohesive response t=Kδ. The slope is stiffness. This diagram does not include damage or softening.'],
  rbe2:['A：RBE2。丸の独立点の運動から、菱形の従属点の指定成分が決まります。矢印は力ではなく運動の依存関係です。','A: RBE2. Motion of the independent circular point determines selected components at the dependent diamond points. Arrows show motion dependency, not forces.'],
  rbe3:['B：RBE3の通常の設定。周囲の独立自由度から参照点の従属成分を補間します。一般には回転と幾何も関係し、単純平均とは限りません。','B: Default RBE3 dependency. Independent surrounding degrees of freedom determine dependent reference components by interpolation. Geometry and rotation matter; this is not always a simple average.'],
  rbar:['X方向の2点の剛体運動。Y回転はB点のZ変位に現れます。B点のY変位を選んでも、この回転の不足は補えません。','Rigid motion of two points along X. Rotation about Y produces Z displacement at B. Selecting B translation in Y does not resolve that missing rotation.'],
  weighted:['＋Zは手前。参照点99が重心Cから右へずれると、右側の荷重分担が大きくなります。合力と重心まわりのモーメントを照合します。','+Z is out of the screen. Moving reference point 99 to the right of centroid C increases right-side force shares. Check total force and moment about the centroid.'],
  flexibility:['基準側udを固定し、uiの1成分ずつに単位荷重を与えます。その応答ベクトルが柔性行列Zの対応する1列です。','Fix the reference degrees ud and apply a unit force to one ui component at a time. The displacement response is the corresponding column of flexibility matrix Z.'],
  pipe:['数字は接続節点。緑の区間がGENELで表す継手です。各部材の配置と荷重方向を示す模式図で、実際の比率とは異なります。','Numbers identify connected nodes. The green segment is the joint represented by GENEL. This schematic shows connectivity and load direction, not true proportions.'],
  springTwoEnds:['両端が動く場合。緑の矢印はそれぞれの変位です。この例では右端の変位が大きく、両端を保つ赤い力は等大で逆向きです。','Both ends can move. Green arrows show their displacements. The right end moves farther in this example, and the red forces holding the ends are equal and opposite.'],
  springGround:['片端を地面につなぐ場合。左端の変位はゼロです。右端の荷重は、左端の反力とつり合います。','One end is grounded. The left end has zero displacement. The applied force at the right end balances the reaction at the left end.'],
  springPoints:['左のGRID 10では、ばねをつなぐ変位成分を選びます。中央の白丸はSPOINT 20。図上の配置は接続順を示します。解析では左端の変位u₁と中間の変位qを求め、右の接地端の変位は0です。','At GRID 10 on the left, select the displacement component to connect. The open circle is SPOINT 20, placed schematically to show connection order. The solver finds u₁ and q. The grounded end on the right has zero displacement.'],
  rod:['軸方向に引く棒。左端の反力と右端の荷重がつり合います。曲げ変形を表す図とは区別します。','An axially loaded rod. The left reaction balances the right load. Distinguish this axial deformation from bending.'],
  section:['梁の断面と局所y・z。幅b・高さhを、曲げる方向に対応づけます。','Beam cross-section and local y, z axes. Relate width b and height h to the bending direction.'],
  taper:['長手方向の断面変化。途中断面の位置と断面諸量を対応づけます。','Section variation along the beam. Match each station to its cross-sectional properties.'],
  curved:['曲がった部材の中心線と、両端を結ぶ直線の弦は異なります。','The curved centreline differs from the straight chord joining its endpoints.'],
  crack:['模式的な開口。き裂面の開きと、先端からの距離rを分けて読みます。実要素の節点配置ではありません。','Schematic opening: distinguish crack-face separation from distance r ahead of the tip. This is not an element node layout.'],
  axisymmetric:['左はr–z断面、右はその断面を軸の周りに回して得る回転体です。軸対称では周方向に同じ状態を仮定します。','Left: r–z section. Right: the body formed by revolving it about the axis. Axisymmetry assumes the same state around the circumference.'],
  integration:['丸は節点、×は要素内部の積分点。応力の計算点と出力・平均化する点を混同しないようにします。位置は説明用です。','Circles are nodes; crosses are internal integration points. Distinguish stress evaluation points from extrapolated or averaged output locations. Positions are schematic.'],
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const locale=()=>document.documentElement.lang.toLowerCase().startsWith('ja')?'ja':'en';
 const tr=key=>copy[key][locale()==='ja'?0:1];
 const prose=key=>`<span data-ev-copy="${key}" lang="${locale()}">${esc(tr(key))}</span>`;
 let serial=0;
 const p=(d,c='edge')=>`<path class="ev-${c}" d="${d}"/>`;
 const t=(x,y,s,c='')=>`<text x="${x}" y="${y}" class="${c?`ev-${c}`:''}">${esc(s)}</text>`;
 const dot=(x,y,c='node',r=4)=>`<circle class="ev-${c}" cx="${x}" cy="${y}" r="${r}"/>`;
 const dep=(x,y)=>`<path class="ev-dependent" d="M${x} ${y-6}l6 6-6 6-6-6Z"/>`;
 const ar=(x,y,u,v,c='axis')=>`<path class="ev-${c}" d="M${x} ${y}L${u} ${v}" marker-end="url(#ID-${c})"/>`;
 const arc=(d,c='motion')=>`<path class="ev-${c}" d="${d}" marker-end="url(#ID-${c})"/>`;
 const wall=(x,y,h=60)=>p(`M${x} ${y}v${h}`)+Array.from({length:Math.floor(h/10)},(_,i)=>p(`M${x-10} ${y+i*10+10}l10 -10`,'hatch')).join('');
 const spring=(x,y,w=100)=>p(`M${x} ${y}h${w*.12}l${w*.08} -9 ${w*.12} 18 ${w*.12} -18 ${w*.12} 18 ${w*.12} -18 ${w*.12} 18 ${w*.08} -9h${w*.12}`);
 const cube=()=>p('M70 83H220V188H70Z','face')+p('M70 83L123 43H273L220 83Z','top')+p('M220 83L273 43V148L220 188Z','side')+p('M70 188L123 148H273M123 148V43','ghost');
 const plate=()=>p('M65 172L117 115H294L242 172Z','face');
 const axes=(x,y)=>ar(x,y,x+55,y)+ar(x,y,x,y-50)+t(x+61,y+5,'x','axisText')+t(x+8,y-48,'y','axisText');
 const panel=(key,body,height=230)=>({key,body,height});
 function render(name,panels){
  const id=`ev-${name}-${++serial}`;
  return `<div class="ev-diagram" data-ev-diagram="${name}"><div class="ev-panels">${panels.map(({key,body,height},i)=>{
   const sid=`${id}-${i}`;
   return `<div class="ev-panel"><svg class="ev-svg" viewBox="0 0 360 ${height}" role="img" aria-label="${esc(tr(key))}" data-ev-alt="${key}" lang="${locale()}" dir="ltr"><defs>${['axis','load','motion'].map(c=>`<marker id="${sid}-${c}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path class="ev-head-${c}" d="M0 0L10 5L0 10Z"/></marker>`).join('')}</defs>${body.replaceAll('ID-',sid+'-')}</svg><p class="ev-caption">${prose(key)}</p></div>`;
  }).join('')}</div><details class="ev-key"><summary>${prose('legend')}</summary><p>${prose('symbols')}</p></details></div>`;
 }
 const beamFundamentalPanels=[

   panel('beamAxial',`${t(22,29,'①  N → u')}${wall(51,72,93)}${p('M51 95H246V143H51Z','ghost')}${p('M51 95H281V143H51Z','motion')}${ar(281,119,337,119,'load')}${t(303,101,'N','loadText')}${p('M246 145V190M281 145V190','ghost')}${ar(246,176,281,176,'motion')}${t(256,205,'u','motionText')}${t(85,239,'u = NL / EA')}`,258),
   panel('beamBend',`${t(22,29,'②  P → δb')}${wall(51,70,105)}${p('M51 105H282','ghost')}${p('M51 105C136 105 220 125 282 164','motion')}${p('M112 89L108 125M196 109L186 142M291 149L273 179','axis')}${ar(282,49,282,96,'load')}${t(296,66,'P','loadText')}${ar(310,107,310,162,'motion')}${t(299,194,'δb','motionText')}${t(83,239,'δb = PL³ / (3EI)')}`,258),
   panel('beamShear',`${t(22,29,'③  P → δs')}${wall(51,70,105)}${p('M51 105H282','ghost')}${p('M51 105L282 161','motion')}${p('M112 102V138M194 122V158M282 143V179','axis')}${ar(282,49,282,96,'load')}${t(296,66,'P','loadText')}${ar(310,107,310,160,'motion')}${t(299,194,'δs','motionText')}${arc('M103 105Q103 111 101 117')}${t(115,93,'γ','motionText')}${t(81,218,'γ = P / (KAG)')}${t(81,244,'δs = PL / (KAG)')}`,264),
   panel('beamTorsion',`${t(22,29,'④  T → θ')}${t(235,53,'⊗ x')}${dot(169,130,'open',62)}${p('M169 130H231','ghost')}${p('M169 130L213 174','motion')}${dot(169,130)}${arc('M207 130Q207 148 196 157')}${t(211,151,'θ','motionText')}${arc('M122 63C216 10 298 121 231 189','load')}${t(271,115,'T','loadText')}${t(84,239,'θ = TL / (GJ)')}`,258),
 ];
 const drawings={
  shearCenter:()=>render('shear-center',[false,true].map(offset=>panel(offset?'shearThroughG':'shearThroughS',
   `${t(22,29,offset?'②  P → G':'①  P → S')}${t(268,29,'⊙ x')}${p('M274 81H156V207H274V194H169V94H274Z','face')}${p('M60 144H298','ghost')}${p(offset?'M205 53V229':'M91 53V229','ghost')}${dot(91,144,'open',6)}${dot(205,144)}${t(72,169,'S')}${t(216,169,'G')}${ar(offset?205:91,47,offset?205:91,123,'load')}${t(offset?218:104,65,'P','loadText')}${offset?`${p('M91 227v12H205v-12','dimension')}${t(143,261,'e')}${arc('M267 110C313 99 329 149 296 176','load')}${t(307,196,'T','loadText')}`:t(119,261,'e = 0')}${t(offset?90:115,294,offset?'|T| = P·e':'T = 0')}`,314))),
  beamWarping:()=>render('beam-warping',[
   panel('warpRotation',`${t(22,29,'①  θ')}${t(268,29,'⊙ x')}${p('M99 85H239M169 85V225M99 225H239','ghost')}<g transform="rotate(-18 169 155)">${p('M99 85H239M169 85V225M99 225H239','motion')}</g>${dot(169,155)}${p('M169 155H253','ghost')}${p('M169 155L249 129','motion')}${arc('M224 155Q224 146 221 138')}${t(234,149,'θ','motionText')}`,305),
   panel('warpAxial',`${t(22,29,'②  uₓ(y,z)')}${p('M80 80H230M155 80V200M80 200H230','ghost')}${p('M55 62L155 80L255 98M155 80V200M105 218L155 200L205 182','motion')}${[[80,80,55,62],[230,80,255,98],[80,200,105,218],[230,200,205,182]].map(([a,b,c,d])=>dot(a,b,'open')+ar(a,b,c,d,'motion')).join('')}${t(32,52,'−u','motionText')}${t(267,103,'+u','motionText')}${t(83,248,'+u','motionText')}${t(243,220,'−u','motionText')}${ar(271,140,315,172)}${t(302,197,'x','axisText')}${t(82,284,'uₓ ≠ const.')}`,305),
  ]),
  beamAxial:()=>render('beam-axial',[beamFundamentalPanels[0]]),
  beamBend:()=>render('beam-bend',[beamFundamentalPanels[1]]),
  beamShear:()=>render('beam-shear',[beamFundamentalPanels[2]]),
  beamTorsion:()=>render('beam-torsion',[beamFundamentalPanels[3]]),
  cbarMeaning:()=>render('cbar-meaning',[
   panel('cbarSection',`${t(22,29,'①  A, I1, I2, J = const.')}${p('M62 91H265V153H62Z','face')}${p('M62 91L92 66H295L265 91Z','top')}${p('M265 91L295 66V128L265 153Z','side')}${p('M162 91L192 66V128L162 153Z','axis')}${p('M62 153L92 128V66','ghost')}${p('M77 111H281','ghost')}${t(47,180,'A')}${t(266,180,'B')}${p('M62 222H280','beam')}${dot(62,222)}${dot(280,222)}${t(46,247,'GA')}${t(265,247,'GB')}${t(130,208,'CBAR')}`,266),
   panel('cbarBending',`${t(22,29,'②  P → V, M, δ')}${wall(84,83,100)}${p('M84 117H285','ghost')}${p('M84 117C164 117 234 139 285 174','motion')}${ar(285,57,285,107,'load')}${t(300,71,'P','loadText')}${ar(84,77,84,42,'load')}${t(100,60,'RA','loadText')}${arc('M53 99C13 107 13 155 53 161','load')}${t(16,187,'MA','loadText')}${ar(310,119,310,172,'motion')}${t(309,199,'δ','motionText')}${t(91,210,'|RA| = P')}${t(91,238,'|MA| = PL')}${t(77,282,'A')}${t(275,282,'B')}${p('M84 251v11H285v-11','dimension')}${t(180,283,'L')}`,302),
  ]),
  beamInertia:()=>render('beam-inertia',[
   panel('inertiaSection',`${t(22,29,'①  y–z')}${t(242,29,'⊙ x')}${p('M150 70H200V220H150Z','face')}${ar(175,145,175,45)}${ar(175,145,73,145)}${t(186,51,'y','axisText')}${t(59,150,'z','axisText')}${dot(175,145)}${p('M215 70h12V220h-12M150 232v11H200v-11','dimension')}${t(237,153,'h = 30')}${t(141,269,'b = 10')}${t(89,303,'A = bh = 300 mm²')}`,325),
   panel('inertiaY',`${t(22,29,'②  x–y → I1')}${t(241,29,'⊙ z')}${wall(55,93,118)}${p('M55 171H280','ghost')}${p('M55 171C146 171 224 159 280 138','motion')}${ar(280,131,280,75,'load')}${t(297,91,'Fy','loadText')}${ar(55,65,120,65)}${ar(55,65,55,35)}${t(127,71,'x','axisText')}${t(35,39,'y','axisText')}${p('M273 118L287 157','axis')}${ar(310,170,310,140,'motion')}${t(289,198,'δy','motionText')}${t(48,238,'I1 = Izz = bh³ / 12')}${t(73,266,'= 22,500 mm⁴')}${t(53,303,'δy = PL³ / (3E·I1)')}`,325),
   panel('inertiaZ',`${t(22,29,'③  x–z → I2')}${t(241,29,'⊗ y')}${wall(55,93,118)}${p('M55 171H280','ghost')}${p('M55 171C146 171 224 143 280 105','motion')}${ar(280,98,280,42,'load')}${t(297,59,'Fz','loadText')}${ar(55,65,120,65)}${ar(55,65,55,35)}${t(127,71,'x','axisText')}${t(35,39,'z','axisText')}${p('M268 88L292 122','axis')}${ar(310,170,310,107,'motion')}${t(289,198,'δz','motionText')}${t(48,238,'I2 = Iyy = hb³ / 12')}${t(83,266,'= 2,500 mm⁴')}${t(53,303,'δz = 9δy  (|Fy| = |Fz|)')}`,325),
  ]),
  families:()=>render('families',[panel('families',`${spring(30,58,94)}${dot(30,58)}${dot(124,58)}${t(65,93,'0D')}${p('M207 58H310','beam')}${dot(207,58)}${dot(310,58)}${t(245,93,'1D')}${p('M35 180L60 132H140L115 180Z','face')}${t(72,210,'2D')}${p('M214 152H284V190H214Z','face')}${p('M214 152L237 130H307L284 152Z','top')}${p('M284 152L307 130V168L284 190Z','side')}${t(249,216,'3D')}`)]),
  offsetSpring:()=>render('offset',[
   panel('offsetTranslation',`${t(24,32,'①')}${p('M104 66V157','ghost')}${p('M174 66V157','edge')}${dot(104,66,'open')}${dot(104,157,'open')}${dot(174,66)}${dot(174,157)}${ar(111,66,166,66,'motion')}${ar(111,157,166,157,'motion')}${t(189,72,'B')}${t(189,163,'A')}${ar(249,103,313,103)}${t(319,110,'X','axisText')}${t(89,206,'uA = uB   →   F = 0')}`),
   panel('offsetRotation',`${t(24,32,'②')}${p('M175 161V46','ghost')}${p('M175 161L111 66','motion')}${p('M111 66V29M175 46V29','ghost')}${dot(175,161)}${dot(175,46,'open')}${dot(111,66)}${arc('M175 119Q162 119 151 126')}${t(141,113,'θ','motionText')}${ar(172,29,114,29,'motion')}${t(193,35,'uB < 0','motionText')}${t(84,78,'B′')}${t(188,62,'B')}${t(187,166,'A')}${t(104,209,'uA = 0,   uB ≠ 0')}`),
   panel('offsetCouple',`${t(24,32,'③')}${p('M174 65V160','ghost')}${dot(174,65)}${dot(174,160)}${ar(179,65,268,65,'load')}${ar(168,160,78,160,'load')}${arc('M197 89C229 92 231 122 201 136','load')}${t(236,115,'M','loadText')}${t(231,51,'+F','loadText')}${t(77,145,'−F','loadText')}${t(155,52,'B')}${t(155,185,'A')}${p('M298 65h10v95h-10','dimension')}${t(315,117,'d')}${t(96,214,'ΣF = 0,  |M| = Fd')}`),
  ]),
  cbush:()=>render('cbush',[panel('cbush',`${p('M44 125H145M245 125H309','beam')}${spring(145,125)}${dot(44,125)}${dot(309,125)}${ar(44,124,44,44)}${ar(44,124,110,56,'motion')}${ar(260,124,330,124)}${t(26,151,'GA')}${t(296,151,'GB')}${t(49,38,'y')}${t(115,54,'v')}${t(332,114,'x')}${p('M44 170v14H195v-14M195 184H309v-14','dimension')}${t(95,206,'Sℓ')}${t(226,206,'(1−S)ℓ')}${dot(195,125,'open')}`)]),
  cbushOrientation:()=>render('cbush-orientation',[false,true].map(rotated=>panel(rotated?'cbushOrientationY':'cbushOrientationZ',
   `${t(22,34,rotated?'②  +90°':'①')}${t(126,34,'⊙ x = +X')}${ar(147,133,147,60)}${rotated?ar(147,133,62,133):ar(147,133,218,133)}${dot(147,133)}${t(155,67,rotated?'y ∥ v':'z','axisText')}${rotated?t(43,139,'z','axisText'):t(179,157,'y ∥ v','axisText')}${ar(288,133,288,61,'motion')}${t(301,67,'+Z','motionText')}${t(229,159,'ΔU = 1 mm','motionText')}${t(65,204,rotated?'F = K2·ΔU = 100 N':'F = K3·ΔU = 1,000 N')}`,220))),
  beamAxes:()=>render('beam-axes',[
   panel('axes',`${p('M62 171H304','beam')}${dot(62,171)}${dot(304,171)}${ar(62,169,62,40)}${ar(62,169,326,169)}${ar(62,169,202,63,'motion')}${p('M202 63H62','ghost')}${p('M62 150h19v20','dimension')}${t(70,38,'yₑ')}${t(321,154,'xₑ')}${t(213,63,'v','motionText')}${t(37,195,'GA')}${t(289,195,'GB')}${t(90,218,'⊙ zₑ = xₑ × yₑ')}`),
   panel('bending',`${wall(52,90,110)}${p('M52 127H292','ghost')}${p('M52 127C135 127 213 148 292 189','motion')}${ar(292,69,292,121,'load')}${t(303,84,'F','loadText')}${ar(292,133,292,182,'motion')}${t(306,175,'uᵧ','motionText')}${axes(72,72)}${t(73,220,'Fᵧ < 0, uᵧ < 0')}`)]),
  beamOrientation:()=>render('beam-orientation',[
   panel('orientationComponents',`${p('M60 155H300','beam')}${dot(60,155)}${dot(300,155)}${ar(60,153,316,153)}${ar(60,155,60,61,'motion')}${t(39,181,'GA = A')}${t(280,181,'GB = B')}${t(37,52,'v')}${t(319,150,'x')}${t(69,75,'y')}${t(94,217,'X = (0., 1., 0.)')}`),
   panel('orientationG0',`${p('M40 166H320','beam')}${dot(40,166)}${dot(180,166)}${dot(320,166)}${dot(40,66,'open',6)}${ar(40,165,40,71,'motion')}${ar(180,165,46,71,'motion')}${t(26,53,'G0 = 90')}${t(31,191,'1')}${t(169,191,'2')}${t(309,191,'3')}${t(75,216,'CBAR 1–2 / 2–3')}`),
   panel('orientationOffset',`${p('M64 114H300','beam')}${p('M64 176V114M300 176V114','ghost')}${dot(64,176)}${dot(300,176)}${dot(64,114,'open',5)}${dot(300,114,'open',5)}${dot(132,80,'open',6)}${ar(64,175,130,83,'motion')}${ar(64,113,130,21,'motion')}${t(22,201,'GA')}${t(287,201,'GB')}${t(46,105,'A')}${t(302,106,'B')}${t(144,83,'G0')}${t(20,145,'WA')}${t(304,145,'WB')}`,240),
  ]),
  beamSlabOffset:()=>render('slab-beam-offset',[
   panel('slabBeamSection',`${p('M20 53H340V105H20Z','face')}${p('M135 105H225V205H135Z','side')}${p('M20 79H340','axis')}${p('M135 155H225','beam')}${dot(180,79)}${dot(180,155,'open',5)}${ar(280,80,280,153)}${ar(50,215,50,166)}${t(15,45,'tₛ = 120')}${t(232,190,'hᵦ = 500')}${t(288,124,'e = 310')}${t(190,72,'GA')}${t(190,151,'A')}${t(20,161,'+Z')}`,225),
   panel('slabBeamLength',`${p('M20 45H340V92H20Z','face')}${p('M53 92H307V200H53Z','side')}${p('M22 68H338','axis')}${p('M53 156H307','beam')}${p('M70 70V155M290 70V155','ghost')}${dot(70,68)}${dot(290,68)}${dot(70,156,'open',5)}${dot(290,156,'open',5)}${ar(84,71,84,153)}${ar(304,71,304,153)}${t(47,61,'GA')}${t(278,61,'GB')}${t(49,151,'A')}${t(313,155,'B')}${t(94,120,'WA')}${t(272,120,'WB')}${t(150,85,'PSHELL')}${t(163,185,'CBAR')}`,230),
  ]),
  rectangularSection:()=>render('section-turn',[
   panel('sectionA',`${p('M97 105H247V155H97Z','face')}${ar(172,40,172,98,'load')}${t(184,54,'F','loadText')}${p('M97 167v12H247v-12M260 105h12v50h-12','dimension')}${t(137,202,'b = 30')}${t(279,136,'10')}${t(50,72,'h = 10')}`),
   panel('sectionB',`${p('M138 54H188V204H138Z','face')}${ar(163,12,163,48,'load')}${t(175,26,'F','loadText')}${p('M202 54h12V204h-12','dimension')}${t(224,136,'h = 30')}${t(116,222,'b = 10')}${t(29,127,'90°')}`)]),
  pin:()=>render('release',[
   panel('releaseA',`${p('M31 113H177','ghost')}${p('M177 113H326','ghost')}${p('M31 162L177 113L326 161','beam')}${dot(177,113,'open',10)}${arc('M123 91Q171 44 225 91')}${t(163,53,'θ','motionText')}${t(63,188,'1')}${t(281,188,'2')}${t(48,217,'PB₁ = 456')}${t(223,217,'PA₂ = ∅')}`),
   panel('releaseB',`${dot(158,123,'open',10)}${ar(168,123,281,123,'load')}${ar(158,114,158,39,'load')}${t(277,108,'Fₓ')}${t(169,41,'Fᵧ')}${t(51,175,'u₁ = u₂')}${t(51,201,'M₁B(4,5,6) = 0')}`)]),
  shellStress:()=>render('shell-stress',['membrane','bendStress','totalStress'].map((key,i)=>panel(key,
   `${ar(170,190,170,29)}${ar(60,111,316,111)}${t(177,34,'z')}${t(321,117,'σ')}${p('M57 56H304M57 166H304','ghost')}${t(19,61,'Z2')}${t(19,171,'Z1')}${t(154,134,'0')}${p(i===0?'M170 56H221V166H170Z':i===1?'M170 56H221L119 166H170Z':'M170 56H272L170 166Z','stress')}${p(i===0?'M221 56V166':i===1?'M221 56L119 166':'M272 56L170 166','load')}${t(63,218,['σₘ','σᵦ(z)','σ(z) = σₘ + σᵦ(z)'][i])}`))),
  shellOrder:()=>render('shell-order',[false,true].map(reverse=>panel(reverse?'orderB':'orderA',
   `${p('M79 61H274V181H79Z','face')}${[[79,181],[274,181],[274,61],[79,61]].map(([x,y],i)=>dot(x,y)+t(x-12,y+(i<2?25:-12),'G'+(reverse?[1,4,3,2][i]:i+1))).join('')}${reverse?ar(91,160,91,81):ar(98,168,250,168)}${reverse?ar(100,73,251,73):ar(261,157,261,82)}${t(149,132,reverse?'⊗ zₑ':'⊙ zₑ')}`))),
  shellAngle:()=>render('shell-angle',[panel('angle',`${p('M42 45H314V179H42Z','face')}${dot(42,179)}${dot(314,179)}${ar(89,149,287,149)}${ar(89,149,244,66,'motion')}${arc('M140 149Q141 135 134 125')}${t(149,130,'θ')}${t(250,65,'1','motionText')}${t(14,204,'G1')}${t(302,204,'G2')}${t(59,29,'⊙ zₑ')}${t(129,225,'THETA = θ')}`)]),
  shearPanel:()=>render('shear-panel',[panel('shear',`${p('M65 56H292V186H65Z','face')}${p('M65 56H292V186H65Z','beam')}${ar(95,73,257,73,'load')}${ar(259,169,97,169,'load')}${ar(82,92,82,151,'load')}${ar(276,150,276,94,'load')}${t(174,44,'q')}${t(174,213,'q')}${t(37,129,'q')}${t(309,129,'q')}`)]),
  hexaNodes:()=>{
   const nodes=[[70,188],[220,188],[273,148],[123,148],[70,83],[220,83],[273,43],[123,43]];
   const edges=[[0,1],[1,2],[2,3],[3,0],[0,4],[1,5],[2,6],[3,7],[4,5],[5,6],[6,7],[7,4]];
   const shifts=[[-28,22],[-4,22],[10,8],[-24,14],[-31,1],[5,18],[10,-4],[-19,-14]];
   return render('hexa',[panel('hexa',cube()+nodes.map(([x,y],i)=>dot(x,y)+t(x+shifts[i][0],y+shifts[i][1],'G'+(i+1))).join('')+edges.map(([a,b],i)=>{
    const x=(nodes[a][0]+nodes[b][0])/2,y=(nodes[a][1]+nodes[b][1])/2;
    const offsets=[[0,21],[12,15],[0,20],[-33,0],[-35,5],[7,3],[8,5],[-36,0],[0,-8],[8,4],[0,-10],[-33,-7]][i];
    return dot(x,y,'open')+t(x+offsets[0],y+offsets[1],'G'+(i+9),'small');
   }).join(''))]);
  },
  solidRotation:()=>render('solid-joint',[
   panel('jointA',`${p('M41 73H136V178H41Z','face')}${p('M41 73L75 43H170L136 73Z','top')}${p('M136 73L170 43V148L136 178Z','side')}${p('M153 115H319','ghost')}${p('M153 115L306 180','beam')}${dot(153,115,'open',8)}${arc('M208 116Q210 134 201 144')}${t(219,144,'θ')}${t(57,211,'T1, T2, T3')}`),
   panel('jointB',`${p('M77 54H241V180H77Z','face')}${dot(159,79)}${dot(159,157)}${ar(159,79,290,79,'load')}${ar(159,157,30,157,'load')}${t(287,61,'F')}${t(25,142,'−F')}${p('M312 79h10v78h-10','dimension')}${t(329,125,'d')}${t(118,215,'|M| = Fd')}`)]),
  distortedHexa:()=>render('hexa-axes',[panel('hexaAxes',`${p('M64 78L227 92L215 195L51 170Z','face')}${p('M64 78L126 35L294 52L227 92Z','top')}${p('M227 92L294 52L280 151L215 195Z','side')}${p('M51 170L112 129L280 151M112 129L126 35','ghost')}${ar(83,107,267,130)}${ar(139,137,202,92)}${ar(163,161,178,64)}${t(274,135,'R')}${t(211,90,'S')}${t(186,64,'T')}`)]),
  couple:()=>render('couple',[panel('couple',`${cube()}${ar(71,104,19,104,'load')}${ar(71,165,192,165,'load')}${t(20,88,'−F')}${t(166,151,'+F')}${p('M38 104V165M32 104h12M32 165h12','dimension')}${t(16,140,'d')}${t(111,219,'ΣF = 0, |M| = Fd')}`)]),
  weldPatch:()=>render('patch',[panel('patch',`${p('M37 76L88 36H274L223 76Z','face')}${p('M59 193L110 153H296L245 193Z','face')}${p('M120 64L144 46H195L171 64Z','accent')}${p('M142 181L166 163H217L193 181Z','accent')}${p('M120 64L142 181M144 46L166 163M195 46L217 163M171 64L193 181','ghost')}${p('M157 55L179 172','beam')}${dot(157,55)}${dot(179,172)}${t(205,59,'GA')}${t(227,177,'GB')}${t(22,106,'A')}${t(47,219,'B')}`)]),
  cohesive:()=>render('cohesive',[
   panel('opening',`${p('M51 89L98 48H283L236 89Z','face')}${p('M51 192L98 151H283L236 192Z','face')}${p('M171 172V68','ghost')}${dot(171,68)}${dot(171,172)}${ar(171,129,171,81,'motion')}${ar(171,129,245,129,'motion')}${ar(171,129,215,95,'motion')}${t(132,106,'δn')}${t(251,133,'δs')}${t(222,92,'δt')}`),
   panel('traction',`${ar(64,184,315,184)}${ar(64,184,64,27)}${p('M64 184L270 48','motion')}${p('M146 129H229V74','ghost')}${t(317,206,'δ')}${t(45,27,'t')}${t(185,152,'Δδ')}${t(238,110,'Δt')}${t(117,219,'K = Δt / Δδ')}`)]),
  rigidDirection:()=>render('rigid',[false,true].map(interpolate=>panel(interpolate?'rbe3':'rbe2',
   `${t(136,29,interpolate?'RBE3':'RBE2')}${[[72,64],[286,64],[72,181],[286,181]].map(([x,y])=>{
    const dx=(x-179)*.12,dy=(y-122)*.12;
    return (interpolate?ar(x-dx,y-dy,179+dx,122+dy):ar(179+dx,122+dy,x-dx,y-dy))+(interpolate?dot(x,y):dep(x,y));
   }).join('')}${interpolate?dep(179,122):dot(179,122)}${t(163,157,interpolate?'REF':'GN')}`))),
  rbar:()=>render('rbar',[panel('rbar',`${p('M61 108H286','beam')}${p('M61 108L263 184','ghost')}${dot(61,108)}${dot(286,108)}${ar(286,112,286,180,'motion')}${t(298,159,'u𝓏')}${arc('M108 109Q108 120 103 124')}${t(118,145,'θᵧ')}${t(37,133,'GA')}${t(275,96,'GB')}${t(121,216,'u𝓏,B = −Lθᵧ')}${t(111,42,'⊗ +Y')}${ar(61,108,61,35)}${t(40,30,'Z')}${ar(73,183,135,183)}${t(140,189,'X')}`)]),
  weightedPlate:()=>render('weighted',[panel('weighted',`${p('M93 60H259V226H93Z','face')}${wall(86,60,166)}${[[93,226,'1','20 N'],[259,226,'2','30 N'],[259,60,'3','30 N'],[93,60,'4','20 N']].map(([x,y,n,f])=>dot(x,y)+t(x-7,y+(y>150?23:-11),n)+t(x+(x<100?-65:15),y+(y>150?-13:23),f,'loadText')).join('')}${dot(176,143,'open')}${dep(193,143)}${t(153,129,'C')}${t(203,163,'99')}${t(119,29,'⊙ +Z, F = 100 N')}${p('M176 167v10h17v-10','dimension')}${t(153,201,'10 mm')}`,265)]),
  genelFlexibility:()=>render('flexibility',[panel('flexibility',`${wall(51,86,81)}${p('M51 126H105M245 126H285')}${p('M105 76H245V176H105Z','face')}${dot(51,126)}${dot(285,126)}${ar(285,126,334,126,'load')}${t(300,107,'fᵢ')}${t(139,133,'[Z]')}${t(25,193,'ud = 0')}${t(262,193,'ui')}${t(101,221,'ui = [Z] fᵢ')}`)]),
  genelPipe:()=>render('pipe',[panel('pipe',`${wall(45,163,55)}${p('M45 190L118 122M118 78L151 62L300 39','beam')}${p('M118 122V78','motion')}${[[45,190],[118,122],[118,78],[151,62],[300,39]].map(([x,y],i)=>dot(x,y)+t(x-16,y-9,String(i+1))).join('')}${ar(300,46,300,121,'load')}${t(237,146,'25 lbf')}${t(142,109,'GENEL')}${axes(195,207)}`)]),
  spring:()=>render('spring',[
   panel('springTwoEnds',`${spring(92,109,178)}${dot(92,109)}${dot(270,109)}${t(170,84,'K')}${ar(87,109,29,109,'load')}${ar(275,109,333,109,'load')}${t(30,87,'f₂','loadText')}${t(316,87,'f₁','loadText')}${p('M72 109V170M222 109V170','ghost')}${ar(72,154,92,154,'motion')}${ar(222,154,270,154,'motion')}${t(75,185,'u₂','motionText')}${t(242,185,'u₁','motionText')}`,200),
   panel('springGround',`${wall(92,78,62)}${spring(92,109,178)}${dot(92,109)}${dot(270,109)}${t(170,84,'K')}${ar(87,109,29,109,'load')}${ar(275,109,333,109,'load')}${t(24,66,'−30 N','loadText')}${t(278,87,'+30 N','loadText')}${p('M222 109V170','ghost')}${ar(222,154,270,154,'motion')}${t(68,185,'u₂ = 0')}${t(178,185,'u₁ = +0.30 mm','motionText')}`,200),
  ]),
  springPoints:()=>render('spring-points',[panel('springPoints',`${p('M16 84H57V132H16Z','face')}${spring(57,108,116)}${spring(173,108,131)}${dot(57,108)}${dot(173,108,'open',6)}${p('M304 85v47m0-37l13-12m-13 24l13-12m-13 24l13-12m-13 24l13-12','hatch')}${t(16,153,'GRID 10')}${t(130,153,'SPOINT 20')}${t(103,84,'K₁')}${t(227,84,'K₂')}${ar(57,72,96,72,'motion')}${t(66,60,'u₁','motionText')}${t(167,181,'q')}${t(276,153,'u = 0')}`,196)]),
  rod:()=>render('rod',[panel('rod',`${wall(62,82,80)}${p('M62 105H262V139H62Z','face')}${p('M262 105H283V139H262','ghost')}${ar(262,122,331,122,'load')}${ar(62,122,11,122,'load')}${t(302,98,'F')}${t(14,98,'−F')}${ar(262,166,284,166,'motion')}${t(270,191,'u')}${t(113,215,'u = FL / EA')}`)]),
  section:()=>render('section',[panel('section',`${p('M118 57H234V186H118Z','face')}${ar(176,121,176,24)}${ar(176,121,305,121)}${t(185,28,'yₑ')}${t(308,127,'zₑ')}${p('M118 196v12H234v-12M101 57H89V186h12','dimension')}${t(173,222,'b')}${t(69,130,'h')}`)]),
  taper:()=>render('taper',[panel('taper',`${p('M48 58L305 102V146L48 190Z','face')}${p('M48 124H305','ghost')}${p('M164 78V170','axis')}${t(29,216,'A')}${t(292,176,'B')}${t(167,63,'A(x)')}${ar(60,34,291,34)}${t(303,39,'x')}`)]),
  curved:()=>render('curved',[panel('curved',`${p('M43 175Q180 -65 316 175','beam')}${p('M43 175H316','ghost')}${dot(43,175)}${dot(316,175)}${dot(180,55,'open')}${t(30,203,'A')}${t(306,203,'B')}${t(190,50,'C')}`)]),
  crack:()=>render('crack',[panel('crack',`${p('M52 61H309V181H52Z','face')}${p('M52 121Q110 99 175 121Q110 143 52 121Z','gap')}${dot(175,121)}${ar(175,121,279,121)}${t(232,109,'r')}${ar(115,61,115,24,'load')}${ar(254,61,254,24,'load')}${ar(115,181,115,219,'load')}${ar(254,181,254,219,'load')}`)]),
  axisymmetric:()=>render('axisymmetric',[panel('axisymmetric',`${ar(36,195,36,29)}${ar(36,195,145,195)}${t(18,29,'z')}${t(147,214,'r')}${p('M69 68H113V167H69Z','face')}${p('M218 75V172C218 196 320 196 320 172V75','face')}${p('M218 75C218 49 320 49 320 75C320 101 218 101 218 75Z','top')}${p('M243 75C243 65 295 65 295 75C295 85 243 85 243 75Z','gap')}${p('M269 25V212','ghost')}${ar(156,123,199,123,'motion')}`)]),
  integration:()=>render('integration',[panel('integration',`${cube()}${[[70,83],[220,83],[70,188],[220,188],[123,43],[273,43],[273,148],[123,148]].map(([x,y])=>dot(x,y)).join('')}${[[116,106],[186,106],[116,162],[186,162]].map(([x,y])=>p(`M${x-5} ${y-5}l10 10m-10 0l10 -10`,'load')).join('')}`)]),
 };
 window.ElementVisuals=drawings;
 // These replace geometry sketches previously supplied by generic, text-heavy diagrams.
 window.ElementSectionVisuals={
  'beam-crod':'rod','beam-pbarl':'section','beam-taper':'taper',
  'beam-curved':'curved','shell-crack':'crack','solid-triax':'axisymmetric',
  'solid-psolid':'integration','connector-why':'weldPatch',
 };
 window.ElementFigureCopy=copy;
 function refresh(){
  document.querySelectorAll('[data-ev-copy]').forEach(el=>{el.textContent=tr(el.dataset.evCopy);el.lang=locale();});
  document.querySelectorAll('[data-ev-alt]').forEach(el=>{el.setAttribute('aria-label',tr(el.dataset.evAlt));el.setAttribute('lang',locale());});
 }
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
