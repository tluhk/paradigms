// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EvidencePractice, { validEvidenceDraft } from './EvidencePractice';
import { evidenceExercises, summariseAttempts } from './content/evidence';
import { createSessionStore } from './storage/sessions';
import { conceptReferences } from './content/references';
import { studies } from './content/studies';
import { decks } from './content/decks';
import App from './App';
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });
it('calculates truthful summaries including failures, errors on successful tasks, and changing subsets', () => {
  const expected = {
    'room-finder': [[3, 120, 6], [3, 75, 3]],
    'accessible-planner': [[2, 120, 8], [3, 100, 4]],
    'equipment-lending': [[3, 180, 6], [4, 135, 3]],
  };
  for (const [id, exercise] of Object.entries(evidenceExercises)) {
    expect(exercise.attempts).toHaveLength(8);
    for (const [i, condition] of ['baseline', 'prototype'].entries()) {
      const rows = exercise.attempts.filter(r => r.condition === condition);
      expect(new Set(rows.map(r => r.participant)).size).toBe(4);
      const summary = summariseAttempts(rows);
      expect([summary.successes, summary.median, summary.errors]).toEqual(expected[id as keyof typeof expected][i]);
      expect(summary.total).toBe(4);
    }
    for (const excerpt of exercise.excerpts) expect(exercise.attempts.some(r => r.participant === excerpt.participant)).toBe(true);
    for (const q of exercise.questions) expect(conceptReferences[q.lesson].length).toBeGreaterThan(0);
  }
  expect(summariseAttempts([{ participant: 'P1', condition: 'baseline', seconds: null, errors: 2 }])).toEqual({ total: 1, successes: 0, errors: 2, median: null });
  expect(summariseAttempts([]).median).toBeNull();
});
it('plays every evidence exercise in both languages with fictional labels and accessible tables', async () => {
  const user = userEvent.setup();
  for (const language of ['en', 'et'] as const) for (const exercise of Object.values(evidenceExercises)) {
    localStorage.clear();
    const view = render(<EvidencePractice exercise={exercise} language={language} sessions={createSessionStore()} />);
    expect(screen.getByText(language === 'en' ? /Fictional teaching dataset/ : /Väljamõeldud õppeandmestik/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: language === 'en' ? 'Explore fictional evidence' : 'Uuri väljamõeldud tõendeid' }));
    const records = within(screen.getByRole('table', { name: language === 'en' ? 'Fictional task records' : 'Väljamõeldud ülesandetulemused' }));
    expect(records.getAllByRole('row')).toHaveLength(9);
    expect(screen.getByText(exercise.excerpts[0].quote[language])).toBeTruthy();
    for (const q of exercise.questions) await user.click(screen.getByRole('button', { name: q.choices.find(c => c.fits)!.label[language] }));
    expect(screen.getByText(language === 'en' ? /Evidence exercise complete/ : /Tõendiharjutus lõpetatud/)).toBeTruthy();
    view.unmount();
  }
});
it('preserves first answers through keyboard retry, reload, and language changes', async () => {
  const exercise = evidenceExercises['room-finder'];
  const user = userEvent.setup();
  const view = render(<EvidencePractice exercise={exercise} language="en" sessions={createSessionStore()} />);
  await user.click(screen.getByRole('button', { name: 'Explore fictional evidence' }));
  screen.getByRole('button', { name: exercise.questions[0].choices[1].label.en }).focus();
  await user.keyboard('{Enter}');
  await user.click(screen.getByRole('button', { name: 'Retry this interpretation' }));
  await user.click(screen.getByRole('button', { name: exercise.questions[0].choices[0].label.en }));
  view.unmount(); render(<EvidencePractice exercise={exercise} language="et" sessions={createSessionStore()} />);
  expect(screen.getByText('Tõendid — esimesed vastused: 0 / 3 · 1 vastatud')).toBeTruthy();
  expect(screen.getByText('Praegu toetatud tõlgendused: 1 / 3')).toBeTruthy();
  expect((screen.getByRole('button', { name: exercise.questions[0].choices[0].label.et }) as HTMLButtonElement).disabled).toBe(true);
});
it('rejects obsolete data versions and invalid choices and retains in-memory drafts on storage failure', async () => {
  const exercise = evidenceExercises['room-finder'];
  expect(validEvidenceDraft(exercise)({ version: 0, open: true, answers: {}, first: {} })).toBe(false);
  expect(validEvidenceDraft(exercise)({ version: 1, open: true, answers: { pattern: 'unknown' }, first: { pattern: 'unknown' } })).toBe(false);
  const sessions = createSessionStore();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw Error('blocked'); });
  const onStorageError = vi.fn();
  const user = userEvent.setup();
  const props = { exercise, sessions, onStorageError, language: 'en' as const };
  const view = render(<EvidencePractice {...props} />);
  await user.click(screen.getByRole('button', { name: 'Explore fictional evidence' }));
  await user.click(screen.getByRole('button', { name: exercise.questions[0].choices[0].label.en }));
  view.unmount(); render(<EvidencePractice {...props} />);
  expect(screen.getByText('Currently supported interpretations: 1 / 3')).toBeTruthy();
  expect(onStorageError).toHaveBeenCalled();
});
it('keeps scenario evidence through References and clears it on restart without changing placement scores', async () => {
  const exercise = evidenceExercises['room-finder'];
  const study = studies.find(s => s.id === exercise.id)!;
  const sessions = createSessionStore();
  sessions.write('study-current', study.id);
  sessions.write('navigation', { deckId: decks[0].id, screen: 'study', returnScreen: 'home' });
  sessions.write(`study:${study.id}`, { answers: Object.fromEntries(Object.entries(study.slots).map(([slot, choices]) => [slot, choices.find(c => c.fits)!.id])), checked: true, locked: [], firstScore: 4 });
  const user = userEvent.setup();
  const view = render(<App />);
  await user.click(screen.getByRole('button', { name: 'Explore fictional evidence' }));
  await user.click(screen.getByRole('button', { name: exercise.questions[0].choices[0].label.en }));
  await user.click(screen.getByRole('button', { name: 'References' }));
  view.unmount(); render(<App />);
  await user.click(screen.getByRole('button', { name: /Back to activity/ }));
  expect(screen.getByText('Currently supported interpretations: 1 / 3')).toBeTruthy();
  expect(screen.getByText('First attempt: 4 / 4')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Restart scenario' }));
  expect(createSessionStore().read(`evidence:${study.id}`, validEvidenceDraft(exercise))).toBeUndefined();
});
