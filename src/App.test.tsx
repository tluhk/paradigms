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
  expect(screen.getByText('Õige vastus!')).toBeTruthy();
  expect(localStorage.getItem(STORAGE_KEY)).toBe(saved);
  await user.click(screen.getByRole('button', { name: /Tagasi kaardipaki/ }));
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

it('keeps new decks, questions, translations, and saved progress separate', async () => {
  const { decks } = await import('./content/decks');
  const user = userEvent.setup();
  render(<App />);
  for (const deck of decks.slice(1)) {
    await user.click(screen.getByRole('button', { name: new RegExp(deck.en + '$') }));
    await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
    await user.click(screen.getByRole('button', { name: /Show explanation/ }));
    expect(screen.getByText(deck.cards.en[0].definition)).toBeTruthy();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
    expect(screen.getByText(deck.cards.et[0].definition)).toBeTruthy();
    await user.selectOptions(screen.getByRole('combobox', { name: 'Keel' }), 'en');
    await user.click(screen.getByRole('button', { name: /Back to deck/ }));
    await user.click(screen.getByRole('button', { name: /Practise matching/ }));
    for (let i = 0; i < deck.cards.en.length; i++) {
      const term = screen.getByRole('heading', { level: 1 }).textContent!.replace(/\?$/, '');
      const target = deck.cards.en.find(c => c.term === term)!;
      expect(target).toBeTruthy();
      await user.click(screen.getByText(target.definition).closest('button')!);
      await user.click(screen.getByRole('button', { name: i < deck.cards.en.length - 1 ? /Continue/ : /See results/ }));
    }
    expect(document.querySelector('.score')!.textContent).toBe(`${deck.cards.en.length} / ${deck.cards.en.length}`);
    await user.click(screen.getByRole('button', { name: /Back to deck/ }));
    await user.click(screen.getByRole('button', { name: /Place the cards/ }));
    for (const card of deck.cards.en) {
      await user.click(screen.getByRole('button', { name: card.term }));
      await user.click(screen.getByRole('button', { name: `Place card: ${card.definition}` }));
    }
    await user.click(screen.getByRole('button', { name: 'Check placements' }));
    expect(screen.getByText('Connections made.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Back to deck/ }));
  }
  await user.click(screen.getByRole('button', { name: /Foundations of research$/ }));
  expect(screen.getByText('0 of 6 concepts practised. No rush, no timer.')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: /Methodology$/ }));
  expect(screen.getByText('8 of 8 concepts practised. No rush, no timer.')).toBeTruthy();
});

it('reaches the added learning cards and starts practice only after the last card', async () => {
  const { decks } = await import('./content/decks');
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Methodology$/ }));
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  for (let i = 0; i < 8; i++) {
    expect(screen.getByText(`Card ${i + 1} of 8`)).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(decks.find(deck => deck.id === 'methodologies')!.cards.en[i].term);
    await user.click(screen.getByRole('button', { name: i < 7 ? /Next card/ : /Practise this deck/ }));
  }
  expect(screen.getByText('Question 1 of 8')).toBeTruthy();
});

it('teaches all seven paradigms with bilingual assumptions and references', async () => {
  const { paradigmCards } = await import('./content/paradigms');
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Paradigms$/ }));
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  for (let i = 0; i < paradigmCards.en.length; i++) {
    expect(screen.getByText(`Card ${i + 1} of ${paradigmCards.en.length}`)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Show explanation/ }));
    const active = document.querySelector('.learning-flip[aria-hidden="false"]')!;
    expect(active.textContent).toContain(paradigmCards.en[i].assumptions.ontology);
    expect(active.textContent).toContain(paradigmCards.en[i].assumptions.epistemology);
    expect(active.textContent).toContain(paradigmCards.en[i].assumptions.axiology);
    expect(screen.getAllByRole('link').some(link => link.getAttribute('target') === '_blank')).toBe(true);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
    expect(active.textContent).toContain(paradigmCards.et[i].assumptions.ontology);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(paradigmCards.et[i].term);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Keel' }), 'en');
    await user.click(screen.getByRole('button', { name: i < paradigmCards.en.length - 1 ? /Next card/ : /Practise this deck/ }));
  }
  expect(screen.getByText('Question 1 of 7')).toBeTruthy();
  const saved = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-paradigms`)!);
  expect(Object.values(saved.cards).every((entry: any) => entry.viewed)).toBe(true);
  expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
});
