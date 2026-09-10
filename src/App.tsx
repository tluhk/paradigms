import { useEffect, useRef, useState } from 'react';
import { concepts, conceptById } from './content/foundations';
import { createRound, missed, score, submit, type Round } from './game/round';
import { emptyProgress, loadProgress, saveProgress, type Progress } from './storage/progress';

type Screen = 'home' | 'learn' | 'practice' | 'summary';
export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState<Round>(() => createRound());
  const [progress, setProgress] = useState(loadProgress);
  const [storageWorks, setStorageWorks] = useState(true);
  const [resetting, setResetting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answerLock = useRef(false);
  useEffect(() => { heading.current?.focus(); }, [screen, cardIndex, round.index]);
  function persist(next: Progress) { setProgress(next); setStorageWorks(saveProgress(next)); }
  function learn(index = 0) { setCardIndex(index); setRevealed(false); setScreen('learn'); }
  function start(ids?: string[], initialScore: number | null = null) { answerLock.current = false; setRound(createRound(ids, initialScore)); setScreen('practice'); }
  function reveal() { setRevealed(true); const id = concepts[cardIndex].id; persist({ ...progress, cards: { ...progress.cards, [id]: { ...progress.cards[id], viewed: true } } }); }
  function answer(id: string) {
    if (answerLock.current) return;
    const next = submit(round, id);
    if (next === round) return;
    answerLock.current = true;
    setRound(next);
    const target = round.questions[round.index].id;
    const previous = progress.cards[target];
    persist({ ...progress, cards: { ...progress.cards, [target]: { ...previous, attempts: previous.attempts + 1, correct: previous.correct + Number(id === target), latest: id === target } } });
  }
  function advance() { if (round.index === round.questions.length - 1) setScreen('summary'); else { answerLock.current = false; setRound({ ...round, index: round.index + 1 }); } }
  const viewed = Object.values(progress.cards).filter(c => c.viewed).length;
  const attempted = Object.values(progress.cards).filter(c => c.attempts > 0).length;
  const card = concepts[cardIndex];
  const question = round.questions[round.index];
  const target = conceptById(question.id);
  const initialScore = round.initialScore ?? score(round);
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="header"><button className="brand" onClick={() => { setScreen('home'); setResetting(false); }} aria-label="Research Cards home"><span className="brand-icon" aria-hidden="true">▤</span> research<span className="brand-light">cards</span></button><span className="header-note">A little curiosity goes a long way.</span><span className="edition">FOUNDATIONS / 01</span></header>
    <main id="main">
      {screen === 'home' ? <>
        <section className="intro"><span className="eyebrow">YOUR RESEARCH JOURNEY STARTS HERE</span><h1 ref={heading} tabIndex={-1}>Big ideas.<br/><em>One card at a time.</em></h1><p>Make sense of the language of research.<br/>Explore six essential concepts, then put your understanding into practice.</p></section>
        <section className="deck-layout" aria-label="Foundations deck">
          <div className="deck-art" aria-hidden="true"><span className="art-note">THE BUILDING BLOCKS OF RESEARCH</span><div className="paper paper-back"></div><div className="paper paper-middle"></div><div className="paper paper-front"><span className="paper-number">01 / 06 <span>✳</span></span><div className="orbit"><span></span></div><div><span className="eyebrow">THE NATURE OF REALITY</span><h2>Ontology</h2><p>What is reality like?</p></div><span className="paper-footer">FOUNDATIONS <span>↗</span></span></div><span className="art-bottom">A small deck. A clearer perspective.</span></div>
          <div className="deck-details"><div className="deck-label"><span className="pill">STARTER DECK</span><span>6 concepts · At your own pace</span></div><h2>Foundations of research</h2><p>Reality, knowledge, values, and the choices behind a study. Get to know the ideas that connect them.</p><div className="concept-tags">{concepts.map(c => <span key={c.id}>{c.term}</span>)}</div><div className="actions"><button className="primary" onClick={() => learn()}>Explore the cards <span>↗</span></button><button className="secondary" onClick={() => start()}>Practise matching <span>→</span></button></div><p className="small-note">Start with learning, or jump straight into practice.</p></div>
        </section>
        <section className="bottom-grid"><div className="how"><span className="eyebrow">A SIMPLE WAY TO LEARN</span><div className="steps"><div><span>01</span><h3>Explore</h3><p>Reveal a definition and a real research example.</p></div><div><span>02</span><h3>Connect</h3><p>Match each concept to what it means.</p></div><div><span>03</span><h3>Revisit</h3><p>Give the tricky ones another go.</p></div></div></div><aside className="progress-box"><span className="eyebrow">YOUR PROGRESS</span><strong>{viewed}<span> / 6 cards explored</span></strong><progress value={viewed} max={6} aria-label="Cards explored"/><p>{attempted} of 6 concepts practised. No rush, no timer.</p></aside></section>
      </> : <section className="play-area">
        <button className="back" onClick={() => setScreen('home')}>← Back to deck</button>
        {screen === 'learn' && <><div className="play-top"><span className="eyebrow">FOUNDATIONS · LEARN</span><span>Card {cardIndex + 1} of 6</span></div><article className="learning-card"><span className="pill">{card.cue}</span><h1 ref={heading} tabIndex={-1}>{card.term}</h1><p className="guiding">{card.question}</p>{!revealed ? <div className="reveal-area"><span aria-hidden="true">✳</span><p>Take a moment. What does this concept mean to you?</p><button className="primary" onClick={reveal}>Show explanation ↓</button></div> : <div className="explanation"><p className="definition">{card.definition}</p><div className="example"><span className="eyebrow">IN A STUDY</span><p>{card.example}</p></div><div className="distinction"><span className="eyebrow">MAKE THE DISTINCTION</span><p>{card.distinction}</p></div></div>}</article><div className="navigation"><button className="secondary" disabled={cardIndex === 0} onClick={() => learn(cardIndex - 1)}>← Previous</button><span className="dots" aria-hidden="true">{concepts.map((c, i) => <i key={c.id} className={i === cardIndex ? 'active' : ''}/>)}</span>{cardIndex < 5 ? <button className="primary" onClick={() => learn(cardIndex + 1)}>Next card →</button> : <button className="primary" onClick={() => start()}>Practise this deck →</button>}</div></>}
        {screen === 'practice' && <><div className="play-top"><span className="eyebrow">FOUNDATIONS · {round.initialScore === null ? 'PRACTISE' : 'REVISIT'}</span><span>Question {round.index + 1} of {round.questions.length}</span></div><progress className="round-progress" value={round.index} max={round.questions.length} aria-label="Questions completed"/><div className="question-title"><p>Which definition belongs to</p><h1 ref={heading} tabIndex={-1}>{target.term}?</h1><span>Choose the meaning that fits best.</span></div><div className="answers">{question.options.map((id, i) => <button key={id} disabled={question.answer !== undefined} className={`answer ${question.answer !== undefined && id === question.id ? 'correct' : ''} ${question.answer === id && id !== question.id ? 'incorrect' : ''}`} onClick={() => answer(id)}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{conceptById(id).definition}</span>{question.answer !== undefined && id === question.id && <strong>✓ Correct</strong>}{question.answer === id && id !== question.id && <strong>× Your choice</strong>}</button>)}</div><div role="status" aria-live="polite">{question.answer !== undefined && <div className="feedback"><h2>{question.answer === question.id ? 'That’s right.' : 'A useful distinction.'}</h2>{question.answer !== question.id && <p>Your choice describes <strong>{conceptById(question.answer).term.toLowerCase()}</strong>. {target.term}: {target.definition}</p>}<p>{target.distinction}</p></div>}</div>{question.answer !== undefined && <div className="continue"><button className="primary" onClick={advance}>{round.index === round.questions.length - 1 ? 'See results' : 'Continue'} →</button></div>}</>}
        {screen === 'summary' && <div className="summary"><span className="eyebrow">FOUNDATIONS · ROUND COMPLETE</span><h1 ref={heading} tabIndex={-1}>{missed(round).length ? 'Keep your curiosity.' : 'Connections made.'}</h1><div className="score">{initialScore}<span> / 6</span></div><p>Correct on your first attempt</p>{round.initialScore !== null && <p className="retry-note">This revisit: {score(round)} of {round.questions.length} correct.</p>}<div className="results">{round.questions.map(q => <div key={q.id}><span>{conceptById(q.id).term}</span><span>{q.answer === q.id ? '✓ Correct' : '↻ Revisit'}</span></div>)}</div><p>{missed(round).length ? 'Some ideas take another look. Revisit the cards you missed, whenever you’re ready.' : 'Try explaining these ideas in your own words, then return for another round.'}</p><div className="actions">{missed(round).length > 0 && <button className="primary" onClick={() => start(missed(round), initialScore)}>Practise missed cards →</button>}<button className={missed(round).length ? 'secondary' : 'primary'} onClick={() => start()}>New round ↗</button><button className="text-button" onClick={() => learn()}>Back to learning</button></div></div>}
      </section>}
    </main>
    <footer><div><strong>Understanding starts with a question.</strong><p>Introductory definitions; terminology can vary across disciplines.</p><p>{storageWorks ? 'Progress stays in this browser. Clearing browser data removes it.' : 'Browser storage is unavailable. Progress lasts for this session only.'}</p></div><div className="reset">{resetting ? <><span>Delete your saved progress?</span><button className="text-button" onClick={() => { persist(emptyProgress()); setResetting(false); }}>Yes, reset</button><button className="text-button" onClick={() => setResetting(false)}>Cancel</button></> : <button className="text-button" onClick={() => setResetting(true)}>Reset progress</button>}</div></footer>
  </>;
}
