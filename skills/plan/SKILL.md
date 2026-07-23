---
name: plan
description: The plan method a run's Plan phase invokes whole. Model the domain, commit the plan on the run branch, and strengthen it with fresh cross-family editor passes until one approves or the fifth round locks it. Not user-invocable.
user-invocable: false
---

# Plan

Produce the plan the builders receive, and strengthen it before anything is built.

## 1. Model

You own the domain model and architecture. Invoke bottega:codebase-design and write the plan it defines: the domain decisions, the interfaces, and the vertical slices, each slice naming its owned files, docs included: a slice that changes a user-facing surface owns updating the docs that describe it. Put a decision that is expensive to reverse after merge to bottega:panel unless the repository already answers it.

## 2. Commit

The plan is `docs/plans/<YYYY-MM-DD>-<slug>.md`, committed on the run branch. Workers receive that exact file, never a retelling. The plan changes whenever the work teaches you something: react, adjust, commit the revision. Each slice's status lands in the file as the slice integrates, and the plan merges with the PR, the record of how the spec was built kept next to the spec itself.

## 3. Strengthen

Before anything is built, a fresh editor picked by bottega:routing reads the agreed spec, the plan, and the repository cold and returns the plan approved unchanged or rewritten whole. The rewrite is the only way to object: a finding too small to justify one is dropped, and an editor who would change little approves. Read the rewrite against the current plan, take the changes you accept (the domain model and architecture stay your call), commit, and repeat with new fresh eyes. Approval ends the loop, and the fifth round ends it regardless: the plan stands as committed.
