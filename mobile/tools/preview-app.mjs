// Browser harness for the real App.tsx. Native OS APIs are explicitly mocked.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'.qa/app');fs.mkdirSync(out,{recursive:true});
const mocks={
 'expo-status-bar':'export const StatusBar=()=>null;',
 'react-native-safe-area-context':`import React from 'react';import {View} from 'react-native';export const SafeAreaProvider=({children})=>children;export const SafeAreaView=({edges,...props})=><View {...props}/>;`,
 '@react-native-async-storage/async-storage':`export default {getItem:async k=>localStorage.getItem(k),setItem:async(k,v)=>localStorage.setItem(k,v)};`,
 'expo-clipboard':`export const setStringAsync=async text=>{window.__copied=text;};`,
 'expo-file-system/legacy':`window.__nativeFiles={};export const cacheDirectory='mock://cache/';export const EncodingType={Base64:'base64'};export const makeDirectoryAsync=async()=>{};export const writeAsStringAsync=async(p,v)=>{window.__nativeFiles[p]=v;};export const deleteAsync=async()=>{};`,
 'expo-sharing':`window.__shares=[];export const isAvailableAsync=async()=>true;export const shareAsync=async(uri,options)=>{window.__shares.push({uri,options,data:window.__nativeFiles[uri]});};`,
 'react-native-webview':`import React,{forwardRef,useRef,useEffect,useImperativeHandle}from 'react';import{View}from'react-native';export const WebView=forwardRef(({source,onMessage,style},ref)=>{const frame=useRef(null);const handler=useRef(onMessage);handler.current=onMessage;useEffect(()=>{const f=e=>{if(e.source===frame.current?.contentWindow&&e.data?.kind==='nastran')handler.current({nativeEvent:{data:e.data.data}});};window.addEventListener('message',f);return()=>window.removeEventListener('message',f);},[]);useImperativeHandle(ref,()=>({injectJavaScript(code){if(code.startsWith('window.__nastranReply(')){const args=JSON.parse('['+code.slice('window.__nastranReply('.length,code.indexOf(');true;'))+']');frame.current.contentWindow.__nastranReply(...args);}},reload(){}}));const html=source.html.replace('<head>','<head><script>window.ReactNativeWebView={postMessage(data){parent.postMessage({kind:"nastran",data},"*");}};<'+ '/script>');return <View style={style}><iframe title="教材" ref={frame} srcDoc={html} style={{border:0,flex:1,width:'100%',height:'100%'}}/></View>;});`
};
for(const [name,code]of Object.entries(mocks))fs.writeFileSync(path.join(out,name.replace(/[^a-z0-9]/gi,'_')+'.jsx'),code);
const aliases=Object.fromEntries(Object.keys(mocks).map(name=>[name,path.join(out,name.replace(/[^a-z0-9]/gi,'_')+'.jsx')]));
fs.writeFileSync(path.join(out,'entry.jsx'),`import React from 'react';import{createRoot}from'react-dom/client';import App from '../../App';createRoot(document.getElementById('root')).render(<App/>);`);
await build({entryPoints:[path.join(out,'entry.jsx')],outfile:path.join(out,'app.js'),bundle:true,loader:{'.png':'dataurl'},platform:'browser',jsx:'automatic',define:{__DEV__:'true','process.env.NODE_ENV':'"development"'},alias:{...aliases,'react-native':'react-native-web'},resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.jsx','.js','.json'],logLevel:'warning'});
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nastran アプリ画面確認</title><style>html,body,#root{margin:0;width:100%;height:100%;}#root{display:flex;flex-direction:column;}</style><div id="root"></div><script src="app.js"></script></html>');
console.log('App.tsx browser harness ready at .qa/app (native sharing mocked).');
