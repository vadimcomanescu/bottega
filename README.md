# bottega

Autonomous issue-to-PR runs for Claude Code. One command takes a task, bug, or GitHub issue to a reviewed, evidence-backed pull request.

```
/plugin marketplace add vadimcomanescu/bottega
/plugin install bottega@bottega

/bottega:run <task, or issue URL>
```

## What it does

`/bottega:run` turns the current Claude Code session into an orchestrator that:

1. Isolates the run in its own worktree and branch, and discovers the host's test, lint, typecheck, build, and run commands.
2. Reads the codebase and domain glossary, identifies risks omitted from the request, inventories relevant installed technology skills, and asks the user when the intent is unclear.
3. Presents a brief user-facing spec in the conversation: what changes, acceptance criteria, definition of done, domain terms, wireframe mockups when UI is touched. The user's OK is the go signal; a request that waives sign-off in its own words skips the wait, and the PR presents the spec and every decision where the OK would have gone.
4. Models the domain, writes Fable's architecture brief, plans vertical slices inside it, and puts each costly decision (where behavior or state belongs, data shape, public contracts, dependency bets) to a panel before building.
5. Dispatches builders with one assigned slice, the fixed architecture, the glossary, and relevant technology skills. Builders work test-first and stop at the slice boundary; host gates stay green at every integrate.
6. Syncs the host's docs to the diff, then reviews the integrated diff through one panel invocation of the vendored autoreview helper: two isolated engines, one per model family, neither seeing builder reasoning or the other's findings, each checking behavior, tests, and conformance to Fable's architecture brief. Fable verifies the findings and accepts one reviewed head; fixes get a single-engine delta round from the opposite family.
7. Sends a separate QA worker through that exact head and records the product verdict. QA reports and stops. Fable classifies a failure as environment, implementation, or design before routing a repair; every product change gets fresh review, Fable acceptance, and QA.
8. Opens the PR carrying the spec, every decision made on the user's behalf, the review verdicts, Fable's architecture acceptance, and the QA evidence. Delivery changes no tracked file, so the PR publishes the accepted reviewed head.

The user appears exactly twice: agreeing to the spec, and merging the PR.

## Requirements

