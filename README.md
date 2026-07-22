# bottega

Autonomous issue-to-PR runs for Claude Code and Codex.

`/bottega:maestro` takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request; spec, code-review, improve, panel, and setup are also available on their own.

## Install

### Claude Code

Install from the Bottega marketplace:

```text
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

Start a run with `/bottega:maestro <task, or issue URL>`.

### Codex

Install from the Bottega marketplace:

```bash
codex plugin marketplace add vadimcomanescu/bottega
codex plugin install bottega@bottega
```

Start a new Codex session, invoke `$setup` once to reconcile the repo, then start a run with `$maestro <task, or issue URL>`.

## Commands

| Skill | Claude Code | Codex | What it does |
| --- | --- | --- | --- |
| maestro | `/bottega:maestro <task, or issue URL>` | `$maestro <task, or issue URL>` | The whole pipeline: spec, plan, build, review, QA, delivered PR |
| spec | `/bottega:spec <task, issue URL, or direction>` | `$spec <task, issue URL, or direction>` | Explore, grill the unknowns, agree the spec, commit it, and file dependency-ordered tickets for later runs |
| improve | `/bottega:improve [area or direction]` | `$improve [area or direction]` | Scan for deepening opportunities, agree the strongest candidate, file it, and take it through a run |
| code-review | `/bottega:code-review <PR, ref range, or worktree>` | `$code-review <PR, ref range, or worktree>` | Review the working diff, a ref range, or a PR through the vendored review gate |
| panel | `/bottega:panel <the decision>` | `$panel <the decision>` | Produce independent cross-family drafts and a compare-only judgment |
| setup | `/bottega:setup` | `$setup` | Reconcile the project and register the current harness once per repo |

Maestro and spec are two entry points to one method (explore, grill, agree the spec), defined once in [`skills/spec`](skills/spec/SKILL.md) and invoked whole from either. Maestro carries it through to a delivered PR; spec stops at an agreed spec file committed on a work branch that any later `/bottega:maestro` continues. The spec is that file; an issue is never a spec. During a run, maestro also invokes the open, routing, plan, building, code-review, QA, and close skills; code-review is the one users also invoke directly, and the vendored autoreview document under it is the engine every review runs on.

## What it does

`/bottega:maestro` turns the current harness session into an orchestrator that:

1. Opens the run in its own worktree and branch, and reads the project's commands (test, lint, format, typecheck, build, run) from the repo's agent map, writing them there first when missing.
2. Reads the codebase and domain glossary, identifies risks omitted from the request, inventories relevant installed technology skills, and asks the user when the intent is unclear.
3. Presents the spec as a live shared document, following the [shared spec format](skills/spec/references/spec-format.md): the user reads it rendered on any device and reviews it in comment threads, with the agent replying in-thread and making agreed changes as tracked edits. A user who declines the hosted editor gets the same review in the conversation. The user's OK, as a reply or a document comment, is the go signal; when the user says to run autonomously, the wait is skipped and the PR presents the spec and every decision where the OK would have gone. The approved spec is committed to `docs/specs/` on the run branch, so it merges with the code it describes.
4. Models the domain, writes the plan as a file committed on the run branch, cuts vertical slices inside it, and puts each costly decision (where behavior or state belongs, data shape, public contracts, dependency bets) to a panel before building. A fresh reviewer from the other model family then reads the spec, the plan, and the repository cold and answers ready or blockers; the plan is revised and re-read until a pass returns ready or the round cap stops the loop, and each slice's status is committed into it as slices land.
5. Dispatches builders with one assigned slice, the fixed architecture, the glossary, and relevant technology skills. Builders work test-first and stop at the slice boundary; the project's gates stay green at every integrate.
6. Checks that every changed user-facing surface updated its docs inside its slice, then reviews the integrated diff through the vendored autoreview document: one panel invocation, two isolated engines, one per model family, isolated from the builders, their prompt never carrying the spec or the plan, judging against the repository's own review doctrine. A separate fresh worker checks the diff against the agreed spec, quoting the line each finding rests on. The orchestrator verifies every finding, dispatches the accepted ones to a fresh builder, and the reviewer reruns with a single engine until nothing blocking remains.
7. Sends a separate QA worker through that exact head and records the product verdict. QA reports and stops. The orchestrator classifies a failure as environment, implementation, or design before routing a repair; every product change gets fresh review, orchestrator acceptance, and QA.
8. Opens the PR carrying the spec, every decision made on the user's behalf, the review verdicts, the orchestrator's architecture acceptance, and the QA evidence. The closing step changes no tracked file, so the PR publishes the accepted reviewed head.

The user appears exactly twice: agreeing to the spec, and merging the PR.

## Requirements

- Claude Code or Codex running one of the orchestrator models accepted by the maestro skill.
- Git, Node.js, and the [GitHub CLI](https://cli.github.com/).
- The codex CLI, logged in: the integrated review always runs both model families. Under Codex, the claude CLI as well, for the same reason.

Nothing else is assumed about the project. A run leaves nothing behind but the PR, the spec it commits to `docs/specs/`, the plan it commits to `docs/plans/`, and the permanent branch holding QA evidence: working state is the worktree and one gitignored owner file, both removed at delivery.

## Cross-vendor workers

Each harness pins its own vendor's models per dispatch natively. The other vendor's models run as one foreground CLI call inside a thin wrapper subagent, one per worker, so every worker holds a visible row for its whole run: under Claude Code, [`scripts/codex-exec`](scripts/codex-exec) dispatches GPT workers; under Codex, headless claude (`claude -p --model <model> --effort <effort>`) dispatches Claude workers. Long builds are covered by raising the shell timeout ceiling in settings (`bottega:setup`); backgrounding the call inside a subagent is banned because it never delivers its result ([`docs/lessons/subagent-background-work-dies-silently.md`](docs/lessons/subagent-background-work-dies-silently.md)). A cloud run whose VM lacks the other family's CLI or login stops at the cross-family review gate and reports the missing family; the integrated review is never waived around it.

A local cross-vendor proxy (CLIProxyAPI) was adopted for this in 0.66.0 and re-declined before it ever ran; routing subscription credentials through a third-party client is prohibited by vendor policy and its own tracker records the account bans. [`docs/adr/0007-model-proxy-re-declined.md`](docs/adr/0007-model-proxy-re-declined.md) records the evidence.

## Design decisions

**No engine.** This repo is Markdown skills, one small guard with per-harness registrations, and GitHub scripts. There is no scheduler, queue, or state machine; orchestration uses the harness's visible subagents, workflows, and tracked background work. Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed through one panel invocation of the vendored autoreview document: two engines, one per model family (Codex and Claude), each reading the same frozen bundle in an isolated sandbox, isolated from the builders and from each other, their prompt never carrying the spec or the plan; they judge against the repository's own review doctrine and the standards baseline. Spec conformance is a separate pass: one fresh worker from the other model family reads the diff against the agreed spec and quotes the line each finding rests on; neither pass sees the other's findings. The orchestrator verifies every finding against the real code path, dispatches the accepted ones to a fresh builder, and the reviewer reruns with a single engine until no blocker remains, under the vendored contract's own pause-and-reclassify rule ([`skills/code-review/references/autoreview.md`](skills/code-review/references/autoreview.md)). Why: a builder cannot certify the design it implemented, the orchestrator should not be the sole verifier of the design it authored, and a blind defect hunt cannot also certify the agreement it never saw.

**Model routing is enforced, not suggested.** [`skills/routing`](skills/routing/SKILL.md) chooses a model and effort for each worker from its model table and task rules. The route guard rejects a live run owner's worker start when it names no model, and rejects fable as a worker, and fails open when it cannot identify that owner. Why: an omitted model can silently inherit the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this guard existed.

**The spec is a document the user reviews.** The spec is published to a live shared document and reviewed in comment threads, per the [shared spec format](skills/spec/references/spec-format.md); the review mechanics are [`skills/spec`](skills/spec/SKILL.md)'s. A user who declines the hosted editor gets the same review in the conversation. Approval is a reply or a document comment. The proof the user consumes is the review plus the QA recording. The agreed spec lives in the repo at `docs/specs/`, committed on the work branch and delivered by the PR that builds it, so it diffs with the code it describes and grounds later runs. The file carries its own status line, set to agreed on approval, and a run that finds a spec on the branch always confirms and refines it against the current code before building (`docs/adr/0006-spec-status-in-the-file.md`). A tracker issue is the user's own task tracking: handed to a run it is task input, never a spec.

**QA owns the product drive.** Builders prove their slice through code and tests. Reviewers inspect the integrated code and architecture. Only after the orchestrator accepts the review evidence does a fresh QA worker drive the accepted head and record the verdict; QA never edits product code. The orchestrator reads a failure before routing it, and any product-code repair gets fresh review, orchestrator acceptance, and QA. Evidence is read from the PR, never in local folders: each scenario's walkthrough gif plays in the browser from its blob page in the private evidence repository, one click from the PR body, with the full recording linked beside it (`docs/adr/0008-qa-evidence-repository.md`).

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Skills define the reusable methods and independently invoked capabilities. References hold phase-specific detail for one parent skill. Hooks, schemas, tests, and workflow code enforce deterministic rules. The routing skill carries the model table and task rules, so role definitions do not pin models.

| Role | Job | Method |
| --- | --- | --- |
| orchestrator | design, routing, review arbitration, architecture acceptance | [`skills/maestro/SKILL.md`](skills/maestro/SKILL.md) |
| builder | builds one dispatched job (a slice or a repair), test-first, inside the orchestrator's fixed architecture | [`skills/building/SKILL.md`](skills/building/SKILL.md) |
| review panel | hunts defects in the integrated diff, isolated from the builders, its prompt never carrying the spec | [`skills/code-review/references/autoreview.md`](skills/code-review/references/autoreview.md) |
| qa | drives the built artifact as a user, records the evidence, never edits product code | [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| panel seats and judge | produce independent drafts and compare them without writing the final answer | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| closer | confirms the accepted head, opens the PR, and watches checks | [`skills/close/SKILL.md`](skills/close/SKILL.md) |

[`skills/codebase-design`](skills/codebase-design/SKILL.md) is shared by the roles that make and judge architecture: the orchestrator uses it to model the domain and write the plan; the review gate feeds that exact plan to the panel engines. Builders receive the plan and glossary as fixed input.

## Repo layout

```
skills/           the canonical methods and orchestration entry points
.agents/          the Codex marketplace file and in-repo skill discovery links
.claude-plugin/   Claude Code packaging
.codex-plugin/    Codex packaging
hooks/            one route guard and its harness registrations
scripts/          single assembly points for GitHub mutations
tests/            the verification gate's suites
docs/adr/         append-only decision records
docs/specs/       the delivered specs, versioned with the code they describe
docs/research/    primary-source notes supporting worker doctrine
```

## Development

```bash
npm install
npm test        # vitest suites plus the vendored autoreview Python suites (needs python3 and git on PATH)
```

Every change to this repo ships through `/bottega:maestro` on this repo; the procedure, including releases, is in `AGENTS.md` under "Developing bottega".

## Credits

### Copied into this repo

These files are other people's work, copied as they were written and used unchanged. Each copy carries its upstream license file:

- the vendored autoreview engine in `skills/code-review/` (`references/autoreview.md`, `scripts/`, `tests/`) from [openclaw/agent-skills](https://github.com/openclaw/agent-skills), under `skills/code-review/LICENSE` (MIT, Copyright (c) 2026 openclaw).
- `skills/codebase-design/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md` from [mattpocock/skills](https://github.com/mattpocock/skills), under `skills/codebase-design/references/LICENSE` (MIT, Copyright (c) 2026 Matt Pocock).

Edit either upstream, not here. Bringing in a newer version means copying it again and reading the diff.

### Drawn on, not copied

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's ordered minimum-code checks come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and active domain language draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading draws from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The review gate is openclaw's autoreview itself, vendored and locally adapted: its document is the method, its helper runs the engines, and the run's rules are woven into it as in-a-run conditionals. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the caller, which holds the context the judge never sees.

## License

MIT
