# Research Cards

Research Cards is an interactive learning app for beginners exploring the foundations of research. It includes three decks: six Foundations cards, eight Methodology cards, and eight Methods cards:

- **Foundations:** ontology, epistemology, axiology, research paradigm, methodology, and method.
- **Methodology:** case study, ethnography, phenomenology, grounded theory, action research, mixed methods research, design science research, and experimental design.
- **Methods:** interview, questionnaire, observation, focus group, thematic analysis, descriptive statistics, usability testing, and requirements interviews.

The app is available in **English and Estonian (Eesti)** and offers three ways to learn:

- **Explore the cards:** reveal definitions, guiding questions, research examples, and explanations of how similar concepts differ.
- **Practise matching:** match concepts to definitions in rounds covering the selected deck, get explanatory feedback, review your first-attempt score, and retry missed cards.
- **Place the cards:** drag concept cards into definition slots, or select a card and then a slot using touch or a keyboard. Check the completed board and retry incorrect cards while keeping correct placements and your first-attempt score.

Learners can switch languages at any time without losing their active round. Progress is saved separately for each deck, and language preferences are saved in the browser, with no account or backend required. If browser storage is unavailable, the app works for the current session. Refreshing ends the active round.

## Build a research study

Connect the decks in six guided scenarios:

- **Education:** belonging at school, understanding feedback, and equitable classroom participation.
- **Applied computing:** a campus room finder, an accessible course planner, and a lab equipment lending system.

The computing scenarios ask students to build a prototype and choose how to evaluate whether it solves the problem. An additional **Application evaluation** slot connects research choices to realistic tasks, accessibility goals, or agreed requirements. Complete a partly filled tree linking a paradigm to a methodology and methods for data collection and analysis. Select a card, then its slot; the card tray stays visible as you scroll.

Feedback explains how each choice fits the specific brief. Some slots accept alternatives; the trees do not imply that methods belong exclusively to particular paradigms. Retry connections while keeping fitting choices and the first-attempt score. The activity is available in English and Estonian. Scenario progress lasts while the activity is open; changing scenarios starts a fresh tree.

The relationship model is informed by [Open University research on paradigms and methods](https://oro.open.ac.uk/29480/) and its [research design teaching material](https://www.open.edu/openlearn/mod/oucontent/view.php?id=114270&section=4). Computing content also draws on [design science research education](https://aisel.aisnet.org/jise/vol34/iss3/2/), [NIST usability testing](https://www.nist.gov/programs-projects/usability-testing), and [W3C guidance on involving users in accessibility evaluation](https://www.w3.org/WAI/test-evaluate/involving-users/). Scenarios and feedback are introductory teaching examples.

The definitions are introductory; terminology can vary across disciplines.

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
- `src/content/computing-studies.ts`: computing scenarios and application evaluation cards.
- `src/i18n.ts`: interface translations.

Keep concept IDs and ordering aligned across languages so questions and progress remain consistent.
