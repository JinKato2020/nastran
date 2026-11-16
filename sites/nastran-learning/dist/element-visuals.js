/* Original conceptual illustrations, not solver meshes or reproductions of manual figures.
 * SVGs contain symbols only. All prose (including accessible names) lives in the
 * locale catalogue below. Geometry must never be mirrored for RTL languages.
 */
(() => {
 'use strict';
 const copy = {
  enlarge:['図を拡大','Enlarge diagram'], close:['閉じる','Close'],
  legend:['図の記号を確認','Diagram key'],
  symbols:['赤い矢印 F・M：力・モーメント。青い矢印 x・y・z：座標軸。緑のv：向きベクトル。緑のu・θ：変位や回転（説明用に誇張）。破線：基準形状・補助線。丸：節点。菱形：従属自由度を持つ点。矢印の意味は各図の説明でも確認してください。','Red arrows F, M: forces and moments. Blue arrows x, y, z: coordinate axes. Green v: orientation vector. Green u, θ: exaggerated displacement or rotation. Dashed lines: reference geometry or construction lines. Circles: nodes. Diamonds: points with dependent degrees of freedom. Check each caption for the meaning of its arrows.'],
  families:['形状の表し方を比較。ばねは自由度間、棒・梁は線、シェルは基準面、ソリッドは体積で表します。','Compare representations: a spring connects degrees of freedom; a rod or beam uses a line, a shell a reference surface, and a solid a volume.'],
  offsetA:['A：上下に離れた点へ逆向きの水平力が作用すると、合力はゼロでも力の対 Fd が残ります。','A: Opposing horizontal forces at vertically separated points have zero resultant force but a nonzero couple Fd.'],
  offsetB:['B：一体で回転しただけでも、離れた2点の水平変位には差が出ます。CELASの成分方向と位置を分けて確認します。','B: Rigid rotation alone creates different horizontal displacements at separated points. Check the CELAS component directions separately from their locations.'],
  cbush:['GA→GBとvで軸を定める場合の模式図。ばね位置Sℓと、そこまでの剛な区間を区別します。CIDなどの指定によって軸の決定方法は変わります。','Schematic for axes defined by GA→GB and v. Distinguish the spring location Sℓ from the rigid arms. CID and other settings can change how axes are defined.'],
  ends:['破線は2点の位置関係です。ばねの伸びはその斜線方向ではなく、各点で選んだ成分の差から求めます。','The dashed line only connects the locations. Spring extension comes from the selected displacement components, not from distance along that line.'],
  axes:['A：xに垂直なvの成分がyを決めます。vそのものがyとは限りません。zはx×y、⊙は画面の手前です。','A: The part of v perpendicular to x defines y. v itself need not align with y. z = x × y; ⊙ points out of the screen.'],
  bending:['B：下向きの先端荷重に対する片持ち梁。破線は変形前、緑は曲げ変形です。局所軸と外力の符号を別々に読みます。','B: A cantilever under a downward tip force. Dashed lines show the original shape; green shows bending. Read the local axes and load signs separately.'],
  sectionA:['A：荷重方向の高さhが小さい断面。曲げに対する断面二次モーメントはbh³/12です。','A: A section with small height h in the load direction. Its second moment of area for this bending direction is bh³/12.'],
  sectionB:['B：同じ断面を90°回転。高さが3倍、幅が1/3なら、断面二次モーメントは9倍です。','B: Rotate the same section by 90°. Tripling the height and reducing the width to one third increases the second moment of area ninefold.'],
  releaseA:['A：共通節点で並進を共有し、梁1のB端の回転成分4・5・6を解放する例。2本の接線が異なっても節点位置は一致します。','A: The common node shares translation, while beam 1 releases its B-end rotations 4, 5, 6. The two members may have different tangents at the same node.'],
  releaseB:['B：端部解放は接地拘束ではありません。並進力は伝達でき、解放した回転に対応する端モーメントはゼロになります。','B: An end release is not a ground constraint. Translational forces can be transmitted, while end moments conjugate to the released rotations are zero.'],
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
  shearBend:['A：曲げでは断面が回転します。B：横せん断では、中心線の接線と断面法線の間に角度差γが生じます。模式的に分離して示しています。','A: Cross-sections rotate in bending. B: Transverse shear introduces angle γ between the centreline tangent and section normal. The contributions are separated schematically.'],
  integration:['丸は節点、×は要素内部の積分点。応力の計算点と出力・平均化する点を混同しないようにします。位置は説明用です。','Circles are nodes; crosses are internal integration points. Distinguish stress evaluation points from extrapolated or averaged output locations. Positions are schematic.'],
  twist:['断面の回転角は長手方向で変化します。式は一定断面・一定トルクで反り拘束の影響を含めない場合です。曲げは軸のたわみ、ねじりは軸まわりの回転として区別します。','Section rotation changes along the length. The equation assumes a uniform section and torque without restrained-warping effects. Bending deflects the axis; torsion rotates around it.'],
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
  }).join('')}</div><div class="ev-controls"><button type="button" data-ev-zoom>${prose('enlarge')}</button><details><summary>${prose('legend')}</summary><p>${prose('symbols')}</p></details></div></div>`;
 }
 const drawings={
  families:()=>render('families',[panel('families',`${spring(30,58,94)}${dot(30,58)}${dot(124,58)}${t(65,93,'0D')}${p('M207 58H310','beam')}${dot(207,58)}${dot(310,58)}${t(245,93,'1D')}${p('M35 180L60 132H140L115 180Z','face')}${t(72,210,'2D')}${p('M214 152H284V190H214Z','face')}${p('M214 152L237 130H307L284 152Z','top')}${p('M284 152L307 130V168L284 190Z','side')}${t(249,216,'3D')}`)]),
  offsetSpring:()=>render('offset',[
   panel('offsetA',`${dot(100,172)}${dot(245,65)}${p('M100 172V115H245V65','ghost')}${spring(125,115,90)}${ar(100,172,35,172,'load')}${ar(245,65,310,65,'load')}${t(57,154,'−F','loadText')}${t(277,48,'+F','loadText')}${t(85,197,'A')}${t(232,49,'B')}${p('M322 65V172M316 65h12M316 172h12','dimension')}${t(328,125,'d')}${t(115,215,'|M| = Fd')}`),
   panel('offsetB',`${p('M132 181V58','ghost')}${p('M132 181L208 84','motion')}${dot(132,181)}${dot(132,58,'open')}${dot(208,84)}${arc('M132 130Q155 127 168 137')}${t(156,119,'θ','motionText')}${ar(133,45,206,45,'motion')}${t(150,30,'Δuₓ','motionText')}${p('M208 45V84','ghost')}${t(83,211,'|Δuₓ| ≈ |θ|d')}`)]),
  cbush:()=>render('cbush',[panel('cbush',`${p('M44 125H145M245 125H309','beam')}${spring(145,125)}${dot(44,125)}${dot(309,125)}${ar(44,124,44,44)}${ar(44,124,110,56,'motion')}${ar(260,124,330,124)}${t(26,151,'GA')}${t(296,151,'GB')}${t(49,38,'y')}${t(115,54,'v')}${t(332,114,'x')}${p('M44 170v14H195v-14M195 184H309v-14','dimension')}${t(95,206,'Sℓ')}${t(226,206,'(1−S)ℓ')}${dot(195,125,'open')}`)]),
  springEnds:()=>render('ends',[panel('ends',`${p('M65 169L210 65','ghost')}${dot(65,169)}${dot(210,65)}${ar(65,169,157,169)}${ar(210,65,302,65)}${t(55,196,'G1')}${t(199,47,'G2')}${t(116,153,'u₁')}${t(266,49,'u₂')}${t(82,222,'Δu = u₂ − u₁')}`)]),
  beamAxes:()=>render('beam-axes',[
   panel('axes',`${p('M62 171H304','beam')}${dot(62,171)}${dot(304,171)}${ar(62,169,62,40)}${ar(62,169,326,169)}${ar(62,169,202,63,'motion')}${p('M202 63H62','ghost')}${p('M62 150h19v20','dimension')}${t(70,38,'yₑ')}${t(321,154,'xₑ')}${t(213,63,'v','motionText')}${t(37,195,'GA')}${t(289,195,'GB')}${t(90,218,'⊙ zₑ = xₑ × yₑ')}`),
   panel('bending',`${wall(52,90,110)}${p('M52 127H292','ghost')}${p('M52 127C135 127 213 148 292 189','motion')}${ar(292,69,292,121,'load')}${t(303,84,'F','loadText')}${ar(292,133,292,182,'motion')}${t(306,175,'uᵧ','motionText')}${axes(72,72)}${t(73,220,'Fᵧ < 0, uᵧ < 0')}`)]),
  rectangularSection:()=>render('section-turn',[
   panel('sectionA',`${p('M97 105H247V155H97Z','face')}${ar(172,40,172,98,'load')}${t(184,54,'F','loadText')}${p('M97 167v12H247v-12M260 105h12v50h-12','dimension')}${t(137,202,'b = 30')}${t(279,136,'10')}${t(50,72,'h = 10')}`),
   panel('sectionB',`${p('M138 54H188V204H138Z','face')}${ar(163,12,163,48,'load')}${t(175,26,'F','loadText')}${p('M202 54h12V204h-12','dimension')}${t(224,136,'h = 30')}${t(116,222,'b = 10')}${t(29,127,'90°')}`)]),
  pin:()=>render('release',[
   panel('releaseA',`${p('M31 113H177','ghost')}${p('M177 113H326','ghost')}${p('M31 162L177 113L326 161','beam')}${dot(177,113,'open',10)}${arc('M123 91Q171 44 225 91')}${t(163,53,'θ','motionText')}${t(63,188,'1')}${t(281,188,'2')}${t(85,217,'PB₁ = 456')}`),
   panel('releaseB',`${dot(158,123,'open',10)}${ar(168,123,281,123,'load')}${ar(158,114,158,39,'load')}${t(277,108,'Fₓ')}${t(169,41,'Fᵧ')}${t(51,175,'u₁ = u₂')}${t(51,201,'Mₓ = Mᵧ = M𝓏 = 0')}`)]),
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
  shearBend:()=>render('shear-bend',[panel('shearBend',`${t(24,33,'A')}${p('M50 78Q165 37 306 78','motion')}${p('M50 78L42 48M176 58V28M306 78L314 48','axis')}${p('M50 103H306','ghost')}${t(24,150,'B')}${p('M50 206L304 150','motion')}${p('M50 206V174M176 178V145M304 150V117','axis')}${p('M176 178L170 149','ghost')}${t(187,160,'γ')}`)]),
  integration:()=>render('integration',[panel('integration',`${cube()}${[[70,83],[220,83],[70,188],[220,188],[123,43],[273,43],[273,148],[123,148]].map(([x,y])=>dot(x,y)).join('')}${[[116,106],[186,106],[116,162],[186,162]].map(([x,y])=>p(`M${x-5} ${y-5}l10 10m-10 0l10 -10`,'load')).join('')}`)]),
  twist:()=>render('twist',[panel('twist',`${p('M52 77L117 53L117 145L52 169Z','face')}${p('M245 76L302 94L283 177L226 159Z','face')}${p('M85 111L264 126','ghost')}${p('M52 77L245 76M117 53L302 94M117 145L283 177M52 169L226 159','edge')}${arc('M313 72Q345 127 305 182','load')}${t(321,150,'Mₓ')}${t(142,215,'θ = MₓL / GJ')}`)]),
 };
 window.ElementVisuals=drawings;
 // These replace geometry sketches previously supplied by generic, text-heavy diagrams.
 window.ElementSectionVisuals={
  'beam-theory':'shearBend',
  'beam-crod':'rod','beam-cbar':'twist','beam-pbarl':'section','beam-taper':'taper',
  'beam-curved':'curved','shell-crack':'crack','solid-triax':'axisymmetric',
  'solid-psolid':'integration','connector-why':'weldPatch',
 };
 window.ElementFigureCopy=copy;
 function refresh(){
  document.querySelectorAll('[data-ev-copy]').forEach(el=>{el.textContent=tr(el.dataset.evCopy);el.lang=locale();});
  document.querySelectorAll('[data-ev-alt]').forEach(el=>{el.setAttribute('aria-label',tr(el.dataset.evAlt));el.setAttribute('lang',locale());});
 }
 new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.addEventListener('DOMContentLoaded',()=>{
  const dlg=document.createElement('dialog');dlg.className='ev-dialog';
  dlg.innerHTML=`<button type="button" data-ev-close>${prose('close')}</button><div class="ev-dialog-body"></div>`;
  dlg.setAttribute('aria-label',tr('enlarge'));document.body.append(dlg);
  let opener;
  document.addEventListener('click',event=>{
   const button=event.target.closest('[data-ev-zoom]');if(!button)return;
   opener=button;
   const clone=button.closest('.ev-diagram').querySelector('.ev-panels').cloneNode(true);
   // Duplicate SVG IDs make marker references ambiguous; namespace the enlarged copy.
   const suffix=`zoom-${++serial}-`;
   clone.querySelectorAll('[id]').forEach(el=>{const old=el.id;el.id=suffix+old;clone.querySelectorAll('[marker-end]').forEach(path=>{if(path.getAttribute('marker-end')===`url(#${old})`)path.setAttribute('marker-end',`url(#${suffix+old})`);});});
   dlg.querySelector('.ev-dialog-body').replaceChildren(clone);dlg.setAttribute('aria-label',tr('enlarge'));dlg.showModal();
  });
  dlg.querySelector('[data-ev-close]').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('close',()=>{dlg.querySelector('.ev-dialog-body').replaceChildren();opener?.focus({preventScroll:true});});
 });
})();
