import Placement from './Placement';
import { useEffect, useRef, useState } from 'react';
import { decks } from './content/decks';
import { loadLanguage, saveLanguage, translate, type Language } from './i18n';
import { createRound, missed, score, submit, type Round } from './game/round';
import { emptyProgress, loadProgress, saveProgress, type Progress, STORAGE_KEY } from './storage/progress';

type Screen = 'home' | 'learn' | 'practice' | 'summary' | 'placement';
export default function App() {
  const [language, setLanguage] = useState<Language>(loadLanguage);
  const t = (text: string) => translate(language, text);
  const [deckIndex, setDeckIndex] = useState(0);
  const deck = decks[deckIndex];
  const concepts = deck.cards[language];
  const storageKey = deckIndex === 0 ? STORAGE_KEY : `${STORAGE_KEY}-${deck.id}`;
  const conceptById = (id: string) => concepts.find(c => c.id === id)!;
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'et' ? 'Uurimiskaardid — Uurimistöö alused' : 'Research Cards — Foundations';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'et' ? 'Õpi uurimistöö põhimõisteid, üks kaart korraga. Ontoloogia, epistemoloogia, metodoloogia ja teised mõisted.' : 'Learn the foundations of research, one card at a time. Explore ontology, epistemology, methodology and more.');
  }, [language]);
  function changeLanguage(value: Language) { setLanguage(value); saveLanguage(value); }
  const [screen, setScreen] = useState<Screen>('home');
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [round, setRound] = useState<Round>(() => createRound());
  const [progress, setProgress] = useState(() => loadProgress());
  const [storageWorks, setStorageWorks] = useState(true);
  const [resetting, setResetting] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answerLock = useRef(false);
  useEffect(() => { heading.current?.focus(); }, [screen, cardIndex, round.index, revealed]);
  function persist(next: Progress) { setProgress(next); setStorageWorks(saveProgress(next, storageKey)); }
  function learn(index = 0) { setCardIndex(index); setRevealed(false); setScreen('learn'); }
  function start(ids?: string[], initialScore: number | null = null) { answerLock.current = false; setRound(createRound(ids ?? concepts.map(c => c.id), initialScore, concepts)); setScreen('practice'); }
  function chooseDeck(index: number) {
    const next = decks[index];
    setDeckIndex(index); setCardIndex(0); setRevealed(false);
    setRound(createRound(next.cards.en.map(c => c.id), null, next.cards.en));
    setProgress(loadProgress(next.cards.en, index === 0 ? STORAGE_KEY : `${STORAGE_KEY}-${next.id}`));
    setResetting(false); setStorageWorks(true);
  }
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
  const question = round.questions[round.index];
  const target = conceptById(question.id);
  const initialScore = round.initialScore ?? score(round);
  return <>
    <a className="skip" href="#main">{t("Skip to content")}</a>
    <header className="header"><button className="brand" onClick={() => { setScreen('home'); setResetting(false); }} aria-label={t("Research Cards home")}><span className="brand-icon" aria-hidden="true">▤</span> research<span className="brand-light">cards</span></button><span className="header-note">{t("A little curiosity goes a long way.")}</span><span className="edition">{deck[language]}</span><label className="language-switch"><span className="sr-only">{language === 'et' ? 'Keel' : 'Language'}</span><select value={language} onChange={event => changeLanguage(event.target.value as Language)}><option value="en" lang="en">English</option><option value="et" lang="et">Eesti</option></select></label></header>
    <main id="main">
      {screen === 'home' ? <>
        <section className="intro"><span className="eyebrow">{t("YOUR RESEARCH JOURNEY STARTS HERE")}</span><h1 ref={heading} tabIndex={-1}>{t("Big ideas.")}<br/><em>{t("One card at a time.")}</em></h1><p>{t("Make sense of the language of research.")}<br/>{t("Explore six essential concepts, then put your understanding into practice.")}</p></section>
        <nav className="deck-picker" aria-label={t('Choose a deck')}>
          {decks.map((item, index) => <button key={item.id} aria-pressed={index === deckIndex} onClick={() => chooseDeck(index)}><span>0{index + 1}</span>{item[language]}</button>)}
        </nav>
        <section className="deck-layout" aria-label={deck[language]}>
          <div className="deck-art" aria-hidden="true"><span className="art-note">{t("THE BUILDING BLOCKS OF RESEARCH")}</span><div className="paper paper-back"></div><div className="paper paper-middle"></div><div className="paper paper-front"><span className="paper-number">01 / 06 <span>✳</span></span><div className="orbit"><span></span></div><div><span className="eyebrow">{concepts[0].cue}</span><h2>{concepts[0].term}</h2><p>{concepts[0].question}</p></div><span className="paper-footer">{deck[language]} <span>↗</span></span></div><span className="art-bottom">{t("A small deck. A clearer perspective.")}</span></div>
          <div className="deck-details"><div className="deck-label"><span className="pill">{String(deckIndex + 1).padStart(2, '0')}</span><span>{t("6 concepts · At your own pace")}</span></div><h2>{deck[language]}</h2><p>{language === 'et' ? deck.descriptionEt : deck.description}</p><div className="concept-tags">{concepts.map(c => <span key={c.id}>{c.term}</span>)}</div><div className="actions"><button className="primary" onClick={() => learn()}>{t("Explore the cards")} <span>↗</span></button><button className="secondary" onClick={() => start()}>{t("Practise matching")} <span>→</span></button></div><button className="secondary placement-entry" onClick={() => setScreen('placement')}>{t("Place the cards")} <span>↗</span></button><p className="small-note">{t("Start with learning, or jump straight into practice.")}</p></div>
        </section>
        <section className="bottom-grid"><div className="how"><span className="eyebrow">{t("A SIMPLE WAY TO LEARN")}</span><div className="steps"><div><span>01</span><h3>{t("Explore")}</h3><p>{t("Reveal a definition and a real research example.")}</p></div><div><span>02</span><h3>{t("Connect")}</h3><p>{t("Match each concept to what it means.")}</p></div><div><span>03</span><h3>{t("Revisit")}</h3><p>{t("Give the tricky ones another go.")}</p></div></div></div><aside className="progress-box"><span className="eyebrow">{t("YOUR PROGRESS")}</span><strong>{viewed}<span>{t(" / 6 cards explored")}</span></strong><progress value={viewed} max={6} aria-label={t("Cards explored")}/><p>{attempted}{t(" of 6 concepts practised. No rush, no timer.")}</p></aside></section>
      </> : <section className={`play-area ${screen === 'placement' ? 'placement-area' : ''}`}>
        <button className="back" onClick={() => setScreen('home')}>{t("← Back to deck")}</button>
        {screen === 'placement' && <Placement deckTitle={deck[language]} concepts={concepts} language={language} onCheck={answers => {
          const cards = { ...progress.cards };
          for (const { id, correct } of answers) cards[id] = { ...cards[id], attempts: cards[id].attempts + 1, correct: cards[id].correct + Number(correct), latest: correct };
          persist({ ...progress, cards });
        }} />}
        {screen === 'learn' && <><div className="play-top"><span className="eyebrow">{deck[language]} · {t('LEARN')}</span><span>{language === 'et' ? `Kaart ${cardIndex + 1} / 6` : `Card ${cardIndex + 1} of 6`}</span></div><div className="learning-deck">{concepts.map((card, index) => <article className="learning-flip" key={card.id} aria-hidden={index !== cardIndex} inert={index !== cardIndex}>
          <div className={`learning-flip-inner ${revealed ? 'is-flipped' : ''}`}>
            <div className="learning-card learning-face learning-front" aria-hidden={revealed} inert={revealed}>
              <span className="pill">{card.cue}</span><h1 ref={index === cardIndex && !revealed ? heading : undefined} tabIndex={-1}>{card.term}</h1><p className="guiding">{card.question}</p>
              <div className="reveal-area"><span aria-hidden="true">✳</span><p>{t("Take a moment. What does this concept mean to you?")}</p><button className="primary" onClick={reveal}>{t("Show explanation ↓")}</button></div>
            </div>
            <div className="learning-card learning-face learning-back" aria-hidden={!revealed} inert={!revealed}>
              <span className="pill">{card.cue}</span><h1 ref={index === cardIndex && revealed ? heading : undefined} tabIndex={-1}>{card.term}</h1>
              <div className="explanation"><p className="definition">{card.definition}</p><div className="example"><span className="eyebrow">{t("IN A STUDY")}</span><p>{card.example}</p></div><div className="distinction"><span className="eyebrow">{t("MAKE THE DISTINCTION")}</span><p>{card.distinction}</p></div></div>
              <button className="secondary flip-back" onClick={() => setRevealed(false)}>{t("↶ Back to the term")}</button>
            </div>
          </div>
        </article>)}</div><div className="navigation"><button className="secondary" disabled={cardIndex === 0} onClick={() => learn(cardIndex - 1)}>{t("← Previous")}</button><span className="dots" aria-hidden="true">{concepts.map((c, i) => <i key={c.id} className={i === cardIndex ? 'active' : ''}/>)}</span>{cardIndex < 5 ? <button className="primary" onClick={() => learn(cardIndex + 1)}>{t("Next card →")}</button> : <button className="primary" onClick={() => start()}>{t("Practise this deck →")}</button>}</div></>}
        {screen === 'practice' && <><div className="play-top"><span className="eyebrow">{deck[language]} · {round.initialScore === null ? t("PRACTISE") : t("REVISIT")}</span><span>{language === 'et' ? `Küsimus ${round.index + 1} / ${round.questions.length}` : `Question ${round.index + 1} of ${round.questions.length}`}</span></div><progress className="round-progress" value={round.index} max={round.questions.length} aria-label={t("Questions completed")}/><div className="question-title"><p>{t("Which definition belongs to")}</p><h1 ref={heading} tabIndex={-1}>{target.term}?</h1><span>{t("Choose the meaning that fits best.")}</span></div><div className="answers">{question.options.map((id, i) => <button key={id} disabled={question.answer !== undefined} className={`answer ${question.answer !== undefined && id === question.id ? 'correct' : ''} ${question.answer === id && id !== question.id ? 'incorrect' : ''}`} onClick={() => answer(id)}><span className="answer-letter">{String.fromCharCode(65 + i)}</span><span>{conceptById(id).definition}</span>{question.answer !== undefined && id === question.id && <strong>{t("✓ Correct")}</strong>}{question.answer === id && id !== question.id && <strong>{t("× Your choice")}</strong>}</button>)}</div><div role="status" aria-live="polite">{question.answer !== undefined && <div className="feedback"><h2>{question.answer === question.id ? t("That’s right.") : t("A useful distinction.")}</h2>{question.answer !== question.id && <p>{t("Your choice describes ")}<strong>{conceptById(question.answer).term.toLowerCase()}</strong>. {target.term}: {target.definition}</p>}<p>{target.distinction}</p></div>}</div>{question.answer !== undefined && <div className="continue"><button className="primary" onClick={advance}>{round.index === round.questions.length - 1 ? t("See results") : t("Continue")} →</button></div>}</>}
        {screen === 'summary' && <div className="summary"><span className="eyebrow">{deck[language]} · {t('ROUND COMPLETE')}</span><h1 ref={heading} tabIndex={-1}>{missed(round).length ? t("Keep your curiosity.") : t("Connections made.")}</h1><div className="score">{initialScore}<span> / 6</span></div><p>{t("Correct on your first attempt")}</p>{round.initialScore !== null && <p className="retry-note">{language === 'et' ? `Sellel kordamisel: ${score(round)} õiget vastust ${round.questions.length}-st.` : `This revisit: ${score(round)} of ${round.questions.length} correct.`}</p>}<div className="results">{round.questions.map(q => <div key={q.id}><span>{conceptById(q.id).term}</span><span>{q.answer === q.id ? t("✓ Correct") : t("↻ Revisit")}</span></div>)}</div><p>{missed(round).length ? t("Some ideas take another look. Revisit the cards you missed, whenever you’re ready.") : t("Try explaining these ideas in your own words, then return for another round.")}</p><div className="actions">{missed(round).length > 0 && <button className="primary" onClick={() => start(missed(round), initialScore)}>{t("Practise missed cards →")}</button>}<button className={missed(round).length ? 'secondary' : 'primary'} onClick={() => start()}>{t("New round ↗")}</button><button className="text-button" onClick={() => learn()}>{t("Back to learning")}</button></div></div>}
      </section>}
    </main>
    <footer><div><strong>{t("Understanding starts with a question.")}</strong><p>{t("Introductory definitions; terminology can vary across disciplines.")}</p><p>{storageWorks ? t("Progress stays in this browser. Clearing browser data removes it.") : t("Browser storage is unavailable. Progress lasts for this session only.")}</p></div><div className="reset">{resetting ? <><span>{t("Delete your saved progress?")}</span><button className="text-button" onClick={() => { persist(emptyProgress(concepts)); setResetting(false); }}>{t("Yes, reset")}</button><button className="text-button" onClick={() => setResetting(false)}>{t("Cancel")}</button></> : <button className="text-button" onClick={() => setResetting(true)}>{t("Reset progress")}</button>}</div></footer>
  </>;
}
