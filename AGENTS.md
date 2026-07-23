# bottega

Autonomous issue-to-PR runs across Claude Code and Codex: `/bottega:maestro` takes a task or issue to a delivered PR, and spec, code-review, improve, panel, and setup are also available on their own. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is | Read it when |
| --- | --- | --- |
| `CONTEXT.md` | The glossary of the run vocabulary: one meaning per term, domain only | Writing any text that names a run concept, or resolving a term dispute |
| `.claude-plugin/` | Plugin and marketplace manifests | Changing install or release metadata |
| `skills/maestro/SKILL.md` | `/bottega:maestro`, the orchestrator's whole method | Anything touches a run's phases or state |
| `skills/routing/` | Model and effort selection per worker dispatch: the model table, the task rules, and how each harness reaches a pick | Anything touches which model runs a worker |
| `skills/open/SKILL.md` | The opening method a run's Open phase invokes whole: ownership, worktree and branch, the owner file, commands from the agent map; not user-invocable | Anything touches how a run starts or claims work |
| `skills/spec/SKILL.md` | The one spec method (explore, propose independently, grill, present) with two entry points: `/bottega:spec` and the run's Spec phase, which invokes it whole; `references/spec-format.md` sets the document shape, and `references/live-review.md` carries the live-document review mechanics | Anything touches the spec method, exploration, independent proposals, grilling, prototypes, live review, or the spec-and-ticket publish |
| `skills/plan/SKILL.md` | The plan method a run's Plan phase invokes whole: model the domain, commit the plan on the run branch, strengthen it with cross-family editor passes until one approves or the fifth round locks it; not user-invocable | Anything touches how a plan is modeled, committed, or strengthened |
| `skills/improve/SKILL.md` | `/bottega:improve`, one agreed improvement filed as an issue and handed to run | Changing how improvements are found or handed off |
| `skills/setup/SKILL.md` | `/bottega:setup`, one-time reconciliation of a machine and repo with the methodology (harness CLIs, skill discovery, route guard, dispatch timeout ceiling, then the repo docs and labels) | Changing what setup writes or verifies |
| `skills/implementing` | Implementation doctrine shared by Claude and Codex builders | Changing how builders work a slice or a repair |
| `skills/code-review/` | The review package: `SKILL.md` is the method, standalone `/bottega:code-review` on a PR, ref range, or working diff, and the run's Review phase invoking it whole (doc coverage, the blind panel, the spec-conformance check, rerun to one converged head); `references/autoreview.md` is the vendored engine document, with the helper `scripts/` and `tests/` beside it (sync contract in the directory's `AGENTS.md`); see README Credits | Anything touches review method, sequencing, the conformance check, engine mechanics, inputs, fix dispatch, PR threads, or merge verification |
| `skills/qa/SKILL.md` | QA method and limits: drive the shipped interface, return PASS/FAIL/NOT VERIFIED per scenario, forbidden actions; run's QA phase routes here | Anything touches QA driving, evidence, or limits |
| `skills/close/SKILL.md` | The closing method a run's Close phase routes to: confirm the accepted head, file followups, open the PR under the reader contract, watch its checks; not user-invocable | Anything touches PR opening, followup filing, the reader contract, or the check watch |
| `skills/panel/SKILL.md` | `/bottega:panel`, independent cross-family drafts and a compare-only judge for one costly decision; run's Plan phase calls it too | Changing panel seats or judging |
| `skills/codebase-design` | House design doctrine: domain model, deep modules, documentation architecture | Any design, review, or setup doctrine question |
| `skills/writing-great-skills` | Skill-writing doctrine, the house format, and the closing checklist | Creating or editing any skill file |
| `scripts/` | Single assembly points for external calls: `codex-exec`, `pr-threads`; each header states its contract | Any codex launch or GitHub mutation mechanics |
| `hooks/` | The route guard and its registrations for both harnesses; the guard states its own policy | Changing what dispatches are denied |
| `docs/adr/` | Append-only decision records | Understanding why a current rule exists before changing it |
| `docs/lessons/` | Failure records: what happened, the rule, and where the rule is enforced | Shaping new work in spec or plan, and when a run diagnoses a failure worth keeping |
| `docs/specs/` | The delivered specs, versioned with the code they describe | Reading what a feature was agreed to do, or grounding a new spec |
| `docs/plans/` | The delivered plans, each carrying its slices and their landed status | Reading how a delivered change was built, or resuming a run |
| `docs/research/` | Readings of outside work: what a source says, what bottega concluded, and when | Before researching a question from scratch, or when a proposal cites outside practice |
| `tests/` | The verification gate's suites | Any change; the gate pins doctrine and script contracts |

