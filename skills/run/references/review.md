# Review orchestration

Freeze the integrated target as base, head, and tree SHAs after the host gates pass. Round 1 runs one reviewer from each model family in parallel. Give both the diff, canonical run brief, domain glossary, changed-test justifications, SHAs, and an evidence directory. Give neither builder reasoning nor the other review.

Enforce `skills/reviewing/references/report.schema.json` at dispatch. Reject a report whose target or reviewer identity differs from the dispatch. Each report includes an independent architecture verdict.

Fable decides every finding and accepts the architecture evidence. Reconcile both verdicts against every fixed decision in the brief; missing coverage or unresolved disagreement blocks acceptance. Send an implementation fix to the builder that owns the module. A design finding returns to Fable before code changes. Refute only with evidence. Each fix gets a fresh reviewer from the family opposite the fixer on the fix range.

A changed spec, domain model, or architecture brief starts a new both-family integrated review. Two failed fixes stop the repair. Round 3 stops the review. Completion requires reports at their stated SHAs, architecture evidence accepted by Fable, every finding fixed or refuted, every blocked check resolved, and all gates green.
