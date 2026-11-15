(() => {
 'use strict';
 // Turns each card name in an 8-column deck into a link to the matching Input data entry.
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function target(line,part){
  const text=line.trim(),upper=text.toUpperCase();
  if(!text||text.startsWith('$'))return null;
  if(part==='exec'){
   if(/^CEND\b/.test(upper))return {word:/CEND/i,key:'EXEC_CEND',next:'case'};
   const sol=/^SOL\s+(\d+)/.exec(upper);
   if(sol)return {word:/SOL\s+\d+/i,key:'EXEC_SOL_'+sol[1]};
   const word=/^[A-Z]+/.exec(upper);
   return word?{word:new RegExp(word[0],'i'),key:'EXEC_'+word[0]}:null;
  }
  if(part==='case'){
   if(/^BEGIN\s+BULK\b/.test(upper))return {next:'bulk'};
   const word=/^[A-Z]+/.exec(upper);
   return word?{word:new RegExp(word[0],'i'),key:'CASE_'+word[0]}:null;
  }
  const name=line.slice(0,8).trim().toUpperCase();
  if(!/^[A-Z][A-Z0-9]*\*?$/.test(name))return null;
  const card=name.replace(/\*$/,'');
  return {word:new RegExp(name.replace('*','\\*'),'i'),key:card==='PARAM'?'PARAM_'+line.slice(8,16).trim().toUpperCase():card};
 }
 function scan(text,visit){
  let part='exec';
  return text.split(/\r?\n/).map(line=>{
   const found=target(line,part);
   if(found?.next)part=found.next;
   return visit(line,found?.key?found:null);
  });
 }
 function render(text){
  return scan(text.replace(/(\r?\n)+$/,''),(line,found)=>{
   if(!found)return esc(line);
   const match=found.word.exec(line);
   const head=line.slice(0,match.index),name=match[0],tail=line.slice(match.index+name.length);
   return esc(head)+`<a href="bulk.html#${esc(found.key)}" data-dat-card="${esc(found.key)}">${esc(name)}</a>`+esc(tail);
  }).join('\n')+'\n';
 }
 const keys=text=>[...new Set(scan(text,(line,found)=>found?.key).filter(Boolean))];
 window.AnalysisDeckLinks={render,keys};
})();
