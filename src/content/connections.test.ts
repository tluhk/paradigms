import { expect, it } from 'vitest';
import { connectionRules, evaluateConnections, retryStudySlots } from './connections';
import { studies, type StudySlot } from './studies';
const solution = (index: number) => Object.fromEntries(Object.entries(studies[index].slots).map(([slot, choices]) => [slot, choices.find(c => c.fits)!.id]));
it('covers all briefs with bilingual rules and accepts every supported combination', () => {
  for (const study of studies) {
    expect(connectionRules[study.id].length).toBeGreaterThan(0);
    let combinations = [{}];
    for (const [slot, choices] of Object.entries(study.slots)) combinations = combinations.flatMap(a => choices.filter(c => c.fits).map(c => ({ ...a, [slot]: c.id })));
    for (const answers of combinations) expect(evaluateConnections(study, answers).every(r => r.status === 'fits')).toBe(true);
    for (const rule of connectionRules[study.id]) {
      for (const value of [rule.title, rule.fits, rule.reconsider]) { expect(value.en.length).toBeGreaterThan(10); expect(value.et.length).toBeGreaterThan(10); }
      for (const slot of rule.slots) for (const id of rule.accepts[slot]!) expect(study.slots[slot]!.some(c => c.id === id)).toBe(true);
    }
  }
});
it('checks actual evidence combinations and distinguishes missing cards from mismatches', () => {
  const study = studies[0];
  expect(evaluateConnections(study, {}).every(r => r.status === 'incomplete')).toBe(true);
  expect(evaluateConnections(study, { ...solution(0), analysis: 'descriptive-statistics' })[0].status).toBe('reconsider');
  // Same analysis, different data source: not a lookup of analysis-card correctness.
  expect(evaluateConnections(study, { ...solution(0), collection: 'questionnaire' })[0].status).toBe('reconsider');
  expect(evaluateConnections(study, { ...solution(0), collection: 'focus-group' })[0].status).toBe('fits');
});
it('requires evaluation evidence tied to each computing question', () => {
  for (let i = 3; i < 6; i++) {
    const results = evaluateConnections(studies[i], { ...solution(i), evaluation: 'count-features' });
    expect(results.some(r => r.slots.includes('evaluation') && r.status === 'reconsider')).toBe(true);
    expect(results.some(r => !r.slots.includes('evaluation') && r.status === 'fits')).toBe(true);
    expect(retryStudySlots(studies[i], { ...solution(i), evaluation: 'count-features' })).not.toContain('evaluation');
  }
});
it('unlocks individually fitting cards involved in a combination conflict', () => {
  const study = structuredClone(studies[0]);
  study.slots.collection!.find(c => c.id === 'questionnaire')!.fits = true;
  const locked = retryStudySlots(study, { ...solution(0), collection: 'questionnaire' });
  expect(locked).not.toContain('collection');
  expect(locked).not.toContain('analysis');
  expect(locked).toContain('methodology' satisfies StudySlot);
  expect(locked).toContain('paradigm');
});
