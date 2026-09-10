// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { concepts } from './content/foundations';
import { STORAGE_KEY } from './storage/progress';
afterEach(() => { cleanup(); localStorage.clear(); });
it('reveals all six cards, persists views, and opens practice', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  for (let i = 0; i < concepts.length; i++) {
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(concepts[i].term);
    await user.click(screen.getByRole('button', { name: /Show explanation/ }));
    expect(screen.getByText(concepts[i].definition)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: i < 5 ? /Next card/ : /Practise this deck/ }));
  }
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(Object.values(saved.cards).every((c: any) => c.viewed)).toBe(true);
  expect(screen.getByText('Question 1 of 6')).toBeTruthy();
});
it('completes a round, retries a missed card without changing initial score, and resets progress', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Practise matching/ }));
  for (let i = 0; i < 6; i++) {
    const term = screen.getByRole('heading', { level: 1 }).textContent!.replace(/\?$/, '');
    const concept = concepts.find(c => c.term === term)!;
    const choices = screen.getAllByRole('button').filter(b => b.classList.contains('answer'));
    const chosen = choices.find(b => i === 0 ? !b.textContent!.includes(concept.definition) : b.textContent!.includes(concept.definition))!;
    await user.dblClick(chosen);
    expect(choices.every(b => (b as HTMLButtonElement).disabled)).toBe(true);
    await user.click(screen.getByRole('button', { name: i < 5 ? /Continue/ : /See results/ }));
  }
  expect(screen.getByText('Correct on your first attempt')).toBeTruthy();
  expect(document.querySelector('.score')!.textContent).toBe('5 / 6');
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(Object.values(saved.cards).reduce((sum: number, c: any) => sum + c.attempts, 0)).toBe(6);
  await user.click(screen.getByRole('button', { name: /Practise missed cards/ }));
  expect(screen.getByText('Question 1 of 1')).toBeTruthy();
  const term = screen.getByRole('heading', { level: 1 }).textContent!.replace(/\?$/, '');
  const concept = concepts.find(c => c.term === term)!;
  await user.click(screen.getByRole('button', { name: new RegExp(concept.definition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }));
  await user.click(screen.getByRole('button', { name: /See results/ }));
  expect(document.querySelector('.score')!.textContent).toBe('5 / 6');
  expect(screen.getByText('This revisit: 1 of 1 correct.')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Practise missed cards/ })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Reset progress' }));
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(localStorage.getItem(STORAGE_KEY)).toContain('"attempts":2');
  await user.click(screen.getByRole('button', { name: 'Reset progress' }));
  await user.click(screen.getByRole('button', { name: 'Yes, reset' }));
  await user.click(screen.getByRole('button', { name: /Back to deck/ }));
  expect(screen.getByText('0 of 6 concepts practised. No rush, no timer.')).toBeTruthy();
});
