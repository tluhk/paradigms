import type { Round } from '../game/round';
import type { Study, StudySlot } from '../content/studies';

export const SESSION_KEY = 'research-cards-sessions';
export type Screen = 'home' | 'learn' | 'practice' | 'summary' | 'placement' | 'study' | 'references';
const screens: Screen[] = ['home', 'learn', 'practice', 'summary', 'placement', 'study', 'references'];
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown, max: number) => Number.isInteger(value) && Number(value) >= 0 && Number(value) <= max;
const subset = (value: unknown, ids: string[]): value is string[] => Array.isArray(value) && value.every(id => ids.includes(id)) && new Set(value).size === value.length;
const permutation = (value: unknown, ids: string[]) => subset(value, ids) && value.length === ids.length;
const score = (value: unknown, max: number) => value === null || integer(value, max);

// One store per mounted app: browser storage is optional, and navigation still
// retains drafts in memory when reads or writes are unavailable.
export function createSessionStore() {
  let drafts: Record<string, unknown> = {};
  try {
    const raw = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
    if (raw?.version === 1 && record(raw.drafts)) drafts = raw.drafts;
  } catch { /* Start clean without storage. */ }
  return {
    read<T>(key: string, valid: (value: unknown) => value is T): T | undefined {
      return valid(drafts[key]) ? drafts[key] as T : undefined;
    },
    write(key: string, value: unknown): boolean {
      drafts[key] = value;
      try { localStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, drafts })); return true; } catch { return false; }
    },
    remove(key: string): void {
      delete drafts[key];
      try { localStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, drafts })); } catch { /* Memory still works. */ }
    },
  };
}
export type SessionStore = ReturnType<typeof createSessionStore>;
export interface NavigationDraft { deckId: string; screen: Screen; returnScreen: Screen }
export const validNavigation = (ids: string[]) => (v: unknown): v is NavigationDraft => record(v) && ids.includes(v.deckId) && screens.includes(v.screen) && screens.includes(v.returnScreen) && v.returnScreen !== 'references';
export interface DeckDraft { ids: string[]; cardIndex: number; revealed: boolean; round: Round; practiceStarted: boolean }
export const validDeck = (ids: string[]) => (v: unknown): v is DeckDraft => {
  if (!record(v) || !permutation(v.ids, ids) || !integer(v.cardIndex, ids.length - 1) || typeof v.revealed !== 'boolean' || typeof v.practiceStarted !== 'boolean') return false;
  const r = v.round;
  if (!record(r) || !Array.isArray(r.questions) || !r.questions.length || !integer(r.index, r.questions.length - 1) || r.initialTotal !== ids.length || !score(r.initialScore, ids.length)) return false;
  if (!subset(r.questions.map((q: any) => q?.id), ids)) return false;
  if (r.initialScore === null && r.questions.length !== ids.length) return false;
  return r.questions.every((q: any, i: number) => record(q) && subset(q.options, ids) && q.options.length === Math.min(3, ids.length) && q.options.includes(q.id) && (q.answer === undefined || q.options.includes(q.answer)) && (i >= r.index || q.answer !== undefined) && (i <= r.index || q.answer === undefined));
};
export interface PlacementDraft { slots: string[]; cards: string[]; placements: Record<string, string>; checked: boolean; locked: string[]; firstScore: number | null }
export const validPlacement = (ids: string[]) => (v: unknown): v is PlacementDraft => {
  if (!record(v) || !permutation(v.slots, ids) || !permutation(v.cards, ids) || !record(v.placements) || !subset(Object.keys(v.placements), ids) || !subset(Object.values(v.placements), ids) || typeof v.checked !== 'boolean' || !subset(v.locked, ids) || !score(v.firstScore, ids.length)) return false;
  if (v.locked.some((id: string) => v.placements[id] !== id)) return false;
  if ((v.checked || v.locked.length > 0) && v.firstScore === null) return false;
  return !v.checked || Object.keys(v.placements).length === ids.length;
};
export interface StudyDraft { answers: Partial<Record<StudySlot, string>>; checked: boolean; locked: StudySlot[]; firstScore: number | null }
export const validStudy = (study: Study) => (v: unknown): v is StudyDraft => {
  const slots = Object.keys(study.slots) as StudySlot[];
  if (!record(v) || !record(v.answers) || !subset(Object.keys(v.answers), slots) || !subset(v.locked, slots) || typeof v.checked !== 'boolean' || !score(v.firstScore, slots.filter(slot => !study.fixed[slot]).length)) return false;
  if (new Set(Object.values(v.answers)).size !== Object.values(v.answers).length) return false;
  if (!slots.every(slot => (!study.fixed[slot] || v.answers[slot] === study.fixed[slot]) && (v.answers[slot] === undefined || study.slots[slot]!.some(c => c.id === v.answers[slot])))) return false;
  if (!v.locked.every(slot => study.slots[slot as StudySlot]!.some(c => c.id === v.answers[slot] && c.fits))) return false;
  if ((v.checked || v.locked.length > 0) && v.firstScore === null) return false;
  return !v.checked || slots.every(slot => !!v.answers[slot]);
};
