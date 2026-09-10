// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { concepts } from './content/foundations';
import { estonianConcepts } from './content/foundations.et';
import { STORAGE_KEY } from './storage/progress';
afterEach(() => { cleanup(); localStorage.clear(); });
const slot = (index: number) => screen.getByRole('button', { name: `Place card: ${concepts[index].definition}` });
it('checks a full board, locks correct cards, retries mistakes and preserves first score', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Place the cards/ }));
  expect((screen.getByRole('button', { name: 'Check placements' }) as HTMLButtonElement).disabled).toBe(true);
  for (let i = 0; i < 6; i++) {
    await user.click(screen.getByRole('button', { name: concepts[i].term }));
    await user.click(slot(i < 2 ? 1 - i : i));
  }
  await user.dblClick(screen.getByRole('button', { name: 'Check placements' }));
  expect(screen.getByText('Correct on your first attempt: 4 / 6')).toBeTruthy();
  let saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(Object.values(saved.cards).every((c: any) => c.attempts === 1)).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Retry incorrect cards' }));
  expect((slot(2) as HTMLButtonElement).disabled).toBe(true);
  for (let i = 0; i < 2; i++) {
    await user.click(screen.getByRole('button', { name: concepts[i].term }));
    await user.click(slot(i));
  }
  await user.click(screen.getByRole('button', { name: 'Check placements' }));
  expect(screen.getByText('Connections made.')).toBeTruthy();
  expect(screen.getByText('Correct on your first attempt: 4 / 6')).toBeTruthy();
  saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
  expect(saved.cards.ontology.attempts).toBe(2);
  expect(saved.cards.axiology.attempts).toBe(1);
  await user.click(screen.getByRole('button', { name: 'New placement round' }));
  expect(screen.getByText('0 / 6 cards placed')).toBeTruthy();
});
it('supports keyboard placement, replacement, removal, drag and language changes', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('button', { name: /Place the cards/ }));
  screen.getByRole('button', { name: 'Ontology' }).focus();
  await user.keyboard('{Enter}');
  slot(0).focus();
  await user.keyboard(' ');
  expect(slot(0).textContent).toBe('Ontology');
  await user.click(screen.getByRole('button', { name: 'Epistemology' }));
  await user.click(slot(0));
  expect(screen.getByRole('button', { name: 'Ontology' })).toBeTruthy();
  await user.click(slot(0));
  expect(screen.getByText('0 / 6 cards placed')).toBeTruthy();
  const data: Record<string, string> = {};
  const dataTransfer = { setData: (key: string, value: string) => { data[key] = value; }, getData: (key: string) => data[key] };
  fireEvent.dragStart(screen.getByRole('button', { name: 'Ontology' }), { dataTransfer });
  fireEvent.dragOver(slot(0), { dataTransfer });
  fireEvent.drop(slot(0), { dataTransfer });
  expect(slot(0).textContent).toBe('Ontology');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Language' }), 'et');
  expect(screen.getByRole('button', { name: `Paiguta kaart: ${estonianConcepts[0].definition}` }).textContent).toBe('Ontoloogia');
  expect(screen.getByText('1 / 6 kaarti paigas')).toBeTruthy();
});
