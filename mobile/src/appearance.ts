export const HOME_DESIGNS = [
  {id:'graphite',name:'グラファイト',description:'明るい背景と立体画像。基礎項目は2列で表示。'},
  {id:'blueprint',name:'ブループリント',description:'濃紺の製図風。基礎・実務・しおりを切り替え。'},
  {id:'minimal',name:'ミニマル',description:'落ち着いた生成り色。番号付きの一覧で表示。'},
] as const;
export type HomeDesign = typeof HOME_DESIGNS[number]['id'];
export const DEFAULT_HOME_DESIGN:HomeDesign='blueprint';
export function homeDesign(value:unknown):HomeDesign {
  return HOME_DESIGNS.some(d=>d.id===value)?value as HomeDesign:DEFAULT_HOME_DESIGN;
}
export type Palette={background:string;surface:string;text:string;muted:string;line:string;soft:string;accent:string;accentSoft:string;onAccent:string;bookmark:string;dark:boolean};
export const PALETTES:Record<HomeDesign,Palette>={
  graphite:{background:'#f4f5f7',surface:'#ffffff',text:'#17212d',muted:'#5b6878',line:'#dce1e8',soft:'#edf0f5',accent:'#225ce8',accentSoft:'#e9f0fe',onAccent:'#ffffff',bookmark:'#976400',dark:false},
  blueprint:{background:'#122134',surface:'#15283c',text:'#eaf2fc',muted:'#a4b9ce',line:'#2e465f',soft:'#1d354d',accent:'#a7dcff',accentSoft:'#264663',onAccent:'#10243a',bookmark:'#ffda80',dark:true},
  minimal:{background:'#faf9f6',surface:'#faf9f6',text:'#242521',muted:'#686a65',line:'#deded7',soft:'#eeeee7',accent:'#262d26',accentSoft:'#e9eae1',onAccent:'#ffffff',bookmark:'#876400',dark:false},
};
