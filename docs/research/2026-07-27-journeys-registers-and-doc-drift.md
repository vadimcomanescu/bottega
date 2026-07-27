# Journeys as a register, and which documents survive drift

Snapshot: 2026-07-27. The question: bottega's setup drafted a prose critical-journeys doc from the code, one journey per user-visible capability, and maestro's QA phase scoped its drive from that doc. Two things were checked before keeping it. What does the critical-user-journey practice this borrowed from actually produce, and how do teams outside this repo decide what to verify per change? And what happens over time to a prose document that describes code behavior?

Sources, read for what they claim:

- Google SRE Workbook, chapter 2 "Implementing SLOs" ([sre.google/workbook/implementing-slos](https://sre.google/workbook/implementing-slos)), and the Art of SLOs handbook and its worksheets.
- Technical Disclosure Commons defensive publication 3744 ([tdcommons.org/dpubs_series/3744](https://www.tdcommons.org/dpubs_series/3744)).
- Android macrobenchmark documentation (developer.android.com, performance benchmarking).
- Gojko Adzic and David Evans, BDD survey, 2020.
- Binamungu, Embury, and Konstantinou, "Maintaining Behaviour Driven Development Specifications: Challenges and Opportunities", SANER 2018.
- Playwright test annotations ([playwright.dev/docs/test-annotations](https://playwright.dev/docs/test-annotations)) and the Cypress grep plugin.
- ISTQB Foundation syllabus, risk-based testing.
- Microsoft Test Impact Analysis; Nx `affected`; Google's Test Automation Platform as described in _Software Engineering at Google_ chapter 23; Machalica et al., "Predictive Test Selection" (arXiv:1810.05286).
- Checkly and Datadog synthetic monitoring documentation.
- Claude Code best practices ([code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)) and OpenAI's `AGENTS.md` convention for codex.
- Tan et al., an empirical study of outdated code element references in documentation (arXiv:2212.01479, Empirical Software Engineering).
- Lethbridge, Singer, and Forward, "How software engineers use documentation: the state of the practice", IEEE Software, 2003.

## The critical-user-journey practice is an SLO artifact

In the SRE Workbook's SLO chapter and in the Art of SLOs worksheets, a critical user journey is an input to picking service level indicators: the team names the journeys a user cares about, then writes an SLI and an SLO for each, and monitoring alerts on the error budget. The artifact produced is a measurement specification consumed by monitoring, not a document a test suite or a reviewer reads to decide what to check. Nothing in the practice asks for a repository document enumerating journeys.

The one source found that maps critical user journeys onto per-change test scoping is Technical Disclosure Commons publication 3744, a defensive publication. That is a filing made to block a patent, not a validated result: no evaluation, no adoption data. It is the only support the borrowed practice has, and it is weak.

Where a platform does encode journeys durably, it encodes them as code. Android's macrobenchmark documentation has teams write the critical journey as a benchmark that runs the flow on a device and records timing, which is a runnable artifact, versioned with the app.

## Journeys as maintained text is the experiment that already failed

BDD ran this experiment for a decade: the flows a system must not break, written as human-readable text, kept in the repository beside the code. Adzic and Evans's 2020 survey found 12% of respondents keeping their scenarios in feature files, with 57% having moved the material back into issue trackers, and their own summary of the practice was that it "didn't really work out as expected". Binamungu et al. at SANER 2018 interviewed and surveyed practitioners on maintaining those specifications and reported the same failure from the inside: textual specifications are too expensive to maintain long-term, and duplication across scenarios is a leading maintenance problem, because nothing mechanical detects that two scenarios say the same thing or that one no longer matches the code.

The relevant difference from the artifact bottega was drafting is that BDD's text was at least executable through step definitions. A prose inventory is the same document with the execution removed.

## Per-change scope is derived, or tagged in the tests themselves

Four independent lines of practice, none of them a static inventory document:

- **Tags in the test titles.** Playwright's annotations and the Cypress grep plugin both scope a run by tag (`@critical` and the like) written on the test. The name of the critical set lives on the executable check.
- **Risk assessment per iteration.** The ISTQB syllabus's risk-based testing sets test scope by assessing risk for the change at hand, repeated each iteration, rather than by consulting a fixed list.
- **Machine-derived selection.** Microsoft's Test Impact Analysis selects tests from the dependency graph of the change and falls back to running everything when it cannot decide; Nx `affected` derives the impacted projects from the graph; Google's TAP does the same at scale in _Software Engineering at Google_ chapter 23; Meta's predictive test selection (arXiv:1810.05286) goes further and accepts a statistical rate of missed failures as the price of the reduction.
- **Small-N flows kept as code.** Synthetic monitoring vendors converge on monitors-as-code with few critical flows: Checkly's guidance is on the order of two to five, one artifact deployed by one pipeline; Datadog derives candidate journeys from real user monitoring traffic rather than from a written list.

## Agentic practice derives verification from a runnable check

Anthropic's Claude Code best practices tell the agent to verify against something runnable plus the task's own done-condition, and gate what goes into `CLAUDE.md` by "Would removing this cause Claude to make mistakes?", which is a test a descriptive inventory of existing behavior fails. OpenAI's `AGENTS.md` convention scopes the tests an agent runs to the project the change touched, escalating with the blast radius. Both derive scope from the change and a command, not from a maintained list of flows.

## Prose that describes code rots, and structurally

Tan et al. (arXiv:2212.01479) studied outdated code element references in documentation across a large repository corpus and found 28.9% of repositories carrying at least one, many stale for years. The failure is silent: nothing tells a reader the document has stopped matching, so the document keeps being read after it stops being true. Lethbridge et al. (IEEE Software, 2003) reported the same behavior from practitioners twenty years earlier, with one exception: testing documentation was updated, because it was executed. That study is old and its sample small, so it corroborates the recent work rather than carrying the finding.

Sorted by what resists drift structurally, only two categories hold: an executable artifact, because a mismatch fails a run, and an append-only record like an ADR, because it is a dated statement about the past that nothing later invalidates. A living prose description of current behavior is the worst class in the set.

## What bottega concluded

The critical-journeys doc was cut, not improved. Its replacement is a register that runs: the repo's end-to-end suite with its must-not-break flows tagged, which is where Playwright, Cypress, and the synthetic-monitoring tools already put that name. `bottega:setup` now verifies that coverage exists and drafts the missing end-to-end specs where a user-facing surface has none, or files one issue naming the uncovered flows where the harness cannot run the suite. A run's QA scope is derived per run, in the way the machine-selection tools derive theirs, from the agreed spec's behaviors, the diff, and that tagged suite. The decision is `docs/adr/0026-risk-scaled-phases-and-driven-slices.md`; it supersedes the adoption item recorded in `docs/adr/0012-harness-engineering-adoption.md`.
