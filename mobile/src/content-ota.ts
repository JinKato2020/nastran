import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system/legacy';
import embeddedHashes from './generated/page-hashes.json';
import { loadRelease, objectName, parseManifest, refreshRelease, storedObjects, type UpdatedPages } from './content-ota-core';
import { PAGE_IDS } from './protocol';

const base = 'https://content.safa-lang.com/nastran/';
const folder = FileSystem.documentDirectory ? FileSystem.documentDirectory + 'nastran-content-v1/' : null;
const activeKey = 'nastran-content-v1-active';
const maxPageLength = 8 * 1024 * 1024;

async function verified(html: string, hash: string): Promise<boolean> {
  return html.length <= maxPageLength && html.includes('<!--NATIVE_BOOTSTRAP-->') &&
    (await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, html)) === hash;
}

async function getText(url: string, maxLength: number): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok || Number(response.headers.get('content-length')) > 4 * maxLength) throw new Error('Lesson download failed');
    const text = await response.text();
    if (text.length > maxLength) throw new Error('Lesson download exceeds limit');
    return text;
  } finally { clearTimeout(timeout); }
}

export async function updateLessons(apply: (pages: UpdatedPages) => void): Promise<void> {
  if (!folder) return;
  const storage = folder;
  const read = async (hash: string) => {
    try {
      const html = await FileSystem.readAsStringAsync(storage + objectName(hash));
      return await verified(html, hash) ? html : null;
    } catch { return null; }
  };
  const prune = async (used: ReadonlySet<string>) => {
    const keep = new Set([...used].map(objectName));
    const names = await FileSystem.readDirectoryAsync(storage);
    for (const name of names) {
      if (/^[a-f0-9]{64}\.html$/.test(name) && !keep.has(name)) {
        await FileSystem.deleteAsync(storage + name, { idempotent: true }).catch(() => {});
      }
    }
  };
  try {
    await FileSystem.makeDirectoryAsync(storage, { intermediates: true });
    const previous = parseManifest(await AsyncStorage.getItem(activeKey));
    const cached = await loadRelease(previous, embeddedHashes, read);
    apply(cached);
    await prune(storedObjects(previous, embeddedHashes)).catch(() => {});
    const next = parseManifest(await getText(`${base}_manifest.json?t=${Date.now()}`, 8192));
    if (!next) return;
    const unchanged = previous && PAGE_IDS.every(id => previous.pages[id] === next.pages[id]);
    if (unchanged && PAGE_IDS.every(id => next.pages[id] === embeddedHashes[id] || cached[id] !== undefined)) return;
    const updated = await refreshRelease(previous, next, embeddedHashes, {
      read,
      fetch: async hash => {
        const url = base + 'objects/' + objectName(hash);
        const download = async () => {
          const html = await getText(url, maxPageLength);
          if (!await verified(html, hash)) throw new Error('Lesson hash mismatch');
          return html;
        };
        return download().catch(download);
      },
      write: (hash, html) => FileSystem.writeAsStringAsync(storage + objectName(hash), html),
      commit: manifest => AsyncStorage.setItem(activeKey, JSON.stringify(manifest)),
      prune,
    });
    apply(updated);
  } catch { /* Keep the active release, or embedded lessons on first launch. */ }
}
