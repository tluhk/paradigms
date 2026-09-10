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

it('translates learning content and preserves an answered question across language changes', async () => {
  const { estonianConcepts } = await import('./content/foundations.et');
  const user = userEvent.setup();
  const view = render(<App />);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
  expect(document.documentElement.lang).toBe('et');
  expect(document.title).toBe('Uurimiskaardid — Uurimistöö alused');
  await user.click(screen.getByRole('button', { name: /Tutvu kaartidega/ }));
  for (let i = 0; i < 6; i++) {
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(estonianConcepts[i].term);
    await user.click(screen.getByRole('button', { name: /Näita selgitust/ }));
    expect(screen.getByText(estonianConcepts[i].definition)).toBeTruthy();
    expect(screen.getByText(estonianConcepts[i].example)).toBeTruthy();
    expect(screen.getByText(estonianConcepts[i].distinction)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: i < 5 ? /Järgmine kaart/ : /Harjuta selle kaardipakiga/ }));
  }
  const term = screen.getByRole('heading', { level: 1 }).textContent!.replace(/\?$/, '');
  const target = estonianConcepts.find(c => c.term === term)!;
  const option = screen.getByText(target.definition).closest('button')!;
  await user.click(option);
  expect(screen.getByText('Õige vastus!')).toBeTruthy();
  const saved = localStorage.getItem(STORAGE_KEY);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Keel' }), 'en');
  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(concepts.find(c => c.id === target.id)!.term + '?');
  expect(screen.getByText('That’s right.')).toBeTruthy();
  expect((screen.getByText(concepts.find(c => c.id === target.id)!.definition).closest('button') as HTMLButtonElement).disabled).toBe(true);
  expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
  view.unmount();
  render(<App />);
  expect((screen.getByRole('combobox', { name: 'Keel' }) as HTMLSelectElement).value).toBe('et');
  expect(screen.getByText('1 mõistet 6-st harjutatud. Kiirustamata, ajapiiranguta.')).toBeTruthy();
});

it('flips learning cards back and forth with focus on the visible face', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  await user.click(screen.getByRole('button', { name: /Show explanation/ }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
  expect(screen.queryByRole('button', { name: /Show explanation/ })).toBeNull();
  await user.click(screen.getByRole('button', { name: /Back to the term/ }));
  expect(screen.queryByRole('button', { name: /Back to the term/ })).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).cards.ontology.viewed).toBe(true);
  await user.click(screen.getByRole('button', { name: /Next card/ }));
  expect(screen.getByRole('button', { name: /Show explanation/ })).toBeTruthy();
});
