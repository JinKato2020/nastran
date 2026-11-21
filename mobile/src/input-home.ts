import bundle from './generated/lessons.json';
export type InputSearchEntry={key:string;id:string;title:string;summary:string;family:string;category:string;aliases:string[]};
type ComparisonEntry={key:string;title:string;summary:string};
type InputChapter={key:string;title:string;description:string};
export type InputIndex={entries:InputSearchEntry[];families:string[][];comparisons?:ComparisonEntry[];chapters?:InputChapter[]};
type InputGroup={key:string;title:string;description:string;items:{title:string;description:string;path:string;hash:string}[]};
// Generated verbatim from the browser module; one search implementation.
const inputUI=require('./generated/input-search.js') as {search:(entries:InputSearchEntry[],query:string)=>InputSearchEntry[];groups:(entries:InputSearchEntry[],comparisons:ComparisonEntry[],chapters:InputChapter[])=>InputGroup[]};
export const searchInput=inputUI.search;
export const INPUT_INDEX:InputIndex=bundle.inputIndex;
export const inputGroups=(index:InputIndex)=>inputUI.groups(index.entries,index.comparisons??INPUT_INDEX.comparisons??[],index.chapters??bundle.course.inputChapters);
export const isInputHome=(p:{path:string;hash:string})=>p.path==='bulk.html'&&(!p.hash||p.hash==='#input-home'||/^#family\/[\w-]+$/.test(p.hash));
export function inputIndexFromHTML(html?:string):InputIndex{
 if(!html)return INPUT_INDEX;
 try{
  const match=/<script type="application\/json" id="nastran-input-index">([^<]*)<\/script>/.exec(html);
  if(!match)return INPUT_INDEX;
  const value=JSON.parse(match[1]) as InputIndex;
  if(!Array.isArray(value.entries)||!Array.isArray(value.families)||(!value.entries.length&&value.chapters===undefined))return INPUT_INDEX;
  if(value.chapters!==undefined&&(!Array.isArray(value.chapters)||!value.chapters.every(c=>c&&typeof c.key==='string'&&/^[\w-]+$/.test(c.key)&&typeof c.title==='string'&&typeof c.description==='string')||new Set(value.chapters.map(c=>c.key)).size!==value.chapters.length))return INPUT_INDEX;
  if(!value.entries.every(e=>['key','id','title','summary','family','category'].every(k=>typeof e[k as keyof InputSearchEntry]==='string')&&/^[A-Z0-9_]+$/.test(e.key)&&Array.isArray(e.aliases)&&e.aliases.every(a=>typeof a==='string')))return INPUT_INDEX;
  if(!value.families.every(f=>Array.isArray(f)&&f.length>=2&&f.every(v=>typeof v==='string')))return INPUT_INDEX;
  if(value.comparisons&&!Array.isArray(value.comparisons))return INPUT_INDEX;
  if(value.comparisons&&!value.comparisons.every(c=>typeof c.key==='string'&&/^[a-z0-9-]+$/.test(c.key)&&typeof c.title==='string'&&typeof c.summary==='string'))return INPUT_INDEX;
  return value;
 }catch{return INPUT_INDEX;}
}
