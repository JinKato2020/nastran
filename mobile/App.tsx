import appConfig from './app.json';
import { createContext, Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, BackHandler, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { NAVIGATION, DOWNLOADS, readerHTML, titleFor } from './src/content';
import { updateLessons } from './src/content-ota';
import type { UpdatedPages } from './src/content-ota-core';
import { ROOT_TABS, type TabKey } from './src/navigation';
import { INPUT_INDEX, inputGroups, inputIndexFromHTML, isInputHome, searchInput } from './src/input-home';
import { EMPTY_STATE, externalURL, filePayload, position, progress, courseProgress, restore, samePlace, type Position, type SavedState } from './src/protocol';
import {PALETTES,type Palette} from './src/appearance';
import {HomeScreen,HomeDesignPicker,INITIAL_HOME_UI} from './src/home-screen';
import {UiIcon,type IconName} from './src/ui-icon';
import {UI_ICON_LICENSE} from './src/ui-icon-license';
import {canOpenLesson, FREE_ANALYSIS_HASHES, isAnalysisIndex} from './src/pro-access';
import type {ProPurchases} from './src/pro-purchases';
import {nativeProPurchases} from './src/pro-purchases-native';
import {useProAccess} from './src/use-pro-access';

const STORAGE_KEY='nastran-learning-state-v1';
type Entry=Position&{key:string};
let entryNumber=0;
const newEntry=(p:Position):Entry=>({...p,key:String(++entryNumber)});
type CourseItem={key?:string;title:string;description:string;path:string;hash:string;kind?:string;group?:string};
type CourseGroup={key:string;title:string;description:string;items:CourseItem[]};
const analysisDescriptions:Record<string,string>={
 '構造・静解析':'静解析・内圧とメッシュ収束・線形座屈',
 '振動・動解析':'固有値・周波数応答・過渡応答',
 '熱解析':'熱伝導・温度変化による熱応力',
 '非線形・破壊':'大変形・弾塑性・接触と締結・亀裂先端',
 '検証・再実行':'モデル検証・リスタート・データベース管理',
};
const analysisGroups=NAVIGATION.analyses.reduce<CourseGroup[]>((groups,item)=>{
 const title=item.group;
 let group=groups.find(g=>g.key===title);
 if(!group){group={key:title,title,description:analysisDescriptions[title]||'',items:[]};groups.push(group);}
 group.items.push(item);return groups;
},[]);

function Reader({entry,saved,updatedHTML,onMessage,onExternal,onNavigate,onRestart,webRef,freeAnalysis}:{entry:Entry;freeAnalysis:boolean;saved:SavedState;updatedHTML?:string;onMessage:(event:WebViewMessageEvent)=>void;onExternal:(url:string)=>void;onNavigate:(p:Position)=>void;onRestart:()=>void;webRef:React.RefObject<WebView<object>|null>}){
  const styles=useContext(StylesContext);
  // Freeze the initial HTML: progress and scroll messages must not reload the reader.
  const [source]=useState(()=>({html:readerHTML(entry,saved.progress,entry.key,saved.courseProgress,saved.textScale,updatedHTML,freeAnalysis?FREE_ANALYSIS_HASHES:undefined),baseUrl:'https://nastran.invalid/'+entry.path}));
  const [error,setError]=useState(false);
  return <View style={styles.reader}>
    <WebView<object> ref={webRef} source={source} originWhitelist={['*']} style={styles.reader} javaScriptEnabled domStorageEnabled
      allowsBackForwardNavigationGestures={false} setSupportMultipleWindows={false} allowFileAccess={false} mixedContentMode="never"
      onMessage={onMessage} onError={()=>setError(true)} onContentProcessDidTerminate={onRestart} onRenderProcessGone={onRestart}
      onOpenWindow={({nativeEvent})=>onExternal(nativeEvent.targetUrl)}
      onShouldStartLoadWithRequest={req=>{
        if(req.url==='about:blank'||req.url.startsWith('about:blank#'))return true;
        try{const u=new URL(req.url);if(u.origin==='https://nastran.invalid'){
          const p=position({path:u.pathname.slice(1),hash:u.hash,y:0});
          if(u.pathname.slice(1)===entry.path&&(!freeAnalysis||!u.hash||
            (p&&canOpenLesson(p,false))))return true;
          if(p)onNavigate(p);
          return false;
        }}catch{return false;}
        onExternal(req.url);return false;
      }} />
    {error&&<View style={styles.error}><Text style={styles.body}>教材を表示できませんでした。</Text><Pressable style={styles.primary} onPress={onRestart}><Text style={styles.primaryText}>もう一度開く</Text></Pressable></View>}
  </View>;
}

// All five tab roots use this exact native header, including Input.
function TabHeader({tab}:{tab:TabKey}){
 const styles=useContext(StylesContext);
 const compact=useWindowDimensions().width<350;
 return <View style={[styles.brandRow,compact&&styles.compactBrandRow]} testID="tab-header"><Image style={styles.logo} source={require('./assets/icon-fem-guide-for-nas.png')} accessibilityLabel="FEM Guide for nas" resizeMode="contain"/><Text style={styles.screenTitle} accessibilityRole="header" testID="tab-title" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{ROOT_TABS.find(t=>t.id===tab)?.title}</Text><View style={styles.brandMark}><Text style={[styles.brand,compact&&styles.compactBrand]}>FEM Guide for nas</Text><Text style={[styles.brandSub,compact&&styles.compactBrandSub]}>非公式学習教材</Text></View></View>;
}

// Materials, Analysis and Input share the same chapter markup and styles.
function LessonGroup({title,description,expanded,onToggle,children,locked=false}:{title:string;description:string;expanded:boolean;onToggle:()=>void;children:React.ReactNode;locked?:boolean}){
 const styles=useContext(StylesContext);
 return <View style={styles.lessonGroup} testID="lesson-group">
   <Pressable style={styles.lessonGroupHeader} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{expanded}} aria-expanded={expanded} onPress={onToggle} testID="lesson-group-toggle">
     <View style={styles.lessonCopy}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.description}>{description}</Text></View>
     {locked&&<Text style={styles.proBadge}>Pro</Text>}<Text style={styles.arrow}>{expanded?'−':'＋'}</Text>
   </Pressable>
   {expanded&&<View style={styles.lessonGroupBody} testID="lesson-group-body">{children}</View>}
 </View>;
}

