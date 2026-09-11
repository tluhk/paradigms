// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { concepts } from './content/foundations';
import { studies, slotLabels, type StudySlot } from './content/studies';
import { decks } from './content/decks';
import { createSessionStore, SESSION_KEY, validDeck, validPlacement, validStudy } from './storage/sessions';
import { STORAGE_KEY } from './storage/progress';
import { createRound } from './game/round';
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

it('restores a flipped learning card after References and reload', async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  await user.click(screen.getByRole('button', { name: /Next card/ }));
  await user.click(screen.getByRole('button', { name: /Show explanation/ }));
  await user.click(screen.getByRole('button', { name: 'References' }));
  view.unmount(); render(<App />);
  await user.click(screen.getByRole('button', { name: /Back to activity/ }));
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Epistemology');
  expect(screen.getByRole('button', { name: /Back to the term/ })).toBeTruthy();
});

it('restores partial and checked placement boards without recording extra attempts', async () => {
  const user = userEvent.setup();
  let view = render(<App />);
  await user.click(screen.getByRole('button', { name: /Place the cards/ }));
  const place = async (i: number) => {
    await user.click(screen.getByRole('button', { name: concepts[i].term }));
    await user.click(screen.getByRole('button', { name: `Place card: ${concepts[i].definition}` }));
  };
  await place(0);
  view.unmount(); view = render(<App />);
  expect(screen.getByText('1 / 6 cards placed')).toBeTruthy();
  for (let i = 1; i < 6; i++) await place(i);
  await user.click(screen.getByRole('button', { name: 'Check placements' }));
  const saved = localStorage.getItem(STORAGE_KEY);
  view.unmount(); render(<App />);
  expect(screen.getByText('Correct on your first attempt: 6 / 6')).toBeTruthy();
  expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
});

it('keeps separate scenario drafts and completion when a completed tree is restarted', async () => {
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(screen.getByRole('button', { name: /Build a research study/ }));
  const study = studies[0];
  for (const slot of Object.keys(study.slots) as StudySlot[]) {
    if (study.fixed[slot]) continue;
    const id = study.slots[slot]!.find(c => c.fits)!.id;
    const term = decks.flatMap(d => d.cards.en).find(c => c.id === id)!.term;
    await user.click(screen.getByRole('button', { name: term }));
    await user.click(screen.getByRole('button', { name: `Place: ${slotLabels[slot].en}` }));
  }
  await user.click(screen.getByRole('button', { name: 'Check connections' }));
  await user.click(screen.getByRole('button', { name: new RegExp(studies[1].title.en + '$') }));
  await user.click(screen.getByRole('button', { name: new RegExp(study.title.en + '$') }));
  expect(screen.getByText('A connected research study.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Restart scenario' }));
  view.unmount(); render(<App />);
  expect(screen.queryByText('A connected research study.')).toBeNull();
  expect(screen.getByLabelText('Completed')).toBeTruthy();
});

it('retains in-memory drafts during navigation when browser storage is unavailable', async () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('unavailable'); });
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Place the cards/ }));
  await user.click(screen.getByRole('button', { name: 'Ontology' }));
  await user.click(screen.getByRole('button', { name: `Place card: ${concepts[0].definition}` }));
  await user.click(screen.getByRole('button', { name: 'References' }));
  await user.click(screen.getByRole('button', { name: /Back to activity/ }));
  expect(screen.getByText('1 / 6 cards placed')).toBeTruthy();
  expect(screen.getByText(/Browser storage is unavailable/)).toBeTruthy();
});

it('rejects corrupt and obsolete drafts without discarding other valid drafts', () => {
  localStorage.setItem(SESSION_KEY, '{broken');
  expect(createSessionStore().read('deck', validDeck(['ontology']))).toBeUndefined();
  const store = createSessionStore();
  const ids = concepts.map(c => c.id);
  const draft = { ids, cardIndex: 0, revealed: false, practiceStarted: true, round: createRound(ids) };
  store.write('good', draft);
  store.write('bad', { ...draft, cardIndex: 100 });
  expect(store.read('good', validDeck(ids))).toEqual(draft);
  expect(store.read('bad', validDeck(ids))).toBeUndefined();
  expect(validDeck(['removed'])(draft)).toBe(false);
  expect(validPlacement(ids)({ slots: ids, cards: ids, placements: { ontology: 'unknown' }, checked: false, locked: [], firstScore: null })).toBe(false);
  expect(validStudy(studies[0])({ answers: {}, checked: true, locked: [], firstScore: 0 })).toBe(false);
});
