(function(){
 'use strict';
 const course=window.NASTRAN_LEARNING,storageKey='nastran-course-v1';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const href=x=>x.path+(x.hash||'');
 const moved={'workflow.html#rules':'input.html#rules','workflow.html#build':'input.html#complete','index.html#chapter-4':'basics.html#node','index.html#chapter-5':'basics.html#constraints','index.html#chapter-6':'input.html#executive','index.html#chapter-8':'workflow.html#results'};
 function relocate(){const url=moved[document.body.dataset.learningPage+location.hash];if(!url)return false;const a=document.createElement('a');a.href=url;document.body.append(a);a.click();a.remove();return true;}
 let done=[];try{const v=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(v))done=[...new Set(v.filter(k=>course.steps.some(s=>s.key===k)))];}catch{}
 let activeGroup='steps';
 function cards(group){return course[group].map((x,i)=>'<a class="learning-card" href="'+href(x)+'"><span'+(done.includes(x.key)?' class="learning-complete-mark"':'')+'>'+(done.includes(x.key)?'✓':group==='steps'?String(i+1).padStart(2,'0'):group==='next'?'→':'?')+'</span><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.description)+'</p>'+(group==='next'?'<small>'+esc(x.goal)+'</small>':x.kind?'<small>'+esc(x.kind)+'</small>':'')+'</div></a>').join('');}
 function home(){const el=document.getElementById('learning-home');if(!el)return;
  const desc={steps:'最初はこの6ステップだけ。棒1本の静解析で、予想 → 入力 → 実行 → 確認を一周します。',next:'入門を終えたら、知りたい現象を選びます。減衰は動解析の後、亀裂は応力の読み方を理解してから進みます。',reference:'学習中に必要な項目を引く場所です。入力の分割や並列計算は、基本の1件実行を理解してから使います。'};
  el.innerHTML='<div class="learning-tabs" role="tablist" aria-label="教材の使い方">'+[['steps','はじめて学ぶ'],['next','次に学ぶ'],['reference','調べる・実務']].map(([g,t])=>'<button type="button" role="tab" aria-selected="'+(g===activeGroup)+'" data-learning-group="'+g+'">'+t+'</button>').join('')+'</div><p class="learning-intro">'+desc[activeGroup]+'</p>'+(activeGroup==='steps'?'<div class="learning-progress"><b>入門の学習記録</b><span>'+done.length+' / 6ステップ</span></div>':'')+'<div class="learning-list">'+cards(activeGroup)+'</div>';
  el.querySelectorAll('[data-learning-group]').forEach(b=>b.addEventListener('click',()=>{activeGroup=b.dataset.learningGroup;home();document.querySelector('[data-learning-group="'+activeGroup+'"]').focus();}));
 }
 const side=document.getElementById('learning-sidebar');if(side)side.innerHTML=[['steps','まずは6ステップ'],['next','入門の次に'],['reference','調べる・実務']].map(([g,t])=>'<div class="learning-group-label">'+t+'</div>'+course[g].map((x,i)=>'<a class="learning-side-link" href="'+href(x)+'">'+(g==='steps'?String(i+1).padStart(2,'0')+'　':'')+esc(x.title)+'</a>').join('')).join('');
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
