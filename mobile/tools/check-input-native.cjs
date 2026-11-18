const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {INPUT_INDEX,inputGroups,searchInput,inputIndexFromHTML,isInputHome}=require('../src/input-home.ts');
const groups=inputGroups(INPUT_INDEX);
assert.deepEqual(groups.map(g=>g.key),['executive','case','parameter','bulk','comparisons']);assert.equal(INPUT_INDEX.entries.length,312);
const covered=[];
for(const g of groups.slice(0,4)){
 assert.deepEqual(g.items.map(i=>i.title),[...new Set(INPUT_INDEX.entries.filter(e=>e.family===g.key).map(e=>e.category))]);
 for(const item of g.items){
  const cards=INPUT_INDEX.entries.filter(e=>e.family===g.key&&e.category===item.title);
  assert(cards.some(c=>item.hash==='#'+c.key));covered.push(...cards.map(c=>c.key));
 }
}
assert.equal(covered.length,312);assert.equal(new Set(covered).size,312);
assert.equal(groups[4].items.length,12);
assert.equal(new Set(groups[4].items.map(i=>i.hash)).size,12);
for(const query of ['celas','ＣＥＬＡＳ',' CelAs '])assert.deepEqual(searchInput(INPUT_INDEX.entries,query).map(e=>e.key),['CELAS1','CELAS2','CELAS3','CELAS4']);
assert.equal(searchInput(INPUT_INDEX.entries,'zz_unknown_card').length,0);
assert(searchInput(INPUT_INDEX.entries,'変位').length>0);
const bundle=require('../src/generated/lessons.json');assert.deepEqual(inputIndexFromHTML(bundle.pages['bulk.html']),INPUT_INDEX);
for(const broken of [undefined,'legacy html','<script type="application/json" id="nastran-input-index">{bad}</script>','<script type="application/json" id="nastran-input-index">{"entries":[],"families":[]}</script>'])assert.equal(inputIndexFromHTML(broken),INPUT_INDEX);
const changed=JSON.parse(JSON.stringify(INPUT_INDEX));changed.entries[0].title='OTA updated entry';
assert.deepEqual(inputIndexFromHTML('<script type="application/json" id="nastran-input-index">'+JSON.stringify(changed)+'</script>'),changed);
assert(isInputHome({path:'bulk.html',hash:''}));assert(!isInputHome({path:'bulk.html',hash:'#CELAS2'}));
assert(isInputHome({path:'bulk.html',hash:'#family/executive'}));
const extra={...INPUT_INDEX,entries:[...INPUT_INDEX.entries,{...INPUT_INDEX.entries[0],key:'TEST_CATEGORY',category:'OTA新カテゴリー'}]};
assert(inputGroups(extra)[0].items.some(i=>i.title==='OTA新カテゴリー'));
assert.equal(fs.readFileSync(path.resolve(__dirname,'../src/generated/input-search.js'),'utf8'),fs.readFileSync(path.resolve(__dirname,'../../sites/nastran-learning/dist/input-search.js'),'utf8'));
console.log('PASS: shared native/web Input search, five destinations, current OTA index and legacy/corrupt fallback.');
