# Research Cards improvement plan

Created: 11 September 2026. This is the active roadmap; PLAN.md records the original release.

## Purpose and delivery

Help students progress from recognising terminology to explaining, designing, and evaluating research for their own projects. Deliver the work in small, reviewable steps, preserving English/Estonian parity, references, accessibility, existing progress, and independent static hosting. Record changes and checks here after each step. Do not introduce accounts or AI grading by default.

## Ordered steps

1. [x] **Paradigms learning deck** — teach interpretivism, pragmatism, critical/transformative approaches, and postpositivism. Include definitions, examples, distinctions, and ontology/epistemology/axiology connections. Support all existing game modes, citations, and separate progress. Reuse the same content in scenarios.
2. [x] **Resume unfinished work** — persist active learning, matching, placement, and study sessions; retain separate scenario drafts and completions. Restore after refresh and navigation. Opening References must not discard work. Validate stored state and gracefully handle unavailable storage.
3. [x] **Explain your choice** — add guided justification questions after scenario placements, with explanatory feedback and examples. Distinguish recognising a definition from applying it. Keep first-attempt results separate from retries; do not automatically grade unrestricted writing as factually right or wrong.
4. [x] **Evaluate connections together** — check data collection against analysis and evaluation against research questions. Explain context-dependent alternatives rather than treating paradigms as exclusive owners of methods. Test combinations, not only individual slots.
5. [x] **Research quality decisions** — introduce sampling, participant selection, bias, consent/privacy, validity, reliability/trustworthiness, and limitations through short lessons and scenario choices. Source the material and explain disciplinary differences.
6. [x] **Interpret evidence** — add small, explicitly fictional datasets: task times, success rates, errors, interview excerpts. Ask what can be concluded, what cannot, and how findings should inform a prototype revision.
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

### Step 4 — Evaluate connections together

Status: Implemented and verified with automated tests.

Delivered: explicit combination rules for all six scenarios, covering collection/analysis, integration, and computing evaluation against the research question. A bilingual review displays the chosen chain and contextual feedback, including supported alternatives and limits of the evidence. Completion now requires coherent combinations as well as fitting cards. Placement scores remain unchanged; retries preserve correct cards while allowing an individually fitting but conflicting combination to be revised. Existing reflection notes remain separate and ungraded.

Validation: all 39 tests pass; production build and whitespace checks pass. Tests enumerate every supported combination, check mismatches and incomplete chains, cover evaluation goals and conflict retries, and verify bilingual review feedback in computing scenarios. No real-browser visual check or external teaching review was performed. Feedback elaborates the existing teaching briefs and their evidence requirements; rules do not claim universal compatibility or validated assessment.

Next: Step 5, research quality decisions.

### Coverage update — Additional paradigms

Status: Implemented before Step 5, following the requested coverage review.

Delivered: positivism, constructivism (with a social constructivist emphasis), and critical realism bring the paradigm deck to seven cards. All include English/Estonian definitions, philosophical assumptions, comparisons, application examples, and references. Three new computing scenarios apply positivism/postpositivism, constructivism/interpretivism, and critical realism, bringing the total to nine. Explicit combination rules, reflection prompts, saved drafts, and supported alternatives work with the new scenarios. The experiment and mechanism-focused scenarios state where the introductory analysis cards need further analytical work.

Sources checked: the Open University handbook’s Positivism/Post Positivism chapter; Nyein et al. (2020), Beyond positivism, including its comparison and discussion of social constructivism/interpretivism; Bygstad et al. (2016), Identifying Generative Mechanisms through Affordances, publisher metadata and abstract. Scenarios are original teaching examples; sources do not validate their scoring. Critical realism classifications vary across authors, and the deck does not present a universally exhaustive taxonomy.

Validation: all 41 tests pass; production build and whitespace checks pass. Seven-card bilingual learning, reference coverage, new scenario play-throughs in both languages (including alternative paradigms), all accepted combinations, and preservation of original card progress are covered. Obsolete four-card paradigm drafts restart safely. No real-browser visual check or external teaching review was performed.

The next planned step at this point was Step 5, delivered below.


### Step 5 — Research quality decisions

Status: Implemented and verified with automated tests.

Delivered: six bilingual short lessons covering sampling/participant selection, bias/reflexivity, consent/privacy, validity/reliability, qualitative trustworthiness, and limitations. Each of the nine checked scenarios offers an optional quality-practice panel with four decisions, including a tailored issue for that brief. Immediate explanatory feedback, keyboard controls, retries preserving first answers, and separate quality results are included. Answers and panel visibility persist per scenario through navigation and refresh, with in-memory fallback. Scenario restart clears quality practice. Placement scores and completion remain independent.

Sources checked: Baltes & Ralph’s sampling review (arXiv v6, 2021); Open University’s Reliability and validity lesson; W3C guidance on involving users; OHRP informed-consent FAQs; OpenStax experimental design guidance. References appear alongside lessons/feedback and in the bibliography. The U.S. context of OHRP guidance is stated; the practice does not replace local institutional ethics procedures. Decisions are original teaching examples, not a validated assessment instrument.

Validation: all 46 tests pass; production build and whitespace checks pass. Tests cover all nine scenarios in both languages, source coverage, keyboard input, first-answer preservation on retry, storage validation/failure fallback, References plus reload restoration, and clearing quality practice on restart. No real-browser visual check or external teaching review was performed.

Next: Step 6, interpret fictional evidence and its implications for a prototype.


### Step 6 — Interpret fictional evidence

Status: Implemented and verified with automated tests.

Delivered: optional evidence exercises after checking the room finder, accessible planner, and equipment lending trees. Each has eight explicitly fictional task records, two invented participant excerpts, calculated success rates/median successful times/total errors, and three bilingual interpretation decisions. Feedback links observations and excerpts to limitations and a prototype revision requiring retesting. Task criteria and timing rules are stated; failed attempts remain visible, and changing successful subsets and mixed participant roles are discussed where relevant. No inferential test or universal effectiveness claim is implied.

Answers and open panels persist per scenario; retries preserve first answers, References navigation preserves drafts, and scenario restart clears them. Evidence results are independent of tree and quality results. Versioned draft validation restarts obsolete exercise data safely. Sources for methods appear with answer feedback; NIST usability guidance and W3C user-evaluation guidance were checked. Sources are explicitly distinguished from the invented observations.

Validation: all 51 tests pass; production build and whitespace checks pass. Tests verify summary arithmetic (including no-success/empty inputs), record/source consistency, all three exercises in both languages, accessible table structure and keyboard answering, retry/reload/language preservation, version and choice validation, storage-failure memory fallback, and References/reload/restart integration with unchanged placement scores. No real-browser visual check or external teaching review was performed.

Next: Step 7, design and export a study for the learner’s own application problem.
