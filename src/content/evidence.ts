import type { Bilingual } from './studies';
import type { QualityDecision } from './quality';
const text = (en: string, et: string): Bilingual => ({ en, et });
export interface Attempt { participant: string; condition: 'baseline' | 'prototype'; seconds: number | null; errors: number }
export interface EvidenceExercise {
  id: string; version: number; task: Bilingual; context: Bilingual;
  attempts: Attempt[]; excerpts: { participant: string; quote: Bilingual }[];
  questions: QualityDecision[];
}
const attempts = (before: [number | null, number][], after: [number | null, number][]): Attempt[] => before.flatMap(([seconds, errors], i) => [
  { participant: `P${i + 1}`, condition: 'baseline' as const, seconds, errors },
  { participant: `P${i + 1}`, condition: 'prototype' as const, seconds: after[i][0], errors: after[i][1] },
]);
const question = (id: string, lesson: string, prompt: Bilingual, supported: Bilingual, unsupported: Bilingual, reason: Bilingual): QualityDecision => ({ id, lesson, prompt, choices: [
  { id: 'supported', label: supported, fits: true, feedback: reason },
  { id: 'unsupported', label: unsupported, fits: false, feedback: reason },
] });
const limits = question('limits', 'quality-limits', text('What can this comparison establish?', 'Mida saab see võrdlus tõendada?'), text('It describes these sessions; the small convenience sample and fixed task order limit wider and causal claims.', 'See kirjeldab neid seansse; väike mugavusvalim ja kindel ülesannete järjekord piiravad laiemaid ja põhjuslikke väiteid.'), text('It proves that the prototype causes better outcomes for all intended users.', 'See tõestab, et prototüüp põhjustab paremaid tulemusi kõigile sihtkasutajatele.'), text('All four participants tried the baseline first. Practice may contribute to changes, and four volunteers do not represent every user. The data can guide a revision and a better follow-up study without proving a universal effect.', 'Kõik neli osalejat proovisid esmalt senist lahendust. Harjutamine võib muutustele kaasa aidata ja neli vabatahtlikku ei esinda kõiki kasutajaid. Andmed võivad suunata parandust ja paremat jätku-uuringut, tõestamata üldkehtivat mõju.'));
export const evidenceExercises: Record<string, EvidenceExercise> = {
  'room-finder': {
    id: 'room-finder', version: 1,
    task: text('Find an available room with the requested facilities and confirm its suitability.', 'Leia vaba ruum nõutud varustusega ja kinnita selle sobivus.'),
    context: text('Four student volunteers each try the current room list and then the prototype. An error is opening or selecting a room that fails a stated requirement. The same task requirements are used in both conditions.', 'Neli vabatahtlikku õpilast proovivad igaüks esmalt senist ruumiloendit ja seejärel prototüüpi. Viga on nõuetele mittevastava ruumi avamine või valimine. Mõlemas tingimuses kasutatakse samu ülesandenõudeid.'),
    attempts: attempts([[90, 1], [120, 2], [150, 0], [null, 3]], [[60, 0], [75, 1], [90, 0], [null, 2]]),
    excerpts: [
      { participant: 'P2', quote: text('The list was quicker, but I opened a room before noticing it had no projector.', 'Loend oli kiirem, aga avasin ruumi enne, kui märkasin, et seal ei olnud projektorit.') },
      { participant: 'P4', quote: text('I could not tell whether the accessibility filter was still active.', 'Ma ei saanud aru, kas ligipääsetavuse filter oli endiselt aktiivne.') },
    ],
    questions: [
      question('pattern', 'descriptive-statistics', text('Which statement accurately describes these task results?', 'Milline väide kirjeldab neid ülesandetulemusi täpselt?'), text('Success stays at 3/4; median successful-task time falls from 120 s to 75 s, while one participant still fails.', 'Edukus jääb 3/4 juurde; edukate ülesannete mediaanaeg langeb 120 sekundilt 75 sekundile, kuid üks osaleja ebaõnnestub endiselt.'), text('Every participant succeeds because the prototype has a lower median time.', 'Kõik osalejad on edukad, sest prototüübil on väiksem mediaanaeg.'), text('P4 fails in both conditions. The time median includes only P1–P3: the middle values are 120 and 75 seconds. Faster successful attempts do not mean higher task success.', 'P4 ebaõnnestub mõlemas tingimuses. Aja mediaan hõlmab ainult P1–P3: keskmised järjestatud väärtused on 120 ja 75 sekundit. Kiiremad edukad katsed ei tähenda suuremat ülesandeedukust.')),
      limits,
      question('revision', 'usability-testing', text('Which prototype revision is best supported by both the records and excerpts?', 'Millist prototüübi parandust toetavad kõige paremini nii tulemused kui ka väljavõtted?'), text('Make active filters and room facilities clearer, then retest suitability and completion with varied task order.', 'Muuda aktiivsed filtrid ja ruumide varustus selgemaks ning testi sobivust ja lõpetamist uuesti, varieerides ülesannete järjekorda.'), text('Remove the filters to reduce time further and stop collecting failure data.', 'Eemalda filtrid aja edasiseks vähendamiseks ja lõpeta ebaõnnestumiste andmete kogumine.'), text('The remaining errors and P4’s failure point to issues worth investigating; the excerpts suggest filter and facility visibility as a revision hypothesis. Retesting is needed to see whether it helps.', 'Allesjäänud vead ja P4 ebaõnnestumine viitavad uurimist vajavatele probleemidele; väljavõtted pakuvad paranduse hüpoteesiks filtrite ja varustuse nähtavust. Kasu hindamiseks on vaja uut testimist.')),
    ],
  },
  'accessible-planner': {
    id: 'accessible-planner', version: 1,
    task: text('Create a study plan and save its deadline using your usual access tools.', 'Loo õppeplaan ja salvesta selle tähtaeg oma tavapäraste abivahenditega.'),
    context: text('Four volunteers test the current planner and then a revised prototype: P1 and P2 use a mouse, P3 a screen reader, and P4 keyboard-only navigation. An error is an unsuccessful activation or an incorrect deadline entry.', 'Neli vabatahtlikku testivad senist planeerijat ja seejärel uuendatud prototüüpi: P1 ja P2 kasutavad hiirt, P3 ekraanilugejat ja P4 ainult klaviatuuri. Viga on ebaõnnestunud aktiveerimine või vale tähtaja sisestamine.'),
    attempts: attempts([[100, 0], [140, 1], [null, 3], [null, 4]], [[80, 0], [100, 0], [180, 1], [null, 3]]),
    excerpts: [
      { participant: 'P3', quote: text('The field labels now make sense, but I needed time to find the save confirmation.', 'Väljade sildid on nüüd arusaadavad, kuid salvestamise kinnituse leidmine võttis aega.') },
      { participant: 'P4', quote: text('My focus disappeared inside the date picker; I could not reach Save.', 'Fookus kadus kuupäevavalijasse; ma ei jõudnud salvestamiseni.') },
    ],
    questions: [
      question('pattern', 'descriptive-statistics', text('What do success and time show together?', 'Mida näitavad edukus ja aeg koos?'), text('Success rises from 2/4 to 3/4, but P4 still fails; successful-time medians describe different sets of participants.', 'Edukus tõuseb 2/4-lt 3/4-le, kuid P4 ebaõnnestub endiselt; edukate aegade mediaanid kirjeldavad erinevaid osalejate kogumeid.'), text('A lower median proves that the screen-reader user became faster in both conditions.', 'Madalam mediaan tõestab, et ekraanilugeja kasutaja muutus mõlemas tingimuses kiiremaks.'), text('P3 has no successful baseline time to compare. Baseline median is (100 + 140) / 2 = 120 s; prototype median is 100 s from 80, 100, 180. Do not turn this changing subset into a claim about every person’s speed.', 'P3-l puudub võrdlemiseks edukas algne aeg. Senise lahenduse mediaan on (100 + 140) / 2 = 120 s; prototüübi mediaan on aegadest 80, 100, 180 leitud 100 s. Ära muuda seda muutuvat alarühma väiteks iga inimese kiiruse kohta.')),
      limits,
      question('revision', 'inclusive-evaluation', text('What should the team prioritise next?', 'Mida peaks rühm järgmisena eelistama?'), text('Investigate keyboard focus and save confirmation with affected users, improve them, and combine retesting with an accessibility review.', 'Uuri mõjutatud kasutajatega klaviatuurifookust ja salvestamise kinnitust, paranda neid ning ühenda uus testimine ligipääsetavuse ülevaatusega.'), text('Declare the planner accessible because most volunteers now finish.', 'Kuuluta planeerija ligipääsetavaks, sest enamik vabatahtlikke lõpetab nüüd ülesande.'), text('P4’s failed task and account identify a concrete barrier; P3 suggests another issue despite succeeding. Most users succeeding cannot establish accessibility for everyone.', 'P4 ebaõnnestunud ülesanne ja kirjeldus toovad esile konkreetse takistuse; P3 viitab edukusest hoolimata teisele probleemile. Enamiku kasutajate edu ei tõenda ligipääsetavust kõigile.')),
    ],
  },
  'equipment-lending': {
    id: 'equipment-lending', version: 1,
    task: text('Record a reservation or return correctly, including the required due-date and confirmation steps.', 'Talleta broneering või tagastus õigesti, sealhulgas nõutud tähtaja- ja kinnitussammud.'),
    context: text('Two students (P1–P2) reserve equipment and two staff members (P3–P4) process returns. Each uses the spreadsheet first and the prototype second for their assigned workflow. An error is an incorrect entry or repeated action after unclear feedback. These task times are not total staff workload.', 'Kaks õpilast (P1–P2) broneerivad seadmeid ja kaks töötajat (P3–P4) töötlevad tagastusi. Igaüks kasutab oma töövoo jaoks esmalt tabelit ja seejärel prototüüpi. Viga on vale sisestus või ebaselge tagasiside järel korratud tegevus. Need ülesandeajad ei ole töötajate kogu töökoormus.'),
    attempts: attempts([[120, 1], [180, 1], [240, 2], [null, 2]], [[90, 0], [120, 1], [150, 0], [210, 2]]),
    excerpts: [
      { participant: 'P2', quote: text('I reserved it, but I nearly missed the due date until I checked again.', 'Broneerisin seadme, kuid peaaegu ei märganud tähtaega enne uuesti kontrollimist.') },
      { participant: 'P4', quote: text('The return saved, but I clicked twice because there was no clear confirmation.', 'Tagastus salvestus, aga klõpsasin kaks korda, sest selget kinnitust ei olnud.') },
    ],
    questions: [
      question('pattern', 'descriptive-statistics', text('Which description keeps both improvements and problems visible?', 'Milline kirjeldus hoiab nähtaval nii paranemise kui ka probleemid?'), text('Success rises from 3/4 to 4/4 and total errors fall from 6 to 3; successful tasks can still contain errors.', 'Edukus tõuseb 3/4-lt 4/4-le ja vigade koguarv langeb 6-lt 3-le; edukad ülesanded võivad endiselt sisaldada vigu.'), text('Four successful prototype tasks mean that the workflow is error-free.', 'Neli edukat prototüübi ülesannet tähendavad, et töövoog on vigadeta.'), text('P2 records one prototype error and P4 two despite eventual success. The pooled successful-time median falls from 180 to 135 s, but it combines student and staff tasks and cannot measure total staff effort.', 'P2-l on üks prototüübi viga ja P4-l kaks, kuigi nad lõpuks õnnestuvad. Edukate aegade koondmediaan langeb 180-lt 135 sekundile, kuid ühendab õpilaste ja töötajate ülesanded ega mõõda töötajate kogu ajakulu.')),
      limits,
      question('revision', 'requirements-evaluation', text('Which next step connects the evidence to the lending problem?', 'Milline järgmine samm seob tõendid laenutamise probleemiga?'), text('Clarify due dates and return confirmations; retest each workflow and measure overdue-return handling before claiming lower staff workload.', 'Selgita tähtaegu ja tagastuskinnitusi; testi iga töövoogu uuesti ning mõõda hilinenud tagastuste käsitlemist enne väiksema töökoormuse väitmist.'), text('Claim staff workload has halved and add unrelated features because every task succeeded.', 'Väida, et töötajate töökoormus on poole võrra vähenenud, ja lisa mitteseotud funktsioone, sest kõik ülesanded õnnestusid.'), text('The excerpts identify concrete revision targets. The study has not measured ongoing overdue-return work, so a broader workload claim needs additional evidence against agreed requirements.', 'Väljavõtted toovad esile konkreetsed paranduskohad. Uuring ei ole mõõtnud pidevat tööd hilinenud tagastustega, seega vajab laiem töökoormuse väide kokkulepitud nõuetega seotud lisatõendeid.')),
    ],
  },
};
export function summariseAttempts(rows: Attempt[]) {
  const times = rows.flatMap(r => r.seconds === null ? [] : [r.seconds]).sort((a, b) => a - b);
  const middle = Math.floor(times.length / 2);
  return { total: rows.length, successes: times.length, errors: rows.reduce((sum, r) => sum + r.errors, 0), median: !times.length ? null : times.length % 2 ? times[middle] : (times[middle - 1] + times[middle]) / 2 };
}
