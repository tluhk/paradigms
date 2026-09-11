import QualityDecisions from './QualityDecisions';
import { evaluateConnections, retryStudySlots } from './content/connections';
import StudyReflection from './StudyReflection';
import { createSessionStore, validStudy, type SessionStore } from './storage/sessions';
import { ConceptReferences } from './References';
import { useEffect, useRef, useState } from 'react';
import { evaluationCards } from './content/computing-studies';
import { decks } from './content/decks';
import { evaluateStudy, slotLabels, studies, type StudySlot } from './content/studies';
import type { Language } from './i18n';

export default function StudyBuilder({ language, sessions: suppliedSessions, onStorageError }: { language: Language; sessions?: SessionStore; onStorageError?: () => void }) {
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const [sessions] = useState(() => suppliedSessions ?? createSessionStore());
  const [index, setIndex] = useState(() => { const id = sessions.read('study-current', (v): v is string => typeof v === 'string' && studies.some(s => s.id === v)); return Math.max(0, studies.findIndex(s => s.id === id)); });
  const study = studies[index];
  const [completed, setCompleted] = useState<string[]>(() => sessions.read('study-completed', (v): v is string[] => Array.isArray(v) && v.every(id => studies.some(s => s.id === id))) ?? []);
  const [draft] = useState(() => sessions.read(`study:${study.id}`, validStudy(study)));
  const [answers, setAnswers] = useState<Partial<Record<StudySlot, string>>>(draft?.answers ?? study.fixed);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(draft?.checked ?? false);
  const [locked, setLocked] = useState<StudySlot[]>(draft?.locked ?? []);
  const [firstScore, setFirstScore] = useState<number | null>(draft?.firstScore ?? null);
  const [invalid, setInvalid] = useState(false);
  const dragged = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<StudySlot | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index]);
  const slots = Object.keys(study.slots) as StudySlot[];
  const results = evaluateStudy(study, answers);
  const editable = slots.filter(slot => !study.fixed[slot]);
  const score = results.filter(r => !study.fixed[r.slot] && r.choice?.fits).length;
  const connections = evaluateConnections(study, answers);
  const connectionsFit = connections.every(r => r.status === 'fits');
  const complete = checked && results.every(r => r.choice?.fits) && connectionsFit;
  const allCards = [...decks.slice(1).flatMap(deck => deck.cards[language]), ...evaluationCards.map(p => ({ id: p.id, term: p.term[language], definition: p.definition[language] }))];
  const card = (id: string) => allCards.find(c => c.id === id)!;
  const available = [...new Set(editable.flatMap(slot => study.slots[slot]!.map(c => c.id)))].filter(id => !Object.values(answers).includes(id));
  useEffect(() => {
    const ok = sessions.write(`study:${study.id}`, { answers, checked, locked, firstScore });
    const navOk = sessions.write('study-current', study.id);
    const completedOk = sessions.write('study-completed', completed);
    if (!ok || !navOk || !completedOk) onStorageError?.();
  }, [sessions, study.id, answers, checked, locked, firstScore, completed, onStorageError]);
  function reset(next = index, fresh = true) {
    dragged.current = null; setDropTarget(null);
    if (fresh) sessions.remove(`quality:${studies[next].id}`);
    if (fresh) for (const slot of Object.keys(studies[next].slots) as StudySlot[]) {
      for (const choice of studies[next].slots[slot]!) sessions.remove(`reflection:${studies[next].id}:${slot}:${choice.id}`);
    }
    const saved = fresh ? undefined : sessions.read(`study:${studies[next].id}`, validStudy(studies[next]));
    setIndex(next); setAnswers(saved?.answers ?? studies[next].fixed); setSelected(null); setChecked(saved?.checked ?? false); setLocked(saved?.locked ?? []); setFirstScore(saved?.firstScore ?? null); setInvalid(false);
  }
  function place(slot: StudySlot, id = selected) {
    if (checked || study.fixed[slot] || locked.includes(slot)) return;
    if (id === null) {
      setAnswers(previous => { const next = { ...previous }; delete next[slot]; return next; });
      return;
    }
    if (!available.includes(id) || !study.slots[slot]!.some(c => c.id === id)) { setInvalid(true); return; }
    setAnswers(previous => ({ ...previous, [slot]: id }));
    setSelected(null); setInvalid(false);
  }
  function check() {
    if (checked || slots.some(slot => !answers[slot])) return;
    if (results.every(r => r.choice?.fits) && connectionsFit) setCompleted(previous => [...new Set([...previous, study.id])]);
    setChecked(true); setSelected(null); setInvalid(false);
    if (firstScore === null) setFirstScore(score);
  }
  function retry() {
    const fits = retryStudySlots(study, answers);
    setAnswers(Object.fromEntries(fits.map(slot => [slot, answers[slot]])));
    setLocked(fits); setChecked(false); setInvalid(false);
  }
  return <div className="study-builder">
    <span className="eyebrow">{say('CONNECT THE DECKS', 'SEO KAARDIPAKID')}</span>
    <h1 ref={heading} tabIndex={-1}>{say('Build a research study', 'Koosta uuring')}</h1>
    <p>{say('Complete a guided tree. These are plausible designs for specific briefs, not universal rules about which methods belong to a paradigm.', 'Täienda juhendatud puud. Need on konkreetsete ülesannete jaoks sobivad uuringud, mitte üldreeglid selle kohta, millised meetodid kuuluvad paradigma juurde.')}</p>
    <nav className="deck-picker" aria-label={say('Research scenarios', 'Uurimisolukorrad')}>
      {studies.map((item, i) => <button key={item.id} aria-pressed={index === i} onClick={() => reset(i, false)}><span>{String(i + 1).padStart(2, '0')}{completed.includes(item.id) && <span aria-label={say('Completed', 'Lõpetatud')}> ✓</span>}</span>{item.title[language]}</button>)}
    </nav>
    <section className="study-brief"><span className="eyebrow">{say('RESEARCH QUESTION', 'UURIMISKÜSIMUS')}</span><h2>{study.question[language]}</h2><p>{study.brief[language]}</p></section>
    <p>{say('Drag a card to a slot, or click a card, scroll normally, then click a slot. Click a filled slot to return its card. Given cards stay in place.', 'Lohista kaart kohale või klõpsa kaardil, keri tavaliselt ja klõpsa kohal. Kaardi tagastamiseks klõpsa täidetud kohal. Etteantud kaardid jäävad paika.')}</p>
    <div className={`placement-board study-board ${selected ? 'has-selection' : ''}`}>
      <aside className="placement-dock">
        <section className="card-tray" aria-label={say('Study cards', 'Uuringukaardid')}>
          {available.map(id => <button className="concept-card" key={id} draggable={!checked}
            onDragStart={event => {
              dragged.current = id;
              event.dataTransfer.setData('text/plain', id);
              event.dataTransfer.effectAllowed = 'move';
              setSelected(id); setInvalid(false);
            }}
            onDragEnd={() => { dragged.current = null; setDropTarget(null); setSelected(null); }}
            aria-pressed={selected === id} disabled={checked} title={card(id).definition} onClick={() => { setSelected(selected === id ? null : id); setInvalid(false); }}>{card(id).term}</button>)}
        </section>
        <p className="placement-status" role="status">{invalid ? say('Choose a slot for this type of card.', 'Vali seda tüüpi kaardile sobiv koht.') : selected ? `${say('Selected', 'Valitud')}: ${card(selected).term}` : say('Select a card to connect it.', 'Seostamiseks vali kaart.')}</p>
        {selected && <><p className="selected-definition">{card(selected).definition}</p><ConceptReferences conceptId={selected} language={language} /></>}
      </aside>
      <div className="study-tree">
        {slots.map((slot, i) => {
          const result = results.find(r => r.slot === slot)!;
          const fixed = Boolean(study.fixed[slot]);
          return <section key={slot} className={`study-node ${slot === 'paradigm' || slot === 'methodology' || slot === 'evaluation' ? 'study-root' : 'study-branch'} ${checked ? result.choice?.fits ? 'is-correct' : 'is-incorrect' : ''}`}>
            <h3><span>{String(i + 1).padStart(2, '0')}</span>{slotLabels[slot][language]} {fixed && <small>{say('Given', 'Ette antud')}</small>}</h3>
            <button className={`slot-target ${answers[slot] ? 'has-card' : 'is-empty'} ${dropTarget === slot ? 'drop-target' : ''}`} aria-label={`${say('Place', 'Paiguta')}: ${slotLabels[slot][language]}`} disabled={checked || fixed || locked.includes(slot)} onClick={() => place(slot)}
              onDragOver={event => {
                if (checked || fixed || locked.includes(slot) || !dragged.current) return;
                event.preventDefault();
                const fitsType = study.slots[slot]!.some(c => c.id === dragged.current);
                event.dataTransfer.dropEffect = fitsType ? 'move' : 'none';
                setDropTarget(fitsType ? slot : null);
              }}
              onDragLeave={() => setDropTarget(null)}
              onDrop={event => {
                event.preventDefault();
                const id = event.dataTransfer.getData('text/plain');
                if (dragged.current && id === dragged.current) place(slot, id);
                dragged.current = null; setDropTarget(null); setSelected(null);
              }}>{answers[slot] ? card(answers[slot]!).term : say('Place a card here', 'Paiguta kaart siia')}</button>
            {(checked || fixed || locked.includes(slot)) && result.choice && <p className="study-reason"><strong>{fixed ? say('Starting connection', 'Lähteseos') : result.choice.fits ? say('✓ Fits this brief', '✓ Sobib ülesandega') : say('↻ Reconsider this connection', '↻ Mõtle see seos uuesti läbi')}</strong>{result.choice.reason[language]}</p>}
            {answers[slot] && <ConceptReferences conceptId={answers[slot]!} language={language} />}
          </section>;
        })}
      </div>
    </div>
    <div className="placement-results" role="status">
      {checked && <><h2>{complete ? say('A connected research study.', 'Seostatud uuring.') : say('Review the connections.', 'Vaata seosed üle.')}</h2><p>{score} / {editable.length} {say('connections fit this brief', 'seost sobib ülesandega')}</p></>}
      {firstScore !== null && <p>{say('First attempt', 'Esimene katse')}: {firstScore} / {editable.length}</p>}
    </div>
    <div className="actions">
      {!checked && <button className="primary" disabled={slots.some(slot => !answers[slot])} onClick={check}>{say('Check connections', 'Kontrolli seoseid')}</button>}
      {checked && !complete && <button className="primary" onClick={retry}>{say('Retry connections', 'Proovi seoseid uuesti')}</button>}
      {complete && index < studies.length - 1 && <button className="primary" onClick={() => reset(index + 1, false)}>{say('Next scenario →', 'Järgmine olukord →')}</button>}
      <button className="secondary" onClick={() => reset()}>{say('Restart scenario', 'Alusta olukorda uuesti')}</button>
    </div>
    {checked && <section className="connection-review" aria-labelledby="connection-heading">
      <h2 id="connection-heading">{say('How the choices work together', 'Kuidas valikud koos toimivad')}</h2>
      <p>{say('These checks compare the selected combinations with this brief. They do not establish universal paradigm–method pairings or grade your written explanation. Your first-attempt score still counts individual card placements.', 'Need kontrollid võrdlevad valitud kombinatsioone selle ülesandega. Need ei määra üldkehtivaid paradigma ja meetodi paare ega hinda kirjalikku selgitust. Esimese katse tulemus loendab endiselt üksikuid kaardipaigutusi.')}</p>
      {connections.map(connection => <article className="reflection-card" key={connection.id}>
        <h3>{connection.title[language]}</h3>
        <p className="small-note">{connection.slots.map(slot => `${slotLabels[slot][language]}: ${card(answers[slot]!).term}`).join(' → ')}</p>
        <strong>{connection.status === 'fits' ? say('✓ Coherent for this brief', '✓ Selle ülesande jaoks kooskõlaline') : say('↻ Review this combination', '↻ Vaata see kombinatsioon üle')}</strong>
        <p>{(connection.status === 'fits' ? connection.fits : connection.reconsider)[language]}</p>
      </article>)}
    </section>}
    {checked && <QualityDecisions key={study.id} studyId={study.id} language={language} sessions={sessions} onStorageError={onStorageError} />}
    {checked && <section className="study-reflections" aria-labelledby="reflection-heading">
      <h2 id="reflection-heading">{say('Explain your choices', 'Põhjenda oma valikuid')}</h2>
      <p>{say('Move from recognising cards to explaining this study. Use details from the research brief in your own words, then compare with an example. These optional notes are saved with this scenario; they are not automatically graded and do not change your placement score or completion mark.', 'Liigu kaartide äratundmiselt uuringu selgitamiseni. Kasuta oma sõnadega ülesande üksikasju ja võrdle seejärel näitega. Need vabatahtlikud märkmed salvestatakse selle olukorra juurde; neid ei hinnata automaatselt ning need ei muuda paigutuste tulemust ega lõpetamise märki.')}</p>
      {editable.map(slot => <StudyReflection key={`${study.id}:${slot}:${answers[slot]}`} study={study} slot={slot} choiceId={answers[slot]!} term={card(answers[slot]!).term} language={language} sessions={sessions} onStorageError={onStorageError} />)}
    </section>}
    <p className="study-note">{say('Scenarios and feedback are teaching examples. References explain the underlying concepts; they do not prescribe a single correct design.', 'Olukorrad ja tagasiside on õppenäited. Viited selgitavad aluseks olevaid mõisteid ega määra ühtainsat õiget uuringukava.')}</p>
    <p className="study-note">{say('Switch scenarios to resume drafts. When browser storage is available, drafts and completion marks survive refresh. Restart scenario clears the current tree but keeps its completion mark.', 'Mustandi jätkamiseks vaheta olukorda. Kui brauseri salvestusruum on saadaval, säilivad mustandid ja lõpetamise märgid ka lehe värskendamisel. Uuesti alustamine tühjendab praeguse puu, kuid säilitab lõpetamise märgi.')}</p>
  </div>;
}
