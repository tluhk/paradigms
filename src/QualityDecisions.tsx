import { useEffect, useState } from 'react';
import { ConceptReferences } from './References';
import { qualityDecisions, qualityLessons, type QualityDecision } from './content/quality';
import type { Language } from './i18n';
import type { SessionStore } from './storage/sessions';
interface QualityDraft { answers: Record<string, string>; first: Record<string, string>; open: boolean }
export const validQualityDraft = (decisions: QualityDecision[]) => (value: unknown): value is QualityDraft => {
  if (!value || typeof value !== 'object') return false;
  const v = value as QualityDraft;
  const validAnswers = (answers: unknown): answers is Record<string, string> => !!answers && typeof answers === 'object' && !Array.isArray(answers) && Object.entries(answers).every(([id, choice]) => decisions.some(d => d.id === id && d.choices.some(c => c.id === choice)));
  return typeof v.open === 'boolean' && validAnswers(v.answers) && validAnswers(v.first) && Object.keys(v.answers).every(id => id in v.first);
};
export default function QualityDecisions({ studyId, language, sessions, onStorageError }: { studyId: string; language: Language; sessions: SessionStore; onStorageError?: () => void }) {
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const decisions = qualityDecisions(studyId);
  const key = `quality:${studyId}`;
  const [draft, setDraft] = useState<QualityDraft>(() => sessions.read(key, validQualityDraft(decisions)) ?? { answers: {}, first: {}, open: false });
  useEffect(() => { if (!sessions.write(key, draft)) onStorageError?.(); }, [sessions, key, draft, onStorageError]);
  const fits = (d: QualityDecision, answers: Record<string, string>) => d.choices.some(c => c.id === answers[d.id] && c.fits);
  const firstCount = decisions.filter(d => fits(d, draft.first)).length;
  const currentCount = decisions.filter(d => fits(d, draft.answers)).length;
  return <section className="study-quality" aria-labelledby="quality-heading">
    <h2 id="quality-heading">{say('Research quality decisions', 'Uuringu kvaliteedi otsused')}</h2>
    <p>{say('A coherent tree still needs a credible and ethical study plan. Explore six short lessons and four decisions for this brief. This optional practice has separate results; it does not change your card-placement score or completion mark.', 'Kooskõlaline puu vajab endiselt usaldusväärset ja eetilist uuringukava. Tutvu kuue lühikese õppetunni ja nelja otsusega selle ülesande jaoks. Sellel vabatahtlikul harjutusel on eraldi tulemused; see ei muuda kaardipaigutuste tulemust ega lõpetamise märki.')}</p>
    <button className="secondary" aria-expanded={draft.open} aria-controls="quality-content" onClick={() => setDraft({ ...draft, open: !draft.open })}>{draft.open ? say('Close quality practice', 'Sulge kvaliteediharjutus') : say('Explore quality decisions', 'Tutvu kvaliteediotsustega')}</button>
    {draft.open && <div id="quality-content">
      <h3>{say('Short lessons', 'Lühikesed õppetunnid')}</h3>
      {qualityLessons.map(lesson => <details className="quality-lesson" key={lesson.id}><summary>{lesson.title[language]}</summary><p>{lesson.body[language]}</p><ConceptReferences conceptId={lesson.id} language={language} /></details>)}
      <p>{say('Choose the better-supported plan for each situation. Feedback appears after selection.', 'Vali iga olukorra jaoks paremini põhjendatud plaan. Tagasiside ilmub pärast valikut.')}</p>
      {decisions.map((decision, i) => {
        const answer = decision.choices.find(c => c.id === draft.answers[decision.id]);
        // Alternate positions so the supported plan is not always the last button.
        const choices = i % 2 ? [...decision.choices].reverse() : decision.choices;
        return <fieldset className="reflection-card quality-question" key={decision.id}>
          <legend>{decision.prompt[language]}</legend>
          <p className="small-note">{qualityLessons.find(l => l.id === decision.lesson)!.title[language]}</p>
          <div className="quality-options">{choices.map(choice => <button className="secondary" key={choice.id} disabled={!!answer} aria-pressed={draft.answers[decision.id] === choice.id} onClick={() => setDraft(previous => previous.answers[decision.id] ? previous : { ...previous, answers: { ...previous.answers, [decision.id]: choice.id }, first: { ...previous.first, [decision.id]: previous.first[decision.id] ?? choice.id } })}>{choice.label[language]}</button>)}</div>
          <div role="status">{answer && <p><strong>{answer.fits ? say('✓ Supported plan. ', '✓ Põhjendatud plaan. ') : say('↻ Review this plan. ', '↻ Vaata plaan üle. ')}</strong>{answer.feedback[language]}</p>}</div>
          {answer && <ConceptReferences conceptId={decision.lesson} language={language} />}
          {answer && !answer.fits && <button className="text-button" onClick={() => setDraft(previous => { const answers = { ...previous.answers }; delete answers[decision.id]; return { ...previous, answers }; })}>{say('Retry this decision', 'Proovi seda otsust uuesti')}</button>}
        </fieldset>;
      })}
      <div className="quality-results" role="status">
        <p>{say('Quality decisions — first answers', 'Kvaliteediotsused — esimesed vastused')}: {firstCount} / {decisions.length} · {Object.keys(draft.first).length} {say('answered', 'vastatud')}</p>
        <p>{say('Currently supported plans', 'Praegu põhjendatud plaanid')}: {currentCount} / {decisions.length}</p>
        {currentCount === decisions.length && <p>{say('Quality practice complete. These choices are a starting point for planning, not certification that a study is valid or ethically approved.', 'Kvaliteediharjutus lõpetatud. Need valikud on kavandamise lähtekoht, mitte kinnitus uuringu valiidsuse või eetikakooskõlastuse kohta.')}</p>}
      </div>
    </div>}
  </section>;
}
