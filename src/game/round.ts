import { concepts } from '../content/foundations';
export interface Question { id: string; options: string[]; answer?: string }
export interface Round { questions: Question[]; index: number; initialScore: number | null; initialTotal: number }
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function createRound(ids = concepts.map(c => c.id), initialScore: number | null = null, pool = concepts): Round {
  return { questions: shuffle(ids).map(id => ({ id, options: shuffle([id, ...shuffle(pool.filter(c => c.id !== id).map(c => c.id)).slice(0, 2)]) })), index: 0, initialScore, initialTotal: pool.length };
}
export function submit(round: Round, answer: string): Round {
  const question = round.questions[round.index];
  if (!question || question.answer !== undefined || !question.options.includes(answer)) return round;
  return { ...round, questions: round.questions.map((q, i) => i === round.index ? { ...q, answer } : q) };
}
export const score = (round: Round) => round.questions.filter(q => q.answer === q.id).length;
export const missed = (round: Round) => round.questions.filter(q => q.answer !== q.id).map(q => q.id);
