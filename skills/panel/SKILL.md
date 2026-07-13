---
name: panel
description: Independent comparison for one Bottega plan decision that would be expensive to reverse. Use from the Plan phase when the repository has no established answer.
user-invocable: false
---

# Panel

Run the bundled workflow:

    Workflow({ scriptPath: "<install root>/skills/panel/panel.js",
               args: { task: <one self-contained question>,
                       cwd: <absolute repository root>,
                       codexExec: <absolute path to scripts/codex-exec> } })

The task contains the approved spec, relevant constraints, and repository pointers. Do not include Fable's preferred answer. If a panelist would need the current conversation to understand the question, complete the task prompt before dispatch.

The workflow collects one Sol draft and one Opus draft independently, blinds their identities, and asks a compare-only judge to identify agreement, contradictions, partial coverage, unique points, and omissions. Fable reads the drafts and comparison, resolves disagreements by evidence, and makes the decision. The panel does not vote or decide.

Record the decision and any material change caused by the panel in the run brief and PR.
