// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyReflection from './StudyReflection';
import { studies } from './content/studies';
import { createSessionStore } from './storage/sessions';
afterEach(() => { cleanup(); localStorage.clear(); });
it('saves editable reasoning and comparison across reload and language changes without grading text', async () => {
  const user = userEvent.setup();
  const props = { study: studies[0], slot: 'collection' as const, choiceId: 'interview', term: 'Interview', sessions: createSessionStore() };
  const view = render(<StudyReflection {...props} language="en" />);
  await user.type(screen.getAllByRole('textbox')[0], 'Ask students about a time they felt included.');
  await user.type(screen.getAllByRole('textbox')[1], 'Some students may hesitate to speak openly.');
  await user.click(screen.getByRole('button', { name: 'Compare with an example' }));
  expect(screen.getByText(/Review your explanation:/)).toBeTruthy();
  view.unmount();
  render(<StudyReflection {...props} sessions={createSessionStore()} language="et" />);
  expect((screen.getAllByRole('textbox')[0] as HTMLTextAreaElement).value).toContain('Ask students');
  expect(screen.getByRole('button', { name: 'Peida võrdlus' }).getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByText(/Vaata oma selgitus üle:/)).toBeTruthy();
});
it('offers corrective comparison for a mismatch and isolates notes by choice', async () => {
  const user = userEvent.setup();
  const props = { study: studies[0], slot: 'collection' as const, term: 'Questionnaire', sessions: createSessionStore(), language: 'en' as const };
  const view = render(<StudyReflection {...props} choiceId="questionnaire" />);
  await user.type(screen.getAllByRole('textbox')[0], 'My initial reasoning');
  await user.click(screen.getByRole('button', { name: 'Compare with an example' }));
  expect(screen.getByText(studies[0].slots.collection![2].reason.en)).toBeTruthy();
  expect(screen.getByText(studies[0].slots.collection![0].reason.en)).toBeTruthy();
  view.unmount();
  render(<StudyReflection {...props} choiceId="interview" />);
  expect((screen.getAllByRole('textbox')[0] as HTMLTextAreaElement).value).toBe('');
});
