import bundle from './generated/lessons.json';
export type InputSearchEntry={key:string;id:string;title:string;summary:string;family:string;category:string;aliases:string[]};
export type InputIndex={entries:InputSearchEntry[];families:string[][]};
// Generated verbatim from the browser module; one search implementation.
export const {search:searchInput}=require('./generated/input-search.js') as {search:(entries:InputSearchEntry[],query:string)=>InputSearchEntry[]};
export const INPUT_INDEX:InputIndex=bundle.inputIndex;
export const INPUT_HOME=[
 {title:'Executive Control',description:'SOL・実行の制御',path:'bulk.html',hash:'#family/executive'},
 {title:'Case Control',description:'ケース・拘束・荷重・出力の選択',path:'bulk.html',hash:'#family/case'},
 {title:'パラメータ',description:'計算方法・出力などの設定',path:'bulk.html',hash:'#family/parameter'},
 {title:'Bulk Data',description:'節点・要素・材料・荷重・解析条件',path:'bulk.html',hash:'#family/bulk'},
 {title:'似たカードの使い分け',description:'長所・短所と、状況に応じた選択',path:'comparisons.html',hash:'#beam'},
];
export const isInputHome=(p:{path:string;hash:string})=>p.path==='bulk.html'&&(!p.hash||p.hash==='#input-home');
export function inputIndexFromHTML(html?:string):InputIndex{
 if(!html)return INPUT_INDEX;
 try{
  const match=/<script type="application\/json" id="nastran-input-index">([^<]*)<\/script>/.exec(html);
  if(!match)return INPUT_INDEX;
  const value=JSON.parse(match[1]) as InputIndex;
  if(!Array.isArray(value.entries)||!value.entries.length||!Array.isArray(value.families))return INPUT_INDEX;
  if(!value.entries.every(e=>['key','id','title','summary','family','category'].every(k=>typeof e[k as keyof InputSearchEntry]==='string')&&/^[A-Z0-9_]+$/.test(e.key)&&Array.isArray(e.aliases)&&e.aliases.every(a=>typeof a==='string')))return INPUT_INDEX;
  if(!value.families.every(f=>Array.isArray(f)&&f.length>=2&&f.every(v=>typeof v==='string')))return INPUT_INDEX;
  return value;
 }catch{return INPUT_INDEX;}
}
