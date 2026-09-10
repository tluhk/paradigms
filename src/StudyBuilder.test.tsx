// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import StudyBuilder from './StudyBuilder';
import { evaluateStudy, studies, type StudySlot } from './content/studies';
afterEach(() => { cleanup(); localStorage.clear(); });

it('completes all three scenarios from the home screen', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Build a research study/ }));
  const solutions = [
    [['Interpretivism', 'Paradigm'], ['Focus group', 'Data collection'], ['Thematic analysis', 'Data analysis']],
    [['Mixed methods research', 'Methodology'], ['Interview', 'Additional data collection'], ['Thematic analysis', 'Data analysis']],
    [['Action research', 'Methodology'], ['Observation', 'Data collection'], ['Descriptive statistics', 'Data analysis']],
  ];
  for (let i = 0; i < solutions.length; i++) {
    expect((screen.getByRole('button', { name: 'Check connections' }) as HTMLButtonElement).disabled).toBe(true);
    for (const [term, slot] of solutions[i]) {
      await user.click(screen.getByRole('button', { name: term }));
      await user.click(screen.getByRole('button', { name: `Place: ${slot}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Check connections' }));
    expect(screen.getByText('A connected research study.')).toBeTruthy();
    expect(screen.getByText('First attempt: 3 / 3')).toBeTruthy();
    if (i < 2) await user.click(screen.getByRole('button', { name: /Next scenario/ }));
  }
  await user.click(screen.getByRole('button', { name: 'Restart scenario' }));
  expect(screen.queryByText('First attempt: 3 / 3')).toBeNull();
});

it('explains mismatches, retains fitting connections on retry, and preserves state across languages', async () => {
  const user = userEvent.setup();
  const view = render(<StudyBuilder language="en" />);
  await user.click(screen.getByRole('button', { name: 'Critical / transformative' }));
  await user.click(screen.getByRole('button', { name: 'Place: Data analysis' }));
  expect(screen.getByText('Choose a slot for this type of card.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Place: Paradigm' }));
  for (const [term, slot] of [['Interview', 'Data collection'], ['Thematic analysis', 'Data analysis']]) {
    await user.click(screen.getByRole('button', { name: term }));
    await user.click(screen.getByRole('button', { name: `Place: ${slot}` }));
  }
  await user.click(screen.getByRole('button', { name: 'Check connections' }));
  expect(screen.getByText('First attempt: 2 / 3')).toBeTruthy();
  expect(screen.getByText(/A critical study could investigate belonging/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Retry connections' }));
  expect((screen.getByRole('button', { name: 'Place: Data collection' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Interpretivism' }));
  view.rerender(<StudyBuilder language="et" />);
  expect(screen.getByText('Valitud: Interpretivism')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Paiguta: Paradigma' }));
  await user.click(screen.getByRole('button', { name: 'Kontrolli seoseid' }));
  expect(screen.getByText('Seostatud uuring.')).toBeTruthy();
  expect(screen.getByText('Esimene katse: 2 / 3')).toBeTruthy();
});

it('allows keyboard placement, removal and replacement without dragging', async () => {
  const user = userEvent.setup();
  render(<StudyBuilder language="en" />);
  screen.getByRole('button', { name: 'Interview' }).focus();
  await user.keyboard('{Enter}');
  screen.getByRole('button', { name: 'Place: Data collection' }).focus();
  await user.keyboard(' ');
  expect(screen.getByRole('button', { name: 'Place: Data collection' }).textContent).toBe('Interview');
  await user.click(screen.getByRole('button', { name: 'Focus group' }));
  await user.click(screen.getByRole('button', { name: 'Place: Data collection' }));
  expect(screen.getByRole('button', { name: 'Interview' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Place: Data collection' }));
  expect(screen.getByRole('button', { name: 'Focus group' })).toBeTruthy();
});

it('provides a fitting solution for every slot and recognises both conversational alternatives', () => {
  for (const study of studies) {
    const answers = Object.fromEntries(Object.entries(study.slots).map(([slot, choices]) => [slot, choices.find(c => c.fits)!.id]));
    expect(evaluateStudy(study, answers).every(r => r.choice?.fits)).toBe(true);
    for (const slot of Object.keys(study.fixed) as StudySlot[]) expect(study.slots[slot]!.find(c => c.id === study.fixed[slot])?.fits).toBe(true);
  }
  for (const id of ['interview', 'focus-group']) expect(evaluateStudy(studies[0], { collection: id }).find(r => r.slot === 'collection')?.choice?.fits).toBe(true);
});
