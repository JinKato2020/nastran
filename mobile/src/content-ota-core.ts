import { PAGE_IDS } from './protocol';

type PageId = typeof PAGE_IDS[number];
export type Manifest = { schema: 1; pages: Record<PageId, string> };
export type UpdatedPages = Partial<Record<string, string>>;

const sha256 = /^[a-f0-9]{64}$/;
export const objectName = (hash: string) => `${hash}.html`;

export function parseManifest(raw: string | null): Manifest | null {
  try {
    if (!raw || raw.length > 8192) return null;
    const data = JSON.parse(raw);
    if (data?.schema !== 1 || !data.pages || Object.keys(data.pages).length !== PAGE_IDS.length) return null;
    if (!PAGE_IDS.every(id => typeof data.pages[id] === 'string' && sha256.test(data.pages[id]))) return null;
    return { schema: 1, pages: data.pages };
  } catch { return null; }
}

type Store = {
  read: (hash: string) => Promise<string | null>;
  fetch: (hash: string) => Promise<string>;
  write: (hash: string, html: string) => Promise<void>;
  commit: (manifest: Manifest) => Promise<void>;
  prune: (used: ReadonlySet<string>) => Promise<void>;
};

export function storedObjects(manifest: Manifest | null, embedded: Manifest['pages']): Set<string> {
  return new Set(manifest ? PAGE_IDS.filter(id => manifest.pages[id] !== embedded[id]).map(id => manifest.pages[id]) : []);
}

async function readRelease(manifest: Manifest, embedded: Manifest['pages'], read: (hash: string) => Promise<string | null>): Promise<UpdatedPages> {
  const changed = PAGE_IDS.filter(id => manifest.pages[id] !== embedded[id]);
  const pages = await Promise.all(changed.map(async id => {
    const html = await read(manifest.pages[id]);
    if (html === null) throw new Error('Lesson file unavailable');
    return [id, html] as const;
  }));
  return Object.fromEntries(pages);
}

export async function loadRelease(manifest: Manifest | null, embedded: Manifest['pages'], read: Store['read']): Promise<UpdatedPages> {
  if (!manifest) return {};
  try { return await readRelease(manifest, embedded, read); }
  catch { return {}; }
}

export async function refreshRelease(previous: Manifest | null, next: Manifest, embedded: Manifest['pages'], store: Store): Promise<UpdatedPages> {
  const prepared = new Map<string, string>();
  const needed = [...storedObjects(next, embedded)];
  try {
    for (let i = 0; i < needed.length; i += 6) {
      const results = await Promise.allSettled(needed.slice(i, i + 6).map(async hash => {
        const cached = await store.read(hash);
        if (cached !== null) prepared.set(hash, cached);
        else {
          const html = await store.fetch(hash);
          await store.write(hash, html);
          prepared.set(hash, html);
        }
      }));
      if (results.some(result => result.status === 'rejected')) throw new Error('Could not prepare lesson update');
    }
    const pages = await readRelease(next, embedded, async hash => prepared.get(hash) ?? null);
    await store.commit(next);
    await store.prune(storedObjects(next, embedded)).catch(() => {});
    return pages;
  } catch (error) {
    await store.prune(storedObjects(previous, embedded)).catch(() => {});
    throw error;
  }
}
