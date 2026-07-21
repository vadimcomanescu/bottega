# The plan becomes its own method, strengthened before build

Status: agreed 2026-07-22

## Problem to solve

The plan is the one artifact in a run nobody checks. The spec is agreed with the owner and the code is reviewed by two model families, but the plan, the decisions everything downstream builds on, goes from the orchestrator to the builders unexamined. It is also stored where nobody can read it later: private to the workspace, unversioned, gone when the workspace is deleted, so a resumed run cannot recover the document it is supposed to resume from. A wrong plan is the most expensive mistake a run can make and the cheapest to catch.

## The launch post

Planning is now a method of its own, invoked whole at the run's Plan phase, the same way the run invokes the spec method. The plan lives with the work: committed on the run branch, revised in the open, carrying each slice's status as it lands, and delivered with the PR next to the spec it builds. Before anything is built, the plan is strengthened: a fresh reviewer from the other model family reads the agreed spec, the plan, and the codebase cold and returns one verdict, ready or the blockers. The orchestrator resolves what it accepts, commits the revision, and repeats with new fresh eyes until a pass returns ready. Building then spends the independence the plan bought: slices that own disjoint parts of the codebase run at the same time, each in its own isolated workspace.

## Decisions

1. The spec and the plan stay two documents. The spec carries the owner's agreement and changes only with the owner; the plan changes whenever the work teaches the orchestrator something. Standard way: Devin, Manus, and compound engineering converge spec and plan into one working document; deviation, because none of those documents carries a sign-off, and one file cannot be both frozen by agreement and freely mutable.
2. The strengthen loop is verdict-gated with a round cap. Ready or blockers, nothing between; the reviewer is told an invented blocker is as much a failure as a missed one; five rounds without ready stop the loop as a signal the plan needs rethinking. Standard way: trycycle's plan-editor loop (a fresh stateless editor each round, a ready verdict, a five-round cap, the editor judged on verdict correctness); followed, minus its checkbox step-list plan format, which over-scripts frontier builders.
3. The reviewer comes from the other model family than the orchestrator's, one seat. Standard way: council convenes every installed agent CLI on a draft plan; deviation: one cross-family seat carries most of the independence, and the integrated review already runs both families on the code.
4. Parallelism is decided by the slicing, not at build time. Slice ownership is the concurrency map; the build runs together what the map made independent and sequences only genuine contention. No published source states this as a rule; it follows from vertical slices owning their files.

## Acceptance criteria

- The run's Plan phase is one invocation of the plan method, as the Spec phase is one invocation of the spec method.
- The plan document is committed on the run branch; revisions and slice statuses are commits; the PR delivers it.
- The strengthen pass runs before the first build dispatch, cross-family, and ends at ready or at the round cap.
- The routing rules name the strengthen pass's pick under each orchestrator family.
- The published description of a run no longer calls the plan private to the workspace and removed at delivery.

## Out of scope

- No working-notes or scratchpad doctrine: the harnesses already provide working notes.
- The review gate, QA, and close methods are unchanged.
