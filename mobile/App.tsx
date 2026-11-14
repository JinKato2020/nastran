import appConfig from './app.json';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { NAVIGATION, DOWNLOADS, readerHTML, titleFor } from './src/content';
import { ROOT_TABS, type TabKey } from './src/navigation';
import { EMPTY_STATE, externalURL, filePayload, position, progress, courseProgress, restore, samePlace, type Position, type SavedState } from './src/protocol';

const STORAGE_KEY='nastran-learning-state-v1';
type Entry=Position&{key:string};
let entryNumber=0;
const newEntry=(p:Position):Entry=>({...p,key:String(++entryNumber)});

function Reader({entry,saved,onMessage,onExternal,onNavigate,onRestart,webRef}:{entry:Entry;saved:SavedState;onMessage:(event:WebViewMessageEvent)=>void;onExternal:(url:string)=>void;onNavigate:(p:Position)=>void;onRestart:()=>void;webRef:React.RefObject<WebView<object>|null>}){
  // Freeze the initial HTML: progress and scroll messages must not reload the reader.
  const [source]=useState(()=>({html:readerHTML(entry,saved.progress,entry.key,saved.courseProgress,saved.textScale),baseUrl:'https://nastran.invalid/'+entry.path}));
  const [error,setError]=useState(false);
  return <View style={styles.reader}>
    <WebView<object> ref={webRef} source={source} originWhitelist={['*']} style={styles.reader} javaScriptEnabled domStorageEnabled
      allowsBackForwardNavigationGestures={false} setSupportMultipleWindows={false} allowFileAccess={false} mixedContentMode="never"
      onMessage={onMessage} onError={()=>setError(true)} onContentProcessDidTerminate={onRestart} onRenderProcessGone={onRestart}
      onOpenWindow={({nativeEvent})=>onExternal(nativeEvent.targetUrl)}
      onShouldStartLoadWithRequest={req=>{
        if(req.url==='about:blank'||req.url.startsWith('about:blank#'))return true;
        try{const u=new URL(req.url);if(u.origin==='https://nastran.invalid'){
          if(u.pathname.slice(1)===entry.path)return true;
          const p=position({path:u.pathname.slice(1),hash:u.hash,y:0});if(p)onNavigate(p);return false;
        }}catch{return false;}
        onExternal(req.url);return false;
      }} />
    {error&&<View style={styles.error}><Text style={styles.body}>教材を表示できませんでした。</Text><Pressable style={styles.primary} onPress={onRestart}><Text style={styles.primaryText}>もう一度開く</Text></Pressable></View>}
  </View>;
}

