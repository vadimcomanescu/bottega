# 0012: The harness-engineering adoptions, recorded

Date: 2026-07-23 (recording decisions taken 2026-07-22 in releases 0.84.0 and 0.85.0-0.86.0)

The harness-engineering corpus (lopopolo/harness-engineering at `226c8d3`) was read whole against bottega; the study is [`docs/research/2026-07-22-harness-engineering.md`](../research/2026-07-22-harness-engineering.md), restored after its PR (#98) closed unmerged. Adopted, each verified against a real product repo before landing: a new rule fixes the in-scope violations of the class it names and files one issue for the rest (maestro's QA phase); severity gates the review loop, only a blocking finding forces a rerun (`skills/code-review`); the builder reports what the plan, spec, or map should have told it, corroborated by the orchestrator before anything persists (`skills/implementing`); a model-table move to a new generation re-runs the worker-rule tests (AGENTS.md); builders iterate against focused checks with full gates once at the end; setup verifies boot from a fresh worktree and drafts the critical-journeys doc.

Rejected, and the rejection stands: a context-curator sidecar (an enterprise many-source problem this repo does not have; the run branch already carries the projection a run needs), the comparative evaluation apparatus (more rigor than a method repo can amortize per change), and the corpus's coined vocabulary (the register rules exist to keep invented vocabulary out).

The study's two remaining proposals closed on 2026-07-23: every relative markdown link under the doc surfaces is now resolved by a test (the ADR references this repo shipped broken for 24 releases are the observed failure that justified it), and the PR body states its evidence's limits (`skills/close`).
