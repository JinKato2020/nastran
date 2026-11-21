import bundle from './generated/lessons.json';
import {position} from './protocol';
import type {HomeDesign} from './appearance';

export type CourseItem = {title:string; description:string; path:string; hash:string; kind?:string; group?:string};
export type MaterialChapter = {key:string; title:string; description:string; sources:string[]};
type HomeSection = {key:string;title:string;description?:string;style:'cards'|'list';items:CourseItem[]};
type HomeContent = {hero:typeof bundle.course.home.hero;featured:string[];sections:HomeSection[];layouts:Record<HomeDesign,string[]>};
export type CourseIndex = {materialChapters:MaterialChapter[]; navigation:Record<string,CourseItem[]>; home:HomeContent; heroArt?:string;
  analysisHeadings:Record<string,{title:string;description:string}>; retiredLinks:string[]};
function imageFromHTML(html:string) {
  return /<script type="application\/json" id="nastran-home-art">"(data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+)"<\/script>/.exec(html)?.[1];
}
export const BUNDLED_INDEX:CourseIndex = {...bundle.course,heroArt:imageFromHTML(bundle.pages['index.html'])};

export function homeLinks(nav:CourseIndex['navigation']) {
  const support=nav.homeResources.find(item=>item.path==='index.html' && item.hash==='#linear-guide-help');
  return {support,basics:[...nav.intro,...nav.homeResources.filter(item=>item!==support)]};
}

export function isRetired(index:CourseIndex,p:{path:string;hash:string}) {
  const url=p.path+p.hash;
  return index.retiredLinks.some(key=>url===key || url.startsWith(key+'/'));
}

function validHome(home:HomeContent) {
  if (!home || !home.hero || !Object.keys(BUNDLED_INDEX.home.hero).every(key=>typeof home.hero[key as keyof HomeContent['hero']]==='string') ||
    !Array.isArray(home.featured) || !home.featured.every(key=>typeof key==='string') ||
    !Array.isArray(home.sections) || !home.sections.every(s=>s && typeof s.key==='string' && !!s.key &&
      typeof s.title==='string' && (s.description===undefined || typeof s.description==='string') &&
      ['cards','list'].includes(s.style) && Array.isArray(s.items) && s.items.every(validItem))) return false;
  const slots=['hero','resume','basics','work','segments','utilities','support',...home.sections.map(s=>s.key)];
  return new Set(slots).size===slots.length && home.layouts && (['graphite','blueprint','minimal'] as const).every(theme=>{
    const layout=home.layouts[theme];
    return Array.isArray(layout) && new Set(layout).size===layout.length && layout.every(key=>slots.includes(key));
  });
}

function validItem(item:CourseItem) {
  return item && typeof item.title==='string' && !!item.title.trim() && typeof item.description==='string' &&
    (item.kind===undefined || typeof item.kind==='string') && (item.group===undefined || typeof item.group==='string') &&
    !!position(item);
}

export function courseIndexFromHTML(html?:string):CourseIndex {
  if (!html) return BUNDLED_INDEX;
  // Older releases also contain this JSON assignment. Read the literal without executing page scripts.
  const match=/<script>\s*window\.NASTRAN_LEARNING\s*=\s*([\s\S]*?);\s*<\/script>/.exec(html);
  if (!match) return BUNDLED_INDEX;
  try {
    const {navigation,materialChapters,home,analysisHeadings=BUNDLED_INDEX.analysisHeadings,retiredLinks=[]}=JSON.parse(match[1]);
    if (!navigation || typeof navigation!=='object' || Array.isArray(navigation) ||
      !Object.values(navigation).every(rows=>Array.isArray(rows) && rows.every(validItem))) return BUNDLED_INDEX;
    if (!['intro','homeResources','operations','analyses','elements'].every(k=>Array.isArray(navigation[k])) ||
      !navigation.analyses.every((item:CourseItem)=>item.path==='analysis.html' && !!item.group && !!item.hash)) return BUNDLED_INDEX;
    const chapters=materialChapters===undefined
      ? BUNDLED_INDEX.materialChapters.filter(chapter=>chapter.sources.every(key=>Array.isArray(navigation[key])))
      : materialChapters;
    if (!Array.isArray(chapters) || !chapters.every(c=>c &&
      typeof c.key==='string' && !!c.key && typeof c.title==='string' && !!c.title && typeof c.description==='string' &&
      Array.isArray(c.sources) && c.sources.length && c.sources.every((k:unknown)=>typeof k==='string' && Array.isArray(navigation[k]))) ||
      new Set(chapters.map(c=>c.key)).size!==chapters.length) return BUNDLED_INDEX;
    if (home!==undefined && !validHome(home)) return BUNDLED_INDEX;
    if(!analysisHeadings || typeof analysisHeadings!=='object' || Array.isArray(analysisHeadings) ||
      !Object.values(analysisHeadings).every(value=>value && typeof value==='object' && 'title' in value && typeof value.title==='string' && 'description' in value && typeof value.description==='string'))return BUNDLED_INDEX;
    if(!Array.isArray(retiredLinks) || !retiredLinks.every(key=>typeof key==='string' && /^[\w-]+\.html#[^\s#]+$/.test(key)))return BUNDLED_INDEX;
    return {materialChapters:chapters,navigation,home:home??BUNDLED_INDEX.home,heroArt:imageFromHTML(html),analysisHeadings,retiredLinks};
  } catch { return BUNDLED_INDEX; }
}
