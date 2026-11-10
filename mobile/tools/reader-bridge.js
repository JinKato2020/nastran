(function(){
 'use strict';
 const boot=/*__BOOT__*/;
 const pending=new Map();let requestId=0;
 function post(message){window.ReactNativeWebView.postMessage(JSON.stringify({...message,session:boot.session}));}
 window.__nastranReply=function(id,ok,error){const p=pending.get(id);if(!p)return;clearTimeout(p.timer);pending.delete(id);ok?p.resolve():p.reject(new Error(error||'処理できませんでした。'));};
 function request(message){return new Promise((resolve,reject)=>{const id=String(++requestId);const timer=setTimeout(()=>{pending.delete(id);reject(new Error('応答を確認できませんでした。'));},120000);pending.set(id,{resolve,reject,timer});post({...message,id});});}
 function report(error){post({type:'notice',message:error.message||'操作を完了できませんでした。'});}
 const storage={'nastran-note-v1':boot.progress,'nastran-course-v1':boot.courseProgress||'[]'};
 Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:key=>storage[key]??null,setItem:(key,value)=>{storage[key]=String(value);if(key==='nastran-note-v1')post({type:'progress',value:String(value)});if(key==='nastran-course-v1')post({type:'courseProgress',value:String(value)});},removeItem:key=>{delete storage[key];if(key==='nastran-note-v1')post({type:'progress',value:'[]'});},clear:()=>{delete storage['nastran-note-v1'];post({type:'progress',value:'[]'});}}});
 Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:text=>request({type:'copy',text:String(text)})}});
 const blobs=new Map(),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL);
 URL.createObjectURL=blob=>{const url=create(blob);blobs.set(url,blob);return url;};
 URL.revokeObjectURL=url=>{blobs.delete(url);revoke(url);};
 function shareBlob(url,name){const blob=blobs.get(url);if(!blob){report(new Error('保存内容を読み出せませんでした。'));return;}
  const reader=new FileReader();reader.onload=()=>request({type:'share',name,base64:String(reader.result).split(',')[1]}).catch(report);reader.onerror=()=>report(new Error('ファイルの読み出しに失敗しました。'));reader.readAsDataURL(blob);
 }
 function handle(a){
  const raw=a.getAttribute('href')||'';
  if(raw.startsWith('blob:')){shareBlob(raw,a.download);return true;}
  let url;try{url=new URL(raw,'https://nastran.invalid/'+boot.path);}catch{return true;}
  if(url.origin==='https://nastran.invalid'){
   const target=url.pathname.slice(1);
   if(boot.downloads.includes(target)){request({type:'asset',path:target}).catch(report);return true;}
   if(target===boot.path){if(url.hash!==location.hash)location.hash=url.hash;else if(url.hash)document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();return true;}
   position();post({type:'navigate',path:target,hash:url.hash});return true;
  }
  if(url.protocol==='https:')post({type:'external',url:url.href});
  return true;
 }
 const click=HTMLAnchorElement.prototype.click;
 HTMLAnchorElement.prototype.click=function(){if(this.download||this.href.startsWith('blob:')){handle(this);return;}click.call(this);};
 document.addEventListener('click',event=>{const a=event.target.closest?.('a[href]');if(a){event.preventDefault();handle(a);}},true);
 window.open=url=>{const a=document.createElement('a');a.href=url;handle(a);return null;};
 let timer;function position(){post({type:'position',path:boot.path,hash:location.hash,y:Math.max(0,window.scrollY)});}
 // Inline WebViews can have about:blank/srcdoc URLs with a different base URI.
 // Resolve hash-only replacements against the document URL and notify native bookmarks.
 const replace=history.replaceState.bind(history);
 history.replaceState=function(state,title,url){
  const target=typeof url==='string'&&url.startsWith('#')?location.href.split('#')[0]+url:url;
  replace(state,title,target);position();
 };
 addEventListener('hashchange',position);
 addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(position,200);},{passive:true});
 if(boot.hash)location.hash=boot.hash;
 document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{if(boot.y>0)window.scrollTo(0,boot.y);position();post({type:'ready'});},150);});
})();
