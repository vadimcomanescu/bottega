---
name: improve
description: Scan a codebase for deepening opportunities, verify the strongest candidate on the code, then take it through a run to a reviewed PR. Use bottega:improve when the user wants the codebase scanned for what to improve next. Never use proactively. It opens a run, which costs hours of autonomous agent work.
argument-hint: "<optional area or direction>"
---

# Improve

Find the refactors that turn shallow modules into deep ones, so the codebase gets easier to test and to navigate. Pick the strongest, verify it on the code, and hand it to a run.

## 1. Read

Start with the canonical agent map when one exists, then its domain owner. When either route is absent, locate the existing map and domain material by what they govern. Treat genuinely absent domain material as absent, not as a setup requirement. Read only what the scan needs: the vocabulary you find, the relevant contexts and decisions covering the code you will touch, and the doc the repository names as its documentation authority. A missing context map, glossary, or ADR is not a gap. Surface a relevant ADR conflict before proposing a change.

## 2. Scope

Scope to the direction I named, which wins over anything you would pick yourself. Without one, walk the commit history for hot spots (the files and modules that churn) and bias the scan there. Scan wider when the churn is spread across the whole history, because deepening pays off where the code keeps changing.

## 3. Scan

Read the scoped code and note where you hit friction, in the vocabulary of `bottega:architect`:

- understanding one concept requires bouncing between many small modules
- a module's interface is nearly as complex as its implementation. Apply the deletion test: would deleting it concentrate the complexity, or just move it?
- pure functions extracted for testability while the real bugs hide in how they are called
- tightly coupled modules leaking across their seams
- code untested, or hard to test through its current interface
- a custom mechanism for a problem with a standard solution. Read that technology's documentation or its skill in this runtime to know the standard, and expect the deepening to be deletion plus adoption
- a migration left half-finished, so two live patterns answer one concept and every change must first pick between them
- a test loop slow enough that every change pays it in minutes
- rules split from the state they protect, ownership leaked across an interface, and documentation-architecture drift: facts restated outside their home, living docs citing the archive, glossary terms the code contradicts

Let the ADRs constrain your scan. Surface a conflict with an ADR only when the friction justifies reopening it, and name the ADR.

## 4. Check collisions

Check open issues and PRs before proposing. An improvement already tracked or already in flight is not a finding.

## 5. Pick and verify

Rank the candidates per `bottega:architect`, each a coherent unit: the files, the problem with its proof from the code, the change in product terms (interface design belongs to the run), and the gain in leverage and locality. Take the strongest and verify it on the real code before spending a run on it: apply the deletion test and say what complexity concentrates where, name a test the current interface makes hard to write, and check the change against the ADRs covering the area. When a candidate fails verification, take the next one, and record the failure as an ADR when a future scan would rediscover the same dead end. When every candidate fails, report what the scan found and stop.

## 6. Run it

Take the verified candidate through `bottega:maestro`, handing over the problem with its proof, the change in product terms, and measurable acceptance criteria. The handoff stands as the run's discovery and spec, and the run starts at the plan.
