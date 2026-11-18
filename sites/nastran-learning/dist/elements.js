(() => {
 'use strict';
 // One article per element family; the hash (#beam) selects which one is shown.
 const articles=[...document.querySelectorAll('article[data-element]')],picker=document.getElementById('element-picker');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function render(){
  const key=decodeURIComponent(location.hash.slice(1).split('/')[0]);
  const target=key&&document.getElementById(key);
  const shown=articles.find(a=>a.dataset.element===key)||(target&&target.closest('article[data-element]'))||articles[0];
  for(const a of articles)a.hidden=a!==shown;
  picker.value=shown.dataset.element;
  document.title=shown.dataset.title+' — FEM Guide';
  if(target&&target!==shown)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
 }
 picker.addEventListener('change',()=>{location.hash=picker.value;scrollTo(0,0);});
 document.addEventListener('click',event=>{
  const jump=event.target.closest('[data-jump]');
  if(!jump)return;
  event.preventDefault();
  document.getElementById(jump.dataset.jump)?.scrollIntoView({block:'start'});
 });
 addEventListener('hashchange',render);
 document.addEventListener('DOMContentLoaded',()=>{
  for(const placeholder of document.querySelectorAll('[data-element-sketch]')){
   const draw=window.ElementVisuals[placeholder.dataset.elementSketch];
   placeholder.innerHTML=draw(esc(placeholder.dataset.description));
  }
  const order=window.NASTRAN_LEARNING.navigation.elements.map(item=>item.hash.slice(1));
  const listed=order.map(key=>articles.find(article=>article.dataset.element===key)).filter(Boolean);
  picker.innerHTML=[...listed,...articles.filter(article=>!listed.includes(article))]
   .map(a=>`<option value="${a.dataset.element}">${esc(a.dataset.title)}</option>`).join('');
  for(const article of articles)window.LessonArticle.adoptIntro(article);
  render();
 });
})();
