import { createSessionStore, validPlacement, type SessionStore } from './storage/sessions';
import { useEffect, useRef, useState } from 'react';
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

export default function Placement({ concepts, language, deckTitle, onCheck, sessions: suppliedSessions, sessionKey = 'placement', onStorageError }: {
  sessions?: SessionStore;
  sessionKey?: string;
  onStorageError?: () => void;
  concepts: Concept[];
  deckTitle: string;
  language: Language;
  onCheck: (answers: { id: string; correct: boolean }[]) => void;
}) {
  const [sessions] = useState(() => suppliedSessions ?? createSessionStore());
  const [draft] = useState(() => sessions.read(sessionKey, validPlacement(concepts.map(c => c.id))));
  const t = (text: string) => translate(language, text);
  const [slots, setSlots] = useState(() => draft?.slots ?? shuffle(concepts.map(c => c.id)));
  const [cards, setCards] = useState(() => draft?.cards ?? shuffle(concepts.map(c => c.id)));
  const [placements, setPlacements] = useState<Record<string, string>>(draft?.placements ?? {});
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(draft?.checked ?? false);
  const [locked, setLocked] = useState<string[]>(draft?.locked ?? []);
  const [firstScore, setFirstScore] = useState<number | null>(draft?.firstScore ?? null);
  const checkLock = useRef(draft?.checked ?? false);
  const heading = useRef<HTMLHeadingElement>(null);
  const concept = (id: string) => concepts.find(c => c.id === id)!;
  const correct = slots.filter(id => placements[id] === id);
  const complete = checked && correct.length === slots.length;

  useEffect(() => {
    if (!sessions.write(sessionKey, { slots, cards, placements, checked, locked, firstScore })) onStorageError?.();
  }, [sessions, sessionKey, slots, cards, placements, checked, locked, firstScore, onStorageError]);

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
    <span className="eyebrow">{deckTitle} · {t('PLACE')}</span>
    <h1 ref={heading} tabIndex={-1}>{t('Find a home for each concept.')}</h1>
    <p id="placement-help">{t('Click a card, then click its definition. You can scroll between clicks — no need to hold or drag. You can also drag cards. Click a filled slot to return its card.')}</p>
    <div className={`placement-board ${selected ? 'has-selection' : ''}`}>
    <aside className="placement-dock">
    <section className="card-tray" aria-label={t('Concept cards')} aria-describedby="placement-help">
      {cards.filter(id => !Object.values(placements).includes(id)).map(id => <button key={id} className="concept-card" draggable={!checked} disabled={checked} aria-pressed={selected === id}
        onClick={() => setSelected(selected === id ? null : id)}
        onDragStart={event => { event.dataTransfer.setData('text/plain', id); event.dataTransfer.effectAllowed = 'move'; setSelected(id); }}
        onDragEnd={() => setSelected(null)}>{concept(id).term}</button>)}
      {Object.keys(placements).length === slots.length && <p>{t('All cards placed. Ready to check?')}</p>}
    </section>
    <p role="status" className="placement-status">{selected ? `${t('Selected card')}: ${concept(selected).term}` : `${Object.keys(placements).length} / ${slots.length} ${t('cards placed')}`}</p>
    </aside>
    <div className="placement-grid">
      {slots.map((id, index) => <article key={id} className={`placement-slot ${checked ? placements[id] === id ? 'is-correct' : 'is-incorrect' : locked.includes(id) ? 'is-correct' : ''}`}>
        <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
        <p id={`definition-${id}`}>{concept(id).definition}</p>
        <button className={`slot-target ${placements[id] ? 'has-card' : 'is-empty'}`} aria-label={`${t('Place card')}: ${concept(id).definition}`} aria-describedby={`definition-${id}`} disabled={checked || locked.includes(id)}
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
    </div>
    <div className="placement-results" role="status">
      {checked && <><h2>{complete ? t('Connections made.') : t('Some cards need another home.')}</h2><p>{correct.length} / {slots.length} {t('correct placements')}</p></>}
      {firstScore !== null && <p>{t('Correct on your first attempt')}: {firstScore} / {slots.length}</p>}
    </div>
    <div className="actions">
      {!checked && <button className="primary" disabled={Object.keys(placements).length !== slots.length} onClick={check}>{t('Check placements')}</button>}
      {checked && !complete && <button className="primary" onClick={retry}>{t('Retry incorrect cards')}</button>}
      <button className="secondary" onClick={restart}>{t('New placement round')}</button>
    </div>
  </div>;
}
