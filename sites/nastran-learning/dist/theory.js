(() => {
 'use strict';
 const entries=window.NastranTheory,$=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('theory-picker').innerHTML=entries.map(e=>`<option value="${e.key}">${esc(e.title)}</option>`).join('');
 function render(){const e=entries.find(e=>e.key===location.hash.slice(1))||entries[0];$('theory-picker').value=e.key;document.title=e.title+' — FEMノート';
  $('theory-detail').innerHTML=`<div class="analysis-head"><span class="analysis-sol">教材 · 理論</span><h1>${esc(e.title)}</h1><p>${esc(e.summary)}</p></div><div class="theory-formula"><p class="analysis-equation">${esc(e.equation)}</p><p>${esc(e.symbols)}</p></div>`+
   e.sections.map(([title,paragraphs])=>`<section class="theory-section"><h2>${esc(title)}</h2>${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')+
   `<section class="theory-section"><h2>適用範囲を判断する</h2><ul>${e.limits.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section><a class="theory-bridge" href="${e.technical[0]}"><strong>${esc(e.technical[1])} →</strong><span>モデル・境界条件・Input・実行・出力は技術情報へ</span></a><div class="theory-sources">${e.sources.map(([url,title])=>`<a href="${url}" target="_blank" rel="noopener">${esc(title)} ↗</a>`).join('')}</div>`;
 }
 $('theory-picker').addEventListener('change',()=>{location.hash=$('theory-picker').value;window.scrollTo(0,0);});addEventListener('hashchange',render);render();
})();
