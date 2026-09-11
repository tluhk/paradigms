# Research Cards

Research Cards is an interactive learning app for beginners exploring the foundations of research. It includes four decks: six Foundations cards, eight Methodology cards, eight Methods cards, and four Paradigms cards:

- **Foundations:** ontology, epistemology, axiology, research paradigm, methodology, and method.
- **Methodology:** case study, ethnography, phenomenology, grounded theory, action research, mixed methods research, design science research, and experimental design.
- **Methods:** interview, questionnaire, observation, focus group, thematic analysis, descriptive statistics, usability testing, and requirements interviews.

- **Paradigms:** interpretivism, pragmatism, critical/transformative approaches, and postpositivism, with links to ontology, epistemology, and axiology.

The app is available in **English and Estonian (Eesti)** and offers three ways to learn:

- **Explore the cards:** reveal definitions, guiding questions, research examples, and explanations of how similar concepts differ.
- **Practise matching:** match concepts to definitions in rounds covering the selected deck, get explanatory feedback, review your first-attempt score, and retry missed cards.
- **Place the cards:** drag concept cards into definition slots, or select a card and then a slot using touch or a keyboard. Check the completed board and retry incorrect cards while keeping correct placements and your first-attempt score.

Learners can switch languages at any time without losing their active round. Progress is saved separately for each deck, and language preferences are saved in the browser, with no account or backend required. Learning cards, matching rounds, and placement boards resume after navigation or refresh, including answers, feedback, and retry scores. Opening References preserves the activity and provides a return button. If browser storage is unavailable, activity drafts remain available while navigating the open app but are lost on refresh. Invalid or outdated drafts are safely restarted.

## Build a research study

Connect the decks in six guided scenarios:

- **Education:** belonging at school, understanding feedback, and equitable classroom participation.
- **Applied computing:** a campus room finder, an accessible course planner, and a lab equipment lending system.

The computing scenarios ask students to build a prototype and choose how to evaluate whether it solves the problem. An additional **Application evaluation** slot connects research choices to realistic tasks, accessibility goals, or agreed requirements. Complete a partly filled tree linking a paradigm to a methodology and methods for data collection and analysis. Drag a card into its slot, or select a card and then its slot; the card tray stays visible as you scroll.

Feedback explains how each choice fits the specific brief. Some slots accept alternatives; the trees do not imply that methods belong exclusively to particular paradigms. Retry connections while keeping fitting choices and the first-attempt score. The activity is available in English and Estonian. Each scenario keeps its own draft and completion mark across navigation and refresh. Restart scenario clears that tree and its attempt score while retaining its completion mark.

After checking a tree, **How the choices work together** reviews combinations against the brief: data collection and analysis, integration of evidence, and (in computing scenarios) evaluation against the research question. It shows the selected chain and explains what makes it coherent or what needs revision. Completion requires both fitting individual choices and coherent combinations. The first-attempt score still counts individual placements; combination checks add no points. Supported alternatives remain valid, and these checks are specific to the teaching scenarios rather than universal method rules.

After checking a tree, **Explain your choices** offers a prompt for each chosen connection and a question about limitations or alternatives. Write your reasoning, then compare it with feedback and an example drawn from the scenario’s existing explanations. Notes are optional and ungraded: placement scores and completion marks still describe card choices only. Notes are saved separately for each scenario, slot, and chosen card, survive language changes and refresh, and are cleared by Restart scenario.

The relationship model is informed by [Open University research on paradigms and methods](https://oro.open.ac.uk/29480/) and its [research design teaching material](https://www.open.edu/openlearn/mod/oucontent/view.php?id=114270&section=4). Computing content also draws on [design science research education](https://aisel.aisnet.org/jise/vol34/iss3/2/), [NIST usability testing](https://www.nist.gov/programs-projects/usability-testing), and [W3C guidance on involving users in accessibility evaluation](https://www.w3.org/WAI/test-evaluate/involving-users/). Scenarios and feedback are introductory teaching examples.

The definitions are introductory; terminology can vary across disciplines.

New round and New placement round start fresh activities. Reset progress clears the selected deck’s progress and learning, matching, and placement drafts; it does not clear other decks or study scenarios. Clearing site data removes all saved work.

## References and content provenance

Each learning card links to references for its concept. The study builder shows references for selected and placed cards, including paradigms and application evaluation choices. Open **References** in the footer for the complete bibliography organised by concept. Links open in a new tab so the activity stays in place.

The bibliography covers all 26 learning concepts (including four named paradigms) and four evaluation choices. It includes author names, publication dates where specified, titles, publication details, and DOI identifiers where available. English and Estonian share the same source mappings; original source titles are retained. Thematic analysis includes both the 2006 article and the authors’ subsequent teaching resources. Some publisher links may restrict full-text access.

Definitions are introductory paraphrases. Examples, scenarios, and scoring rules are written for this game, not taken from empirical studies or endorsed by the cited authors. References support the underlying concepts; they do not establish exclusive paradigm–method pairings or validate the game as a teaching instrument. The Open University handbook is CC BY 4.0 and is attributed at chapter level.

Maintain references in `src/content/references.ts`. When adding a concept, add its source mapping and verify the citation metadata and relevant source content. Automated tests check citation coverage and links in the interface; they do not assess scholarly validity or external website availability.

## Local development

Built with React, TypeScript, and Vite. Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

Run tests with `npm test`, create a production build with `npm run build`, and preview it with `npm run preview`.

## Deploy from your own repository

1. Fork this repository or copy it into your own GitHub repository, including `.github/workflows/deploy.yml`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**. Enable workflows in the **Actions** tab if prompted.
3. Push to `main`, or run **Build and deploy to GitHub Pages** from the **Actions** tab on `main`.

The workflow tests, builds, and deploys the app. Open the site URL shown by the completed deployment. No repository-specific configuration changes are needed.

## Editing the learning content

- `src/content/foundations.ts`: English concepts, definitions, and examples.
- `src/content/foundations.et.ts`: Estonian learning content.
- `src/content/decks.ts`: deck metadata and bilingual Methodology and Methods content.
- `src/content/studies.ts`: bilingual scenarios, accepted connections, and explanatory feedback.
- `src/content/connections.ts`: explicit scenario combination rules and bilingual feedback. Keep these aligned with changes to scenario briefs and choices.
- `src/content/computing-studies.ts`: computing scenarios and application evaluation cards.
- `src/content/paradigms.ts`: bilingual paradigm cards and their philosophical assumptions, shared with scenarios.
- `src/content/references.ts`: bibliography and concept-to-source mappings.
- `src/i18n.ts`: interface translations.

Keep concept IDs and ordering aligned across languages so questions and progress remain consistent.

## Improvement roadmap

See [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) for the prioritised roadmap and implementation log. [PLAN.md](PLAN.md) records the original first-release scope.
