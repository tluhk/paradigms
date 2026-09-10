# Research Cards — planning and execution document

Status: First implementation complete; automated checks pass. Browser visual checks, learner review, and publication are pending.  
Date: 10 September 2026  
Working title: Research Cards

## 1. Purpose

Build a small web-based card game that helps beginners understand research terminology. The first release teaches six foundational concepts through readable flashcards and definition-matching practice.

Success means a learner can distinguish the six concepts and match each to its meaning without relying on answer position or wording tricks.

## 2. First-release scope

Include:

- One Foundations deck: ontology, epistemology, axiology, research paradigm, methodology, and method.
- Learn mode: reveal definitions, guiding questions, examples, and distinctions.
- Practise mode: select the correct definition from three options.
- Immediate explanatory feedback and an explicit Continue button.
- Six-question initial rounds, followed by optional practice of missed cards.
- A round summary and progress saved on the current device.
- Responsive layout, keyboard operation, and accessible feedback.

Defer additional decks, research scenarios, accounts, cloud synchronisation, leaderboards, timers, lives, AI-generated feedback, and formal spaced-repetition scheduling. A later release can introduce these after the basic learning experience has been tested.

## 3. Learning content

Use the following as the initial editorial draft. Before release, review the content for clarity and disciplinary differences. Present definitions as introductory explanations, not universal classifications.

| Concept | Plain-language definition | Guiding question | Example |
| --- | --- | --- | --- |
| Ontology | Assumptions about what exists and the nature of reality. | What is reality like? | A researcher considers whether student belonging is a single measurable reality or something experienced differently across contexts. |
| Epistemology | Assumptions about knowledge, what counts as knowing, and how knowledge can be developed. | How can we know about it? | A researcher considers what test scores or students’ accounts can tell us about learning. |
| Axiology | The role of values in research, including how they influence its aims, conduct, and interpretation. | How do values shape the research? | A researcher explains how a commitment to inclusion influenced the choice of research question and whose perspectives are included. |
| Research paradigm | A broad set of assumptions and commitments that guides how research is understood and conducted. | What worldview guides this study? | A researcher adopts an interpretivist paradigm to understand how students make meaning of their experiences. |
| Methodology | The reasoning and overall approach that guide the design of a study and the choice and use of methods. | Why is this approach appropriate? | A researcher explains why an ethnographic approach suits a study of everyday classroom culture. |
| Method | A specific technique or procedure used to collect or analyse research material. | How will evidence be collected or analysed? | A researcher conducts interviews or uses statistical analysis. |

Every card must also include a short distinction:

- Ontology concerns reality; epistemology concerns knowledge of it.
- Epistemology informs what counts as evidence; a method specifies a procedure for gathering or analysing it.
- Axiology includes the influence of values throughout research, beyond formal ethics approval.
- A paradigm brings together broad assumptions; a methodology explains a study’s approach.
- Methodology explains the approach and its rationale; methods are the techniques used.
- A method does not automatically belong to a single paradigm.

Content rules:

- Use familiar language, explaining any unavoidable technical term.
- Make answer options similar in length and grammatical form.
- Avoid distractors that could reasonably define the target concept.
- Give examples as illustrations, not rigid rules about which methods a paradigm permits.
- Do not imply that quantitative and qualitative approaches each map to exactly one worldview.
- Keep a record of content review and any references used before publication.

## 4. User experience

### Start screen

Show the game name, a one-sentence purpose, and a Foundations deck card labelled “6 concepts.” Offer Learn and Practise buttons. Display a small saved-progress summary when available.

Suggested introduction: “Explore six ideas that shape research, then practise matching them to their meanings.”

### Learn mode

1. Show the concept name and position, such as “Card 2 of 6.”
2. Let the learner select “Show explanation.”
3. Reveal the definition, guiding question, example, and distinction.
4. Provide Previous and Next controls, plus a route back to the start.
5. After the last card, offer “Practise this deck.”

Treat revealing a card as viewing it, not evidence that the learner understands it. Animation is optional; support reduced motion.

### Practise mode

1. Shuffle the six concepts at the start of a round.
2. Show one concept and three definition cards: one correct answer and two definitions from other concepts.
3. Shuffle option positions and keep them stable until the learner continues.
4. On selection, lock the answer and show whether it was correct.
5. Reveal the correct definition and a short explanation. For an incorrect choice, name the concept that the selected definition actually describes.
6. Wait for Continue before moving on.
7. After all six concepts, show the first-attempt result and offer “Practise missed cards,” “New round,” and “Back to learning.”

A retry pass asks each missed concept once. If any remain incorrect, offer another retry pass. Never force an endless loop. If all initial answers were correct, omit the missed-card action.

Draw distractors from the full deck even when the retry pass contains only one concept. Preserve the original first-attempt result separately from retry outcomes.

### Feedback and progress

- Use encouraging, neutral language: “That definition describes ontology. Epistemology asks how we can know.”
- Do not use colour alone to communicate results.
- Show concrete measures such as “4 of 6 correct on your first attempt.”
- Track cards viewed, attempts, correct answers, and latest result per concept.
- Avoid claiming mastery based on a single correct answer.
- Provide Reset progress with confirmation because it deletes saved learning history.

## 5. Technical proposal

Implemented with React, TypeScript, and Vite, with plain CSS and no backend. GitHub Pages is the selected hosting target.

Use a static application so the first release is easy to run and deploy. Keep learning content separate from UI components and game logic so additional decks can be added without rewriting the gameplay.

Suggested structure:

