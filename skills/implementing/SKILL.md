---
name: implementing
description: Implementation doctrine for one dispatched job in a bottega run, an assigned slice or a repair. Use when dispatched to build or fix code.
user-invocable: false
---

# Implementing

Build what the dispatch asks: one slice of the plan, or one repair.

## Follow the brief

Read the plan, the spec, the glossary, and the code you are changing before writing anything. The dispatch is the contract: the plan's domain terms, interfaces, and ownership are decisions already made, and your code expresses them. Follow the codebase's established architecture and patterns, and the practices the technology skills in this runtime and the technology's current documentation for the installed version teach for the stack at hand. The standard way is the default; a custom mechanism for a solved problem needs a reason a reviewer can inspect.

When the code you touch contradicts the brief (the plan names an interface the code does not have, a pattern the plan assumes is absent, a term means something else here), stop and ask the orchestrator: it answers and resumes you. The same channel covers anything bigger than your dispatch (an interface change, another slice's files, a redesign) and being stuck: three failed attempts is a question, not a fourth attempt.

## Test-first

Work in vertical slices: one failing test, the minimum code that passes it, repeat. Write the failing test first and watch it fail; implement only enough to pass it; never write the whole test list up front against imagined behavior.

Test behavior through the public interfaces the plan names, never implementation internals. A good test reads as a specification ("user can check out with a valid cart") and survives refactoring because it ignores internal mechanics; a test that breaks under refactor while behavior held was testing the implementation.

Mock only at a system boundary (an external API, a database, time, randomness), never your own modules. Design the boundary for it: inject the dependency rather than constructing it inside, one function per external operation, so a mock is one predictable response with no branching. Expected values come from an independent source (a documented literal, a worked example, the spec), never recomputed the way the code computes them: a test that mirrors the implementation passes automatically and proves nothing.

## Reuse before build

Before writing a mechanism, look for it in this codebase: the helper, utility, or pattern that already exists a few files over is the one to reuse, and re-implementing it is the most common builder failure. Missing there, take the standard library, a native platform feature, or an already-installed dependency, in that order, and use the first that covers it. A new dependency is bigger than your dispatch: ask.

## Repair at the cause

A repair starts by reproducing the bug as a failing test; the fix turns it green, and the test stays.

A bug report names a symptom on one path. Before you edit, grep every caller of the function you are about to change; the fix goes in the shared code every caller routes through. One guard there is a smaller diff than a guard per caller, and patching only the named path leaves a sibling caller broken.

A blatant bug sitting in your path: fix it and say so in your report.

## DRY and YAGNI

Say each thing once: duplication you introduce is yours to remove before the gates run.

Aim YAGNI at speculative complexity, never at product quality. Structure built for a guessed future (a seam with one implementation, a config nobody sets, an abstraction for an unrequested variant) costs twice: you work around the wrong guess, then you remove it; that the code is cheap to generate makes the violation cheaper to commit, not better. Product quality is not speculative: validation at trust boundaries, data safety, security, accessibility, and honest error handling are the product, and never drop off.

## Done

Keep the loop tight: iterate against focused checks on the code you are changing, and save the full gates for the end.

Before you run the gates, reread your diff against two criteria: nothing re-builds what reuse already provides, and nothing exceeds what the dispatch asked for. What fails either comes out now.

Done means proven: the project's gates run and you watched them pass. Redirect test output to a file and check the exit code; never pipe it. A step touching real users, real money, a deploy, or shared or production data: report what it needs instead of running it.

## Report

Report: what you built, red and green evidence, gate results, any test you changed and why, your commit (owned files only), what the plan, spec, or map should have told you and did not, and anything unresolved.