The skill directories are symlinked from `.claude/skills` and `.agents/skills` so every runtime loads the one copy.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- Skill bodies open with an imperative orienting sentence and read as procedure. "You are" openings belong only to an agent definition, whose body is a system prompt; there are none in this repo.
- A claim about harness behavior (frontmatter keys, hooks, dispatch mechanics, model resolution) is read from the harness documentation at claim time, never from memory or another skill's prose.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log".
- Orchestrate with the harness primitives (subagents, tracked background Bash, workflows); the models already know them. Never add a polling loop, a hand-written scheduler, or prose that restates what the harness does.
- Every run gets: isolation in its own worktree and branch, a build, the project's gates green after every integrated slice, one cross-family review of the integrated diff, a QA drive with recorded evidence when a user-facing surface changed, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (the vitest suites plus the vendored autoreview Python suites; needs python3 and git on PATH). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Creating or editing any skill file, load `skills/writing-great-skills`, evaluate the writing against it, and end by walking its closing checklist.
- Skills are packaged per the Agent Skills open standard: one directory per capability, `SKILL.md` on top, supporting material inside it (`references/`, `scripts/`, assets) loaded on demand. An engine or reference a skill wraps lives inside that skill's directory, never as a sibling skill. The authoring and packaging contract is the harness documentation (https://code.claude.com/docs/en/skills) and the standard (https://agentskills.io), read at claim time.
- Editing the skills (`skills/*`), two tests per line: could the worker derive it from the repo or from competence, and would plain Fable already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Then read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root. Instruction text is calibrated to the model generation it was written for: when routing's model table moves to a new generation, re-run these two tests over every worker-facing skill.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions that Fable can make from the repository and evidence.
- When a decision replaces an old direction, strip the old one completely and stop. Never add a test, guard, or doctrine line asserting the removed thing stays absent: that keeps the dead decision alive as maintenance. Git history is the record of what was removed and why. Tests assert what the current direction requires, never the absence of a past one.
- Use one placement rule everywhere. A skill defines reusable method or an independently invoked capability; a worker receives it per dispatch, never as a standing identity. A reference is supporting detail for one parent skill and is loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- Each dispatch gives one task a fresh context and returns a finished answer. The dispatcher reads the answer, not the transcript. Workers ask the orchestrator; the orchestrator answers and resumes them. Workers do not coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and vendor attribution badges or footers.

## Developing bottega

- This repo's product is skills prose read by fable and sol, held by evals and tests. Changes are authored directly with the owner: the conversation shapes the content, the session works in a worktree and branch, `npm test` runs green, and a PR the owner merges delivers it. Review here means reading the diff against `REVIEW.md` and the skill-writing doctrine, a second model family's read when the change warrants it, never the autoreview engine for prose (its own contract exempts prose-only diffs). `/bottega:maestro` remains for changes to what the software does (hooks, scripts, schemas, workflows).
- Direct authoring keeps a run's documentation duties. In the same diff: a decision meeting the ADR bar (`bottega:codebase-design`) lands its ADR, a diagnosed failure lands its lesson in `docs/lessons/`, and every doc a change makes stale is fixed or deleted. The method this repo preaches to host repos governs this repo.
- Every merge to main is a release, enforced by the release gate (`.github/workflows/release-gate.yml`): the PR bumps `version` in `.claude-plugin/plugin.json` above the base, syncs the README's command table, and the release commit is titled `bottega X.Y.Z: <headline> (#PR)`.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
