# bottega

Autonomous issue-to-PR runs, orchestrated from Claude Code with Claude and GPT workers.

`/bottega:maestro` takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request; guru, spec, code-review, improve, panel, and setup are also available on their own.

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
| maestro | `/bottega:maestro <task, or issue URL>` | The whole pipeline: discovery, spec, plan, build, review, QA, and a PR ready to merge |
| guru | `/bottega:guru <task, or issue URL>` | The run as one goal statement: a live run contract and failing tests carry the agreement, and no spec or plan file merges |
| spec | `/bottega:spec <task, issue URL, or direction>` | Run discovery, agree the spec, and commit it on a work branch a later run continues |
| improve | `/bottega:improve [area or direction]` | Scan for deepening opportunities, agree the strongest candidate, file it, and take it through a run |
| code-review | `/bottega:code-review <PR, ref range, or worktree>` | Review the working diff, a ref range, or a PR through the vendored review gate |
| panel | `/bottega:panel <the decision>` | Produce independent drafts from different companies' models and a compare-only judgment |
| setup | `/bottega:setup` | Reconcile the project and register the harness once per repo |
| calibrate | `/bottega:calibrate <repo root, or one doc>` | Audit agent docs against the Claude 5 calibration bar and propose the cuts |
| bro | `/bottega:bro` | Restate the last reply in plain language, no jargon |

Maestro and spec run the same front of the method: discovery finds and settles the unknowns ([`skills/discover`](skills/discover/SKILL.md)), then the spec is written from those findings, presented, and committed ([`skills/spec`](skills/spec/SKILL.md)). Each is defined once and used whole from either entry point. Maestro carries it through to a ready PR; spec stops at an agreed spec file committed on a work branch that any later `/bottega:maestro` continues. The spec is that file; an issue is never a spec. During a run, maestro also uses the open, plan, build, implementing, code-review, QA, and close skills; code-review is the one users also run directly, and the vendored autoreview document under it is the engine every review runs on.

Guru ([`skills/guru`](skills/guru/SKILL.md)) runs the same delivery bar as one standalone prompt: the repo's own map and glossary read first, then cheap sweeps outward for how others solved this and what the installed versions actually do, unknowns found and settled, a run contract on the branch in place of the committed spec and plan, builders fanned out with the implementation doctrine in their brief, a critic drive per user-facing slice, and a looped final review by a Claude and a codex critic. Beyond `bottega:panel` for a costly decision it uses no other skill, it names its workers' models where it dispatches them, and the contract is deleted before the PR opens, once the PR body carries its decisions (`docs/adr/0026-guru-one-goal-entry-point.md`).

## What it does

`/bottega:maestro` turns the current harness session into an orchestrator that:

1. Explores first: the codebase and domain glossary, the standard solutions in use outside it, and the installed technology skills for the runtime. It then runs the moves the situation calls for, a blind spot pass, brainstorms and prototypes, interviews with the user, references, until the direction is chosen and every open decision is answered. The steps below run where an unknown is still open or a wrong call would be costly to reverse: work discovery leaves settled and cheap to reverse is delivered with no spec and no plan, and small work whose mistakes are expensive gets a paragraph of fixed decisions instead of both documents.
2. Opens the run in its own worktree and branch, and reads the project's commands (test, lint, format, typecheck, build, run) from the repo's agent map, writing them there first when missing.
3. Writes the spec from what discovery settled and presents it as a live shared document, following the [shared spec format](skills/spec/references/spec-format.md): the user reads it rendered on any device and reviews it in comment threads, with the agent replying in-thread and making agreed changes as tracked edits. A user who declines the hosted editor gets the same review in the conversation. The user's OK, as a reply or a document comment, is the go signal; when the user says to run autonomously, the wait is skipped and the PR presents the spec and every decision where the OK would have gone. The approved spec is committed to `docs/specs/` on the run branch, so it merges with the code it describes.
4. Models the domain, writes the plan as a file committed on the run branch, cuts vertical slices inside it, and settles each costly decision (where behavior or state belongs, data shape, public contracts, dependency bets) before building: a panel when the choice is open and no cheap check settles it, a spike or benchmark when one can, the plan recording how each was settled. A fresh GPT editor then reads the spec, the plan, and the repository cold and approves the plan or rewrites it whole; the orchestrator takes the changes it accepts and commits, and each slice's status is committed into the plan as slices land.
5. Dispatches builders with one assigned slice, the fixed architecture, the glossary, and relevant technology skills. Builders work test-first and stop at the slice boundary; the project's gates stay green at every integrate. A slice that changes a user-facing surface is driven through the real interface by a fresh worker as soon as it lands on the run branch, on the integrated state so far.
6. Checks that every changed user-facing surface updated its docs inside its slice, then reviews the integrated diff through the vendored autoreview document: one panel invocation, two isolated engines, one Claude and one GPT, isolated from the builders, their prompt never carrying the spec or the plan, judging against the repository's own review doctrine. A separate fresh GPT worker checks the diff against the agreed spec, quoting the line each finding rests on. The orchestrator verifies every finding, dispatches the accepted ones to a fresh builder, and the reviewer reruns with a single engine until nothing blocking remains.
7. Sends a separate QA worker through that exact head and records the product verdict. QA drives every changed scenario and returns its divergences in one report, including any defect it crosses outside those scenarios. The orchestrator classifies each failure as environment, implementation, or design before routing a repair; every product change gets fresh review, orchestrator acceptance, and QA.
8. Opens the PR carrying the spec (a run delivered without one states the scope and the decisions it fixed instead), every decision made on the user's behalf, the review verdicts, the orchestrator's architecture acceptance, and the QA evidence; a run the user held at launch opens it carrying the `hold` label. The closing step changes no tracked file, so the PR publishes the accepted reviewed head. It then watches every check to completion and reports the outcome: merged, when the project's own auto-merge lands it during the watch; ready, when the PR waits on what lands it; or the requirement no code change satisfies, such as a required human review or a label only a person adds, named to the user with the PR left open.

