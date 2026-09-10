# Research Cards

A small web-based game for learning six foundations of research: ontology, epistemology, axiology, research paradigm, methodology, and method.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

## Verify and preview

```sh
npm test
npm run build
npm run preview
```

Learn mode reveals definitions, guiding questions, examples, and distinctions. Practise mode presents six matching questions with explanatory feedback, a first-attempt score, and optional missed-card retries. Progress is stored only in this browser; if storage is blocked, the game continues in memory. Refreshing ends the current round.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` tests and builds pull requests, then deploys pushes to `main`. It can also be run manually from the Actions tab on `main`.

1. Push this project to `tluhk/paradigms` on GitHub.
2. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main` or run **Build and deploy to GitHub Pages** from Actions.
4. When deployment succeeds, the expected address is **https://tluhk.github.io/paradigms/** (unless a custom domain is configured).

Vite uses relative asset paths (`base: './'`) so the build works under the repository subpath. Navigation stays inside the application and does not require server-side route fallback. The workflow uploads `dist`; no generated build files need to be committed.

Deployment configuration follows the [Vite GitHub Pages guide](https://vite.dev/guide/static-deploy#github-pages). Actual publication requires the workflow and repository Pages settings to be enabled; adding the workflow alone does not publish the game.

## Content and implementation

- `src/content/foundations.ts`: introductory content, examples, and distinctions.
- `src/game/round.ts`: question generation, answer locking, and scoring.
- `src/storage/progress.ts`: validated, versioned local progress.
- `src/App.tsx`: learning and practice flows.
- `PLAN.md`: scope, implementation checklist, and acceptance criteria.

Definitions are introductory and terminology can vary by discipline. The initial content has been checked for internal matching consistency; subject-specialist review and testing with beginner learners remain recommended before treating it as validated teaching material.

## Languages

Use the **English / Eesti** selector in the header to switch languages at any time. Estonian includes all six concepts, definitions, examples, instructions, feedback, and results. The language preference is saved separately from learning progress, and switching language preserves the active round. English is the default. With browser storage unavailable, the choice remains available for the current session.

Interface translations live in `src/i18n.ts`; Estonian card content lives in `src/content/foundations.et.ts`. Keep concept IDs and ordering aligned with the English deck so progress and questions remain shared across languages.
