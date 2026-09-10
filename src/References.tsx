import { useEffect, useRef } from 'react';
import { conceptReferences, references, type Reference, type ReferenceId } from './content/references';
import { decks } from './content/decks';
import { paradigms } from './content/studies';
import { evaluationCards } from './content/computing-studies';
import type { Language } from './i18n';

export function ReferenceList({ ids, language }: { ids: readonly ReferenceId[]; language: Language }) {
  return <ul className="reference-list">{ids.map(id => {
    const ref: Reference = references[id];
    return <li key={id}><span>{ref.authors} ({ref.year}). </span><a href={ref.url} target="_blank" rel="noopener noreferrer" lang="en">{ref.title}<span className="sr-only"> {language === 'et' ? '(avaneb uuel vahelehel)' : '(opens in a new tab)'}</span></a><span> {ref.publication}</span>{ref.doi && <span className="reference-doi"> DOI: {ref.doi}</span>}</li>;
  })}</ul>;
}
export function ConceptReferences({ conceptId, language }: { conceptId: string; language: Language }) {
  const ids = conceptReferences[conceptId];
  if (!ids?.length) return null;
  return <div className="concept-references"><span className="eyebrow">{language === 'et' ? 'ALLIKAD JA LISALUGEMINE' : 'REFERENCES & FURTHER READING'}</span><ReferenceList ids={ids} language={language} /></div>;
}
export default function References({ language }: { language: Language }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const say = (en: string, et: string) => language === 'et' ? et : en;
  const groups = [
    ...decks.map(deck => ({ title: deck[language], cards: deck.cards[language] })),
    { title: say('Paradigms', 'Paradigmad'), cards: paradigms.map(p => ({ id: p.id, term: p.term[language] })) },
    { title: say('Application evaluation', 'Rakenduse hindamine'), cards: evaluationCards.map(p => ({ id: p.id, term: p.term[language] })) },
  ];
  return <div className="references-page">
    <h1 ref={heading} tabIndex={-1}>{say('References & further reading', 'Allikad ja lisalugemine')}</h1>
    <p>{say('The cards provide introductory paraphrases, not quotations. Follow the linked chapters, articles, and professional guidance to examine the underlying ideas. Source titles are kept in their original language; English and Estonian cards share the same references.', 'Kaardid esitavad sissejuhatavaid ümbersõnastusi, mitte tsitaate. Aluseks olevate ideede uurimiseks ava viidatud peatükid, artiklid ja erialased juhised. Allikate pealkirjad on algkeeles; inglise- ja eestikeelsetel kaartidel on samad viited.')}</p>
    <p>{say('Examples, scenarios, and scoring rules were written for this game. References support the concepts, not the claim that a particular scenario has only one valid research design. The game has not been independently validated as a teaching instrument.', 'Näited, olukorrad ja hindamisreeglid on loodud selle mängu jaoks. Viited toetavad mõisteid, mitte väidet, et olukorral on ainult üks õige uuringukava. Mängu ei ole õppimisvahendina sõltumatult valideeritud.')}</p>
    <p>{say('Some publishers may restrict full-text access. “n.d.” means no publication date is specified here. The Open University handbook is licensed CC BY 4.0; its chapters are cited individually.', 'Mõni kirjastaja võib piirata täisteksti ligipääsu. „n.d.“ tähendab, et ilmumisaastat ei ole siin märgitud. Open University käsiraamat on litsentsiga CC BY 4.0; selle peatükkidele viidatakse eraldi.')}</p>
    <div className="reference-principle"><h2>{say('Connecting research choices', 'Uurimisvalikute seostamine')}</h2><ReferenceList ids={['pluralism']} language={language} /></div>
    {groups.map(group => <section key={group.title}><h2>{group.title}</h2>{group.cards.map(card => <article key={card.id}><h3>{card.term}</h3>{card.id === 'count-features' && <p>{say('This is an intentionally insufficient evaluation choice. The source explains user-focused evaluation rather than endorsing feature counts.', 'See on tahtlikult ebapiisav hindamisvalik. Allikas selgitab kasutajakeskset hindamist ega toeta funktsioonide loendamist.')}</p>}<ReferenceList ids={conceptReferences[card.id]} language={language} /></article>)}</section>)}
  </div>;
}
