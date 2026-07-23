---
name: routing
description: Pick the model and effort for one worker dispatch. Invoke before starting any worker to choose which model runs it. Not user-invocable.
user-invocable: false
---

# Routing

Return one model and effort for the dispatch the caller is about to start: find the task's rule, take the model it names, check your harness can reach it, name the pick.

## The models

Scores run 1 to 10, higher is better; a dash is a score not yet measured. Intelligence is how hard a problem the model finishes unsupervised. Taste is the quality of work a human judges by looking: UI, wording, API shape. Haiku is never dispatched.

| model | family | intelligence | taste | notes |
| --- | --- | --- | --- | --- |
| fable-5 | anthropic | 9 | 9 | The orchestrator's seat, a panel seat, the claude review engine, and the cold plan editor under a Codex orchestrator. Priciest row; spent where a wrong answer costs the most downstream. |
| opus-4.8 | anthropic | 8 | 8 | The user-facing worker. |
| gpt-5.6-sol | openai | 8 | 6 | The builder. Fast and token-lean at xhigh. |
| sonnet-5 | anthropic | 6 | 7 | Cheap tier under Claude Code: mechanical work, exploration, QA drives. |
| gpt-5.6-terra | openai | 6 | 5 | Cheap tier under Codex. |
| gpt-5.6-luna | openai | 5 | 4 | Fully specified high-volume work under Codex. |

## The rules

- Build a slice or a repair: gpt-5.6-sol at xhigh.
- User-facing work, which a gate cannot judge and a human judges by looking (UI, wording, API shape, spec and PR prose): opus-4.8 at high. When a planned slice is also user-facing, this rule wins. When the output fails its requirement, the orchestrator redoes that piece in its own turns, and the redo passes the same review as any worker's code.
- Review gate: both families, pinned in the autoreview document's run rules (claude-fable-5 and gpt-5.6-sol).
- Spec-conformance check (a run's Review phase): gpt-5.6-sol at high under a Claude orchestrator, opus-4.8 at high under a Codex orchestrator; never the orchestrator's own model.
- Plan strengthen pass (a run's Plan phase): gpt-5.6-sol at xhigh under a Claude orchestrator, fable-5 at xhigh under a Codex orchestrator; never the orchestrator's own model.
- QA drive: your harness's cheap tier at its default effort, driving with the tools `bottega:qa` names.
- Mechanical work and exploration (reads, searches, renames, doc sync, format conversion): your harness's cheap tier at low effort.
- Cross families to buy capability, never to save cost: reach the other vendor for sol's building, for opus on user-facing work, for the review gate's engines, or for the cold reads on the plan and the spec; cheap work always uses your harness's own cheap tier.
- These are defaults, not limits. Judge the output, not the price: a worker whose result fails its requirement gets one rerun on a stronger model or higher effort after the failure is diagnosed. Never automatic, never more than one model tier or effort level at a time.
- No worker dispatch runs on the orchestrator's own model.

## Dispatch mechanics

First locate yourself: which harness you run in decides the mechanics below.

- In Claude Code: Claude models pin per dispatch natively. A GPT model runs through `scripts/codex-exec`, launched from a wrapper subagent ([skills/maestro/references/codex-dispatch.md](../maestro/references/codex-dispatch.md)).
- In Codex: no model pins per subagent; every native subagent runs the one default subagent model from config, so set that default to the cheap tier and dispatch cheap work natively. Every other model is a CLI shell-out from a wrapper subagent: `scripts/codex-exec` for a GPT model, `claude -p "<brief>" --model <model> --effort <effort>` for a Claude model.
- The wrapper subagent, either harness: one native subagent per worker, your harness's cheap tier at low effort. It runs the shell-out as one foreground call with an explicit timeout covering the whole run, and returns the worker's report verbatim, so the worker holds a visible row from launch to report. Never background the shell-out, from your own turn or the wrapper's: a backgrounded dispatch holds no row and, inside a subagent, never delivers its result ([docs/lessons/subagent-background-work-dies-silently.md](../../docs/lessons/subagent-background-work-dies-silently.md)).
