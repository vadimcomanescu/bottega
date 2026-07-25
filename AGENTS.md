# bottega

Autonomous issue-to-PR runs, orchestrated from Claude Code with Claude and GPT workers: `/bottega:maestro` takes a task or issue to a merged PR, and spec, code-review, improve, panel, and setup are also available on their own. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is | Read it when |
| --- | --- | --- |
| `CONTEXT.md` | The glossary of the run vocabulary: one meaning per term, domain only | Writing any text that names a run concept, or resolving a term dispute |
| `.claude-plugin/` | Plugin and marketplace manifests | Changing install or release metadata |
| `skills/maestro/SKILL.md` | `/bottega:maestro`, the orchestrator's whole method: the orchestrator model, the worker model rules, and the run's phases; each phase's skill states its own workers' models | Anything touches a run's phases or state, or which model runs a worker |
| `skills/build/SKILL.md` | The build method a run's Build phase invokes whole: dispatch builders per slice, check reports, integrate with gates green, end with the simplification pass; not user-invocable | Anything touches how slices are dispatched, checked, integrated, or simplified |
| `skills/open/SKILL.md` | The opening method a run's Open phase invokes whole: ownership, worktree and branch, the owner file, commands from the agent map; not user-invocable | Anything touches how a run starts or claims work |
| `skills/spec/SKILL.md` | The one spec method (explore, propose independently, grill, present) with two entry points: `/bottega:spec` and the run's Spec phase, which invokes it whole; `references/spec-format.md` sets the document shape, and `references/live-review.md` carries the live-document review mechanics | Anything touches the spec method, exploration, independent proposals, grilling, prototypes, live review, or the agreed spec's publish |
| `skills/plan/SKILL.md` | The plan method a run's Plan phase invokes whole: model the domain, commit the plan on the run branch, strengthen it with one cold read by a GPT editor; not user-invocable | Anything touches how a plan is modeled, committed, or strengthened |
| `skills/improve/SKILL.md` | `/bottega:improve`, one agreed improvement filed as an issue and handed to run | Changing how improvements are found or handed off |
| `skills/setup/SKILL.md` | `/bottega:setup`, one-time reconciliation of a machine and repo with the methodology (Claude Code and the codex CLI, skill discovery, route guard, dispatch timeout ceiling, then the repo docs and labels) | Changing what setup writes or verifies |
| `skills/implementing` | Implementation doctrine every builder receives with its dispatched slice or repair | Changing how builders work a slice or a repair |
| `skills/code-review/` | The review package: `SKILL.md` is the method, standalone `/bottega:code-review` on a PR, ref range, or working diff, and the run's Review phase invoking it whole (doc coverage, the blind panel, the spec-conformance check, rerun to one converged head); `references/autoreview.md` is the vendored engine document, with the helper `scripts/` and `tests/` beside it (provenance and sync in root `THIRD_PARTY.md`); see README Credits | Anything touches review method, sequencing, the conformance check, engine mechanics, inputs, fix dispatch, PR threads, or merge verification |
| `skills/qa/SKILL.md` | QA method and limits: drive the shipped interface, return PASS/FAIL/NOT VERIFIED per scenario, forbidden actions; run's QA phase routes here | Anything touches QA driving, evidence, or limits |
| `skills/close/SKILL.md` | The closing method a run's Close phase routes to: confirm the accepted head, file followups, open the PR written for a reader outside the run, watch its checks, merge it green or report what only a person can clear; not user-invocable | Anything touches PR opening, followup filing, the PR body's writing rule, the check watch, or the merge |
| `skills/panel/SKILL.md` | `/bottega:panel`, independent drafts from different companies' models and a compare-only judge for one costly decision; the run's Spec and Plan phases call it too, and it holds the gate that says when it is worth its cost | Changing panel seats, judging, or the panel gate |
| `skills/bro/SKILL.md` | `/bottega:bro`, restate the last reply in plain language; user-invoked only | Changing the restatement instruction |
| `skills/codebase-design` | House design doctrine: domain model, deep modules, documentation architecture | Any design, review, or setup doctrine question |
| `skills/writing-great-skills` | Skill-writing doctrine, the house format, and the closing checklist | Creating or editing any skill file |
| `scripts/` | Single assembly points for external calls: `pr-threads`; each header states its contract | Any GitHub mutation mechanics; codex launches are plain `codex exec` per the vendored method `skills/maestro/references/codex-dispatch.md` |
| `hooks/` | The route guard and its registration; the guard states its own policy | Changing what dispatches are denied |
| `THIRD_PARTY.md` | Every file copied from outside this repo: upstream, pinned revision, local scoping, how to sync | Reading, syncing, or adding a vendored file |
| `docs/adr/` | Append-only decision records | Understanding why a current rule exists before changing it |
| `docs/lessons/` | Failure records: what happened, the rule, and where the rule is enforced | Shaping new work in spec or plan, and when a run diagnoses a failure worth keeping |
| `docs/specs/` | The delivered specs, versioned with the code they describe | Reading what a feature was agreed to do, or grounding a new spec |
| `docs/plans/` | The delivered plans, each carrying its slices and their landed status | Reading how a delivered change was built, or resuming a run |
| `docs/research/` | Readings of outside work: what a source says, what bottega concluded, and when | Before researching a question from scratch, or when a proposal cites outside practice |
| `tests/` | The verification gate's suites | Any change; the gate pins doctrine and script contracts |

