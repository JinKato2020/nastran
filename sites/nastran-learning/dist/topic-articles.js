(() => {
 'use strict';
 const A=window.LessonArticle;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // One article per learning unit, as in elements.html. Only that article is
 // mounted. Sections, figures and quizzes remain authored once in each chapter.
 const states=new WeakMap();
 function mount(root,chapter,key=''){
  const cfg=window.TopicArticleData[chapter],api=window[cfg.api];
  key=decodeURIComponent(key).replace(new RegExp('^'+cfg.prefix+'-'),'');
  const alias=cfg.aliases?.[key]||key;
  let group=cfg.articles.find(g=>g.key===alias)||cfg.articles.find(g=>g.sections.includes(alias));
  const reference=alias==='sources';
  if(!group)group=cfg.articles[0];
  const identity=chapter+'/'+(reference?'sources':group.key);
  let state=states.get(root);
  if(!state){state={cache:new Map(),active:null};states.set(root,state);}
  if(state.active!==identity){
   if(state.active){const old=document.createDocumentFragment();while(root.firstChild)old.append(root.firstChild);state.cache.set(state.active,old);}
   const saved=state.cache.get(identity);
   if(saved)root.append(saved);
   else{
    const sections=reference?api.sections.filter(s=>s[0]==='sources'):group.sections.map(id=>api.sections.find(s=>s[0]===id));
    const title=reference?'参照資料':group.title;
    const quiz=api.sections.find(s=>['questions','quiz'].includes(s[0]));
    const container=document.createElement('div');container.innerHTML=quiz?.[2]||'';
    const questions=[...container.querySelectorAll('details')];
    const selectedQuestions=reference?[]:group.questions.map(i=>questions[i]?.outerHTML).filter(Boolean);
    const local=sections.map(([id,t,b])=>[cfg.prefix+'-'+id,t.replace(/^\d+\.\s*/,''),b]);
    if(selectedQuestions.length)local.push([cfg.prefix+'-questions','自分で確かめる','<div class="theory-quiz">'+selectedQuestions.join('')+'</div>']);
    const i=cfg.articles.indexOf(group);
    root.innerHTML='<div class="analysis-head"><span class="analysis-sol">'+esc(cfg.title)+'</span><h1>'+esc(title)+'</h1></div>'+
     '<label class="analysis-selector">この章の記事<select aria-label="この章の記事" data-topic-picker>'+cfg.articles.map(g=>'<option value="'+esc(g.key)+'"'+(!reference&&g===group?' selected':'')+'>'+esc(g.title)+'</option>').join('')+'<option value="sources"'+(reference?' selected':'')+'>参照資料</option></select></label>'+
     (reference?'':A.intro({goals:group.goals,prerequisites:i?[[`theory.html#${chapter}/${cfg.articles[i-1].key}`,cfg.articles[i-1].title]]:cfg.prerequisites,points:group.points}))+
     A.toc(local.map(([id,t])=>[id,t]))+local.map(([id,t,b],j)=>A.section(`${j+1}. ${t}`,b,id)).join('')+
     '<nav class="analysis-links" aria-label="章の続き">'+(!reference&&i?`<a href="theory.html#${chapter}/${cfg.articles[i-1].key}">← ${esc(cfg.articles[i-1].title)}</a>`:'')+(!reference&&i+1<cfg.articles.length?`<a href="theory.html#${chapter}/${cfg.articles[i+1].key}">${esc(cfg.articles[i+1].title)} →</a>`:'')+(!reference?`<a href="theory.html#${chapter}/sources">参照資料 →</a>`:'')+'</nav>';
    root.querySelector('[data-topic-picker]').addEventListener('change',e=>{location.hash=chapter+'/'+e.target.value;});
    api.connect(root);A.bindNavigation(root);
   }
   state.active=identity;
   root.dataset.chapter=chapter;root.dataset.article=reference?'sources':group.key;
   root.setAttribute('data-element',root.dataset.article);
   root.dataset.title=reference?'参照資料':group.title;
   document.title=root.dataset.title+' — FEM Guide';
   window.scrollTo(0,0);
  }
  // Group links open the introduction; old deep links still open their section.
  if(key&&key!==group.key&&!reference&&group.sections.includes(alias)){
   requestAnimationFrame(()=>document.getElementById(cfg.prefix+'-'+alias)?.scrollIntoView({block:'start'}));
  }
 }
 function clear(root){states.delete(root);delete root.dataset.chapter;delete root.dataset.article;root.removeAttribute('data-element');}
 window.TopicArticles={mount,clear};
})();
