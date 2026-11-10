(() => {
 'use strict';
 const $=id=>document.getElementById(id),names=['X方向の移動','Y方向の移動','Z方向の移動','X軸まわりの回転','Y軸まわりの回転','Z軸まわりの回転'];
 $('dof-checkboxes').innerHTML=names.map((name,i)=>`<label class="dof-check"><input type="checkbox" value="${i+1}" ${i<3?'checked':''}><b>${i+1}</b><span>${name}</span></label>`).join('');
 const pack=fields=>Array.from({length:10},(_,i)=>{const value=String(fields[i]??'');return i===0||i===9?value.padEnd(8):value.padStart(8);}).join('');
 function update(){
  const components=[...document.querySelectorAll('#dof-checkboxes input:checked')].map(e=>e.value),joined=components.join(''),method=$('constraint-method').value;
  $('component-value').textContent=joined?`${method==='PS'?'PS':'C'} = ${joined}`:'この操作では、拘束を指定しない';
  $('component-reading').innerHTML='<p><strong>この指定で止める動き</strong></p><ul>'+names.map((name,i)=>`<li class="${components.includes(String(i+1))?'is-stopped':'is-open'}"><b>${i+1}</b> ${name}<span>${components.includes(String(i+1))?'0にする':'ここでは指定しない'}</span></li>`).join('')+'</ul><p class="small-note">番号は「動きの種類」です。止める点は別の欄に書きます。</p>';
  const arrows=[['M180 120H285','1 · Xへ移動',300,125],['M180 120L245 70','2 · Yへ移動',260,65],['M180 120V30','3 · Zへ移動',180,18]];
  $('dof-illustration').innerHTML='<svg viewBox="0 0 460 215" role="img" aria-label="節点1の3つの移動方向。選んだ成分は青、未選択は灰色。回転の指定は下の一覧で確認。"><defs><marker id="dof-head" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto-start-reverse"><path d="M0 0L7 3.5L0 7Z" fill="context-stroke"/></marker></defs><path d="M160 98L200 98L218 116L218 154L178 154L160 136Z" fill="#eef2fa" stroke="#c4d1e7"/>'+arrows.map(([d,label,x,y],i)=>`<path d="${d}" stroke="${components.includes(String(i+1))?'#3259d8':'#9baac0'}" stroke-width="3" fill="none" marker-end="url(#dof-head)"/><text x="${x}" y="${y}" fill="#476389">${label}</text>`).join('')+'<circle cx="180" cy="120" r="6" fill="#fff" stroke="#3259d8" stroke-width="2"/><text x="180" y="194" text-anchor="middle">GRID 1 · CD = 0</text></svg>';
  const rows=[pack(['GRID','1','0','0.','0.','0.','0',method==='PS'?joined:''])];
  if(method==='SPC1'&&joined)rows.push(pack(['SPC1','10',joined,'1']));
  $('constraint-case').innerHTML=method==='SPC1'&&joined?'<p>この拘束を使う解析ケースで、Case Controlに <code>SPC = 10</code> と書きます。</p>':method==='PS'&&joined?'<p>PSはCase ControlのSPC選択とは独立して有効です。</p>':'<p>チェックがないため、SPC1行やPSの成分は追加しません。</p>';
  NastranFields.render($('constraint-fields'),rows.join('\n'));
 }
 document.querySelectorAll('#dof-checkboxes input').forEach(el=>el.addEventListener('change',update));
 document.querySelectorAll('[data-components]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('#dof-checkboxes input').forEach(el=>{el.checked=button.dataset.components.includes(el.value);});update();}));
 $('constraint-method').addEventListener('change',update);update();
})();
