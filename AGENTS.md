# bottega

Autonomous issue-to-PR runs for Claude Code, built for Fable to orchestrate: one command takes a task or issue to a delivered PR. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests, one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The single entry (`/bottega:run`) and the orchestrator's whole method: isolate, discover, spec, plan, build, review, QA, deliver, plus the routing table and QA repair classification. `references/codex-dispatch.md` carries the codex mechanics |
| `skills/implementing` | Shared builder method, loaded by both Claude-agent and Codex builder dispatches; it also loads the house design rules |
| `skills/reviewing` | Shared reviewer method, loaded by both Claude-agent and Codex reviewer dispatches. Owns the report contract, including architecture checks: `references/report.schema.json` and the Claude reviewer workflow `assets/review-dispatch.js` |
| `skills/panel` | Feedback on a costly plan decision: independent frontier panelists, blinded; a compare-only judge; the orchestrator synthesizes. Panelists are dispatched by its bundled workflow script |
| `skills/codebase-design` | House design rules: vocabulary, architecture contracts, deep-module principles, `CONCEPTS.md` domain glossary. The orchestrator designs by them, builders follow them, reviewers prove conformance |
| `agents/` | Worker identity: builder and reviewer point at their shared skills; panelist and panel-judge carry identity only for the panel workflow. Agent files never copy method or pin model or effort; routing lives in the orchestrator's table, enforced by the route guard |
| `scripts/` | `codex-exec`, the one place a `codex exec` invocation is assembled; every codex worker launches through it |
| `hooks/` | Route guard (PreToolUse): the named builder and reviewer agents always; any dispatch or workflow from a session that owns a live run (`.bottega/run/<slug>/owner`) must name a model, never fable (the panel's own script is the one sanctioned fable workflow; an unreadable script is denied). Entry guard (UserPromptSubmit) points run-intent prose at `/bottega:run` |
| `docs/specs/` | Closed records of delivered runs, kept as history |
| `tests/` | Unit tests for the hooks and the review report contract |

In host repos, a run leaves nothing behind but the PR. Working state is the worktree, one git-private run brief, and one owner file under `.bottega/` (gitignored), all removed at delivery. QA recordings publish from the never-merged branch `bottega/evidence-<slug>`, deleted after merge; the evidence's job ends when the user merges.

## Rules

- Write plain engineering English. Standard engineering terms only: no metaphors, no invented vocabulary, no theatrical naming. This binds every file in the repo, including code comments, UI strings, and hook messages.
- No em dashes, anywhere. Use periods, commas, colons, or parentheses.
- Banned tic-words, no exceptions: "bearing" (e.g. "judgment-bearing"), "ledger". Say the plain thing: "makes judgment calls", "the log".
- Orchestration is the harness: tracked dispatches, tracked background Bash, workflows. Never a polling loop, a hand-rolled scheduler, or a liveness apparatus in prose. An instruction line that restates or replaces a harness capability is a defect.
- Every run gets: isolation in its own worktree and branch, a build, host gates green at every integrate, one cross-family review of the integrated diff, a QA drive with recorded evidence, and a PR. The integrated review is the one thing never dropped.
- Verification gate: `npm test` (hook and script unit tests). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing the skills (`skills/*`, `agents/*`), two tests per line: could the worker derive it from the repo or from competence, and would plain Fable already do it better with no instruction? Either way, cut it. The workers are frontier models; a rule that only prevents a mistake a competent engineer would not make is noise. Constrain only where a real failure was observed or the cost of the mistake is high. Then read every worker rule as the weakest-equipped worker that will receive it: a codex worker has no slash commands, no subagents, no plugin root.
- Spend the constraint budget on workers, not the orchestrator. Worker instructions are hard rules; orchestrator instructions are gates, decisions, and the house design rules. Inside the gates its judgment is unconstrained.
- Where a role's instructions live: a skill is method consumed by more than one role or more than one runtime; method small enough to ride in a dispatch (QA, the docs sweep) lives in `skills/run` and travels in the brief. Agent files carry identity and point to shared method when one exists; they never summarize it.
- A dispatch is a context boundary before it is a worker: it buys a fresh window and returns a finished answer. The dispatcher reads answers, never transcripts. Conversation runs hub-and-spoke: workers ask the orchestrator, the orchestrator answers and resumes them; workers never coordinate with each other directly.
- Keep `CLAUDE.md` symlinked to this file.
- PR bodies contain review-relevant content only. Omit tool, model, and vendor attribution badges or footers.
