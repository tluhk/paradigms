// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

it('completes computing scenarios in both languages, including application evaluation', async () => {
  const { computingStudies, evaluationCards } = await import('./content/computing-studies');
  const { decks } = await import('./content/decks');
  const { paradigms, slotLabels } = await import('./content/studies');
  const user = userEvent.setup();
  for (const language of ['en', 'et'] as const) {
    localStorage.clear();
    const view = render(<StudyBuilder language={language} />);
    const cards = [...decks.flatMap(d => d.cards[language]), ...[...paradigms, ...evaluationCards].map(c => ({ id: c.id, term: c.term[language] }))];
    for (const study of computingStudies) {
      await user.click(screen.getByRole('button', { name: new RegExp(study.title[language] + '$') }));
      expect(screen.getByRole('heading', { name: new RegExp(slotLabels.evaluation[language]) })).toBeTruthy();
      for (const slot of Object.keys(study.slots) as StudySlot[]) {
        if (study.fixed[slot]) continue;
        const answer = study.slots[slot]!.find(c => c.fits)!;
        await user.click(screen.getByRole('button', { name: cards.find(c => c.id === answer.id)!.term }));
        await user.click(screen.getByRole('button', { name: `${language === 'en' ? 'Place' : 'Paiguta'}: ${slotLabels[slot][language]}` }));
      }
      await user.click(screen.getByRole('button', { name: language === 'en' ? 'Check connections' : 'Kontrolli seoseid' }));
      expect(screen.getByText(language === 'en' ? 'A connected research study.' : 'Seostatud uuring.')).toBeTruthy();
      expect(screen.getByText(language === 'en' ? 'First attempt: 4 / 4' : 'Esimene katse: 4 / 4')).toBeTruthy();
    }
    view.unmount();
  }
});

it('requires evidence of usefulness instead of feature count and preserves the evaluation retry score', async () => {
  const user = userEvent.setup();
  render(<StudyBuilder language="en" />);
  await user.click(screen.getByRole('button', { name: /Equipment lending system$/ }));
  for (const [card, slot] of [['Design science research', 'Methodology'], ['Requirements interview', 'Data collection'], ['Descriptive statistics', 'Data analysis'], ['Count implemented features', 'Application evaluation']]) {
    await user.click(screen.getByRole('button', { name: card }));
    await user.click(screen.getByRole('button', { name: `Place: ${slot}` }));
  }
  await user.click(screen.getByRole('button', { name: 'Check connections' }));
  expect(screen.getByText(/Feature count measures output/)).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Retry connections' }));
  expect((screen.getByRole('button', { name: 'Place: Methodology' }) as HTMLButtonElement).disabled).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Evaluate agreed requirements' }));
  await user.click(screen.getByRole('button', { name: 'Place: Application evaluation' }));
  await user.click(screen.getByRole('button', { name: 'Check connections' }));
  expect(screen.getByText('A connected research study.')).toBeTruthy();
  expect(screen.getByText('First attempt: 3 / 4')).toBeTruthy();
});


it('drags cards into slots, replaces cards, and rejects invalid or external drops', () => {
  render(<StudyBuilder language="en" />);
  function drag(term: string, slot: string) {
    const source = screen.getByRole('button', { name: term });
    expect(source.getAttribute('draggable')).toBe('true');
    const data: Record<string, string> = {};
    const dataTransfer = { setData: (key: string, value: string) => { data[key] = value; }, getData: (key: string) => data[key], effectAllowed: '', dropEffect: '' };
    fireEvent.dragStart(source, { dataTransfer });
    const target = screen.getByRole('button', { name: `Place: ${slot}` });
    fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    fireEvent.dragEnd(source, { dataTransfer });
    return target;
  }
  expect(drag('Interview', 'Data collection').textContent).toBe('Interview');
  expect(drag('Focus group', 'Data collection').textContent).toBe('Focus group');
  expect(screen.getByRole('button', { name: 'Interview' })).toBeTruthy();
  expect(drag('Interpretivism', 'Data analysis').textContent).toBe('Place a card here');
  expect(screen.getByText('Choose a slot for this type of card.')).toBeTruthy();
  expect(drag('Interpretivism', 'Methodology').textContent).toBe('Case study');
  const collection = screen.getByRole('button', { name: 'Place: Data collection' });
  fireEvent.drop(collection, { dataTransfer: { getData: () => 'interview' } });
  expect(collection.textContent).toBe('Focus group');
  expect(screen.getByRole('button', { name: 'Interpretivism' }).getAttribute('aria-pressed')).toBe('false');
});

it('keeps reflections separate from placement scores and clears them on scenario restart', async () => {
  const user = userEvent.setup();
  render(<StudyBuilder language="en" />);
  expect(screen.queryByRole('heading', { name: 'Explain your choices' })).toBeNull();
  for (const [term, slot] of [['Interpretivism', 'Paradigm'], ['Interview', 'Data collection'], ['Thematic analysis', 'Data analysis']]) {
    await user.click(screen.getByRole('button', { name: term }));
    await user.click(screen.getByRole('button', { name: `Place: ${slot}` }));
  }
  await user.click(screen.getByRole('button', { name: 'Check connections' }));
  expect(screen.getByRole('heading', { name: 'Explain your choices' })).toBeTruthy();
  expect(screen.getAllByRole('textbox')).toHaveLength(6);
  await user.type(screen.getAllByRole('textbox')[0], 'An ungraded reflection');
  expect(screen.getByText('First attempt: 3 / 3')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Restart scenario' }));
  expect(localStorage.getItem('research-cards-sessions')).not.toContain('An ungraded reflection');
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.getByLabelText('Completed')).toBeTruthy();
});