`.agents/skills` links every skill directory; `.claude/skills` links the three a session working in this repo invokes by bare name (`build`, `code-review`, `writing-great-skills`). Every link points at the one copy under `skills/`, which is also what the installed plugin serves.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- Skill bodies open with an imperative orienting sentence and read as procedure. "You are" openings belong only to an agent definition, whose body is a system prompt; there are none in this repo.
- A claim about harness behavior (frontmatter keys, hooks, dispatch mechanics, model resolution) is read from the harness documentation at claim time, never from memory or another skill's prose.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log". The register binds bottega's own prose, so text vendored under a sync contract (`skills/code-review/references/autoreview.md`) is synced as its author wrote it, never reworded to it.
- Orchestrate with the harness primitives (subagents, tracked background Bash, workflows); the models already know them. Never add a polling loop, a hand-written scheduler, or prose that restates what the harness does.
- Every run gets: isolation in its own worktree and branch, a build, the project's gates green after every integrated slice, one review of the integrated diff by both Claude and GPT, a QA drive with recorded evidence when a user-facing surface changed, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (the vitest suites plus the vendored autoreview Python suites; needs python3 and git on PATH). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Creating or editing any skill file, load `skills/writing-great-skills`, evaluate the writing against it, and end by walking its closing checklist.
- Skills are packaged per the Agent Skills open standard: one directory per capability, `SKILL.md` on top, supporting material inside it (`references/`, `scripts/`, assets) loaded on demand. An engine or reference a skill wraps lives inside that skill's directory, never as a sibling skill. The authoring and packaging contract is the harness documentation (https://code.claude.com/docs/en/skills) and the standard (https://agentskills.io), read at claim time.
- Editing the skills (`skills/*`), two tests per line: could the worker derive it from the repo or from competence, and would plain Fable already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Then read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root. Instruction text is calibrated to the model generation it was written for: when the pinned worker models move to a new generation, re-run these two tests over every worker-facing skill.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions that Fable can make from the repository and evidence.
- When a decision replaces an old direction, strip the old one completely and stop. Never add a test, guard, or doctrine line asserting the removed thing stays absent: that keeps the dead decision alive as maintenance. Git history is the record of what was removed and why. Tests assert what the current direction requires, never the absence of a past one.
- Use one placement rule everywhere. A skill defines reusable method or an independently invoked capability; a worker receives it per dispatch, never as a standing identity. A reference is supporting detail for one parent skill and is loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- Each dispatch gives one task a fresh context and returns a finished answer. The dispatcher reads the answer, not the transcript. Workers ask the orchestrator; the orchestrator answers and resumes them. Workers do not coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and company attribution badges or footers.

## Developing bottega

- This repo's product is skills prose read by fable and sol, held by evals and tests. Changes are authored directly with the owner: the conversation shapes the content, the session works in a worktree and branch, `npm test` runs green, and a PR the owner merges delivers it. Review here means reading the diff against `REVIEW.md` and the skill-writing doctrine, a read by another company's model when the change warrants it, never the autoreview engine for prose (its own contract exempts prose-only diffs). `/bottega:maestro` remains for changes to what the software does (hooks, scripts, schemas, workflows).
- Direct authoring keeps a run's documentation duties. In the same diff: a decision meeting the ADR bar (`bottega:codebase-design`) lands its ADR, a diagnosed failure lands its lesson in `docs/lessons/`, and every doc a change makes stale is fixed or deleted. The method this repo preaches to host repos governs this repo.
- Every merge to main is a release. The release gate (`.github/workflows/release-gate.yml`) enforces two things: `version` in `.claude-plugin/plugin.json` moves above the base, and `npm test` passes. The author holds the rest: the README's command table stays in sync with the skills, and the release commit is titled `bottega X.Y.Z: <headline> (#PR)`.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
