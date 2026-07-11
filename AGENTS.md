# bottega

An autonomous agent system built for Fable to orchestrate: one command takes a task or issue to a delivered PR, unassisted. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `.claude-plugin/` | Plugin + marketplace manifests — one-command install (`/plugin marketplace add vadimcomanescu/bottega`) |
| `skills/run/SKILL.md` | The single entry (`/bottega:run`) and the whole maestro doctrine: discovery (the unknowns), the priced proof, harness-native orchestration, the routing table, the review loop, delivery, resume. `references/` carry the codex dispatch grammar and the parallel-slice mechanic protocol |
| `skills/spec` | The contract instrument — spec doc (`docs/specs/<YYYY-MM-DD>-<feature-slug>.md`), scenarios authored directly in `features/`, the acceptance toolchain installed at run start, the gate handoff, the unattended sign. Bought in the priced proof when the work introduces product behavior worth signing; never standing. Template in `references/` |
| `skills/signoff` | The gate — one collaborative spec doc, comment loop, `SIGNED` cascade; the standing header in `references/`, the local canvas in `assets/` |
| `skills/panel` | Drafting instrument for hard one-shot artifacts — independent frontier panelists, blinded; a compare-only judge; the maestro synthesizes. Seats authored in its bundled workflow script |
| `skills/implementing`, `skills/reviewing`, `skills/qa`, `skills/documenting`, `skills/storyboarding` | Self-contained actor methodology, loaded by dispatched seats by path — nothing loaded from any host pack |
| `skills/codebase-design` | House design discipline — vocabulary, deep-module principles, `CONCEPTS.md` domain glossary; the maestro designs by it, dossiers carry it, reviewers judge against it |
| `agents/` | Actor identity: builder, reviewer, qa, documenter, storyboarder, mechanic, panelist, panel-judge — agent files point at methodology, never copy it, and never pin model or effort; routing lives in the maestro's table, enforced by the route guard |
| `hooks/` | Route guard (PreToolUse) — named worker seats always, and any dispatch from a session that owns a live run (`.bottega/wt/<feature-slug>/` + `.bottega/run/<feature-slug>/owner`): rejected when it omits `model`, names fable (cold read passes by naming itself), or misroutes a named seat. Entry guard (UserPromptSubmit) points run-intent prose at `/bottega:run` |
| `docs/specs/` | Closed records of delivered commissions |
| `tests/` | Unit tests for the hooks |

In host repos, a run's working state lives under `.bottega/`, gitignored; the committed artifacts are the PR and, on contract runs, the spec doc, `features/*.feature`, and the step handlers in the host's test tree. Evidence the user sees lives in the delivery PR — the one exception is the never-merged evidence branch (`bottega/evidence-<feature-slug>`), reaped after merge.

## Rules

- Orchestration is the harness: tracked dispatches, tracked background Bash, workflows — never a polling loop, a hand-rolled scheduler, or a liveness apparatus in prose. A doctrine line that restates or replaces a harness capability is a defect.
- Proof is priced, never standing: the floor is isolation, build, host gates green, cross-family review, PR. Everything above it is bought by a named risk and disclosed in the PR. Cross-family review is the one invariant no lane prices away.
- Approval on a contract run lands the spec doc's status flip and `features/` in one sign commit; the delivery PR prints the `features/` diff since that commit, and the user reading it is the whole mechanism.
- Verification gate: `npm test` (hook unit tests). Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Editing doctrine (`skills/*`, `agents/*`), two tests per line: could the actor derive it from the repo or from competence — and would plain Fable already do it better with no instruction? Either way, cut it. Then read every worker fence as the weakest-equipped seat that will receive it — a codex seat has no slash commands, no subagents, no plugin root.
- Spend the constraint budget on workers, not the maestro. Worker doctrine is fences and ratchets; maestro doctrine is gates, decisions, and the house design discipline — inside the gates its judgment is unconstrained.
- Where a role's doctrine lives: a skill is doctrine consumed by more than one role or more than one runtime; behavior of exactly one role on one runtime lives in its skill, with the agent file a pointer — agent files point, never summarize.
- A seat is a context boundary before it is a worker: a dispatch buys a fresh window and returns a finished answer — the dispatcher reads answers, never transcripts.
- Keep `CLAUDE.md` symlinked to this file.
