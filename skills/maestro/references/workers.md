# Worker table

Every worker a run dispatches, with the model and effort its dispatch call names. One row is one worker, one model, one effort: a row never carries two models or two efforts, so either can move without touching the other.

| Worker | Model | Effort |
| --- | --- | --- |
| builder | opus-5 | medium |
| explorer | opus-5 | medium |
| prototyper | opus-5 | medium |
| QA driver | opus-5 | default |
| mechanic | opus-5 | low |
| plan editor | gpt-5.6-sol | xhigh |
| conformance checker | gpt-5.6-sol | high |

The mechanic's row covers the mechanical jobs the orchestrator dispatches itself: renames, doc sync, shell relays. No row names fable-5: that is the orchestrator's own model, and a worker dispatched as a subagent never runs on it.

A GPT row runs as a codex dispatch per [the codex dispatch method](codex-dispatch.md), which takes the model and effort from here and the sandbox from the dispatch site. A Claude row runs as a subagent named on the call.

This table covers the run's workers. Two dispatchers are invoked on their own and hold their own models: `bottega:panel` names its seats, and the vendored review engine names its engines.
