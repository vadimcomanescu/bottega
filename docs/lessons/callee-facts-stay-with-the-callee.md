# Callee facts stay with the callee; the caller carries the invocation

What happened: across 0.65.0 through 0.71.0 (2026-07-20), maestro's Isolate and Spec phases restated the spec skill's facts: the spec file's directory, its naming convention, its approval semantics. Each correction added another restatement at the complaint site, and one added a test pinning the same sentence in two files. The copies drifted, and drifted copies reintroduced issue-as-spec three times in one day.

The rule: a caller carries the invocation and its own constraints, never the callee's method or facts. A fact lives in one skill; every other file reaches it through the invocation. Fixing a duplication means moving the fact to its owner and deleting the copies, not rewording them, and each sentence added to a caller must fail the question "does the invocation alone already carry this?"

Enforced: tests/worker-doctrine.test.ts ("makes the spec a repo file with its naming owned by the spec skill alone").
