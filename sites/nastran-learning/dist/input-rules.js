(()=>{'use strict';const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function smallField(values) {
    if(values.length>10) throw new Error('Too many fields');
    return Array.from({length:10}, (_,i) => {
      const value = String(values[i] ?? '');
      if(value.length > 8 || /[^\x20-\x7e]|,|\t/.test(value)) throw new Error('Invalid small field: '+value);
      return i===0 || i===9 ? value.padEnd(8) : value.padStart(8);
    }).join('');
  }
  const cards = {
    GRID:{values:['GRID','2','','1000.','0.','0.'],labels:['カード名','ID','CP','X1','X2','X3','CD','PS','SEID','継続'],explain:['節点の定義。カード名GRIDは1列目から書きます。','節点番号。整数2です。2.のように小数点は付けません。','座標を記述する座標系。空欄は既定の0（基本座標系）。空欄の8文字を詰めないことが大切です。','CPで定めた座標系の第1座標。今回はX = 1000 mm。実数なので1000.と書きます。','第2座標。今回はY = 0 mm。','第3座標。今回はZ = 0 mm。','変位・拘束の成分などに用いる座標系。今回は空欄で既定の0。CPとは別の指定です。','節点に恒久的に指定する拘束。今回は空欄で、拘束はSPC1で定義します。','スーパーエレメントに関連する指定。今回の基本例では使いません。','このGRIDには継続行がないため空欄です。']},
    MAT1:{values:['MAT1','300','210000.','','0.3'],labels:['カード名','MID','E','G','NU','RHO','A','TREF','GE','継続'],explain:['等方性の線形弾性材料を定義します。','材料番号300。PRODのMID = 300から参照されます。','ヤング率210000 MPa。210000.は7文字で、8文字欄に収まります。','せん断弾性率。今回はEとNUを与えるため空欄から計算されます。G = E / {2(1 + NU)}。空欄を0で埋めないでください。','ポアソン比0.3。単位のない実数です。','質量密度。今回は自重や慣性を扱わないので省略。GRAVを使う解析などでは質量の定義が必要です。','線膨張係数。今回は温度荷重を使わないため省略します。PRODの断面積Aとは意味が違います。','熱ひずみを評価する基準温度。今回の例では使いません。','材料の減衰係数。今回の静的な引張り例では使いません。','この基本例では続きの項目を使わず空欄です。']},
    FORCE:{values:['FORCE','20','2','0','1000.','1.','0.','0.'],labels:['カード名','SID','G','CID','F','N1','N2','N3','未使用','継続'],explain:['集中荷重を定義するBulkカードです。Case ControlのFORCE出力要求とは別です。','荷重セット番号20。Case ControlのLOAD = 20で選択します。','荷重を加える節点番号2です。','方向を記述する座標系0（基本座標系）。','荷重ベクトルの倍率1000.。成分はF × (N1, N2, N3)です。','方向ベクトルの第1成分1.。今回はX成分1000 Nになります。','方向ベクトルの第2成分0.。今回はY成分0 Nです。','方向ベクトルの第3成分0.。今回はZ成分0 Nです。','このカードでは使わない欄です。値を追加しません。','継続行がないため空欄です。']}
  };
  let ruleCard = 'GRID';
  function explainField(index) {
    const c = cards[ruleCard];
    $$('.rule-field').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    $('#rule-explanation').innerHTML = `<strong>第${index+1}欄 · ${index*8+1}–${index*8+8}列 · ${c.labels[index]}</strong>${c.explain[index]}`;
  }
  function renderRuleCard() {
    const c=cards[ruleCard];const line=smallField(c.values);
    $('#rule-board').innerHTML = c.labels.map((label,i)=>`<button class="rule-field" data-field="${i}" aria-pressed="false"><small>${i*8+1}–${i*8+8}列</small><span>${label}</span>${line.slice(i*8,i*8+8).trim()?`<b>${escape(line.slice(i*8,i*8+8))}</b>`:'<em>空欄</em>'}</button>`).join('');
    explainField(ruleCard==='MAT1'?3:ruleCard==='FORCE'?1:2);
    const scroller=$('.rule-board-scroll');
    scroller.scrollLeft=0;
    requestAnimationFrame(()=>{
      const active=$('.rule-field[aria-pressed="true"]');
      const extra=active.getBoundingClientRect().right-scroller.getBoundingClientRect().right;
      if(extra>0)scroller.scrollLeft+=extra+12;
    });
  }
  $('#rule-card').addEventListener('change',e=>{ruleCard=e.target.value;renderRuleCard();});
  $('#rule-board').addEventListener('click',e=>{const b=e.target.closest('[data-field]');if(b)explainField(Number(b.dataset.field));});
  renderRuleCard();
  $('#continuation-code').textContent = [smallField(['CORD2R','10','0','0.','0.','0.','0.','0.','1.','+C10']),smallField(['+C10','1.','0.','0.'])].join('\n');

  NastranFields.render($('#continuation-fields'),$('#continuation-code').textContent);

})();
