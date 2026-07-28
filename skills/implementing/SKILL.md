---
name: implementing
description: Implementation doctrine for one dispatched job in a bottega run, an assigned slice or a repair. Use when dispatched to build or fix code.
user-invocable: false
---

# Implementing

Build what the dispatch asks: one slice of the work, or one repair.

## Follow the brief

Read the brief, everything it points at (the design decisions, the domain terms, the approved artifacts), and the code you are changing. The dispatch is your contract: its terms, interfaces, and ownership are decisions already made, and your code expresses them. For the stack at hand, follow what the technology skills in this runtime teach, and the technology's current documentation for the installed version. Take the standard way by default. A custom mechanism for a solved problem needs a reason a reviewer can inspect.

When the code you touch contradicts the brief (it names an interface the code does not have, a pattern it assumes is absent, a term means something else here), stop and ask the orchestrator, which answers and resumes you. Use the same channel for anything bigger than your dispatch (an interface change, another slice's files, a redesign) and for being stuck: three failed attempts is a question, not a fourth attempt.

An edge case that pushes you off the brief but is too small to be worth a question: take the conservative option, keep going, and say what you changed and why in your report.

## Test-first

Work in vertical slices. Write one failing test, watch it fail, then write the minimum code that passes it, and repeat. Never write the whole test list up front against imagined behavior.

Test behavior through the public interfaces the brief names, never implementation internals. A good test reads as a specification ("user can check out with a valid cart") and survives refactoring.

Mock only at a system boundary (an external API, a database, time, randomness), never your own modules. Design the boundary for it: inject the dependency rather than constructing it inside, one function per external operation, so a mock is one predictable response with no branching. Take expected values from an independent source (a documented literal, a worked example, the brief), never recomputed the way the code computes them. A test that mirrors the implementation passes automatically and proves nothing.

## Reuse before build

Before writing a mechanism, look for it in this codebase. The helper, utility, or pattern that already exists a few files over is the one to reuse, and re-implementing it is the most common builder failure. Missing there, take the standard library, a native platform feature, or an already-installed dependency, in that order, and use the first that covers it. A new dependency is bigger than your dispatch: ask.

## Repair at the cause

Start a repair by reproducing the bug as a failing test. Your fix turns it green, and the test stays.

A bug report names a symptom on one path. Put the fix in the shared code every caller routes through, because patching only the named path leaves a sibling caller broken.

A blatant bug sitting in your path: fix it and say so in your report.

## DRY and YAGNI

Say each thing once. Duplication you introduce is yours to remove before the gates run.

Aim YAGNI at speculative complexity, never at product quality. Structure built for a guessed future (a seam with one implementation, a config nobody sets, an abstraction for an unrequested variant) costs twice: you work around the wrong guess, then you remove it. That the code is cheap to generate makes the violation cheaper to commit, not better. Product quality is not speculative: validation at trust boundaries, data safety, security, accessibility, and honest error handling are the product, and never drop off.

## Done

Your job includes the docs your change makes wrong. Update them inside this job, in the doc surfaces the project already has, and never create one it does not have.

Keep the loop tight: iterate against focused checks on the code you are changing, and save the full gates for the end.

Before the gates, reread your diff and take out anything that re-builds what reuse provides or exceeds what the dispatch asked for.

Done means proven: the project's gates run and you watched them pass. Redirect test output to a file and check the exit code. Never pipe it. A step touching real users, real money, a deploy, or shared or production data: report what it needs instead of running it.

## Report

Report what you built, red and green evidence, gate results, any test you changed and why, your commit (owned files only), what the brief or the map should have told you and did not, and anything unresolved.
