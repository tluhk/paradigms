# Research Cards

Research Cards is an interactive learning app for beginners exploring the foundations of research. It includes three decks of six cards each:

- **Foundations:** ontology, epistemology, axiology, research paradigm, methodology, and method.
- **Methodology:** case study, ethnography, phenomenology, grounded theory, action research, and mixed methods research.
- **Methods:** interview, questionnaire, observation, focus group, thematic analysis, and descriptive statistics.

The app is available in **English and Estonian (Eesti)** and offers three ways to learn:

- **Explore the cards:** reveal definitions, guiding questions, research examples, and explanations of how similar concepts differ.
- **Practise matching:** match concepts to definitions in six-question rounds, get explanatory feedback, review your first-attempt score, and retry missed cards.
- **Place the cards:** drag concept cards into definition slots, or select a card and then a slot using touch or a keyboard. Check the completed board and retry incorrect cards while keeping correct placements and your first-attempt score.

Learners can switch languages at any time without losing their active round. Progress is saved separately for each deck, and language preferences are saved in the browser, with no account or backend required. If browser storage is unavailable, the app works for the current session. Refreshing ends the active round.

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
- `src/i18n.ts`: interface translations.

Keep concept IDs and ordering aligned across languages so questions and progress remain consistent.
