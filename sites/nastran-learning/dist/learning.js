(function(){
 'use strict';
 const course=window.NASTRAN_LEARNING,storageKey='nastran-course-v1';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const href=x=>x.path+(x.hash||'');
 const moved={'workflow.html#rules':'input.html#rules','workflow.html#build':'input.html#complete','index.html#chapter-4':'basics.html#node','index.html#chapter-5':'basics.html#constraints','index.html#chapter-6':'input.html#executive','index.html#chapter-8':'workflow.html#results'};
 function relocate(){const url=moved[document.body.dataset.learningPage+location.hash];if(!url)return false;const a=document.createElement('a');a.href=url;document.body.append(a);a.click();a.remove();return true;}
 let done=[];try{const v=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(v))done=[...new Set(v.filter(k=>course.steps.some(s=>s.key===k)))];}catch{}
 const nav=course.navigation;
 const basics=[...nav.intro.slice(0,1),...nav.homeResources.filter(item=>item.hash!=='#linear-guide-help'),...nav.intro.slice(1)];
 const materials=nav.materials||[];
 const theoryGroups=[...new Set(materials.map(item=>item.group))].map(group=>[group,materials.filter(item=>item.group===group)]);
 const navGroups=course.materialChapters.map(chapter=>[chapter.title,chapter.sources.flatMap(source=>
  source==='materials'?theoryGroups:[[source==='common'?'共通の解析技術論':null,nav[source]]])]);
 const learningCard=x=>'<a class="learning-card" href="'+href(x)+'"><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.description)+'</p></div></a>';
 function learningGroup(title,sections,open=false,key=''){
  const count=sections.reduce((total,[,items])=>total+items.length,0);
  const content=sections.map(([heading,items])=>(heading?'<h3 class="learning-group-label">'+esc(heading)+'</h3>':'')+
   '<div class="learning-list">'+items.map(learningCard).join('')+'</div>').join('');
  return '<details class="curriculum-group" data-chapter="'+esc(key)+'" '+(open?'open':'')+'><summary>'+esc(title)+'<small>'+count+'項目</small></summary>'+content+'</details>';
 }
 window.NastranLearningUI={card:learningCard,group:learningGroup};
 const basicList=document.getElementById('learning-basics');
 if(basicList)basicList.innerHTML=basics.map(learningCard).join('');
 const operations=document.getElementById('learning-operations');
 if(operations)operations.innerHTML=nav.operations.map(learningCard).join('');
 const catalog=document.getElementById('learning-catalog');
 if(catalog)catalog.innerHTML=navGroups.map(([title,sections],i)=>learningGroup(title,sections,i===0)).join('');
 function cards(group){return course[group].map((x,i)=>'<a class="learning-card" href="'+href(x)+'"><span'+(done.includes(x.key)?' class="learning-complete-mark"':'')+'>'+(done.includes(x.key)?'✓':group==='steps'?String(i+1).padStart(2,'0'):group==='next'?'→':'?')+'</span><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.description)+'</p>'+(group==='next'?'<small>'+esc(x.goal)+'</small>':x.kind?'<small>'+esc(x.kind)+'</small>':'')+'</div></a>').join('');}
 function home(){const el=document.getElementById('learning-home');if(!el)return;
  el.innerHTML='<div class="learning-progress"><b>初めての解析の学習記録</b><span>'+done.length+' / 6ステップ</span></div><div class="learning-list">'+cards('steps')+'</div>';
 }
 const side=document.getElementById('learning-sidebar');
 if(side)side.innerHTML=[['最初に学ぶ',[[null,basics]]],['モデル作成・実行・結果',[[null,nav.operations]]],...navGroups].map(([title,sections])=>'<div class="learning-group-label">'+esc(title)+'</div>'+
  sections.map(([heading,items])=>(heading?'<div class="learning-group-label">'+esc(heading)+'</div>':'')+
   items.map(x=>'<a class="learning-side-link" href="'+href(x)+'">'+esc(x.title)+'</a>').join('')).join('')).join('');
 function current(){const path=document.body.dataset.learningPage,hash=location.hash;
  if(path==='index.html'){
   if(/^#chapter-[123]$/.test(hash))return 0;
   if(/^#chapter-[45]$/.test(hash))return 1;
   if(hash==='#chapter-6')return 2;
   if(hash==='#chapter-7')return 3;
   if(hash==='#chapter-8')return 4;
   if(hash==='#chapter-9'||hash==='#lab')return 5;
   return -1;
  }
  return course.steps.findIndex(s=>s.path===path);
 }
 function guidance(){
  document.querySelectorAll('.learning-orientation,.learning-footer').forEach(e=>e.remove());
  const path=document.body.dataset.learningPage,i=current();
  let container=path==='index.html'?document.querySelector('.lesson:not([hidden])'):document.querySelector('main');if(!container)return;
  if(i<0){if(path==='index.html')return;const x=[...course.next,...course.reference].find(s=>s.path===path);if(!x)return;
   const panel=document.createElement('aside');panel.className='learning-orientation';panel.innerHTML='<span class="learning-label">'+(course.next.includes(x)?'入門の次に学ぶ':'必要なときに調べる')+'</span><p>'+esc(x.goal||x.description)+'</p><a href="index.html#home">学ぶ順序に戻る →</a>';container.prepend(panel);return;
  }
  const s=course.steps[i],top=document.createElement('aside');top.className='learning-orientation';top.innerHTML='<div class="learning-label">入門 '+(i+1)+' / 6 · '+esc(s.title)+'</div><p><b>ここでできるようになること</b><br>'+esc(s.goal)+'</p><div class="learning-topics">'+s.topics.map(([u,t])=>'<a href="'+u+'">'+esc(t)+'</a>').join('')+'</div>';container.prepend(top);
  const part=document.body.dataset.learningPage==='index.html'?location.hash:'';
  let continuation=part==='#chapter-1'?['index.html#chapter-2','線形静解析で求めるもの']:part==='#chapter-2'?['index.html#chapter-3','単位をそろえる']:part==='#chapter-9'?['index.html#lab','棒の実験室で確かめる']:null;
  if(path==='input.html'){
   const stage=location.hash.slice(1)||'executive';
   const next={executive:['case','Case Control'],case:['param','PARAM'],param:['bulk','Bulk Data'],bulk:['rules','8文字の入力規則'],rules:['complete','完成BDFを保存']}[stage];
   if(next)continuation=['input.html#'+next[0],next[1]];
  }
  if(path==='workflow.html'){
   const stage=location.hash.slice(1)||'files';
   const next={run:['files','関連ファイルの役割'],files:['results','F06で結果を確かめる']}[stage];
   if(next)continuation=['workflow.html#'+next[0],next[1]];
  }
  const foot=document.createElement('aside');foot.className='learning-footer';foot.innerHTML='<span class="learning-label">'+(continuation?'このステップの続き':'ここまでを確認できたら')+'</span>'+(continuation?'':'<p>'+esc(s.goal)+'</p><label><input type="checkbox" id="course-complete" '+(done.includes(s.key)?'checked':'')+'>このステップを学習した</label>')+'<div class="learning-actions"><a href="'+(i?href(course.steps[i-1]):'index.html#home')+'">← '+(i?'前のステップ':'学ぶ順序')+'</a><a class="learning-next" href="'+(continuation?continuation[0]:i<5?href(course.steps[i+1]):'index.html#home')+'">'+(continuation?'次へ · '+continuation[1]:i<5?'次へ · '+course.steps[i+1].title:'入門を終えて、次の学習を選ぶ')+' →</a></div>';
  if(path==='index.html')container.append(foot);else {const f=container.querySelector('footer');if(f)f.before(foot);else container.append(foot);}
  foot.querySelector('input')?.addEventListener('change',e=>{done=done.filter(k=>k!==s.key);if(e.target.checked)done.push(s.key);try{localStorage.setItem(storageKey,JSON.stringify(done));}catch{}home();});
 }
 home();if(!relocate())guidance();addEventListener('hashchange',()=>setTimeout(()=>{if(!relocate())guidance();},0));
})();
