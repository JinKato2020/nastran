import { NAVIGATION } from './content';
import type { Position } from './protocol';

export const FREE_ANALYSIS_HASHES = NAVIGATION.analyses
  .filter(item => item.group === '構造・静解析')
  .map(item => item.hash);

export function isAnalysisIndex(p: Pick<Position, 'path' | 'hash'>): boolean {
  return p.path === 'analysis.html' && (p.hash === '' || p.hash === '#index');
}

export function canOpenLesson(p: Pick<Position, 'path' | 'hash'>, isPro: boolean): boolean {
  if (isPro) return true;
  if (p.path === 'elements.html' || p.path === 'bulk.html' || p.path === 'comparisons.html') return true;
  return p.path === 'analysis.html' && FREE_ANALYSIS_HASHES.includes(p.hash.split('/')[0]);
}
