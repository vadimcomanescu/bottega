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
2. Reads the codebase and domain glossary, surfaces the unknowns the request never mentions, inventories relevant installed technology skills, and grills the user when the intent is unclear.
3. Presents a brief user-facing spec in the conversation: what changes, acceptance criteria, definition of done, domain terms, wireframe mockups when UI is touched. The user's OK is the go signal; a request that waives sign-off in its own words skips the wait, and the PR presents the spec and every decision where the OK would have gone.
4. Writes one architecture contract, plans vertical slices inside it, and puts each costly decision (where the change lives, data shape, public contracts, dependency bets) to a panel of independent frontier models before building.
5. Dispatches builders with that exact contract, the glossary, and relevant technology skills, in parallel where slices allow it, with the host's gates green after every slice and the full suite at every integrate. User-facing builders also drive the real local surface before integration.
6. Has the integrated diff reviewed by two cold reviewers in parallel, one per model family, against each frozen architecture contract, with schema-enforced reports that account for every constraint; fixes get a fresh opposite-family reviewer, and the rounds are hard-bounded.
7. Drives the product as a user and records it: a feature shown working, a bug shown gone, walkthrough gifs and screenshots inline in the PR with the full recordings one click away. QA reports and stops. Fable classifies a failure before repairing the drive, choosing a builder, or reopening the architecture, then fresh review and QA verify any product change.
8. Syncs the host's docs to the diff and opens the PR carrying the spec, every decision made on the user's behalf, the review verdicts, and the QA evidence.

The user appears exactly twice: agreeing to the spec, and merging the PR.

## Requirements

