/* Relationships of the actual teaching examples. Solid arrows are ID references, not execution order. */
(() => {
 'use strict';
 const node=(key,title,ids,role,kind='bulk',help='',card=title)=>({key,title,ids,role,kind,help,card});
 const edge=(from,to,label,dashed=false)=>({from,to,label,dashed});
 const panel=(title,note,layers,nodes,edges)=>({title,note,layers,nodes,edges});
 const c=(key,title,role,help)=>node(key,title,[],role,'case',help,'');
 const grid=n=>node('grid'+n,'GRID',['ID = '+n],n===1?'節点1':'節点2','bulk','節点の番号です。矢印の先は、この場所にある同じ点を表します。同じGRIDを複数の図に再掲しても、節点が増えるわけではありません。');
 const constraint=()=>panel('拘束を選ぶ','X以外の動きを止める。', [['spc'],['spc1'],['grid1']], [c('spc','SPC = 10','拘束セットを選択','Case ControlでSPC1のSID=10を選びます。'),node('spc1','SPC1',['SID = 10','C = 23456 / G1 = 1'],'止める方向と節点','bulk','2・3方向の並進と4・5・6方向の回転を止め、X方向の1だけを残します。同じSIDでもG1は節点の番号です。'),grid(1)], [edge('spc','spc1','10 = SID'),edge('spc1','grid1','G1 = ID = 1')]);
 const method=()=>panel('モードを求める条件','METHODはEIGRLの番号を選ぶ。', [['method'],['eigrl']], [c('method','METHOD = 30','固有値計算の条件を選択','使う固有値計算の条件を番号で選びます。111・112でもこの条件からモードを計算します。'),node('eigrl','EIGRL',['SID = 30 / ND = 1','V1 = 0. / V2 = 100.'],'固有モードを1個探す','bulk','この1自由度模型は1モードで全体を表します。0〜100 Hzで1個を求める条件です。実構造も常に1個で足りるという意味ではありません。')], [edge('method','eigrl','30 = SID')]);
 const model=()=>panel('ばねと質量を節点へつなぐ','G2=0は固定側。GRID 0は作らない。', [['spring','mass'],['grid1']], [node('spring','CELAS2',['EID = 100 / K = 100.','G1 = 1 / C1 = 1','G2 = 0 / C2 = 0'],'X方向のばね','bulk','G1でGRID 1を参照し、C1=1でそのX方向にばねを効かせます。G2=0は固定側です。EID=100は要素自身の名前で、節点番号ではありません。'),node('mass','CONM2',['EID = 200 / G = 1','M = 0.01'],'節点1の集中質量','bulk','G=1でGRID 1へ質量を付けます。単位N・mm・sではM=0.01 tonneで10 kgです。'),grid(1)], [edge('spring','grid1','G1 = 1'),edge('mass','grid1','G = 1')]);
 const damping=()=>panel('モードの減衰を選ぶ','実線は番号、破線は減衰の扱い。', [['sdamping','kdamp'],['tabdmp']], [c('sdamping','SDAMPING = 70','減衰表を選択','TABDMP1のTID=70を選びます。読む基準は固有モードの振動数で、加振周波数を並べるFREQ1とは違います。'),node('kdamp','PARAM',['KDAMP = 1'],'粘性モード減衰にする','param','KDAMP=1はTABDMP1のモード減衰を粘性減衰として扱う設定です。1は表番号ではありません。'),node('tabdmp','TABDMP1',['TID = 70 / TYPE = CRIT','(0., .02) → (100., .02)'],'全モードで減衰比2%','bulk','CRITの0.02は臨界減衰に対する2%です。表の2点を同じ値にして、この例のモードへ2%を与えます。')], [edge('sdamping','tabdmp','70 = TID'),edge('kdamp','tabdmp','扱いを指定',true)]);
 const frequency=()=>panel('応答を求める周波数','EIGRLの探索範囲とは別。', [['frequency'],['freq1']], [c('frequency','FREQUENCY = 60','計算周波数を選択','FREQ1のSID=60を選びます。この周波数ごとに定常応答を計算します。'),node('freq1','FREQ1',['SID = 60 / F1 = 0.','DF = 0.1 / NDF = 400'],'0〜40 Hz、401点','bulk','最初の0 Hzを含めて401点です。0.1 Hzを400回足すと40 Hzになります。')], [edge('frequency','freq1','60 = SID')]);
 const timestep=()=>panel('時間を何秒ずつ進めるか','時間波形の表とは別。', [['tstepcase'],['tstep']], [c('tstepcase','TSTEP = 90','時間刻みを選択','BulkのTSTEPカードのSID=90を選ぶCase Controlです。'),node('tstep','TSTEP',['SID = 90 / N1 = 2000','DT1 = .0005 / NO1 = 1'],'0.0005秒刻みで1秒まで','bulk','2000回×0.0005秒=1秒です。NO1=1は毎ステップ結果を出す指定で、時間刻みを変えるものではありません。')], [edge('tstepcase','tstep','90 = SID')]);
 const load=sol=>{
  const transient=sol==='112',title=transient?'TLOAD1':'RLOAD1';
  const nodes=[c('dloadcase','DLOAD = 50','動荷重セットを選択','Case ControlはBulkのDLOADカードのSID=50を呼び出します。同じDLOADという文字でも区画と役割が違います。'),node('dload','DLOAD',['SID = 50 / L1 = 40','S = 1.0 / S1 = 1.0'],'動荷重40を1倍で使う','bulk','L1=40がRLOAD1またはTLOAD1のSIDを参照します。SID=50はこの組合せセット自身の番号です。'),node('load',title,transient?['SID = 40 / EXCITEID = 20','TID/F = 80 / TYPE = LOAD']:['SID = 40 / EXCITEID = 20','TC/RC = 1.0 / TYPE = LOAD'],transient?'力の時間変化を指定':'力の周波数変化を指定','bulk',transient?'EXCITEID=20で荷重の場所と倍率を選び、整数80でTABLED1の時間波形を選びます。この2つは別の参照です。':'EXCITEID=20はDAREAの番号。TC/RCの1.0は実数の定数1で、表番号1ではありません。今回TABLED1への矢印はありません。'),node('darea','DAREA',['SID = 20 / P1 = 1','C1 = 1 / A1 = 100.'],'節点1・X方向・100 N','bulk','P1=1で荷重点を選び、C1=1でX方向を選びます。この例は時間・周波数の関数を無次元としたのでA1は100 Nです。'),grid(1)];
  const edges=[edge('dloadcase','dload','50 = SID'),edge('dload','load','L1 = SID = 40'),edge('load','darea','EXCITEID → 20'),edge('darea','grid1','P1 = ID = 1')];
  if(transient){nodes.push(node('tabled','TABLED1',['TID = 80','t : 0 → .02 → .04 → 1','倍率 : 0 → 1 → 0 → 0'],'力の時間波形','bulk','整数80で呼び出される時間波形です。点を直線で結び、DAREAの100 Nにこの倍率を掛けます。最後の2点を0にするので、後方へ外挿しても力は0です。'));edges.push(edge('load','tabled','TID/F → 80'));}
  return panel('動荷重を節点までたどる',transient?'場所と時間波形へ、2本に枝分かれ。':'場所の指定と、周波数変化の指定。',[['dloadcase'],['dload'],['load'],transient?['darea','tabled']:['darea'],['grid1']],nodes,edges);
 };
 const statics=[
  panel('拘束セットの2行を読む','同じSIDの2行を、まとめて選ぶ。',[['spc'],['spcA','spcB'],['grid1','grid2']],[c('spc','SPC = 10','拘束セットを選択','同じSID=10を持つSPC1の2行を使います。2行目で1行目を上書きする意味ではありません。'),node('spcA','SPC1',['SID = 10 / G1 = 1','C = 123456'],'節点1を完全に固定','bulk','1つ目のSPC1行です。節点1の全6自由度を止めます。'),node('spcB','SPC1',['SID = 10 / G1 = 2','C = 23456'],'節点2はX方向だけ自由','bulk','2つ目のSPC1行です。節点2のX方向以外を止めます。'),grid(1),grid(2)],[edge('spc','spcA','10 = SID'),edge('spc','spcB','10 = SID'),edge('spcA','grid1','G1 = 1'),edge('spcB','grid2','G1 = 2')]),
  panel('力をかける節点を選ぶ','この基本例にBulkのLOADは不要。',[['loadcase'],['force'],['grid2']],[c('loadcase','LOAD = 20','静荷重セットを選択','この例ではFORCEのSID=20を直接選びます。BulkのLOADカードを間に作る必要はありません。'),node('force','FORCE',['SID = 20 / G = 2','F = 1000. / CID = 0','N1,N2,N3 = 1.,0.,0.'],'節点2の＋Xへ1000 N','bulk','G=2で節点2を選びます。方向はCID=0の基本座標で(1,0,0)。Fと方向ベクトルを掛けた集中荷重です。'),grid(2)],[edge('loadcase','force','20 = SID'),edge('force','grid2','G = ID = 2')]),
  panel('棒の断面と材料を選ぶ','PIDとMIDは役割が違う番号。',[['rod'],['prod'],['mat']],[node('rod','CROD',['EID = 100 / PID = 200'],'棒要素','bulk','EIDはこの要素の番号。PIDは使用する断面プロパティの番号で、PRODへつながります。'),node('prod','PROD',['PID = 200 / MID = 300','A = 100.'],'断面積100 mm²','bulk','PID=200はこの断面定義の番号です。MID=300からMAT1の材料を参照します。'),node('mat','MAT1',['MID = 300 / E = 210000.','NU = 0.3'],'材料の硬さと性質','bulk','MID=300を使うPRODへ、この材料のE=210000 MPaなどを与えます。')],[edge('rod','prod','PID = 200'),edge('prod','mat','MID = 300')]),
  panel('棒の両端を節点へつなぐ','上のCRODと同じ要素を再掲。',[['rod'],['grid1','grid2']],[node('rod','CROD',['EID = 100','G1 = 1 / G2 = 2'],'2つの節点を結ぶ棒','bulk','G1とG2は棒の両端のGRIDのIDです。要素をもう1本追加しているのではなく、同じCRODの接続先を拡大して見せています。'),grid(1),grid(2)],[edge('rod','grid1','G1 = 1'),edge('rod','grid2','G2 = 2')])
 ];
 const maps={
  '101':{title:'線形静解析',subtitle:'棒をゆっくり引っ張る · 1000 Nの基本ケース',panels:statics,input:'input.html#complete',notes:['LOAD = 20はFORCE SID=20を直接選びます。','図のGRID 1・2やCRODの再掲は、同じデータです。','入力教材の任意のSUBCASE 2は、LOAD=21 → FORCE SID=21（2000 N）へ切り替わります。'],settings:['Executive：SOL 101 → CEND','Caseの結果要求：DISPLACEMENT / SPCFORCES / FORCE / STRESS = ALL','PARAM POST=1は入力教材の任意設定。OP2の出力方式を指定します。','CaseのFORCE = ALLは要素力の出力要求。BulkのFORCEは加える荷重です。']},
  '103':{title:'実固有値解析',subtitle:'ばねとおもりの、揺れやすい速さと形',panels:[method(),constraint(),model()],input:'dynamics.html#input-103',notes:['この解析に外力・減衰・FREQ1・TSTEPは入れません。','EIGRLの1モード指定は、この1自由度模型の条件です。','約15.9155 Hzが手計算の比較値。モードの表示変位は実際の応答振幅ではありません。'],settings:['Executive：SOL 103 → CEND','Caseの結果要求：DISPLACEMENT = ALL（固有モードの形）','PARAM POST=-1はOP2の出力方式を指定。番号でカードを選ぶ命令ではありません。']},
  '111':{title:'モード周波数応答',subtitle:'押すリズムを変えて、振幅と位相を比べる',panels:[load('111'),method(),frequency(),damping(),constraint(),model()],input:'dynamics.html#input-111',notes:['RLOAD1の1.0は定数です。整数1なら表番号になり、意味が変わります。','FREQ1は加振周波数、EIGRLはモードの探索範囲、TABDMP1はモードの減衰です。','METHODの条件からモードも計算するため、SOL 103の結果ファイルを渡す矢印はありません。'],settings:['Executive：SOL 111 → CEND','Caseの結果要求：DISPLACEMENT / VELOCITY / ACCELERATION (SORT1,PHASE) = ALL','PARAM POST=-1でOP2出力、KDAMP=1で粘性モード減衰を指定。','荷重：DLOADの1×1、DAREAの100 N、RLOAD1の実数定数1を掛けて100 N。']},
  '112':{title:'モード過渡応答',subtitle:'一度押した後の動きを、時刻ごとに追う',panels:[load('112'),method(),timestep(),damping(),constraint(),model()],input:'dynamics.html#input-112',notes:['TLOAD1は、EXCITEIDで場所、整数TID/Fで時間波形を別々に選びます。','TABLED1の時間波形と、TSTEPの計算刻みは別の指定です。','METHODの条件からモードも計算します。初期変位・初期速度は0の例です。'],settings:['Executive：SOL 112 → CEND','Caseの結果要求：DISPLACEMENT / VELOCITY / ACCELERATION (SORT1) = ALL','PARAM POST=-1でOP2出力、KDAMP=1で粘性モード減衰を指定。','荷重：100 N×TABLED1の倍率。0.02秒で100 N、0.04秒以降は0 N。']}
 };
 const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const colors={case:['#e8efff','#3658b6'],bulk:['#ffffff','#526d8c'],param:['#f4edfc','#8156a7'],ground:['#edf4f0','#5e8175']};
 function wrap(s,max){const out=[];let line='',count=0;for(const ch of s){const n=/[\x20-\x7e]/.test(ch)?.58:1;if(count+n>max){out.push(line);line='';count=0;}line+=ch;count+=n;}if(line)out.push(line);return out;}
 function codeLines(s,max){const width=t=>[...t].reduce((v,c)=>v+(/[\x20-\x7e]/.test(c)?.58:1),0),lines=[];for(const piece of s.split(' / ')){let line='';for(const word of piece.split(' ')){const next=line?line+' '+word:word;if(line&&width(next)>max){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);}return lines;}
 function svgText(x,y,text,size=14,color='#415b7c',weight=400,anchor='start'){return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${escape(text)}</text>`;}
 function render(sol,width=1000,interactive=true){
  const map=maps[sol];if(!map)throw Error('Unknown SOL');width=Math.max(280,Math.round(width));const columns=width>=850?2:1,outer=14,gap=18,pw=(width-outer*2-gap*(columns-1))/columns;
  const titleSize=width<420?22:28,headLines=wrap('SOL '+sol+' · '+map.title,(width-28)/titleSize),headExtra=(headLines.length-1)*30;
  let body='';const layouts=[],columnY=Array(columns).fill(138+headExtra);
  map.panels.forEach((p,i)=>{const column=columnY.indexOf(Math.min(...columnY)),px=outer+column*(pw+gap),y=columnY[column];
   const titleLines=wrap(`${i+1}. ${p.title}`,Math.floor((pw-30)/17)),noteLines=wrap(p.note,Math.floor((pw-30)/12)),header=34+titleLines.length*23+noteLines.length*18;
   const positions={};let cy=y+header;
   p.layers.forEach(layer=>{const count=layer.length,nodeGap=18,w=(pw-34-nodeGap*(count-1))/count;let rowHeight=0;
    layer.forEach((key,k)=>{const n=p.nodes.find(n=>n.key===key),titleSize=w<150?15:18,titles=wrap(n.title,(w-20)/titleSize),ids=n.ids.flatMap(id=>codeLines(id,(w-20)/12)),roles=wrap(n.role,(w-20)/12);const nodeHeight=40+titles.length*23+ids.length*16+roles.length*17;positions[key]={x:px+17+k*(w+nodeGap),y:cy,w,h:nodeHeight,titles,ids,roles,titleSize};rowHeight=Math.max(rowHeight,nodeHeight);});
    layer.forEach(key=>positions[key].h=rowHeight);cy+=rowHeight+58;
   });
   const panelHeight=cy-y-34;columnY[column]=y+panelHeight+gap;layouts.push({x:px,y,h:panelHeight});body+=`<g data-panel="${i}"><rect x="${px}" y="${y}" width="${pw}" height="${panelHeight}" rx="12" fill="#f6f8fc" stroke="#d7e1ee"/>`;
   titleLines.forEach((line,j)=>body+=svgText(px+16,y+30+j*23,line,17,'#24446b',600));
   noteLines.forEach((line,j)=>body+=svgText(px+16,y+34+titleLines.length*23+j*18,line,12,'#627c99'));
   for(const e of p.edges){const a=positions[e.from],b=positions[e.to],x1=a.x+a.w/2,x2=b.x+b.w/2,y1=a.y+a.h,y2=b.y,mid=(y1+y2)/2;
    // A slight lane offset keeps the two outgoing spring references distinct.
    const offset=p.edges.filter(z=>z.from===e.from).length>1?(x2<x1?-a.w*.22:a.w*.22):0;
    body+=`<g data-edge="${i}:${e.from}:${e.to}" class="rel-edge"><path d="M${x1+offset} ${y1}V${mid}H${x2}V${y2-5}" stroke="${e.dashed?'#9663b6':'#7192b6'}" stroke-width="1.7" fill="none" ${e.dashed?'stroke-dasharray="5 4"':''} marker-end="url(#rel-arrow-${sol})"/>`;
    const multiple=p.edges.filter(z=>z.to===e.to).length>1,lx=multiple?x1:x2,ly=multiple?mid-7:y2-19,labelWidth=Math.min(pw-15,e.label.length*6.2+14);body+=`<rect x="${lx-labelWidth/2}" y="${ly-12}" width="${labelWidth}" height="18" rx="4" fill="#f6f8fc"/>`+svgText(lx,ly,e.label,11,e.dashed?'#8156a7':'#46688f',500,'middle')+'</g>';
   }
   for(const n of p.nodes){const pos=positions[n.key],paint=colors[n.kind],kind={case:'Case Control',bulk:'Bulk Data',param:'Bulk · 設定',ground:'模型の基準'}[n.kind];const a=interactive?`role="button" tabindex="0" data-rel-node="${i}:${n.key}" aria-label="${escape(n.title+' '+n.ids.join(' ')+'。説明を開く')}"`:'';
    body+=`<g ${a} class="rel-node"><title>${escape(n.title+' — '+n.role)}</title><rect x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" rx="8" fill="${paint[0]}" stroke="${paint[1]}" stroke-width="1.3"/>`;
    body+=svgText(pos.x+10,pos.y+17,kind,10,paint[1]);let yy=pos.y+40;
    for(const title of pos.titles){body+=svgText(pos.x+10,yy,title,pos.titleSize,paint[1],650);yy+=23;}
    for(const id of pos.ids){body+=svgText(pos.x+10,yy,id,12,'#3e5a7b');yy+=16;}
    yy+=4;for(const role of pos.roles){body+=svgText(pos.x+10,yy,role,12,'#5e7590');yy+=17;}
    body+='</g>';
   }body+='</g>';
  });
  const bottom=Math.max(...layouts.map(l=>l.y+l.h))+30;
  let footer='',fy=bottom;
  for(const line of wrap('実線：番号で参照する先 ／ 破線：設定として作用',Math.floor((width-28)/12))){footer+=svgText(outer,fy,line,12,'#516d8f');fy+=19;}fy+=8;
  for(const line of wrap('図は教材の固定例。カードの再掲は同じデータ。矢印はファイルの記述順や力の伝わる向きではありません。',Math.floor((width-28)/12))){footer+=svgText(outer,fy,line,12,'#6b7f97');fy+=19;}
  const settingsTop=fy+15;let settingsY=settingsTop+28,settings=svgText(outer+14,settingsY,'番号の参照とは別の設定・出力要求',width<420?13:16,'#71518f',600);settingsY+=29;
  for(const entry of map.settings){for(const line of wrap(entry,Math.floor((width-56)/12))){settings+=svgText(outer+14,settingsY,line,12,'#5f5274');settingsY+=19;}settingsY+=9;}
  footer+=`<rect x="${outer}" y="${settingsTop}" width="${width-28}" height="${settingsY-settingsTop+9}" rx="9" fill="#f5f0fa"/>`+settings;
  const height=settingsY+28;return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" class="relations-svg" role="group" aria-label="SOL ${sol} ${map.title}のカード相関図" style="font-family:'Yu Gothic UI','Meiryo',sans-serif"><defs><marker id="rel-arrow-${sol}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#7192b6"/></marker></defs><rect width="100%" height="100%" fill="#fff"/>${headLines.map((line,i)=>svgText(outer,31+i*30,line,titleSize,'#203e66',650)).join('')}${svgText(outer,59+headExtra,'解析カードの相関図',15,'#7185a1')}<rect x="${outer}" y="${78+headExtra}" width="${width-28}" height="40" rx="7" fill="#203e66"/>${svgText(outer+12,104+headExtra,'Executive：SOL '+sol+'　→　CEND',width<420?14:17,'#fff',500)}${body}${footer}</svg>`;
 }
 window.NastranRelations={maps,render};
})();
