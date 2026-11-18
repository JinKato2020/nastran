import {Image} from 'react-native';
// Lucide source SVGs and both ISC/MIT notices are in assets/ui-icons.
const sources={
 route:require('../assets/ui-icons/route.png'),braces:require('../assets/ui-icons/braces.png'),axes:require('../assets/ui-icons/axis-3d.png'),move:require('../assets/ui-icons/move.png'),points:require('../assets/ui-icons/git-fork.png'),orientation:require('../assets/ui-icons/move-3d.png'),files:require('../assets/ui-icons/files.png'),boxes:require('../assets/ui-icons/boxes.png'),folders:require('../assets/ui-icons/folder-tree.png'),cpu:require('../assets/ui-icons/cpu.png'),results:require('../assets/ui-icons/chart-no-axes-combined.png'),bookmark:require('../assets/ui-icons/bookmark.png'),search:require('../assets/ui-icons/search.png'),outward:require('../assets/ui-icons/arrow-up-right.png'),forward:require('../assets/ui-icons/arrow-right.png'),book:require('../assets/ui-icons/book-open.png'),home:require('../assets/ui-icons/house.png'),activity:require('../assets/ui-icons/activity.png'),settings:require('../assets/ui-icons/settings-2.png'),check:require('../assets/ui-icons/check.png'),down:require('../assets/ui-icons/chevron-down.png'),right:require('../assets/ui-icons/chevron-right.png'),plus:require('../assets/ui-icons/plus.png'),back:require('../assets/ui-icons/arrow-left.png'),trash:require('../assets/ui-icons/trash-2.png'),
};
export type IconName=keyof typeof sources;
export function UiIcon({name,color,size=20}:{name:IconName;color:string;size?:number}){
 return <Image source={sources[name]} resizeMode="contain" style={{width:size,height:size,tintColor:color,flexShrink:0}} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"/>;
}
