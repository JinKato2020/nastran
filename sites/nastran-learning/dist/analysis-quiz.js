(() => {
 'use strict';
 /* 解析タブの「問題」：DAT の空欄に何を書くかを4択で問い、答えた後に手計算での確かめ方を示す。 */
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=(v,d=3)=>{if(!isFinite(v))return '—';const p=Number(v.toPrecision(d));return Math.abs(p)>=1e5||(Math.abs(p)<1e-3&&p!==0)?p.toExponential(2):p.toLocaleString('en-US',{maximumFractionDigits:6});};
 const field=(s,w=8)=>{const t=String(s);return t.length>=w?t:t+' '.repeat(w-t.length);};
 const line=cells=>cells.map(c=>c==='？'?'<mark>？</mark>'+' '.repeat(7):esc(field(c))).join('').replace(/\s+$/,'');

 // 静解析の梁モデル（解析タブの梁モデルの DAT）：L = 360 mm、幅 36 mm、厚さ 6 mm、E = 70,000 MPa、先端に −Z 方向 18 N
 const P=18,L=360,E=70000,I=36*6**3/12,TIP=-P*L**3/(3*E*I),M=P*L,SIG=M*3/I;
 const DATA={
  static:{
   intro:`静解析の梁モデル（長さ ${L} mm、幅 36 mm、厚さ 6 mm、E = ${E.toLocaleString('en-US')} MPa、先端に −Z 方向 ${P} N）の DAT から3問です。選ぶと、各選択肢で何が起きるかと、手計算での確かめ方が開きます。`,
   questions:[
    {title:'根元を固定する（SPC1）',line:['SPC1','10','？','1'],
     ask:'根元の GRID 1 を、片持ち梁の固定端にします。SPC1 の C（止める成分）に何と書きますか？',
     options:[
      ['135','X・Z の並進と Y まわりの回転、つまり紙面の中の3成分だけを止めた形です。Y 方向の並進や X・Z まわりの回転が止まらないので、梁全体が横へ動いたり回ったりでき、剛性行列が特異になります。平面の図で考えると選びやすい誤りです。'],
      ['123456','並進 1〜3 と回転 4〜6 の6成分すべてを止めます。梁の節点は回転の自由度を持つので、固定端なら回転も止めます。'],
      ['123','並進だけを止めると、根元は回転できる球のピンになります。梁全体が根元のまわりに回れるので、片持ち梁は形を保てません（特異）。ソリッドの節点なら 123 で足りますが、梁の節点では足りません。'],
      ['1 2 3 4 5 6','成分の数字は空白を入れずに続けて書きます。8文字の欄に空白入りで書くと、書式の誤りになります。']],
     answer:1,
     verify:{title:'反力で確かめる',
      steps:[`上下の力のつり合い：根元の反力 R = 外力 = ${P} N（+Z 向き）`,
       `根元まわりのモーメントのつり合い：反力モーメント = P × L = ${P} × ${L} = ${M.toLocaleString('en-US')} N·mm`,
       'F06 の FORCES OF SINGLE-POINT CONSTRAINT（ケース制御の SPCFORCES = ALL）で GRID 1 を見ます。T3 が 18.0、R2 が −6,480（荷重のモーメントを打ち消す向き）なら一致です。'],
      note:'片持ち梁は静定なので、反力は E や I を間違えても変わりません。反力が合っていても、剛性の入力が正しいとは限りません。問2・問3 のたわみと応力でも確かめます。',
      check:{label:'GRID 1 の T3（N）',expect:P,diag:[[1,'一致しています。外力と反力がつり合っています。'],[-1,'符号が逆です。FORCE の F と N3 の符号を見直します（問2）。'],[18,'18倍です。F と N の両方に 18 を書いていないか見直します（問2）。'],[0,'反力が 0 です。ケース制御の LOAD = 40 と FORCE の SID（40）がそろっているか確かめます。']]}}},
    {title:'先端に荷重をかける（FORCE）',line:['FORCE','40','13','0','？','？','？','？'],
     ask:`先端の GRID 13 に、−Z 方向（下向き）の ${P} N をかけます。FORCE の F と N1・N2・N3 に何と書きますか？`,
     options:[
      ['F = −18.　N = 0., 0., −1.','力は F × N です。F と N3 の両方に − を付けると、−×− で +Z 向き（上向き）の 18 N になります。たわみの符号が逆に出ます。'],
      ['F = 18　N = 0, 0, −1（小数点なし）','F と N1〜N3 は実数の欄です。実数の欄に小数点のない数を書くと、既定では書式の誤りになります。0 も 0. と書きます。'],
      ['F = 18.　N = 0., 0., −1.','大きさ 18 N を F に、向きを N に書きます。N の長さを 1 にしておくと、F がそのまま力の大きさになります。'],
      ['F = 18.　N = 0., 0., −18.','力は F × N なので、大きさ 18 を2回掛けて 324 N になります。N は向きだけを表すと覚えます。']],
     answer:2,
     verify:{title:'先端のたわみで確かめる',
      steps:[`断面二次モーメント I = b·h³/12 = 36 × 6³ / 12 = ${num(I,4)} mm⁴`,
       `先端たわみ δ = P·L³ / (3·E·I) = ${P} × ${L}³ / (3 × ${E.toLocaleString('en-US')} × ${num(I,4)}) = ${num(-TIP,4)} mm（下向き）`,
       'F06 の DISPLACEMENT VECTOR で GRID 13 の T3 を見ます。−6.17 前後なら一致です。荷重の合計は OLOAD RESULTANT の T3（−18.0）でも確かめられます。'],
      note:'この DAT の PBEAM は K1・K2 が空欄なので、せん断変形（係数 1.0）も入ります。その分は PL/(K·A·G) ≈ 0.0011 mm で、ここでは無視できます（梁要素の記事 §6）。',
      check:{label:'GRID 13 の T3（mm）',expect:TIP,diag:[[1,'一致しています。'],[-1,'符号が逆です。荷重の向き（F と N3 の符号）を見直します。'],[18,'約18倍です。F と N の両方に 18 を書いていないか見直します。'],[1/36,'約1/36 です。I1 と I2 が入れ替わっていないか見直します（問3）。'],[0.25,'約1/4 です。I に b·h³/3（端まわりの値）を入れていないか見直します（問3）。'],[1e4,'約10,000倍です。I を cm⁴ のまま入れていないか見直します（問3）。'],[1000,'約1,000倍です。E を GPa の数（70.）で入れていないか見直します。N・mm の単位系では MPa（70000.）です。'],[0,'0 です。荷重がかかっていません。LOAD と FORCE の SID を確かめます。']]}}},
    {title:'断面の値を入れる（PBEAM）',line:['PBEAM','20','70','216.','？','？','0.','2318.'],
     ask:'CBEAM の向きベクトル v は (0., 0., 1.)、つまり荷重と同じ Z 方向です。幅 36 mm（Y 方向）、厚さ 6 mm（Z 方向）の断面で、PBEAM の I1・I2 に何と書きますか？',
     options:[
      ['I1 = 23328.　I2 = 648.','入れ替えです。v = Z なので要素の y は Z（厚さの向き）で、面1（x–y）の曲げが荷重の向きです。I1 には厚さ方向に曲げるときの 36 × 6³/12 = 648 を入れます。入れ替えると荷重の向きに36倍硬くなり、先端たわみは 0.171 mm になります。'],
      ['I1 = 2592.　I2 = 93312.','b·h³/3 は断面の端（下面）まわりの値です。梁要素には図心まわりの b·h³/12 を入れます。4倍硬くなり、先端たわみは 1.54 mm になります。'],
      ['I1 = 0.0648　I2 = 2.3328','cm⁴ の値をそのまま入れています。モデルは mm なので、1 cm⁴ = 10,000 mm⁴ で換算します。10,000倍柔らかくなり、先端たわみは約 61,700 mm になります。'],
      ['I1 = 648.　I2 = 23328.','I1 = 36 × 6³/12 = 648 mm⁴（荷重の向きの曲げ）、I2 = 6 × 36³/12 = 23,328 mm⁴（幅方向の曲げ）です。']],
     answer:3,
     verify:{title:'根元の応力で確かめる',
      steps:[`根元の曲げモーメント M = P × L = ${M.toLocaleString('en-US')} N·mm`,
       `表面までの距離 c = 6/2 = 3 mm、曲げ応力 σ = M·c / I = ${M.toLocaleString('en-US')} × 3 / ${num(I,4)} = ${num(SIG,3)} MPa`,
       'F06 の STRESSES IN BEAM ELEMENTS（CBEAM）で、要素 101 の GRID 1 側の SXC〜SXF を見ます。大きさが 30.0 前後で、表と裏で符号が逆なら一致です。'],
      note:'この DAT は PBEAM の継続行で応力点 C〜F を (±3, ±18) に入れています。ここが空欄だと、応力の出力は 0 になります（梁要素の記事 §5）。応力は I で変わりますが、E では変わりません。',
      check:{label:'要素 101・GRID 1 の SXC の大きさ（MPa）',expect:SIG,abs:true,diag:[[1,'一致しています。'],[1/36,'約1/36 です。I1 と I2 が入れ替わっていないか見直します。'],[0.25,'約1/4 です。I に b·h³/3 を入れていないか見直します。'],[1e4,'約10,000倍です。I を cm⁴ のまま入れていないか見直します。'],[18,'約18倍です。荷重を2回掛けていないか見直します（問2）。'],[0,'0 です。PBEAM の応力点 C〜F が空欄になっていないか確かめます。']]}}}
   ]}
 };

 if(window.AnalysisModeQuiz)DATA.modes=window.AnalysisModeQuiz.data;
 DATA.static.links=[['bulk.html#SPC1','SPC1'],['bulk.html#FORCE','FORCE'],['bulk.html#PBEAM','PBEAM']];
 if(DATA.modes)DATA.modes.links=[['bulk.html#MAT1','MAT1'],['bulk.html#CASE_METHOD','METHOD'],['bulk.html#EIGRL','EIGRL'],['bulk.html#CONM2','CONM2'],['theory.html#modes','実固有値の理論']];
 function render(key){
  const d=DATA[key];if(!d)return '';
  const letters='ABCD';
  return `<div class="aq" data-quiz="${esc(key)}"><p class="aq-intro">${esc(d.intro)}</p><div class="analysis-links">${(d.links||[]).map(([href,label])=>`<a href="${esc(href)}">${esc(label)} →</a>`).join('')}</div>${d.experiment?d.experiment():''}<p class="aq-score" aria-live="polite">${d.questions.length}問中 0問に回答（正解数は初回回答で集計）</p>`+
   d.questions.map((q,n)=>`<article class="aq-q" data-n="${n}"><h4>問${n+1}　${esc(q.title)}</h4><pre class="aq-line"><code>${q.code?esc(q.code):line(q.line)}</code></pre><p class="aq-ask">${esc(q.ask)}</p>`+
    `<div class="aq-options" role="group" aria-label="問${n+1}の選択肢">${q.options.map(([label],i)=>`<button type="button" class="aq-opt" data-i="${i}"><span class="aq-letter">${letters[i]}</span><span>${esc(label)}</span></button>`).join('')}</div>`+
    `<div class="aq-feedback" hidden><p class="aq-result" aria-live="polite"></p><ul class="aq-why">${q.options.map(([label,why],i)=>`<li data-i="${i}"${i===q.answer?' class="right"':''}><b>${letters[i]}　${esc(label)}</b>${i===q.answer?'（正解）':''}<br>${esc(why)}</li>`).join('')}</ul>`+
    `<section class="aq-verify"><h5>手計算で確かめる：${esc(q.verify.title)}</h5><ol>${q.verify.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="aq-note">${esc(q.verify.note)}</p>`+
    `<div class="aq-check"><label>F06 の ${esc(q.verify.check.label)} <input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" placeholder="例 ${esc(num(q.verify.check.expect,4))}"></label><button type="button" class="aq-run">照合</button></div><p class="aq-diag" aria-live="polite"></p></section></div></article>`).join('')+'</div>';
 }
 function diagnose(raw,c){
  const v0=Number(String(raw).normalize('NFKC').replace(/[−–—]/g,'-').replace(/,/g,'').trim());
  if(String(raw).trim()===''||!isFinite(v0))return ['warn','数値を入れてください（例 -6.171E+00）。'];
  if(c.integer&&!Number.isInteger(v0))return ['warn','モード数は整数で入力してください。'];
  const v=c.abs?Math.abs(v0):v0,ex=c.abs?Math.abs(c.expect):c.expect,r=v/ex;
  for(const [k,msg] of c.diag){if(k===0?Math.abs(v)<=1e-6*Math.abs(ex):Math.abs(r/k-1)<0.03)return [k===1?'ok':'warn',`手計算 ${num(ex,4)} に対して ${num(r,3)} 倍。${msg}`];}
  return ['warn',`手計算 ${num(ex,4)} に対して ${num(r,3)} 倍です。単位系、断面の値、荷重の向きと大きさを順に見直します。`];
 }
 function bind(root){
  for(const quiz of root.querySelectorAll('.aq')){
   const d=DATA[quiz.dataset.quiz],score=quiz.querySelector('.aq-score'),done=new Map();
   if(d.bind)d.bind(quiz);
   const update=()=>{score.textContent=`${d.questions.length}問中 ${done.size}問に回答、初回の正解 ${[...done.values()].filter(Boolean).length}問`;};
   quiz.querySelectorAll('.aq-q').forEach(card=>{
    const q=d.questions[+card.dataset.n],fb=card.querySelector('.aq-feedback');
    card.querySelectorAll('.aq-opt').forEach(btn=>btn.addEventListener('click',()=>{
     const i=+btn.dataset.i,ok=i===q.answer;
     card.querySelectorAll('.aq-opt').forEach(b=>{b.classList.toggle('chosen',b===btn);b.classList.toggle('right',+b.dataset.i===q.answer);b.classList.toggle('wrong',b===btn&&!ok);b.setAttribute('aria-pressed',String(b===btn));});
     card.querySelectorAll('.aq-why li').forEach(li=>li.classList.toggle('chosen',+li.dataset.i===i));
     fb.hidden=false;fb.querySelector('.aq-result').textContent=ok?'正解です。':`不正解です。正解は ${'ABCD'[q.answer]} です。選んだ ${'ABCD'[i]} で何が起きるかを確かめてください。`;
     fb.querySelector('.aq-result').className='aq-result '+(ok?'ok':'ng');
     if(!done.has(card.dataset.n))done.set(card.dataset.n,ok);update();
    }));
    const input=card.querySelector('.aq-check input'),out=card.querySelector('.aq-diag');
    const run=()=>{const [cls,msg]=diagnose(input.value,q.verify.check);out.textContent=msg;out.className='aq-diag '+cls;};
    card.querySelector('.aq-run').addEventListener('click',run);
    input.addEventListener('keydown',e=>{if(e.key==='Enter')run();});
   });
  }
 }
 window.AnalysisQuiz={data:DATA,render,bind,diagnose};
})();