- Claude Code running on the strongest available Claude model. The orchestrator role needs it, and the skill says so instead of proceeding silently on a lower tier.
- The [codex CLI](https://github.com/openai/codex), logged in. Cross-model review is never dropped (see below), so bottega checks for it before any run and fails loudly if it's missing.

Nothing else is assumed about the host repo. A run leaves nothing behind but the PR: working state is the worktree, one git-private run brief, and one gitignored owner file, all removed at delivery.

## Design decisions

**No engine.** This repo is markdown prompts, two small hooks, and one codex dispatch script. There is no scheduler, queue, or state machine; orchestration uses what Claude Code already provides (tracked subagent dispatches, tracked background shells, workflows). Why: any orchestration machinery written here would duplicate the harness and drift from it, and prompts that lean on the harness get its reliability for free.

**Both-family review, always.** The integrated diff is reviewed cold by two reviewers in parallel, one per model family (codex and Claude), neither seeing the other's findings; each fix is rechecked by a fresh reviewer from the family opposite the fixer. Both reviewers receive Fable's exact architecture contract and return one structured check per stable contract ID. Why: same-family review inherits the generator's blind spots and produces confident false verification, and an opposite-family read covers every line whoever built it. This is the one step never dropped, whatever the size of the change, because it is what lets a user merge without reading the diff. Every reviewer returns one schema-enforced JSON report (`skills/reviewing/references/report.schema.json`) pinned to the exact SHAs it reviewed, so "review passed" is a state derivable from the reports, not a narrative. The rounds are bounded by design: the same finding open after two fix attempts stops the fixing, round 3 stops the review, and nothing ever dispatches round 4 automatically.

**Model routing is enforced, not suggested.** Worker roles map to fixed models (the routing table in `skills/run/SKILL.md`), and a PreToolUse hook (`hooks/route-guard.js`) rejects any dispatch or workflow that omits a model or routes a worker to the top-tier model. Why: a dispatch that omits a model silently inherits the orchestrator's model, the most expensive one, and in a measured run 103 of 132 dispatches did exactly that before this hook existed.

**The spec is a conversation, not a pipeline.** The spec is presented in the session and approved with a reply: acceptance criteria, definition of done, honest wireframes. Why: earlier versions carried a signed Gherkin pipeline (generated acceptance suites, hosted sign-off documents, feature-file mutation testing); in the field it burned hours building and reviewing its own test harness while catching zero product defects the review had not already caught. The proof the user actually consumes is the review plus the QA recording.

**Builders verify; final QA stays independent.** A user-facing builder drives the real local surface and fixes defects inside the contract before integration. After review leaves the head clean, a fresh QA worker records the session that produces the final verdict and never edits product code. On failure, Fable distinguishes a bad drive or environment, a presentation defect, another implementation defect, and a wrong spec or architecture, then chooses the appropriate repair path. An implementation fix gets an opposite-family delta review; a changed contract gets a new both-family integrated review. Both paths end with fresh QA. Why: letting final QA repair and certify the same head weakens the evidence, while automatic routing to one builder mistakes architecture and environment failures for implementation defects. Evidence is read on github.com, never in local folders: walkthrough gifs and screenshots embed inline in the PR body from a never-merged evidence branch (GitHub plays gifs from raw links but never video files, so full recordings are linked beside them), and the branch dies after merge: the evidence's job ends when the user merges.

**The PR is the only path to trunk.** Every run builds on its own branch in its own worktree; the user's checkout is never touched, and the merge click is the only human action that lands code. Why: an autonomous system should be unable to change what you run, only to propose it.

## Roles

Agent definitions in `agents/` say who a worker is; skills in `skills/` say how it works. Agent files never pin a model: the routing table (with reasoning effort per role) lives in [`skills/run/SKILL.md`](skills/run/SKILL.md) and is enforced by the hook.

| Role | Job | Model | Method |
| --- | --- | --- | --- |
| orchestrator | design, routing, arbitration, every judgment call | fable-5 | [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| builder | implements one slice, test-first, inside Fable's architecture contract | gpt-5.6-sol (high), or opus-4.8 (xhigh) for a user-facing slice | [`skills/implementing/SKILL.md`](skills/implementing/SKILL.md) |
| reviewer | breaks the integrated diff, polices tests, proves architectural conformance | gpt-5.6-sol (high) + opus-4.8 (xhigh) in round 1; opposite family from each fixer on deltas | [`skills/reviewing/SKILL.md`](skills/reviewing/SKILL.md) |
| qa | drives the built artifact as a user, records the evidence | opus-4.8 (high) | the QA rules in [`skills/run/SKILL.md`](skills/run/SKILL.md) |
| panelist / judge | blind recommendations on a costly decision / compare-only judgment | dispatched by the panel workflow | [`skills/panel/SKILL.md`](skills/panel/SKILL.md) |
| mechanical work | worktree setup, merges, gate re-runs, bulk reads; no judgment | sonnet-5 (low) | the closed command list in its dispatch |

One design vocabulary spans all of them: [`skills/codebase-design`](skills/codebase-design/SKILL.md) (deep modules behind small interfaces, architecture contracts, and a `CONCEPTS.md` domain glossary in the host repo). The orchestrator designs by it, builders follow it, and reviewers prove conformance against the same text.

## Repo layout

```
skills/         run (the whole method), implementing, reviewing, panel, codebase-design
agents/         agent definitions: identity and a pointer to the skill, nothing else
scripts/        codex-exec, the one place a codex invocation is assembled
hooks/          route guard (model routing) and entry guard (points prose at /bottega:run)
tests/          unit tests for the hooks, the codex script, and the review report contract
docs/specs/     closed records of delivered runs
docs/research/  primary-source notes supporting worker doctrine
```

## Development

```bash
npm install
npm test        # hook unit tests
```

## Credits

The discovery method (interviewing for unknowns) follows Thariq Shihipar's unknowns framework. The design vocabulary is John Ousterhout's deep modules. The builder's simplicity ladder comes from [Ponytail](https://github.com/DietrichGebert/ponytail); interface-level TDD and active domain language draw from [Matt Pocock's engineering skills](https://github.com/mattpocock/skills); selective technology-skill loading draws from [Addy Osmani's agent skills](https://github.com/addyosmani/agent-skills); and the exact-plan-to-implementer-to-reviewer handoff is reinforced by [Superpowers](https://github.com/obra/superpowers). The review report contract (schema enforced at dispatch, a frozen review target, "clean" as a state derivable from the reports) adapts the architecture of [openclaw/agent-skills autoreview](https://github.com/openclaw/agent-skills/tree/main/skills/autoreview). The panel (blinded frontier drafts, a judge held to structured comparison) follows OpenRouter's [Fusion](https://openrouter.ai/blog/announcements/fusion-beats-frontier/), which measured fused frontier models beating any single one; bottega deviates in one place: the judge never writes the answer, synthesis stays with the orchestrator, which holds the run context the judge never sees.

## License

MIT
