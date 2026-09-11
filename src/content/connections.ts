import type { Bilingual, Study, StudySlot } from './studies';

type Answers = Partial<Record<StudySlot, string>>;
interface ConnectionRule {
  id: string;
  slots: StudySlot[];
  accepts: Partial<Record<StudySlot, string[]>>;
  title: Bilingual;
  fits: Bilingual;
  reconsider: Bilingual;
}
const text = (en: string, et: string): Bilingual => ({ en, et });
const evidenceTitle = text('Collected evidence → analysis', 'Kogutud tõendid → analüüs');
const evaluationTitle = text('Research question → evaluation', 'Uurimisküsimus → hindamine');
// These are checks against each teaching brief, not universal method pairings.
// Keep the accepted combinations explicit rather than deriving them from card scores.
export const connectionRules: Record<string, ConnectionRule[]> = {
  belonging: [{
    id: 'accounts', slots: ['collection', 'analysis'],
    accepts: { collection: ['interview', 'focus-group'], analysis: ['thematic-analysis'] }, title: evidenceTitle,
    fits: text('Detailed accounts supply material for patterns of meaning about belonging. Interviews and focus groups are both supported here; consider how a group setting may shape what students share.', 'Põhjalikud kirjeldused annavad materjali kuuluvuse tähendusmustrite leidmiseks. Siin sobivad nii intervjuud kui ka fookusrühmad; kaalu, kuidas rühmaolukord võib õpilaste vastuseid kujundada.'),
    reconsider: text('This brief asks for detailed accounts and shared meanings. Connect a conversational collection method with analysis of those accounts; numerical summaries alone would leave the question about experience unanswered.', 'Ülesanne küsib põhjalikke kirjeldusi ja ühiseid tähendusi. Seo vestluslik kogumismeetod nende kirjelduste analüüsiga; ainult arvulised kokkuvõtted jätaksid kogemuse küsimuse vastuseta.'),
  }],
  feedback: [{
    id: 'integration', slots: ['methodology', 'collection', 'collection2', 'analysis'],
    accepts: { methodology: ['mixed-methods'], collection: ['questionnaire'], collection2: ['interview'], analysis: ['thematic-analysis'] },
    title: text('Numerical patterns → explanations → integration', 'Arvulised mustrid → selgitused → lõimimine'),
    fits: text('Use the supplied questionnaire summaries to guide follow-up interviews, then connect transcript themes back to those patterns. Collecting two kinds of data is only a start: the brief requires you to interpret them together.', 'Kasuta etteantud küsimustiku kokkuvõtteid järelintervjuude suunamiseks ja seo transkriptsioonide teemad nende mustritega. Kaht tüüpi andmete kogumine on alles algus: ülesanne nõuab nende ühist tõlgendamist.'),
    reconsider: text('The questionnaire summaries are already supplied. The remaining chain needs follow-up conversations, analysis of their transcripts, and a methodology that integrates both forms of evidence.', 'Küsimustiku kokkuvõtted on juba ette antud. Ülejäänud seos vajab järelvestlusi, nende transkriptsioonide analüüsi ning mõlemat tõendiliiki lõimivat metodoloogiat.'),
  }],
  participation: [{
    id: 'cycles', slots: ['methodology', 'collection', 'analysis'],
    accepts: { methodology: ['action-research'], collection: ['observation'], analysis: ['descriptive-statistics'] }, title: evidenceTitle,
    fits: text('Observe participation during each change cycle and summarise the counts for joint reflection. Interpret the counts alongside participants’ perspectives before planning the next change; frequency alone does not explain equity.', 'Vaatle osalemist igas muutustsüklis ja võta arvud ühiseks refleksiooniks kokku. Tõlgenda arve koos osalejate vaatenurkadega enne järgmise muutuse kavandamist; sagedus üksi ei selgita võrdsust.'),
    reconsider: text('Connect the collaborative change cycles to direct records of classroom participation and summaries of those counts. Interviews or themes could add context, but they do not replace the evidence requested in these slots.', 'Seo ühised muutustsüklid klassis osalemise vahetu talletamise ja nende arvude kokkuvõtetega. Intervjuud või teemad võivad lisada konteksti, kuid ei asenda nendes kohtades nõutud tõendeid.'),
  }],
  'room-finder': [{
    id: 'task-evidence', slots: ['methodology', 'collection', 'collection2', 'analysis'],
    accepts: { methodology: ['mixed-methods'], collection: ['usability-testing'], collection2: ['interview'], analysis: ['descriptive-statistics'] }, title: evidenceTitle,
    fits: text('Task testing produces success and time measures for the supplied numerical analysis. Follow-up interviews explain remaining difficulties; develop themes from them and integrate these with the task results. The numerical analysis card does not cover the interview analysis by itself.', 'Ülesannete testimine annab edukuse ja aja mõõdikud etteantud arvuliseks analüüsiks. Järelintervjuud selgitavad allesjäänud raskusi; arenda neist teemad ja lõimi need ülesannete tulemustega. Arvulise analüüsi kaart üksi ei kata intervjuude analüüsi.'),
    reconsider: text('To answer both “faster?” and “what difficulties remain?”, connect observed task performance to numerical summaries and follow-up interviews to explanations, within an integrated design. Opinions or requirements alone cannot supply both parts.', 'Et vastata nii küsimusele „kiiremini?” kui ka „millised raskused jäävad?”, seo vaadeldud ülesandesooritus arvuliste kokkuvõtetega ning järelintervjuud selgitustega lõimitud uuringus. Arvamused või nõuded üksi ei anna mõlemat osa.'),
  }, {
    id: 'room-outcome', slots: ['collection', 'evaluation'],
    accepts: { collection: ['usability-testing'], evaluation: ['compare-tasks'] }, title: evaluationTitle,
    fits: text('Compare actual room-search tasks with the current process. Check that the room is suitable as well as how long finding it takes; account for task order and practice effects when interpreting differences.', 'Võrdle tegelikke ruumiotsingu ülesandeid senise protsessiga. Kontrolli nii ruumi sobivust kui ka otsingule kuluvat aega; erinevuste tõlgendamisel arvesta ülesannete järjekorra ja harjutamise mõjuga.'),
    reconsider: text('A speed-and-suitability question needs observed room-search tasks and a comparison with the current process. Feature counts or opinions alone cannot show that students find a suitable room faster.', 'Kiiruse ja sobivuse küsimus vajab vaadeldud ruumiotsingu ülesandeid ning võrdlust senise protsessiga. Funktsioonide arv või arvamused üksi ei näita, et õpilased leiavad sobiva ruumi kiiremini.'),
  }],
  'accessible-planner': [{
    id: 'barriers', slots: ['collection', 'analysis'],
    accepts: { collection: ['usability-testing'], analysis: ['thematic-analysis'] }, title: evidenceTitle,
    fits: text('Task sessions must record participants’ comments and accounts of barriers, not just completion times. Those accounts support thematic analysis and discussion with participants before the next cycle.', 'Ülesandeseansid peavad talletama osalejate kommentaare ja takistuste kirjeldusi, mitte ainult sooritusaegu. Need kirjeldused toetavad temaatilist analüüsi ja arutelu osalejatega enne järgmist tsüklit.'),
    reconsider: text('This brief connects real planning tasks to accounts of access barriers. Preserve those accounts and interpret their patterns; questionnaire opinions or numerical summaries alone leave that connection incomplete.', 'See ülesanne seob tegelikud planeerimisülesanded ligipääsutakistuste kirjeldustega. Säilita kirjeldused ja tõlgenda nende mustreid; ainult küsimustiku arvamused või arvulised kokkuvõtted jätavad selle seose poolikuks.'),
  }, {
    id: 'shared-evaluation', slots: ['methodology', 'collection', 'evaluation'],
    accepts: { methodology: ['action-research'], collection: ['usability-testing'], evaluation: ['inclusive-evaluation'] }, title: evaluationTitle,
    fits: text('Bring the task evidence back into shared decisions about the next action-research cycle. Use participants’ access tools and agreed goals together with an accessibility review; a successful session does not establish accessibility for everyone.', 'Too ülesannete tõendid tagasi ühisesse otsustamisse järgmise tegevusuuringu tsükli üle. Kasuta osalejate abivahendeid ja kokkulepitud eesmärke koos ligipääsetavuse ülevaatusega; edukas seanss ei tõenda ligipääsetavust kõigile.'),
    reconsider: text('The question asks students to shape a planner that works for them. Link shared change cycles to real task testing and participant-defined evaluation; counting features does not demonstrate reduced barriers.', 'Küsimus palub õpilastel kujundada enda jaoks toimiva planeerija. Seo ühised muutustsüklid tegelike ülesannete testimise ja osalejate määratletud hindamisega; funktsioonide loendamine ei tõenda takistuste vähenemist.'),
  }],
  'equipment-lending': [{
    id: 'workflow-measures', slots: ['collection2', 'analysis'],
    accepts: { collection2: ['usability-testing'], analysis: ['descriptive-statistics'] }, title: evidenceTitle,
    fits: text('The supplied usability sessions produce workflow times and errors for numerical summaries. Keep unsuccessful attempts visible. Earlier stakeholder accounts can inform requirements, but they are a different evidence stream.', 'Etteantud kasutatavusseansid annavad töövoogude ajad ja vead arvulisteks kokkuvõteteks. Hoia ebaõnnestunud katsed nähtaval. Varasemad osapoolte kirjeldused võivad kujundada nõudeid, kuid need on eraldi tõendivoog.'),
    reconsider: text('Match the analysis to the measured workflow times and errors from usability testing. Themes could help with earlier stakeholder accounts, but do not replace the requested numerical summary.', 'Sobita analüüs kasutatavuse testimisel mõõdetud töövoogude aegade ja vigadega. Teemad võivad aidata varasemate osapoolte kirjeldustega, kuid ei asenda nõutud arvulist kokkuvõtet.'),
  }, {
    id: 'design-lessons', slots: ['methodology', 'collection', 'evaluation'],
    accepts: { methodology: ['design-science'], collection: ['requirements-interview', 'observation'], evaluation: ['requirements-evaluation'] }, title: evaluationTitle,
    fits: text('Use stakeholder interviews or observation of the existing workflow to establish needs, validate them with students and staff, and agree criteria. Evaluate the artifact against those criteria and the spreadsheet process, then explain the design lessons beyond the implemented features.', 'Selgita vajadused osapoolte intervjuude või senise töövoo vaatlusega, kontrolli neid õpilaste ja töötajatega ning lepi kokku kriteeriumid. Hinda artefakti nende kriteeriumide ja tabelipõhise protsessi suhtes ning selgita disainialaseid õppetunde lisaks valminud funktsioonidele.'),
    reconsider: text('Connect the artifact-building methodology and stakeholder needs to evaluation of agreed workflows and staff effort. Feature output alone cannot establish usefulness or provide the design lessons requested here.', 'Seo artefakti loomise metodoloogia ja osapoolte vajadused kokkulepitud töövoogude ning töötajate ajakulu hindamisega. Funktsioonide väljund üksi ei tõenda kasulikkust ega anna siin nõutud disainialaseid õppetunde.'),
  }],
};

export function evaluateConnections(study: Study, answers: Answers) {
  return (connectionRules[study.id] ?? []).map(rule => {
    const complete = rule.slots.every(slot => !!answers[slot]);
    const fits = complete && rule.slots.every(slot => rule.accepts[slot]?.includes(answers[slot]!));
    return { ...rule, status: !complete ? 'incomplete' as const : fits ? 'fits' as const : 'reconsider' as const };
  });
}

// Preserve correct cards unless a failed combination consists entirely of
// individually fitting cards: in that case its editable slots must be revisable.
export function retryStudySlots(study: Study, answers: Answers): StudySlot[] {
  const conflicts = evaluateConnections(study, answers).filter(r => r.status === 'reconsider' && r.slots.every(slot => study.slots[slot]?.some(c => c.id === answers[slot] && c.fits)));
  return (Object.keys(study.slots) as StudySlot[]).filter(slot => !!study.fixed[slot] || (study.slots[slot]!.some(c => c.id === answers[slot] && c.fits) && !conflicts.some(r => r.slots.includes(slot))));
}