- Claude Code running on the strongest available Claude model. The orchestrator role needs it, and the skill says so instead of proceeding silently on a lower tier.
- The [codex CLI](https://github.com/openai/codex), logged in. Cross-model review is never dropped (see below), so bottega checks for it before any run and fails loudly if it's missing.

Nothing else is assumed about the host repo. A run leaves nothing behind but the PR: working state is the worktree, one git-private run brief, and one gitignored owner file, all removed at delivery.

## Design decisions

**No engine.** This repo is markdown prompts, two small hooks, and one codex dispatch script. There is no scheduler, queue, or state machine; orchestration uses what Claude Code already provides (tracked subagent dispatches, tracked background shells, workflows). Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed through one panel invocation of the vendored autoreview helper: two engines, one per model family (Codex and Claude), each reading the same frozen bundle in an isolated sandbox with no builder reasoning and no view of the other's findings. Each fix is rechecked by a single-engine delta round from the family opposite the fixer. The panel prompt carries Fable's exact architecture brief and instructs the engines to report design nonconformance as findings anchored in the diff. Fable verifies every finding against the real code path, reconciles the evidence against every fixed decision, and accepts the reviewed head before QA. Why: a builder cannot certify the design it implemented, Fable should not be the sole verifier of the design it authored, and QA cannot infer internal architecture from product behavior. The helper returns one validated JSON report per invocation, merged across engines against the same frozen bundle. The same finding open after two fix attempts stops the fixing, and round 3 stops the review.

**Model routing is enforced, not suggested.** Worker roles map to fixed models (the routing table in `skills/run/SKILL.md`), and a PreToolUse hook (`hooks/route-guard.js`) rejects any dispatch or workflow that omits a model or routes a worker to the top-tier model. Why: a dispatch that omits a model silently inherits the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this hook existed.

**The spec is a conversation, not a pipeline.** The spec is presented in the session and approved with a reply: acceptance criteria, definition of done, honest wireframes. Why: earlier versions carried a signed Gherkin pipeline (generated acceptance suites, hosted sign-off documents, feature-file mutation testing); in the field it burned hours building and reviewing its own test harness while catching zero product defects the review had not already caught. The proof the user actually consumes is the review plus the QA recording.

**QA owns the product drive.** Builders prove their slice through code and tests. Reviewers inspect the integrated code and architecture. Only after Fable accepts the review evidence does a fresh QA worker drive the accepted head and record the verdict; QA never edits product code. Fable reads a failure before routing it: environment and evidence failures stay in QA setup, implementation defects go to the builder that owns the module, and a wrong spec, domain model, or architecture returns to planning. Any product-code repair gets fresh review, Fable acceptance, and QA. Evidence is read on github.com, never in local folders: walkthrough gifs and screenshots embed inline in the PR body from a never-merged evidence branch, which is deleted after merge.

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Agent definitions say who enters an isolated context: the role, authority, prohibitions, available tools, and required result. Skills hold reusable methods or independently invoked capabilities. References hold phase-specific detail for one parent skill. Hooks, schemas, tests, and workflow code enforce deterministic rules. A one-call-site count alone decides nothing: method stays a skill when it crosses runtimes or roles, or owns a workflow or contract. Agent files never pin a model. The routing table lives in [`skills/run/SKILL.md`](skills/run/SKILL.md) and is enforced by the hook.

| Role | Job | Model | Method |
| --- | --- | --- | --- |
| orchestrator | design, routing, review arbitration, architecture acceptance | fable-5 | [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| builder | implements one assigned slice, test-first, inside Fable's fixed architecture | gpt-5.6-sol (high), or opus-4.8 (xhigh) for a user-facing slice | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| review panel | breaks the integrated diff and checks it against Fable's architecture brief, via the vendored autoreview helper | gpt-5.6-sol (high) + opus-4.8 (xhigh) engines in round 1; opposite family from each fixer on deltas | [`skills/review/SKILL.md`](skills/review/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence, never edits product code | opus-4.8 (high) | [`agents/qa.md`](agents/qa.md) |
| panelist / judge | independent recommendations on a costly decision / blinded comparison only | gpt-5.6-sol (max) + fable-5 (high); fable judge | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| mechanical work | worktree setup, merges, gate re-runs, bulk reads; no judgment | sonnet-5 (low) | the closed command list in its dispatch |

[`skills/codebase-design`](skills/codebase-design/SKILL.md) is shared by the roles that make and judge architecture: Fable uses it to model the domain and write the architecture brief; the review gate feeds that exact brief to the panel engines. Builders receive the brief and glossary as fixed input.

## Repo layout

```
skills/         run, review, land, implementing, autoreview (vendored), codebase-design, panel
agents/         Claude identities for builder, QA, panelist, and panel judge
scripts/        codex-exec (the one place a codex invocation is assembled) and pr-threads (PR review-thread calls)
hooks/          route guard (model routing) and entry guard (points prose at /bottega:run)
tests/          unit tests for the hooks, the codex-exec and pr-threads scripts, the worker doctrine, and the vendored autoreview tree's integrity
docs/specs/     closed records of delivered runs
docs/research/  primary-source notes supporting worker doctrine
```

## Development

```bash
npm install
npm test        # vitest suites plus the vendored autoreview Python suites (needs python3 and git on PATH)
```

## Credits

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's ordered minimum-code checks come from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and active domain language draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading draws from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The review gate runs [openclaw/agent-skills autoreview](https://github.com/openclaw/agent-skills/tree/main/skills/autoreview) itself, vendored at a pinned commit under `skills/autoreview`: the frozen bundle, engine isolation, structured findings, and "clean" as an exit state are its contract, and the gate orchestrates it. The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the orchestrator, which holds the run context the judge never sees.

## License

MIT
