import {useState} from 'react';
import {Image,Pressable,StyleSheet,Text,useWindowDimensions,View} from 'react-native';
import {HOME_DESIGNS,PALETTES,type HomeDesign,type Palette} from './appearance';
import {NAVIGATION,titleFor} from './content';
import type {Position,SavedState} from './protocol';
import {UiIcon,type IconName} from './ui-icon';

const hero=require('../assets/home/mesh-hero.jpg');
type Item={title:string;description:string;path:string;hash:string};
export const HOME_BASICS=[...NAVIGATION.intro,NAVIGATION.homeResources[0]];
const FEATURED=HOME_BASICS.filter(x=>['#first-analysis','#rules','#systems','#signs'].includes(x.hash));
const EXTRAS=HOME_BASICS.filter(x=>!FEATURED.includes(x));
const icons:Record<string,IconName>={'#first-analysis':'route','#rules':'braces','#points':'points','#systems':'axes','#elements':'orientation','#signs':'move','#file-structure':'files','modeling.html':'boxes','include.html':'folders','batch.html':'cpu','workflow.html':'results'};
const shortDescriptions:Record<string,string>={'#first-analysis':'6つのステップ','#rules':'8文字と入力の構造','#systems':'位置・変位・荷重の軸','#signs':'曲げ・ねじり・符号'};
export type HomeUI={section:'basics'|'work'|'saved';allBasics:boolean;workOpen:boolean;bookmarksOpen:boolean;allBookmarks:boolean};
export const INITIAL_HOME_UI:HomeUI={section:'basics',allBasics:false,workOpen:false,bookmarksOpen:false,allBookmarks:false};
type Props={design:HomeDesign;saved:SavedState;ui:HomeUI;onUI:(change:Partial<HomeUI>)=>void;onOpen:(p:Position)=>void;canOpen:(p:Pick<Position,'path'|'hash'>)=>boolean;isPro:boolean;onDeleteBookmark:(p:Position)=>void};

