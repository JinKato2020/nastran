(() => {
 'use strict';
 const entries=window.NastranTheory,$=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const picker=$('theory-picker'),detail=$('theory-detail');
 function comparisonTable(table){
  if(!table)return '';
  const [caption,columns,rows]=table;
  return window.LessonArticle.table(columns,rows,{caption});
 }
 function render(){let [key,section]=location.hash.slice(1).split('/');const alias=entries.find(e=>e.key===key&&e.chapter);if(alias){key=alias.chapter;section=alias.section;}const e=entries.find(e=>e.key===key)||entries.find(e=>e.key===picker.options[0]?.value)||entries[0];picker.value=e.key;document.title=e.title+' — FEM Guide';
  const damping=e.key==='damping',chapter={materials:window.MaterialChapter,boundary:window.BoundaryChapter,'common-loads':window.LoadChapter}[e.key];
  detail.closest('main').classList.toggle('elements-main',damping||!!chapter);
  picker.closest('label').hidden=damping||!!chapter;
  if(chapter){if(detail.dataset.chapter!==e.key){chapter.mount(detail);detail.dataset.chapter=e.key;}if(section)chapter.focusSection(section);return;}
  delete detail.dataset.chapter;
  if(damping){window.DampingChapter.mount(detail);return;}
  const visual=e.visual==='eigenvalues'?window.EigenvalueVisuals:null;
  const materialVisuals=e.visual==='materials'?window.MaterialVisuals:null;
  const topicVisuals=window.TheoryTopicVisuals?.[e.key];
  const related=[...(e.related?[e.related]:[]),...(e.links||[])];
  const checks={contact:['analysis.html#contact-check','接触状態の確認'],damping:['analysis.html#damping-check','減衰設定の照合']};
  if(checks[e.key])related.push(checks[e.key]);
  const sectionIndex=e.sectionIndex?`<nav class="theory-section-index" aria-label="この教材の目次">${e.sections.map(([title],i)=>`<button type="button" data-theory-target="theory-section-${i}">${esc(title)}</button>`).join('')}</nav>`:'';
  detail.innerHTML=`<div class="analysis-head"><span class="analysis-sol">${window.SolverScope.basic.has(e.key)?'Nastran共通 · 理論':'教材 · 理論'}</span><h1>${esc(e.title)}</h1><p>${esc(e.summary)}</p></div>${sectionIndex}${visual?.growthFigure||''}<div class="theory-formula"><p class="analysis-equation">${esc(e.equation)}</p><p>${esc(e.symbols)}</p></div>`+
   e.sections.map(([title,paragraphs,figure,table],i)=>`<section class="theory-section"><h2 id="theory-section-${i}" tabindex="-1">${esc(title)}</h2>${materialVisuals?.[figure]||topicVisuals?.[i]||''}${paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}${window.TheoryLabs?.html(figure)||''}${visual?.[figure]||''}${comparisonTable(table)}</section>`).join('')+
   `<section class="theory-section"><h2>適用範囲を判断する</h2><ul>${e.limits.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>${related.length?`<div class="analysis-links">${related.map(([url,title])=>`<a href="${esc(url)}">${esc(title)} →</a>`).join('')}</div>`:''}<a class="theory-bridge" href="${e.technical[0]}"><strong>${esc(e.technical[1])} →</strong><span>モデル・境界条件・Input・実行・出力は技術情報へ</span></a><div class="theory-sources">${e.sources.map(([url,title])=>`<a href="${url}" target="_blank" rel="noopener">${esc(title)} ↗</a>`).join('')}</div>`;
  visual?.connect(detail);
  window.TheoryLabs?.connect(detail);
 }
 detail.addEventListener('click',event=>{
  const button=event.target.closest('button[data-theory-target]');
  if(!button)return;
  const heading=$(button.dataset.theoryTarget);
  heading.focus({preventScroll:true});
  heading.scrollIntoView({block:'start'});
 });
 document.addEventListener('DOMContentLoaded',()=>{
  const nav=window.NASTRAN_LEARNING.navigation;
  const groups=new Map();
  const used=new Set();
  for(const item of [...nav.materialTheory,...nav.boundaryTheory,...nav.loadTheory,...nav.common,...nav.materials]){
   if(item.path!=='theory.html')continue;
   const entry=entries.find(e=>e.key===item.hash.slice(1).split('/')[0]);
   if(!entry||used.has(entry.key))continue;
   const group=entry.key==='materials'?'材料理論':entry.key==='boundary'?'境界条件と拘束':entry.key==='common-loads'?'荷重の理論':item.group||'共通の解析技術論';
   if(!groups.has(group))groups.set(group,[]);
   groups.get(group).push(entry);
   used.add(entry.key);
  }
  groups.set('応用・確認',entries.filter(e=>!used.has(e.key)&&!e.chapter));
  picker.innerHTML=[...groups].map(([group,items])=>`<optgroup label="${esc(group)}">${items.map(e=>`<option value="${e.key}">${esc(e.title)}</option>`).join('')}</optgroup>`).join('');
  picker.addEventListener('change',()=>{location.hash=picker.value;window.scrollTo(0,0);});
  addEventListener('hashchange',render);
  render();
 });
})();
