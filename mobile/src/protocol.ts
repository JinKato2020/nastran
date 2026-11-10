export type Position = { path: string; hash: string; y: number };
export type SavedState = { version: 1; progress: string; courseProgress: string; last: Position | null; bookmarks: Position[] };
export const PAGE_IDS = ['index.html','basics.html','input.html','bulk.html','coordinates.html','workflow.html','batch.html','include.html','dynamics.html','relations.html','fracture.html','damping.html','modeling.html','errors.html'] as const;
export const EMPTY_STATE: SavedState = { version: 1, progress: '[]', courseProgress:'[]', last: null, bookmarks: [] };
export function courseProgress(value: unknown): string {
  try {const rows=JSON.parse(String(value));const valid=['purpose','model','input','example','results','practice'];return JSON.stringify(Array.isArray(rows)?[...new Set(rows.filter(k=>valid.includes(k)))]:[]);}catch{return '[]';}
}
export function position(value: unknown): Position | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (!PAGE_IDS.some(p => p === v.path)) return null;
  if (typeof v.hash !== 'string' || (v.hash !== '' && !v.hash.startsWith('#')) || v.hash.length > 500 || /[\x00-\x1f]/.test(v.hash)) return null;
  const moved:Record<string,[string,string]>={'bulk.html#format-guide':['input.html','#rules'],'workflow.html#rules':['input.html','#rules'],'workflow.html#build':['input.html','#complete'],'index.html#chapter-4':['basics.html','#node'],'index.html#chapter-5':['basics.html','#constraints'],'index.html#chapter-6':['input.html','#executive'],'index.html#chapter-8':['workflow.html','#results']};
  const target=moved[String(v.path)+v.hash];
  return { path: target?.[0]||v.path as string, hash:target?.[1]||v.hash, y:target?0:typeof v.y === 'number' && Number.isFinite(v.y) ? Math.min(1e7, Math.max(0, v.y)) : 0 };
}
export function progress(value: unknown): string {
  try { const rows = JSON.parse(String(value)); return JSON.stringify(Array.isArray(rows) ? [...new Set(rows.filter(n => Number.isInteger(n) && n >= 1 && n <= 11))].sort((a,b)=>a-b) : []); } catch { return '[]'; }
}
export function restore(raw: string | null): SavedState {
  try { const v = JSON.parse(raw || '{}'); return { version:1, progress:progress(v.progress), courseProgress:courseProgress(v.courseProgress), last:position(v.last), bookmarks:Array.isArray(v.bookmarks) ? v.bookmarks.map(position).filter((p:Position|null):p is Position=>!!p).slice(0,100) : [] }; } catch { return {...EMPTY_STATE}; }
}
export function filePayload(name: unknown, base64: unknown): { name:string; base64:string; zip:boolean } {
  if (typeof name !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_. -]{0,100}\.(bdf|dat|inc|bat|zip|txt)$/i.test(name) || name.includes('..')) throw new Error('保存するファイル名を確認できません。');
  if (typeof base64 !== 'string' || !base64 || base64.length > 4*1024*1024 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(base64)) throw new Error('保存する内容を確認できません。');
  return {name,base64,zip:name.toLowerCase().endsWith('.zip')};
}
export function externalURL(value: unknown): string | null {
  try { if(typeof value!=='string'||value.length>3000)return null; const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname!=='nastran.invalid'?u.href:null; } catch {return null;}
}
export function samePlace(a: Position|null,b:Position|null): boolean { return !!a&&!!b&&a.path===b.path&&a.hash===b.hash; }
