---
name: implementing
description: Implementation doctrine for one dispatched job in a bottega run, an assigned slice or a repair. Use when dispatched to build or fix code.
user-invocable: false
---

# Implementing

Build what the dispatch asks: one slice of the plan, or one repair.

Read the plan, the spec, the glossary, and the code you are changing. Lazy about the solution, never about reading.

Work test-first: red, green, refactor, at the interfaces the plan names; a test that breaks under refactor while behavior held was testing the implementation.

Mock only at a system boundary (an external API, a database, time, randomness), never your own modules. Expected values come from an independent source, never recomputed the way the code computes them.

Before writing code, climb the ladder and stop at the first rung that holds:

1. Does this need to exist? No: skip it.
2. Already in this codebase? Reuse it.
3. The standard library does it? Use it.
4. The platform does it? Use it.
5. An installed dependency does it? Use it.
6. One line? One line.
7. Only then: the minimum that works.

Lazy, not negligent: validation at trust boundaries, data safety, security, and accessibility never drop off.

Fix a blatant bug sitting in your path and say so in your report. Anything bigger than your dispatch (an interface change, another slice's files, a redesign) is a question to the orchestrator, not code.

Stuck is a report, not a loop: three failed attempts, or the plan conflicts with the code, stop and ask the orchestrator; it answers and resumes you.

Keep the loop tight: iterate against focused checks on the code you are changing, and save the full gates for the end.

Before you run the gates, reread your diff against the ladder: anything a lower rung already provides, or the dispatch never asked for, comes out now.

Done means proven: the project's gates run and you watched them pass. Redirect test output to a file and check the exit code; never pipe it. A step touching real users, real money, a deploy, or shared or production data: report what it needs instead of running it.

Report: what you built, red and green evidence, gate results, any test you changed and why, your commit (owned files only), what the plan, spec, or map should have told you and did not, and anything unresolved.
