---
name: implementing
description: Implementation doctrine for one dispatched job in a bottega run, an assigned slice or a repair. Use when dispatched to build or fix code.
user-invocable: false
---

# Implementing

Build what the dispatch asks: one slice of the plan, or one repair.

## Follow the brief

Read the plan, the spec, the glossary, and the code you are changing before writing anything. The dispatch is the contract: the plan's domain terms, interfaces, and ownership are decisions already made, and your code expresses them. Follow the codebase's established architecture and patterns, and the practices the technology skills in this runtime and the technology's current documentation teach for the stack at hand. The standard way is the default; a custom mechanism for a solved problem needs a reason a reviewer can inspect.

When the code you touch contradicts the brief (the plan names an interface the code does not have, a pattern the plan assumes is absent, a term means something else here), stop and ask the orchestrator: it answers and resumes you. The same channel covers anything bigger than your dispatch (an interface change, another slice's files, a redesign) and being stuck: three failed attempts is a question, not a fourth attempt.

## Test-first

Work in vertical slices: one failing test, the minimum code that passes it, repeat. Write the failing test first and watch it fail; implement only enough to pass it; never write the whole test list up front against imagined behavior.

Test behavior through the public interfaces the plan names, never implementation internals. A good test reads as a specification ("user can check out with a valid cart") and survives refactoring because it ignores internal mechanics; a test that breaks under refactor while behavior held was testing the implementation.

Mock only at a system boundary (an external API, a database, time, randomness), never your own modules. Expected values come from an independent source (a documented literal, a worked example, the spec), never recomputed the way the code computes them: a test that mirrors the implementation passes automatically and proves nothing.

## Reuse before build

Before writing code, take the first of these that holds:

1. Does this need to exist? No: skip it.
2. Already in this codebase? Reuse it.
3. The standard library does it? Use it.
4. The platform does it? Use it.
5. An installed dependency does it? Use it.
6. One line? One line.
7. Only then: the minimum that works.

## DRY and YAGNI

Say each thing once: duplication you introduce is yours to remove before the gates run.

Aim YAGNI at speculative complexity, never at product quality. Structure built for a guessed future (a seam with one implementation, a config nobody sets, an abstraction for an unrequested variant) costs twice: you work around the wrong guess, then you remove it; that the code is cheap to generate makes the violation cheaper to commit, not better. Product quality is not speculative: validation at trust boundaries, data safety, security, accessibility, and honest error handling are the product, and never drop off.

Fix a blatant bug sitting in your path and say so in your report.

## Done

Keep the loop tight: iterate against focused checks on the code you are changing, and save the full gates for the end.

Before you run the gates, reread your diff: anything reuse already provides, or the dispatch never asked for, comes out now.

Done means proven: the project's gates run and you watched them pass. Redirect test output to a file and check the exit code; never pipe it. A step touching real users, real money, a deploy, or shared or production data: report what it needs instead of running it.

## Report

Report: what you built, red and green evidence, gate results, any test you changed and why, your commit (owned files only), what the plan, spec, or map should have told you and did not, and anything unresolved.