export function HomeScreen({design,saved,ui,onUI,onOpen,canOpen,isPro,onDeleteBookmark}:Props){
 const colors=PALETTES[design],s=HOME_STYLES[design],{width,fontScale}=useWindowDimensions();
 const compact=width<350,largeText=fontScale>1.3;
 const [height,setHeight]=useState(0);
 const recent=saved.last&&canOpen(saved.last)?saved.last:null;
 const first=isPro?HOME_BASICS[0]:NAVIGATION.elements[0];
 const start=()=>onOpen(recent||{...first,y:0});
 const resumeTitle=recent?titleFor(recent):first.title;
 const resumeLabel=recent?'続きから読む →':isPro?'初めての解析を開く':first.title+'を開く';
 const resumeDetail=isPro?'初学者向けの6ステップ':'無料で読める要素教材';
 function badge(item:Pick<Position,'path'|'hash'>){
  return !canOpen(item)&&<Text style={s.proBadge}>Pro</Text>;
 }
 const complete=JSON.parse(saved.courseProgress).length;
 function row(item:Item,index?:number){return <Pressable key={item.path+item.hash} style={s.row} onPress={()=>onOpen({...item,y:0})} accessibilityRole="button" accessibilityLabel={item.title}>
  {index!==undefined?<Text style={s.order}>{String(index+1).padStart(2,'0')}</Text>:<UiIcon name={icons[item.hash]||icons[item.path]||'book'} color={colors.muted}/>}
  <View style={s.copy}><Text style={s.rowTitle}>{item.title}</Text><Text style={s.rowDescription}>{item.description}</Text></View>{badge(item)}<UiIcon name="right" color={colors.muted} size={16}/>
 </Pressable>;}
 function heading(title:string,detail?:string){return <View style={s.heading}><Text accessibilityRole="header" style={s.headingTitle}>{title}</Text>{detail&&<Text style={s.headingDetail}>{detail}</Text>}</View>;}
 function operations(){return <View testID="home-operations">{NAVIGATION.operations.map(item=>row(item))}</View>;}
 function errorRow(){return <Pressable style={s.row} onPress={()=>onOpen({path:'errors.html',hash:'',y:0})} accessibilityRole="button" accessibilityLabel="エラーメッセージ"><UiIcon name="search" color={colors.muted}/><View style={s.copy}><Text style={s.rowTitle}>エラーメッセージ</Text><Text style={s.rowDescription}>番号・メッセージから調べる</Text></View><UiIcon name="right" color={colors.muted} size={16}/></Pressable>;}
 function bookmarks(){return <View testID="home-bookmarks">
  {heading('しおり',`${saved.bookmarks.length}件`)}
  {saved.bookmarks.length?(ui.allBookmarks?saved.bookmarks:saved.bookmarks.slice(0,3)).map(item=><View key={item.path+item.hash} style={s.bookmarkRow}>
    <Pressable style={s.bookmarkLink} onPress={()=>onOpen(item)} accessibilityRole="button" accessibilityLabel={'しおり：'+titleFor(item)}><UiIcon name="bookmark" color={colors.accent}/><Text style={[s.rowTitle,s.copy]}>{titleFor(item)}</Text>{badge(item)}</Pressable>
    <Pressable style={s.iconButton} onPress={()=>onDeleteBookmark(item)} accessibilityRole="button" accessibilityLabel={'しおりを削除：'+titleFor(item)}><UiIcon name="trash" color={colors.muted} size={18}/></Pressable>
   </View>):<View style={s.empty}><UiIcon name="bookmark" color={colors.muted} size={28}/><Text style={s.emptyTitle}>大切な場所を、すぐ手元に。</Text><Text style={s.rowDescription}>記事の☆から保存できます。</Text></View>}
  {saved.bookmarks.length>3&&<Pressable style={s.more} onPress={()=>onUI({allBookmarks:!ui.allBookmarks})} accessibilityRole="button"><Text style={s.link}>{ui.allBookmarks?'3件に戻す':'すべてのしおりを見る'}</Text></Pressable>}
 </View>;}
 function utilities(){return <View style={s.utility}>
  <Pressable style={s.utilityButton} onPress={()=>onUI({bookmarksOpen:!ui.bookmarksOpen})} accessibilityRole="button" accessibilityLabel="しおり一覧" accessibilityState={{expanded:ui.bookmarksOpen}} aria-expanded={ui.bookmarksOpen}><UiIcon name="bookmark" color={colors.muted} size={16}/><Text style={s.utilityText}>しおり</Text></Pressable>
  <Pressable style={s.utilityButton} onPress={()=>onOpen({path:'errors.html',hash:'',y:0})} accessibilityRole="button" accessibilityLabel="エラーメッセージ"><UiIcon name="search" color={colors.muted} size={16}/><Text style={s.utilityText}>エラー検索</Text></Pressable>
  <Pressable style={s.utilityButton} onPress={()=>onOpen({...NAVIGATION.homeResources[1],y:0})} accessibilityRole="button" accessibilityLabel="資料・サポート"><Text style={s.utilityText}>資料・サポート</Text><UiIcon name="outward" color={colors.muted} size={16}/></Pressable>
 </View>;}
 function resume(){return <Pressable style={s.resume} onPress={start} accessibilityRole="button" accessibilityLabel={resumeLabel}>
  <View style={s.copy}><Text style={s.resumeLabel}>{recent?'最近開いた内容':'はじめの一歩'}</Text><Text style={s.resumeTitle}>{resumeTitle}</Text>{!recent&&<Text style={s.rowDescription}>{resumeDetail}</Text>}</View><UiIcon name="forward" color={colors.accent}/>
 </Pressable>;}
 return <View testID={'home-design-'+design} onLayout={event=>setHeight(Math.ceil(event.nativeEvent.layout.height))}>
  {design==='blueprint'&&<View style={[StyleSheet.absoluteFill,{overflow:"hidden"}]} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{Array.from({length:Math.ceil(Math.min(width,760)/24)},(_,i)=><View key={'v'+i} style={{position:'absolute',top:0,bottom:0,left:i*24,width:1,backgroundColor:'#86b4e2',opacity:.04}}/>)}{Array.from({length:Math.ceil(height/24)},(_,i)=><View key={'h'+i} style={{position:'absolute',left:0,right:0,top:i*24,height:1,backgroundColor:'#86b4e2',opacity:.04}}/>)}</View>}
  {design==='graphite'?<>
   <Pressable style={s.hero} onPress={start} accessibilityRole="button" accessibilityLabel={resumeLabel}>
    <Image source={hero} style={s.heroImage} resizeMode="cover" accessible={false}/>
    <View style={s.heroCopy}><Text style={s.heroKicker}>{recent?'CONTINUE LEARNING':'START LEARNING'}</Text><Text style={s.heroTitle} numberOfLines={3}>{resumeTitle}</Text><Text style={s.heroDescription}>{recent?'前回の続きから':resumeDetail}</Text><View style={s.heroAction}><Text style={s.heroActionText}>{recent?'読み進める':'学び始める'}</Text><UiIcon name="outward" color="#d9e8ff" size={17}/></View></View>
   </Pressable>
   {heading('最初に学ぶ','基礎をひとつずつ')}
   <View style={s.tiles}>{FEATURED.map(item=><Pressable key={item.hash} style={[s.tile,largeText&&s.tileFull]} onPress={()=>onOpen({...item,y:0})} accessibilityRole="button" accessibilityLabel={item.title}>
    <View style={s.tileIcons}><UiIcon name={icons[item.hash]} color={colors.accent}/>{badge(item)}<UiIcon name="outward" color={colors.muted} size={14}/></View><Text style={s.tileTitle}>{item.title}</Text><Text style={s.tileDescription}>{shortDescriptions[item.hash]}</Text>
   </Pressable>)}</View>
   <Pressable style={s.more} onPress={()=>onUI({allBasics:!ui.allBasics})} accessibilityRole="button" accessibilityLabel="基礎項目をすべて見る" accessibilityState={{expanded:ui.allBasics}} aria-expanded={ui.allBasics}><Text style={s.link}>{ui.allBasics?'基礎項目を閉じる':'基礎項目をすべて見る'}</Text><UiIcon name="down" color={colors.muted} size={16}/></Pressable>
   {ui.allBasics&&<View testID="home-extra-basics">{EXTRAS.map(item=>row(item))}</View>}
   {heading('モデル作成・実行・結果')}{operations()}{utilities()}{ui.bookmarksOpen&&bookmarks()}
  </>:design==='blueprint'?<>
   <View style={s.blueCover}><Image source={hero} style={s.blueArt} resizeMode="cover" accessible={false}/><View style={s.blueBrand}><Text style={s.blueFEM}>FEM</Text><Text style={s.blueLabel}>LEARNING DESK</Text></View></View>
   {resume()}
   <View style={[s.segments,largeText&&s.segmentsStack]} accessibilityRole="tablist" accessibilityLabel="ホームの項目">{([{key:'basics',title:'基礎を学ぶ'},{key:'work',title:'実務で調べる'},{key:'saved',title:'しおり'}] as const).map(x=><Pressable key={x.key} style={[s.segment,ui.section===x.key&&s.segmentSelected]} accessibilityRole="tab" accessibilityLabel={x.key==='saved'?'しおり一覧':x.title} accessibilityState={{selected:ui.section===x.key}} aria-selected={ui.section===x.key} onPress={()=>onUI({section:x.key})}><Text style={[s.segmentText,ui.section===x.key&&s.segmentSelectedText]}>{x.title}</Text></Pressable>)}</View>
   <View style={s.sectionBody}>
    {ui.section==='basics'?<View testID="home-basics">{HOME_BASICS.map((item,i)=>row(item,i))}</View>:ui.section==='work'?<>{operations()}{errorRow()}</>:bookmarks()}
   </View>
   <Pressable style={s.support} onPress={()=>onOpen({...NAVIGATION.homeResources[1],y:0})} accessibilityRole="button" accessibilityLabel="資料・サポート"><Text style={s.link}>資料・サポート</Text><UiIcon name="outward" color={colors.muted} size={16}/></Pressable>
  </>:<>
   <View style={s.editorial}><View style={s.copy}><Text style={s.kicker}>UNDERSTAND. ANALYZE.</Text><Text style={[s.editorialTitle,compact&&s.editorialTitleSmall]}>力学を、{'\n'}手元から。</Text></View><Image source={hero} style={[s.editorialImage,compact&&s.editorialImageSmall]} resizeMode="cover" accessible={false}/></View>
   {resume()}{heading('最初に学ぶ','FOUNDATIONS')}<View testID="home-basics">{HOME_BASICS.map((item,i)=>row(item,i))}</View>
   <Pressable style={s.workToggle} accessibilityRole="button" accessibilityLabel="モデル作成・実行・結果" accessibilityState={{expanded:ui.workOpen}} aria-expanded={ui.workOpen} onPress={()=>onUI({workOpen:!ui.workOpen})}><Text style={[s.headingTitle,s.copy]}>モデル作成・実行・結果</Text><UiIcon name={ui.workOpen?'down':'plus'} color={colors.muted}/></Pressable>
   {ui.workOpen&&operations()}{utilities()}{ui.bookmarksOpen&&bookmarks()}
  </>}
  {complete>0&&complete<6&&<Text style={s.progressNote}>初めての解析の読了 {complete} / 6</Text>}
 </View>;
}

