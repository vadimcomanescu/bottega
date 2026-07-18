# bottega

Autonomous issue-to-PR runs for Claude Code, built for Fable to orchestrate: one command takes a task or issue to a delivered PR. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is | Read it when |
| --- | --- | --- |
| `.claude-plugin/` | Plugin and marketplace manifests | Changing install or release metadata |
| `skills/run/SKILL.md` | `/bottega:run`, the orchestrator's whole method and the routing table | Anything touches a run's phases, routing, or state |
| `skills/spec/SKILL.md` | `/bottega:spec`, the cold-mode spec: grill unknowns, prepare the spec, push to tickets; run's Spec phase routes to its `references/spec-format.md` | Anything touches spec content, unknown discovery, or ticket push |
| `skills/improve/SKILL.md` | `/bottega:improve`, one agreed improvement filed as an issue and handed to run | Changing how improvements are found or handed off |
| `skills/setup/SKILL.md` | `/bottega:setup`, one-time reconciliation of a host repo with the methodology | Changing what setup writes or verifies |
| `skills/implementing` | Builder method shared by Claude and Codex workers | Changing how builders work a slice |
| `skills/autoreview` | Vendored review helper from openclaw/agent-skills; `VENDOR` pins it | Updating the vendored copy only |
| `skills/review/SKILL.md` | `/bottega:review`, the cross-family review gate; run's Review phase and land both call it | Anything touches review inputs, adjudication, or caps |
| `skills/land/SKILL.md` | `/bottega:land`, an open PR to verified-mergeable; owns the GitHub review surface | Anything touches PR threads, claims, stops, or merge |
| `skills/panel` | Blinded comparison for one costly plan decision | Changing panel seats or judging |
| `skills/codebase-design` | House design doctrine: domain model, deep modules, documentation architecture | Any design, review, or setup doctrine question |
| `skills/writing-great-skills` | Vendored skill-writing reference | Creating or editing any skill or agent file |
| `agents/` | Worker identities: builder, QA, panelist, panel judge | Changing a worker's authority or tools |
| `scripts/` | Single assembly points for external calls: `codex-exec`, `pr-threads`, `pr-claim`, `issue-claim`; each header states its contract | Any codex launch or GitHub mutation mechanics |
| `hooks/` | Route guard (PreToolUse) and entry guard (UserPromptSubmit); each file states its own policy | Changing what dispatches or prompts are denied |
| `docs/adr/` | Append-only decision records | Understanding why a current rule exists before changing it |
| `docs/specs/` | Closed records of delivered runs, kept as history | Retrieving how a past run went, never as current truth |
| `tests/` | The verification gate's suites | Any change; the gate pins doctrine and script contracts |

The vendored skill directories are symlinked from `.claude/skills` and `.agents/skills` so every runtime loads the one copy.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log".
- Orchestration is the harness: tracked dispatches, tracked background Bash, workflows. Never add a polling loop, a hand-written scheduler, or prose that imitates worker tracking. An instruction line that restates or replaces a harness capability is a defect.
- Every run gets: isolation in its own worktree and branch, a build, host gates green after every integrated slice, one cross-family review of the integrated diff, a QA drive with recorded evidence, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (the vitest suites plus the vendored autoreview Python suites; needs python3 and git on PATH). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Creating or editing any skill or agent file, load `skills/writing-great-skills` and evaluate the writing against it. That directory is vendored: keep its body text as imported; the style rules above govern the rest of the repo, not it.
- Editing the skills (`skills/*`, `agents/*`), two tests per line: could the worker derive it from the repo or from competence, and would plain Fable already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Then read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions that Fable can make from the repository and evidence.
- When a decision replaces an old direction, strip the old one completely and stop. Never add a test, guard, or doctrine line asserting the removed thing stays absent: that keeps the dead decision alive as maintenance. Git history is the record of what was removed and why. Tests assert what the current direction requires, never the absence of a past one.
- Use one placement rule everywhere. An agent defines a named worker in an isolated context: its perspective, authority, forbidden actions, available tools, and required result. A skill defines reusable method or an independently invoked capability. Keep a skill when it crosses roles, runtimes, or phases, or when it owns a workflow, script, schema, or other contract. A reference is supporting detail for one parent skill and is loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- A current call count is not a placement rule. Inline method in an agent only when it serves one kind of task for that role, in one runtime, with no independent invocation and no assets or contract of its own. Otherwise keep the agent thin and preload or dispatch the skill. Do not copy or summarize a shared skill into an agent.
- Each dispatch gives one task a fresh context and returns a finished answer. The dispatcher reads the answer, not the transcript. Workers ask the orchestrator; the orchestrator answers and resumes them. Workers do not coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and vendor attribution badges or footers.

## Developing bottega

- Every change to this repo is delivered through `/bottega:run` on this repo. The run executes the installed version of the method while producing the next. There is no manual path; trivial work scales down inside a run, never outside one (`docs/adr/0001-deliver-through-run.md`).
- A release is a run whose PR also bumps `version` in `.claude-plugin/plugin.json`, syncs the README inventories (the entry-point commands and the repo layout), and titles the release commit `bottega X.Y.Z: <headline> (#PR)`.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
