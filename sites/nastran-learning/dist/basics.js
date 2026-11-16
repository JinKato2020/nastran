(() => {
 'use strict';
 const $=id=>document.getElementById(id),names=['X方向の移動','Y方向の移動','Z方向の移動','X軸まわりの回転','Y軸まわりの回転','Z軸まわりの回転'];
 $('dof-checkboxes').innerHTML=names.map((name,i)=>`<label class="dof-check"><input type="checkbox" value="${i+1}" ${i<3?'checked':''}><b>${i+1}</b><span>${name}</span></label>`).join('');
 const pack=fields=>Array.from({length:10},(_,i)=>{const value=String(fields[i]??'');return i===0||i===9?value.padEnd(8):value.padStart(8);}).join('');
 function update(){
  const components=[...document.querySelectorAll('#dof-checkboxes input:checked')].map(e=>e.value),joined=components.join(''),method=$('constraint-method').value;
  $('component-value').textContent=joined?`${method==='PS'?'PS':'C'} = ${joined}`:'この操作では、拘束を指定しない';
  $('component-reading').innerHTML='<p><strong>この指定で止める動き</strong></p><ul>'+names.map((name,i)=>`<li class="${components.includes(String(i+1))?'is-stopped':'is-open'}"><b>${i+1}</b> ${name}<span>${components.includes(String(i+1))?'0にする':'ここでは指定しない'}</span></li>`).join('')+'</ul><p class="small-note">番号は「動きの種類」です。止める点は別の欄に書きます。</p>';
  const axes=[[194,100,202,104,'1 · X'],[175,52,184,47,'2 · Y'],[106,25,115,27,'3 · Z']];
  $('dof-illustration').innerHTML=window.LessonDiagrams.svg('constraint-lab',
   '節点の3つの並進成分。選んだ拘束は青い実線、未指定は灰色の破線です。回転成分は下の一覧に表示します。',
   axes.map(([x,y,tx,ty,label],i)=>`<g class="${components.includes(String(i+1))?'':'unselected-axis'}">${window.LessonDiagrams.arrow('constraint-lab',106,100,x,y)}<text x="${tx}" y="${ty}">${label}</text></g>`).join('')+
   '<circle class="node" cx="106" cy="100" r="5"/><text x="96" y="130" text-anchor="middle">GRID 1 · CD = 0</text><text x="209" y="135">実線：拘束する方向</text>',150);
  const rows=[pack(['GRID','1','0','0.','0.','0.','0',method==='PS'?joined:''])];
  if(method==='SPC1'&&joined)rows.push(pack(['SPC1','10',joined,'1']));
  $('constraint-case').innerHTML=method==='SPC1'&&joined?'<p>この拘束を使う解析ケースで、Case Controlに <code>SPC = 10</code> と書きます。</p>':method==='PS'&&joined?'<p>PSはCase ControlのSPC選択とは独立して有効です。</p>':'<p>チェックがないため、SPC1行やPSの成分は追加しません。</p>';
  NastranFields.render($('constraint-fields'),rows.join('\n'));
 }
 document.querySelectorAll('#dof-checkboxes input').forEach(el=>el.addEventListener('change',update));
 document.querySelectorAll('[data-components]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('#dof-checkboxes input').forEach(el=>{el.checked=button.dataset.components.includes(el.value);});update();}));
 $('constraint-method').addEventListener('change',update);update();
})();
