// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QualityDecisions, { validQualityDraft } from './QualityDecisions';
import App from './App';
import { qualityDecisions, qualityLessons } from './content/quality';
import { studies } from './content/studies';
import { decks } from './content/decks';
import { conceptReferences, references } from './content/references';
import { createSessionStore } from './storage/sessions';
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });
it('covers every scenario with four decisions, bilingual lessons, and identifiable sources', () => {
  for (const lesson of qualityLessons) {
    expect(lesson.body.en.length).toBeGreaterThan(30);
    expect(lesson.body.et.length).toBeGreaterThan(30);
    expect(conceptReferences[lesson.id].length).toBeGreaterThan(0);
    for (const id of conceptReferences[lesson.id]) expect(new URL(references[id].url).protocol).toBe('https:');
  }
  for (const study of studies) {
    const decisions = qualityDecisions(study.id);
    expect(decisions).toHaveLength(4);
    expect(new Set(decisions.map(d => d.id)).size).toBe(4);
    for (const d of decisions) {
      expect(qualityLessons.some(l => l.id === d.lesson)).toBe(true);
      expect(d.choices.filter(c => c.fits)).toHaveLength(1);
      for (const c of d.choices) for (const language of ['en', 'et'] as const) { expect(c.label[language].length).toBeGreaterThan(10); expect(c.feedback[language].length).toBeGreaterThan(20); }
    }
  }
});
it('supports keyboard answers, retries, saved first answers, and language changes', async () => {
  const user = userEvent.setup();
  const sessions = createSessionStore();
  const props = { studyId: 'room-finder', sessions };
  const view = render(<QualityDecisions {...props} language="en" />);
  await user.click(screen.getByRole('button', { name: 'Explore quality decisions' }));
  const first = qualityDecisions(props.studyId)[0];
  screen.getByRole('button', { name: first.choices[0].label.en }).focus();
  await user.keyboard('{Enter}');
  expect(screen.getByText('↻ Review this plan.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Retry this decision' }));
  await user.click(screen.getByRole('button', { name: first.choices[1].label.en }));
  expect(screen.getByText('Quality decisions — first answers: 0 / 4 · 1 answered')).toBeTruthy();
  expect(screen.getByText('Currently supported plans: 1 / 4')).toBeTruthy();
  view.unmount();
  render(<QualityDecisions {...props} sessions={createSessionStore()} language="et" />);
  expect(screen.getByText('Kvaliteediotsused — esimesed vastused: 0 / 4 · 1 vastatud')).toBeTruthy();
  expect((screen.getByRole('button', { name: first.choices[1].label.et }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByText('Praegu põhjendatud plaanid: 1 / 4')).toBeTruthy();
});
it('completes quality practice for all scenarios in both languages', async () => {
  const user = userEvent.setup();
  for (const language of ['en', 'et'] as const) for (const study of studies) {
    localStorage.clear();
    const view = render(<QualityDecisions studyId={study.id} language={language} sessions={createSessionStore()} />);
    await user.click(screen.getByRole('button', { name: language === 'en' ? 'Explore quality decisions' : 'Tutvu kvaliteediotsustega' }));
    for (const d of qualityDecisions(study.id)) await user.click(screen.getByRole('button', { name: d.choices.find(c => c.fits)!.label[language] }));
    expect(screen.getByText(language === 'en' ? /Quality practice complete/ : /Kvaliteediharjutus lõpetatud/)).toBeTruthy();
    view.unmount();
  }
}, 15000);
it('returns from References with quality answers and clears them on scenario restart', async () => {
  const store = createSessionStore();
  const study = studies[0];
  const answers = Object.fromEntries(Object.entries(study.slots).map(([slot, choices]) => [slot, choices.find(c => c.fits)!.id]));
  store.write(`study:${study.id}`, { answers, checked: true, locked: [], firstScore: 3 });
  store.write('navigation', { deckId: decks[0].id, screen: 'study', returnScreen: 'home' });
  store.write('study-current', study.id);
  const user = userEvent.setup();
  let view = render(<App />);
  await user.click(screen.getByRole('button', { name: 'Explore quality decisions' }));
  await user.click(screen.getByRole('button', { name: qualityDecisions(study.id)[0].choices[1].label.en }));
  await user.click(screen.getByRole('button', { name: 'References' }));
  view.unmount(); view = render(<App />);
  await user.click(screen.getByRole('button', { name: /Back to activity/ }));
  expect(screen.getByText('Currently supported plans: 1 / 4')).toBeTruthy();
  expect(screen.getByText('First attempt: 3 / 3')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Restart scenario' }));
  expect(createSessionStore().read(`quality:${study.id}`, validQualityDraft(qualityDecisions(study.id)))).toBeUndefined();
});
it('rejects invalid drafts and preserves navigation memory when saving is unavailable', async () => {
  const decisions = qualityDecisions('belonging');
  expect(validQualityDraft(decisions)({ open: true, answers: { participants: 'obsolete' }, first: {} })).toBe(false);
  expect(validQualityDraft(decisions)({ open: true, answers: { participants: 'justified' }, first: {} })).toBe(false);
  const sessions = createSessionStore();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('unavailable'); });
  const onStorageError = vi.fn();
  const props = { studyId: 'belonging', language: 'en' as const, sessions, onStorageError };
  const user = userEvent.setup();
  const view = render(<QualityDecisions {...props} />);
  await user.click(screen.getByRole('button', { name: 'Explore quality decisions' }));
  await user.click(screen.getByRole('button', { name: decisions[0].choices[1].label.en }));
  view.unmount(); render(<QualityDecisions {...props} />);
  expect(screen.getByText('Currently supported plans: 1 / 4')).toBeTruthy();
  expect(onStorageError).toHaveBeenCalled();
});
