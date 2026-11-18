(() => {
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // The beam article is the source template. Keep its markup and shared CSS;
 // article-specific facts, links and figures are supplied by the caller.
 const introHTML=(goals,prerequisite,points)=>`<div class="element-key"><strong>この記事で分かること</strong>
<ul>
${goals.map(s=>'<li>'+s+'</li>').join('\n')}
</ul>
<strong>前提として読む記事</strong>：${prerequisite}
<ol>
${points.map(s=>'<li>'+s+'</li>').join('\n')}
</ol></div>`;
 const intro=({goals,prerequisites,points})=>introHTML(goals.map(esc),prerequisites.map(([url,label])=>`<a href="${esc(url)}">${esc(label)}</a>`).join('、')+'。',points.map(esc));
 const section=(title,body,id='')=>`<section class="theory-section"${id?' id="'+esc(id)+'"':''}><h2>${esc(title)}</h2>${body}</section>`;
 function table(headers,rows,{caption='',selected=-1,htmlFirst=false,narrow=false}={}){
  return `<div class="element-table-wrap"${narrow?'':` tabindex="0" role="region" aria-label="${esc(caption||headers.join('・'))}"`}><table class="element-table${narrow?' narrow':''}">${caption?'<caption>'+esc(caption)+'</caption>':''}<thead><tr>${headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')}</tr></thead><tbody>${rows.map(([first,...cells],i)=>`<tr${i===selected?' aria-current="true"':''}><th scope="row">${htmlFirst?first:esc(first)}</th>${cells.map(c=>'<td>'+esc(c)+'</td>').join('')}</tr>`).join('')}</tbody></table></div>`;
 }
 function adoptIntro(root){
  // Read authored content, then render it with the same function as the analysis
  // pages. Preserve emphasis and prerequisite prose in the trusted local HTML.
  const box=root.querySelector(':scope > .element-key');
  if(!box||box.querySelector('strong')?.textContent!=='この記事で分かること')return;
  const goals=[...box.querySelectorAll(':scope > ul > li')].map(e=>e.innerHTML);
  const points=[...box.querySelectorAll(':scope > ol > li')].map(e=>e.innerHTML);
  const prerequisite=box.innerHTML.split('<strong>前提として読む記事</strong>')[1]?.split('<ol>')[0]?.trim().replace(/^：/,'');
  if(goals.length&&points.length&&prerequisite)box.outerHTML=introHTML(goals,prerequisite,points);
 }
 const toc=items=>'<ul class="element-toc" aria-label="この解説の目次">'+items.map(([id,label])=>`<li><button type="button" data-jump="${esc(id)}">${esc(label)}</button></li>`).join('')+'</ul>';
 const navigationRoots=new WeakSet();
 function bindNavigation(root){
  if(navigationRoots.has(root))return;
  navigationRoots.add(root);
  root.addEventListener('click',event=>{
   const jump=event.target.closest('button[data-jump]');
   if(!jump)return;
   event.preventDefault();
   const doc=root.ownerDocument||root;
   doc.getElementById(jump.dataset.jump)?.scrollIntoView({block:'start'});
  });
 }
 window.LessonArticle={intro,section,table,adoptIntro,toc,bindNavigation};
})();
