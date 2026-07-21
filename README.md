# bottega

Autonomous issue-to-PR runs for Claude Code, Codex, and Cursor.

`/bottega:maestro` takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request; spec, review, land, improve, panel, and setup are also available on their own.

## Install

### Claude Code

Install from the Bottega marketplace:

```text
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega
```

Start a run with `/bottega:maestro <task, or issue URL>`.

### Codex

Codex reads user-level skills from `~/.agents/skills/`. Clone Bottega beside that directory, then add its relative skill links:

```bash
git clone https://github.com/vadimcomanescu/bottega.git "$HOME/.agents/bottega"
mkdir -p "$HOME/.agents/skills"
for skill in "$HOME"/.agents/bottega/skills/*; do ln -s "../bottega/skills/${skill##*/}" "$HOME/.agents/skills/${skill##*/}"; done
```

Start a new Codex session, invoke `$setup` once to register the Codex hook, then start a run with `$maestro <task, or issue URL>`.

### Cursor

Cursor reads the same user-level `~/.agents/skills/` tree. Clone Bottega beside it, then add its relative skill links:

```bash
git clone https://github.com/vadimcomanescu/bottega.git "$HOME/.agents/bottega"
mkdir -p "$HOME/.agents/skills"
for skill in "$HOME"/.agents/bottega/skills/*; do ln -s "../bottega/skills/${skill##*/}" "$HOME/.agents/skills/${skill##*/}"; done
```

Reload Cursor, invoke `/setup` once to register the Cursor hook, then start a run with `/maestro <task, or issue URL>`.

## Commands

| Skill | Claude Code | Codex | Cursor | What it does |
| --- | --- | --- | --- | --- |
| maestro | `/bottega:maestro <task, or issue URL>` | `$maestro <task, or issue URL>` | `/maestro <task, or issue URL>` | The whole pipeline: spec, plan, build, review, QA, delivered PR |
| spec | `/bottega:spec <task, issue URL, or direction>` | `$spec <task, issue URL, or direction>` | `/spec <task, issue URL, or direction>` | Explore, grill the unknowns, agree the spec, and leave it agreed on a work branch a later run continues |
| improve | `/bottega:improve [area or direction]` | `$improve [area or direction]` | `/improve [area or direction]` | Find the strongest improvement, agree it, file it, and take it through a run |
| review | `/bottega:review <PR, ref range, or worktree>` | `$review <PR, ref range, or worktree>` | `/review <PR, ref range, or worktree>` | Run the standalone cross-family review gate |
| land | `/bottega:land <PR number>` | `$land <PR number>` | `/land <PR number>` | Take an open PR through review-fix rounds to verified-mergeable |
| panel | `/bottega:panel <the decision>` | `$panel <the decision>` | `/panel <the decision>` | Produce independent cross-family drafts and a compare-only judgment |
| setup | `/bottega:setup` | `$setup` | `/setup` | Reconcile the project and register the current harness once per repo |

Maestro and spec are two entry points to one method (explore, grill, agree the spec), defined once in [`skills/spec`](skills/spec/SKILL.md) and invoked whole from either. Maestro carries it through to a delivered PR; spec stops at an agreed spec file committed on a work branch that any later `/bottega:maestro` continues. The spec is that file; an issue is never a spec. During a run, maestro also invokes the internal routing, implementing, close, and QA skills.

## What it does

`/bottega:maestro` turns the current harness session into an orchestrator that:

