// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import StudyBuilder from './StudyBuilder';
import { decks } from './content/decks';
import { paradigms, studies } from './content/studies';
import { evaluationCards } from './content/computing-studies';
import { conceptReferences, references } from './content/references';
afterEach(() => { cleanup(); localStorage.clear(); });

it('covers every bilingual concept and scenario choice with an identifiable reference', () => {
  for (const language of ['en', 'et'] as const) {
    const ids = [...decks.flatMap(deck => deck.cards[language].map(c => c.id)), ...paradigms.map(p => p.id), ...evaluationCards.map(p => p.id)];
    expect(new Set(ids).size).toBe(29);
    for (const id of ids) {
      expect(conceptReferences[id]?.length, id).toBeGreaterThan(0);
      for (const referenceId of conceptReferences[id]) {
        const reference = references[referenceId];
        expect(reference.authors.length).toBeGreaterThan(0);
        expect(reference.title.length).toBeGreaterThan(0);
        expect(new URL(reference.url).protocol).toBe('https:');
        expect(reference.year).toMatch(/^(\d{4}|n\.d\.)$/);
      }
    }
  }
  for (const study of studies) for (const choices of Object.values(study.slots)) for (const choice of choices) expect(conceptReferences[choice.id]?.length).toBeGreaterThan(0);
});

it('shows references only on the visible learning face, with safe new-tab links in both languages', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Explore the cards/ }));
  expect(screen.queryByRole('link', { name: /Ontology/ })).toBeNull();
  await user.click(screen.getByRole('button', { name: /Show explanation/ }));
  const link = screen.getByRole('link', { name: /Ontology/ });
  expect(link.getAttribute('href')).toBe(references.ontology.url);
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toContain('noopener');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
  expect(screen.getByRole('link', { name: /Ontology.*avaneb uuel vahelehel/ }).getAttribute('href')).toBe(references.ontology.url);
  await user.click(screen.getByRole('button', { name: /Tagasi mõiste juurde/ }));
  expect(screen.queryByRole('link', { name: /Ontology/ })).toBeNull();
});

it('makes the bibliography available from the footer and explains provenance', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'References' }));
  expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }));
  expect(screen.getByText(/Examples, scenarios, and scoring rules were written for this game/)).toBeTruthy();
  for (const deck of decks) for (const card of deck.cards.en) {
    const heading = screen.getByRole('heading', { level: 3, name: card.term });
    expect(within(heading.closest('article')!).getAllByRole('link').length).toBeGreaterThan(0);
  }
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
  expect(screen.getByRole('heading', { name: 'Allikad ja lisalugemine' })).toBeTruthy();
  expect(screen.getByRole('heading', { level: 3, name: 'Disainiteaduslik uuring' })).toBeTruthy();
});

it('references given and selected paradigms without changing the study selection', async () => {
  const user = userEvent.setup();
  render(<StudyBuilder language="en" />);
  expect(screen.getByRole('link', { name: /Case Study/ }).getAttribute('href')).toBe(references.caseStudy.url);
  await user.click(screen.getByRole('button', { name: 'Interpretivism' }));
  expect(screen.getByRole('link', { name: /Interpretivism/ }).getAttribute('href')).toBe(references.interpretivism.url);
  await user.click(screen.getByRole('button', { name: 'Place: Paradigm' }));
  expect(screen.getByRole('link', { name: /Interpretivism/ }).getAttribute('href')).toBe(references.interpretivism.url);
});
