const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
require.extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const root=path.resolve(__dirname,'..'),p=require('../src/protocol.ts'),content=require('../src/content.ts');
const release=require('./release-version.cjs');
assert.deepEqual(release.nextRelease('1.2.1','1001','next'),{version:'1.2.2',build:'1001'});
assert.deepEqual(release.nextRelease('1.2.1','1001','rebuild'),{version:'1.2.1',build:'1002'});
assert.deepEqual(release.nextRelease('1.2.9','1021','next'),{version:'1.2.10',build:'1001'});
assert.throws(()=>release.nextRelease('invalid','1001'));
const app=require('../app.json').expo;
assert(release.validVersion(app.version));assert(/^\d+$/.test(app.ios.buildNumber));
assert.equal(p.position({path:'../../secret',hash:'',y:0}),null);
assert.equal(p.externalURL('javascript:alert(1)'),null);
assert.equal(p.externalURL('https://name:secret@example.com'),null);
assert.equal(p.progress('[1,1,12,-1,"2",3]'),'[1,3]');
assert.equal(p.courseProgress('["input","input","model","invalid",3]'),'["input","model"]');
assert.equal(p.courseProgress('invalid'),'[]');
assert.equal(p.restore('{"progress":"[1,3]"}').courseProgress,'[]');
for(const [oldPath,oldHash,path,hash] of [
 ['bulk.html','#format-guide','input.html','#rules'],['workflow.html','#rules','input.html','#rules'],['workflow.html','#build','input.html','#complete'],
 ['index.html','#chapter-4','basics.html','#node'],['index.html','#chapter-5','basics.html','#constraints'],
 ['index.html','#chapter-6','input.html','#executive'],['index.html','#chapter-8','workflow.html','#results']
]){
 const old={path:oldPath,hash:oldHash,y:1500},expected={path,hash,y:0};
 const saved=p.restore(JSON.stringify({last:old,bookmarks:[old],progress:'[1]',courseProgress:'["purpose"]'}));
 assert.deepEqual(saved.last,expected);assert.deepEqual(saved.bookmarks,[expected]);
 assert.equal(saved.progress,'[1]');assert.equal(saved.courseProgress,'["purpose"]');
}
assert.equal(p.restore('{}').textScale,1);
assert.equal(p.restore('{"textScale":99}').textScale,1);
assert.equal(p.restore('{"textScale":1.3}').textScale,1.3);
assert.equal(content.NAVIGATION.analyses.length,18);
assert.ok(!content.NAVIGATION.analyses.some(e=>e.hash==='#common'));
assert.deepEqual(content.NAVIGATION.analyses.slice(-3).map(e=>e.hash),['#model-verification','#restart','#database']);
assert.equal(content.NAVIGATION.analyses[0].hash,'#static');
assert.equal(content.titleFor({path:'analysis.html',hash:'#restart',y:0}),'リスタート');
assert.deepEqual(content.NAVIGATION.intro.map(e=>e.title),['初めての解析','入力規則','節点・スカラー点','座標','要素の向き','応力方向']);
assert.equal(content.NAVIGATION.materials.length,14);
assert.deepEqual(content.NAVIGATION.elements.map(e=>e.path+e.hash),['elements.html#scalar','elements.html#beam','elements.html#shell','elements.html#solid','elements.html#rigid','elements.html#connector','elements.html#genel']);
assert.equal(content.titleFor({path:'elements.html',hash:'#rigid',y:0}),'剛体要素（RBE2・RBE3・RBAR）');
assert.equal(content.titleFor({path:'elements.html',hash:'#beam',y:0}),'梁要素（CROD・CBAR・CBEAM）');
assert.equal(content.titleFor({path:'analysis.html',hash:'#modes',y:0}),'実固有値解析');
assert.equal(content.titleFor({path:'analysis.html',hash:'#complex-modes',y:0}),'複素固有値解析');
assert.equal(content.titleFor({path:'theory.html',hash:'#complex-modes',y:0}),'複素固有値解析の理論');
assert.equal(content.titleFor({path:'comparisons.html',hash:'#eigensolvers',y:0}),'EIGRL・EIGR・EIGC');
assert.deepEqual(content.NAVIGATION.operations.map(e=>e.path),['modeling.html','include.html','batch.html','workflow.html']);
assert.ok(!content.NAVIGATION.common.some(e=>content.NAVIGATION.operations.some(item=>item.path===e.path)));
assert.deepEqual(content.NAVIGATION.common.map(e=>e.path+e.hash),['theory.html#restart','comparisons.html#beam']);
assert.equal(content.NAVIGATION.materialTheory.length,6);
assert.equal(content.NAVIGATION.boundaryTheory.length,6);
assert.equal(content.NAVIGATION.loadTheory.length,7);
assert.equal(content.titleFor({path:'theory.html',hash:'#common-loads/inertia',y:0}),'自重・加速度・回転');
assert.equal(content.titleFor({path:'theory.html',hash:'#boundary/mpc',y:0}),'MPC・独立と従属');
assert.equal(content.titleFor({path:'theory.html',hash:'#materials/composites',y:0}),'複合材料・積層板');
assert.equal(content.titleFor({path:'comparisons.html',hash:'#beam/compare',y:0}),'棒・梁の選び方（CROD・CONROD・CBAR・CBEAM）');
assert.equal(content.titleFor({path:'comparisons.html',hash:'#rigid-interpolation',y:0}),'支持・拘束の選び方（SPC・RBE2・RBE3・MPC）');
assert.equal(content.titleFor({path:'comparisons.html',hash:'#support-or-rigid',y:0}),'支持・拘束の選び方（SPC・RBE2・RBE3・MPC）');
assert.equal(content.titleFor({path:'index.html',hash:'#first-analysis',y:0}),'初めての解析');
assert.equal(content.titleFor({path:'analysis.html',hash:'#transient/112',y:0}),'過渡応答解析');
for(const group of Object.values(content.NAVIGATION))for(const entry of group)assert(p.position({...entry,y:0}),entry.title);
assert.equal(content.COURSE.steps.length,6);assert.equal(content.COURSE.next.length,6);assert.equal(content.COURSE.reference.length,5);
assert.deepEqual(p.restore('invalid'),p.EMPTY_STATE);
assert.deepEqual(p.restore('null'),p.EMPTY_STATE);
assert.throws(()=>p.filePayload('../bad.bdf','YQ=='));
assert.throws(()=>p.filePayload('test.exe','YQ=='));
assert.throws(()=>p.filePayload('test.bdf','not base64'));
assert.equal(p.filePayload('model.bdf','YQ==').name,'model.bdf');
assert(p.position({path:'errors.html',hash:'#error-2025.0',y:0}));
assert.equal(content.titleFor({path:'errors.html',hash:'#error-2025.0',y:0}),'エラー検索と意味 · 2025.0');
assert.equal(content.titleFor({path:'bulk.html',hash:'#CASE_LOAD',y:0}),'入力データ学習 · LOAD (Case)');
assert.equal(content.titleFor({path:'bulk.html',hash:'#PARAM_WTMASS/0%3A2',y:0}),'入力データ学習 · PARAM WTMASS / 0:2');
const dest=path.join(root,'.qa/reader');fs.mkdirSync(dest,{recursive:true});
for(const l of content.LESSONS){
 const html=content.readerHTML({path:l.id,hash:l.hash,y:0},'[1,3]','test');
 assert(!html.includes('/*__BOOT__*/'));assert(!html.includes('<!--NATIVE_BOOTSTRAP-->'));
 assert(html.includes("connect-src 'none'"));assert(!/<script\s+src=/.test(html));
 fs.writeFileSync(path.join(dest,l.id),html);
}
assert(!content.readerHTML({path:'index.html',hash:'#</script><script>alert(1)</script>',y:0},'[]','test').includes('"hash":"#</script>'));
for(const [rel,f]of Object.entries(content.DOWNLOADS))assert.deepEqual(Buffer.from(f.base64,'base64'),fs.readFileSync(path.join(root,'../sites/nastran-learning/dist',rel)));
require('./check-input-catalog.cjs');
require('./check-input-native.cjs');
require('./check-analysis-structure.cjs');
require('./check-element-labs.cjs');
require('./check-connection-labs.cjs');
require('./check-damping-chapter.cjs');
require('./check-material-chapter.cjs');
require('./check-boundary-chapter.cjs');
require('./check-load-chapter.cjs');
require('./check-contact-chapter.cjs');
require('./check-topic-articles.cjs');
require('./check-content-rights.cjs').checkRights(require('../src/generated/lessons.json').pages);
require('./check-release-preflight.cjs');
console.log('PASS: routes, progress restore, outbound URLs, filename/base64 checks, all offline documents, script-safe bootstrap, exact ZIP/BAT bytes.');

