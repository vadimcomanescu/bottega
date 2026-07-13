# Costly decision panel

Use the panel for one plan decision that is expensive to reverse. Two model families answer independently, a judge compares blinded drafts, and Fable makes the decision.

Run the bundled workflow:

    Workflow({ scriptPath: "<install root>/skills/run/assets/panel.js",
               args: { task: <one self-contained prompt>,
                       codexExec: <absolute path to scripts/codex-exec> } })

The task contains the decision as a question, the approved spec, constraints, and repository pointers. Leave out Fable's preferred answer. If a panelist would need session context, the task is incomplete.

Read the returned comparison. Resolve disagreements by evidence, include relevant points seen by only one draft, and record where the panel changed the plan.
