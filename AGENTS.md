# bottega

Autonomous issue-to-PR runs for Claude Code, built for Fable to orchestrate: one command takes a task or issue to a delivered PR. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests, one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The single entry (`/bottega:run`) and the orchestrator's whole method: isolate, discover, spec, plan, build, review, QA, deliver, plus routing and QA failure classification. `references/codex-dispatch.md` carries the Codex mechanics |
| `skills/implementing` | Shared builder method for Claude and Codex: one assigned slice, Ponytail minimum-code checks, test-first implementation, supplied technology skills |
| `skills/autoreview` | Vendored review helper from openclaw/agent-skills. Runs the review engines against a frozen diff and returns the JSON report contract; its `SKILL.md` is the runtime doctrine for the invocation. Reachable from `.claude/skills` and `.agents/skills` through symlinks so every runtime loads the one copy |
| `skills/review/SKILL.md` | The cross-family review gate (`/bottega:review`), one home for the gate with two callers (run's Review phase and land). Freezes the target, invokes the vendored autoreview helper as a two-family panel, and defines adjudication, delta rounds, and the caps |
| `skills/land/SKILL.md` | Takes an open PR through review-fix rounds to merged (`/bottega:land`). Owns the GitHub surface (review threads via `scripts/pr-threads`), the stop conditions, the terminal notification, and the terminal merge sequence |
| `skills/panel` | Independently invoked comparison for a costly plan decision. Owns its workflow and uses the panelist and panel-judge agents |
| `skills/codebase-design` | House design rules: domain model first, deep modules, complete interfaces, architecture brief. Fable designs by them; reviewers judge against them; builders receive the resulting brief |
| `skills/writing-great-skills` | Vendored reference for writing skills that behave predictably, model-invocable, reachable from `.claude/skills` and `.agents/skills` through symlinks so every runtime loads the one copy |
| `agents/` | Claude worker identities: builder, QA, panelist, and panel judge. Builder preloads shared skills. QA carries its single-runtime method. Agent files never pin model or effort; routing lives in the orchestrator's table, enforced by the route guard |
| `scripts/` | `codex-exec`, the one place a `codex exec` invocation is assembled, and `pr-threads`, the one place a `gh api graphql` review-thread call for a PR is assembled; every codex worker launches through the first, every land review-thread action through the second |
| `hooks/` | Route guard (PreToolUse): the named builder and QA agents always; any dispatch or workflow from a session that owns a live run (`.bottega/run/<slug>/owner`) must name a model, never fable (the panel's own script is the one sanctioned fable workflow; an unreadable script is denied). Entry guard (UserPromptSubmit) points run-intent prose at `/bottega:run` |
| `docs/specs/` | Closed records of delivered runs, kept as history |
| `tests/` | Unit tests for the hooks, the `codex-exec` and `pr-threads` scripts, and the worker doctrine boundaries |

In host repos, a run leaves nothing behind but the PR. Working state is the worktree, one git-private run brief, and one owner file under `.bottega/` (gitignored), all removed at delivery. QA recordings publish from the never-merged branch `bottega/evidence-<slug>`, which is deleted after merge.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log".
- Orchestration is the harness: tracked dispatches, tracked background Bash, workflows. Never add a polling loop, a hand-written scheduler, or prose that imitates worker tracking. An instruction line that restates or replaces a harness capability is a defect.
- Every run gets: isolation in its own worktree and branch, a build, host gates green after every integrated slice, one cross-family review of the integrated diff, a QA drive with recorded evidence, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (hook and script unit tests). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Creating or editing any skill or agent file, load `skills/writing-great-skills` and evaluate the writing against it. That directory is vendored: keep its body text as imported; the style rules above govern the rest of the repo, not it.
- Editing the skills (`skills/*`, `agents/*`), two tests per line: could the worker derive it from the repo or from competence, and would plain Fable already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Then read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions that Fable can make from the repository and evidence.
- Use one placement rule everywhere. An agent defines a named worker in an isolated context: its perspective, authority, forbidden actions, available tools, and required result. A skill defines reusable method or an independently invoked capability. Keep a skill when it crosses roles, runtimes, or phases, or when it owns a workflow, script, schema, or other contract. A reference is supporting detail for one parent skill and is loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- A current call count is not a placement rule. Inline method in an agent only when it serves one kind of task for that role, in one runtime, with no independent invocation and no assets or contract of its own. Otherwise keep the agent thin and preload or dispatch the skill. Do not copy or summarize a shared skill into an agent.
- Each dispatch gives one task a fresh context and returns a finished answer. The dispatcher reads the answer, not the transcript. Workers ask the orchestrator; the orchestrator answers and resumes them. Workers do not coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and vendor attribution badges or footers.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