async function checkLessonOTA(){
 const {createHash}=require('node:crypto');
 const {loadRelease,objectName,parseManifest,refreshRelease}=require('../src/content-ota-core.ts');
 const embedded=require('../src/generated/page-hashes.json');
 const html=require('../src/generated/lessons.json').pages;
 for(const id of p.PAGE_IDS)assert.equal(embedded[id],createHash('sha256').update(html[id],'utf8').digest('hex'));
 const manifest=pages=>parseManifest(JSON.stringify({schema:1,pages:{...embedded,...pages}}));
 const oldHash='1'.repeat(64), nextHash='2'.repeat(64), otherHash='3'.repeat(64);
 assert.equal(parseManifest(JSON.stringify({schema:1,pages:{...embedded,'index.html':'../unsafe'}})),null);
 assert.equal(objectName(nextHash),`${nextHash}.html`);
 let active=manifest({'index.html':oldHash});
 const next=manifest({'index.html':nextHash,'theory.html':otherHash});
 const cache=new Map([[oldHash,'以前の教材']]);
 const transfers=[];
 let failDownload=true;
 const store={
  read:async hash=>cache.get(hash)??null,
  fetch:async hash=>{transfers.push(hash);if(failDownload&&hash===otherHash)throw Error('offline');return hash;},
  write:async (hash,text)=>{cache.set(hash,text);},
  commit:async release=>{active=release;},
  prune:async used=>{for(const hash of cache.keys())if(!used.has(hash))cache.delete(hash);},
 };
 assert.deepEqual(await loadRelease(active,embedded,store.read),{'index.html':'以前の教材'});
 await assert.rejects(refreshRelease(active,next,embedded,store));
 assert.equal(active.pages['index.html'],oldHash);
 assert.deepEqual([...cache.keys()],[oldHash]);
 failDownload=false;
 assert.deepEqual(await refreshRelease(active,next,embedded,store),{'index.html':nextHash,'theory.html':otherHash});
 assert.equal(active,next);
 assert.deepEqual([...cache.keys()],[nextHash,otherHash]);
 transfers.length=0;
 assert.deepEqual(await refreshRelease(active,manifest({'theory.html':otherHash}),embedded,store),{'theory.html':otherHash});
 assert.deepEqual([...cache.keys()],[otherHash]);
 assert.deepEqual(transfers,[]);
 assert.deepEqual(await loadRelease(active,embedded,async()=>null),{});
 const updated=content.readerHTML({path:'theory.html',hash:'#materials',y:900},'[]','test','[]',1,html['theory.html'].replace('</body>','<p>OTA version</p></body>'));
 assert(updated.includes('<p>OTA version</p>') && updated.includes('"y":900'));
 console.log('PASS: teaching-page hashes, offline fallback, interrupted OTA, delta reuse, old-file cleanup, and reader position.');
}
checkLessonOTA().catch(error=>{console.error(error);process.exitCode=1;});
