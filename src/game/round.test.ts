import { describe, expect, it } from 'vitest';
import { concepts } from '../content/foundations';
import { createRound, missed, score, submit } from './round';
import { emptyProgress, loadProgress, parseProgress, saveProgress } from '../storage/progress';

describe('rounds', () => {
  it('asks each concept once with three distinct, valid options and one correct answer', () => {
    for (let n = 0; n < 50; n++) {
      const round = createRound();
      expect(new Set(round.questions.map(q => q.id)).size).toBe(6);
      for (const q of round.questions) {
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options).size).toBe(3);
        expect(q.options.filter(id => id === q.id)).toHaveLength(1);
        expect(q.options.every(id => concepts.some(c => c.id === id))).toBe(true);
      }
    }
  });
  it('ignores duplicate and invalid submissions', () => {
    const round = createRound();
    expect(submit(round, 'invalid')).toBe(round);
    const answered = submit(round, round.questions[0].id);
    expect(submit(answered, round.questions[0].options[0])).toBe(answered);
    expect(score(answered)).toBe(1);
  });
  it('preserves the initial score through successive one-card retries', () => {
    let retry = createRound(['ontology'], 5);
    expect(retry.questions[0].options).toHaveLength(3);
    retry = submit(retry, 'ontology');
    expect(score(retry)).toBe(1);
    expect(missed(retry)).toEqual([]);
    expect(retry.initialScore).toBe(5);
  });
});
describe('progress storage', () => {
  it('round trips valid progress', () => {
    const value = emptyProgress();
    value.cards.ontology = { viewed: true, attempts: 2, correct: 1, latest: false };
    expect(parseProgress(JSON.stringify(value))).toEqual(value);
  });
  it('recovers from missing, malformed, outdated and invalid data', () => {
    for (const raw of [null, '{', '{}', '{"version":2}', JSON.stringify({ version: 1, cards: { ontology: { attempts: -1 } } })]) expect(parseProgress(raw)).toEqual(emptyProgress());
    const value = emptyProgress();
    value.cards.method.correct = 10;
    expect(parseProgress(JSON.stringify(value))).toEqual(emptyProgress());
  });
  it('can operate without browser storage', () => {
    expect(loadProgress()).toEqual(emptyProgress());
    expect(saveProgress(emptyProgress())).toBe(false);
  });
});

it('extends saved decks without losing existing progress and keeps full retry totals', async () => {
  const { decks } = await import('../content/decks');
  for (const deck of decks.slice(1)) {
    const previous = emptyProgress(deck.cards.en.slice(0, 6));
    const id = deck.cards.en[0].id;
    previous.cards[id] = { viewed: true, attempts: 3, correct: 2, latest: true };
    const restored = parseProgress(JSON.stringify(previous), deck.cards.en);
    expect(restored.cards[id]).toEqual(previous.cards[id]);
    expect(Object.keys(restored.cards)).toHaveLength(8);
    expect(restored.cards[deck.cards.en[7].id].attempts).toBe(0);
    expect(createRound([deck.cards.en[7].id], 7, deck.cards.en).initialTotal).toBe(8);
    expect(deck.cards.et.map(c => c.id)).toEqual(deck.cards.en.map(c => c.id));
  }
});