1. Isolates the run in its own worktree and branch, and discovers the project's test, lint, typecheck, build, and run commands.
2. Reads the codebase and domain glossary, identifies risks omitted from the request, inventories relevant installed technology skills, and asks the user when the intent is unclear.
3. Presents the spec as a live shared document, following the [shared spec format](skills/spec/references/spec-format.md): the user reads it rendered on any device and reviews it in comment threads, with the agent replying in-thread and making agreed changes as tracked edits. A user who declines the hosted editor gets the same review in the conversation. The user's OK, as a reply or a document comment, is the go signal; a request that waives sign-off in its own words skips the wait, and the PR presents the spec and every decision where the OK would have gone. The approved spec is committed to `docs/specs/` on the run branch, so it merges with the code it describes.
4. Models the domain, writes the plan, cuts vertical slices inside it, and puts each costly decision (where behavior or state belongs, data shape, public contracts, dependency bets) to a panel before building.
5. Dispatches builders with one assigned slice, the fixed architecture, the glossary, and relevant technology skills. Builders work test-first and stop at the slice boundary; the project's gates stay green at every integrate.
6. Checks that every changed user-facing surface updated its docs inside its slice, then reviews the integrated diff through one panel invocation of the vendored autoreview helper: two isolated engines, one per model family, neither seeing builder reasoning or the other's findings, each checking behavior, tests, and conformance to the plan. The orchestrator verifies the findings, routes fixes to the builders that own the modules, and rechecks the whole change with a single engine until nothing blocking remains.
7. Sends a separate QA worker through that exact head and records the product verdict. QA reports and stops. The orchestrator classifies a failure as environment, implementation, or design before routing a repair; every product change gets fresh review, orchestrator acceptance, and QA.
8. Opens the PR carrying the spec, every decision made on the user's behalf, the review verdicts, the orchestrator's architecture acceptance, and the QA evidence. The closing step changes no tracked file, so the PR publishes the accepted reviewed head.

The user appears exactly twice: agreeing to the spec, and merging the PR.

## Requirements

