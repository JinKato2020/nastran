/* Authored geometry and prescribed conditions of current teaching models. Not result contours. */
(() => {
 const wrap=(label,body)=>`<svg viewBox="0 0 420 440" role="img" aria-label="${label}"><defs><marker id="force" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#b34b35"/></marker><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#72869e"/></pattern></defs><g font-family="sans-serif" font-size="15" fill="#294b70">${body}</g></svg>`;
 const text=(x,y,t,extra='')=>`<text x="${x}" y="${y}" ${extra}>${t}</text>`;
 const arrow=(x1,y1,x2,y2)=>`<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="#b34b35" stroke-width="2.5" marker-end="url(#force)"/>`;
 const legend=`<rect x="20" y="395" width="12" height="12" fill="#b34b35"/>${text(39,407,'指定条件')}<rect x="150" y="395" width="12" height="12" fill="#426bb1"/>${text(169,407,'拘束・既知温度')}${text(20,432,'図は条件の模式図。変形・温度の計算結果ではありません。','font-size="12"')}`;
 function thermal(){return wrap('1.2m×3.6mの板。下面40度、右から入熱、左は対流、上と表裏は断熱と仮定。内部温度は未知。',`
   ${text(20,24,'板の定常熱伝導')}
   <rect x="152" y="80" width="92" height="276" fill="#f1f5fa" stroke="#7188a7"/>
   ${Array.from({length:4},(_,i)=>`<path d="M${152+(i+1)*18.4} 80V356" stroke="#c7d4e3"/>`).join('')}
   ${Array.from({length:14},(_,i)=>`<path d="M152 ${80+(i+1)*18.4}H244" stroke="#c7d4e3"/>`).join('')}
   <path d="M152 356H244" stroke="#426bb1" stroke-width="7"/>
   <path d="M152 80H244" stroke="#667d96" stroke-width="5" stroke-dasharray="5 4"/>
   ${text(159,62,'幅 1.2 m')}${text(259,278,'高さ 3.6 m')}
   ${arrow(310,155,247,155)}${arrow(310,215,247,215)}${arrow(310,240,247,240)}
   ${text(264,110,'右辺：入熱')}${text(264,132,'4000 W/m²')}
   ${arrow(149,155,109,155)}${arrow(149,215,109,215)}${arrow(149,240,109,240)}
   ${text(20,105,'左辺：対流')}${text(20,126,'h = 12 W/(m²K)')}${text(20,147,'周囲 25°C')}
   ${text(165,194,'T は未知')}${text(159,301,'75 要素')}${text(159,324,'厚さ 0.08 m')}
   ${text(155,380,'下辺：40°C を維持')}${text(20,48,'上辺・表裏：熱交換を与えない（断熱の仮定）','font-size="12"')}${legend}`);}
 function truss(){const p=[[35,265],[122.5,212.5],[151.67,265],[210,160],[268.33,265],[297.5,212.5],[385,265]],edges=[[0,1],[1,3],[3,5],[5,6],[1,2],[2,3],[3,4],[4,5],[0,2],[2,4],[4,6]];
 return wrap('7節点11部材の平面トラス。全長6000mm、高さ1800mm。左ピン、右ローラー。節点2・4・6へ各2000N下向き、1000N右向き。',`${text(20,24,'単純支持トラスの静解析')}${text(20,51,'上部3節点（2・4・6）それぞれに')}${text(20,75,'↓ 2000 N ＋ → 1000 N')}
 ${edges.map(([a,b])=>`<path d="M${p[a]}L${p[b]}" stroke="#6786b0" stroke-width="4"/>`).join('')}
 ${[1,3,5].map(i=>arrow(p[i][0],p[i][1]-50,p[i][0],p[i][1]-6)+arrow(p[i][0]+6,p[i][1]-18,p[i][0]+50,p[i][1]-18)).join('')}
 ${p.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5" fill="white" stroke="#426bb1"/>${text(x-4,y+(i===0||i===6?-10:23),String(i+1))}`).join('')}
 <path d="M35 271L22 304H48Z M385 271L372 304H398Z" fill="#e4ecf8" stroke="#426bb1"/>
 <circle cx="378" cy="310" r="5" fill="white" stroke="#426bb1"/><circle cx="392" cy="310" r="5" fill="white" stroke="#426bb1"/>
 ${text(20,337,'左：uₓ = uᵧ = 0')}${text(262,337,'右：uᵧ = 0')}${text(20,362,'全長 6000 mm / 高さ 1800 mm')}${text(20,383,'＋X：右　＋Y：上　面外自由度3456を拘束','font-size="13"')}${legend}`);}
 function plate(key){const labels={modes:['無加振：自由振動の固有値を抽出','結果：周波数とモード形（実振幅ではない）'], 'direct-frequency':['GRID11：3 N の調和集中力','10〜800 Hz　構造減衰 G = 0.05'],'modal-frequency':['圧力 0.0005 N/mm² ＋ 集中力 3 N','集中力は圧力より30°遅れ　減衰比 0.025'],transient:['SOL109 / 112：圧力＋集中力の有限パルス','波形・倍率・遅延は下の入力対応で比較']};let [l1,l2]=labels[key];
 return wrap('片持ち板。150mm×60mm、厚さ3mm、55節点40要素。左辺の自由度12345拘束。',`${text(20,24,'片持ち板（XY平面）')}${text(20,52,l1)}${text(20,76,l2,'font-size="13"')}
 <rect x="50" y="155" width="20" height="128" fill="url(#hatch)"/><rect x="70" y="155" width="320" height="128" fill="#edf3fa" stroke="#7591b8"/>
 ${Array.from({length:9},(_,i)=>`<path d="M${102+i*32} 155V283" stroke="#bdcde0"/>`).join('')}${[187,219,251].map(y=>`<path d="M70 ${y}H390" stroke="#bdcde0"/>`).join('')}
 ${text(195,137,'150 mm')}${text(2,145,'60 mm','font-size="12"')}${text(72,307,'左辺：GRID 1・12・23・34・45')}${text(72,330,'拘束成分 12345／他の3辺は自由')}
 ${[283,219,155].map((y,i)=>`<circle cx="390" cy="${y}" r="5" fill="#b34b35"/>${text(350,y-9,['11','33','55'][i])}`).join('')}
 ${key==='modes'?'':`<circle cx="390" cy="283" r="11" fill="none" stroke="#b34b35"/><circle cx="390" cy="283" r="2.5" fill="#b34b35"/>`}
 ${['modal-frequency','transient'].includes(key)?[130,210,290].map(x=>[190,245].map(y=>`<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#b34b35"/><circle cx="${x}" cy="${y}" r="2" fill="#b34b35"/>`).join('')).join(''):''}
 ${text(20,102,'⊙ ＋Z：紙面の手前（荷重・変位の成分3）','font-size="13"')}${text(20,363,'厚さ 3 mm　55 GRID / 40 CQUAD4')}${legend}`);}
 function buckling(){return wrap('8000mmの両端支持梁。左端並進とねじり、右端横方向を拘束。右端に軸圧縮500N。',`${text(20,24,'両端支持梁のEuler座屈')}${text(20,52,'基準荷重 500 N → 固有値で限界荷重を評価')}
 <path d="M40 215H360" stroke="#91aaca" stroke-width="7"/><path d="M40 215Q200 100 360 215" fill="none" stroke="#426bb1" stroke-width="3" stroke-dasharray="7 5"/>
 ${arrow(410,215,367,215)}${text(275,190,'−500 N')}
 <path d="M40 219L27 250H53Z M360 219L347 250H373Z" fill="#e4ecf8" stroke="#426bb1"/>
 ${text(155,280,'8000 mm / 10 CBAR')}${text(20,315,'左端：123＋4拘束　右端：23拘束')}${text(20,344,'断面 80 mm × 16 mm')}${text(20,370,'破線は座屈形の概念。振幅は未定。')}${legend}`);}
 function fracture(){return wrap('中央亀裂板の4分の1。左辺ux0、下面の亀裂先端右側のみuy0。亀裂面は自由。上面に応力80MPa。',`${text(20,24,'中央亀裂板の先端評価')}${text(20,50,'対称性を用いた1/4モデル・平面ひずみ')}
 <rect x="105" y="120" width="220" height="220" fill="#edf3fa" stroke="#718ba9"/>
 ${[130,180,230,280,315].map(x=>arrow(x,117,x,80)).join('')}${text(158,70,'上辺：σ = 80 MPa')}
 <path d="M105 120V340 M215 340H325" stroke="#426bb1" stroke-width="5"/>
 <path d="M105 340H215" stroke="#b34b35" stroke-width="5"/><circle cx="215" cy="340" r="18" stroke="#b34b35" fill="none"/>
 ${text(20,180,'uₓ = 0')}${text(238,366,'uᵧ = 0')}${text(84,366,'亀裂面：自由')}${text(160,319,'先端')}${text(332,232,'24 mm','font-size="12"')}${text(160,160,'b = 24 mm')}${text(120,387,'a = 12 mm　先端に四分点要素','font-size="13"')}${legend}`);}
 window.analysisDiagram=key=>key==='static'?truss():key==='heat'?thermal():key==='buckling'?buckling():key==='fracture'?fracture():plate(key);
})();
