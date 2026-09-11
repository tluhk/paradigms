# Research Cards improvement plan

Created: 11 September 2026. This is the active roadmap; PLAN.md records the original release.

## Purpose and delivery

Help students progress from recognising terminology to explaining, designing, and evaluating research for their own projects. Deliver the work in small, reviewable steps, preserving English/Estonian parity, references, accessibility, existing progress, and independent static hosting. Record changes and checks here after each step. Do not introduce accounts or AI grading by default.

## Ordered steps

1. [x] **Paradigms learning deck** — teach interpretivism, pragmatism, critical/transformative approaches, and postpositivism. Include definitions, examples, distinctions, and ontology/epistemology/axiology connections. Support all existing game modes, citations, and separate progress. Reuse the same content in scenarios.
2. [x] **Resume unfinished work** — persist active learning, matching, placement, and study sessions; retain separate scenario drafts and completions. Restore after refresh and navigation. Opening References must not discard work. Validate stored state and gracefully handle unavailable storage.
3. [x] **Explain your choice** — add guided justification questions after scenario placements, with explanatory feedback and examples. Distinguish recognising a definition from applying it. Keep first-attempt results separate from retries; do not automatically grade unrestricted writing as factually right or wrong.
4. [ ] **Evaluate connections together** — check data collection against analysis and evaluation against research questions. Explain context-dependent alternatives rather than treating paradigms as exclusive owners of methods. Test combinations, not only individual slots.
5. [ ] **Research quality decisions** — introduce sampling, participant selection, bias, consent/privacy, validity, reliability/trustworthiness, and limitations through short lessons and scenario choices. Source the material and explain disciplinary differences.
6. [ ] **Interpret evidence** — add small, explicitly fictional datasets: task times, success rates, errors, interview excerpts. Ask what can be concluded, what cannot, and how findings should inform a prototype revision.
7. [ ] **Design my own study** — support an application problem, research question, justified paradigm/methodology/methods, participants, evaluation criteria, and limitations. Save drafts; export a readable one-page research plan with references. Clearly distinguish building an artifact from producing research knowledge.
8. [ ] **Useful progress overview** — show viewed, practised, and completed separately; record scenario completion and suggest concepts to revisit without claiming validated mastery. Provide a clear reset/export experience.
9. [ ] **Interaction and reading polish** — move placed cards between slots; compact source disclosures without destabilising cards; direct navigation to concepts/scenarios and helpful browser history. Check long translations and small screens.
10. [ ] **Browser and teaching validation** — exercise real desktop/mobile browsers, trackpad dragging, keyboard navigation, reduced motion, and sticky trays. Conduct accessibility checks and learner observation. Arrange research-methods lecturer review of concepts and scoring; this requires external participants and must not be reported complete from automated tests alone.

## Completion checks for each implementation step

- Relevant behaviour tests pass, including English/Estonian and storage compatibility when affected.
- Production build and whitespace checks pass.
- Documentation describes the actual implementation and its limits.
- Browser checks are recorded separately from simulated DOM tests.
- Sources support educational claims; fictional scenarios are labelled as examples.

## Execution log

### Step 1 — Paradigms learning deck

Status: Implemented and verified with automated tests.

Delivered: four bilingual cards with philosophical assumptions, a fourth deck using existing learning/practice/placement flows, scenario content reuse, and postpositivism references. Existing deck IDs and saved progress keys remain stable.


Validation: all 27 tests pass; production build and whitespace checks pass. Tests cover the four-card learning flow, bilingual assumptions and references, separate saved progress, and matching/placement through the shared deck tests. Existing education and computing scenarios still pass. No real-browser visual check or external teaching review was performed for this step.

### Step 2 — Resume unfinished work

Status: Implemented and verified with automated tests.

Delivered: versioned, validated browser session storage; learning position and flip state; matching answers and round order; placement boards, checked results, and retry state; separate study drafts and persistent completion marks. References returns to the previous activity, including after refresh. Drafts remain in memory during navigation when browser storage is unavailable. Deck reset clears that deck’s activities; scenario restart clears its draft while retaining completion.

Validation: all 32 tests pass; production build and whitespace checks pass. New tests cover References/reload restoration, partial and checked placement boards without duplicate progress, separate scenario drafts and completion, unavailable storage, and corrupt/obsolete drafts. The existing bilingual matching test now checks restored feedback without another recorded attempt. No real-browser interaction check was performed for this step.

### Step 3 — Explain your choice

Status: Implemented and verified with automated tests.

Delivered: optional guided reflections for each editable connection after checking a scenario. Bilingual prompts ask learners to connect their choices to the research question and consider limitations or alternatives. Learners can compare their explanation with existing scenario feedback and an example of a fitting connection, then revise it. Reflections are ungraded and do not affect first-attempt scores or card-placement completion. Notes and comparison visibility persist by scenario, slot, and choice; scenario restart clears its reflections.

Validation: all 35 tests pass; production build and whitespace checks pass. Tests cover bilingual saved reflections, corrective comparisons, choice-specific drafts, unchanged placement scores, and clearing notes on restart. Existing six-scenario and retry tests pass. No real-browser visual check or external teaching review was performed. Examples reuse the existing sourced scenario reasoning; the prompts are teaching scaffolds, not a validated assessment rubric.

Next: Step 4, evaluate connections together.