The user takes part in three places: discovery, the launch answer (land on green, or hold) when the request does not carry it, and agreeing the spec.

## Requirements

- Claude Code running the orchestrator model the maestro skill names.
- Git, Node.js, and the [GitHub CLI](https://cli.github.com/).
- The codex CLI, logged in: the integrated review always runs both Claude and GPT.

Nothing else is assumed about the project. A run leaves nothing behind but the PR, the spec and plan a full-flow run commits to `docs/specs/` and `docs/plans/`, and the permanent branch holding QA evidence: working state is the worktree and two gitignored files, the owner file and the release answer, all removed at delivery.

## How workers run

Claude workers are ordinary subagents, each naming its model and effort. GPT workers run as plain `codex exec` calls ([the codex dispatch method](skills/maestro/references/codex-dispatch.md)) that the orchestrator drives from its own turn as tracked background Bash, so every worker holds a visible row for its whole run and its completion re-invokes the orchestrator. Long builds are covered by raising the shell timeout ceiling in settings (`bottega:setup`) and by resuming a cut-short thread; a subagent never holds one of these calls, because it backgrounds it and returns a stub ([`docs/lessons/no-subagent-holds-a-long-dispatch.md`](docs/lessons/no-subagent-holds-a-long-dispatch.md)). A cloud run whose VM lacks the codex CLI or its login stops at the first GPT worker the run needs and reports what is missing; neither the plan's cold read nor the integrated review is waived around it.

## Design decisions

**No engine.** This repo is Markdown skills, one small guard, and GitHub scripts. There is no scheduler, queue, or state machine; orchestration uses the harness's visible subagents, workflows, and tracked background work. Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Claude and GPT both review, always.** The integrated diff is reviewed through one panel invocation of the vendored autoreview document: two engines, one Claude and one GPT, each reading the same frozen bundle in an isolated sandbox, isolated from the builders and from each other, their prompt never carrying the spec or the plan; they judge against the repository's own review doctrine and the standards baseline. Spec conformance is a separate pass: one fresh GPT worker reads the diff against the agreed spec and quotes the line each finding rests on; neither pass sees the other's findings. The orchestrator verifies every finding against the real code path, dispatches the accepted ones to a fresh builder, and the reviewer reruns with a single engine until no blocker remains, under the vendored contract's own pause-and-reclassify rule ([`skills/code-review/references/autoreview.md`](skills/code-review/references/autoreview.md)). Why: a builder cannot certify the design it implemented, the orchestrator should not be the sole verifier of the design it authored, and a blind defect hunt cannot also certify the agreement it never saw.

**Model choices are enforced, not suggested.** One worker table ([`skills/maestro/references/workers.md`](skills/maestro/references/workers.md)) gives each worker its model and effort, one row each, and every dispatch names both on the call; the orchestrator model and the worker rules are in [`skills/maestro`](skills/maestro/SKILL.md). The route guard rejects a live run owner's subagent or workflow dispatch when it names no model, rejects fable as a worker, and fails open when it cannot identify that owner; a GPT worker the orchestrator shells out to from its own turn is outside what the guard reads, and re-scoping it is [an open followup](https://github.com/vadimcomanescu/bottega/issues/116). Why: an omitted model can silently inherit the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this guard existed.

**The spec is a document the user reviews.** The spec is published to a live shared document and reviewed in comment threads, per the [shared spec format](skills/spec/references/spec-format.md); the review mechanics are [`skills/spec`](skills/spec/SKILL.md)'s. A user who declines the hosted editor gets the same review in the conversation. Approval is a reply or a document comment. The proof the user consumes is the review plus the QA recording. The agreed spec lives in the repo at `docs/specs/`, committed on the work branch and delivered by the PR that builds it, so it diffs with the code it describes and grounds later runs. The file carries its own status line, set to agreed on approval, and a run that finds a spec on the branch always confirms and refines it against the current code before building (`docs/adr/0007-spec-status-in-the-file.md`). A tracker issue is the user's own task tracking: handed to a run it is task input, never a spec.

**QA owns the product drive.** Builders prove their slice through code and tests, and a slice that changes a user-facing surface is driven through the real interface as soon as it lands on the run branch, so a defect a user would see is found on the integrated state before the review reads the diff. Reviewers inspect the integrated code and architecture. Only after the orchestrator accepts the review evidence does a fresh QA worker drive the accepted head and record the verdict; QA never edits product code. Every drive reports its divergences in one batch, including defects found outside the scenarios it was given, so one repair cycle clears the set. The orchestrator reads a failure before routing it, and any product-code repair gets fresh review, orchestrator acceptance, and QA. Evidence is read from the PR, never in local folders: each scenario's walkthrough gif plays in the browser from its blob page in the private evidence repository, one click from the PR body, with the full recording linked beside it (`docs/adr/0009-qa-evidence-repository.md`).

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the run's PR reaches ready only after the integrated review, QA, and the project's checks are green on the exact head being delivered. Why: verification is the run's, authorization is the user's, and the user exercises it at launch: land on green, or hold (`docs/adr/0028-the-launch-decides-the-release.md`). Where the project's own merging procedure makes arming the opener's act, the run arms the PR it opens and green lands it; where the project arms its own or nothing arms it, the run arms nothing and reports what lands it. A held PR carries the `hold` label and waits for the user to remove it; the run itself never merges by hand and never approves. Any further requirement only a person can clear, a required review or a label, is reported the same way, the PR left open (`docs/adr/0017-close-respects-human-gates.md`).

## Roles

Skills define the reusable methods and independently invoked capabilities. References hold phase-specific detail for one parent skill. Hooks, schemas, tests, and workflow code enforce deterministic rules. One table gives each worker its model and effort, so role definitions carry no model of their own.

| Role | Job | Method |
| --- | --- | --- |
| orchestrator | design, model choices, review arbitration, architecture acceptance | [`skills/maestro/SKILL.md`](skills/maestro/SKILL.md) |
| builder | builds one dispatched job (a slice or a repair), test-first, inside the orchestrator's fixed architecture | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| review panel | hunts defects in the integrated diff, isolated from the builders, its prompt never carrying the spec | [`skills/code-review/references/autoreview.md`](skills/code-review/references/autoreview.md) |
| qa | drives the built artifact as a user, records the evidence, never edits product code | [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| panel seats and judge | produce independent drafts and compare them without writing the final answer | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| closer | confirms the accepted head, opens the PR (labeled hold when the launch said hold), watches checks, and reports it merged, ready, or waiting on what only a person can clear | [`skills/close/SKILL.md`](skills/close/SKILL.md) |

[`skills/codebase-design`](skills/codebase-design/SKILL.md) is shared by the roles that make and judge architecture: the orchestrator uses it to model the domain and write the plan; the review feeds that exact plan to the panel engines. Builders receive the plan and glossary as fixed input.

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
docs/specs/       the delivered specs, versioned with the code they describe
docs/plans/       the delivered plans, each carrying its slices and their landed status
```

## Development

```bash
npm install
npm test        # vitest suites plus the vendored autoreview Python suites (needs python3 and git on PATH)
```

Changes to this repo are authored directly with the owner and delivered by a PR that lands itself once its required checks are green; `/bottega:maestro` runs the changes to what the software does (hooks, scripts, schemas, workflows). The procedure, including releases, is in `AGENTS.md` under "Developing bottega".

## Credits

### Copied into this repo

These files are other people's work, copied as they were written and used unchanged. Each copy carries its upstream license file:

- the vendored autoreview engine in `skills/code-review/` (`references/autoreview.md`, `scripts/`, `tests/`) from [openclaw/agent-skills](https://github.com/openclaw/agent-skills), under `skills/code-review/LICENSE` (MIT, Copyright (c) 2026 openclaw).
- `skills/codebase-design/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md` from [mattpocock/skills](https://github.com/mattpocock/skills), under `skills/codebase-design/references/LICENSE` (MIT, Copyright (c) 2026 Matt Pocock).

Edit any of them upstream, not here. Bringing in a newer version means copying it again and reading the diff. [`THIRD_PARTY.md`](THIRD_PARTY.md) carries each one's pinned revision, local scoping, and sync procedure.

### Drawn on, not copied

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's reuse-before-build order and root-cause repair rule come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and the mocking doctrine draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading and the repair's reproduce-first test draw from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The codex dispatch mechanics (the brief through a prompt file, resume by explicit session id, the log-freshness liveness read) draw from [Peter Steinberger's agent scripts](https://github.com/steipete/agent-scripts). The review gate is openclaw's autoreview itself, vendored and locally adapted: its document is the method, its helper runs the engines, and the run's rules are woven into it as in-a-run conditionals. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the caller, which holds the context the judge never sees.

## License

MIT
