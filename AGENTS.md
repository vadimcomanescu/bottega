# bottega

Autonomous issue-to-PR runs for Claude Code and Codex: one command takes a task or issue to a delivered PR. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Claude Code plugin and marketplace manifests (`/plugin marketplace add vadimcomanescu/bottega`) |
| `.codex-plugin/plugin.json` | Codex manifest for the repository-root plugin |
| `.agents/plugins/marketplace.json` | Codex marketplace entry for the same repository-root plugin |
| `skills/run/SKILL.md` | The shared entry (`/bottega:run` in Claude Code, `$bottega:run` in Codex) and the orchestrator's method: isolate, discover, spec, plan, build, review, QA, deliver. `references/host-transports.md` owns the host split; `references/codex-dispatch.md` carries the Claude-host Codex mechanics |
| `skills/implementing` | Shared builder method for Claude and Codex: one assigned slice, Ponytail minimum-code checks, test-first implementation, supplied technology skills |
| `skills/reviewing` | Shared reviewer method for Claude and Codex. Owns the report contract and independent architecture verdict: `references/report.schema.json` and the Claude reviewer workflow `assets/review-dispatch.js` |
| `skills/review/SKILL.md` | The cross-family review gate (`/bottega:review` or `$bottega:review`), one home for the gate with two callers (run's Review phase and land). Freezes the target, dispatches one reviewer per model family, and defines adjudication, delta rounds, and the caps |
| `skills/land/SKILL.md` | Takes an open PR through review-fix rounds to mergeable (`/bottega:land` or `$bottega:land`). Owns the GitHub surface (inline comments and review threads via `scripts/pr-threads`), the size gate, the stop conditions, the terminal notification, and the merge policy |
| `skills/panel` | Independently invoked comparison for a costly plan decision. Owns its workflow and uses the panelist and panel-judge agents |
| `skills/codebase-design` | House design rules: domain model first, deep modules, complete interfaces, architecture brief. The orchestrator designs by them; reviewers judge against them; builders receive the resulting brief |
| `skills/writing-great-skills` | Vendored reference for writing skills that behave predictably, model-invocable, reachable from `.claude/skills` and `.agents/skills` through symlinks so every runtime loads the one copy |
| `agents/` | Reusable worker identities for builder, reviewer, QA, mechanic, panelist, and panel judge. Claude workers load them as plugin agents; Codex workers receive their absolute paths. Agent files never pin model or effort |
| `scripts/` | `codex-exec`, the Claude-host boundary to Codex; `claude-exec`, the Codex-host boundary to Claude; `exec-common.js`, the Claude boundary checks; and `pr-threads`, the GitHub review-thread boundary |
| `hooks/` | Claude-only route and entry guards. The route guard applies to Claude Code sessions that own a live run; the entry guard points Claude run-intent prose at `/bottega:run` |
| `docs/internal/repository-workflow.md` | Required worktree, branch, issue, pull request, verification, and cleanup procedure for changes to this repository |
| `docs/specs/` | Closed records of delivered runs, kept as history |
| `tests/` | Plugin, transport, hook, script, worker-doctrine, workflow, and report-contract tests |

In host repos, a run leaves nothing behind but the PR. Working state is the worktree and one git-private run brief, plus a gitignored owner file under `.bottega/` on the Claude host, all removed at delivery. QA recordings publish from the never-merged branch `bottega/evidence-<slug>`, which is deleted after merge.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log".
- Inside a Bottega run, orchestration is the host harness: tracked dispatches, tracked background Bash, and workflows. Never add a polling loop, hand-written scheduler, or prose that imitates in-run worker tracking. An instruction line that restates or replaces a harness capability is a defect. The GitHub issue claim in `docs/internal/repository-workflow.md` coordinates repository ownership across machines; it does not orchestrate workers inside a run.
- Keep one canonical `skills/`, `agents/`, and `scripts/` tree for both hosts. Host differences live in `skills/run/references/host-transports.md`, the two external adapters, Claude-only hooks, and the two manifests. A copied or generated Codex doctrine tree is a defect.
- On Codex, the active GPT-5.6 Sol Ultra task orchestrates native subagents and never launches another Codex process. On Claude Code, Fable 5 orchestrates and all Codex workers launch through `scripts/codex-exec`.
- Every task that changes tracked files runs on a dedicated branch in an isolated linked worktree and ends in a pull request. The primary checkout is for synchronization and worktree management only; it must not receive tracked-file edits. Read `docs/internal/repository-workflow.md` before changing this repository.
- Every run gets: isolation in its own worktree and branch, a build, host gates green after every integrated slice, one cross-family review of the integrated diff, a QA drive with recorded evidence, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (hook and script unit tests). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Creating or editing any skill or agent file, load `skills/writing-great-skills` and evaluate the writing against it. That directory is vendored: keep its body text as imported; the style rules above govern the rest of the repo, not it.
- Editing the skills (`skills/*`, `agents/*`), two tests per line: could the worker derive it from the repo or from competence, and would the active orchestrator already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Read every worker rule as the weakest-equipped worker that will receive it: it may have no slash commands, no subagents, and no plugin-root variable.
- Put durable constraints where the worker that must obey them will receive them. The orchestrator owns gates, routing, architecture, and exceptions. Do not script decisions the orchestrator can make from the repository and evidence.
- Use one placement rule everywhere. An agent defines a named worker in an isolated context: its perspective, authority, forbidden actions, available tools, and required result. A skill defines reusable method or an independently invoked capability. Keep a skill when it crosses roles, runtimes, or phases, or when it owns a workflow, script, schema, or other contract. A reference is supporting detail for one parent skill and is loaded only in the phase that needs it. Hooks, schemas, tests, and workflow code enforce deterministic rules.
- A current call count is not a placement rule. Inline method in an agent only when it serves one kind of task for that role, in one runtime, with no independent invocation and no assets or contract of its own. Otherwise keep the agent thin and preload or dispatch the skill. Do not copy or summarize a shared skill into an agent.
- Each dispatch gives one task a fresh context and returns a finished answer. The dispatcher reads the answer, not the transcript. Workers ask the orchestrator; the orchestrator answers and resumes them. Workers do not coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and vendor attribution badges or footers.

## Review guidelines

Reviewing a change to this repository, read root `REVIEW.md` first. It carries the Bottega-specific review risks.
