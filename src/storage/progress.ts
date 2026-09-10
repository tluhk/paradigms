import { concepts } from '../content/foundations';
export interface Entry { viewed: boolean; attempts: number; correct: number; latest: boolean | null }
export interface Progress { version: 1; cards: Record<string, Entry> }
export const emptyProgress = (): Progress => ({ version: 1, cards: Object.fromEntries(concepts.map(c => [c.id, { viewed: false, attempts: 0, correct: 0, latest: null }])) });
export const STORAGE_KEY = 'research-cards-progress';
export function parseProgress(raw: string | null): Progress {
  try {
    const value = JSON.parse(raw ?? 'null');
    if (value?.version !== 1 || !value.cards) return emptyProgress();
    const clean = emptyProgress();
    for (const c of concepts) {
      const e = value.cards[c.id];
      if (!e || typeof e.viewed !== 'boolean' || !Number.isSafeInteger(e.attempts) || e.attempts < 0 || !Number.isSafeInteger(e.correct) || e.correct < 0 || e.correct > e.attempts || !(e.latest === null || typeof e.latest === 'boolean')) return emptyProgress();
      clean.cards[c.id] = { viewed: e.viewed, attempts: e.attempts, correct: e.correct, latest: e.latest };
    }
    return clean;
  } catch { return emptyProgress(); }
}
export function loadProgress(): Progress { try { return parseProgress(localStorage.getItem(STORAGE_KEY)); } catch { return emptyProgress(); } }
export function saveProgress(progress: Progress): boolean { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; } catch { return false; } }
