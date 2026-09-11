export interface Reference {
  authors: string;
  year: string;
  title: string;
  publication: string;
  url: string;
  doi?: string;
  kind: 'handbook' | 'article' | 'guidance';
}
const handbook = (title: string, path: string): Reference => ({
  authors: 'Farrow, R., Iniesto, F., Weller, M., & Pitt, R.', year: '2020', title,
  publication: 'Research Methods Handbook. The Open University. CC BY 4.0.',
  url: `https://open.library.okstate.edu/gognresearchmethods/${path}/`, kind: 'handbook',
});
export const references = {
  postpositivism: handbook('Positivism/Post Positivism', 'chapter/positivism-post-positivism'),
  ontology: handbook('Ontology', 'chapter/ontology'),
  epistemology: handbook('Epistemology', 'chapter/epistemology'),
  axiology: handbook('Axiology', 'chapter/axiology'),
  paradigms: handbook('Research Paradigms', 'part/research-paradigms'),
  methods: handbook('Conceptualizing Research Methods', 'part/conceptualizing-research-methods'),
  interpretivism: handbook('Interpretivism', 'chapter/interpretivism'),
  pragmatism: handbook('Pragmatism', 'chapter/pragmatism'),
  critical: handbook('Critical / Transformational', 'chapter/critical-transformational'),
  caseStudy: handbook('Case Study', 'chapter/case-study'),
  ethnography: handbook('Ethnography', 'chapter/ethnography'),
  phenomenology: handbook('Phenomenology', 'chapter/phenomenology'),
  groundedTheory: handbook('Grounded Theory', 'chapter/grounded-theory'),
  actionResearch: handbook('Action Research and Participatory Action Research', 'chapter/action-research'),
  interviews: handbook('Interviews & Focus Groups', 'chapter/interviews-focus-groups'),
  observation: handbook('Observation (Naturalistic & Analogue)', 'chapter/observation-naturalistic-analogue'),
  questionnaires: handbook('Surveys & Questionnaires', 'chapter/surveys-questionnaires'),
  methodology: { authors: 'The Open University', year: 'n.d.', title: 'Defining your research methodology', publication: 'OpenLearn.', url: 'https://www.open.edu/openlearn/course/view.php?id=18286', kind: 'guidance' },
  pluralism: { authors: 'Jones, C., & Kennedy, G.', year: '2011', title: 'Stepping beyond the paradigm wars: pluralist methods for research in learning technology', publication: 'ALT-C 2011. Open Research Online.', url: 'https://oro.open.ac.uk/29480/', doi: '10.3402/rlt.v19s1/7798', kind: 'article' },
  mixedMethods: { authors: 'Fetters, M. D., Curry, L. A., & Creswell, J. W.', year: '2013', title: 'Achieving Integration in Mixed Methods Designs—Principles and Practices', publication: 'Health Services Research, 48(6 Pt 2), 2134–2156.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4097839/', doi: '10.1111/1475-6773.12117', kind: 'article' },
  thematic: { authors: 'Braun, V., & Clarke, V.', year: '2006', title: 'Using thematic analysis in psychology', publication: 'Qualitative Research in Psychology, 3(2), 77–101.', url: 'https://www.tandfonline.com/doi/abs/10.1191/1478088706qp063oa', doi: '10.1191/1478088706qp063oa', kind: 'article' },
  thematicGuide: { authors: 'Braun, V., & Clarke, V.', year: 'n.d.', title: 'Thematic Analysis', publication: 'Authors’ teaching resources, including developments since 2006.', url: 'https://www.thematicanalysis.net/', kind: 'guidance' },
  designScience: { authors: 'Hevner, A. R., & vom Brocke, J.', year: '2023', title: 'A Proficiency Model for Design Science Research Education', publication: 'Journal of Information Systems Education, 34(3), 264–278.', url: 'https://aisel.aisnet.org/jise/vol34/iss3/2/', kind: 'article' },
  experiments: { authors: 'Illowsky, B., & Dean, S.', year: '2023', title: '1.4 Experimental Design and Ethics', publication: 'Introductory Statistics 2e. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/1-4-experimental-design-and-ethics', kind: 'handbook' },
  statistics: { authors: 'Illowsky, B., & Dean, S.', year: '2023', title: 'Chapter 2: Descriptive Statistics', publication: 'Introductory Statistics 2e. OpenStax.', url: 'https://openstax.org/books/introductory-statistics-2e/pages/2-introduction', kind: 'handbook' },
  usability: { authors: 'National Institute of Standards and Technology', year: 'n.d.', title: 'Usability Testing', publication: 'NIST.', url: 'https://www.nist.gov/programs-projects/usability-testing', kind: 'guidance' },
  requirements: { authors: 'IEEE Computer Society', year: '2024', title: 'Guide to the Software Engineering Body of Knowledge (SWEBOK Guide), Version 4.0', publication: 'Chapter 1, §2.2 Common Requirements Elicitation Techniques (including interviews). PDF.', url: 'https://ieeecs-media.computer.org/media/education/swebok/swebok-v4.pdf', kind: 'handbook' },
  accessibility: { authors: 'W3C Web Accessibility Initiative', year: 'n.d.', title: 'Involving Users in Evaluating Web Accessibility', publication: 'W3C WAI.', url: 'https://www.w3.org/WAI/test-evaluate/involving-users/', kind: 'guidance' },
} satisfies Record<string, Reference>;
export type ReferenceId = keyof typeof references;
// Shared concept IDs ensure English and Estonian explanations cite the same evidence.
export const conceptReferences: Record<string, readonly ReferenceId[]> = {
  postpositivism: ['postpositivism'],
  ontology: ['ontology'], epistemology: ['epistemology'], axiology: ['axiology'],
  paradigm: ['paradigms', 'pluralism'], methodology: ['methodology'], method: ['methods', 'pluralism'],
  interpretivism: ['interpretivism'], pragmatism: ['pragmatism', 'pluralism'], critical: ['critical'],
  'case-study': ['caseStudy'], ethnography: ['ethnography'], phenomenology: ['phenomenology'],
  'grounded-theory': ['groundedTheory'], 'action-research': ['actionResearch'], 'mixed-methods': ['mixedMethods'],
  'design-science': ['designScience'], 'experimental-design': ['experiments'],
  interview: ['interviews'], questionnaire: ['questionnaires'], observation: ['observation'], 'focus-group': ['interviews'],
  'thematic-analysis': ['thematic', 'thematicGuide'], 'descriptive-statistics': ['statistics'],
  'usability-testing': ['usability'], 'requirements-interview': ['requirements'],
  'compare-tasks': ['usability', 'experiments'], 'inclusive-evaluation': ['accessibility'],
  'requirements-evaluation': ['designScience', 'requirements'], 'count-features': ['usability'],
};