```text
src/
  content/foundations.ts
  components/ConceptCard.tsx
  components/AnswerCard.tsx
  screens/Home.tsx
  screens/Learn.tsx
  screens/Practise.tsx
  screens/Summary.tsx
  game/round.ts
  storage/progress.ts
  types.ts
  App.tsx
  styles.css
```

Concept records contain a stable ID, deck ID, term, definition, guiding question, example, and distinction. Question options reference concept IDs; determine correctness by ID rather than array position or displayed text.

Round state contains the ordered concept IDs, current question index, stable option IDs, submitted answer, initial results, and retry results. Keep round state in memory; refreshing starts a new round but retains recorded progress.

Persist versioned progress in localStorage. Validate stored data when loading. Missing, malformed, or unavailable storage must not prevent play; fall back to in-memory progress. Save each submitted answer once, and prevent repeated clicks from recording duplicate attempts. Explain that progress is saved only in this browser and can disappear if browser data is cleared.

No login, personal information, external analytics, or paid service is required for this version.

## 6. Visual and accessibility direction

- Calm, readable learning interface with a restrained accent colour and clear card boundaries.
- One main task visible at a time, with comfortable spacing and short text blocks.
- On small screens, stack definition choices vertically; allow longer content to flow without clipping.
- Use semantic buttons, visible focus indicators, and logical keyboard order.
- Announce answer feedback to assistive technology and move focus predictably when advancing questions.
- Ensure text contrast meets WCAG AA requirements and controls have comfortable touch targets.
- Respect reduced-motion settings and avoid essential information available only on hover.

## 7. Execution checklist

### Phase 1 — Finalise content

- [x] Review the six definitions, examples, and distinctions.
- [x] Check that every concept has a unique and unambiguous matching definition.
- [x] Review possible distractor combinations for ambiguity.
- [x] Add a short note that research terminology can vary by discipline.

Deliverable: A reviewed Foundations content module.

### Phase 2 — Build the learning flow

- [x] Initialise the application and document local setup commands.
- [x] Implement the start screen and shared visual styles.
- [x] Implement card reveal, navigation, and the transition to practice.
- [ ] Verify small-screen layout and keyboard navigation.

Deliverable: A complete six-card Learn mode.

### Phase 3 — Build practice and feedback

- [x] Implement shuffled rounds and three distinct options per question.
- [x] Implement answer locking, explanatory feedback, and Continue.
- [x] Implement the summary and optional missed-card passes.
- [x] Keep initial scores separate from retries.

Deliverable: A complete practice round with retries.

### Phase 4 — Save progress and polish

- [x] Implement versioned storage, validation, and graceful fallback.
- [x] Add progress summaries and reset confirmation.
- [ ] Check feedback announcements, focus, contrast, and reduced motion.
- [ ] Check empty retry queues, repeated clicks, refreshes, and long content.

Deliverable: A usable first release candidate.

### Phase 5 — Verify and prepare release

- [x] Run type checking and the production build.
- [x] Test round generation: six unique concepts, three unique options, exactly one correct answer.
- [x] Test that submissions count once and retry scores cannot overwrite initial scores.
- [x] Test storage recovery for missing, malformed, and unavailable data.
- [ ] Manually complete Learn, Practise, missed-card practice, and reset flows.
- [ ] Verify at narrow mobile and desktop widths, with keyboard-only interaction and a screen-reader spot check.
- [ ] Ask a small group of beginners to try the game and explain the concepts in their own words.
- [ ] Resolve ambiguous content and usability blockers.
- [x] Document the deployment procedure once the hosting target is selected.

Deliverable: GitHub Pages workflow and deployment instructions are implemented. Expected URL: https://tluhk.github.io/paradigms/. Publication and manual browser verification remain pending.

## 8. Acceptance criteria

The first version is complete when:

1. All six concepts are available with a definition, question, example, and distinction.
2. A learner can finish Learn mode and start Practise without creating an account.
3. Each initial practice round presents every concept exactly once.
4. Each question has three distinct options and exactly one correct answer.
5. Selecting an answer produces clear feedback and cannot record multiple submissions.
6. The summary reports the initial score accurately and supports optional missed-card practice.
7. Progress survives reloads when storage is available; the game still works when it is not.
8. All primary actions work by keyboard and the mobile layout has no horizontal overflow.
9. Build, type checks, and focused game-logic tests pass.
10. Content review and manual verification are recorded, with no unresolved ambiguity in matching answers.

## 9. Later expansion

After validating the Foundations deck, add decks for research paradigms, approaches, methodologies and designs, and methods and techniques. Review category labels carefully because disciplinary conventions differ.

Next learning improvements could include reverse matching, alternative definition wording, and short example cards. These would test understanding beyond memorising the original definitions. Add scheduled revision and research-design scenarios only after the core card experience is working well.

## 10. Implementation verification — 10 September 2026

- Eight automated tests pass, including complete Learn and Practise flows in a simulated DOM, duplicate-answer protection, single-card retries, preserved initial scores, reset confirmation, and storage recovery.
- TypeScript checking and the production build pass.
- Dependency installation reports zero known vulnerabilities after updating the test runner.
- Production assets use relative paths for GitHub Pages repository hosting.
- Browser inspection was attempted but blocked by missing macOS Computer Use permissions. Responsive CSS and accessibility semantics are implemented; visual, keyboard-only, and screen-reader verification remain pending.
- The introductory content was reviewed for internal consistency during implementation. No independent subject-specialist or beginner review has been completed.
- GitHub Pages settings have not been changed and the site has not been published. See README.md for activation steps.
