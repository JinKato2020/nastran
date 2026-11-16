(() => {
 'use strict';
 const {arrow,svg}=window.LessonDiagrams;
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const point=(x,y,cls='node')=>`<circle class="${cls}" cx="${x}" cy="${y}" r="4"/>`;
 const path=(d,cls='outline')=>`<path class="${cls}" d="${d}"/>`;
 const label=(x,y,t,cls='',anchor='start')=>`<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${escape(t)}</text>`;
 const center=(x,y,t,cls)=>label(x,y,t,cls,'middle');
 const box=(x,y,w,h,cls='surface')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" class="${cls}"/>`;
 const figure=(id,title,body,height=156)=>`<figure class="material-figure">${svg('topic-'+id,escape(title),body,height)}<figcaption>${escape(title)}</figcaption></figure>`;
 const a=(id,x,y,u,v,k)=>arrow('topic-'+id,x,y,u,v,k);
 const wall=(x,y)=>path(`M${x} ${y-15}v30m-8 -22l8 -7m-8 16l8 -7m-8 16l8 -7m-8 16l8 -7`,'ghost');
 const flow=(title,...nodes)=>`<figure class="teaching-flow"><ol>${nodes.map(([name,description],i)=>`<li><strong>${escape(name)}</strong>${description?`<span>${escape(description)}</span>`:''}${i<nodes.length-1?'<span class="teaching-flow-arrow" aria-hidden="true">→</span>':''}</li>`).join('')}</ol>${title?`<figcaption>${escape(title)}</figcaption>`:''}</figure>`;

 const sketches={
  rod:()=>figure('rod','左端を止め、右端を引く棒。入力した力と反力は逆向きで、右端に軸方向の変位が生じます。',
   `${wall(76,86)}${box(77,75,169,22)}${path('M246 73H273V99H246Z','ghost')}${point(76,86)}${point(246,86)}
   ${a('rod',76,86,24,86,'load')}${a('rod',247,86,310,86,'load')}${a('rod',246,108,274,108)}
   ${label(20,67,'反力','load-label')}${label(282,67,'引張力','load-label')}${label(253,130,'変位','axis-label')}
   ${center(161,49,'支点 ─ 棒 ─ 荷重点','label')}`,142),
  spring:()=>figure('spring','変位xから元へ戻そうとするばね力と、加速度を決める質量を別々に見ます。',
   `${wall(45,75)}${path('M45 75H66l10 -10 14 20 14 -20 14 20 14 -20 10 10H170')}${box(170,48,63,55)}${center(201,80,'質量 m','label')}
   ${label(76,44,'ばね k')}${path('M203 110V126','ghost')}${a('spring',203,118,279,118)}
   ${a('spring',167,94,129,94,'load')}${label(79,119,'戻す力 kx','load-label')}${label(278,138,'変位 x','axis-label')}`,146),
  boundaries:()=>figure('boundary','固定・対称・自由面では、許される動きと、面が力を受け持つかが異なります。',
   `${box(28,54,52,45)}${wall(28,76)}${center(61,33,'固定','label')}${center(61,125,'対象成分を止める','small')}
    ${box(146,54,52,45)}${path('M145 47V105','ghost')}${a('boundary',158,90,158,61)}${center(172,33,'対称面','label')}${center(171,125,'法線の並進を止める','small')}
    ${box(258,54,52,45)}${a('boundary',284,75,324,75)}${center(284,33,'自由面','label')}${center(282,125,'面荷重ゼロの例','small')}`,139),
  imposed:()=>figure('imposed','右端を所定量だけ動かすと、変位が入力になり、その移動に必要な反力が結果になります。',
   `${wall(56,73)}${path('M57 73H77l9 -8 12 16 12 -16 12 16 12 -16 9 8H212')}${box(212,54,31,39)}${path('M244 50V100','ghost')}
    ${a('imposed',245,73,303,73)}${a('imposed',212,92,165,92,'load')}${label(246,48,'指定変位','axis-label')}${label(162,115,'ばね力','load-label')}`,131),
  heat:()=>figure('heat','発熱する板の例。左端で温度を指定し、上面は断熱、右端では外気へ熱が逃げます。',
   `${box(83,57,156,55)}${path('M82 54H241','ghost')}${path('M83 57V112','axis')}
    ${center(160,43,'断熱：面を横切る熱流 0')}${label(7,77,'温度指定','axis-label')}
    ${center(162,89,'板の内部で熱が発生','label')}${a('heat',239,72,294,72,'load')}${a('heat',239,96,294,96,'load')}
    ${label(265,123,'外気へ放熱','load-label')}`,137),
  thermalBar:()=>figure('thermal-bar','同じ温度上昇でも、自由な棒は伸び、両端を止めた棒には圧縮応力が生じます。',
   `${center(82,25,'自由に伸びる','label')}${center(255,25,'伸びを止める','label')}
    ${box(24,66,94,21)}${path('M118 65H143V88H118Z','ghost')}${a('thermal-bar',115,99,142,99)}
    ${wall(203,76)}${wall(305,76)}${box(203,66,102,21)}
    ${a('thermal-bar',208,76,235,76,'load')}${a('thermal-bar',300,76,273,76,'load')}
    ${center(82,123,'熱膨張による伸び')}${center(255,123,'軸方向の圧縮')}`,138),
  crack:()=>figure('crack','き裂の面は開き、先端付近に応力勾配が集中します。先端から離れた位置と距離rを区別します。',
   `${box(55,45,229,67)}${path('M56 78Q100 66 148 78Q100 90 56 78Z','load')}${point(148,78)}
    ${a('crack',149,78,216,78)}${label(194,71,'r','axis-label')}${label(93,104,'き裂先端')}
    ${a('crack',112,45,112,20,'load')}${a('crack',112,112,112,137,'load')}
    ${a('crack',229,45,229,20,'load')}${a('crack',229,112,229,137,'load')}`,151),
  buckled:()=>figure('buckled','圧縮で直線の柱が不安定になり、横に曲がる形が現れます。破線は元の柱です。',
   `${path('M171 40V119','ghost')}${path('M171 40Q249 81 171 119','axis')}${point(171,40)}${point(171,119)}
    ${a('buckled',171,14,171,34,'load')}${a('buckled',171,145,171,125,'load')}
    ${label(195,24,'圧縮力','load-label')}${label(230,88,'横に曲がる形','axis-label')}${label(84,86,'元の柱')}`,154),
  pointLoad:()=>figure('point-load','節点へ与える力と、同じ節点まわりのモーメントを区別する例です。',
   `${wall(48,91)}${path('M48 91H249')}${point(249,91)}${a('point-load',249,42,249,84,'load')}
    ${label(255,46,'集中力 F','load-label')}${label(255,107,'作用点')}
    ${path('M201 76C176 54 153 91 176 108','load')}${a('point-load',165,99,176,108,'load')}
    ${label(106,51,'モーメント M','load-label')}`,131),
  lineLoad:()=>figure('line-load','線荷重は梁の区間に沿う荷重です。矢印の長さは単位長さ当たりの強度を表します。',
   `${path('M31 92H309')}${point(31,92)}${point(309,92)}${label(24,115,'A')}${label(302,115,'B')}
    ${[85,125,165,205,245].map((x,i)=>a('line-load',x,60-i*9,x,87,'load')).join('')}
    ${path('M85 60L245 24','ghost')}${path('M85 102V116H245V102','ghost')}${center(165,137,'荷重を与える区間')}`,147),
  pressure:()=>figure('pressure','面圧を与えるときは、対象面・法線・荷重矢印を合わせて確認します。',
   `${path('M67 103L117 60H280L231 103Z','surface')}
    ${[98,147,196,245].map(x=>a('pressure',x,52,x,81,'load')).join('')}
    ${a('pressure',214,106,214,38)}${label(220,42,'面の正法線','axis-label')}${label(83,46,'面圧','load-label')}${center(174,131,'選択した面')}`,141),
  massLoads:()=>figure('massloads','一様加速度の荷重は質量に比例します。回転では軸からの距離も関係します。',
   `${center(86,24,'一様加速度','label')}${center(250,24,'回転の遠心成分','label')}
    ${box(62,56,46,35)}${center(85,78,'m')}${a('massloads',85,91,85,122,'load')}${label(93,118,'ma','load-label')}
    ${point(201,83)}${path('M201 83H264','ghost')}${box(264,66,34,33)}${center(281,87,'m')}${a('massloads',298,83,329,83,'load')}
    ${label(198,109,'軸')}${label(233,76,'r')}${center(280,125,'mω²r','load-label')}`,138),
  contact:()=>figure('contact','片側接触の例。押すと力を伝え、開いた面には接触圧が生じません。',
   `${center(86,20,'接触して押し合う','label')}${center(254,20,'すき間が開く','label')}
    ${box(32,60,106,30)}${box(32,90,106,22,'core')}${a('contact',85,32,85,57,'load')}
    ${box(201,48,106,30)}${box(201,100,106,22,'core')}${a('contact',250,48,250,24)}
    ${center(85,138,'接触圧あり')}${center(254,138,'接触圧 0')}`,145),
  mesh:()=>figure('mesh','評価位置の近くを細かくし、応力の変化が緩い位置で粗いメッシュへ移る例です。',
   `${box(27,49,286,65)}${path('M103 49V114M145 49V114M198 49V114M27 70H103L145 81H313M27 92H103L145 81M49 49V114M74 49V114')}
    ${point(49,70)}${label(29,42,'評価位置','label')}${center(72,137,'細かい領域')}${center(182,137,'遷移')}${center(272,137,'粗い領域')}`,149),
  cylinder:()=>figure('cylinder','厚肉円筒の断面。円筒全体の代わりに、半径方向と軸方向の断面でモデル化します。',
   `${path('M35 90a55 46 0 1 0 110 0a55 46 0 1 0 -110 0M61 90a29 24 0 1 1 58 0a29 24 0 1 1 -58 0','surface')}
    ${a('cylinder',90,90,136,90)}${label(118,79,'r','axis-label')}${a('cylinder',66,90,44,90,'load')}${center(89,146,'円筒の内圧')}
    ${box(239,48,56,79)}${path('M205 40V129','ghost')}${a('cylinder',205,127,309,127)}${a('cylinder',205,127,205,42)}
    ${label(311,132,'r','axis-label')}${label(193,40,'z','axis-label')}${center(270,32,'r–z断面','label')}`,158),
  modes:()=>figure('modes','支持間の1次と2次の振動形の例。2次では中央に動かない点があります。縦方向の大きさは表示のために拡大しています。',
   `${path('M28 64H146M192 64H310','ghost')}
    ${path('M28 64Q87 3 146 64','axis')}${path('M192 64Q221 13 251 64Q281 115 310 64','axis')}
    ${point(28,64)}${point(146,64)}${point(192,64)}${point(310,64)}${point(251,64,'dependent')}
    ${center(86,119,'1次：中央が動く')}${center(252,119,'2次：中央が節')}`,135),
  phase:()=>figure('phase','同じ周波数でも、力と変位の山が現れる時刻はずれることがあります。',
   `${a('phase',37,74,311,74)}${a('phase',39,118,39,24)}
    ${path('M42 74C62 25 91 25 113 74S163 123 184 74S235 25 256 74S292 119 309 88','load')}
    ${path('M42 110C62 110 73 104 92 74S143 25 164 74S214 123 235 74S285 25 306 74','axis')}
    ${path('M76 24H128M76 22V46M128 22V46','ghost')}${center(102,18,'位相差','label')}
    ${label(262,28,'力','load-label')}${label(285,49,'変位','axis-label')}${label(284,102,'時間')}`,126),
  resonance:()=>figure('resonance','加振周波数を変えたときの変位振幅。減衰の大きい場合、共振付近のピークが低くなります。',
   `${a('resonance',46,120,314,120)}${a('resonance',46,120,46,30)}
    ${path('M51 104C101 100 125 108 157 61C173 36 175 21 185 55C201 107 270 113 307 113','axis')}
    ${path('M51 105C120 102 147 78 173 78S222 111 307 115','direction')}
    ${label(8,22,'振幅')}${label(237,141,'加振周波数')}${label(200,46,'減衰が小さい')}${label(198,77,'減衰が大きい')}`,150),
  transient:()=>figure('transient','荷重がゼロに戻った後も、構造の変位は振動しながら減衰する例です。',
   `${a('transient',52,56,311,56)}${a('transient',52,118,311,118)}
    ${path('M55 56H86V27H141V56H305','load')}${path('M55 118H86C99 118 108 83 124 88S148 144 168 134S192 104 210 109S235 129 250 124S277 114 304 119','axis')}
    ${path('M141 24V143','ghost')}${label(12,46,'荷重','load-label')}${label(12,108,'変位','axis-label')}
    ${label(254,77,'時間')}${label(254,145,'時間')}`,154),
  damping:()=>figure('damping','自由振動では、実線の変位の山をつなぐ包絡線がだんだん小さくなります。',
   `${a('damping',40,74,315,74)}
    ${path('M44 74C55 39 70 24 91 74S125 117 143 74S175 44 192 74S222 96 238 74S266 59 280 74S298 85 309 74','axis')}
    ${path('M53 31C112 40 179 54 310 69M53 117C112 108 179 94 310 79','ghost')}
    ${label(10,70,'変位')}${label(271,114,'時間')}${label(176,31,'包絡線')}`,125),
  snap:()=>figure('snap','浅いアーチを押すと、荷重と変位の関係に限界点が現れます。図は荷重−変位経路の一例です。',
   `${path('M22 65Q83 14 145 65 M22 65Q83 106 145 65','outline')}${point(22,65)}${point(145,65)}
    ${a('snap',83,11,83,34,'load')}${center(85,121,'押す前と押した後')}
    ${a('snap',198,119,324,119)}${a('snap',198,119,198,24)}
    ${path('M198 119C224 102 229 55 251 54S270 89 290 76S310 41 318 30','direction')}
    ${point(251,54,'dependent')}${label(244,43,'限界点')}${label(176,23,'荷重')}${label(290,139,'変位')}`,149),
  plastic:()=>figure('plastic','降伏後に除荷すると、弾性分だけ戻ります。ゼロ応力で残るひずみが残留ひずみです。',
   `${a('plastic',51,124,315,124)}${a('plastic',51,124,51,24)}
    ${path('M51 124L112 56L218 38','load')}${path('M218 38L141 124','axis')}
    ${point(112,56,'dependent')}${point(218,38)}${point(141,124)}
    ${label(18,24,'応力')}${label(273,146,'ひずみ')}${label(84,43,'降伏点')}${label(182,86,'除荷','axis-label')}${label(110,146,'残留ひずみ')}`,155),
  cantilever:()=>figure('cantilever','片持ち梁の先端に下向きの力。固定端から荷重点までの距離が曲げモーメントに効きます。',
   `${wall(61,72)}${path('M61 72H265')}${path('M61 72Q186 74 265 107','axis')}
    ${a('cantilever',265,29,265,67,'load')}${label(275,39,'荷重 F','load-label')}
    ${path('M61 106V122H265V113','ghost')}${center(161,143,'荷重点までの距離 L')}${label(19,48,'固定')}`,154),
  plateHole:()=>figure('plate-hole','両側から引く穴あき板。穴の上下の縁で応力が集中する例です。',
   `<path class="surface" fill-rule="evenodd" d="M61 33H283V122H61Z M151 78a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z"/>
    ${[56,78,101].map(y=>a('plate-hole',60,y,21,y,'load')+a('plate-hole',285,y,323,y,'load')).join('')}
    ${point(172,57,'dependent')}${point(172,99,'dependent')}${label(180,50,'穴の縁')}${center(172,146,'引張方向に直交する縁を評価')}`,156),
  seriesSprings:()=>figure('series','直列では同じ力が2本のばねを通り、両方の伸びが足し合わされます。',
   `${wall(47,76)}${path('M47 76H62l7 -9 10 18 10 -18 10 18 10 -18 7 9H141M141 76H159l7 -9 10 18 10 -18 10 18 10 -18 7 9H246')}
    ${point(47,76)}${point(141,76)}${point(246,76)}${a('series',250,76,308,76,'load')}
    ${center(99,50,'ばね k₁')}${center(197,50,'ばね k₂')}${label(291,62,'F','load-label')}
    ${center(162,118,'全体の伸び = F/k₁ ＋ F/k₂','label')}`,132),
  taperedBeam:()=>figure('tapered','断面が変わる梁は、長手方向のどこで断面値を定義したかを確認します。',
   `${path('M40 51L286 70V97L40 117Z','surface')}${path('M40 84H287','ghost')}${path('M155 62V108','axis')}
    ${point(40,84)}${point(286,84)}${label(25,42,'A端')}${label(273,57,'B端')}
    ${label(160,57,'中間断面')}${a('tapered',64,127,265,127)}${center(164,148,'長手方向の位置')}`,159),
  curvedBeam:()=>figure('curved','曲がった梁では、両端を結ぶ弦と、実際の梁の曲線を区別します。',
   `${path('M58 107Q163 -11 281 107','axis')}${path('M58 107H281','ghost')}
    ${point(58,107)}${point(281,107)}${point(166,48,'open-node')}
    ${label(35,122,'A端')}${label(276,123,'B端')}${label(173,40,'曲線上の点')}${center(170,131,'両端を結ぶ弦')}`,146),
  attachment:()=>figure('attachment','同じ位置に見える面を結ぶときは、力がどの接続点を通って移るかを確認します。',
   `${path('M27 67H182L211 46H56Z M130 110H286L315 91H160Z','surface')}
    ${point(162,57)}${point(175,101)}${a('attachment',164,61,174,96,'load')}
    ${label(23,41,'上側の面')}${label(254,128,'下側の面')}${label(186,82,'接続で力を伝える','load-label')}`,138),
  threeSprings:()=>figure('three-springs','支える位置は等間隔で、右だけ剛さが4倍です。荷重は中央に加えます。',
   `${path('M62 55H284')}${a('three-springs',173,12,173,50,'load')}${label(184,26,'荷重 P','load-label')}
    ${[73,173,273].map((x,i)=>path(`M${x} 55v12l-7 5 14 6 -14 6 14 6 -7 5v10M${x-19} 106h38`)+point(x,55)+center(x,131,i===2?'4k':'k')).join('')}
    ${center(87,150,'左')}${center(173,150,'中央')}${center(273,150,'右')}`,160),
  rodNodes:()=>figure('rod-nodes','GRIDは点、CRODやCBARは点同士をつなぐ要素です。',
   `${box(54,57,233,16)}${point(54,65)}${point(287,65)}
    ${center(54,44,'GRID 1','label')}${center(287,44,'GRID 2','label')}${center(172,96,'要素が2点をつなぐ')}`,109),
  beamSection:()=>figure('beam-section','梁の長さ方向Xから見た断面。高さはY方向、幅はZ方向です。',
   `${box(122,38,94,110)}${a('beam-section',170,97,170,17)}${a('beam-section',170,97,282,97)}
    ${label(178,19,'＋Y','axis-label')}${label(286,102,'＋Z','axis-label')}
    ${label(67,88,'高さ40 mm')}${center(168,166,'幅30 mm')}${point(170,97)}`,179),
 };
 window.TeachingDiagrams={flow,sketches};
})();
