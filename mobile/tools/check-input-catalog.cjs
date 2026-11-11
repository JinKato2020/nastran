const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=path.resolve(__dirname,'../../sites/nastran-learning/dist');
const context={window:{}};vm.createContext(context);
for(const name of ['bulk-data','field-guide-model','field-guide-properties','field-guide-constraints','dynamics-data','damping-data','fracture-data','input-controls','sol-reference','input-reference','input-catalog','public-input-cards','qrg-expansion','qrg-enrichment','case-output-reference'])vm.runInContext(fs.readFileSync(path.join(dir,name+'.js'),'utf8'),context);
const entries=context.window.InputCatalog.entries,keys=new Map(entries.map(e=>[e.key,e]));
assert.ok(entries.length>=256,'Expanded catalog missing');assert.equal(keys.size,entries.length,'Duplicate entry keys');
for(const e of entries){
 assert.ok(e.summary&&e.title&&e.category,e.key);
 assert.ok(Number.isInteger(e.page)&&e.page>=1&&e.page<=3417,e.key+' source page');
 for(const c of e.connections||[])if(c[2])assert.ok(keys.has(c[2]),e.key+' -> '+c[2]);
 if(e.kind!=='fixed')continue;
 for(const [rowIndex,row] of e.rows.entries()){
  assert.ok(row.length<=10,e.key+' too many fields');
  for(const field of row)assert.ok(String(field).length<=8&&!/[^\x20-\x7e]|,/.test(String(field)),e.key+' invalid fixed field');
  assert.equal(e.lines[rowIndex].length,10,e.key+' missing field definition');
 }
 for(const line of e.lines)for(const field of line)assert.ok(field.label&&field.help,e.key+' unexplained field');
}
assert.equal(keys.get('MATT1').lines[0][8].label,'T(GE)');
assert.equal(keys.get('MATT1').rows[0][7],'');
assert.equal(keys.get('MAT9').lines[2][8].label,'A1');
assert.equal(keys.get('MPC').rows[1][1],'');
assert.equal(keys.get('PBUSH').rows[1][2],'B');
assert.equal(keys.get('PBUSHT').rows[3][2],'KN');
assert.equal(keys.get('CHBDYG').rows[0][2],'');
require('./check-output-options.cjs')(keys);
console.log('PASS: '+entries.length+' catalog entries, unique keys, source pages, field definitions, fixed widths and related links.');
