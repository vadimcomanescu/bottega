---
name: routing
description: Pick the model and effort for one worker dispatch. Invoke before starting any worker to choose which model runs it. Not user-invocable.
user-invocable: false
---

# Routing

Return one model and effort for the dispatch the caller is about to start: find the task's rule, take the model it names, check the host can reach it, name the pick.

## The models

Scores run 1 to 10, higher is better; a dash is a score not yet measured. Intelligence is how hard a problem the model finishes unsupervised. Taste is the quality of work a human judges by looking: UI, wording, API shape. Haiku is never dispatched.

| model | family | intelligence | taste | notes |
| --- | --- | --- | --- | --- |
| fable-5 | anthropic | 9 | 9 | The orchestrator's seat and the claude review engine. Priciest row; spent where a wrong answer costs the most downstream. |
| opus-4.8 | anthropic | 8 | 8 | The user-facing worker. |
| gpt-5.6-sol | openai | 8 | 6 | The builder. Fast and token-lean at xhigh. |
| sonnet-5 | anthropic | 6 | 7 | Cheap tier on Claude Code and Cursor hosts: mechanical work, exploration, QA drives. |
| gpt-5.6-terra | openai | 6 | 5 | Cheap tier on a Codex host. |
| gpt-5.6-luna | openai | 5 | 4 | Fully specified high-volume work on a Codex host. |
| composer-2.5 | cursor | 7 | 6 | Exists only inside Cursor; fast alternative for mechanical work there. |
| kimi-k3 | moonshot | 8 | - | Candidate, not adopted: half sol's token price, roughly twice the tokens for the same work. |

## The rules

- Build a planned slice: gpt-5.6-sol at xhigh.
- User-facing work, which a gate cannot judge and a human judges by looking (UI, wording, API shape, spec and PR prose): opus-4.8 at high. When a planned slice is also user-facing, this rule wins. When the output fails its requirement, the orchestrator redoes that piece in its own turns, and the redo passes the same review as any worker's code.
- Review gate: both families, pinned in the autoreview document's run rules (claude-fable-5 and gpt-5.6-sol).
- Spec-conformance check (a run's Review phase): gpt-5.6-sol at high under a Claude orchestrator, opus-4.8 at high under a Codex orchestrator; never the orchestrator's own model.
- QA drive: the host's cheap tier at its default effort, driving with the tools skills/qa names.
- Mechanical work and exploration (reads, searches, renames, doc sync, format conversion): the host's cheap tier at low effort.
- Cross families to buy capability, never to save cost: reach the other vendor for sol's building, for opus on user-facing work, or for the review gate's engines; cheap work always uses the host's own cheap tier.
- These are defaults, not limits. Judge the output, not the price: a worker whose result fails its requirement gets one rerun on a stronger model or higher effort after the failure is diagnosed. Never automatic, never more than one model tier or effort level at a time.
- No worker dispatch runs on the orchestrator's own model. The review gate's engines are exempt: the gate is mandatory and cross-family, and its models are pinned in skills/autoreview.

## Reaching the pick

- Claude Code: Claude models pin per dispatch natively. GPT models arrive as native subagents through the model proxy (bottega:setup), visible on the main screen like any worker; without the proxy, `scripts/codex-exec` runs them as tracked background work with live progress (skills/maestro/references/codex-dispatch.md).
- Cursor: both families pin per dispatch natively, and composer-2.5 is available.
- Codex: the harness cannot set a model per subagent; every native subagent runs the one default subagent model from config. Set that default to the cheap tier. Any other model is a shell-out as tracked background work: `scripts/codex-exec` for a GPT model, headless claude for a Claude model.
