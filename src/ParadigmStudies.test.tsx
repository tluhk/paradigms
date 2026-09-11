// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StudyBuilder from './StudyBuilder';
import { paradigmStudies } from './content/paradigm-studies';
import { decks } from './content/decks';
import { slotLabels, type StudySlot } from './content/studies';
import { paradigmCards } from './content/paradigms';
import { emptyProgress, parseProgress } from './storage/progress';
import { validDeck } from './storage/sessions';
import { createRound } from './game/round';
afterEach(() => { cleanup(); localStorage.clear(); });
it('plays the new scenarios in both languages with alternative paradigm justifications', async () => {
  const user = userEvent.setup();
  for (const language of ['en', 'et'] as const) {
    localStorage.clear();
    const view = render(<StudyBuilder language={language} />);
    for (const study of paradigmStudies) {
      await user.click(screen.getByRole('button', { name: new RegExp(study.title[language] + '$') }));
      const editable = (Object.keys(study.slots) as StudySlot[]).filter(slot => !study.fixed[slot]);
      for (const slot of editable) {
        const choices = study.slots[slot]!.filter(c => c.fits);
        const choice = language === 'et' && slot === 'paradigm' ? choices[choices.length - 1] : choices[0];
        const term = decks.flatMap(d => d.cards[language]).find(c => c.id === choice.id)!.term;
        await user.click(screen.getByRole('button', { name: term }));
        await user.click(screen.getByRole('button', { name: `${language === 'en' ? 'Place' : 'Paiguta'}: ${slotLabels[slot][language]}` }));
      }
      await user.click(screen.getByRole('button', { name: language === 'en' ? 'Check connections' : 'Kontrolli seoseid' }));
      expect(screen.getByText(language === 'en' ? 'A connected research study.' : 'Seostatud uuring.')).toBeTruthy();
      expect(screen.getByText(`${language === 'en' ? 'First attempt' : 'Esimene katse'}: ${editable.length} / ${editable.length}`)).toBeTruthy();
      expect(screen.getByText(language === 'en' ? '✓ Coherent for this brief' : '✓ Selle ülesande jaoks kooskõlaline')).toBeTruthy();
      expect(screen.getAllByRole('textbox')).toHaveLength(editable.length * 2);
    }
    view.unmount();
  }
});
it('preserves progress on the original cards while safely restarting obsolete four-card rounds', () => {
  const original = ['interpretivism', 'pragmatism', 'critical', 'postpositivism'].map(id => paradigmCards.en.find(c => c.id === id)!);
  const saved = emptyProgress(original);
  saved.cards.interpretivism = { viewed: true, attempts: 3, correct: 2, latest: true };
  const restored = parseProgress(JSON.stringify(saved), paradigmCards.en);
  expect(restored.cards.interpretivism).toEqual(saved.cards.interpretivism);
  for (const id of ['positivism', 'constructivism', 'critical-realism']) expect(restored.cards[id]).toEqual({ viewed: false, attempts: 0, correct: 0, latest: null });
  expect(validDeck(paradigmCards.en.map(c => c.id))({ ids: original.map(c => c.id), cardIndex: 2, revealed: true, practiceStarted: true, round: createRound(original.map(c => c.id), null, original) })).toBe(false);
});
