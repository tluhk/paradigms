export type Bilingual = { en: string; et: string };
const text = (en: string, et: string): Bilingual => ({ en, et });
export type StudySlot = 'paradigm' | 'methodology' | 'collection' | 'collection2' | 'analysis';
export const slotLabels: Record<StudySlot, Bilingual> = {
  paradigm: text('Paradigm', 'Paradigma'), methodology: text('Methodology', 'Metodoloogia'),
  collection: text('Data collection', 'Andmete kogumine'), collection2: text('Additional data collection', 'Täiendav andmete kogumine'),
  analysis: text('Data analysis', 'Andmeanalüüs'),
};
export const paradigms = [
  { id: 'interpretivism', term: text('Interpretivism', 'Interpretivism'), definition: text('Understand how people interpret their experiences in context.', 'Mõista, kuidas inimesed oma kogemusi kontekstis tõlgendavad.') },
  { id: 'pragmatism', term: text('Pragmatism', 'Pragmatism'), definition: text('Choose and connect approaches around the research problem and practical consequences.', 'Valida ja ühendada lähenemisi uurimisprobleemi ning praktiliste tagajärgede põhjal.') },
  { id: 'critical', term: text('Critical / transformative', 'Kriitiline / transformatiivne'), definition: text('Examine power and inequality and work towards change with participants.', 'Uurida võimu ja ebavõrdsust ning töötada koos osalejatega muutuse nimel.') },
];
interface Choice { id: string; fits: boolean; reason: Bilingual }
const choice = (id: string, fits: boolean, en: string, et: string): Choice => ({ id, fits, reason: text(en, et) });
export interface Study {
  id: string; title: Bilingual; question: Bilingual; brief: Bilingual;
  fixed: Partial<Record<StudySlot, string>>;
  slots: Partial<Record<StudySlot, Choice[]>>;
}
export const studies: Study[] = [
  {
    id: 'belonging', title: text('Belonging at school', 'Kuuluvustunne koolis'),
    question: text('How do students experience belonging in one school?', 'Kuidas kogevad õpilased ühes koolis kuuluvustunnet?'),
    brief: text('Investigate one school in depth. Prioritise students’ meanings, collect detailed accounts, and analyse shared patterns. The methodology is already placed.', 'Uuri üht kooli süvitsi. Keskendu õpilaste tähendustele, kogu põhjalikke kirjeldusi ja analüüsi ühiseid mustreid. Metodoloogia on juba paigas.'),
    fixed: { methodology: 'case-study' },
    slots: {
      paradigm: [choice('interpretivism', true, 'Understanding students’ meanings in context supports this interpretivist case study.', 'Õpilaste tähenduste mõistmine kontekstis toetab interpretivistlikku juhtumiuuringut.'), choice('critical', false, 'A critical study could investigate belonging, but this brief does not centre power or collective change. Look for a focus on participants’ meanings.', 'Kriitiline uuring võib käsitleda kuuluvust, kuid siinne ülesanne ei keskendu võimule ega ühisele muutusele. Otsi osalejate tähendustele keskenduvat lähenemist.')],
      methodology: [choice('case-study', true, 'One school provides a bounded case that can be studied in context.', 'Üks kool on piiritletud juhtum, mida saab uurida kontekstis.')],
      collection: [choice('interview', true, 'Interviews provide detailed individual accounts of belonging.', 'Intervjuud annavad põhjalikke isiklikke kuuluvuskogemuse kirjeldusi.'), choice('focus-group', true, 'A focus group can explore shared and contrasting meanings through discussion, while attending to group pressure.', 'Fookusrühm võimaldab arutelus uurida ühiseid ja erinevaid tähendusi, arvestades rühmasurvega.'), choice('questionnaire', false, 'Questionnaires can contribute to case studies, but a conversational method better matches this brief’s request for detailed accounts.', 'Küsimustikud võivad juhtumiuuringut täiendada, kuid põhjalike kirjelduste saamiseks sobib siin paremini vestluslik meetod.')],
      analysis: [choice('thematic-analysis', true, 'Thematic analysis develops patterns of meaning across the accounts.', 'Temaatiline analüüs arendab kirjeldusi läbivaid tähendusmustreid.'), choice('descriptive-statistics', false, 'Numerical summaries alone do not interpret the detailed accounts requested here.', 'Arvulised kokkuvõtted üksi ei tõlgenda siin soovitud põhjalikke kirjeldusi.')],
    },
  },
  {
    id: 'feedback', title: text('Understanding feedback', 'Tagasiside mõistmine'),
    question: text('What feedback patterns appear across a school, and how do students explain them?', 'Millised tagasisidemustrid ilmnevad koolis ja kuidas õpilased neid selgitavad?'),
    brief: text('Combine numerical questionnaire responses with follow-up conversations. Connect the numerical findings with students’ explanations. Place a method for analysing the conversation transcripts; the numerical summaries are supplied.', 'Ühenda küsimustiku arvulised vastused järelvestlustega. Seosta arvulised tulemused õpilaste selgitustega. Vali vestluste transkriptsioonide analüüsimeetod; arvulised kokkuvõtted on ette antud.'),
    fixed: { paradigm: 'pragmatism', collection: 'questionnaire' },
    slots: {
      paradigm: [choice('pragmatism', true, 'A problem-focused pragmatic stance supports connecting different forms of evidence here; mixed methods is not exclusive to pragmatism.', 'Probleemikeskne pragmaatiline hoiak toetab siin eri tõendite ühendamist; segameetodid ei kuulu ainult pragmatismi juurde.')],
      methodology: [choice('mixed-methods', true, 'Integrating numerical findings and conversational explanations makes this a mixed methods design.', 'Arvuliste tulemuste ja vestluslike selgituste lõimimine teeb sellest segameetoditega uuringu.'), choice('phenomenology', false, 'Phenomenology would foreground lived experience; this brief explicitly asks you to integrate numerical patterns and explanations.', 'Fenomenoloogia seaks esikohale läbielatud kogemuse; siin tuleb lõimida arvulisi mustreid ja selgitusi.')],
      collection: [choice('questionnaire', true, 'The supplied questionnaire uses rating scales to identify numerical patterns.', 'Etteantud küsimustiku hindamisskaalad võimaldavad leida arvulisi mustreid.')],
      collection2: [choice('interview', true, 'Follow-up interviews let students explain the questionnaire findings in their own words.', 'Järelintervjuud võimaldavad õpilastel küsimustiku tulemusi oma sõnadega selgitada.'), choice('observation', false, 'Observation could add useful evidence, but it does not supply the follow-up conversations required by this brief.', 'Vaatlus võiks lisada kasulikke tõendeid, kuid ei asenda siin nõutud järelvestlusi.')],
      analysis: [choice('thematic-analysis', true, 'Develop themes from the transcripts, then relate them to the supplied numerical summaries. That integration is essential.', 'Arenda transkriptsioonidest teemad ja seosta need etteantud arvuliste kokkuvõtetega. See lõimimine on oluline.'), choice('descriptive-statistics', false, 'The numerical summaries are already supplied. This slot asks how to interpret the conversation transcripts.', 'Arvulised kokkuvõtted on juba olemas. See koht küsib, kuidas tõlgendada vestluste transkriptsioone.')],
    },
  },
  {
    id: 'participation', title: text('A voice in the classroom', 'Õpilaste hääl klassiruumis'),
    question: text('How can students and teachers make classroom participation more equitable?', 'Kuidas saavad õpilased ja õpetajad muuta klassis osalemist võrdsemaks?'),
    brief: text('Students and teachers jointly plan a change, try it, observe participation, and reflect before the next cycle. Examine whose voices are heard. Summarise participation counts to inform reflection alongside participants’ perspectives.', 'Õpilased ja õpetajad kavandavad koos muutuse, katsetavad seda, vaatlevad osalemist ja reflekteerivad enne järgmist tsüklit. Uuri, kelle hääl kõlab. Võta osalemiskordade arvud kokku, et toetada refleksiooni koos osalejate vaatenurkadega.'),
    fixed: { paradigm: 'critical' },
    slots: {
      paradigm: [choice('critical', true, 'Shared decision-making and attention to unequal participation support a transformative orientation.', 'Ühine otsustamine ja tähelepanu ebavõrdsele osalemisele toetavad transformatiivset suunitlust.')],
      methodology: [choice('action-research', true, 'Collaborative cycles of change and reflection fit action research. Action research can also use other paradigms.', 'Ühised muutuse ja refleksiooni tsüklid sobivad tegevusuuringuga. Tegevusuuring võib lähtuda ka muudest paradigmadest.'), choice('ethnography', false, 'Ethnography could explain classroom culture, but the defining feature here is repeated collaborative cycles of practical change.', 'Etnograafia võiks selgitada klassikultuuri, kuid siin on määravad praktilise muutuse korduvad ühised tsüklid.')],
      collection: [choice('observation', true, 'Systematic observation can record who participates and how during each cycle.', 'Süstemaatiline vaatlus saab igas tsüklis talletada, kes ja kuidas osaleb.'), choice('interview', false, 'Interviews can complement the project, but this slot calls for directly recording participation during lessons.', 'Intervjuud võivad projekti täiendada, kuid siin tuleb osalemist tundide ajal vahetult talletada.')],
      analysis: [choice('descriptive-statistics', true, 'Frequencies summarise participation counts for joint reflection. Numbers can support transformative research, alongside participants’ perspectives.', 'Sagedused võtavad osalemiskorrad ühiseks refleksiooniks kokku. Arvud saavad koos osalejate vaatenurkadega toetada transformatiivset uuringut.'), choice('thematic-analysis', false, 'Thematic analysis suits qualitative accounts, but this slot asks you to summarise participation counts.', 'Temaatiline analüüs sobib kvalitatiivsete kirjelduste jaoks, kuid siin tuleb kokku võtta osalemiskordade arvud.')],
    },
  },
];
export function evaluateStudy(study: Study, answers: Partial<Record<StudySlot, string>>) {
  return (Object.keys(study.slots) as StudySlot[]).map(slot => ({ slot, choice: study.slots[slot]!.find(c => c.id === answers[slot]) }));
}
