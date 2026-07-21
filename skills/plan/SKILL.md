---
name: plan
description: The plan method a run's Plan phase invokes whole. Model the domain, commit the plan on the run branch, and strengthen it with fresh cross-family passes until one returns ready. Not user-invocable.
user-invocable: false
---

# Plan

Produce the plan the builders receive, and strengthen it before anything is built.

## 1. Model

You own the domain model and architecture. Invoke bottega:codebase-design and write the plan it defines: the domain decisions, the interfaces, and the vertical slices, each slice naming its owned files, docs included: a slice that changes a user-facing surface owns updating the docs that describe it. Put a decision that is expensive to reverse after merge to bottega:panel unless the repository already answers it.

## 2. Commit

The plan is `docs/plans/<YYYY-MM-DD>-<slug>.md`, committed on the run branch. Workers receive that exact file, never a retelling. The plan changes whenever the work teaches you something: react, adjust, commit the revision. Each slice's status lands in the file as the slice integrates, and the plan merges with the PR, the record of how the spec was built kept next to the spec itself.

## 3. Strengthen

Before anything is built, a fresh worker from the other model family than your own reads the agreed spec, the plan, and the repository cold and returns a verdict: ready, or the blockers. Its brief carries the calibration that keeps the verdict honest: you are judged on the correctness of your verdict, not on whether you found something; an invented blocker is as much a failure as a missed one; a blocker is only what a strong maintainer, seeing the plan and your objection side by side, would clearly agree must change. Resolve the blockers you accept, commit the revision, and repeat with new fresh eyes. Ready ends the loop. Five rounds without ready means the plan needs rethinking, not another revision: stop and go back to the domain model.
