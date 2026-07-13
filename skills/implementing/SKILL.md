---
name: implementing
description: Builder method. One slice, test-first, inside Fable's architecture. Loaded by Claude and Codex builder dispatches.
disable-model-invocation: true
user-invocable: false
---

# Implementing

Read `../codebase-design/SKILL.md` first. You implement one slice inside the architecture contract Fable designed; you do not choose a different shape.

## Before code

1. Read the brief, its architecture contract, the domain glossary it names, and the code path the slice changes. Trace the behavior end to end before choosing a solution. If the runtime exposes skills, load only those that directly match the slice's language, framework, database, UI, or test surface. They improve implementation inside the contract; they do not override it. Completion: you can state the behavior, its interface and owning module, the domain terms it uses, the focused test command, and what green means.
2. For a bug, reproduce the reported behavior through that interface and trace its reachable callers until you can name the shared cause. If the real cause sits outside the architecture contract, stop and ask Fable rather than patching one symptom.

## The vertical loop

1. Write the smallest test for the next observable behavior through the contract's interface. Run it before production code. Red counts only when the expected behavior assertion fails; an import, setup, syntax, or compile failure is not red.
2. Make it green with the first option that works: do nothing if the behavior already exists, reuse the host's code, use the standard library, use a native platform feature, use an installed dependency, use one clear line, then write the minimum new code. Verify unfamiliar library calls against the installed version and flag anything you cannot verify. Never remove trust-boundary validation, data-loss handling, security, or accessibility to make the diff smaller.
3. Run the same focused test to green. While it stays green, remove duplication and clarify names inside the slice without widening behavior. Repeat one behavior at a time.
4. Run the discovered focused checks while working. For a user-facing slice, use the supplied browser or desktop skill to drive the changed behavior in the real local artifact and fix what the drive exposes inside the contract. Then run the full suite once the slice is complete. Redirect bulky output to files and inspect the exit code, never pipe a test command.
5. Compare the finished diff with every line of the architecture contract and the domain glossary. Fix an implementation deviation; report and stop on a contract conflict.
6. Commit. Stage changed files by explicit path, never `git add -A`. Report: status `green|stuck`; the skills used, or that none were available; the RED command and expected failure; the GREEN and full-suite summaries; the product-surface drive for user-facing work; files touched; the commit SHA; every decision the brief did not determine; any contract pressure; and anything noticed outside your files. One task per invocation.

## Hard rules

- The architecture is given. Module ownership, seams, and interfaces in the contract are fixed; implementation behind them is yours. If the contract cannot work, stop and report; do not redesign around it.
- Never skip a test, and never weaken or delete one to reach green. One exception: a test asserting behavior your brief's interface contract explicitly changes. Update it and name it in your report with the contract line that requires the change; the reviewer checks every named edit against the contract, and an unnamed or unjustified test edit is always a critical finding.
- When your brief says sibling slices build in parallel, do not touch files outside your owned list; report what you notice out there. Building alone, the list is informational: touch what the work needs and name every extra file in your report.
- A decision your brief is missing is a question, not a guess: stop and ask. Your dispatcher answers and resumes you, which is cheaper than re-dispatching after a wrong guess. An edge case wholly inside your interface is yours: take the conservative option and keep going; it is one of the decisions your report already carries.
- Change one hypothesis at a time and undo a failed attempt before testing the next. Three failed fix attempts is stuck, and stuck is a valid report. "Green" is a claim about what you watched happen in this worktree, just now.
- Tests assert behavior through the interface, not private state, internal call order, or a recomputation of the expected value. Prefer the real dependency or a local stand-in; mock only an external dependency you cannot run deterministically.
