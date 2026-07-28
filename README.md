# bottega

Autonomous issue-to-PR runs, orchestrated from Claude Code with Claude workers and GPT cross-reads of finished work.

`/bottega:maestro` takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request; code-review, improve, panel, setup, calibrate, and bro are also available on their own.

## Install

Install from the Bottega marketplace in Claude Code:

```text
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

Start a run with `/bottega:maestro <task, or issue URL>`.

## Commands

| Skill | Command | What it does |
| --- | --- | --- |
| maestro | `/bottega:maestro <task, or issue URL>` | The whole run: discovery, design, a codex second opinion, build, review, QA, and a PR ready to merge |
| improve | `/bottega:improve [area or direction]` | Scan for deepening opportunities, agree the strongest candidate, file it, and take it through a run |
| code-review | `/bottega:code-review <PR, ref range, or worktree>` | Review the working diff, a ref range, or a PR through the vendored review gate |
| panel | `/bottega:panel <the decision>` | Produce independent drafts from different companies' models and a compare-only judgment |
| setup | `/bottega:setup` | Reconcile the project and register the harness once per repo |
| calibrate | `/bottega:calibrate <repo root, or one doc>` | Audit agent docs against the Claude 5 calibration bar and propose the cuts |
| bro | `/bottega:bro` | Restate the last reply in plain language, no jargon |

During a run, maestro also uses the open, discover, implementing, code-review, QA, and close skills, and `bottega:panel` for a costly open decision; code-review is the one users also run directly, and its skill file is the vendored autoreview document itself, the engine every review runs on.

## What it does

`/bottega:maestro` turns the current harness session into an orchestrator that:

1. Settles how the PR lands (merge itself on green, or hold for the user), confirms it is running on the orchestrator model, and opens the run in its own worktree and branch, reading the project's commands from the repo's agent map.
2. Discovers with the user: it sweeps the affected code, prior art, the installed versions' own docs, and the runtime's agent skills, then runs the moves the situation calls for, a blind spot pass, brainstorms and prototypes, interviews where every question carries its explanation, references, until the direction is chosen and every open decision is answered. What discovery produces (approved prototypes, decisions, references) stays with the run while it builds: briefs point at it, QA judges against it, and none of it merges.
3. Designs before building, and keeps every important decision its own: the domain model, the boundaries, acceptance criteria that are measurable (a criterion that can be enforced becomes a test), and vertical slices subagents can build independently, in parallel where the work allows. A decision that is open, costly to reverse, and settled by no cheap check goes to a panel of different companies' models.
4. Puts the settled picture to a codex second opinion, held to one bar: revise only where a strong maintainer, seeing both the current plan and the proposed change, would clearly agree the revision is necessary or materially better; otherwise the plan is ready.
5. Fans out one builder per slice, each autonomous in its own worktree under the implementation doctrine, asking back on real blockers. Every finished slice gets a fresh reviewer for bugs, architecture, and code quality; the builder fixes accepted findings, and the orchestrator integrates with the full suite green at every step.
6. Reviews the whole integrated diff through the vendored review skill: two isolated engines, one Claude and one GPT, isolated from the builders and judging against the repository's own review doctrine. The orchestrator verifies every finding, dispatches accepted fixes to fresh builders, and the review reruns until nothing blocking remains.
7. Drives every visible product surface the work touched through QA workers, the way a user would, triages what comes back, dispatches fixers, and loops the drive on failed scenarios until every scenario passes with recorded evidence.
8. Closes: files followups, opens the PR with a plain story of what happened for a reader who was not in the run, links the QA evidence, holds or arms it per the launch answer, watches the checks and routes a red the diff caused back to a builder, and ends with the PR merged, ready, held, or waiting on what only a person can clear.

The user takes part in two places: discovery, and the launch answer (land on green, or hold) when the request does not carry it. What survives the run beyond the code: enforceable acceptance criteria as tests, decisions meeting the decision-record bar as ADRs, operating facts in the agent map, and everything else in the PR body.

## Requirements

- Claude Code running the orchestrator model the maestro skill names.
- Git, Node.js, and the [GitHub CLI](https://cli.github.com/).
- The codex CLI, logged in, for the GPT cross-reads; without it fresh Claude workers take those reads and the run records the gap.

Nothing else is assumed about the project. A run leaves nothing behind but the PR, what it distilled into the repo (tests, decision records, agent map facts), and the permanent branch holding QA evidence: working state is the worktree and two gitignored files, the owner file and the release answer, all removed at delivery.

## How workers run

Claude workers are ordinary subagents, each naming its model. The GPT cross-reads run as plain `codex exec` calls ([`skills/using-codex`](skills/using-codex/SKILL.md)) that the orchestrator drives from its own turn as tracked background Bash, so every worker holds a visible row for its whole run and its completion re-invokes the orchestrator. Long builds are covered by raising the shell timeout ceiling in settings (`bottega:setup`) and by resuming a cut-short thread; a subagent never holds one of these calls, because it backgrounds it and returns a stub ([`docs/lessons/no-subagent-holds-a-long-dispatch.md`](docs/lessons/no-subagent-holds-a-long-dispatch.md)). A run whose machine lacks the codex CLI or its login runs those reads on fresh Claude workers instead, and the PR records the gap.

## Design decisions

**No engine.** This repo is Markdown skills, one small guard, and GitHub scripts. There is no scheduler, queue, or state machine; orchestration uses the harness's visible subagents, workflows, and tracked background work. Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**GPT cross-reads finished work; the panel is the one other place it sits.** GPT holds two reads: the second opinion on the settled design and plan before building, and the review's second engine; the panel's codex seat stands beside them because model diversity on one costly decision is the panel's whole point. Claude does every other job in a run: the sweep, the prototypes, the building, the QA drive. The integrated diff is reviewed through one panel invocation of the vendored review skill: two engines, one Claude and one GPT, each reading the same frozen bundle in an isolated sandbox, isolated from the builders and from each other, their prompt never carrying the run's design decisions; they judge against the repository's own review doctrine and the standards baseline. When the codex CLI is unavailable, fresh Claude workers take the GPT reads and the PR records the gap. The orchestrator verifies every finding against the real code path, dispatches the accepted ones to a fresh builder, and the reviewer reruns with a single engine until no blocker remains, under the vendored contract's own pause-and-reclassify rule ([`skills/code-review/SKILL.md`](skills/code-review/SKILL.md)). Why: a builder cannot certify the design it implemented, and the orchestrator should not be the sole verifier of the design it authored.

**Model choices are enforced, not suggested.** Every dispatch names its worker's model on the call, and the models are named in the sentences that dispatch them: the orchestrator and its workers in [`skills/maestro`](skills/maestro/SKILL.md), the panel's seats in [`skills/panel`](skills/panel/SKILL.md), the review engines in the vendored engine document. The route guard rejects a live run owner's subagent or workflow dispatch when it names no model, rejects fable as a worker, and fails open when it cannot identify that owner; a GPT worker the orchestrator shells out to from its own turn is outside what the guard reads, and re-scoping it is [an open followup](https://github.com/vadimcomanescu/bottega/issues/116). Why: an omitted model can silently inherit the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this guard existed.

**The agreement lives in the conversation and ships as code.** Discovery's prototypes and decisions stay with the run while it builds and never merge; what must outlive the run lands where it is enforced or read: an enforceable acceptance criterion becomes a test, a decision meeting the decision-record bar becomes an ADR in the host repo's decision home, an operating fact a worker had to dig for goes to the agent map, and the PR body carries the rest of the story. A tracker issue is the user's own task tracking: handed to a run it is task input, never an agreement.

**QA owns the product drive.** Builders prove their slice through code and tests, and per-slice reviewers read each slice before it integrates. Only after the orchestrator accepts the reviewed head does QA drive it: fresh workers through every visible product surface the work touched, the way a user would, recording the verdict; QA never edits product code. Every drive reports its divergences in one batch, including defects found outside the scenarios it was given, so one repair cycle clears the set, and the drive loops on failed scenarios until every scenario passes. Evidence is read from the PR, never in local folders: each scenario's walkthrough gif plays in the browser from its blob page in the private evidence repository, one click from the PR body, with the full recording linked beside it (`docs/adr/0009-qa-evidence-repository.md`).

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the run's PR reaches ready only after the integrated review, QA, and the project's checks are green on the exact head being delivered. Why: verification is the run's, authorization is the user's, and the user exercises it at launch: land on green, or hold (`docs/adr/0028-the-launch-decides-the-release.md`). Where the project's own merging procedure makes arming the opener's act, the run arms the PR it opens and green lands it; where the project arms its own or nothing arms it, the run arms nothing and reports what lands it. A held PR carries the `hold` label and waits for the user to remove it; the run itself never merges by hand and never approves. Any further requirement only a person can clear, a required review or a label, is reported the same way, the PR left open (`docs/adr/0017-close-respects-human-gates.md`).

## Roles

Skills define the reusable methods and independently invoked capabilities. References hold phase-specific detail for one parent skill. Hooks, schemas, tests, and workflow code enforce deterministic rules. Worker models are named where the dispatch happens, so role definitions carry no model of their own.

| Role | Job | Method |
| --- | --- | --- |
| orchestrator | design, model choices, review arbitration, architecture acceptance | [`skills/maestro/SKILL.md`](skills/maestro/SKILL.md) |
| builder | builds one dispatched job (a slice or a repair), test-first, inside the orchestrator's fixed architecture | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| review panel | hunts defects in the integrated diff, isolated from the builders, its prompt never carrying the run's design decisions | [`skills/code-review/SKILL.md`](skills/code-review/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence, never edits product code | [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| panel seats and judge | produce independent drafts and compare them without writing the final answer | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| closer | confirms the accepted head, opens the PR (labeled hold when the launch said hold), watches checks, and reports it merged, ready, or waiting on what only a person can clear | [`skills/close/SKILL.md`](skills/close/SKILL.md) |

[`skills/codebase-design`](skills/codebase-design/SKILL.md) is shared by the roles that make and judge architecture: the orchestrator uses it to model the domain and fix the design. Builders receive that design and the glossary as fixed input in their briefs.

## Repo layout

```
skills/           the canonical methods and orchestration entry points
.agents/          in-repo skill discovery links
.claude-plugin/   Claude Code packaging
hooks/            one route guard and its registration
scripts/          single assembly points for codex launches and GitHub mutations
tests/            the verification gate's suites
docs/adr/         append-only decision records
docs/lessons/     failure records: what happened, the rule, where it is enforced
```

## Development

```bash
npm install
npm test        # vitest suites plus the vendored autoreview Python suites (needs python3 and git on PATH)
```

Changes to this repo are authored directly with the owner and delivered by a PR that lands itself once its required checks are green; `/bottega:maestro` runs the changes to what the software does (hooks, scripts, schemas, workflows). The procedure, including releases, is in `AGENTS.md` under "Developing bottega".

## Credits

### Copied into this repo

These files are other people's work. The scripts and suites are used unchanged; the review document carries local edits recorded in [`THIRD_PARTY.md`](THIRD_PARTY.md). Each copy carries its upstream license file:

- the vendored autoreview engine in `skills/code-review/` (`SKILL.md`, `scripts/`, `tests/`) from [openclaw/agent-skills](https://github.com/openclaw/agent-skills), under `skills/code-review/LICENSE` (MIT, Copyright (c) 2026 openclaw).
- `skills/codebase-design/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md` from [mattpocock/skills](https://github.com/mattpocock/skills), under `skills/codebase-design/references/LICENSE` (MIT, Copyright (c) 2026 Matt Pocock).

Edit any of them upstream, not here. Bringing in a newer version means copying it again and reading the diff. [`THIRD_PARTY.md`](THIRD_PARTY.md) carries each one's pinned revision, local scoping, and sync procedure.

### Drawn on, not copied

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's reuse-before-build order and root-cause repair rule come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and the mocking doctrine draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading and the repair's reproduce-first test draw from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The codex dispatch mechanics (the brief through a prompt file, resume by explicit session id, the log-freshness liveness read) draw from [Peter Steinberger's agent scripts](https://github.com/steipete/agent-scripts). The review gate is openclaw's autoreview itself, vendored and locally adapted: its document is the method, its helper runs the engines, and the run's rules are woven into it as in-a-run conditionals. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, which stays with the session that ran the panel, because that session holds the context the judge never sees.

## License

MIT
