(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NastranInputSearch=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const normalize=value=>String(value).normalize('NFKC').toLocaleLowerCase().trim();
 const order=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
 function search(entries,query){
  const q=normalize(query);if(!q)return [];
  const tokens=q.split(/\s+/),named=tokens.length===1?entries.filter(e=>normalize(e.id).startsWith(q)):[];
  return (named.length?named:entries).filter(e=>tokens.every(t=>normalize([e.id,e.key,e.title,e.summary,...(e.aliases||[])].join(' ')).includes(t))).sort((a,b)=>{
   const rank=e=>normalize(e.id)===q?0:normalize(e.id).startsWith(q)?1:2;
   return rank(a)-rank(b)||order.compare(a.id,b.id)||order.compare(a.key,b.key);
  });
 }
 return {search,normalize};
});
