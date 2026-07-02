# bottega

An autonomous long-running agent system built for Fable to orchestrate. Read `README.md` for the model; this file is the working agreement for agents inside this repo.

## Map

| Path | What it is |
| --- | --- |
| `skills/bottega/SKILL.md` | Maestro doctrine — the entry point, gates, architecture authority, routing |
| `skills/implementing`, `skills/reviewing`, `skills/qa` | Self-contained actor methodology (nothing loaded from any host pack) |
| `agents/` | Actor identity: builder, reviewer, qa — each points at its skill; no model pins |
| `features/` | Signed commissions (Gherkin). **Locked after sign-off — never edit** |
| `docs/specs/` | Spec contracts (intent, non-goals, decisions log) |
| `src/`, `tests/` | The `bottega` CLI (`sign`, `verify`) and its unit tests |
| `handlers/` | APS step handlers wiring feature steps to the CLI |
| `build/`, `acceptance/generated/` | Derived: JSON IR and generated entrypoints. Regenerate, never hand-edit |
| `.bottega/` | Runtime: `aps.lock` (pinned toolchain), `verify/<sha>/` (evidence), `wt/<slice>/` (worktrees) |

## Rules

- `features/` after sign-off, `build/`, `acceptance/generated/`, `.bottega/commission.lock`: read-only for every actor. Drift fails `bottega verify`.
- Verification gate: `npm test` (unit + generated acceptance) and, at delivery, the acceptance mutation run with survivors killed or justified in `.bottega/verify/<sha>/equivalent-mutants.json`.
- Never pipe test output inside a `&&` chain; redirect to a file and check the exit code.
- Keep `CLAUDE.md` symlinked to this file.
