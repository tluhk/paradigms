import { useEffect, useState } from 'react';
import { ConceptReferences } from './References';
import { validQualityDraft } from './QualityDecisions';
import { summariseAttempts, type EvidenceExercise } from './content/evidence';
import type { Language } from './i18n';
import type { SessionStore } from './storage/sessions';
interface EvidenceDraft { version: number; open: boolean; answers: Record<string, string>; first: Record<string, string> }
export const validEvidenceDraft = (exercise: EvidenceExercise) => (value: unknown): value is EvidenceDraft => validQualityDraft(exercise.questions)(value) && (value as EvidenceDraft).version === exercise.version;
export default function EvidencePractice({ exercise, language, sessions, onStorageError }: { exercise: EvidenceExercise; language: Language; sessions: SessionStore; onStorageError?: () => void }) {
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const key = `evidence:${exercise.id}`;
  const [draft, setDraft] = useState<EvidenceDraft>(() => sessions.read(key, validEvidenceDraft(exercise)) ?? { version: exercise.version, open: false, answers: {}, first: {} });
  useEffect(() => { if (!sessions.write(key, draft)) onStorageError?.(); }, [sessions, key, draft, onStorageError]);
  const conditions = ['baseline', 'prototype'] as const;
  const conditionName = (condition: typeof conditions[number]) => condition === 'baseline' ? say('Current process', 'Senine lahendus') : say('Prototype', 'Prototüüp');
  const supported = (answers: Record<string, string>) => exercise.questions.filter(q => q.choices.some(c => c.id === answers[q.id] && c.fits)).length;
  return <section className="study-quality evidence-practice" aria-labelledby="evidence-heading">
    <h2 id="evidence-heading">{say('Interpret the evidence', 'Tõlgenda tõendeid')}</h2>
    <p>{say('Fictional teaching dataset — all records and participant excerpts below are invented, not findings from a real study. Read the evidence, consider its limits, and choose a prototype revision. Results are separate from placement and quality practice.', 'Väljamõeldud õppeandmestik — kõik allolevad tulemused ja osalejate väljavõtted on välja mõeldud, mitte päris uuringu tulemused. Loe tõendeid, kaalu nende piire ja vali prototüübi parandus. Tulemused on paigutus- ja kvaliteediharjutusest eraldi.')}</p>
    <button className="secondary" aria-expanded={draft.open} aria-controls="evidence-content" onClick={() => setDraft({ ...draft, open: !draft.open })}>{draft.open ? say('Close evidence exercise', 'Sulge tõendiharjutus') : say('Explore fictional evidence', 'Uuri väljamõeldud tõendeid')}</button>
    {draft.open && <div id="evidence-content">
      <h3>{say('Task and procedure', 'Ülesanne ja protseduur')}</h3><p>{exercise.task[language]}</p><p>{exercise.context[language]}</p>
      <p>{say('Success means completing every stated task requirement without facilitator assistance within 300 seconds. Time runs from the task prompt to successful completion. “Not completed” means the attempt ended without success; it is excluded from successful-time medians, never counted as zero. Errors include all attempts. Each participant tries the current process first, so order and practice may influence the results.', 'Edu tähendab kõigi kirjeldatud ülesandenõuete täitmist juhendaja abita 300 sekundi jooksul. Aega mõõdetakse ülesande esitamisest eduka lõpetamiseni. „Lõpetamata” tähendab eduta lõppenud katset; see jäetakse edukate aegade mediaanist välja, mitte ei loeta nulliks. Vead hõlmavad kõiki katseid. Iga osaleja proovib esmalt senist lahendust, seega võivad järjekord ja harjutamine tulemusi mõjutada.')}</p>
      <div className="evidence-table-wrap" role="region" aria-label={say('Task results table', 'Ülesandetulemuste tabel')} tabIndex={0}>
        <table><caption>{say('Fictional task records', 'Väljamõeldud ülesandetulemused')}</caption><thead><tr><th scope="col">{say('Participant', 'Osaleja')}</th><th scope="col">{say('Condition', 'Tingimus')}</th><th scope="col">{say('Completion time (s)', 'Lõpetamise aeg (s)')}</th><th scope="col">{say('Errors', 'Vead')}</th></tr></thead><tbody>
          {exercise.attempts.map(row => <tr key={`${row.participant}-${row.condition}`}><th scope="row">{row.participant}</th><td>{conditionName(row.condition)}</td><td>{row.seconds ?? say('Not completed', 'Lõpetamata')}</td><td>{row.errors}</td></tr>)}
        </tbody></table>
      </div>
      <div className="evidence-table-wrap" role="region" aria-label={say('Evidence summary table', 'Tõendite kokkuvõtte tabel')} tabIndex={0}>
        <table><caption>{say('Calculated summary — successful times only', 'Arvutatud kokkuvõte — ainult edukate katsete ajad')}</caption><thead><tr><th scope="col">{say('Condition', 'Tingimus')}</th><th scope="col">{say('Success', 'Edukus')}</th><th scope="col">{say('Median time (s)', 'Mediaanaeg (s)')}</th><th scope="col">{say('Total errors', 'Vigu kokku')}</th></tr></thead><tbody>
          {conditions.map(condition => { const summary = summariseAttempts(exercise.attempts.filter(r => r.condition === condition)); return <tr key={condition}><th scope="row">{conditionName(condition)}</th><td>{summary.successes}/{summary.total} ({summary.total ? Math.round(100 * summary.successes / summary.total) : 0}%)</td><td>{summary.median ?? '—'}</td><td>{summary.errors}</td></tr>; })}
        </tbody></table>
      </div>
      <p className="small-note">{say('The median is the middle successful time after sorting; for an even count it is the average of the two middle values. Compare success as well as time, especially when different participants succeed in each condition.', 'Mediaan on järjestatud edukate aegade keskel asuv väärtus; paarisarvu korral kahe keskel asuva väärtuse keskmine. Võrdle lisaks ajale edukust, eriti kui kummaski tingimuses õnnestuvad erinevad osalejad.')}</p>
      <h3>{say('Fictional participant excerpts', 'Väljamõeldud osalejate väljavõtted')}</h3>
      {exercise.excerpts.map((excerpt, i) => <figure className="evidence-excerpt" key={i}><blockquote>{excerpt.quote[language]}</blockquote><figcaption>{excerpt.participant} · {say('after the prototype task; invented excerpt', 'pärast prototüübi ülesannet; väljamõeldud väljavõte')}</figcaption></figure>)}
      {exercise.questions.map((q, i) => { const answer = q.choices.find(c => c.id === draft.answers[q.id]); const choices = i % 2 ? [...q.choices].reverse() : q.choices; return <fieldset key={q.id} className="reflection-card quality-question">
        <legend>{q.prompt[language]}</legend><div className="quality-options">{choices.map(c => <button className="secondary" key={c.id} disabled={!!answer} aria-pressed={draft.answers[q.id] === c.id} onClick={() => setDraft(previous => previous.answers[q.id] ? previous : { ...previous, answers: { ...previous.answers, [q.id]: c.id }, first: { ...previous.first, [q.id]: previous.first[q.id] ?? c.id } })}>{c.label[language]}</button>)}</div>
        <div role="status">{answer && <p><strong>{answer.fits ? say('✓ Supported by this evidence. ', '✓ Nende tõenditega toetatud. ') : say('↻ Reconsider the evidence. ', '↻ Vaata tõendid uuesti üle. ')}</strong>{answer.feedback[language]}</p>}</div>
        {answer && !answer.fits && <button className="text-button" onClick={() => setDraft(previous => { const answers = { ...previous.answers }; delete answers[q.id]; return { ...previous, answers }; })}>{say('Retry this interpretation', 'Proovi seda tõlgendust uuesti')}</button>}
        {answer && <ConceptReferences conceptId={q.lesson} language={language} />}
      </fieldset>; })}
      <div className="quality-results" role="status"><p>{say('Evidence — first answers', 'Tõendid — esimesed vastused')}: {supported(draft.first)} / {exercise.questions.length} · {Object.keys(draft.first).length} {say('answered', 'vastatud')}</p><p>{say('Currently supported interpretations', 'Praegu toetatud tõlgendused')}: {supported(draft.answers)} / {exercise.questions.length}</p>{supported(draft.answers) === exercise.questions.length && <p>{say('Evidence exercise complete. The proposed revision is a hypothesis to test, not a demonstrated fix.', 'Tõendiharjutus lõpetatud. Pakutud parandus on kontrollitav hüpotees, mitte tõestatud lahendus.')}</p>}</div>
      <p>{say('The cited sources explain analysis and evaluation methods; they are not the source of these invented observations.', 'Viidatud allikad selgitavad analüüsi- ja hindamismeetodeid; need ei ole väljamõeldud vaatluste allikad.')}</p>
    </div>}
  </section>;
}
