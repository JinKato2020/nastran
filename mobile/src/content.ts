import bundle from './generated/lessons.json';
import type { Position } from './protocol';
export const LESSONS = bundle.catalog;
export const COURSE = bundle.course;
export const DOWNLOADS: Record<string,{name:string;base64:string}> = bundle.downloads;
const pages: Record<string,string> = bundle.pages;
export const CHAPTERS = ['学ぶ順序','線形静解析の考え方','単位をそろえる','節点・要素・材料','拘束と荷重','入力ファイルの構成','棒1本の引張り','結果を確かめる','条件を変える演習','つまずいたとき','原典と次の学習'];
export function titleFor(p:Position):string {
  const chapter=p.path==='index.html'?/^#chapter-(\d+)$/.exec(p.hash):null;
  if(chapter&&CHAPTERS[Number(chapter[1])-1])return `${chapter[1]}. ${CHAPTERS[Number(chapter[1])-1]}`;
  const title=LESSONS.find(l=>l.id===p.path)?.title||'Nastran学習';
  if(p.path==='errors.html'){const m=/^#error-([\d.]+)(?:-p\d+)?$/.exec(p.hash);if(m)return title+' · '+m[1];}
  if(p.path==='relations.html'&&/^#sol-(101|103|111|112)$/.test(p.hash))return title+' · SOL '+p.hash.slice(5);
  if(p.path==='modeling.html'){const m=/^#model-(?:input-)?(simple|standard|detailed)$/.exec(p.hash);if(m)return title+' · '+({simple:'簡易',standard:'標準',detailed:'詳細'}[m[1] as 'simple'|'standard'|'detailed']);}
  if(p.path==='damping.html'){const c=/^#damp-(?:card|field)-(CDAMP2|G|W3|W4|KDAMP|ALPHA1|ALPHA2)/.exec(p.hash);if(c)return title+' · '+c[1];}
  if(p.path==='fracture.html'){const c=/^#crack-(?:card|field)-(ADUM8|CRAC2D|PRAC2D)/.exec(p.hash);if(c)return title+' · '+c[1];}
  if(p.path==='dynamics.html'){
    const sol=/^#input-(103|111|112)$/.exec(p.hash);
    if(sol)return title+' · SOL '+sol[1];
    const field=/^#(?:card|field)-([A-Z0-9]+)(?:-(\d+)-(\d+))?$/.exec(p.hash);
    if(field)return title+' · '+field[1]+(field[3]!==undefined?' 第'+(Number(field[3])+1)+'欄':'');
  }
  if(p.path==='bulk.html'&&p.hash){try{return title+' · '+decodeURIComponent(p.hash.slice(1));}catch{return title;}}
  return p.hash==='#lab'?'棒の引張り実験室':title;
}
export function readerHTML(p:Position, progress:string, session:string, courseProgress='[]'):string {
  if(!pages[p.path])throw new Error('教材が見つかりません。');
  const boot=JSON.stringify({...p,progress,courseProgress,session,downloads:Object.keys(DOWNLOADS)}).replace(/</g,'\\u003c');
  const script=bundle.bridge.replace('/*__BOOT__*/',()=>boot).replace(/<\/script/gi,'<\\/script');
  return pages[p.path].replace('<!--NATIVE_BOOTSTRAP-->',()=>'<script>'+script+'</script>');
}
