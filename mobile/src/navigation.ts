export const ROOT_TABS = [
  {id:'home',title:'ホーム',icon:'⌂'},
  {id:'materials',title:'教材',icon:'▤'},
  {id:'analysis',title:'解析',icon:'∿'},
  {id:'input',title:'Inputデータ',icon:'{ }'},
  {id:'settings',title:'設定',icon:'⚙'},
] as const;
export type TabKey = typeof ROOT_TABS[number]['id'];
