Status: agreed 2026-07-21

# The review gate runs the vendor's own contract

## Problem to solve

A run's review gate layers a second review method over the vendored reviewer it invokes. After the one panel round, each fix is re-checked by a scoped delta round: an engine that sees only the fix hunks, blind to the change the fix belongs to, so its verdict costs an invocation and answers almost nothing. A fixed round ceiling can end the review with accepted findings still open, which hands the unfinished work back to the owner. Simplification runs as its own pass before the review, so cleanup and review judge the code at different moments under different rules. QA repairs re-enter review through a special path of their own. The operator reading a run cannot say what "reviewed" guarantees, and the maestro executes two overlapping methods where the vendor wrote one.

## How we measure success

Over the runs that follow: every review ends with each finding fixed, refiled as a follow-up, or escalated — none abandoned at a counter. Completed reviews spend fewer engine invocations than the delta-round design at the same defect discovery. The vendored reviewer updates by plain re-copy plus one reconcile step. No run stalls inside a review that cannot terminate.

## The launch post

A run's review now works the way the vendored reviewer's author works. Both model families review the whole integrated change once. The maestro verifies each finding against the real code and accepts or refutes it. Fixes land, the focused tests run, and a single quick engine pass re-checks the change — again and again until nothing blocking remains. The first round also sweeps for reuse, simplification, and efficiency cleanups, the same sweep Claude Code's built-in review bundles, so the separate simplification pass disappears. Later rounds hunt only correctness, security, and regressions; a new cleanup idea arriving late becomes a follow-up, never another round.

A substantive fix goes back to the builder that built that part of the change, resumed with its memory of the work intact — on Codex threads as the method already does, and on Claude workers again, now that the harness defect that once made that unsafe is fixed. A trivial fix the maestro applies directly. When a builder's thread is gone or its context is near its budget, a fresh worker takes over, briefed with the findings and the builder's own report.

Every finding ends in exactly one of three states: fixed, refiled, or escalated to the owner. When two fix cycles fail to converge, the review stops fixing and reclassifies everything still open; a blocker that will not converge is escalated, not retried forever and not dropped.

QA feeds the same loop. A defect found by driving the product is classified, fixed, and re-checked exactly like a review finding, and QA then re-drives only the scenarios that failed and the scenarios the fix touched. QA's completion bar is unchanged: every changed scenario carries an evidenced verdict or a stated reason it could not be driven.

## Decisions

