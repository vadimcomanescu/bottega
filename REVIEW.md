# Reviewing bottega

Bottega is a method in markdown; most defects are false claims, drifted duplicates, and register violations, not crashing code.

- Model selection lives in `skills/routing`: the model table and the task rules. A skill that restates them or pins a model elsewhere is a defect, with one sanctioned exception: the review gate's engine pins in `skills/code-review/references/autoreview.md`. Callers say "invoke bottega:routing".
- Enforcement is one rule in `hooks/route-guard.mjs`: a session owning a live run names a model on every worker start, never fable. Enforcement is verified on Claude Code; the Codex registration is installed by setup and is best effort. Guard changes need `tests/route-guard.test.ts` to still pass against real event shapes.
- There are no agent identity files. Worker method arrives per dispatch from skills (`building`, `qa`).
- The skills tree is the product and must stay harness-portable: nothing in `skills/` may assume slash commands, subagents, or a plugin root exists, except where a harness is named.
- The panel's seats and the plan strengthen pass's reviewer are fresh CLI contexts (including fable drafts, and the fable cold read of a Codex orchestrator's plan); they are not worker dispatches and the guard does not police them. The routing rules record fable's sanctioned seats.
- The integrated review always runs both families through the vendored autoreview helper; the codex CLI is a hard requirement for it.
- Every claim in AGENTS.md, README.md, and skill cross-references must be true of the tree in the same diff that changes the tree.
- Register: plain engineering English, no em dashes, no "bearing"/"ledger", one route verb ("invoke").
- `docs/lessons/` carries the repository's failure records. Two carry review checks, and a violation of either is a finding: a capability the diff adopts ships either its working verification or a tracking issue (neither present is the finding), and a delivered design does not contradict the spec's own research record.
