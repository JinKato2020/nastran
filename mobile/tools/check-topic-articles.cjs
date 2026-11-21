const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist'),ctx={window:{}};vm.createContext(ctx);
for(const n of ['lesson-article','lesson-diagrams','teaching-diagrams','theory-topic-visuals','beam-labs','boundary-labs','mesh-wave-labs','mesh-chapter','material-chapter','boundary-chapter','load-chapter','damping-chapter','contact-chapter','topic-article-data'])vm.runInContext(fs.readFileSync(path.join(dir,n+'.js'),'utf8'),ctx);
for(const [key,cfg] of Object.entries(ctx.window.TopicArticleData)){
 const chapter=ctx.window[cfg.api],ids=cfg.articles.flatMap(g=>g.sections),expected=chapter.sections.map(s=>s[0]).filter(id=>!['questions','quiz','sources'].includes(id));
 assert.deepEqual([...ids].sort(),[...expected].sort(),key+' all authored sections exactly once');
 const quiz=chapter.sections.find(s=>['questions','quiz'].includes(s[0]))[2],count=(quiz.match(/<details>/g)||[]).length,q=cfg.articles.flatMap(g=>g.questions);
 assert.deepEqual([...q].sort((a,b)=>a-b),Array.from({length:count},(_,i)=>i),key+' all questions exactly once');
 for(const g of cfg.articles){
  assert(g.sections.length<=6,key);assert(g.questions.length>0,key+'/'+g.key);assert.equal(g.points.length,3);
  assert.ok(g.opening?.trim(),key+'/'+g.key+' missing opening example');
  if(g.previewSection){
   assert(g.sections.includes(g.previewSection));
   assert.match(chapter.sections.find(s=>s[0]===g.previewSection)[2],/<figure\b/);
  }
 }
}
for(const name of ['theory-data','extended-theory-data','practice-theory-data','linear-foundations'])vm.runInContext(fs.readFileSync(path.join(dir,name+'.js'),'utf8'),ctx);
for(const entry of ctx.window.NastranTheory)if(!entry.chapter&&!ctx.window.TopicArticleData[entry.key])assert.ok(entry.opening,entry.key+' missing opening example');
console.log('PASS: Separate articles preserve every section and question exactly once.');