- **The review contract is the vendor's, adapted in place.** The review skill absorbs the vendored reviewer's caller contract — verify every finding against the real code, fix, run focused tests, rerun until clean, classify under the scope governor — with the vendor organization's house-specific rules removed (their issue-tracker fallbacks, their bot-provenance rules, their credential-staging path, their Windows variants, their extra engines). Precedent: the openclaw autoreview skill defines this exact loop; the deviation removes another organization's house rules, not method. The repo's own lesson that callee facts stay with the callee settles the placement: one contract, one home, callers reach it by invocation.
- **The vendored directory holds only the runnable helper, its tests, and its license.** Upstream updates arrive by re-copying those files unchanged, plus one reconcile step: diff the upstream contract prose for changes that track helper behavior and fold them into the review skill. Precedent: vendor-unchanged practice; the deviation (dropping the vendor's prose from the load path) exists because two loaded doctrines for one gate was the observed failure.
- **One both-family panel, then single-engine reruns until no accepted blockers remain.** The expensive round happens once; every recheck is the helper's plain single-engine call. Precedent: the autoreview loop itself, whose reruns are its default single-engine invocation and whose panel is the opt-in first pass; Cursor's reviewer re-reviewing on every push is the field's closest rerun analogue. The small-diff single-engine exception for standalone pull requests is unchanged.
- **Cleanup rides in round one of review.** Reuse, simplification, and efficiency join the first round's review basis; the separate simplification pass is deleted; rounds after the first review correctness, security, and regression only, and new cleanup findings become follow-ups. Precedent: Claude Code's built-in review bundles exactly these three sweeps into review at every effort level.
- **Termination by convergence, not by counter.** Two fix cycles without convergence trigger reclassification of everything still open: a true blocker continues, a follow-up is refiled, a design question escalates. Precedent: the autoreview scope governor's two-cycle pause. This reverses the earlier fixed three-round stop; the evidence that changed the call is that a counter ends reviews with accepted findings open, which the owner must then re-open by hand.
- **Fixes route to the resumed builder.** Substantive accepted findings go to the builder that owns the module, resumed with its context: Codex threads as the method already documents; Claude workers again by follow-up message, reversing the earlier ban. The ban's premise — a resumed worker silently re-running on the sender's model — is fixed in the harness (per-invocation model survives resume since Claude Code v2.1.211, read from the vendor's documentation at claim time). A worker is resumed only through its own harness's native mechanism: the session that spawned a Claude worker continues it by follow-up message, a Codex thread resumes through the Codex CLI, and a session running on a different harness than the builder never attempts resume — it takes the fallback. Fallback stays: a dead thread means a fresh dispatch carrying the findings and the builder's prior report; a thread near its context budget is reseated. A finding no module owns goes to the maestro or one designated fixer, never two writers in one file. Trivial findings the maestro applies inline, a narrow carve-out from the rule against hand-patching worker output. Precedent: this repo's original pipeline design (the persistent implementor holding the context of what it built); Cursor cloud-agent followups and Devin session continuation are the field's same mechanism.
- **QA repairs use the same loop and re-drives are scoped.** A QA-found implementation defect enters the fix-and-recheck loop; there is no separate repair review path. QA then re-drives the failed scenarios and the scenarios the fix touched, never the full table. Precedent: confirmation testing plus impact-scoped regression testing, the standard testing-practice pair; the deviation from the agent-product field — which drops scenario re-verification after fixes entirely — is deliberate, because this method has no human in the middle to absorb that gap.
- **Doctrine tests update deliberately.** The pinned round-counter sentence is replaced by the convergence rule, and new pins hold the resume mechanic, the round-one-only cleanup rule, and completion at a clean final head. Precedent: the repo's lesson that rewrites lose quantifiers unless the load-carrying sentences are pinned.
- **One lesson is filed.** A vendored skill's contract binds the caller as written; wrap it with plumbing, never with a rival loop.

## Details

The plumbing the vendor's contract does not cover stays with the review gate, stated once there: the frozen base and head identities the review stands on, the review working copy at the pull request's head, the per-pull-request claim, review intent passed through a file so untrusted pull-request text never reaches a command line, the completion status posted where the code host reads it, and the family policy. The first round's intent carries the plan and domain glossary, the architecture basis, the smell baseline, the reviewed repository's own review doctrine when it has one, and the cleanup sweeps. A repair brief to a resumed builder carries the accepted findings verbatim.

## Acceptance criteria

- The review skill states the whole caller contract; nothing in the method loads the vendor's prose.
- The vendored directory contains the runnable helper, its tests, and its license, and nothing else.
- No delta-round language remains anywhere in the method: not in review, not in the QA phase, not in land.
- The maestro build phase has no simplification pass; the review's first round carries the cleanup sweeps.
- The QA phase routes repairs into the review loop and scopes re-drives to failed and touched scenarios.
- The doctrine tests pin the convergence rule, the resume mechanic, the round-one cleanup boundary, and clean-at-final-head completion, and fail if a round ceiling returns.
- The full verification gate is green.

## Out of scope

The build-phase risky-slice reviewer and its fixer. The helper script's bytes. The routing table. The panel skill. The spec method.

## Deferred to the build

The exact wording of every rewritten doctrine sentence. The reconcile checklist wording for upstream re-copies. Verifying against the installed guard that resumed Claude workers need no route-guard change. The final choice of which sentences carry the new test pins.
