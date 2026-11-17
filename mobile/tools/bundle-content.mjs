import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=path.resolve(root,'../sites/nastran-learning/dist');
const catalog=[
 ['comparisons.html','似たカードの使い分け','要素・拘束などの選択基準と結果への影響','共通理論','#beam'],
 ['theory.html','理論教材','解析別の理論と、材料・拘束・荷重などの共通技術','理論','#materials'],
 ['elements.html','各要素理論','ばね・梁・シェル・ソリッド・結合・剛体・GENELの仕組み・モデル化・結果の読み方','理論','#scalar'],
 ['analysis.html','解析別の学習','解析別のモデル・主要カード・結果と、モデル検証・再実行','解析','#index'],
 ['index.html','線形静解析の基礎','11章と棒の引張り実験室','基礎','#chapter-1'],
 ['modeling.html','モデル化の考え方','片持ち梁をばね・梁・立体の3モデルで比較','基礎',''],
 ['dynamics.html','動解析の入門（統合済み）','理論・解析・Inputデータへの案内','動解析',''],
 ['damping.html','減衰の種類と使い分け（統合済み）','減衰の理論への案内','動解析',''],
 ['relations.html','解析カードの相関図（統合済み）','解析タブの相関図への案内','入力',''],
 ['fracture.html','亀裂先端のモデル化（統合済み）','亀裂先端の理論への案内','静解析',''],
 ['basics.html','点・要素・支え・力','節点・物性・材料・拘束・荷重','基礎','#node'],
 ['input.html','入力規則・BDF作成','入力の役割・8文字の規則・完成BDF','入力','#executive'],
 ['bulk.html','入力データ学習','用途・全フィールド・関連入力をQRGで確認','入力',''],
 ['coordinates.html','座標と応力の符号','軸の向き・要素の表裏を図で理解','理解',''],
 ['workflow.html','実行して結果を確かめる','関連ファイルとF06の読み方','実践','#run'],
 ['errors.html','エラー検索と意味','番号・F06の文から探し、意味と確認手順を読む','実践',''],
 ['batch.html','コマンドと並列バッチ','SMP・DMP・順番実行・同時実行','実践',''],
 ['include.html','INCLUDEファイルの作成','ファイルの分割と荷重の切替え','実践',''],
].map(([id,title,description,category,hash])=>({id,title,description,category,hash}));
const course=JSON.parse(fs.readFileSync(path.join(source,'../learning-path.json'),'utf8'));
const comparisons=JSON.parse(fs.readFileSync(path.join(source,'../card-comparisons.json'),'utf8'));
const comparisonTopics=comparisons.topics.map(({key,title})=>({key,title}));
for(const [key,target] of Object.entries(comparisons.aliases||{}))comparisonTopics.push({key,title:comparisonTopics.find(topic=>topic.key===target).title});
const pages={};const hashes={};
const read=name=>{const p=path.resolve(source,name);if(!p.startsWith(source+path.sep))throw Error('Invalid asset');const bytes=fs.readFileSync(p);hashes[name]=crypto.createHash('sha256').update(bytes).digest('hex');return bytes.toString('utf8');};
const pdf='https://documentation-be.hexagon.com/bundle/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide/raw/resource/enus/MSC_Nastran_2020_Linear_Static_Analysis_User_Guide.pdf';
for(const item of catalog){
 let html=read(item.id);
 html=html.replace(/<link\b[^>]*>/g,tag=>{if(!/rel="stylesheet"/.test(tag))return tag;const name=/href="([^"]+)"/.exec(tag)?.[1];if(!name)throw Error('Missing stylesheet path');return `<style>${read(name)}</style>`;});
 html=html.replace(/<script\s+src="([^"]+)"[^>]*><\/script>/g,(_,name)=>`<script>${read(name).replace(/<\/script/gi,'<\\/script')}</script>`);
 html=html.replace('<a href="reference/linear-static-text.txt">原典全709ページの抽出テキスト</a>',`<a href="${pdf}">原典PDF（オンライン）</a>`);
 if(/<(script|link)\b[^>]*(src=|rel="stylesheet")/.test(html))throw Error('Unbundled resource '+item.id);
 const csp="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'";
 html=html.replace(/<head>/i,`<head><meta http-equiv="Content-Security-Policy" content="${csp}"><!--NATIVE_BOOTSTRAP-->`);
 html=html.replace('</head>',`<style>.print-button,body>.topbar,.workspace>.topbar,.library-heading{display:none!important}html{-webkit-text-size-adjust:100%}body{padding-bottom:16px}a,button{touch-action:manipulation}input,select,textarea{font-size:16px!important}</style></head>`);
 pages[item.id]=html;
}
const downloads={};for(const name of fs.readdirSync(path.join(source,'downloads'))){
 if(!/\.(bat|zip)$/.test(name))continue;
 const bytes=fs.readFileSync(path.join(source,'downloads',name));
 hashes['downloads/'+name]=crypto.createHash('sha256').update(bytes).digest('hex');
 downloads['downloads/'+name]={name,base64:bytes.toString('base64')};
}
const bridge=fs.readFileSync(path.join(root,'tools/reader-bridge.js'),'utf8');
createRequire(import.meta.url)('./check-content-rights.cjs').checkRights(pages);
const sha256=text=>crypto.createHash('sha256').update(text,'utf8').digest('hex');
const pageHashes=Object.fromEntries(Object.entries(pages).map(([name,html])=>[name,sha256(html)]));
fs.mkdirSync(path.join(root,'src/generated'),{recursive:true});
fs.writeFileSync(path.join(root,'src/generated/lessons.json'),JSON.stringify({catalog,course,comparisonTopics,pages,downloads,bridge}));
fs.writeFileSync(path.join(root,'src/generated/provenance.json'),JSON.stringify({source:'sites/nastran-learning/dist',sha256:hashes},null,2)+'\n');
fs.writeFileSync(path.join(root,'src/generated/page-hashes.json'),JSON.stringify(pageHashes)+'\n');
if(process.argv.includes('--ota')){
 const output=path.join(root,'.build/content-ota');
 fs.rmSync(output,{recursive:true,force:true});
 fs.mkdirSync(path.join(output,'objects'),{recursive:true});
 for(const [name,html] of Object.entries(pages)){
  fs.writeFileSync(path.join(output,'objects',pageHashes[name]+'.html'),html);
 }
 fs.writeFileSync(path.join(output,'_manifest.json'),JSON.stringify({schema:1,pages:pageHashes})+'\n');
}
console.log(`Bundled ${catalog.length} offline pages and ${Object.keys(downloads).length} downloads.`);
