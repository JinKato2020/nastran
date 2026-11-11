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
assert.equal(content.NAVIGATION.analyses.length,15);
assert.equal(content.NAVIGATION.analyses[0].hash,'#common');
assert.equal(content.titleFor({path:'analysis.html',hash:'#common/run',y:0}),'共通');
assert.deepEqual(content.NAVIGATION.intro.map(e=>e.title),['初めての解析','入力規則','応力方向','座標']);
assert.equal(content.NAVIGATION.materials.length,14);
assert.ok(content.NAVIGATION.common.some(e=>e.path==='batch.html'));
assert.ok(content.NAVIGATION.common.some(e=>e.hash==='#boundary'));
assert.ok(content.NAVIGATION.common.some(e=>e.hash==='#damping'));
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
require('./check-release-preflight.cjs');
console.log('PASS: routes, progress restore, outbound URLs, filename/base64 checks, all offline documents, script-safe bootstrap, exact ZIP/BAT bytes.');
