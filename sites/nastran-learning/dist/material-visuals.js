(() => {
 'use strict';
 const {arrow,svg}=window.LessonDiagrams;
 const shape=(id,title,caption,body,height=158)=>`<figure class="material-figure">
  ${svg(id,title,body,height)}<figcaption>${caption}</figcaption>
 </figure>`;

 window.MaterialVisuals={
  materialRoles:shape('roles','梁要素から断面、材料を順に参照する',
   '例：CBARのPIDでPBARを、PBARのMIDでMAT1を参照します。曲げ剛性EIは、材料のEと断面のIを掛けた値です。',
   `<rect class="surface" x="10" y="30" width="90" height="79" rx="6"/><rect class="surface" x="127" y="30" width="90" height="79" rx="6"/><rect class="surface" x="244" y="30" width="90" height="79" rx="6"/>
   <text class="label" x="55" y="51" text-anchor="middle">CBAR</text><text x="55" y="94" text-anchor="middle">点をつなぐ</text>
   <path class="outline" d="M33 71H77"/><circle class="node" cx="33" cy="71" r="4"/><circle class="node" cx="77" cy="71" r="4"/>
   <text class="label" x="172" y="51" text-anchor="middle">PBAR</text><rect class="core" x="161" y="60" width="22" height="19"/><text x="172" y="94" text-anchor="middle">断面の I</text>
   <text class="label" x="289" y="51" text-anchor="middle">MAT1</text><text class="label" x="289" y="76" text-anchor="middle">E</text><text x="289" y="94" text-anchor="middle">材料の硬さ</text>
   ${arrow('roles',102,70,124,70)}${arrow('roles',219,70,241,70)}
   <text class="small" x="113" y="60" text-anchor="middle">PID</text><text class="small" x="230" y="60" text-anchor="middle">MID</text>`,126),

  isotropic:shape('iso','等方材料を直交する2方向に同じ応力で引くと、引張方向のひずみが等しい',
   '同じ材料を同じ大きさの応力で引張ります。MAT1の等方弾性では、材料を90°回しても引張方向のひずみは同じです。',
   `<rect class="ghost" x="51" y="48" width="58" height="58"/><rect class="surface" x="44" y="52" width="72" height="50"/>
   ${arrow('iso',43,77,21,77,'load')}${arrow('iso',117,77,142,77,'load')}
   <rect class="ghost" x="222" y="48" width="58" height="58"/><rect class="surface" x="226" y="41" width="50" height="72"/>
   ${arrow('iso',251,40,251,19,'load')}${arrow('iso',251,114,251,135,'load')}
   <text x="80" y="147" text-anchor="middle">横向きに引く</text><text x="251" y="151" text-anchor="middle">縦向きに引く</text>
   <text class="small" x="172" y="72" text-anchor="middle">同じ</text><text class="small" x="172" y="90" text-anchor="middle">応力</text>`,166),

  planeMaterials:shape('plane','MAT8は繊維に沿う材料1軸と直交する2軸、MAT2は面内成分の連成も指定できる',
   'MAT8では、繊維方向のE₁と直交方向のE₂を区別します。MAT2では、面内の伸びとせん断を結ぶG13・G23も指定できます。右図は連成がある場合の模式図です。',
   `<text class="label" x="15" y="23">MAT8　繊維の主軸</text><text class="label" x="186" y="23">MAT2　面内の連成</text>
   <rect class="surface" x="28" y="54" width="100" height="72"/>
   <path class="fibers" d="M29 62H127M29 74H127M29 86H127M29 98H127M29 110H127M29 122H127"/>
   ${arrow('plane',38,115,108,115)}${arrow('plane',38,115,38,48)}
   <text class="axis-label" x="20" y="45">2</text><text class="axis-label" x="113" y="115">1</text>
   <text x="78" y="145" text-anchor="middle">1は繊維に沿う</text>
   <rect class="ghost" x="207" y="56" width="93" height="70"/>
   <path class="surface" d="M231 54H318L293 126H205Z"/><path class="outline" d="M216 94H304M253 55L228 125M282 55L257 125"/>
   ${arrow('plane',234,46,207,46,'load')}${arrow('plane',288,46,323,46,'load')}
   <text x="260" y="145" text-anchor="middle">引張でせん断も生じる例</text>`,158),

  angledTube:shape('tube','一端固定の円筒を軸方向に引くと、斜め繊維で先端に周方向変位が生じる',
   '左端を固定し、右端を軸方向に引く例です。斜めの繊維を持つモデルでは、先端の軸方向変位に加えて周方向変位を確認します。',
   `<path class="ghost" d="M50 29V132M38 32L50 43M38 52L50 63M38 72L50 83M38 92L50 103M38 112L50 123"/>
   <path class="surface" d="M66 51H230A19 36 0 0 1 230 123H66A19 36 0 0 1 66 51Z"/>
   <ellipse class="outline" cx="230" cy="87" rx="19" ry="36"/>
   <path class="fibers" d="M69 121L136 52M108 122L175 52M149 122L216 52M190 122L230 80"/>
   <path class="ghost" d="M72 87H248"/>
   ${arrow('tube',249,87,319,87,'load')}
   <path class="axis" d="M219 62C242 61 246 72 241 83" marker-end="url(#material-tube-axis)"/>
   <text x="36" y="18">固定</text><text x="262" y="73">軸方向に引く</text><text x="192" y="144">先端に周方向変位</text>`,159),

  spatialMaterials:shape('space','MAT3は回転軸に沿うz、半径r、周方向θを使い、MAT9は三次元の材料軸を使う',
   'MAT3の図は軸対称のr–z断面を回転させたときの材料方向です。θ方向は円に沿う接線方向です。MAT9では三次元の材料座標を指定し、PSOLIDのCORDMで参照する座標を確認します。',
   `<text class="label" x="12" y="22">MAT3　軸対称</text><text class="label" x="185" y="22">MAT9　三次元</text>
   <ellipse class="surface" cx="68" cy="98" rx="51" ry="17"/>
   <path class="ghost" d="M68 34V132M68 98H108"/>
   <path class="core" d="M99 42H118V98H99Z"/><circle class="node" cx="108" cy="98" r="3"/>
   ${arrow('space',108,96,108,61)}${arrow('space',109,98,151,98)}${arrow('space',108,99,88,122)}
   <text class="axis-label" x="114" y="58">z</text><text class="axis-label" x="154" y="103">r</text><text class="axis-label" x="74" y="134">θ</text>
   <text class="small" x="15" y="40">回転軸</text><text class="small" x="90" y="37">r–z断面</text>
   <path class="surface" d="M211 66H286V125H211Z M211 66L235 46H310L286 66Z M286 66L310 46V105L286 125Z"/>
   ${arrow('space',247,105,317,105)}${arrow('space',247,105,281,74)}${arrow('space',247,105,247,58)}
   <circle class="node" cx="247" cy="105" r="3"/>
   <text class="axis-label" x="319" y="110">x</text><text class="axis-label" x="284" y="72">y</text><text class="axis-label" x="252" y="57">z</text>
   <text x="252" y="146" text-anchor="middle">材料の3軸</text>`,158),

  cubeTest:shape('test','立方体の垂直応力とせん断応力の方向を変えて6ケースを検算する',
   '垂直応力は面に垂直、せん断応力は面に沿って作用します。各ケースで応力1成分を与え、応答のひずみ6成分を柔らかさの行列の1列に並べます。',
   `<text class="label" x="17" y="22">垂直応力の例</text><text class="label" x="186" y="22">せん断応力の例</text>
   <path class="surface" d="M43 57H111V117H43Z M43 57L63 42H131L111 57Z M111 57L131 42V102L111 117Z"/>
   ${arrow('test',110,87,154,87,'load')}${arrow('test',43,85,13,85,'load')}
   <path class="surface" d="M209 57H277V117H209Z M209 57L229 42H297L277 57Z M277 57L297 42V102L277 117Z"/>
   ${arrow('test',226,49,279,49,'load')}${arrow('test',264,117,215,117,'load')}
   <text x="84" y="142" text-anchor="middle">σx・σy・σz</text><text x="252" y="142" text-anchor="middle">τxy・τyz・τzx</text>`,156),

  stacking:shape('layers','均質なPSHELLと下から積むPCOMPの断面、シェル正法線と基準面',
   '右の積層は、正法線が上向きです。PCOMPの層番号は最下層から数え、Z0は基準面から最下層面までの符号付き距離です。',
   `<text class="label" x="14" y="22">PSHELL　均質板</text><text class="label" x="180" y="22">PCOMP　積層板</text>
   <rect class="surface" x="16" y="65" width="121" height="53"/><text x="76" y="83" text-anchor="middle">同じ材料</text>
   <rect class="surface" x="179" y="65" width="118" height="18"/><rect class="core" x="179" y="83" width="118" height="17"/><rect class="surface" x="179" y="100" width="118" height="18"/>
   <text x="190" y="79">層3</text><text x="190" y="96">層2</text><text x="190" y="114">層1</text>
   <path class="ghost" d="M9 92H145M218 92H312"/>
   ${arrow('layers',324,92,324,48)}${arrow('layers',324,93,324,117)}
   <text class="axis-label" x="286" y="44">＋法線</text><text class="small" x="272" y="139">Z0は下向き</text>
   <text x="227" y="136" text-anchor="middle">基準面</text><path class="outline" d="M229 125V95"/>`,151),

  sandwich:shape('sandwich','サンドイッチ板の曲げで面材は引張・圧縮を受け、コアは主に横せん断を伝える',
   '曲げの向きを1つに固定した例です。この向きでは上の面材が圧縮、下の面材が引張を受けます。コアは面材を離して保ち、横せん断を伝えます。',
   `<rect class="surface" x="46" y="42" width="178" height="15"/><rect class="core" x="46" y="57" width="178" height="63"/><rect class="surface" x="46" y="120" width="178" height="15"/>
   <path class="fibers" d="M47 110L99 58M70 119L132 58M102 119L163 58M134 119L196 58M166 119L224 61M198 119L224 93"/>
   ${arrow('sandwich',13,49,44,49,'load')}${arrow('sandwich',256,49,226,49,'load')}
   ${arrow('sandwich',44,128,13,128,'load')}${arrow('sandwich',226,128,256,128,'load')}
   <rect class="surface" x="119" y="73" width="39" height="30"/>
   ${arrow('sandwich',123,73,156,73)}${arrow('sandwich',158,101,158,76)}${arrow('sandwich',154,103,122,103)}${arrow('sandwich',119,76,119,100)}
   <text x="263" y="53">圧縮側の面材</text><text x="234" y="94">コア · 横せん断</text><text x="263" y="132">引張側の面材</text>`,153),
 };
})();
