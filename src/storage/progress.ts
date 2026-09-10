import { concepts } from '../content/foundations';
export interface Entry { viewed: boolean; attempts: number; correct: number; latest: boolean | null }
export interface Progress { version: 1; cards: Record<string, Entry> }
export const emptyProgress = (pool = concepts): Progress => ({ version: 1, cards: Object.fromEntries(pool.map(c => [c.id, { viewed: false, attempts: 0, correct: 0, latest: null }])) });
export const STORAGE_KEY = 'research-cards-progress';
export function parseProgress(raw: string | null, pool = concepts): Progress {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (value?.version !== 1 || !value.cards) return emptyProgress(pool);
    const clean = emptyProgress(pool);
    for (const c of pool) {
      const e = value.cards[c.id];
      if (e === undefined) continue; // Newly added cards start fresh without erasing existing progress.
      if (!e || typeof e.viewed !== 'boolean' || !Number.isSafeInteger(e.attempts) || e.attempts < 0 || !Number.isSafeInteger(e.correct) || e.correct < 0 || e.correct > e.attempts || !(e.latest === null || typeof e.latest === 'boolean')) return emptyProgress(pool);
      clean.cards[c.id] = { viewed: e.viewed, attempts: e.attempts, correct: e.correct, latest: e.latest };
    }
    return clean;
  } catch { return emptyProgress(pool); }
}
export function loadProgress(pool = concepts, key = STORAGE_KEY): Progress { try { return parseProgress(localStorage.getItem(key), pool); } catch { return emptyProgress(pool); } }
export function saveProgress(progress: Progress, key = STORAGE_KEY): boolean { try { localStorage.setItem(key, JSON.stringify(progress)); return true; } catch { return false; } }
