(() => {
 'use strict';
 const entries=[...window.INPUT_CONTROLS,...window.SOL_REFERENCES,...window.INPUT_REFERENCES];
 const add=e=>entries.push(e);
 const D=window.NastranDynamics,F=window.NastranFracture,M=window.NastranDamping;
 const names={GRID:'節点座標、変位座標系、恒久拘束およびスーパーエレメント属性を定義します。',SPC1:'指定成分に同一のゼロ変位拘束を適用する節点集合を定義します。',CQUAD4:'4節点四角形シェル要素。材料・板厚は参照するプロパティで指定します。',CTRIA3:'3節点三角形シェル要素。材料・板厚は参照するプロパティで指定します。',SPCADD:'複数のSPC/SPC1セットの和集合を定義します。',FORCE:'集中荷重ベクトルをF×(N1,N2,N3)で定義します。CIDは方向ベクトルの参照座標系です。'};
 for(const c of window.BULK_CARDS){if(names[c.id])c.summary=names[c.id];c.name=({GRID:'節点定義',SPC1:'単点拘束集合',CBAR:'2節点梁要素',RBE2:'剛体要素',RBE3:'変位補間要素'})[c.id]||c.name;add({key:c.id,id:c.id,title:c.name,family:['PARAM','MDLPRM'].includes(c.id)?'parameter':'bulk',category:c.id==='PARAM'?'共通書式':c.id==='MDLPRM'?'結果出力':c.category,kind:'static',summary:c.summary,page:c.page});}
 const categories={CELAS2:'ばね・質量・減衰要素',CONM2:'ばね・質量・減衰要素',EIGRL:'固有値・周波数・時間設定',DAREA:'動荷重',RLOAD1:'動荷重',DLOAD:'動荷重',FREQ1:'固有値・周波数・時間設定',TABDMP1:'テーブル',TLOAD1:'動荷重',TABLED1:'テーブル',TSTEP:'固有値・周波数・時間設定'};
 for(const [id,c] of Object.entries(D.cards)){
  if(entries.some(e=>e.key===id))continue;
  const model=Object.values(D.models).find(m=>m.rows.some(r=>r.name===id));
  add({key:id,id,title:c.title,family:'bulk',category:categories[id],kind:'fixed',summary:c.intro,page:c.page,lines:c.lines,rows:model.rows.filter(r=>r.name===id).map(r=>r.values),reference:'dynamics.html#card-'+id});
 }
 for(const [id,c] of Object.entries(F.cards))add({key:id,id,title:c.title,family:'bulk',category:'亀裂先端要素',kind:'fixed',summary:c.intro,page:c.page,lines:c.lines,rows:F.rows.filter(r=>r.card===id).map(r=>r.values),reference:'fracture.html#crack-card-'+id});
 add({key:'CDAMP2',id:'CDAMP2',title:'粘性減衰要素',family:'bulk',category:'ばね・質量・減衰要素',kind:'fixed',summary:'2つの自由度間の速度差に比例する粘性減衰力を、係数Bで定義します。',page:1532,lines:[M.cdamp.map(([label,help])=>({label,help}))],rows:M.variants.dashpot.focusRows.filter(r=>r.name==='CDAMP2').map(r=>r.values),reference:'damping.html#damp-card-CDAMP2'});
 const params={
  POST:{page:1008,value:'1',category:'結果出力',meaning:'OP2出力に関する設定。2020 SP1で新しい結果データを扱う設定例は整数1です。読み込み先のポストプロセッサーの対応を確認します。Case Controlの結果要求も必要です。'},
  OMID:{page:1000,value:'YES',category:'結果出力',meaning:'対象となる線形シェルのF06/PUNCHの応力・ひずみ・要素力を材料座標系で出力する指定例です。OP2/XDBには作用しません。'},
  GRDPNT:{page:866,value:'0',category:'質量・単位',meaning:'Grid Point Weight Generatorによる質量・重心・慣性の計算と出力を要求します。0は基本座標系原点を基準点にする指定です。質量の定義が必要です。'},
  WTMASS:{page:1043,value:'1.',category:'質量・単位',meaning:'構造質量行列に乗じる倍率。実数で指定し、既定値は1.0です。入力モデルの単位系全体を変換する設定ではありません。'},
  ...Object.fromEntries(Object.entries(M.params).map(([k,v])=>[k,{...v,category:'減衰'}]))
 };
 for(const [id,p] of Object.entries(params)){
  const complex=id.startsWith('ALPHA');
  const fields=[['カード名','Bulk DataのPARAMカード。'],['N','パラメータ名 '+id+'。'],['V1',p.meaning],['V2',complex?'複素パラメータの虚部。この実数のRayleigh係数の例では0.を指定します。ALPHA1とALPHA2は別のPARAM行に指定します。':'この設定例では使用しません。'],...Array.from({length:5},()=>['未使用','空欄。']),['継続','この例は1行で完結します。']];
  add({key:'PARAM_'+id,id:'PARAM / '+id,title:p.category+'パラメータ',family:'parameter',category:p.category,kind:'fixed',summary:p.meaning,page:p.page,lines:[fields.map(([label,help])=>({label,help}))],rows:[['PARAM',id,p.value,...(complex?['0.']:[])]],reference:id in M.params?'damping.html#damp-card-'+id:'input.html#param'});
 }
 window.InputCatalog={entries,families:[['executive','エグゼクティブコントロール'],['case','ケースコントロール'],['parameter','パラメータ'],['bulk','バルクデータ']]};
})();
