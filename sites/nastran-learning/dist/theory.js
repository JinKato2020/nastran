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
  const chapter=window.TopicArticleData[e.key];
  const study=window.AnalysisTheoryStudy[e.key],A=window.LessonArticle;
  detail.closest('main').classList.toggle('elements-main',!!chapter||!!study);
  picker.closest('label').hidden=!!chapter;
  if(chapter){window.TopicArticles.mount(detail,e.key,section||'');return;}
  window.TopicArticles.clear(detail);
  const visual=e.visual==='eigenvalues'?window.EigenvalueVisuals:null;
  const materialVisuals=e.visual==='materials'?window.MaterialVisuals:null;
  const topicVisuals=window.TheoryTopicVisuals?.[e.key];
  const related=[...(e.related?[e.related]:[]),...(e.links||[])];
  const checks={contact:['analysis.html#contact-check','接触状態の確認'],damping:['analysis.html#damping-check','減衰設定の照合']};
  if(checks[e.key])related.push(checks[e.key]);
  const formula=`<div class="theory-formula"><p class="analysis-equation">${esc(e.equation)}</p><p>${esc(e.symbols)}</p></div>`;
  const parts=e.sections.map(([title,paragraphs,figure,table],i)=>{
   const experiment=Object.hasOwn(window.AnalysisTheoryFigures.labs,figure)?`<figure data-analysis-theory-figure="${esc(figure)}"></figure>`:'';
   const body=(materialVisuals?.[figure]||topicVisuals?.[i]||'')+paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')+
    experiment+(window.TheoryLabs?.html(figure)||'')+(visual?.[figure]||'')+comparisonTable(table)+(i===0?formula:'');
   return {title:study?title.replace(/^\d+\s*·\s*/,''):title,body,id:'theory-section-'+i};
  });
  parts.push({title:study?'どこまで使えるか':'適用範囲を判断する',body:'<ul>'+e.limits.map(s=>`<li>${esc(s)}</li>`).join('')+'</ul>',id:'theory-limits'});
  if(study?.check){
   const [q,a]=study.check;
   parts.push({title:'自分で確かめる',body:`<div class="theory-quiz"><details><summary>${esc(q)}</summary><p>${esc(a)}</p></details></div>`,id:'theory-check'});
  }else if(study){
   const quiz=parts.findIndex(s=>s.title==='自分で確かめる');
   if(quiz>=0)parts.push(parts.splice(quiz,1)[0]);
  }
  const intro=study?A.intro({goals:[study.goal],points:study.points,prerequisites:[study.prerequisite]}):e.opening?`<p>${esc(e.summary)}</p>`:'';
  detail.innerHTML=`<div class="analysis-head"><span class="analysis-sol">${window.SolverScope.basic.has(e.key)?'Nastran共通 · 理論':'教材 · 理論'}</span><h1>${esc(e.title)}</h1><p>${esc(e.opening??e.summary)}</p></div>`+
   intro+(study||e.sectionIndex?A.toc(parts.map(({id,title})=>[id,title])):'')+(visual?.growthFigure||'')+
   parts.map(({id,title,body},i)=>A.section(study?`${i+1}. ${title}`:title,body,id)).join('')+
   (related.length?`<div class="analysis-links">${related.map(([url,title])=>`<a href="${esc(url)}">${esc(title)} →</a>`).join('')}</div>`:'')+
   `<a class="theory-bridge" href="${esc(e.technical[0])}"><strong>${esc(e.technical[1])} →</strong><span>モデル・境界条件・入力・結果を確認する</span></a><div class="theory-sources">${e.sources.map(([url,title])=>`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(title)} ↗</a>`).join('')}</div>`;
  A.bindNavigation(detail);
  window.AnalysisTheoryFigures.connect(detail);
  visual?.connect(detail);
  window.TheoryLabs?.connect(detail);
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const nav=window.NASTRAN_LEARNING.navigation;
  const groups=new Map();
  const used=new Set();
  for(const item of [...nav.meshTheory,...nav.materialTheory,...nav.boundaryTheory,...nav.loadTheory,...nav.contactTheory,...nav.dampingTheory,...nav.common,...nav.materials]){
   if(item.path!=='theory.html')continue;
   const entry=entries.find(e=>e.key===item.hash.slice(1).split('/')[0]);
   if(!entry||used.has(entry.key))continue;
   const group=entry.key==='mesh'?'メッシュ分割の理論':entry.key==='materials'?'材料理論':entry.key==='boundary'?'境界条件と拘束':entry.key==='common-loads'?'荷重の理論':item.group||'共通の解析技術論';
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
