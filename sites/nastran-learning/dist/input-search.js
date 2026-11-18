(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.NastranInputSearch=api;
})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const normalize=value=>String(value).normalize('NFKC').toLocaleLowerCase().trim();
 const order=new Intl.Collator('en',{numeric:true,sensitivity:'base'});
 const chapters=[
  {key:'executive',title:'Executive Control',description:'SOL・実行の制御'},
  {key:'case',title:'Case Control',description:'ケース・拘束・荷重・出力の選択'},
  {key:'parameter',title:'パラメータ',description:'計算方法・出力などの設定'},
  {key:'bulk',title:'Bulk Data',description:'節点・要素・材料・荷重・解析条件'},
 ];
 function groups(entries,comparisons=[]){
  const result=chapters.map(chapter=>{
   const cards=entries.filter(e=>e.family===chapter.key);
   return {...chapter,items:[...new Set(cards.map(e=>e.category))].map(category=>{
    const sorted=cards.filter(e=>e.category===category).sort((a,b)=>order.compare(a.id,b.id)||order.compare(a.key,b.key));
    return {title:category,description:sorted.slice(0,4).map(e=>e.id).join('・')+(sorted.length>4?` ほか${sorted.length-4}件`:''),path:'bulk.html',hash:'#'+sorted[0].key};
   })};
  });
  result.push({key:'comparisons',title:'似たカードの使い分け',description:'長所・短所と、状況に応じた選択',items:comparisons.map(t=>({title:t.title,description:t.summary||'',path:'comparisons.html',hash:'#'+t.key}))});
  return result;
 }
 function search(entries,query){
  const q=normalize(query);if(!q)return [];
  const tokens=q.split(/\s+/),named=tokens.length===1?entries.filter(e=>normalize(e.id).startsWith(q)):[];
  return (named.length?named:entries).filter(e=>tokens.every(t=>normalize([e.id,e.key,e.title,e.summary,...(e.aliases||[])].join(' ')).includes(t))).sort((a,b)=>{
   const rank=e=>normalize(e.id)===q?0:normalize(e.id).startsWith(q)?1:2;
   return rank(a)-rank(b)||order.compare(a.id,b.id)||order.compare(a.key,b.key);
  });
 }
 return {search,normalize,groups};
});
