// Independent QRG Describer checklist: prevents a short table from silently
// replacing the complete explanation while the catalog count remains unchanged.
const assert=require('node:assert/strict');
module.exports=keys=>{
 const target=['ALL','n','NONE'],channels=['PRINT','PUNCH','PLOT'],sort=['SORT1','SORT2'],complex=['REAL','IMAG','PHASE'];
 const random=['PSDF','ATOC','CRMS','RALL','RPRINT','NORPRINT','RPUNCH'];
 const vector=[...target,...channels,...sort,...complex,...random,'CID'];
 const recovery=['CENTER','CORNER','BILIN','SGAGE','CUBIC'];
 const force=[...target,...channels,...sort,...complex,...random,...recovery];
 const energy=[...target,...channels,'AVERAGE','AMPLITUDE','PEAK','THRESH=p','NOPERCENT'];
 const expected={
  DISPLACEMENT:[...vector,'TM=f','T1=f','T2=f','T3=f','RM=f','R1=f','R2=f','R3=f','CONNECTOR=ALL','CONNECTOR=m','STRUCTURE','FLUID','BOTH','NONE（連成形式）'],
  ACCELERATION:vector,VELOCITY:vector,SPCFORCES:[...vector,'NOZPRINT'],MPCFORCES:vector,OLOAD:vector,
  FORCE:force,STRESS:[...force,'VONMISES','MAXS','SHEAR'],STRAIN:[...force,'VONMISES','MAXS','SHEAR','STRCUR','FIBER'],
  GPFORCE:['ALL','n',...channels],FLUX:[...target,...channels],THERMAL:[...target,...channels,...sort],EKE:energy,ESE:energy,
  ECHO:['SORT','UNSORT','BOTH','NONE','SORT(cdni,...)','EXCEPT','PUNCH','PUNCH(SORT)','PUNCH(BOTH)','PUNCH(NEWBULK)','FILE']
 };
 for(const [name,options]of Object.entries(expected)){
  const e=keys.get('CASE_'+name);assert.ok(e,'Missing '+name);
  const terms=Array.from(e.terms,t=>t[0]);
  assert.deepEqual(terms.slice().sort(),options.slice().sort(),name+' QRG options');
  assert.deepEqual(Array.from(e.optionGroups).flatMap(g=>Array.from(g.options)).sort(),options.slice().sort(),name+' visible option groups');
  for(const term of e.terms)assert.ok(term[1].length>20,name+' missing explanation '+term[0]);
  assert.ok(e.exampleNote&&e.sourcePages.length&&e.outputs.length&&e.connections.length,name+' missing context');
  assert.ok(!/\|/.test(e.example),name+' illustrative syntax must not become copyable input');
 }
 assert.ok(keys.get('CASE_DISPLACEMENT').sourcePages.includes(338));
 assert.ok(keys.get('CASE_THERMAL').sourcePages.includes(659));
 assert.ok(keys.get('CASE_ACCELERATION').sourcePages.includes(249));
 console.log('PASS: all QRG options for 15 Case Control requests, unique grouping, examples and sources.');
};
