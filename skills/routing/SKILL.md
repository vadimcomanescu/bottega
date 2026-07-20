---
name: routing
description: Pick the model and effort for one worker dispatch. Invoke before starting any worker to choose which model runs it. Not user-invocable.
user-invocable: false
---

# Routing

Return one model and effort for the dispatch the caller is about to start. Read the registry, apply the rule, name the pick.

## The rule

Use a cheap model only when all four hold:

- the task has one clearly stated right answer,
- a wrong result stays inside the task,
- redoing it costs nothing,
- a test or gate rejects a wrong result on its own.

Use a strong model otherwise.

Never pick the orchestrator's own model for a worker. One exemption: the review gate's engines run their fixed cross-family models even when one matches the orchestrator's; the gate is mandatory and its models are pinned in skills/review.

Effort follows the same call: a strong pick runs at high effort (xhigh for a reviewer of the other family's code), a cheap pick at the model's default.

## Reading models.json

`models.json` is a flat array, one row per callable model. Each row carries:

- `id`: the name to pass on the dispatch.
- `family`: workers whose family differs from the reviewer's give the cross-family review gate its two sides.
- `cost_in`, `cost_out`: per-Mtok input and output price.
- `context`: token window.
- `work`: the task kinds the model is qualified for (build, review, qa, panel, mechanical, orchestrator).
- `notes`: caveats, including where a figure is an estimate.

Keep the rows whose `work` lists this task's kind, drop the orchestrator's own model, then pick cheap or strong by the rule. Among the rows still standing, cost and context break the tie.
