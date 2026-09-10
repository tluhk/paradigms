import { ConceptReferences } from './References';
import { useEffect, useRef, useState } from 'react';
import { evaluationCards } from './content/computing-studies';
import { decks } from './content/decks';
import { evaluateStudy, paradigms, slotLabels, studies, type StudySlot } from './content/studies';
import type { Language } from './i18n';

export default function StudyBuilder({ language }: { language: Language }) {
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const [index, setIndex] = useState(0);
  const study = studies[index];
  const [answers, setAnswers] = useState<Partial<Record<StudySlot, string>>>(study.fixed);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState<StudySlot[]>([]);
  const [firstScore, setFirstScore] = useState<number | null>(null);
  const [invalid, setInvalid] = useState(false);
  const dragged = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<StudySlot | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [index]);
  const slots = Object.keys(study.slots) as StudySlot[];
  const results = evaluateStudy(study, answers);
  const editable = slots.filter(slot => !study.fixed[slot]);
  const score = results.filter(r => !study.fixed[r.slot] && r.choice?.fits).length;
  const complete = checked && results.every(r => r.choice?.fits);
  const allCards = [...decks.slice(1).flatMap(deck => deck.cards[language]), ...[...paradigms, ...evaluationCards].map(p => ({ id: p.id, term: p.term[language], definition: p.definition[language] }))];
  const card = (id: string) => allCards.find(c => c.id === id)!;
  const available = [...new Set(editable.flatMap(slot => study.slots[slot]!.map(c => c.id)))].filter(id => !Object.values(answers).includes(id));
  function reset(next = index) {
    dragged.current = null; setDropTarget(null);
    setIndex(next); setAnswers(studies[next].fixed); setSelected(null); setChecked(false); setLocked([]); setFirstScore(null); setInvalid(false);
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
    setChecked(true); setSelected(null); setInvalid(false);
    if (firstScore === null) setFirstScore(score);
  }
  function retry() {
    const fits = results.filter(r => r.choice?.fits).map(r => r.slot);
    setAnswers(Object.fromEntries(fits.map(slot => [slot, answers[slot]])));
    setLocked(fits); setChecked(false); setInvalid(false);
  }
  return <div className="study-builder">
    <span className="eyebrow">{say('CONNECT THE DECKS', 'SEO KAARDIPAKID')}</span>
    <h1 ref={heading} tabIndex={-1}>{say('Build a research study', 'Koosta uuring')}</h1>
    <p>{say('Complete a guided tree. These are plausible designs for specific briefs, not universal rules about which methods belong to a paradigm.', 'Täienda juhendatud puud. Need on konkreetsete ülesannete jaoks sobivad uuringud, mitte üldreeglid selle kohta, millised meetodid kuuluvad paradigma juurde.')}</p>
    <nav className="deck-picker" aria-label={say('Research scenarios', 'Uurimisolukorrad')}>
      {studies.map((item, i) => <button key={item.id} aria-pressed={index === i} onClick={() => reset(i)}><span>0{i + 1}</span>{item.title[language]}</button>)}
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
      {complete && index < studies.length - 1 && <button className="primary" onClick={() => reset(index + 1)}>{say('Next scenario →', 'Järgmine olukord →')}</button>}
      <button className="secondary" onClick={() => reset()}>{say('Restart scenario', 'Alusta olukorda uuesti')}</button>
    </div>
    <p className="study-note">{say('Scenarios and feedback are teaching examples. References explain the underlying concepts; they do not prescribe a single correct design.', 'Olukorrad ja tagasiside on õppenäited. Viited selgitavad aluseks olevaid mõisteid ega määra ühtainsat õiget uuringukava.')}</p>
    <p className="study-note">{say('Scenario progress lasts while this activity is open. Switching scenarios starts a fresh tree.', 'Olukorra edusammud säilivad tegevuse avatuna hoidmise ajal. Olukorra vahetamine alustab uut puud.')}</p>
  </div>;
}