function LearningApp({purchaseClient}:{purchaseClient:ProPurchases|null}){
  const pro=useProAccess(purchaseClient);
  const [proVisible,setProVisible]=useState(false);
  const [lockedTitle,setLockedTitle]=useState('');
  // Purchase opens from Settings or from a Pro section the reader tapped; Pro chapters stay browsable.
  function showPro(title=''){
    setLockedTitle(title);
    pro.clearNotice();
    setMenu(false);
    setProVisible(true);
    if(!pro.isPro)void pro.loadOffer();
  }
  const canOpen=(p:Pick<Position,'path'|'hash'>)=>canOpenLesson(p,pro.isPro);
  const [saved,setSaved]=useState<SavedState>(EMPTY_STATE);
  const styles=APP_STYLES[saved.homeDesign],palette=PALETTES[saved.homeDesign];
  const [homeUI,setHomeUI]=useState(INITIAL_HOME_UI);
  const [showIconLicense,setShowIconLicense]=useState(false);
  const savedRef=useRef(saved);
  const [loaded,setLoaded]=useState(false);
  const [entry,setEntry]=useState<Entry|null>(null);
  const entryRef=useRef<Entry|null>(null);
  const current=useRef<Position|null>(null);
  const readerReported=useRef(false);
  const trail=useRef<Position[]>([]);
  const rootOrigin=useRef<TabKey>('home');
  const webRef=useRef<WebView<object>>(null);
  const [menu,setMenu]=useState(false);
  const [tab,setTab]=useState<TabKey>('home');
  const [inputQuery,setInputQuery]=useState('');
  const [inputIndex,setInputIndex]=useState(INPUT_INDEX);
  const [inputGroup,setInputGroup]=useState('');
  const [analysisGroup,setAnalysisGroup]=useState('');
  const inputChapters=useMemo(()=>inputGroups(inputIndex),[inputIndex]);
  const inputMatches=useMemo(()=>searchInput(inputIndex.entries,inputQuery),[inputIndex,inputQuery]);
  const tabSessions=useRef<Partial<Record<TabKey,{position:Position|null;trail:Position[];origin:TabKey}>>>({});
  const [sharing,setSharing]=useState(false);
  const shareBusy=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const storageFailed=useRef(false);
  const readyToSave=useRef(false);
  const writeQueue=useRef<Promise<void>>(Promise.resolve());
  const [locationTitle,setLocationTitle]=useState('');
  const updatedPages=useRef<UpdatedPages>({});
  const otaStarted=useRef(false);
  useEffect(()=>{
    if(otaStarted.current)return;
    otaStarted.current=true;
    void updateLessons(pages=>{
      const place=current.current;
      const changed=place && pages[place.path]!==updatedPages.current[place.path];
      updatedPages.current=pages;
      setInputIndex(inputIndexFromHTML(pages['bulk.html']));
      if(changed && place){
        const refreshed=newEntry(place);
        readerReported.current=false;
        entryRef.current=refreshed;
        setEntry(refreshed);
      }
    });
  },[]);
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
    if(p.path==='bulk.html'||p.path==='comparisons.html')return 'input';
    if(p.path==='analysis.html'||p.path==='relations.html')return 'analysis';
    if(p.path==='errors.html'||NAVIGATION.operations.some(item=>item.path===p.path)||
      NAVIGATION.homeResources.some(item=>item.path===p.path&&item.hash===p.hash)||
      NAVIGATION.intro.some(item=>item.path===p.path&&item.hash===p.hash)||
      (p.path==='index.html'&&(/^#chapter-\d+$/.test(p.hash)||p.hash==='#lab')))return 'home';
    return 'materials';
  }
  function open(p:Position,remember=true){
    if(!pro.isPro&&isAnalysisIndex(p)){setTab('analysis');root();return;}
    if(!canOpen(p)){showPro(titleFor(p));return;}
    if(isInputHome(p)){setTab('input');if(p.hash.startsWith('#family/'))setInputGroup(p.hash.slice(8));root();return;}
    if(!current.current)rootOrigin.current=tab;
    setTab(ownerTab(p));
    if(remember&&current.current)trail.current=[...trail.current.slice(-49),current.current];
    const e=newEntry(p);current.current=p;readerReported.current=false;entryRef.current=e;setEntry(e);setLocationTitle(titleFor(p));setMenu(false);
    updateSaved({...savedRef.current,last:p});
  }
  function root(){void persist();entryRef.current=null;setEntry(null);current.current=null;trail.current=[];setMenu(false);}
  function activateTab(value:TabKey,target?:Position){
    tabSessions.current[tab]={position:current.current,trail:[...trail.current],origin:rootOrigin.current};
    const previous=tabSessions.current[value];
    setTab(value);setMenu(false);
    if(target){trail.current=[];open(target,false);rootOrigin.current=value;return;}
    if(value==='settings'||value===tab){root();return;}
    const next=previous?.position;
    if(next&&canOpen(next)){open(next,false);trail.current=previous?.trail||[];rootOrigin.current=previous?.origin||value;}else root();
  }
  function home(){tabSessions.current[tab]={position:current.current,trail:[...trail.current],origin:rootOrigin.current};setTab('home');root();}
  function back(){
    let previous=trail.current.pop();
    while(previous&&!canOpen(previous))previous=trail.current.pop();
    if(previous)open(previous,false);else{setTab(rootOrigin.current);root();}
  }
  useEffect(()=>{
    const active=entryRef.current;
    if(active&&!canOpenLesson(active,pro.isPro))root();
  },[pro.isPro]);
  useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(menu){setMenu(false);return true;}if(entry){back();return true;}if(tab!=='home'){home();return true;}return false;});return()=>sub.remove();},[entry,menu,tab,pro.isPro]);
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
    const active=entryRef.current;
    if(!active||!canOpen(active))return;
    const session=m.session as string;
    try{
      if(m.type==='courseProgress'){updateSaved({...savedRef.current,courseProgress:courseProgress(m.value)});}
      else if(m.type==='progress'){updateSaved({...savedRef.current,progress:progress(m.value)});}
      else if(m.type==='position'){
        const p=position(m);if(!p||p.path!==entryRef.current?.path)return;
        if(isInputHome(p)||(!pro.isPro&&isAnalysisIndex(p))){open(p,false);return;}
        if(!canOpen(p)){
          const previous=current.current;
          if(previous&&canOpen(previous))open(previous,false);else root();
          showPro(titleFor(p));
          return;
        }
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
  const [materialGroup,setMaterialGroup]=useState('elements');
  const materialGroups=[
    {key:'elements',title:'各要素理論',description:'ばね・梁・シェル・ソリッド・結合・剛体・GENELの仕組み・モデル化・結果の読み方',items:NAVIGATION.elements},
    {key:'materialTheory',title:'材料理論',description:'弾性・異方性・積層・熱膨張・塑性を、式と操作図で学ぶ',items:NAVIGATION.materialTheory},
    {key:'boundaryTheory',title:'境界条件と拘束',description:'支持・指定変位・多点拘束と、過拘束・拘束不足を学ぶ',items:NAVIGATION.boundaryTheory},
    {key:'loadTheory',title:'荷重の理論',description:'集中・分布・慣性・温度荷重から、組合せと検算へ',items:NAVIGATION.loadTheory},
    {key:'contactTheory',title:'接触・摩擦・締結',description:'開閉・摩擦・締付けから荷重分担と検証へ',items:NAVIGATION.contactTheory},
    {key:'dampingTheory',title:'減衰の理論',description:'損失の意味・測定・モデル化から入力と検証へ',items:NAVIGATION.dampingTheory},
    {key:'theory',title:'各解析技術理論',description:'共通の解析技術から、解析ごとの理論へ',items:[...NAVIGATION.common,...NAVIGATION.materials]},
  ];
  const menuGroups:{title:string;tab:TabKey;items:CourseItem[]}[]=[
    {title:'最初に学ぶ',tab:'home',items:[...NAVIGATION.intro,NAVIGATION.homeResources[0]]},
    {title:'モデル作成・実行・結果',tab:'home',items:NAVIGATION.operations},
    {title:'資料・サポート',tab:'home',items:[NAVIGATION.homeResources[1]]},
    ...materialGroups.map(g=>({title:g.title,tab:'materials' as TabKey,items:g.items})),
    {title:'解析',tab:'analysis',items:NAVIGATION.analyses},
    {title:'Inputデータ',tab:'input',items:[{title:'入力データ学習',description:'5つの入口・語句検索 → カテゴリー → カード',path:'bulk.html',hash:''}]},
    {title:'エラーメッセージ',tab:'home',items:[{title:'エラー検索と意味',description:'番号・診断文・F06から検索',path:'errors.html',hash:''}]},
  ];
  const marked=saved.bookmarks.some(b=>samePlace(b,current.current));
  const complete=JSON.parse(saved.courseProgress).length;
  function lesson(l:CourseItem,index:number){return <Pressable key={l.path+l.hash} style={styles.lesson} onPress={()=>open({path:l.path,hash:l.hash,y:0},false)} accessibilityRole="button" accessibilityLabel={l.title}>
    <View style={styles.lessonNumber}><Text style={styles.lessonNumberText}>{String(index+1).padStart(2,'0')}</Text></View><View style={styles.lessonCopy}><View style={styles.lessonHead}><Text style={styles.lessonTitle}>{l.title}</Text>{l.kind?<Text style={styles.lessonKind}>{l.kind}</Text>:null}{!canOpen(l)&&<Text style={styles.proBadge}>Pro</Text>}</View><Text style={styles.description}>{l.description}</Text></View><Text style={styles.arrow}>›</Text>
  </Pressable>;}
  function groupedLessons(items:CourseItem[],offset=0){
    return items.map((item,index)=><Fragment key={item.path+item.hash}>
      {item.group&&item.group!==items[index-1]?.group&&item.group!=='共通'&&<Text accessibilityRole="header" style={styles.menuSection}>{item.group}</Text>}
      {lesson(item,index+offset)}
    </Fragment>);
  }
  if(!loaded)return <SafeAreaView style={styles.app}><ActivityIndicator style={styles.loading} color="#3259d8"/><Text style={styles.loadingText}>教材を準備しています</Text></SafeAreaView>;
  return <StylesContext.Provider value={styles}><SafeAreaView style={styles.app} edges={['top','bottom']}>
    <StatusBar style={palette.dark?'light':'dark'}/>
    {entry&&canOpen(entry)?<>
      <View style={styles.toolbar}><Pressable accessibilityRole="button" onPress={back} style={styles.toolButton}><Text style={styles.toolText}>‹ 戻る</Text></Pressable><Text style={styles.readerTitle} numberOfLines={2}>{locationTitle}</Text><Pressable onPress={bookmark} accessibilityRole="button" accessibilityLabel={marked?'しおりを外す':'しおりを付ける'} accessibilityState={{selected:marked}} style={styles.starButton}><Text style={[styles.star,marked&&styles.marked]}>{marked?'★':'☆'}</Text></Pressable><Pressable onPress={()=>setMenu(true)} accessibilityRole="button" style={styles.toolButton}><Text style={styles.toolText}>目次</Text></Pressable></View>
      <Reader key={entry.key+':'+pro.isPro} entry={entry} saved={saved} freeAnalysis={!pro.isPro&&entry.path==='analysis.html'} updatedHTML={updatedPages.current[entry.path]} onMessage={message} onExternal={external} onNavigate={open} onRestart={()=>{if(current.current)open(current.current,false);}} webRef={webRef}/>
      {sharing&&<View style={styles.shareStatus} accessibilityLiveRegion="polite"><Text style={styles.shareText}>共有メニューで「ファイルに保存」を選べます</Text></View>}
    </>:<ScrollView key={tab} style={styles.screen} contentContainerStyle={styles.home} keyboardShouldPersistTaps="handled" testID="tab-screen">
      <TabHeader tab={tab}/>
      {tab==='home'&&<>
        <HomeScreen design={saved.homeDesign} saved={saved} ui={homeUI} onUI={change=>setHomeUI(old=>({...old,...change}))} onOpen={p=>open(p,false)} canOpen={canOpen} isPro={pro.isPro} onDeleteBookmark={p=>updateSaved({...savedRef.current,bookmarks:savedRef.current.bookmarks.filter(item=>!samePlace(item,p))})}/></>}
      {tab==='materials'&&<><Text style={styles.screenLead}>分類を選び、経験と目的に合う内容から学べます。</Text>{materialGroups.map(g=><LessonGroup key={g.key} title={g.title} description={g.description} expanded={materialGroup===g.key} locked={!pro.isPro&&g.key!=='elements'} onToggle={()=>setMaterialGroup(materialGroup===g.key?'':g.key)}>{g.key==='theory'?<>
          <Text accessibilityRole="header" style={styles.menuSection}>共通の解析技術論</Text>
          {NAVIGATION.common.map(lesson)}
          <Text accessibilityRole="header" style={styles.menuSection}>解析ごとの理論</Text>
          {groupedLessons(NAVIGATION.materials,NAVIGATION.common.length)}
        </>:g.items.map(lesson)}</LessonGroup>)}</>}
      {tab==='analysis'&&<><Text style={styles.screenLead}>分類を開き、解析条件・入力・出力・検証を確認できます。</Text>{analysisGroups.map(g=><LessonGroup key={g.key} title={g.title} description={g.description} expanded={analysisGroup===g.key} locked={!pro.isPro&&g.key!=='構造・静解析'} onToggle={()=>setAnalysisGroup(analysisGroup===g.key?'':g.key)}>{g.items.map(lesson)}</LessonGroup>)}</>}
      {tab==='input'&&<>
        <Text style={styles.screenLead}>章を開いてカテゴリーを選び、本文でカード・設定名を切り替えます。</Text>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon} accessibilityElementsHidden importantForAccessibility="no">⌕</Text>
          <TextInput style={[styles.searchText,styles.inputQuery]} value={inputQuery} onChangeText={setInputQuery} accessibilityLabel="語句・カード名で探す" placeholder="例：celas、変位、減衰" placeholderTextColor={palette.muted} autoCapitalize="none" autoCorrect={false} returnKeyType="search"/>
          {!!inputQuery&&<Pressable style={styles.toolButton} onPress={()=>setInputQuery('')} accessibilityRole="button" accessibilityLabel="検索語を消す"><Text style={styles.toolText}>解除</Text></Pressable>}
        </View>
        {inputQuery.trim()?<>
          <Text style={styles.description} accessibilityLiveRegion="polite">{inputMatches.length?`${inputMatches.length}件`:'該当するカードがありません。短い語句やカード名で検索してください。'}</Text>
          {inputMatches.map((card,index)=>lesson({title:card.id+' — '+card.title,description:(inputIndex.families.find(f=>f[0]===card.family)?.[1]||card.family)+' / '+card.category,path:'bulk.html',hash:'#'+card.key},index))}
        </>:inputChapters.map(g=><LessonGroup key={g.key} title={g.title} description={g.description} expanded={inputGroup===g.key} onToggle={()=>setInputGroup(inputGroup===g.key?'':g.key)}>{g.items.map(lesson)}</LessonGroup>)}
      </>}
      {tab==='settings'&&<>
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Proと購入</Text>
          <Text style={styles.description}>{pro.isPro?'Pro利用中':pro.checking?'購入状況を確認中':'無料版を利用中'}</Text>
          <Pressable style={styles.toolButton} accessibilityRole="button" onPress={()=>showPro()}><Text style={styles.toolText}>購入・復元を開く</Text></Pressable>
        </View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>ホームデザイン</Text><Text style={styles.description}>ホームの構成と、一覧・ヘッダーの配色を切り替えます。</Text><HomeDesignPicker value={saved.homeDesign} onChange={homeDesign=>updateSaved({...savedRef.current,homeDesign})}/></View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>本文の文字サイズ</Text><Text style={styles.description}>説明文のサイズを変更します。入力表は8文字の配置を保ちます。</Text><View style={styles.sizeOptions}>{([{value:1,label:'標準'},{value:1.15,label:'大'},{value:1.3,label:'特大'}]).map(x=><Pressable key={x.value} style={[styles.sizeOption,saved.textScale===x.value&&styles.selectedSize]} onPress={()=>updateSaved({...savedRef.current,textScale:x.value})} accessibilityRole="radio" accessibilityLabel={'文字サイズ '+x.label} accessibilityState={{checked:saved.textScale===x.value}} aria-checked={saved.textScale===x.value}><Text style={[styles.sizeOptionText,saved.textScale===x.value&&styles.selectedSizeText]}>{x.label}</Text></Pressable>)}</View></View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>保存データ</Text><Text style={styles.body}>学習記録としおりは端末内に保存します。基礎コースの読了は {complete} / 6、しおりは {saved.bookmarks.length} 件です。</Text><Text style={styles.description}>アプリの削除で端末内の記録も削除されます。</Text></View>
        <View style={styles.settingsCard}><Text style={styles.sectionTitle}>このアプリについて</Text><Text style={styles.body}>Nastranの非公式日本語教材です。基本解析の理論は共通で、カード解説・入力例・エラー検索はMSC Nastranを対象にしています。非線形・接触のSimcenter編では設定を確認する観点を紹介します。教材と入力例はオフラインで利用できます。</Text><Text style={styles.description}>Nastranを実行する機能はありません。原典の掲載結果と独自の検算値を区別しています。入力例はMSC Nastran本体では未実行です。原典PDFの参照には通信が必要です。</Text><Text style={styles.description}>本アプリは開発元の提供・認定を受けたものではありません。製品名・商標は各権利者に帰属します。</Text><Pressable accessibilityRole="button" onPress={()=>open({path:'analysis.html',hash:'#rights',y:0},false)}><Text style={styles.linkText}>出典・第三者ライセンス →</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="アイコンライセンス" onPress={()=>setShowIconLicense(true)}><Text style={styles.linkText}>アイコンライセンス →</Text></Pressable><Text style={styles.version}>バージョン {appConfig.expo.version}（{appConfig.expo.ios.buildNumber}）</Text></View>
      </>}
    </ScrollView>}
    <View style={styles.bottomNav} accessibilityRole="tablist" accessibilityLabel="メインナビゲーション">{ROOT_TABS.map(t=><Pressable key={t.id} style={[styles.bottomTab,tab===t.id&&styles.activeBottomTab]} onPress={()=>activateTab(t.id)} accessibilityRole="tab" accessibilityLabel={t.title} accessibilityState={{selected:tab===t.id}} aria-selected={tab===t.id}><UiIcon name={NAV_ICONS[t.id]} color={tab===t.id?palette.accent:palette.muted} size={22}/><Text style={[styles.navLabel,tab===t.id&&styles.activeNavText]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>{t.title}</Text></Pressable>)}</View>
    <Modal visible={menu} animationType="slide" onRequestClose={()=>setMenu(false)}><SafeAreaView style={styles.app}><View style={styles.menuHeading}><Text style={styles.menuTitle}>教材の目次</Text><Pressable onPress={()=>setMenu(false)} style={styles.toolButton} accessibilityRole="button"><Text style={styles.toolText}>閉じる</Text></Pressable></View><ScrollView contentContainerStyle={styles.menuBody}><Pressable onPress={home} style={styles.menuRow} accessibilityRole="button"><Text style={styles.lessonTitle}>ホームへ戻る</Text></Pressable>{menuGroups.map(group=><View key={group.title}><Text style={styles.menuSection}>{group.title}</Text>{group.items.map(l=><Pressable key={l.path+l.hash} style={styles.menuRow} onPress={()=>activateTab(group.tab,{path:l.path,hash:l.hash,y:0})} accessibilityRole="button" accessibilityLabel={l.title}><Text style={styles.lessonTitle}>{l.title}</Text><Text style={styles.description}>{l.description}</Text></Pressable>)}</View>)}</ScrollView></SafeAreaView></Modal>
    <Modal visible={proVisible} animationType="slide" onRequestClose={()=>setProVisible(false)}>
      <SafeAreaView style={styles.app}>
        <View style={styles.menuHeading}>
          <Text style={styles.menuTitle}>FEM Guide for nas Pro</Text>
          <Pressable style={styles.toolButton} accessibilityRole="button" onPress={()=>setProVisible(false)}><Text style={styles.toolText}>閉じる</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.home}>
          <View style={styles.settingsCard} testID="pro-panel">
            <Text style={styles.sectionTitle}>{pro.isPro?'Pro利用中':'すべての教材を解放'}</Text>
            {!!lockedTitle&&!pro.isPro&&<Text style={styles.body}>「{lockedTitle}」はProで利用できます。</Text>}
            <Text style={styles.body}>無料版は各要素理論、構造・静解析、Inputデータを利用できます。</Text>
            <Text style={styles.body}>Proは買い切りです。すべての教材・解析とホームの資料を利用できます。</Text>
            {!pro.isPro&&pro.offerStatus==='loading'&&<View accessibilityLiveRegion="polite"><ActivityIndicator color={palette.accent}/><Text style={styles.description}>価格を取得しています。</Text></View>}
            {!pro.isPro&&pro.available&&!pro.offer&&pro.offerStatus==='unavailable'&&<>
              <Text style={styles.description}>商品情報を取得できませんでした。通信を確認してください。</Text>
              <Pressable style={styles.toolButton} accessibilityRole="button" onPress={()=>void pro.loadOffer()} disabled={!!pro.operation}><Text style={styles.toolText}>価格を再取得</Text></Pressable>
            </>}
            {!pro.available&&<Text style={styles.description}>このビルドでは購入を利用できません。</Text>}
            {!pro.isPro&&pro.offer&&<Pressable style={[styles.primary,!!pro.operation&&styles.purchaseBusy]} accessibilityRole="button" disabled={pro.checking||!!pro.operation} onPress={()=>void pro.purchase()} testID="pro-buy"><Text style={styles.primaryText}>{pro.operation==='purchase'?'購入を確認中…':'Proを購入 − '+pro.offer.price}</Text></Pressable>}
            {pro.available&&<Pressable style={styles.toolButton} accessibilityRole="button" disabled={!!pro.operation} onPress={()=>void pro.restore()} testID="pro-restore"><Text style={styles.toolText}>{pro.operation==='restore'?'復元中…':'購入を復元'}</Text></Pressable>}
            {!!pro.notice&&<Text style={styles.body} accessibilityLiveRegion="polite" testID="pro-notice">{pro.notice}</Text>}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
    <Modal visible={showIconLicense} animationType="slide" onRequestClose={()=>setShowIconLicense(false)}><SafeAreaView style={styles.app}><View style={styles.menuHeading}><Text style={styles.menuTitle}>アイコンライセンス</Text><Pressable onPress={()=>setShowIconLicense(false)} style={styles.toolButton} accessibilityRole="button" accessibilityLabel="ライセンスを閉じる"><Text style={styles.toolText}>閉じる</Text></Pressable></View><ScrollView contentContainerStyle={styles.menuBody}><Text selectable style={styles.body}>{UI_ICON_LICENSE}</Text></ScrollView></SafeAreaView></Modal>
  </SafeAreaView></StylesContext.Provider>;
}

