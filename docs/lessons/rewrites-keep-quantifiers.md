# Compression passes lose quantifiers and acceptance bars

What happened: commit 3b95ff8 (2026-07-13) dropped the review acceptance bar entirely during a rewrite; the next commit restored it by luck of attention. Commit b5fcfd7 (0.65.0) cut "accept one head only after the evidence supports the brief and every finding is resolved" from the maestro phase text in a global shortening pass; the substance survived only because skills/review carried it. PR #77 weakened "every fixed decision in the brief" to "the plan". None of these tripped anything: no test pinned method content.

The rule: a rewrite of doctrine is diffed against the prior version for lost quantifiers ("every", "all", "only after") and acceptance bars before it lands, and the load-carrying sentences are pinned by tests so the next compression goes red instead of relying on a reader's memory.

Enforced: tests/worker-doctrine.test.ts ("pins the review interlock and its quantifiers").
