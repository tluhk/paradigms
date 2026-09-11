import { useEffect, useState } from 'react';
import { slotLabels, type Study, type StudySlot, type Bilingual } from './content/studies';
import type { Language } from './i18n';
import type { SessionStore } from './storage/sessions';

const prompts: Record<StudySlot, Bilingual> = {
  paradigm: { en: 'Which aim or assumption in the brief supports this paradigm?', et: 'Milline ülesande eesmärk või eeldus toetab seda paradigmat?' },
  methodology: { en: 'How would this methodology organise the work needed to answer the research question?', et: 'Kuidas korraldaks see metodoloogia uurimisküsimusele vastamiseks vajalikku tööd?' },
  collection: { en: 'What would you collect, from whom, and how would it help answer this question?', et: 'Mida ja kellelt koguksid ning kuidas aitaks see küsimusele vastata?' },
  collection2: { en: 'What would this additional method contribute beyond the evidence already collected?', et: 'Mida lisaks see täiendav meetod juba kogutud tõenditele?' },
  analysis: { en: 'What would you do with the collected data, and what could the result tell you?', et: 'Mida teeksid kogutud andmetega ja mida võiks tulemus sulle öelda?' },
  evaluation: { en: 'What task or outcome would show whether the application solves the stated problem?', et: 'Milline ülesanne või tulemus näitaks, kas rakendus lahendab kirjeldatud probleemi?' },
};
interface Reflection { explanation: string; limitation: string; compared: boolean }
const valid = (v: unknown): v is Reflection => {
  if (!v || typeof v !== 'object') return false;
  const r = v as Reflection;
  return typeof r.explanation === 'string' && r.explanation.length <= 4000 && typeof r.limitation === 'string' && r.limitation.length <= 4000 && typeof r.compared === 'boolean';
};
export default function StudyReflection({ study, slot, choiceId, term, language, sessions, onStorageError }: {
  study: Study; slot: StudySlot; choiceId: string; term: string; language: Language; sessions: SessionStore; onStorageError?: () => void;
}) {
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const key = `reflection:${study.id}:${slot}:${choiceId}`;
  const [draft, setDraft] = useState<Reflection>(() => sessions.read(key, valid) ?? { explanation: '', limitation: '', compared: false });
  useEffect(() => { if (!sessions.write(key, draft)) onStorageError?.(); }, [sessions, key, draft, onStorageError]);
  const choice = study.slots[slot]!.find(c => c.id === choiceId)!;
  const example = choice.fits ? choice : study.slots[slot]!.find(c => c.fits)!;
  return <article className="reflection-card">
    <h3>{slotLabels[slot][language]}: {term}</h3>
    <label>{prompts[slot][language]}<textarea maxLength={4000} rows={3} value={draft.explanation} onChange={e => setDraft({ ...draft, explanation: e.target.value })} /></label>
    <label>{say('What is one limitation or alternative you would consider?', 'Millist piirangut või alternatiivi kaaluksid?')}<textarea maxLength={4000} rows={2} value={draft.limitation} onChange={e => setDraft({ ...draft, limitation: e.target.value })} /></label>
    <button className="secondary" aria-expanded={draft.compared} onClick={() => setDraft({ ...draft, compared: !draft.compared })}>{draft.compared ? say('Hide comparison', 'Peida võrdlus') : say('Compare with an example', 'Võrdle näitega')}</button>
    {draft.compared && <div className="reflection-comparison">
      <h4>{say('Feedback on the selected connection', 'Tagasiside valitud seosele')}</h4><p>{choice.reason[language]}</p>
      <h4>{say('Example reasoning for a fitting connection', 'Sobiva seose põhjenduse näide')}</h4><p>{example.reason[language]}</p>
      <p>{say('Review your explanation: did you name a detail from the brief, explain how the choice addresses the question, and consider a limitation or alternative? Revise your text where needed. This example is a starting point, not the only defensible answer.', 'Vaata oma selgitus üle: kas nimetasid ülesande üksikasja, selgitasid valiku seost uurimisküsimusega ning kaalusid piirangut või alternatiivi? Vajadusel täienda teksti. Näide on lähtekoht, mitte ainus põhjendatav vastus.')}</p>
    </div>}
  </article>;
}