function LearningApp(){
  const [saved,setSaved]=useState<SavedState>(EMPTY_STATE);
  const savedRef=useRef(saved);
  const [loaded,setLoaded]=useState(false);
  const [entry,setEntry]=useState<Entry|null>(null);
  const entryRef=useRef<Entry|null>(null);
  const current=useRef<Position|null>(null);
  const readerReported=useRef(false);
  const trail=useRef<Position[]>([]);
  const webRef=useRef<WebView<object>>(null);
  const [menu,setMenu]=useState(false);
  const [tab,setTab]=useState<TabKey>('home');
  const tabSessions=useRef<Partial<Record<TabKey,{position:Position|null;trail:Position[]}>>>({});
  const [showBookmarks,setShowBookmarks]=useState(false);
  const [sharing,setSharing]=useState(false);
  const shareBusy=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const storageFailed=useRef(false);
  const readyToSave=useRef(false);
  const writeQueue=useRef<Promise<void>>(Promise.resolve());
  const [locationTitle,setLocationTitle]=useState('');
  function persist(){
    if(!readyToSave.current)return Promise.resolve();
    if(timer.current)clearTimeout(timer.current);
    const snapshot=JSON.stringify(savedRef.current);
    writeQueue.current=writeQueue.current.then(()=>AsyncStorage.setItem(STORAGE_KEY,snapshot)).catch(()=>{if(!storageFailed.current){storageFailed.current=true;Alert.alert('学習記録を保存できません','教材は読めますが、端末の空き容量などを確認してください。');}});
    return writeQueue.current;
  }
  function updateSaved(next:SavedState){savedRef.current=next;setSaved(next);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>{void persist();},500);}
  useEffect(()=>{
    let active=true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw=>{if(active){const s=restore(raw);savedRef.current=s;setSaved(s);}}).catch(()=>Alert.alert('学習記録を読み込めません','教材はこのまま読むことができます。')).finally(()=>{if(active){readyToSave.current=true;setLoaded(true);}});
    const sub=AppState.addEventListener('change',state=>{if(state!=='active')void persist();});
    return()=>{active=false;sub.remove();if(timer.current)clearTimeout(timer.current);};
  },[]);
  function ownerTab(p:Position):TabKey{
    if(p.path==='bulk.html')return 'input';
    if(p.path==='analysis.html'||p.path==='relations.html')return 'analysis';
    if(p.path==='errors.html')return 'home';
    return 'materials';
  }
  function open(p:Position,remember=true){
    setTab(ownerTab(p));
    if(remember&&current.current)trail.current=[...trail.current.slice(-49),current.current];
    const e=newEntry(p);current.current=p;readerReported.current=false;entryRef.current=e;setEntry(e);setLocationTitle(titleFor(p));setMenu(false);
    updateSaved({...savedRef.current,last:p});
  }
  function root(){void persist();entryRef.current=null;setEntry(null);current.current=null;trail.current=[];setMenu(false);}
  function activateTab(value:TabKey,target?:Position){
    tabSessions.current[tab]={position:current.current,trail:[...trail.current]};
    const previous=tabSessions.current[value];
    setTab(value);setMenu(false);
    if(target){trail.current=[];open(target,false);return;}
    if(value==='settings'||value===tab&&value!=='input'){root();return;}
    const next=previous?.position||(value==='input'?{path:'bulk.html',hash:'',y:0}:null);
    if(next){open(next,false);trail.current=previous?.trail||[];}else root();
  }
  function home(){tabSessions.current[tab]={position:current.current,trail:[...trail.current]};setTab('home');root();}
  function back(){const previous=trail.current.pop();if(previous)open(previous,false);else if(tab==='input')home();else root();}
  useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(menu){setMenu(false);return true;}if(entry){back();return true;}if(tab!=='home'){home();return true;}return false;});return()=>sub.remove();},[entry,menu,tab]);
  async function external(raw:string){const url=externalURL(raw);if(!url)return;try{await Linking.openURL(url);}catch{Alert.alert('リンクを開けません','原典PDFなどの外部ページには、インターネット接続が必要です。');}}
  function reply(session:string,id:unknown,ok:boolean,error?:string){
    if(session!==entryRef.current?.key||typeof id!=='string'||!/^\d{1,8}$/.test(id))return;
    webRef.current?.injectJavaScript(`window.__nastranReply(${JSON.stringify(id)},${ok},${JSON.stringify(error||'')});true;`);
  }
  async function share(name:unknown,base64:unknown){
    const f=filePayload(name,base64);
    if(shareBusy.current)throw new Error('開いている共有メニューを閉じてから、もう一度お試しください。');
    shareBusy.current=true;setSharing(true);
    let folder:string|null=null;
    try{
      if(!await Sharing.isAvailableAsync())throw new Error('この端末ではファイル共有を利用できません。');
      if(!FileSystem.cacheDirectory)throw new Error('保存用の作業場所を開けません。');
      folder=FileSystem.cacheDirectory+'nastran-share-'+Date.now()+'/';
      await FileSystem.makeDirectoryAsync(folder,{intermediates:true});
      const uri=folder+f.name;
      await FileSystem.writeAsStringAsync(uri,f.base64,{encoding:FileSystem.EncodingType.Base64});
      await Sharing.shareAsync(uri,{mimeType:f.zip?'application/zip':'application/octet-stream',UTI:f.zip?'public.zip-archive':'public.data',dialogTitle:'ファイルに保存・共有'});
    }finally{if(folder)await FileSystem.deleteAsync(folder,{idempotent:true}).catch(()=>{});shareBusy.current=false;setSharing(false);}
  }
  async function message(event:WebViewMessageEvent){
    let m:Record<string,unknown>;
    try{if(event.nativeEvent.data.length>5*1024*1024)return;m=JSON.parse(event.nativeEvent.data);if(!m||typeof m!=='object'||m.session!==entryRef.current?.key)return;}catch{return;}
    const session=m.session as string;
    try{
      if(m.type==='courseProgress'){updateSaved({...savedRef.current,courseProgress:courseProgress(m.value)});}
      else if(m.type==='progress'){updateSaved({...savedRef.current,progress:progress(m.value)});}
      else if(m.type==='position'){
        const p=position(m);if(!p||p.path!==entryRef.current?.path)return;
        if(readerReported.current&&current.current&&!samePlace(current.current,p))trail.current=[...trail.current.slice(-49),current.current];
        readerReported.current=true;
        current.current=p;setLocationTitle(titleFor(p));updateSaved({...savedRef.current,last:p});
      }else if(m.type==='navigate'){const p=position({...m,y:0});if(p)open(p);}
      else if(m.type==='external'){if(typeof m.url==='string')await external(m.url);}
      else if(m.type==='copy'){if(typeof m.text!=='string'||m.text.length>3*1024*1024)throw new Error('コピーする内容を確認できません。');await Clipboard.setStringAsync(m.text);reply(session,m.id,true);}
      else if(m.type==='share'){await share(m.name,m.base64);reply(session,m.id,true);}
      else if(m.type==='asset'){const file=typeof m.path==='string'?DOWNLOADS[m.path]:null;if(!file)throw new Error('配布ファイルが見つかりません。');await share(file.name,file.base64);reply(session,m.id,true);}
      else if(m.type==='notice'&&typeof m.message==='string')Alert.alert('操作を確認してください',m.message.slice(0,250));
    }catch(e){const text=e instanceof Error?e.message:'操作を完了できませんでした。';reply(session,m.id,false,text);}
  }
  function bookmark(){const p=current.current;if(!p)return;const old=savedRef.current.bookmarks;const exists=old.some(b=>samePlace(b,p));updateSaved({...savedRef.current,bookmarks:exists?old.filter(b=>!samePlace(b,p)):[p,...old].slice(0,100)});}
  type CourseItem={key?:string;title:string;description:string;path:string;hash:string;kind?:string};
  const [materialGroup,setMaterialGroup]=useState('intro');
  const materialGroups=[
    {key:'intro',title:'イントロダクション',description:'初めての解析・入力規則・応力方向・座標',items:NAVIGATION.intro},
    {key:'common',title:'共通の解析技術論',description:'カードの使い分け・境界条件・減衰・モデル化・並列計算',items:NAVIGATION.common},
    {key:'theory',title:'各解析技術理論',description:'線形・非線形・熱・振動の支配式、物理的意味と適用範囲',items:NAVIGATION.materials},
  ];
  const menuGroups:{title:string;tab:TabKey;items:CourseItem[]}[]=[
    ...materialGroups.map(g=>({title:g.title,tab:'materials' as TabKey,items:g.items})),
    {title:'解析',tab:'analysis',items:NAVIGATION.analyses},
    {title:'Inputデータ',tab:'input',items:[{title:'入力データ学習',description:'入力区分 → カテゴリー → カード',path:'bulk.html',hash:''}]},
    {title:'エラーメッセージ',tab:'home',items:[{title:'エラー検索と意味',description:'番号・診断文・F06から検索',path:'errors.html',hash:''}]},
  ];
  const marked=saved.bookmarks.some(b=>samePlace(b,current.current));
  const complete=JSON.parse(saved.courseProgress).length;
  function lesson(l:CourseItem,index:number){return <Pressable key={l.path+l.hash} style={styles.lesson} onPress={()=>open({path:l.path,hash:l.hash,y:0},false)} accessibilityRole="button" accessibilityLabel={l.title}>
    <View style={styles.lessonNumber}><Text style={styles.lessonNumberText}>{String(index+1).padStart(2,'0')}</Text></View><View style={styles.lessonCopy}><View style={styles.lessonHead}><Text style={styles.lessonTitle}>{l.title}</Text>{l.kind?<Text style={styles.lessonKind}>{l.kind}</Text>:null}</View><Text style={styles.description}>{l.description}</Text></View><Text style={styles.arrow}>›</Text>
  </Pressable>;}
  if(!loaded)return <SafeAreaView style={styles.app}><ActivityIndicator style={styles.loading} color="#3259d8"/><Text style={styles.loadingText}>教材を準備しています</Text></SafeAreaView>;
  return <SafeAreaView style={styles.app} edges={['top','bottom']}>
    <StatusBar style="dark"/>
    {entry?<>
      <View style={styles.toolbar}><Pressable accessibilityRole="button" onPress={back} style={styles.toolButton}><Text style={styles.toolText}>‹ 戻る</Text></Pressable><Text style={styles.readerTitle} numberOfLines={2}>{locationTitle}</Text><Pressable onPress={bookmark} accessibilityRole="button" accessibilityLabel={marked?'しおりを外す':'しおりを付ける'} accessibilityState={{selected:marked}} style={styles.starButton}><Text style={[styles.star,marked&&styles.marked]}>{marked?'★':'☆'}</Text></Pressable><Pressable onPress={()=>setMenu(true)} accessibilityRole="button" style={styles.toolButton}><Text style={styles.toolText}>目次</Text></Pressable></View>
      <Reader key={entry.key} entry={entry} saved={saved} onMessage={message} onExternal={external} onNavigate={open} onRestart={()=>{if(current.current)open(current.current,false);}} webRef={webRef}/>
      {sharing&&<View style={styles.shareStatus} accessibilityLiveRegion="polite"><Text style={styles.shareText}>共有メニューで「ファイルに保存」を選べます</Text></View>}
    </>:<ScrollView key={tab} style={styles.screen} contentContainerStyle={styles.home}>
      <View style={styles.brandRow}><Image style={styles.logo} source={require('./assets/icon-fem-guide-for-nas.png')} accessibilityLabel="FEM Guide for nas" resizeMode="contain" /><Text style={styles.screenTitle}>{ROOT_TABS.find(t=>t.id===tab)?.title}</Text><View style={styles.brandMark}><Text style={styles.brand}>FEM Guide for nas</Text><Text style={styles.brandSub}>非公式学習教材</Text></View></View>
      {tab==='home'&&<>
        <View style={[styles.resumeCard,styles.homeFirst]}><Text style={styles.smallHeading}>{saved.last?'最近開いた内容':'教材一覧'}</Text>{saved.last&&<Text style={styles.lastTitle}>{titleFor(saved.last)}</Text>}<Pressable style={styles.primary} onPress={()=>saved.last?open(saved.last,false):activateTab('materials')} accessibilityRole="button"><Text style={styles.primaryText}>{saved.last?'続きから読む →':'教材を選ぶ →'}</Text></Pressable>{complete<6&&<Text style={styles.description}>初めての解析の読了 {complete} / 6</Text>}</View>
        <Pressable style={styles.searchRow} onPress={()=>open({path:'errors.html',hash:'',y:0},false)} accessibilityRole="button" accessibilityLabel="エラーメッセージ"><Text style={styles.searchIcon}>⌕</Text><Text style={styles.searchText}>エラー番号・メッセージを検索</Text><Text style={styles.arrow}>›</Text></Pressable>
        <Pressable style={styles.bookmarkHeading} onPress={()=>setShowBookmarks(v=>!v)} accessibilityRole="button" accessibilityLabel="しおり一覧" accessibilityState={{expanded:showBookmarks}}><Text style={styles.sectionTitle}>しおり <Text style={styles.count}>{saved.bookmarks.length}</Text></Text><Text style={styles.linkText}>{saved.bookmarks.length>3?(showBookmarks?'3件に戻す':'すべて見る'):''}</Text></Pressable>
        {(saved.bookmarks.length?(showBookmarks?saved.bookmarks:saved.bookmarks.slice(0,3)).map((p,i)=><View key={p.path+p.hash} style={styles.bookmarkRow}><Pressable style={styles.bookmarkOpen} onPress={()=>open(p,false)} accessibilityRole="button"><Text style={styles.introTitle}>{titleFor(p)}</Text><Text style={styles.description}>保存した場所を開く →</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="しおりを削除" style={styles.toolButton} onPress={()=>updateSaved({...savedRef.current,bookmarks:savedRef.current.bookmarks.filter((_,n)=>n!==i)})}><Text style={styles.toolText}>削除</Text></Pressable></View>):<Text style={styles.empty}>教材の☆から場所を保存できます。</Text>)}
      </>}
      {tab==='materials'&&<><Text style={styles.screenLead}>分類を選び、経験と目的に合う内容から学べます。</Text>{materialGroups.map(g=><View key={g.key} style={styles.materialGroup}><Pressable style={styles.materialGroupHeader} accessibilityRole="button" accessibilityLabel={g.title} accessibilityState={{expanded:materialGroup===g.key}} onPress={()=>setMaterialGroup(materialGroup===g.key?'':g.key)}><View style={styles.lessonCopy}><Text style={styles.sectionTitle}>{g.title}</Text><Text style={styles.description}>{g.description}</Text></View><Text style={styles.arrow}>{materialGroup===g.key?'−':'＋'}</Text></Pressable>{materialGroup===g.key&&<View style={styles.materialGroupBody}>{g.items.map(lesson)}</View>}</View>)}</>}
      {tab==='analysis'&&<><Text style={styles.screenLead}>モデル・解析条件・Input・実行・出力・検証</Text>{NAVIGATION.analyses.map(lesson)}</>}
      {tab==='settings'&&<>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>本文の文字サイズ</Text><Text style={styles.description}>説明文のサイズを変更します。入力表は8文字の配置を保ちます。</Text><View style={styles.sizeOptions}>{([{value:1,label:'標準'},{value:1.15,label:'大'},{value:1.3,label:'特大'}]).map(x=><Pressable key={x.value} style={[styles.sizeOption,saved.textScale===x.value&&styles.selectedSize]} onPress={()=>updateSaved({...savedRef.current,textScale:x.value})} accessibilityRole="radio" accessibilityLabel={'文字サイズ '+x.label} accessibilityState={{checked:saved.textScale===x.value}} aria-checked={saved.textScale===x.value}><Text style={[styles.sizeOptionText,saved.textScale===x.value&&styles.selectedSizeText]}>{x.label}</Text></Pressable>)}</View></View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>保存データ</Text><Text style={styles.body}>学習記録としおりは端末内に保存します。基礎コースの読了は {complete} / 6、しおりは {saved.bookmarks.length} 件です。</Text><Text style={styles.description}>アプリの削除で端末内の記録も削除されます。</Text></View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>このアプリについて</Text><Text style={styles.body}>Nastranの非公式日本語教材です。基本解析の理論は共通で、カード解説・入力例・エラー検索はMSC Nastranを対象にしています。非線形・接触のSimcenter編では設定を確認する観点を紹介します。教材と入力例はオフラインで利用できます。</Text><Text style={styles.description}>Nastranを実行する機能はありません。原典の掲載結果と独自の検算値を区別しています。入力例はMSC Nastran本体では未実行です。原典PDFの参照には通信が必要です。</Text><Text style={styles.description}>本アプリは開発元の提供・認定を受けたものではありません。製品名・商標は各権利者に帰属します。</Text><Pressable accessibilityRole="button" onPress={()=>open({path:'analysis.html',hash:'#common/rights',y:0},false)}><Text style={styles.linkText}>出典・第三者ライセンス →</Text></Pressable><Text style={styles.version}>バージョン {appConfig.expo.version}（{appConfig.expo.ios.buildNumber}）</Text></View>
      </>}
    </ScrollView>}
    <View style={styles.bottomNav} accessibilityRole="tablist" accessibilityLabel="メインナビゲーション">{ROOT_TABS.map(t=><Pressable key={t.id} style={[styles.bottomTab,tab===t.id&&styles.activeBottomTab]} onPress={()=>activateTab(t.id)} accessibilityRole="tab" accessibilityLabel={t.title} accessibilityState={{selected:tab===t.id}} aria-selected={tab===t.id}><Text style={[styles.navIcon,tab===t.id&&styles.activeNavText]} accessibilityElementsHidden importantForAccessibility="no">{t.icon}</Text><Text style={[styles.navLabel,tab===t.id&&styles.activeNavText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{t.title}</Text></Pressable>)}</View>
    <Modal visible={menu} animationType="slide" onRequestClose={()=>setMenu(false)}><SafeAreaView style={styles.app}><View style={styles.menuHeading}><Text style={styles.menuTitle}>教材の目次</Text><Pressable onPress={()=>setMenu(false)} style={styles.toolButton} accessibilityRole="button"><Text style={styles.toolText}>閉じる</Text></Pressable></View><ScrollView contentContainerStyle={styles.menuBody}><Pressable onPress={home} style={styles.menuRow} accessibilityRole="button"><Text style={styles.lessonTitle}>ホームへ戻る</Text></Pressable>{menuGroups.map(group=><View key={group.title}><Text style={styles.menuSection}>{group.title}</Text>{group.items.map(l=><Pressable key={l.path+l.hash} style={styles.menuRow} onPress={()=>activateTab(group.tab,{path:l.path,hash:l.hash,y:0})} accessibilityRole="button" accessibilityLabel={l.title}><Text style={styles.lessonTitle}>{l.title}</Text><Text style={styles.description}>{l.description}</Text></Pressable>)}</View>)}</ScrollView></SafeAreaView></Modal>
  </SafeAreaView>;
}

export default function App(){return <SafeAreaProvider><LearningApp/></SafeAreaProvider>;}

const styles=StyleSheet.create({
 materialGroup:{marginBottom:14,borderWidth:1,borderColor:'#d5e0ee',borderRadius:12,backgroundColor:'#fff',overflow:'hidden'},materialGroupHeader:{padding:17,flexDirection:'row',alignItems:'center',gap:10,minHeight:72,backgroundColor:'#edf3fb'},materialGroupBody:{padding:10,paddingBottom:0},
 screen:{flex:1},screenTitle:{fontSize:24,fontWeight:'700',color:'#1d3555',flexShrink:1},brandMark:{marginLeft:'auto',alignItems:'flex-end'},homeFirst:{marginTop:16},searchRow:{flexDirection:'row',alignItems:'center',gap:10,minHeight:48,paddingHorizontal:14,borderRadius:10,backgroundColor:'#fff',borderWidth:1,borderColor:'#cddbf7',marginBottom:10},searchIcon:{fontSize:20,color:'#617fae'},searchText:{flex:1,fontSize:15,color:'#5d7598'},screenLead:{fontSize:13,lineHeight:23,color:'#637b9a',marginTop:8,marginBottom:22},
 introCard:{padding:19,borderWidth:1,borderColor:'#d3dff2',backgroundColor:'#fff',borderRadius:14,marginBottom:16},cardEyebrow:{fontSize:10,letterSpacing:1.2,fontWeight:'700',color:'#617fae',marginBottom:7},sectionTitle:{fontSize:20,lineHeight:28,fontWeight:'700',color:'#294b77'},introRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:15,borderTopWidth:1,borderColor:'#e8edf5',marginTop:8},introTitle:{fontSize:15,lineHeight:23,fontWeight:'600',color:'#294b77'},errorCard:{padding:20,borderRadius:14,backgroundColor:'#edf2ff',borderWidth:1,borderColor:'#cddbf7',marginBottom:16},linkText:{fontSize:13,fontWeight:'600',color:'#3259d8',marginTop:10},resumeCard:{padding:18,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4f0',gap:12,marginBottom:18},smallHeading:{fontSize:13,fontWeight:'600',color:'#526d94'},bookmarkHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10},count:{fontSize:13,color:'#7890b1'},settingsCard:{padding:20,borderRadius:12,backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4f0',marginBottom:16,gap:8},sizeOptions:{flexDirection:'row',gap:8,marginTop:12},sizeOption:{flex:1,minHeight:46,borderRadius:8,borderWidth:1,borderColor:'#ccd8ed',justifyContent:'center',alignItems:'center'},selectedSize:{backgroundColor:'#3259d8',borderColor:'#3259d8'},sizeOptionText:{fontSize:14,color:'#45648e',fontWeight:'600'},selectedSizeText:{color:'#fff'},
 bottomNav:{flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderColor:'#d7e1ef',paddingTop:4,paddingBottom:4,paddingHorizontal:4},bottomTab:{flex:1,minHeight:58,justifyContent:'center',alignItems:'center',gap:3,borderRadius:9,minWidth:0},activeBottomTab:{backgroundColor:'#eef3ff'},navIcon:{fontSize:23,lineHeight:28,color:'#7a8ca7',fontWeight:'500'},navLabel:{fontSize:10,lineHeight:16,color:'#7185a2',fontWeight:'600'},activeNavText:{color:'#3259d8'},
 groupIntro:{fontSize:13,lineHeight:23,color:"#637b9a",marginBottom:16},
 app:{flex:1,backgroundColor:'#f6f8fc'},reader:{flex:1,backgroundColor:'#f6f8fc'},loading:{marginTop:100},loadingText:{textAlign:'center',marginTop:20,color:'#526784'},home:{padding:22,paddingBottom:40,maxWidth:760,width:'100%',alignSelf:'center'},brandRow:{flexDirection:'row',alignItems:'center',gap:10},logo:{width:34,height:34,borderRadius:8,backgroundColor:'#fff',borderWidth:1,borderColor:'#dce2eb'},brand:{fontSize:12,fontWeight:'700',color:'#182c49'},brandSub:{fontSize:10,color:'#61799a',marginTop:1},offline:{marginLeft:'auto',padding:7,borderRadius:6,backgroundColor:'#e6f2eb'},offlineText:{fontSize:10,color:'#39745a'},hero:{fontSize:29,lineHeight:42,fontWeight:'700',color:'#1d3555',marginTop:32},lead:{fontSize:14,lineHeight:25,color:'#677e9b',marginTop:12},progressCard:{padding:22,backgroundColor:'#eaf0ff',borderRadius:14,marginTop:25,borderWidth:1,borderColor:'#cfddf7'},progressLabel:{fontSize:13,color:'#5672a2'},progressNumber:{fontSize:32,fontWeight:'700',color:'#315bc2',marginTop:8},progressUnit:{fontSize:14,color:'#6d84aa'},progressTrack:{height:5,borderRadius:3,backgroundColor:'#cddaf4',marginVertical:16},progressFill:{height:5,borderRadius:3,backgroundColor:'#3b65d6'},primary:{backgroundColor:'#3259d8',padding:15,borderRadius:8,alignItems:'center',minHeight:48},primaryText:{fontSize:15,fontWeight:'600',color:'white'},lastTitle:{fontSize:12,lineHeight:20,color:'#637da7',marginTop:12},tabs:{flexDirection:'row',gap:8,marginTop:28,marginBottom:16},tab:{flex:1,padding:10,alignItems:'center',borderRadius:8},selectedTab:{backgroundColor:'#e8eef9'},tabText:{fontSize:12,fontWeight:'600',color:'#45648e'},lesson:{flexDirection:'row',alignItems:'center',gap:14,padding:18,borderRadius:10,backgroundColor:'white',borderWidth:1,borderColor:'#dbe4f0',marginBottom:10},lessonNumber:{width:32,height:34,borderRadius:6,backgroundColor:'#edf3ff',alignItems:'center',justifyContent:'center'},lessonNumberText:{fontSize:12,color:'#4974be',fontWeight:'600'},lessonCopy:{flex:1},category:{fontSize:10,color:'#8196b5',marginBottom:5},lessonHead:{flexDirection:'row',flexWrap:'wrap',alignItems:'baseline',columnGap:8},lessonKind:{fontSize:12,fontWeight:'600',color:'#5b769c'},lessonTitle:{fontSize:17,fontWeight:'600',color:'#28486c',lineHeight:25},description:{fontSize:12,lineHeight:21,color:'#7187a4',marginTop:5},arrow:{fontSize:26,color:'#8ca2c0'},about:{marginTop:25,padding:20,borderTopWidth:1,borderColor:'#d8e1ee'},aboutTitle:{fontSize:15,fontWeight:'600',color:'#4e698f'},aboutText:{fontSize:12,lineHeight:23,color:'#7085a2',marginTop:12},version:{fontSize:14,fontWeight:'600',color:'#526d94',marginTop:18},toolbar:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:6,gap:4,borderBottomWidth:1,borderColor:'#d6e0f0',backgroundColor:'#fff'},toolButton:{minHeight:44,minWidth:44,paddingHorizontal:10,alignItems:'center',justifyContent:'center'},toolText:{fontSize:13,color:'#4267ad'},readerTitle:{flex:1,fontSize:13,fontWeight:'600',lineHeight:19,color:'#344f74'},starButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},star:{fontSize:27,color:'#7490b9'},marked:{color:'#b98929'},shareStatus:{padding:10,backgroundColor:'#e8f0ff'},shareText:{fontSize:12,textAlign:'center',color:'#4d6a94'},menuHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:10},menuTitle:{fontSize:22,fontWeight:'700',color:'#254566'},menuBody:{padding:20},menuRow:{paddingVertical:17,borderBottomWidth:1,borderColor:'#dce4f0'},menuSection:{fontSize:15,fontWeight:'700',color:'#5376a6',marginTop:28,marginBottom:7},menuChapter:{fontSize:15,color:'#436186',lineHeight:24},bookmarkRow:{backgroundColor:'white',borderRadius:9,borderWidth:1,borderColor:'#dce4f0',marginBottom:10,padding:16,flexDirection:'row',alignItems:'center'},bookmarkOpen:{flex:1},empty:{fontSize:15,lineHeight:29,color:'#7187a4',padding:26,textAlign:'center'},body:{fontSize:15,lineHeight:26,color:'#526b8e'},error:{position:'absolute',top:0,right:0,bottom:0,left:0,justifyContent:'center',gap:20,padding:30,backgroundColor:'#f6f8fc'}
});
