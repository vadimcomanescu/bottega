---
name: panel
description: Independent comparison for one Bottega plan decision that would be expensive to reverse. Use from the Plan phase when the repository has no established answer.
user-invocable: false
---

# Panel

Load [the host transport reference](../run/references/host-transports.md) and use only the active host's panel routes. The task contains the approved spec, relevant constraints, and repository pointers. Do not include the orchestrator's preferred answer. If a panelist would need the current conversation to understand the question, complete the task prompt before dispatch.

Collect one Codex-family draft and one Claude-family draft independently against `references/panelist.schema.json`. Blind their identities, then give only the task and drafts to the compare-only judge against `references/judge.schema.json`. The judge identifies agreement, contradictions, partial coverage, unique points, and omissions. The orchestrator reads the drafts and comparison, resolves disagreements by evidence, and makes the decision. The panel does not vote or decide.

Record the decision and any material change caused by the panel in the run brief and PR.