- Claude Code, Codex, or Cursor running one of the orchestrator models accepted by the maestro skill.
- Git, Node.js, and the [GitHub CLI](https://cli.github.com/).
- The codex CLI, logged in: the integrated review always runs both model families. On a Codex or Cursor host, the claude CLI as well, for the same reason.

Nothing else is assumed about the project. A run leaves nothing behind but the PR, the spec it commits to `docs/specs/`, and the permanent branch holding QA evidence: working state is the worktree, one git-private plan, and one gitignored owner file, all removed at delivery.

## Model proxy (optional)

[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) is a local service that authenticates once to Claude and ChatGPT/Codex with OAuth, holds those tokens locally, and serves backed models through both Anthropic-compatible and OpenAI-compatible endpoints. Install its single binary with Homebrew or a release download, authenticate with both providers (the login commands are in the CLIProxyAPI docs), then start the service on localhost.

Point Claude Code at the Anthropic-compatible endpoint with exactly these two variables. Routing still chooses a model on every dispatch, so do not set `CLAUDE_CODE_SUBAGENT_MODEL`:

```text
ANTHROPIC_BASE_URL=http://localhost:<port>
ANTHROPIC_AUTH_TOKEN=<the proxy's local api key>
```

For Codex, declare a custom model provider in `config.toml` whose `base_url` is the proxy's OpenAI-compatible endpoint. Claude Code can then dispatch GPT models through its native agent UI, while Codex can dispatch Claude models through its native agent UI.

The localhost proxy is unavailable to vendor cloud VMs, so cloud runs use their own family natively and the other family through an available harness fallback, or report that family missing; [spec section 6](docs/specs/cross-harness.md#6-the-honest-part-the-proxy-and-cloud-agents) records the limits and security tradeoffs.

## Design decisions

**No engine.** This repo is Markdown skills, one small guard with per-harness registrations, and GitHub scripts. There is no scheduler, queue, or state machine; orchestration uses the harness's visible subagents, workflows, and tracked background work. Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed through one panel invocation of the vendored autoreview helper: two engines, one per model family (Codex and Claude), each reading the same frozen bundle in an isolated sandbox with no builder reasoning and no view of the other's findings. Fixes route to the builders that own the modules, and each fix cycle ends in a single-engine recheck of the whole change, until no accepted blocker remains, under the convergence rule [`skills/review`](skills/review/SKILL.md) sets. The panel prompt carries the orchestrator's exact plan and instructs the engines to report design nonconformance as findings anchored in the diff. The orchestrator verifies every finding against the real code path, reconciles the evidence against every fixed decision, and accepts the reviewed head before QA. Why: a builder cannot certify the design it implemented, the orchestrator should not be the sole verifier of the design it authored, and QA cannot infer internal architecture from product behavior.

**Model routing is enforced, not suggested.** [`skills/routing`](skills/routing/SKILL.md) chooses a model and effort for each worker from its model table and task rules. The route guard rejects a live run owner's worker start when it names no model, and rejects fable as a worker, and fails open when it cannot identify that owner. Why: an omitted model can silently inherit the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this guard existed.

**The spec is a document the user reviews.** The spec is published to a live shared document and reviewed in comment threads, per the [shared spec format](skills/spec/references/spec-format.md); the review mechanics are [`skills/spec`](skills/spec/SKILL.md)'s. A user who declines the hosted editor gets the same review in the conversation. Approval is a reply or a document comment. The proof the user consumes is the review plus the QA recording. The agreed spec lives in the repo at `docs/specs/`, committed on the work branch and delivered by the PR that builds it, so it diffs with the code it describes and grounds later runs. The file carries its own status line, set to agreed on approval, and a run that finds a spec on the branch always confirms and refines it against the current code before building (`docs/adr/0006-spec-status-in-the-file.md`). A tracker issue is the user's own task tracking: handed to a run it is task input, never a spec.

**QA owns the product drive.** Builders prove their slice through code and tests. Reviewers inspect the integrated code and architecture. Only after the orchestrator accepts the review evidence does a fresh QA worker drive the accepted head and record the verdict; QA never edits product code. The orchestrator reads a failure before routing it, and any product-code repair gets fresh review, orchestrator acceptance, and QA. Evidence is read on github.com, never in local folders: from a permanent evidence branch, walkthrough gifs and screenshots embed inline in a public repo's PR body and link to their blob pages in a private one, where GitHub's image proxy cannot authenticate.

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Skills define the reusable methods and independently invoked capabilities. References hold phase-specific detail for one parent skill. Hooks, schemas, tests, and workflow code enforce deterministic rules. The routing skill carries the model table and task rules, so role definitions do not pin models.

| Role | Job | Method |
| --- | --- | --- |
| orchestrator | design, routing, review arbitration, architecture acceptance | [`skills/maestro/SKILL.md`](skills/maestro/SKILL.md) |
| builder | implements one assigned slice, test-first, inside the orchestrator's fixed architecture | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| review panel | breaks the integrated diff and checks it against the orchestrator's plan | [`skills/review/SKILL.md`](skills/review/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence, never edits product code | [`skills/qa/SKILL.md`](skills/qa/SKILL.md) |
| panel seats and judge | produce independent drafts and compare them without writing the final answer | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| closer | confirms the accepted head, opens the PR, and watches checks | [`skills/close/SKILL.md`](skills/close/SKILL.md) |

[`skills/codebase-design`](skills/codebase-design/SKILL.md) is shared by the roles that make and judge architecture: the orchestrator uses it to model the domain and write the plan; the review gate feeds that exact plan to the panel engines. Builders receive the plan and glossary as fixed input.

## Repo layout

```
skills/           the canonical methods and orchestration entry points
.agents/skills/   relative discovery links used by Codex and Cursor
.claude-plugin/   Claude Code packaging
.codex-plugin/    Codex packaging
.cursor-plugin/   Cursor packaging
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

- `skills/autoreview/` from [openclaw/agent-skills](https://github.com/openclaw/agent-skills), under `skills/autoreview/LICENSE` (MIT, Copyright (c) 2026 openclaw).
- `skills/codebase-design/references/CONTEXT-FORMAT.md` and `ADR-FORMAT.md` from [mattpocock/skills](https://github.com/mattpocock/skills), under `skills/codebase-design/references/LICENSE` (MIT, Copyright (c) 2026 Matt Pocock).

Edit either upstream, not here. Bringing in a newer version means copying it again and reading the diff.

### Drawn on, not copied

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's ordered minimum-code checks come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and active domain language draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading draws from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The review gate runs openclaw's autoreview itself: the frozen bundle, engine isolation, structured findings, and "clean" as an exit state are its contract, and the gate orchestrates it. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the caller, which holds the context the judge never sees.

## License

MIT
