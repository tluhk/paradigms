import { useRef, useState } from 'react';
import type { Concept } from './content/foundations';
import { translate, type Language } from './i18n';

function shuffle(ids: string[]) {
  const result = [...ids];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function Placement({ concepts, language, onCheck }: {
  concepts: Concept[];
  language: Language;
  onCheck: (answers: { id: string; correct: boolean }[]) => void;
}) {
  const t = (text: string) => translate(language, text);
  const [slots, setSlots] = useState(() => shuffle(concepts.map(c => c.id)));
  const [cards, setCards] = useState(() => shuffle(concepts.map(c => c.id)));
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [locked, setLocked] = useState<string[]>([]);
  const [firstScore, setFirstScore] = useState<number | null>(null);
  const checkLock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const concept = (id: string) => concepts.find(c => c.id === id)!;
  const correct = slots.filter(id => placements[id] === id);
  const complete = checked && correct.length === slots.length;

  function place(card: string, slot: string) {
    if (checked || locked.includes(slot) || locked.includes(card) || !cards.includes(card)) return;
    setPlacements(previous => {
      const next = { ...previous };
      for (const id of slots) if (next[id] === card) delete next[id];
      next[slot] = card;
      return next;
    });
    setSelected(null);
  }
  function check() {
    if (checkLock.current || slots.some(id => !placements[id])) return;
    checkLock.current = true;
    setChecked(true);
    setSelected(null);
    if (firstScore === null) setFirstScore(correct.length);
    onCheck(slots.filter(id => !locked.includes(id)).map(id => ({ id, correct: placements[id] === id })));
  }
  function retry() {
    setLocked(correct);
    setPlacements(Object.fromEntries(correct.map(id => [id, id])));
    setChecked(false);
    checkLock.current = false;
    heading.current?.focus();
  }
  function restart() {
    setSlots(shuffle(slots)); setCards(shuffle(cards)); setPlacements({});
    setSelected(null); setChecked(false); setLocked([]); setFirstScore(null);
    checkLock.current = false;
    heading.current?.focus();
  }

  return <div className="placement">
    <span className="eyebrow">{t('FOUNDATIONS')} · {t('PLACE')}</span>
    <h1 ref={heading} tabIndex={-1}>{t('Find a home for each concept.')}</h1>
    <p id="placement-help">{t('Drag each card to its definition, or select a card and then a slot. Select a filled slot to return its card. Replacing a card returns it to the tray.')}</p>
    <section className="card-tray" aria-label={t('Concept cards')} aria-describedby="placement-help">
      {cards.filter(id => !Object.values(placements).includes(id)).map(id => <button key={id} className="concept-card" draggable={!checked} disabled={checked} aria-pressed={selected === id}
        onClick={() => setSelected(selected === id ? null : id)}
        onDragStart={event => { event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move'; setSelected(id); }}
        onDragEnd={() => setSelected(null)}>{concept(id).term}</button>)}
      {Object.keys(placements).length === slots.length && <p>{t('All cards placed. Ready to check?')}</p>}
    </section>
    <p role="status" className="placement-status">{selected ? `${t('Selected card')}: ${concept(selected).term}` : `${Object.keys(placements).length} / 6 ${t('cards placed')}`}</p>
    <div className="placement-grid">
      {slots.map((id, index) => <article key={id} className={`placement-slot ${checked ? placements[id] === id ? 'is-correct' : 'is-incorrect' : locked.includes(id) ? 'is-correct' : ''}`}>
        <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
        <p id={`definition-${id}`}>{concept(id).definition}</p>
        <button className="slot-target" aria-label={`${t('Place card')}: ${concept(id).definition}`} aria-describedby={`definition-${id}`} disabled={checked || locked.includes(id)}
          onDragOver={event => { if (!checked && !locked.includes(id)) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; } }}
          onDrop={event => { event.preventDefault(); place(event.dataTransfer.getData('text/plain'), id); }}
          onClick={() => {
            if (selected) place(selected, id);
            else if (placements[id]) setPlacements(previous => { const next = { ...previous }; delete next[id]; return next; });
          }}>
          {placements[id] ? concept(placements[id]).term : t('Place a card here')}
        </button>
        {(checked || locked.includes(id)) && <p className="placement-feedback">{placements[id] === id ? t('✓ Correct') : t('↻ Try another card')}</p>}
      </article>)}
    </div>
    <div className="placement-results" role="status">
      {checked && <><h2>{complete ? t('Connections made.') : t('Some cards need another home.')}</h2><p>{correct.length} / 6 {t('correct placements')}</p></>}
      {firstScore !== null && <p>{t('Correct on your first attempt')}: {firstScore} / 6</p>}
    </div>
    <div className="actions">
      {!checked && <button className="primary" disabled={Object.keys(placements).length !== slots.length} onClick={check}>{t('Check placements')}</button>}
      {checked && !complete && <button className="primary" onClick={retry}>{t('Retry incorrect cards')}</button>}
      <button className="secondary" onClick={restart}>{t('New placement round')}</button>
    </div>
  </div>;
}