export function HomeDesignPicker({value,onChange}:{value:HomeDesign;onChange:(value:HomeDesign)=>void}){
 const p=PALETTES[value];return <View style={picker.group} accessibilityRole="radiogroup" accessibilityLabel="ホームデザイン">{HOME_DESIGNS.map(d=>{const c=PALETTES[d.id],selected=d.id===value;return <Pressable key={d.id} testID={'home-design-option-'+d.id} style={[picker.option,{backgroundColor:p.surface,borderColor:selected?p.accent:p.line}]} accessibilityRole="radio" accessibilityLabel={'ホームデザイン '+d.name} accessibilityState={{checked:selected}} aria-checked={selected} onPress={()=>onChange(d.id)}>
  <View style={[picker.swatch,{backgroundColor:c.background,borderColor:c.line}]} accessible={false}><View style={[picker.swatchBar,{backgroundColor:c.surface}]}><View style={[picker.swatchDot,{backgroundColor:c.accent}]}/></View><Image source={hero} style={picker.swatchImage} resizeMode="cover"/><View style={picker.swatchRows}><View style={[picker.swatchRow,{backgroundColor:c.muted}]}/><View style={[picker.swatchRow,{backgroundColor:c.muted,width:'60%'}]}/></View></View>
  <View style={picker.copy}><Text style={[picker.name,{color:p.text}]}>{d.name}</Text><Text style={[picker.description,{color:p.muted}]}>{d.description}</Text></View><View style={[picker.radio,{borderColor:selected?p.accent:p.muted,backgroundColor:selected?p.accent:'transparent'}]}>{selected&&<UiIcon name="check" color={p.onAccent} size={15}/>}</View>
 </Pressable>;})}</View>;
}
const picker=StyleSheet.create({group:{gap:10,marginTop:7},option:{borderWidth:1,borderRadius:12,padding:12,flexDirection:'row',alignItems:'center',gap:12,minHeight:94},copy:{flex:1},name:{fontSize:15,fontWeight:'600'},description:{fontSize:12,lineHeight:20,marginTop:4},swatch:{width:65,height:74,borderWidth:1,borderRadius:6,overflow:'hidden'},swatchBar:{height:12,padding:4},swatchDot:{width:5,height:5,borderRadius:3},swatchImage:{height:28,width:'100%'},swatchRows:{padding:6,gap:4},swatchRow:{height:3,width:'85%',opacity:.7},radio:{height:22,width:22,borderRadius:11,borderWidth:1,alignItems:'center',justifyContent:'center'}});
function createHomeStyles(c:Palette){return StyleSheet.create({
 proBadge:{fontSize:11,fontWeight:'700',color:c.accent},
 copy:{flex:1,minWidth:0},row:{flexDirection:'row',alignItems:'center',gap:13,paddingVertical:15,borderBottomWidth:1,borderColor:c.line,minHeight:64},rowTitle:{fontSize:14,lineHeight:22,fontWeight:'600',color:c.text},rowDescription:{fontSize:12,lineHeight:20,color:c.muted,marginTop:3},order:{fontSize:11,color:c.muted,width:21,fontVariant:['tabular-nums']},
 heading:{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between',gap:8,marginTop:24,marginBottom:12},headingTitle:{fontSize:16,lineHeight:24,fontWeight:'700',color:c.text},headingDetail:{fontSize:11,color:c.muted,flexShrink:1},
 hero:{marginTop:18,minHeight:195,borderRadius:15,backgroundColor:'#102031',overflow:'hidden',justifyContent:'center'},heroImage:{position:'absolute',right:-12,top:0,width:'65%',height:'100%',opacity:.75},heroCopy:{padding:22,width:'70%'},heroKicker:{fontSize:10,letterSpacing:.7,fontWeight:'600',color:'#b7cce5'},heroTitle:{fontSize:23,lineHeight:30,fontWeight:'700',letterSpacing:-.7,color:'#f5f8ff',marginTop:12,textShadowColor:'#102031',textShadowRadius:4},heroDescription:{fontSize:12,lineHeight:19,color:'#bdccde',marginTop:4},heroAction:{flexDirection:'row',alignItems:'center',gap:12,marginTop:20},heroActionText:{fontSize:12,color:'#d9e8ff',fontWeight:'600'},
 tiles:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:10},tile:{width:'48.3%',padding:15,backgroundColor:c.surface,borderRadius:15,minHeight:110},tileFull:{width:'100%'},tileIcons:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},tileTitle:{fontSize:15,lineHeight:23,fontWeight:'600',color:c.text},tileDescription:{fontSize:11,lineHeight:18,color:c.muted,marginTop:3},
 more:{flexDirection:'row',alignItems:'center',justifyContent:'flex-end',minHeight:46,gap:8},link:{fontSize:12,lineHeight:20,color:c.muted},utility:{flexDirection:'row',flexWrap:'wrap',gap:4,columnGap:16,borderTopWidth:1,borderColor:c.line,paddingTop:8,marginTop:18},utilityButton:{flexDirection:'row',alignItems:'center',gap:6,minHeight:46},utilityText:{fontSize:12,lineHeight:20,color:c.muted},
 blueCover:{height:170,backgroundColor:'#102031',marginTop:18,borderRadius:12,overflow:'hidden'},blueArt:{position:'absolute',right:0,top:0,height:170,width:'74%',opacity:.9},blueBrand:{position:'absolute',top:28,left:18},blueFEM:{fontSize:42,lineHeight:48,fontWeight:'700',color:'#eaf2fc',letterSpacing:-1},blueLabel:{fontSize:9,letterSpacing:1,color:'#d6e5f5',fontWeight:'600',marginTop:5},
 resume:{paddingVertical:19,borderBottomWidth:1,borderColor:c.line,flexDirection:'row',alignItems:'center',gap:10,marginBottom:17},resumeLabel:{fontSize:11,lineHeight:17,color:c.muted},resumeTitle:{fontSize:16,lineHeight:25,fontWeight:'600',color:c.text,marginTop:4},segments:{flexDirection:'row',padding:3,gap:3,backgroundColor:c.surface,borderWidth:1,borderColor:c.line,borderRadius:10},segmentsStack:{flexDirection:'column'},segment:{flex:1,minHeight:44,justifyContent:'center',alignItems:'center',padding:5,borderRadius:7},segmentSelected:{backgroundColor:c.accent},segmentText:{fontSize:12,lineHeight:20,color:c.text},segmentSelectedText:{color:c.onAccent,fontWeight:'700'},sectionBody:{minHeight:220,marginTop:10},support:{flexDirection:'row',alignItems:'center',gap:8,minHeight:48,marginTop:8},
 editorial:{flexDirection:'row',alignItems:'center',gap:10,marginTop:26,marginBottom:23},kicker:{fontSize:9,lineHeight:15,color:c.muted,letterSpacing:.5},editorialTitle:{fontSize:31,lineHeight:44,fontWeight:'600',color:c.text,letterSpacing:-1.5,marginTop:12},editorialTitleSmall:{fontSize:27,lineHeight:40},editorialImage:{width:123,height:153,borderTopLeftRadius:63,borderTopRightRadius:63,borderBottomLeftRadius:12,borderBottomRightRadius:12},editorialImageSmall:{width:104,height:140},workToggle:{flexDirection:'row',alignItems:'center',gap:8,minHeight:62,marginTop:20,borderTopWidth:1,borderColor:c.line},
 bookmarkRow:{flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderColor:c.line},bookmarkLink:{flex:1,flexDirection:'row',alignItems:'center',gap:12,paddingVertical:16},iconButton:{width:44,minHeight:44,alignItems:'center',justifyContent:'center'},empty:{paddingVertical:38,alignItems:'center',gap:10},emptyTitle:{fontSize:14,lineHeight:24,color:c.text},progressNote:{fontSize:11,color:c.muted,marginTop:16},
 });}
const HOME_STYLES={graphite:createHomeStyles(PALETTES.graphite),blueprint:createHomeStyles(PALETTES.blueprint),minimal:createHomeStyles(PALETTES.minimal)};