export function AppWithPurchases({purchaseClient}:{purchaseClient:ProPurchases|null}){
  return <SafeAreaProvider><LearningApp purchaseClient={purchaseClient}/></SafeAreaProvider>;
}

export default function App(){return <AppWithPurchases purchaseClient={nativeProPurchases}/>;}

function createAppStyles(c:Palette){return StyleSheet.create({
 lessonGroup:{marginBottom:14,borderWidth:1,borderColor:c.line,borderRadius:12,backgroundColor:c.surface,overflow:'hidden'},lessonGroupHeader:{padding:17,flexDirection:'row',alignItems:'center',gap:10,minHeight:72,backgroundColor:c.soft},lessonGroupBody:{padding:10,paddingBottom:0},
 compactBrandRow:{gap:8},compactBrand:{fontSize:10},compactBrandSub:{fontSize:9},
 inputQuery:{minHeight:48,minWidth:0,paddingVertical:10},
 screen:{flex:1},screenTitle:{fontSize:24,fontWeight:'700',color:c.text,flexShrink:1},brandMark:{marginLeft:'auto',alignItems:'flex-end'},homeFirst:{marginTop:16},searchRow:{flexDirection:'row',alignItems:'center',gap:10,minHeight:48,paddingHorizontal:14,borderRadius:10,backgroundColor:c.surface,borderWidth:1,borderColor:c.line,marginBottom:10},searchIcon:{fontSize:20,color:c.muted},searchText:{flex:1,fontSize:15,color:c.muted},screenLead:{fontSize:13,lineHeight:23,color:c.muted,marginTop:8,marginBottom:22},
 introCard:{padding:19,borderWidth:1,borderColor:c.line,backgroundColor:c.surface,borderRadius:14,marginBottom:16},cardEyebrow:{fontSize:10,letterSpacing:1.2,fontWeight:'700',color:c.muted,marginBottom:7},sectionTitle:{fontSize:20,lineHeight:28,fontWeight:'700',color:c.text},introRow:{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:15,borderTopWidth:1,borderColor:c.line,marginTop:8},introTitle:{fontSize:15,lineHeight:23,fontWeight:'600',color:c.text},errorCard:{padding:20,borderRadius:14,backgroundColor:c.soft,borderWidth:1,borderColor:c.line,marginBottom:16},linkText:{fontSize:13,fontWeight:'600',color:c.accent,marginTop:10},resumeCard:{padding:18,borderRadius:12,backgroundColor:c.surface,borderWidth:1,borderColor:c.line,gap:12,marginBottom:18},smallHeading:{fontSize:13,fontWeight:'600',color:c.muted},bookmarkHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:10},count:{fontSize:13,color:c.muted},settingsCard:{padding:20,borderRadius:12,backgroundColor:c.surface,borderWidth:1,borderColor:c.line,marginBottom:16,gap:8},sizeOptions:{flexDirection:'row',gap:8,marginTop:12},sizeOption:{flex:1,minHeight:46,borderRadius:8,borderWidth:1,borderColor:c.line,justifyContent:'center',alignItems:'center'},selectedSize:{backgroundColor:c.accent,borderColor:c.accent},sizeOptionText:{fontSize:14,color:c.muted,fontWeight:'600'},selectedSizeText:{color:c.onAccent},
 bottomNav:{flexDirection:'row',backgroundColor:c.surface,borderTopWidth:1,borderColor:c.line,paddingTop:4,paddingBottom:4,paddingHorizontal:4},bottomTab:{flex:1,minHeight:58,justifyContent:'center',alignItems:'center',gap:3,borderRadius:9,minWidth:0},activeBottomTab:{backgroundColor:c.accentSoft},navIcon:{fontSize:23,lineHeight:28,color:c.muted,fontWeight:'500'},navLabel:{fontSize:10,lineHeight:16,color:c.muted,fontWeight:'600'},activeNavText:{color:c.accent},
  proBadge:{fontSize:11,fontWeight:'700',color:c.accent},purchaseBusy:{opacity:.55}, groupIntro:{fontSize:13,lineHeight:23,color:c.muted,marginBottom:16},
 app:{flex:1,backgroundColor:c.background},reader:{flex:1,backgroundColor:c.background},loading:{marginTop:100},loadingText:{textAlign:'center',marginTop:20,color:c.muted},home:{padding:18,paddingBottom:30,maxWidth:760,width:'100%',alignSelf:'center'},brandRow:{flexDirection:'row',alignItems:'center',gap:10,paddingBottom:18,borderBottomWidth:1,borderColor:c.line,marginBottom:4},logo:{width:34,height:34,borderRadius:8,backgroundColor:'#fff',borderWidth:1,borderColor:c.line},brand:{fontSize:12,fontWeight:'700',color:c.text},brandSub:{fontSize:10,color:c.muted,marginTop:1},offline:{marginLeft:'auto',padding:7,borderRadius:6,backgroundColor:c.soft},offlineText:{fontSize:10,color:c.accent},hero:{fontSize:29,lineHeight:42,fontWeight:'700',color:c.text,marginTop:32},lead:{fontSize:14,lineHeight:25,color:c.muted,marginTop:12},progressCard:{padding:22,backgroundColor:c.accentSoft,borderRadius:14,marginTop:25,borderWidth:1,borderColor:c.line},progressLabel:{fontSize:13,color:c.muted},progressNumber:{fontSize:32,fontWeight:'700',color:c.accent,marginTop:8},progressUnit:{fontSize:14,color:c.muted},progressTrack:{height:5,borderRadius:3,backgroundColor:c.line,marginVertical:16},progressFill:{height:5,borderRadius:3,backgroundColor:c.accent},primary:{backgroundColor:c.accent,padding:15,borderRadius:8,alignItems:'center',minHeight:48},primaryText:{fontSize:15,fontWeight:'600',color:c.onAccent},lastTitle:{fontSize:12,lineHeight:20,color:c.muted,marginTop:12},tabs:{flexDirection:'row',gap:8,marginTop:28,marginBottom:16},tab:{flex:1,padding:10,alignItems:'center',borderRadius:8},selectedTab:{backgroundColor:c.soft},tabText:{fontSize:12,fontWeight:'600',color:c.muted},lesson:{flexDirection:'row',alignItems:'center',gap:14,padding:18,borderRadius:10,backgroundColor:c.surface,borderWidth:1,borderColor:c.line,marginBottom:10},lessonNumber:{width:32,height:34,borderRadius:6,backgroundColor:c.accentSoft,alignItems:'center',justifyContent:'center'},lessonNumberText:{fontSize:12,color:c.accent,fontWeight:'600'},lessonCopy:{flex:1},category:{fontSize:10,color:c.muted,marginBottom:5},lessonHead:{flexDirection:'row',flexWrap:'wrap',alignItems:'baseline',columnGap:8},lessonKind:{fontSize:12,fontWeight:'600',color:c.muted},lessonTitle:{fontSize:17,fontWeight:'600',color:c.text,lineHeight:25},description:{fontSize:12,lineHeight:21,color:c.muted,marginTop:5},arrow:{fontSize:26,color:c.muted},about:{marginTop:25,padding:20,borderTopWidth:1,borderColor:c.line},aboutTitle:{fontSize:15,fontWeight:'600',color:c.text},aboutText:{fontSize:12,lineHeight:23,color:c.muted,marginTop:12},version:{fontSize:14,fontWeight:'600',color:c.muted,marginTop:18},toolbar:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:6,gap:4,borderBottomWidth:1,borderColor:c.line,backgroundColor:c.surface},toolButton:{minHeight:44,minWidth:44,paddingHorizontal:10,alignItems:'center',justifyContent:'center'},toolText:{fontSize:13,color:c.accent},readerTitle:{flex:1,fontSize:13,fontWeight:'600',lineHeight:19,color:c.text},starButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},star:{fontSize:27,color:c.muted},marked:{color:c.bookmark},shareStatus:{padding:10,backgroundColor:c.accentSoft},shareText:{fontSize:12,textAlign:'center',color:c.muted},menuHeading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingTop:10},menuTitle:{fontSize:22,fontWeight:'700',color:c.text},menuBody:{padding:20},menuRow:{paddingVertical:17,borderBottomWidth:1,borderColor:c.line},menuSection:{fontSize:15,fontWeight:'700',color:c.accent,marginTop:28,marginBottom:7},menuChapter:{fontSize:15,color:c.muted,lineHeight:24},bookmarkRow:{backgroundColor:c.surface,borderRadius:9,borderWidth:1,borderColor:c.line,marginBottom:10,padding:16,flexDirection:'row',alignItems:'center'},bookmarkOpen:{flex:1},empty:{fontSize:15,lineHeight:29,color:c.muted,padding:26,textAlign:'center'},body:{fontSize:15,lineHeight:26,color:c.text},error:{position:'absolute',top:0,right:0,bottom:0,left:0,justifyContent:'center',gap:20,padding:30,backgroundColor:c.background}
});}
const APP_STYLES={graphite:createAppStyles(PALETTES.graphite),blueprint:createAppStyles(PALETTES.blueprint),minimal:createAppStyles(PALETTES.minimal)};
const StylesContext=createContext(APP_STYLES.blueprint);
const NAV_ICONS:Record<TabKey,IconName>={home:'home',materials:'book',analysis:'activity',input:'braces',settings:'settings'};
